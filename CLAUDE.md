# Task Tracking Dashboard — Project Context

## Tech Stack
- Frontend: React 18 + TypeScript + Vite + TailwindCSS + Zustand + TanStack Query + TipTap + React Router v6 + Axios + date-fns + React Hook Form + Zod
- Backend: FastAPI (Python 3.12) + SQLAlchemy 2.0 + Alembic + asyncpg
- DB: PostgreSQL 16
- Infra: Docker + Docker Compose

## Key Conventions
- All API endpoints prefixed with /api/v1
- All DB timestamps in UTC
- Dark mode by default (slate-950 background, slate-900 surfaces, blue-400 accents)
- UUID primary keys (gen_random_uuid())
- JSONB for TipTap content in notes
- No auth system in v1 (single-user/shared access)
