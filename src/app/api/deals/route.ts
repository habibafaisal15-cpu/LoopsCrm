import { requireEmployee } from "@/server/auth";
import { createDeal } from "@/server/crm";
import { jsonError, jsonOk } from "@/server/http";

export async function POST(request: Request) {
  try {
    const actor = await requireEmployee();
    const deal = await createDeal(actor, await request.json());
    return jsonOk({ deal }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
