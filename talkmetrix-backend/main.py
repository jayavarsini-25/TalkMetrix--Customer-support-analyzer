from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.dashboard import router as dashboard_router
from api.scoring import router as scoring_router
from api.upload import router as upload_router
from api.ws import router as ws_router
from db.store import init_db

app = FastAPI(title="TalkMetrix API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
