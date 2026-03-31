from __future__ import annotations

import argparse
import json
import os
import re
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urlparse

import yaml

from backend.config.paths import DATA_DIR, OBSIDIAN_ROOT, RAW_DATA_DIR, SUMMARY_DATA_DIR

PROJECT_ROOT = Path(__file__).resolve().parents[3]
INDEX_ROOT = Path(os.getenv('TAGGER_INDEX_DIR', str(DATA_DIR / 'indexes'))).expanduser().resolve()

MANAGED_META_KEYS = {
    'title',
    'tag',
    'tags',
    'tags_manual',
    'manual_tags',
    'domain',
    'collection',
    'topic',
    'layer',
    'root_domain_auto',
    'project_id_auto',
    'doc_role_auto',
    'source',
    'updated_at',
    'rel_path',
    'semantic_tags_auto',
    'note_type_auto',
    'section_keys',
    'external_ref_domains',
    'related_notes_auto',
    'typed_relations_auto',
    'index_version',
    'related_files',
}

TAGGER_SCHEMA_VERSION = 'tagger_v5_1'

STOPWORDS = {
    'the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'there', 'their',
    'have', 'will', 'your', 'about', 'than', 'then', 'when', 'where', 'what', 'which',
    '하다', '되다', '있다', '없다', '이다', '수', '것', '및', '또는', '그리고', '에서', '으로',
}

WIKILINK_RE = re.compile(r'\[\[([^\]]+)\]\]')
INLINE_TAG_RE = re.compile(r'(?<![\w/])#([A-Za-z0-9_/-]+|[\uAC00-\uD7A3][\uAC00-\uD7A30-9_/-]*)')
HEADING_RE = re.compile(r'^(#{1,6})\s+(.+?)\s*$', re.MULTILINE)
TOKEN_RE = re.compile(r'[A-Za-z0-9][A-Za-z0-9_./-]*|[\uAC00-\uD7A3]{2,}')
MARKDOWN_LINK_RE = re.compile(r'!?\[([^\]]*)\]\((https?://[^\s)]+)\)')
BARE_URL_RE = re.compile(r'(?<!\()(?P<url>https?://[^\s<>\)]+)')


def _existing_dir(path: Path | None) -> Path | None:
    if not path:
        return None
    try:
        resolved = path.expanduser().resolve()
    except Exception:
        return None
    return resolved if resolved.exists() and resolved.is_dir() else None


def _infer_vault_root() -> Path:
    candidates = [
        _existing_dir(OBSIDIAN_ROOT if isinstance(OBSIDIAN_ROOT, Path) else None),
        _existing_dir(RAW_DATA_DIR.parent) if RAW_DATA_DIR.name == '10_AI_Engineering' else None,
        _existing_dir(SUMMARY_DATA_DIR.parent) if SUMMARY_DATA_DIR.name == '11_RAG_Knowledge_Base' else None,
    ]
    for candidate in candidates:
        if not candidate:
            continue
        if (candidate / '.obsidian').exists() or (candidate / '10_AI_Engineering').exists() or (candidate / '11_RAG_Knowledge_Base').exists():
            return candidate
    return PROJECT_ROOT


VAULT_ROOT = _infer_vault_root()
PATH_RAW = _existing_dir(RAW_DATA_DIR) or (VAULT_ROOT / '10_AI_Engineering')
PATH_SUMMARY = _existing_dir(SUMMARY_DATA_DIR) or (VAULT_ROOT / '11_RAG_Knowledge_Base')
TAGGER_WORKSPACE_DIR = VAULT_ROOT / 'tagger'
TAGGER_RULES_DIR = TAGGER_WORKSPACE_DIR / 'rules'
TAGGER_README_PATH = TAGGER_WORKSPACE_DIR / 'README.md'
CANONICAL_TAGS_PATH = TAGGER_RULES_DIR / 'canonical_tags.md'
SYNONYM_MAP_PATH = TAGGER_RULES_DIR / 'synonym_map.md'
TAGGING_PRIORITY_PATH = TAGGER_RULES_DIR / 'tagging_priority.md'


def clean_tag(text: str, strip_numeric_prefix: bool = True) -> str:
    value = str(text or '').strip().lstrip('#')
    if not value:
        return 'Unknown'
    if strip_numeric_prefix:
        value = re.sub(r'^\d+[\s._-]*', '', value)
    value = value.replace(' ', '_')
    value = re.sub(r'[^A-Za-z0-9_./\-\uAC00-\uD7A3]', '', value)
    value = re.sub(r'_+', '_', value).strip('._-/')
    return value or 'Unknown'


def normalize_note_ref(value: str) -> str:
    text = str(value or '').strip().replace('\\', '/')
    if not text:
        return ''
    text = text.split('|', 1)[0].split('#', 1)[0].strip()
    if text.lower().endswith('.md'):
        text = text[:-3]
    return text.strip().strip('/')


def normalize_note_key(value: str) -> str:
    text = normalize_note_ref(value).lower()
    text = re.sub(r'[^a-z0-9_\-/\.\uAC00-\uD7A3]+', ' ', text)
    text = text.replace('/', ' ').replace('\\', ' ').replace('.', ' ').replace('-', ' ').replace('_', ' ')
    return re.sub(r'\s+', ' ', text).strip()


def slugify_scope(value: str) -> str:
    text = normalize_note_ref(value).replace('/', '__')
    text = re.sub(r'[^A-Za-z0-9_\-.\uAC00-\uD7A3]+', '_', text)
    text = re.sub(r'_+', '_', text).strip('._')
    return text or 'scope'


def split_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    stripped = text.lstrip()
    if not stripped.startswith('---'):
        return {}, text

    lines = text.splitlines()
    if not lines or lines[0].strip() != '---':
        return {}, text

    for index in range(1, len(lines)):
        if lines[index].strip() == '---':
            yaml_block = '\n'.join(lines[1:index])
            body = '\n'.join(lines[index + 1 :]).lstrip('\n')
            try:
                frontmatter = yaml.safe_load(yaml_block) or {}
                if not isinstance(frontmatter, dict):
                    frontmatter = {}
            except Exception:
                frontmatter = {}
            return frontmatter, body
    return {}, text


def normalize_heading_title(value: str) -> str:
    return re.sub(r'\s+', ' ', str(value or '').strip().lower())


def extract_markdown_sections(markdown: str) -> dict[str, str]:
    sections: dict[str, list[str]] = {}
    active_key: str | None = None

    for line in (markdown or '').splitlines():
        match = re.match(r'^\s{0,3}#{1,6}\s+(.*)$', line)
        if match:
            active_key = normalize_heading_title(match.group(1))
            sections.setdefault(active_key, [])
            continue
        if active_key is not None:
            sections[active_key].append(line)

    return {
        key: '\n'.join(value).strip()
        for key, value in sections.items()
    }


def parse_markdown_bullets(text: str) -> list[str]:
    items: list[str] = []
    for line in (text or '').splitlines():
        stripped = line.strip()
        if not stripped.startswith('- '):
            continue
        value = stripped[2:].strip()
        if value:
            items.append(value)
    return items


def parse_mapping_bullets(text: str) -> dict[str, list[str]]:
    mapping: dict[str, list[str]] = {}
    for item in parse_markdown_bullets(text):
        if ':' not in item:
            continue
        key, raw_values = item.split(':', 1)
        canonical = clean_tag(key, strip_numeric_prefix=False).lower()
        values = [
            value.strip()
            for value in re.split(r'[,\n]+', raw_values)
            if value.strip()
        ]
        if canonical:
            mapping[canonical] = values
    return mapping


def parse_scalar_bullets(text: str) -> dict[str, str]:
    values: dict[str, str] = {}
    for item in parse_markdown_bullets(text):
        if ':' not in item:
            continue
        key, raw_value = item.split(':', 1)
        values[normalize_heading_title(key)] = raw_value.strip()
    return values


def build_tagger_readme() -> str:
    return (
        '# Tagger Rule Workspace\n\n'
        '- Edit files in `rules/` to control automatic semantic tagging.\n'
        '- `canonical_tags.md`: allowed canonical tags grouped by category.\n'
        '- `synonym_map.md`: phrase variants mapped to canonical tags.\n'
        '- `tagging_priority.md`: source weights and thresholds for auto-tagging.\n'
        '- Tagger writes visible frontmatter fields such as `tags`, `semantic_tags_auto`, `note_type_auto`, `section_keys`, and `external_ref_domains`.\n'
        '- The JSON index is rebuilt from the same metadata and is used by chat retrieval.\n'
    )


def build_canonical_tags_note() -> str:
    return (
        '---\n'
        'kind: canonical_tags\n'
        'version: 1\n'
        '---\n\n'
        '# Canonical Tags\n\n'
        '## Domain Tags\n'
        '- python\n'
        '- ml\n'
        '- dl\n'
        '- llm\n'
        '- deployment\n'
        '- project\n\n'
        '## Topic Tags\n'
        '- rag\n'
        '- agent\n'
        '- langgraph\n'
        '- langchain\n'
        '- prompting\n'
        '- evaluation\n'
        '- embedding\n'
        '- retrieval\n'
        '- reranking\n'
        '- chunking\n'
        '- vector-db\n'
        '- obsidian\n'
        '- fastapi\n'
        '- streamlit\n'
        '- ollama\n'
        '- openai\n'
        '- multimodal\n'
        '- vlm\n'
        '- vision\n'
        '- 3d-vision\n'
        '- fine-tuning\n'
        '- inference\n'
        '- monitoring\n'
        '- pipeline\n'
        '- indexing\n'
        '- metadata\n'
        '- link-graph\n\n'
        '## Document Type Tags\n'
        '- idea-note\n'
        '- concept-note\n'
        '- code-note\n'
        '- project-note\n'
        '- summary-note\n'
        '- roadmap-note\n'
        '- meeting-note\n'
        '- reference-note\n'
        '- troubleshooting-note\n'
        '- decision-note\n'
        '- action-note\n'
        '- experiment-note\n'
        '- review-note\n'
    )


