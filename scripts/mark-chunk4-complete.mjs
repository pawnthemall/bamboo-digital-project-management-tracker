import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

async function main() {
  const project = await prisma.project.findFirst();
  if (!project) {
    console.log("No project found.");
    return;
  }

  const chunk4Titles = [
    "Chunk 3: Project CRUD API routes",
    "Chunk 3: ProjectCard and ProjectsPage grid",
    "Chunk 3: Project detail page with tabs",
    "Chunk 3: Project create/edit modal",
  ];

  let totalActual = 0;
  for (const title of chunk4Titles) {
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
      await prisma.checklistItem.updateMany({
        where: { taskId: task.id },
        data: { isCompleted: true },
      });
      totalActual += task.estimatedDuration;
      console.log(`Marked COMPLETED: ${title}`);
    }
  }

  // Add time entries for completed chunk tasks
  const now = Date.now();
  for (const title of chunk4Titles) {
    const task = await prisma.task.findFirst({ where: { title } });
    if (task && task.actualDuration > 0) {
      const existing = await prisma.timeEntry.findFirst({ where: { taskId: task.id } });
      if (!existing) {
        await prisma.timeEntry.create({
          data: {
            taskId: task.id,
            startTime: new Date(now - task.actualDuration * 1000),
            endTime: new Date(),
            pausedSeconds: 0,
            isRunning: false,
          },
        });
      }
    }
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

  // Add ledger events
  for (const title of chunk4Titles) {
    const task = await prisma.task.findFirst({ where: { title } });
    if (task) {
      await prisma.activityLedger.create({
        data: {
          eventType: "TASK_STATUS_CHANGED",
          entityType: "Task",
          entityId: task.id,
          projectId: project.id,
          taskId: task.id,
          oldValue: "TODO",
          newValue: "COMPLETED",
          notes: `Task marked COMPLETED: ${title}`,
        },
      });
    }
  }

  const completed = allTasks.filter((t) => t.status === "COMPLETED").length;
  const todo = allTasks.filter((t) => t.status === "TODO").length;
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
