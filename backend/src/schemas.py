from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

# 상대/절대 import 둘 다 지원
try:
    from backend.src.enums import LayerType
except ImportError:
    from src.enums import LayerType

# ==============================================================
# 📄 문서 객체 (RAG가 찾아낸 정보의 단위)
# ==============================================================
class RagDocument(BaseModel):
    """
    검색된 단일 문서의 정보를 담는 객체입니다.
    UI에서 그래프를 그릴 때 핵심 데이터로 사용됩니다.
    """
    # 문서의 실제 내용 (본문)
    # LangChain 호환성을 위해 'content' 대신 'page_content'를 주로 사용하지만,
    # 직관성을 위해 alias를 두거나 그대로 사용해도 됩니다. 여기선 rag.py와 맞춥니다.
    page_content: str  

    # ChromaDB 등에서 가져온 원본 메타데이터 (페이지 번호, 청크 위치 등)
    metadata: Dict[str, Any] = Field(default_factory=dict)

    # 리랭커(CrossEncoder)가 매긴 적합도 점수 (0.0 ~ 1.0)
    score: float = 0.0

    # 파일의 절대 경로 (사용자에게 파일을 열어줄 때 사용)
    source_path: str

    # 이 문서가 '요약본(Summary)'인지 '원본(Raw)'인지 구분
    layer: LayerType

    # [중요] 시각화용 족보 데이터
    # 예: {"summary": "요약_python.md", "raw": "main.py"}
    # 이 정보를 통해 UI가 요약본과 원본을 선으로 연결할 수 있습니다.
    links: Dict[str, Any] = Field(default_factory=dict)


# ==============================================================
# 🧠 에이전트 상태 (Thinking Process State)
# ==============================================================
class AgentState(BaseModel):
    """
    Graph가 '생각'하는 동안 유지되는 문맥(Context)입니다.
    질문이 들어오고 답변이 나갈 때까지의 모든 이력을 담습니다.
    """
    # 1. 사용자의 최초 질문 (변하지 않음)
    query: str

    # 2. 검색을 위해 재구성된 질문 (상황에 따라 계속 변함)
    # 예: "그거 안되던데?" -> "Python requests 라이브러리 타임아웃 해결 방법"
    current_query: str

    # 2-1. Multi-Query 리스트 (여러 관점에서 검색)
    multi_queries: List[str] = Field(default_factory=list)

    # 2-2. ✅ 이전 대화 히스토리 (context 개선용)
    history: str = ""

    # 3. 프로젝트 구분 (여러 프로젝트 관리 시 필요)
    project_name: str = "Default"

    # 4. 진행 상황 로그 리스트
    # 예: ["질문 분석 중...", "검색 결과 5건 발견", "품질 부족으로 재검색"]
    logs: List[str] = Field(default_factory=list)

    # 5. 검색된 문서 꾸러미 (RagDocument 리스트)
    context: List[RagDocument] = Field(default_factory=list)

    # 5-1. ✅ Summary 문서 목록 (layer == SUMMARY)
    summary_docs: List[Dict[str, Any]] = Field(default_factory=list)

    # 5-2. ✅ Raw 문서 목록 (layer == RAW)
    raw_docs: List[Dict[str, Any]] = Field(default_factory=list)

    # 6. 검색 점수 기록 (통계 및 차트용)
    scores: List[float] = Field(default_factory=list)

    # 6-1. 검색 결과 검증 상태 (검색된 문서가 질문과 관련이 있는지)
    # "PASSED": 좋음 / "MARGINAL": 중간 / "FAILED": 나쁨
    retrieval_grade: str = "PENDING"

    # 7. 재시도 횟수 카운터 (무한 루프 방지)
    retry_count: int = 0

    # 8. 단계별 횟수 카운터 (우측 패널 메트릭용)
    # 예: {"think": 1, "search": 2, "grade": 1, "rewrite": 2, "gen": 1}
    step_counts: Dict[str, int] = Field(default_factory=lambda: {
        "think": 0,      # 분석/생각
        "search": 0,     # 검색
        "grade": 0,      # 검증
        "rewrite": 0,    # 재구성
        "gen": 0,        # 생성
        "review": 0      # 답변 검토
    })

    # 9. 최종 답변 (LLM이 생성한 텍스트)
    answer: str = ""

    # ========== 📊 [추가] 메트릭 & 분석 데이터 ==========
    
    # 10. 각 단계별 상세 분석 로그
    # 예: {
    #   "think": [{"query": "...", "keywords": "..."}],
    #   "search": [{"query": "...", "results": 5, "scores": [0.9, 0.8, ...], "sources": [...]}],
    #   "grade": [{"passed": True, "reason": "..."}],
    #   "rewrite": [{"from": "...", "to": "..."}],
    #   "gen": [{"tokens": 150, "duration": 2.3}]
    # }
    step_details: Dict[str, List[Dict[str, Any]]] = Field(default_factory=dict)

    # 11. 실행 시간 통계
    metrics: Dict[str, float] = Field(default_factory=lambda: {
        "total_time": 0.0,      # 전체 소요 시간 (초)
        "think_time": 0.0,      # 분석 시간
        "search_time": 0.0,     # 검색 시간
        "grade_time": 0.0,      # 검증 시간
        "rewrite_time": 0.0,    # 재구성 시간
        "gen_time": 0.0,        # 생성 시간
        "total_tokens": 0,      # 총 토큰 수
        "tokens_per_second": 0.0 # 생성 속도 (tok/s)
    })

    # 12. 검색 결과 상세 정보
    search_details: Dict[str, Any] = Field(default_factory=lambda: {
        "query_original": "",        # 원본 질문
        "query_rewritten": "",       # 변형된 질문
        "summary_results": [],       # [{"title": "...", "score": 0.9, "snippet": "..."}]
        "raw_results": []            # [{"filename": "...", "path": "...", "snippet": "..."}]
    })

    # 13. 재생성 히스토리 (재시도 횟수별 기록)
    generation_history: List[Dict[str, Any]] = Field(default_factory=list)  # [{"attempt": 1, "reason": "...", "answer": "..."}]


# ==============================================================
# 📨 API 요청 규격 (Frontend -> Backend)
# ==============================================================
class ChatRequest(BaseModel):
    """
    프론트엔드에서 백엔드로 보낼 때 사용하는 요청 포맷
    """
    query: str
    session_id: str = "default"
    project_name: str = "Default"
    model_name: str = "qwen2.5-coder:3b" # 사용할 모델 지정 옵션
    history: str = ""  # ✅ 대화 히스토리 context