def build_synonym_map_note() -> str:
    return (
        '---\n'
        'kind: synonym_map\n'
        'version: 1\n'
        '---\n\n'
        '# Synonym Map\n\n'
        '## Canonical Tags\n'
        '- llm: large language model, language model, 언어 모델, 언어모델\n'
        '- rag: retrieval augmented generation, 검색증강생성, 검색 증강 생성\n'
        '- vector-db: vectordb, vector db, chroma, chromadb\n'
        '- retrieval: search, 검색, 검색기반, retrieve\n'
        '- reranking: rerank, reranker, 재정렬\n'
        '- chunking: split, splitter, 청킹, chunk\n'
        '- embedding: embeddings, 임베딩\n'
        '- agent: agentic, ai agent, 에이전트\n'
        '- langgraph: graph workflow, 랭그래프\n'
        '- langchain: 체인, 랭체인\n'
        '- obsidian: second brain, vault, 옵시디언\n'
        '- deployment: serving, deploy, 배포, 서빙\n'
        '- fastapi: api server, 파스트api\n'
        '- streamlit: st, 스트림릿\n'
        '- ollama: local llm, local model\n'
        '- multimodal: multi modal, 멀티모달\n'
        '- vlm: vision language model, vision-language model\n'
        '- 3d-vision: 3d vision, 3dgs, nerf\n'
        '- evaluation: eval, 평가\n'
        '- indexing: index, 인덱스\n'
        '- metadata: meta data, 메타데이터\n'
        '- link-graph: link graph, backlink, wikilink, 링크 그래프\n'
        '- idea-note: idea, ideation, hypothesis note, 아이디어, 가설 메모\n'
        '- code-note: code snippet, sample code, 실습\n'
        '- concept-note: 개념, concepts\n'
        '- meeting-note: mentoring, meeting, 멘토링\n'
        '- project-note: project, 프로젝트, archive, master archive\n'
        '- reference-note: reference, refer, resource, 자료, 참고자료\n'
        '- roadmap-note: plan, roadmap, 로드맵\n'
        '- troubleshooting-note: troubleshooting, debug, issue note, 오류 해결\n'
        '- decision-note: decision, 의사결정, 선택 근거\n'
        '- action-note: action, todo, task, next action, 할 일, 다음 액션\n'
        '- experiment-note: experiment, ablation, benchmark run, 실험\n'
        '- review-note: review, retrospective, 회고, 평가 정리\n'
    )


def build_tagging_priority_note() -> str:
    return (
        '---\n'
        'kind: tagging_priority\n'
        'version: 1\n'
        '---\n\n'
        '# Tagging Priority\n\n'
        '## Source Weights\n'
        '- title: 6\n'
        '- headings: 5\n'
        '- folder: 2\n'
        '- aliases: 5\n'
        '- frontmatter_tags: 4\n'
        '- wikilinks: 3\n'
        '- related_files: 3\n'
        '- external_refs: 3\n'
        '- body: 1\n\n'
        '## Thresholds\n'
        '- semantic_tag_limit: 5\n'
        '- min_score: 4\n'
        '- min_ratio: 0.18\n'
    )


def ensure_tagger_workspace() -> None:
    TAGGER_RULES_DIR.mkdir(parents=True, exist_ok=True)
    if not TAGGER_README_PATH.exists():
        TAGGER_README_PATH.write_text(build_tagger_readme(), encoding='utf-8')
    if not CANONICAL_TAGS_PATH.exists():
        CANONICAL_TAGS_PATH.write_text(build_canonical_tags_note(), encoding='utf-8')
    if not SYNONYM_MAP_PATH.exists():
        SYNONYM_MAP_PATH.write_text(build_synonym_map_note(), encoding='utf-8')
    if not TAGGING_PRIORITY_PATH.exists():
        TAGGING_PRIORITY_PATH.write_text(build_tagging_priority_note(), encoding='utf-8')


def load_tagger_rules() -> dict[str, Any]:
    ensure_tagger_workspace()

    canonical_groups: dict[str, list[str]] = {}
    synonym_map: dict[str, list[str]] = {}
    source_weights = {
        'title': 6.0,
        'headings': 5.0,
        'folder': 4.0,
        'aliases': 4.0,
        'frontmatter_tags': 4.0,
        'wikilinks': 3.0,
        'related_files': 3.0,
        'external_refs': 2.0,
        'body': 1.0,
    }
    thresholds = {
        'semantic_tag_limit': 5,
        'min_score': 4.0,
        'min_ratio': 0.18,
    }

    try:
        _, canonical_body = split_frontmatter(CANONICAL_TAGS_PATH.read_text(encoding='utf-8'))
        canonical_sections = extract_markdown_sections(canonical_body)
        for heading, section_text in canonical_sections.items():
            tags = [
                clean_tag(item, strip_numeric_prefix=False).lower()
                for item in parse_markdown_bullets(section_text)
                if clean_tag(item, strip_numeric_prefix=False)
            ]
            if tags:
                canonical_groups[heading] = list(dict.fromkeys(tags))
    except Exception:
        pass

    try:
        _, synonym_body = split_frontmatter(SYNONYM_MAP_PATH.read_text(encoding='utf-8'))
        synonym_sections = extract_markdown_sections(synonym_body)
        for section_text in synonym_sections.values():
            synonym_map.update(parse_mapping_bullets(section_text))
    except Exception:
        pass

    try:
        _, priority_body = split_frontmatter(TAGGING_PRIORITY_PATH.read_text(encoding='utf-8'))
        priority_sections = extract_markdown_sections(priority_body)
        source_weight_values = parse_scalar_bullets(priority_sections.get('source weights', ''))
        threshold_values = parse_scalar_bullets(priority_sections.get('thresholds', ''))
        for key, value in source_weight_values.items():
            try:
                source_weights[key.replace(' ', '_')] = float(value)
            except Exception:
                continue
        for key, value in threshold_values.items():
            normalized_key = key.replace(' ', '_')
            try:
                thresholds[normalized_key] = int(value) if normalized_key.endswith('limit') else float(value)
            except Exception:
                continue
    except Exception:
        pass

    canonical_tags = sorted({tag for tags in canonical_groups.values() for tag in tags})
    normalized_synonyms = {
        clean_tag(key, strip_numeric_prefix=False).lower(): list(dict.fromkeys(value for value in values if value))
        for key, values in synonym_map.items()
        if clean_tag(key, strip_numeric_prefix=False)
    }

    return {
        'canonical_groups': canonical_groups,
        'canonical_tags': canonical_tags,
        'synonym_map': normalized_synonyms,
        'source_weights': source_weights,
        'thresholds': thresholds,
        'workspace': {
            'root': str(TAGGER_WORKSPACE_DIR).replace('\\', '/'),
            'rules_dir': str(TAGGER_RULES_DIR).replace('\\', '/'),
            'readme_path': str(TAGGER_README_PATH).replace('\\', '/'),
            'canonical_tags_path': str(CANONICAL_TAGS_PATH).replace('\\', '/'),
            'synonym_map_path': str(SYNONYM_MAP_PATH).replace('\\', '/'),
            'tagging_priority_path': str(TAGGING_PRIORITY_PATH).replace('\\', '/'),
        },
    }


def extract_wikilinks(text: str) -> list[str]:
    links: list[str] = []
    for raw_match in WIKILINK_RE.findall(text or ''):
        candidate = normalize_note_ref(raw_match)
        if candidate:
            links.append(candidate)
    return list(dict.fromkeys(links))


def extract_inline_tags(text: str) -> list[str]:
    values = [match.strip() for match in INLINE_TAG_RE.findall(text or '')]
    return list(dict.fromkeys(value for value in values if value))


