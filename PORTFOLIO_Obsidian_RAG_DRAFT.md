# Obsidian_RAG 포트폴리오 초안

## 1. 프로젝트 한 줄 정의
Obsidian 지식 저장소의 검색 누락과 근거 부족을 줄인 로컬 RAG 시스템.

## 2. 배경 및 문제 정의

## 배경
지식 소스는 Obsidian vault 기반으로 운영된다.
수집 작업은 `jobs.yaml` 기준 11개 Job 단위로 관리된다.
벡터 저장소는 현재 `raw` 컬렉션 8개와 `chroma.sqlite3` 파일 10개로 구성되어 있다.
질문은 프로젝트 맥락, 키워드, 문서 링크를 함께 요구한다.

## 문제
단일 벡터 검색은 키워드 중심 질의에서 무관 문서가 섞였다.
단일 키워드 검색은 의미 유사 질의에서 핵심 문서를 놓쳤다.
검색 품질이 낮아도 생성이 진행되어 근거가 약한 답변이 길어졌다.

| 문제 | 구체적 상황 |
|------|------------|
| 프로젝트 문맥 혼입 | 질의에 프로젝트 힌트가 약하면 타 프로젝트 문서가 상위에 섞였다 |
| 근거 추적 약화 | 인용 태그가 없으면 답변 근거를 역추적하기 어렵다 |
| 생성 안정성 저하 | 반복 문장이 누적되면 스트리밍 응답 길이가 과도하게 늘어났다 |

## 3. 기술적 접근

### 3-1. 다중 질의 검색으로 누락 축소

**문제:**
짧은 질의는 의도가 충분히 드러나지 않는다.

**접근:**
질의 재작성과 질의 분해를 적용했다.
상위 3개 질의만 검색했다.

**선택 이유:**
재작성 질의와 원문 질의를 함께 유지하면 누락 가능성을 낮출 수 있다.
질의 수 상한을 두면 지연을 통제할 수 있다.

**구현:**
아래 로직은 질의 수를 최대 3개로 제한한다.
각 질의에서 `k=5`개 문서를 수집한다.

```python
queries = getattr(state, 'multi_queries', [state.current_query])
for i, query in enumerate(queries[:3]):
    docs = self.engine.search(query_for_search, k=5)
    for doc in docs:
        source_key = str(doc.source_path).replace("\\", "/").lower()
        if source_key in seen_sources:
            continue
        all_docs.append(doc)
```

**결과:**
질의당 최대 5개, 전체 최대 15개 후보를 확보하는 구조를 만들었다.
중복 소스를 제거해 컨텍스트 중복을 줄였다.

### 3-2. 벡터+BM25 혼합 검색과 RRF 결합

**문제:**
단일 검색기로는 질의 유형 편차를 흡수하기 어렵다.

**접근:**
임베딩 검색과 BM25 검색을 병렬 수행했다.
결과를 RRF로 통합했다.

**선택 이유:**
의미 질의는 임베딩 검색이 유리하다.
파일명/프로젝트 키워드는 BM25가 유리하다.

**구현:**
아래 로직은 각 검색에서 `max(k*5, 20)` 후보를 가져온다.
RRF `k=60`으로 결합한다.
파일명 매칭에 `+0.3`, 본문 매칭에 `+0.1` 가중치를 준다.

```python
emb = self.summary_db.query(
    query_embeddings=[q_emb],
    n_results=max(k * 5, 20),
)
bm25_top = self.bm25.get_top_k(bm25_query, k=max(k * 5, 20))
fused_results = self._reciprocal_rank_fusion(embedding_results, bm25_results, k=60)
for kw in query_keywords:
    if kw in filename_lower:
        keyword_boost += 0.3
    elif kw in doc_lower:
        keyword_boost += 0.1
```

**결과:**
후보 풀 최소값을 20으로 고정해 검색 편차를 줄였다.
의미 일치와 어휘 일치를 같이 반영하는 점수 체계를 만들었다.

### 3-3. 품질 게이트와 재작성 제한

**문제:**
저품질 검색 결과가 생성 단계로 그대로 전달될 수 있다.

**접근:**
검색 점수로 품질 등급을 나눴다.
`FAILED`일 때만 재작성했다.

**선택 이유:**
불필요한 재시도는 지연을 늘린다.
무제한 재시도는 루프 위험이 있다.

