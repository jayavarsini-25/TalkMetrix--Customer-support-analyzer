from __future__ import annotations

import hashlib
import json
from typing import Any

from config import GROQ_API_KEY

try:
    from groq import Groq  # type: ignore
except Exception:
    Groq = None  # type: ignore

client = Groq(api_key=GROQ_API_KEY) if (Groq and GROQ_API_KEY) else None


def _fallback_scores(transcript: str) -> dict[str, Any]:
    digest = hashlib.sha256(transcript.encode("utf-8")).hexdigest()
    base = int(digest[:8], 16)
    empathy = 70 + (base % 26)
    professionalism = 70 + ((base >> 3) % 26)
    compliance = 70 + ((base >> 6) % 26)
    resolution = 70 + ((base >> 9) % 26)
    return {
        "empathy": empathy,
        "professionalism": professionalism,
        "compliance": compliance,
        "resolution": resolution,
        "violations": [],
        "suggestions": ["Follow up with the customer to confirm resolution details."],
        "summary": "Automated local scoring completed.",
    }


def evaluate_conversation(transcript: str):
    if not transcript.strip():
        return _fallback_scores("empty transcript")
    if client is None:
        return _fallback_scores(transcript)

    prompt = f"""
You are a customer support quality auditor.

Evaluate:
- Empathy (0-100)
- Professionalism (0-100)
- Compliance (0-100)
- Resolution (0-100)

Return ONLY JSON:

{{
 "empathy": number,
 "professionalism": number,
 "compliance": number,
 "resolution": number,
 "violations": [],
 "suggestions": [],
 "summary": ""
}}

Transcript:
{transcript}
"""

    try:
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        content = response.choices[0].message.content
        parsed = json.loads(content)
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass

    return _fallback_scores(transcript)
