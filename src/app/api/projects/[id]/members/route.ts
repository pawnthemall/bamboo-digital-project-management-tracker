import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const { userId, role = "MEMBER" } = await req.json();

    // Check if current user is ADMIN or project manager
    const isAdmin = currentUser.role === "ADMIN";
    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId: currentUser.id },
    });
    const isManager = membership?.role === "MANAGER";

    if (!isAdmin && !isManager) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const member = await prisma.projectMember.create({
      data: { projectId, userId, role },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects/[id]/members error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const isAdmin = currentUser.role === "ADMIN";
    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId: currentUser.id },
    });
    const isManager = membership?.role === "MANAGER";

    if (!isAdmin && !isManager) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.projectMember.deleteMany({
      where: { projectId, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/projects/[id]/members error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
