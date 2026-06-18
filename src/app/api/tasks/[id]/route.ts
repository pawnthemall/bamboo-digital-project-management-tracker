import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLedgerEvent } from "@/lib/ledger";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    const { id } = await params;
    const body = await req.json();
    const { title, description, projectId, category, priority, status, estimatedDuration, actualDuration, startDate, dueDate, assigneeId } = body;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(projectId !== undefined && { projectId }),
        ...(category !== undefined && { category }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(estimatedDuration !== undefined && { estimatedDuration }),
        ...(actualDuration !== undefined && { actualDuration }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
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
