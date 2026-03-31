import os
import re
import yaml
import torch
import argparse
import logging
import hashlib
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Tuple, Set, Optional, Callable # <--- 여기 Callable 확인!

from dotenv import load_dotenv
from backend.config.paths import OBSIDIAN_ROOT, RAW_DATA_DIR, SUMMARY_DATA_DIR

# LangChain / Chroma
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import OllamaEmbeddings
# [추가됨] HuggingFace 임베딩
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores.utils import filter_complex_metadata

# ==============================================================================
# SECTION 1. 환경 설정 및 로깅 (Environment & Logging)
# ==============================================================================

import os
import logging
from pathlib import Path

load_dotenv()

# 현재 파일(ingest.py)이 있는 폴더 기준으로 PROJECT_ROOT 설정
PROJECT_ROOT = Path(__file__).resolve().parent

# 환경 변수에서 데이터 경로 로드
ENV_RAW_PATH = os.getenv("DATA_DIC_PATH")
ENV_SUMMARY_PATH = os.getenv("DATA_SUMMATION_PATH")
_obsidian_root = str(OBSIDIAN_ROOT) if isinstance(OBSIDIAN_ROOT, Path) else ""
if not ENV_RAW_PATH and isinstance(RAW_DATA_DIR, Path) and RAW_DATA_DIR.exists():
    ENV_RAW_PATH = str(RAW_DATA_DIR.resolve())
if not ENV_SUMMARY_PATH and isinstance(SUMMARY_DATA_DIR, Path) and SUMMARY_DATA_DIR.exists():
    ENV_SUMMARY_PATH = str(SUMMARY_DATA_DIR.resolve())

# 🔧 CHROMA_DB_PATH: 절대경로 또는 프로젝트 기준 상대경로로 해석
_raw_db = os.getenv("CHROMA_DB_PATH", "chroma_db")  # 기본값은 "chroma_db"

if os.path.isabs(_raw_db):
    ENV_DB_ROOT = os.path.normpath(_raw_db)
else:
    # ingest.py 위치 기준으로 절대경로 생성
    ENV_DB_ROOT = str((Path(PROJECT_ROOT) / _raw_db).resolve())

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("SecondBrainIngestV4")

# 기타 설정
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL_NAME", "BAAI/bge-m3")

# ✅ 반드시 로컬 모델 사용
USE_LOCAL_EMBEDDING = True

# 로그 출력
logger.info(f"[INGEST] ENV_DB_ROOT = {ENV_DB_ROOT}")

# 제외할 폴더 및 확장자
EXCLUDE_FOLDERS = {".git", ".obsidian", ".trash", "venv", "__pycache__", "chroma_db", "doc_store"}
EXCLUDE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".pdf", ".zip", ".exe", ".bin", ".ipynb"}
ALLOW_EXTENSIONS = {".md", ".txt", ".py"}


# ==============================================================================
# SECTION 2. 유틸리티 함수 (Path / Hash / Embedding)
# ==============================================================================

def norm_abs(p: str) -> str:
    return os.path.normcase(os.path.abspath(os.path.expanduser(p)))


RAW_ROOT = norm_abs(ENV_RAW_PATH) if ENV_RAW_PATH else ""
SUMMARY_ROOT = norm_abs(ENV_SUMMARY_PATH) if ENV_SUMMARY_PATH else ""


def is_under(path: str, root: str) -> bool:
    if not path or not root:
        return False
    p = norm_abs(path)
    r = norm_abs(root)
    return p == r or p.startswith(r + os.sep)


def rel_to_layer_and_relpath(abs_path: str) -> Tuple[str, str]:
    """
    절대경로가 RAW/SUMMARY 중 어디에 속하는지 판별.
    (layer, root 기준 상대경로)를 반환.
    """
    p = norm_abs(abs_path)
    if is_under(p, SUMMARY_ROOT):
        rel = os.path.relpath(p, SUMMARY_ROOT).replace("\\", "/")
        return "summary", rel
    if is_under(p, RAW_ROOT):
        rel = os.path.relpath(p, RAW_ROOT).replace("\\", "/")
        return "raw", rel
    return "unknown", os.path.basename(p).replace("\\", "/")


