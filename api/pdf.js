import { withCORS } from "./_utils/cors.js";
import { readJson, sendJSON } from "./_utils/json.js";

const DOCUMINT_URL = "https://api.documint.me/v1/render";

async function handler(req, res) {
  if (req.method !== "POST") return sendJSON(res, 405, { error: "method_not_allowed" });
  const body = await readJson(req);
  try {
    const resp = await fetch(DOCUMINT_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DOCUMINT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template: process.env.DOCUMINT_TEMPLATE_ID,
        data: body,
        output: { type: "pdf" },
      }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      return sendJSON(res, 502, { error: "documint_failed", details: txt.slice(0, 500) });
    }
    const ctype = resp.headers.get("content-type") || "";
    if (ctype.includes("application/json")) {
      const json = await resp.json();
      return sendJSON(res, 200, json);
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="TrustLend-Note.pdf"');
      const buf = Buffer.from(await resp.arrayBuffer());
      res.end(buf);
    }
  } catch (e) {
    console.error(e);
    return sendJSON(res, 500, { error: "pdf_proxy_error" });
  }
}
export default withCORS(handler);
