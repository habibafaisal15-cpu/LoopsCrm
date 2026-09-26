import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { publicEmployee } from "./serialize";
import type { Employee } from "@/data/types";

const COOKIE = "loops_session";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(value);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function createSession(employeeId: string) {
  const token = await new SignJWT({ sub: employeeId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function readSessionId() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function getCurrentEmployee(): Promise<Employee | null> {
  const id = await readSessionId();
  if (!id) return null;
  const row = await db.employee.findUnique({ where: { id } });
  if (!row || row.status !== "active") return null;
  return publicEmployee(row);
}

export async function requireEmployee() {
  const employee = await getCurrentEmployee();
  if (!employee) {
    throw new AuthError("Sign in to continue");
  }
  return employee;
}

export class AuthError extends Error {
  status = 401;
}

export function canSeeAllWork(role: string) {
  return role === "admin" || role === "manager";
}

export function canSeeLeadDetails(role: string) {
  return role === "admin" || role === "sales";
}

export function canAssignWork(role: string) {
  return role === "admin";
}
