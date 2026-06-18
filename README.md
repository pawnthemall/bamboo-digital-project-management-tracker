# BambooDigital Project Management Tracker

A desktop-first, dark-mode CRT terminal themed project management tracker built with Next.js 16 (App Router), TypeScript, Prisma/SQLite, and Tailwind CSS v4.

## Stack

- **Framework:** Next.js 16.2.9 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with custom `@theme inline` colors
- **Database:** SQLite via Prisma ORM
- **Auth:** JWT cookies + argon2 password hashing
- **Charts:** Recharts
- **Theme:** CRT terminal aesthetic (matrix green, scanlines, monospace)

## Features (Phase 1 Complete)

- **Authentication:** Register, login, logout with JWT cookie-based auth and route protection
- **Projects:** Full CRUD with detail pages, task tabs, progress bars, and hour tracking
- **Tasks:** Full CRUD with filters, priority badges, checklist items, and status workflow
- **Timer:** Interactive start/pause/resume/stop/complete timer with localStorage persistence
- **Dashboard:** Real-time stats, Recharts burn-down/pie/bar charts, activity feed, upcoming tasks
- **Reports:** Daily/weekly/monthly reports with project breakdown tables and CSV export
- **Roadmap:** 4-column Kanban board (Backlog, In Progress, Review, Completed)
- **Timeline:** Task list sorted by due date
- **Settings:** Accent color picker, work hours, timezone, JSON data export

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
npx prisma migrate dev
npx prisma db seed

# Start dev server (with nodemon auto-restart)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with the seeded admin credentials from `.env`.

## Deployment (Plesk)

This app is configured for Plesk Node.js deployment:
- `start.js` reads `PORT` from environment and starts Next.js
- Use the **Run Node.js commands** section in Plesk for migrations (`npm run db:migrate`) and seeds (`npm run db:seed`)

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server with nodemon auto-restart |
| `npm run build` | Production build |
| `npm run start` | Start production server via `start.js` |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:generate` | Generate Prisma Client |

## Project Structure

```
src/
  app/              # Next.js App Router pages
    (app)/          # Authenticated routes (dashboard, projects, tasks, etc.)
    (auth)/         # Public routes (login)
    api/            # API routes (auth, projects, tasks, timer, etc.)
  components/       # React components (ProjectCard, TaskCard, TimerWidget, etc.)
  hooks/            # Custom hooks (useTaskTimer)
  lib/              # Utilities (prisma.ts, ledger.ts, auth.ts, password.ts)
  types/            # Shared TypeScript types
prisma/
  schema.prisma     # Database schema
  seed.mjs          # Seed script
docs/
  planning/phase1-plan.md  # Implementation plan
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="file:./prisma/dev.db"
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=yourpassword
JWT_SECRET=your-jwt-secret
```

## Phase 2 Roadmap

- Drag-and-drop Kanban
- Calendar view with date-based task display
- Productivity trend charts
- Excel/PDF export
- Notifications
- Multi-user support

---

See `docs/planning/phase1-plan.md` for the full implementation plan and progress log.
