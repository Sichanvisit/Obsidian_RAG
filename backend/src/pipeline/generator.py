import os
import json
import yaml
import requests
import argparse
from pathlib import Path

# 한글 주석 복구
from dotenv import load_dotenv

# 한글 주석 복구
try:
    load_dotenv()
except Exception:
    pass

# OpenAI client init (safe when API key is absent)
try:
    from openai import OpenAI
    _openai_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=_openai_key) if _openai_key else None
except Exception:
    client = None

# 한글 주석 복구
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

# ==============================================================================
# 한글 주석 복구
# 한글 주석 복구
# ==============================================================================

# 한글 주석 복구
try:
    load_dotenv()
except Exception:
    pass

# 한글 주석 복구
PROJECT_ROOT = Path(__file__).resolve().parents[3]
CONFIG_DIR = PROJECT_ROOT / "backend" / "config"
LEGACY_CONFIG_DIR = Path(__file__).resolve().parent

# [API Key & Host]
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

# 한글 주석 복구
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# 한글 주석 복구
# 한글 주석 복구
_obsidian_root = os.getenv("OBSIDIAN_PATH")
_obsidian_10 = Path(_obsidian_root) / "10_AI_Engineering" if _obsidian_root else None
_obsidian_11 = Path(_obsidian_root) / "11_RAG_Knowledge_Base" if _obsidian_root else None

RAW_ROOT_DIR = Path(
    os.getenv("DATA_DIC_PATH")
    or (str(_obsidian_10) if _obsidian_10 and _obsidian_10.exists() else str(PROJECT_ROOT / "10_AI_Engineering"))
)
SUM_ROOT_DIR = Path(
    os.getenv("DATA_SUMMATION_PATH")
    or (str(_obsidian_11) if _obsidian_11 and _obsidian_11.exists() else str(PROJECT_ROOT / "11_RAG_Knowledge_Base"))
)


# ==============================================================================
# 한글 주석 복구
# 한글 주석 복구
# ==============================================================================

def resolve_path(path_str: str) -> Path:
    """
    YAML의 추상 경로(예: ./10_AI_Engineering/...)를
    현재 환경의 실제 절대 경로 Path 객체로 변환한다.
    """
    if not path_str:
        return PROJECT_ROOT

    # 한글 주석 복구
    p_str = path_str.replace("\\", "/").strip()

    # 한글 주석 복구
    if p_str.startswith("./10_AI_Engineering"):
        rel_p = p_str.replace("./10_AI_Engineering", "").lstrip("/")
        return (RAW_ROOT_DIR / rel_p).resolve()

    # 한글 주석 복구
    if p_str.startswith("./11_RAG_Knowledge_Base"):
        rel_p = p_str.replace("./11_RAG_Knowledge_Base", "").lstrip("/")
        return (SUM_ROOT_DIR / rel_p).resolve()

    # 한글 주석 복구
    if p_str.startswith("./"):
        return (PROJECT_ROOT / p_str[2:]).resolve()

    # 한글 주석 복구
    return Path(p_str).resolve()


def load_combined_config() -> dict:
    """
    jobs.yaml + prompts.yaml을 읽어 하나의 설정 dict로 합친다.
    UI 모델 목록/패턴/기본값은 여기서 결정된다.
    """
    master_config = {
        "system": {},
        "models": {},  # jobs.yaml 로드
        "jobs": [],  # jobs.yaml 로드
        "patterns": {},  # prompts.yaml 로드
        "target_sets": {},
        "defaults": {}
    }

    # 한글 주석 복구
    j_path = CONFIG_DIR / "jobs.yaml"
    if not j_path.exists():
        j_path = LEGACY_CONFIG_DIR / "jobs.yaml"
    if j_path.exists():
        with open(j_path, "r", encoding="utf-8") as f:
            j_data = yaml.safe_load(f) or {}
            master_config.update(j_data)

    # 한글 주석 복구
    p_path = CONFIG_DIR / "prompts.yaml"
    if not p_path.exists():
        p_path = LEGACY_CONFIG_DIR / "prompts.yaml"
    if p_path.exists():
        with open(p_path, "r", encoding="utf-8") as f:
            p_data = yaml.safe_load(f) or {}
            # 한글 주석 복구
            for key in ["patterns", "target_sets", "defaults"]:
                if key in p_data:
                    master_config[key] = p_data[key]

    return master_config


