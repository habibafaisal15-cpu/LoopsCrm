import { requireEmployee } from "@/server/auth";
import { jsonError, jsonOk } from "@/server/http";
import { updateLeadStatus } from "@/server/pipeline";
import type { LeadStatus } from "@/data/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireEmployee();
    const { id } = await params;
    const { status, notes } = (await request.json()) as { status: LeadStatus; notes?: string };
    await updateLeadStatus(actor, id, status, notes);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
