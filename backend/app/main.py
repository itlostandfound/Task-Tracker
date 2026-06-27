from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine
from app.routers import trackers, tasks, notes, checklists
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Alembic handles table creation ( alembic upgrade head )
    yield
    # Shutdown: dispose engine pool
    await engine.dispose()


app = FastAPI(
    title="Task Tracking Dashboard API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/api/v1/health")
async def health():
    return {"status": "ok"}

# Include routers
app.include_router(trackers.router)
app.include_router(tasks.router)
app.include_router(notes.router)
app.include_router(checklists.router)

# Serve static files from built frontend
static_dir = Path(__file__).parent.parent.parent / "frontend" / "dist"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")
