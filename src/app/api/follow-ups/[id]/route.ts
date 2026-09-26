import { requireEmployee } from "@/server/auth";
import { jsonError, jsonOk } from "@/server/http";
import { completeFollowUp } from "@/server/pipeline";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireEmployee();
    const { id } = await params;
    await completeFollowUp(actor, id, await request.json());
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
