import Stripe from "stripe";
import { withCORS } from "../../_utils/cors.js";
import { sendJSON } from "../../_utils/json.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" });

async function handler(req, res) {
  const { pi } = req.query || {};
  if (!pi) return sendJSON(res, 400, { error: "missing_pi" });
  try {
    const intent = await stripe.paymentIntents.retrieve(String(pi));
    return sendJSON(res, 200, {
      id: intent.id, amount: intent.amount, currency: intent.currency,
      status: intent.status, created: intent.created,
      charges: (intent.charges?.data || []).map((c) => ({
        id: c.id, paid: c.paid, created: c.created, receipt_url: c.receipt_url, balance_transaction: c.balance_transaction,
      })),
    });
  } catch (e) {
    return sendJSON(res, 404, { error: "not_found" });
  }
}
export default withCORS(handler);
