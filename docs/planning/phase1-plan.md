# BambooDigital Project Management Tracker — Phase 1 Implementation Plan

Build a desktop-first, dark-mode CRT terminal themed project management tracker using Next.js (App Router), TypeScript, Prisma/SQLite, and a focused Phase 1 feature set.

---

## Chunk 1: Project Scaffold & Theme Foundation — **COMPLETED**

**Goal:** Working Next.js app with the CRT terminal theme and layout shell.

- ✅ Initialize Next.js 16 + TypeScript + Tailwind CSS v4 (`src/` directory, `pnpm`)
- ✅ Configure custom colors: matrix green (`#00ff66`), purple, red, orange, blue, cyan; zero border-radius globally via `@theme inline`
- ✅ Global dark-mode styles: scanline overlay, blinking cursor utility, monospace font stack, CRT glow effects (`text-glow`, `border-glow`)
- ✅ Install core dependencies: `framer-motion`, `zustand`, `@tanstack/react-query`, `recharts`, `react-hook-form`, `zod`, `dayjs`, `@prisma/client`, `prisma`, `argon2`
- ✅ Create root layout with sidebar navigation: Dashboard, Projects, Board, Timeline, Tasks, Reports, Calendar, Settings
- ✅ Build `Sidebar` component with active-state styling and route links
- ✅ Create placeholder pages for all 8 routes with CRT styling
- ✅ Create login page with CRT styling (in `(auth)` group)
- ✅ `start.js` wrapper for Plesk Node.js deployment (reads `PORT` from env)
- ✅ Build passes cleanly (`next build` succeeds)
- ✅ Nodemon auto-restart built into `npm run dev`
- ✅ Custom SVG icon (`bd-icon.svg`) placed next to BambooDigital title in sidebar

**Not yet:** Framer Motion page transitions, `TopBar`, `PageContainer`, `Card` reusable components.

**Test milestone:** App starts, sidebar renders, navigation works, theme looks correct. ✅

---

## Chunk 2: Database Schema & Prisma Setup — **COMPLETED**

**Goal:** SQLite schema with ActivityLedger foundation and seed data.

- ✅ Prisma configured with SQLite provider
- ✅ Full schema defined: `User`, `Project`, `Task`, `TimeEntry`, `ChecklistItem`, `ActivityLedger`
- ✅ Initial migration run (`prisma migrate dev`)
- ✅ `src/lib/prisma.ts` singleton created
- ✅ `src/lib/ledger.ts` helper: `createLedgerEvent()` for immutable activity logging
- ✅ Seed script (`prisma/seed.mjs`) with realistic data:
  - 1 self-tracking project: "Bamboo Digital PM Tracker"
  - 14 tasks (10 COMPLETED Phase 1 tasks, 4 TODO Chunk 2 tasks)
  - Time entries for all completed tasks
  - Checklist items for each task
  - ActivityLedger events for every task lifecycle
- ✅ Project app tracks itself — all completed work visible in the app

**Test milestone:** `npx prisma migrate dev`, seed runs, mock data exists in SQLite. ✅

**Additional completed:** Real data wired to Tasks page, Projects page, and Dashboard (server components querying Prisma directly).

---

## Chunk 3: Authentication — **COMPLETED**

**Goal:** Single-user local auth with secure session.

- ✅ Login page with working form, loading state, error handling
- ✅ Register API route (`/api/auth/register`)
- ✅ Login API route (`/api/auth/login`) with JWT cookie
- ✅ Logout API route (`/api/auth/logout`) clearing cookie
- ✅ `middleware.ts` to protect routes: redirect unauthenticated users to `/login`
- ✅ JWT session management with `jose` (Edge-safe)
- ✅ Password hashing with `argon2` (Node-only, separate from Edge middleware)
- ✅ `src/lib/auth.ts` — Edge-safe JWT sign/verify
- ✅ `src/lib/password.ts` — Node-only argon2 hashing/verification
- ✅ Auto-create default user on seed
- ✅ Login triggers `USER_LOGGED_IN` ledger event
- ✅ Admin credentials moved to `.env` (ADMIN_EMAIL, ADMIN_PASSWORD)
- ✅ Logout button in sidebar

**Not yet:** react-hook-form + Zod validation on login page (plain HTML forms for now).

**Test milestone:** Can register, login, session persists on refresh, protected routes redirect. ✅

---

## Chunk 4: Project Management — **COMPLETED**

**Goal:** Project list and detail views.

