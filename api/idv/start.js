import { withCORS } from "../_utils/cors.js";
import { sendJSON } from "../_utils/json.js";
async function handler(_req, res) {
  return sendJSON(res, 200, { ok: true, provider: "tbd", session: "demo-session" });
}
export default withCORS(handler);
