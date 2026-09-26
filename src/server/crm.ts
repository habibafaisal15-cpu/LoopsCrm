import { db } from "./db";
import { canAssignWork, canSeeAllWork, hashPassword } from "./auth";
import { asActivity, asColdCall, asContact, asDeal, asDevWork, asFollowUp, asLead, asTask, asThread, publicEmployee } from "./serialize";
import { nextId } from "./seed";
import { roleLabel, type DealStage, type Employee, type EmployeeRole } from "@/data/types";

function ownerFilter(employee: Employee) {
  return canSeeAllWork(employee.role) ? {} : { ownerId: employee.id };
}

export async function loadWorkspace(employee: Employee) {
  const filter = ownerFilter(employee);
  const [employees, companies, contacts, deals, tasks, threads, activities, coldCalls, leads, followUps, workLogs] =
    await Promise.all([
      db.employee.findMany({ orderBy: { createdAt: "desc" } }),
      db.company.findMany({ orderBy: { name: "asc" } }),
      db.contact.findMany({ where: filter, orderBy: { name: "asc" } }),
      db.deal.findMany({ where: filter, orderBy: { closeDate: "asc" } }),
      db.task.findMany({ where: filter, orderBy: { dueAt: "asc" } }),
      db.thread.findMany({
        where: filter,
        include: { messages: { orderBy: { time: "asc" } } },
        orderBy: { updatedAt: "desc" },
      }),
      db.activity.findMany({ where: filter, orderBy: { time: "desc" }, take: 40 }),
      db.coldCall.findMany({ where: filter, orderBy: { calledAt: "desc" } }),
      db.lead.findMany({ where: filter, orderBy: { createdAt: "desc" } }),
      db.followUp.findMany({ where: filter, orderBy: { dueAt: "asc" } }),
      db.devWork.findMany({ where: filter, orderBy: { workedAt: "desc" } }),
    ]);

  return {
    currentEmployee: employee,
    employees: employees.map(publicEmployee),
    companies,
    contacts: contacts.map(asContact),
    deals: deals.map(asDeal),
    tasks: tasks.map(asTask),
    threads: threads.map(asThread),
    activities: activities.map(asActivity),
    coldCalls: coldCalls.map(asColdCall),
    leads: leads.map(asLead),
    followUps: followUps.map(asFollowUp),
    workLogs: workLogs.map(asDevWork),
  };
}

export async function logActivity(input: {
  type: string;
  text: string;
  detail?: string;
  ownerId: string;
}) {
  await db.activity.create({
    data: {
      id: nextId("ac"),
      type: input.type,
      text: input.text,
      detail: input.detail,
      time: new Date(),
      ownerId: input.ownerId,
    },
  });
}

function resolveOwner(actor: Employee, requested?: string) {
  if (requested && canAssignWork(actor.role)) return requested;
  return actor.id;
}

export async function createEmployee(
  actor: Employee,
  input: {
    name: string;
    greetingName?: string;
    email: string;
    phone?: string;
    role: EmployeeRole;
    title: string;
    department?: string;
    bio?: string;
    password?: string;
  },
) {
  if (actor.role !== "admin") throw new Error("Only an admin can add employees");
  const employee = await db.employee.create({
    data: {
      id: nextId("emp"),
      name: input.name,
      greetingName: input.greetingName || input.name.split(" ")[0],
      email: input.email.trim().toLowerCase(),
      passwordHash: await hashPassword(input.password || "loops123"),
      phone: input.phone || "",
      role: input.role,
      title: input.title,
      department: input.department || "Sales",
      joinedAt: new Date(),
      bio: input.bio || "",
      status: "active",
    },
  });
  await logActivity({
    type: "deal",
    text: `${actor.greetingName} added employee ${input.name}`,
    detail: roleLabel(input.role),
    ownerId: actor.id,
  });
  return publicEmployee(employee);
}

export async function updateEmployee(
  actor: Employee,
  id: string,
  input: Partial<{ role: EmployeeRole; status: "active" | "inactive"; bio: string; title: string }>,
) {
  if (actor.role !== "admin" && actor.id !== id) {
    throw new Error("You can only update your own profile");
  }
  if ((input.role || input.status) && actor.role !== "admin") {
    throw new Error("Only an admin can change roles or status");
  }
  const employee = await db.employee.update({
    where: { id },
    data: {
      role: input.role,
      status: input.status,
      bio: input.bio,
      title: input.title,
    },
  });
  return publicEmployee(employee);
}

