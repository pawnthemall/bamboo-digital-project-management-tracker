import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

const PHASE1_TASKS = [
  { title: "Initialize Next.js 16 + TypeScript + Tailwind v4", est: 2, act: 2 },
  { title: "Initialize Git repository", est: 0.5, act: 0.5 },
  { title: "Create CRT terminal dark theme", est: 4, act: 5 },
  { title: "Build sidebar navigation for 8 routes", est: 3, act: 2 },
  { title: "Create placeholder pages for all routes", est: 3, act: 2 },
  { title: "Create login page with CRT styling", est: 3, act: 3 },
  { title: "Configure Prisma 6 + SQLite with full schema", est: 5, act: 6 },
  { title: "Create start.js wrapper for Plesk Node.js deployment", est: 1, act: 0.75 },
  { title: "Ensure build passes cleanly", est: 2, act: 3 },
  { title: "Create database seed with sample data", est: 2, act: 1 },
  { title: "Chunk 2: Authentication system", est: 8, act: 6 },
  { title: "Chunk 2: REST API routes (projects, tasks, timer, ledger)", est: 10, act: 8 },
  { title: "Chunk 2: Timer functionality", est: 8, act: 7 },
  { title: "Chunk 2: Dashboard with real data", est: 6, act: 5 },
  { title: "Chunk 3: Project detail pages + task tabs + progress bars", est: 6, act: 5 },
  { title: "Chunk 3: Task CRUD + filters + priority badges + checklist", est: 8, act: 7 },
  { title: "Chunk 3: Reports (daily/weekly/monthly) + CSV export", est: 5, act: 4 },
  { title: "Chunk 3: Roadmap Kanban (4 columns)", est: 4, act: 3 },
  { title: "Chunk 3: Timeline view (task list by due date)", est: 2, act: 1.5 },
  { title: "Chunk 3: Settings (accent color, work hours, timezone, JSON export)", est: 3, act: 2.5 },
];

const PHASE2_TASKS = [
  { title: "PWA: manifest, service worker, icons, offline fallback", est: 4, act: 3.5 },
  { title: "State Management: Zustand stores (app, timer, toast)", est: 3, act: 2.5 },
  { title: "React Query: client, provider, hooks for all data", est: 4, act: 3.5 },
  { title: "Error Boundary with CRT-styled fallback", est: 1, act: 0.75 },
  { title: "Framer Motion page transitions", est: 1, act: 0.5 },
  { title: "Command Palette (cmdk + Ctrl+K)", est: 2, act: 1.5 },
  { title: "Toast notification system with Zustand", est: 2, act: 1.5 },
  { title: "Drag-and-drop Kanban (5 columns with @hello-pangea/dnd)", est: 3, act: 2.5 },
  { title: "Calendar view (react-big-calendar + date-fns)", est: 3, act: 2.5 },
  { title: "Analytics API: productivity trend, velocity, completion rate", est: 4, act: 3.5 },
  { title: "Excel/CSV export with date range picker", est: 3, act: 2.5 },
  { title: "Multi-user Prisma schema migration", est: 3, act: 2.5 },
  { title: "Auth routes for roles (ADMIN/MEMBER)", est: 2, act: 1.5 },
  { title: "Project membership API", est: 2, act: 1.5 },
  { title: "Task assignment API", est: 1, act: 0.75 },
  { title: "Admin users page", est: 2, act: 1.5 },
  { title: "README update with Phase 2 features", est: 1, act: 0.5 },
];

