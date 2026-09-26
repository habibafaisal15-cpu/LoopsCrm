import { db } from "./db";
import { logActivity } from "./crm";
import { nextId } from "./seed";
import type { DevWorkKind, Employee } from "@/data/types";

export async function logDevWork(
  actor: Employee,
  input: {
    kind: DevWorkKind;
    title: string;
    details?: string;
    workedAt?: string;
  },
) {
  if (actor.role !== "developer" && actor.role !== "admin") {
    throw new Error("Only developers can log build work");
  }
  if (!input.title?.trim()) throw new Error("Enter what you worked on");
  const kinds: DevWorkKind[] = ["website", "pos", "discussion", "idea", "additional"];
  if (!kinds.includes(input.kind)) throw new Error("Pick a work type");

  const item = await db.devWork.create({
    data: {
      id: nextId("dw"),
      workedAt: input.workedAt ? new Date(input.workedAt) : new Date(),
      kind: input.kind,
      title: input.title.trim(),
      details: input.details?.trim() || "",
      ownerId: actor.id,
    },
  });

  await logActivity({
    type: "work",
    text: `${actor.greetingName} logged ${input.kind.replace("_", " ")} — ${input.title.trim()}`,
    detail: input.details?.trim() || undefined,
    ownerId: actor.id,
  });

  return item;
}
