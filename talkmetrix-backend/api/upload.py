from __future__ import annotations

import json
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse

from db.store import add_audit
from services.llm_service import evaluate_conversation
from services.whisper_service import transcribe_audio
from utils.ws_manager import manager

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _build_agent_from_filename(filename: str) -> str:
    stem = Path(filename).stem.replace("_", " ").replace("-", " ").strip()
    return stem.title() if stem else "Agent Unknown"


def _normalize_eval(result: dict) -> dict:
    empathy = int(result.get("empathy", 80))
    professionalism = int(result.get("professionalism", 80))
    compliance = int(result.get("compliance", 80))
    resolution = int(result.get("resolution", 80))
    score = round((empathy + professionalism + compliance + resolution) / 4)
    return {
        "empathy": empathy,
        "professionalism": professionalism,
        "compliance": compliance,
        "resolution": resolution,
        "score": score,
        "summary": str(result.get("summary", "Audit completed")),
        "violations": result.get("violations", []),
        "suggestions": result.get("suggestions", []),
    }


def _persist_audit(
    filename: str,
    source_type: str,
    transcript: str,
    evaluation: dict,
    agent_id: str | None = None,
    agent_name: str | None = None,
) -> str:
    conversation_id = f"CONV-{uuid.uuid4().hex[:6].upper()}"
    cleaned_id = (agent_id or "").strip()
    cleaned_name = (agent_name or "").strip()
    if cleaned_id and cleaned_name:
        resolved_agent = f"{cleaned_id} - {cleaned_name}"
    elif cleaned_id:
        resolved_agent = cleaned_id
    elif cleaned_name:
        resolved_agent = cleaned_name
    else:
        resolved_agent = _build_agent_from_filename(filename)

    add_audit(
        {
            "conversation_id": conversation_id,
            "filename": filename,
            "source_type": source_type,
            "agent": resolved_agent,
            "customer": "Customer",
            "score": evaluation["score"],
            "compliance": evaluation["compliance"],
            "empathy": evaluation["empathy"],
            "professionalism": evaluation["professionalism"],
            "resolution": evaluation["resolution"],
            "summary": evaluation["summary"],
            "transcript": transcript,
            "violations": json.dumps(evaluation["violations"]),
            "suggestions": json.dumps(evaluation["suggestions"]),
        }
    )
    return conversation_id


@router.post("/audio")
async def upload_audio(
    file: UploadFile = File(...),
    agent_id: str | None = Form(None),
    agent_name: str | None = Form(None),
):
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    transcript = transcribe_audio(str(file_path))
    evaluation = _normalize_eval(evaluate_conversation(transcript))
    conversation_id = _persist_audit(
        file.filename, "call", transcript, evaluation, agent_id, agent_name
    )

    await manager.broadcast({"event": "audit_uploaded", "conversation_id": conversation_id})
    return JSONResponse(
        {
            "conversation_id": conversation_id,
            "filename": file.filename,
            "transcript": transcript,
            "evaluation": evaluation,
        }
    )


@router.post("/chat")
async def upload_chat(
    file: UploadFile = File(...),
    agent_id: str | None = Form(None),
    agent_name: str | None = Form(None),
):
    content = await file.read()
    transcript = content.decode("utf-8", errors="replace")
    evaluation = _normalize_eval(evaluate_conversation(transcript))
    conversation_id = _persist_audit(
        file.filename, "chat", transcript, evaluation, agent_id, agent_name
    )

    await manager.broadcast({"event": "audit_uploaded", "conversation_id": conversation_id})
    return {
        "conversation_id": conversation_id,
        "filename": file.filename,
        "transcript": transcript,
        "evaluation": evaluation,
    }
