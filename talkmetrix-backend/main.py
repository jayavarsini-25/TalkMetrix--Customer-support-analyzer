from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from api.dashboard import router as dashboard_router
from api.scoring import router as scoring_router
from api.upload import router as upload_router
from api.ws import router as ws_router
from config import IS_PRODUCTION
from db.store import init_db
from utils.security import RateLimitMiddleware, SecurityHeadersMiddleware

app = FastAPI(
    title="TalkMetrix API",
    docs_url="/docs",      # enabled for testing
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ✅ CORS (allow frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # you can restrict later
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Security + performance
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=1024)

# ✅ FIXED: Trusted hosts (important for Render)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]   # allows onrender domain
)

# ✅ Routes
app.include_router(scoring_router, prefix="/score", tags=["Scoring"])
app.include_router(upload_router, prefix="/upload", tags=["Upload"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(ws_router)

# ✅ Startup
@app.on_event("startup")
def on_startup() -> None:
    init_db()

# ✅ Test routes
@app.get("/")
def root() -> dict[str, str]:
    return {"message": "TalkMetrix Backend Running"}

@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}