**구현:**
기준 점수는 `SCORE_THRESHOLD=0.6`이다.
재작성은 `MAX_RETRIES=2`로 제한했다.

```python
if avg_score >= SCORE_THRESHOLD:
    state.retrieval_grade = "PASSED"
elif avg_score >= SCORE_THRESHOLD * ScoreWeights.GRADE_MID_MULTIPLIER:
    state.retrieval_grade = "MARGINAL"
else:
    state.retrieval_grade = "FAILED"

if state.step_counts["rewrite"] >= MAX_RETRIES:
    state.logs.append("Rewrite stopped: max retries reached")
```

**결과:**
저품질 검색의 직행 생성을 억제했다.
재작성 루프 상한을 고정해 응답 지연 상한을 만들었다.

### 3-4. 생성 안정화와 Self-RAG 검증

**문제:**
스트리밍 생성에서 반복 루프가 길어질 수 있다.

**접근:**
반복 감지 로직을 넣었다.
응답 후 자기검증 점수를 계산했다.

**선택 이유:**
완전 중단보다 최소 결과를 보존하는 방식이 운영에 유리하다.

**구현:**
중복 검사는 답변 길이 1000자 이후 시작한다.
중복이 20회 이상이고 길이가 2400자 이상이면 반복 구간을 절단한다.
Self-RAG 점수는 overlap 0.4, grounding 0.3, completeness 0.2, structure 0.1 가중치를 사용한다.

```python
if len(answer) > 1000:
    is_dup, reason = check_duplicate(answer, seen_sentences)
    if is_dup and duplicate_hits >= 20 and len(answer) >= 2400:
        answer += "\n\n[Repetition omitted]"
        break

relevance_score = (
    overlap * 0.4 + grounding_score * 0.3 +
    completeness * 0.2 + structure_score * 0.1
)
```

**결과:**
반복 루프 중단 경계를 명시했다.
사후 품질 점수를 로그 지표로 남길 수 있게 했다.

## 4. 시스템 구조

```text
[입력: query, project_name, history]
  → 단계 1: 질의 분석/재작성/다중질의 생성 (LLM + 규칙 분해)
  → 단계 2: 요약 임베딩 검색 + BM25 검색 + RRF 결합 (ChromaDB, BM25)
  → 단계 3: 링크 기반 원문 확장 검색 (wikilink, raw 컬렉션)
  → 단계 4: 검색 품질 등급화 및 재작성 (threshold=0.6, retry<=2)
  → 단계 5: 스트리밍 답변 생성 및 반복 제어
  → 단계 6: Self-RAG 검증 및 최종 응답
[출력: NDJSON 스트림 + 로그 + 메트릭]
```

| 단계 | 기술 | 역할 |
|------|------|------|
| API | FastAPI, StreamingResponse | `/api/chat/stream` NDJSON 스트리밍 |
| 모델 | ChatOllama, ChatOpenAI | 로컬/원격 LLM 분기 실행 |
| 임베딩 | BAAI/bge-m3 | 의미 기반 검색 |
| 검색 | ChromaDB, SimpleBM25 | 벡터+키워드 검색 |
| 결합 | RRF | 랭킹 결합 |
| 인제스트 | LangChain TextSplitter, Chroma | 원문/요약 청킹, 적재 |
| UI | Streamlit, httpx | 채팅/생성/인제스트/태깅 콘솔 |

## 5. 결과 및 성능

### 정성적 개선

| 항목 | 개선 전 (단일 검색 가정) | 개선 후 (현재 구조) |
|------|-------------------------|---------------------|
| 키워드 질의 안정성 | 프로젝트 키워드 질의에서 무관 문서 혼입 가능 | BM25 + 파일명 가중치로 프로젝트 문서 우선화 |
| 의미 질의 회수율 | 키워드 의존 시 의미 유사 문서 누락 가능 | 임베딩 검색 병행으로 의미 유사 문서 회수 |
| 저품질 검색 대응 | 검색 실패 후에도 생성 진행 가능 | 품질 등급 게이트로 재작성 후 재검색 |
| 장문 반복 대응 | 반복 누적 시 응답 길이 과도 증가 가능 | 중복 감지와 임계치 절단으로 루프 제어 |

### 운영 지표 현황

| 지표 | 상태 |
|------|------|
| 평균 응답 시간 | 미측정 |
| 평균 tokens/second | 미측정 |
| 평균 Self-RAG 점수 | 미측정 |
| 로그 수집 필드 | `tokens_per_second`, `self_rag_score` 구현 완료 |

