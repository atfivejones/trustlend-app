
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Simple in-memory OTP store
const otp = new Map();
const key = (loanId, to) => `${loanId}::${to.trim().toLowerCase()}`;
const gen = () => String(Math.floor(100000 + Math.random()*900000));
const put = (loanId, to, ttl=600) => { const code = gen(); const exp = Date.now()+ttl*1000; otp.set(key(loanId,to), { code, exp }); return code; };
const verify = (loanId, to, code) => { const rec = otp.get(key(loanId,to)); return !!rec && rec.code===code && Date.now()<rec.exp; };

app.post('/otp/send', (req,res)=>{
  const { loanId, channel, to } = req.body || {};
  if(!loanId || !to) return res.json({ ok:false, error:'Missing fields' });
  const code = put(loanId, to);
  console.log(`[OTP] send ${code} via ${channel} to ${to}`); // TODO: provider integration
  res.json({ ok:true });
});

app.post('/otp/verify', (req,res)=>{
  const { loanId, to, code } = req.body || {};
  const ok = verify(loanId, to, code);
  res.json({ ok, error: ok ? undefined : 'Invalid or expired code' });
});

app.post('/payments/create-intent', async (req,res)=>{
  try{
    const { amountCents, currency='usd', metadata={} } = req.body || {};
    if(!amountCents) return res.status(400).json({ error: 'amountCents required' });
    const intent = await stripe.paymentIntents.create({
      amount: amountCents, currency,
      automatic_payment_methods: { enabled: true },
      metadata
    });
    res.json({ clientSecret: intent.client_secret });
  } catch(e){ res.status(500).json({ error: e.message }); }
});

app.listen(3001, ()=>console.log('API on :3001'));
