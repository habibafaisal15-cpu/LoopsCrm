import { requireEmployee } from "@/server/auth";
import { markThreadRead, sendMessage } from "@/server/crm";
import { jsonError, jsonOk } from "@/server/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireEmployee();
    const { id } = await params;
    const { text } = (await request.json()) as { text?: string };
    if (!text?.trim()) return jsonError(new Error("Message text is required"));
    await sendMessage(actor, id, text.trim());
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireEmployee();
    const { id } = await params;
    await markThreadRead(actor, id);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
