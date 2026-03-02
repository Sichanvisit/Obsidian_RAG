import os
from pathlib import Path
from dotenv import load_dotenv

try:
    load_dotenv()
except Exception:
    pass

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT_DIR / "data"
VECTOR_DB_DIR = DATA_DIR / "vector_store"
CHAT_HISTORY_DIR = DATA_DIR / "chat_history"


def _as_path(value: str | None) -> Path | None:
    if not value:
        return None
    try:
        return Path(value).expanduser()
    except Exception:
        return None


obsidian_env = _as_path(os.getenv("OBSIDIAN_PATH"))
env_raw = _as_path(os.getenv("DATA_DIC_PATH"))
env_summary = _as_path(os.getenv("DATA_SUMMATION_PATH"))

if env_raw:
    RAW_DATA_DIR = env_raw
elif obsidian_env and (obsidian_env / "10_AI_Engineering").exists():
    RAW_DATA_DIR = obsidian_env / "10_AI_Engineering"
else:
    RAW_DATA_DIR = DATA_DIR / "raw"

if env_summary:
    SUMMARY_DATA_DIR = env_summary
elif obsidian_env and (obsidian_env / "11_RAG_Knowledge_Base").exists():
    SUMMARY_DATA_DIR = obsidian_env / "11_RAG_Knowledge_Base"
else:
    SUMMARY_DATA_DIR = DATA_DIR / "summary"

OBSIDIAN_ROOT = obsidian_env if obsidian_env else RAW_DATA_DIR

SUMMARY_DB_PATH = VECTOR_DB_DIR / "summary" / "integrated_knowledge"
CHROMA_DB_PATH = VECTOR_DB_DIR / "chroma_db"

if SUMMARY_DB_PATH.exists() and any(SUMMARY_DB_PATH.glob("*.sqlite3")):
    VECTOR_DB_PATH = SUMMARY_DB_PATH
    _db_source = "Summary (Integrated Knowledge)"
elif CHROMA_DB_PATH.exists() and any(CHROMA_DB_PATH.glob("*.sqlite3")):
    VECTOR_DB_PATH = CHROMA_DB_PATH
    _db_source = "Chroma DB"
else:
    VECTOR_DB_PATH = SUMMARY_DB_PATH
    _db_source = "Summary (Default - Will be created)"

for p in [DATA_DIR, VECTOR_DB_DIR, CHAT_HISTORY_DIR, RAW_DATA_DIR, SUMMARY_DATA_DIR, VECTOR_DB_PATH]:
    p.mkdir(parents=True, exist_ok=True)

print(f"[OK] Paths Loaded: ROOT={ROOT_DIR}")
print(f"[OK] RAW_DATA_DIR={RAW_DATA_DIR}")
print(f"[OK] SUMMARY_DATA_DIR={SUMMARY_DATA_DIR}")
print(f"[DB] Vector DB: {VECTOR_DB_PATH}")
print(f"[SOURCE] {_db_source}")