- ✅ API routes: `GET /api/projects`, `POST /api/projects`, `GET /api/projects/[id]`, `PATCH /api/projects/[id]`, `DELETE /api/projects/[id]`
- ✅ `ProjectCard` component with status badge, color stripe, task progress bar, hour progress bar, hour stats
- ✅ `ProjectsPage`: 2-column grid of project cards, sorted by newest first, NEW PROJECT button
- ✅ `ProjectDetailPage` with tab navigation: Overview, Tasks, Timeline, Roadmap, Reports, Notes
  - Overview tab: task count, hour completion %, remaining hours
  - Tasks tab: list of project tasks with priority/status badges and checklist counts
  - Timeline/Roadmap/Reports/Notes: placeholder for Phase 2
- ✅ Project creation page (`/projects/new`) with form: name, description, status, color picker, estimated hours
- ✅ Project edit page (`/projects/[id]/edit`) with same form pre-filled
- ✅ Delete project button with confirmation
- ✅ Project CRUD triggers `PROJECT_CREATED` / `PROJECT_UPDATED` / `PROJECT_DELETED` ledger events
- ✅ Added `% done (hrs)` badge to project cards

**Not yet:** Framer Motion animations on modal (plain form pages for now).

**Test milestone:** Create, view, edit, delete projects; progress bars reflect task completion. ✅

---

## Chunk 5: Task System — **COMPLETED**

**Goal:** Full task CRUD with checklist support.

- ✅ API routes: `GET /api/tasks`, `POST /api/tasks`, `GET /api/tasks/[id]`, `PATCH /api/tasks/[id]`, `DELETE /api/tasks/[id]`
- ✅ Checklist item toggle API: `PATCH /api/checklist/[id]` with ledger event
- ✅ `TaskCard` component: priority indicator, status badge, checklist progress bar, hours logged, project name
- ✅ `TasksPage`: 3-column grid with Status and Priority filter dropdowns, NEW TASK button
- ✅ Task creation page (`/tasks/new`) with form: title, description, project dropdown, category, priority, status, estimated hours
- ✅ Task edit page (`/tasks/[id]/edit`) with same form pre-filled
- ✅ Task detail page (`/tasks/[id]`) with: header (title, status, priority), description, stats grid (project, time, checklist), checklist items with live toggle
- ✅ Delete task button with confirmation
- ✅ Task CRUD triggers `TASK_CREATED`, `TASK_UPDATED`, `TASK_STATUS_CHANGED`, `CHECKLIST_ITEM_COMPLETED`, `TASK_DELETED` ledger events

**Not yet:** Tags field (comma-separated), start date / due date inputs.

**Test milestone:** Create tasks, attach checklists, toggle items, progress updates. ✅

---

## Chunk 6: Interactive Timer — **COMPLETED**

**Goal:** Start/pause/resume/stop/complete timer with state persistence.

- ✅ `TimeEntry` model tracks: startTime, endTime, pausedSeconds, isRunning
- ✅ Single API route `POST /api/timer` with actions: start, pause, resume, stop, complete
  - GET `/api/timer` for querying running entries
- ✅ `useTaskTimer()` hook with `setInterval` ticking display
  - Computes elapsed = now - startTime - pausedSeconds
  - Persists state to `localStorage` for resume-after-restart
  - Auto-resumes interval on mount if timer was running
- ✅ Timer controls on task detail page: START, PAUSE, RESUME, STOP, COMPLETE buttons
- ✅ Floating `TimerWidget` visible on all app pages when timer is active/paused
- ✅ On start: stops any other running timer, creates new `TimeEntry`, marks task IN_PROGRESS
- ✅ On pause: sets endTime, accumulates pausedSeconds
- ✅ On stop: updates task `actualDuration` from all time entries
- ✅ On complete: same as stop + marks task COMPLETED
- ✅ Ledger events: `TIMER_STARTED`, `TIMER_PAUSED`, `TIMER_RESUMED`, `TIMER_STOPPED`, `TIMER_COMPLETED`

**Not yet:** Manual duration edit UI (can be done via task edit form). Zustand store (plain React state + localStorage for now).

**Test milestone:** Start timer, pause, resume, stop; actualDuration captured; restart app, timer resumes. ✅

---

## Chunk 7: Dashboard Charts & Widgets — **COMPLETED**

**Goal:** Data-rich dashboard with live metrics and charts.

