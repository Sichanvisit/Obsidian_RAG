import os
import json
import re
import yaml
import requests
import argparse
from pathlib import Path
from typing import Any
from datetime import date

# 한글 주석 복구
from dotenv import load_dotenv
from backend.config.paths import OBSIDIAN_ROOT, RAW_DATA_DIR, SUMMARY_DATA_DIR

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
OLLAMA_TIMEOUT_SEC = int(os.getenv("OLLAMA_TIMEOUT_SEC", "120"))

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
_obsidian_root_path = OBSIDIAN_ROOT if isinstance(OBSIDIAN_ROOT, Path) else None
_obsidian_root = str(_obsidian_root_path) if _obsidian_root_path else ""
_obsidian_10 = RAW_DATA_DIR if isinstance(RAW_DATA_DIR, Path) else None
_obsidian_11 = SUMMARY_DATA_DIR if isinstance(SUMMARY_DATA_DIR, Path) else None

RAW_ROOT_DIR = Path(
    os.getenv("DATA_DIC_PATH")
    or (str(_obsidian_10) if _obsidian_10 and _obsidian_10.exists() else str(PROJECT_ROOT / "10_AI_Engineering"))
)
SUM_ROOT_DIR = Path(
    os.getenv("DATA_SUMMATION_PATH")
    or (str(_obsidian_11) if _obsidian_11 and _obsidian_11.exists() else str(PROJECT_ROOT / "11_RAG_Knowledge_Base"))
)
PATTERN_WORKSPACE_DIR = (_obsidian_root_path / "generator") if _obsidian_root_path else (PROJECT_ROOT / "generator")
PATTERN_MARKDOWN_DIR = PATTERN_WORKSPACE_DIR / "patterns"
PATTERN_README_PATH = PATTERN_WORKSPACE_DIR / "README.md"
TITLE_REBUILD_PATTERN = "Title_Rebuild"
_INVALID_FILENAME_CHARS = re.compile(r'[<>:"/\\|?*\x00-\x1F]')
_SYSTEM_ROLE_HEADINGS = {"system role", "system", "role", "system_role", "시스템 역할", "역할"}
_PROMPT_TEMPLATE_HEADINGS = {
    "prompt template",
    "prompt",
    "template",
    "prompt_template",
    "프롬프트",
    "프롬프트 템플릿",
    "템플릿",
}


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


def _sanitize_pattern_filename(name: str) -> str:
    sanitized = _INVALID_FILENAME_CHARS.sub("_", (name or "").strip()).strip(". ")
    return sanitized or "pattern"


def _pattern_note_path(pattern_key: str) -> Path:
    return PATTERN_MARKDOWN_DIR / f"{_sanitize_pattern_filename(pattern_key)}.md"


def _pattern_note_relative_path(pattern_key: str) -> str:
    try:
        return str(_pattern_note_path(pattern_key).relative_to(_obsidian_root_path)).replace("\\", "/")
    except Exception:
        return str(_pattern_note_path(pattern_key)).replace("\\", "/")


def _normalize_group_values(value: Any) -> list[str]:
    if isinstance(value, str):
        items = [value]
    elif isinstance(value, (list, tuple, set)):
        items = [str(item) for item in value if str(item).strip()]
    else:
        items = []

    seen: set[str] = set()
    normalized: list[str] = []
    for item in items:
        text = item.strip()
        if text and text not in seen:
            seen.add(text)
            normalized.append(text)
    return normalized


def _reverse_target_sets(target_sets: dict[str, Any]) -> dict[str, list[str]]:
    pattern_groups: dict[str, list[str]] = {}
    for group_name, pattern_keys in (target_sets or {}).items():
        if not isinstance(group_name, str):
            continue
        for pattern_key in _normalize_group_values(pattern_keys):
            current = pattern_groups.setdefault(pattern_key, [])
            if group_name not in current:
                current.append(group_name)
    return pattern_groups


def _parse_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    normalized_text = text.lstrip("\ufeff")
    if not normalized_text.startswith("---"):
        return {}, normalized_text

    parts = normalized_text.split("\n")
    if not parts or parts[0].strip() != "---":
        return {}, normalized_text

    for index in range(1, len(parts)):
        if parts[index].strip() == "---":
            frontmatter = "\n".join(parts[1:index])
            body = "\n".join(parts[index + 1 :])
            try:
                data = yaml.safe_load(frontmatter) or {}
                return (data if isinstance(data, dict) else {}), body.lstrip("\n")
            except Exception:
                return {}, normalized_text
    return {}, normalized_text


