import { requireEmployee } from "@/server/auth";
import { moveDeal } from "@/server/crm";
import { jsonError, jsonOk } from "@/server/http";
import type { DealStage } from "@/data/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireEmployee();
    const { id } = await params;
    const { stage } = (await request.json()) as { stage: DealStage };
    const deal = await moveDeal(actor, id, stage);
    return jsonOk({ deal });
  } catch (error) {
    return jsonError(error);
  }
}
