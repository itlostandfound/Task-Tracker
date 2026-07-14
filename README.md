# Task Tracker

A versatile, elegant task tracking dashboard and organizer built with modern web technologies. Designed to help you manage projects, efforts, and initiatives with a royal aesthetic.  It's Royal because you are the King or Queen in this Realm!  Manage it like you rule a kingdom and want to keep things in order.

## About

Task Tracker is a full-stack web application that provides a comprehensive solution for organizing and tracking tasks across multiple projects or efforts. Whether you're managing work initiatives, personal projects, or any other tracking needs, Task Tracker offers a clean, intuitive interface with powerful organizational features.

The application is built with a flexible architecture that separates concerns into:

- **Backend API**: A fast, async-first REST API built with FastAPI and PostgreSQL
- **Frontend Dashboard**: A modern React + TypeScript interface with Tailwind CSS styling
- **Database**: PostgreSQL 16 with SQLAlchemy ORM and Alembic migrations for schema management
- **Deployment**: Docker + Docker Compose with optional Traefik reverse proxy for HTTPS

## Key Features

- **Multiple Tracker Support**: Create and manage multiple trackers (projects, efforts, initiatives)
  - Task titles with severity levels (1–10, color-coded green → red)
  - Completion tracking with toggle checkbox
  - Drag-and-drop task reordering
  - Rich text notes per task with title and date tracking

- **Dynamic Checklists**: Create reusable checklist templates with:
  - Templating and cloning for rapid multi-device/item deployment
  - Hierarchical steps with text and command step types
  - Copy-to-clipboard for command steps with optional display text labels
  - Hide/show command functionality
  - Completion tracking with timestamps and audit/completion reports

- **Projects**: Manage complex multi-step projects with:
  - Ordered steps with a full TipTap rich-text editor per step
  - Code block support with syntax highlighting and copy-to-clipboard
  - Per-step references for storing hyperlinks with title and description
  - Drag-to-reorder steps
  - Step completion toggling with auto-expand to next incomplete step
  - Progress bar and completion badge on the project tile listing
  - Incomplete-only filter and full-text search

- **API Security**: Bearer token authentication on all API endpoints
  - Single `API_SECRET_TOKEN` env var — no secrets baked into the Docker image
  - Runtime token injection via `/config.js` serves the token to the browser at startup
  - MCP-ready design: the same token is used by any MCP server or direct API consumer

- **Responsive Design**: Beautiful, dark-themed UI with a royal aesthetic
- **Real-time Updates**: TanStack Query for efficient data fetching and cache management
- **Type-Safe**: Full TypeScript implementation on the frontend; Pydantic schemas on the backend

## Tech Stack

### Backend

- **FastAPI** — Modern, fast async web framework for building APIs
- **SQLAlchemy 2.0** — Async SQL toolkit and ORM
- **asyncpg** — High-performance async PostgreSQL driver
- **Alembic** — Database migration tool
- **Uvicorn** — ASGI server
- **Pydantic v2** — Data validation using Python type hints
- **PostgreSQL 16** — Primary database (SQLite supported for local development)

### Frontend

- **React 18** — UI library
- **TypeScript** — Type-safe JavaScript
- **Vite** — Next generation frontend tooling
- **Tailwind CSS** — Utility-first CSS framework
- **TipTap** — Rich-text editor (notes, project step content, code blocks)
- **@dnd-kit** — Drag-and-drop for task and step reordering
- **React Router v6** — Client-side routing
- **TanStack Query** — Server state management and caching
- **Zustand** — Client state management
- **Axios** — HTTP client
- **date-fns** — Date formatting utilities
- **React Hot Toast** — Toast notifications

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- npm or yarn
- PostgreSQL 16 (or Docker)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/itlostandfound/Task-Tracker.git
   cd Task-Tracker
   ```

2. **Set up Python environment**

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install backend dependencies**

   ```bash
   pip install -r backend/requirements.txt
   ```

4. **Configure environment**

   ```bash
   cp env.example.txt .env
   # Edit .env with your configuration — see the Configuration section below
   ```

5. **Apply database migrations**

   ```bash
   cd backend
   alembic upgrade head
   cd ..
   ```

6. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Running the Application

#### Development Mode

**Terminal 1 — Backend API**

```bash
source .venv/bin/activate
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend Dev Server**

```bash
cd frontend
npm run dev
```

The application will be available at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs *(only available when `DEBUG=true`)*

#### Docker Deployment

The recommended production deployment uses Docker Compose:

