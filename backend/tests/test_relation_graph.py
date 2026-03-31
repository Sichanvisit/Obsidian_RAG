import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

from backend.main import _merge_chain_candidate_score, _score_relation_alignment
from backend.src.graph.relation_graph import (
    build_relation_adjacency,
    describe_relation_path,
    expand_relation_paths,
    score_relation_path,
)


def _note(path: str, *relations: dict) -> dict:
    return {
        "path": path,
        "title": Path(path).stem,
        "typed_relations_auto": list(relations),
    }


def _relation(target_path: str, relation_type: str, confidence: float) -> dict:
    return {
        "target_path": target_path,
        "type": relation_type,
        "confidence": confidence,
    }


def test_build_relation_adjacency_creates_outbound_and_inbound_maps() -> None:
    notes = [
        _note("vault/A.md", _relation("vault/B.md", "implements", 0.91)),
        _note("vault/B.md", _relation("vault/C.md", "follow_up", 0.83)),
    ]

    adjacency = build_relation_adjacency(notes)

    assert "vault/A.md" in adjacency["outbound"]
    assert adjacency["outbound"]["vault/A.md"][0]["target_path"] == "vault/B.md"
    assert "vault/B.md" in adjacency["inbound"]
    assert adjacency["inbound"]["vault/B.md"][0]["source_path"] == "vault/A.md"


def test_expand_relation_paths_returns_direct_and_two_hop_paths_without_cycle() -> None:
    notes = [
        _note("vault/A.md", _relation("vault/B.md", "implements", 0.91)),
        _note("vault/B.md", _relation("vault/C.md", "follow_up", 0.83)),
        _note("vault/C.md", _relation("vault/A.md", "review_of", 0.72)),
    ]
    adjacency = build_relation_adjacency(notes)

    paths = expand_relation_paths("vault/A.md", adjacency, max_depth=2, limit=12)

    direct_targets = {item["target_path"] for item in paths if item["hop_count"] == 1}
    two_hop_targets = {item["target_path"] for item in paths if item["hop_count"] == 2}

    assert "vault/B.md" in direct_targets
    assert "vault/C.md" in two_hop_targets
    assert "vault/A.md" not in {item["target_path"] for item in paths}


def test_score_relation_path_prefers_aligned_forward_chain() -> None:
    priors = {"implementation": 1.6}
    adjacency = build_relation_adjacency(
        [
            _note("vault/A.md", _relation("vault/B.md", "implements", 0.92)),
            _note("vault/B.md", _relation("vault/C.md", "follow_up", 0.84)),
            _note("vault/D.md", _relation("vault/E.md", "same_topic", 0.92)),
        ]
    )

    chain_path = next(
        item
        for item in expand_relation_paths("vault/A.md", adjacency, max_depth=2, limit=12)
        if item["target_path"] == "vault/C.md"
    )
    same_topic_path = next(
        item
        for item in expand_relation_paths("vault/D.md", adjacency, max_depth=1, limit=12)
        if item["target_path"] == "vault/E.md"
    )

    chain_score = score_relation_path(
        chain_path,
        alignment_fn=_score_relation_alignment,
        role_priors=priors,
    )
    same_topic_score = score_relation_path(
        same_topic_path,
        alignment_fn=_score_relation_alignment,
        role_priors=priors,
    )

    assert chain_score > same_topic_score


def test_describe_relation_path_includes_readable_chain() -> None:
    path_payload = {
        "seed_path": "vault/A.md",
        "target_path": "vault/C.md",
        "relation_path": [
            {
                "source_path": "vault/A.md",
                "target_path": "vault/B.md",
                "relation_type": "implements",
                "confidence": 0.9,
                "direction": "forward",
            },
            {
                "source_path": "vault/B.md",
                "target_path": "vault/C.md",
                "relation_type": "follow_up",
                "confidence": 0.82,
                "direction": "forward",
            },
        ],
    }

    description = describe_relation_path(path_payload)

    assert "implements" in description
    assert "follow_up" in description
    assert "A" in description and "C" in description


def test_merge_chain_candidate_score_caps_two_hop_bonus() -> None:
    merged = _merge_chain_candidate_score(
        6.0,
        {
            "relation_type": "implements",
            "path_score": 5.0,
            "hop_count": 2,
        },
    )

    assert merged > 6.0
    assert merged < 8.0
