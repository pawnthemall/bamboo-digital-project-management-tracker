import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in database:");
  for (const u of users) {
    console.log(`  ${u.email} (id=${u.id})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
