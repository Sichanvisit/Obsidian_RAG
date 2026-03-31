from __future__ import annotations

from collections import defaultdict, deque
from pathlib import Path
from typing import Any, Callable, Iterable


def _safe_str(value: Any) -> str:
    return str(value or "").strip()


def _normalize_path(value: Any) -> str:
    return _safe_str(value).replace("\\", "/")


def _path_label(path_value: str, note_lookup: dict[str, dict[str, Any]] | None = None) -> str:
    normalized = _normalize_path(path_value)
    if note_lookup:
        note = note_lookup.get(normalized) or {}
        title = _safe_str(note.get("title", ""))
        if title:
            return title
    return Path(normalized).stem or normalized


def build_relation_adjacency(notes: Iterable[dict[str, Any]] | dict[str, dict[str, Any]]) -> dict[str, Any]:
    iterable = notes.values() if isinstance(notes, dict) else notes
    outbound: dict[str, list[dict[str, Any]]] = defaultdict(list)
    inbound: dict[str, list[dict[str, Any]]] = defaultdict(list)
    seen_edges: set[tuple[str, str, str]] = set()
    nodes: set[str] = set()

    for note in iterable:
        if not isinstance(note, dict):
            continue
        source_path = _normalize_path(note.get("path", ""))
        if not source_path:
            continue
        nodes.add(source_path)

        for relation in (note.get("typed_relations_auto", []) or []):
            if not isinstance(relation, dict):
                continue
            target_path = _normalize_path(relation.get("target_path", ""))
            relation_type = _safe_str(relation.get("type", ""))
            if not target_path or not relation_type or target_path == source_path:
                continue

            edge_key = (source_path, target_path, relation_type)
            if edge_key in seen_edges:
                continue
            seen_edges.add(edge_key)
            nodes.add(target_path)

            edge = {
                "source_path": source_path,
                "target_path": target_path,
                "relation_type": relation_type,
                "confidence": float(relation.get("confidence", 0.0) or 0.0),
                "target_title": _safe_str(relation.get("target_title", "")),
                "evidence": list(relation.get("evidence", []) or []),
            }
            outbound[source_path].append(edge)
            inbound[target_path].append(edge)

    for adjacency in (outbound, inbound):
        for edges in adjacency.values():
            edges.sort(
                key=lambda item: (
                    -float(item.get("confidence", 0.0) or 0.0),
                    _safe_str(item.get("relation_type", "")),
                    _safe_str(item.get("target_path", "")),
                )
            )

    return {
        "outbound": dict(outbound),
        "inbound": dict(inbound),
        "nodes": sorted(nodes),
    }