def sha1_text(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8", errors="ignore")).hexdigest()


def safe_str(v: Any) -> str:
    try:
        return str(v)
    except Exception:
        return ""


def resolve_env_path(yaml_path: str) -> str:
    """
    jobs.yaml 내 상대 경로(./10_...)를 .env에 정의된 실제 절대경로로 변환.
    """
    if not yaml_path:
        return ""
    p = yaml_path.replace("\\", "/")

    if p.startswith("./10_AI_Engineering") and ENV_RAW_PATH:
        return os.path.join(ENV_RAW_PATH, p.replace("./10_AI_Engineering", "").strip("/"))

    if p.startswith("./11_RAG_Knowledge_Base") and ENV_SUMMARY_PATH:
        return os.path.join(ENV_SUMMARY_PATH, p.replace("./11_RAG_Knowledge_Base", "").strip("/"))

    if p.startswith("./"):
        return os.path.join(PROJECT_ROOT, p[2:])

    return os.path.abspath(p)


def get_embedding_function():
    """
    환경 변수(EMBEDDING_MODEL_NAME)에 따라
    OpenAI vs HuggingFace(Local)를 자동 결정합니다.
    """
    model_name = EMBEDDING_MODEL

    # 1. OpenAI 모델인 경우
    if "text-embedding" in model_name or "gpt" in model_name:
        if not OPENAI_API_KEY:
            raise ValueError("❌ OpenAI API Key가 없습니다. .env를 확인하세요.")
        return OpenAIEmbeddings(model=model_name, openai_api_key=OPENAI_API_KEY)

    # 2. 그 외 (BAAI/bge-m3 등) → GPU 최적화 모드로 로컬 실행
    else:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        # 로거가 정의되어 있다면 logger.info, 아니면 print 사용
        msg = f"⚡ Loading Local Embedding Model: {model_name} ({device}) - GPU Optimized"
        if 'logger' in globals():
            logger.info(msg)
        else:
            print(msg)

        return HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs={
                "device": device,
                # 🔥 [핵심 1] FP16 모드: 메모리 사용량 절반으로 뚝 떨어짐
                "model_kwargs": {"torch_dtype": torch.float16} if device == "cuda" else {}
            },
            encode_kwargs={
                "normalize_embeddings": True,
                # 🔥 [핵심 2] 한 번에 1개씩 처리: OOM 방지 (GPU라 속도는 여전히 빠름)
                "batch_size": 1
            }
        )


def ensure_50_step(n: Optional[int], default: int) -> int:
    """
    chunk_size, overlap 값을 50 단위로 정규화.
    - None이면 default 사용
    - 최소 50
    """
    if n is None:
        return default
    try:
        n = int(n)
    except Exception:
        return default
    if n < 50:
        return 50
    return int(round(n / 50.0) * 50)


# ==============================================================================
# SECTION 3. jobs.yaml 로더 & JobSpec
# ==============================================================================

@dataclass
class JobSpec:
    """
    jobs.yaml의 각 job 항목을 구조화한 스펙.
    ingest.collection_* 설정까지 포함.
    """
    name: str
    input_dir: str
    output_dir: str
    ingest_enabled: bool
    default_layer: str
    collection_raw: str
    collection_summary: str


def load_jobs(jobs_yaml_path: str) -> Tuple[Dict[str, JobSpec], Dict[str, Any]]:
    path = Path(jobs_yaml_path)
    if not path.exists():
        return {}, {}

    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        return {}, {}

    system = data.get("system", {})
    jobs_list = data.get("jobs", [])
    jobs: Dict[str, JobSpec] = {}

    for j in jobs_list:
        if not isinstance(j, dict):
            continue
        name = j.get("name")
        if not name:
            continue

        ingest = j.get("ingest", {}) or {}
        jobs[name] = JobSpec(
            name=name,
            input_dir=resolve_env_path(safe_str(j.get("input_dir", ""))),
            output_dir=resolve_env_path(safe_str(j.get("output_dir", ""))),
            ingest_enabled=bool(ingest.get("enabled", True)),
            default_layer=safe_str(ingest.get("default_layer", "both")).lower(),
            collection_raw=safe_str(ingest.get("collection_raw", "")),
            collection_summary=safe_str(ingest.get("collection_summary", "summary")) or "summary",
        )

    return jobs, system


