import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./db";

const SESSION_DAYS = 30;

export async function createSession(userId: string) {
  const id = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await prisma.session.create({ data: { id, userId, expiresAt } });
  return { id, expiresAt };
}

export async function setSessionCookie(response: NextResponse, sessionId: string, expiresAt: Date) {
  response.cookies.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt
  });
}

export async function getCurrentUser(req: NextRequest) {
  const id = req.cookies.get("session")?.value;
  if (!id) return null;
  const session = await prisma.session.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, name: true, role: true } } }
  });
  if (!session || session.expiresAt <= new Date()) {
    if (session) await prisma.session.delete({ where: { id } }).catch(() => {});
    return null;
  }
  return session.user;
}

export async function requireAdmin(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) throw new Response("Unauthorized", { status: 401 });
  if (user.role !== "ADMIN") throw new Response("Forbidden", { status: 403 });
  return user;
}