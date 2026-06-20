import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const { user, response: authResponse } = await requireAuth();
    if (!user) return authResponse;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const sevenDays = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

    const [
      activeProjects,
      totalTasks,
      completedTasks,
      completedToday,
      completedThisWeek,
      timeEntries,
      upcomingTasks,
      recentlyCompleted,
      activityFeed,
      projects,
      tasksWithProject,
    ] = await Promise.all([
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: "COMPLETED" } }),
      prisma.task.count({ where: { status: "COMPLETED", updatedAt: { gte: startOfDay } } }),
      prisma.task.count({ where: { status: "COMPLETED", updatedAt: { gte: startOfWeek } } }),
      prisma.timeEntry.findMany({ where: { endTime: { not: null } }, include: { task: { include: { project: true } } } }),
      prisma.task.findMany({
        where: { status: "TODO", dueDate: { lte: sevenDays } },
        include: { project: true },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      prisma.task.findMany({
        where: { status: "COMPLETED" },
        include: { project: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.activityLedger.findMany({
        orderBy: { timestamp: "desc" },
        take: 10,
      }),
      prisma.project.findMany({ include: { tasks: true } }),
      prisma.task.findMany({ include: { project: true, timeEntries: true } }),
    ]);

    const totalSeconds = timeEntries.reduce((sum, entry) => {
      if (!entry.endTime) return sum;
      return sum + Math.floor((entry.endTime.getTime() - entry.startTime.getTime()) / 1000) - entry.pausedSeconds;
    }, 0);

    // Time by project for pie chart
    const timeByProject: Record<string, { name: string; hours: number }> = {};
    for (const entry of timeEntries) {
      const pid = entry.task.projectId;
      const name = entry.task.project?.name || "Unknown";
      const sec = entry.endTime
        ? Math.floor((entry.endTime.getTime() - entry.startTime.getTime()) / 1000) - entry.pausedSeconds
        : 0;
      if (!timeByProject[pid]) {
        timeByProject[pid] = { name, hours: 0 };
      }
      timeByProject[pid].hours += sec / 3600;
    }

    // Time by category for bar chart
    const timeByCategory: Record<string, number> = {};
    for (const task of tasksWithProject) {
      const cat = task.category || "Uncategorized";
      const sec = task.timeEntries.reduce((sum, e) => {
        if (!e.endTime) return sum;
        return sum + Math.floor((e.endTime.getTime() - e.startTime.getTime()) / 1000) - e.pausedSeconds;
      }, 0);
      timeByCategory[cat] = (timeByCategory[cat] || 0) + sec / 3600;
    }

    // Burn-down: remaining hours per project
    const burnDown = projects.map((p) => ({
      name: p.name,
      estimated: p.estimatedHours,
      actual: p.actualHours,
      remaining: Math.max(0, p.remainingHours),
    }));

    return NextResponse.json({
      stats: {
        totalHours: (totalSeconds / 3600).toFixed(1),
        activeProjects,
        totalTasks,
        completedTasks,
        completedToday,
        completedThisWeek,
      },
      upcomingTasks,
      recentlyCompleted,
      activityFeed,
      charts: {
        timeByProject: Object.values(timeByProject).map((x) => ({ name: x.name, hours: Math.round(x.hours * 10) / 10 })),
        timeByCategory: Object.entries(timeByCategory).map(([name, hours]) => ({ name, hours: Math.round(hours * 10) / 10 })),
        burnDown,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
