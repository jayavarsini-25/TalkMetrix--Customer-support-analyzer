from __future__ import annotations

from collections.abc import Iterable
from pathlib import Path

try:
    from faster_whisper import WhisperModel  # type: ignore
except Exception:
    WhisperModel = None  # type: ignore

model = WhisperModel("base", compute_type="int8") if WhisperModel else None


def _fallback_transcript(file_path: str) -> str:
    file_name = Path(file_path).name
    return "\n".join(
        [
            f"Agent: Audio uploaded: {file_name}",
            "Customer: Transcription model unavailable for speaker-formatted dialogue.",
        ]
    )


def _flush_turn(dialogue: list[str], speaker: str, parts: list[str]) -> None:
    text = " ".join(part.strip() for part in parts if part and part.strip()).strip()
    if text:
        dialogue.append(f"{speaker}: {text}")
    parts.clear()


def _format_segments_as_dialogue(segments: Iterable[object]) -> str:
    dialogue: list[str] = []
    current_speaker = "Agent"
    parts: list[str] = []
    previous_end: float | None = None

    for segment in segments:
        text = getattr(segment, "text", "").strip()
        if not text:
            continue

        start = float(getattr(segment, "start", 0.0) or 0.0)
        end = float(getattr(segment, "end", start) or start)
        gap = start - previous_end if previous_end is not None else 0.0

        should_switch = bool(parts) and (
            gap >= 1.4 or (gap >= 0.6 and parts[-1].rstrip().endswith((".", "?", "!")))
        )

        if should_switch:
            _flush_turn(dialogue, current_speaker, parts)
            current_speaker = "Customer" if current_speaker == "Agent" else "Agent"

        parts.append(text)
        previous_end = end

        if len(" ".join(parts)) >= 220:
            _flush_turn(dialogue, current_speaker, parts)
            current_speaker = "Customer" if current_speaker == "Agent" else "Agent"

    _flush_turn(dialogue, current_speaker, parts)
    return "\n".join(dialogue)


def transcribe_audio(file_path: str) -> str:
    if model is None:
        return _fallback_transcript(file_path)

    try:
        segments, _ = model.transcribe(
            file_path,
            vad_filter=True,
            beam_size=5,
            condition_on_previous_text=False,
        )
        transcript = _format_segments_as_dialogue(list(segments))
        return transcript.strip() or _fallback_transcript(file_path)
    except Exception:
        return _fallback_transcript(file_path)
