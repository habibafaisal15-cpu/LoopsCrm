import { requireEmployee } from "@/server/auth";
import { createContact } from "@/server/crm";
import { jsonError, jsonOk } from "@/server/http";

export async function POST(request: Request) {
  try {
    const actor = await requireEmployee();
    const contact = await createContact(actor, await request.json());
    return jsonOk({ contact }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
