# Obsidian_RAG — Obsidian 문서 기반 로컬 RAG 챗봇

> 📘 **[설계 문서 & 포트폴리오 보기](https://sichanvisit.github.io/)**

Obsidian 문서를 검색해 근거 기반 답변을 생성하는 로컬 RAG 시스템입니다.
FastAPI 백엔드와 Streamlit 프론트엔드로 구성되며 NDJSON 스트리밍 응답을 제공합니다.
요약/원문 벡터 저장소와 하이브리드 검색(임베딩+BM25)을 사용합니다.

## 주요 기능

- `/api/chat/stream`으로 단계 로그와 답변을 NDJSON 스트리밍으로 반환합니다.
- 다중 질의 생성 후 하이브리드 검색으로 문서 후보를 수집합니다.
- 검색 점수 기반 품질 게이트로 재작성/재검색 흐름을 제어합니다.
- 답변 반복 패턴을 감지하고 임계치에서 자동 절단합니다.
- 답변에 인용 태그가 없으면 출처 태그를 자동 보강합니다.
- Streamlit UI에서 채팅, 인제스트, 태깅 작업을 함께 실행합니다.
- `start_rag.bat`로 백엔드와 프론트엔드를 동시에 실행합니다.

## 아키텍처

```text
[User Query + Project + History]
  → FastAPI `/api/chat/stream`
  → AgenticFlow (Think → Search → Grade → Rewrite → Generate → Review)
  → RagEngine (Embedding Search + BM25 + RRF + Raw Expansion)
  → LLM (Ollama/OpenAI)
  → NDJSON Streaming Response
  → Streamlit UI
```

## 기술 스택

### Backend
- Python 3.12 — 백엔드/파이프라인 실행 언어입니다.
- FastAPI, Uvicorn — REST API와 스트리밍 서버를 제공합니다.
- Pydantic — 요청/상태 스키마를 검증합니다.
- PyYAML, python-dotenv — 설정 파일과 환경변수를 로드합니다.

### Frontend
- Streamlit — 채팅/운영 UI를 제공합니다.
- httpx — 백엔드 스트리밍 API를 호출합니다.

### AI / RAG
- LangChain — 모델/벡터스토어 연동을 처리합니다.
- ChromaDB — summary/raw 벡터 저장소를 저장합니다.
- sentence-transformers, HuggingFace Embeddings — 임베딩을 생성합니다.
- BM25 (커스텀), RRF (커스텀) — 키워드 검색과 랭킹 결합을 수행합니다.
- Ollama (`qwen2.5-coder:3b` 기본) / OpenAI Chat Models — 답변 생성을 수행합니다.

### Infra / Tools
- Docker Compose — 백엔드/프론트엔드 컨테이너 실행을 지원합니다.
- GitHub Actions (`github/workflows/ci.yml`) — CI 파이프라인을 실행합니다.

## 프로젝트 구조

```text
Obsidian_RAG/
├── backend/                    # FastAPI 서버와 RAG 핵심 로직
│   ├── main.py                 # API 엔트리포인트 (/health, /api/chat/*)
│   ├── config/                 # jobs.yaml, prompts.yaml, 경로/설정 로더
│   ├── src/                    # graph, rag engine, pipeline, schema
│   └── tests/                  # 백엔드 테스트 파일
├── frontend/                   # Streamlit 애플리케이션
│   ├── app.py                  # 메인 UI
│   └── quality_dashboard.py    # 품질 대시보드 UI
├── data/                       # 벡터 저장소/로그/원천 데이터
├── projects/                   # 프로젝트별 채팅 이력
├── start_rag.bat               # Windows 원클릭 실행 스크립트
└── docker-compose.yml          # 컨테이너 실행 설정
```

## 설치 및 실행

### 사전 요구사항

- Python 3.12
- `pip`
- Ollama (로컬 모델 사용 시)
- Obsidian 문서 경로(인제스트 사용 시)

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

### 환경변수 설정

루트에 `.env` 파일을 만들고 아래 키를 설정합니다.

```env
# Model / LLM
OPENAI_API_KEY=
LOCAL_LLM_URL=http://localhost:11434
LOCAL_LLM_MODEL=qwen2.5-coder:3b
EMBEDDING_MODEL_NAME=BAAI/bge-m3
LLM_TEMPERATURE=0.2

# Data paths
OBSIDIAN_PATH=
DATA_DIC_PATH=
DATA_SUMMATION_PATH=
OBSIDIAN_VAULT_PATH=

# Server
BACKEND_PORT=8010
BACKEND_URL=http://127.0.0.1:8010
ENABLE_STRATEGY_PLANNER=0
```

### 실행

#### 방법 1) Windows 일괄 실행

```bat
start_rag.bat
```

기본 포트는 Backend `8010`, Frontend `8502`입니다.

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
| `POST` | `/api/chat/stream` | 질의를 받아 NDJSON 스트리밍 응답을 반환합니다. |
| `POST` | `/api/chat/stop` | 세션 기준으로 스트리밍 생성을 중단합니다. |

## 데이터 흐름

```text
1. 사용자 입력(query, project_name, history)
   ↓
2. AgenticFlow가 질의 분석과 다중 질의 생성
   ↓
3. RagEngine이 summary/raw 검색 후 문서 컨텍스트 구성
   ↓
4. LLM이 스트리밍 답변 생성 및 후처리
   ↓
5. Self-RAG 점수/로그와 함께 최종 응답 반환
```

## 라이선스

이 프로젝트는 교육 및 포트폴리오 목적으로 제작되었습니다.