def _normalize_heading_title(title: str) -> str:
    return re.sub(r"\s+", " ", title.strip().lower())


def _extract_markdown_sections(markdown: str) -> tuple[str, str]:
    active: str | None = None
    sections: dict[str, list[str]] = {"system_role": [], "prompt_template": []}

    for line in markdown.splitlines():
        match = re.match(r"^\s{0,3}#{1,6}\s+(.*)$", line)
        if match:
            heading = _normalize_heading_title(match.group(1))
            if heading in _SYSTEM_ROLE_HEADINGS:
                active = "system_role"
                continue
            if heading in _PROMPT_TEMPLATE_HEADINGS:
                active = "prompt_template"
                continue
        if active:
            sections[active].append(line)

    system_role = "\n".join(sections["system_role"]).strip()
    prompt_template = "\n".join(sections["prompt_template"]).strip()
    if system_role or prompt_template:
        return system_role, prompt_template
    return "", markdown.strip()


def _extract_named_markdown_section(markdown: str, heading_name: str) -> list[str]:
    target = _normalize_heading_title(heading_name)
    active = False
    lines: list[str] = []
    for line in markdown.splitlines():
        match = re.match(r"^\s{0,3}#{1,6}\s+(.*)$", line)
        if match:
            heading = _normalize_heading_title(match.group(1))
            if active:
                break
            if heading == target:
                active = True
                continue
        if active:
            lines.append(line)
    return [line.rstrip() for line in lines if line.strip()]


def _parse_title_rebuild_output(markdown: str) -> tuple[str, list[str]]:
    primary_lines: list[str] = []
    alias_lines: list[str] = []

    for heading in ("Primary Title", "대표 제목", "주요 제목", "기본 제목", "제목"):
        primary_lines = _extract_named_markdown_section(markdown, heading)
        if primary_lines:
            break

    for heading in ("Aliases", "별칭", "보조 제목", "대체 제목"):
        alias_lines = _extract_named_markdown_section(markdown, heading)
        if alias_lines:
            break

    def _clean_list_item(value: str) -> str:
        value = re.sub(r"^\s*[-*]\s*", "", value).strip()
        value = re.sub(r"^\*\*(.+?)\*\*$", r"\1", value).strip()
        return value

    def _title_key(value: str) -> str:
        return re.sub(r"\s+", " ", value).strip().lower()

    def _is_weak_title_candidate(value: str) -> bool:
        normalized = _title_key(value)
        if not normalized:
            return True
        if normalized in {"...", "tbd", "todo", "untitled", "무제", "readme", "정리", "메모", "자료", "테스트"}:
            return True
        if "제목 예시" in normalized or "예시 제목" in normalized or "placeholder" in normalized:
            return True
        if re.fullmatch(r"[\d\s._~:/\\-]+", normalized):
            return True
        return len(normalized) < 4

    primary_title = ""
    for line in primary_lines:
        candidate = _clean_list_item(line)
        if candidate and not _is_weak_title_candidate(candidate):
            primary_title = candidate
            break

    if not primary_title:
        for raw_line in markdown.splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            candidate = _clean_list_item(line)
            if (
                candidate
                and len(candidate) <= 120
                and not candidate.lower().startswith("why")
                and not _is_weak_title_candidate(candidate)
            ):
                primary_title = candidate
                break

    aliases: list[str] = []
    seen: set[str] = set()
    for line in alias_lines:
        candidate = _clean_list_item(line)
        candidate_key = _title_key(candidate)
        if (
            candidate
            and not _is_weak_title_candidate(candidate)
            and candidate_key not in seen
            and candidate_key != _title_key(primary_title)
        ):
            seen.add(candidate_key)
            aliases.append(candidate)

    return primary_title, aliases


def _dump_frontmatter(frontmatter: dict[str, Any], body: str) -> str:
    if not frontmatter:
        return body.strip() + "\n"
    yaml_block = yaml.safe_dump(
        frontmatter,
        allow_unicode=True,
        sort_keys=False,
        default_flow_style=False,
    ).strip()
    return f"---\n{yaml_block}\n---\n\n{body.strip()}\n"


