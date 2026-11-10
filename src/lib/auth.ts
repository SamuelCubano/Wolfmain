import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import prisma from "@/prisma/client";

const JWT_SECRET = process.env.NEXTAUTH_SECRET!;
if (!JWT_SECRET) throw new Error("NEXTAUTH_SECRET environment variable is required");
const COOKIE_NAME = "wolfmain_session";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export type SessionUser = {
  id: string;
  email: string;
  username: string;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { id: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };
    return { id: decoded.id, email: decoded.email, username: "" };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  await connection();
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, username: true },
  });

  if (!user) return null;

  return { id: user.id, email: user.email, username: user.username };
}

export async function setSessionCookie(userId: string, email: string) {
  const token = signToken({ id: userId, email });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function requireAuth() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function createSessionRecord(
  userId: string,
  refreshToken: string,
  expiresAt: Date,
  userAgent?: string,
  ipAddress?: string
) {
  await prisma.session.create({
    data: {
      user_id: userId,
      refresh_token: refreshToken,
      user_agent: userAgent ?? null,
      ip_address: ipAddress ?? null,
      expires_at: expiresAt,
    },
  });
}
