import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { createLedgerEvent } from "@/lib/ledger";
import { formatZodError, registerSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash },
    });

    const token = await signToken({ userId: user.id, email: user.email });

    await createLedgerEvent({
      eventType: "USER_LOGGED_IN",
      entityType: "User",
      entityId: user.id,
      notes: `User registered and logged in: ${user.email}`,
    });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, workHours: user.workHours, timezone: user.timezone },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
