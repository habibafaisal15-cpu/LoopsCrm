import bcrypt from "bcryptjs";
import { seed } from "../data/seed";
import { db } from "./db";
import { uid } from "../lib/utils";

const DEFAULT_PASSWORD = "loops123";

const DEMO_TEAM_EMAILS = [
  "habib@loopscrm.com",
  "noor@loopscrm.com",
  "ayesha@loopscrm.com",
  "hamza@loopscrm.com",
  "danish@loopscrm.com",
  "zain@loopscrm.com",
  "maha@loopscrm.com",
];

const DEMO_TEAM_IDS = ["emp-2", "emp-3", "emp-4", "emp-5", "emp-6", "emp-7"];

export async function ensureSeeded() {
  const count = await db.employee.count();
  if (count === 0) {
    await seedAccounts();
    return;
  }

  await db.employee.updateMany({
    where: {
      OR: [{ id: "emp-1" }, { email: "habib@loopscrm.com" }],
    },
    data: {
      name: "Habiba",
      greetingName: "Habiba",
      email: "habiba@loopscrm.com",
    },
  });

  await removeDemoTeamAccounts();
}

async function removeDemoTeamAccounts() {
  const extras = await db.employee.findMany({
    where: {
      OR: [{ email: { in: DEMO_TEAM_EMAILS } }, { id: { in: DEMO_TEAM_IDS } }],
    },
    select: { id: true },
  });
  const ids = extras.map((employee) => employee.id);
  if (ids.length === 0) return;
  await deleteEmployeesAndWork(ids);
}

export async function deleteEmployeesAndWork(ids: string[]) {
  await db.$transaction([
    db.followUp.deleteMany({ where: { OR: [{ ownerId: { in: ids } }, { lead: { ownerId: { in: ids } } }] } }),
    db.coldCall.deleteMany({ where: { OR: [{ ownerId: { in: ids } }, { lead: { ownerId: { in: ids } } }] } }),
    db.lead.deleteMany({ where: { ownerId: { in: ids } } }),
    db.devWork.deleteMany({ where: { ownerId: { in: ids } } }),
    db.activity.deleteMany({ where: { ownerId: { in: ids } } }),
    db.message.deleteMany({ where: { thread: { ownerId: { in: ids } } } }),
    db.thread.deleteMany({ where: { ownerId: { in: ids } } }),
    db.teamMessage.deleteMany({ where: { senderId: { in: ids } } }),
    db.task.deleteMany({ where: { ownerId: { in: ids } } }),
    db.deal.deleteMany({ where: { ownerId: { in: ids } } }),
    db.contact.deleteMany({ where: { ownerId: { in: ids } } }),
    db.employee.deleteMany({ where: { id: { in: ids } } }),
  ]);
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
