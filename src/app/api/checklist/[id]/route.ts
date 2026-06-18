import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLedgerEvent } from "@/lib/ledger";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isCompleted } = body;

    const existing = await prisma.checklistItem.findUnique({
      where: { id },
      include: { task: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });
    }

    const item = await prisma.checklistItem.update({
      where: { id },
      data: { isCompleted: !!isCompleted },
    });

    if (isCompleted && !existing.isCompleted) {
      await createLedgerEvent({
        eventType: "CHECKLIST_ITEM_COMPLETED",
        entityType: "ChecklistItem",
        entityId: item.id,
        projectId: existing.task.projectId,
        taskId: item.taskId,
        notes: `Checklist item completed: ${item.title}`,
      });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("PATCH /api/checklist/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
