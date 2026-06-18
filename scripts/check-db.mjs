import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const projects = await p.project.findMany();
console.log("Projects count:", projects.length);
for (const proj of projects) {
  console.log(" -", proj.name, "| status:", proj.status, "| id:", proj.id);
}
const tasks = await p.task.findMany({ where: { projectId: projects[0]?.id } });
console.log("Tasks for first project:", tasks.length);
await p.$disconnect();
