# Portfolio Monorepo

Full-stack portfolio project with a Next.js frontend and an Express/Drizzle/Postgres backend.

Resume: https://drive.google.com/file/d/1yrVCKMeOyWJxZ5a_nh6sRXC-vnk3ux4P/view

## Stack

- Frontend: Next.js (App Router)
- Backend: Express 5, Drizzle ORM (Postgres)
- Database: PostgreSQL (Docker Compose)
- Package manager: pnpm

## Prerequisites

- Node.js 18+
- pnpm 10+
- Docker Desktop (for Postgres)

## Setup

1. Clone or open this repo.
2. Install deps (root not required):
   - `cd backend && pnpm install`
   - `cd frontend && pnpm install`
3. Copy envs:
   - Backend: `cp backend/.env.example backend/.env` then adjust `DATABASE_URL` and `PORT` if needed.
   - Frontend: create `frontend/.env.local` as needed for API URL (defaults typically to `http://localhost:3001`).

## Architecture

- Frontend (Next.js)
  - Renders the portfolio UI and calls the backend API for profile/projects/skills data.
- Backend (Express)
  - REST API with query endpoints (projects search, top skills, profile details).
- Database (Postgres)
  - Stores one `profiles` row plus related projects, skills, and work experience.

High-level flow:

1. Next.js calls the Express API.
2. Express queries Postgres through Drizzle ORM.
3. API returns JSON for UI rendering.

## Database (local)

- Start Postgres: `cd backend && docker compose up -d db`
- Apply schema: `pnpm run db:push`
- Seed sample data (one profile matching GitHub user Shwetanshu13): `pnpm run db:seed`

## Schema

Tables:

### profiles

- `id` (serial, PK)
- `name` (varchar, required)
- `email` (varchar, required, unique)
- `education` (text)
- `github` (varchar)
- `linkedin` (varchar)
- `portfolio` (varchar, required)

### projects

- `id` (serial, PK)
- `profile_id` (int, FK → profiles.id)
- `title` (varchar, required)
- `description` (text)
- `links` (text[])

### project_skills

- `project_id` (int, FK → projects.id)
- `skill` (varchar, required)
- Primary key: (`project_id`, `skill`)

### work_experience

- `id` (serial, PK)
- `profile_id` (int, FK → profiles.id)
- `company` (varchar, required)
- `role` (varchar, required)
- `duration` (varchar)
- `description` (text)

## Backend

- Location: [backend](backend)
- Key files: [src/index.js](backend/src/index.js), [src/routes/api.js](backend/src/routes/api.js), [src/controllers](backend/src/controllers), [src/db/schema.js](backend/src/db/schema.js), [scripts/seed.js](backend/scripts/seed.js)
- Run dev server: `pnpm run dev` (port 3001 by default)
- API endpoints (JSON):
  - `GET /health`
  - `GET /profiles/:id` (profile with projects, skills, work experience)
  - `GET /projects?skill=python&q=term`
  - `GET /skills/top?limit=10`
  - `GET /search?q=term`

## API Examples (curl)

Assuming backend is running on `http://localhost:3001`:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/profiles/1
curl "http://localhost:3001/projects?q=music"
curl "http://localhost:3001/projects?skill=PostgreSQL"
curl "http://localhost:3001/search?q=Next.js"
curl "http://localhost:3001/skills/top?limit=10"
```

## Postman

- Import the collection: `postman/portfolio-api.postman_collection.json`
- Set the collection variable `baseUrl` (default is `http://localhost:3001`).

## Frontend

- Location: [frontend](frontend)
- Dev server: `pnpm run dev` (Next.js on port 3000)
- Build: `pnpm run build`; Start: `pnpm start`
- Components: [components/](frontend/components)
  - `PortfolioExplorer` — main page layout and state management
  - `ProfileHeader` — name, bio, and social links (Email, GitHub, LinkedIn, Website)
  - `SearchBox` — project search input
  - `SkillChip` — skill filter buttons
  - `ProjectCard` — project display card
  - `WorkCard` — work experience card
  - `utils` — shared helper functions

## Production Setup (example)

This repo doesn’t lock you into a specific provider; these are common options:

- Database: hosted Postgres (e.g., Neon/Supabase/Railway)
- Backend: Render/Railway/Fly.io
- Frontend: Vercel

Minimum environment variables:

- Backend
  - `DATABASE_URL` (hosted Postgres connection string)
  - `PORT` (optional; many platforms set this automatically)

Recommended production notes:

- Put backend behind HTTPS (platform default).
- Add CORS configuration if frontend and backend are on different domains.

## Troubleshooting

- If Postgres will not start, ensure Docker is running and port 5432 is free.
- If Drizzle CLI fails, verify `DATABASE_URL` and run `pnpm run db:push` from `backend/`.
- For dependency script approvals on pnpm, run `pnpm approve-builds` if prompted.

## Known Limitations

- No authentication/authorization (public read API).
- No pagination (project lists can grow without limits).
- Minimal validation/error handling (input validation is intentionally light).
- No rate limiting (not hardened for public internet traffic).
- “Single profile” is an app-level assumption; multiple profiles are technically possible unless you enforce it.
