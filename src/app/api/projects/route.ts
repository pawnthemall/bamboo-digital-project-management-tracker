import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createLedgerEvent } from "@/lib/ledger";
import { createProjectSchema, formatZodError } from "@/lib/validation";

export async function GET() {
  try {
    const { user, response: authResponse } = await requireAuth();
    if (!user) return authResponse;

    const projects = await prisma.project.findMany({
      include: { tasks: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth();
    if (!user) return authResponse;

    const raw = await req.json();
    const parsed = createProjectSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { name, description, status, color, startDate, targetDate, estimatedHours } = parsed.data;

    const project = await prisma.project.create({
      data: {
        name,
        description: description ?? "",
        status: status ?? "ACTIVE",
        color: color ?? "#00ff66",
        startDate: startDate ? new Date(startDate) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        estimatedHours: estimatedHours ?? 0,
        actualHours: 0,
        remainingHours: estimatedHours ?? 0,
      },
    });

    await createLedgerEvent({
      eventType: "PROJECT_CREATED",
      entityType: "Project",
      entityId: project.id,
      projectId: project.id,
      notes: `Created project: ${project.name}`,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
