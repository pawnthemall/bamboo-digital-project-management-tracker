import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLedgerEvent } from "@/lib/ledger";

export async function GET(req: NextRequest) {
  try {
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
    const body = await req.json();
    const { title, description, projectId, category, priority, status, estimatedDuration, startDate, dueDate, assigneeId } = body;

    if (!title || !projectId) {
      return NextResponse.json({ error: "Title and projectId are required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        projectId,
        assigneeId: assigneeId || null,
        category: category || "",
        priority: priority || "MEDIUM",
        status: status || "TODO",
        estimatedDuration: estimatedDuration || 0,
        actualDuration: 0,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

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
