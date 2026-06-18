import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay, format, startOfWeek, endOfWeek } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const now = new Date();
    const startDate = startOfDay(subDays(now, days));
    const endDate = endOfDay(now);

    // Daily hours logged
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        endTime: { not: null, gte: startDate, lte: endDate },
      },
      include: { task: { include: { project: true } } },
    });

    const dailyHours: Record<string, number> = {};
    for (const entry of timeEntries) {
      if (!entry.endTime) continue;
      const day = format(startOfDay(entry.endTime), "yyyy-MM-dd");
      const seconds = Math.floor((entry.endTime.getTime() - entry.startTime.getTime()) / 1000) - entry.pausedSeconds;
      dailyHours[day] = (dailyHours[day] || 0) + seconds / 3600;
    }

    const dailyHoursArray = Object.entries(dailyHours)
      .map(([date, hours]) => ({ date, hours: Math.round(hours * 10) / 10 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Weekly velocity: estimated vs actual
    const tasks = await prisma.task.findMany({
      where: {
        updatedAt: { gte: startDate, lte: endDate },
        status: "COMPLETED",
      },
      include: { timeEntries: true },
    });

    const weeklyVelocity: Record<string, { estimated: number; actual: number }> = {};
    for (const task of tasks) {
      const weekStart = format(startOfWeek(task.updatedAt), "yyyy-MM-dd");
      const actualSeconds = task.timeEntries.reduce((sum, e) => {
        if (!e.endTime) return sum;
        return sum + Math.floor((e.endTime.getTime() - e.startTime.getTime()) / 1000) - e.pausedSeconds;
      }, 0);
      const actualHours = actualSeconds / 3600;
      const estHours = task.estimatedDuration / 3600;
      if (!weeklyVelocity[weekStart]) weeklyVelocity[weekStart] = { estimated: 0, actual: 0 };
      weeklyVelocity[weekStart].estimated += estHours;
      weeklyVelocity[weekStart].actual += actualHours;
    }

    const velocityArray = Object.entries(weeklyVelocity)
      .map(([week, data]) => ({ week, estimated: Math.round(data.estimated * 10) / 10, actual: Math.round(data.actual * 10) / 10 }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // Completion rate over time (weekly)
    const allTasks = await prisma.task.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
    });

    const completionData: Record<string, { total: number; completed: number }> = {};
    for (const task of allTasks) {
      const week = format(startOfWeek(task.createdAt), "yyyy-MM-dd");
      if (!completionData[week]) completionData[week] = { total: 0, completed: 0 };
      completionData[week].total++;
      if (task.status === "COMPLETED") completionData[week].completed++;
    }

    const completionRateArray = Object.entries(completionData)
      .map(([week, data]) => ({
        week,
        rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // Category breakdown over time
    const categoryData: Record<string, Record<string, number>> = {};
    for (const entry of timeEntries) {
      if (!entry.endTime) continue;
      const week = format(startOfWeek(entry.endTime), "yyyy-MM-dd");
      const cat = entry.task.category || "Uncategorized";
      const seconds = Math.floor((entry.endTime.getTime() - entry.startTime.getTime()) / 1000) - entry.pausedSeconds;
      if (!categoryData[week]) categoryData[week] = {};
      categoryData[week][cat] = (categoryData[week][cat] || 0) + seconds / 3600;
    }

    const categoryArray = Object.entries(categoryData)
      .map(([week, cats]) => ({ week, ...cats }))
      .sort((a, b) => a.week.localeCompare(b.week));

    return NextResponse.json({
      dailyHours: dailyHoursArray,
      velocity: velocityArray,
      completionRate: completionRateArray,
      categoryBreakdown: categoryArray,
    });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
