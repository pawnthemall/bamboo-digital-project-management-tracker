import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

async function main() {
  const project = await prisma.project.findFirst();
  if (!project) {
    console.log("No project found.");
    return;
  }

  // 1. Mark Chunk 2 tasks as COMPLETED
  const chunk2Titles = [
    "Chunk 2: Authentication system",
    "Chunk 2: REST API routes",
    "Chunk 2: Timer functionality",
    "Chunk 2: Dashboard with real data",
  ];

  for (const title of chunk2Titles) {
    const task = await prisma.task.findFirst({ where: { title } });
    if (task) {
      await prisma.task.update({
        where: { id: task.id },
        data: {
          status: "COMPLETED",
          actualDuration: task.estimatedDuration,
          startDate: task.startDate || new Date(Date.now() - 2 * 24 * 3600 * 1000),
          dueDate: new Date(),
        },
      });
      // Mark all checklist items complete
      await prisma.checklistItem.updateMany({
        where: { taskId: task.id },
        data: { isCompleted: true },
      });
      console.log(`Marked COMPLETED: ${title}`);
    }
  }

  // 2. Add bonus completed tasks from this session
  const bonusTasks = [
    {
      title: "Fix argon2 Edge runtime compatibility in middleware",
      description: "Split auth.ts into Edge-safe JWT helpers and Node-only password hashing to resolve node:crypto errors.",
      category: "Infrastructure",
      priority: "HIGH",
      status: "COMPLETED",
      estimatedDuration: 1 * 3600,
      actualDuration: 1 * 3600,
      checklist: [
        { title: "Create lib/password.ts with argon2", isCompleted: true },
        { title: "Remove argon2 from lib/auth.ts", isCompleted: true },
        { title: "Update imports in login/register routes", isCompleted: true },
      ],
    },
    {
      title: "Move admin credentials to .env",
      description: "Extract hardcoded admin email and password to environment variables for security.",
      category: "Infrastructure",
      priority: "MEDIUM",
      status: "COMPLETED",
      estimatedDuration: 30 * 60,
      actualDuration: 30 * 60,
      checklist: [
        { title: "Add ADMIN_EMAIL and ADMIN_PASSWORD to .env", isCompleted: true },
        { title: "Update seed script to read from env", isCompleted: true },
        { title: "Remove hardcoded defaults from login form", isCompleted: true },
      ],
    },
    {
      title: "Redesign bd-icon.svg as angular lowercase bd",
      description: "Create geometric lowercase bd monogram with angular bowls, top gaps, and project green color.",
      category: "Design",
      priority: "MEDIUM",
      status: "COMPLETED",
      estimatedDuration: 1 * 3600,
      actualDuration: 1.5 * 3600,
      checklist: [
        { title: "Design angular b bowl with gap", isCompleted: true },
        { title: "Design angular d bowl with gap", isCompleted: true },
        { title: "Add counter cutouts", isCompleted: true },
        { title: "Remove bottom stem tails", isCompleted: true },
      ],
    },
  ];

  for (const t of bonusTasks) {
    const existing = await prisma.task.findFirst({ where: { title: t.title } });
    if (existing) {
      console.log(`Skipping (exists): ${t.title}`);
      continue;
    }

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
        startDate: new Date(Date.now() - 1 * 24 * 3600 * 1000),
        dueDate: new Date(),
      },
    });

    await prisma.checklistItem.createMany({
      data: t.checklist.map((c, i) => ({
        taskId: task.id,
        title: c.title,
        isCompleted: c.isCompleted,
        order: i,
      })),
    });

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
        {
          eventType: "TASK_STATUS_CHANGED",
          entityType: "Task",
          entityId: task.id,
          projectId: project.id,
          taskId: task.id,
          oldValue: "TODO",
          newValue: "COMPLETED",
          notes: `Task marked COMPLETED`,
        },
      ],
    });

    console.log(`Created bonus task: ${t.title}`);
  }

  // 3. Add Chunk 3 TODO tasks (Project Management)
  const chunk3Tasks = [
    {
      title: "Chunk 3: Project CRUD API routes",
      description: "Build REST endpoints for project list, detail, create, update, and delete with validation.",
      category: "Backend",
      priority: "HIGH",
      status: "TODO",
      estimatedDuration: 6 * 3600,
      actualDuration: 0,
      checklist: [
        { title: "GET /api/projects", isCompleted: false },
        { title: "POST /api/projects", isCompleted: false },
        { title: "GET /api/projects/[id]", isCompleted: false },
        { title: "PATCH /api/projects/[id]", isCompleted: false },
        { title: "DELETE /api/projects/[id]", isCompleted: false },
      ],
    },
    {
      title: "Chunk 3: ProjectCard and ProjectsPage grid",
      description: "Create project card component with status badge, color stripe, progress bar, and hour stats. Build grid layout.",
      category: "UI",
      priority: "HIGH",
      status: "TODO",
      estimatedDuration: 4 * 3600,
      actualDuration: 0,
      checklist: [
        { title: "Design ProjectCard component", isCompleted: false },
        { title: "Build ProjectsPage grid with sorting", isCompleted: false },
        { title: "Add status and color indicators", isCompleted: false },
      ],
    },
    {
      title: "Chunk 3: Project detail page with tabs",
      description: "Create project detail view with tab navigation: Overview, Tasks, Timeline, Roadmap, Reports, Notes.",
      category: "UI",
      priority: "HIGH",
      status: "TODO",
      estimatedDuration: 5 * 3600,
      actualDuration: 0,
      checklist: [
        { title: "Create project detail route /projects/[id]", isCompleted: false },
        { title: "Build tab navigation component", isCompleted: false },
        { title: "Implement Overview tab with stats", isCompleted: false },
        { title: "Implement Tasks tab with project filter", isCompleted: false },
        { title: "Add placeholder tabs for Timeline/Roadmap/Reports/Notes", isCompleted: false },
      ],
    },
    {
      title: "Chunk 3: Project create/edit modal",
      description: "Build animated modal form for creating and editing projects with validation.",
      category: "UI",
      priority: "MEDIUM",
      status: "TODO",
      estimatedDuration: 4 * 3600,
      actualDuration: 0,
      checklist: [
        { title: "Design modal layout with CRT styling", isCompleted: false },
        { title: "Add form fields: name, desc, status, color, dates, hours", isCompleted: false },
        { title: "Implement create flow with ledger event", isCompleted: false },
        { title: "Implement edit flow with ledger event", isCompleted: false },
      ],
    },
  ];

  for (const t of chunk3Tasks) {
    const existing = await prisma.task.findFirst({ where: { title: t.title } });
    if (existing) {
      console.log(`Skipping (exists): ${t.title}`);
      continue;
    }

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
        dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000),
      },
    });

    await prisma.checklistItem.createMany({
      data: t.checklist.map((c, i) => ({
        taskId: task.id,
        title: c.title,
        isCompleted: c.isCompleted,
        order: i,
      })),
    });

    await prisma.activityLedger.create({
      data: {
        eventType: "TASK_CREATED",
        entityType: "Task",
        entityId: task.id,
        projectId: project.id,
        taskId: task.id,
        notes: `Created task: ${t.title}`,
      },
    });

    console.log(`Created Chunk 3 task: ${t.title}`);
  }

  // Update project stats
  const allTasks = await prisma.task.findMany({ where: { projectId: project.id } });
  const completedDuration = allTasks
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + (t.actualDuration || 0), 0);
  const remainingDuration = allTasks
    .filter((t) => t.status === "TODO")
    .reduce((sum, t) => sum + (t.estimatedDuration || 0), 0);

  await prisma.project.update({
    where: { id: project.id },
    data: {
      actualHours: Math.round((completedDuration / 3600) * 10) / 10,
      remainingHours: Math.round((remainingDuration / 3600) * 10) / 10,
    },
  });

  const completed = allTasks.filter((t) => t.status === "COMPLETED").length;
  const todo = allTasks.filter((t) => t.status === "TODO").length;
  console.log(`\nUpdated project stats: ${completed} completed, ${todo} todo`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