def expand_relation_paths(
    seed_path: str,
    adjacency: dict[str, Any],
    *,
    max_depth: int = 2,
    limit: int = 24,
    direction: str = "both",
    allowed_types: set[str] | None = None,
    blocked_types: set[str] | None = None,
) -> list[dict[str, Any]]:
    normalized_seed = _normalize_path(seed_path)
    if not normalized_seed or max_depth <= 0:
        return []

    outbound = adjacency.get("outbound", {}) if isinstance(adjacency, dict) else {}
    inbound = adjacency.get("inbound", {}) if isinstance(adjacency, dict) else {}
    queue: deque[tuple[str, list[dict[str, Any]], set[str]]] = deque([(normalized_seed, [], {normalized_seed})])
    paths: list[dict[str, Any]] = []

    while queue and len(paths) < limit * 4:
        current_path, relation_path, visited = queue.popleft()
        if len(relation_path) >= max_depth:
            continue

        candidate_edges: list[tuple[str, dict[str, Any], str]] = []
        if direction in {"both", "forward"}:
            for edge in (outbound.get(current_path, []) or []):
                candidate_edges.append(("forward", edge, _normalize_path(edge.get("target_path", ""))))
        if direction in {"both", "reverse"}:
            for edge in (inbound.get(current_path, []) or []):
                candidate_edges.append(("reverse", edge, _normalize_path(edge.get("source_path", ""))))

        for edge_direction, edge, next_path in candidate_edges:
            relation_type = _safe_str(edge.get("relation_type", ""))
            if not next_path or not relation_type or next_path in visited or next_path == normalized_seed:
                continue
            if allowed_types and relation_type not in allowed_types:
                continue
            if blocked_types and relation_type in blocked_types:
                continue

            hop = {
                "source_path": current_path,
                "target_path": next_path,
                "relation_type": relation_type,
                "confidence": float(edge.get("confidence", 0.0) or 0.0),
                "direction": edge_direction,
            }
            new_relation_path = relation_path + [hop]
            directions = {step.get("direction", "forward") for step in new_relation_path}
            if len(directions) == 1:
                path_direction = next(iter(directions))
            else:
                path_direction = "mixed"

            paths.append(
                {
                    "seed_path": normalized_seed,
                    "target_path": next_path,
                    "relation_type": relation_type,
                    "relation_types": [step.get("relation_type", "") for step in new_relation_path],
                    "relation_path": new_relation_path,
                    "hop_count": len(new_relation_path),
                    "confidence": sum(float(step.get("confidence", 0.0) or 0.0) for step in new_relation_path)
                    / max(len(new_relation_path), 1),
                    "direction": path_direction,
                }
            )

            if len(new_relation_path) < max_depth:
                queue.append((next_path, new_relation_path, visited | {next_path}))

    paths.sort(
        key=lambda item: (
            int(item.get("hop_count", 99) or 99),
            -float(item.get("confidence", 0.0) or 0.0),
            _safe_str(item.get("target_path", "")),
        )
    )
    return paths[:limit]


def score_relation_path(
    path_payload: dict[str, Any],
    *,
    alignment_fn: Callable[[str, float, dict[str, float]], float] | None = None,
    role_priors: dict[str, float] | None = None,
) -> float:
    relation_path = list(path_payload.get("relation_path", []) or [])
    if not relation_path:
        return 0.0

    priors = role_priors or {}
    seen_types: set[str] = set()
    total = 0.0

    for index, hop in enumerate(relation_path):
        relation_type = _safe_str(hop.get("relation_type", ""))
        confidence = float(hop.get("confidence", 0.0) or 0.0)
        direction = _safe_str(hop.get("direction", "")) or "forward"
        base = (
            alignment_fn(relation_type, confidence, priors)
            if alignment_fn
            else max(0.25, min(1.0, confidence))
        )
        base *= 0.72 ** index
        if direction == "reverse":
            base *= 0.84
        total += base
        if relation_type:
            seen_types.add(relation_type)

    if len(relation_path) > 1:
        total += 0.12
    total += min(0.18, 0.06 * max(0, len(seen_types) - 1))
    return round(total, 6)


def describe_relation_path(
    path_payload: dict[str, Any],
    *,
    note_lookup: dict[str, dict[str, Any]] | None = None,
) -> str:
    relation_path = list(path_payload.get("relation_path", []) or [])
    if not relation_path:
        return ""

    seed_path = _normalize_path(path_payload.get("seed_path", ""))
    if not seed_path:
        seed_path = _normalize_path(relation_path[0].get("source_path", ""))
    if not seed_path:
        return ""

    fragments = [f"[[{_path_label(seed_path, note_lookup)}]]"]
    current_path = seed_path

    for hop in relation_path:
        direction = _safe_str(hop.get("direction", "")) or "forward"
        relation_type = _safe_str(hop.get("relation_type", "")) or "related"
        next_path = _normalize_path(hop.get("target_path", "")) or current_path
        if direction == "reverse":
            fragments.append(f"<--{relation_type}--")
        else:
            fragments.append(f"--{relation_type}-->")
        fragments.append(f"[[{_path_label(next_path, note_lookup)}]]")
        current_path = next_path

    return "Relation chain: " + " ".join(fragments) + "."
