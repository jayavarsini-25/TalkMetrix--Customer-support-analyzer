from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from services.llm_service import evaluate_conversation
from utils.security import require_api_key

router = APIRouter()


class TranscriptInput(BaseModel):
    transcript: str


@router.post("/evaluate")
def evaluate(data: TranscriptInput, _auth: None = Depends(require_api_key)):
    if len(data.transcript) > 200_000:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Transcript too large",
        )
    result = evaluate_conversation(data.transcript)
    return result
