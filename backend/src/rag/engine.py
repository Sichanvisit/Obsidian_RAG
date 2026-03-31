import os
import re
import math
import logging
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

EmbeddingModel = None
try:
    from langchain_huggingface import HuggingFaceEmbeddings
    EmbeddingModel = HuggingFaceEmbeddings
except Exception:
    try:
        from sentence_transformers import SentenceTransformer

        class SentenceTransformerWrapper:
            def __init__(self, model_name: str, **kwargs):
                self.model = SentenceTransformer(model_name)

            def embed_query(self, text: str) -> List[float]:
                return self.model.encode(text, normalize_embeddings=True).tolist()

            def embed_documents(self, texts: List[str]) -> List[List[float]]:
                return self.model.encode(texts, normalize_embeddings=True).tolist()

        EmbeddingModel = SentenceTransformerWrapper
    except Exception:
        EmbeddingModel = None

try:
    from backend.config.paths import VECTOR_DB_DIR, VECTOR_DB_PATH, OBSIDIAN_ROOT
    from backend.src.schemas import RagDocument
    from backend.src.enums import LayerType
    from backend.src.constants import DEFAULT_EMBEDDING_MODEL, SEARCH_K
except ImportError:
    from config.paths import VECTOR_DB_DIR, VECTOR_DB_PATH, OBSIDIAN_ROOT
    from src.schemas import RagDocument
    from src.enums import LayerType
    from src.constants import DEFAULT_EMBEDDING_MODEL, SEARCH_K

logger = logging.getLogger("RagEngine")


class SimpleBM25:
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.doc_freqs: Dict[str, int] = {}
        self.doc_lens: List[int] = []
        self.avg_doc_len = 1.0
        self.corpus_size = 0
        self.doc_term_freqs: List[Counter] = []

    def _tokenize(self, text: str) -> List[str]:
        text = re.sub(r"[^\w\s가-힣]", " ", (text or "").lower())
        tokens = text.split()
        stopwords = {
            "은", "는", "이", "가", "을", "를", "에", "의", "도", "과", "와", "에서",
            "the", "a", "an", "is", "are", "was", "were", "be", "been",
            "그", "저", "것", "수", "등", "및", "또한", "그리고", "하지만",
        }
        return [t for t in tokens if t not in stopwords and len(t) > 1]

    def fit(self, documents: List[str]) -> None:
        self.corpus_size = len(documents)
        self.doc_lens = []
        self.doc_term_freqs = []
        self.doc_freqs = {}

        for doc in documents:
            tokens = self._tokenize(doc)
            self.doc_lens.append(len(tokens))
            term_freq = Counter(tokens)
            self.doc_term_freqs.append(term_freq)
            for term in set(tokens):
                self.doc_freqs[term] = self.doc_freqs.get(term, 0) + 1

        if self.doc_lens:
            self.avg_doc_len = sum(self.doc_lens) / len(self.doc_lens)

    def get_scores(self, query: str) -> List[float]:
        query_tokens = self._tokenize(query)
        scores = []

        for i, term_freq in enumerate(self.doc_term_freqs):
            score = 0.0
            doc_len = self.doc_lens[i] if i < len(self.doc_lens) else 1
            for term in query_tokens:
                if term not in term_freq:
                    continue
                tf = term_freq[term]
                df = self.doc_freqs.get(term, 0)
                idf = math.log((self.corpus_size - df + 0.5) / (df + 0.5) + 1)
                numerator = tf * (self.k1 + 1)
                denominator = tf + self.k1 * (1 - self.b + self.b * (doc_len / max(self.avg_doc_len, 1e-9)))
                score += idf * (numerator / max(denominator, 1e-9))
            scores.append(score)

        return scores

    def get_top_k(self, query: str, k: int = 10) -> List[Tuple[int, float]]:
        scored = list(enumerate(self.get_scores(query)))
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:k]


FOLDER_MAPPING = {
    "초급": "99_Projects_Archive__01_초급_Proj",
    "초보": "99_Projects_Archive__01_초급_Proj",
    "입문": "99_Projects_Archive__01_초급_Proj",
    "01_초급": "99_Projects_Archive__01_초급_Proj",
    "중급": "99_Projects_Archive__02_중급_Proj",
    "02_중급": "99_Projects_Archive__02_중급_Proj",
    "고급": "99_Projects_Archive__03_Second_Brain_RAG",
    "secondbrain": "99_Projects_Archive__03_Second_Brain_RAG",
    "second brain": "99_Projects_Archive__03_Second_Brain_RAG",
    "인공지능브레인": "99_Projects_Archive__03_Second_Brain_RAG",
    "03_고급": "99_Projects_Archive__03_Second_Brain_RAG",
    "cfd": "99_Projects_Archive__04_CFD_Analysis",
    "유체": "99_Projects_Archive__04_CFD_Analysis",
    "python": "01_Python_Core",
    "머신러닝": "11_Machine_Learning",
    "ml": "11_Machine_Learning",
    "딥러닝": "12_Deep_Learning",
    "dl": "12_Deep_Learning",
    "llm": "13_LLM_GenAI",
    "genai": "13_LLM_GenAI",
    "langchain": "13_LLM_GenAI",
}

