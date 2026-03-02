import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Optional

# [SSOT] 경로 관리 모듈 사용
from backend.config.paths import CHAT_HISTORY_DIR

class SessionManager:
    def __init__(self):
        # 저장소 경로 확인 및 생성
        self.history_dir = CHAT_HISTORY_DIR
        if not os.path.exists(self.history_dir):
            os.makedirs(self.history_dir, exist_ok=True)

    def create_session(self, title: str = "New Chat") -> str:
        """새로운 채팅 세션을 생성하고 ID를 반환합니다."""
        sid = str(uuid.uuid4())
        initial_data = {
            "id": sid,
            "title": title,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "messages": []
        }
        self._save_file(sid, initial_data)
        return sid

    def list_sessions(self) -> List[Dict]:
        """최신순으로 정렬된 세션 목록(메타데이터)을 반환합니다."""
        sessions = []
        for f in os.listdir(self.history_dir):
            if f.endswith(".json"):
                try:
                    data = self._load_file(f.replace(".json", ""))
                    sessions.append({
                        "id": data.get("id"),
                        "title": data.get("title", "Untitled"),
                        "updated_at": data.get("updated_at", "")
                    })
                except Exception as e:
                    print(f"⚠️ 세션 로드 실패 ({f}): {e}")
                    continue
        
        # 최신 수정일 기준 내림차순 정렬
        return sorted(sessions, key=lambda x: x["updated_at"], reverse=True)

    def load_session(self, sid: str) -> Dict:
        """특정 세션의 전체 데이터를 불러옵니다."""
        return self._load_file(sid)

    def save_session(self, sid: str, messages: List[Dict], title: str = None):
        """세션의 메시지와 제목을 업데이트합니다."""
        data = self._load_file(sid)
        
        # 제목 자동 생성 (첫 메시지가 있고 제목이 없을 때)
        if (not title or title == "New Chat") and messages:
            first_msg = messages[0].get("content", "")
            title = first_msg[:30].strip() + ("..." if len(first_msg) > 30 else "")

        # 데이터 업데이트
        data["messages"] = messages
        if title: 
            data["title"] = title
        data["updated_at"] = datetime.now().isoformat()
        
        self._save_file(sid, data)

    def delete_session(self, sid: str):
        """세션 파일을 삭제합니다."""
        path = self.history_dir / f"{sid}.json"
        if path.exists():
            os.remove(path)

    # --- 내부 헬퍼 함수 ---
    def _save_file(self, sid: str, data: Dict):
        path = self.history_dir / f"{sid}.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def _load_file(self, sid: str) -> Dict:
        path = self.history_dir / f"{sid}.json"
        if not path.exists():
            # 파일이 없으면 새 세션 구조 반환
            return {
                "id": sid, "title": "New Chat", 
                "messages": [], "updated_at": datetime.now().isoformat()
            }
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

# 전역 인스턴스 (어디서든 import해서 사용)
session_manager = SessionManager()