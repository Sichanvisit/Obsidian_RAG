# Obsidian_RAG V2 - Obsidian Plugin-Centered Local RAG Workspace

Obsidian 문서를 검색하고 현재 노트 문맥까지 함께 활용해 근거 기반 답변을 생성하는 로컬 RAG 프로젝트의 2차 버전입니다.
현재 구조는 `FastAPI + Streamlit 운영 콘솔 + Obsidian Plugin` 조합이며, 채팅뿐 아니라 `Generator`, `Tagger`, `Ingest` 워크플로우까지 다룹니다.

## V2 핵심 포인트

- Obsidian Plugin이 메인 클라이언트입니다.
- `/api/chat/obsidian/stream`으로 현재 노트, 링크, 폴더, 태그, 백링크 문맥을 함께 전달할 수 있습니다.
- typed relation과 related file 정보를 활용하는 relation-aware retrieval이 추가되었습니다.
- Generator, Tagger, Ingest가 API 스트리밍 도구로 분리되었습니다.
- Streamlit은 운영 콘솔과 fallback UI 역할로 재정의되었습니다.

## UI 스크린샷

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

## 주요 기능

- `/api/chat/stream`과 `/api/chat/obsidian/stream`에서 NDJSON 스트리밍 응답 제공
- summary/raw 하이브리드 검색과 rerank로 문서 후보 구성
- relation graph 기반 1-hop, 2-hop 확장으로 관련 노트 보강
- 검색 결과에 `sources`, `retrieval_reason`, relation chain 정보 포함
- Streamlit에서 Ops 콘솔, Legacy Chat, Generator, Tagger, Ingest 운영
- Obsidian Plugin에서 답변 저장, 소스 노트 열기, 현재 노트 기반 질문, 워크플로우 실행
- `start_rag.bat`가 백엔드 상태 확인 후 재사용 또는 재기동

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
|- start_rag.bat
`- docker-compose.yml
```

## 설치 및 실행

### 사전 요구사항

- Python 3.12
- `pip`
- Node.js 20+ (`obsidian-plugin` 빌드 시)
- Ollama
- Obsidian Vault 경로

### 설치

```bash
git clone https://github.com/Sichanvisit/Obsidian_RAG.git
cd Obsidian_RAG

python -m venv .venv
# Windows
.\.venv\Scripts\activate

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

# 2) Frontend
streamlit run frontend/app.py --server.port 8502
```

## API

| Method | Endpoint | 설명 |
|:---:|:---|:---|
| `GET` | `/health` | 서버 및 엔진 준비 상태 조회 |
| `POST` | `/api/chat/stream` | 일반 질의 스트리밍 응답 |
| `POST` | `/api/chat/obsidian/stream` | 현재 노트와 문맥을 포함한 Obsidian 질의 처리 |
| `POST` | `/api/chat/stop` | 세션 기준 스트리밍 중단 |
| `GET` | `/api/tools/config` | Generator, Tagger, Ingest 설정 반환 |
| `POST` | `/api/tools/files` | Generator 입력 파일 목록 조회 |
| `POST` | `/api/tools/generator/stream` | Generator 작업 스트리밍 실행 |
| `POST` | `/api/tools/tagger/stream` | Tagger 작업 스트리밍 실행 |
| `POST` | `/api/tools/ingest/stream` | Ingest 작업 스트리밍 실행 |

## V2 요약

V2는 `Obsidian Plugin 중심 워크스페이스`로 넘어간 단계입니다.
핵심은 현재 노트 문맥 활용, relation-aware retrieval, 운영 도구 API 분리, Streamlit 역할 재정의였습니다.
