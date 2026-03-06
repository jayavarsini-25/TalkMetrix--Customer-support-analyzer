from __future__ import annotations

try:
    from faster_whisper import WhisperModel  # type: ignore
except Exception:
    WhisperModel = None  # type: ignore

model = WhisperModel("base", compute_type="int8") if WhisperModel else None


def transcribe_audio(file_path: str) -> str:
    if model is None:
        return f"Audio uploaded: {file_path.split('/')[-1]}"

    try:
        segments, _ = model.transcribe(file_path)
        transcript = " ".join(segment.text.strip() for segment in segments if segment.text)
        return transcript.strip() or f"Audio uploaded: {file_path.split('/')[-1]}"
    except Exception:
        return f"Audio uploaded: {file_path.split('/')[-1]}"
