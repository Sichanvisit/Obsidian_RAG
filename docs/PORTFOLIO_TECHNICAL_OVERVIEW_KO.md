# Obsidian_RAG 포트폴리오 기술 개요

> 이 문서는 Obsidian_RAG를 사용자 매뉴얼이 아니라, 문제 정의와 시스템 설계 역량을 설명하는 기술 포트폴리오 관점에서 정리한 문서입니다.

## 1. 왜 이 프로젝트를 만들었는가

이 프로젝트는 "Obsidian 문서를 잘 찾는 챗봇"을 만드는 데서 출발하지 않았습니다.  
출발점은, 개인 기록이 쌓여도 자동으로 살아 있는 지식 구조가 되지 않는다는 문제였습니다.

제가 풀고 싶었던 문제는 다음과 같았습니다.

- 기록은 계속 쌓이지만, 구조는 여전히 사람이 직접 만들어야 한다.
- 일반적인 RAG는 문서를 많이 넣어도 관계 구조를 이해하지 못하면 답변 품질이 쉽게 평면화된다.
- 검색이 되더라도, 그 결과가 실제 다음 행동으로 이어지지 않으면 개인 지식 시스템으로서의 가치가 제한적이다.

그래서 이 프로젝트의 중심은 `답변 생성` 자체보다 아래에 있습니다.

- 기록을 구조화하는 것
- 문서 간 관계를 만드는 것
- 그 관계를 검색, 추천, 행동, 그래프 UI로 재사용하는 것

한 줄로 정리하면:

> 문서 저장소를 답변기 위에 올리는 것이 아니라, 기록을 구조화하고 연결해 재사용 가능한 로컬 지식 워크스페이스로 만드는 프로젝트입니다.

## 2. 어떤 문제를 어떤 구조로 풀었는가

전체 구조는 다음 흐름으로 설계했습니다.

```text
Raw Note
  -> Generator / Tagger
  -> Structured Metadata + Typed Relations
  -> Relation Graph Runtime
  -> Retrieval / Recommendation / Action / Graph UI
  -> Obsidian Plugin + Streamlit Ops
```

핵심 전제는 두 가지입니다.

- 사용자는 기록한다.
- 시스템은 그 기록을 구조화하고 연결한다.

즉 이 프로젝트는 단순한 질의응답 시스템이 아니라, `기록 -> 구조 -> 연결 -> 탐색 -> 행동` 흐름을 가진 개인 지식 시스템을 목표로 합니다.

## 3. 적용한 기술적 기반과 아이디어

### 3.1 문서 taxonomy 설계

문서를 단순 텍스트 청크로 취급하면, 비슷한 내용은 찾을 수 있어도 "이 문서가 지금 어떤 역할을 하는가"는 이해하기 어렵습니다.  
그래서 이 프로젝트는 문서를 두 축으로 해석합니다.

- `note_type_auto`: 문서의 형식과 성격
- `doc_role_auto`: 사고 흐름 안에서의 역할

예:

- `project-note + overview`
- `code-note + implementation`
- `review-note + review`
- `action-note + next_action`

이 설계를 적용한 이유는 retrieval과 recommendation이 단순 유사도 검색이 아니라,
`overview -> architecture -> implementation -> review -> next_action`
같은 흐름을 이해하게 만들기 위해서입니다.

### 3.2 Explainable typed relation

관련 문서를 그냥 "비슷한 노트"로 두지 않고, 의미 기반 relation으로 승격했습니다.

대표 relation:

- `implements`
- `review_of`
- `next_action_for`
- `decision_for`
- `follow_up`
- `same_topic`

중요한 점은 relation을 임베딩 유사도 하나로 만들지 않았다는 것입니다.  
relation 생성에는 아래 신호를 함께 사용했습니다.

- wikilink / related files / backlink
- same project / same root domain
- shared semantic tags / section keys / signal tokens
- `note_type_auto`, `doc_role_auto`

즉 이 프로젝트는 "유사한 문서 검색"보다 "설명 가능한 관계 생성"을 우선한 구조입니다.

### 3.3 Relation Graph Runtime

Phase 2에서 핵심으로 만든 것은 relation metadata를 실제 런타임 관계망으로 승격하는 레이어였습니다.

여기서 구현한 핵심 아이디어는 다음과 같습니다.

- outbound / inbound adjacency 구성
- direct edge를 넘는 2-hop relation chain traversal
- path scoring
- relation path explanation

이 레이어를 분리한 이유는 relation을 retrieval 보정용 부가 기능으로 두지 않고,
아래 기능의 공통 기반으로 재사용하기 위해서였습니다.

- retrieval source expansion
- follow-up recommendation
- action generation
- graph-like UI explanation

즉 relation graph는 장식용 그래프가 아니라, 여러 기능이 함께 믿고 사용하는 runtime infrastructure입니다.