# ==============================================================================
# SECTION 4. Frontmatter / Code 블록 보호 / 헤더 주입
# ==============================================================================

def split_frontmatter(text: str) -> Tuple[Dict[str, Any], str]:
    """
    파일 텍스트에서 YAML frontmatter와 body를 분리.
    frontmatter가 없으면 ({}, 전체텍스트)를 반환.
    """
    stripped = text.lstrip()
    if not stripped.startswith("---"):
        return {}, text

    lines = text.splitlines()
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            yaml_block = "\n".join(lines[1:i])
            body = "\n".join(lines[i + 1:]).lstrip("\n")
            try:
                fm = yaml.safe_load(yaml_block) or {}
                if not isinstance(fm, dict):
                    fm = {}
            except Exception:
                fm = {}
            return fm, body
    return {}, text


@dataclass
class Block:
    kind: str   # "text" or "code"
    text: str


_CODE_FENCE_RE = re.compile(r"(^```.*?$)(.*?)(^```$)", re.MULTILINE | re.DOTALL)


def parse_blocks_preserve_code(body: str) -> List[Block]:
    """
    ``` fenced code blocks를 절대 쪼개지 않게 보호.
    - code block → Block(kind="code")
    - 나머지 → Block(kind="text")
    """
    blocks: List[Block] = []
    cursor = 0
    for m in _CODE_FENCE_RE.finditer(body):
        start, end = m.span()
        if start > cursor:
            txt = body[cursor:start]
            if txt.strip():
                blocks.append(Block("text", txt))
        code = body[start:end]
        if code.strip():
            blocks.append(Block("code", code))
        cursor = end

    rest = body[cursor:]
    if rest.strip():
        blocks.append(Block("text", rest))
    return blocks


def build_chunk_header(meta: Dict[str, Any]) -> str:
    """
    Tagger frontmatter로부터 chunk 상단에 들어갈 정체성 헤더를 생성.
    예: **[Domain/LLM | Layer/summary | Collection/03_Second_Brain_RAG | Tech/Python,LangChain]**
    """
    parts = []
    for k in ["Domain", "Layer", "Collection"]:
        v = meta.get(k)
        if v:
            parts.append(f"{k}/{v}")

    techs = meta.get("Tech", [])
    if techs:
        if isinstance(techs, list):
            parts.append("Tech/" + ",".join(map(safe_str, techs)))
        else:
            parts.append(f"Tech/{safe_str(techs)}")

    return f"**[{' | '.join(parts)}]**" if parts else ""


# ==============================================================================
# SECTION 5. 청킹 정책 (헤딩/문단/미니멀)
# ==============================================================================

def split_text_by_headings(text: str, levels: Set[int]) -> List[str]:
    """
    headings 기반 분리:
    levels={1,2,3} → #, ##, ###를 기준으로 섹션 나누기.
    """
    if not text.strip():
        return []

    # BUG FIX: level이 str로 들어와도 int로 강제 변환
    pats = [rf"^{'#'*int(lvl)}\s+.+$" for lvl in sorted(levels)]
    if not pats:
        return [text.strip()]

    heading_re = re.compile("(" + "|".join(pats) + ")", re.MULTILINE)
    matches = list(heading_re.finditer(text))
    if not matches:
        return [text.strip()]

    chunks: List[str] = []
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        seg = text[start:end].strip()
        if seg:
            chunks.append(seg)
    return chunks

