from __future__ import annotations

import hashlib
import sqlite3
from datetime import UTC, datetime, timedelta
from pathlib import Path
import secrets
from typing import Any

from config import AUTH_TOKEN_TTL_HOURS, DB_PATH as DB_PATH_ENV


class AuthenticationError(ValueError):
    pass

DB_PATH = Path(DB_PATH_ENV).resolve()
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _utc_now() -> datetime:
    return datetime.now(UTC)


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _hash_password(password: str, salt: str | None = None) -> str:
    salt_value = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt_value.encode("utf-8"),
        100_000,
    ).hex()
    return f"{salt_value}${digest}"


def _verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, expected_hash = stored_hash.split("$", maxsplit=1)
    except ValueError:
        return False
    actual_hash = _hash_password(password, salt).split("$", maxsplit=1)[1]
    return secrets.compare_digest(actual_hash, expected_hash)


def _serialize_user(row: sqlite3.Row | dict[str, Any]) -> dict[str, Any]:
    item = dict(row)
    return {
        "id": item["id"],
        "fullName": item["full_name"],
        "email": item["email"],
        "company": item["company"],
        "createdAt": item["created_at"],
    }


def init_db() -> None:
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                company TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
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
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")


def create_user(full_name: str, email: str, password: str, company: str) -> dict[str, Any]:
    normalized_email = _normalize_email(email)
    password_hash = _hash_password(password)
    with _connect() as conn:
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?",
            (normalized_email,),
        ).fetchone()
        if existing:
            raise ValueError("An account with this email already exists.")

        cursor = conn.execute(
            """
            INSERT INTO users (full_name, email, password_hash, company)
            VALUES (?, ?, ?, ?)
            """,
            (full_name.strip(), normalized_email, password_hash, company.strip()),
        )
        user_id = cursor.lastrowid
        row = conn.execute(
            "SELECT id, full_name, email, company, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
    return _serialize_user(row)


def verify_user_credentials(email: str, password: str) -> dict[str, Any]:
    normalized_email = _normalize_email(email)
    with _connect() as conn:
        row = conn.execute(
            """
            SELECT id, full_name, email, company, created_at, password_hash
            FROM users
            WHERE email = ?
            """,
            (normalized_email,),
        ).fetchone()

    if not row or not _verify_password(password, row["password_hash"]):
        raise AuthenticationError("Invalid email or password.")

    return _serialize_user(row)


def create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = (_utc_now() + timedelta(hours=AUTH_TOKEN_TTL_HOURS)).isoformat()
    with _connect() as conn:
        conn.execute(
            "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
            (token, user_id, expires_at),
        )
    return token


def get_user_by_session(token: str) -> dict[str, Any] | None:
    now = _utc_now().isoformat()
    with _connect() as conn:
        conn.execute("DELETE FROM sessions WHERE expires_at <= ?", (now,))
        row = conn.execute(
            """
            SELECT users.id, users.full_name, users.email, users.company, users.created_at
            FROM sessions
            INNER JOIN users ON users.id = sessions.user_id
            WHERE sessions.token = ? AND sessions.expires_at > ?
            """,
            (token, now),
        ).fetchone()

    if not row:
        return None
    return _serialize_user(row)


def delete_session(token: str) -> None:
    with _connect() as conn:
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))


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
