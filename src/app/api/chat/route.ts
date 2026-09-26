import { requireEmployee } from "@/server/auth";
import { listTeamMessages, markTeamChatRead, sendTeamMessage, unreadTeamChatCount } from "@/server/crm";
import { jsonError, jsonOk } from "@/server/http";

export async function GET() {
  try {
    const actor = await requireEmployee();
    const [teamMessages, unreadCount] = await Promise.all([
      listTeamMessages(),
      unreadTeamChatCount(actor.id),
    ]);
    return jsonOk({ teamMessages, unreadCount });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH() {
  try {
    const actor = await requireEmployee();
    await markTeamChatRead(actor.id);
    return jsonOk({ ok: true, unreadCount: 0 });
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
