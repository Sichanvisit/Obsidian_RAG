# backend/utils/auto_config_manager.py

import os
import re
import shutil
import yaml
import logging
from pathlib import Path
from typing import Dict, List, Optional

# [SSOT] 경로 설정 가져오기
from backend.config.paths import RAW_DATA_DIR, SUMMARY_DATA_DIR, ROOT_DIR

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AutoConfigManager")

# 설정 파일 경로 (backend 폴더 기준 상위로 이동하거나 config 폴더 내 지정)
CONFIG_FILE = ROOT_DIR / "backend" / "config" / "jobs.yaml"

# 외부 모듈 로드 시도 (없으면 더미 함수)
try:
    # 가정: backend/src/pipeline/run_ingest.py 가 있다고 가정
    from backend.src.pipeline.ingestor import run_ingest_logic
    from backend.src.pipeline.tagger import run_tagging_logic
except ImportError:
    def run_ingest_logic(**kwargs): return "⚠️ Ingest Module Missing"
    def run_tagging_logic(**kwargs): return "⚠️ Tagger Module Missing"

# ----------------------------------------------------------
# 내부 유틸 (YAML I/O)
# ----------------------------------------------------------
def _load_yaml(path: Path) -> dict:
    if not path.exists(): return {}
    try: return yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except: return {}

def _save_yaml(path: Path, data: dict) -> None:
    path.write_text(yaml.safe_dump(data, sort_keys=False, allow_unicode=True), encoding="utf-8")

def _job_name_from_rel(rel_path: str) -> str:
    """폴더명 -> Job Name 변환 (특수문자 제거)"""
    safe = rel_path.replace("\\", "/").strip("/").replace("/", "__")
    safe = re.sub(r"\s+", "_", safe)
    safe = re.sub(r"[^a-zA-Z0-9가-힣__]", "", safe)
    if not safe.endswith("_Summary"): safe += "_Summary"
    return safe

def _ensure_defaults(cfg: dict) -> dict:
    if "jobs" not in cfg: cfg["jobs"] = []
    if "system" not in cfg: cfg["system"] = {}
    return cfg

# ----------------------------------------------------------
# [핵심 기능] 외부 호출 API
# ----------------------------------------------------------

def sync_all_jobs() -> str:
    """
    [Folder Scan -> YAML Sync]
    RAW_DATA_DIR를 스캔하여 새로운 폴더를 jobs.yaml에 등록하고,
    사라진 폴더는 정리합니다. (11_RAG_Knowledge_Base 상단 고정)
    """
    logs = ["🔄 프로젝트 전수 스캔 시작..."]
    
    if not RAW_DATA_DIR.exists():
        return f"❌ 오류: Raw 경로 없음 -> {RAW_DATA_DIR}"

    cfg = _load_yaml(CONFIG_FILE)
    cfg = _ensure_defaults(cfg)

    # 1. 폴더 스캔
    found_paths = []
    exclude = {".git", ".obsidian", ".trash", "__pycache__"}
    
    try:
        # (A) 11번 폴더 (Summary 저장소) 강제 추가
        found_paths.append("11_RAG_Knowledge_Base")
        
        # (B) Raw 폴더 스캔
        for item in RAW_DATA_DIR.iterdir():
            if item.is_dir() and item.name not in exclude and not item.name.startswith((".", "_")):
                # 99 계열 폴더는 하위 프로젝트(예: 01~05)를 잡으로 생성
                if item.name.startswith("99"):
                    for sub in item.iterdir():
                        if sub.is_dir():
                            found_paths.append(sub.relative_to(RAW_DATA_DIR).as_posix())
                else:
                    found_paths.append(item.relative_to(RAW_DATA_DIR).as_posix())
                    
        logs.append(f"📂 감지된 폴더: {len(found_paths)}개")
        
    except Exception as e:
        return f"❌ 스캔 에러: {e}"

    # 2. 정렬 (11번 상단 고정 + 나머지 이름순)
    others = sorted([p for p in found_paths if p != "11_RAG_Knowledge_Base"])
    final_paths = ["11_RAG_Knowledge_Base"] + others

    # 3. YAML 재구성
    new_jobs = []
    for rel_p in final_paths:
        # 특수 처리: 11번 폴더
        if rel_p == "11_RAG_Knowledge_Base":
            entry = {
                "name": "Summary_Storage_Center",
                "subject": "📚 요약본_통합_저장소",
                "input_dir": str(SUMMARY_DATA_DIR), # 절대경로로 저장 추천
                "output_dir": str(SUMMARY_DATA_DIR),
                "ingest": {"enabled": True, "collection_raw": "summary_center"}
            }
        else:
            job_name = _job_name_from_rel(rel_p)
            entry = {
                "name": job_name,
                "subject": rel_p.split("/")[-1],
                "input_dir": f"./10_AI_Engineering/{rel_p}", # 상대경로 유지
                "output_dir": f"./11_RAG_Knowledge_Base/{rel_p}",
                "ingest": {
                    "enabled": True,
                    "collection_raw": job_name.replace("_Summary", ""),
                    "collection_summary": f"sum_{job_name.replace('_Summary', '')}"
                }
            }
        new_jobs.append(entry)

    # 4. 저장
    cfg["jobs"] = new_jobs
    _save_yaml(CONFIG_FILE, cfg)
    logs.append("💾 jobs.yaml 동기화 완료!")
    
    return "\n".join(logs)

def add_new_job(folder_name: str) -> str:
    """
    [Folder Create -> Ingest]
    새 폴더를 만들고 즉시 인덱싱을 수행합니다.
    """
    folder_rel = folder_name.replace("\\", "/")
    job_name = _job_name_from_rel(folder_rel)
    
    # 1. Summary 폴더 생성
    target_dir = SUMMARY_DATA_DIR / folder_rel
    target_dir.mkdir(parents=True, exist_ok=True)
    
    # 2. YAML 업데이트 (sync_all_jobs 호출로 대체 가능하지만 명시적 추가)
    # ... (sync_all_jobs가 더 안전하므로 권장)
    sync_log = sync_all_jobs()
    
    # 3. Ingest Trigger
    logs = [f"✅ 폴더 생성: {target_dir}", sync_log]
    logs.append(f"🚀 초기 인덱싱 시작 ({job_name})...")
    
    ingest_log = run_ingest_logic(
        jobs_yaml=str(CONFIG_FILE),
        job=job_name,
        mode="incremental",
        layer="both"
    )
    logs.append(ingest_log)
    
    return "\n".join(logs)

# 테스트
if __name__ == "__main__":
    print(sync_all_jobs())
