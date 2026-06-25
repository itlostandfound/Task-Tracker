# Task Tracking Dashboard - Frontend

React 18 + TypeScript frontend for the Task Tracking Dashboard.

## Setup

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` requests to `http://localhost:8000`.

## Build

```bash
npm run build
npm run preview
```

## Environment

Copy `.env.example` to `.env.local` and adjust as needed:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Docker

```bash
docker build -t task-tracking-frontend .
docker run -p 80:80 task-tracking-frontend
```

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Router v6 (routing)
- Zustand (client state)
- TanStack Query (server state)
- Axios (HTTP client)
- TipTap (rich text editor)
- React Hook Form + Zod (form validation)
- Lucide React (icons)
- react-hot-toast (notifications)
