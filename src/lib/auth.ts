import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "bamboo-digital-secret-key-change-in-production"
);

export async function signToken(payload: { userId: string; email: string; deviceToken?: string }) {
  const jwt = new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt();

  if (payload.deviceToken) {
    jwt.setExpirationTime("30d");
  } else {
    jwt.setExpirationTime("1d");
  }

  return jwt.sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET, { clockTolerance: 60 });
    return payload as { userId: string; email: string; deviceToken?: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  if (payload.deviceToken) {
    const device = await prisma.trustedDevice.findUnique({
      where: { deviceToken: payload.deviceToken },
    });
    if (!device) return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, name: true },
  });

  return user;
}
