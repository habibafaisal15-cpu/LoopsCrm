import { requireEmployee } from "@/server/auth";
import { createEmployee } from "@/server/crm";
import { jsonError, jsonOk } from "@/server/http";

export async function POST(request: Request) {
  try {
    const actor = await requireEmployee();
    const employee = await createEmployee(actor, await request.json());
    return jsonOk({ employee }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