- ✅ `/api/dashboard` single endpoint returning all dashboard data (stats, charts, lists, activity feed)
- ✅ `DashboardPage` converted to client component with 6 stat cards: Total Hours, Active Projects, Total Tasks, Completed, Today, This Week
- ✅ Live active timer widget on dashboard when timer is running/paused
- ✅ Burn-down bar chart (estimated / actual / remaining hours per project)
- ✅ Pie chart: time logged by project (Recharts)
- ✅ Bar chart: time logged by category (Recharts, vertical layout)
- ✅ Activity feed widget from ActivityLedger (last 10 events with icons)
- ✅ Upcoming tasks due within 7 days widget
- ✅ Recently Completed widget retained

**Not yet:** Productivity percentage / forecast vs actual (requires historical data). Time by day/week/month breakdown. Zustand + React Query.

**Test milestone:** Dashboard loads with real seeded data, charts render, timer widget live. ✅

---

## Chunk 8: Basic Reports — **COMPLETED**

**Goal:** Daily, weekly, monthly summary pages.

- ✅ `/api/reports?period=daily|weekly|monthly` endpoint with date filtering
- ✅ `ReportsPage` with Daily / Weekly / Monthly tabs
- ✅ Summary stat cards: Est. Hours, Actual Hours, Productivity %, Tasks, Completed
- ✅ Project breakdown table (name, est/actual hours, task count, completed)
- ✅ Task list table with status badges
- ✅ CSV export (client-side Blob download)

**Not yet:** Productivity trend line chart (requires historical data over time).

**Test milestone:** Switch tabs, see filtered data, export CSV. ✅

---

## Chunk 9: Settings — **COMPLETED**

**Goal:** App configuration: accent color selector, work hours, timezone, database backup/restore.

- ✅ Settings page with sections: Appearance, Preferences, Data
- ✅ Accent color picker (6 colors: green, purple, red, orange, blue, cyan) with localStorage persistence
- ✅ Default work hours input (1-24) with localStorage persistence
- ✅ Timezone selector with localStorage persistence
- ✅ JSON export via `/api/export` — downloads all projects, tasks, time entries, and activity ledger
- ✅ Apply accent color to CSS variable on save

**Not yet:** Database file backup/restore (requires filesystem access). Restore from JSON upload.

**Test milestone:** Color changes apply globally, JSON export downloads file. ✅

---

## Chunk 10: Integration, Polish & Roadmap — **COMPLETED**

**Goal:** Tie everything together and prepare for Phase 2.

- ✅ Sidebar links wired to all functional pages (Dashboard, Projects, Tasks, Board, Timeline, Reports, Settings)
- ✅ All CRUD operations write to ActivityLedger via `lib/ledger.ts` (projects, tasks, timer, checklist)
- ✅ `BoardPage`: 4-column Kanban board (Backlog, In Progress, Review, Completed) with real tasks, priority dots, project colors
- ✅ `TimelinePage`: task list sorted by due date with start/due dates and project colors
- ✅ `CalendarPage`: placeholder (route exists)
- ✅ End-to-end walkthrough works: login → create project → create task → start timer → complete task → view dashboard → view reports
- ✅ Build passes cleanly (`next build` succeeds)

**Not yet:** Framer Motion animations (plain CSS transitions for now). Zustand store (React state + localStorage for timer and settings). React Query. Error boundaries. Drag-and-drop Kanban.

**Test milestone:** Full user journey works, ledger has events for every action. ✅

---

## Database Schema Summary

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  workHours    Int      @default(8)
  timezone     String   @default("UTC")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Project {
  id             String   @id @default(cuid())
  name           String
  description    String?
  status         String   @default("ACTIVE")
  color          String   @default("#00ff66")
  startDate      DateTime?
  targetDate     DateTime?
  estimatedHours Float    @default(0)
  actualHours    Float    @default(0)
  remainingHours Float    @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  tasks          Task[]
}

model Task {
  id                String         @id @default(cuid())
  title             String
  description       String?
  projectId         String
  project           Project        @relation(fields: [projectId], references: [id])
  category          String?
  priority          String         @default("MEDIUM")
  status            String         @default("TODO")
  tags              String?
  estimatedDuration Int            @default(0) // seconds
  actualDuration    Int            @default(0) // seconds
  startDate         DateTime?
  dueDate           DateTime?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  timeEntries       TimeEntry[]
  checklistItems    ChecklistItem[]
}

model TimeEntry {
  id            String    @id @default(cuid())
  taskId        String
  task          Task      @relation(fields: [taskId], references: [id])
  startTime     DateTime  @default(now())
  endTime       DateTime?
  pausedSeconds Int       @default(0)
  isRunning     Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime @updatedAt
}

