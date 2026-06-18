import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient({});

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@bamboo.digital";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await argon2.hash(adminPassword);

  const user = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      workHours: 8,
      timezone: "Pacific/Auckland",
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "Bamboo Digital PM Tracker",
      description: "Building the Bamboo Digital project management tracker application — a CRT-themed PM tool with timer, dashboard, and roadmap features.",
      status: "ACTIVE",
      color: "#00ff66",
      estimatedHours: 160,
      actualHours: 42,
      remainingHours: 118,
    },
  });

  const tasks = [
    {
      title: "Initialize Next.js 16 + TypeScript + Tailwind v4",
      description: "Set up the core project scaffold with Next.js 16, TypeScript strict mode, and Tailwind CSS v4.",
      category: "Infrastructure",
      priority: "HIGH",
      status: "COMPLETED",
      estimatedDuration: 2 * 3600,
      actualDuration: 2 * 3600,
      checklist: [
        { title: "Run create-next-app with TypeScript", isCompleted: true },
        { title: "Configure Tailwind v4 and PostCSS", isCompleted: true },
        { title: "Set up tsconfig paths", isCompleted: true },
      ],
    },
    {
      title: "Initialize Git repository",
      description: "Initialize local Git repo and configure ignore patterns.",
      category: "Infrastructure",
      priority: "MEDIUM",
      status: "COMPLETED",
      estimatedDuration: 30 * 60,
      actualDuration: 20 * 60,
      checklist: [
        { title: "git init", isCompleted: true },
        { title: "Configure .gitignore", isCompleted: true },
      ],
    },
    {
      title: "Create CRT terminal dark theme",
      description: "Implement the signature CRT aesthetic: #00ff66 phosphor green, scanlines, blinking cursor, zero border radius.",
      category: "Design",
      priority: "HIGH",
      status: "COMPLETED",
      estimatedDuration: 4 * 3600,
      actualDuration: 5 * 3600,
      checklist: [
        { title: "Define custom color palette in globals.css", isCompleted: true },
        { title: "Add scanline overlay effect", isCompleted: true },
        { title: "Create blinking cursor animation", isCompleted: true },
        { title: "Apply zero-radius border tokens", isCompleted: true },
      ],
    },
    {
      title: "Build sidebar navigation for 8 routes",
      description: "Create persistent sidebar with icons and active-state styling for all application routes.",
      category: "UI",
      priority: "HIGH",
      status: "COMPLETED",
      estimatedDuration: 3 * 3600,
      actualDuration: 2 * 3600,
      checklist: [
        { title: "Design sidebar layout component", isCompleted: true },
        { title: "Add route links: Dashboard, Projects, Tasks, Reports, Roadmap, Timeline, Calendar, Settings", isCompleted: true },
        { title: "Implement active/hover states with CRT styling", isCompleted: true },
      ],
    },
    {
      title: "Create placeholder pages for all routes",
      description: "Stub out all 8 route pages with consistent layout wrapper and CRT styling.",
      category: "UI",
      priority: "MEDIUM",
      status: "COMPLETED",
      estimatedDuration: 3 * 3600,
      actualDuration: 2 * 3600,
      checklist: [
        { title: "Dashboard placeholder", isCompleted: true },
        { title: "Projects placeholder", isCompleted: true },
        { title: "Tasks placeholder", isCompleted: true },
        { title: "Reports placeholder", isCompleted: true },
        { title: "Roadmap placeholder", isCompleted: true },
        { title: "Timeline placeholder", isCompleted: true },
        { title: "Calendar placeholder", isCompleted: true },
        { title: "Settings placeholder", isCompleted: true },
      ],
    },
    {
      title: "Create login page with CRT styling",
      description: "Design and build the authentication entry point with CRT visual treatment.",
      category: "UI",
      priority: "HIGH",
      status: "COMPLETED",
      estimatedDuration: 3 * 3600,
      actualDuration: 3 * 3600,
      checklist: [
        { title: "Login form layout", isCompleted: true },
        { title: "CRT-styled inputs and buttons", isCompleted: true },
        { title: "Responsive centering", isCompleted: true },
      ],
    },
    {
      title: "Configure Prisma 6 + SQLite with full schema",
      description: "Set up Prisma ORM with SQLite, design and migrate the complete data model.",
      category: "Backend",
      priority: "HIGH",
      status: "COMPLETED",
      estimatedDuration: 5 * 3600,
      actualDuration: 6 * 3600,
      checklist: [
        { title: "Install Prisma + client", isCompleted: true },
        { title: "Define User model", isCompleted: true },
        { title: "Define Project model", isCompleted: true },
        { title: "Define Task model", isCompleted: true },
        { title: "Define TimeEntry model", isCompleted: true },
        { title: "Define ChecklistItem model", isCompleted: true },
        { title: "Define ActivityLedger model", isCompleted: true },
        { title: "Run initial migration", isCompleted: true },
      ],
    },
    {
      title: "Create start.js wrapper for Plesk Node.js deployment",
      description: "Write custom startup wrapper that reads PORT from environment for Plesk compatibility.",
      category: "DevOps",
      priority: "MEDIUM",
      status: "COMPLETED",
      estimatedDuration: 1 * 3600,
      actualDuration: 45 * 60,
      checklist: [
        { title: "Write start.js wrapper", isCompleted: true },
        { title: "Test local startup", isCompleted: true },
      ],
    },
    {
      title: "Ensure build passes cleanly",
      description: "Fix all TypeScript and ESLint errors to achieve a clean production build.",
      category: "Infrastructure",
      priority: "HIGH",
      status: "COMPLETED",
      estimatedDuration: 2 * 3600,
      actualDuration: 3 * 3600,
      checklist: [
        { title: "Resolve TypeScript errors", isCompleted: true },
        { title: "Resolve ESLint warnings", isCompleted: true },
        { title: "Run next build successfully", isCompleted: true },
      ],
    },
    {
      title: "Create database seed with sample data",
      description: "Write seed script and populate database with initial user, project, task, and ledger entries.",
      category: "Backend",
      priority: "MEDIUM",
      status: "COMPLETED",
      estimatedDuration: 2 * 3600,
      actualDuration: 1 * 3600,
      checklist: [
        { title: "Create seed.mjs script", isCompleted: true },
        { title: "Seed user with hashed password", isCompleted: true },
        { title: "Seed sample project and task", isCompleted: true },
        { title: "Seed activity ledger events", isCompleted: true },
      ],
    },
    {
      title: "Chunk 2: Authentication system",
      description: "Implement login/logout, session management, and route guards.",
      category: "Backend",
      priority: "HIGH",
      status: "TODO",
      estimatedDuration: 8 * 3600,
      actualDuration: 0,
      checklist: [
        { title: "API route: POST /api/auth/login", isCompleted: false },
        { title: "API route: POST /api/auth/logout", isCompleted: false },
        { title: "Session/cookie middleware", isCompleted: false },
        { title: "Protect dashboard routes", isCompleted: false },
      ],
    },
    {
      title: "Chunk 2: REST API routes",
      description: "Build CRUD API endpoints for projects, tasks, time entries, and ledger.",
      category: "Backend",
      priority: "HIGH",
      status: "TODO",
      estimatedDuration: 10 * 3600,
      actualDuration: 0,
      checklist: [
        { title: "Projects CRUD endpoints", isCompleted: false },
        { title: "Tasks CRUD endpoints", isCompleted: false },
        { title: "Time entry endpoints", isCompleted: false },
        { title: "Activity ledger query endpoints", isCompleted: false },
      ],
    },
    {
      title: "Chunk 2: Timer functionality",
      description: "Implement start/pause/resume/stop timer with real-time tracking and persistence.",
      category: "Feature",
      priority: "HIGH",
      status: "TODO",
      estimatedDuration: 8 * 3600,
      actualDuration: 0,
      checklist: [
        { title: "Timer UI component", isCompleted: false },
        { title: "Timer state machine (start/pause/resume/stop)", isCompleted: false },
        { title: "Persist timer state to TimeEntry", isCompleted: false },
        { title: "Aggregate time per task/project", isCompleted: false },
      ],
    },
    {
      title: "Chunk 2: Dashboard with real data",
      description: "Wire dashboard to database queries for projects, tasks, timers, and activity feed.",
      category: "Feature",
      priority: "MEDIUM",
      status: "TODO",
      estimatedDuration: 6 * 3600,
      actualDuration: 0,
      checklist: [
        { title: "Project stats cards", isCompleted: false },
        { title: "Recent activity feed from ledger", isCompleted: false },
        { title: "Active timers widget", isCompleted: false },
        { title: "Task status breakdown", isCompleted: false },
      ],
    },
  ];

  let actualHoursTotal = 0;
  const now = Date.now();
  let timeOffset = 10 * 24 * 3600 * 1000; // start ~10 days ago

  for (const t of tasks) {
    const task = await prisma.task.create({
      data: {
        title: t.title,
        description: t.description,
        projectId: project.id,
        category: t.category,
        priority: t.priority,
        status: t.status,
        estimatedDuration: t.estimatedDuration,
        actualDuration: t.actualDuration,
        startDate: t.status !== "TODO" ? new Date(now - timeOffset) : null,
        dueDate: t.status === "TODO" ? new Date(now + 7 * 24 * 3600 * 1000) : new Date(now - timeOffset + t.estimatedDuration * 1000),
      },
    });

    if (t.actualDuration > 0) {
      actualHoursTotal += t.actualDuration;
      await prisma.timeEntry.create({
        data: {
          taskId: task.id,
          startTime: new Date(now - timeOffset),
          endTime: new Date(now - timeOffset + t.actualDuration * 1000),
          pausedSeconds: 0,
          isRunning: false,
        },
      });
    }

    if (t.checklist && t.checklist.length > 0) {
      await prisma.checklistItem.createMany({
        data: t.checklist.map((c, i) => ({
          taskId: task.id,
          title: c.title,
          isCompleted: c.isCompleted,
          order: i,
        })),
      });
    }

    await prisma.activityLedger.createMany({
      data: [
        {
          eventType: "TASK_CREATED",
          entityType: "Task",
          entityId: task.id,
          projectId: project.id,
          taskId: task.id,
          notes: `Created task: ${t.title}`,
        },
        ...(t.status !== "TODO"
          ? [
              {
                eventType: "TIMER_STARTED",
                entityType: "TimeEntry",
                entityId: task.id,
                projectId: project.id,
                taskId: task.id,
                notes: `Timer started for ${t.title}`,
              },
              {
                eventType: "TIMER_STOPPED",
                entityType: "TimeEntry",
                entityId: task.id,
                projectId: project.id,
                taskId: task.id,
                durationSeconds: t.actualDuration,
                notes: `Timer stopped for ${t.title}`,
              },
              {
                eventType: "TASK_STATUS_CHANGED",
                entityType: "Task",
                entityId: task.id,
                projectId: project.id,
                taskId: task.id,
                oldValue: "TODO",
                newValue: t.status,
                notes: `Task marked ${t.status}`,
              },
            ]
          : []),
      ],
    });

    timeOffset -= (t.actualDuration + 3600) * 1000;
    if (timeOffset < 0) timeOffset = 0;
  }

  await prisma.project.update({
    where: { id: project.id },
    data: {
      actualHours: Math.round((actualHoursTotal / 3600) * 10) / 10,
      remainingHours: Math.round((160 - actualHoursTotal / 3600) * 10) / 10,
    },
  });

  await prisma.activityLedger.createMany({
    data: [
      {
        eventType: "USER_LOGGED_IN",
        entityType: "User",
        entityId: user.id,
        notes: "Initial seed login",
      },
      {
        eventType: "PROJECT_CREATED",
        entityType: "Project",
        entityId: project.id,
        projectId: project.id,
        notes: "Self-tracking project created",
      },
    ],
  });

  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const todoCount = tasks.filter((t) => t.status === "TODO").length;

  console.log("Seed completed.");
  console.log(`  User: ${user.email} / password: admin123`);
  console.log(`  Project: ${project.name}`);
  console.log(`  Tasks: ${tasks.length} total (${completedCount} completed, ${todoCount} todo)`);
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
