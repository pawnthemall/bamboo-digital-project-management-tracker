import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const devices = await prisma.trustedDevice.findMany({
      where: { userId: user.id },
      orderBy: { lastUsedAt: "desc" },
      select: {
        id: true,
        deviceName: true,
        browser: true,
        os: true,
        ipAddress: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ devices });
  } catch (error) {
    console.error("GET /api/devices error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
