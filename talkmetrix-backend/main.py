from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from api.dashboard import router as dashboard_router
from api.scoring import router as scoring_router
from api.upload import router as upload_router
from api.ws import router as ws_router
from config import CORS_ORIGIN_REGEX, CORS_ORIGINS, IS_PRODUCTION, TRUSTED_HOSTS
from db.store import init_db
from utils.security import RateLimitMiddleware, SecurityHeadersMiddleware

app = FastAPI(
    title="TalkMetrix API",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=1024)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=TRUSTED_HOSTS)

app.include_router(scoring_router, prefix="/score", tags=["Scoring"])
app.include_router(upload_router, prefix="/upload", tags=["Upload"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(ws_router)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "TalkMetrix Backend Running"}


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}
