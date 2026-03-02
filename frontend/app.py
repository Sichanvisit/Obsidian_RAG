import os
import json
import time
import re
import threading
import queue
import uuid
import yaml
import streamlit as st
from pathlib import Path
from dotenv import load_dotenv
from streamlit.runtime.scriptrunner import add_script_run_ctx

# ==========================================================================
# [ZONE 0] Configuration & Constants
# ==========================================================================
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
PROJECTS_DIR = "./projects"
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
OBSIDIAN_VAULT_PATH = os.getenv("OBSIDIAN_VAULT_PATH", "./obsidian_notes")

# ==========================================================================
# [ZONE 1] Backend API Client (FastAPI 연동)
# ==========================================================================
import httpx

class BrainAPIClient:
    """FastAPI backend client."""
    def __init__(self, base_url: str = BACKEND_URL):
        self.base_url = base_url
        self.session_id = str(uuid.uuid4())
        self.stop_signal = False
        self.model_label = "Local LLM"
        self.thought_log = []
        
    def check_health(self) -> dict:
        try:
            resp = httpx.get(f"{self.base_url}/health", timeout=5)
            return resp.json()
        except Exception as e:
            return {"status": "error", "engine": "disconnected", "error": str(e)}
    
    def request_stop(self):
        try:
            resp = httpx.post(
                f"{self.base_url}/api/chat/stop",
                json={"session_id": self.session_id},
                timeout=5
            )
            self.stop_signal = True
            return resp.json()
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def chat_stream(self, query: str, project_name: str, model_name: str = "qwen2.5-coder:3b", history: str = ""):
        self.stop_signal = False
        self.thought_log = []
        self.session_id = str(uuid.uuid4())
        
        try:
            with httpx.stream(
                "POST",
                f"{self.base_url}/api/chat/stream",
                json={
                    "query": query,
                    "session_id": self.session_id,
                    "project_name": project_name,
                    "model_name": model_name,
                    "history": history  # 대화 히스토리 전달
                },
                timeout=httpx.Timeout(300.0, connect=10.0)
            ) as response:
                # Decode NDJSON as UTF-8 explicitly to avoid mojibake from implicit codec guesses.
                buf = b""
                for chunk in response.iter_raw():
                    if self.stop_signal:
                        break
                    if not chunk:
                        continue
                    buf += chunk
                    while b"\n" in buf:
                        raw_line, buf = buf.split(b"\n", 1)
                        line = raw_line.decode("utf-8", errors="replace").strip()
                        if not line:
                            continue
                        try:
                            data = json.loads(line)
                            if "logs" in data:
                                self.thought_log.extend(data["logs"])
                            if "state" in data and "logs" in data["state"]:
                                self.thought_log = data["state"]["logs"]
                            yield data
                        except json.JSONDecodeError:
                            continue
                # Flush trailing buffered line without newline.
                if buf and not self.stop_signal:
                    line = buf.decode("utf-8", errors="replace").strip()
                    if line:
                        try:
                            data = json.loads(line)
                            if "logs" in data:
                                self.thought_log.extend(data["logs"])
                            if "state" in data and "logs" in data["state"]:
                                self.thought_log = data["state"]["logs"]
                            yield data
                        except json.JSONDecodeError:
                            pass
                            
        except httpx.TimeoutException:
            yield {"step": "error", "answer": "요청 시간이 초과되었습니다."}
        except httpx.ConnectError:
            yield {"step": "error", "answer": "백엔드 서버에 연결할 수 없습니다."}
        except Exception as e:
            yield {"step": "error", "answer": f"오류 발생: {str(e)}"}


# ==========================================================================
# [ZONE 1.5] Obsidian Save Utility
# ==========================================================================
def save_to_obsidian(title: str, content: str, folder: str = "AI_Answers") -> bool:
    """Save the response to an Obsidian vault markdown file."""
    try:
        vault_path = Path(OBSIDIAN_VAULT_PATH)
        save_dir = vault_path / folder
        save_dir.mkdir(parents=True, exist_ok=True)
        
        # 파일명 정리
        safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).strip()
        safe_title = safe_title[:50] if len(safe_title) > 50 else safe_title
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"{safe_title}_{timestamp}.md"
        
        # 메타데이터 추가
        frontmatter = f"""---
title: {title}
created: {time.strftime("%Y-%m-%d %H:%M:%S")}
tags: [ai-generated, rag-answer]
---

"""
        full_content = frontmatter + content
        
        file_path = save_dir / filename
        file_path.write_text(full_content, encoding="utf-8")
        return True
    except Exception as e:
        print(f"Obsidian 저장 실패: {e}")
        return False


# ==========================================================================
# [ZONE 2] External Module Loaders
# ==========================================================================
class LazyModule:
    @staticmethod
    def get_generator_utils():
        try:
            from backend.src.pipeline import generator as gen_module
            return (
                getattr(gen_module, 'load_combined_config', lambda: {}),
                getattr(gen_module, 'resolve_path', lambda p: Path(p)),
                getattr(gen_module, 'list_files_relative', lambda b, e=None: []),
                getattr(gen_module, 'count_tokens', lambda t, m=None: 0),
                getattr(gen_module, 'read_selected_files', lambda b, s: ("", []))
            )
        except Exception as e:
            print(f"Warning: Failed to load generator: {e}")
            return (lambda: {}, lambda p: Path(p), lambda b, e=None: [], lambda t, m=None: 0, lambda b, s: ("", []))

    @staticmethod
    def get_config_manager():
        try:
            from backend.utils.auto_config_manager import sync_all_jobs
            return sync_all_jobs
        except ImportError:
            return None


(load_combined_config,
 resolve_path,
 list_files_relative,
 count_tokens,
 read_selected_files) = LazyModule.get_generator_utils()

sync_all_jobs = LazyModule.get_config_manager()


def load_prompts_config_direct() -> dict:
    """Read backend/config/prompts.yaml directly for Generator pattern source."""
    prompts_path = BASE_DIR.parent / "backend" / "config" / "prompts.yaml"
    if not prompts_path.exists():
        return {}
    try:
        data = yaml.safe_load(prompts_path.read_text(encoding="utf-8")) or {}
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


