import { db } from "./db";
import { canAssignWork, canSeeAllWork, canSeeLeadDetails, hashPassword } from "./auth";
import {
  asActivity,
  asColdCall,
  asContact,
  asDeal,
  asDevWork,
  asFollowUp,
  asLead,
  asTask,
  asTeamMessage,
  asThread,
  publicEmployee,
  redactActivity,
  redactColdCall,
  redactFollowUp,
  redactLead,
} from "./serialize";
import { nextId } from "./seed";
import { roleLabel, type DealStage, type Employee, type EmployeeRole } from "@/data/types";

function ownerFilter(employee: Employee) {
  return canSeeAllWork(employee.role) ? {} : { ownerId: employee.id };
}

export async function loadWorkspace(employee: Employee) {
  const filter = ownerFilter(employee);
  const [employees, companies, contacts, deals, tasks, threads, activities, coldCalls, leads, followUps, workLogs, teamMessages] =
    await Promise.all([
      db.employee.findMany({ orderBy: { createdAt: "desc" } }),
      db.company.findMany({ orderBy: { name: "asc" } }),
      db.contact.findMany({ where: filter, orderBy: { name: "asc" } }),
      db.deal.findMany({ where: filter, orderBy: { closeDate: "asc" } }),
      db.task.findMany({
        where: employee.role === "admin" || employee.role === "manager" ? {} : { ownerId: employee.id },
        orderBy: { dueAt: "asc" },
      }),
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
      db.teamMessage.findMany({ orderBy: { createdAt: "asc" }, take: 300 }),
    ]);

  const hideLeadPii = !canSeeLeadDetails(employee.role);

  return {
    currentEmployee: employee,
    employees: employees.map(publicEmployee),
    companies: hideLeadPii ? [] : companies,
    contacts: hideLeadPii ? [] : contacts.map(asContact),
    deals: hideLeadPii ? [] : deals.map(asDeal),
    tasks: tasks.map((row) => {
      const task = asTask(row);
      if (employee.role === "admin" || task.ownerId === employee.id) return task;
      return { ...task, title: "", companyId: undefined, contactId: undefined };
    }),
    threads: hideLeadPii ? [] : threads.map(asThread),
    activities: hideLeadPii ? activities.map((row) => redactActivity(asActivity(row))) : activities.map(asActivity),
    coldCalls: coldCalls.map((row) => {
      const call = asColdCall(row);
      return hideLeadPii ? redactColdCall(call) : call;
    }),
    leads: leads.map((row) => {
      const lead = asLead(row);
      return hideLeadPii ? redactLead(lead) : lead;
    }),
    followUps: followUps.map((row) => {
      const item = asFollowUp(row);
      return hideLeadPii ? redactFollowUp(item) : item;
    }),
    workLogs: workLogs.map(asDevWork),
    teamMessages: teamMessages.map(asTeamMessage),
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
  if (actor.role !== "admin" && current.ownerId !== actor.id) {
    throw new Error("You can only update your own tasks");
  }
  const done = !current.done;
  const updated = await db.task.update({
    where: { id },
    data: { done, completedAt: done ? new Date() : null },
  });
  if (done) {
    await logActivity({
      type: "work",
      text: `${actor.greetingName} completed: ${current.title}`,
      ownerId: current.ownerId,
    });
  }
  return asTask(updated);
}

export async function listTeamMessages() {
  const rows = await db.teamMessage.findMany({ orderBy: { createdAt: "asc" }, take: 300 });
  return rows.map(asTeamMessage);
}

export async function sendTeamMessage(actor: Employee, text: string) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Message text is required");
  const row = await db.teamMessage.create({
    data: {
      id: nextId("tm"),
      text: trimmed,
      senderId: actor.id,
      senderName: actor.name,
    },
  });
  return asTeamMessage(row);
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
