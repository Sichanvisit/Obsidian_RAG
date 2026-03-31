import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

from backend.main import (
    _merge_hop_candidate_score,
    _score_layer_alignment,
    _score_relation_alignment,
)


def _build_note(*, layer: str, note_type: str, doc_role: str, path: str) -> dict:
    return {
        "layer": layer,
        "note_type_auto": note_type,
        "doc_role_auto": doc_role,
        "path": path,
        "vault_rel_path": path,
    }


def test_summary_layer_bonus_favors_plan_queries() -> None:
    priors = {"plan": 1.6}
    summary_plan = _build_note(
        layer="summary",
        note_type="summary-note",
        doc_role="plan",
        path="11_RAG_Knowledge_Base/03_Project/03_Project_Roadmap.md",
    )
    raw_plan = _build_note(
        layer="raw",
        note_type="roadmap-note",
        doc_role="plan",
        path="10_AI_Engineering/03_Project/notes/roadmap.md",
    )

    assert _score_layer_alignment(summary_plan, priors) > _score_layer_alignment(raw_plan, priors)


def test_raw_layer_bonus_favors_implementation_queries() -> None:
    priors = {"implementation": 1.6}
    raw_implementation = _build_note(
        layer="raw",
        note_type="code-note",
        doc_role="implementation",
        path="10_AI_Engineering/03_Project/Code_Snippets/build_feature.md",
    )
    summary_architecture = _build_note(
        layer="summary",
        note_type="summary-note",
        doc_role="architecture",
        path="11_RAG_Knowledge_Base/03_Project/03_Project_Code_Summary.md",
    )

    assert _score_layer_alignment(raw_implementation, priors) > _score_layer_alignment(summary_architecture, priors)


def test_relation_alignment_prefers_implements_for_implementation_queries() -> None:
    priors = {"implementation": 1.6}

    assert _score_relation_alignment("implements", 0.92, priors) > _score_relation_alignment("same_topic", 0.92, priors)


def test_merge_hop_candidate_score_preserves_direct_match_and_adds_relation_bonus() -> None:
    merged = _merge_hop_candidate_score(
        6.0,
        {
            "score": 4.0,
            "relation_type": "implements",
        },
    )

    assert merged > 6.0