def split_code_by_logic(code_text: str, max_chars: int) -> List[str]:
    """
    코드 블록 내에서 class, def 혹은 큰 단위의 들여쓰기를 기준으로 분할합니다.
    """
    if len(code_text) <= max_chars:
        return [code_text]

    lines = code_text.split("\n")
    sub_chunks = []
    current_chunk = []
    current_len = 0

    for line in lines:
        # class나 def로 시작하는 라인은 새로운 논리적 단위의 시작으로 간주
        is_new_unit = line.startswith("class ") or line.startswith("def ")

        if is_new_unit and current_len > max_chars * 0.5:
            sub_chunks.append("\n".join(current_chunk))
            current_chunk = [line]
            current_len = len(line)
        else:
            current_chunk.append(line)
            current_len += len(line)

    if current_chunk:
        sub_chunks.append("\n".join(current_chunk))
    return sub_chunks

def policy_split_text(
    text: str,
    policy: str,
    chunk_size: int,
    overlap: int,
    heading_levels: Set[int],
) -> List[str]:
    policy = (policy or "auto").lower()

    # [수정] 표(|), 수식($$), 코드블록(```)을 최대한 보존하기 위한 구분자 순서
    # 상위 헤더에서 먼저 자르고, 안되면 문단, 안되면 수식/표 경계에서 자릅니다.
    custom_separators = ["\n# ", "\n## ", "\n### ", "\n#### ", "\n\n", "\n$$\n", "\n", " ", ""]

    if policy == "auto":
        if text.count("\n#") >= 2 or text.lstrip().startswith("#"):
            policy = "headings"
        else:
            policy = "paragraph"

    # 1. Minimal 정책 (거의 안 자름)
    if policy == "minimal":
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=max(chunk_size, 2000),
            chunk_overlap=min(overlap, 200),
            separators=custom_separators
        )
        return [c.strip() for c in splitter.split_text(text) if c.strip()]

    # 2. Headings 정책 (헤더 기반 1차 분할 후 내부 분할)
    if policy == "headings":
        sections = split_text_by_headings(text, heading_levels)
        # 만약 섹션이 코드 블록이라면 지능적 분할 적용
        out: List[str] = []
        for s in sections:
            if s.strip().startswith("```"):
                out.extend(split_code_by_logic(s, chunk_size))
            elif len(s) <= chunk_size * 1.1:
                out.append(s.strip())
            else:
                splitter = RecursiveCharacterTextSplitter(
                    chunk_size=chunk_size,
                    chunk_overlap=overlap,
                    separators=custom_separators
                )
                out.extend([c.strip() for c in splitter.split_text(s) if c.strip()])
        return out

    # 3. Paragraph/일반 정책
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=custom_separators
    )
    return [c.strip() for c in splitter.split_text(text) if c.strip()]

def attach_prev_paragraph_to_code(chunks: List[str], code_block: str) -> List[str]:
    """
    코드블록 앞의 짧은 설명(<=400자)을 코드와 합칠지 여부.
    """
    if not chunks:
        return [code_block.strip()]
    prev = chunks[-1]
    if len(prev) <= 400 and not prev.strip().startswith("```"):
        chunks[-1] = prev.rstrip() + "\n\n" + code_block.strip()
        return chunks
    chunks.append(code_block.strip())
    return chunks


# ==============================================================================
# SECTION 6. Chroma 컬렉션 풀 & Ingest 엔진
# ==============================================================================

class ChromaPool:
    def __init__(self, db_root: str, embeddings):
        self.db_root = db_root
        self.embeddings = embeddings
        self._stores: Dict[str, Chroma] = {}

    def get(self, collection: str) -> Chroma:
        collection = (collection or "General").strip().replace("\\", "/")
        persist_dir = os.path.join(self.db_root, collection)
        os.makedirs(persist_dir, exist_ok=True)
        if collection not in self._stores:
            self._stores[collection] = Chroma(
                persist_directory=persist_dir,
                embedding_function=self.embeddings,
                collection_metadata={"hnsw:space": "cosine"},
            )
            logger.info(f"📦 Opened Collection: {collection}")
        return self._stores[collection]


