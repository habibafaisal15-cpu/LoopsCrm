import { requireEmployee } from "@/server/auth";
import { toggleTask } from "@/server/crm";
import { jsonError, jsonOk } from "@/server/http";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireEmployee();
    const { id } = await params;
    const task = await toggleTask(actor, id);
    return jsonOk({ task });
  } catch (error) {
    return jsonError(error);
  }
}
