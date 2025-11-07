import { withCORS } from "../_utils/cors.js";
import { readJson, sendJSON } from "../_utils/json.js";
async function handler(req, res) {
  const body = await readJson(req);
  return sendJSON(res, 200, { ok: true, received: !!body });
}
export default withCORS(handler);