class IngestEngine:
    def __init__(self, db_root: str):
        self.db_root = db_root
        self.embeddings = get_embedding_function()
        self.pool = ChromaPool(db_root=db_root, embeddings=self.embeddings)

    # --- 파일 필터 & 스캔 ---
    def is_valid_file(self, file_path: str) -> bool:
        p = Path(file_path)
        if any(ex in p.parts for ex in EXCLUDE_FOLDERS):
            return False
        return p.suffix.lower() in ALLOW_EXTENSIONS

    def scan_files(self, directory: str) -> List[str]:
        files: List[str] = []
        for root, dirs, fnames in os.walk(directory):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_FOLDERS]
            for f in fnames:
                fp = os.path.join(root, f)
                if self.is_valid_file(fp):
                    files.append(fp)
        return files

    # --- [수정본] 사용자 구상 반영: Summary 통합 및 Raw 개별 분리 ---
    def determine_collection(self, job: JobSpec, layer: str, meta_collection: Optional[str]) -> str:
        layer = layer.lower()

        # 1. Summary 레이어: 모든 프로젝트 요약본을 단 하나의 컬렉션으로 통합
        if layer == "summary":
            # 이 경로로 설정하면 chroma_db/summary/integrated_knowledge 폴더에 모든 요약이 모입니다.
            return "summary/integrated_knowledge"

        # 2. Raw 레이어: 기존처럼 Job(프로젝트)별로 개별 컬렉션 유지
        elif layer == "raw":
            base = job.collection_raw if job.collection_raw else job.name
            sub = (meta_collection or "").strip()
            if sub and sub.lower() != base.lower():
                return f"raw/{base}/{sub}".strip("/")
            return f"raw/{base}".strip("/")

        return "unknown/general"

    # --- delta 인덱싱용 existing index ---
    def build_existing_index(self, store: Chroma, job_name: str) -> Dict[str, str]:
        idx: Dict[str, str] = {}
        try:
            data = store.get(include=["metadatas"])
            for md in data.get("metadatas", []):
                md = md or {}
                if md.get("ingest_job") != job_name:
                    continue
                sp = md.get("source_path")
                ch = md.get("content_hash")
                if sp and ch:
                    idx[sp] = ch
        except Exception as e:
            logger.warning(f"⚠️ build_existing_index failed: {e}")
        return idx

    def delete_file_chunks(self, store: Chroma, job_name: str, source_path: str) -> int:
        try:
            data = store.get(
                where={"$and": [{"ingest_job": job_name}, {"source_path": source_path}]},
                include=["ids"],
            )
            ids = data.get("ids", [])
            if not ids:
                return 0
            bs = 5000
            for i in range(0, len(ids), bs):
                store.delete(ids=ids[i:i + bs])
            return len(ids)
        except Exception:
            return 0

    def cleanup_ghosts(self, stores: Dict[str, Chroma]) -> int:
        deleted = 0
        for coll_name, store in stores.items():
            try:
                data = store.get(include=["metadatas", "ids"])
            except Exception:
                continue

            ids_to_delete: List[str] = []
            for _id, md in zip(data.get("ids", []), data.get("metadatas", [])):
                md = md or {}
                layer = (md.get("layer") or "").lower()
                sp = md.get("source_path") or ""
                if not sp:
                    continue

                root = ENV_RAW_PATH if layer == "raw" else ENV_SUMMARY_PATH if layer == "summary" else None
                if root:
                    full_path = os.path.join(root, sp)
                    exists = os.path.exists(full_path)
                else:
                    exists = True

                if not exists:
                    ids_to_delete.append(_id)

            if ids_to_delete:
                bs = 5000
                for i in range(0, len(ids_to_delete), bs):
                    store.delete(ids=ids_to_delete[i:i + bs])
                deleted += len(ids_to_delete)
                logger.info(f"🧹 {coll_name}: removed ghost chunks {len(ids_to_delete)}")

        return deleted

    # [수정된 load_and_chunk 함수 앞부분]
    def load_and_chunk(
            self,
            file_path: str,
            job: JobSpec,
            chunk_policy: str,
            chunk_size: int,
            overlap: int,
            heading_levels: Set[int],
            code_attach: bool,
    ) -> Tuple[str, str, str, List[Dict[str, Any]]]:
        abs_path = norm_abs(file_path)
        layer, rel_path = rel_to_layer_and_relpath(abs_path)

        # 1. 레이어별 청킹 사이즈 자동 보정
        if layer == "raw":
            eff_chunk_size = max(chunk_size, 300)
            eff_overlap = max(overlap, 50)
        elif layer == "summary":
            eff_chunk_size = min(chunk_size, 600)
            eff_overlap = min(overlap, 50)
        else:
            eff_chunk_size = chunk_size
            eff_overlap = overlap

        try:
            raw_text = Path(abs_path).read_text(encoding="utf-8", errors="ignore")
        except Exception:
            return layer, rel_path, "", []

        fm, body = split_frontmatter(raw_text)
        meta = dict(fm) if isinstance(fm, dict) else {}
        meta.setdefault("OriginalPath", abs_path)
        meta.setdefault("Layer", layer)
        # [중요] RAG 검색 시 파일명 정확도 향상을 위해 필드 추가
        meta.setdefault("filename", os.path.basename(abs_path))

        content_hash = sha1_text(raw_text)
        blocks = parse_blocks_preserve_code(body)

        chunk_texts: List[str] = []
        for b in blocks:
            if b.kind == "code":
                # [수정됨] 자기 자신 Import 구문 삭제 -> 바로 함수 호출
                if len(b.text) > eff_chunk_size:
                    # 상단에 정의된 split_code_by_logic 함수를 바로 사용
                    code_sub_chunks = split_code_by_logic(b.text, eff_chunk_size)

                    if code_attach:
                        chunk_texts = attach_prev_paragraph_to_code(chunk_texts, code_sub_chunks[0])
                        for sub in code_sub_chunks[1:]:
                            chunk_texts.append(sub.strip())
                    else:
                        chunk_texts.extend([s.strip() for s in code_sub_chunks])
                else:
                    # 짧은 코드는 설명과 붙이기
                    if code_attach:
                        chunk_texts = attach_prev_paragraph_to_code(chunk_texts, b.text)
                    else:
                        chunk_texts.append(b.text.strip())
            else:
                # 일반 텍스트 청킹
                chunk_texts.extend(
                    policy_split_text(
                        b.text,
                        policy=chunk_policy,
                        chunk_size=eff_chunk_size,
                        overlap=eff_overlap,
                        heading_levels=heading_levels,
                    )
                )

        header = build_chunk_header(meta)
        chunk_data: List[Dict[str, Any]] = []

        for i, txt in enumerate(chunk_texts):
            full_txt = (header + "\n\n" + txt.strip()) if header else txt.strip()

            # 메타데이터 문자열 변환 (DB 에러 방지)
            m = {}
            for k, v in meta.items():
                if isinstance(v, (list, dict)):
                    m[k] = str(v)
                elif v is None:
                    m[k] = ""
                else:
                    m[k] = v

            m.update({
                "ingest_job": str(job.name),
                "layer": str(layer),
                "source_path": str(rel_path),
                "content_hash": str(content_hash),
                "chunk_index": i,
                "block_kind": "code" if txt.strip().startswith("```") else "text",
            })
            chunk_data.append({"text": full_txt, "meta": m})

        return layer, rel_path, content_hash, chunk_data

    # --- Job 단위 ingest (Callback 추가됨) ---
    def ingest_job(
            self,
            job: JobSpec,
            mode: str,
            layer: str,
            chunk_policy: str,
            chunk_size: int,
            overlap: int,
            heading_levels: Set[int],
            code_attach: bool,
            selected_files: Optional[List[str]] = None,
            callback: Optional[Callable[[str], None]] = None
    ) -> None:

        def log(msg):
            logger.info(msg)
            if callback: callback(msg)

        if not job.ingest_enabled:
            log(f"⏭️ Skip (ingest disabled): {job.name}")
            return

        dirs: List[Tuple[str, str]] = []
        eff_layer = (layer or job.default_layer or "both").lower()
        if eff_layer in ("raw", "both"):
            dirs.append(("raw", job.input_dir))
        if eff_layer in ("summary", "both"):
            dirs.append(("summary", job.output_dir))

        if mode == "reset":
            logger.warning(f"🗑️ Reset job: {job.name}")

        selected_rel = {
            str(item).replace("\\", "/").strip("/")
            for item in (selected_files or [])
            if str(item).strip()
        }
        files: List[Tuple[str, str]] = []
        for lyr, d in dirs:
            if not d or not os.path.exists(d):
                continue
            for fp in self.scan_files(d):
                if selected_rel:
                    try:
                        rel_fp = Path(fp).resolve().relative_to(Path(d).resolve()).as_posix()
                    except Exception:
                        continue
                    if rel_fp not in selected_rel:
                        continue
                files.append((lyr, fp))

        if not files:
            log(f"✅ No files found for job: {job.name}")
            return

        existing_cache: Dict[str, Dict[str, str]] = {}

        def get_existing(coll: str) -> Dict[str, str]:
            if coll in existing_cache:
                return existing_cache[coll]
            store = self.pool.get(coll)
            existing_cache[coll] = self.build_existing_index(store, job.name)
            return existing_cache[coll]

        log(f"📦 [{job.name}] Checking {len(files)} files...")
        to_process: List[Tuple[str, str]] = []
        skipped = 0

        for lyr, fp in files:
            abs_p = norm_abs(fp)
            _layer_tmp, rel_path_tmp = rel_to_layer_and_relpath(abs_p)

            try:
                text = Path(abs_p).read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue

            h = sha1_text(text)
            fm, _ = split_frontmatter(text)
            meta_coll = fm.get("Collection") if isinstance(fm, dict) else None
            coll = self.determine_collection(job, lyr, meta_coll)

            if mode == "incremental":
                idx = get_existing(coll)
                if idx.get(rel_path_tmp) == h:
                    skipped += 1
                    continue

            to_process.append((lyr, fp))

        log(f"✅ [{job.name}] To Process: {len(to_process)} / Skipped: {skipped}")

        for i, (lyr, fp) in enumerate(to_process):
            if i % 5 == 0:
                log(f"🔄 Processing {i + 1}/{len(to_process)}: {os.path.basename(fp)}")

            try:
                abs_p = norm_abs(fp)
                layer_doc, rel_path = rel_to_layer_and_relpath(abs_p)

                _layer_res, _rel_res, _hash, chunks = self.load_and_chunk(
                    fp,
                    job=job,
                    chunk_policy=chunk_policy,
                    chunk_size=chunk_size,
                    overlap=overlap,
                    heading_levels=heading_levels,
                    code_attach=code_attach,
                )
                if not chunks:
                    continue

                raw_text = Path(abs_p).read_text(encoding="utf-8", errors="ignore")
                fm, _ = split_frontmatter(raw_text)
                meta_coll = fm.get("Collection") if isinstance(fm, dict) else None
                coll = self.determine_collection(job, layer_doc, meta_coll)
                store = self.pool.get(coll)

                self.delete_file_chunks(store, job.name, rel_path)

                texts = [c["text"] for c in chunks]
                metas = [c["meta"] for c in chunks]
                base_id = sha1_text(rel_path)[:10]
                ids = [f"{base_id}_{i}" for i in range(len(chunks))]

                # [최적화] 128개씩 끊어서 저장 (Batch Insert)
                batch_size = 128
                for k in range(0, len(texts), batch_size):
                    store.add_texts(
                        texts=texts[k:k + batch_size],
                        metadatas=metas[k:k + batch_size],
                        ids=ids[k:k + batch_size],
                    )

            except Exception as e:
                log(f"⚠️ Failed ingest: {fp} | {e}")

        deleted_ghost = self.cleanup_ghosts(self.pool._stores)
        if deleted_ghost:
            log(f"🧹 Ghost cleanup deleted: {deleted_ghost}")


