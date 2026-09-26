import { requireEmployee } from "@/server/auth";
import { jsonError, jsonOk } from "@/server/http";
import { scheduleFollowUp } from "@/server/pipeline";

export async function POST(request: Request) {
  try {
    const actor = await requireEmployee();
    const followUp = await scheduleFollowUp(actor, await request.json());
    return jsonOk({ followUp }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
