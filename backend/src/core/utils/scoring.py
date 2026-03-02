"""
점수 계산 상수 및 유틸리티
=========================
Quick-Rerank, 검색 품질 평가에서 사용되는 매직 넘버를 상수로 관리
"""


class ScoreWeights:
    """점수 계산 가중치 상수"""
    
    # === 키워드 매칭 점수 ===
    SNIPPET_KEYWORD = 10       # snippet에서 키워드 발견 시
    FILENAME_KEYWORD = 20      # 파일명에서 키워드 발견 시
    
    # === 팀 패턴 보너스 ===
    TEAM_PATTERN_BONUS = 100   # 숫자+팀 패턴 (1팀, 2팀...)
    TEAM_SINGLE_BONUS = 50     # "팀" 단독 매칭
    LEVEL_MATCH_BONUS = 30     # 레벨 키워드 일치 시
    
    # === 레벨 일치/불일치 배율 ===
    LEVEL_MATCH_MULTIPLIER = 2.0      # 레벨 일치 (초급 질문 → 초급 문서)
    LEVEL_MISMATCH_PENALTY = 0.1      # 레벨 불일치 (초급 질문 → 중급 문서)
    LEVEL_MISMATCH_THRESHOLD = 0.5    # 이 값 미만이면 결과에서 제외
    
    # === 점수 결합 가중치 ===
    ORIGINAL_SCORE_WEIGHT = 0.4       # 원래 검색 점수 비중
    KEYWORD_SCORE_WEIGHT = 0.6        # 키워드 매칭 점수 비중
    
    # === 팀 패턴 최종 점수 ===
    TEAM_PATTERN_BASE_SCORE = 0.9     # 숫자+팀 패턴 기본 점수
    TEAM_SINGLE_BASE_SCORE = 0.8      # 팀 단독 기본 점수
    TEAM_ORIGINAL_WEIGHT = 0.1        # 팀 패턴 시 원래 점수 반영 비율
    
    # === 검색 품질 판정 ===
    GRADE_HIGH_MULTIPLIER = 0.9       # max_score >= threshold * 0.9 → 높은 품질
    GRADE_MID_MULTIPLIER = 0.7        # avg_score >= threshold * 0.7 → 중간 품질


class LevelKeywords:
    """레벨 키워드 매핑"""
    
    MAPPING = {
        '초급': '01_초급',
        '중급': '02_중급',
        '고급': '03_고급',
    }
    
    # 레벨 패턴 리스트 (불일치 체크용)
    ALL_PATTERNS = ['01_초급', '02_중급', '03_고급', '초급', '중급', '고급']
    
    @classmethod
    def get_level_prefix(cls, query: str) -> tuple:
        """
        쿼리에서 레벨 키워드 추출
        
        Returns:
            (level_name, level_prefix) or None
        """
        query_lower = query.lower()
        for level, prefix in cls.MAPPING.items():
            if level in query_lower:
                return (level, prefix.lower())
        return None
