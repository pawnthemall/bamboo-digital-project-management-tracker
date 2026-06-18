import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLedgerEvent } from "@/lib/ledger";

export async function GET() {
  try {
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
    const body = await req.json();
    const { name, description, status, color, startDate, targetDate, estimatedHours } = body;

    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || "",
        status: status || "ACTIVE",
        color: color || "#00ff66",
        startDate: startDate ? new Date(startDate) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        estimatedHours: estimatedHours || 0,
        actualHours: 0,
        remainingHours: estimatedHours || 0,
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
