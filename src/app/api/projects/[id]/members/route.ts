import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { formatZodError, projectMemberSchema } from "@/lib/validation";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response: authResponse } = await requireAuth();
    if (!user) return authResponse;

    const { id: projectId } = await params;
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ members });
  } catch (error) {
    console.error("GET /api/projects/[id]/members error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const raw = await req.json();
    const parsed = projectMemberSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { userId, role = "MEMBER" } = parsed.data;

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const raw = await req.json();
    const parsed = projectMemberSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { userId, role } = parsed.data;
    if (!role) {
      return NextResponse.json({ error: "role is required" }, { status: 400 });
    }

    const isAdmin = currentUser.role === "ADMIN";
    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId: currentUser.id },
    });
    const isManager = membership?.role === "MANAGER";

    if (!isAdmin && !isManager) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.projectMember.updateMany({
      where: { projectId, userId },
      data: { role },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/projects/[id]/members error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