def extract_frontmatter_tags(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        raw = value.strip()
        if not raw:
            return []
        if raw.startswith('[') and raw.endswith(']'):
            try:
                parsed = yaml.safe_load(raw)
                return extract_frontmatter_tags(parsed)
            except Exception:
                pass
        return [item.strip().lstrip('#') for item in re.split(r'[,\n]+', raw) if item.strip()]
    if isinstance(value, (list, tuple, set)):
        output: list[str] = []
        for item in value:
            output.extend(extract_frontmatter_tags(item))
        return output
    return []


def extract_manual_frontmatter_tags(frontmatter: dict[str, Any]) -> list[str]:
    explicit_manual = extract_frontmatter_tags(frontmatter.get('tags_manual'))
    explicit_manual.extend(extract_frontmatter_tags(frontmatter.get('manual_tags')))
    if explicit_manual:
        return list(dict.fromkeys(clean_tag(tag) for tag in explicit_manual if clean_tag(tag)))

    previous_tags = extract_frontmatter_tags(frontmatter.get('tags'))
    previous_tags.extend(extract_frontmatter_tags(frontmatter.get('tag')))
    manual_only = [tag for tag in previous_tags if not is_managed_system_tag(tag)]
    return list(dict.fromkeys(clean_tag(tag) for tag in manual_only if clean_tag(tag)))


def extract_aliases(frontmatter: dict[str, Any]) -> list[str]:
    aliases = extract_frontmatter_tags(frontmatter.get('aliases'))
    aliases.extend(extract_frontmatter_tags(frontmatter.get('alias')))
    return list(dict.fromkeys(alias for alias in aliases if alias))


def extract_heading_index(body: str) -> list[dict[str, Any]]:
    headings: list[dict[str, Any]] = []
    for match in HEADING_RE.finditer(body or ''):
        level = len(match.group(1))
        text = match.group(2).strip()
        if not text:
            continue
        headings.append({'level': level, 'text': text, 'key': normalize_note_key(text)})
    return headings


def extract_related_files(frontmatter: dict[str, Any]) -> list[str]:
    keys = (
        'related_files',
        'relatedFiles',
        'related_notes',
        'relatedNotes',
        'related',
        'references',
        'reference_files',
        'referenceFiles',
    )
    results: list[str] = []
    for key in keys:
        results.extend(extract_frontmatter_tags(frontmatter.get(key)))
    normalized = [normalize_note_ref(item) for item in results if normalize_note_ref(item)]
    return list(dict.fromkeys(normalized))


def extract_external_refs(text: str) -> list[dict[str, str]]:
    refs: list[dict[str, str]] = []
    seen: set[tuple[str, str, str]] = set()

    def normalize_url(raw_url: str) -> tuple[str, str]:
        url = str(raw_url or '').strip().rstrip('`*_.,);]}>')
        try:
            parsed = urlparse(url)
        except Exception:
            return '', ''
        domain = (parsed.netloc or parsed.path.split('/', 1)[0]).strip().lower()
        domain = domain.split('@')[-1]
        if ':' in domain:
            domain = domain.split(':', 1)[0]
        return url, domain

    for label, url in MARKDOWN_LINK_RE.findall(text or ''):
        normalized_url, domain = normalize_url(url)
        if not normalized_url or not domain:
            continue
        entry = {
            'kind': 'markdown_link',
            'label': str(label or '').strip(),
            'url': normalized_url,
            'domain': domain,
        }
        key = (entry['kind'], entry['label'], entry['url'])
        if key not in seen:
            seen.add(key)
            refs.append(entry)

    for match in BARE_URL_RE.finditer(text or ''):
        normalized_url, domain = normalize_url(match.group('url'))
        if not normalized_url or not domain:
            continue
        entry = {
            'kind': 'url',
            'label': '',
            'url': normalized_url,
            'domain': domain,
        }
        key = (entry['kind'], entry['label'], entry['url'])
        if key not in seen:
            seen.add(key)
            refs.append(entry)
    return refs


def extract_section_index(title: str, body: str) -> list[dict[str, Any]]:
    sections: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None

    if title.strip():
        current = {
            'heading': title.strip(),
            'level': 1,
            'key': normalize_note_key(title),
            'preview_lines': [],
        }
        sections.append(current)

    for line in (body or '').splitlines():
        heading_match = re.match(r'^\s{0,3}(#{1,6})\s+(.+?)\s*$', line)
        if heading_match:
            current = {
                'heading': heading_match.group(2).strip(),
                'level': len(heading_match.group(1)),
                'key': normalize_note_key(heading_match.group(2)),
                'preview_lines': [],
            }
            sections.append(current)
            continue
        if current is not None and line.strip():
            if len(current['preview_lines']) < 4:
                current['preview_lines'].append(line.strip())

    for section in sections:
        preview = ' '.join(section.pop('preview_lines', []))
        section['preview'] = preview[:280]
        section['tokens'] = tokenize(f"{section.get('heading', '')} {preview}")[:24]
    return sections


def normalize_phrase(value: str) -> str:
    text = str(value or '').lower().strip()
    text = text.replace('_', ' ').replace('-', ' ').replace('/', ' ')
    text = re.sub(r'[^a-z0-9\uAC00-\uD7A3\s]+', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()


def score_semantic_tags(
    entry: dict[str, Any],
    rules: dict[str, Any],
) -> tuple[list[str], dict[str, float]]:
    canonical_tags = list(rules.get('canonical_tags', []) or [])
    synonym_map = dict(rules.get('synonym_map', {}) or {})
    weights = dict(rules.get('source_weights', {}) or {})
    thresholds = dict(rules.get('thresholds', {}) or {})

    if not canonical_tags:
        return [], {}

    source_texts = {
        'title': normalize_phrase(entry.get('title', '')),
        'headings': normalize_phrase(' '.join(section.get('heading', '') for section in entry.get('section_index', []))),
        'folder': normalize_phrase(
            ' '.join(
                part
                for part in [
                    entry.get('root_domain_auto', ''),
                    entry.get('project_id_auto', ''),
                ]
                if part
            )
        ),
        'aliases': normalize_phrase(' '.join(entry.get('aliases', []))),
        'frontmatter_tags': normalize_phrase(' '.join(entry.get('frontmatter_tags', []))),
        'wikilinks': normalize_phrase(' '.join(entry.get('wikilinks', []))),
        'related_files': normalize_phrase(' '.join(entry.get('related_files', []))),
        'external_refs': normalize_phrase(' '.join(ref.get('label', '') + ' ' + ref.get('domain', '') for ref in entry.get('external_refs', []))),
        'body': normalize_phrase(entry.get('body', '')[:6000]),
    }

    scores: dict[str, float] = {}
    for canonical in canonical_tags:
        candidates = [canonical, *(synonym_map.get(canonical, []) or [])]
        normalized_candidates = [normalize_phrase(candidate) for candidate in candidates if normalize_phrase(candidate)]
        if not normalized_candidates:
            continue

        score = 0.0
        for source_name, haystack in source_texts.items():
            if not haystack:
                continue
            matched = False
            for candidate in normalized_candidates:
                if candidate and candidate in haystack:
                    matched = True
                    break
            if matched:
                score += float(weights.get(source_name, 1.0))
        if score > 0:
            scores[canonical] = round(score, 2)

    if not scores:
        return [], {}

    max_score = max(scores.values())
    min_score = float(thresholds.get('min_score', 4.0))
    min_ratio = float(thresholds.get('min_ratio', 0.18))
    tag_limit = int(thresholds.get('semantic_tag_limit', 5))

    selected = [
        tag
        for tag, score in sorted(scores.items(), key=lambda item: (-item[1], item[0]))
        if score >= min_score and (max_score == 0 or (score / max_score) >= min_ratio)
    ][:tag_limit]
    return selected, scores


def _get_rule_group_members(rules: dict[str, Any], group_keyword: str) -> set[str]:
    groups = rules.get('canonical_groups', {}) or {}
    normalized_keyword = normalize_heading_title(group_keyword)
    for heading, members in groups.items():
        if normalized_keyword in normalize_heading_title(heading):
            return {clean_tag(member, strip_numeric_prefix=False).lower() for member in (members or []) if clean_tag(member, strip_numeric_prefix=False)}
    return set()


def infer_note_type_auto(entry: dict[str, Any], rules: dict[str, Any]) -> str:
    folder_blob = normalize_phrase(' '.join(entry.get('folder_parts', [])))
    title_blob = normalize_phrase(entry.get('title', ''))
    heading_blob = normalize_phrase(' '.join(section.get('heading', '') for section in entry.get('section_index', [])))
    layer = _safe_lower(entry.get('layer', ''))
    body = normalize_phrase(entry.get('body', '')[:3000])
    body_raw = str(entry.get('body', '') or '')
    external_refs = list(entry.get('external_refs', []) or [])
    external_domains = {
        str(ref.get('domain', '')).strip().lower()
        for ref in external_refs
        if str(ref.get('domain', '')).strip()
    }
    code_block_count = body_raw.count('```')
    project_id = _safe_lower(entry.get('project_id_auto', ''))
    project_like = bool(project_id and project_id != _safe_lower(entry.get('root_domain_auto', '')))
    title_folder_blob = ' '.join(part for part in [title_blob, folder_blob] if part)
    header_blob = ' '.join(part for part in [title_blob, folder_blob, heading_blob] if part)
    project_context_like = project_like and _blob_contains(
        header_blob,
        ['why', '개요', '배경', 'overview', '흐름', '구조', 'master archive', '프로젝트'],
    )
    reference_like = (
        len(external_domains) >= 3
        or _blob_contains(title_folder_blob, ['reference', '참고', '자료', 'resource', 'pdf', 'ppt', 'slides', '논문', 'paper', 'white paper'])
        or _blob_contains(body, ['논문', 'white paper', 'arxiv', 'paper summary'])
        or 'pdf_resources' in folder_blob
    )
    readme_setup_like = (
        _blob_contains(title_folder_blob, ['readme'])
        and _blob_contains(
            header_blob + ' ' + body,
            ['환경 설정', 'setup', 'install', 'getting started', 'requirements', 'pip install', 'uvicorn', 'server 실행'],
        )
    )

    if layer == 'summary':
        return 'summary-note'
    if any(keyword in title_folder_blob for keyword in ['roadmap', '로드맵']) or 'roadmap' in title_blob:
        return 'roadmap-note'
    if any(keyword in title_folder_blob for keyword in ['meeting', '멘토링', '팀토론', '회의']) or _blob_contains(body, ['mentoring', 'meeting', '피드백']):
        return 'meeting-note'
    if any(keyword in title_folder_blob for keyword in ['decision', '결정', '의사결정']):
        return 'decision-note'
    if any(keyword in title_folder_blob for keyword in ['next action', 'todo', '할 일', '다음 액션', 'action item']):
        return 'action-note'
    if any(keyword in title_folder_blob for keyword in ['experiment', '실험', 'ablation', 'benchmark']):
        return 'experiment-note'
    if any(keyword in title_folder_blob for keyword in ['review', '회고', 'retrospective']):
        return 'review-note'
    if any(keyword in title_folder_blob for keyword in ['troubleshooting', 'debug', 'issue', 'error', 'fix', '오류', '해결']):
        return 'troubleshooting-note'
    if project_context_like:
        return 'project-note'
    if reference_like:
        return 'reference-note'
    if readme_setup_like:
        return 'code-note'
    if code_block_count >= 1 or any(keyword in folder_blob for keyword in ['code_snippets', 'snippet', 'code']) or _blob_contains(body, ['sample code', 'import ', 'def ', 'class ']):
        return 'code-note'
    if project_like or any(keyword in folder_blob for keyword in ['projects_archive', 'project']) or _blob_contains(header_blob, ['project', '프로젝트', 'master archive']):
        return 'project-note'
    if any(keyword in title_folder_blob for keyword in ['idea', '아이디어', '가설', 'hypothesis', 'proposal']):
        return 'idea-note'
    if any(keyword in title_folder_blob for keyword in ['concepts', 'concept', '개념']) or '개념' in body:
        return 'concept-note'
    return 'concept-note'


def _safe_lower(value: Any) -> str:
    return str(value or '').strip().lower()


def _is_doc_type_tag(tag: str) -> bool:
    normalized = clean_tag(tag, strip_numeric_prefix=False).lower()
    return normalized.endswith('-note')


DOC_ROLE_COMPLEMENTS = {
    'overview': {'plan', 'architecture', 'setup', 'implementation', 'evaluation', 'reference', 'decision'},
    'problem': {'hypothesis', 'plan', 'reference', 'evaluation'},
    'hypothesis': {'problem', 'experiment', 'evaluation', 'reference'},
    'setup': {'overview', 'architecture', 'implementation', 'evaluation', 'reference'},
    'architecture': {'overview', 'plan', 'setup', 'implementation', 'decision'},
    'implementation': {'architecture', 'setup', 'experiment', 'evaluation', 'review', 'reference'},
    'experiment': {'hypothesis', 'result', 'evaluation', 'review', 'reference'},
    'result': {'experiment', 'evaluation', 'review', 'next_action', 'decision'},
    'evaluation': {'result', 'review', 'decision', 'next_action', 'reference'},
    'review': {'result', 'evaluation', 'next_action', 'decision'},
    'reference': {'overview', 'architecture', 'setup', 'implementation', 'experiment', 'evaluation'},
    'decision': {'overview', 'architecture', 'evaluation', 'next_action', 'reference'},
    'plan': {'overview', 'architecture', 'next_action', 'setup', 'implementation'},
    'next_action': {'review', 'decision', 'plan', 'result'},
}

RELATION_PRIORITY = {
    'summarizes': 0,
    'next_action_for': 1,
    'decision_for': 2,
    'review_of': 3,
    'implements': 4,
    'follow_up': 5,
    'references': 6,
    'same_topic': 7,
}

DOC_ROLE_FOLLOWUPS = {
    ('problem', 'hypothesis'),
    ('hypothesis', 'experiment'),
    ('experiment', 'result'),
    ('result', 'review'),
    ('overview', 'architecture'),
    ('architecture', 'implementation'),
    ('reference', 'implementation'),
}


def _blob_contains(blob: str, keywords: Iterable[str]) -> bool:
    return any(normalize_phrase(keyword) in blob for keyword in keywords if normalize_phrase(keyword))


def infer_doc_role_auto(entry: dict[str, Any]) -> str:
    title_blob = normalize_phrase(entry.get('title', ''))
    folder_blob = normalize_phrase(' '.join(entry.get('folder_parts', [])))
    heading_blob = normalize_phrase(' '.join(section.get('heading', '') for section in entry.get('section_index', [])))
    body_blob = normalize_phrase(entry.get('body', '')[:3000])
    title_folder = ' '.join(part for part in [title_blob, folder_blob] if part)
    header_combined = ' '.join(part for part in [title_blob, folder_blob, heading_blob] if part)
    combined = ' '.join(part for part in [header_combined, body_blob] if part)
    layer = _safe_lower(entry.get('layer', ''))
    note_type = _safe_lower(entry.get('note_type_auto', ''))
    readme_setup_like = (
        _blob_contains(title_folder, ['readme'])
        and _blob_contains(
            combined,
            ['환경 설정', 'setup', 'install', 'getting started', 'requirements', 'pip install', 'uvicorn', 'server 실행', '실행 방법'],
        )
    )
    implementation_guide_like = _blob_contains(
        combined,
        ['step-by-step', 'step by step', '가이드', '실습 시나리오', '힌트 코드', '예시 코드', '실행 방법', '구현'],
    )
    code_practice_like = _blob_contains(
        header_combined + ' ' + combined,
        ['미션', '실습', 'lab', 'hands on', 'hands-on', 'tutorial', 'walkthrough', 'assignment', '과제', '예제', 'sample', 'pip install'],
    )
    reference_eval_like = (
        _blob_contains(combined, ['benchmark', '성능 결과', '장단점', 'trade-off', 'tradeoff', '한계', '평가'])
        or (
            _blob_contains(combined, ['비교', 'compare', 'vs'])
            and _blob_contains(combined, ['성능', '한계', '장단점', '평가', '분석'])
        )
    )
    plan_like = note_type == 'roadmap-note' or _blob_contains(
        header_combined,
        ['roadmap', '로드맵', 'phase', 'milestone', 'timeline', '계획', '실행 계획', '단계별', '여정'],
    )
    setup_like = readme_setup_like or _blob_contains(
        title_folder,
        ['setup', 'install', 'configuration', 'config', 'bootstrap', '초기', '세팅', '환경 구축', 'getting started'],
    )
    architecture_like = _blob_contains(
        header_combined + ' ' + combined,
        ['architecture', '아키텍처', '시스템 설계', '설계', '구조', '통신 흐름', '컴포넌트', 'component', 'pipeline', '파이프라인', 'workflow'],
    )
    overview_like = _blob_contains(
        header_combined + ' ' + combined,
        ['why', 'overview', '개요', '배경', '이유', '목표', 'master archive', 'introduction', 'intro', '전체 개요', 'executive summary', '배경과 목표', '핵심 요약'],
    )
    result_like = _blob_contains(header_combined, ['result', '결과', 'outcome']) or (
        note_type == 'experiment-note'
        and _blob_contains(combined, ['실험 결과', '최종 결과', '결과 요약', 'outcome', 'metric', '정확도'])
    )
    review_like = (
        (note_type == 'meeting-note' and _blob_contains(combined, ['회고', '피드백', '정리', '평가', 'review']))
        or note_type == 'review-note'
        or _blob_contains(combined, ['review', 'retrospective', '회고', '되돌아보면'])
    )
    implementation_like = (
        implementation_guide_like
        or (note_type == 'code-note' and code_practice_like)
        or _blob_contains(
            combined,
            ['예시 코드', '샘플 코드', '구현', '실습', '코드 예제', 'code snippet', 'hands-on', 'tutorial', 'walkthrough'],
        )
    )

    if _blob_contains(title_folder, ['problem', '문제 정의', 'pain point', '이슈 정의']):
        return 'problem'
    if note_type == 'idea-note' or _blob_contains(title_folder, ['hypothesis', '가설', 'proposal', '아이디어']):
        return 'hypothesis'
    if plan_like:
        return 'plan'
    if note_type == 'action-note' or _blob_contains(title_folder, ['next action', 'todo', 'action item', '다음 액션', '할 일']):
        return 'next_action'
    if note_type == 'decision-note' or _blob_contains(title_folder, ['decision', '의사결정', '결정']):
        return 'decision'
    if note_type == 'experiment-note' and result_like:
        return 'result'
    if setup_like:
        return 'setup'
    if layer == 'summary' or _blob_contains(' '.join(part for part in [title_blob, folder_blob] if part), ['summary', '요약']):
        if architecture_like:
            return 'architecture'
        if overview_like:
            return 'overview'
        return 'reference'
    if note_type == 'reference-note':
        if architecture_like and not _blob_contains(title_blob, ['why', '개요', '배경']):
            return 'architecture'
        if overview_like:
            return 'overview'
        if reference_eval_like:
            return 'evaluation'
        return 'reference'
    if architecture_like and not _blob_contains(title_blob, ['why', '개요', '배경']):
        return 'architecture'
    if overview_like:
        return 'overview'
    if review_like:
        return 'review'
    if note_type == 'experiment-note' or _blob_contains(combined, ['experiment', '실험', 'ablation', 'benchmark']):
        return 'experiment'
    if (note_type == 'code-note' or _blob_contains(combined, ['code', 'snippet', '구현', '실습', 'sample'])) and implementation_like:
        return 'implementation'
    if note_type == 'troubleshooting-note' or _blob_contains(combined, ['evaluation', '평가', 'benchmark', '오류', '해결', '비교']):
        return 'evaluation'
    if result_like:
        return 'result'
    if note_type == 'code-note' or _blob_contains(combined, ['code', 'snippet', '구현', '실습', 'sample']):
        return 'implementation'
    if _blob_contains(combined, ['reference', 'resource', '자료', '링크', 'docs']):
        return 'reference'
    return 'overview'


def build_section_keys(entry: dict[str, Any], limit: int = 12) -> list[str]:
    title = str(entry.get('title', '')).strip()
    keys: list[str] = []
    seen: set[str] = set()
    for section in entry.get('section_index', []) or []:
        heading = str(section.get('heading', '')).strip()
        normalized = normalize_note_key(heading)
        if not heading or not normalized:
            continue
        if title and normalized == normalize_note_key(title):
            continue
        if normalized in seen:
            continue
        seen.add(normalized)
        keys.append(heading)
        if len(keys) >= limit:
            break
    return keys


def build_external_ref_domains(external_refs: list[dict[str, Any]], limit: int = 12) -> list[str]:
    domains: list[str] = []
    seen: set[str] = set()
    for ref in external_refs or []:
        domain = str(ref.get('domain', '')).strip().lower()
        if not domain or domain in seen:
            continue
        seen.add(domain)
        domains.append(domain)
        if len(domains) >= limit:
            break
    return domains


def _entry_signal_tokens(entry: dict[str, Any], limit: int = 24) -> set[str]:
    tokens: set[str] = set()
    for source in [
        entry.get('title', ''),
        ' '.join(entry.get('section_keys', []) or []),
        ' '.join(entry.get('aliases', []) or []),
    ]:
        for token in tokenize(source):
            tokens.add(token)
    for token in (entry.get('keywords', []) or [])[:limit]:
        normalized = clean_tag(token, strip_numeric_prefix=False).lower()
        if normalized and normalized != 'unknown':
            tokens.add(normalized)
    return {token for token in tokens if token}


def _score_project_related_candidate(entry: dict[str, Any], candidate: dict[str, Any]) -> float:
    if entry.get('path') == candidate.get('path'):
        return 0.0

    entry_project = _safe_lower(entry.get('project_id_auto', ''))
    candidate_project = _safe_lower(candidate.get('project_id_auto', ''))
    entry_root = _safe_lower(entry.get('root_domain_auto', ''))
    candidate_root = _safe_lower(candidate.get('root_domain_auto', ''))
    if not entry_project or not candidate_project or entry_project != candidate_project:
        return 0.0

    score = 2.4
    if entry_root and candidate_root and entry_root == candidate_root:
        score += 0.45

    entry_role = _safe_lower(entry.get('doc_role_auto', ''))
    candidate_role = _safe_lower(candidate.get('doc_role_auto', ''))
    if entry_role and candidate_role:
        if entry_role == candidate_role:
            score += 1.0
        elif candidate_role in DOC_ROLE_COMPLEMENTS.get(entry_role, set()) or entry_role in DOC_ROLE_COMPLEMENTS.get(candidate_role, set()):
            score += 0.85
        if candidate_role in {'overview', 'roadmap', 'architecture', 'setup'}:
            score += 0.55

    entry_note_type = _safe_lower(entry.get('note_type_auto', ''))
    candidate_note_type = _safe_lower(candidate.get('note_type_auto', ''))
    if entry_note_type and candidate_note_type and entry_note_type == candidate_note_type:
        score += 0.3

    shared_semantic = len(set(entry.get('semantic_tags_auto', []) or []) & set(candidate.get('semantic_tags_auto', []) or []))
    score += min(1.6, shared_semantic * 0.45)

    entry_section_keys = {
        normalize_note_key(item)
        for item in (entry.get('section_keys', []) or [])
        if normalize_note_key(item)
    }
    candidate_section_keys = {
        normalize_note_key(item)
        for item in (candidate.get('section_keys', []) or [])
        if normalize_note_key(item)
    }
    shared_sections = len(entry_section_keys & candidate_section_keys)
    score += min(0.9, shared_sections * 0.3)

    shared_tokens = len(_entry_signal_tokens(entry) & _entry_signal_tokens(candidate))
    score += min(1.8, shared_tokens * 0.22)

    shared_domains = len(set(entry.get('external_ref_domains', []) or []) & set(candidate.get('external_ref_domains', []) or []))
    score += min(0.8, shared_domains * 0.3)

    return round(score, 3)


def build_related_notes_auto(
    entry: dict[str, Any],
    entries_by_path: dict[str, dict[str, Any]] | None = None,
    limit: int = 16,
) -> list[str]:
    results: list[str] = []
    seen: set[str] = set()

    def add(path_value: str) -> None:
        normalized = str(path_value or '').replace('\\', '/').strip('/')
        if not normalized or normalized in seen:
            return
        seen.add(normalized)
        results.append(normalized)

    for item in entry.get('resolved_wikilinks', []) or []:
        add(item.get('target') or item.get('ref') or '')
        if len(results) >= limit:
            return results
    for item in entry.get('resolved_related_files', []) or []:
        add(item.get('target') or item.get('ref') or '')
        if len(results) >= limit:
            return results
    for item in entry.get('backlinks', []) or []:
        add(item)
        if len(results) >= limit:
            return results
    for item in entry.get('related_backlinks', []) or []:
        add(item)
        if len(results) >= limit:
            return results

    if not entries_by_path or len(results) >= limit:
        return results

    scored_candidates: list[tuple[str, float]] = []
    for candidate_path, candidate in entries_by_path.items():
        if candidate_path in seen:
            continue
        candidate_score = _score_project_related_candidate(entry, candidate)
        if candidate_score >= 3.2:
            scored_candidates.append((candidate_path, candidate_score))

    for candidate_path, _ in sorted(scored_candidates, key=lambda item: (-item[1], item[0])):
        add(candidate_path)
        if len(results) >= limit:
            break
    return results


def _typed_relation_from_candidate(
    entry: dict[str, Any],
    candidate: dict[str, Any],
) -> dict[str, Any] | None:
    source_path = str(entry.get('path', '')).replace('\\', '/')
    target_path = str(candidate.get('path', '')).replace('\\', '/')
    if not source_path or not target_path or source_path == target_path:
        return None

    source_role = _safe_lower(entry.get('doc_role_auto', ''))
    target_role = _safe_lower(candidate.get('doc_role_auto', ''))
    source_type = _safe_lower(entry.get('note_type_auto', ''))
    target_type = _safe_lower(candidate.get('note_type_auto', ''))
    source_layer = _safe_lower(entry.get('layer', ''))
    target_layer = _safe_lower(candidate.get('layer', ''))

    explicit_wikilink = any((item.get('target') or '').replace('\\', '/') == target_path for item in (entry.get('resolved_wikilinks', []) or []))
    explicit_related = any((item.get('target') or '').replace('\\', '/') == target_path for item in (entry.get('resolved_related_files', []) or []))
    backlink = target_path in (entry.get('backlinks', []) or [])
    related_backlink = target_path in (entry.get('related_backlinks', []) or [])

    same_project = (
        _safe_lower(entry.get('project_id_auto', ''))
        and _safe_lower(entry.get('project_id_auto', '')) == _safe_lower(candidate.get('project_id_auto', ''))
    )
    same_root = (
        _safe_lower(entry.get('root_domain_auto', ''))
        and _safe_lower(entry.get('root_domain_auto', '')) == _safe_lower(candidate.get('root_domain_auto', ''))
    )

    shared_semantic = len(set(entry.get('semantic_tags_auto', []) or []) & set(candidate.get('semantic_tags_auto', []) or []))
    shared_sections = len(
        {
            normalize_note_key(item)
            for item in (entry.get('section_keys', []) or [])
            if normalize_note_key(item)
        }
        & {
            normalize_note_key(item)
            for item in (candidate.get('section_keys', []) or [])
            if normalize_note_key(item)
        }
    )
    shared_domains = len(set(entry.get('external_ref_domains', []) or []) & set(candidate.get('external_ref_domains', []) or []))
    shared_tokens = len(_entry_signal_tokens(entry) & _entry_signal_tokens(candidate))

    evidence: list[str] = []
    if explicit_wikilink:
        evidence.append('explicit_wikilink')
    if explicit_related:
        evidence.append('related_files')
    if backlink:
        evidence.append('backlink')
    if related_backlink:
        evidence.append('related_backlink')
    if same_project:
        evidence.append('same_project')
    if same_root:
        evidence.append('same_root')
    if shared_semantic:
        evidence.append(f'shared_semantic:{shared_semantic}')
    if shared_sections:
        evidence.append(f'shared_sections:{shared_sections}')
    if shared_domains:
        evidence.append(f'shared_domains:{shared_domains}')
    if shared_tokens:
        evidence.append(f'shared_tokens:{shared_tokens}')

    relation_type = ''
    confidence = 0.0

    if source_type == 'summary-note' and target_layer == 'raw' and (same_project or explicit_related or explicit_wikilink):
        relation_type = 'summarizes'
        confidence = 0.92
    elif source_role == 'review' and target_role in {'result', 'implementation', 'experiment', 'overview', 'architecture'}:
        relation_type = 'review_of'
        confidence = 0.84
    elif source_role == 'decision' and target_role in {'overview', 'architecture', 'implementation', 'reference', 'evaluation'}:
        relation_type = 'decision_for'
        confidence = 0.82
    elif target_role in {'next_action', 'plan'} and source_role in {'review', 'decision', 'result', 'overview', 'architecture', 'implementation'}:
        relation_type = 'next_action_for'
        confidence = 0.84
    elif (source_role == 'implementation' or source_type == 'code-note') and target_role in {'overview', 'architecture', 'problem', 'hypothesis', 'reference'}:
        relation_type = 'implements'
        confidence = 0.79
    elif (source_role, target_role) in DOC_ROLE_FOLLOWUPS:
        relation_type = 'follow_up'
        confidence = 0.76
    elif explicit_wikilink or explicit_related:
        relation_type = 'references'
        confidence = 0.74
    elif same_project and (shared_semantic >= 2 or shared_sections >= 1 or shared_tokens >= 5):
        relation_type = 'same_topic'
        confidence = 0.68
    elif same_root and (shared_semantic >= 3 or shared_domains >= 1 or shared_tokens >= 7):
        relation_type = 'same_topic'
        confidence = 0.62
    else:
        return None

    if explicit_wikilink:
        confidence += 0.08
    if explicit_related:
        confidence += 0.06
    if same_project:
        confidence += 0.05
    if shared_semantic:
        confidence += min(0.08, shared_semantic * 0.02)
    if shared_sections:
        confidence += min(0.05, shared_sections * 0.02)
    if shared_domains:
        confidence += min(0.05, shared_domains * 0.02)

    return {
        'type': relation_type,
        'target_path': target_path,
        'target_rel_path': candidate.get('rel_path', target_path),
        'target_title': candidate.get('title', candidate.get('name', '')),
        'confidence': round(min(0.95, confidence), 2),
        'evidence': evidence[:6],
    }


def build_typed_relations_auto(
    entry: dict[str, Any],
    entries_by_path: dict[str, dict[str, Any]] | None = None,
    limit: int = 8,
) -> list[dict[str, Any]]:
    if not entries_by_path:
        return []

    candidate_paths: list[str] = []
    for item in entry.get('related_notes_auto', []) or []:
        normalized = str(item or '').replace('\\', '/')
        if normalized:
            candidate_paths.append(normalized)
    for item in entry.get('backlinks', []) or []:
        normalized = str(item or '').replace('\\', '/')
        if normalized:
            candidate_paths.append(normalized)

    seen: set[tuple[str, str]] = set()
    relations: list[dict[str, Any]] = []
    for candidate_path in candidate_paths:
        candidate = entries_by_path.get(candidate_path)
        if not candidate:
            continue
        relation = _typed_relation_from_candidate(entry, candidate)
        if not relation:
            continue
        relation_key = (relation['type'], relation['target_path'])
        if relation_key in seen:
            continue
        seen.add(relation_key)
        relations.append(relation)

    relations.sort(
        key=lambda item: (
            RELATION_PRIORITY.get(str(item.get('type', '')), 99),
            -float(item.get('confidence', 0.0)),
            str(item.get('target_rel_path', '')),
        )
    )
    return relations[:limit]


def tokenize(text: str) -> list[str]:
    tokens: list[str] = []
    for token in TOKEN_RE.findall(text or ''):
        normalized = token.lower().strip('._-/')
        if len(normalized) < 2 or normalized in STOPWORDS:
            continue
        tokens.append(normalized)
    return tokens


def build_weighted_tokens(title: str, body: str, headings: list[dict[str, Any]], tags: list[str], aliases: list[str]) -> Counter[str]:
    counter: Counter[str] = Counter()
    for token in tokenize(title):
        counter[token] += 6
    for heading in headings:
        for token in tokenize(heading.get('text', '')):
            counter[token] += 5
    for tag in tags:
        for token in tokenize(tag):
            counter[token] += 4
    for alias in aliases:
        for token in tokenize(alias):
            counter[token] += 3
    for token in tokenize(body):
        counter[token] += 1
    return counter


def infer_metadata_from_path(file_path: Path) -> dict[str, Any]:
    abs_path = file_path.resolve()
    layer = 'unknown'
    source = 'Manual/User'
    root = None
    root_section = ''

    if PATH_SUMMARY.exists():
        try:
            abs_path.relative_to(PATH_SUMMARY)
            layer = 'summary'
            source = 'Generator/AI'
            root = PATH_SUMMARY
            root_section = PATH_SUMMARY.name
        except Exception:
            pass

    if root is None and PATH_RAW.exists():
        try:
            abs_path.relative_to(PATH_RAW)
            layer = 'raw'
            source = 'Manual/User'
            root = PATH_RAW
            root_section = PATH_RAW.name
        except Exception:
            pass

    rel_path = abs_path.relative_to(root).as_posix() if root is not None else abs_path.name
    try:
        vault_rel_path = abs_path.relative_to(VAULT_ROOT).as_posix()
    except Exception:
        vault_rel_path = rel_path

    raw_parts = list(Path(rel_path).parts[:-1])
    parts = [clean_tag(part, strip_numeric_prefix=False) for part in raw_parts]
    domain = parts[0] if len(parts) >= 1 and parts[0] != 'Unknown' else 'General'
    root_domain = domain
    if len(parts) >= 2 and domain == '99_Projects_Archive':
        collection = parts[1] if parts[1] != 'Unknown' else 'General'
        topic = parts[2] if len(parts) >= 3 and parts[2] != 'Unknown' else 'General'
        project_id = collection if collection != 'General' else domain
    else:
        collection = parts[0] if len(parts) >= 1 and parts[0] != 'Unknown' else 'General'
        topic = parts[1] if len(parts) >= 2 and parts[1] != 'Unknown' else 'General'
        project_id = domain if domain != 'General' else collection

    return {
        'domain': domain,
        'root_domain_auto': root_domain,
        'project_id_auto': project_id,
        'collection': collection,
        'topic': topic,
        'layer': layer,
        'source': source,
        'rel_path': rel_path,
        'vault_rel_path': vault_rel_path,
        'root_section': root_section,
        'folder_path': '/'.join(parts),
        'folder_parts': list(parts),
        'title': file_path.stem,
    }


def build_system_tags(meta: dict[str, Any]) -> list[str]:
    tags = [
        f"L/{meta['layer']}",
        f"D/{meta['domain']}",
        f"C/{meta['collection']}",
    ]
    if meta.get('topic') and meta['topic'] != 'General':
        tags.append(f"T/{meta['topic']}")
    return tags


def is_managed_system_tag(tag: str) -> bool:
    normalized = clean_tag(tag)
    return any(normalized.startswith(prefix) for prefix in ('L/', 'D/', 'C/', 'T/'))


def iter_markdown_files(base_dir: Path) -> list[Path]:
    if not base_dir.exists() or not base_dir.is_dir():
        return []
    return sorted(
        [path for path in base_dir.rglob('*.md') if path.is_file() and '.obsidian/' not in path.as_posix()],
        key=lambda item: item.as_posix().lower(),
    )


def resolve_selected_markdown_files(base_dir: Path, selected_files: Iterable[str]) -> list[Path]:
    resolved: list[Path] = []
    for rel in selected_files:
        rel_norm = str(rel).replace('\\', '/').strip('/')
        if not rel_norm.lower().endswith('.md'):
            continue
        candidate = (base_dir / rel_norm).resolve()
        try:
            candidate.relative_to(base_dir)
        except Exception:
            continue
        if candidate.exists() and candidate.is_file():
            resolved.append(candidate)
    return sorted(list(dict.fromkeys(resolved)))


def read_note(file_path: Path) -> tuple[dict[str, Any], str]:
    text = file_path.read_text(encoding='utf-8')
    return split_frontmatter(text)


def build_note_entry(file_path: Path, rules: dict[str, Any]) -> dict[str, Any]:
    frontmatter, body = read_note(file_path)
    inferred = infer_metadata_from_path(file_path)

    user_frontmatter_tags = extract_manual_frontmatter_tags(frontmatter)
    inline_tags = extract_inline_tags(body)
    aliases = extract_aliases(frontmatter)
    wikilinks = extract_wikilinks(body)
    related_files = extract_related_files(frontmatter)
    headings = extract_heading_index(body)
    section_index = extract_section_index(file_path.stem, body)
    external_refs = extract_external_refs(body)

    raw_tags = user_frontmatter_tags + inline_tags
    all_tags = list(dict.fromkeys(clean_tag(tag) for tag in raw_tags if clean_tag(tag)))
    token_weights = build_weighted_tokens(file_path.stem, body, headings, all_tags, aliases)
    keywords = [token for token, _ in token_weights.most_common(40)]

    entry = {
        'path': str(file_path.resolve()).replace('\\', '/'),
        'name': file_path.name,
        'stem': file_path.stem,
        'frontmatter': frontmatter,
        'body': body,
        'title': str(frontmatter.get('title') or inferred['title']).strip() or inferred['title'],
        'layer': inferred['layer'],
        'source': inferred['source'],
        'domain': inferred['domain'],
        'root_domain_auto': inferred['root_domain_auto'],
        'project_id_auto': inferred['project_id_auto'],
        'collection': inferred['collection'],
        'topic': inferred['topic'],
        'rel_path': inferred['rel_path'],
        'vault_rel_path': inferred['vault_rel_path'],
        'root_section': inferred['root_section'],
        'folder_path': inferred['folder_path'],
        'folder_parts': inferred['folder_parts'],
        'manual_tags': list(dict.fromkeys(user_frontmatter_tags)),
        'frontmatter_tags': list(dict.fromkeys(user_frontmatter_tags)),
        'inline_tags': inline_tags,
        'tags': all_tags,
        'aliases': aliases,
        'headings': headings,
        'section_index': section_index,
        'wikilinks': wikilinks,
        'related_files': related_files,
        'external_refs': external_refs,
        'keywords': keywords,
        'token_weights': dict(token_weights.most_common(80)),
        'size': file_path.stat().st_size,
        'updated_at': datetime.fromtimestamp(file_path.stat().st_mtime).isoformat(timespec='seconds'),
    }
    semantic_tags_auto, semantic_tag_scores = score_semantic_tags(entry, rules)
    entry['semantic_tags_auto'] = semantic_tags_auto
    entry['semantic_tag_scores'] = semantic_tag_scores
    entry['note_type_auto'] = infer_note_type_auto(entry, rules)
    entry['doc_role_auto'] = infer_doc_role_auto(entry)
    entry['section_keys'] = build_section_keys(entry)
    entry['external_ref_domains'] = build_external_ref_domains(external_refs)
    entry['tags'] = list(
        dict.fromkeys(
            tag
            for tag in (
                *(entry.get('manual_tags', []) or []),
                *(entry.get('inline_tags', []) or []),
                *(tag for tag in semantic_tags_auto if tag != entry['note_type_auto']),
            )
            if tag
        )
    )
    return entry


def build_resolution_map(entries: list[dict[str, Any]]) -> tuple[dict[str, list[str]], dict[str, str]]:
    resolution_map: dict[str, list[str]] = defaultdict(list)
    search_blobs: dict[str, str] = {}

    for entry in entries:
        path = entry['path']
        candidates = {
            normalize_note_key(entry.get('name', '')),
            normalize_note_key(entry.get('stem', '')),
            normalize_note_key(entry.get('title', '')),
            normalize_note_key(entry.get('rel_path', '')),
            normalize_note_key(entry.get('vault_rel_path', '')),
            normalize_note_key(f"{entry.get('folder_path', '')}/{entry.get('stem', '')}"),
        }
        for alias in entry.get('aliases', []):
            candidates.add(normalize_note_key(alias))
        candidates = {candidate for candidate in candidates if candidate}
        for candidate in candidates:
            if path not in resolution_map[candidate]:
                resolution_map[candidate].append(path)
        blob_parts = [
            entry.get('name', ''),
            entry.get('stem', ''),
            entry.get('title', ''),
            entry.get('rel_path', ''),
            entry.get('vault_rel_path', ''),
            ' '.join(entry.get('aliases', [])),
        ]
        search_blobs[path] = normalize_note_key(' '.join(part for part in blob_parts if part))

    return dict(resolution_map), search_blobs


def resolve_reference(reference: str, resolution_map: dict[str, list[str]], search_blobs: dict[str, str]) -> str:
    normalized = normalize_note_ref(reference)
    if not normalized:
        return ''

    exact_keys = [
        normalize_note_key(normalized),
        normalize_note_key(Path(normalized).name),
    ]
    for key in exact_keys:
        matches = resolution_map.get(key, [])
        if len(matches) == 1:
            return matches[0]
        if len(matches) > 1:
            return sorted(matches, key=len)[0]

    tokens = [token for token in normalize_note_key(normalized).split() if token]
    if not tokens:
        return ''

    best_path = ''
    best_score = 0.0
    joined = ' '.join(tokens)
    basename = normalize_note_key(Path(normalized).name)
    for path, blob in search_blobs.items():
        score = 0.0
        if joined and joined in blob:
            score += 4.0
        if basename and basename in blob:
            score += 3.0
        matched = sum(1 for token in tokens if token in blob)
        if matched:
            score += matched / len(tokens)
        if score > best_score:
            best_score = score
            best_path = path

    return best_path if best_score >= 2.0 else ''


def build_indices(entries: list[dict[str, Any]]) -> dict[str, Any]:
    resolution_map, search_blobs = build_resolution_map(entries)
    entry_by_path = {entry['path']: entry for entry in entries}
    backlinks: dict[str, list[str]] = defaultdict(list)
    related_backlinks: dict[str, list[str]] = defaultdict(list)
    text_index: dict[str, dict[str, int]] = defaultdict(dict)

    for entry in entries:
        resolved_wikilinks: list[dict[str, str]] = []
        for link in entry.get('wikilinks', []):
            resolved = resolve_reference(link, resolution_map, search_blobs)
            resolved_wikilinks.append({'ref': link, 'target': resolved})
            if resolved and entry['path'] not in backlinks[resolved]:
                backlinks[resolved].append(entry['path'])
        entry['resolved_wikilinks'] = resolved_wikilinks

        resolved_related: list[dict[str, str]] = []
        for related in entry.get('related_files', []):
            resolved = resolve_reference(related, resolution_map, search_blobs)
            resolved_related.append({'ref': related, 'target': resolved})
            if resolved and entry['path'] not in related_backlinks[resolved]:
                related_backlinks[resolved].append(entry['path'])
        entry['resolved_related_files'] = resolved_related

        for token, count in entry.get('token_weights', {}).items():
            text_index[token][entry['path']] = text_index[token].get(entry['path'], 0) + int(count)
        for semantic_tag in entry.get('semantic_tags_auto', []):
            text_index[semantic_tag][entry['path']] = text_index[semantic_tag].get(entry['path'], 0) + 5
        for value, weight in (
            (entry.get('project_id_auto', ''), 7),
            (entry.get('root_domain_auto', ''), 5),
            (entry.get('doc_role_auto', ''), 5),
        ):
            for token in normalize_note_key(value).split():
                if token:
                    text_index[token][entry['path']] = text_index[token].get(entry['path'], 0) + weight

    for entry in entries:
        path = entry['path']
        entry['backlinks'] = backlinks.get(path, [])
        entry['related_backlinks'] = related_backlinks.get(path, [])
        entry['related_notes_auto'] = build_related_notes_auto(entry, entry_by_path)
        entry['typed_relations_auto'] = build_typed_relations_auto(entry, entry_by_path)

    metadata_index: list[dict[str, Any]] = []
    link_graph: dict[str, dict[str, Any]] = {}

    for entry in entries:
        path = entry['path']
        metadata_index.append(
            {
                'path': path,
                'vault_rel_path': entry['vault_rel_path'],
                'rel_path': entry['rel_path'],
                'name': entry['name'],
                'title': entry['title'],
                'root_section': entry['root_section'],
                'layer': entry['layer'],
                'domain': entry['domain'],
                'root_domain_auto': entry.get('root_domain_auto', entry['domain']),
                'project_id_auto': entry.get('project_id_auto', entry['collection']),
                'collection': entry['collection'],
                'topic': entry['topic'],
                'folder_path': entry['folder_path'],
                'folder_parts': entry['folder_parts'],
                'tags': entry['tags'],
                'manual_tags': entry.get('manual_tags', []),
                'frontmatter_tags': entry['frontmatter_tags'],
                'inline_tags': entry['inline_tags'],
                'semantic_tags_auto': entry.get('semantic_tags_auto', []),
                'semantic_tag_scores': entry.get('semantic_tag_scores', {}),
                'note_type_auto': entry.get('note_type_auto', ''),
                'doc_role_auto': entry.get('doc_role_auto', ''),
                'aliases': entry['aliases'],
                'keywords': entry['keywords'],
                'headings': entry['headings'],
                'section_index': entry.get('section_index', []),
                'section_keys': entry.get('section_keys', []),
                'wikilinks': entry['wikilinks'],
                'resolved_wikilinks': entry.get('resolved_wikilinks', []),
                'related_files': entry['related_files'],
                'resolved_related_files': entry.get('resolved_related_files', []),
                'external_refs': entry.get('external_refs', []),
                'external_ref_domains': entry.get('external_ref_domains', []),
                'related_notes_auto': entry.get('related_notes_auto', []),
                'typed_relations_auto': entry.get('typed_relations_auto', []),
                'backlinks': entry.get('backlinks', []),
                'related_backlinks': entry.get('related_backlinks', []),
                'size': entry['size'],
                'updated_at': entry['updated_at'],
            }
        )

        link_graph[path] = {
            'name': entry['name'],
            'title': entry['title'],
            'layer': entry['layer'],
            'wikilinks': entry.get('resolved_wikilinks', []),
            'backlinks': entry.get('backlinks', []),
            'related_files': entry.get('resolved_related_files', []),
            'related_backlinks': entry.get('related_backlinks', []),
            'related_notes_auto': entry.get('related_notes_auto', []),
            'typed_relations_auto': entry.get('typed_relations_auto', []),
        }

    compact_text_index = {
        token: {
            'df': len(doc_counts),
            'notes': [
                {'path': path, 'count': count, 'title': entry_by_path[path]['title'], 'layer': entry_by_path[path]['layer']}
                for path, count in sorted(doc_counts.items(), key=lambda item: (-item[1], item[0]))[:50]
            ],
        }
        for token, doc_counts in sorted(text_index.items())
    }

    return {
        'metadata_index': metadata_index,
        'link_graph': link_graph,
        'text_index': compact_text_index,
    }


def merge_and_write_frontmatter(file_path: Path, entry: dict[str, Any], mode: str) -> str:
    existing = dict(entry['frontmatter'])
    preserved = {key: value for key, value in existing.items() if key not in MANAGED_META_KEYS}

    previous_user_tags = extract_manual_frontmatter_tags(existing)
    note_type_auto = str(entry.get('note_type_auto', '')).strip()
    semantic_tags_auto = list(entry.get('semantic_tags_auto', []) or [])
    display_auto_tags = [
        tag
        for tag in semantic_tags_auto
        if tag and tag != note_type_auto and not _is_doc_type_tag(tag)
    ]

    if mode == 'reset':
        manual_tags = list(
            dict.fromkeys(
                clean_tag(tag)
                for tag in previous_user_tags
                if clean_tag(tag) and not _is_doc_type_tag(clean_tag(tag))
            )
        )
    else:
        manual_tags = list(
            dict.fromkeys(
                clean_tag(tag)
                for tag in previous_user_tags
                if clean_tag(tag) and not _is_doc_type_tag(clean_tag(tag))
            )
        )

    final_tags = list(dict.fromkeys(tag for tag in [*manual_tags, *display_auto_tags] if tag))

    related_files = extract_related_files(existing)
    title = str(existing.get('title') or entry['title']).strip() or entry['title']
    managed = {
        'title': title,
        'tags': final_tags,
        'note_type_auto': note_type_auto,
        'doc_role_auto': str(entry.get('doc_role_auto', '')).strip(),
        'index_version': TAGGER_SCHEMA_VERSION,
        'domain': entry['domain'],
        'root_domain_auto': entry.get('root_domain_auto', entry['domain']),
        'project_id_auto': entry.get('project_id_auto', entry['collection']),
        'collection': entry['collection'],
        'topic': entry['topic'],
        'layer': entry['layer'],
        'source': entry['source'],
        'updated_at': entry['updated_at'],
        'rel_path': entry['rel_path'],
    }
    if manual_tags:
        managed['tags_manual'] = manual_tags
    if semantic_tags_auto:
        managed['semantic_tags_auto'] = semantic_tags_auto
    if entry.get('section_keys'):
        managed['section_keys'] = list(entry.get('section_keys', []) or [])
    if entry.get('external_ref_domains'):
        managed['external_ref_domains'] = list(entry.get('external_ref_domains', []) or [])
    if entry.get('related_notes_auto'):
        managed['related_notes_auto'] = list(entry.get('related_notes_auto', []) or [])
    if entry.get('typed_relations_auto'):
        managed['typed_relations_auto'] = [
            {
                'type': relation.get('type', ''),
                'target_rel_path': relation.get('target_rel_path', ''),
                'confidence': relation.get('confidence', 0.0),
            }
            for relation in (entry.get('typed_relations_auto', []) or [])
            if relation.get('type') and relation.get('target_rel_path')
        ]
    if related_files:
        managed['related_files'] = related_files

    merged = {**managed, **preserved}
    frontmatter_text = '---\n' + yaml.safe_dump(merged, sort_keys=False, allow_unicode=True) + '---\n\n'
    file_path.write_text(frontmatter_text + entry['body'], encoding='utf-8')
    return (
        f"Tagged: {entry['rel_path']} | "
        f"tags={len(final_tags)} | "
        f"note_type={note_type_auto or '-'} | "
        f"wikilinks={len(entry.get('wikilinks', []))} | "
        f"related={len(entry.get('related_files', []))}"
    )


def ensure_index_root() -> Path:
    INDEX_ROOT.mkdir(parents=True, exist_ok=True)
    (INDEX_ROOT / 'scopes').mkdir(parents=True, exist_ok=True)
    return INDEX_ROOT


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')


def write_indices(index_payload: dict[str, Any], scope_name: str, rules: dict[str, Any]) -> list[str]:
    index_root = ensure_index_root()
    scope_slug = slugify_scope(scope_name)
    scope_root = index_root / 'scopes' / scope_slug
    generated_at = datetime.now().isoformat(timespec='seconds')

    metadata = index_payload['metadata_index']
    link_graph = index_payload['link_graph']
    text_index = index_payload['text_index']
    graph_edges = sum(
        len(node.get('wikilinks', []))
        + len(node.get('related_files', []))
        + len(node.get('related_notes_auto', []))
        + len(node.get('typed_relations_auto', []))
        for node in link_graph.values()
    )

    payloads = {
        index_root / 'obsidian_metadata_index.json': {'generated_at': generated_at, 'scope': scope_name, 'notes': metadata},
        index_root / 'obsidian_link_graph.json': {'generated_at': generated_at, 'scope': scope_name, 'graph': link_graph},
        index_root / 'obsidian_text_index.json': {'generated_at': generated_at, 'scope': scope_name, 'index': text_index},
        scope_root / 'metadata_index.json': {'generated_at': generated_at, 'scope': scope_name, 'notes': metadata},
        scope_root / 'link_graph.json': {'generated_at': generated_at, 'scope': scope_name, 'graph': link_graph},
        scope_root / 'text_index.json': {'generated_at': generated_at, 'scope': scope_name, 'index': text_index},
    }

    manifest = {
        'generated_at': generated_at,
        'scope': scope_name,
        'scope_slug': scope_slug,
        'vault_root': str(VAULT_ROOT).replace('\\', '/'),
        'raw_root': str(PATH_RAW).replace('\\', '/'),
        'summary_root': str(PATH_SUMMARY).replace('\\', '/'),
        'tagger_workspace': rules.get('workspace', {}),
        'semantic_rules': {
            'canonical_tag_count': len(rules.get('canonical_tags', []) or []),
            'canonical_groups': {key: len(value) for key, value in (rules.get('canonical_groups', {}) or {}).items()},
            'synonym_entries': len(rules.get('synonym_map', {}) or {}),
            'thresholds': rules.get('thresholds', {}) or {},
        },
        'files': {
            'latest_metadata': str((index_root / 'obsidian_metadata_index.json')).replace('\\', '/'),
            'latest_link_graph': str((index_root / 'obsidian_link_graph.json')).replace('\\', '/'),
            'latest_text_index': str((index_root / 'obsidian_text_index.json')).replace('\\', '/'),
            'scope_metadata': str((scope_root / 'metadata_index.json')).replace('\\', '/'),
            'scope_link_graph': str((scope_root / 'link_graph.json')).replace('\\', '/'),
            'scope_text_index': str((scope_root / 'text_index.json')).replace('\\', '/'),
        },
        'counts': {
            'notes': len(metadata),
            'graph_nodes': len(link_graph),
            'graph_edges': graph_edges,
            'tokens': len(text_index),
        },
    }

    payloads[index_root / 'obsidian_index_manifest.json'] = manifest
    payloads[scope_root / 'manifest.json'] = manifest

    for path, payload in payloads.items():
        write_json(path, payload)

    return [str(path).replace('\\', '/') for path in payloads.keys()]


def collect_scope_files(target: str, base_input: Path | None) -> tuple[str, list[Path]]:
    if base_input and base_input.exists():
        try:
            scope_name = base_input.relative_to(VAULT_ROOT).as_posix()
        except Exception:
            scope_name = str(base_input).replace('\\', '/')
        return scope_name, iter_markdown_files(base_input)

    roots: list[Path] = []
    if target in {'summary', 'all'} and PATH_SUMMARY.exists():
        roots.append(PATH_SUMMARY)
    if target in {'raw', 'all'} and PATH_RAW.exists():
        roots.append(PATH_RAW)

    files: list[Path] = []
    for root in roots:
        files.extend(iter_markdown_files(root))
    return target, sorted(list(dict.fromkeys(files)))


def collect_index_files(target: str) -> tuple[str, list[Path]]:
    roots: list[Path] = []
    if PATH_RAW.exists():
        roots.append(PATH_RAW)
    if PATH_SUMMARY.exists():
        roots.append(PATH_SUMMARY)

    files: list[Path] = []
    for root in roots:
        files.extend(iter_markdown_files(root))

    return 'obsidian_vault', sorted(list(dict.fromkeys(files)))


def run_tagging_logic(
    target: str = 'summary',
    mode: str = 'incremental',
    input_dir: str = '',
    selected_files: list[str] | None = None,
) -> str:
    logs = [f'Dynamic Tagger Started | target={target} | mode={mode}']
    selected_files = list(selected_files or [])
    base_input = Path(input_dir).expanduser().resolve() if input_dir else None
    rules = load_tagger_rules()

    logs.append(f'Vault root: {str(VAULT_ROOT).replace("\\", "/")}')
    logs.append(f'Raw root: {str(PATH_RAW).replace("\\", "/")} | exists={PATH_RAW.exists()}')
    logs.append(f'Summary root: {str(PATH_SUMMARY).replace("\\", "/")} | exists={PATH_SUMMARY.exists()}')
    logs.append(f"Tagger rules: {rules.get('workspace', {}).get('rules_dir', '-')}")
    logs.append(f"Canonical tags: {len(rules.get('canonical_tags', []) or [])} | Synonym entries: {len(rules.get('synonym_map', {}) or {})}")

    index_scope_name, all_files = collect_index_files(target=target)
    if not all_files:
        return '\n'.join(logs + ['No markdown files found for the requested scope.'])

    rewrite_scope_name, rewrite_candidates = collect_scope_files(target=target, base_input=base_input)
    if base_input and selected_files:
        files_to_update = resolve_selected_markdown_files(base_input, selected_files)
        if not files_to_update:
            files_to_update = rewrite_candidates
    else:
        files_to_update = rewrite_candidates if base_input else all_files

    logs.append(f'Index scope: {index_scope_name}')
    logs.append(f'Rewrite scope: {rewrite_scope_name}')
    logs.append(f'Scanned markdown files: {len(all_files)}')
    logs.append(f'Files to rewrite: {len(files_to_update)}')

    entries: list[dict[str, Any]] = []
    for file_path in all_files:
        try:
            entries.append(build_note_entry(file_path, rules))
        except Exception as exc:
            logs.append(f'Read Error: {file_path.name} | {exc}')

    index_payload = build_indices(entries)
    entry_map = {entry['path']: entry for entry in entries}

    rewritten = 0
    for file_path in files_to_update:
        entry = entry_map.get(str(file_path.resolve()).replace('\\', '/'))
        if not entry:
            continue
        try:
            logs.append(merge_and_write_frontmatter(file_path, entry, mode=mode))
            rewritten += 1
        except Exception as exc:
            logs.append(f'Write Error: {file_path.name} | {exc}')

    written_indices = write_indices(index_payload, scope_name=index_scope_name, rules=rules)

    logs.append(f'Rewritten files: {rewritten}')
    logs.append(f'Metadata notes: {len(index_payload["metadata_index"])}')
    logs.append(f'Graph nodes: {len(index_payload["link_graph"])}')
    logs.append(
        'Graph edges: '
        + str(
            sum(
                len(node.get('wikilinks', []))
                + len(node.get('related_files', []))
                + len(node.get('related_notes_auto', []))
                + len(node.get('typed_relations_auto', []))
                for node in index_payload['link_graph'].values()
            )
        )
    )
    logs.append(f'Text index tokens: {len(index_payload["text_index"])}')
    logs.append('Index files:')
    logs.extend([f'- {path}' for path in written_indices])
    return '\n'.join(logs)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--target', default='summary')
    parser.add_argument('--mode', default='incremental')
    parser.add_argument('--input_dir', default='')
    parser.add_argument('--selected_files', nargs='*', default=[])
    args = parser.parse_args()
    print(
        run_tagging_logic(
            target=args.target,
            mode=args.mode,
            input_dir=args.input_dir,
            selected_files=list(args.selected_files or []),
        )
    )
