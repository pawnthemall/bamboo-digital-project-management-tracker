import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createLedgerEvent } from "@/lib/ledger";
import { createTaskSchema, formatZodError } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth();
    if (!user) return authResponse;

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: { project: true, checklistItems: true, timeEntries: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth();
    if (!user) return authResponse;

    const raw = await req.json();
    const parsed = createTaskSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { title, description, projectId, category, priority, status, estimatedDuration, startDate, dueDate, assigneeId, checklist } = parsed.data;

    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? "",
        projectId,
        assigneeId: assigneeId ?? null,
        category: category ?? "",
        priority: priority ?? "MEDIUM",
        status: status ?? "TODO",
        estimatedDuration: estimatedDuration ?? 0,
        actualDuration: 0,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    if (checklist && checklist.length > 0) {
      await prisma.checklistItem.createMany({
        data: checklist.map((item, index) => ({
          title: item,
          taskId: task.id,
          order: index,
        })),
      });
    }

    await createLedgerEvent({
      eventType: "TASK_CREATED",
      entityType: "Task",
      entityId: task.id,
      projectId: task.projectId,
      taskId: task.id,
      notes: `Created task: ${task.title}`,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