export async function createContact(
  actor: Employee,
  input: {
    name: string;
    email: string;
    phone?: string;
    title?: string;
    status?: string;
    companyId: string;
    ownerId?: string;
  },
) {
  const ownerId = resolveOwner(actor, input.ownerId);
  const contact = await db.contact.create({
    data: {
      id: nextId("ct"),
      name: input.name,
      email: input.email,
      phone: input.phone || "",
      title: input.title || "",
      status: input.status || "new",
      companyId: input.companyId,
      ownerId,
    },
  });
  await logActivity({
    type: "deal",
    text: `${actor.greetingName} added contact ${input.name}`,
    ownerId,
  });
  return asContact(contact);
}

export async function createCompany(
  actor: Employee,
  input: { name: string; industry?: string; city?: string; website?: string; employees?: number },
) {
  const company = await db.company.create({
    data: {
      id: nextId("co"),
      name: input.name,
      industry: input.industry || "",
      city: input.city || "",
      website: input.website || "",
      employees: input.employees ?? 1,
    },
  });
  await logActivity({
    type: "deal",
    text: `${actor.greetingName} added company ${input.name}`,
    ownerId: actor.id,
  });
  return company;
}

export async function createDeal(
  actor: Employee,
  input: {
    title: string;
    companyId: string;
    contactId: string;
    value: number;
    stage?: DealStage;
    closeDate: string;
    ownerId?: string;
  },
) {
  const ownerId = resolveOwner(actor, input.ownerId);
  const deal = await db.deal.create({
    data: {
      id: nextId("de"),
      title: input.title,
      companyId: input.companyId,
      contactId: input.contactId,
      value: Number(input.value) || 0,
      stage: input.stage || "new",
      closeDate: new Date(input.closeDate),
      ownerId,
    },
  });
  await logActivity({
    type: "deal",
    text: `${actor.greetingName} created deal ${input.title}`,
    ownerId,
  });
  return asDeal(deal);
}

export async function moveDeal(actor: Employee, id: string, stage: DealStage) {
  const current = await db.deal.findUnique({ where: { id } });
  if (!current) throw new Error("Deal not found");
  if (!canSeeAllWork(actor.role) && current.ownerId !== actor.id) {
    throw new Error("You can only move your own deals");
  }
  const deal = await db.deal.update({
    where: { id },
    data: { stage },
  });
  await logActivity({
    type: "deal",
    text: `${actor.greetingName} moved a deal to ${stage[0].toUpperCase()}${stage.slice(1)}`,
    detail: deal.title,
    ownerId: deal.ownerId,
  });
  return asDeal(deal);
}

export async function createTask(
  actor: Employee,
  input: {
    title: string;
    dueAt: string;
    type: string;
    companyId?: string;
    contactId?: string;
    ownerId?: string;
  },
) {
  const ownerId = resolveOwner(actor, input.ownerId);
  const task = await db.task.create({
    data: {
      id: nextId("tk"),
      title: input.title,
      dueAt: new Date(input.dueAt),
      type: input.type,
      done: false,
      companyId: input.companyId || null,
      contactId: input.contactId || null,
      ownerId,
    },
  });
  await logActivity({
    type: "deal",
    text: `${actor.greetingName} added task ${input.title}`,
    ownerId,
  });
  return asTask(task);
}

export async function toggleTask(actor: Employee, id: string) {
  const current = await db.task.findUnique({ where: { id } });
  if (!current) throw new Error("Task not found");
  if (!canSeeAllWork(actor.role) && current.ownerId !== actor.id) {
    throw new Error("You can only update your own tasks");
  }
  return asTask(
    await db.task.update({
      where: { id },
      data: { done: !current.done },
    }),
  );
}

export async function sendMessage(actor: Employee, threadId: string, text: string) {
  const thread = await db.thread.findUnique({ where: { id: threadId } });
  if (!thread) throw new Error("Conversation not found");
  if (!canSeeAllWork(actor.role) && thread.ownerId !== actor.id) {
    throw new Error("You can only write in your own conversations");
  }
  await db.message.create({
    data: {
      id: nextId("m"),
      from: "me",
      text,
      time: new Date(),
      threadId,
    },
  });
  await db.thread.update({
    where: { id: threadId },
    data: { updatedAt: new Date(), unread: false },
  });
}

export async function markThreadRead(actor: Employee, threadId: string) {
  const thread = await db.thread.findUnique({ where: { id: threadId } });
  if (!thread) return;
  if (!canSeeAllWork(actor.role) && thread.ownerId !== actor.id) return;
  await db.thread.update({ where: { id: threadId }, data: { unread: false } });
}

export async function updateProfile(
  actor: Employee,
  input: { name?: string; greetingName?: string; email?: string; phone?: string },
) {
  const employee = await db.employee.update({
    where: { id: actor.id },
    data: {
      name: input.name,
      greetingName: input.greetingName,
      email: input.email,
      phone: input.phone,
    },
  });
  return publicEmployee(employee);
}