# ==============================================================================
# 한글 주석 복구
# 한글 주석 복구
# ==============================================================================

def list_files_relative(base_dir: Path, exts=None) -> list[str]:
    """
    UI 표시용: base_dir 하위 파일을 상대 경로 목록으로 반환한다.
    """
    if exts is None:
        exts = [".md", ".txt", ".py"]

    # 한글 주석 복구
    base = Path(base_dir)
    if not base.exists() or not base.is_dir():
        return []

    rel_paths: list[str] = []
    for p in base.rglob("*"):
        if p.is_file() and p.suffix.lower() in exts:
            # 한글 주석 복구
            if not any(part.startswith(".") for part in p.relative_to(base).parts):
                rel_paths.append(str(p.relative_to(base)))

    return sorted(rel_paths)


def read_selected_files(base_dir: Path, selected_files: list[str]) -> tuple[str, list[str]]:
    """
    UI에서 선택한 파일만 읽어 context 텍스트로 합친다.
    selected_files가 비어 있으면 지원 확장자 전체를 읽는다.
    """
    combined = []
    read_list: list[str] = []
    base = Path(base_dir)

    if not base.exists() or not base.is_dir():
        return "", []

    # If UI did not provide a file list, ingest all supported files.
    if not selected_files:
        selected_files = list_files_relative(base)

    for rel in selected_files:
        p = base / rel
        if not p.exists():
            continue
        try:
            # 한글 주석 복구
            text = p.read_text(encoding="utf-8", errors="replace")
            # 한글 주석 복구
            header = f"\n\n=== SOURCE FILE: {rel} ===\n"
            combined.append(header + text)
            read_list.append(rel)
        except Exception as e:
            print(f"파일 읽기 실패 ({rel}): {e}")

    return "".join(combined), read_list


# 한글 주석 복구
def read_files_to_context(base_dir: Path, selected_files: list[str] = None):
    return read_selected_files(base_dir, selected_files)


# ==============================================================================
# 한글 주석 복구
# 한글 주석 복구
# ==============================================================================

def count_tokens_simple(text: str) -> int:
    """
    대략적인 토큰 수를 텍스트 길이 기반으로 추정한다.
    정확한 tokenizer 대신 경량 추정치를 사용한다.
    """
    # 한글 주석 복구
    return int(len(text) / 2.5)


def split_text_smartly(text: str, max_tokens: int) -> list[str]:
    """
    jobs.yaml의 max_tokens를 상한으로 텍스트를 분할한다.
    문맥 보존을 위해 줄바꿈 단위 분할을 우선한다.
    """
    # 한글 주석 복구
    if count_tokens_simple(text) <= max_tokens:
        return [text]

    print(f"토큰 초과로 자동 분할 시작 (limit: {max_tokens})")

    chunks = []
    current_chunk = []
    current_tokens = 0

    lines = text.split("\n")
    for line in lines:
        line_tokens = count_tokens_simple(line) + 1

        # 한글 주석 복구
        if line_tokens > max_tokens:
            if current_chunk:
                chunks.append("\n".join(current_chunk))
                current_chunk = []
                current_tokens = 0
            chunks.append(line[:max_tokens * 2])  # 긴 한 줄은 강제 절단
            continue

        # 한글 주석 복구
        if current_tokens + line_tokens > max_tokens:
            chunks.append("\n".join(current_chunk))
            current_chunk = [line]
            current_tokens = line_tokens
        else:
            current_chunk.append(line)
            current_tokens += line_tokens

    if current_chunk:
        chunks.append("\n".join(current_chunk))

    return chunks


