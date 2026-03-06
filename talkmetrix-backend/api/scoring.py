from fastapi import APIRouter
from pydantic import BaseModel
from services.llm_service import evaluate_conversation

router = APIRouter()


class TranscriptInput(BaseModel):
    transcript: str


@router.post("/evaluate")
def evaluate(data: TranscriptInput):
    result = evaluate_conversation(data.transcript)
    return result