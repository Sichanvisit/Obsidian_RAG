import logging
from typing import Dict

logger = logging.getLogger("Commander")


class StopSignalManager:
    def __init__(self) -> None:
        self._signals: Dict[str, bool] = {}

    def set(self, session_id: str) -> None:
        self._signals[session_id] = True
        logger.warning(f"🛑 [Signal] Stop requested for {session_id}")

    def check(self, session_id: str) -> bool:
        return self._signals.get(session_id, False)

    def clear(self, session_id: str) -> None:
        if session_id in self._signals:
            del self._signals[session_id]

    def clear_all(self) -> None:
        self._signals.clear()
