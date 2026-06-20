import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { formatZodError, reportsQuerySchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth();
    if (!user) return authResponse;

    const { searchParams } = new URL(req.url);
    const query = reportsQuerySchema.safeParse({ period: searchParams.get("period") || undefined });
    if (!query.success) {
      return NextResponse.json({ error: formatZodError(query.error) }, { status: 400 });
    }
    const period = query.data.period ?? "weekly";

    const now = new Date();
    let startDate: Date;
    const endDate = new Date(now);

    if (period === "daily") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // weekly
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
    }

    const [projects, tasks, timeEntries] = await Promise.all([
      prisma.project.findMany(),
      prisma.task.findMany({
        where: { updatedAt: { gte: startDate, lte: endDate } },
        include: { project: true },
      }),
      prisma.timeEntry.findMany({
        where: { startTime: { gte: startDate, lte: endDate } },
        include: { task: { include: { project: true } } },
      }),
    ]);

    const projectSummary = projects.map((p) => {
      const projectTasks = tasks.filter((t) => t.projectId === p.id);
      const projectEntries = timeEntries.filter((e) => e.task.projectId === p.id);
      const actualSeconds = projectEntries.reduce((sum, e) => {
        if (!e.endTime) return sum;
        return sum + Math.floor((e.endTime.getTime() - e.startTime.getTime()) / 1000) - e.pausedSeconds;
      }, 0);
      const completedTasks = projectTasks.filter((t) => t.status === "COMPLETED").length;
      return {
        id: p.id,
        name: p.name,
        estimatedHours: p.estimatedHours,
        actualHours: Math.round((actualSeconds / 3600) * 10) / 10,
        taskCount: projectTasks.length,
        completedTasks,
      };
    });

    const totalEstimated = projects.reduce((sum, p) => sum + p.estimatedHours, 0);
    const totalActualSeconds = timeEntries.reduce((sum, e) => {
      if (!e.endTime) return sum;
      return sum + Math.floor((e.endTime.getTime() - e.startTime.getTime()) / 1000) - e.pausedSeconds;
    }, 0);
    const totalActual = Math.round((totalActualSeconds / 3600) * 10) / 10;
    const productivity = totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0;

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      summary: {
        totalEstimated,
        totalActual,
        productivity,
        taskCount: tasks.length,
        completedTasks: tasks.filter((t) => t.status === "COMPLETED").length,
      },
      projectSummary,
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        estimatedHours: Math.round((t.estimatedDuration / 3600) * 10) / 10,
        actualHours: Math.round((t.actualDuration / 3600) * 10) / 10,
        projectName: t.project?.name || "",
      })),
    });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
