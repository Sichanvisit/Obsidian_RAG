import os
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = ROOT_DIR / ".env"

try:
    load_dotenv(dotenv_path=ENV_PATH, override=True)
except Exception:
    pass
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


def _existing_dir(path: Path | None) -> Path | None:
    if not path:
        return None
    try:
        resolved = path.expanduser().resolve()
    except Exception:
        return None
    return resolved if resolved.exists() and resolved.is_dir() else None


def _looks_like_obsidian_vault(path: Path | None) -> bool:
    if not path or not path.exists() or not path.is_dir():
        return False
    has_obsidian = (path / ".obsidian").exists()
    has_raw = (path / "10_AI_Engineering").exists()
    has_summary = (path / "11_RAG_Knowledge_Base").exists()
    return has_obsidian and (has_raw or has_summary)


def _candidate_children(base: Path) -> list[Path]:
    candidates: list[Path] = []
    try:
        for child in base.iterdir():
            if not child.is_dir():
                continue
            candidates.append(child)
            try:
                for grandchild in child.iterdir():
                    if grandchild.is_dir():
                        candidates.append(grandchild)
            except Exception:
                continue
    except Exception:
        return []
    return candidates


def _discover_obsidian_root() -> Path | None:
    env_candidate = _existing_dir(_as_path(os.getenv("OBSIDIAN_PATH")))
    if _looks_like_obsidian_vault(env_candidate):
        return env_candidate

    search_bases: list[Path] = []
    desktop = _existing_dir(_as_path(os.path.join(os.environ.get("USERPROFILE", ""), "Desktop")))
    if desktop:
        search_bases.append(desktop)

    for base in [ROOT_DIR.parent, ROOT_DIR.parent.parent]:
        existing = _existing_dir(base)
        if existing and existing not in search_bases:
            search_bases.append(existing)

    scored: list[tuple[int, Path]] = []
    for base in search_bases:
        direct_candidates = [base, *_candidate_children(base)]
        for candidate in direct_candidates:
            if not _looks_like_obsidian_vault(candidate):
                continue
            score = 0
            if (candidate / "10_AI_Engineering").exists():
                score += 2
            if (candidate / "11_RAG_Knowledge_Base").exists():
                score += 2
            if (candidate / ".obsidian").exists():
                score += 1
            scored.append((score, candidate))

    if not scored:
        return None

    scored.sort(key=lambda item: (-item[0], len(str(item[1]))))
    return scored[0][1]


obsidian_env = _existing_dir(_as_path(os.getenv("OBSIDIAN_PATH"))) or _discover_obsidian_root()
env_raw = _existing_dir(_as_path(os.getenv("DATA_DIC_PATH")))
env_summary = _existing_dir(_as_path(os.getenv("DATA_SUMMATION_PATH")))

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
