import { requireEmployee } from "@/server/auth";
import { updateProfile } from "@/server/crm";
import { jsonError, jsonOk } from "@/server/http";

export async function PATCH(request: Request) {
  try {
    const actor = await requireEmployee();
    const employee = await updateProfile(actor, await request.json());
    return jsonOk({ employee });
  } catch (error) {
    return jsonError(error);
  }
}
