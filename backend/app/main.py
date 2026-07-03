from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from app.database import engine
from app.routers import trackers, tasks, notes, checklists, projects
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
app.include_router(projects.router)

# Serve static files from built frontend
static_dir = Path(__file__).parent.parent.parent / "frontend" / "dist"
if static_dir.exists():
    # Mount static assets (JS, CSS, images) under /assets
    assets_dir = static_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    # Catch-all: serve index.html for any SPA route (must come after API routers)
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str, request: Request):
        index_file = static_dir / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return JSONResponse({"detail": "Not Found"}, status_code=404)
