import { requireEmployee } from "@/server/auth";
import { jsonError, jsonOk } from "@/server/http";
import { createLead } from "@/server/pipeline";

export async function POST(request: Request) {
  try {
    const actor = await requireEmployee();
    const lead = await createLead(actor, await request.json());
    return jsonOk({ lead }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
