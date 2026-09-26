import { requireEmployee } from "@/server/auth";
import { createTask } from "@/server/crm";
import { jsonError, jsonOk } from "@/server/http";

export async function POST(request: Request) {
  try {
    const actor = await requireEmployee();
    const task = await createTask(actor, await request.json());
    return jsonOk({ task }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