model ChecklistItem {
  id          String   @id @default(cuid())
  taskId      String
  task        Task     @relation(fields: [taskId], references: [id])
  title       String
  isCompleted Boolean  @default(false)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ActivityLedger {
  id              String   @id @default(cuid())
  timestamp       DateTime @default(now())
  eventType       String
  entityType      String
  entityId        String?
  projectId       String?
  taskId          String?
  oldValue        String?
  newValue        String?
  durationSeconds Int?
  notes           String?
  metadata        String?  // JSON string
}
```

---

## State Management Plan

- **Zustand (client):** `useAppStore` — sidebar state, accent color, active timer display state, auth user object
- **React Query (server):** All API data (projects, tasks, time entries, reports) fetched via React Query with proper invalidation on mutations
- **Timer persistence:** Zustand + `localStorage` mirror for cross-tab/resume-after-refresh; source of truth is DB `TimeEntry.isRunning`

---

## Folder Structure (Feature-Based)

```
src/
  app/                    # Next.js App Router
    (auth)/               # Login, Register (no sidebar)
    (app)/                # Authenticated pages with sidebar layout
      dashboard/
      projects/
      tasks/
      reports/
      board/
      timeline/
      calendar/
      settings/
    api/                  # Route handlers
      auth/
      projects/
      tasks/
      timer/
      reports/
  components/
    ui/                   # Atomic: Button, Input, Badge, Card, Modal, Drawer
    layout/               # Sidebar, TopBar, PageContainer
    charts/               # Recharts wrappers
  hooks/
    useTaskTimer.ts
    useAuth.ts
  lib/
    prisma.ts
    ledger.ts
    auth.ts
    utils.ts
  stores/
    appStore.ts
  types/
    index.ts
```

---

## Notes for Phase 2/3

Phase 2 plan will be created as a separate file (`phase2-plan.md`) when Phase 1 is complete.

Planned Phase 2 features:
- ActivityLedger UI: activity feed widget, project/task history views
- Kanban drag-and-drop: `@dnd-kit/core` or `@hello-pangea/dnd`
- Timeline: custom SVG/canvas or `vis-timeline`
- Calendar: `react-big-calendar` or custom grid
- AI summaries: aggregate ledger events by day/week
- Forecasting: linear regression on actual velocity
- Command palette: `cmdk`
- Notifications: toast system with Framer Motion
- Multi-project reporting with date range filters
- Team/multi-user support

---

## Progress Log

| Date | Completed |
|------|-----------|
| Jun 18 | Chunk 1: Next.js 16 scaffold, CRT theme, sidebar, 8 route placeholders, login page, build passing |
| Jun 18 | Chunk 2: Prisma schema + migration, seed data, ledger helper, self-tracking project with 14 tasks seeded into app |
| Jun 18 | Bonus: Real data wired to Tasks, Projects, Dashboard pages; nodemon auto-restart; SVG icon in sidebar |
| Jun 18 | Chunk 3: Full auth system — JWT cookies, middleware route protection, login/logout/register API, sidebar logout, .env creds |
| Jun 18 | Bonus: Fixed argon2 Edge runtime error, redesigned bd-icon.svg as angular lowercase bd |
| Jun 18 | Chunk 4: Project CRUD API routes, ProjectCard component, ProjectsPage grid, detail page with tabs, create/edit/delete pages |
| Jun 18 | Bonus: Added '% done (hrs)' badge, dashboard Recently Completed section, updated all chunk tasks in DB |
| Jun 18 | Chunk 5: Task CRUD API routes, TaskCard component, TasksPage with filters, checklist toggle API, task create/edit/detail pages |
| Jun 18 | Chunk 6: Interactive Timer — useTaskTimer hook, /api/timer route, timer controls on task detail, floating TimerWidget, localStorage persistence |
| Jun 18 | Chunk 7: Dashboard Charts & Widgets — /api/dashboard, Recharts pie/bar charts, activity feed, upcoming due, live timer widget |
| Jun 18 | Chunk 8: Basic Reports — /api/reports with period filtering, Daily/Weekly/Monthly tabs, project breakdown, task tables, CSV export |
| Jun 18 | Chunk 9: Settings — color picker, work hours, timezone, JSON export via /api/export, localStorage persistence |
| Jun 18 | Chunk 10: Integration & Polish — Kanban roadmap, timeline, all sidebar links, end-to-end walkthrough, build passing |
| Jun 18 | **PHASE 1 COMPLETE** — 27 tasks, 27 completed, 0 remaining. All chunks implemented with real data.

## Next Step

**Phase 2** — Prioritized features: drag-and-drop Kanban, calendar view, productivity trend charts, Excel/PDF export, notifications, multi-user support, PWA (service worker, offline support, installability).
