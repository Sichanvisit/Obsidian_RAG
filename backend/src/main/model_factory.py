import os

from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI


def get_model(config, model_name: str = None):
    target = model_name or config.jobs.local_llm_model
    spec = config.jobs.models.get(target)
    target_lower = str(target).lower()
    is_openai_model = (spec and spec.type == "openai") or target_lower.startswith("gpt-")

    if is_openai_model:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError(f"OPENAI_API_KEY is required for OpenAI model '{target}'.")
        return ChatOpenAI(
            model=target,
            api_key=api_key,
            temperature=float(os.getenv("LLM_TEMPERATURE", "0.2")),
        )

    return ChatOllama(
        model=target,
        base_url=os.getenv("LOCAL_LLM_URL", "http://localhost:11434"),
        temperature=float(os.getenv("LLM_TEMPERATURE", "0.2")),
        num_predict=-1,
        repeat_penalty=1.15,
    )