```bash
# Copy and configure your environment file
cp env.example.txt .env
# Edit .env — set POSTGRES_PASSWORD, API_SECRET_TOKEN, CORS_ORIGINS, etc.

# Build and start all services
docker compose up -d

# Apply database migrations (first run only)
docker compose exec app alembic upgrade head
```

For HTTPS with automatic TLS via Traefik:

```bash
docker compose -f compose.traefik.yml up -d
```

The Docker image is also published to DockerHub:

```bash
docker pull itlostandfound/task-tracker:latest
```

#### Production Build (without Docker)

**Frontend:**

```bash
cd frontend
npm run build
```

**Backend:**

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Project Structure

```
Task-Tracker/
├── backend/
│   ├── alembic/              # Database migrations
│   │   └── versions/         # Migration files (001_initial, 002_checklists, 003_projects)
│   ├── app/
│   │   ├── main.py           # FastAPI application entry point
│   │   ├── models.py         # SQLAlchemy ORM models
│   │   ├── schemas.py        # Pydantic request/response schemas
│   │   ├── crud.py           # Database operations
│   │   ├── deps.py           # Shared dependencies (DB session, auth)
│   │   ├── config.py         # Application settings (pydantic-settings)
│   │   └── routers/          # trackers, tasks, notes, checklists, projects
│   ├── requirements.txt      # Python dependencies
│   └── alembic.ini           # Alembic configuration
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios instance and base config
│   │   ├── components/       # Shared React components
│   │   ├── hooks/            # TanStack Query hooks per feature
│   │   ├── pages/            # Page components
│   │   ├── stores/           # Zustand state stores
│   │   ├── types.ts          # TypeScript type definitions
│   │   └── App.tsx           # Main app component and routes
│   ├── index.html            # Entry HTML (loads /config.js for runtime token)
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite configuration
├── images/                   # Screenshots for README
├── Features/                 # Feature PRDs and implementation plans
├── docker-compose.yml        # Docker Compose for production
├── compose.traefik.yml       # Docker Compose with Traefik HTTPS
├── Dockerfile                # Application container definition
├── env.example.txt           # Environment variable reference
└── README.md                 # This file
```

## API Documentation

All API endpoints require a Bearer token unless otherwise noted. Include the token on every request:

```http
Authorization: Bearer <your-api-secret-token>
```

Interactive API documentation (Swagger UI and ReDoc) is available at `/docs` and `/redoc` **only when `DEBUG=true`** (local development). It is disabled in production.

### Trackers

- `GET /api/v1/trackers` — List all trackers
- `POST /api/v1/trackers` — Create a new tracker
- `GET /api/v1/trackers/{id}` — Get tracker details with tasks
- `PATCH /api/v1/trackers/{id}` — Update a tracker
- `DELETE /api/v1/trackers/{id}` — Delete a tracker

### Tasks

- `GET /api/v1/trackers/{id}/tasks` — List tasks for a tracker
- `POST /api/v1/trackers/{id}/tasks` — Create a task
- `PATCH /api/v1/tasks/{id}` — Update a task
- `DELETE /api/v1/tasks/{id}` — Delete a task

### Notes

- `GET /api/v1/tasks/{id}/notes` — List notes for a task
- `POST /api/v1/tasks/{id}/notes` — Create a note
- `GET /api/v1/notes/{id}` — Get a note
- `PATCH /api/v1/notes/{id}` — Update a note
- `DELETE /api/v1/notes/{id}` — Delete a note

### Checklists

- `GET /api/v1/checklists` — List all checklists (filters: `is_template`, `search`)
- `POST /api/v1/checklists` — Create a new checklist or template
- `GET /api/v1/checklists/{id}` — Get checklist details
- `PUT /api/v1/checklists/{id}` — Update a checklist (items, steps, completion)
- `DELETE /api/v1/checklists/{id}` — Delete a checklist
- `POST /api/v1/checklists/{id}/clone` — Clone a template with device list
- `POST /api/v1/checklists/undo` — Undo the last deletion

### Projects

- `GET /api/v1/projects` — List all projects (filters: `incomplete`, `search`)
- `POST /api/v1/projects` — Create a new project
- `GET /api/v1/projects/{id}` — Get project with all steps and references
- `PATCH /api/v1/projects/{id}` — Update project title
- `DELETE /api/v1/projects/{id}` — Delete a project

**Steps:**

