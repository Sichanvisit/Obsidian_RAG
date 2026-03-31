import asyncio
import json
import logging
import math
import os
import re
import sys
import threading
import traceback
import uuid
from collections import defaultdict
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Callable, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from backend.config.loader import config
from backend.src.constants import MAIN_SYSTEM_PROMPT
from backend.src.graph import (
    AgenticFlow,
    build_relation_adjacency,
    describe_relation_path,
    expand_relation_paths,
    score_relation_path,
)
from backend.src.main import StopSignalManager, get_model, to_json_line
from backend.src.schemas import ChatRequest

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("Commander")
ENABLE_STRATEGY_PLANNER = os.getenv("ENABLE_STRATEGY_PLANNER", "0").lower() in {
    "1",
    "true",
    "yes",
    "on",
}

stop_manager = StopSignalManager()
agent_flow = None
engine_status = "starting"


def _extract_sources(update: dict) -> list[dict]:
    state = update.get("state")
    if not isinstance(state, dict):
        return []

    sources = []
    seen = set()
    for layer_name, docs in (("summary", state.get("summary_docs")), ("raw", state.get("raw_docs"))):
        if not isinstance(docs, list):
            continue
        for doc in docs:
            if not isinstance(doc, dict):
                continue
            path = str(doc.get("source", "")).strip()
            if not path or path in seen:
                continue
            seen.add(path)
            snippet = str(doc.get("snippet", "") or "")
            snippet = " ".join(snippet.split())
            sources.append(
                {
                    "path": path,
                    "name": Path(path).name,
                    "layer": layer_name,
                    "score": doc.get("score", 0.0),
                    "snippet": snippet[:240],
                    "folder": doc.get("folder", ""),
                    "is_main": bool(doc.get("is_main", True)),
                    "source": doc.get("source_type", layer_name),
                    "reason": doc.get("retrieval_reason", ""),
                }
            )
    return sources


def _enrich_update(update: dict) -> dict:
    if not isinstance(update, dict):
        return update
    sources = _extract_sources(update)
    if not sources:
        return update
    enriched = dict(update)
    enriched["sources"] = sources
    return enriched


@asynccontextmanager
async def lifespan(app: FastAPI):
    global agent_flow, engine_status
    try:
        logger.info("시스템 초기화를 시작합니다.")
        engine_status = "loading"

        logger.info("\n" + "=" * 80)
        logger.info("AgenticFlow 엔진 로딩 중...")
        logger.info("=" * 80)
        agent_flow = AgenticFlow()
        logger.info("=" * 80 + "\n")

        engine_status = "ready"
        logger.info("엔진 준비 완료")

        logger.info("인덱스 상태 점검")
        logger.info(f"   - RAW files indexed: {agent_flow.engine.file_count}")

        summary_status = "Not Ready"
        summary_count = 0
        try:
            summary_db = getattr(agent_flow.engine, "summary_db", None)
            if summary_db is not None:
                if hasattr(summary_db, "count") and callable(summary_db.count):
                    summary_count = summary_db.count()
                    summary_status = "Ready"
                elif hasattr(summary_db, "_collection") and hasattr(
                    summary_db._collection, "count"
                ):
                    summary_count = summary_db._collection.count()
                    summary_status = "Ready"
                else:
                    summary_status = "Unknown Type"
        except Exception:
            summary_status = "Error"
        logger.info(f"   - Summary DB: {summary_status} ({summary_count} docs)")

        reranker_status = "Not Available"
        if hasattr(agent_flow.engine, "reranker") and agent_flow.engine.reranker:
            reranker_status = "Ready"
        logger.info(f"   - Reranker: {reranker_status}")
        logger.info(f"   - Strategy Planner: {'ON' if ENABLE_STRATEGY_PLANNER else 'OFF'}")
        logger.info("")

    except Exception as e:
        logger.error(f"엔진 초기화 실패: {e}", exc_info=True)
        engine_status = "error"

    yield
    stop_manager.clear_all()
    logger.info("서버 종료: 세션 stop 신호를 정리했습니다.")


