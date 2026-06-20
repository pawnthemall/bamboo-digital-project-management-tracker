# Code Review Fixes

This document tracks the issues found during the code review and the fixes applied.

## Step 1: Route protection uses Next.js 16 `proxy.ts` convention

**Problem**: I initially thought route protection was missing because the file was named `src/proxy.ts`. Next.js 16 deprecated the `middleware.ts` convention and introduced the `proxy.ts` convention. The existing `src/proxy.ts` was already the correct mechanism, but it needed to be kept and verified.

**Solution**: Restored and cleaned up `src/proxy.ts` to handle the Next.js 16 proxy convention, deleted the incorrectly created `src/middleware.ts`, and verified that unauthenticated requests to protected routes are redirected to `/login`.

## Step 2: Most API routes lacked authentication

**Problem**: The majority of data endpoints (`/api/tasks`, `/api/projects`, `/api/timer`, `/api/dashboard`, `/api/analytics`, `/api/reports`, `/api/export`, `/api/checklist/:id`, `/api/projects/:id/members`) did not verify the current user. Even with the proxy in front of them, the route handlers themselves were defenseless and could leak or mutate data if the proxy was bypassed or misconfigured.

**Solution**: Added a `requireAuth()` helper to `src/lib/auth.ts` that returns a discriminated union of `{ user, response: null }` or `{ user: null, response: NextResponse }`. Applied it to every data API handler so that unauthenticated requests receive a 401 response. Verified the TypeScript still passes, the app still builds, and authenticated users can still access the dashboard while unauthenticated requests to `/api/tasks` are redirected to `/login` by the proxy.

## Step 3: Hardcoded JWT fallback secret

**Problem**: `src/lib/auth.ts` used a hardcoded fallback JWT secret when `JWT_SECRET` was missing. The local `.env.local` did not contain `JWT_SECRET`, so all tokens in this environment were being signed with a predictable secret.

**Solution**: Updated `src/lib/auth.ts` to throw a clear error at module load if `JWT_SECRET` is not set. Added a generated secret to `.env.local` and updated `.env.example` to document that the variable is required. Restarted the dev server and verified that login still works and the dashboard is accessible.

## Step 4: No input validation/sanitization

**Problem**: API routes destructured `req.json()` and passed values directly to Prisma. There were no length, format, or type checks, which allowed invalid data and potential unexpected writes.

**Solution**: Created `src/lib/validation.ts` with Zod schemas for login, register, projects, tasks, timer actions, checklist updates, project members, and query parameters. Applied `safeParse` to all relevant route handlers (`src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/projects/route.ts`, `src/app/api/projects/[id]/route.ts`, `src/app/api/tasks/route.ts`, `src/app/api/tasks/[id]/route.ts`, `src/app/api/timer/route.ts`, `src/app/api/checklist/[id]/route.ts`, `src/app/api/projects/[id]/members/route.ts`, `src/app/api/analytics/route.ts`, `src/app/api/reports/route.ts`). Verified that invalid requests now return 400 (e.g., invalid email/short password on login, invalid timer action/task id).

## Step 5: N+1 query in dashboard

**Problem**: `src/app/api/dashboard/route.ts` fetched `timeEntries` with tasks, then looped over every entry and called `prisma.project.findUnique()` to resolve the project name. This produced one extra database query per time entry.

**Solution**: Changed the `timeEntries` query to include the task's project in a single `include: { task: { include: { project: true } } }`. Updated the aggregation loop to read `entry.task.project?.name` instead of calling the database. Also removed the unused `startOfMonth` variable. Verified the dashboard still loads and the TypeScript/ESLint checks pass.

## Step 6: Timer operations were global

**Problem**: `src/app/api/timer/route.ts` stopped *all* running timers in the database when starting/resuming a timer, and time entries were created without a `userId`. This made the timer feature unsafe in a multi-user environment.

**Solution**: Added the authenticated user's `id` to the filter for all timer reads and writes. `GET` now returns only the current user's running entry; `start`/`resume` stop only the user's other entries and create new entries with `userId`; `pause`/`stop`/`complete` now verify the entry belongs to the user. Verified by starting and stopping a timer via the API and confirming the returned entry has the correct `userId`.

## Step 7: ESLint errors (react-hooks, explicit any, unused vars, start.js)

**Problem**: `npx eslint . --max-warnings=0` reported 13 errors and 9 warnings. Issues included `react-hooks/set-state-in-effect` and `exhaustive-deps` in data-fetching effects, `no-explicit-any` in chart formatters and PWA install code, `no-unused-vars` across scripts and pages, `prefer-const` in `reports/route.ts`, `no-require-imports` in `start.js`, and `no-img-element` warnings for SVG icons.

**Solution**: 
- Refactored `src/app/(app)/projects/[id]/page.tsx` to use `useCallback` for fetch helpers and properly list them in the `useEffect` dependency array; removed unused `projectColor`/`labelInterval` and typed the Recharts tooltip formatter.
- Replaced localStorage restoration in `src/hooks/useTaskTimer.ts` with state initializers so the effect only starts the interval.
- Removed synchronous `setState` from `src/app/(app)/tasks/new/page.tsx` and `src/app/(auth)/login/page.tsx` effects, and introduced a typed `BeforeInstallPromptEvent` interface instead of `any`.
- Removed unused `totalActual` variables from seed scripts, fixed `prefer-const` in `src/app/api/reports/route.ts`, and added `start.js`/`build_log*.txt`/`dev-server.log` to `eslint.config.mjs` ignores.
- Replaced `<img>` with `next/image` `Image` in `Header`, `Sidebar`, and `Login`.

Verified `npx tsc --noEmit` and `npx eslint . --max-warnings=0` both pass, and the login/dashboard flow still works.

**Follow-up after testing**: Browser testing revealed a hydration mismatch because `next/image` added extra attributes during SSR that the client didn't reproduce. Reverted the SVG icons to plain `<img>` tags with targeted `// eslint-disable-next-line @next/next/no-img-element` comments. A console `formatISODate is not a function` error on the Reports page was caused by a stale dev-server cache; restarting the dev server cleared it. After the restart, both `/dashboard` and `/reports` load with zero console errors.

## Step 8: Plan MariaDB migration for Plesk deployment

**Problem**: The project is currently configured for SQLite (`prisma/schema.prisma` provider = `sqlite`, `better-sqlite3` dependency). Plesk uses MariaDB 10.11.14, so the provider and connection string need to be switched for production.

**Solution**: Verified the schema uses only standard Prisma types (`String`, `Int`, `Float`, `Boolean`, `DateTime`, `cuid()`) and has no raw SQLite SQL, so it is compatible with MariaDB. Updated `.env.example` to document the MariaDB URL format (`mysql://user:password@localhost:3306/bamboo_digital?schema=public`) and updated `prisma.config.ts` so the datasource URL is driven by `DATABASE_URL` without a silent SQLite fallback.

**Migration steps for Plesk**:
1. Create the MariaDB database and user in Plesk (MariaDB 10.11.14).
2. Set `DATABASE_URL` in Plesk environment variables to the MariaDB connection string.
3. Change `provider = "sqlite"` to `provider = "mysql"` in `prisma/schema.prisma`.
4. Run Prisma migrations in the Plesk Node.js commands panel: `db:migrate` (equivalent to `prisma migrate dev` or `prisma migrate deploy` for production).
5. Seed the database if needed: `db:seed`.
6. Remove `better-sqlite3` from dependencies for production builds (optional, since it will not be used with MariaDB).
7. If upgrading to Prisma 7, pass `accelerateUrl: ''` in the `PrismaClient` constructor in `src/lib/prisma.ts`.

