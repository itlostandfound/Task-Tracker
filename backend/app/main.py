from contextlib import asynccontextmanager
from pathlib import Path
import json
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from app.database import engine
from app.routers import trackers, tasks, notes, checklists, projects
from app.config import settings
from app.deps import verify_token


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

# Health check — unprotected so orchestration tooling doesn't need a token
@app.get("/api/v1/health")
async def health():
    return {"status": "ok"}


# Runtime config for the SPA — unprotected by design (the browser needs the
# token before it can authenticate, so this endpoint bootstraps that).
# Served before the SPA catch-all so it isn't swallowed by index.html.
@app.get("/config.js", response_class=Response)
async def config_js():
    token = settings.api_secret_token
    return Response(
        content=f"window.__API_TOKEN__ = {json.dumps(token)};",
        media_type="application/javascript",
        headers={"Cache-Control": "no-store"},
    )

# Include routers — all protected by Bearer token (see deps.verify_token)
_auth = [Depends(verify_token)]
app.include_router(trackers.router, dependencies=_auth)
app.include_router(tasks.router, dependencies=_auth)
app.include_router(notes.router, dependencies=_auth)
app.include_router(checklists.router, dependencies=_auth)
app.include_router(projects.router, dependencies=_auth)

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
