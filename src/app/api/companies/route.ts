import { requireEmployee } from "@/server/auth";
import { createCompany } from "@/server/crm";
import { jsonError, jsonOk } from "@/server/http";

export async function POST(request: Request) {
  try {
    const actor = await requireEmployee();
    const company = await createCompany(actor, await request.json());
    return jsonOk({ company }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
