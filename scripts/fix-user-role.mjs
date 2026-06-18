import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const user = await p.user.findFirst({
  orderBy: { createdAt: "asc" },
});

if (!user) {
  console.log("No user found");
  process.exit(1);
}

await p.user.update({
  where: { id: user.id },
  data: { role: "ADMIN" },
});

const project = await p.project.findFirst({
  orderBy: { createdAt: "asc" },
});

if (project) {
  const existing = await p.projectMember.findFirst({
    where: { projectId: project.id, userId: user.id },
  });

  if (!existing) {
    await p.projectMember.create({
      data: { projectId: project.id, userId: user.id, role: "MANAGER" },
    });
    console.log("Created project membership");
  } else {
    console.log("Membership already exists");
  }
}

console.log("User role set to ADMIN for:", user.email);
await p.$disconnect();
