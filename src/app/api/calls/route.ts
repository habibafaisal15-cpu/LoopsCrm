import { requireEmployee } from "@/server/auth";
import { jsonError, jsonOk } from "@/server/http";
import { logColdCall } from "@/server/pipeline";

export async function POST(request: Request) {
  try {
    const actor = await requireEmployee();
    const call = await logColdCall(actor, await request.json());
    return jsonOk({ call }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
