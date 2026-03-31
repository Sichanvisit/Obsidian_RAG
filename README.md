# Obsidian_RAG

> Obsidian 문서를 검색 가능한 지식 자산으로 구조화하고, 로컬 RAG 채팅과 노트 워크플로우를 하나의 시스템으로 통합한 개인 프로젝트입니다.

이 저장소는 단순한 챗봇 예제가 아니라, 개인 지식 저장소를 실제 작업 가능한 로컬 워크스페이스로 확장한 과정을 담고 있습니다.  
기획, 구조 설계, 백엔드, Streamlit 운영 UI, Obsidian Plugin, 테스트, 문서화까지 직접 구현했습니다.

## 프로젝트가 다루는 문제

- 흩어진 Obsidian 문서를 근거 기반으로 검색하고 답변에 연결할 수 있어야 했습니다.
- 질의응답만이 아니라 구조화 노트 생성, 태깅, 인덱싱까지 하나의 흐름으로 묶고자 했습니다.
- 로컬 환경에서도 검색 품질과 작업 맥락을 유지할 수 있는 지식 워크스페이스를 목표로 했습니다.

## 핵심 기술 스택

- Backend: Python, FastAPI, Pydantic
- Retrieval / LLM: LangChain, ChromaDB, sentence-transformers, BM25, RRF, Ollama / OpenAI
- Client: Streamlit, Obsidian Plugin (TypeScript, esbuild)
- Workflow: NDJSON streaming, Generator / Tagger / Ingest APIs, relation-aware retrieval

## 버전별 문서

### V1

[README_v1.md](README_v1.md)

Streamlit을 메인 화면으로 사용한 로컬 RAG 챗봇 단계입니다.  
핵심은 하이브리드 검색, 스트리밍 응답, 인덱싱/태깅 작업을 하나의 운영 UI로 묶는 것이었습니다.

### V2

[README_v2.md](README_v2.md)

Obsidian Plugin을 메인 클라이언트로 확장한 로컬 지식 워크스페이스 단계입니다.  
핵심은 현재 노트 문맥 활용, relation-aware retrieval, Generator/Tagger/Ingest 워크플로우의 API화였습니다.

## 현재 코드 기준

현재 `main` 브랜치의 구현은 `V2` 기준입니다.

## 참고 링크

- 포트폴리오 / 설계 문서: [https://sichanvisit.github.io/](https://sichanvisit.github.io/)
