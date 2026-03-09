from __future__ import annotations

import time
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Deque

from fastapi import Header, HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

from config import API_AUTH_KEY, RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW_SECONDS


def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    if not API_AUTH_KEY:
        return
    if x_api_key == API_AUTH_KEY:
        return
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized",
    )


@dataclass
class _Bucket:
    timestamps: Deque[float]


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self._hits: dict[str, _Bucket] = defaultdict(lambda: _Bucket(deque()))

    async def dispatch(self, request: Request, call_next):
        if RATE_LIMIT_REQUESTS <= 0:
            return await call_next(request)

        client_host = request.client.host if request.client else "unknown"
        now = time.time()
        bucket = self._hits[client_host].timestamps
        cutoff = now - RATE_LIMIT_WINDOW_SECONDS

        while bucket and bucket[0] < cutoff:
            bucket.popleft()

        if len(bucket) >= RATE_LIMIT_REQUESTS:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded"},
                headers={"Retry-After": str(RATE_LIMIT_WINDOW_SECONDS)},
            )

        bucket.append(now)
        return await call_next(request)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["X-XSS-Protection"] = "0"
        return response
