import re
from typing import Set, Tuple


def check_duplicate(text: str, seen_sentences: Set[str]) -> Tuple[bool, str]:
    if len(text) < 1200:
        return False, ""

    sentences = re.split(r"[.!?]\s+", text)
    if len(sentences) < 5:
        return False, ""

    non_empty = [s.strip() for s in sentences if s and s.strip()]
    if not non_empty:
        return False, ""
    last_sentence = non_empty[-1]
    normalized_last = re.sub(r"\s+", " ", last_sentence)
    if len(normalized_last) >= 5 and normalized_last in seen_sentences:
        return True, f"repeated sentence: '{last_sentence[:50]}...'"
    if len(normalized_last) >= 5:
        seen_sentences.add(normalized_last)

    if len(text) > 2000:
        last_400 = text[-400:]
        for i in range(100, 220):
            if i > len(last_400):
                break
            pattern = last_400[-i:]
            if text[:-400].count(pattern) >= 3:
                return True, f"repeated pattern: '{pattern[:40]}...'"

    # Short repetitive sentence loops (e.g., same sentence repeated many times).
    normalized_sentences = [
        re.sub(r"\s+", " ", s.strip().lower()) for s in sentences if s and s.strip()
    ]
    tail = normalized_sentences[-12:]
    if len(tail) >= 8:
        unique_tail = set(tail)
        if len(unique_tail) <= 2:
            return True, "repeated short-sentence loop in tail"

    return False, ""


def strip_markdown_fence(answer: str) -> str:
    cleaned = answer.strip()

    if cleaned.startswith("```markdown"):
        cleaned = cleaned[len("```markdown") :].strip()
    elif cleaned.startswith("```md"):
        cleaned = cleaned[len("```md") :].strip()
    elif cleaned.startswith("```"):
        first_newline = cleaned.find("\n")
        if first_newline > 0:
            cleaned = cleaned[first_newline + 1 :].strip()

    if cleaned.endswith("```"):
        cleaned = cleaned[:-3].strip()

    return cleaned


def dedupe_repetitions(answer: str, max_same_line: int = 1) -> str:
    text = (answer or "").strip()
    if not text:
        return text

    lines = [ln.rstrip() for ln in text.splitlines()]
    seen = {}
    deduped_lines = []
    for ln in lines:
        key = re.sub(r"\s+", " ", ln.strip().lower())
        if not key:
            deduped_lines.append(ln)
            continue
        seen[key] = seen.get(key, 0) + 1
        if seen[key] <= max_same_line:
            deduped_lines.append(ln)

    text = "\n".join(deduped_lines).strip()

    parts = re.split(r"([.!?]\s+)", text)
    if len(parts) < 3:
        return text

    out = []
    prev_norm = ""
    i = 0
    while i < len(parts):
        sent = parts[i]
        punct = parts[i + 1] if i + 1 < len(parts) else ""
        chunk = (sent + punct).strip()
        norm = re.sub(r"\s+", " ", chunk.lower())
        if norm and norm != prev_norm:
            out.append(chunk)
            prev_norm = norm
        i += 2

    return " ".join(out).strip() or text