def _build_pattern_note_content(pattern_key: str, pattern_data: dict[str, Any], groups: list[str]) -> str:
    system_role = str(pattern_data.get("system_role", "") or "").rstrip()
    prompt_template = str(pattern_data.get("prompt_template", "") or "").rstrip()
    output_suffix = str(pattern_data.get("output_suffix", "") or "")
    use_subject_prefix = bool(pattern_data.get("use_subject_prefix", False))
    frontmatter = {
        "pattern": pattern_key,
        "groups": groups,
        "output_suffix": output_suffix,
        "use_subject_prefix": use_subject_prefix,
    }
    return (
        "---\n"
        f"{yaml.safe_dump(frontmatter, allow_unicode=True, sort_keys=False).strip()}\n"
        "---\n\n"
        f"# {pattern_key}\n\n"
        "## System Role\n"
        f"{system_role or 'Describe the model role for this pattern.'}\n\n"
        "## Prompt Template\n"
        f"{prompt_template or '[Context Data]\\n{context}'}\n"
    )


def _ensure_pattern_workspace(base_patterns: dict[str, Any], target_sets: dict[str, Any]) -> None:
    PATTERN_MARKDOWN_DIR.mkdir(parents=True, exist_ok=True)
    if not PATTERN_README_PATH.exists():
        PATTERN_README_PATH.write_text(
            "# Generator Pattern Workspace\n\n"
            "- Edit files in `patterns/` to override generator prompts.\n"
            "- Each note uses frontmatter and two sections: `## System Role`, `## Prompt Template`.\n"
            "- Existing YAML patterns are synced here once and then can be managed in Obsidian.\n",
            encoding="utf-8",
        )

    pattern_groups = _reverse_target_sets(target_sets)
    for pattern_key, raw_value in (base_patterns or {}).items():
        if not isinstance(pattern_key, str) or not pattern_key.strip():
            continue
        note_path = _pattern_note_path(pattern_key)
        if note_path.exists():
            continue
        pattern_data = raw_value if isinstance(raw_value, dict) else {"prompt_template": str(raw_value or "")}
        note_path.write_text(
            _build_pattern_note_content(pattern_key, pattern_data, pattern_groups.get(pattern_key, [])),
            encoding="utf-8",
        )


def _load_markdown_pattern_overrides() -> tuple[dict[str, dict[str, Any]], dict[str, list[str]], dict[str, dict[str, Any]]]:
    overrides: dict[str, dict[str, Any]] = {}
    group_updates: dict[str, list[str]] = {}
    metadata: dict[str, dict[str, Any]] = {}

    if not PATTERN_MARKDOWN_DIR.exists():
        return overrides, group_updates, metadata

    for note_path in sorted(PATTERN_MARKDOWN_DIR.glob("*.md")):
        try:
            raw_text = note_path.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue

        frontmatter, body = _parse_frontmatter(raw_text)
        pattern_key = str(frontmatter.get("pattern") or note_path.stem).strip()
        if not pattern_key:
            continue

        system_role, prompt_template = _extract_markdown_sections(body)
        pattern_override: dict[str, Any] = {}
        if system_role:
            pattern_override["system_role"] = system_role
        if prompt_template:
            pattern_override["prompt_template"] = prompt_template

        if "output_suffix" in frontmatter:
            pattern_override["output_suffix"] = str(frontmatter.get("output_suffix") or "")
        if "use_subject_prefix" in frontmatter:
            pattern_override["use_subject_prefix"] = bool(frontmatter.get("use_subject_prefix"))

        if pattern_override:
            overrides[pattern_key] = pattern_override

        groups = _normalize_group_values(
            frontmatter.get("groups")
            or frontmatter.get("target_sets")
            or frontmatter.get("group")
        )
        metadata[pattern_key] = {
            "source": "obsidian",
            "source_path": str(note_path),
            "editor_note_path": _pattern_note_relative_path(pattern_key),
            "groups": groups,
        }
        for group_name in groups:
            current = group_updates.setdefault(group_name, [])
            if pattern_key not in current:
                current.append(pattern_key)

    return overrides, group_updates, metadata


