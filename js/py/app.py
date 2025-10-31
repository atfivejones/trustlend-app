
import os, time, secrets
from flask import Flask, request, jsonify, abort
import stripe

STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', 'sk_test_123')
stripe.api_key = STRIPE_SECRET_KEY

app = Flask(__name__)

OTP = {}
def k(loan_id, to): return f"{loan_id}::{to.strip().lower()}"
def put(loan_id, to, ttl=600):
    code = str(secrets.randbelow(900000)+100000); OTP[k(loan_id,to)] = (code, time.time()+ttl); return code
def verify(loan_id, to, code):
    rec = OTP.get(k(loan_id,to))
    return bool(rec) and rec[0]==code and time.time()<rec[1]

@app.post('/otp/send')
def otp_send():
    data = request.get_json() or {}
    loan_id, to = data.get('loanId'), data.get('to')
    if not loan_id or not to: return jsonify(ok=False, error='Missing fields')
    code = put(loan_id, to)
    print(f"[OTP] send {code} to {to}")  # TODO: Twilio/SendGrid
    return jsonify(ok=True)

@app.post('/otp/verify')
def otp_verify():
    data = request.get_json() or {}
    ok = verify(data.get('loanId'), data.get('to'), data.get('code'))
    return jsonify(ok=ok, error=None if ok else 'Invalid or expired code')

@app.post('/payments/create-intent')
def create_intent():
    data = request.get_json() or {}
    amount = data.get('amountCents')
    if not amount: abort(400)
    intent = stripe.PaymentIntent.create(
        amount=amount, currency='usd',
        automatic_payment_methods={'enabled': True},
        metadata=data.get('metadata') or {}
    )
    return jsonify(clientSecret=intent.client_secret)

if __name__ == '__main__':
    app.run(port=3001, debug=True)
