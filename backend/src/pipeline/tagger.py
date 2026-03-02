import os
import yaml
import re
import argparse
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime

# ==========================================
# 1. 환경 설정
# ==========================================
load_dotenv()
PATH_RAW = os.getenv("DATA_DIC_PATH", "./10_AI_Engineering")
PATH_SUMMARY = os.getenv("DATA_SUMMATION_PATH", "./11_RAG_Knowledge_Base")

# 허용할 확장자 (링크 추출용)
VALID_EXTENSIONS = ('.py', '.md', '.txt', '.json', '.yaml', '.yml', '.ipynb', '.js', '.html', '.css', '.c', '.cpp',
                    '.h', '.sh', '.bat', '.dockerfile')


# ==========================================
# 🛠️ 유틸리티 함수
# ==========================================
def clean_tag(text: str) -> str:
    """폴더명을 태그로 변환 (숫자 접두사 제거 선택 가능)"""
    if not text: return "Unknown"
    # 숫자_ 제거 (예: 10_AI -> AI)
    text = re.sub(r"^\d+_", "", text)
    # 공백 -> 언더바
    text = str(text).replace(" ", "_")
    # 특수문자 제거
    text = re.sub(r"[^a-zA-Z0-9가-힣_\-/]", "", text)
    return text


def extract_obsidian_links(text: str) -> list[str]:
    """엄격한 링크 추출 (확장자 필수)"""
    if not text: return []
    matches = re.findall(r"\[\[(.*?)\]\]", text)
    links = set()
    for m in matches:
        target = m.split("|")[0].strip()
        clean_name = re.sub(r"[^a-zA-Z0-9가-힣_\-\. ]", "", target).strip()

        has_ext = any(clean_name.lower().endswith(ext) for ext in VALID_EXTENSIONS)
        is_special = clean_name.upper() in ["README", "LICENSE", "DOCKERFILE", "MAKEFILE"]

        if not has_ext and not is_special: continue
        if clean_name.lower().endswith(".md"): clean_name = clean_name[:-3]
        if clean_name: links.add(clean_name)
    return sorted(list(links))


def split_frontmatter(text: str):
    stripped = text.lstrip()
    if not stripped.startswith("---"): return None, text
    lines = text.splitlines()
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            yaml_block = "\n".join(lines[1:i])
            body = "\n".join(lines[i + 1:]).lstrip("\n")
            return yaml_block, body
    return None, text


# ==========================================
# 🧠 [핵심] 폴더 구조 기반 동적 추론
# ==========================================
def infer_metadata_from_path(file_path: Path):
    try:
        abs_path = file_path.resolve()
        summary_root = Path(PATH_SUMMARY).resolve()
        raw_root = Path(PATH_RAW).resolve()

        # 1. 루트 판별 (pathlib 사용 안전 비교)
        if str(abs_path).startswith(str(summary_root)):
            base_root = summary_root
            layer = "summary"
            source = "Generator/AI"
        elif str(abs_path).startswith(str(raw_root)):
            base_root = raw_root
            layer = "raw"
            source = "Manual/User"
        else:
            return "General", "General", "General", "unknown", "Unknown"

        # 2. 상대 경로 분석 (폴더 깊이 -> 태그 매핑)
        rel_path = abs_path.relative_to(base_root)
        parts = rel_path.parts[:-1]  # 파일명 제외한 폴더들

        # Depth 1: Domain (예: AI_Engineering)
        domain = clean_tag(parts[0]) if len(parts) > 0 else "General"

        # Depth 2: Collection (예: LLM_GenAI)
        collection = clean_tag(parts[1]) if len(parts) > 1 else domain

        # Depth 3: Topic (예: Concepts)
        topic = clean_tag(parts[2]) if len(parts) > 2 else "General"

        return domain, collection, topic, layer, source

    except Exception:
        return "Error", "Error", "Error", "error", "Error"


# ==========================================
# 📝 메타데이터 업데이트
# ==========================================
def update_file_frontmatter(path: Path, mode: str = "incremental") -> str:
    try:
        text = path.read_text(encoding="utf-8")
    except:
        return f"⚠️ Read Error: {path.name}"

    yaml_block, body = split_frontmatter(text)
    existing = {}
    if yaml_block:
        try:
            existing = yaml.safe_load(yaml_block) or {}
        except:
            existing = {}

    # 1. 구조 기반 추론
    domain, collection, topic, layer, source = infer_metadata_from_path(path)

    # 2. 링크 추출 (Summary만)
    related_files = []
    if layer == "summary":
        extracted_links = extract_obsidian_links(body)
        if mode == "incremental" and "related_files" in existing:
            old = existing.get("related_files", [])
            if isinstance(old, str): old = [old]
            if not isinstance(old, list): old = []
            related_files = sorted(list(set(old + extracted_links)))
        else:
            related_files = extracted_links

    # 3. 태그 구성 (폴더 구조 반영)
    new_tags = [f"L/{layer}", f"D/{domain}", f"C/{collection}"]
    if topic != "General": new_tags.append(f"T/{topic}")

    final_tags = []
    if mode == "reset":
        final_tags = sorted(list(set(new_tags)))
    else:
        old_tags = existing.get("tags", [])
        if isinstance(old_tags, str): old_tags = [t.strip() for t in old_tags.split(",")]
        final_tags = sorted(list(set(old_tags + new_tags)))

    # 4. 메타데이터 조립
    meta = {
        "title": str(path.stem),
        "tags": final_tags,
        "domain": domain,
        "collection": collection,
        "topic": topic,
        "layer": layer,
        "source": source,
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "rel_path": str(path).replace("\\", "/")
    }

    if related_files:
        meta["related_files"] = related_files
    elif "related_files" in meta:
        del meta["related_files"]

    # 저장
    fm_str = "---\n" + yaml.safe_dump(meta, sort_keys=False, allow_unicode=True) + "---\n\n"
    try:
        path.write_text(fm_str + body, encoding="utf-8")
        link_cnt = f" (🔗 {len(related_files)})" if related_files else ""
        return f"✅ Tagged: {path.name} [{domain}/{collection}]{link_cnt}"
    except Exception as e:
        return f"❌ Write Error: {e}"


# ==========================================
# 🚀 실행부
# ==========================================
def run_tagging_logic(target="summary", mode="incremental"):
    logs = [f"🚀 Dynamic Tagger Started (Target: {target}, Mode: {mode})"]
    targets = []
    if (target in ["summary", "all"]) and os.path.exists(PATH_SUMMARY): targets.append(Path(PATH_SUMMARY))
    if (target in ["raw", "all"]) and os.path.exists(PATH_RAW): targets.append(Path(PATH_RAW))

    count = 0
    for t_dir in targets:
        logs.append(f"📂 Scanning: {t_dir}")
        for f in t_dir.rglob("*.md"):
            res = update_file_frontmatter(f, mode=mode)
            if "✅" in res: count += 1
            if "Error" in res or "🔗" in res: logs.append(res)

    logs.append(f"🎉 Processed {count} files.")
    return "\n".join(logs)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", default="summary")
    parser.add_argument("--mode", default="incremental")
    args = parser.parse_args()
    print(run_tagging_logic(args.target, args.mode))