# Obsidian_RAG

> Obsidian 문서를 검색 가능한 지식 자산으로 구조화하고, 로컬 RAG 채팅과 노트 워크플로우를 하나의 시스템으로 통합한 개인 프로젝트입니다.

이 저장소는 단순한 챗봇 예제가 아니라, 개인 지식 저장소를 실제 작업 가능한 로컬 워크스페이스로 확장한 과정을 담고 있습니다.  
기획, 구조 설계, 백엔드, Streamlit 운영 UI, Obsidian Plugin, 테스트, 문서화까지 직접 구현했습니다.

## 왜 이 프로젝트를 만들었는가

- 흩어진 Obsidian 문서를 근거 기반으로 검색하고 답변에 연결할 수 있어야 했습니다.
- 질의응답만이 아니라 구조화 노트 생성, 태깅, 인덱싱까지 하나의 흐름으로 묶고자 했습니다.
- 로컬 환경에서도 검색 품질과 작업 맥락을 유지할 수 있는 지식 워크스페이스를 목표로 했습니다.

이 프로젝트의 초점은 "좋은 답변기"를 만드는 데만 있지 않습니다.  
핵심은 기록을 구조화하고, 문서 간 관계를 만들고, 그 관계를 다시 검색·추천·행동 흐름으로 연결하는 지식 운영 구조를 만드는 데 있습니다.

## 직접 구현한 범위

- FastAPI 기반 RAG / workflow 백엔드
- Streamlit 운영 콘솔과 초기 메인 UI
- Obsidian Plugin 기반 메인 클라이언트
- note taxonomy, typed relation, relation graph runtime
- recommendation / action / graph-like UI 레이어
- 테스트, probe 스크립트, acceptance 문서화

## 어떤 기술적 아이디어를 적용했는가

### 1. 문서를 단순 텍스트가 아니라 역할을 가진 노트로 해석

노트의 형식과 사고 흐름상 역할을 분리해 `note_type_auto`와 `doc_role_auto`를 설계했습니다.  
이를 통해 "비슷한 문서"를 찾는 데서 멈추지 않고, `overview -> architecture -> implementation -> review -> next_action` 같은 흐름을 시스템이 이해하도록 했습니다.

### 2. 유사도만이 아니라 설명 가능한 relation schema 사용

`typed_relations_auto`를 도입해 `implements`, `review_of`, `next_action_for`, `follow_up` 같은 의미 기반 관계를 생성했습니다.  
relation은 임베딩 유사도만으로 만들지 않고, wikilink, related file, project, semantic tag, section key, note role을 함께 사용하도록 설계했습니다.

### 3. relation chain을 retrieval / recommendation / action의 공통 런타임으로 승격

Phase 2에서 relation graph runtime을 분리하고, direct edge를 넘어 2-hop chain까지 다루도록 확장했습니다.  
이 체인은 source expansion, follow-up recommendation, suggested action, graph-like panel에서 공통으로 재사용됩니다.

### 4. 검색 결과를 바로 행동으로 이어지는 workflow로 연결

추천은 단순 관련 문서 목록이 아니라 `recommendation_kind`, `priority_band`, `action_prompt`를 가진 payload로 설계했습니다.  
여기서 한 단계 더 나아가 Action Engine이 `resume_next_step`, `request_review`, `request_result` 같은 후속 행동 단위로 변환합니다.

## 핵심 기술 스택

- Backend: Python, FastAPI, Pydantic
- Retrieval / LLM: LangChain, ChromaDB, sentence-transformers, BM25, RRF, Ollama / OpenAI
- Client: Streamlit, Obsidian Plugin (TypeScript, esbuild)
- Workflow: NDJSON streaming, Generator / Tagger / Ingest APIs, relation-aware retrieval

## 포트폴리오용 상세 기술 개요

프로젝트를 `왜 만들었는지`, `어떤 지식을 적용했는지`, `어떤 구조 아이디어를 실제 기능으로 구현했는지`를 정리한 문서는 아래에 따로 정리했습니다.

- [docs/PORTFOLIO_TECHNICAL_OVERVIEW_KO.md](docs/PORTFOLIO_TECHNICAL_OVERVIEW_KO.md)

## 버전별 문서

### V1

[README_v1.md](README_v1.md)

Streamlit을 메인 화면으로 사용한 로컬 RAG 챗봇 단계입니다.  
핵심은 하이브리드 검색, 스트리밍 응답, 인덱싱/태깅 작업을 하나의 운영 UI로 묶는 것이었습니다.

### V2

[README_v2.md](README_v2.md)

Obsidian Plugin을 메인 클라이언트로 확장한 로컬 지식 워크스페이스 단계입니다.  
핵심은 현재 노트 문맥 활용, relation-aware retrieval, Generator/Tagger/Ingest 워크플로우의 API화, recommendation/action/graph layer의 연결입니다.

## 현재 코드 기준

현재 `main` 브랜치의 구현은 `V2` 기준입니다.

## 참고 링크

- 포트폴리오 / 설계 문서: [https://sichanvisit.github.io/](https://sichanvisit.github.io/)
