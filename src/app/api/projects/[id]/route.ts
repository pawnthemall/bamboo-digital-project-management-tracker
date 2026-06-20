import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createLedgerEvent } from "@/lib/ledger";
import { formatZodError, updateProjectSchema } from "@/lib/validation";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response: authResponse } = await requireAuth();
    if (!user) return authResponse;

    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: { tasks: { include: { checklistItems: true, assignee: { select: { id: true, email: true, name: true } } }, orderBy: { createdAt: "desc" } } },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
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
    const parsed = updateProjectSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { name, description, status, color, startDate, targetDate, estimatedHours, actualHours, remainingHours } = parsed.data;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(color !== undefined && { color }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
        ...(estimatedHours !== undefined && { estimatedHours }),
        ...(actualHours !== undefined && { actualHours }),
        ...(remainingHours !== undefined && { remainingHours }),
      },
    });

    await createLedgerEvent({
      eventType: "PROJECT_UPDATED",
      entityType: "Project",
      entityId: project.id,
      projectId: project.id,
      oldValue: existing.status,
      newValue: status || existing.status,
      notes: `Updated project: ${project.name}`,
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("PATCH /api/projects/[id] error:", error);
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

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.project.delete({ where: { id } });

    await createLedgerEvent({
      eventType: "PROJECT_DELETED",
      entityType: "Project",
      entityId: id,
      notes: `Deleted project: ${existing.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
