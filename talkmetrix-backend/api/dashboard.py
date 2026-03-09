from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime
from statistics import mean

from fastapi import APIRouter, Depends, HTTPException

from db.store import delete_audit, get_audits
from utils.security import require_api_key

router = APIRouter(tags=["dashboard"])


def _as_int(value: object, fallback: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def _parse_suggestions(value: str) -> list[str]:
    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return [str(item) for item in parsed]
    except Exception:
        pass
    return []


def _build_summary(audits: list[dict]) -> dict:
    if not audits:
        return {
            "agents": [],
            "qualityTrend": [],
            "alerts": [],
            "avgScore": 0,
            "avgCompliance": 0,
        }

    avg_score = mean(_as_int(a["score"]) for a in audits)
    avg_compliance = mean(_as_int(a["compliance"]) for a in audits)

    agent_map: dict[str, dict] = defaultdict(
        lambda: {"conversations": 0, "score_total": 0, "compliance_total": 0}
    )
    for audit in audits:
        agent = audit.get("agent", "Unknown Agent")
        item = agent_map[agent]
        item["conversations"] += 1
        item["score_total"] += _as_int(audit.get("score"))
        item["compliance_total"] += _as_int(audit.get("compliance"))

    agents = []
    for agent_name, item in agent_map.items():
        conversations = item["conversations"]
        agents.append(
            {
                "agent": agent_name,
                "score": round(item["score_total"] / conversations),
                "compliance": round(item["compliance_total"] / conversations),
                "conversations": conversations,
            }
        )
    agents.sort(key=lambda a: a["score"], reverse=True)

    last_eight = list(reversed(audits[-8:]))
    quality_trend = [
        {
            "date": datetime.fromisoformat(a["created_at"]).strftime("%b")
            if "T" in a["created_at"]
            else f"Run {idx + 1}",
            "score": _as_int(a["score"]),
            "compliance": _as_int(a["compliance"]),
        }
        for idx, a in enumerate(last_eight)
    ]

    alerts = []
    for audit in audits[:5]:
        score = _as_int(audit.get("score"))
        suggestions = _parse_suggestions(audit.get("suggestions", "[]"))
        message = (
            suggestions[0]
            if suggestions
            else f"Audit completed for {audit.get('conversation_id', 'conversation')}"
        )
        alerts.append(
            {
                "type": "critical" if score < 70 else ("warning" if score < 85 else "info"),
                "message": message,
                "agent": audit.get("agent", "System"),
                "time": "Just now",
            }
        )

    return {
        "agents": agents,
        "qualityTrend": quality_trend,
        "alerts": alerts,
        "avgScore": round(avg_score, 1),
        "avgCompliance": round(avg_compliance, 1),
    }


@router.get("/summary")
def dashboard_summary():
    audits = get_audits()
    return _build_summary(audits)


@router.get("/conversations")
def conversations():
    audits = get_audits()
    items = []
    for audit in audits:
        items.append(
            {
                "id": audit["conversation_id"],
                "agent": audit["agent"],
                "customer": audit["customer"],
                "date": audit["created_at"].split(" ")[0],
                "duration": "00:00",
                "score": _as_int(audit["score"]),
                "compliance": _as_int(audit["compliance"]) >= 85,
                "type": audit.get("source_type", "chat"),
                "summary": audit.get("summary", ""),
                "suggestions": _parse_suggestions(audit.get("suggestions", "[]")),
                "transcript": audit.get("transcript", ""),
            }
        )
    return {"items": items}


@router.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str, _auth: None = Depends(require_api_key)):
    deleted = delete_audit(conversation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"deleted": True, "conversation_id": conversation_id}


@router.get("/analytics")
def analytics():
    audits = get_audits()
    summary = _build_summary(audits)

    agent_bars = []
    for agent in summary["agents"]:
        agent_bars.append(
            {
                "name": agent["agent"],
                "score": agent["score"],
                "compliance": agent["compliance"],
            }
        )

    empathy_trend = []
    for idx, audit in enumerate(list(reversed(audits[-4:]))):
        empathy_trend.append(
            {
                "date": f"Week {idx + 1}",
                "value": _as_int(audit.get("empathy"), 80),
            }
        )

    return {
        "agents": summary["agents"],
        "agentBars": agent_bars,
        "empathyTrend": empathy_trend,
    }


@router.get("/reports")
def reports():
    audits = get_audits()
    items = []
    for idx, audit in enumerate(audits[:20], start=1):
        items.append(
            {
                "id": f"RPT-{idx:03d}",
                "name": f"Audit Report {audit['conversation_id']}",
                "date": audit["created_at"].split(" ")[0],
                "type": "Quality",
                "status": "completed",
                "size": "1.2 MB",
            }
        )
    return {"items": items}
