import { requireEmployee } from "@/server/auth";
import { updateEmployee } from "@/server/crm";
import { jsonError, jsonOk } from "@/server/http";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireEmployee();
    const { id } = await params;
    const employee = await updateEmployee(actor, id, await request.json());
    return jsonOk({ employee });
  } catch (error) {
    return jsonError(error);
  }
}
