import { requireEmployee } from "@/server/auth";
import { listTeamMessages, sendTeamMessage } from "@/server/crm";
import { jsonError, jsonOk } from "@/server/http";

export async function GET() {
  try {
    await requireEmployee();
    return jsonOk({ teamMessages: await listTeamMessages() });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireEmployee();
    const { text } = (await request.json()) as { text?: string };
    const message = await sendTeamMessage(actor, text || "");
    return jsonOk({ message }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
