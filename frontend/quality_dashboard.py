"""
RAG 품질 대시보드
- 검색, 검증, 재구성, 생성 각 단계의 성능 메트릭 시각화
- 참고 파일 추적
- 전체 파이프라인 성능 분석
"""

import streamlit as st
import httpx
import json
from datetime import datetime
from typing import Dict, Any, List

class QualityDashboard:
    """품질 메트릭 시각화"""
    
    def __init__(self, backend_url: str = "http://localhost:8000"):
        self.backend_url = backend_url
    
    def fetch_metrics(self) -> Dict[str, Any]:
        """백엔드에서 메트릭 가져오기"""
        try:
            with httpx.Client(timeout=10) as client:
                resp = client.get(f"{self.backend_url}/api/quality/pipeline_metrics")
                if resp.status_code == 200:
                    return resp.json()
        except Exception as e:
            st.error(f"❌ 메트릭 로드 실패: {e}")
        return {}
    
    def fetch_quality_summary(self) -> Dict[str, Any]:
        """품질 요약 가져오기"""
        try:
            with httpx.Client(timeout=10) as client:
                resp = client.get(f"{self.backend_url}/api/quality/summary")
                if resp.status_code == 200:
                    return resp.json()
        except Exception as e:
            st.error(f"❌ 요약 로드 실패: {e}")
        return {}
    
    def fetch_referenced_files(self) -> List[str]:
        """참고 파일 목록 가져오기"""
        try:
            with httpx.Client(timeout=10) as client:
                resp = client.get(f"{self.backend_url}/api/quality/referenced_files")
                if resp.status_code == 200:
                    data = resp.json()
                    return data.get("referenced_files", [])
        except Exception as e:
            st.error(f"❌ 파일 목록 로드 실패: {e}")
        return []
    
    def display_quality_summary(self):
        """품질 요약 표시"""
        st.subheader("📊 파이프라인 품질 요약")
        
        summary = self.fetch_quality_summary()
        if not summary:
            st.info("아직 데이터가 없습니다.")
            return
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric(
                "총 쿼리",
                summary.get("total_queries", 0),
                help="처리된 총 질문 수"
            )
        
        with col2:
            avg_quality = summary.get("avg_quality_score", 0)
            st.metric(
                "평균 품질",
                f"{avg_quality:.2f}",
                help="0.0 ~ 1.0 (높을수록 좋음)"
            )
        
        with col3:
            avg_search_time = summary.get("avg_search_time_ms", 0)
            st.metric(
                "평균 검색 시간",
                f"{avg_search_time:.0f}ms",
                help="Summary DB 검색 및 Raw 파일 로드"
            )
        
        with col4:
            avg_generation_time = summary.get("avg_generation_time_ms", 0)
            st.metric(
                "평균 생성 시간",
                f"{avg_generation_time:.0f}ms",
                help="LLM 답변 생성 시간"
            )
    
    def display_stage_metrics(self):
        """단계별 메트릭 표시"""
        st.subheader("📈 파이프라인 단계별 메트릭")
        
        metrics = self.fetch_metrics()
        if not metrics:
            st.info("아직 데이터가 없습니다.")
            return
        
        # 탭으로 각 단계 표시
        tab1, tab2, tab3 = st.tabs(["🔍 검색", "✅ 검증", "📝 생성"])
        
        # ===== 검색 단계 =====
        with tab1:
            search_metrics = metrics.get("search_metrics", [])
            if search_metrics:
                st.write(f"**검색 작업 수:** {len(search_metrics)}")
                
                # 최근 5개
                for i, metric in enumerate(search_metrics[-5:], 1):
                    with st.expander(f"검색 {i}: {metric['query'][:40]}..."):
                        col1, col2, col3 = st.columns(3)
                        
                        with col1:
                            st.metric(
                                "Summary 결과",
                                metric.get("summary_results", 0),
                            )
                        
                        with col2:
                            st.metric(
                                "로드된 Raw 파일",
                                metric.get("raw_files_loaded", 0),
                            )
                        
                        with col3:
                            st.metric(
                                "검색 시간",
                                f"{metric.get('search_time_ms', 0):.0f}ms",
                            )
                        
                        # 참고 파일 표시
                        sources = metric.get("sources", [])
                        if sources:
                            st.write("**참고 파일:**")
                            for src in sources:
                                st.code(src, language="")
            else:
                st.info("검색 메트릭이 없습니다.")
        
        # ===== 검증 단계 =====
        with tab2:
            validation_metrics = metrics.get("validation_metrics", [])
            if validation_metrics:
                st.write(f"**검증 작업 수:** {len(validation_metrics)}")
                
                for i, metric in enumerate(validation_metrics[-5:], 1):
                    with st.expander(f"검증 {i}: {metric['query'][:40]}..."):
                        col1, col2 = st.columns(2)
                        
                        with col1:
                            st.metric(
                                "검증된 문서",
                                metric.get("validated_docs", 0),
                            )
                        
                        with col2:
                            st.metric(
                                "거부된 문서",
                                metric.get("rejected_docs", 0),
                            )
                        
                        # 신뢰도 점수
                        scores = metric.get("confidence_scores", [])
                        if scores:
                            avg_confidence = sum(scores) / len(scores)
                            st.metric("평균 신뢰도", f"{avg_confidence:.2f}")
            else:
                st.info("검증 메트릭이 없습니다.")
        
        # ===== 생성 단계 =====
        with tab3:
            generation_metrics = metrics.get("generation_metrics", [])
            if generation_metrics:
                st.write(f"**생성 작업 수:** {len(generation_metrics)}")
                
                for i, metric in enumerate(generation_metrics[-5:], 1):
                    with st.expander(f"생성 {i}: {metric['query'][:40]}..."):
                        col1, col2, col3, col4 = st.columns(4)
                        
                        with col1:
                            st.metric(
                                "모델",
                                metric.get("model", "N/A"),
                            )
                        
                        with col2:
                            st.metric(
                                "토큰 사용",
                                metric.get("tokens_used", 0),
                            )
                        
                        with col3:
                            st.metric(
                                "생성 시간",
                                f"{metric.get('generation_time_ms', 0):.0f}ms",
                            )
                        
                        with col4:
                            quality = metric.get("quality_score", 0)
                            st.metric(
                                "품질 점수",
                                f"{quality:.2f}",
                                delta="✅" if quality > 0.5 else "⚠️"
                            )
            else:
                st.info("생성 메트릭이 없습니다.")
    
    def display_referenced_files(self):
        """참고 파일 목록 표시"""
        st.subheader("📚 참고된 파일 목록")
        
        files = self.fetch_referenced_files()
        if files:
            st.write(f"**총 {len(files)}개 파일 참고됨:**")
            for file in files:
                st.code(file, language="")
        else:
            st.info("아직 참고된 파일이 없습니다.")
    
    def render(self):
        """대시보드 전체 렌더링"""
        st.set_page_config(page_title="RAG 품질 대시보드", layout="wide")
        
        st.title("📊 RAG 파이프라인 품질 대시보드")
        
        # 새로고침 버튼
        col1, col2 = st.columns([4, 1])
        with col2:
            if st.button("🔄 새로고침"):
                st.rerun()
        
        # 탭으로 구성
        tab1, tab2, tab3 = st.tabs(["품질 요약", "단계별 메트릭", "참고 파일"])
        
        with tab1:
            self.display_quality_summary()
        
        with tab2:
            self.display_stage_metrics()
        
        with tab3:
            self.display_referenced_files()


if __name__ == "__main__":
    dashboard = QualityDashboard()
    dashboard.render()
