import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const { user, response: authResponse } = await requireAuth();
    if (!user) return authResponse;

    const [projects, tasks, timeEntries, ledger] = await Promise.all([
      prisma.project.findMany(),
      prisma.task.findMany(),
      prisma.timeEntry.findMany(),
      prisma.activityLedger.findMany(),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      projects,
      tasks,
      timeEntries,
      activityLedger: ledger,
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