# ==========================================================================
# [ZONE 3] Streamlit Page Configuration & CSS
# ==========================================================================
st.set_page_config(
    page_title="Obsidian_Rag",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<style>
/* ================================
   전역 설정
================================ */
html, body, .stApp {
    height: 100vh !important;
    overflow: hidden !important;
    background-color: #0e1117;
}

:root {
    --sidebar-width: 300px;
    --main-width: 1040px;
    --header-gap: 60px;       
    --tab-nav-height: 50px;   
    --info-height: 40px;
}

/* Sidebar polishing */
section[data-testid="stSidebar"] .block-container {
    padding-top: 1rem !important;
    padding-left: 0.85rem !important;
    padding-right: 0.85rem !important;
}

section[data-testid="stSidebar"] h1 {
    font-size: 1.25rem !important;
    margin-bottom: 0.4rem !important;
}

section[data-testid="stSidebar"] .stButton > button {
    min-height: 2.45rem !important;
    font-size: 0.88rem !important;
    border-radius: 10px !important;
    white-space: nowrap !important;
}

section[data-testid="stSidebar"] .sidebar-card {
    border: 1px solid #1f2a40;
    background: linear-gradient(180deg, rgba(18, 27, 47, 0.45) 0%, rgba(10, 16, 30, 0.4) 100%);
    border-radius: 12px;
    padding: 10px 10px 6px 10px;
    margin: 8px 0 10px 0;
}

section[data-testid="stSidebar"] .sidebar-subtitle {
    font-size: 0.8rem;
    color: #9fb3d1;
    margin-bottom: 0.35rem;
}

section[data-testid="stSidebar"] .status-pill {
    border: 1px solid #1c8f5e;
    background: rgba(16, 93, 61, 0.22);
    color: #3dd08b;
    border-radius: 10px;
    padding: 9px 10px;
    font-size: 0.9rem;
    font-weight: 600;
}

/* 헤더 */
header[data-testid="stHeader"] {
    background-color: transparent !important;
    height: 60px !important;
    z-index: 50 !important; 
    pointer-events: none !important; 
}

header[data-testid="stHeader"] > div {
    pointer-events: auto !important;
    z-index: 1000001 !important;
}

/* 탭바 고정 */
.stTabs [role="tablist"] {
    position: fixed !important;
    top: var(--header-gap) !important; 
    left: var(--sidebar-width) !important;
    width: var(--main-width) !important;
    height: var(--tab-nav-height) !important;
    background-color: #0e1117 !important;
    z-index: 999999 !important;
    pointer-events: auto !important; 
    padding-left: 40px !important;
    border-bottom: none !important;
}

.stTabs [role="tab"] {
    background-color: transparent !important;
    pointer-events: auto !important;
    cursor: pointer !important;
    height: 40px !important;
}

/* 프로젝트 정보 바 */
.fixed-project-info {
    position: fixed !important;
    top: calc(var(--header-gap) + var(--tab-nav-height)) !important;
    left: var(--sidebar-width) !important;
    width: var(--main-width) !important;
    height: var(--info-height) !important;
    background-color: #0e1117 !important;
    z-index: 10001 !important;
    display: flex;
    align-items: center;
    padding-left: 30px;
    font-size: 0.85rem;
    color: #cccccc;
}

.info-label { font-weight: 600; color: #ff4b4b; margin-right: 4px; }

/* 채팅 본문 */
@media (min-width: 1601px) {
    .block-container {
        position: fixed !important;
        left: var(--sidebar-width) !important;
        width: var(--main-width) !important;
        max-width: var(--main-width) !important;
        top: calc(var(--header-gap) + var(--tab-nav-height) + var(--info-height)) !important;
        height: calc(100vh - (var(--header-gap) + var(--tab-nav-height) + var(--info-height) + 120px)) !important;
        padding-top: 10px !important; 
        padding-bottom: 20px !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        padding-left: 1.5rem !important;
        padding-right: 1.5rem !important;
        margin: 0 !important;
        scrollbar-width: thin;
        scrollbar-color: #333 transparent;
    }
}

/* 채팅 입력창 */
div[data-testid="stChatInput"] {
    position: fixed !important;
    bottom: 50px !important;
    left: var(--sidebar-width) !important;
    width: var(--main-width) !important;
    z-index: 10003 !important;
    background-color: #0e1117 !important;
}

/* =================================================================
   분석 패널 (컴팩트 버전)
================================================================= */
.analysis-panel {
    position: fixed !important;
    top: 100px !important;
    right: 0 !important;
    width: calc(100vw - 1350px) !important;
    min-width: 350px !important;
    height: auto !important;
    max-height: 85vh !important;
    background-color: #0e1117 !important;
    border-left: 1px solid #2a2a2a !important;
    border-radius: 0 !important;
    padding: 16px !important;
    z-index: 9999 !important;
    overflow-y: auto !important;
    box-shadow: none !important;
}

/* 파이프라인 그래프(수평) */
.pipeline-graph {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 10px;
    background: linear-gradient(135deg, #0a0a0a 0%, #111 100%);
    border-radius: 12px;
    border: 1px solid #222;
    margin-bottom: 16px;
}

.pipeline-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.node-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #1a1a1a;
    border: 2px solid #333;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.3s ease;
    position: relative;
}

.node-circle.active {
    background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
    border-color: #60a5fa;
    box-shadow: 0 0 20px rgba(96, 165, 250, 0.4);
    animation: pulse 1.5s infinite;
}

.node-circle.completed {
    background: linear-gradient(135deg, #064e3b 0%, #059669 100%);
    border-color: #34d399;
}

.node-circle.error {
    background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%);
    border-color: #f87171;
}

.node-label {
    font-size: 9px;
    color: #666;
    margin-top: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.node-circle.active + .node-label,
.node-circle.completed + .node-label { color: #aaa; }

.pipeline-connector {
    flex: 1;
    height: 2px;
    background-color: #333;
    margin: 0 -5px;
    margin-bottom: 20px;
}

.pipeline-connector.active {
    background: linear-gradient(90deg, #2563eb, #60a5fa);
    box-shadow: 0 0 8px rgba(96, 165, 250, 0.3);
}

.pipeline-connector.completed {
    background: linear-gradient(90deg, #059669, #34d399);
}

/* 배지 */
.node-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background: #ef4444;
    color: white;
    font-size: 9px;
    font-weight: bold;
    padding: 2px 5px;
    border-radius: 8px;
    min-width: 16px;
    text-align: center;
}

@keyframes pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(96, 165, 250, 0.4); }
    50% { box-shadow: 0 0 30px rgba(96, 165, 250, 0.6); }
}

/* 스탯 바 */
.stats-bar {
    display: flex;
    justify-content: space-around;
    padding: 12px;
    background: #0a0a0a;
    border-radius: 10px;
    border: 1px solid #222;
    margin-bottom: 16px;
}

.stat-item {
    text-align: center;
}

.stat-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
}

.stat-label {
    font-size: 0.65rem;
    color: #666;
    text-transform: uppercase;
    margin-top: 2px;
}

.stat-value.good { color: #34d399; }
.stat-value.warning { color: #fbbf24; }
.stat-value.bad { color: #f87171; }

/* 로그 영역 */
.log-terminal {
    background: #0a0a0a;
    border: none;
    border-radius: 6px;
    padding: 10px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 10px;
    max-height: 180px;
    overflow-y: auto;
    line-height: 1.4;
}

.log-line {
    padding: 3px 0;
    border-bottom: 1px solid #1a1a1a;
    color: #888;
}

.log-line.search { color: #60a5fa; }
.log-line.success { color: #34d399; }
.log-line.warning { color: #fbbf24; }
.log-line.error { color: #f87171; }
.log-line.info { color: #a78bfa; }

/* 반응형 */
@media (max-width: 1600px) {
    .analysis-panel { display: none !important; }
    :root { --sidebar-width: 0px; }
    
    .stTabs [role="tablist"] {
        position: fixed !important;
        top: 0px !important;
        padding-top: 20px !important;
        left: 5% !important;
        width: 90% !important;
        background-color: #0e1117 !important;
        z-index: 10002 !important;
        height: 65px !important; 
    }
    
    .fixed-project-info {
        position: fixed !important;
        top: 65px !important; 
        left: 5% !important;
        width: 90% !important;
        background-color: #0e1117 !important;
    }

    div[data-testid="stChatInput"] {
        left: 5% !important;
        width: 90% !important;
    }

    .block-container {
        position: relative !important;
        width: 98% !important;
        padding-top: 120px !important; 
        padding-bottom: 120px !important;
        height: auto !important;
        overflow-y: visible !important;
    }
    /* 채팅 입력 비활성화 스타일 */
    div[data-testid="stChatInput"][aria-disabled="true"] {
        opacity: 0.7 !important;
    }

    div[data-testid="stChatInput"][aria-disabled="true"] input {
        background-color: #1a1a2e !important;
        border-color: #2a2a3e !important;
    }

    /* 비활성화 버튼 스타일 */
    button:disabled {
        opacity: 0.6 !important;
        cursor: wait !important;
    }
}
</style>
""", unsafe_allow_html=True)


# ==========================================================================
# [ZONE 4] Session State Initialization
# ==========================================================================
def init_all_session_states():
    defaults = {
        "gen_queue": queue.Queue(),
        "gen_logs": [],
        "is_generating": False,
        "gen_status": "Ready",
        "gen_progress": 0,
        "ingest_queue": queue.Queue(),
        "ingest_logs": [],
        "is_ingesting": False,
        "tag_queue": queue.Queue(),
        "tag_logs": [],
        "is_tagging": False,
        "messages": [],
        "current_project": None,
        "brain": None,
        "graph_step": "idle",
        "brain_logs": [],
        "brain_state": {
            "scores": [],
            "retry_count": 0,
            "step_counts": {"think": 0, "search": 0, "grade": 0, "rewrite": 0, "gen": 0},
            "step_details": {},
            "search_details": {},
            "metrics": {}
        },
        "current_stats": {"tps": 0, "time": 0},
        "show_gen_finish_alert": False,
        "selected_model": "qwen2.5-coder:3b",
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value

init_all_session_states()


# ==========================================================================
# [ZONE 5] Brain Engine Management
# ==========================================================================
def get_brain_client() -> BrainAPIClient:
    active_url = st.session_state.get("backend_url", BACKEND_URL)
    if (
        "brain" not in st.session_state
        or st.session_state.brain is None
        or getattr(st.session_state.brain, "base_url", "") != active_url
    ):
        st.session_state.brain = BrainAPIClient(base_url=active_url)
    return st.session_state.brain


# ==========================================================================
# [ZONE 6] Project Management
# ==========================================================================
def get_project_list():
    if not os.path.exists(PROJECTS_DIR):
        os.makedirs(PROJECTS_DIR, exist_ok=True)
    return sorted([d for d in os.listdir(PROJECTS_DIR) if os.path.isdir(os.path.join(PROJECTS_DIR, d))])

def load_history(proj):
    path = os.path.join(PROJECTS_DIR, proj, "chat_history.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_history(proj, msgs):
    path = os.path.join(PROJECTS_DIR, proj, "chat_history.json")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(msgs, f, ensure_ascii=False, indent=2)


# ==========================================================================
# [ZONE 7] Background Workers
# ==========================================================================
def background_generator_worker(args_dict):
    q = args_dict['queue']
    try:
        from backend.src.pipeline.generator import run_ad_hoc_job, load_combined_config
        def bridge_logger(msg, pct=None):
            q.put((msg, pct))

        selected_job = args_dict.get('job_name')
        ui_patterns = args_dict.get('pattern_keys', [])

        if selected_job and selected_job != "직접 설정":
            q.put((f"Job 모드 실행: {selected_job}", 5))
            config = load_combined_config()
            job_info = next((j for j in config.get("jobs", []) if j.get("name") == selected_job), {})
            if ui_patterns:
                final_patterns = ui_patterns
            else:
                job_patterns = (
                    job_info.get("targets")
                    or job_info.get("patterns")
                    or job_info.get("pattern_keys")
                )
                if job_patterns:
                    final_patterns = list(job_patterns)
                else:
                    target_sets = config.get("target_sets", {}) or {}
                    # Prefer legacy default set names from app_v3, then fallback to first available set.
                    preferred_set = (
                        target_sets.get("Summary")
                        or target_sets.get("기본 세트")
                    )
                    if preferred_set:
                        final_patterns = list(preferred_set)
                    elif target_sets:
                        first_key = next(iter(target_sets.keys()))
                        final_patterns = list(target_sets.get(first_key, []))
                    else:
                        # Last-resort: first pattern key from prompts config.
                        pattern_keys = list((config.get("patterns", {}) or {}).keys())
                        final_patterns = pattern_keys[:1]

            q.put((f"패턴 적용: {', '.join(final_patterns) if final_patterns else '(없음)'}", None))

            result = run_ad_hoc_job(
                input_dir=job_info.get("input_dir"),
                output_dir=job_info.get("output_dir"),
                subject=job_info.get("subject", "New Project"),
                pattern_keys=final_patterns,
                model_name=args_dict.get('model_name') or job_info.get("model"),
                temp=args_dict.get('temp', 0.1),
                ui_logger=bridge_logger,
                selected_files=args_dict.get('selected_files', []),
                ui_mode=True
            )
            if result:
                for line in str(result).splitlines():
                    q.put((line, None))
        else:
            q.put(("직접 설정 모드...", 5))
            result = run_ad_hoc_job(
                input_dir=args_dict.get('input_dir', ''),
                output_dir=args_dict.get('output_dir', ''),
                subject=args_dict.get('subject', 'New Project'),
                pattern_keys=ui_patterns,
                model_name=args_dict.get('model_name'),
                temp=args_dict.get('temp', 0.1),
                ui_logger=bridge_logger,
                selected_files=args_dict.get('selected_files', []),
                ui_mode=True
            )
            if result:
                for line in str(result).splitlines():
                    q.put((line, None))

        q.put(("완료!", 100))
        q.put(("DONE", 100))
    except Exception as e:
        q.put((f"에러: {str(e)}", 0))
        q.put(("DONE", 0))


def background_ingest_worker(args_dict):
    q = args_dict.get('queue')
    try:
        from backend.src.pipeline.ingestor import run_ingest_logic
        def bridge_logger(msg):
            q.put(msg)
        run_ingest_logic(
            jobs_yaml=args_dict.get('jobs_yaml'),
            job=args_dict.get('job'),
            mode=args_dict.get('mode'),
            layer=args_dict.get('layer'),
            policy=args_dict.get('policy', 'auto'),
            chunk_size=args_dict.get('chunk_size'),
            overlap=args_dict.get('overlap'),
            heading_levels=args_dict.get('heading_levels'),
            code_attach=args_dict.get('code_attach', False),
            callback=bridge_logger
        )
        q.put("DONE")
    except Exception as e:
        q.put(f"에러: {str(e)}")
        q.put("DONE")


def background_tagging_worker(args_dict):
    q = args_dict.get("queue")
    try:
        from backend.src.pipeline.tagger import run_tagging_logic
        target = args_dict.get("target", "summary")
        mode = args_dict.get("mode", "incremental")
        result = run_tagging_logic(target=target, mode=mode)
        for line in str(result).splitlines():
            q.put(line)
        q.put("DONE")
    except Exception as e:
        q.put(f"에러: {str(e)}")
        q.put("DONE")


# ==========================================================================
# [ZONE 8] Compact Analysis Panel Renderer
# ==========================================================================
def render_compact_panel():
    """Render LangGraph panel with restored trace menus."""

    def normalize_log_text(text: str) -> str:
        s = str(text).replace("\n", " ").strip()
        if not s:
            return "..."
        # Defensive mojibake filter for legacy backend output.
        mojibake_markers = [
            "\ufffd", "?좑", "?뱥", "?랃", "?뷂", "吏덈", "寃", "媛?", "諛쒓", "異쒖",
        ]
        q_ratio = (s.count("?") / max(len(s), 1))
        if any(m in s for m in mojibake_markers) or q_ratio > 0.18:
            return "System processing..."
        return s

    current_step = st.session_state.get("graph_step", "idle")
    brain_state = st.session_state.get("brain_state", {})
    brain_logs = st.session_state.get("brain_logs", [])
    stats = st.session_state.get("current_stats", {"tps": 0, "time": 0})
    metrics = brain_state.get("metrics", {}) or {}
    step_counts = brain_state.get("step_counts", {}) or {}
    step_details = brain_state.get("step_details", {}) or {}
    search_details = brain_state.get("search_details", {}) or {}
    retries = int(brain_state.get("retry_count", 0) or 0)
    scores = brain_state.get("scores", []) or []
    summary_results = search_details.get("summary_results", []) or brain_state.get("summary_docs", []) or []
    raw_results = search_details.get("raw_results", []) or brain_state.get("raw_docs", []) or []
    original_query = str(
        search_details.get("query_original")
        or brain_state.get("query")
        or "-"
    ).strip()
    rewritten_query = str(
        brain_state.get("current_query")
        or search_details.get("query_rewritten")
        or ((step_details.get("search") or [{}])[-1].get("query") if step_details.get("search") else "")
        or ((step_details.get("think") or [{}])[-1].get("rewritten_query") if step_details.get("think") else "")
        or original_query
    ).strip()
    rewritten_suffix = " (same as original)" if rewritten_query == original_query else ""

    def file_label(item):
        src = ""
        if isinstance(item, dict):
            src = str(item.get("source") or item.get("source_path") or "")
        else:
            src = str(item or "")
        src = src.replace("\\", "/").strip()
        if not src:
            return "(unknown)"
        return src.split("/")[-1] or src

    def one_line_label(text: str, limit: int = 34) -> str:
        t = str(text or "").strip()
        if len(t) <= limit:
            return t
        return t[: max(1, limit - 3)] + "..."

    avg_score = sum(scores) / len(scores) if scores else 0.0
    tps = metrics.get("tokens_per_second", stats.get("tps", 0))
    total_time = metrics.get("total_time", stats.get("time", 0))
    summary_docs = len(summary_results)
    raw_docs = len(raw_results)
    retrieval_total = max(1, summary_docs + raw_docs)
    raw_ratio = raw_docs / retrieval_total
    rewrite_changed = (rewritten_query.strip() != original_query.strip())
    answer_text = str(brain_state.get("answer") or "")
    citation_count = len(re.findall(r"\[(?:R|S|REF)\d*\]", answer_text))
    unique_sources = len(
        {
            file_label(d).lower()
            for d in (summary_results + raw_results)
            if file_label(d).strip() and file_label(d).strip() != "(unknown)"
        }
    )

    step_map = {
        "thinking": 0,
        "planning": 0,
        "searching": 1,
        "grading": 2,
        "retry": 3,
        "generating": 4,
        "reviewing": 5,
        "completed": 6,
    }
    active_idx = step_map.get(current_step, -1)
    status_color = "#34d399" if current_step == "completed" else "#60a5fa" if active_idx >= 0 else "#888"
    score_class = "good" if avg_score >= 0.7 else "warning" if avg_score >= 0.5 else "bad"
    tps_class = "good" if tps >= 30 else "warning" if tps >= 10 else ""

    nodes = [
        {"icon": "T", "label": f"Think #{step_counts.get('think', 0)}"},
        {"icon": "S", "label": f"Search #{step_counts.get('search', 0)}"},
        {"icon": "G", "label": f"Grade #{step_counts.get('grade', 0)}"},
        {"icon": "R", "label": f"Rewrite #{step_counts.get('rewrite', 0)}"},
        {"icon": "A", "label": f"Answer #{step_counts.get('gen', 0)}"},
        {"icon": "V", "label": f"Review #{step_counts.get('review', 0)}"},
    ]

    html = ['<div class="analysis-panel">']
    html.append('<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">')
    html.append('<span style="font-size:0.95rem; font-weight:700; color:#fff;">LangGraph Trace</span>')
    html.append(f'<span style="font-size:0.75rem; color:{status_color};">STEP: {current_step.upper()}</span>')
    html.append("</div>")

    # Restored flow menu
    html.append('<div class="pipeline-graph">')
    for i, node in enumerate(nodes):
        node_status = "completed" if i < active_idx else "active" if i == active_idx else ""
        badge = f'<span class="node-badge">{retries}</span>' if i == 3 and retries > 0 else ""
        html.append(
            f'<div class="pipeline-node"><div class="node-circle {node_status}">{node["icon"]}{badge}</div>'
            f'<span class="node-label">{node["label"]}</span></div>'
        )
        if i < len(nodes) - 1:
            conn_status = "completed" if i < active_idx else "active" if i == active_idx - 1 else ""
            html.append(f'<div class="pipeline-connector {conn_status}"></div>')
    html.append("</div>")

    # Status menu
    html.append(
        f'''
        <div class="stats-bar">
            <div class="stat-item"><div class="stat-value {score_class}">{avg_score:.2f}</div><div class="stat-label">Score</div></div>
            <div class="stat-item"><div class="stat-value {tps_class}">{tps:.1f}</div><div class="stat-label">Tok/s</div></div>
            <div class="stat-item"><div class="stat-value">{total_time:.1f}s</div><div class="stat-label">Time</div></div>
            <div class="stat-item"><div class="stat-value" style="color:#f87171;">{retries}</div><div class="stat-label">Retry</div></div>
        </div>
        '''
    )

    # Query summary menu
    html.append('<div style="margin-top:10px; margin-bottom:8px; font-size:0.75rem; color:#666;">Query</div>')
    html.append(
        '<div style="background:#0a0a0a; border:1px solid #222; border-radius:6px; padding:8px; margin-bottom:10px;">'
    )
    html.append(
        f'<div class="log-line info" style="font-size:0.68rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">'
        f'Q: {original_query}</div>'
    )
    html.append(
        f'<div class="log-line" style="font-size:0.68rem; color:#9ca3af; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">'
        f'Rewritten: {rewritten_query}{rewritten_suffix}</div>'
    )
    html.append('</div>')

    # Retrieval menu
    html.append('<div style="margin-top:10px; margin-bottom:8px; font-size:0.75rem; color:#666;">Retrieval</div>')
    html.append('<div style="display:grid; grid-template-columns:1fr 2fr; gap:8px; margin-bottom:10px;">')
    html.append(
        f'<div style="background:#0a0a0a; border:1px solid #222; border-radius:6px; padding:8px;">'
        f'<div style="color:#9ca3af; font-size:0.74rem; margin-bottom:6px;">Summary Docs: '
        f'<span style="color:#e5e7eb;">{summary_docs}</span></div>'
    )
    if summary_results:
        for i, doc in enumerate(summary_results[:6], 1):
            name = normalize_log_text(file_label(doc))
            html.append(f'<div class="log-line info" style="margin-bottom:2px; font-size:0.68rem;">{name}</div>')
    else:
        html.append('<div class="log-line" style="color:#555;">No summary docs</div>')
    html.append('</div>')

    html.append(
        f'<div style="background:#0a0a0a; border:1px solid #222; border-radius:6px; padding:8px;">'
        f'<div style="color:#9ca3af; font-size:0.74rem; margin-bottom:6px;">Raw Docs: '
        f'<span style="color:#e5e7eb;">{raw_docs}</span></div>'
        f'<div style="display:grid; grid-template-columns:1fr 1fr; gap:4px 8px;">'
    )
    if raw_results:
        for i, doc in enumerate(raw_results[:12], 1):
            name = normalize_log_text(file_label(doc))
            short_name = one_line_label(name, 34)
            html.append(
                f'<div class="log-line search" '
                f'style="margin-bottom:0; font-size:0.67rem; white-space:nowrap; overflow:hidden; '
                f'text-overflow:ellipsis; line-height:1.15rem;">{short_name}</div>'
            )
    else:
        html.append('<div class="log-line" style="color:#555; grid-column:1 / span 2;">No raw docs</div>')
    html.append('</div></div></div>')

    # Diagnostics menu (replace redundant Step Details / Thought Process)
    html.append('<div style="font-size:0.75rem; color:#666; margin-bottom:6px;">Diagnostics</div>')
    html.append('<div class="log-terminal" style="max-height:120px; margin-bottom:10px;">')
    html.append(
        f'<div class="log-line {"success" if rewrite_changed else "info"}">Query Rewrite: '
        f'{"changed" if rewrite_changed else "unchanged"}</div>'
    )
    html.append(
        f'<div class="log-line {"success" if citation_count > 0 else "warning"}">Citation Tags: '
        f'{citation_count}</div>'
    )
    html.append(
        f'<div class="log-line info">Retrieval Mix: raw {raw_docs} / summary {summary_docs} '
        f'(raw {raw_ratio*100:.0f}%)</div>'
    )
    html.append(
        f'<div class="log-line info">Source Diversity: {unique_sources} unique files</div>'
    )
    if step_details.get("review"):
        rv = step_details["review"][-1]
        score = rv.get("verification", {}).get("relevance_score", 0)
        html.append(f'<div class="log-line success">Review Score: {score:.2f}</div>')
    html.append("</div>")

    html.append("</div>")
    return "".join(html)


# ==========================================================================
# [ZONE 9] Sidebar
# ==========================================================================
with st.sidebar:
    st.title("Obsidian_Rag")
    # Prefer env-backed URL every run; migrate old session URLs (e.g. 8020) automatically.
    if (
        "backend_url" not in st.session_state
        or st.session_state.backend_url in {"http://127.0.0.1:8020", "http://localhost:8000"}
    ):
        st.session_state.backend_url = BACKEND_URL

    # Model selection
    st.markdown("##### Model")
    # Ollama + OpenAI 모델 목록
    model_options = [
        "qwen2.5:3b",
        "qwen2.5-coder:3b",
        "qwen2.5-coder:7b",
        "gpt-4o",
        "gpt-4-turbo",
        "gpt-5-mini",
        "gpt-5-nano",
    ]
    current_selected_model = st.session_state.get("selected_model", "qwen2.5-coder:3b")
    selected_model_index = model_options.index(current_selected_model) if current_selected_model in model_options else 0
    selected_model = st.selectbox(
        "Model",
        model_options,
        index=selected_model_index,
        label_visibility="collapsed"
    )
    st.session_state["selected_model"] = selected_model
    
    # Connection health
    brain = get_brain_client()
    health = brain.check_health()
    if health.get("engine") != "ready":
        st.caption("Connection issue detected.")
    
    st.divider()
    
    # Project selection
    st.markdown("##### Project")
    projects = get_project_list() or ["Default_Chat"]
    if "current_project" not in st.session_state:
        st.session_state.current_project = projects[0]
        st.session_state.messages = load_history(projects[0])
    if "last_job_sync_at" not in st.session_state:
        st.session_state.last_job_sync_at = "-"

    sel_proj = st.selectbox(
        "Current Project",
        projects,
        index=projects.index(st.session_state.current_project) if st.session_state.current_project in projects else 0,
        label_visibility="collapsed"
    )

    if sel_proj != st.session_state.current_project:
        st.session_state.current_project = sel_proj
        st.session_state.messages = load_history(sel_proj)
        st.rerun()

    # Project management
    with st.expander("Project Management", expanded=False):
        st.markdown('<div class="sidebar-subtitle">Create or delete projects</div>', unsafe_allow_html=True)
        new_name = st.text_input(
            "New project name",
            key="new_proj_input",
            placeholder="e.g. CFD_Study",
            label_visibility="collapsed",
        )
        if st.button("Create Project", use_container_width=True):
            clean_name = (new_name or "").strip().replace(" ", "_")
            if not clean_name:
                st.warning("Please enter a project name.")
            elif clean_name in projects:
                st.warning("This project already exists.")
            else:
                save_history(clean_name, [])
                st.session_state.current_project = clean_name
                st.session_state.messages = []
                st.rerun()
        can_delete = st.session_state.current_project != "Default_Chat"
        if st.button("Delete Current Project", use_container_width=True, type="secondary", disabled=not can_delete):
            if can_delete:
                import shutil
                shutil.rmtree(os.path.join(PROJECTS_DIR, st.session_state.current_project), ignore_errors=True)
                st.session_state.current_project = "Default_Chat"
                st.rerun()
            else:
                st.warning("Default_Chat cannot be deleted.")

    # Folder sync / chat reset
    st.markdown("##### Actions")
    st.caption(f"Last Sync: {st.session_state.last_job_sync_at}")
    col_sync, col_clear = st.columns(2)
    with col_sync:
        if st.button("Folder Sync", use_container_width=True, type="secondary"):
            if sync_all_jobs:
                with st.spinner("Syncing..."):
                    sync_all_jobs()
                    st.session_state.last_job_sync_at = time.strftime("%Y-%m-%d %H:%M:%S")
                    st.toast("Folder sync complete")
            else:
                st.warning("Failed to load config_manager")
    with col_clear:
        if st.button("Reset Chat", use_container_width=True, type="secondary"):
            st.session_state.messages = []
            save_history(st.session_state.current_project, [])
            st.rerun()

    # Status monitor
    st.markdown("##### Status")
    is_gen = st.session_state.get("is_generating", False)
    is_ing = st.session_state.get("is_ingesting", False)

    if is_gen:
        st.info("생성 중...")
        st.progress(st.session_state.get("gen_progress", 0) / 100)
    elif is_ing:
        st.info("수집 중...")
    else:
        st.markdown('<div class="status-pill">Ready</div>', unsafe_allow_html=True)


# ==========================================================================
# [ZONE 10] Project Info Bar
# ==========================================================================
current_proj = st.session_state.get("current_project", "Default_Chat")
current_model = st.session_state.get("selected_model", "qwen2.5-coder:3b")

st.markdown(f"""
    <div class="fixed-project-info">
        <span class="info-label">Project</span><span>{current_proj}</span>
        <span style="margin-left:20px;" class="info-label">Model</span><span>{current_model}</span>
    </div>
""", unsafe_allow_html=True)


# ==========================================================================
# [ZONE 11] Main Tabs
# ==========================================================================
tab_chat, tab_gen, tab_tag, tab_ingest = st.tabs(["💬 Chat", "🏭 Generator", "🏷️ Tagger", "📥 Ingest"])


# ==========================================================================
# [Tab 1] Chat Interface
# ==========================================================================
with tab_chat:
    chat_container = st.container()
    panel_placeholder = st.empty()
    panel_placeholder.markdown(render_compact_panel(), unsafe_allow_html=True)

    # 기존 메시지 출력
    with chat_container:
        if not st.session_state.messages:
            st.info("채팅을 시작하세요.")

        for idx, msg in enumerate(st.session_state.messages):
            with st.chat_message(msg["role"]):
                st.markdown(msg["content"])
                
                # 어시스턴트 메시지 옵션 버튼
                if msg["role"] == "assistant":
                    with st.popover("옵션", help="메시지 옵션"):
                        if st.button("Obsidian 저장", key=f"save_{idx}", use_container_width=True):
                            title = msg["content"].split('\n')[0].replace('#', '').strip()[:30]
                            if save_to_obsidian(title, msg["content"]):
                                st.toast("Obsidian 저장 완료")
                            else:
                                st.toast("저장 실패")
                        if st.button("메시지 삭제", key=f"del_{idx}", use_container_width=True):
                            st.session_state.messages.pop(idx)
                            if idx > 0:
                                st.session_state.messages.pop(idx - 1)
                            save_history(st.session_state.current_project, st.session_state.messages)
                            st.rerun()

    # 채팅 입력
    if prompt := st.chat_input("질문을 입력하세요...", disabled=st.session_state.is_generating):
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        with chat_container:
            with st.chat_message("user"):
                st.markdown(prompt)

            with st.chat_message("assistant"):
                status_placeholder = st.empty()
                message_placeholder = st.empty()
                full_response = ""

                brain = get_brain_client()
                st.session_state.is_generating = True
                
                # 히스토리 구성 (중요도 점수 기반)
                def build_smart_history(messages, current_query, max_messages=120, max_chars=1600):
                    """
                    최근 메시지에서 관련도가 높은 대화 쌍을 선별해 히스토리를 구성합니다.
                    """
                    if not messages or len(messages) <= 1:
                        return ""
                    
                    # 현재 질문 제외
                    history_pool = messages[-max_messages:-1] if len(messages) > max_messages else messages[:-1]
                    
                    if not history_pool:
                        return ""
                    
                    # 현재 질문의 키워드 추출
                    query_words = set(current_query.lower().split())
                    
                    scored_pairs = []
                    i = 0
                    while i < len(history_pool):
                        msg = history_pool[i]
                        
                        # user-assistant 쌍 찾기
                        if msg["role"] == "user":
                            user_msg = msg["content"]
                            assistant_msg = ""
                            if i + 1 < len(history_pool) and history_pool[i + 1]["role"] == "assistant":
                                assistant_msg = history_pool[i + 1]["content"]
                                i += 1
                            
                            # 중요도 점수 계산
                            score = 0
                            
                            # 1) 최신성 점수
                            recency_score = (i / len(history_pool)) * 30  # 최대 30점
                            score += recency_score
                            
                            # 2) 키워드 매칭 점수
                            user_words = set(user_msg.lower().split())
                            common_words = query_words & user_words
                            keyword_score = len(common_words) * 15  # 단어당 15점
                            score += keyword_score
                            
                            # 3) 지시어 질의 보정
                            pronouns = ['this', 'that', 'it', 'there', 'those', 'these']
                            if any(p in current_query for p in pronouns):
                                # 지시어가 포함되면 최근 대화를 가중
                                if i >= len(history_pool) - 4:  # 최근 2쌍
                                    score += 40
                            
                            # 4) 응답 길이 점수
                            if len(assistant_msg) > 500:
                                score += 10
                            
                            scored_pairs.append({
                                "user": user_msg[:500],
                                "assistant": assistant_msg[:500] if assistant_msg else "",
                                "score": score,
                                "index": i
                            })
                        i += 1
                    
                    # 점수 기준 정렬 후 상위 선택
                    scored_pairs.sort(key=lambda x: x["score"], reverse=True)
                    
                    # 시간 순서로 재정렬
                    selected = sorted(scored_pairs[:5], key=lambda x: x["index"])
                    
                    # 히스토리 텍스트 구성
                    history_lines = []
                    total_chars = 0
                    for pair in selected:
                        line = f"사용자: {pair['user']}"
                        if pair['assistant']:
                            line += f"\nAI: {pair['assistant']}"
                        
                        if total_chars + len(line) > max_chars:
                            break
                        history_lines.append(line)
                        total_chars += len(line)
                    
                    return "\n\n".join(history_lines)
                
                history_text = build_smart_history(
                    st.session_state.messages, 
                    prompt,
                    max_messages=120,
                    max_chars=1600
                )
                
                # 프로젝트명 기반 컨텍스트 추가
                project_name = st.session_state.current_project
                project_context_keywords = {
                    '초급': '초급 프로젝트',
                    '중급': '중급 프로젝트',
                    '고급': '고급 프로젝트',
                    'llm': 'LLM/GenAI',
                    'ml': '머신러닝',
                    'dl': '딥러닝',
                    'deep': '딥러닝',
                    'python': 'Python',
                }
                project_context = ""
                for keyword, context in project_context_keywords.items():
                    if keyword.lower() in project_name.lower():
                        project_context = f"[프로젝트 컨텍스트: {context} 관련 질의입니다]"
                        break
                
                # 히스토리가 짧으면 프로젝트 컨텍스트 보강
                if project_context and (not history_text or len(history_text) < 50):
                    history_text = project_context + ("\n\n" + history_text if history_text else "")

                try:
                    last_text_render_ts = 0.0
                    last_panel_render_ts = 0.0
                    last_step = ""
                    render_interval = 0.06
                    panel_interval = 0.25
                    for update in brain.chat_stream(
                        query=prompt,
                        project_name=st.session_state.current_project,
                        model_name=st.session_state.get("selected_model", "qwen2.5-coder:3b"),
                        history=history_text  # 히스토리 전달
                    ):
                        if brain.stop_signal:
                            full_response += "\n\n중단되었습니다."
                            break

                        step = update.get('step', '')
                        answer = update.get('answer', '')
                        logs = update.get('logs', [])
                        state = update.get('state', {})
                        metrics = update.get('metrics', {})

                        if answer:
                            full_response = answer
                            now = time.time()
                            if (now - last_text_render_ts) >= render_interval or step != "generating":
                                # generating 단계에서만 커서 표시
                                if step == "generating":
                                    message_placeholder.markdown(full_response + "▌")
                                else:
                                    message_placeholder.markdown(full_response)
                                last_text_render_ts = now

                        # ========================================
                        # brain_state 업데이트 (상세 분석 데이터)
                        # ========================================
                        if state:
                            st.session_state.brain_state = {
                                "scores": state.get('scores', []),
                                "retry_count": state.get('retry_count', 0),
                                "step_counts": state.get('step_counts', {}),
                                "step_details": state.get('step_details', {}),
                                "search_details": state.get('search_details', {}),
                                "metrics": state.get('metrics', {}),
                                "retrieval_grade": state.get('retrieval_grade', 'PENDING'),
                                "summary_docs": state.get('summary_docs', []),
                                "raw_docs": state.get('raw_docs', []),
                                "answer": state.get('answer', ''),
                            }
                        
                        # 메트릭 업데이트
                        if metrics:
                            st.session_state.current_stats = {
                                "tps": metrics.get('tokens_per_second', 0),
                                "time": metrics.get('total_time', 0)
                            }
                        
                        # 로그 누적
                        if logs:
                            st.session_state.brain_logs = logs

                        step_labels = {
                            "init": "시작...",
                            "think": "질문 분석 중...",
                            "rewrite": "질문 재구성 중...",
                            "search": "검색 중...",
                            "grade": "결과 검증 중...",
                            "generating": "답변 생성 중...",
                            "completed": "완료",
                        }
                        
                        # 단계별 UI 업데이트
                        st.session_state.graph_step = step
                        if step != last_step:
                            status_placeholder.caption(step_labels.get(step, "처리 중..."))
                            last_step = step

                        now = time.time()
                        if (now - last_panel_render_ts) >= panel_interval or step == "completed":
                            # 분석 패널 갱신
                            panel_placeholder.markdown(render_compact_panel(), unsafe_allow_html=True)
                            last_panel_render_ts = now

                except Exception as e:
                    import traceback
                    error_detail = traceback.format_exc()
                    print(f"[Frontend Error] {error_detail}")  # 콘솔 로그
                    full_response = f"오류가 발생했습니다: {str(e)}"
                    message_placeholder.markdown(full_response)
                    st.session_state.is_generating = False  # 에러 시 플래그 해제
                
                finally:
                    # 항상 플래그 해제 보장
                    st.session_state.is_generating = False

                # 최종 응답 고정 (완료 시)
                if full_response:
                    message_placeholder.markdown(full_response)
                
                status_placeholder.empty()
                
                # 응답 저장 (history 추가)
                st.session_state.messages.append({"role": "assistant", "content": full_response})
                save_history(st.session_state.current_project, st.session_state.messages)
    
    # 중단 버튼
    if st.session_state.is_generating:
        if st.button("응답 중단", use_container_width=False):
            brain = get_brain_client()
            brain.request_stop()
            st.session_state.is_generating = False
            st.toast("중단됨")
            st.rerun()


# ==========================================================================
# [Tab 2] Generator
# ==========================================================================
with tab_gen:
    st.subheader("🏭 AI 지식 생성기 (Generator)")

    config = load_combined_config()
    system_config = config.get("system", {})
    jobs_list = config.get("jobs", [])
    model_config = config.get("models", {})
    pattern_config = config.get("patterns", {})
    target_sets = config.get("target_sets", {})
    defaults_cfg = config.get("defaults", {})

    # Prompts are sourced directly from prompts.yaml.
    prompts_direct = load_prompts_config_direct()
    if prompts_direct:
        pattern_config = prompts_direct.get("patterns", pattern_config)
        target_sets = prompts_direct.get("target_sets", target_sets)
        defaults_cfg = prompts_direct.get("defaults", defaults_cfg)

    # Bootstrap config when jobs.yaml is empty.
    if not jobs_list and sync_all_jobs:
        try:
            sync_all_jobs()
            config = load_combined_config()
            system_config = config.get("system", {})
            jobs_list = config.get("jobs", [])
            model_config = config.get("models", model_config)
            pattern_config = config.get("patterns", pattern_config)
            target_sets = config.get("target_sets", target_sets)
            defaults_cfg = config.get("defaults", defaults_cfg)
        except Exception:
            pass

    # Fallback pattern so Generator remains usable even when prompts.yaml is empty.
    if not pattern_config:
        pattern_config = {
            "summary": {
                "system_role": "You are a concise technical assistant.",
                "prompt_template": (
                    "Summarize the following source context for subject '{subject}'. "
                    "Return markdown with key points, decisions, and next actions.\n\n{context}"
                ),
                "output_suffix": "_summary.md",
            }
        }
        if not target_sets:
            target_sets = {"기본 세트": ["summary"]}

    while not st.session_state.gen_queue.empty():
        item = st.session_state.gen_queue.get()
        msg, pct = item if isinstance(item, tuple) else (item, None)
        if msg == "DONE":
            st.session_state.is_generating = False
            st.session_state.gen_progress = 100
            st.session_state.show_gen_finish_alert = True
        else:
            if pct is not None:
                st.session_state.gen_progress = min(int(pct), 99)
            if str(msg) not in st.session_state.gen_logs:
                st.session_state.gen_logs.append(str(msg))

    if st.session_state.show_gen_finish_alert:
        c_msg, c_btn = st.columns([0.92, 0.08])
        with c_msg:
            st.success("모든 생성 작업이 완료되었습니다. 결과 폴더를 확인해 주세요.")
        with c_btn:
            if st.button("X", key="close_gen_alert", help="알림 닫기"):
                st.session_state.show_gen_finish_alert = False
                st.rerun()

    is_working = st.session_state.get("is_generating", False)
    if is_working or st.session_state.show_gen_finish_alert:
        prog_val = max(0, min(st.session_state.gen_progress, 100))
        if prog_val == 100:
            st.info("생성 완료 (100%)")
        else:
            st.info(f"AI 지식 생성 진행 중... ({prog_val}%)")
        st.progress(prog_val / 100)

    model_options_gen = list(model_config.keys()) if model_config else [
        "qwen2.5-coder:3b", "qwen2.5-coder:7b", "gpt-4o", "gpt-4-turbo"
    ]
    selected_job = st.selectbox(
        "작업 템플릿",
        ["직접 설정"] + [j["name"] for j in jobs_list],
        disabled=is_working
    )

    def _pick_existing_dir(candidates):
        for p in candidates:
            if not p:
                continue
            try:
                rp = resolve_path(str(p))
                if os.path.isdir(rp):
                    return str(rp)
            except Exception:
                continue
        return ""

    default_input_dir = _pick_existing_dir([
        system_config.get("root_input_dir"),
        os.getenv("DATA_DIC_PATH"),
        str((Path(os.getenv("OBSIDIAN_PATH", "")) / "10_AI_Engineering")) if os.getenv("OBSIDIAN_PATH") else None,
        os.getenv("OBSIDIAN_PATH"),
        str((BASE_DIR.parent / "data" / "raw").resolve()),
    ]) or "./data/raw"

    default_output_dir = _pick_existing_dir([
        system_config.get("root_output_dir"),
        os.getenv("DATA_SUMMATION_PATH"),
        str((Path(os.getenv("OBSIDIAN_PATH", "")) / "11_RAG_Knowledge_Base")) if os.getenv("OBSIDIAN_PATH") else None,
        os.getenv("OBSIDIAN_PATH"),
        str((BASE_DIR.parent / "data" / "generated").resolve()),
    ]) or "./data/generated"

    defaults = {
        "input": default_input_dir,
        "output": default_output_dir,
        "subject": "New Project",
        "model": defaults_cfg.get("model", st.session_state.get("selected_model", "qwen2.5-coder:3b")),
        "temp": float(defaults_cfg.get("temperature", 0.1)),
    }
    target_job = next((j for j in jobs_list if j.get("name") == selected_job), {}) if selected_job != "직접 설정" else {}
    if target_job:
        defaults.update({
            "input": target_job.get("input_dir", defaults["input"]),
            "output": target_job.get("output_dir", defaults["output"]),
            "subject": target_job.get("subject", defaults["subject"]),
            "model": target_job.get("model", defaults["model"]),
            "temp": float(target_job.get("temperature", defaults["temp"])),
        })

    @st.cache_data(ttl=60)
    def get_cached_files_info(path: str):
        real_p = resolve_path(path)
        if os.path.exists(real_p):
            return list_files_relative(real_p), real_p
        return [], None

    with st.expander("1) 소스 파일 선택", expanded=True):
        col_in, col_subj = st.columns([2, 1])
        in_dir = col_in.text_input("입력 경로", defaults["input"], disabled=is_working)
        subj = col_subj.text_input("주제(Subject)", defaults["subject"], disabled=is_working)

        selected_files = []
        files, real_path = get_cached_files_info(in_dir)
        if real_path and files:
            from collections import defaultdict
            folder_map = defaultdict(list)
            for rel in files:
                folder = rel.split(os.sep)[0] if os.sep in rel else "(루트)"
                folder_map[folder].append(rel)

            for folder, f_list in sorted(folder_map.items()):
                with st.expander(f"{folder} ({len(f_list)})", expanded=False):
                    folder_key = folder.replace("\\", "_").replace("/", "_")
                    select_all_key = f"all_{folder_key}"

                    def toggle_folder_state(toggle_key, file_list):
                        checked = st.session_state.get(toggle_key, False)
                        for f in file_list:
                            st.session_state[f"chk_{f}"] = checked

                    st.checkbox(
                        f"'{folder}' 전체 선택",
                        key=select_all_key,
                        on_change=toggle_folder_state,
                        args=(select_all_key, f_list),
                        disabled=is_working
                    )
                    for f in f_list:
                        file_key = f"chk_{f}"
                        if file_key not in st.session_state:
                            st.session_state[file_key] = False
                        if st.checkbox(f, key=file_key, disabled=is_working):
                            selected_files.append(f)

            if selected_files:
                total_bytes = sum(os.path.getsize(os.path.join(real_path, f)) for f in selected_files)
                est_tokens = total_bytes // 3
                st.caption(f"{len(selected_files)}개 파일 선택 | 예상 입력 토큰: 약 {est_tokens:,}")
            else:
                st.caption("선택된 파일 없음")
        else:
            if real_path and not files:
                st.info(f"입력 경로는 존재하지만 지원 파일(.md/.txt/.py)이 없습니다: {real_path}")
            else:
                st.warning("입력 경로를 찾을 수 없습니다. 경로를 직접 입력하거나 프로젝트 동기화를 실행하세요.")

    if "gen_target_set" not in st.session_state:
        if "Summary" in target_sets:
            st.session_state.gen_target_set = "Summary"
        elif "기본 세트" in target_sets:
            st.session_state.gen_target_set = "기본 세트"
        else:
            st.session_state.gen_target_set = "직접 선택"
    if "gen_selected_patterns" not in st.session_state:
        if st.session_state.gen_target_set != "직접 선택":
            st.session_state.gen_selected_patterns = list(target_sets.get(st.session_state.gen_target_set, []))
        else:
            st.session_state.gen_selected_patterns = []

    with st.expander("2) 상세 설정", expanded=False):
        c_out, c_mod, c_tmp = st.columns([2, 1, 1])
        out_dir = c_out.text_input("출력 경로", defaults["output"], disabled=is_working)
        model_idx = model_options_gen.index(defaults["model"]) if defaults["model"] in model_options_gen else 0
        sel_model = c_mod.selectbox("사용 모델", model_options_gen, index=model_idx, disabled=is_working)
        sel_temp = c_tmp.slider("온도", 0.0, 1.0, float(defaults["temp"]), disabled=is_working)
        st.divider()

        def on_target_set_change():
            selected_set = st.session_state.gen_target_set
            if selected_set != "직접 선택":
                st.session_state.gen_selected_patterns = target_sets.get(selected_set, [])

        set_names = ["직접 선택"] + list(target_sets.keys())
        st.selectbox(
            "타깃 세트",
            set_names,
            key="gen_target_set",
            on_change=on_target_set_change,
            disabled=is_working
        )

        patterns = st.multiselect(
            "적용 패턴",
            options=list(pattern_config.keys()),
            key="gen_selected_patterns",
            disabled=is_working
        )

        if patterns:
            with st.expander("선택 패턴 미리보기", expanded=False):
                for p_key in patterns:
                    p_data = pattern_config.get(p_key, {})
                    if not isinstance(p_data, dict):
                        p_data = {"prompt_template": str(p_data)}
                    st.markdown(f"**[{p_key}]**")
                    if p_data.get("system_role"):
                        st.text_area("System", p_data["system_role"], height=70, disabled=True, key=f"v_sys_{p_key}")
                    st.text_area("User", p_data.get("prompt_template", ""), height=100, disabled=True, key=f"v_usr_{p_key}")

    if st.button("지식 생성 시작", type="primary", use_container_width=True, disabled=is_working):
        if (selected_job != "직접 설정") or (selected_files and patterns):
            st.session_state.is_generating = True
            st.session_state.show_gen_finish_alert = False
            st.session_state.gen_logs = []
            st.session_state.gen_progress = 0

            args = {
                "queue": st.session_state.gen_queue,
                "job_name": selected_job,
                "input_dir": in_dir,
                "output_dir": out_dir,
                "subject": subj,
                "pattern_keys": patterns,
                "model_name": sel_model,
                "temp": sel_temp,
                "selected_files": selected_files,
            }
            t = threading.Thread(target=background_generator_worker, args=(args,))
            add_script_run_ctx(t)
            t.start()
            st.rerun()
        else:
            st.error("직접 설정 모드에서는 파일과 패턴을 1개 이상 선택해야 합니다.")

    if st.session_state.gen_logs:
        with st.expander("로그", expanded=True):
            st.code("\n".join(st.session_state.gen_logs[-20:]))

    if is_working:
        time.sleep(1.5)
        st.rerun()


# ==========================================================================
# [Tab 3] Tagger
# ==========================================================================
with tab_tag:
    st.subheader("🏷️ Auto Tagger")
    st.info("요약/원문 노트의 frontmatter 태그를 자동 갱신합니다.")

    while not st.session_state.tag_queue.empty():
        msg = st.session_state.tag_queue.get()
        if msg == "DONE":
            st.session_state.is_tagging = False
            st.toast("태깅 완료")
        else:
            st.session_state.tag_logs.append(str(msg))

    is_working = st.session_state.is_tagging
    c1, c2 = st.columns(2)
    target_opt = c1.selectbox("대상 레이어", ["summary", "raw", "all"], disabled=is_working)
    mode_opt = c2.selectbox("모드", ["incremental", "reset"], disabled=is_working)

    if st.button("태깅 시작", type="primary", use_container_width=True, disabled=is_working):
        st.session_state.is_tagging = True
        st.session_state.tag_logs = []
        args = {
            "queue": st.session_state.tag_queue,
            "target": target_opt,
            "mode": mode_opt,
        }
        t = threading.Thread(target=background_tagging_worker, args=(args,))
        add_script_run_ctx(t)
        t.start()
        st.rerun()

    if st.session_state.tag_logs:
        with st.expander("태깅 로그", expanded=True):
            st.code("\n".join(st.session_state.tag_logs[-40:]))

    if is_working:
        time.sleep(1.0)
        st.rerun()


# ==========================================================================
# [Tab 4] Ingest
# ==========================================================================
with tab_ingest:
    st.subheader("📥 데이터 수집/인덱싱 (Ingest)")

    if "ingest_status" not in st.session_state:
        st.session_state.ingest_status = "Ready"

    config = load_combined_config()
    jobs_list = config.get("jobs", [])

    while not st.session_state.ingest_queue.empty():
        msg = st.session_state.ingest_queue.get()
        if msg == "DONE":
            st.session_state.is_ingesting = False
            st.session_state.ingest_status = "완료"
            st.toast("인덱싱 완료")
        else:
            st.session_state.ingest_status = str(msg)
            st.session_state.ingest_logs.append(str(msg))

    is_working = st.session_state.is_ingesting

    with st.container(border=True):
        c1, c2, c3 = st.columns(3)
        project_list = ["전체(all)"] + [j["name"] for j in jobs_list]
        sel_job = c1.selectbox("대상 프로젝트", project_list, disabled=is_working)
        layer_label = c2.selectbox("레이어", ["요약(summary)", "원문(raw)", "전체(both)"], index=2, disabled=is_working)
        mode_label = c3.selectbox("학습 모드", ["증분(incremental)", "초기화(reset)", "정리(cleanup)"], disabled=is_working)

        with st.expander("고급 청킹 옵션"):
            st.caption("기본 ingest 옵션을 함께 전달합니다.")
            pol = st.selectbox("분할 정책", ["자동(auto)", "헤딩(headings)", "문단(paragraph)", "최소(minimal)"], disabled=is_working)
            sz = st.number_input("청크 크기", 500, 4000, 800, step=50, disabled=is_working)
            ov = st.number_input("오버랩", 0, 500, 100, step=50, disabled=is_working)
            cc1, cc2 = st.columns(2)
            att = cc1.checkbox("코드 설명 문단 부착", value=False, disabled=is_working)
            hl = cc2.multiselect("헤딩 레벨", [1, 2, 3, 4], default=[1, 2, 3], disabled=is_working)

    layer_map = {"요약(summary)": "summary", "원문(raw)": "raw", "전체(both)": "both"}
    mode_map = {"증분(incremental)": "incremental", "초기화(reset)": "reset", "정리(cleanup)": "cleanup"}
    policy_map = {"자동(auto)": "auto", "헤딩(headings)": "headings", "문단(paragraph)": "paragraph", "최소(minimal)": "minimal"}

    if st.button("데이터 학습 시작", type="primary", use_container_width=True, disabled=is_working):
        st.session_state.is_ingesting = True
        st.session_state.ingest_logs = []
        st.session_state.ingest_status = "엔진 초기화 중..."

        jobs_yaml_path = str((BASE_DIR.parent / "backend" / "config" / "jobs.yaml").resolve())
        args = {
            "queue": st.session_state.ingest_queue,
            "jobs_yaml": jobs_yaml_path,
            "job": sel_job if sel_job != "전체(all)" else "all",
            "layer": layer_map.get(layer_label, "both"),
            "mode": mode_map.get(mode_label, "incremental"),
            "policy": policy_map.get(pol, "auto"),
            "chunk_size": int(sz),
            "overlap": int(ov),
            "heading_levels": hl,
            "code_attach": att,
        }
        t = threading.Thread(target=background_ingest_worker, args=(args,))
        add_script_run_ctx(t)
        t.start()
        st.rerun()

    if st.session_state.ingest_logs:
        st.markdown("**최근 로그**")
        st.code("\n".join(st.session_state.ingest_logs[-20:]))

    if is_working:
        st.info(st.session_state.ingest_status)
        time.sleep(1.2)
        st.rerun()



