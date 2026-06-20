import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createLedgerEvent } from "@/lib/ledger";
import { formatZodError, updateTaskSchema } from "@/lib/validation";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response: authResponse } = await requireAuth();
    if (!user) return authResponse;

    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true, checklistItems: true, timeEntries: true, assignee: { select: { id: true, email: true, name: true } } },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response: authResponse } = await requireAuth();
    if (!user) return authResponse;

    const { id } = await params;
    const raw = await req.json();
    const parsed = updateTaskSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { title, description, category, priority, status, estimatedDuration, actualDuration, startDate, dueDate, assigneeId } = parsed.data;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updateData: Prisma.TaskUncheckedUpdateInput = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
      ...(estimatedDuration !== undefined && { estimatedDuration }),
      ...(actualDuration !== undefined && { actualDuration }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
    };

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    if (status && status !== existing.status) {
      await createLedgerEvent({
        eventType: "TASK_STATUS_CHANGED",
        entityType: "Task",
        entityId: task.id,
        projectId: task.projectId,
        taskId: task.id,
        oldValue: existing.status,
        newValue: status,
        notes: `Task status changed from ${existing.status} to ${status}`,
      });
    } else {
      await createLedgerEvent({
        eventType: "TASK_UPDATED",
        entityType: "Task",
        entityId: task.id,
        projectId: task.projectId,
        taskId: task.id,
        notes: `Updated task: ${task.title}`,
      });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response: authResponse } = await requireAuth();
    if (!user) return authResponse;

    const { id } = await params;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({ where: { id } });

    await createLedgerEvent({
      eventType: "TASK_DELETED",
      entityType: "Task",
      entityId: id,
      projectId: existing.projectId,
      notes: `Deleted task: ${existing.title}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
