import bcrypt from "bcryptjs";
import { seed } from "../data/seed";
import { db } from "./db";
import { uid } from "../lib/utils";

const DEFAULT_PASSWORD = "loops123";

export async function ensureSeeded() {
  const count = await db.employee.count();
  if (count === 0) {
    await seedAccounts();
  }
}

export async function seedAccounts() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  await db.employee.createMany({
    data: seed.employees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      greetingName: employee.greetingName,
      email: employee.email,
      passwordHash,
      phone: employee.phone,
      role: employee.role,
      title: employee.title,
      department: employee.department,
      joinedAt: new Date(employee.joinedAt),
      bio: employee.bio,
      status: employee.status,
    })),
  });
}

export function nextId(prefix: string) {
  return uid(prefix);
}