async function main() {
  const project = await prisma.project.findFirst({
    where: { name: "Bamboo Digital PM Tracker" },
  });

  if (!project) {
    console.error("Project 'Bamboo Digital PM Tracker' not found. Run prisma db seed first.");
    process.exit(1);
  }

  // Update existing Phase 1 tasks that are still TODO -> COMPLETED
  const existingTasks = await prisma.task.findMany({
    where: { projectId: project.id },
    select: { id: true, title: true, status: true, estimatedDuration: true },
  });

  const existingMap = new Map(existingTasks.map((t) => [t.title, t]));

  const now = Date.now();
  let timeOffset = 30 * 24 * 3600 * 1000; // Start ~30 days ago for Phase 1

  // Process Phase 1
  for (const t of PHASE1_TASKS) {
    const estSeconds = Math.round(t.est * 3600);
    const actSeconds = Math.round(t.act * 3600);

    const existing = existingMap.get(t.title);

    const startTime = new Date(now - timeOffset);
    const endTime = new Date(now - timeOffset + actSeconds * 1000);

    if (existing) {
      // Update existing task
      await prisma.task.update({
        where: { id: existing.id },
        data: {
          status: "COMPLETED",
          estimatedDuration: estSeconds,
          actualDuration: actSeconds,
          startDate: startTime,
          dueDate: endTime,
          category: "Phase 1",
        },
      });

      // Delete old time entries and create new one
      await prisma.timeEntry.deleteMany({ where: { taskId: existing.id } });
      await prisma.timeEntry.create({
        data: {
          taskId: existing.id,
          startTime,
          endTime,
          pausedSeconds: 0,
          isRunning: false,
        },
      });

      // Mark all checklist items complete
      await prisma.checklistItem.updateMany({
        where: { taskId: existing.id },
        data: { isCompleted: true },
      });
    } else {
      // Create new Phase 1 task
      const task = await prisma.task.create({
        data: {
          title: t.title,
          description: `Phase 1 task: ${t.title}`,
          projectId: project.id,
          category: "Phase 1",
          priority: "MEDIUM",
          status: "COMPLETED",
          estimatedDuration: estSeconds,
          actualDuration: actSeconds,
          startDate: startTime,
          dueDate: endTime,
        },
      });

      await prisma.timeEntry.create({
        data: {
          taskId: task.id,
          startTime,
          endTime,
          pausedSeconds: 0,
          isRunning: false,
        },
      });

      await prisma.checklistItem.createMany({
        data: [
          { taskId: task.id, title: "Design", isCompleted: true, order: 0 },
          { taskId: task.id, title: "Implement", isCompleted: true, order: 1 },
          { taskId: task.id, title: "Test", isCompleted: true, order: 2 },
        ],
      });
    }

    timeOffset -= (actSeconds + 1800) * 1000;
  }

  // Process Phase 2 (more recent)
  timeOffset = 8 * 24 * 3600 * 1000; // Start ~8 days ago for Phase 2

  for (const t of PHASE2_TASKS) {
    const estSeconds = Math.round(t.est * 3600);
    const actSeconds = Math.round(t.act * 3600);

    const existing = existingMap.get(t.title);
    const startTime = new Date(now - timeOffset);
    const endTime = new Date(now - timeOffset + actSeconds * 1000);

    if (existing) {
      await prisma.task.update({
        where: { id: existing.id },
        data: {
          status: "COMPLETED",
          estimatedDuration: estSeconds,
          actualDuration: actSeconds,
          startDate: startTime,
          dueDate: endTime,
          category: "Phase 2",
        },
      });

      await prisma.timeEntry.deleteMany({ where: { taskId: existing.id } });
      await prisma.timeEntry.create({
        data: {
          taskId: existing.id,
          startTime,
          endTime,
          pausedSeconds: 0,
          isRunning: false,
        },
      });

      await prisma.checklistItem.updateMany({
        where: { taskId: existing.id },
        data: { isCompleted: true },
      });
    } else {
      const task = await prisma.task.create({
        data: {
          title: t.title,
          description: `Phase 2 task: ${t.title}`,
          projectId: project.id,
          category: "Phase 2",
          priority: "MEDIUM",
          status: "COMPLETED",
          estimatedDuration: estSeconds,
          actualDuration: actSeconds,
          startDate: startTime,
          dueDate: endTime,
        },
      });

      await prisma.timeEntry.create({
        data: {
          taskId: task.id,
          startTime,
          endTime,
          pausedSeconds: 0,
          isRunning: false,
        },
      });

      await prisma.checklistItem.createMany({
        data: [
          { taskId: task.id, title: "Design", isCompleted: true, order: 0 },
          { taskId: task.id, title: "Implement", isCompleted: true, order: 1 },
          { taskId: task.id, title: "Test", isCompleted: true, order: 2 },
        ],
      });
    }

    timeOffset -= (actSeconds + 1800) * 1000;
  }

  // Update project totals
  const allTasks = await prisma.task.findMany({ where: { projectId: project.id } });
  const totalEst = allTasks.reduce((sum, t) => sum + t.estimatedDuration, 0);
  const totalAct = allTasks.reduce((sum, t) => sum + t.actualDuration, 0);

  await prisma.project.update({
    where: { id: project.id },
    data: {
      status: "ACTIVE",
      estimatedHours: Math.round((totalEst / 3600) * 10) / 10,
      actualHours: Math.round((totalAct / 3600) * 10) / 10,
      remainingHours: 0,
    },
  });

  // Add ledger events for Phase 2 completion
  await prisma.activityLedger.createMany({
    data: [
      {
        eventType: "PROJECT_UPDATED",
        entityType: "Project",
        entityId: project.id,
        projectId: project.id,
        notes: "Phase 2 tasks completed. Project fully built.",
      },
      {
        eventType: "TASK_STATUS_CHANGED",
        entityType: "Task",
        entityId: project.id,
        projectId: project.id,
        oldValue: "IN_PROGRESS",
        newValue: "COMPLETED",
        notes: "All Phase 1 and Phase 2 tasks marked complete",
      },
    ],
  });

  const p1Count = PHASE1_TASKS.length;
  const p2Count = PHASE2_TASKS.length;
  console.log(`Done. Project updated with ${p1Count} Phase 1 tasks and ${p2Count} Phase 2 tasks.`);
  console.log(`Total estimated: ${Math.round(totalEst / 3600 * 10) / 10}h`);
  console.log(`Total actual: ${Math.round(totalAct / 3600 * 10) / 10}h`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
