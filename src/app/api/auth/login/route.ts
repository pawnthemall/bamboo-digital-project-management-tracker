import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { createLedgerEvent } from "@/lib/ledger";
import { formatZodError, loginSchema } from "@/lib/validation";
import { randomUUID } from "crypto";

function parseDeviceInfo(userAgent: string) {
  const browser = /Edg\/\d+/.test(userAgent) ? "Edge"
    : /OPR\/\d+|Opera/.test(userAgent) ? "Opera"
    : /Chrome\/\d+/.test(userAgent) ? "Chrome"
    : /Firefox\/\d+/.test(userAgent) ? "Firefox"
    : /Safari\/\d+/.test(userAgent) ? "Safari"
    : "Unknown";

  const os = /Windows NT/.test(userAgent) ? "Windows"
    : /Mac OS X|macOS/.test(userAgent) ? "macOS"
    : /Android/.test(userAgent) ? "Android"
    : /iPhone|iPad|iPod/.test(userAgent) ? "iOS"
    : /Linux/.test(userAgent) ? "Linux"
    : "Unknown";

  const deviceType = /Mobile|Android|iPhone|iPad|iPod/.test(userAgent) ? "Mobile" : "Desktop";

  return { browser, os, deviceType };
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { email, password, rememberMe } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(user.passwordHash, password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const userAgent = req.headers.get("user-agent") || "";
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || "127.0.0.1";
    const { browser, os, deviceType } = parseDeviceInfo(userAgent);
    const deviceName = `${browser} on ${os} (${deviceType})`;

    let token: string;
    let maxAge: number;

    if (rememberMe) {
      const deviceToken = randomUUID();
      await prisma.trustedDevice.create({
        data: {
          userId: user.id,
          deviceName,
          browser,
          os,
          ipAddress,
          userAgent,
          deviceToken,
        },
      });
      token = await signToken({ userId: user.id, email: user.email, deviceToken });
      maxAge = 60 * 60 * 24 * 30; // 30 days
    } else {
      token = await signToken({ userId: user.id, email: user.email });
      maxAge = 60 * 60 * 24; // 1 day
    }

    await createLedgerEvent({
      eventType: "USER_LOGGED_IN",
      entityType: "User",
      entityId: user.id,
      notes: `User logged in: ${user.email}${rememberMe ? " (remember me)" : ""}`,
    });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role, workHours: user.workHours, timezone: user.timezone },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