### 3.4 Recommendation Layer

추천 레이어는 관련 문서를 나열하는 기능이 아니라, `왜 이걸 이어봐야 하는가`와 `지금 무엇을 하면 되는가`까지 포함하는 얇은 의미 레이어입니다.

각 추천 항목은 아래와 같은 정보를 가집니다.

- `recommendation_kind`
- `priority_band`
- `action_prompt`
- `action_title`
- `relation_path_text`
- `hop_count`

즉 recommendation은 검색 결과의 후처리가 아니라, action layer의 입력으로 재사용되는 구조화 payload입니다.

### 3.5 Action Engine

Action Engine v1의 목적은 추천을 읽기 좋은 목록이 아니라 실제 행동 단위로 바꾸는 것이었습니다.

대표 action:

- `resume_next_step`
- `continue_implementation`
- `request_review`
- `request_result`
- `request_evidence`

여기서 사용한 아이디어는 두 가지입니다.

- 현재 노트 역할과 질문 의도를 함께 반영해 action을 정렬할 것
- relation이 약할 때는 gap-detection rule로 보강할 것

즉 시스템은 단순히 "관련 문서"를 보여주는 대신,
"지금 이어서 무엇을 열고, 무엇을 물어보고, 어떤 작업을 계속해야 하는가"까지 제안합니다.

### 3.6 Graph Layer UI

Graph Layer v1은 full graph product가 아니라 lightweight relation graph panel입니다.

이 UI는 다음 철학을 가집니다.

- 예쁜 그래프를 그리는 것이 목적이 아니다.
- 현재 질문에서 실제로 사용된 relation path를 읽게 하는 것이 목적이다.
- chain explanation과 탐색 가능성이 중요하다.

즉 graph는 시각 장식이 아니라, retrieval / recommendation / action이 사용한 구조를 사용자에게 다시 설명하는 인터페이스입니다.

## 4. 어떤 지식을 활용했는가

이 프로젝트에는 여러 영역의 지식을 함께 사용했습니다.

### Retrieval Engineering

- dense retrieval
- BM25
- RRF
- relation-aware source expansion
- rerank와 retrieval reason 추적

### Knowledge Modeling

- note taxonomy 설계
- visible metadata schema 설계
- typed relation taxonomy 설계
- flow-oriented document interpretation

### Runtime Graph / System Design

- adjacency / traversal / path scoring
- shared payload contract
- streaming API와 plugin client 간 인터페이스 설계

### Product / UX

- Obsidian 안에서 질문과 실행 흐름이 끊기지 않도록 plugin 중심 구조 채택
- Streamlit은 메인 UI가 아니라 운영 콘솔과 fallback UI로 재정의
- recommendation / action / graph panel이 같은 relation payload를 공유하도록 설계

### Verification

- acceptance criteria 문서화
- probe 기반 실제 corpus 검증
- regression test와 build 검증

즉 이 프로젝트는 "모델을 붙였다"보다,  
`검색`, `지식 구조화`, `그래프 런타임`, `UI`, `검증`을 함께 설계하고 연결한 시스템 프로젝트에 가깝습니다.

## 5. 현재까지 만든 것과 현재 상태

현재 코드 기준으로는 다음 상태까지 올라와 있습니다.

- V1: Streamlit 중심 로컬 RAG 챗봇 구현
- V2: Obsidian Plugin 중심 지식 워크스페이스로 확장
- relation-aware retrieval 도입
- Recommendation v1 수용 완료
- Action Engine v1 수용 완료
- Graph Layer v1 precursor 구현
- Phase 2 관계망 엔진 종료 가능 판정, 다음 단계는 Retrieval v2

즉 지금 단계는 "챗봇 데모"를 넘어서,
노트 구조화, relation runtime, recommendation/action/graph UI가 하나의 제품형 흐름으로 연결된 상태입니다.

## 6. 이 프로젝트가 보여주는 역량

이 프로젝트를 통해 보여주고자 하는 역량은 다음과 같습니다.

- 문제 정의를 제품 구조로 번역하는 능력
- retrieval과 metadata schema를 함께 설계하는 능력
- graph runtime을 기능 레이어의 공통 인프라로 설계하는 능력
- backend API, plugin client, ops console을 end-to-end로 구현하는 능력
- 문서화와 acceptance 기준까지 포함해 중대형 개인 프로젝트를 밀고 가는 능력

## 7. 대표 기술 스택

- Backend: Python, FastAPI, Pydantic
- Retrieval / LLM: LangChain, ChromaDB, sentence-transformers, BM25, RRF, Ollama / OpenAI
- Client: TypeScript, Obsidian Plugin API, Streamlit
- Workflow: NDJSON streaming, Generator / Tagger / Ingest APIs
- Quality / Validation: pytest, probe scripts, acceptance docs