# ==============================================================================
# SECTION 7. UI/CLI Wrapper (run_ingest_logic)
# ==============================================================================

def run_ingest_logic(
        jobs_yaml: str = "./jobs.yaml",
        job: str = "all",
        mode: str = "incremental",
        layer: str = "both",
        policy: str = "auto",
        chunk_size: Optional[int] = None,
        overlap: Optional[int] = None,
        heading_levels: Optional[List[int]] = None,
        code_attach: bool = False,
        input_dir: str = "",
        output_dir: str = "",
        selected_files: Optional[List[str]] = None,
        callback: Optional[Callable[[str], None]] = None
) -> str:
    def log(msg):
        if callback:
            callback(msg)

    log(f"?? Ingest start | job={job} | mode={mode}")

    try:
        jobs, _ = load_jobs(jobs_yaml)
        engine = IngestEngine(db_root=ENV_DB_ROOT)

        cs = ensure_50_step(chunk_size, default=800)
        ov = ensure_50_step(overlap, default=100)

        levels = {1, 2, 3}
        if heading_levels:
            try:
                levels = {int(x) for x in heading_levels}
            except Exception:
                pass

        selected_files = list(selected_files or [])
        manual_override = bool(input_dir or output_dir or selected_files)

        if manual_override:
            base_job = jobs.get(job) if job != "all" else None
            name_seed = base_job.name if base_job else (Path(input_dir or output_dir or "manual_selection").name or "manual_selection")
            safe_name = re.sub(r"[^a-zA-Z0-9_\-]+", "_", name_seed).strip("_") or "manual_selection"
            target_jobs = [JobSpec(
                name=name_seed,
                input_dir=resolve_env_path(input_dir) if input_dir else (base_job.input_dir if base_job else ""),
                output_dir=resolve_env_path(output_dir) if output_dir else (base_job.output_dir if base_job else ""),
                ingest_enabled=True,
                default_layer=(base_job.default_layer if base_job else (layer or "both")),
                collection_raw=(base_job.collection_raw if base_job and base_job.collection_raw else safe_name),
                collection_summary=(base_job.collection_summary if base_job and base_job.collection_summary else "summary"),
            )]
        elif job == "all":
            target_jobs = list(jobs.values())
        else:
            if job not in jobs:
                log(f"? Job not found: {job}")
                return f"? Job not found: {job}"
            target_jobs = [jobs[job]]

        if mode == "cleanup":
            deleted = engine.cleanup_ghosts(engine.pool._stores)
            msg = f"?? Cleanup done. Deleted: {deleted}"
            log(msg)
            return msg

        for j in target_jobs:
            log(f"?? Job: {j.name}")
            engine.ingest_job(
                job=j,
                mode=mode,
                layer=layer,
                chunk_policy=policy,
                chunk_size=cs,
                overlap=ov,
                heading_levels=levels,
                code_attach=code_attach,
                selected_files=selected_files,
                callback=callback,
            )

        log("? Ingest Done")
        return "Done"

    except Exception as e:
        logger.exception("Ingest error")
        log(f"? Error: {e}")
        return f"Error: {e}"


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--job", default="all")
    parser.add_argument("--mode", default="incremental")
    parser.add_argument("--layer", default="both")
    parser.add_argument("--policy", default="auto")
    parser.add_argument("--chunk_size", type=int, default=800)
    parser.add_argument("--overlap", type=int, default=100)
    parser.add_argument("--heading_levels", default="1,2,3")
    args = parser.parse_args()

    try:
        hl = [int(x.strip()) for x in args.heading_levels.split(",") if x.strip().isdigit()]
    except Exception:
        hl = [1, 2, 3]

    print(
        run_ingest_logic(job=args.job, mode=args.mode, layer=args.layer, policy=args.policy, chunk_size=args.chunk_size,
                         overlap=args.overlap, heading_levels=hl))
