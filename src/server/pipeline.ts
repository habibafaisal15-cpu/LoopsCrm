import { db } from "./db";
import { logActivity } from "./crm";
import { nextId } from "./seed";
import type { CallResponse, Employee, FollowUpOutcome, LeadStatus } from "@/data/types";

function assertCanWorkPipeline(actor: Employee) {
  if (actor.role !== "admin" && actor.role !== "sales") {
    throw new Error("Managers can see team counts only, not lead details");
  }
}

function assertOwn(actor: Employee, ownerId: string, message: string) {
  if (actor.role !== "admin" && actor.id !== ownerId) {
    throw new Error(message);
  }
}

export async function logColdCall(
  actor: Employee,
  input: {
    name: string;
    phone: string;
    company?: string;
    response: CallResponse;
    notes?: string;
    calledAt?: string;
    createLead?: boolean;
    followUpAt?: string;
    followUpDetails?: string;
  },
) {
  assertCanWorkPipeline(actor);
  const ownerId = actor.id;
  const createLead = Boolean(input.createLead || input.response === "interested");
  let leadId: string | undefined;

  if (createLead) {
    const lead = await db.lead.create({
      data: {
        id: nextId("ld"),
        name: input.name,
        phone: input.phone,
        email: "",
        company: input.company || "",
        source: "cold_call",
        status: input.followUpAt ? "following" : "open",
        notes: input.notes || "",
        ownerId,
      },
    });
    leadId = lead.id;
    if (input.followUpAt) {
      await db.followUp.create({
        data: {
          id: nextId("fu"),
          leadId: lead.id,
          ownerId,
          dueAt: new Date(input.followUpAt),
          details: input.followUpDetails || "Follow up from cold call",
          outcome: "pending",
        },
      });
    }
    await logActivity({
      type: "deal",
      text: `${actor.greetingName} generated a lead — ${input.name}`,
      detail: input.company,
      ownerId,
    });
  }

  const call = await db.coldCall.create({
    data: {
      id: nextId("cc"),
      calledAt: input.calledAt ? new Date(input.calledAt) : new Date(),
      name: input.name,
      phone: input.phone,
      company: input.company || "",
      response: input.response,
      notes: input.notes || "",
      ownerId,
      leadId,
    },
  });

  await logActivity({
    type: "call",
    text: `${actor.greetingName} logged a cold call to ${input.name}`,
    detail: input.response.replace(/_/g, " "),
    ownerId,
  });

  return call;
}

export async function createLead(
  actor: Employee,
  input: {
    name: string;
    phone: string;
    email?: string;
    company?: string;
    notes?: string;
    followUpAt?: string;
    followUpDetails?: string;
  },
) {
  assertCanWorkPipeline(actor);
  const lead = await db.lead.create({
    data: {
      id: nextId("ld"),
      name: input.name,
      phone: input.phone,
      email: input.email || "",
      company: input.company || "",
      source: "manual",
      status: input.followUpAt ? "following" : "open",
      notes: input.notes || "",
      ownerId: actor.id,
    },
  });
  if (input.followUpAt) {
    await db.followUp.create({
      data: {
        id: nextId("fu"),
        leadId: lead.id,
        ownerId: actor.id,
        dueAt: new Date(input.followUpAt),
        details: input.followUpDetails || "First follow-up",
        outcome: "pending",
      },
    });
  }
  await logActivity({
    type: "deal",
    text: `${actor.greetingName} added lead ${input.name}`,
    ownerId: actor.id,
  });
  return lead;
}

export async function scheduleFollowUp(
  actor: Employee,
  input: { leadId: string; dueAt: string; details: string },
) {
  assertCanWorkPipeline(actor);
  const lead = await db.lead.findUnique({ where: { id: input.leadId } });
  if (!lead) throw new Error("Lead not found");
  assertOwn(actor, lead.ownerId, "You can only follow up your own leads");
  if (lead.status === "client" || lead.status === "wasted") {
    throw new Error("This lead is already closed");
  }
  const followUp = await db.followUp.create({
    data: {
      id: nextId("fu"),
      leadId: lead.id,
      ownerId: lead.ownerId,
      dueAt: new Date(input.dueAt),
      details: input.details,
      outcome: "pending",
    },
  });
  await db.lead.update({ where: { id: lead.id }, data: { status: "following" } });
  await logActivity({
    type: "deal",
    text: `${actor.greetingName} set a follow-up for ${lead.name}`,
    ownerId: actor.id,
  });
  return followUp;
}

export async function completeFollowUp(
  actor: Employee,
  id: string,
  input: {
    result: string;
    outcome: Exclude<FollowUpOutcome, "pending">;
    nextDueAt?: string;
    nextDetails?: string;
  },
) {
  assertCanWorkPipeline(actor);
  const current = await db.followUp.findUnique({ where: { id }, include: { lead: true } });
  if (!current) throw new Error("Follow-up not found");
  assertOwn(actor, current.ownerId, "You can only close your own follow-ups");
  if (current.outcome !== "pending") throw new Error("This follow-up is already closed");
  if (!input.result?.trim()) throw new Error("Enter what happened on this follow-up");
  if (input.outcome === "next" && !input.nextDueAt) {
    throw new Error("Pick the next follow-up date");
  }

  await db.followUp.update({
    where: { id },
    data: { outcome: input.outcome, result: input.result },
  });

  if (input.outcome === "next") {
    const nextDueAt = input.nextDueAt;
    if (!nextDueAt) throw new Error("Pick the next follow-up date");
    await db.followUp.create({
      data: {
        id: nextId("fu"),
        leadId: current.leadId,
        ownerId: current.ownerId,
        dueAt: new Date(nextDueAt),
        details: input.nextDetails || input.result,
        outcome: "pending",
      },
    });
    await db.lead.update({ where: { id: current.leadId }, data: { status: "following" } });
  }

  if (input.outcome === "client") {
    await db.lead.update({
      where: { id: current.leadId },
      data: { status: "client", closedAt: new Date(), notes: input.result || current.lead.notes },
    });
    await db.followUp.updateMany({
      where: { leadId: current.leadId, outcome: "pending" },
      data: { outcome: "client", result: input.result },
    });
    await logActivity({
      type: "deal",
      text: `${actor.greetingName} closed ${current.lead.name} as a client`,
      ownerId: actor.id,
    });
  }

  if (input.outcome === "wasted") {
    await db.lead.update({
      where: { id: current.leadId },
      data: { status: "wasted", closedAt: new Date(), notes: input.result || current.lead.notes },
    });
    await db.followUp.updateMany({
      where: { leadId: current.leadId, outcome: "pending" },
      data: { outcome: "wasted", result: input.result },
    });
    await logActivity({
      type: "deal",
      text: `${actor.greetingName} marked ${current.lead.name} as wasted`,
      ownerId: actor.id,
    });
  }
}

export async function updateLeadStatus(actor: Employee, id: string, status: LeadStatus, notes?: string) {
  assertCanWorkPipeline(actor);
  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) throw new Error("Lead not found");
  assertOwn(actor, lead.ownerId, "You can only update your own leads");
  const closed = status === "client" || status === "wasted";
  await db.lead.update({
    where: { id },
    data: {
      status,
      notes: notes ?? lead.notes,
      closedAt: closed ? new Date() : null,
    },
  });
  if (closed) {
    await db.followUp.updateMany({
      where: { leadId: id, outcome: "pending" },
      data: { outcome: status === "client" ? "client" : "wasted", result: notes || "" },
    });
  }
}