app = FastAPI(title="Obsidian RAG Commander", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "app://obsidian.md",
        "capacitor://localhost",
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:8502",
        "http://127.0.0.1:8502",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StopRequest(BaseModel):
    session_id: str


class FilesRequest(BaseModel):
    path: str


class GeneratorRequest(BaseModel):
    job_name: str = ""
    input_dir: str = ""
    output_dir: str = ""
    subject: str = "New Project"
    pattern_keys: list[str] = Field(default_factory=list)
    model_name: Optional[str] = None
    temp: float = 0.1
    selected_files: list[str] = Field(default_factory=list)
    generation_mode: str = "standard"
    rebuild_title: bool = False


class TaggerRequest(BaseModel):
    target: str = "summary"
    mode: str = "incremental"
    input_dir: str = ""
    selected_files: list[str] = Field(default_factory=list)


class IngestRequest(BaseModel):
    job: str = "all"
    mode: str = "incremental"
    layer: str = "both"
    policy: str = "auto"
    chunk_size: Optional[int] = None
    overlap: Optional[int] = None
    heading_levels: list[int] = Field(default_factory=lambda: [1, 2, 3])
    code_attach: bool = False
    input_dir: str = ""
    output_dir: str = ""
    selected_files: list[str] = Field(default_factory=list)


class ObsidianContextRequest(BaseModel):
    path: str
    content: str = ""
    source: str = "context"


class ObsidianConversationTurn(BaseModel):
    question: str
    answer: str = ""


class ObsidianChatRequest(BaseModel):
    question: str
    session_id: str = "default"
    project_name: str = "Default"
    model_name: str = "qwen3.5:4b"
    attach_current_note: bool = False
    current_note_path: str = ""
    current_note_content: str = ""
    context_entries: list[ObsidianContextRequest] = Field(default_factory=list)
    conversation_history: list[ObsidianConversationTurn] = Field(default_factory=list)
    language: str = "ko"


def _safe_str(value: Any) -> str:
    try:
        return str(value)
    except Exception:
        return ""


def _clip_text(value: Any, limit: int) -> str:
    text = _safe_str(value).strip()
    if not text:
        return ""
    return text[:limit]


def _build_obsidian_sources(request: ObsidianChatRequest) -> list[dict]:
    sources = []
    seen: set[str] = set()

    def add_source(path: str, content: str, source: str, is_main: bool) -> None:
        normalized_path = _safe_str(path).strip().replace("\\", "/")
        if not normalized_path or normalized_path in seen:
            return
        seen.add(normalized_path)
        snippet = " ".join(_safe_str(content).split())
        sources.append(
            {
                "path": normalized_path,
                "name": Path(normalized_path).name,
                "layer": "raw",
                "score": 1.0 if is_main else 0.85,
                "snippet": snippet[:240],
                "folder": str(Path(normalized_path).parent).replace("\\", "/"),
                "is_main": is_main,
                "source": source,
                "reason": "Attached because the question referred to the current note." if is_main else f"Attached from {source} context around the current note.",
            }
        )

    add_source(
        request.current_note_path,
        request.current_note_content,
        "current",
        True,
    )
    for entry in request.context_entries:
        add_source(entry.path, entry.content, entry.source, False)
    return sources


def _build_recent_conversation_sections(request: ObsidianChatRequest, limit: int = 6) -> list[str]:
    sections: list[str] = []
    recent_turns = [
        turn for turn in request.conversation_history
        if _safe_str(turn.question).strip() and _safe_str(turn.answer).strip()
    ][-limit:]
    if not recent_turns:
        return sections

    sections.extend(["", "[Recent Conversation]"])
    for index, turn in enumerate(recent_turns, start=1):
        question = _clip_text(turn.question, 1200) or "(empty question)"
        answer = _clip_text(turn.answer, 2400) or "(empty answer)"
        sections.extend(
            [
                "",
                f"Q{index}: {question}",
                f"A{index}: {answer}",
            ]
        )
    return sections


def _build_obsidian_messages(request: ObsidianChatRequest) -> list[tuple[str, str]]:
    current_note_path = _safe_str(request.current_note_path).replace("\\", "/")
    current_note = _clip_text(request.current_note_content, 12000)
    requested_language = "Korean" if _safe_str(request.language).lower().startswith("ko") else "English"

    sections = [
        "[User Question]",
        _clip_text(request.question, 4000),
    ]
    sections.extend(_build_recent_conversation_sections(request))

    if current_note_path:
        sections.extend(
            [
                "",
                "[Current Note]",
                f"Path: {current_note_path}",
                current_note or "(empty note)",
            ]
        )

    if request.context_entries:
        sections.extend(["", "[Related Notes]"])
        for entry in request.context_entries[:10]:
            note_path = _safe_str(entry.path).replace("\\", "/")
            note_content = _clip_text(entry.content, 4000) or "(empty note)"
            note_source = _safe_str(entry.source) or "context"
            sections.extend(
                [
                    "",
                    f"### {note_path}",
                    f"Source: {note_source}",
                    note_content,
                ]
            )

    user_message = "\n".join(sections)
    has_current_note = bool(current_note_path)
    has_related_notes = bool(request.context_entries)
    context_policy = [
        "Use the provided Obsidian notes when they are relevant to the user's question.",
        "Do not rewrite the user's question into a web-style retrieval query.",
        "Use the recent conversation only to preserve continuity, but answer the latest user question directly.",
        "If the latest question is a follow-up that omits the topic, recover that missing topic from the recent conversation before answering.",
        "Do not invent facts that are not supported by the provided notes.",
        "If the provided notes are insufficient, say exactly what is missing.",
        "When citing related notes, prefer Obsidian wiki link format such as [[note/path]].",
        f"Answer in {requested_language} unless the user explicitly asks for another language.",
    ]
    if has_current_note:
        context_policy.insert(1, "Treat the current note as a relevant local reference, not as an automatic source of truth.")
    if has_related_notes:
        context_policy.insert(2, "Use related notes only when they help answer the question more directly.")
    if not has_current_note and not has_related_notes:
        context_policy.insert(1, "No Obsidian note context was provided, so answer from the user's question only.")

    system_prompt = f"""You are an Obsidian note assistant.

{' '.join(context_policy)}
Focus on directly solving the user's task.
"""
    return [
        ("system", system_prompt),
        ("human", user_message),
    ]



def _question_mentions_current_note(question: str) -> bool:
    raw_text = _safe_str(question).strip()
    text = raw_text.lower()
    if not raw_text:
        return False
    patterns = [
        r"\bthis note\b",
        r"\bcurrent note\b",
        r"\bopened note\b",
        r"\bopen note\b",
        r"\bselection\b",
        r"\bselected text\b",
        r"\babove\b",
        r"\bhere\b",
        r"이 노트",
        r"현재 노트",
        r"지금 노트",
        r"열어둔 노트",
        r"위 내용",
        r"여기 내용",
        r"본문",
        r"선택 영역",
        r"선택영역",
        r"선택한 부분",
        r"드래그한",
    ]
    return any(re.search(pattern, raw_text) or re.search(pattern, text) for pattern in patterns)


def _question_prefers_general_knowledge(question: str) -> bool:
    raw_text = _safe_str(question).strip()
    text = raw_text.lower()
    if not raw_text:
        return False

    local_markers = [
        "이 노트", "현재 노트", "선택 영역", "선택영역", "백링크", "태그", "옵시디언", "obsidian",
        "파일", "노트", "폴더", "문서", "vault", "related_files", "related file",
    ]
    if any(marker in raw_text or marker in text for marker in local_markers):
        return False

    general_markers = [
        "차이", "비교", "설명", "개념", "원리", "뜻", "정의", "예시", "방법",
        "difference", "compare", "explain", "concept", "principle", "definition", "example",
    ]
    return any(marker in raw_text or marker in text for marker in general_markers)


def _question_expects_obsidian_context(question: str) -> bool:
    raw_text = _safe_str(question).strip()
    text = raw_text.lower()
    if not raw_text:
        return False
    markers = [
        "이 노트", "현재 노트", "열어둔 노트", "선택 영역", "선택영역", "백링크", "태그", "related_files",
        "옵시디언", "obsidian", "vault", "노트", "파일", "폴더", "문서", "위 내용", "여기 내용",
        "this note", "current note", "selected text", "backlink", "tag", "note", "file", "folder",
    ]
    return any(marker in raw_text or marker in text for marker in markers)


QUERY_TOKEN_RE = re.compile("[A-Za-z0-9][A-Za-z0-9_./-]*|[가-힣]{2,}")
QUERY_STOPWORDS = {
    "the", "and", "for", "with", "from", "that", "this", "into", "there", "their",
    "have", "will", "your", "about", "than", "then", "when", "where", "what", "which",
    "ê·¸ê±°", "ì´ê±°", "ì ê±°", "ê´ë ¨", "ì¤ëª", "ì ë¦¬", "ëí´", "ëí", "ìí´", "íµí´",
    "ì´í", "íì¬", "ì´ë°", "ì ë°", "ê·¸ë°", "ë´ì©", "ë¬¸ì", "ë¸í¸", "íì¼",
}
EXTRA_KO_QUERY_STOPWORDS = {
    "그거", "이거", "저거", "관련", "설명", "정리", "대해", "대한", "위해", "통해",
    "이후", "현재", "이런", "저런", "그런", "내용", "문서", "노트", "파일",
    "메모", "찾아줘", "정리해줘", "보여줘", "알려줘", "관련해서", "찾기", "보여주기",
}
_OBSIDIAN_INDEX_CACHE: dict[str, Any] = {"signature": None, "payload": None}
_TAGGER_RULES_CACHE: dict[str, Any] = {"signature": None, "payload": None}


TOOL_QUERY_TERMS = {
    "fastapi",
    "streamlit",
    "ollama",
    "langgraph",
    "langchain",
    "openai",
    "chromadb",
    "chroma",
    "nodejs",
    "nextjs",
    "react",
    "vite",
    "vercel",
    "gcp",
    "docker",
    "uvicorn",
    "qwen",
    "gemini",
}


def _normalize_query_token(token: str) -> str:
    return _safe_str(token).strip().lower().strip("._-/")


def _query_token_variants(token: str) -> list[str]:
    normalized = _normalize_query_token(token)
    if not normalized:
        return []
    phrase = _normalize_phrase(normalized)
    variants = [normalized]
    if phrase and phrase != normalized:
        variants.append(phrase)
    return variants


def _normalize_tool_query_token(token: str) -> str:
    return re.sub(r"[^a-z0-9?-?]+", "", _normalize_query_token(token))


def _is_explicit_domain_token(token: str) -> bool:
    normalized = _normalize_query_token(token)
    return "." in normalized or normalized in {"localhost", "127.0.0.1", "0.0.0.0"}


def _is_tool_query_token(token: str, semantic_hits: set[str]) -> bool:
    normalized = _normalize_tool_query_token(token)
    if not normalized:
        return False
    if normalized in TOOL_QUERY_TERMS:
        return True
    return normalized in {
        _normalize_tool_query_token(hit)
        for hit in semantic_hits
        if _normalize_tool_query_token(hit)
    }


def _normalize_phrase(text: str) -> str:
    value = _safe_str(text).lower().replace("_", " ").replace("-", " ").replace("/", " ")
    value = re.sub(r"[^a-z0-9가-힣\s]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def _tokenize_query(question: str) -> list[str]:
    tokens: list[str] = []
    for raw_token in QUERY_TOKEN_RE.findall(_safe_str(question)):
        token = _normalize_query_token(raw_token)
        if len(token) < 2 or token in QUERY_STOPWORDS or token in EXTRA_KO_QUERY_STOPWORDS:
            continue
        tokens.append(token)
    return list(dict.fromkeys(tokens))


def _build_note_search_blob(note: dict[str, Any]) -> dict[str, Any]:
    headings = [section.get("heading", "") for section in note.get("section_index", []) if isinstance(section, dict)]
    alias_list = [
        _normalize_phrase(alias)
        for alias in (note.get("aliases", []) or [])
        if _normalize_phrase(alias)
    ]
    related_note_names = []
    for raw_path in (note.get("related_notes_auto", []) or []):
        normalized_path = _safe_str(raw_path).replace("\\", "/").strip()
        if not normalized_path:
            continue
        related_note_names.append(Path(normalized_path).stem or normalized_path)
    return {
        "title": _normalize_phrase(note.get("title", "")),
        "path": _normalize_phrase(note.get("vault_rel_path", "") or note.get("rel_path", "")),
        "folder": _normalize_phrase(note.get("folder_path", "")),
        "root_domain": _normalize_phrase(note.get("root_domain_auto", "") or note.get("domain", "")),
        "project_id": _normalize_phrase(note.get("project_id_auto", "") or note.get("collection", "")),
        "aliases": _normalize_phrase(" ".join(note.get("aliases", []) or [])),
        "alias_list": alias_list,
        "headings": _normalize_phrase(" ".join(headings)),
        "section_keys": _normalize_phrase(" ".join(note.get("section_keys", []) or [])),
        "keywords": {
            _normalize_query_token(keyword)
            for keyword in (note.get("keywords", []) or [])
            if _normalize_query_token(keyword)
        },
        "tags": _normalize_phrase(" ".join(note.get("tags", []) or [])),
        "note_type": _normalize_phrase(note.get("note_type_auto", "")),
        "doc_role": _normalize_phrase(note.get("doc_role_auto", "")),
        "semantic_tags": {
            _normalize_query_token(tag)
            for tag in (note.get("semantic_tags_auto", []) or [])
            if _normalize_query_token(tag)
        },
        "external_ref_domains": _normalize_phrase(" ".join(note.get("external_ref_domains", []) or [])),
        "external_refs": _normalize_phrase(
            " ".join(
                f"{_safe_str(ref.get('label', ''))} {_safe_str(ref.get('domain', ''))}"
                for ref in (note.get("external_refs", []) or [])
                if isinstance(ref, dict)
            )
        ),
        "related_notes": _normalize_phrase(" ".join(related_note_names)),
    }


def _load_obsidian_indices() -> dict[str, Any]:
    metadata_path = (BASE_DIR / "data" / "indexes" / "obsidian_metadata_index.json").resolve()
    text_path = (BASE_DIR / "data" / "indexes" / "obsidian_text_index.json").resolve()
    graph_path = (BASE_DIR / "data" / "indexes" / "obsidian_link_graph.json").resolve()
    signature = tuple(
        path.stat().st_mtime if path.exists() else None
        for path in (metadata_path, text_path, graph_path)
    )
    if _OBSIDIAN_INDEX_CACHE.get("signature") == signature and _OBSIDIAN_INDEX_CACHE.get("payload"):
        return _OBSIDIAN_INDEX_CACHE["payload"]

    try:
        metadata_payload = json.loads(metadata_path.read_text(encoding="utf-8")) if metadata_path.exists() else {}
        text_payload = json.loads(text_path.read_text(encoding="utf-8")) if text_path.exists() else {}
        graph_payload = json.loads(graph_path.read_text(encoding="utf-8")) if graph_path.exists() else {}
    except Exception:
        logger.exception("failed to load obsidian indices")
        return {}

    notes = metadata_payload.get("notes", []) if isinstance(metadata_payload, dict) else []
    text_index = text_payload.get("index", {}) if isinstance(text_payload, dict) else {}
    graph = graph_payload.get("graph", {}) if isinstance(graph_payload, dict) else {}

    metadata_by_path: dict[str, dict[str, Any]] = {}
    search_blobs: dict[str, dict[str, Any]] = {}
    typed_relation_reverse: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for note in notes:
        if not isinstance(note, dict):
            continue
        path_value = _safe_str(note.get("path", "")).replace("\\", "/")
        if not path_value:
            continue
        metadata_by_path[path_value] = note
        search_blobs[path_value] = _build_note_search_blob(note)
        for relation in (note.get("typed_relations_auto", []) or []):
            if not isinstance(relation, dict):
                continue
            target_path = _safe_str(relation.get("target_path", "")).replace("\\", "/").strip()
            relation_type = _safe_str(relation.get("type", "")).strip()
            if not target_path or not relation_type:
                continue
            typed_relation_reverse[target_path].append(
                {
                    "source_path": path_value,
                    "relation": relation,
                }
            )

    payload = {
        "notes": list(metadata_by_path.values()),
        "metadata_by_path": metadata_by_path,
        "search_blobs": search_blobs,
        "typed_relation_reverse": dict(typed_relation_reverse),
        "relation_graph": build_relation_adjacency(metadata_by_path.values()),
        "text_index": text_index if isinstance(text_index, dict) else {},
        "graph": graph if isinstance(graph, dict) else {},
        "doc_count": len(metadata_by_path),
    }
    _OBSIDIAN_INDEX_CACHE["signature"] = signature
    _OBSIDIAN_INDEX_CACHE["payload"] = payload
    return payload


def _load_runtime_tagger_rules() -> dict[str, Any]:
    try:
        from backend.src.pipeline.tagger import load_tagger_rules
    except Exception:
        return {}

    rules = load_tagger_rules()
    workspace = rules.get("workspace", {}) or {}
    candidate_paths = [
        Path(_safe_str(workspace.get("canonical_tags_path", ""))),
        Path(_safe_str(workspace.get("synonym_map_path", ""))),
        Path(_safe_str(workspace.get("tagging_priority_path", ""))),
    ]
    signature = tuple(path.stat().st_mtime if path.exists() else None for path in candidate_paths)
    if _TAGGER_RULES_CACHE.get("signature") == signature and _TAGGER_RULES_CACHE.get("payload"):
        return _TAGGER_RULES_CACHE["payload"]
    _TAGGER_RULES_CACHE["signature"] = signature
    _TAGGER_RULES_CACHE["payload"] = rules
    return rules


def _detect_query_semantic_tags(question: str, rules: dict[str, Any]) -> set[str]:
    phrase = _normalize_phrase(question)
    tokens = set(_tokenize_query(question))
    matched: set[str] = set()
    canonical_tags = list(rules.get("canonical_tags", []) or [])
    synonym_map = dict(rules.get("synonym_map", {}) or {})

    for canonical in canonical_tags:
        normalized_canonical = _normalize_query_token(canonical)
        if normalized_canonical and normalized_canonical in tokens:
            matched.add(canonical)
            continue
        for candidate in [canonical, *(synonym_map.get(canonical, []) or [])]:
            normalized_candidate = _normalize_phrase(candidate)
            if normalized_candidate and normalized_candidate in phrase:
                matched.add(canonical)
                break
    return matched


def _infer_query_project_focus(
    question: str,
    query_tokens: list[str],
    search_blobs: dict[str, dict[str, Any]],
) -> set[str]:
    phrase = _normalize_phrase(question)
    if not phrase and not query_tokens:
        return set()

    token_variants = {
        variant
        for token in query_tokens
        for variant in _query_token_variants(token)
        if len(variant) >= 4
    }
    focused_projects: set[str] = set()
    for search_blob in search_blobs.values():
        if not isinstance(search_blob, dict):
            continue
        project_id = _safe_str(search_blob.get("project_id", "")).strip()
        if not project_id or len(project_id) < 4:
            continue
        if project_id in phrase:
            focused_projects.add(project_id)
            continue
        if any(project_id == variant or project_id in variant or variant in project_id for variant in token_variants):
            focused_projects.add(project_id)
    return focused_projects


def _score_text_index_hits(
    query_tokens: list[str],
    semantic_hits: set[str],
    text_index: dict[str, Any],
    doc_count: int,
) -> dict[str, float]:
    scores: dict[str, float] = {}
    weighted_terms: list[tuple[str, float]] = [(token, 1.0) for token in query_tokens]
    weighted_terms.extend((tag, 1.15) for tag in semantic_hits)

    for term, query_weight in weighted_terms:
        entry = text_index.get(term)
        if not isinstance(entry, dict):
            continue
        df = max(1, int(entry.get("df", 1) or 1))
        idf = math.log((doc_count + 1) / (df + 1)) + 1.0
        for note_hit in entry.get("notes", [])[:50]:
            if not isinstance(note_hit, dict):
                continue
            note_path = _safe_str(note_hit.get("path", "")).replace("\\", "/")
            if not note_path:
                continue
            count = min(8, int(note_hit.get("count", 1) or 1))
            scores[note_path] = scores.get(note_path, 0.0) + (query_weight * idf * count)
    return scores


def _rebalance_text_index_score(
    note: dict[str, Any],
    raw_score: float,
    question: str,
    role_priors: dict[str, float],
    focus_projects: set[str] | None = None,
) -> float:
    score = float(raw_score or 0.0)
    if score <= 0:
        return 0.0

    implementation_prior = role_priors.get("implementation", 0.0)
    if implementation_prior <= 0:
        return score

    phrase = _normalize_phrase(question)
    note_role = _normalize_query_token(note.get("doc_role_auto", ""))
    note_type = _normalize_query_token(note.get("note_type_auto", ""))
    layer = _normalize_note_layer(note)
    title_blob = _normalize_phrase(note.get("title", ""))
    path_blob = _normalize_phrase(note.get("vault_rel_path", "") or note.get("path", ""))
    focus_project_keys = {
        _normalize_phrase(project_id)
        for project_id in (focus_projects or set())
        if _normalize_phrase(project_id)
    }
    note_project = _normalize_phrase(note.get("project_id_auto", ""))
    project_match = bool(note_project and note_project in focus_project_keys)

    asks_code = any(token in phrase for token in ("code", "코드"))
    asks_note = any(token in phrase for token in ("note", "노트", "memo", "메모"))
    asks_direct_impl = any(token in phrase for token in ("실제 코드", "구현 코드", "구현 노트", "구현 메모"))

    multiplier = 1.0
    bonus = 0.0
    strength = min(1.0, implementation_prior / 1.6)

    if layer == "summary" and note_type == "summary-note":
        multiplier *= 0.64
        if note_role in {"architecture", "overview", "reference"}:
            multiplier *= 0.74
        if project_match and (asks_code or asks_note or asks_direct_impl):
            multiplier *= 0.42
        if asks_code and any(marker in f"{title_blob} {path_blob}" for marker in ("code_summary", "code summary")):
            multiplier *= 0.24
        if asks_note and any(marker in f"{title_blob} {path_blob}" for marker in ("summary", "overview")):
            multiplier *= 0.55

    if layer == "raw" and note_type == "code-note":
        multiplier *= 1.08
        if project_match:
            multiplier *= 1.12
        if note_role == "implementation":
            bonus += 1.1 * strength
        if asks_code:
            bonus += 1.35 * strength
        if asks_note or asks_direct_impl:
            bonus += 1.0 * strength

    return max(0.0, score * multiplier + bonus)


def _score_text_relevance(question: str, text: str, path: str = "") -> float:
    tokens = _tokenize_query(question)
    if not tokens:
        return 0.0

    haystack = f"{_safe_str(path)}\n{_safe_str(text)}".lower()
    if not haystack.strip():
        return 0.0

    matched = 0
    strong = 0.0
    for token in tokens:
        if token in haystack:
            matched += 1
            if token in _safe_str(path).lower():
                strong += 0.28
            else:
                strong += 0.14

    overlap = matched / max(len(tokens), 1)
    return overlap + strong


ROLE_QUERY_HINTS = {
    "setup": ["설치", "세팅", "setup", "install", "실행", "환경 구축", "환경설정", "getting started", "시작"],
    "architecture": ["구조", "설계", "아키텍처", "architecture", "파이프라인", "workflow", "흐름", "동작 방식", "큰 그림", "구성", "구조도"],
    "overview": ["개요", "배경", "소개", "why", "이유", "목표", "무엇", "설명해줘", "overview", "전체", "요약"],
    "implementation": ["구현", "코드", "실습", "예제", "tutorial", "walkthrough", "만들기", "적용", "사용법", "가이드", "교체", "implementation", "소스", "실제 코드", "구현부", "메모", "memo", "구현 메모", "구현 노트"],
    "evaluation": ["비교", "차이", "장단점", "한계", "평가", "성능", "benchmark", "tradeoff", "trade-off", "비교해줘", "리스크"],
    "plan": ["로드맵", "계획", "단계", "phase", "milestone", "순서", "이후", "앞으로", "plan", "roadmap", "우선순위", "진행 계획"],
    "next_action": ["다음 액션", "다음 할 일", "뭘 해야", "todo", "next step", "후속 작업", "액션 아이템", "다음엔", "먼저 뭐", "해야 할 것"],
    "decision": ["결정", "의사결정", "왜 이렇게", "선택 이유", "근거", "decision"],
    "review": ["회고", "되돌아", "review", "피드백", "정리해보면", "돌아보면", "복기", "개선점", "아쉬운 점"],
}

NOTE_TYPE_ROLE_PRIORS = {
    "plan": {"roadmap-note": 0.7, "summary-note": 0.25, "project-note": 0.15},
    "setup": {"code-note": 0.4, "reference-note": 0.25},
    "architecture": {"project-note": 0.4, "reference-note": 0.3, "code-note": 0.28},
    "overview": {"project-note": 0.3, "summary-note": 0.25, "concept-note": 0.2, "reference-note": 0.15},
    "implementation": {"code-note": 0.85, "project-note": 0.18, "experiment-note": 0.12},
    "evaluation": {"reference-note": 0.35, "experiment-note": 0.4, "review-note": 0.15},
    "review": {"meeting-note": 0.35, "review-note": 0.45},
    "decision": {"decision-note": 0.6, "project-note": 0.15},
    "next_action": {"action-note": 0.6, "roadmap-note": 0.2},
}

ROLE_MISMATCH_PENALTIES = {
    "implementation": {"plan": 1.55, "architecture": 0.9, "overview": 0.7, "review": 0.55, "evaluation": 0.45, "reference": 0.25},
    "setup": {"plan": 0.7, "review": 0.3},
    "architecture": {"plan": 0.18},
    "next_action": {"review": 0.2, "reference": 0.15},
}

ROLE_LAYER_PRIORS = {
    "plan": {"summary": 1.1, "raw": -0.08},
    "architecture": {"summary": 0.95, "raw": 0.0},
    "overview": {"summary": 0.82, "raw": 0.0},
    "implementation": {"raw": 1.02, "summary": -0.08},
    "setup": {"raw": 0.54, "summary": 0.2},
    "evaluation": {"raw": 0.38, "summary": 0.14},
    "review": {"raw": 0.42, "summary": 0.12},
    "decision": {"raw": 0.36, "summary": 0.16},
    "next_action": {"raw": 0.58, "summary": 0.28},
}

RELATION_RETRIEVAL_WEIGHTS = {
    "implements": 1.35,
    "review_of": 1.05,
    "next_action_for": 0.95,
    "decision_for": 0.95,
    "follow_up": 0.82,
    "references": 0.7,
    "summarizes": 0.68,
    "same_topic": 0.55,
}

RELATION_ROLE_PRIORS = {
    "implements": {"implementation", "setup"},
    "review_of": {"review", "evaluation"},
    "next_action_for": {"next_action", "plan"},
    "decision_for": {"decision", "architecture"},
    "follow_up": {"plan", "overview", "next_action"},
    "references": {"reference", "architecture", "overview"},
    "summarizes": {"overview", "reference"},
    "same_topic": {"overview", "architecture"},
}

ROLE_RELATION_PRIORS = {
    "implementation": {"implements": 0.95, "references": 0.35, "summarizes": 0.25},
    "setup": {"implements": 0.55, "references": 0.55, "follow_up": 0.18},
    "architecture": {"summarizes": 0.65, "references": 0.45, "implements": 0.25, "decision_for": 0.18},
    "overview": {"summarizes": 0.75, "same_topic": 0.32, "references": 0.28, "follow_up": 0.24},
    "evaluation": {"review_of": 0.9, "same_topic": 0.3, "references": 0.22},
    "review": {"review_of": 0.95, "decision_for": 0.38, "next_action_for": 0.32},
    "plan": {"follow_up": 0.88, "decision_for": 0.66, "next_action_for": 0.38, "summarizes": 0.22},
    "next_action": {"next_action_for": 1.0, "follow_up": 0.7, "decision_for": 0.24},
    "decision": {"decision_for": 0.95, "review_of": 0.2, "references": 0.25},
}


def _infer_doc_role_priors(question: str, query_tokens: list[str]) -> dict[str, float]:
    phrase = _normalize_phrase(question)
    priors: dict[str, float] = {}
    if not phrase and not query_tokens:
        return priors

    for role, hints in ROLE_QUERY_HINTS.items():
        hits = 0
        for hint in hints:
            normalized_hint = _normalize_phrase(hint)
            if normalized_hint and normalized_hint in phrase:
                hits += 1
        if hits:
            priors[role] = 1.0 + min(1.4, 0.45 * hits)
    return priors


def _score_role_alignment(note: dict[str, Any], role_priors: dict[str, float]) -> float:
    if not role_priors:
        return 0.0

    note_role = _normalize_query_token(note.get("doc_role_auto", ""))
    note_type = _normalize_query_token(note.get("note_type_auto", ""))
    score = 0.0
    matched_roles = False

    for role, role_score in role_priors.items():
        normalized_role_score = min(1.0, role_score / 1.6)
        if note_role and note_role == role:
            score += role_score
            matched_roles = True
        score += NOTE_TYPE_ROLE_PRIORS.get(role, {}).get(note_type, 0.0) * normalized_role_score

    if note_role and not matched_roles:
        penalty = 0.0
        for role, role_score in role_priors.items():
            penalty += ROLE_MISMATCH_PENALTIES.get(role, {}).get(note_role, 0.0) * min(1.0, role_score / 1.6)
        score -= penalty
    return score


def _normalize_note_layer(note: dict[str, Any]) -> str:
    layer = _normalize_query_token(note.get("layer", ""))
    if layer in {"summary", "raw"}:
        return layer

    path_blob = _normalize_phrase(note.get("vault_rel_path", "") or note.get("path", ""))
    if "11 rag knowledge base" in path_blob:
        return "summary"
    return "raw"


def _score_layer_alignment(note: dict[str, Any], role_priors: dict[str, float]) -> float:
    layer = _normalize_note_layer(note)
    note_role = _normalize_query_token(note.get("doc_role_auto", ""))
    note_type = _normalize_query_token(note.get("note_type_auto", ""))

    score = 0.0
    if layer == "summary":
        score += 0.14
        if note_type == "summary-note":
            score += 0.12
        if note_role in {"plan", "architecture", "overview", "reference"}:
            score += 0.08
    elif layer == "raw" and note_type == "code-note":
        score += 0.06

    if not role_priors:
        return score

    for role, role_score in role_priors.items():
        normalized_role_score = min(1.0, role_score / 1.6)
        score += ROLE_LAYER_PRIORS.get(role, {}).get(layer, 0.0) * normalized_role_score
        if layer == "summary" and role in {"plan", "architecture", "overview"} and note_role == role:
            score += 0.18 * normalized_role_score
        if role == "implementation" and layer == "summary":
            score -= 0.28 * normalized_role_score
            if note_type == "summary-note":
                score -= 0.18 * normalized_role_score
        if layer == "raw" and role in {"implementation", "setup", "review", "next_action"} and note_role == role:
            score += 0.15 * normalized_role_score
        if role == "implementation" and layer == "raw":
            if note_type == "code-note":
                score += 0.35 * normalized_role_score
            if note_role == "implementation":
                score += 0.32 * normalized_role_score
    return score


def _score_implementation_intent(note: dict[str, Any], question: str, role_priors: dict[str, float]) -> float:
    implementation_prior = role_priors.get("implementation", 0.0)
    if implementation_prior <= 0:
        return 0.0

    strength = min(1.15, implementation_prior / 1.35)
    note_role = _normalize_query_token(note.get("doc_role_auto", ""))
    note_type = _normalize_query_token(note.get("note_type_auto", ""))
    layer = _normalize_note_layer(note)
    phrase = _normalize_phrase(question)

    score = 0.0
    if note_type == "code-note":
        score += 1.25 * strength
    if note_role == "implementation":
        score += 1.0 * strength
    if layer == "raw":
        score += 0.25 * strength
    if any(token in phrase for token in ("코드", "code")):
        if note_type == "code-note":
            score += 0.55 * strength
        if note_type == "summary-note":
            score -= 0.45 * strength
    if any(token in phrase for token in ("메모", "memo", "노트", "실제 코드")):
        if note_type == "code-note":
            score += 0.38 * strength
        if note_role == "implementation":
            score += 0.24 * strength

    if layer == "summary":
        score -= 0.7 * strength
        if note_type == "summary-note":
            score -= 0.3 * strength
    if note_role in {"architecture", "overview", "plan"} and note_type != "code-note":
        score -= 0.42 * strength
    return score


def _score_relation_alignment(
    relation_type: str,
    relation_confidence: float,
    role_priors: dict[str, float],
) -> float:
    relation_key = _normalize_query_token(relation_type)
    if not relation_key:
        return 0.0
    base = RELATION_RETRIEVAL_WEIGHTS.get(relation_key, 0.45) * max(0.35, min(1.0, relation_confidence))
    for expected_role in RELATION_ROLE_PRIORS.get(relation_key, set()):
        if expected_role in role_priors:
            base += 0.55 * min(1.0, role_priors[expected_role] / 1.6)
    for role, role_score in role_priors.items():
        relation_prior = ROLE_RELATION_PRIORS.get(role, {}).get(relation_key, 0.0)
        if relation_prior:
            base += relation_prior * min(1.0, role_score / 1.6)
    return base


def _score_relation_support(
    note: dict[str, Any],
    reverse_relations: dict[str, list[dict[str, Any]]],
    role_priors: dict[str, float],
) -> float:
    if not role_priors:
        return 0.0

    note_path = _safe_str(note.get("path", "")).replace("\\", "/").strip()
    if not note_path:
        return 0.0

    relation_scores: list[float] = []
    relation_counts: dict[str, int] = {}

    for relation in (note.get("typed_relations_auto", []) or [])[:12]:
        if not isinstance(relation, dict):
            continue
        relation_type = _safe_str(relation.get("type", ""))
        score = _score_relation_alignment(
            relation_type=relation_type,
            relation_confidence=float(relation.get("confidence", 0.0) or 0.0),
            role_priors=role_priors,
        )
        if score <= 0:
            continue
        relation_scores.append(score)
        relation_key = _normalize_query_token(relation_type)
        relation_counts[relation_key] = relation_counts.get(relation_key, 0) + 1

    for inbound in (reverse_relations.get(note_path, []) or [])[:10]:
        if not isinstance(inbound, dict):
            continue
        relation = inbound.get("relation", {}) or {}
        relation_type = _safe_str(relation.get("type", ""))
        score = _score_relation_alignment(
            relation_type=relation_type,
            relation_confidence=float(relation.get("confidence", 0.0) or 0.0),
            role_priors=role_priors,
        ) * 0.72
        if score <= 0:
            continue
        relation_scores.append(score)
        relation_key = _normalize_query_token(relation_type)
        relation_counts[relation_key] = relation_counts.get(relation_key, 0) + 1

    if not relation_scores:
        return 0.0

    top_support = sum(sorted(relation_scores, reverse=True)[:3])
    diversity_bonus = min(0.3, 0.08 * len(relation_counts))
    return (top_support * 0.26) + diversity_bonus


def _describe_relation_support(
    note: dict[str, Any],
    reverse_relations: dict[str, list[dict[str, Any]]],
    role_priors: dict[str, float],
) -> str:
    if not role_priors:
        return ""

    note_path = _safe_str(note.get("path", "")).replace("\\", "/").strip()
    if not note_path:
        return ""

    aligned_counts: dict[str, int] = {}
    for relation in (note.get("typed_relations_auto", []) or [])[:12]:
        if not isinstance(relation, dict):
            continue
        relation_type = _safe_str(relation.get("type", ""))
        relation_score = _score_relation_alignment(
            relation_type=relation_type,
            relation_confidence=float(relation.get("confidence", 0.0) or 0.0),
            role_priors=role_priors,
        )
        relation_key = _normalize_query_token(relation_type)
        if relation_key and relation_score >= 0.9:
            aligned_counts[relation_key] = aligned_counts.get(relation_key, 0) + 1

    for inbound in (reverse_relations.get(note_path, []) or [])[:10]:
        if not isinstance(inbound, dict):
            continue
        relation = inbound.get("relation", {}) or {}
        relation_type = _safe_str(relation.get("type", ""))
        relation_score = _score_relation_alignment(
            relation_type=relation_type,
            relation_confidence=float(relation.get("confidence", 0.0) or 0.0),
            role_priors=role_priors,
        )
        relation_key = _normalize_query_token(relation_type)
        if relation_key and relation_score >= 1.0:
            aligned_counts[relation_key] = aligned_counts.get(relation_key, 0) + 1

    if not aligned_counts:
        return ""

    top_relations = sorted(aligned_counts.items(), key=lambda item: (-item[1], item[0]))[:2]
    formatted = ", ".join(f"{relation_type} x{count}" for relation_type, count in top_relations)
    return f"Relation graph aligned: {formatted}."


def _describe_relation_chain(
    path_payload: dict[str, Any],
    metadata_by_path: dict[str, dict[str, Any]],
) -> str:
    return describe_relation_path(path_payload, note_lookup=metadata_by_path)


def _merge_chain_candidate_score(existing_score: float, chain_payload: dict[str, Any]) -> float:
    base_score = float(existing_score or 0.0)
    hop_score = float(
        chain_payload.get("path_score", chain_payload.get("score", 0.0)) or 0.0
    )
    if hop_score <= 0:
        return base_score
    if base_score <= 0:
        return hop_score

    relation_type = _normalize_query_token(_safe_str(chain_payload.get("relation_type", "")))
    hop_count = int(chain_payload.get("hop_count", 1) or 1)
    if hop_count <= 1:
        blend = 0.24 if relation_type else 0.16
        hop_bonus = min(2.6, hop_score * blend)
    else:
        blend = 0.16 if relation_type else 0.12
        hop_bonus = min(1.85, hop_score * blend)
    return max(base_score, base_score + hop_bonus)


def _merge_hop_candidate_score(existing_score: float, hop_payload: dict[str, Any]) -> float:
    return _merge_chain_candidate_score(existing_score, hop_payload)


def _expand_relation_chain_sources(
    seed_path: str,
    indices: dict[str, Any],
    question: str,
    query_tokens: list[str],
    *,
    limit: int = 18,
) -> list[dict[str, Any]]:
    metadata_by_path = indices.get("metadata_by_path", {})
    relation_graph = indices.get("relation_graph", {})
    if not metadata_by_path or not relation_graph:
        return []

    role_priors = _infer_doc_role_priors(question, query_tokens)
    best_by_target: dict[str, dict[str, Any]] = {}

    for path_payload in expand_relation_paths(seed_path, relation_graph, max_depth=2, limit=limit * 3):
        target_path = _safe_str(path_payload.get("target_path", "")).replace("\\", "/").strip()
        if not target_path or target_path not in metadata_by_path:
            continue

        path_score = score_relation_path(
            path_payload,
            alignment_fn=_score_relation_alignment,
            role_priors=role_priors,
        )
        if path_score <= 0:
            continue

        candidate = {
            **path_payload,
            "target_path": target_path,
            "path_score": path_score,
            "reason": _describe_relation_chain(path_payload, metadata_by_path),
        }
        existing = best_by_target.get(target_path)
        if (
            not existing
            or float(candidate.get("path_score", 0.0) or 0.0) > float(existing.get("path_score", 0.0) or 0.0)
            or (
                int(candidate.get("hop_count", 99) or 99) < int(existing.get("hop_count", 99) or 99)
                and float(candidate.get("path_score", 0.0) or 0.0)
                >= float(existing.get("path_score", 0.0) or 0.0) - 0.08
            )
        ):
            best_by_target[target_path] = candidate

    ranked_paths = sorted(
        best_by_target.values(),
        key=lambda item: (
            -float(item.get("path_score", 0.0) or 0.0),
            int(item.get("hop_count", 99) or 99),
            _safe_str(item.get("target_path", "")),
        ),
    )
    return ranked_paths[:limit]


def _is_guarantee_eligible(note: dict[str, Any], role_priors: dict[str, float]) -> bool:
    if not role_priors:
        return True
    note_role = _normalize_query_token(note.get("doc_role_auto", ""))
    note_type = _normalize_query_token(note.get("note_type_auto", ""))
    layer = _normalize_note_layer(note)
    if "implementation" in role_priors and note_role in {"plan", "review"} and note_type != "code-note":
        return False
    if "implementation" in role_priors and layer == "summary" and note_type == "summary-note" and note_role in {"architecture", "overview", "reference"}:
        return False
    if "setup" in role_priors and note_role == "plan":
        return False
    if "next_action" in role_priors and note_role == "reference":
        return False
    return True


def _match_title_alias_phrase(search_blob: dict[str, Any], question: str) -> tuple[float, str]:
    question_blob = _normalize_phrase(question)
    if len(question_blob) < 4:
        return 0.0, ""

    title_blob = search_blob.get("title", "")
    alias_list = list(search_blob.get("alias_list", []) or [])

    if title_blob and len(title_blob) >= 4:
        if title_blob in question_blob:
            return 2.2, "Title phrase overlap"
        if len(question_blob) >= 6 and question_blob in title_blob:
            return 1.1, "Title closely matches the question phrase"

    for alias in alias_list[:6]:
        if not alias or len(alias) < 4:
            continue
        if alias in question_blob:
            return 1.7, "Alias phrase overlap"
        if len(question_blob) >= 6 and question_blob in alias:
            return 0.9, "Alias closely matches the question phrase"
    return 0.0, ""


def _score_metadata_overlap(
    note: dict[str, Any],
    search_blob: dict[str, Any],
    question: str,
    query_tokens: list[str],
    semantic_hits: set[str],
    current_note_path: str,
    current_note_content: str,
    focus_projects: set[str] | None = None,
) -> float:
    score = 0.0

    title_blob = search_blob.get("title", "")
    path_blob = search_blob.get("path", "")
    folder_blob = search_blob.get("folder", "")
    root_domain_blob = search_blob.get("root_domain", "")
    project_id_blob = search_blob.get("project_id", "")
    aliases_blob = search_blob.get("aliases", "")
    headings_blob = search_blob.get("headings", "")
    section_keys_blob = search_blob.get("section_keys", "")
    tags_blob = search_blob.get("tags", "")
    note_type_blob = search_blob.get("note_type", "")
    doc_role_blob = search_blob.get("doc_role", "")
    external_domain_blob = search_blob.get("external_ref_domains", "")
    external_blob = search_blob.get("external_refs", "")
    related_notes_blob = search_blob.get("related_notes", "")
    keyword_set = search_blob.get("keywords", set())
    semantic_note_tags = search_blob.get("semantic_tags", set())
    role_priors = _infer_doc_role_priors(question, query_tokens)
    title_alias_bonus, _ = _match_title_alias_phrase(search_blob, question)

    for token in query_tokens:
        variants = _query_token_variants(token)
        if any(variant in title_blob for variant in variants):
            score += 2.3
        if any(variant in headings_blob for variant in variants):
            score += 1.8
        if any(variant in section_keys_blob for variant in variants):
            score += 1.35
        if any(variant in path_blob for variant in variants):
            score += 1.3
        if any(variant in project_id_blob for variant in variants):
            score += 1.9
        if any(variant in root_domain_blob for variant in variants):
            score += 1.0
        if any(variant in folder_blob for variant in variants):
            score += 0.7
        if any(variant in aliases_blob for variant in variants):
            score += 1.0
        if any(variant in tags_blob for variant in variants):
            score += 0.9
        if token in keyword_set:
            score += 0.85
        if any(variant in note_type_blob for variant in variants):
            score += 0.7
        if any(variant in doc_role_blob for variant in variants):
            score += 0.85
        if any(variant in external_domain_blob for variant in variants):
            score += 1.2 if "." in token else 0.55
        if any(variant in external_blob for variant in variants):
            score += 0.8 if "." in token else 0.55
        if any(variant in related_notes_blob for variant in variants):
            score += 0.32

    for semantic_tag in semantic_hits:
        if semantic_tag in semantic_note_tags:
            score += 0.75
        if semantic_tag and semantic_tag in note_type_blob:
            score += 0.65

    if title_alias_bonus:
        score += title_alias_bonus

    note_project = _safe_str(note.get("project_id_auto", "")).strip()
    if focus_projects:
        normalized_focus_projects = {
            _normalize_phrase(project_id)
            for project_id in focus_projects
            if _normalize_phrase(project_id)
        }
        normalized_note_project = _normalize_phrase(note_project)
        if normalized_note_project and normalized_note_project in normalized_focus_projects:
            score += 2.2
        elif normalized_note_project:
            score -= 1.05

    score += _score_role_alignment(note, role_priors)
    score += _score_layer_alignment(note, role_priors)
    score += _score_implementation_intent(note, question, role_priors)

    normalized_current = _safe_str(current_note_path).replace("\\", "/")
    note_path = _safe_str(note.get("path", "")).replace("\\", "/")
    if normalized_current and note_path == normalized_current:
        score += 0.8 + min(1.2, _score_text_relevance(" ".join(query_tokens), current_note_content, normalized_current))

    if note.get("section_index"):
        score += min(0.5, 0.12 * len(note.get("section_index", [])))
    if note.get("external_refs"):
        score += min(0.3, 0.02 * len(note.get("external_refs", [])))
    return score


def _describe_metadata_match(
    note: dict[str, Any],
    search_blob: dict[str, Any],
    question: str,
    query_tokens: list[str],
    semantic_hits: set[str],
    focus_projects: set[str] | None = None,
) -> list[str]:
    reasons: list[str] = []

    title_blob = search_blob.get("title", "")
    headings_blob = search_blob.get("headings", "")
    section_keys_blob = search_blob.get("section_keys", "")
    path_blob = search_blob.get("path", "")
    folder_blob = search_blob.get("folder", "")
    root_domain_blob = search_blob.get("root_domain", "")
    project_id_blob = search_blob.get("project_id", "")
    note_type_blob = search_blob.get("note_type", "")
    doc_role_blob = search_blob.get("doc_role", "")
    external_domain_blob = search_blob.get("external_ref_domains", "")
    related_notes_blob = search_blob.get("related_notes", "")
    tags_blob = search_blob.get("tags", "")
    keyword_set = search_blob.get("keywords", set())
    role_priors = _infer_doc_role_priors(question, query_tokens)
    _, phrase_reason = _match_title_alias_phrase(search_blob, question)

    matched_titles = []
    matched_sections = []
    matched_paths = []
    matched_projects = []
    matched_domains = []
    matched_related = []
    matched_tags = []
    for token in query_tokens:
        variants = _query_token_variants(token)
        if any(variant in title_blob for variant in variants):
            matched_titles.append(token)
        if any(variant in headings_blob or variant in section_keys_blob for variant in variants):
            matched_sections.append(token)
        if any(variant in path_blob or variant in folder_blob for variant in variants):
            matched_paths.append(token)
        if any(variant in project_id_blob or variant in root_domain_blob for variant in variants):
            matched_projects.append(token)
        if any(variant in external_domain_blob for variant in variants):
            matched_domains.append(token)
        if any(variant in related_notes_blob for variant in variants):
            matched_related.append(token)
        if token in keyword_set or any(variant in tags_blob for variant in variants):
            matched_tags.append(token)

    if matched_titles:
        reasons.append(f"Title overlap: {', '.join(list(dict.fromkeys(matched_titles))[:3])}.")
    elif phrase_reason:
        reasons.append(f"{phrase_reason}.")
    if matched_sections:
        reasons.append(f"Section overlap: {', '.join(list(dict.fromkeys(matched_sections))[:3])}.")
    if matched_paths:
        reasons.append(f"Path or folder overlap: {', '.join(list(dict.fromkeys(matched_paths))[:3])}.")
    if matched_projects:
        reasons.append(f"Project overlap: {', '.join(list(dict.fromkeys(matched_projects))[:3])}.")
    if matched_tags:
        reasons.append(f"Tag or keyword overlap: {', '.join(list(dict.fromkeys(matched_tags))[:3])}.")

    note_project = _safe_str(note.get("project_id_auto", "")).strip()
    if focus_projects and note_project and note_project in focus_projects:
        reasons.append(f"Focused project matched: {note_project}.")

    note_type = _safe_str(note.get("note_type_auto", "")).strip()
    if note_type and (note_type in semantic_hits or note_type in note_type_blob):
        reasons.append(f"Note type matched: {note_type}.")
    doc_role = _safe_str(note.get("doc_role_auto", "")).strip()
    if doc_role and any(variant in doc_role_blob for token in query_tokens for variant in _query_token_variants(token)):
        reasons.append(f"Document role matched: {doc_role}.")
    elif doc_role and _normalize_query_token(doc_role) in role_priors:
        reasons.append(f"Role prior aligned with the question: {doc_role}.")

    note_layer = _normalize_note_layer(note)
    if note_layer == "summary" and any(role in role_priors for role in {"plan", "architecture", "overview"}):
        reasons.append("Structured summary note aligned with the question intent.")
    elif note_layer == "raw" and any(role in role_priors for role in {"implementation", "setup", "review", "next_action"}):
        reasons.append("Raw note layer aligned with the question intent.")

    overlap_tags = [tag for tag in (note.get("semantic_tags_auto", []) or []) if tag in semantic_hits]
    if overlap_tags:
        reasons.append(f"Semantic tag overlap: {', '.join(list(dict.fromkeys(overlap_tags))[:4])}.")

    if matched_domains:
        reasons.append(f"External reference overlap: {', '.join(list(dict.fromkeys(matched_domains))[:3])}.")
    if matched_related:
        reasons.append(f"Related note names overlap: {', '.join(list(dict.fromkeys(matched_related))[:3])}.")
    return reasons[:4]


def _count_focus_matches(
    search_blob: dict[str, Any],
    query_tokens: list[str],
    semantic_hits: set[str],
) -> int:
    title_blob = search_blob.get("title", "")
    headings_blob = search_blob.get("headings", "")
    section_keys_blob = search_blob.get("section_keys", "")
    tags_blob = search_blob.get("tags", "")
    note_type_blob = search_blob.get("note_type", "")
    doc_role_blob = search_blob.get("doc_role", "")
    root_domain_blob = search_blob.get("root_domain", "")
    project_id_blob = search_blob.get("project_id", "")
    external_domain_blob = search_blob.get("external_ref_domains", "")
    external_blob = search_blob.get("external_refs", "")
    keyword_set = search_blob.get("keywords", set())

    matches = 0
    for token in query_tokens:
        variants = _query_token_variants(token)
        project_hit = any(variant in project_id_blob or variant in root_domain_blob for variant in variants)
        role_hit = any(variant in note_type_blob or variant in doc_role_blob for variant in variants)
        structural_hit = any(
            variant in title_blob
            or variant in headings_blob
            or variant in section_keys_blob
            or variant in tags_blob
            for variant in variants
        ) or token in keyword_set

        if project_hit:
            matches += 2
        if role_hit:
            matches += 1
        if _is_explicit_domain_token(token):
            if any(variant in external_domain_blob or variant in external_blob for variant in variants):
                matches += 2
        elif _is_tool_query_token(token, semantic_hits):
            if any(
                variant in title_blob
                or variant in headings_blob
                or variant in section_keys_blob
                or variant in tags_blob
                or variant in note_type_blob
                or variant in doc_role_blob
                for variant in variants
            ) or token in keyword_set:
                matches += 1
        elif structural_hit and (project_hit or role_hit):
            matches += 1
    return matches


def _pick_guaranteed_note_paths(
    ranked_notes: list[tuple[str, float]],
    metadata_by_path: dict[str, dict[str, Any]],
    search_blobs: dict[str, dict[str, Any]],
    query_tokens: list[str],
    semantic_hits: set[str],
    role_priors: dict[str, float],
    focus_projects: set[str] | None = None,
    limit: int = 3,
) -> list[str]:
    if not ranked_notes:
        return []

    top_score = float(ranked_notes[0][1] or 0.0)

    if "implementation" in role_priors and focus_projects:
        implementation_candidates: list[tuple[str, float, int]] = []
        implementation_threshold = max(8.0, top_score * 0.18)
        for note_path, score in ranked_notes:
            note = metadata_by_path.get(note_path)
            search_blob = search_blobs.get(note_path)
            if not note or not search_blob:
                continue
            if _normalize_note_layer(note) != "raw":
                continue
            if _normalize_query_token(note.get("note_type_auto", "")) != "code-note":
                continue
            if _normalize_query_token(note.get("doc_role_auto", "")) != "implementation":
                continue
            focus_matches = _count_focus_matches(search_blob, query_tokens, semantic_hits)
            if score < implementation_threshold and focus_matches <= 0:
                continue
            implementation_candidates.append((note_path, score, focus_matches))

        implementation_candidates.sort(key=lambda item: (-item[2], -item[1], item[0]))
        guaranteed_implementation = [note_path for note_path, _, _ in implementation_candidates[:limit]]
        if guaranteed_implementation:
            return guaranteed_implementation

    guaranteed: list[str] = []
    focus_candidates: list[tuple[str, float, int]] = []
    for note_path, score in ranked_notes:
        note = metadata_by_path.get(note_path)
        search_blob = search_blobs.get(note_path)
        if not search_blob or not note or not _is_guarantee_eligible(note, role_priors):
            continue
        focus_matches = _count_focus_matches(search_blob, query_tokens, semantic_hits)
        if focus_matches <= 0:
            continue
        focus_candidates.append((note_path, score, focus_matches))

    focus_candidates.sort(key=lambda item: (-item[2], -item[1], item[0]))
    focus_threshold = max(4.0, top_score * 0.58)
    for note_path, score, focus_matches in focus_candidates:
        if score >= focus_threshold or focus_matches >= 2:
            guaranteed.append(note_path)
        if len(guaranteed) >= limit:
            break

    if guaranteed:
        return guaranteed

    fallback_threshold = max(4.0, top_score * 0.72)
    for note_path, score in ranked_notes:
        note = metadata_by_path.get(note_path)
        if not note or not _is_guarantee_eligible(note, role_priors):
            continue
        if score < fallback_threshold:
            continue
        guaranteed.append(note_path)
        if len(guaranteed) >= min(2, limit):
            break
    return guaranteed


def _extract_file_sections(note_path: str, note_title: str) -> list[dict[str, Any]]:
    path = Path(note_path)
    if not path.exists():
        return []
    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        return []

    try:
        from backend.src.pipeline.tagger import extract_external_refs, split_frontmatter
        _, body = split_frontmatter(text)
    except Exception:
        extract_external_refs = None
        body = text

    sections: list[dict[str, Any]] = []
    current = {"heading": note_title or path.stem, "level": 1, "lines": []}
    sections.append(current)

    for line in body.splitlines():
        match = re.match(r"^\s{0,3}(#{1,6})\s+(.+?)\s*$", line)
        if match:
            current = {"heading": match.group(2).strip(), "level": len(match.group(1)), "lines": []}
            sections.append(current)
            continue
        current["lines"].append(line)

    finalized: list[dict[str, Any]] = []
    for section in sections:
        raw_content = "\n".join(section.get("lines", [])).strip()
        content = f"## {section['heading']}\n{raw_content}".strip()
        preview = " ".join(line.strip() for line in section.get("lines", []) if line.strip())[:320]
        section_external_refs = extract_external_refs(content)[:8] if extract_external_refs else []
        section_domains: list[str] = []
        for ref in section_external_refs:
            domain = _safe_str(ref.get("domain", "")).strip().lower()
            if domain and domain not in section_domains:
                section_domains.append(domain)
        finalized.append(
            {
                "heading": section["heading"],
                "level": section["level"],
                "key": _normalize_phrase(section.get("heading", "")),
                "content": content[:2400],
                "preview": preview,
                "external_refs": section_external_refs,
                "external_ref_domains": section_domains[:8],
            }
        )
    return finalized


def _score_section_match(
    section: dict[str, Any],
    question: str,
    query_tokens: list[str],
    semantic_hits: set[str],
    note: dict[str, Any],
    base_note_score: float,
    focus_projects: set[str] | None = None,
) -> float:
    heading_blob = _normalize_phrase(section.get("heading", ""))
    preview_blob = _normalize_phrase(section.get("preview", ""))
    content_blob = _normalize_phrase(section.get("content", ""))
    section_domains_blob = _normalize_phrase(" ".join(section.get("external_ref_domains", []) or []))
    section_external_blob = _normalize_phrase(
        " ".join(
            f"{ref.get('label', '')} {ref.get('domain', '')} {ref.get('url', '')}"
            for ref in (section.get("external_refs", []) or [])
            if isinstance(ref, dict)
        )
    )
    external_domains_blob = _normalize_phrase(" ".join(note.get("external_ref_domains", []) or []))
    note_type_blob = _normalize_phrase(note.get("note_type_auto", ""))
    doc_role_blob = _normalize_phrase(note.get("doc_role_auto", ""))
    note_tags_blob = _normalize_phrase(" ".join(note.get("tags", []) or []))
    role_priors = _infer_doc_role_priors(question, query_tokens)
    score = base_note_score * 0.48

    for token in query_tokens:
        variants = _query_token_variants(token)
        if any(variant in heading_blob for variant in variants):
            score += 2.4
        if any(variant in preview_blob for variant in variants):
            score += 1.0
        if any(variant in content_blob for variant in variants):
            score += 0.7
        section_domain_hit = any(variant in section_domains_blob or variant in section_external_blob for variant in variants)
        note_domain_hit = any(variant in external_domains_blob for variant in variants)
        if section_domain_hit:
            score += 5.2 if "." in token else 1.1
        elif note_domain_hit:
            score += 1.1 if "." in token else 0.35
        if any(variant in note_tags_blob for variant in variants):
            score += 0.3
        if any(variant in note_type_blob for variant in variants):
            score += 0.35
        if any(variant in doc_role_blob for variant in variants):
            score += 0.45

    semantic_note_tags = {
        _normalize_query_token(tag)
        for tag in (note.get("semantic_tags_auto", []) or [])
        if _normalize_query_token(tag)
    }
    for semantic_tag in semantic_hits:
        if semantic_tag in semantic_note_tags:
            score += 0.45
        if semantic_tag in heading_blob or semantic_tag in content_blob:
            score += 0.4

    note_project = _normalize_phrase(note.get("project_id_auto", ""))
    if focus_projects:
        normalized_focus_projects = {
            _normalize_phrase(project_id)
            for project_id in focus_projects
            if _normalize_phrase(project_id)
        }
        if note_project and note_project in normalized_focus_projects:
            score += 0.75
        elif note_project:
            score -= 0.4

    score += _score_role_alignment(note, role_priors) * 0.6
    score += _score_layer_alignment(note, role_priors) * 0.55
    return score


def _build_source_from_note(
    note: dict[str, Any],
    score: float,
    source_type: str,
    reason: str,
    section: dict[str, Any] | None = None,
    relation_type: str = "",
    relation_path_text: str = "",
    hop_count: int = 0,
) -> dict[str, Any]:
    note_path = _safe_str(note.get("path", "")).replace("\\", "/")
    content = ""
    snippet = _safe_str(note.get("title", ""))
    if section:
        content = _clip_text(section.get("content", ""), 2400)
        snippet = _clip_text(section.get("preview", "") or content, 240)
    return {
        "path": note_path,
        "name": Path(note_path).name if note_path else _safe_str(note.get("name", "")),
        "layer": _safe_str(note.get("layer", "raw")).lower() or "raw",
        "score": round(score, 3),
        "snippet": snippet,
        "folder": _safe_str(note.get("folder_path", "")),
        "is_main": source_type not in {"links", "related_files", "auto_related"},
        "source": source_type,
        "reason": reason,
        "content": content or _clip_text(_safe_str(note.get("title", "")), 2400),
        "section_heading": _safe_str(section.get("heading", "")) if section else "",
        "note_type": _safe_str(note.get("note_type_auto", "")),
        "doc_role": _safe_str(note.get("doc_role_auto", "")),
        "project_id": _safe_str(note.get("project_id_auto", "")),
        "tags": list(note.get("tags", []) or [])[:6],
        "external_ref_domains": list(note.get("external_ref_domains", []) or [])[:6],
        "relation_type": relation_type,
        "relation_path_text": relation_path_text,
        "hop_count": hop_count,
    }


def _expand_one_hop_sources(
    seed_paths: list[str],
    seed_scores: dict[str, float],
    indices: dict[str, Any],
    question: str,
    query_tokens: list[str],
    semantic_hits: set[str],
    focus_projects: set[str] | None = None,
) -> dict[str, dict[str, Any]]:
    metadata_by_path = indices.get("metadata_by_path", {})
    search_blobs = indices.get("search_blobs", {})
    graph = indices.get("graph", {})
    expanded: dict[str, dict[str, Any]] = {}
    role_priors = _infer_doc_role_priors(question, query_tokens)

    for seed_path in seed_paths[:5]:
        node = graph.get(seed_path, {}) if isinstance(graph, dict) else {}
        seed_score = float(seed_scores.get(seed_path, 0.0) or 0.0)
        if not seed_score:
            continue
        expansions: list[dict[str, Any]] = []
        for link in node.get("wikilinks", []) or []:
            if isinstance(link, dict) and link.get("target"):
                expansions.append(
                    {
                        "source": "links",
                        "target_path": _safe_str(link.get("target")),
                        "ref": _safe_str(link.get("ref", "")),
                        "relation_type": "",
                        "confidence": 0.55,
                    }
                )
        for related in node.get("related_files", []) or []:
            if isinstance(related, dict) and related.get("target"):
                expansions.append(
                    {
                        "source": "related_files",
                        "target_path": _safe_str(related.get("target")),
                        "ref": _safe_str(related.get("ref", "")),
                        "relation_type": "",
                        "confidence": 0.62,
                    }
                )
        for related_note in node.get("related_notes_auto", []) or []:
            normalized_related = _safe_str(related_note).replace("\\", "/").strip()
            if normalized_related:
                expansions.append(
                    {
                        "source": "auto_related",
                        "target_path": normalized_related,
                        "ref": "",
                        "relation_type": "",
                        "confidence": 0.6,
                    }
                )
        for relation_path in _expand_relation_chain_sources(seed_path, indices, question, query_tokens, limit=18):
            target_title = _safe_str((metadata_by_path.get(relation_path.get("target_path", "")) or {}).get("title", ""))
            expansions.append(
                {
                    "source": "typed_relation",
                    "target_path": _safe_str(relation_path.get("target_path", "")),
                    "ref": target_title,
                    "relation_type": _safe_str(relation_path.get("relation_type", "")),
                    "confidence": float(relation_path.get("confidence", 0.0) or 0.0),
                    "direction": _safe_str(relation_path.get("direction", "")) or "forward",
                    "hop_count": int(relation_path.get("hop_count", 1) or 1),
                    "relation_path": list(relation_path.get("relation_path", []) or []),
                    "path_score": float(relation_path.get("path_score", 0.0) or 0.0),
                    "reason": _safe_str(relation_path.get("reason", "")),
                }
            )

        for expansion in expansions:
            source_type = _safe_str(expansion.get("source", "")) or "vault_search"
            target_path = _safe_str(expansion.get("target_path", ""))
            ref_value = _safe_str(expansion.get("ref", ""))
            relation_type = _safe_str(expansion.get("relation_type", ""))
            relation_confidence = float(expansion.get("confidence", 0.0) or 0.0)
            direction = _safe_str(expansion.get("direction", "")) or "forward"
            hop_count = int(expansion.get("hop_count", 1) or 1)
            path_score = float(expansion.get("path_score", 0.0) or 0.0)
            normalized_target = target_path.replace("\\", "/")
            note = metadata_by_path.get(normalized_target)
            search_blob = search_blobs.get(normalized_target)
            if not note or not search_blob:
                continue
            relevance = _score_metadata_overlap(
                note,
                search_blob,
                question=question,
                query_tokens=query_tokens,
                semantic_hits=semantic_hits,
                current_note_path="",
                current_note_content="",
                focus_projects=focus_projects,
            )
            total_score = (seed_score * 0.28) + (relevance * 0.9)
            if relation_type:
                total_score += (
                    path_score
                    if hop_count > 1 and path_score > 0
                    else _score_relation_alignment(relation_type, relation_confidence, role_priors)
                )
                if direction == "reverse" and hop_count <= 1:
                    total_score += 0.18
            if total_score < 2.4:
                continue
            existing = expanded.get(normalized_target)
            reason = _safe_str(expansion.get("reason", ""))
            if not reason:
                reason = (
                    f"Expanded one hop from [[{Path(seed_path).stem}]] via [[{ref_value or Path(normalized_target).stem}]]."
                    if source_type == "links"
                    else (
                        f"Expanded one hop from related_files entry {ref_value or Path(normalized_target).name} near [[{Path(seed_path).stem}]]."
                        if source_type == "related_files"
                        else (
                            f"Expanded one hop from auto-related note [[{Path(normalized_target).stem}]] near [[{Path(seed_path).stem}]]."
                            if source_type == "auto_related"
                            else (
                                f"Expanded through typed relation `{relation_type}` from [[{Path(seed_path).stem}]] to [[{Path(normalized_target).stem}]]."
                                if direction != "reverse"
                                else f"Expanded through reverse typed relation `{relation_type}` into [[{Path(normalized_target).stem}]] from [[{Path(seed_path).stem}]]."
                            )
                        )
                    )
                )
            if not existing or total_score > float(existing.get("score", 0.0) or 0.0):
                expanded[normalized_target] = {
                    "note": note,
                    "score": total_score,
                    "source": source_type,
                    "reason": reason,
                    "relation_type": relation_type,
                    "relation_path_text": _safe_str(expansion.get("reason", "")),
                    "hop_count": hop_count,
                }
    return expanded


def _is_vault_search_confident(sources: list[dict[str, Any]]) -> bool:
    if not sources:
        return False
    top_score = max(float(source.get("score", 0.0) or 0.0) for source in sources)
    if top_score >= 7.5:
        return True
    if top_score >= 5.8 and len(sources) >= 2:
        return True
    return len(sources) >= 4 and top_score >= 4.4


def _route_obsidian_chat(request: ObsidianChatRequest) -> tuple[str, list[dict[str, Any]]]:
    has_current_note = bool(_safe_str(request.current_note_path).strip())
    if has_current_note and request.attach_current_note:
        return "current_note", _build_obsidian_sources(request)

    vault_sources = _collect_vault_search_sources(request)
    if _is_vault_search_confident(vault_sources):
        return "vault_search", vault_sources

    if _question_prefers_general_knowledge(request.question):
        return "general_knowledge", []

    if vault_sources:
        return "vault_search", vault_sources

    if has_current_note:
        return "current_note", _build_obsidian_sources(request)

    return "general_knowledge", []


def _build_general_messages(
    request: ObsidianChatRequest,
    expects_obsidian_context: bool = False,
) -> list[tuple[str, str]]:
    requested_language = "Korean" if _safe_str(request.language).lower().startswith("ko") else "English"
    context_line = (
        "The user appears to expect Obsidian-specific context, but no reliable local note evidence was available for this turn. State that limitation before giving any general guidance."
        if expects_obsidian_context
        else "Use general knowledge because no reliable Obsidian note context was selected for this turn."
    )
    system_prompt = f"""You are a pragmatic assistant.

Answer the user's question directly.
{context_line}
Use the recent conversation only to preserve continuity, but answer the latest user question directly.
If the latest question is a follow-up that omits the topic, recover that missing topic from the recent conversation before answering.
If the answer is uncertain, say what is uncertain.
Answer in {requested_language} unless the user explicitly asks for another language.
"""
    sections = [
        "[User Question]",
        _clip_text(request.question, 4000),
    ]
    sections.extend(_build_recent_conversation_sections(request))
    return [
        ("system", system_prompt),
        ("human", "\n".join(sections)),
    ]



def _source_from_context_entry(entry: ObsidianContextRequest, score: float) -> dict[str, Any]:
    normalized_path = _safe_str(entry.path).strip().replace("\\", "/")
    snippet = " ".join(_safe_str(entry.content).split())[:240]
    return {
        "path": normalized_path,
        "name": Path(normalized_path).name,
        "layer": "raw",
        "score": score,
        "snippet": snippet,
        "folder": str(Path(normalized_path).parent).replace("\\", "/"),
        "is_main": False,
        "source": _safe_str(entry.source) or "context",
        "reason": f"Matched the question and was attached from {_safe_str(entry.source) or 'context'}.",
        "content": _clip_text(entry.content, 4000),
    }


def _source_from_current_note(request: ObsidianChatRequest, score: float) -> dict[str, Any]:
    normalized_path = _safe_str(request.current_note_path).strip().replace("\\", "/")
    snippet = " ".join(_safe_str(request.current_note_content).split())[:240]
    return {
        "path": normalized_path,
        "name": Path(normalized_path).name,
        "layer": "raw",
        "score": score,
        "snippet": snippet,
        "folder": str(Path(normalized_path).parent).replace("\\", "/"),
        "is_main": False,
        "source": "current_candidate",
        "reason": "Current note content overlaps with the question, so it was added as a supporting candidate.",
        "content": _clip_text(request.current_note_content, 4000),
    }


def _sanitize_stream_sources(sources: list[dict[str, Any]]) -> list[dict[str, Any]]:
    sanitized: list[dict[str, Any]] = []
    for source in sources:
        sanitized.append({key: value for key, value in source.items() if key != "content"})
    return sanitized


def _build_follow_up_recommendations(
    request: ObsidianChatRequest,
    routed_sources: list[dict[str, Any]],
    limit: int = 6,
) -> list[dict[str, Any]]:
    indices = _load_obsidian_indices()
    if not indices:
        return []

    metadata_by_path = indices.get("metadata_by_path", {})
    search_blobs = indices.get("search_blobs", {})
    if not metadata_by_path:
        return []

    rules = _load_runtime_tagger_rules()
    query_tokens = _tokenize_query(request.question)
    semantic_hits = _detect_query_semantic_tags(request.question, rules)
    role_priors = _infer_doc_role_priors(request.question, query_tokens)
    focus_projects = _infer_query_project_focus(request.question, query_tokens, search_blobs)

    seed_paths: list[str] = []
    seen_seed_paths: set[str] = set()

    def add_seed(path_value: str) -> None:
        normalized = _safe_str(path_value).replace("\\", "/").strip()
        if not normalized or normalized in seen_seed_paths or normalized not in metadata_by_path:
            return
        seen_seed_paths.add(normalized)
        seed_paths.append(normalized)

    add_seed(request.current_note_path)
    for source in routed_sources[:4]:
        if not isinstance(source, dict):
            continue
        add_seed(_safe_str(source.get("path", "")))

    if not seed_paths:
        return []

    candidates: dict[str, dict[str, Any]] = {}

    def record_candidate(
        target_path: str,
        relation_type: str,
        relation_confidence: float,
        seed_path: str,
        reason: str,
        direction: str,
        relation_path_text: str,
        hop_count: int,
        path_score: float,
    ) -> None:
        normalized_target = _safe_str(target_path).replace("\\", "/").strip()
        relation_key = _normalize_query_token(relation_type)
        if (
            not normalized_target
            or normalized_target in seen_seed_paths
            or normalized_target not in metadata_by_path
            or not relation_key
        ):
            return

        note = metadata_by_path.get(normalized_target) or {}
        search_blob = search_blobs.get(normalized_target)
        base_score = (
            float(path_score or 0.0)
            if hop_count > 1 and path_score > 0
            else RELATION_RETRIEVAL_WEIGHTS.get(relation_key, 0.45) * 1.2
        )
        confidence_score = max(0.0, min(1.0, relation_confidence or 0.0)) * 0.95
        relation_score = _score_relation_alignment(relation_type, relation_confidence, role_priors) * 0.5
        metadata_score = 0.0
        if search_blob:
            metadata_score = _score_metadata_overlap(
                note,
                search_blob,
                question=request.question,
                query_tokens=query_tokens,
                semantic_hits=semantic_hits,
                current_note_path="",
                current_note_content="",
                focus_projects=focus_projects,
            ) * 0.18
        total_score = base_score + confidence_score + relation_score + metadata_score
        if direction == "reverse":
            total_score -= 0.12
        if hop_count > 1:
            total_score -= 0.08 * max(0, hop_count - 1)

        existing = candidates.get(normalized_target)
        seed_title = _safe_str((metadata_by_path.get(seed_path) or {}).get("title", "")) or Path(seed_path).stem
        if not existing:
            candidates[normalized_target] = {
                "path": normalized_target,
                "name": _safe_str(note.get("title", "")) or Path(normalized_target).stem,
                "relation_type": relation_type,
                "confidence": round(max(0.0, min(1.0, relation_confidence or 0.0)), 3),
                "reason": reason,
                "relation_path_text": relation_path_text,
                "hop_count": hop_count,
                "seed_paths": {seed_path},
                "seed_titles": {seed_title},
                "score": total_score,
                "note_type": _safe_str(note.get("note_type_auto", "")),
                "doc_role": _safe_str(note.get("doc_role_auto", "")),
                "project_id": _safe_str(note.get("project_id_auto", "")),
                "folder": _safe_str(note.get("folder_path", "")),
            }
            return

        existing["seed_paths"].add(seed_path)
        existing["seed_titles"].add(seed_title)
        if total_score > float(existing.get("score", 0.0) or 0.0):
            existing["score"] = total_score
            existing["relation_type"] = relation_type
            existing["confidence"] = round(max(0.0, min(1.0, relation_confidence or 0.0)), 3)
            existing["reason"] = reason
            existing["relation_path_text"] = relation_path_text
            existing["hop_count"] = hop_count
            existing["note_type"] = _safe_str(note.get("note_type_auto", "")) or _safe_str(existing.get("note_type", ""))
            existing["doc_role"] = _safe_str(note.get("doc_role_auto", "")) or _safe_str(existing.get("doc_role", ""))
            existing["project_id"] = _safe_str(note.get("project_id_auto", "")) or _safe_str(existing.get("project_id", ""))
            existing["folder"] = _safe_str(note.get("folder_path", "")) or _safe_str(existing.get("folder", ""))

    for seed_path in seed_paths[:4]:
        seed_note = metadata_by_path.get(seed_path) or {}
        for relation_path in _expand_relation_chain_sources(seed_path, indices, request.question, query_tokens, limit=24):
            record_candidate(
                target_path=_safe_str(relation_path.get("target_path", "")),
                relation_type=_safe_str(relation_path.get("relation_type", "")),
                relation_confidence=float(relation_path.get("confidence", 0.0) or 0.0),
                seed_path=seed_path,
                reason=_safe_str(relation_path.get("reason", "")),
                direction=_safe_str(relation_path.get("direction", "")) or "forward",
                relation_path_text=_safe_str(relation_path.get("reason", "")),
                hop_count=int(relation_path.get("hop_count", 1) or 1),
                path_score=float(relation_path.get("path_score", 0.0) or 0.0),
            )

    ranked_candidates: list[dict[str, Any]] = []
    for candidate in candidates.values():
        seed_count = len(candidate.get("seed_paths", set()))
        candidate["score"] = float(candidate.get("score", 0.0) or 0.0) + max(0, seed_count - 1) * 0.28
        candidate["seed_paths"] = sorted(candidate.get("seed_paths", set()))
        candidate["seed_titles"] = sorted(candidate.get("seed_titles", set()))
        ranked_candidates.append(candidate)

    ranked_candidates.sort(
        key=lambda item: (
            -float(item.get("score", 0.0) or 0.0),
            -float(item.get("confidence", 0.0) or 0.0),
            _safe_str(item.get("name", "")),
        )
    )

    recommendations: list[dict[str, Any]] = []
    for item in ranked_candidates[:limit]:
        recommendations.append(
            {
                "path": _safe_str(item.get("path", "")),
                "name": _safe_str(item.get("name", "")),
                "relation_type": _safe_str(item.get("relation_type", "")),
                "confidence": round(float(item.get("confidence", 0.0) or 0.0), 3),
                "reason": _safe_str(item.get("reason", "")),
                "relation_path_text": _safe_str(item.get("relation_path_text", "")),
                "hop_count": int(item.get("hop_count", 0) or 0),
                "note_type": _safe_str(item.get("note_type", "")),
                "doc_role": _safe_str(item.get("doc_role", "")),
                "project_id": _safe_str(item.get("project_id", "")),
                "folder": _safe_str(item.get("folder", "")),
                "seed_titles": list(item.get("seed_titles", []))[:3],
            }
        )
    return recommendations


def _collect_vault_search_sources(request: ObsidianChatRequest, limit: int = 8) -> list[dict[str, Any]]:
    indices = _load_obsidian_indices()
    if not indices:
        return []

    notes = indices.get("notes", [])
    metadata_by_path = indices.get("metadata_by_path", {})
    search_blobs = indices.get("search_blobs", {})
    text_index = indices.get("text_index", {})
    reverse_relations = indices.get("typed_relation_reverse", {})
    doc_count = int(indices.get("doc_count", 0) or 0)
    if not notes or not metadata_by_path:
        return []

    rules = _load_runtime_tagger_rules()
    query_tokens = _tokenize_query(request.question)
    semantic_hits = _detect_query_semantic_tags(request.question, rules)
    role_priors = _infer_doc_role_priors(request.question, query_tokens)
    focus_projects = _infer_query_project_focus(request.question, query_tokens, search_blobs)
    raw_text_scores = _score_text_index_hits(query_tokens, semantic_hits, text_index, doc_count)
    text_scores: dict[str, float] = {}
    for note_path, raw_score in raw_text_scores.items():
        note = metadata_by_path.get(note_path)
        if not note:
            text_scores[note_path] = raw_score
            continue
        text_scores[note_path] = _rebalance_text_index_score(
            note,
            raw_score,
            request.question,
            role_priors,
            focus_projects=focus_projects,
        )

    candidate_scores: dict[str, float] = dict(text_scores)
    candidate_reasons: dict[str, list[str]] = defaultdict(list)
    for note_path, score in text_scores.items():
        if score > 0:
            candidate_reasons[note_path].append("Matched raw text index tokens from the question.")

    current_note_path = _safe_str(request.current_note_path).strip().replace("\\", "/")
    current_note_content = _safe_str(request.current_note_content)

    for note in notes:
        if not isinstance(note, dict):
            continue
        note_path = _safe_str(note.get("path", "")).replace("\\", "/")
        search_blob = search_blobs.get(note_path)
        if not note_path or not search_blob:
            continue
        metadata_score = _score_metadata_overlap(
            note,
            search_blob,
            request.question,
            query_tokens,
            semantic_hits,
            current_note_path=current_note_path,
            current_note_content=current_note_content,
            focus_projects=focus_projects,
        )
        if metadata_score > 0:
            candidate_scores[note_path] = candidate_scores.get(note_path, 0.0) + metadata_score
            detailed_reasons = _describe_metadata_match(
                note,
                search_blob,
                request.question,
                query_tokens,
                semantic_hits,
                focus_projects=focus_projects,
            )
            if detailed_reasons:
                candidate_reasons[note_path].extend(detailed_reasons)
            elif metadata_score >= 1.6:
                candidate_reasons[note_path].append("Matched note title, headings, folder, or metadata signals.")

        relation_support = _score_relation_support(note, reverse_relations, role_priors)
        if relation_support > 0:
            candidate_scores[note_path] = candidate_scores.get(note_path, 0.0) + relation_support
            relation_reason = _describe_relation_support(note, reverse_relations, role_priors)
            if relation_reason:
                candidate_reasons[note_path].append(relation_reason)

    if current_note_path and current_note_path in metadata_by_path:
        note_score = _score_text_relevance(request.question, current_note_content, current_note_path)
        if request.attach_current_note:
            candidate_scores[current_note_path] = candidate_scores.get(current_note_path, 0.0) + 1.8 + note_score
            candidate_reasons[current_note_path].append("Attached current note because the question explicitly referred to it.")
        elif note_score >= 0.3:
            candidate_scores[current_note_path] = candidate_scores.get(current_note_path, 0.0) + 0.8 + note_score
            candidate_reasons[current_note_path].append("Current note overlaps with the question and was kept as a supporting candidate.")

    for entry in request.context_entries:
        entry_path = _safe_str(entry.path).strip().replace("\\", "/")
        if not entry_path or entry_path not in metadata_by_path:
            continue
        entry_score = _score_text_relevance(request.question, entry.content, entry_path)
        if entry_score < 0.24:
            continue
        candidate_scores[entry_path] = candidate_scores.get(entry_path, 0.0) + 0.7 + entry_score
        candidate_reasons[entry_path].append(
            f"Attached supporting note from {_safe_str(entry.source) or 'context'} because it overlaps with the question."
        )

    seed_paths = [
        note_path for note_path, score in sorted(candidate_scores.items(), key=lambda item: (-item[1], item[0]))
        if score >= 2.1 and note_path in metadata_by_path
    ][:8]

    hop_candidates = _expand_one_hop_sources(
        seed_paths,
        candidate_scores,
        indices,
        request.question,
        query_tokens,
        semantic_hits,
        focus_projects=focus_projects,
    )
    for note_path, payload in hop_candidates.items():
        candidate_scores[note_path] = _merge_hop_candidate_score(candidate_scores.get(note_path, 0.0), payload)
        candidate_reasons[note_path].append(_safe_str(payload.get("reason", "")))

    all_ranked_notes = [
        (note_path, score)
        for note_path, score in sorted(candidate_scores.items(), key=lambda item: (-item[1], item[0]))
        if note_path in metadata_by_path and score >= 2.1
    ]
    guaranteed_paths = _pick_guaranteed_note_paths(
        all_ranked_notes,
        metadata_by_path,
        search_blobs,
        query_tokens,
        semantic_hits,
        role_priors,
        focus_projects=focus_projects,
    )
    guaranteed_set = set(guaranteed_paths)
    ranked_notes = []
    for note_path, score in all_ranked_notes:
        if note_path in guaranteed_set or len(ranked_notes) < 12:
            ranked_notes.append((note_path, score))
    ranked_notes = ranked_notes[: 12 + len(guaranteed_paths)]

    section_candidates: list[dict[str, Any]] = []
    best_section_by_note: dict[str, dict[str, Any]] = {}
    for note_path, note_score in ranked_notes:
        note = metadata_by_path[note_path]
        file_sections = _extract_file_sections(note_path, _safe_str(note.get("title", "")))
        if not file_sections:
            continue
        scored_sections = sorted(
            (
                (
                    _score_section_match(
                        section,
                        request.question,
                        query_tokens,
                        semantic_hits,
                        note,
                        note_score,
                        focus_projects=focus_projects,
                    ),
                    section,
                )
                for section in file_sections
            ),
            key=lambda item: item[0],
            reverse=True,
        )
        best_sections = [item for item in scored_sections if item[0] >= max(2.8, note_score * 0.4)][:2]
        if not best_sections and scored_sections:
            best_sections = scored_sections[:1]
        if best_sections:
            best_section_by_note[note_path] = {
                "path": note_path,
                "note": note,
                "score": float(best_sections[0][0]),
                "section": best_sections[0][1],
            }
        for section_score, section in best_sections:
            section_candidates.append(
                {
                    "path": note_path,
                    "note": note,
                    "score": section_score,
                    "section": section,
                }
            )

    final_sources: list[dict[str, Any]] = []
    seen_paths: set[str] = set()

    def append_item(item: dict[str, Any]) -> None:
        note_path = item["path"]
        if note_path in seen_paths:
            return
        note = item["note"]
        source_type = "vault_search"
        direct_reasons = [
            reason for reason in candidate_reasons.get(note_path, [])
            if reason and not reason.startswith("Expanded one hop")
        ]
        if current_note_path and note_path == current_note_path and request.attach_current_note:
            source_type = "current"
        elif current_note_path and note_path == current_note_path:
            source_type = "current_candidate"
        elif note_path in hop_candidates and not direct_reasons:
            source_type = _safe_str(hop_candidates[note_path].get("source", "")) or "vault_search"

        reasons = [reason for reason in dict.fromkeys(candidate_reasons.get(note_path, [])) if reason]
        note_semantic_tags = note.get("semantic_tags_auto", []) or []
        overlap_tags = [tag for tag in note_semantic_tags if tag in semantic_hits]
        if overlap_tags:
            reasons.append(f"Semantic tag overlap: {', '.join(overlap_tags[:4])}.")
        reason = " ".join(reasons[:3]) or "Matched note sections and metadata signals for the question."
        final_sources.append(
            _build_source_from_note(
                note,
                score=float(item["score"]),
                source_type=source_type,
                reason=reason,
                section=item["section"],
                relation_type=_safe_str(hop_candidates.get(note_path, {}).get("relation_type", "")),
                relation_path_text=_safe_str(hop_candidates.get(note_path, {}).get("relation_path_text", "")),
                hop_count=int(hop_candidates.get(note_path, {}).get("hop_count", 0) or 0),
            )
        )
        seen_paths.add(note_path)

    for note_path in guaranteed_paths:
        guaranteed_item = best_section_by_note.get(note_path)
        if guaranteed_item:
            append_item(guaranteed_item)
        if len(final_sources) >= limit:
            break

    for item in sorted(section_candidates, key=lambda candidate: (-candidate["score"], candidate["path"])):
        append_item(item)
        if len(final_sources) >= limit:
            break

    if not final_sources and current_note_path and request.attach_current_note:
        return _build_obsidian_sources(request)
    return final_sources


def _build_vault_search_messages(
    request: ObsidianChatRequest,
    sources: list[dict[str, Any]],
) -> list[tuple[str, str]]:
    requested_language = "Korean" if _safe_str(request.language).lower().startswith("ko") else "English"
    sections = [
        "[User Question]",
        _clip_text(request.question, 4000),
    ]
    sections.extend(_build_recent_conversation_sections(request))
    sections.extend([
        "",
        "[Retrieved Note Sections]",
    ])
    for source in sources[:8]:
        sections.extend(
            [
                "",
                f"### {source.get('path', '')}",
                f"Source: {source.get('source', 'vault_search')}",
                f"Layer: {source.get('layer', '')}",
                f"Reason: {source.get('reason', '')}",
                f"Note Type: {source.get('note_type', '')}",
                f"Document Role: {source.get('doc_role', '')}",
                f"Relation Type: {source.get('relation_type', '')}",
                f"Project: {source.get('project_id', '')}",
                f"Section: {source.get('section_heading', '')}",
                f"External Domains: {', '.join(source.get('external_ref_domains', []) or [])}",
                _clip_text(source.get("content", ""), 4000) or _safe_str(source.get("snippet", "")) or "(empty note)",
            ]
        )

    system_prompt = f"""You are an Obsidian knowledge assistant.

Use the retrieved note sections that are most relevant to the user's question.
Treat these sections as the primary local evidence for this answer.
Use structured summary notes as strong anchors for architecture, overview, and plan questions.
Use raw notes and direct note content as the primary evidence for implementation, setup, review, and next-step questions.
When both summary and raw notes appear, synthesize them instead of ignoring one layer.
Do not assume the currently open note is primary unless the question clearly depends on it.
Use the recent conversation only to preserve continuity, but answer the latest user question directly.
If the latest question is a follow-up that omits the topic, recover that missing topic from the recent conversation before answering.
If the retrieved sections are insufficient, say what is missing instead of inventing facts.
When citing notes, prefer Obsidian wiki link format such as [[note/path]].
Answer in {requested_language} unless the user explicitly asks for another language.
"""
    return [
        ("system", system_prompt),
        ("human", "\n".join(sections)),
    ]



def _compute_tool_defaults(combined_config: dict[str, Any]) -> dict[str, str]:
    from backend.src.pipeline.generator import resolve_path
    from backend.config.paths import OBSIDIAN_ROOT

    system_config = combined_config.get("system", {}) or {}
    obsidian_root_path = OBSIDIAN_ROOT if isinstance(OBSIDIAN_ROOT, Path) else None
    obsidian_root = str(obsidian_root_path) if obsidian_root_path else ""
    obsidian_10 = obsidian_root_path / "10_AI_Engineering" if obsidian_root_path else None
    obsidian_11 = obsidian_root_path / "11_RAG_Knowledge_Base" if obsidian_root_path else None

    def pick_existing_dir(candidates: list[Any]) -> str:
        for candidate in candidates:
            if not candidate:
                continue
            try:
                resolved = resolve_path(_safe_str(candidate))
            except Exception:
                continue
            if resolved.exists() and resolved.is_dir():
                return str(resolved)
        return ""

    default_input_dir = pick_existing_dir(
        [
            system_config.get("root_input_dir"),
            os.getenv("DATA_DIC_PATH"),
            str(obsidian_10) if obsidian_10 and obsidian_10.exists() else None,
            obsidian_root,
            str((BASE_DIR / "data" / "raw").resolve()),
        ]
    ) or "./data/raw"

    default_output_dir = pick_existing_dir(
        [
            system_config.get("root_output_dir"),
            os.getenv("DATA_SUMMATION_PATH"),
            str(obsidian_11) if obsidian_11 and obsidian_11.exists() else None,
            obsidian_root,
            str((BASE_DIR / "data" / "generated").resolve()),
        ]
    ) or "./data/generated"

    return {
        "default_input_dir": default_input_dir,
        "default_output_dir": default_output_dir,
    }


def _load_tagger_index_manifest() -> dict[str, Any]:
    manifest_path = (BASE_DIR / "data" / "indexes" / "obsidian_index_manifest.json").resolve()
    if not manifest_path.exists():
        return {}
    try:
        payload = json.loads(manifest_path.read_text(encoding="utf-8"))
    except Exception:
        return {}
    if not isinstance(payload, dict):
        return {}
    payload["manifest_path"] = str(manifest_path)
    return payload


def _load_tagger_rules_config() -> dict[str, Any]:
    try:
        from backend.src.pipeline.tagger import load_tagger_rules

        rules = load_tagger_rules()
    except Exception:
        logger.exception("failed to load tagger rules config")
        return {}

    canonical_groups = rules.get("canonical_groups", {}) or {}
    return {
        "workspace": rules.get("workspace", {}) or {},
        "canonical_tag_count": len(rules.get("canonical_tags", []) or []),
        "canonical_groups": {
            str(key): len(value or [])
            for key, value in canonical_groups.items()
        },
        "synonym_entries": len(rules.get("synonym_map", {}) or {}),
        "thresholds": rules.get("thresholds", {}) or {},
    }


def _build_tools_config() -> dict[str, Any]:
    from backend.src.pipeline.generator import load_combined_config, resolve_path

    combined_config = load_combined_config()
    defaults = _compute_tool_defaults(combined_config)
    patterns = combined_config.get("patterns", {}) or {}
    jobs = combined_config.get("jobs", []) or []
    models = combined_config.get("models", {}) or {}
    pattern_metadata = combined_config.get("_pattern_metadata", {}) or {}
    pattern_groups = combined_config.get("target_sets", {}) or {}

    return {
        "system": combined_config.get("system", {}) or {},
        "defaults": combined_config.get("defaults", {}) or {},
        "model_options": list(models.keys()) or ["qwen3.5:4b", "gpt-4o", "gpt-4-turbo"],
        "jobs": [
            {
                "name": _safe_str(job.get("name", "")),
                "subject": _safe_str(job.get("subject", "")),
                "input_dir": _safe_str(job.get("input_dir", "")),
                "output_dir": _safe_str(job.get("output_dir", "")),
                "input_dir_resolved": _safe_str(resolve_path(_safe_str(job.get("input_dir", "")))) if job.get("input_dir") else "",
                "output_dir_resolved": _safe_str(resolve_path(_safe_str(job.get("output_dir", "")))) if job.get("output_dir") else "",
                "model": _safe_str(job.get("model", "")),
                "temperature": job.get("temperature"),
                "targets": list(job.get("targets", []) or job.get("patterns", []) or job.get("pattern_keys", []) or []),
                "ingest": job.get("ingest", {}) if isinstance(job.get("ingest"), dict) else {},
            }
            for job in jobs
            if isinstance(job, dict)
        ],
        "patterns": list(patterns.keys()),
        "pattern_previews": {
            key: {
                "system_role": _safe_str(value.get("system_role", "")) if isinstance(value, dict) else "",
                "prompt_template": _safe_str(value.get("prompt_template", "")) if isinstance(value, dict) else _safe_str(value),
                "source": _safe_str(pattern_metadata.get(key, {}).get("source", "")),
                "source_path": _safe_str(pattern_metadata.get(key, {}).get("source_path", "")),
                "editor_note_path": _safe_str(pattern_metadata.get(key, {}).get("editor_note_path", "")),
                "groups": list(pattern_metadata.get(key, {}).get("groups", []) or []),
                "output_suffix": _safe_str(pattern_metadata.get(key, {}).get("output_suffix", "")),
                "use_subject_prefix": bool(pattern_metadata.get(key, {}).get("use_subject_prefix", False)),
            }
            for key, value in patterns.items()
        },
        "target_sets": pattern_groups,
        "pattern_groups": pattern_groups,
        "pattern_editor": combined_config.get("_pattern_editor", {}) or {},
        "tagger_index_manifest": _load_tagger_index_manifest(),
        "tagger_rules": _load_tagger_rules_config(),
        **defaults,
    }


async def _stream_blocking_runner(
    runner: Callable[[Callable[[dict[str, Any]], None]], dict[str, Any] | None]
):
    queue: asyncio.Queue[dict[str, Any] | None] = asyncio.Queue()
    loop = asyncio.get_running_loop()

    def emit(payload: dict[str, Any]) -> None:
        loop.call_soon_threadsafe(queue.put_nowait, payload)

    def worker() -> None:
        try:
            result = runner(emit) or {}
            emit({"step": "done", **result})
        except Exception as error:
            logger.exception("tool stream error")
            emit({"step": "error", "message": str(error)})
        finally:
            loop.call_soon_threadsafe(queue.put_nowait, None)

    thread = threading.Thread(target=worker, daemon=True)
    thread.start()

    while True:
        item = await queue.get()
        if item is None:
            break
        yield to_json_line(item)
        await asyncio.sleep(0)


@app.get("/health")
def health_check():
    return {"status": "ok", "engine": engine_status}


@app.post("/api/chat/stop")
async def stop_generation(
    req: Optional[StopRequest] = None,
    session_id: Optional[str] = Query(default=None),
):
    """스트리밍 생성 중단 요청을 처리한다."""
    target_session_id = req.session_id if req and req.session_id else session_id
    if not target_session_id:
        raise HTTPException(status_code=422, detail="session_id is required")

    stop_manager.set(target_session_id)
    return {"status": "stopped", "session_id": target_session_id}


@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """질문에 대해 전략 수립(옵션) 후 AgenticFlow 스트리밍 결과를 반환한다."""
    if engine_status != "ready":
        raise HTTPException(status_code=503, detail="System warming up...")

    session_id = request.session_id or str(uuid.uuid4())
    stop_manager.clear(session_id)
    logger.info(f"[CHAT START] session={session_id} query={request.query[:120]}")

    async def event_generator():
        try:
            model = get_model(config, request.model_name)
            strategy_text = ""

            if ENABLE_STRATEGY_PLANNER:
                yield to_json_line({"step": "thinking", "logs": ["전략 계획 생성 중..."]})
                strategy_prompt = f"""
                {MAIN_SYSTEM_PROMPT}

                [임무]
                사용자 질문: "{request.query}"

                질문에 대해 RAG 그래프 실행 전략을 3줄 이내로 제시하라.
                """
                try:
                    res = await model.ainvoke(strategy_prompt)
                    strategy_text = res.content if hasattr(res, "content") else str(res)
                except Exception as e:
                    logger.warning(f"strategy planner failed, fallback to empty strategy: {e}")
                    strategy_text = ""

            iterator = agent_flow.run(
                query=request.query,
                project_name=request.project_name,
                llm=model,
                strategy=strategy_text,
                history=request.history,
            )

            for update in iterator:
                if stop_manager.check(session_id):
                    yield to_json_line(
                        {"step": "stopped", "answer": "사용자 요청으로 생성을 중단했습니다."}
                    )
                    return

                yield to_json_line(_enrich_update(update))
                await asyncio.sleep(0)

        except Exception as e:
            logger.error(f"chat_stream error: {e}")
            traceback.print_exc()
            yield to_json_line({"step": "error", "answer": str(e)})
        finally:
            stop_manager.clear(session_id)

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")


@app.post("/api/chat/obsidian/stream")
async def obsidian_chat_stream(request: ObsidianChatRequest):
    if engine_status != "ready":
        raise HTTPException(status_code=503, detail="System warming up...")

    session_id = request.session_id or str(uuid.uuid4())
    stop_manager.clear(session_id)
    route, routed_sources = _route_obsidian_chat(request)
    logger.info(
        "[OBSIDIAN CHAT START] session=%s route=%s note=%s question=%s",
        session_id,
        route,
        request.current_note_path,
        request.question[:120],
    )

    async def event_generator():
        try:
            model = get_model(config, request.model_name)
            expects_obsidian_context = _question_expects_obsidian_context(request.question)
            if route == "vault_search":
                basis = "obsidian_search"
                sources = _sanitize_stream_sources(routed_sources)
                messages = _build_vault_search_messages(request, routed_sources)
            else:
                sources = routed_sources or _build_obsidian_sources(request)
                if route == "general_knowledge":
                    messages = _build_general_messages(request, expects_obsidian_context=expects_obsidian_context)
                    basis = "general_knowledge"
                else:
                    messages = _build_obsidian_messages(request)
                    basis = "current_note"
            recommendations = _build_follow_up_recommendations(request, routed_sources)
            answer = ""

            yield to_json_line({
                "step": "init",
                "route": route,
                "basis": basis,
                "sources": sources,
                "recommendations": recommendations,
            })

            for chunk in model.stream(messages):
                if stop_manager.check(session_id):
                    stopped_message = "생성이 중단되었습니다." if request.language.startswith("ko") else "Generation stopped."
                    yield to_json_line(
                        {
                            "step": "stopped",
                            "answer": answer or stopped_message,
                            "sources": sources,
                            "route": route,
                            "basis": basis,
                            "recommendations": recommendations,
                        }
                    )
                    return

                text = chunk.content if hasattr(chunk, "content") else str(chunk)
                if not text:
                    continue

                answer += text
                yield to_json_line({"step": "generating", "answer": answer, "route": route, "basis": basis})
                await asyncio.sleep(0)

            yield to_json_line({
                "step": "done",
                "answer": answer,
                "sources": sources,
                "route": route,
                "basis": basis,
                "recommendations": recommendations,
            })
        except Exception as e:
            logger.error(f"obsidian_chat_stream error: {e}")
            traceback.print_exc()
            yield to_json_line({"step": "error", "answer": str(e), "route": route})
        finally:
            stop_manager.clear(session_id)

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")


@app.get("/api/tools/config")
def tools_config():
    return _build_tools_config()


@app.post("/api/tools/files")
def tools_files(request: FilesRequest):
    from backend.src.pipeline.generator import list_files_relative, resolve_path

    resolved = resolve_path(request.path)
    if not resolved.exists() or not resolved.is_dir():
        raise HTTPException(status_code=404, detail="Directory not found")

    files = list_files_relative(resolved)
    file_entries = []
    for relative in files:
        full_path = resolved / relative
        try:
            size = full_path.stat().st_size
        except OSError:
            size = 0
        normalized_relative = relative.replace("\\", "/")
        folder = normalized_relative.split("/", 1)[0] if "/" in normalized_relative else "(root)"
        file_entries.append(
            {
                "path": relative,
                "folder": folder,
                "size": size,
            }
        )

    return {
        "path": str(resolved),
        "files": files,
        "file_entries": file_entries,
    }


@app.post("/api/tools/generator/stream")
async def generator_stream(request: GeneratorRequest):
    async def event_generator():
        def runner(emit: Callable[[dict[str, Any]], None]) -> dict[str, Any]:
            from backend.src.pipeline.generator import load_combined_config, run_ad_hoc_job

            selected_job = request.job_name.strip()
            ui_patterns = list(request.pattern_keys or [])
            final_patterns = list(ui_patterns)

            def bridge_logger(message: str, progress: Optional[int] = None) -> None:
                payload: dict[str, Any] = {"step": "log", "message": _safe_str(message)}
                if progress is not None:
                    payload["progress"] = progress
                emit(payload)

            if selected_job:
                bridge_logger(f"Job mode: {selected_job}", 5)
                config_data = load_combined_config()
                job_info = next(
                    (job for job in config_data.get("jobs", []) if isinstance(job, dict) and job.get("name") == selected_job),
                    {},
                )
                if not final_patterns:
                    job_patterns = (
                        job_info.get("targets")
                        or job_info.get("patterns")
                        or job_info.get("pattern_keys")
                    )
                    if job_patterns:
                        final_patterns = list(job_patterns)
                    else:
                        target_sets = config_data.get("target_sets", {}) or {}
                        preferred_set = target_sets.get("Summary") or target_sets.get("기본 세트")
                        if preferred_set:
                            final_patterns = list(preferred_set)
                        elif target_sets:
                            first_key = next(iter(target_sets.keys()))
                            final_patterns = list(target_sets.get(first_key, []))
                        else:
                            final_patterns = list((config_data.get("patterns", {}) or {}).keys())[:1]

                bridge_logger(
                    f"Patterns: {', '.join(final_patterns) if final_patterns else '(none)'}",
                    None,
                )
                result = run_ad_hoc_job(
                    input_dir=_safe_str(job_info.get("input_dir", request.input_dir)),
                    output_dir=_safe_str(job_info.get("output_dir", request.output_dir)),
                    subject=_safe_str(job_info.get("subject", request.subject or "New Project")),
                    pattern_keys=final_patterns,
                    model_name=request.model_name or _safe_str(job_info.get("model", "")) or None,
                    temp=request.temp,
                    ui_logger=bridge_logger,
                    selected_files=list(request.selected_files or []),
                    generation_mode=request.generation_mode or "standard",
                    rebuild_title=bool(request.rebuild_title),
                    ui_mode=True,
                )
            else:
                bridge_logger("Direct mode", 5)
                result = run_ad_hoc_job(
                    input_dir=request.input_dir,
                    output_dir=request.output_dir,
                    subject=request.subject or "New Project",
                    pattern_keys=final_patterns,
                    model_name=request.model_name,
                    temp=request.temp,
                    ui_logger=bridge_logger,
                    selected_files=list(request.selected_files or []),
                    generation_mode=request.generation_mode or "standard",
                    rebuild_title=bool(request.rebuild_title),
                    ui_mode=True,
                )

            if result:
                for line in str(result).splitlines():
                    bridge_logger(line, None)
            return {"message": "Generator complete", "progress": 100}

        async for line in _stream_blocking_runner(runner):
            yield line

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")


@app.post("/api/tools/tagger/stream")
async def tagger_stream(request: TaggerRequest):
    async def event_generator():
        def runner(emit: Callable[[dict[str, Any]], None]) -> dict[str, Any]:
            from backend.src.pipeline.tagger import run_tagging_logic

            result = run_tagging_logic(
                target=request.target,
                mode=request.mode,
                input_dir=request.input_dir,
                selected_files=list(request.selected_files or []),
            )
            for line in str(result).splitlines():
                emit({"step": "log", "message": line})
            return {"message": "Tagger complete"}

        async for line in _stream_blocking_runner(runner):
            yield line

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")


@app.post("/api/tools/ingest/stream")
async def ingest_stream(request: IngestRequest):
    async def event_generator():
        def runner(emit: Callable[[dict[str, Any]], None]) -> dict[str, Any]:
            from backend.src.pipeline.ingestor import run_ingest_logic

            jobs_yaml_path = str((BASE_DIR / "backend" / "config" / "jobs.yaml").resolve())

            def bridge_logger(message: str) -> None:
                emit({"step": "log", "message": _safe_str(message)})

            result = run_ingest_logic(
                jobs_yaml=jobs_yaml_path,
                job=request.job,
                mode=request.mode,
                layer=request.layer,
                policy=request.policy,
                chunk_size=request.chunk_size,
                overlap=request.overlap,
                heading_levels=list(request.heading_levels or [1, 2, 3]),
                code_attach=request.code_attach,
                input_dir=request.input_dir,
                output_dir=request.output_dir,
                selected_files=list(request.selected_files or []),
                callback=bridge_logger,
            )
            if result:
                emit({"step": "log", "message": _safe_str(result)})
            return {"message": "Ingest complete"}

        async for line in _stream_blocking_runner(runner):
            yield line

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")


if __name__ == "__main__":
    import uvicorn

    backend_port = int(os.getenv("BACKEND_PORT", "8011"))
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=backend_port,
        reload=False,
        timeout_keep_alive=300,
    )
