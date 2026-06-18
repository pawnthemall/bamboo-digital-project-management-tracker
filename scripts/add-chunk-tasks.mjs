import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

async function main() {
  const project = await prisma.project.findFirst();
  if (!project) {
    console.log("No project found.");
    return;
  }

  const chunkTasks = [
    {
      title: "Chunk 5: Task System",
      description: "Full task CRUD with checklist support, task forms, filters, and ledger events.",
      category: "Feature",
      priority: "HIGH",
      status: "TODO",
      estimatedDuration: 10 * 3600,
      checklist: [
        { title: "Task CRUD API routes", isCompleted: false },
        { title: "TaskCard component with priority/status badges", isCompleted: false },
        { title: "TasksPage with filters", isCompleted: false },
        { title: "Checklist items per task with toggles", isCompleted: false },
        { title: "Ledger events for task lifecycle", isCompleted: false },
      ],
    },
    {
      title: "Chunk 6: Interactive Timer",
      description: "Start/pause/resume/stop timer with real-time tracking, persistence, and ledger events.",
      category: "Feature",
      priority: "HIGH",
      status: "TODO",
      estimatedDuration: 8 * 3600,
      checklist: [
        { title: "Timer API routes (start/pause/resume/stop/complete)", isCompleted: false },
        { title: "useTaskTimer hook with setInterval", isCompleted: false },
        { title: "Persist timer state to Zustand + localStorage", isCompleted: false },
        { title: "Resume timer on app load from DB", isCompleted: false },
        { title: "Manual duration edit with ledger event", isCompleted: false },
      ],
    },
    {
      title: "Chunk 7: Dashboard Charts & Widgets",
      description: "Data-rich dashboard with Recharts burn-down, pie charts, activity feed, and live metrics.",
      category: "Feature",
      priority: "MEDIUM",
      status: "TODO",
      estimatedDuration: 6 * 3600,
      checklist: [
        { title: "Burn-down chart (remaining hours over time)", isCompleted: false },
        { title: "Pie chart: time by project", isCompleted: false },
        { title: "Bar chart: time by category", isCompleted: false },
        { title: "Activity feed from ActivityLedger", isCompleted: false },
        { title: "Upcoming tasks widget (due within 7 days)", isCompleted: false },
      ],
    },
    {
      title: "Chunk 8: Basic Reports",
      description: "Daily, weekly, monthly summary pages with variance, completion rate, and CSV export.",
      category: "Feature",
      priority: "MEDIUM",
      status: "TODO",
      estimatedDuration: 5 * 3600,
      checklist: [
        { title: "ReportsPage with Daily/Weekly/Monthly tabs", isCompleted: false },
        { title: "Estimated vs actual hours tables", isCompleted: false },
        { title: "Productivity trend line chart", isCompleted: false },
        { title: "Project breakdown table", isCompleted: false },
        { title: "CSV export (client-side)", isCompleted: false },
      ],
    },
    {
      title: "Chunk 9: Settings",
      description: "App configuration: accent color selector, work hours, timezone, database backup/restore.",
      category: "Feature",
      priority: "LOW",
      status: "TODO",
      estimatedDuration: 4 * 3600,
      checklist: [
        { title: "Accent color selector (purple, red, orange, blue, cyan)", isCompleted: false },
        { title: "Default work hours and timezone inputs", isCompleted: false },
        { title: "Backup database (download .db file)", isCompleted: false },
        { title: "Restore database (upload with confirmation)", isCompleted: false },
        { title: "Export/import JSON for projects/tasks", isCompleted: false },
      ],
    },
    {
      title: "Chunk 10: Integration, Polish & Roadmap",
      description: "Tie everything together: animations, error boundaries, Zustand store, Kanban placeholder, final walkthrough.",
      category: "Polish",
      priority: "MEDIUM",
      status: "TODO",
      estimatedDuration: 8 * 3600,
      checklist: [
        { title: "Framer Motion animations (modal, drawer, sidebar)", isCompleted: false },
        { title: "Global Zustand store setup", isCompleted: false },
        { title: "React Query with staleTime/gcTime", isCompleted: false },
        { title: "Error boundaries and loading states", isCompleted: false },
        { title: "Roadmap Kanban placeholder (5 columns)", isCompleted: false },
        { title: "Timeline and Calendar placeholders", isCompleted: false },
        { title: "End-to-end walkthrough test", isCompleted: false },
      ],
    },
  ];

  for (const t of chunkTasks) {
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
        actualDuration: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
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

    console.log(`Created: ${t.title}`);
  }

  // Update project remaining hours
  const allTasks = await prisma.task.findMany({ where: { projectId: project.id } });
  const remainingDuration = allTasks
    .filter((t) => t.status === "TODO")
    .reduce((sum, t) => sum + (t.estimatedDuration || 0), 0);

  await prisma.project.update({
    where: { id: project.id },
    data: {
      remainingHours: Math.round((remainingDuration / 3600) * 10) / 10,
    },
  });

  const todo = allTasks.filter((t) => t.status === "TODO").length;
  const completed = allTasks.filter((t) => t.status === "COMPLETED").length;
  console.log(`\nProject updated: ${completed} completed, ${todo} todo`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
