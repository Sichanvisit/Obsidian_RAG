import asyncio
import logging
import os
import sys
import traceback
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from backend.config.loader import config
from backend.src.constants import MAIN_SYSTEM_PROMPT
from backend.src.graph import AgenticFlow
from backend.src.main import StopSignalManager, get_model, to_json_line
from backend.src.schemas import ChatRequest

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("Commander")
ENABLE_STRATEGY_PLANNER = os.getenv("ENABLE_STRATEGY_PLANNER", "0").lower() in {
    "1",
    "true",
    "yes",
    "on",
}

stop_manager = StopSignalManager()
agent_flow = None
engine_status = "starting"


@asynccontextmanager
async def lifespan(app: FastAPI):
    global agent_flow, engine_status
    try:
        logger.info("시스템 초기화를 시작합니다.")
        engine_status = "loading"

        logger.info("\n" + "=" * 80)
        logger.info("AgenticFlow 엔진 로딩 중...")
        logger.info("=" * 80)
        agent_flow = AgenticFlow()
        logger.info("=" * 80 + "\n")

        engine_status = "ready"
        logger.info("엔진 준비 완료")

        logger.info("인덱스 상태 점검")
        logger.info(f"   - RAW files indexed: {agent_flow.engine.file_count}")

        summary_status = "Not Ready"
        summary_count = 0
        try:
            summary_db = getattr(agent_flow.engine, "summary_db", None)
            if summary_db is not None:
                if hasattr(summary_db, "count") and callable(summary_db.count):
                    summary_count = summary_db.count()
                    summary_status = "Ready"
                elif hasattr(summary_db, "_collection") and hasattr(
                    summary_db._collection, "count"
                ):
                    summary_count = summary_db._collection.count()
                    summary_status = "Ready"
                else:
                    summary_status = "Unknown Type"
        except Exception:
            summary_status = "Error"
        logger.info(f"   - Summary DB: {summary_status} ({summary_count} docs)")

        reranker_status = "Not Available"
        if hasattr(agent_flow.engine, "reranker") and agent_flow.engine.reranker:
            reranker_status = "Ready"
        logger.info(f"   - Reranker: {reranker_status}")
        logger.info(f"   - Strategy Planner: {'ON' if ENABLE_STRATEGY_PLANNER else 'OFF'}")
        logger.info("")

    except Exception as e:
        logger.error(f"엔진 초기화 실패: {e}", exc_info=True)
        engine_status = "error"

    yield
    stop_manager.clear_all()
    logger.info("서버 종료: 세션 stop 신호를 정리했습니다.")


app = FastAPI(title="Obsidian RAG Commander", lifespan=lifespan)


class StopRequest(BaseModel):
    session_id: str


@app.get("/health")
def health_check():
    return {"status": "ok", "engine": engine_status}


@app.post("/api/chat/stop")
async def stop_generation(
    req: Optional[StopRequest] = None,
    session_id: Optional[str] = Query(default=None),
):
    """스트리밍 생성 중단 요청을 처리한다."""
    target_session_id = req.session_id if req and req.session_id else session_id
    if not target_session_id:
        raise HTTPException(status_code=422, detail="session_id is required")

    stop_manager.set(target_session_id)
    return {"status": "stopped", "session_id": target_session_id}


@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """질문에 대해 전략 수립(옵션) 후 AgenticFlow 스트리밍 결과를 반환한다."""
    if engine_status != "ready":
        raise HTTPException(status_code=503, detail="System warming up...")

    session_id = request.session_id or str(uuid.uuid4())
    stop_manager.clear(session_id)
    logger.info(f"[CHAT START] session={session_id} query={request.query[:120]}")

    async def event_generator():
        try:
            model = get_model(config, request.model_name)
            strategy_text = ""

            if ENABLE_STRATEGY_PLANNER:
                yield to_json_line({"step": "thinking", "logs": ["전략 계획 생성 중..."]})
                strategy_prompt = f"""
                {MAIN_SYSTEM_PROMPT}

                [임무]
                사용자 질문: "{request.query}"

                질문에 대해 RAG 그래프 실행 전략을 3줄 이내로 제시하라.
                """
                try:
                    res = await model.ainvoke(strategy_prompt)
                    strategy_text = res.content if hasattr(res, "content") else str(res)
                except Exception as e:
                    logger.warning(f"strategy planner failed, fallback to empty strategy: {e}")
                    strategy_text = ""

            iterator = agent_flow.run(
                query=request.query,
                project_name=request.project_name,
                llm=model,
                strategy=strategy_text,
                history=request.history,
            )

            for update in iterator:
                if stop_manager.check(session_id):
                    yield to_json_line(
                        {"step": "stopped", "answer": "사용자 요청으로 생성을 중단했습니다."}
                    )
                    return

                yield to_json_line(update)
                await asyncio.sleep(0)

        except Exception as e:
            logger.error(f"chat_stream error: {e}")
            traceback.print_exc()
            yield to_json_line({"step": "error", "answer": str(e)})
        finally:
            stop_manager.clear(session_id)

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")


if __name__ == "__main__":
    import uvicorn

    backend_port = int(os.getenv("BACKEND_PORT", "8000"))
    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=backend_port,
        reload=False,
        timeout_keep_alive=300,
    )
