from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any

from config import DB_PATH as DB_PATH_ENV

DB_PATH = Path(DB_PATH_ENV).resolve()
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS audits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id TEXT NOT NULL UNIQUE,
                filename TEXT,
                source_type TEXT NOT NULL,
                agent TEXT NOT NULL,
                customer TEXT NOT NULL,
                score INTEGER NOT NULL,
                compliance INTEGER NOT NULL,
                empathy INTEGER NOT NULL,
                professionalism INTEGER NOT NULL,
                resolution INTEGER NOT NULL,
                summary TEXT NOT NULL,
                transcript TEXT NOT NULL,
                violations TEXT NOT NULL,
                suggestions TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )


def add_audit(audit: dict[str, Any]) -> None:
    with _connect() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO audits (
                conversation_id,
                filename,
                source_type,
                agent,
                customer,
                score,
                compliance,
                empathy,
                professionalism,
                resolution,
                summary,
                transcript,
                violations,
                suggestions
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                audit["conversation_id"],
                audit.get("filename"),
                audit["source_type"],
                audit["agent"],
                audit["customer"],
                int(audit["score"]),
                int(audit["compliance"]),
                int(audit["empathy"]),
                int(audit["professionalism"]),
                int(audit["resolution"]),
                audit["summary"],
                audit["transcript"],
                audit["violations"],
                audit["suggestions"],
            ),
        )


def get_audits() -> list[dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM audits ORDER BY datetime(created_at) DESC, id DESC"
        ).fetchall()
    return [dict(row) for row in rows]


def delete_audit(conversation_id: str) -> bool:
    with _connect() as conn:
        cursor = conn.execute(
            "DELETE FROM audits WHERE conversation_id = ?",
            (conversation_id,),
        )
    return cursor.rowcount > 0
