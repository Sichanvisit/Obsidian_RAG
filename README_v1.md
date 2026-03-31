# Obsidian_RAG V1 - Streamlit 중심 로컬 RAG 챗봇

> Obsidian 개인 문서를 검색 가능한 지식 자산으로 바꾸고, 근거 기반 응답과 운영 작업을 하나의 Streamlit 화면에서 다룰 수 있도록 설계한 1차 버전입니다.

이 버전은 “개인 노트 저장소를 실제로 질의 가능한 시스템으로 만들 수 있는가”라는 문제에서 출발했습니다.  
개인 프로젝트로 문제 정의, 아키텍처 설계, 백엔드, Streamlit UI, 검색 파이프라인, 테스트, 문서화를 직접 구현했습니다.

## 직접 구현한 범위

- FastAPI 기반 스트리밍 RAG 백엔드
- Streamlit 메인 채팅 UI와 운영 화면
- summary/raw 이중 저장소와 하이브리드 검색 파이프라인
- 인덱싱, 태깅, 품질 점검 흐름
- 실행 스크립트, 테스트, 문서화

## 핵심 기술 스택

- Python 3.12, FastAPI, Streamlit
- LangChain, ChromaDB, sentence-transformers
- BM25, RRF, NDJSON streaming
- Ollama / OpenAI

## 프로젝트 개요

이 단계의 목표는 Obsidian 문서를 단순 보관 대상이 아니라, 검색과 질의응답이 가능한 로컬 지식 기반으로 재구성하는 것이었습니다.  
핵심은 로컬 문서를 검색해 근거를 수집하고, 이를 바탕으로 Streamlit 화면에서 질문, 응답, 인덱싱 작업까지 연결하는 end-to-end 흐름을 만드는 데 있었습니다.

## 무엇을 만들었는가

- `/api/chat/stream`에서 단계 로그와 답변을 NDJSON으로 스트리밍하는 FastAPI 백엔드를 구현했습니다.
- Streamlit을 메인 사용 화면으로 두고, 채팅과 운영 작업을 한 곳에서 다룰 수 있게 구성했습니다.
- summary/raw 이중 저장소를 분리해 요약 문서와 원문 문서의 역할을 나눴습니다.
- dense retrieval, BM25, RRF를 결합한 하이브리드 검색으로 문서 후보를 구성했습니다.
- 검색 품질 게이트, 반복 응답 절단, 출처 태그 보강 로직을 추가해 응답 안정성을 높였습니다.
- 인제스트와 태깅 흐름을 함께 묶어, 단순 질의응답을 넘어 문서 관리 작업까지 연결했습니다.

## 지식 처리 / LLM 활용 방식

LLM은 단독 지식 저장소가 아니라, 검색된 문서를 바탕으로 답변을 재구성하는 생성 레이어로 사용했습니다.  
이를 위해 summary/raw 이중 저장소, 하이브리드 검색, 검색 품질 게이트를 결합했고, AgenticFlow가 검색, 재작성, 생성, 검토 단계를 나눠 제어하도록 설계했습니다.  
즉, 이 버전의 초점은 “모델 하나를 붙였다”가 아니라, 로컬 문서를 근거 기반 응답 시스템으로 구조화했다는 점에 있습니다.

## 시스템 구조

```text
[User Query + Project + History]
  -> FastAPI /api/chat/stream
  -> AgenticFlow (Think -> Search -> Grade -> Rewrite -> Generate -> Review)
  -> RagEngine (Embedding Search + BM25 + RRF + Raw Expansion)
  -> LLM (Ollama / OpenAI)
  -> NDJSON Streaming Response
  -> Streamlit UI
```

## 화면 예시

### Streamlit 운영 화면

V1은 Streamlit이 메인 사용 화면이자 운영 콘솔 역할을 함께 맡았습니다.

<p align="center">
  <img src="./docs/readme-assets/v1/chat-overview.jpg" alt="V1 Streamlit Ops overview" width="900" />
</p>

### Generator

지식 생성 워크플로우에서 소스 폴더와 주제를 선택하고 구조화 노트를 생성하던 화면입니다.

<p align="center">
  <img src="./docs/readme-assets/v1/generator-main.jpg" alt="V1 Generator screen" width="720" />
</p>

### Tagger

요약/원문 노트의 frontmatter 태그를 자동 갱신하던 화면입니다.

<p align="center">
  <img src="./docs/readme-assets/v1/tagger-main.jpg" alt="V1 Tagger screen" width="720" />
</p>

### Ingest

프로젝트 단위로 인덱스를 재구성하고 청킹 옵션을 제어하던 화면입니다.

<p align="center">
  <img src="./docs/readme-assets/v1/ingest-main.jpg" alt="V1 Ingest screen" width="720" />
</p>

## 이 버전으로 보여주고자 한 역량

- 로컬 문서 도메인에 맞춘 RAG 파이프라인 설계 능력
- 스트리밍 API와 프론트 UI를 연결한 end-to-end 구현 능력
- 검색 품질 제어와 출처 보강 로직을 포함한 응답 안정화 설계
- 프로토타입을 실제 작업 가능한 로컬 도구로 정리하는 능력

## 실행 메모

- 기본 포트: Backend `8010`, Frontend `8502`
- 실행 진입점: `start_rag.bat` 또는 `python backend/main.py` + `streamlit run frontend/app.py --server.port 8502`
- 주요 엔드포인트: `/health`, `/api/chat/stream`, `/api/chat/stop`