def _build_pattern_metadata(
    patterns: dict[str, Any],
    target_sets: dict[str, Any],
    yaml_source_path: Path,
    markdown_metadata: dict[str, dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    reverse_groups = _reverse_target_sets(target_sets)
    metadata: dict[str, dict[str, Any]] = {}
    for pattern_key, raw_value in (patterns or {}).items():
        pattern_data = raw_value if isinstance(raw_value, dict) else {"prompt_template": str(raw_value or "")}
        markdown_info = markdown_metadata.get(pattern_key, {})
        metadata[pattern_key] = {
            "source": markdown_info.get("source", "yaml"),
            "source_path": markdown_info.get("source_path", str(yaml_source_path)),
            "editor_note_path": markdown_info.get("editor_note_path", _pattern_note_relative_path(pattern_key)),
            "groups": markdown_info.get("groups") or reverse_groups.get(pattern_key, []),
            "output_suffix": str(pattern_data.get("output_suffix", "") or ""),
            "use_subject_prefix": bool(pattern_data.get("use_subject_prefix", False)),
        }
    return metadata


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

    _ensure_pattern_workspace(
        master_config.get("patterns", {}) or {},
        master_config.get("target_sets", {}) or {},
    )

    markdown_overrides, markdown_groups, markdown_metadata = _load_markdown_pattern_overrides()
    if markdown_overrides:
        for pattern_key, override_data in markdown_overrides.items():
            base_value = master_config["patterns"].get(pattern_key, {})
            base_dict = dict(base_value) if isinstance(base_value, dict) else {"prompt_template": str(base_value or "")}
            base_dict.update(override_data)
            master_config["patterns"][pattern_key] = base_dict

    if markdown_groups:
        target_sets = master_config.get("target_sets", {}) or {}
        for group_name, pattern_keys in markdown_groups.items():
            current = list(target_sets.get(group_name, []) or [])
            for pattern_key in pattern_keys:
                if pattern_key not in current:
                    current.append(pattern_key)
            target_sets[group_name] = current
        master_config["target_sets"] = target_sets

    master_config["_pattern_metadata"] = _build_pattern_metadata(
        master_config.get("patterns", {}) or {},
        master_config.get("target_sets", {}) or {},
        p_path,
        markdown_metadata,
    )
    master_config["_pattern_editor"] = {
        "vault_dir": str(PATTERN_MARKDOWN_DIR.relative_to(_obsidian_root_path)).replace("\\", "/")
        if _obsidian_root_path
        else str(PATTERN_MARKDOWN_DIR).replace("\\", "/"),
        "readme_path": str(PATTERN_README_PATH.relative_to(_obsidian_root_path)).replace("\\", "/")
        if _obsidian_root_path
        else str(PATTERN_README_PATH).replace("\\", "/"),
        "config_path": str(p_path),
    }

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
    full_prompt = (
        prompt_template
        .replace("{context}", context)
        .replace("{subject}", subject or "")
        .replace("{today}", date.today().isoformat())
    )

    # 한글 주석 복구
    # 한글 주석 복구
    actual_model = model_alias
    if not actual_model or str(actual_model) == "None":
        actual_model = model_spec.get("name") if isinstance(model_spec, dict) else "qwen3.5:4b"

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
            "think": False,
            "options": {"temperature": temp or 0.1},
        }
        try:
            res = requests.post(url, json=payload, timeout=OLLAMA_TIMEOUT_SEC)
            if res.status_code == 200:
                answer = res.json().get("message", {}).get("content", "")
                if not answer: return "Ollama 응답은 성공했지만 본문이 비어 있습니다."
                return answer
            else:
                return f"Ollama 요청 실패 (code {res.status_code}): {res.text}"
        except requests.exceptions.Timeout:
            return (
                f"Ollama 응답 시간 초과: {actual_model} 이(가) {OLLAMA_TIMEOUT_SEC}초 안에 응답하지 않았습니다. "
                "모델 상태를 확인하거나 더 가벼운 모델/패턴으로 다시 시도하세요."
            )
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
        generation_mode: str = "standard",
        rebuild_title: bool = False,
        ui_mode: bool = False
) -> str:
    """
    UI(app_v3.py)에서 전달한 인자를 사용해 ad-hoc 생성 작업을 수행한다.
    """
    logs = []
    config = load_combined_config()

    # 한글 주석 복구
    defaults = config.get("defaults", {})
    final_model = model_name or defaults.get("model", "qwen3.5:4b")
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

    patterns_map = config.get("patterns", {})
    effective_pattern_keys = list(pattern_keys)
    if rebuild_title and TITLE_REBUILD_PATTERN in patterns_map and TITLE_REBUILD_PATTERN not in effective_pattern_keys:
        effective_pattern_keys.insert(0, TITLE_REBUILD_PATTERN)

    reconstruction_mode = generation_mode == "note_rebuild"
    chunks = [context_data] if reconstruction_mode else split_text_smartly(context_data, token_limit)

    pattern_outputs: dict[str, str] = {}
    total_steps = max(1, len(effective_pattern_keys) * len(chunks))
    step_count = 0

    for p_key in effective_pattern_keys:
        if p_key not in patterns_map:
            logs.append(f"Pattern not found: {p_key}")
            continue
        ptrn = patterns_map[p_key]
        chunk_results: list[str] = []

        for chunk in chunks:
            step_count += 1
            if ui_logger:
                progress = 10 + int((step_count / total_steps) * 85)
                ui_logger(f"[{p_key}] ?? ? ({step_count}/{total_steps})", progress)

            res = call_llm(
                context=chunk,
                subject=subject,
                pattern_config=ptrn,
                model_alias=final_model,
                model_spec=model_spec,
                temp=final_temp,
            )
            chunk_results.append(res)

        pattern_outputs[p_key] = "\n\n---\n\n".join(chunk_results).strip()

    if reconstruction_mode:
        if not selected_files:
            return "Note reconstruction requires exactly one selected file."

        primary_rel = str((selected_files or [""])[0]).replace("\\", "/").strip()
        source_path = (resolved_in / primary_rel).resolve()
        if not source_path.exists():
            return f"Selected source file not found: {primary_rel}"

        original_text = source_path.read_text(encoding="utf-8", errors="replace")
        source_frontmatter, _ = _parse_frontmatter(original_text)
        updated_frontmatter = dict(source_frontmatter)

        if rebuild_title and TITLE_REBUILD_PATTERN in pattern_outputs:
            primary_title, alias_titles = _parse_title_rebuild_output(pattern_outputs[TITLE_REBUILD_PATTERN])
            if primary_title:
                previous_title = str(updated_frontmatter.get("title") or source_path.stem).strip()
                aliases = updated_frontmatter.get("aliases")
                if isinstance(aliases, str):
                    alias_list = [aliases]
                elif isinstance(aliases, list):
                    alias_list = [str(item).strip() for item in aliases if str(item).strip()]
                else:
                    alias_list = []
                if previous_title and previous_title != primary_title and previous_title not in alias_list:
                    alias_list.insert(0, previous_title)
                for alias in alias_titles:
                    if alias and alias != primary_title and alias not in alias_list:
                        alias_list.append(alias)
                updated_frontmatter["title"] = primary_title
                if alias_list:
                    updated_frontmatter["aliases"] = alias_list
                else:
                    updated_frontmatter.pop("aliases", None)

        primary_pattern_key = next(
            (key for key in ("Note_Structure", "Note_Summary", "Note_NextActions") if pattern_outputs.get(key)),
            next((key for key in effective_pattern_keys if key != TITLE_REBUILD_PATTERN and pattern_outputs.get(key)), ""),
        )
        if not primary_pattern_key:
            return "No reconstruction output was generated."

        final_body = pattern_outputs.get(primary_pattern_key, "").strip()
        supplemental_keys = [
            key for key in effective_pattern_keys
            if key not in {primary_pattern_key, TITLE_REBUILD_PATTERN} and pattern_outputs.get(key)
        ]
        for key in supplemental_keys:
            final_body = f"{final_body}\n\n---\n\n{pattern_outputs[key].strip()}".strip()

        source_path.write_text(_dump_frontmatter(updated_frontmatter, final_body), encoding="utf-8")
        logs.append(f"Updated note in place: {primary_rel}")
        if rebuild_title and TITLE_REBUILD_PATTERN in pattern_outputs:
            logs.append("Applied title reconstruction metadata.")
    else:
        os.makedirs(resolved_out, exist_ok=True)
        for p_key, rendered_text in pattern_outputs.items():
            ptrn = patterns_map.get(p_key, {})
            safe_subject = _sanitize_pattern_filename(subject or "output")
            fname = f"{safe_subject}{ptrn.get('output_suffix', f'_{p_key}.md')}"
            save_path = os.path.join(resolved_out, fname)
            with open(save_path, "w", encoding="utf-8") as f:
                f.write(rendered_text)
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


