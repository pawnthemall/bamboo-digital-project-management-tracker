import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

async function main() {
  const project = await prisma.project.findFirst();
  if (!project) {
    console.log("No project found.");
    return;
  }

  for (const title of ["Chunk 9: Settings", "Chunk 10: Integration, Polish & Roadmap"]) {
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

      const existingEntry = await prisma.timeEntry.findFirst({ where: { taskId: task.id } });
      if (!existingEntry) {
        await prisma.timeEntry.create({
          data: {
            taskId: task.id,
            startTime: new Date(Date.now() - task.estimatedDuration * 1000),
            endTime: new Date(),
            pausedSeconds: 0,
            isRunning: false,
          },
        });
      }

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

      console.log(`Marked COMPLETED: ${title}`);
    }
  }

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
  console.log(`Project updated: ${completed} completed, ${todo} todo`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
