import { withCORS } from "./_utils/cors.js";
import { readJson, sendJSON } from "./_utils/json.js";

async function handler(req, res) {
  if (req.method !== "POST") return sendJSON(res, 405, { error: "method_not_allowed" });
  const body = await readJson(req);
  const receivedAt = new Date().toISOString();
  return sendJSON(res, 200, { ok: true, receivedAt, ...body });
}
export default withCORS(handler);
