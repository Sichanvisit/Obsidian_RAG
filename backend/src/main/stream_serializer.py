import json
import logging
from typing import Any

logger = logging.getLogger("Commander")


def to_json_line(data: Any) -> str:
    try:
        payload = data.dict() if hasattr(data, "dict") else data
        return json.dumps(payload, ensure_ascii=False) + "\n"
    except Exception as e:
        logger.error(f"JSON Error: {e}")
        return json.dumps({"error": "Serialization Error"}, ensure_ascii=False) + "\n"
