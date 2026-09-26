import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { createSession, verifyPassword } from "@/server/auth";
import { publicEmployee } from "@/server/serialize";
import { ensureSeeded } from "@/server/seed";
import { jsonError } from "@/server/http";

export async function POST(request: Request) {
  try {
    await ensureSeeded();
    const { email, password } = (await request.json()) as { email?: string; password?: string };
    if (!email || !password) {
      return jsonError(new Error("Email and password are required"));
    }
    const employee = await db.employee.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!employee || !(await verifyPassword(password, employee.passwordHash))) {
      return jsonError(new Error("Incorrect email or password"), 401);
    }
    if (employee.status !== "active") {
      return jsonError(new Error("This account is inactive"), 403);
    }
    await createSession(employee.id);
    return NextResponse.json({ employee: publicEmployee(employee) });
  } catch (error) {
    return jsonError(error, 500);
  }
}