### 정량 평가 계획
오프라인 평가셋 50문항을 구성한다.
검색 평가는 Recall@5와 MRR를 사용한다.
생성 평가는 groundedness와 citation coverage를 사용한다.
릴리스 게이트 기준은 Recall@5 0.7 이상, groundedness 0.8 이상으로 설정한다.

## 6. 주요 설계 판단

| 문제 상황 | 선택지 | 선택 | 이유 |
|-----------|--------|------|------|
| 검색 편향 | 벡터 단독 / BM25 단독 / 혼합 | 혼합 + RRF | 질의 유형 편차를 줄이기 위해 결합했다 |
| 요약/원문 저장 | 전부 통합 / 전부 분리 / 요약 통합+원문 분리 | 요약 통합 + 원문 분리 | 전역 요약 회수와 프로젝트 원문 근거를 동시에 확보했다 |
| 저품질 검색 처리 | 즉시 생성 / 재검색 후 생성 | 재검색 후 생성 | 실패 검색의 직행 생성을 막았다 |
| 반복 출력 처리 | 그대로 출력 / 즉시 중단 / 임계치 절단 | 임계치 절단 | 출력 유실을 줄이면서 루프를 멈췄다 |
| 모델 운영 | 단일 모델 / 로컬-원격 분기 | 로컬-원격 분기 | 비용/지연/키 환경에 맞춰 실행 경로를 분리했다 |

## 7. 한계 및 개선 방향

- 품질 API 미연동: 프런트는 `/api/quality/*`를 호출하지만 백엔드 라우트가 확인되지 않았다. → 품질 저장소와 API 라우터를 백엔드에 추가한다.
- 테스트 공백: `backend/tests/test_api.py`가 실질 검증을 수행하지 않는다. → 스트리밍 포맷, 등급 판정, 재작성 상한 통합 테스트를 추가한다.
- 인코딩 불안정: 일부 파일의 주석이 깨져 있다. → UTF-8 통일, CI 인코딩 체크, 깨진 파일 일괄 정비를 적용한다.
- 파라미터 외부화 부족: 임계값이 상수에 고정되어 있다. → 환경변수와 실험 설정 파일로 분리한다.

## 8. 회고

### 가장 어려웠던 기술적 판단
요약 검색과 원문 검색을 어떤 순서로 결합할지가 가장 어려웠다.
요약만 쓰면 속도는 안정적이지만 근거 위치 연결이 약해졌다.
원문만 쓰면 근거는 강해지지만 노이즈가 증가했다.
결국 요약으로 후보를 줄이고 원문으로 근거를 보강하는 흐름을 선택했다.
이 선택으로 검색 정확성과 근거 밀도 사이의 균형점을 만들었다.

### 처음 가정과 달랐던 부분
초기에는 벡터 검색 단독으로 충분하다고 가정했다.
실제 질의 유형을 분리해 보면 키워드 질의에서 불안정성이 드러났다.
BM25를 추가하고 RRF로 결합한 뒤 키워드 질의와 의미 질의의 편차가 줄었다.
검색 품질 게이트를 넣은 이후 재작성 흐름이 명확해졌다.
결과적으로 단일 검색기 가정은 운영 조건에서 성립하지 않았다.

### 다시 만든다면
평가 체계를 먼저 만들겠다.
현재 구조는 기능 구현이 평가 설계보다 앞섰다.
그래서 개선 전후 비교를 실측치로 즉시 제시하기 어려웠다.
다음 버전은 평가셋, 지표 수집, 대시보드 API를 먼저 고정하겠다.
그 위에서 검색 전략 실험을 진행하면 판단 속도가 빨라진다.

## 코드 근거
- `backend/main.py`: 스트리밍 엔드포인트, 세션 중단, 엔진 상태
- `backend/src/graph/agentic_flow.py`: 다중질의 검색, 품질 등급, 재작성, 생성, Self-RAG
- `backend/src/rag/engine.py`: 임베딩+BM25 검색, RRF 결합, 링크 기반 raw 확장
- `backend/src/pipeline/ingestor.py`: summary 통합 컬렉션, raw 분리 컬렉션, 배치 적재
- `backend/src/constants.py`: 임계값/재시도 상수
- `backend/src/main/model_factory.py`: 로컬/원격 모델 분기

