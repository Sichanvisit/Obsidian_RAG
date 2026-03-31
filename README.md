# Obsidian_RAG - Obsidian Plugin-Centered Local RAG Workspace

> [설계 문서와 포트폴리오 보기](https://sichanvisit.github.io/)

Obsidian 문서를 검색하고 현재 노트 문맥까지 함께 활용해 근거 기반 답변을 생성하는 로컬 RAG 프로젝트입니다.
현재 구조는 `FastAPI + Streamlit 운영 콘솔 + Obsidian Plugin` 조합이며, 채팅뿐 아니라 `Generator`, `Tagger`, `Ingest` 워크플로우까지 한 번에 다룹니다.

## 이번 2차 업데이트 핵심

- Obsidian 플러그인을 메인 클라이언트로 추가했습니다.
- `/api/chat/obsidian/stream`으로 현재 노트, 링크, 폴더, 태그, 백링크 문맥을 함께 전달할 수 있습니다.
- typed relation과 related file 정보를 활용하는 relation-aware retrieval 흐름을 넣었습니다.
- Generator, Tagger, Ingest를 API 스트리밍 도구로 분리해 Streamlit과 플러그인에서 공통으로 사용합니다.
- 경로 탐지, 백엔드 기동, 헬스체크를 보강해 로컬 실행 안정성을 높였습니다.

## 주요 기능

- `/api/chat/stream`과 `/api/chat/obsidian/stream`에서 NDJSON 스트리밍 응답을 제공합니다.
- summary/raw 하이브리드 검색과 rerank를 조합해 문서 후보를 구성합니다.
- relation graph 기반 1-hop, 2-hop 확장으로 관련 노트를 보강합니다.
- 검색 결과에 `sources`, `retrieval_reason`, relation chain 정보를 함께 내려 UI에서 근거를 확인할 수 있습니다.
- Streamlit에서 Ops 콘솔, 레거시 채팅, Generator, Tagger, Ingest를 함께 운영할 수 있습니다.
- Obsidian 플러그인에서 답변 저장, 소스 노트 열기, 현재 노트 기반 질문, 워크플로우 실행까지 처리합니다.
- `start_rag.bat`가 백엔드 상태를 확인한 뒤 재사용 또는 재기동합니다.

## 아키텍처

```text
[Obsidian Plugin / Streamlit Ops Console]
  -> FastAPI
  -> AgenticFlow (Think -> Search -> Grade -> Rewrite -> Generate -> Review)
  -> RagEngine (Hybrid Search + Relation Expansion + Rerank)
  -> LLM (Ollama / OpenAI)
  -> NDJSON Streaming Response
```

## 기술 스택

### Backend
- Python 3.12
- FastAPI, Uvicorn
- Pydantic
- PyYAML, python-dotenv

### Frontend / Client
- Streamlit
- Obsidian Plugin (TypeScript, esbuild)
- httpx

### AI / RAG
- LangChain
- ChromaDB
- sentence-transformers / HuggingFace Embeddings
- BM25, RRF, relation-aware ranking
- Ollama (`qwen3.5:4b` 기본) / OpenAI Chat Models

### Infra / Tools
- Docker Compose
- GitHub Actions (`github/workflows/ci.yml`)

## 프로젝트 구조

```text
Obsidian_RAG/
|- backend/                    # FastAPI 서버와 RAG 핵심 로직
|  |- main.py                  # /health, /api/chat/*, /api/tools/*
|  |- config/                  # jobs.yaml, prompts.yaml, 경로/설정 로더
|  |- src/                     # graph, rag engine, pipeline, schema
|  `- tests/                   # relation/ranking 테스트 포함
|- frontend/                   # Streamlit 운영 콘솔
|  `- app.py
|- obsidian-plugin/            # Obsidian Local Agent 플러그인
|- data/                       # 로컬 인덱스/벡터 저장소(기본적으로 Git 제외)
|- projects/                   # 프로젝트별 채팅 이력
|- start_rag.bat               # Windows 원클릭 실행 스크립트
`- docker-compose.yml
```

## 설치 및 실행

### 사전 요구사항

- Python 3.12
- `pip`
- Node.js 20+ (`obsidian-plugin` 빌드 시)
- Ollama (로컬 모델 사용 시)
- Obsidian Vault 경로

### 설치

```bash
git clone https://github.com/Sichanvisit/Obsidian_RAG.git
cd Obsidian_RAG

python -m venv .venv
# Windows
.\.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

pip install -r backend/requirements.txt
pip install -r frontend/requirements.txt
```

### Obsidian 플러그인 빌드

```bash
cd obsidian-plugin
npm install
npm run build
cd ..
```

### 환경변수 설정

루트 `.env`에 아래 값을 설정합니다.

```env
# Model / LLM
OPENAI_API_KEY=
LOCAL_LLM_URL=http://localhost:11434
LOCAL_LLM_MODEL=qwen3.5:4b
EMBEDDING_MODEL_NAME=BAAI/bge-m3
LLM_TEMPERATURE=0.2

# Vault / data paths
OBSIDIAN_PATH=
DATA_DIC_PATH=
DATA_SUMMATION_PATH=
OBSIDIAN_VAULT_PATH=

# Server
BACKEND_PORT=8011
BACKEND_URL=http://127.0.0.1:8011
ENABLE_STRATEGY_PLANNER=0
```

### 실행

#### 방법 1) Windows 일괄 실행

```bat
start_rag.bat
```

기본 포트는 Backend `8011`, Frontend `8502`입니다.

#### 방법 2) 수동 실행

```bash
# 1) Backend
python backend/main.py

# 2) Frontend (새 터미널)
streamlit run frontend/app.py --server.port 8502
```

#### 방법 3) Docker Compose

```bash
docker compose up --build
```

## API

| Method | Endpoint | 설명 |
|:---:|:---|:---|
| `GET` | `/health` | 서버 및 엔진 준비 상태를 조회합니다. |
| `POST` | `/api/chat/stream` | 일반 질의를 스트리밍 응답으로 반환합니다. |
| `POST` | `/api/chat/obsidian/stream` | 현재 노트와 문맥을 포함한 Obsidian 질의를 처리합니다. |
| `POST` | `/api/chat/stop` | 세션 기준으로 스트리밍 생성을 중단합니다. |
| `GET` | `/api/tools/config` | Generator, Tagger, Ingest 설정을 반환합니다. |
| `POST` | `/api/tools/files` | Generator 입력 파일 목록을 조회합니다. |
| `POST` | `/api/tools/generator/stream` | Generator 작업을 스트리밍 실행합니다. |
| `POST` | `/api/tools/tagger/stream` | Tagger 작업을 스트리밍 실행합니다. |
| `POST` | `/api/tools/ingest/stream` | Ingest 작업을 스트리밍 실행합니다. |

## 데이터 흐름

```text
1. 질문 입력
   ->
2. 현재 노트 / 링크 / 폴더 / 태그 / 백링크 문맥 수집 (옵션)
   ->
3. AgenticFlow가 질의 해석과 검색 전략을 결정
   ->
4. RagEngine이 hybrid retrieval + relation expansion + rerank 수행
   ->
5. LLM이 스트리밍 답변 생성
   ->
6. sources / retrieval_reason / follow-up 정보를 함께 반환
```

## 참고 문서

- `obsidian-plugin/README.md`: 플러그인 빌드와 설치 가이드
- `docs/GITHUB_BLOG_UPDATE_V2_KO.md`: GitHub 블로그 업데이트 초안

## 라이선스

이 프로젝트는 교육 및 포트폴리오 목적으로 제작되었습니다.