- `GET /api/v1/projects/{id}/steps` — List steps for a project
- `POST /api/v1/projects/{id}/steps` — Add a step
- `PATCH /api/v1/projects/{id}/steps/reorder` — Reorder steps
- `PATCH /api/v1/projects/{id}/steps/{step_id}` — Update step title or content
- `PATCH /api/v1/projects/{id}/steps/{step_id}/complete` — Toggle step completion
- `DELETE /api/v1/projects/{id}/steps/{step_id}` — Delete a step

**References:**

- `GET /api/v1/projects/{id}/steps/{step_id}/references` — List references for a step
- `POST /api/v1/projects/{id}/steps/{step_id}/references` — Add a reference
- `PATCH /api/v1/projects/{id}/steps/{step_id}/references/{ref_id}` — Update a reference
- `DELETE /api/v1/projects/{id}/steps/{step_id}/references/{ref_id}` — Delete a reference

### Unprotected Endpoints

- `GET /api/v1/health` — Health check (no token required)
- `GET /config.js` — Runtime browser config (no token required — bootstraps frontend auth)

## Configuration

Copy `env.example.txt` to `.env` and fill in the values. The full reference with comments is in that file. Key variables:

```env
# PostgreSQL credentials (used by Docker Compose)
POSTGRES_DB=taskdb
POSTGRES_USER=taskdb
POSTGRES_PASSWORD=your_secure_password_here   # openssl rand -hex 32

# Application settings
ENVIRONMENT=production
DEBUG=false       # Set to true in local dev to enable /docs and verbose errors

# CORS — must match the domain the browser loads the app from
CORS_ORIGINS=["https://your-domain.com"]

# API Bearer token — protects all /api/v1/* endpoints
# Generate with: openssl rand -hex 32
# Used by the backend to validate requests and served to the frontend via /config.js
API_SECRET_TOKEN=your_secure_token_here

# Traefik domain (only needed for compose.traefik.yml)
APP_DOMAIN=your-domain.com
```

## Database Migrations

Schema is managed with Alembic. All migrations run automatically on Docker startup. For manual control:

```bash
cd backend

# Apply all pending migrations
alembic upgrade head

# Create a new migration after model changes
alembic revision --autogenerate -m "Description of changes"

# Rollback last migration
alembic downgrade -1
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Version History

### v1.0 - Task Tracking Foundation

- Multiple tracker support (projects, efforts, initiatives)
- Task management with severity levels (1–10, color-coded green → red)
- Drag-and-drop task reordering
- Completion tracking with toggle checkbox
- Rich text notes system with title and date tracking
- Dark-themed UI with royal aesthetic

### v2.0 - Checklist System

- Dynamic checklist feature with reusable template support
- Checklist cloning for rapid multi-device/item deployment
- Hierarchical steps with text and command step types
- Copy-to-clipboard for command steps with optional display text labels
- Hide/show command functionality
- Completion tracking with timestamps and audit/completion reports

### v3.0.0 - Projects & API Security

- Projects feature with full CRUD — create, edit, delete, and list projects
- Ordered steps with TipTap rich-text content editor per step
- Code block support with syntax highlighting and copy-to-clipboard in step content
- Per-step references section for storing hyperlinks with title and description
- Drag-to-reorder steps within a project
- Step completion toggling with auto-expand to next incomplete step
- Progress bar and completion badge on project tiles
- Incomplete-only filter and search on the projects listing page
- Bearer token API authentication — all endpoints protected via `Authorization: Bearer`
- Runtime token injection via `/config.js` — no secrets baked into the Docker image
- MCP-ready API design with full CRUD endpoints for all resources

![Task Tracker Dashboard v3](./images/Task-Tracker.v3.png)

### v3.0.1 – v3.0.5 - Fixes & Release Automation

- Fixed project step 500 errors and added a favicon
- Fixed favicon serving, detail page width, and step editor height
- `create_project_step` now persists `content`/`content_text` when provided at creation time, instead of requiring a follow-up update call
- Fixed switching between trackers leaving the Notes panel or note editor modal showing the previously-selected tracker's data
- Docker publish workflow now triggers on `vX.Y.Z` tag pushes, with the image version derived from the tag — replacing the old hardcoded `VERSION` string that had to be bumped by hand each release
- Removed the hardcoded version number from the sidebar crest, which had fallen out of sync with the actual release version

## Co-Authored By

- **Claude (Sonnet 4.6)** - AI assistant by Anthropic
- **Hermes Agent** - Collaborative agent for architectural decisions and multi-phase implementation