
import os
from io import BytesIO
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from pydantic import BaseModel, EmailStr, constr, ValidationError
from typing import Literal

from pdf_generator import build_contract_pdf, build_schedule_pdf

app = Flask(__name__)

# CORS: update allowed origins after you deploy the frontend (e.g., your Vercel domain)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost", "https://*"]}})

limiter = Limiter(get_remote_address, app=app, default_limits=["60 per minute"])

class Party(BaseModel):
    name: constr(strip_whitespace=True, min_length=2)
    email: EmailStr
    phone: constr(regex=r"^\+?[0-9\-()\s]{7,20}$")

class Loan(BaseModel):
    principal: float
    flatFee: float
    startDate: constr(regex=r"^\d{4}-\d{2}-\d{2}$")
    termMonths: int
    paymentFrequency: Literal["monthly","biweekly","weekly"]

class GeneratePayload(BaseModel):
    lender: Party
    borrower: Party
    loan: Loan
    tier: Literal["Essential","Maximum","Premium"]

@app.get("/api/health")
def health():
    return jsonify(status="ok")

def _parse_payload():
    data = request.get_json(silent=True) or {}
    try:
        payload = GeneratePayload(**data)
        return payload, None
    except ValidationError as ve:
        return None, ve.errors()

@app.post("/api/generate/contract")
@limiter.limit("20/minute")
def generate_contract():
    payload, err = _parse_payload()
    if err:
        return jsonify(error="Invalid payload", details=err), 400
    pdf_bytes = build_contract_pdf(payload.model_dump())
    return send_file(BytesIO(pdf_bytes), mimetype="application/pdf", as_attachment=True, download_name="contract.pdf")

@app.post("/api/generate/schedule")
@limiter.limit("20/minute")
def generate_schedule():
    payload, err = _parse_payload()
    if err:
        return jsonify(error="Invalid payload", details=err), 400
    pdf_bytes = build_schedule_pdf(payload.model_dump())
    return send_file(BytesIO(pdf_bytes), mimetype="application/pdf", as_attachment=True, download_name="payment_schedule.pdf")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)