PROJECT_PATTERNS = {
    "초급": ["01_초급", "초급_proj"],
    "중급": ["02_중급", "중급_proj"],
    "second_brain": ["03_second", "second_brain"],
    "cfd": ["04_cfd", "cfd_"],
    "llm": ["13_llm", "llm_genai", "llm_code"],
}

RAW_DB_FOLDER_ALIASES = {
    "초급": "99_Projects_Archive__01_초급_Proj",
    "01_초급": "99_Projects_Archive__01_초급_Proj",
    "중급": "99_Projects_Archive__02_중급_Proj",
    "02_중급": "99_Projects_Archive__02_중급_Proj",
    "second": "99_Projects_Archive__03_Second_Brain_RAG",
    "brain": "99_Projects_Archive__03_Second_Brain_RAG",
    "03_": "99_Projects_Archive__03_Second_Brain_RAG",
    "cfd": "99_Projects_Archive__04_CFD_Analysis",
    "04_": "99_Projects_Archive__04_CFD_Analysis",
}

PROJECT_ARCHIVE_PATHS = {
    "초급": "01_초급_Proj",
    "중급": "02_중급_Proj",
    "second": "03_Second_Brain_RAG",
    "cfd": "04_CFD_Analysis",
}


class RagEngine:
    def __init__(self):
        logger.info("RAG engine initializing...")

        disable_embeddings = os.getenv("RAG_DISABLE_EMBEDDINGS", "0").lower() in {"1", "true", "yes", "on"}
        proxy_vars = [
            os.getenv("HTTPS_PROXY", ""),
            os.getenv("https_proxy", ""),
            os.getenv("HTTP_PROXY", ""),
            os.getenv("http_proxy", ""),
        ]
        has_blackhole_proxy = any("127.0.0.1:9" in p or "localhost:9" in p for p in proxy_vars if p)
        if has_blackhole_proxy and not disable_embeddings:
            logger.warning("Blackhole proxy detected. Embeddings disabled.")
            disable_embeddings = True

        self.embeddings = None
        if not disable_embeddings and EmbeddingModel:
            try:
                self.embeddings = EmbeddingModel(
                    model_name=DEFAULT_EMBEDDING_MODEL,
                    model_kwargs={"device": "cpu"},
                    encode_kwargs={"normalize_embeddings": True},
                )
                logger.info("Embedding model loaded: %s", DEFAULT_EMBEDDING_MODEL)
            except Exception as e:
                logger.warning("Embedding model load failed, fallback to Chroma text query: %s", e)

        self.bm25: Optional[SimpleBM25] = None
        self.bm25_docs: List[Dict[str, Any]] = []
        self.summary_db = self._init_summary_db()
        self._init_bm25_index()
        self.raw_files = self._collect_raw_files()
        self.raw_file_map = self._build_raw_file_index(self.raw_files)
        self.available_folders = self._scan_available_folders()

    @staticmethod
    def _normalize_link_name(link: str) -> str:
        link_clean = (link or "").strip()
        if "/" in link_clean:
            link_clean = link_clean.split("/")[-1]
        if "\\" in link_clean:
            link_clean = link_clean.split("\\")[-1]
        if link_clean.lower().endswith(".md"):
            link_clean = link_clean[:-3]
        return link_clean.lower().strip()

    @staticmethod
    def _normalize_reference_token(value: str) -> str:
        token = (value or "").strip().replace("\\", "/")
        if "/" in token:
            token = token.split("/")[-1]
        token = re.sub(r"\.[a-z0-9]{1,8}$", "", token, flags=re.IGNORECASE)
        token = re.sub(r"[^\w가-힣]+", " ", token.lower())
        token = re.sub(r"\s+", " ", token).strip()
        return token

    @classmethod
    def _reference_variants(cls, value: str) -> List[str]:
        raw_value = (value or "").strip().replace("\\", "/")
        if not raw_value:
            return []
        basename = raw_value.split("/")[-1]
        base_no_md = basename[:-3] if basename.lower().endswith(".md") else basename
        base_stem = Path(base_no_md).stem if "." in base_no_md else base_no_md
        variants = {
            cls._normalize_reference_token(basename),
            cls._normalize_reference_token(base_no_md),
            cls._normalize_reference_token(base_stem),
            cls._normalize_reference_token(base_no_md.replace("_", " ")),
            cls._normalize_reference_token(base_no_md.replace("-", " ")),
            cls._normalize_reference_token(base_stem.replace("_", " ")),
            cls._normalize_reference_token(base_stem.replace("-", " ")),
        }
        return [variant for variant in dict.fromkeys(variants) if variant]

    @classmethod
    def _score_reference_match(cls, reference_variants: List[str], candidate: str) -> int:
        if not reference_variants:
            return 0
        candidate_norm = cls._normalize_reference_token(candidate)
        if not candidate_norm:
            return 0

        best = 0
        candidate_tokens = set(candidate_norm.split())
        for variant in reference_variants:
            if not variant:
                continue
            if candidate_norm == variant:
                return 100
            if len(variant) >= 4 and (variant in candidate_norm or candidate_norm in variant):
                best = max(best, 80)
            variant_tokens = set(variant.split())
            overlap = candidate_tokens & variant_tokens
            if len(overlap) >= 2:
                best = max(best, 60)
            elif len(overlap) == 1:
                token = next(iter(overlap))
                if len(token) >= 4:
                    best = max(best, 40)
        return best

    @staticmethod
    def _parse_string_list(value: Any) -> List[str]:
        if not value:
            return []
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            try:
                import ast

                parsed = ast.literal_eval(stripped)
                if parsed is not value:
                    return RagEngine._parse_string_list(parsed)
            except Exception:
                pass
            return [item.strip() for item in re.split(r"[\n,]+", stripped) if item.strip()]
        if isinstance(value, (list, tuple, set)):
            output: List[str] = []
            for item in value:
                output.extend(RagEngine._parse_string_list(item))
            return output
        if isinstance(value, dict):
            output: List[str] = []
            for item in value.values():
                output.extend(RagEngine._parse_string_list(item))
            return output
        return []

    @staticmethod
    def _extract_query_keywords(query: str) -> List[str]:
        query_lower = (query or "").lower()
        keywords = [w for w in re.findall(r"\w+", query_lower) if len(w) > 1]

        normalized = set()
        for w in keywords:
            if "프로젝트" in w:
                normalized.add("프로젝트")
            if "중급" in w:
                normalized.add("중급")
            if "초급" in w:
                normalized.add("초급")
            if "고급" in w:
                normalized.add("고급")
            if "발표" in w:
                normalized.add("발표")
            if "과제" in w:
                normalized.add("과제")
            if "작업" in w:
                normalized.add("작업")
        if re.search(r"\d+팀", query_lower) or "팀" in query_lower:
            normalized.update({"팀", "팀별", "발표"})

        keywords.extend(sorted(normalized))
        return list(dict.fromkeys(keywords))

    @staticmethod
    def _get_doc_filename(metadata: Dict[str, Any]) -> str:
        if not isinstance(metadata, dict):
            return ""
        candidate = (
            metadata.get("filename")
            or metadata.get("source_path")
            or metadata.get("rel_path")
            or metadata.get("title")
            or ""
        )
        return Path(str(candidate)).name if candidate else ""

    @staticmethod
    def _get_doc_source_path(metadata: Dict[str, Any]) -> str:
        if not isinstance(metadata, dict):
            return ""
        candidate = (
            metadata.get("source_path")
            or metadata.get("rel_path")
            or metadata.get("OriginalPath")
            or metadata.get("filename")
            or metadata.get("title")
            or ""
        )
        if not candidate:
            return ""
        return str(candidate).replace("\\", "/")

    @staticmethod
    def _read_text_safe(path: Path) -> str:
        # Try common Korean/UTF encodings before falling back to lossy read.
        for enc in ("utf-8", "utf-8-sig", "cp949", "euc-kr"):
            try:
                return path.read_text(encoding=enc)
            except Exception:
                continue
        return path.read_text(encoding="utf-8", errors="ignore")

    @staticmethod
    def _resolve_raw_db_name(folder: str) -> Optional[str]:
        folder_lower = (folder or "").lower()
        for key, db_name in RAW_DB_FOLDER_ALIASES.items():
            if key in folder_lower:
                return db_name
        return None

    @staticmethod
    def _detect_requested_project(folder_name: str) -> Optional[str]:
        folder_lower = (folder_name or "").lower()
        for proj, patterns in PROJECT_PATTERNS.items():
            if any(p in folder_lower for p in patterns):
                return proj
        return None

    @staticmethod
    def _is_same_project(filename: str, requested_project: Optional[str]) -> bool:
        if not requested_project:
            return True
        if not filename:
            return True
        patterns = PROJECT_PATTERNS.get(requested_project, [])
        filename_lower = filename.lower()
        return any(p in filename_lower for p in patterns)

    @staticmethod
    def _extract_retrieval_tags(tags_raw: Any) -> List[str]:
        tags = RagEngine._parse_string_list(tags_raw)
        output: List[str] = []
        for tag in tags:
            if not isinstance(tag, str):
                continue
            if tag.startswith("S/") or tag.startswith("T/") or tag.startswith("D/Project/"):
                output.append(tag)
                continue
            if tag.startswith("C/") and "/" in tag[2:]:
                output.append(tag)
        return list(dict.fromkeys(output))

    def _extract_related_files(self, metadata: Dict[str, Any]) -> List[str]:
        if not isinstance(metadata, dict):
            return []
        candidates: List[str] = []
        for key in ("related_files", "relatedFiles", "reference_files", "referenceFiles"):
            candidates.extend(self._parse_string_list(metadata.get(key)))
        return list(dict.fromkeys([candidate for candidate in candidates if candidate]))

    def _resolve_project_path(self, folder: str) -> Optional[Path]:
        folder_lower = (folder or "").lower()
        project_suffix = None
        if "초급" in folder or "01_초급" in folder:
            project_suffix = PROJECT_ARCHIVE_PATHS["초급"]
        elif "중급" in folder or "02_중급" in folder:
            project_suffix = PROJECT_ARCHIVE_PATHS["중급"]
        elif "second" in folder_lower or "brain" in folder_lower or "03_" in folder:
            project_suffix = PROJECT_ARCHIVE_PATHS["second"]
        elif "cfd" in folder_lower or "04_" in folder:
            project_suffix = PROJECT_ARCHIVE_PATHS["cfd"]
        if not project_suffix:
            return None

        if OBSIDIAN_ROOT and OBSIDIAN_ROOT.exists():
            candidate = OBSIDIAN_ROOT / "10_AI_Engineering" / "99_Projects_Archive" / project_suffix
            if candidate.exists():
                return candidate

        fallback = Path("C:/Users/bhs33/Desktop/옵시디언(시찬)/Sichan/10_AI_Engineering/99_Projects_Archive") / project_suffix
        if fallback.exists():
            return fallback
        return None

    def _init_summary_db(self):
        try:
            import chromadb
            if not VECTOR_DB_PATH.exists():
                logger.warning("Summary DB path not found: %s", VECTOR_DB_PATH)
                return None
            client = chromadb.PersistentClient(path=str(VECTOR_DB_PATH))
            col = client.get_collection("langchain")
            logger.info("Summary DB loaded: %s docs", col.count())
            return col
        except Exception as e:
            logger.warning("Summary DB init failed: %s", e)
            return None

    def _init_bm25_index(self):
        if not self.summary_db:
            return
        try:
            all_data = self.summary_db.get(include=["documents", "metadatas"])
            docs = all_data.get("documents", []) if all_data else []
            metas = all_data.get("metadatas", []) if all_data else []
            if not docs:
                return
            self.bm25_docs = []
            for i, text in enumerate(docs):
                meta = metas[i] if i < len(metas) else {}
                self.bm25_docs.append({"text": text or "", "metadata": meta or {}, "index": i})
            self.bm25 = SimpleBM25()
            self.bm25.fit([d["text"] for d in self.bm25_docs])
            logger.info("BM25 index built: %s docs", len(self.bm25_docs))
        except Exception as e:
            logger.warning("BM25 init failed: %s", e)

    def _collect_raw_files(self) -> List[Path]:
        files: List[Path] = []
        search_paths = [
            OBSIDIAN_ROOT,
            Path("C:/Users/bhs33/Desktop/옵시디언(시찬)/Sichan"),
        ]
        for root in search_paths:
            if not root or not root.exists():
                continue
            try:
                for file_path in root.rglob("*.md"):
                    if "11_RAG_Knowledge_Base" in str(file_path):
                        continue
                    files.append(file_path)
            except Exception as e:
                logger.debug("Raw index build failed at %s: %s", root, e)
        return files

    def _build_raw_file_index(self, files: Optional[List[Path]] = None) -> Dict[str, Path]:
        file_map: Dict[str, Path] = {}
        for file_path in files or []:
            key = file_path.stem.lower()
            file_map.setdefault(key, file_path)
        return file_map

    def _scan_available_folders(self) -> List[str]:
        raw_db_path = VECTOR_DB_DIR / "raw"
        if not raw_db_path.exists():
            return list(FOLDER_MAPPING.values())
        folders = [p.name for p in raw_db_path.iterdir() if p.is_dir()]
        return folders if folders else list(FOLDER_MAPPING.values())

    def _detect_main_folder(self, query: str) -> Tuple[str, float]:
        q = (query or "").lower()
        for keyword, folder in FOLDER_MAPPING.items():
            if keyword in q:
                return folder, 0.9
        return "13_LLM_GenAI", 0.3

    def _folder_hint_patterns(self, folder_hint: str) -> List[str]:
        if not folder_hint:
            return []
        patterns = [folder_hint.lower()]
        resolved = self._resolve_raw_db_name(folder_hint)
        if resolved:
            patterns.append(resolved.lower())
        return list(dict.fromkeys(patterns))

    def _find_raw_file(self, link: str, folder_hint: str = "") -> Optional[Path]:
        if not link:
            return None
        reference_variants = self._reference_variants(link)
        if not reference_variants:
            return None
        files = self.raw_files if self.raw_files else list(self.raw_file_map.values())
        hint_patterns = self._folder_hint_patterns(folder_hint)

        def by_hint(path: Path) -> bool:
            if not hint_patterns:
                return True
            path_l = str(path).lower()
            return any(h in path_l for h in hint_patterns)

        best_hint: Optional[Tuple[int, Path]] = None
        best_global: Optional[Tuple[int, Path]] = None
        for p in files:
            match_score = self._score_reference_match(reference_variants, p.stem)
            if match_score <= 0:
                continue
            if by_hint(p) and (best_hint is None or match_score > best_hint[0]):
                best_hint = (match_score, p)
            if best_global is None or match_score > best_global[0]:
                best_global = (match_score, p)

        if best_hint and best_hint[0] >= 40:
            return best_hint[1]
        if best_global and best_global[0] >= 80:
            return best_global[1]
        return None

    def _search_raw_db_by_link(self, link: str, folder_hint: str) -> Optional[RagDocument]:
        if not link or not folder_hint:
            return None
        reference_variants = self._reference_variants(link)
        if not reference_variants:
            return None
        raw_db_path = VECTOR_DB_DIR / "raw" / folder_hint
        if not raw_db_path.exists():
            return None
        try:
            import chromadb
            client = chromadb.PersistentClient(path=str(raw_db_path))
            col = client.get_collection("langchain")
            data = col.get(include=["documents", "metadatas"])
            docs = data.get("documents", [])
            metas = data.get("metadatas", [])
            best_idx = None
            best_score = 0
            for i, meta in enumerate(metas):
                source_rel = self._get_doc_source_path(meta or {})
                filename = self._get_doc_filename(meta or {})
                stem = Path(source_rel or filename).stem
                match_score = self._score_reference_match(reference_variants, stem)
                if match_score > best_score:
                    best_score = match_score
                    best_idx = i
            if best_idx is not None and best_score >= 40:
                meta = metas[best_idx] or {}
                source_rel = self._get_doc_source_path(meta)
                filename = self._get_doc_filename(meta)
                text = docs[best_idx] if best_idx < len(docs) else ""
                return RagDocument(
                    page_content=(text or "")[:4000],
                    source_path=source_rel or filename or f"{reference_variants[0]}.md",
                    layer=LayerType.RAW,
                    score=0.9 if best_score >= 80 else 0.8,
                    metadata={"from_link_db": True, "folder": folder_hint, "is_main": True},
                )
        except Exception as e:
            logger.debug("Raw DB link search failed: %s", e)
        return None

    def _resolve_reference_raw(
        self,
        reference: str,
        folder_hints: List[str],
        base_score: float,
        query_keywords: List[str],
        collected_tags: List[str],
        source_type: str,
        retrieval_reason: str,
        is_main: bool,
    ) -> Optional[RagDocument]:
        for hint in folder_hints:
            raw_doc = self._search_raw_db_by_link(reference, hint)
            if raw_doc:
                raw_doc.score = max(float(raw_doc.score or 0.0), base_score)
                raw_doc.metadata = {
                    **(raw_doc.metadata or {}),
                    "folder": hint,
                    "is_main": is_main,
                    "tags": collected_tags,
                    "source_type": source_type,
                    "retrieval_reason": retrieval_reason,
                }
                return raw_doc

        raw_path = None
        raw_hint = folder_hints[0] if folder_hints else ""
        for hint in folder_hints or [""]:
            candidate = self._find_raw_file(reference, folder_hint=hint)
            if candidate and candidate.exists():
                raw_path = candidate
                raw_hint = hint
                break

        if not raw_path or not raw_path.exists():
            return None

        content = self._read_text_safe(raw_path)
        filename_lower = raw_path.name.lower()
        keyword_bonus = 0.0
        if any(keyword.lower() in filename_lower for keyword in query_keywords):
            keyword_bonus = 0.08

        return RagDocument(
            page_content=content[:4000],
            source_path=str(raw_path).replace("\\", "/"),
            layer=LayerType.RAW,
            score=min(1.0, base_score + keyword_bonus),
            metadata={
                "is_main": is_main,
                "folder": raw_hint,
                "tags": collected_tags,
                "source_type": source_type,
                "retrieval_reason": retrieval_reason,
            },
        )

    def _collect_folder_hints(self, default_folder: str, metadata: Dict[str, Any]) -> List[str]:
        hints: List[str] = []

        def add_hint(value: str):
            if not value:
                return
            if value not in hints:
                hints.append(value)
            resolved = self._resolve_raw_db_name(value)
            if resolved and resolved not in hints:
                hints.append(resolved)

        add_hint(default_folder)
        if not isinstance(metadata, dict):
            return hints

        for k in ("folder", "collection", "Collection"):
            v = metadata.get(k, "")
            if isinstance(v, str) and v.strip():
                add_hint(v.strip())

        for path_k in ("source_path", "rel_path", "OriginalPath"):
            raw_path = metadata.get(path_k, "")
            if not isinstance(raw_path, str) or not raw_path:
                continue
            for seg in re.split(r"[\\/]", raw_path):
                seg = seg.strip()
                if not seg:
                    continue
                if seg in self.available_folders or self._resolve_raw_db_name(seg):
                    add_hint(seg)

        return hints

    def _search_raw_db_by_keyword(self, folder: str, keywords: List[str], seen: set) -> List[RagDocument]:
        results: List[RagDocument] = []
        if not folder or not keywords:
            return results

        raw_db_name = self._resolve_raw_db_name(folder)
        if not raw_db_name:
            return results

        raw_db_path = VECTOR_DB_DIR / "raw" / raw_db_name
        if not raw_db_path.exists():
            return results

        try:
            import chromadb
            client = chromadb.PersistentClient(path=str(raw_db_path))
            col = client.get_collection("langchain")
            data = col.get(include=["documents", "metadatas"])

            file_chunks: Dict[str, Dict[str, Any]] = {}
            docs = data.get("documents", [])
            metas = data.get("metadatas", [])
            for doc_text, meta in zip(docs, metas):
                meta = meta or {}
                source_rel = self._get_doc_source_path(meta)
                filename = self._get_doc_filename(meta)
                source_key = (source_rel or filename).lower()
                if source_key in seen or Path(source_key).stem.lower() in seen:
                    continue

                doc_lower = (doc_text or "").lower()
                score = 0.0
                matched = []

                for kw in keywords:
                    kw_l = kw.lower()
                    if kw_l in source_key:
                        score += 0.5
                        matched.append(f"{kw}(filename)")
                    elif kw_l in doc_lower:
                        score += 0.2
                        matched.append(f"{kw}(content)")

                if score <= 0 and source_key in file_chunks:
                    continue

                if source_key not in file_chunks:
                    file_chunks[source_key] = {
                        "source_path": source_rel or filename,
                        "texts": [],
                        "score": 0.0,
                        "matched": [],
                    }

                if doc_text and doc_text not in file_chunks[source_key]["texts"]:
                    file_chunks[source_key]["texts"].append(doc_text)

                if score > file_chunks[source_key]["score"]:
                    file_chunks[source_key]["score"] = score
                    file_chunks[source_key]["matched"] = matched

            for info in file_chunks.values():
                if info["score"] < 0.4:
                    continue
                combined = "\n\n".join(info["texts"])[:15000]
                results.append(
                    RagDocument(
                        page_content=combined,
                        source_path=info["source_path"],
                        layer=LayerType.RAW,
                        score=info["score"],
                        metadata={
                            "from_keyword_search": True,
                            "matched_keywords": info["matched"],
                            "folder": folder,
                            "is_main": True,
                            "chunk_count": len(info["texts"]),
                            "source_type": "keyword",
                            "retrieval_reason": f"Matched raw chunks by query keywords: {', '.join(info['matched'])}.",
                        },
                    )
                )

            results.sort(key=lambda x: x.score, reverse=True)
            return results[:5]
        except Exception as e:
            logger.warning("Raw keyword search failed: %s", e)
            return []

    def _find_raw_by_folder_keyword(self, folder: str, seen: set, query: str = "") -> List[RagDocument]:
        results: List[RagDocument] = []
        project_path = self._resolve_project_path(folder)
        if not project_path or not project_path.exists():
            return results

        query_keywords = self._extract_query_keywords(query)
        files = list(project_path.rglob("*.md"))

        def priority(fp: Path) -> int:
            fname = fp.name.lower()
            score = 0
            for kw in query_keywords:
                if kw in fname:
                    score += 10
            if "팀별" in fname:
                score += 20
            return -score

        for file_path in sorted(files, key=priority):
            if file_path.name.lower() in seen or file_path.stem.lower() in seen:
                continue
            if "summary" in file_path.name.lower() or "roadmap" in file_path.name.lower():
                continue
            try:
                content = self._read_text_safe(file_path)
                if len(content) < 50:
                    continue
                score = 0.8
                fname_l = file_path.name.lower()
                if any(kw in fname_l for kw in query_keywords):
                    score = 1.0
                results.append(
                    RagDocument(
                        page_content=content[:4000],
                        source_path=str(file_path.relative_to(project_path)).replace("\\", "/"),
                        layer=LayerType.RAW,
                        score=score,
                        metadata={
                            "from_folder_search": True,
                            "is_main": True,
                            "folder": folder,
                            "full_path": str(file_path),
                            "source_type": "folder",
                            "retrieval_reason": f"Added from project folder fallback under {folder}.",
                        },
                    )
                )
                seen.add(file_path.name.lower())
                if len(results) >= 12:
                    break
            except Exception:
                continue
        return results

    def search(self, query: str, k: int = SEARCH_K) -> List[RagDocument]:
        documents: List[RagDocument] = []
        seen_sources = set()
        collected_tags: List[str] = []
        linked_raw_count = 0

        main_folder, confidence = self._detect_main_folder(query)
        logger.info("Search main folder: %s (%.2f)", main_folder, confidence)
        query_keywords = self._extract_query_keywords(query)

        embedding_results: List[dict] = []
        bm25_results: List[dict] = []

        if self.summary_db:
            if self.embeddings:
                try:
                    q_emb = self.embeddings.embed_query(query)
                    emb = self.summary_db.query(
                        query_embeddings=[q_emb],
                        n_results=max(k * 5, 20),
                        include=["documents", "metadatas", "distances"],
                    )
                    docs = emb.get("documents", [[]])[0] if emb else []
                    metas = emb.get("metadatas", [[]])[0] if emb else []
                    dists = emb.get("distances", [[]])[0] if emb else []
                    for i, doc_text in enumerate(docs):
                        meta = metas[i] if i < len(metas) else {}
                        distance = dists[i] if i < len(dists) else 0.5
                        score = max(0.0, min(1.0, 1.0 - (distance / 2.0)))
                        embedding_results.append({"text": doc_text or "", "metadata": meta or {}, "emb_score": score, "rank": i + 1})
                except Exception as e:
                    logger.warning("Summary embedding search failed (BM25-only fallback): %s", e)

            if self.bm25 and self.bm25_docs:
                bm25_query = f"{query} {' '.join(query_keywords)}".strip()
                bm25_top = self.bm25.get_top_k(bm25_query, k=max(k * 5, 20))
                max_bm25 = max((s for _, s in bm25_top), default=1.0)
                for rank, (idx, bm25_score) in enumerate(bm25_top):
                    doc_info = self.bm25_docs[idx]
                    bm25_results.append({
                        "text": doc_info["text"],
                        "metadata": doc_info["metadata"],
                        "bm25_score": (bm25_score / max_bm25) if max_bm25 > 0 else 0.0,
                        "rank": rank + 1,
                    })

        fused_results = self._reciprocal_rank_fusion(embedding_results, bm25_results, k=60)
        max_fused = max((r.get("fused_score", 0.0) for r in fused_results), default=0.0)

        requested_project = self._detect_requested_project(main_folder)

        for result in fused_results:
            doc_text = result.get("text", "")
            metadata = result.get("metadata", {}) or {}
            source_rel = self._get_doc_source_path(metadata)
            filename = Path(source_rel).name if source_rel else self._get_doc_filename(metadata)
            filename_lower = filename.lower()
            source_rel_lower = source_rel.lower()
            doc_lower = doc_text.lower()

            base_score = result.get("fused_score", 0.0)
            base_score = (base_score / max_fused) if max_fused > 0 else base_score

            keyword_boost = 0.0
            for kw in query_keywords:
                if kw in filename_lower:
                    keyword_boost += 0.3
                elif kw in doc_lower:
                    keyword_boost += 0.1

            score = base_score + keyword_boost

            target_for_project = source_rel_lower or filename_lower
            if requested_project and target_for_project and not self._is_same_project(target_for_project, requested_project):
                continue
            if score < 0.15:
                continue

            source_key = source_rel_lower or (Path(filename).stem.lower() if filename else doc_lower[:80])
            if source_key in seen_sources:
                continue
            seen_sources.add(source_key)

            summary_source = source_rel or filename or "unknown_summary.md"
            summary_folder = metadata.get("folder") if isinstance(metadata.get("folder"), str) else ""
            if not summary_folder:
                summary_folder = main_folder
            documents.append(
                RagDocument(
                    page_content=doc_text,
                    source_path=f"[Summary] {summary_source}",
                    layer=LayerType.SUMMARY,
                    score=score,
                    metadata={
                        **metadata,
                        "is_main": True,
                        "folder": summary_folder,
                        "source_type": "summary",
                        "retrieval_reason": f"Matched summary evidence from {Path(summary_source).name}.",
                    },
                )
            )

            for tag in self._extract_retrieval_tags(metadata.get("tags", "")):
                if tag not in collected_tags:
                    collected_tags.append(tag)

            links = re.findall(r"\[\[([^\]]+)\]\]", doc_text)
            folder_hints = self._collect_folder_hints(main_folder, metadata)
            for link in links[:12]:
                link_name = self._normalize_link_name(link)
                if link_name in seen_sources:
                    continue

                raw_doc = self._resolve_reference_raw(
                    reference=link,
                    folder_hints=folder_hints or [main_folder],
                    base_score=score,
                    query_keywords=query_keywords,
                    collected_tags=collected_tags,
                    source_type="links",
                    retrieval_reason=f"Expanded raw note from summary wiki link [[{link}]] in {Path(summary_source).name}.",
                    is_main=True,
                )
                if raw_doc:
                    documents.append(raw_doc)
                    seen_sources.add(link_name)
                    seen_sources.add(raw_doc.source_path.lower())
                    linked_raw_count += 1

            related_files = self._extract_related_files(metadata)
            for related_file in related_files[:16]:
                related_key = self._normalize_reference_token(related_file)
                if not related_key or related_key in seen_sources:
                    continue
                raw_doc = self._resolve_reference_raw(
                    reference=related_file,
                    folder_hints=folder_hints or [main_folder],
                    base_score=max(0.45, score * 0.92),
                    query_keywords=query_keywords,
                    collected_tags=collected_tags,
                    source_type="related_files",
                    retrieval_reason=f"Expanded raw note from related_files entry {related_file} in {Path(summary_source).name}.",
                    is_main=False,
                )
                if raw_doc:
                    documents.append(raw_doc)
                    seen_sources.add(related_key)
                    seen_sources.add(raw_doc.source_path.lower())
                    linked_raw_count += 1

            if not links and not related_files:
                for raw_doc in self._find_raw_by_folder_keyword(main_folder, seen_sources, query)[:8]:
                    documents.append(raw_doc)
                    seen_sources.add(raw_doc.source_path.lower())

        if linked_raw_count == 0:
            for raw_doc in self._search_raw_db_by_keyword(main_folder, query_keywords, seen_sources):
                documents.append(raw_doc)
                seen_sources.add(raw_doc.source_path.lower())

        if not documents and main_folder:
            documents.extend(self._find_raw_by_folder_keyword(main_folder, seen_sources, query))

        documents = sorted(documents, key=lambda x: x.score, reverse=True)
        if documents and collected_tags:
            documents[0].metadata["collected_tags"] = collected_tags
        return documents

    def _reciprocal_rank_fusion(self, emb_results: List[dict], bm25_results: List[dict], k: int = 60) -> List[dict]:
        fused_scores: Dict[str, float] = {}
        doc_map: Dict[str, dict] = {}

        for result in emb_results:
            key = self._get_doc_filename(result.get("metadata", {})) or result.get("text", "")[:120]
            fused_scores[key] = fused_scores.get(key, 0.0) + (1.0 / (k + result.get("rank", 1)))
            doc_map.setdefault(key, result)

        for result in bm25_results:
            key = self._get_doc_filename(result.get("metadata", {})) or result.get("text", "")[:120]
            fused_scores[key] = fused_scores.get(key, 0.0) + (1.0 / (k + result.get("rank", 1)))
            doc_map.setdefault(key, result)

        ordered = sorted(fused_scores.keys(), key=lambda x: fused_scores[x], reverse=True)
        out = []
        for key in ordered:
            doc = doc_map[key]
            doc["fused_score"] = fused_scores[key]
            out.append(doc)
        return out

    def _rerank_documents(self, query: str, documents: List[RagDocument]) -> List[RagDocument]:
        return documents

    def search_by_tags(self, tags: List[str], k: int = 3) -> List[RagDocument]:
        references: List[RagDocument] = []
        if not self.summary_db or not tags:
            return references

        for tag in tags[:5]:
            try:
                if self.embeddings:
                    q_emb = self.embeddings.embed_query(tag)
                    results = self.summary_db.query(query_embeddings=[q_emb], n_results=k, include=["documents", "metadatas", "distances"])
                else:
                    results = self.summary_db.query(query_texts=[tag], n_results=k, include=["documents", "metadatas", "distances"])

                docs = results.get("documents", [[]])[0] if results else []
                metas = results.get("metadatas", [[]])[0] if results else []
                for i, doc_text in enumerate(docs):
                    metadata = metas[i] if i < len(metas) else {}
                    filename = self._get_doc_filename(metadata)
                    links = re.findall(r"\[\[([^\]]+)\]\]", doc_text or "")
                    for link in links[:3]:
                        raw_path = self._find_raw_file(link)
                        if raw_path and raw_path.exists():
                            try:
                                content = self._read_text_safe(raw_path)
                                references.append(
                                    RagDocument(
                                        page_content=content[:2500],
                                        source_path=raw_path.name,
                                        layer=LayerType.RAW,
                                        score=0.3,
                                        metadata={
                                            "from_tag": tag,
                                            "via_summary": filename,
                                            "is_main": False,
                                            "source_type": "tags",
                                            "retrieval_reason": f"Expanded via tag {tag} from summary {filename}.",
                                        },
                                    )
                                )
                            except Exception:
                                pass
            except Exception:
                continue

        return references[:k]

    def get_doc_count(self) -> int:
        return len(self.raw_file_map)

    @property
    def file_count(self) -> int:
        """Compatibility accessor used by backend.main startup logs."""
        return self.get_doc_count()
