import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict

import yaml

from backend.config.paths import RAW_DATA_DIR, VECTOR_DB_PATH

BASE_DIR = Path(__file__).parent


@dataclass
class ModelSpec:
    type: str = "ollama"
    max_tokens: int = 4096


@dataclass
class JobConfig:
    vector_db_path: Path = VECTOR_DB_PATH
    raw_data_path: Path = RAW_DATA_DIR
    embedding_model: str = os.getenv("EMBEDDING_MODEL_NAME", "BAAI/bge-m3")
    local_llm_model: str = os.getenv("LOCAL_LLM_MODEL", "qwen2.5-coder:3b")
    models: Dict[str, ModelSpec] = field(
        default_factory=lambda: {
            "qwen2.5-coder:3b": ModelSpec(type="ollama"),
            "gpt-4o": ModelSpec(type="openai"),
            "gpt-5-mini": ModelSpec(type="openai"),
            "gpt-5-nano": ModelSpec(type="openai"),
        }
    )


class AppConfig:
    def __init__(self):
        self.jobs = JobConfig()
        self._load_yaml_if_exists()

    def _load_yaml_if_exists(self):
        yaml_path = BASE_DIR / "jobs.yaml"
        if not yaml_path.exists():
            return

        try:
            with open(yaml_path, encoding="utf-8") as f:
                data = yaml.safe_load(f) or {}
        except Exception as e:
            print(f"YAML Load Error: {e}")
            return

        defaults = data.get("defaults", {}) if isinstance(data, dict) else {}
        default_model = defaults.get("model")
        if isinstance(default_model, str) and default_model.strip():
            self.jobs.local_llm_model = default_model.strip()

        models_data = data.get("models", {}) if isinstance(data, dict) else {}
        if not isinstance(models_data, dict):
            return

        for model_name, spec in models_data.items():
            if not isinstance(model_name, str) or not model_name.strip():
                continue

            if isinstance(spec, dict):
                model_type = str(spec.get("type", "ollama")).strip().lower() or "ollama"
                max_tokens_raw = spec.get("max_tokens", 4096)
                try:
                    max_tokens = int(max_tokens_raw)
                except (TypeError, ValueError):
                    max_tokens = 4096
            else:
                model_type = "ollama"
                max_tokens = 4096

            self.jobs.models[model_name.strip()] = ModelSpec(
                type=model_type,
                max_tokens=max_tokens,
            )


config = AppConfig()
