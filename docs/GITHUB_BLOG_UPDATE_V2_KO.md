# Obsidian_RAG 2차 업데이트 정리

## 추천 제목

- Obsidian_RAG 2차 업데이트: Streamlit 앱에서 Obsidian 플러그인 중심 워크플로우로
- Obsidian_RAG 개선기: Relation-aware Retrieval과 Obsidian Plugin 통합
- 로컬 RAG 프로젝트 2차 고도화: 노트 문맥 이해와 워크플로우 통합

## 한 줄 소개

기존 Streamlit 중심 로컬 RAG 앱을 Obsidian 플러그인 중심 워크플로우로 확장하고, relation-aware retrieval과 운영 도구 API를 붙여 실제 노트 작업 흐름에 더 가깝게 다듬었다.

## 이번 업데이트에서 달라진 점

### 1. Obsidian 플러그인을 메인 사용 흐름으로 추가

- 현재 노트를 읽고 질문에 따라 필요한 경우에만 붙이는 question-first 흐름을 넣었다.
- 링크, 같은 폴더, 태그, 백링크를 문맥 후보로 선택해 함께 보낼 수 있다.
- 답변 패널에서 검색된 소스와 문맥 노트를 카드 형태로 확인하고 바로 열 수 있다.
- 답변을 새 노트로 저장하거나 현재 노트에 이어붙일 수 있다.

### 2. relation-aware retrieval 도입

- typed relation과 related file 메타데이터를 기반으로 relation adjacency를 구성했다.
- direct hit뿐 아니라 1-hop, 2-hop 관계 체인도 점수화해 보강 문서를 찾는다.
- 검색 결과에 `retrieval_reason`, `source_type`, relation chain 설명을 같이 실어 디버깅 가능성을 높였다.

### 3. Generator / Tagger / Ingest를 공통 API로 정리

- 기존에 Streamlit 내부에서만 다루던 작업을 `/api/tools/*` 스트리밍 엔드포인트로 분리했다.
- 같은 기능을 Streamlit 운영 콘솔과 Obsidian 플러그인에서 공통으로 호출할 수 있게 만들었다.
- Generator는 패턴 워크스페이스와 파일 선택 흐름을 보강했고, Ingest는 selected files 기반 실행을 지원한다.

### 4. 로컬 실행 안정성 개선

- `.env`와 경로 로더를 정리해 Vault 위치를 자동 탐지하는 흐름을 넣었다.
- `start_rag.bat`가 백엔드 헬스체크 후 기존 프로세스를 재사용하거나 재기동한다.
- 기본 로컬 모델도 `qwen3.5:4b` 기준으로 정리했다.

## 기술적으로 강조하면 좋은 포인트

- `FastAPI`를 단순 채팅 서버가 아니라 노트 작업 워크플로우 허브로 확장했다는 점
- `Obsidian Plugin + Streamlit Ops Console` 이중 구조로 UX를 분리했다는 점
- raw/summary 하이브리드 검색 위에 relation-aware ranking을 추가했다는 점
- 결과 근거를 UI에서 직접 확인할 수 있게 `sources`와 `why` 정보를 구조화했다는 점

## 글 본문 예시

기존 1차 버전은 Streamlit에서 로컬 RAG를 실험하는 데 초점이 있었다. 하지만 실제 사용 흐름은 Obsidian 안에서 노트를 읽고, 연결된 문서를 확인하고, 필요한 답변을 바로 저장하는 쪽에 더 가까웠다. 그래서 이번 2차 업데이트에서는 사용 중심을 Streamlit에서 Obsidian 플러그인으로 옮기고, Streamlit은 운영 콘솔과 디버깅 도구 역할로 재정리했다.

검색 로직도 함께 손봤다. 이전에는 summary/raw 하이브리드 검색과 rerank가 중심이었다면, 이번에는 태거가 만든 relation 메타데이터를 이용해 note 사이 연결을 따라가는 relation-aware retrieval을 추가했다. 덕분에 직접적으로 매칭되지 않는 질문에서도 구현 문서, 후속 노트, 관련 요약 문서를 더 안정적으로 보강할 수 있게 됐다.

또 하나의 큰 변화는 Generator, Tagger, Ingest를 API 스트리밍 도구로 분리한 점이다. 이 작업 덕분에 Streamlit과 Obsidian 플러그인이 같은 백엔드 작업 흐름을 공유하게 되었고, 앞으로는 클라이언트가 늘어나도 핵심 파이프라인은 하나의 인터페이스로 유지할 수 있게 됐다.

## 회고 포인트

- 기능을 더하는 것보다 실제 사용하는 맥락을 옮기는 일이 더 큰 구조 변경이었다.
- 검색 품질만큼이나 왜 이 문서가 선택됐는지 보여주는 UX가 중요했다.
- 로컬 프로젝트는 실행 안정성과 경로 자동화가 생각보다 큰 생산성 차이를 만든다.

## 다음 단계 예시

- relation scoring 정교화와 retrieval 평가셋 확장
- 플러그인 대화 히스토리와 추천 액션 UX 개선
- Generator, Tagger, Ingest 결과를 더 명확하게 시각화하는 운영 대시보드 보강
