# BambooDigital Project Management Tracker

A desktop-first, dark-mode CRT terminal themed project management tracker built with Next.js 16 (App Router), TypeScript, Prisma/SQLite, and Tailwind CSS v4. This project was built entirely with Kimi K2.6 on a Thursday afternoon in June 2026 to help keep my web development work on track, or rather to keep me on track of the work. Kimi K2.6 is currently offered for free in Devin IDE so I wanted to see what it could do. Very impressed. Fast, minimal mistakes, and very clean code. I think I rank it over SWE1.6 in terms of intelligence and code quality.

## Stack

- **Framework:** Next.js 16.2.9 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with custom `@theme inline` colors
- **Database:** SQLite via Prisma ORM
- **Auth:** JWT cookies + argon2 password hashing
- **Charts:** Recharts
- **Theme:** CRT terminal aesthetic (matrix green, scanlines, monospace)

## Features

### Phase 1

- **Authentication:** Register, login, logout with JWT cookie-based auth and route protection
- **Projects:** Full CRUD with detail pages, task tabs, progress bars, and hour tracking
- **Tasks:** Full CRUD with filters, priority badges, checklist items, and status workflow
- **Timer:** Interactive start/pause/resume/stop/complete timer with localStorage persistence
- **Dashboard:** Real-time stats, Recharts burn-down/pie/bar charts, activity feed, upcoming tasks
- **Reports:** Daily/weekly/monthly reports with project breakdown tables and CSV export
- **Board:** Kanban board with drag-and-drop columns
- **Timeline:** Task list sorted by due date
- **Settings:** Accent color picker, work hours, timezone, JSON data export

### Phase 2

- **PWA:** Service worker with offline fallback, installable manifest, PWA icons
- **State Management:** Zustand stores (app state, timer state, toast system) with localStorage persistence
- **Data Fetching:** React Query hooks for projects, tasks, dashboard, reports, analytics with automatic invalidation
- **UI Polish:** Framer Motion page transitions, Command Palette (Ctrl+K), Error Boundary, Toast notifications
- **Kanban:** 5-column drag-and-drop (Backlog, Planned, In Progress, Review, Completed) with status sync via React DnD
- **Calendar:** Month/week/day calendar view with project-colored task events, powered by react-big-calendar
- **Analytics:** Productivity trend charts, velocity charts (estimated vs actual), completion rate area charts
- **Export:** CSV and Excel (.xlsx) export from Reports page with date range picker
- **Multi-User:** Prisma schema extended with User roles (ADMIN/MEMBER), Project membership, Task assignment, Time entry tracking per user
- **Admin:** Users management page for ADMIN role

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

## Phase 2 Roadmap (Complete)

- [x] PWA (service worker, offline support, installability)
- [x] State Management (Zustand stores with persistence)
- [x] React Query data fetching with mutations
- [x] Toast notification system
- [x] Framer Motion page transitions
- [x] Command Palette (Ctrl+K)
- [x] Error Boundary
- [x] Drag-and-drop Kanban (5 columns)
- [x] Calendar view with date-based task display
- [x] Productivity trend charts + velocity + completion rate
- [x] Excel/CSV export with date range picker
- [x] Multi-user support (roles, project membership, task assignment)
- [x] Admin users page

## Next Steps

- PDF export (jsPDF + html2canvas)
- JSON data import
- Email notifications
- Webhook integrations (GitHub, Slack)

---

See `docs/planning/phase1-plan.md` for the full Phase 1 implementation plan.
