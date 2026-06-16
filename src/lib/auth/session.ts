import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";

export type SessionUser = { id: string; email: string; name: string; role: string };

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function signSession(user: SessionUser) {
  return jwt.sign(user, env.AUTH_SECRET, { expiresIn: "7d" });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, env.AUTH_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function requireAdmin(roles: string[] = ["owner", "manager", "sales", "installer", "viewer"]) {
  const session = await getSessionUser();
  if (!session || !roles.includes(session.role)) return null;
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  return user;
}
