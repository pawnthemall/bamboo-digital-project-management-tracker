import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createLedgerEvent } from "@/lib/ledger";
import { formatZodError, timerActionSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth();
    if (!user) return authResponse;

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    const where: Record<string, unknown> = { isRunning: true, userId: user.id };
    if (taskId) where.taskId = taskId;

    const entry = await prisma.timeEntry.findFirst({
      where,
      orderBy: { startTime: "desc" },
      include: { task: { include: { project: true } } },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("GET /api/timer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth();
    if (!user) return authResponse;

    const raw = await req.json();
    const parsed = timerActionSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { action, taskId, entryId, pausedSeconds } = parsed.data;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    switch (action) {
      case "start": {
        // Stop any other running timers for this user first
        await prisma.timeEntry.updateMany({
          where: { isRunning: true, userId: user.id },
          data: { isRunning: false, endTime: new Date() },
        });

        const entry = await prisma.timeEntry.create({
          data: {
            taskId,
            userId: user.id,
            startTime: new Date(),
            isRunning: true,
            pausedSeconds: 0,
          },
        });

        await prisma.task.update({
          where: { id: taskId },
          data: { status: "IN_PROGRESS" },
        });

        await createLedgerEvent({
          eventType: "TIMER_STARTED",
          entityType: "TimeEntry",
          entityId: entry.id,
          projectId: task.projectId,
          taskId,
          notes: `Timer started for task: ${task.title}`,
        });

        return NextResponse.json({ entry });
      }

      case "pause": {
        if (!entryId) {
          return NextResponse.json({ error: "entryId is required for pause" }, { status: 400 });
        }

        const entry = await prisma.timeEntry.update({
          where: { id: entryId, userId: user.id },
          data: {
            endTime: new Date(),
            isRunning: false,
            pausedSeconds: pausedSeconds || 0,
          },
        });

        await createLedgerEvent({
          eventType: "TIMER_PAUSED",
          entityType: "TimeEntry",
          entityId: entry.id,
          projectId: task.projectId,
          taskId,
          notes: `Timer paused for task: ${task.title}`,
        });

        return NextResponse.json({ entry });
      }

      case "resume": {
        if (!entryId) {
          return NextResponse.json({ error: "entryId is required for resume" }, { status: 400 });
        }

        // Get previous entry to carry over pausedSeconds
        const prevEntry = await prisma.timeEntry.findUnique({ where: { id: entryId, userId: user.id } });
        const carryPaused = prevEntry?.pausedSeconds || 0;

        // Stop any other running timers for this user first
        await prisma.timeEntry.updateMany({
          where: { isRunning: true, userId: user.id },
          data: { isRunning: false, endTime: new Date() },
        });

        const entry = await prisma.timeEntry.create({
          data: {
            taskId,
            userId: user.id,
            startTime: new Date(),
            isRunning: true,
            pausedSeconds: carryPaused,
          },
        });

        await prisma.task.update({
          where: { id: taskId },
          data: { status: "IN_PROGRESS" },
        });

        await createLedgerEvent({
          eventType: "TIMER_RESUMED",
          entityType: "TimeEntry",
          entityId: entry.id,
          projectId: task.projectId,
          taskId,
          notes: `Timer resumed for task: ${task.title}`,
        });

        return NextResponse.json({ entry });
      }

      case "stop": {
        if (!entryId) {
          return NextResponse.json({ error: "entryId is required for stop" }, { status: 400 });
        }

        const now = new Date();
        const entry = await prisma.timeEntry.update({
          where: { id: entryId, userId: user.id },
          data: {
            endTime: now,
            isRunning: false,
            pausedSeconds: pausedSeconds || 0,
          },
        });

        // Calculate total duration and update task
        const allEntries = await prisma.timeEntry.findMany({
          where: { taskId, endTime: { not: null } },
        });
        const totalSeconds = allEntries.reduce((sum, e) => {
          if (!e.endTime) return sum;
          return sum + Math.floor((e.endTime.getTime() - e.startTime.getTime()) / 1000) - (e.pausedSeconds || 0);
        }, 0);

        await prisma.task.update({
          where: { id: taskId },
          data: { actualDuration: totalSeconds },
        });

        await createLedgerEvent({
          eventType: "TIMER_STOPPED",
          entityType: "TimeEntry",
          entityId: entry.id,
          projectId: task.projectId,
          taskId,
          durationSeconds: totalSeconds,
          notes: `Timer stopped for task: ${task.title}`,
        });

        return NextResponse.json({ entry, totalSeconds });
      }

      case "complete": {
        if (!entryId) {
          return NextResponse.json({ error: "entryId is required for complete" }, { status: 400 });
        }

        const now = new Date();
        const entry = await prisma.timeEntry.update({
          where: { id: entryId, userId: user.id },
          data: {
            endTime: now,
            isRunning: false,
            pausedSeconds: pausedSeconds || 0,
          },
        });

        const allEntries = await prisma.timeEntry.findMany({
          where: { taskId, endTime: { not: null } },
        });
        const totalSeconds = allEntries.reduce((sum, e) => {
          if (!e.endTime) return sum;
          return sum + Math.floor((e.endTime.getTime() - e.startTime.getTime()) / 1000) - (e.pausedSeconds || 0);
        }, 0);

        await prisma.task.update({
          where: { id: taskId },
          data: { actualDuration: totalSeconds, status: "COMPLETED", dueDate: now },
        });

        await createLedgerEvent({
          eventType: "TIMER_COMPLETED",
          entityType: "TimeEntry",
          entityId: entry.id,
          projectId: task.projectId,
          taskId,
          durationSeconds: totalSeconds,
          notes: `Timer completed for task: ${task.title}`,
        });

        return NextResponse.json({ entry, totalSeconds });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("POST /api/timer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
