# Obsidian_RAG V2 - Obsidian Plugin 중심 로컬 지식 워크스페이스

> Obsidian 안에서 현재 노트 문맥, 관련 문서 검색, 생성/태깅/인덱싱 워크플로우를 함께 다룰 수 있도록 확장한 2차 버전입니다.

V1이 별도 Streamlit 콘솔에서 로컬 RAG를 구현했다면, V2는 실제 작업이 일어나는 Obsidian 안으로 검색과 워크플로우를 끌어오는 데 초점을 맞췄습니다.  
개인 프로젝트로 구조 설계, FastAPI 백엔드, Obsidian 플러그인, Streamlit 운영 콘솔, relation-aware retrieval, 테스트, 문서화를 직접 구현했습니다.

## 직접 구현한 범위

- Obsidian Plugin 기반 메인 클라이언트
- `/api/chat/obsidian/stream`와 도구용 스트리밍 APIs
- typed relation / related file 기반 relation-aware retrieval
- Generator, Tagger, Ingest 워크플로우
- Streamlit 운영 콘솔과 실행/헬스체크 스크립트

## 핵심 기술 스택

- Python 3.12, FastAPI, Pydantic
- TypeScript, Obsidian Plugin API, esbuild
- LangChain, ChromaDB, sentence-transformers
- BM25, RRF, relation-aware ranking, Ollama / OpenAI

## 프로젝트 개요

V1에서는 로컬 문서를 검색하고 응답하는 흐름을 만들었지만, 실제 지식 작업은 여전히 Obsidian 안에서 이루어졌습니다.  
V2의 목표는 이 분리를 줄이고, 현재 노트와 링크 구조를 활용해 검색 품질을 높이면서, 노트 생성·태깅·인덱싱까지 하나의 지식 워크스페이스로 묶는 것이었습니다.

## 무엇을 만들었는가

- Obsidian 플러그인을 메인 클라이언트로 두고, 현재 노트, 링크, 폴더, 태그, 백링크 문맥을 백엔드에 함께 전달할 수 있게 구성했습니다.
- `/api/chat/obsidian/stream`을 통해 일반 채팅과 구분된 Obsidian 전용 질의 흐름을 구현했습니다.
- typed relation과 related file 정보를 활용해 1-hop, 2-hop 확장을 수행하는 relation-aware retrieval을 추가했습니다.
- Generator, Tagger, Ingest를 개별 스트리밍 API로 분리해 대화 외 작업도 동일한 인프라로 처리하도록 설계했습니다.
- Streamlit은 메인 UI가 아니라 운영 콘솔과 fallback UI로 재정의했습니다.
- `start_rag.bat`와 health check 흐름을 보강해 로컬 환경에서 재기동과 재사용이 가능하도록 정리했습니다.

## 지식 처리 / LLM 활용 방식

이 버전에서는 LLM을 단순 채팅 응답기가 아니라, 현재 노트 문맥과 검색 결과를 결합해 지식을 재구성하는 레이어로 사용했습니다.  
질문이 들어오면 현재 노트와 관련 문서의 구조적 맥락을 함께 수집하고, hybrid retrieval과 relation expansion으로 후보를 보강한 뒤, 생성 단계에서 `sources`와 `retrieval_reason`까지 추적 가능하도록 설계했습니다.  
또한 LLM을 채팅에만 쓰지 않고, Generator/Tagger/Ingest 워크플로우와 연결해 노트 생성, metadata 갱신, 인덱스 재구성 같은 작업 흐름으로 확장했습니다.

## 시스템 구조

```text
[Obsidian Plugin / Streamlit Ops Console]
  -> FastAPI
  -> AgenticFlow (Think -> Search -> Grade -> Rewrite -> Generate -> Review)
  -> RagEngine (Hybrid Search + Relation Expansion + Rerank)
  -> LLM (Ollama / OpenAI)
  -> NDJSON Streaming Response
```

## 화면 예시

### Obsidian Plugin + Chat

V2는 Obsidian 안에서 현재 노트 문맥과 함께 질문하고, 우측 패널에서 로컬 에이전트 흐름을 바로 다루는 구조로 바뀌었습니다.

<p align="center">
  <img src="./docs/readme-assets/v2/plugin-chat-overview.jpg" alt="V2 Obsidian plugin and chat screen" width="900" />
</p>

### Generator

Obsidian 로컬 에이전트 안에서 폴더 선택, 출력 경로, 모델, 패턴 세트를 조합해 생성 작업을 실행하는 화면입니다.

<p align="center">
  <img src="./docs/readme-assets/v2/generator-panel.jpg" alt="V2 Generator panel" width="420" />
</p>

### Tagger

선택 범위의 frontmatter를 갱신하고 vault 전체 인덱스를 다시 맞추는 태깅 워크플로우 화면입니다.

<p align="center">
  <img src="./docs/readme-assets/v2/tagger-panel.jpg" alt="V2 Tagger panel" width="420" />
</p>

### Ingest

프로젝트 범위, 레이어, 청킹 정책을 제어하면서 인덱스를 재구성하는 화면입니다.

<p align="center">
  <img src="./docs/readme-assets/v2/ingest-panel.jpg" alt="V2 Ingest panel" width="420" />
</p>

### Logs

워크플로우 실행 결과를 탭별 로그로 확인할 수 있도록 분리한 운영 화면입니다.

<p align="center">
  <img src="./docs/readme-assets/v2/logs-panel.jpg" alt="V2 workflow logs panel" width="420" />
</p>

## 이 버전으로 보여주고자 한 역량

- 노트 도메인에 맞춘 제품형 문제 정의와 워크플로우 설계
- 백엔드 API와 Obsidian 플러그인 간 인터페이스 설계
- relation graph를 활용한 retrieval 품질 개선
- 대화형 기능과 운영 도구를 하나의 로컬 시스템으로 통합하는 능력

## 실행 메모

- 기본 포트: Backend `8011`, Frontend `8502`
- 실행 진입점: `start_rag.bat` 또는 `python backend/main.py` + `streamlit run frontend/app.py --server.port 8502`
- 플러그인 빌드: `cd obsidian-plugin && npm install && npm run build`
- 주요 엔드포인트: `/health`, `/api/chat/stream`, `/api/chat/obsidian/stream`, `/api/tools/*`
