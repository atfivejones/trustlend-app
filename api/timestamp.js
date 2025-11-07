import { withCORS } from "./_utils/cors.js";
import { readJson, sendJSON } from "./_utils/json.js";
async function handler(req, res) {
  if (req.method !== "POST") return sendJSON(res, 405, { error: "method_not_allowed" });
  const { hash } = await readJson(req);
  return sendJSON(res, 200, { ok: true, hash, receipt: "demo-receipt-id" });
}
export default withCORS(handler);