# ==============================================================================
# 한글 주석 복구
# 한글 주석 복구
# ==============================================================================
def call_llm(
        context: str,
        subject: str,
        pattern_config: dict,
        model_alias: str,
        model_spec: dict,
        temp: float
) -> str:
    # 한글 주석 복구
    system_role = pattern_config.get("system_role", "당신은 유능한 분석 어시스턴트입니다.")
    prompt_template = pattern_config.get("prompt_template", "{context}")
    full_prompt = prompt_template.replace("{context}", context).replace("{subject}", subject or "")

    # 한글 주석 복구
    # 한글 주석 복구
    actual_model = model_alias
    if not actual_model or str(actual_model) == "None":
        actual_model = model_spec.get("name") if isinstance(model_spec, dict) else "qwen2.5:8b"

    # 한글 주석 복구
    raw_type = str(model_spec.get("type", "ollama")).lower().strip() if isinstance(model_spec, dict) else "ollama"
    model_type = "openai" if "openai" in raw_type else "ollama"

    # 한글 주석 복구
    print(f"[LLM 호출] 모델: {actual_model} | 타입: {model_type} | 주제: {subject}")

    # 한글 주석 복구
    if model_type == "ollama":
        url = f"{OLLAMA_HOST}/api/chat"
        payload = {
            "model": actual_model,
            "messages": [
                {"role": "system", "content": system_role},
                {"role": "user", "content": full_prompt},
            ],
            "stream": False,
            "options": {"temperature": temp or 0.1},
        }
        try:
            res = requests.post(url, json=payload, timeout=None)  # 긴 생성 작업 허용
            if res.status_code == 200:
                answer = res.json().get("message", {}).get("content", "")
                if not answer: return "Ollama 응답은 성공했지만 본문이 비어 있습니다."
                return answer
            else:
                return f"Ollama 요청 실패 (code {res.status_code}): {res.text}"
        except Exception as e:
            return f"Ollama 연결 오류: {str(e)}"

    # 한글 주석 복구
    elif model_type == "openai":
        if not client: return "OpenAI API Key가 설정되지 않았습니다."
        try:
            response = client.chat.completions.create(
                model=actual_model,
                messages=[
                    {"role": "system", "content": system_role},
                    {"role": "user", "content": full_prompt}
                ],
                temperature=temp or 0.1,
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"OpenAI 오류: {str(e)}"

    return "지원되지 않는 실행 경로입니다."

# ==============================================================================
# 한글 주석 복구
# ==============================================================================

def run_ad_hoc_job(
        input_dir: str,
        output_dir: str,
        subject: str,
        pattern_keys: list[str],
        model_name: str = None,
        temp: float = None,
        ui_logger=None,
        selected_files: list[str] = None,
        ui_mode: bool = False
) -> str:
    """
    UI(app_v3.py)에서 전달한 인자를 사용해 ad-hoc 생성 작업을 수행한다.
    """
    logs = []
    config = load_combined_config()

    # 한글 주석 복구
    defaults = config.get("defaults", {})
    final_model = model_name or defaults.get("model", "qwen2.5:8b")
    final_temp = temp if temp is not None else defaults.get("temperature", 0.1)

    default_model_spec = {
        "max_tokens": 8000,
        "type": "openai" if str(final_model).lower().startswith("gpt-") else "ollama",
    }
    model_spec = config.get("models", {}).get(final_model, default_model_spec)
    token_limit = int(model_spec.get("max_tokens", 8000) * 0.9)

    # 한글 주석 복구
    resolved_in = resolve_path(input_dir)
    resolved_out = resolve_path(output_dir)

    if ui_logger: ui_logger(f"파일 로딩 중: {resolved_in}", 10)

    # 한글 주석 복구
    context_data, loaded_files = read_selected_files(resolved_in, selected_files)

    if not context_data.strip():
        return "No readable input files found. Check input path and file filters."

    if not pattern_keys:
        return "No patterns selected. Select at least one pattern."

    # 한글 주석 복구
    chunks = split_text_smartly(context_data, token_limit)

    # 한글 주석 복구
    patterns_map = config.get("patterns", {})
    os.makedirs(resolved_out, exist_ok=True)

    total_steps = max(1, len(pattern_keys) * len(chunks))
    step_count = 0

    for p_key in pattern_keys:
        if p_key not in patterns_map:
            logs.append(f"Pattern not found: {p_key}")
            continue
        ptrn = patterns_map[p_key]
        chunk_results = []

        for chunk in chunks:
            step_count += 1
            if ui_logger:
                progress = 10 + int((step_count / total_steps) * 85)
                ui_logger(f"[{p_key}] 처리 중 ({step_count}/{total_steps})", progress)

            # 한글 주석 복구
            res = call_llm(
                context=chunk,
                subject=subject,
                pattern_config=ptrn,
                model_alias=final_model,
                model_spec=model_spec,
                temp=final_temp
            )
            chunk_results.append(res)

        # 한글 주석 복구
        fname = f"{subject}{ptrn.get('output_suffix', f'_{p_key}.md')}"
        save_path = os.path.join(resolved_out, fname)
        with open(save_path, "w", encoding="utf-8") as f:
            f.write("\n\n---\n\n".join(chunk_results))
        logs.append(f"Created: {fname}")

    if loaded_files:
        logs.insert(0, f"Loaded files: {len(loaded_files)}")

    # notify UI completion
    if ui_logger:
        ui_logger("모든 작업 완료", 100)
        ui_logger("DONE", 100)  # 洹??ㅼ쓬 醫낅즺 ?좏샇

    return "\n".join(logs)


def run_batch_job(job_name: str):
    config = load_combined_config()
    job_info = next((j for j in config.get("jobs", []) if j.get("name") == job_name), None)
    if not job_info:
        print(f"Job '{job_name}'을(를) 찾을 수 없습니다.")
        return

    # 한글 주석 복구
    p_keys = job_info.get("targets") or job_info.get("patterns") or job_info.get("pattern_keys")

    # 한글 주석 복구
    if not p_keys:
        if job_info.get("target_set"):
            p_keys = config.get("target_sets", {}).get(job_info.get("target_set"), [])
        else:
            # 한글 주석 복구
            print(f"'{job_name}'에 패턴 정보가 없어 기본값 ['summary']를 적용합니다.")
            p_keys = ["summary"]

    print(f"배치 작업 시작: {job_name} ({len(p_keys)}개 패턴)")

    # 한글 주석 복구
    result = run_ad_hoc_job(
        input_dir=job_info["input_dir"],
        output_dir=job_info["output_dir"],
        subject=job_info["subject"],
        pattern_keys=p_keys,  # 확정된 패턴 키 전달
        model_name=job_info.get("model"),
        temp=job_info.get("temperature")
    )
    print(result)


# ==============================================================================
# 한글 주석 복구
# 한글 주석 복구
# ==============================================================================

if __name__ == "__main__":
    # 한글 주석 복구
    parser = argparse.ArgumentParser(description="Obsidian RAG Knowledge Generator")
    parser.add_argument("--job", help="jobs.yaml???뺤쓽???ㅽ뻾??Job ?대쫫")

    args = parser.parse_args()

    # 한글 주석 복구
    if args.job:
        # 한글 주석 복구
        run_batch_job(args.job)
    else:
        # 한글 주석 복구
        print("\n" + "=" * 50)
        print("사용법")
        print("1. 특정 작업 실행: python run_generator.py --job [JOB_NAME]")
        print("2. 전체 UI 실행: streamlit run app_v3.py")
        print("=" * 50 + "\n")

        # 한글 주석 복구
        cfg = load_combined_config()
        available_jobs = [j.get("name") for j in cfg.get("jobs", [])]
        print(f"현재 등록된 Jobs: {available_jobs}")


