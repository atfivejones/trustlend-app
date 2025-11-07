import Stripe from "stripe";
import { withCORS } from "./_utils/cors.js";
import { readJson, sendJSON } from "./_utils/json.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" });

async function handler(req, res) {
  if (req.method !== "POST") return sendJSON(res, 405, { error: "method_not_allowed" });
  const body = await readJson(req);
  const amount = Number(body.amount || 1499);
  const noteId = String(body.noteId || "");
  try {
    const pi = await stripe.paymentIntents.create({
      amount, currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { plan: amount === 2999 ? "maximum" : "essential", noteId }
    });
    return sendJSON(res, 200, { clientSecret: pi.client_secret, summary: {
      id: pi.id, amount: pi.amount, currency: pi.currency, status: pi.status, created: pi.created
    }});
  } catch (e) {
    console.error(e);
    return sendJSON(res, 500, { error: "create-payment-intent failed" });
  }
}
export default withCORS(handler);
