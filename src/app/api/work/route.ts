import { requireEmployee } from "@/server/auth";
import { jsonError, jsonOk } from "@/server/http";
import { logDevWork } from "@/server/devwork";

export async function POST(request: Request) {
  try {
    const actor = await requireEmployee();
    const item = await logDevWork(actor, await request.json());
    return jsonOk({ work: item }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
