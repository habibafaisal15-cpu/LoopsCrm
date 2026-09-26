import { requireEmployee } from "@/server/auth";
import { loadWorkspace } from "@/server/crm";
import { jsonError, jsonOk } from "@/server/http";
import { ensureSeeded } from "@/server/seed";

export async function GET() {
  try {
    await ensureSeeded();
    const employee = await requireEmployee();
    return jsonOk(await loadWorkspace(employee));
  } catch (error) {
    return jsonError(error, 500);
  }
}
