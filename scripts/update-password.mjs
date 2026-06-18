import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv(path) {
  const env = {};
  try {
    const text = readFileSync(path, "utf-8");
    for (const line of text.split("\n")) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?([^"]*)"?\s*$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {}
  return env;
}

const env = loadEnv(resolve(".env"));
const prisma = new PrismaClient({});

async function main() {
  const email = env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || "admin@bamboo.digital";
  const password = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await argon2.hash(password);

  const existing = await prisma.user.findFirst();
  if (!existing) {
    console.log("No users found in database.");
    return;
  }

  const user = await prisma.user.update({
    where: { id: existing.id },
    data: { email, passwordHash },
  });

  console.log(`Updated email and password for ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
