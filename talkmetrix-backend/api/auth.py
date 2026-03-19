from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, Field

from db.store import (
    AuthenticationError,
    create_session,
    create_user,
    delete_session,
    verify_user_credentials,
)
from utils.security import require_authenticated_user

router = APIRouter(tags=["auth"])


class SignUpPayload(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    company: str = Field(min_length=2, max_length=120)


class SignInPayload(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)


def _extract_bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        return None
    return token.strip()


@router.post("/signup")
def sign_up(payload: SignUpPayload):
    try:
        user = create_user(
            full_name=payload.full_name,
            email=payload.email,
            password=payload.password,
            company=payload.company,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    token = create_session(user["id"])
    return {"token": token, "user": user}


@router.post("/login")
def login(payload: SignInPayload):
    try:
        user = verify_user_credentials(payload.email, payload.password)
    except AuthenticationError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    token = create_session(user["id"])
    return {"token": token, "user": user}


@router.get("/me")
def me(user=Depends(require_authenticated_user)):
    return {"user": user}


@router.post("/logout")
def logout(authorization: str | None = Header(default=None)):
    token = _extract_bearer_token(authorization)
    if token:
        delete_session(token)
    return {"success": True}
