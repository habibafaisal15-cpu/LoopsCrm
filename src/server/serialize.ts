import type { Employee as DbEmployee } from "@prisma/client";
import type {
  Activity,
  CallResponse,
  ColdCall,
  Company,
  Contact,
  Deal,
  Employee,
  EmployeeRole,
  EmployeeStatus,
  DevWorkItem,
  DevWorkKind,
  TeamChatMessage,
  FollowUpItem,
  FollowUpOutcome,
  Lead,
  LeadStatus,
  MessageThread,
  TaskItem,
} from "@/data/types";

export function publicEmployee(row: DbEmployee): Employee {
  return {
    id: row.id,
    name: row.name,
    greetingName: row.greetingName,
    email: row.email,
    phone: row.phone,
    role: row.role as EmployeeRole,
    title: row.title,
    department: row.department,
    joinedAt: row.joinedAt.toISOString().slice(0, 10),
    bio: row.bio,
    status: row.status as EmployeeStatus,
  };
}

export function asCompany(row: Company): Company {
  return row;
}

export function asContact(row: {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  status: string;
  companyId: string;
  ownerId: string;
}): Contact {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    title: row.title,
    status: row.status as Contact["status"],
    companyId: row.companyId,
    ownerId: row.ownerId,
  };
}

export function asDeal(row: {
  id: string;
  title: string;
  value: number;
  stage: string;
  closeDate: Date;
  companyId: string;
  contactId: string;
  ownerId: string;
}): Deal {
  return {
    id: row.id,
    title: row.title,
    value: row.value,
    stage: row.stage as Deal["stage"],
    closeDate: row.closeDate.toISOString(),
    companyId: row.companyId,
    contactId: row.contactId,
    ownerId: row.ownerId,
  };
}

export function asTask(row: {
  id: string;
  title: string;
  dueAt: Date;
  type: string;
  done: boolean;
  completedAt?: Date | null;
  companyId: string | null;
  contactId: string | null;
  ownerId: string;
}): TaskItem {
  return {
    id: row.id,
    title: row.title,
    dueAt: row.dueAt.toISOString(),
    type: row.type as TaskItem["type"],
    done: row.done,
    completedAt: row.completedAt?.toISOString(),
    companyId: row.companyId ?? undefined,
    contactId: row.contactId ?? undefined,
    ownerId: row.ownerId,
  };
}

export function asThread(row: {
  id: string;
  unread: boolean;
  updatedAt: Date;
  contactId: string;
  ownerId: string;
  messages: { id: string; from: string; text: string; time: Date }[];
}): MessageThread {
  return {
    id: row.id,
    unread: row.unread,
    updatedAt: row.updatedAt.toISOString(),
    contactId: row.contactId,
    ownerId: row.ownerId,
    messages: row.messages.map((message) => ({
      id: message.id,
      from: message.from as "me" | "them",
      text: message.text,
      time: message.time.toISOString(),
    })),
  };
}

export function asActivity(row: {
  id: string;
  type: string;
  text: string;
  detail: string | null;
  time: Date;
  ownerId: string;
}): Activity {
  return {
    id: row.id,
    type: row.type as Activity["type"],
    text: row.text,
    detail: row.detail ?? undefined,
    time: row.time.toISOString(),
    ownerId: row.ownerId,
  };
}

export function asColdCall(row: {
  id: string;
  calledAt: Date;
  name: string;
  phone: string;
  company: string;
  response: string;
  notes: string;
  ownerId: string;
  leadId: string | null;
}): ColdCall {
  return {
    id: row.id,
    calledAt: row.calledAt.toISOString(),
    name: row.name,
    phone: row.phone,
    company: row.company,
    response: row.response as CallResponse,
    notes: row.notes,
    ownerId: row.ownerId,
    leadId: row.leadId ?? undefined,
  };
}

export function asLead(row: {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  source: string;
  status: string;
  notes: string;
  ownerId: string;
  createdAt: Date;
  closedAt: Date | null;
}): Lead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    company: row.company,
    source: row.source,
    status: row.status as LeadStatus,
    notes: row.notes,
    ownerId: row.ownerId,
    createdAt: row.createdAt.toISOString(),
    closedAt: row.closedAt?.toISOString(),
  };
}

export function asFollowUp(row: {
  id: string;
  leadId: string;
  ownerId: string;
  dueAt: Date;
  details: string;
  outcome: string;
  result: string;
  createdAt: Date;
}): FollowUpItem {
  return {
    id: row.id,
    leadId: row.leadId,
    ownerId: row.ownerId,
    dueAt: row.dueAt.toISOString(),
    details: row.details,
    outcome: row.outcome as FollowUpOutcome,
    result: row.result,
    createdAt: row.createdAt.toISOString(),
  };
}

export function redactLead(lead: Lead): Lead {
  return {
    ...lead,
    name: "",
    phone: "",
    email: "",
    company: "",
    notes: "",
  };
}

export function redactColdCall(call: ColdCall): ColdCall {
  return {
    ...call,
    name: "",
    phone: "",
    company: "",
    notes: "",
  };
}

export function redactFollowUp(item: FollowUpItem): FollowUpItem {
  return {
    ...item,
    details: "",
    result: "",
  };
}

export function redactActivity(item: Activity): Activity {
  const labels: Record<Activity["type"], string> = {
    call: "Logged a cold call",
    email: "Logged an email",
    meeting: "Logged a meeting",
    deal: "Updated pipeline work",
    message: "Logged a message",
    work: "Logged daily work",
  };
  return {
    ...item,
    text: labels[item.type] || "Logged work",
    detail: undefined,
  };
}

export function asTeamMessage(row: {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: Date;
}): TeamChatMessage {
  return {
    id: row.id,
    text: row.text,
    senderId: row.senderId,
    senderName: row.senderName,
    createdAt: row.createdAt.toISOString(),
  };
}

export function asDevWork(row: {
  id: string;
  workedAt: Date;
  kind: string;
  title: string;
  details: string;
  ownerId: string;
}): DevWorkItem {
  return {
    id: row.id,
    workedAt: row.workedAt.toISOString(),
    kind: row.kind as DevWorkKind,
    title: row.title,
    details: row.details,
    ownerId: row.ownerId,
  };
}
