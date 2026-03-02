"""
GraphFlow - Simplified Pipeline with Detailed Analytics
User requirements:
1. Question analysis (detailed logging)
2. Summary + Raw retrieval (metrics tracking)
3. Retrieval validation (quality check)
4. Answer generation (time/token stats) 5. Review (quality checks)
"""
import logging
import time
import re
from typing import Generator, Dict, Any, List, Tuple
from pathlib import Path

from backend.src.rag import RagEngine
from backend.src.schemas import AgentState, RagDocument
from backend.src.enums import LayerType
from backend.src.constants import (
    GRAPH_PROMPT_REWRITE,
    GRAPH_PROMPT_BASE,
    MAX_RETRIES,
    SCORE_THRESHOLD
)
from backend.src.core.utils.scoring import ScoreWeights, LevelKeywords
from backend.src.generation import check_duplicate, strip_markdown_fence, dedupe_repetitions

logger = logging.getLogger("GraphFlow")

class AgenticFlow:
    # ?? ?? ??: ?? ?? ?? ??
    
    def __init__(self):
        self.engine = RagEngine()
        self.total_start_time = None
        self._project_hints = {
            "p01": ["01_", "01_python", "01_beginner", "01_proj"],
            "p02": ["02_", "02_intermediate", "02_proj"],
            "p03": ["03_", "03_second", "second_brain", "advanced"],
            "cfd": ["cfd", "04_cfd", "04_cfd_analysis"],
            "python": ["python", "01_python", "python_core"],
            "ml": ["ml", "machine_learning", "11_machine"],
            "dl": ["dl", "deep_learning", "12_deep"],
            "llm": ["llm", "genai", "13_llm", "13_llm_genai"],
        }

    def _detect_target_project(self, state: AgentState) -> Tuple[str, List[str]]:
        search_target = " ".join([
            (state.project_name or ""),
            (state.query or ""),
            (state.current_query or ""),
            (state.history or ""),
        ]).lower()

        for proj, hints in self._project_hints.items():
            if any(h.lower() in search_target for h in hints):
                return proj, hints
        return "", []

    def _doc_project_score(self, source: str, folder: str, hints: List[str]) -> int:
        if not hints:
            return 1
        text = f"{source} {folder}".lower()
        return sum(1 for h in hints if h.lower() in text)

    def _filter_doc_infos_by_project(self, docs: List[Dict[str, Any]], hints: List[str]) -> List[Dict[str, Any]]:
        if not docs or not hints:
            return docs
        scored = []
        for d in docs:
            s = self._doc_project_score(d.get("source", ""), d.get("folder", ""), hints)
            if s > 0:
                scored.append((s, d))
        if not scored:
            return docs
        scored.sort(key=lambda x: (x[0], x[1].get("score", 0)), reverse=True)
        return [d for _, d in scored]
    
    # =========================================================================
    # ?쒓? 二쇱꽍 蹂듦뎄
    # =========================================================================
    def _generate_related_resources(self, state: AgentState) -> str:
        """Build a clean related-resources section from tag-linked references."""
        try:
            collected_tags = []
            for doc in state.context:
                if hasattr(doc, "metadata"):
                    tags = doc.metadata.get("tags", [])
                    if isinstance(tags, str):
                        import ast
                        try:
                            tags = ast.literal_eval(tags)
                        except Exception:
                            tags = []
                    collected_tags.extend(tags)

                    ct = doc.metadata.get("collected_tags", [])
                    if ct:
                        collected_tags.extend(ct)

            unique_tags = list(dict.fromkeys([t for t in collected_tags if isinstance(t, str)]))
            if not unique_tags:
                return ""

            additional_docs = self.engine.search_by_tags(unique_tags[:5], k=3)
            if not additional_docs:
                return ""

            used_sources = {doc.source_path.lower() for doc in state.context}
            new_docs = [d for d in additional_docs if d.source_path.lower() not in used_sources]
            if not new_docs:
                return ""

            lines = ["---", "## 愿???먮즺 異붿쿇", "", "?대쾲 ?듬?怨??곌???異붽? ?먮즺?낅땲??", ""]

            for i, doc in enumerate(new_docs[:3], 1):
                fname = Path(doc.source_path).stem
                tag = doc.metadata.get("from_tag", "") if hasattr(doc, "metadata") else ""
                snippet = (doc.page_content or "").replace("\n", " ").strip()
                snippet = re.sub(r"^---.*?---", "", snippet)
                snippet = re.sub(r"\s+", " ", snippet).strip()
                snippet = snippet[:180]

                lines.append(f"{i}. {fname}")
                if tag:
                    lines.append(f"- ?쒓렇: `{tag}`")
                lines.append(f"- ?댁슜: {snippet}...")
                lines.append("")

            return "\n".join(lines).strip()

        except Exception as e:
            logger.debug(f"related resources generation failed: {e}")
            return ""
    def _decompose_query(self, query: str) -> List[str]:
        text = (query or "").strip()
        if not text:
            return []
        out: List[str] = []
        for sep in [",", " 洹몃━怨?", " 諛?", " and ", " & ", " ? ", " 怨?"]:
            if sep in text:
                out.extend([p.strip() for p in text.split(sep) if p.strip()])
        if ("?" in text or re.search(r"\d+?", text)) and "?蹂?諛쒗몴" not in out:
            out.append("?蹂?諛쒗몴")
        out = [x for x in list(dict.fromkeys(out)) if x and x != text]
        return out[:4]

    def _reformulate_with_context(self, query: str, history: str) -> str:
        query = (query or "").strip()
        history = (history or "").strip()
        if not history:
            return query

        project_context = ""
        m = re.search(r"\[?꾨줈?앺듃 而⑦뀓?ㅽ듃:\s*(.+?)\]", history)
        if m:
            project_context = m.group(1).strip()
        if project_context and project_context.split()[0].lower() not in query.lower():
            return f"{project_context} {query}".strip()
        return query

    def _expand_generic_query(self, query: str, project_name: str = "") -> str:
        """Expand short/generic user questions into a retrieval-friendly rewritten query."""
        q = (query or "").strip()
        if not q:
            return q

        q_lower = q.lower()
        is_korean = bool(re.search(r"[가-힣]", q))
        token_count = len(re.findall(r"[A-Za-z0-9가-힣_]+", q))
        generic_markers = [
            "자세", "설명", "알려", "개요", "정리", "뭐야", "무엇", "어떻게", "전체",
            "프로젝트", "초급", "중급", "고급",
        ]
        generic_hit = any(m in q for m in generic_markers)

        # Expand only when query is broad and short to avoid over-rewriting precise questions.
        if not is_korean or token_count >= 14 or not generic_hit:
            return q

        base = q
        project_name_norm = (project_name or "").strip()
        if project_name_norm.lower() == "default_chat":
            project_name_norm = ""
        if project_name_norm and project_name_norm.lower() not in q_lower:
            base = f"{project_name_norm} {base}".strip()
        common_axes = ["핵심 목표", "입출력 구조", "실행 순서", "실패 원인", "개선 방법"]
        data_axes = ["데이터셋 구성", "전처리", "라벨링 규칙", "데이터 품질 점검"]
        train_axes = ["모델 선택 이유", "학습 설정", "하이퍼파라미터", "학습 안정화 포인트"]
        eval_axes = ["평가 지표", "오류 패턴", "검증 방법", "성능 해석"]
        arch_axes = ["시스템 구조", "검색/생성 파이프라인", "모듈 역할", "운영 체크포인트"]

        picked = []
        if any(k in q for k in ["데이터", "전처리", "라벨", "수집"]):
            picked.extend(data_axes)
        if any(k in q for k in ["학습", "훈련", "모델", "하이퍼", "파인튜닝"]):
            picked.extend(train_axes)
        if any(k in q for k in ["평가", "지표", "검증", "오류", "성능"]):
            picked.extend(eval_axes)
        if any(k in q for k in ["구조", "아키텍처", "파이프라인", "rag", "엔진"]):
            picked.extend(arch_axes)
        if not picked:
            picked.extend(data_axes[:2] + train_axes[:2] + eval_axes[:2])

        picked.extend(common_axes)
        picked = list(dict.fromkeys(picked))

        # Deterministic rotation to avoid same suffix for every broad query.
        rot = sum(ord(c) for c in q) % max(len(picked), 1)
        rotated = picked[rot:] + picked[:rot]
        final_axes = ", ".join(rotated[:8])
        return f"{base} - {final_axes} 중심으로 단계별 정리"

    def _llm_rewrite_query(self, llm, query: str, project_name: str = "", history: str = "") -> str:
        """Use LLM to decide whether/how to rewrite query for retrieval."""
        q = (query or "").strip()
        if not q:
            return q

        project_hint = (project_name or "").strip()
        if project_hint.lower() == "default_chat":
            project_hint = ""

        prompt = f"""You are a query rewriter for RAG retrieval.
Task:
1) Read the user query and short history.
2) Decide whether rewrite is needed.
3) Return ONE rewritten Korean query optimized for retrieval.

Rules:
- If the original query is already specific, keep it close to original.
- If broad/ambiguous, expand with concrete retrieval axes.
- Do NOT add markdown, numbering, or explanations.
- Keep output within 1 sentence.
- Do NOT prepend project name unless truly necessary.

Project: {project_hint or "(none)"}
History: {(history or "").strip()[:400]}
User Query: {q}

Return rewritten query only.
"""
        try:
            res = llm.invoke([("human", prompt)])
            out = res.content if hasattr(res, "content") else str(res)
            out = (out or "").strip().strip('"').strip("'")
            out = re.sub(r"\s+", " ", out)
            if not out:
                return q
            return out
        except Exception as e:
            logger.warning(f"LLM query rewrite failed, fallback heuristic: {e}")
            return self._expand_generic_query(q, project_hint)

    # =========================================================================
    # [Step 1] 吏덈Ц 遺꾩꽍 + Multi-Query ?앹꽦 (Think)
    # =========================================================================
    def _step_1_think(self, state: AgentState, llm) -> AgentState:
        step_start = time.time()
        state.step_counts["think"] += 1
        logger.info(f"[Step1] Think #{state.step_counts['think']}: {state.query[:80]}")
        state.logs.append(f"[Think #{state.step_counts['think']}] 吏덈Ц 遺꾩꽍 ?쒖옉")

        try:
            reformulated_query = state.query
            if state.history and state.history.strip():
                reformulated_query = self._reformulate_with_context(state.query, state.history)

            base_query = (reformulated_query or state.query).strip()
            rewritten_query = self._llm_rewrite_query(
                llm=llm,
                query=base_query,
                project_name=state.project_name or "",
                history=state.history or "",
            )
            multi_queries: List[str] = [rewritten_query]
            if rewritten_query != base_query:
                multi_queries.append(base_query)
            multi_queries.extend(self._decompose_query(base_query))

            words = [w for w in re.findall(r"[A-Za-z0-9가-힣_]+", base_query) if len(w) >= 2]
            if words:
                keyword_query = " ".join(list(dict.fromkeys(words))[:8])
                if keyword_query and keyword_query != base_query:
                    multi_queries.append(keyword_query)

            strategy_text = state.search_details.get("strategy", "") if state.search_details else ""
            if strategy_text:
                st_tokens = [t for t in re.findall(r"[A-Za-z0-9가-힣_]+", strategy_text.lower()) if len(t) >= 2]
                st_tokens = list(dict.fromkeys(st_tokens))[:6]
                if st_tokens:
                    multi_queries.append(f"{base_query} {' '.join(st_tokens)}")

            multi_queries = list(dict.fromkeys([q.strip() for q in multi_queries if q.strip()]))[:5]
            state.current_query = multi_queries[0] if multi_queries else rewritten_query or base_query
            state.multi_queries = multi_queries

            if "step_details" not in state.__dict__ or not state.step_details:
                state.step_details = {}
            if "think" not in state.step_details:
                state.step_details["think"] = []
            state.step_details["think"].append({
                "attempt": state.step_counts["think"],
                "original_query": state.query,
                "reformulated_query": reformulated_query,
                "rewritten_query": state.current_query,
                "multi_queries": multi_queries,
                "has_history": bool(state.history and state.history.strip()),
                "strategy_used": bool(strategy_text),
            })

            duration = time.time() - step_start
            state.metrics["think_time"] += duration
            state.logs.append(f"Multi-Query generated: {len(multi_queries)}")
            logger.info(f"[Step1] queries={len(multi_queries)}")

        except Exception as e:
            logger.warning(f"[Step1] fallback due to error: {e}")
            state.current_query = state.query
            state.multi_queries = [state.query]
            state.logs.append(f"吏덈Ц 遺꾩꽍 ?ㅽ뙣: {str(e)}")

        return state
    
    # =========================================================================
    # ?쒓? 二쇱꽍 蹂듦뎄
    # =========================================================================
    def _step_2_search(self, state: AgentState) -> AgentState:
        """
        Collect documents via multi-query retrieval.
        Merge by score and remove duplicates.
        """
        step_start = time.time()
        state.step_counts["search"] += 1
        logger.info(f"[Search #{state.step_counts['search']}] multi-query search start")
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        queries = getattr(state, 'multi_queries', [state.current_query])
        if not queries:
            queries = [state.current_query]
        
        logger.info(f"[Search] query_count={len(queries)}")
        state.logs.append(f"[Search #{state.step_counts['search']}] start ({len(queries)} queries)")
        
        try:
            # ?쒓? 二쇱꽍 蹂듦뎄
            all_docs = []
            seen_sources = set()
            seen_source_names = set()
            seen_snippets = set()
            target_project, project_hints = self._detect_target_project(state)
            if target_project:
                logger.info(f"  [Project] target={target_project}, hints={project_hints[:3]}")
            
            for i, query in enumerate(queries[:3]):  # 理쒕? 3媛?荑쇰━
                query_for_search = query
                if project_hints and not any(h in query.lower() for h in project_hints):
                    query_for_search = f"{query} {state.project_name}".strip()
                logger.info(f"   Q{i+1}: {query_for_search[:50]}...")
                docs = self.engine.search(query_for_search, k=5)
                
                for doc in docs:
                    # ?쒓? 二쇱꽍 蹂듦뎄
                    source_key = str(doc.source_path).replace("\\", "/").lower()
                    source_name_key = Path(source_key).name
                    if source_key in seen_sources or source_name_key in seen_source_names:
                        continue
                    snippet_fp = self._snippet_fingerprint(getattr(doc, "page_content", ""))
                    if snippet_fp and snippet_fp in seen_snippets:
                        continue
                    seen_sources.add(source_key)
                    seen_source_names.add(source_name_key)
                    if snippet_fp:
                        seen_snippets.add(snippet_fp)
                    
                    # ?쒓? 二쇱꽍 蹂듦뎄
                    if hasattr(doc, 'metadata'):
                        doc.metadata['found_by_query'] = i + 1
                    all_docs.append(doc)
                
                state.logs.append(f"Q{i+1}: {len(docs)} docs found")
            
            # ?쒓? 二쇱꽍 蹂듦뎄
            all_docs = sorted(all_docs, key=lambda x: x.score, reverse=True)
            state.context = all_docs
            
            # ?쒓? 二쇱꽍 蹂듦뎄
            scores = [doc.score for doc in all_docs if hasattr(doc, 'score')]
            state.scores.extend(scores)
            
            # ?? ?? ??: ?? ?? ?? ??
            state.summary_docs = []
            state.raw_docs = []
            
            main_count = 0
            ref_count = 0
            
            for doc in all_docs:
                # ?쒓? 二쇱꽍 蹂듦뎄
                is_main = doc.metadata.get("is_main", True) if hasattr(doc, 'metadata') else True
                folder = doc.metadata.get("folder", "") if hasattr(doc, 'metadata') else ""
                
                doc_info = {
                    "source": doc.source_path,
                    "score": doc.score,
                    "snippet": doc.page_content[:4000],  # context length cap
                    "is_main": is_main,
                    "folder": folder
                }
                
                if is_main:
                    main_count += 1
                else:
                    ref_count += 1
                
                # ?쒓? 二쇱꽍 蹂듦뎄
                if hasattr(doc, 'layer'):
                    if doc.layer == LayerType.SUMMARY:
                        state.summary_docs.append(doc_info)
                    else:
                        state.raw_docs.append(doc_info)
                else:
                    # ?쒓? 二쇱꽍 蹂듦뎄
                    if "summary" in doc.source_path.lower():
                        state.summary_docs.append(doc_info)
                    else:
                        state.raw_docs.append(doc_info)
            
            # ?쒓? 二쇱꽍 蹂듦뎄
            # ?꾨줈?앺듃 ?쇱튂 臾몄꽌 ?곗꽑 ?ъ슜
            state.raw_docs = self._filter_doc_infos_by_project(state.raw_docs, project_hints)
            state.summary_docs = self._filter_doc_infos_by_project(state.summary_docs, project_hints)
            if not state.search_details:
                state.search_details = {}
            
            state.search_details["query_rewritten"] = state.current_query
            state.search_details["summary_results"] = state.summary_docs
            state.search_details["raw_results"] = state.raw_docs
            
            # ?쒓? 二쇱꽍 蹂듦뎄
            if "search" not in state.step_details:
                state.step_details["search"] = []
            
            state.step_details["search"].append({
                "attempt": state.step_counts["search"],
                "query": state.current_query,
                "results_count": len(all_docs),
                "scores": scores,
                "avg_score": sum(scores) / len(scores) if scores else 0.0,
                "summary_count": len(state.summary_docs),
                "raw_count": len(state.raw_docs),
                "main_count": main_count,
                "ref_count": ref_count,
                "sources": [doc.source_path for doc in all_docs]
            })
            
            duration = time.time() - step_start
            state.metrics["search_time"] += duration
            
            if all_docs:
                avg_score = sum(scores) / len(scores)
                state.logs.append(
                    f"Search done: {len(all_docs)} docs "
                    f"(main: {main_count}, ref: {ref_count}, {duration:.2f}s)"
                )
                logger.info(
                    f"Found {len(all_docs)} docs | "
                    f"main: {main_count}, ref: {ref_count} | "
                    f"avg score: {avg_score:.2f}"
                )
            else:
                state.logs.append("No search results")
                logger.warning("No search results")
            
        except Exception as e:
            logger.error(f"Search step error: {e}")
            state.logs.append(f"Search error: {e}")
        
        return state
    
    # =========================================================================
    # ?쒓? 二쇱꽍 蹂듦뎄
    # =========================================================================
    def _step_3_grade(self, state: AgentState, llm) -> AgentState:
        """
        Evaluate whether retrieved docs match the question intent.
        Trigger rewrite when quality is insufficient.
        """
        step_start = time.time()
        state.step_counts["grade"] += 1
        logger.info(f"[Step3] Grade #{state.step_counts['grade']}: evaluate retrieval")
        
        state.logs.append(f"[Grade #{state.step_counts['grade']}] retrieval validation start")
        
        if not state.context:
            state.retrieval_grade = "FAILED"
            state.logs.append("Validation failed: empty context")
            logger.info("Validation failed: empty context")
            return state
        
        try:
            # ?쒓? 二쇱꽍 蹂듦뎄
            avg_score = sum(state.scores) / len(state.scores) if state.scores else 0.0
            max_score = max(state.scores) if state.scores else 0.0
            min_score = min(state.scores) if state.scores else 0.0
            
            # ?쒓? 二쇱꽍 蹂듦뎄
            if avg_score >= SCORE_THRESHOLD:
                state.retrieval_grade = "PASSED"
                reason = f"High relevance (avg: {avg_score:.3f})"
            elif avg_score >= SCORE_THRESHOLD * ScoreWeights.GRADE_MID_MULTIPLIER:
                state.retrieval_grade = "MARGINAL"
                reason = f"Medium relevance (avg: {avg_score:.3f})"
            else:
                state.retrieval_grade = "FAILED"
                reason = f"Low relevance (avg: {avg_score:.3f}), rewrite needed"
            
            # ?쒓? 二쇱꽍 蹂듦뎄
            if max_score >= SCORE_THRESHOLD * ScoreWeights.GRADE_HIGH_MULTIPLIER:
                state.retrieval_grade = "PASSED"
                reason += " (max-score boost)"
            
            # ?쒓? 二쇱꽍 蹂듦뎄
            if "grade" not in state.step_details:
                state.step_details["grade"] = []
            
            state.step_details["grade"].append({
                "attempt": state.step_counts["grade"],
                "avg_score": avg_score,
                "max_score": max_score,
                "min_score": min_score,
                "grade": state.retrieval_grade,
                "reason": reason,
                "document_count": len(state.context)
            })
            
            duration = time.time() - step_start
            state.metrics["grade_time"] += duration
            
            state.logs.append(f"Validation done: {state.retrieval_grade} ({reason})")
            logger.info(f"Validation done: {state.retrieval_grade}, avg={avg_score:.3f}")
            
        except Exception as e:
            logger.error(f"Grade step error: {e}")
            state.logs.append(f"Grade error: {e}")
        
        return state
    
    # =========================================================================
    # ?쒓? 二쇱꽍 蹂듦뎄
    # =========================================================================
    def _step_4_rewrite(self, state: AgentState, llm) -> AgentState:
        """
        Rewrite query and re-search when validation is weak.
        """
        if state.retrieval_grade == "PASSED":
            logger.info("Rewrite skipped: retrieval passed")
            return state
        
        if state.step_counts["rewrite"] >= MAX_RETRIES:
            logger.warning("Rewrite skipped: max retries reached")
            state.logs.append("Rewrite stopped: max retries reached")
            return state
        
        step_start = time.time()
        state.step_counts["rewrite"] += 1
        state.retry_count += 1
        logger.info(f"[Step4] Rewrite #{state.step_counts['rewrite']}: rewrite query")
        
        state.logs.append(f"[Rewrite #{state.step_counts['rewrite']}] rewriting query")
        
        try:
            rewrite_prompt = f"""You are a query rewrite specialist.

[Current state]
- Original question: {state.query}
- Previous query: {state.current_query}
- Retrieval grade: {state.retrieval_grade}

[Requirements]
1. Keep intent, make expression more specific
2. Add core keywords/synonyms
3. Output one search-friendly sentence

Return only the rewritten query.
"""
            
            messages = [("human", rewrite_prompt)]
            rewritten = ""
            for chunk in llm.stream(messages):
                rewritten += chunk.content if hasattr(chunk, 'content') else str(chunk)
            
            old_query = state.current_query
            state.current_query = rewritten.strip()
            
            # ?쒓? 二쇱꽍 蹂듦뎄
            if "rewrite" not in state.step_details:
                state.step_details["rewrite"] = []
            
            state.step_details["rewrite"].append({
                "attempt": state.step_counts["rewrite"],
                "from": old_query,
                "to": state.current_query
            })
            
            duration = time.time() - step_start
            state.metrics["rewrite_time"] += duration
            
            state.logs.append(f"Rewrite done: {old_query} -> {state.current_query}")
            logger.info(f"rewrite done: {old_query} -> {state.current_query}")
            
            # ?쒓? 二쇱꽍 蹂듦뎄
            return self._step_2_search(state)
            
        except Exception as e:
            logger.error(f"Rewrite step error: {e}")
            state.logs.append(f"Rewrite error: {e}")
            return state
    def _rerank_for_generation(self, query: str, docs: List[dict], top_k: int = 8) -> List[dict]:
        if not docs or len(docs) <= top_k:
            return docs

        query_l = (query or "").lower()
        keywords = [w for w in re.findall(r"[a-z0-9가-힣_]+", query_l) if len(w) >= 2]
        keywords = list(dict.fromkeys(keywords))[:12]

        scored_docs = []
        for doc in docs:
            snippet = (doc.get("snippet", "") or "").lower()
            source = (doc.get("source", "") or "").lower()
            folder = (doc.get("folder", "") or "").lower()

            kw_score = 0.0
            matched = []
            for kw in keywords:
                if kw in source:
                    kw_score += 2.0
                    matched.append(kw)
                elif kw in folder:
                    kw_score += 1.5
                    matched.append(kw)
                elif kw in snippet:
                    kw_score += 0.5
                    matched.append(kw)

            base = float(doc.get("score", 0.0))
            combined = base + min(6.0, kw_score * 0.2)
            doc["keyword_score"] = kw_score
            doc["matched_keywords"] = list(dict.fromkeys(matched))[:8]
            doc["score"] = combined
            scored_docs.append(doc)

        scored_docs.sort(key=lambda x: x.get("score", 0.0), reverse=True)
        result = scored_docs[:top_k]
        top_matches = [f"{d.get('source', '')[:20]}({d.get('keyword_score', 0):.1f})" for d in result[:3]]
        logger.info(f"  [Quick-Rerank] {len(docs)} -> {len(result)} | top={top_matches}")
        return result
    def _contextual_compress(self, query: str, text: str, max_length: int = 2000) -> str:
        if not text:
            return ""
        if len(text) <= max_length:
            return text

        query_l = (query or "").lower()
        keywords = [w for w in re.findall(r"[a-z0-9가-힣_]+", query_l) if len(w) >= 2]

        paragraphs = text.split("\n\n")
        if len(paragraphs) < 3:
            paragraphs = text.split("\n")

        scored = []
        for idx, para in enumerate(paragraphs):
            p = (para or "").strip()
            if len(p) < 20:
                continue
            pl = p.lower()
            score = 0
            for kw in keywords:
                if kw in pl:
                    score += 3
            if "```" in p or "def " in p or "class " in p:
                score += 2
            score += max(0, 3 - idx * 0.2)
            scored.append((score, idx, p))

        if not scored:
            return text[:max_length]

        scored.sort(key=lambda x: x[0], reverse=True)
        selected = []
        total = 0
        for _, idx, p in scored:
            if total + len(p) > max_length:
                continue
            selected.append((idx, p))
            total += len(p)
            if total >= max_length * 0.9:
                break

        selected.sort(key=lambda x: x[0])
        compressed = "\n\n".join(p for _, p in selected).strip()
        return compressed if compressed else text[:max_length]

    def _snippet_fingerprint(self, text: str, head_chars: int = 700) -> str:
        src = (text or "")[:head_chars].lower()
        src = re.sub(r"\[\[[^\]]+\]\]", " ", src)
        src = re.sub(r"[^a-z0-9가-힣]+", " ", src)
        src = re.sub(r"\s+", " ", src).strip()
        return src

    def _clean_answer_format(self, query: str, answer: str) -> str:
        """Post-process answer with formatting-only cleanup."""
        text = (answer or "").strip()
        if not text:
            return text

        # Normalize citation style: "[R1]: ..." -> "[R1] ..."
        text = re.sub(r"\[(R\d+|S\d+|REF\d*)\]\s*:\s*", r"[\1] ", text)

        # Remove repeated empty lines.
        text = re.sub(r"\n{3,}", "\n\n", text).strip()

        # Remove exact duplicated paragraphs (common in model loop output).
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        deduped = []
        seen_paras = set()
        for p in paragraphs:
            norm = re.sub(r"\s+", " ", p).lower()
            if norm in seen_paras:
                continue
            seen_paras.add(norm)
            deduped.append(p)
        if deduped:
            text = "\n\n".join(deduped).strip()

        # Drop empty numbered headings (e.g., "5. ...") that have no body text.
        lines = text.splitlines()
        cleaned_lines = []
        heading_pat = re.compile(r"^\s*\d+\.\s+\S+")
        i = 0
        while i < len(lines):
            line = lines[i]
            if heading_pat.match(line.strip()):
                j = i + 1
                has_body = False
                while j < len(lines):
                    nxt = lines[j].strip()
                    if not nxt:
                        j += 1
                        continue
                    if heading_pat.match(nxt):
                        break
                    has_body = True
                    break
                if not has_body:
                    i += 1
                    continue
            cleaned_lines.append(line)
            i += 1
        text = "\n".join(cleaned_lines).strip()

        return text

    def _step_5_generate(self, state: AgentState, llm) -> Generator:
        """
        Generate final answer and record timing/token metrics.
        Force grounded use of provided context.
        Apply reranking before generation.
        """
        step_start = time.time()
        state.step_counts["gen"] += 1
        logger.info(f"[Generate #{state.step_counts['gen']}] generation start")
        
        state.logs.append(f"[Generate #{state.step_counts['gen']}] generating answer...")

        target_project, project_hints = self._detect_target_project(state)
        if project_hints:
            state.raw_docs = self._filter_doc_infos_by_project(state.raw_docs, project_hints)
            state.summary_docs = self._filter_doc_infos_by_project(state.summary_docs, project_hints)
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        if state.raw_docs and len(state.raw_docs) > 3:
            state.raw_docs = self._rerank_for_generation(state.current_query, state.raw_docs, top_k=8)
            logger.info(f"  [Rerank] Raw docs -> {len(state.raw_docs)}")
        
        if state.summary_docs and len(state.summary_docs) > 2:
            state.summary_docs = self._rerank_for_generation(state.current_query, state.summary_docs, top_k=3)
            logger.info(f"  [Rerank] Summary docs -> {len(state.summary_docs)}")
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        context_sections = []
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        logger.info(f"  [Context] raw_docs: {len(state.raw_docs) if state.raw_docs else 0}")
        logger.info(f"  [Context] summary_docs: {len(state.summary_docs) if state.summary_docs else 0}")
        if state.raw_docs:
            for i, doc in enumerate(state.raw_docs[:3]):
                logger.info(f"    Raw[{i}]: {doc.get('source', 'N/A')[:50]} (score: {doc.get('score', 0):.2f})")
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        if state.raw_docs:
            main_docs = [d for d in state.raw_docs if d.get("is_main", True)]
            ref_docs = [d for d in state.raw_docs if not d.get("is_main", True)]

            main_docs = sorted(main_docs, key=lambda x: x.get("score", 0), reverse=True)
            ref_docs = sorted(ref_docs, key=lambda x: x.get("score", 0), reverse=True)

            if main_docs:
                context_sections.append("### Main Evidence (directly relevant)")
                seen_content_hashes = set()
                added_count = 0

                for i, doc in enumerate(main_docs):
                    if added_count >= 7:
                        break

                    fname = Path(doc["source"]).name if isinstance(doc.get("source"), str) else f"main_{i+1}"
                    score = doc.get("score", 0)
                    folder = doc.get("folder", "")
                    raw_snippet = doc.get("snippet", "(empty)")

                    fname_lower = fname.lower()
                    is_key_document = (
                        score >= 1.5
                        or "team" in fname_lower
                        or "strategy" in fname_lower
                        or "presentation" in fname_lower
                        or "master" in fname_lower
                        or "archive" in fname_lower
                    )

                    if is_key_document:
                        snippet = raw_snippet[:6000]
                        logger.info("Keeping key document with longer snippet")
                    else:
                        snippet = self._contextual_compress(state.query, raw_snippet, max_length=2000)

                    content_hash = hash(self._snippet_fingerprint(snippet, head_chars=500))
                    if content_hash in seen_content_hashes:
                        logger.debug("Skipping duplicate snippet")
                        continue
                    seen_content_hashes.add(content_hash)

                    context_sections.append(f"\n#### [R{added_count+1}] {fname}")
                    context_sections.append(f"> `{folder}` | score: **{score:.2f}**\n")
                    context_sections.append(snippet)
                    added_count += 1

            if ref_docs:
                context_sections.append("\n### Reference Evidence (background)")
                for i, doc in enumerate(ref_docs[:3]):
                    fname = Path(doc["source"]).name if isinstance(doc.get("source"), str) else f"ref_{i+1}"
                    folder = doc.get("folder", "")
                    context_sections.append(f"\n#### [REF{i+1}] {fname}")
                    context_sections.append(f"> `{folder}`\n")
                    raw_snippet = doc.get("snippet", "(empty)")
                    snippet = self._contextual_compress(state.query, raw_snippet, max_length=1500)
                    context_sections.append(snippet)

        if state.summary_docs:
            query_lower = state.query.lower()
            current_query_lower = state.current_query.lower() if state.current_query else query_lower

            project_mapping = {
                'beginner': ['01_beginner', 'beginner_proj'],
                'intermediate': ['02_intermediate', 'intermediate_proj'],
                'second_brain': ['03_second', 'second_brain'],
                'cfd': ['04_cfd', 'cfd_'],
                'llm': ['13_llm', 'llm_genai', 'llm_code'],
                'python': ['01_python', 'python_core'],
                'ml': ['11_machine', 'ml_'],
                'dl': ['12_deep', 'dl_'],
            }

            requested_project = None
            for proj, patterns in project_mapping.items():
                if any(
                    p.replace('_', '') in current_query_lower.replace(' ', '')
                    or p.replace('_', '') in query_lower.replace(' ', '')
                    for p in [proj] + patterns
                ):
                    requested_project = proj
                    break

            logger.info(f"[Summary Bias] requested_project={requested_project}")

            adjusted_summaries = []
            for doc in state.summary_docs:
                source = doc.get('source', '').lower()
                score = doc.get('score', 0)

                if requested_project:
                    allowed_patterns = project_mapping.get(requested_project, [])
                    is_same_project = any(p in source for p in allowed_patterns)

                    if is_same_project:
                        score *= 2.0  # same-project boost
                    else:
                        other_projects = []
                        for proj, patterns in project_mapping.items():
                            if proj != requested_project:
                                other_projects.extend(patterns)

                        if any(p in source for p in other_projects):
                            logger.debug("Skip summary from other project")
                            continue

                adjusted_summaries.append((doc, score))

            sorted_summaries = [doc for doc, _ in sorted(adjusted_summaries, key=lambda x: x[1], reverse=True)]

            context_sections.append("\n### Summary (project structure/concepts)")
            added_summary = 0
            seen_summary_fps = set()

            for i, doc in enumerate(sorted_summaries):
                if added_summary >= 3:
                    break

                fname = Path(doc["source"]).stem if isinstance(doc.get("source"), str) else f"summary_{i+1}"
                score = doc.get("score", 0)
                snippet = doc.get("snippet", "(empty)")

                clean_snippet = re.sub(r"\[\[[^\]]+\]\]", "", snippet)
                clean_snippet = re.sub(r"\n{3,}", "\n\n", clean_snippet).strip()

                if len(clean_snippet) < 100:
                    continue
                summary_fp = self._snippet_fingerprint(clean_snippet, head_chars=500)
                if summary_fp in seen_summary_fps:
                    logger.debug("Skipping near-duplicate summary snippet")
                    continue
                seen_summary_fps.add(summary_fp)

                context_sections.append(f"\n#### [S{added_summary+1}] {fname} (score: {score:.2f})")
                context_sections.append(clean_snippet[:1500])
                added_summary += 1

        context_text = "\n".join(context_sections) if context_sections else "\n(no related docs)"

        logger.info(f"  [Context Build] length={len(context_text)}")
        logger.info(f"  [Context Preview] {context_text[:500]}...")

        if not state.raw_docs and not state.summary_docs:
            answer = (
                "Answer generation stopped due to missing evidence.\n\n"
                "- No Raw/Summary docs were retrieved.\n"
                "- Check Summary DB(chromadb) and Raw index status first."
            )
            state.answer = answer
            state.logs.append("No evidence documents")
            yield {
                "step": "generated",
                "answer": answer,
                "logs": state.logs,
                "state": state.dict(),
                "metrics": state.metrics,
            }
            return

        # Response-quality prompt: Korean-first, grounded, structured output.
        system_prompt = """당신은 근거 기반 기술형 RAG 어시스턴트입니다.

핵심 원칙:
1) 제공된 근거 문서 안에서만 답합니다.
2) 각 섹션의 핵심 문장 끝에 [R#] 또는 [S#] 인용을 붙입니다.
3) 한국어로 답합니다(사용자가 영어를 명시 요청한 경우만 영어 허용).
4) 문장 반복, 문단 복붙, 단순 나열을 금지합니다.

출력 품질 규칙:
- 문단은 짧게 끊고, 불릿/번호 목록으로 정돈합니다.
- 같은 의미를 반복하지 말고, 비교가 필요하면 표 1개로 요약합니다.
- 코드/설정값이 나오면 '무엇/왜/언제'를 한 줄씩 덧붙입니다.
- 애매한 내용은 '가정'으로 분리해 명시합니다.
- 사용자가 코드 예시를 요청하지 않으면 코드블록(```...```)을 작성하지 않습니다.

필수 구조(항상 유지):
## 1) 핵심 요약
- 3~5줄, 문제/목표/결론 중심

## 2) 근거 맵
- 사용한 문서를 불릿으로 정리 (문서명 + 한 줄 근거)

## 3) 상세 분석
- 3~5개 하위 주제로 나눠 설명
- 필요 시 표 1개 포함

## 4) 실행 항목
- 바로 실행 가능한 체크리스트 4~8개
"""
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        history_section = ""
        if state.history and state.history.strip():
            history_section = f"""[Conversation History]
{state.history}

"""
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        user_message = f"""{history_section}=== Reference Context ===
{context_text}

=== User Question ===
{state.query}

=== Output Requirements ===
- Write in Korean.
- Keep the 4-section structure exactly.
- Avoid rough listing; present clean, organized markdown.
- Add citations [R#]/[S#] to key claims in each section.
- If evidence is weak, explicitly mark assumptions."""

        messages = [
            ("system", system_prompt),
            ("human", user_message)
        ]
        
        answer = ""
        token_count = 0
        seen_sentences = set()  # ?? ?? ???
        duplicate_info = {
            "detected": False,
            "original_length": 0,
            "trimmed_length": 0,
            "removed_text": "",
            "reason": ""
        }
        duplicate_hits = 0
        
        try:
            gen_start = time.time()
            last_yield_length = 0  # ??? yield ?? ?? ??
            
            for chunk in llm.stream(messages):
                text = chunk.content if hasattr(chunk, 'content') else str(chunk)
                answer += text
                # ?쒓? 二쇱꽍 蹂듦뎄
                token_count += len(text.split())
                
                # ?쒓? 二쇱꽍 蹂듦뎄
                if len(answer) > 1000:
                    is_dup, reason = check_duplicate(answer, seen_sentences)
                    if is_dup:
                        logger.warning(f"Duplicate pattern detected: {reason}")
                        duplicate_info["detected"] = True
                        duplicate_info["original_length"] = len(answer)
                        duplicate_info["reason"] = reason
                        duplicate_hits += 1

                        # Do not mutate answer mid-stream. Track only and stop only on persistent loop.
                        duplicate_info["trimmed_length"] = len(answer)

                        if duplicate_hits >= 20 and len(answer) >= 2400:
                            logger.warning("Repeated loop persisted. finalize with trimmed output.")
                            answer += "\n\n[Repetition omitted]"
                            break
                        continue
                
                # ?? ?? ??: ?? ?? ?? ??
                yield {
                    "step": "generating",
                    "answer": answer,
                    "logs": state.logs,
                    "metrics": {
                        "tokens": token_count,
                        "tps": token_count / max(time.time() - gen_start, 0.1)
                    }
                }
            
            gen_duration = time.time() - gen_start
            
            # ?쒓? 二쇱꽍 蹂듦뎄
            answer = strip_markdown_fence(answer)
            answer = self._clean_answer_format(state.query, answer)

            # ?쒓? 二쇱꽍 蹂듦뎄
            # Final rewrite is disabled by default.
            # Run only when generation clearly failed (very short/empty output).
            query_text = state.query or ""
            query_has_korean = bool(re.search(r"[가-힣]", query_text))
            english_requested = bool(re.search(r"\b(english|in english|영어로)\b", query_text.lower()))
            answer_korean_chars = len(re.findall(r"[가-힣]", answer or ""))
            answer_latin_chars = len(re.findall(r"[A-Za-z]", answer or ""))
            rewrite_needed = (not answer or len(answer.strip()) < 120)
            if rewrite_needed and query_has_korean and not english_requested and answer_latin_chars > answer_korean_chars:
                try:
                    rewrite_messages = [
                        (
                            "system",
                            "반드시 한국어로만 재작성하세요. 사실/수치/코드/인용태그([R1]/[S1])는 유지하세요.",
                        ),
                        ("human", f"다음 답변을 한국어로 재작성:\n\n{answer}"),
                    ]
                    rewritten = llm.invoke(rewrite_messages)
                    rewritten_text = rewritten.content if hasattr(rewritten, "content") else str(rewritten)
                    rewritten_text = strip_markdown_fence((rewritten_text or "").strip())
                    if rewritten_text:
                        answer = rewritten_text
                        state.logs.append("Applied fallback rewrite pass")
                except Exception as e:
                    logger.warning(f"fallback rewrite pass skipped: {e}")

            # Detail fallback: if answer is too short for "detailed" queries, expand once.
            wants_detail = any(k in query_text for k in ["자세", "상세", "깊게", "자세히", "구체"])
            is_too_short = len((answer or "").strip()) < 900
            if wants_detail and is_too_short and (state.raw_docs or state.summary_docs):
                try:
                    expand_messages = [
                        (
                            "system",
                            "한국어로만 답하라. 기존 답변의 사실관계를 유지하면서 깊이를 늘려라. "
                            "4개 섹션 구조를 유지하고, 각 섹션에 구체 항목을 추가하라. "
                            "핵심 주장에 [R#]/[S#] 인용 태그를 붙여라.",
                        ),
                        (
                            "human",
                            f"질문: {state.query}\n\n현재 답변:\n{answer}\n\n"
                            f"컨텍스트(요약):\n{context_text[:5000]}\n\n"
                            "요구: 정보량을 늘리고, 실행 가능한 포인트를 보강해 다시 작성.",
                        ),
                    ]
                    expanded = llm.invoke(expand_messages)
                    expanded_text = expanded.content if hasattr(expanded, "content") else str(expanded)
                    expanded_text = strip_markdown_fence((expanded_text or "").strip())
                    if expanded_text and len(expanded_text) > len(answer):
                        answer = expanded_text
                        state.logs.append("Applied detail expansion fallback")
                except Exception as e:
                    logger.warning(f"detail expansion fallback skipped: {e}")
            citation_pattern = r'\[R\d+\]|\[S\d+\]|\[REF\d*\]'
            has_citation = bool(re.search(citation_pattern, answer))
            if not has_citation:
                # Keep generated answer; append minimal source anchors instead of replacing content.
                source_tags = []
                seen_source_names = set()
                for idx, doc in enumerate((state.raw_docs or [])[:2], start=1):
                    src = doc.get("source", f"raw_{idx}")
                    src_name = Path(str(src)).name
                    if src_name in seen_source_names:
                        continue
                    seen_source_names.add(src_name)
                    source_tags.append(f"[R{idx}] {src_name}")
                for sidx, doc in enumerate((state.summary_docs or [])[:1], start=1):
                    src = doc.get("source", f"summary_{sidx}")
                    src_name = Path(str(src)).name
                    if src_name in seen_source_names:
                        continue
                    seen_source_names.add(src_name)
                    source_tags.append(f"[S{sidx}] {src_name}")

                if source_tags:
                    answer = answer.rstrip() + "\n\n출처: " + " | ".join(source_tags)
                    state.logs.append("인용 태그가 없어 출처를 자동 추가했습니다")
                else:
                    state.logs.append("인용 태그 누락 및 근거 문서 없음")
             
            # ?쒓? 二쇱꽍 蹂듦뎄
            # ?쒓? 二쇱꽍 蹂듦뎄
            state.answer = answer
            state.metrics["total_tokens"] = token_count
            state.metrics["tokens_per_second"] = token_count / max(gen_duration, 0.1)
            state.metrics["gen_time"] += gen_duration
            
            # ?쒓? 二쇱꽍 蹂듦뎄
            if not state.generation_history:
                state.generation_history = []
            
            state.generation_history.append({
                "attempt": state.step_counts["gen"],
                "duration": gen_duration,
                "tokens": token_count,
                "tps": state.metrics["tokens_per_second"],
                "length": len(answer)
            })
            
            # ?쒓? 二쇱꽍 蹂듦뎄
            if "gen" not in state.step_details:
                state.step_details["gen"] = []
            
            state.step_details["gen"].append({
                "attempt": state.step_counts["gen"],
                "tokens": token_count,
                "duration": gen_duration,
                "tps": state.metrics["tokens_per_second"],
                "answer_length": len(answer),
                "duplicate_info": duplicate_info  # ?? ?? ??
            })
            
            logger.info(
                f"Generation complete | "
                f"{token_count} tokens | "
                f"{state.metrics['tokens_per_second']:.2f} tok/s | "
                f"{gen_duration:.2f}s"
            )
            
            state.logs.append(
                f"Generation complete ({token_count} tokens, {state.metrics['tokens_per_second']:.2f} tok/s)"
            )
            
            # ?쒓? 二쇱꽍 蹂듦뎄
            include_related = bool((state.search_details or {}).get("include_related", False))
            if include_related:
                related_section = self._generate_related_resources(state)
                if related_section:
                    answer = answer + "\n\n" + related_section
                    state.answer = answer
                    state.logs.append("Added related-resources section")
            
            # ?쒓? 二쇱꽍 蹂듦뎄
            state.metrics["total_time"] = time.time() - self.total_start_time
            
            # ?쒓? 二쇱꽍 蹂듦뎄
            yield {
                "step": "generated",
                "answer": answer,
                "logs": state.logs,
                "state": state.dict(),
                "metrics": state.metrics
            }
            
        except Exception as e:
            logger.error(f"Generation step error: {e}")
            yield {
                "step": "error",
                "answer": f"Error: {str(e)}",
                "logs": state.logs + [f"Error: {e}"],
                "state": state.dict()
            }
    
    # =========================================================================
    # ?쒓? 二쇱꽍 蹂듦뎄
    # =========================================================================
    def _step_6_review(self, state: AgentState, llm) -> Generator:
        """
        Answer review with Self-RAG checks
        1. relevance to question
        2. grounding/citation presence
        3. hallucination risk
        """
        step_start = time.time()
        state.step_counts["review"] += 1
        logger.info(f"[Review #{state.step_counts['review']}] self-rag verification")
        
        answer = state.answer
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        verification = self._self_rag_verify(state, answer)
        
        review_result = {
            "attempt": state.step_counts["review"],
            "answer_length": len(answer),
            "has_source": "[S" in answer or "[R" in answer,
            "verification": verification,
            "action": "pass"
        }
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        if verification["is_relevant"]:
            state.logs.append(f"Self-RAG: relevant answer (score: {verification['relevance_score']:.2f})")
        else:
            state.logs.append(f"Self-RAG: low relevance (score: {verification['relevance_score']:.2f})")
        
        if verification["has_grounding"]:
            state.logs.append(f"Self-RAG: grounded with citations")
        else:
            state.logs.append("WARN Self-RAG: missing citations")
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        if "review" not in state.step_details:
            state.step_details["review"] = []
        state.step_details["review"].append(review_result)
        
        state.logs.append(f"Review complete ({len(answer)} chars)")
        logger.info(f"review complete: len={len(answer)}, score={verification['relevance_score']:.2f}")
        
        state.metrics["total_time"] = time.time() - self.total_start_time
        state.metrics["self_rag_score"] = verification["relevance_score"]
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        yield {
            "step": "completed",
            "answer": answer,
            "logs": state.logs,
            "state": state.dict(),
            "metrics": state.metrics
        }
    
    def _self_rag_verify(self, state: AgentState, answer: str) -> dict:
        """
        Self-RAG scoring for the generated answer
        
        1. Relevance
        2. Grounding
        3. Completeness
        """
        import re
        
        query = state.query.lower()
        answer_lower = answer.lower()
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        query_words = set(re.findall(r'\w+', query))
        answer_words = set(re.findall(r'\w+', answer_lower))
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        stopwords = {
            "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?",
            "??", "??", "??", "??", "the", "a", "an", "is", "are",
        }
        query_words -= stopwords
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        if query_words:
            overlap = len(query_words & answer_words) / len(query_words)
        else:
            overlap = 0
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        source_pattern = r'\[S\d+\]|\[R\d+\]|\[REF\d*\]'
        sources = re.findall(source_pattern, answer)
        has_grounding = len(sources) > 0
        grounding_score = min(1.0, len(sources) * 0.2)  # 0.2 each, max 1.0
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        completeness = min(1.0, len(answer) / 500)  # 500 chars => 1.0
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        structure_score = 0
        if '#' in answer:
            structure_score += 0.3
        if '-' in answer or '1.' in answer:
            structure_score += 0.3
        if '```' in answer:
            structure_score += 0.2
        if '**' in answer:
            structure_score += 0.2
        structure_score = min(1.0, structure_score)
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        relevance_score = (
            overlap * 0.4 +           # keyword overlap 40%
            grounding_score * 0.3 +   # grounding 30%
            completeness * 0.2 +      # completeness 20%
            structure_score * 0.1     # structure 10%
        )
        
        return {
            "is_relevant": relevance_score > 0.3,
            "relevance_score": relevance_score,
            "has_grounding": has_grounding,
            "grounding_count": len(sources),
            "completeness": completeness,
            "structure_score": structure_score
        }
    
    # =========================================================================
    # ?쒓? 二쇱꽍 蹂듦뎄
    # =========================================================================
    def run(self, query: str, project_name: str, llm, strategy: str = "", history: str = "") -> Generator:
        """
        Main flow: Think -> Search -> Grade -> (Rewrite) -> Generate
        """
        self.total_start_time = time.time()
        
        state = AgentState(
            query=query,
            current_query=query,
            project_name=project_name,
            history=history,  # prior conversation history
            step_details={},
            search_details={"query_original": query, "strategy": strategy},
            generation_history=[]
        )
        
        logger.info(f"\n{'='*80}")
        logger.info(f"Question: {query}")
        logger.info(f"{'='*80}\n")
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        state.logs.append(f"Question: {query}")
        state.logs.append(f"Project: {project_name or 'Default_Chat'}")
        
        yield {"step": "init", "state": state.dict()}
        
        # ?? ?? ??: ?? ?? ?? ??
        state = self._step_1_think(state, llm)
        yield {"step": "think", "state": state.dict(), "logs": state.logs}
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        state = self._step_2_search(state)
        yield {"step": "search", "state": state.dict(), "logs": state.logs}
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        state = self._step_3_grade(state, llm)
        yield {"step": "grade", "state": state.dict(), "logs": state.logs}
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        state = self._step_4_rewrite(state, llm)
        yield {"step": "rewrite", "state": state.dict(), "logs": state.logs}
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        for chunk in self._step_5_generate(state, llm):
            # ?쒓? 二쇱꽍 蹂듦뎄
            if chunk.get("step") == "generated":
                state.answer = chunk.get("answer", "")
            yield chunk
        
        # ?쒓? 二쇱꽍 蹂듦뎄
        for chunk in self._step_6_review(state, llm):
            yield chunk
        
        logger.info(f"\n{'='*80}")
        logger.info(f"Run complete")
        logger.info(f"Final answer length: {len(state.answer) if state.answer else 0}")
        logger.info(f"Total elapsed: {state.metrics.get('total_time', 0):.2f}s")
        logger.info(f"   retries: {state.retry_count}")
        logger.info(f"{'='*80}\n")











