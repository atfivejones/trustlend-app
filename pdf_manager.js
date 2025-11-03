# pdf_service.py
# Flask API for TrustLend PDF generation (Pydantic v2-ready)

from __future__ import annotations

import io
from datetime import datetime
from typing import Literal

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from pydantic import BaseModel, EmailStr, ValidationError, constr

# -----------------------------
# App, CORS, rate limiting
# -----------------------------
app = Flask(__name__)

# Allow your live frontends + local dev
CORS(
    app,
    resources={r"/api/*": {
        "origins": [
            "https://trustlend-app.onrender.com",   # Render frontend
            "https://trustlend-app.vercel.app",     # Vercel frontend (if used)
            "http://127.0.0.1:5500",                # local static server
            "http://localhost:5500"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }}
)

# Rate limiting: fine for dev; switch storage on prod if needed
limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri="memory://",
    default_limits=["60/minute"],  # tweak as you like
)

@app.after_request
def add_vary_header(resp):
    # Helpful for CORS caches/CDNs
    resp.headers.setdefault("Vary", "Origin")
    return resp


# -----------------------------
# Schemas (Pydantic v2)
# -----------------------------
class Party(BaseModel):
    name: constr(strip_whitespace=True, min_length=2)
    email: EmailStr
    phone: constr(pattern=r"^\+?[0-9\-()\s]{7,20}$")


class Loan(BaseModel):
    principal: float
    flatFee: float
    startDate: constr(pattern=r"^\d{4}-\d{2}-\d{2}$")
    termMonths: int
    paymentFrequency: Literal["monthly", "biweekly", "weekly"]


class GenerateRequest(BaseModel):
    lender: Party
    borrower: Party
    loan: Loan
    tier: Literal["Essential", "Maximum", "Premium"]


# -----------------------------
# Helpers to call pdf_generator
# -----------------------------
def _import_generators():
    """
    Lazily import the PDF generator functions from pdf_generator.py.
    Tries a few common names to be resilient to minor differences.
    """
    import pdf_generator as pg  # your repo file

    # Try to find contract generator
    contract_fn = getattr(pg, "generate_contract_pdf", None)
    if contract_fn is None:
        contract_fn = getattr(pg, "build_contract_pdf", None)

    # Try to find schedule generator
    schedule_fn = getattr(pg, "generate_payment_schedule_pdf", None)
    if schedule_fn is None:
        schedule_fn = getattr(pg, "generate_schedule_pdf", None)
    if schedule_fn is None:
        schedule_fn = getattr(pg, "build_schedule_pdf", None)

    if contract_fn is None or schedule_fn is None:
        raise RuntimeError(
            "pdf_generator.py is missing required functions. "
            "Expected one of:\n"
            " - generate_contract_pdf(payload) or build_contract_pdf(payload)\n"
            " - generate_payment_schedule_pdf(payload) or "
            "generate_schedule_pdf(payload) or build_schedule_pdf(payload)"
        )

    return contract_fn, schedule_fn


def _generate_contract_pdf_bytes(payload: dict) -> bytes:
    contract_fn, _ = _import_generators()
    pdf_bytes = contract_fn(payload)  # expected to return bytes
    if isinstance(pdf_bytes, io.BytesIO):
        pdf_bytes = pdf_bytes.getvalue()
    if not isinstance(pdf_bytes, (bytes, bytearray)):
        raise TypeError("Contract generator must return bytes/BytesIO")
    return bytes(pdf_bytes)


def _generate_schedule_pdf_bytes(payload: dict) -> bytes:
    _, schedule_fn = _import_generators()
    pdf_bytes = schedule_fn(payload)  # expected to return bytes
    if isinstance(pdf_bytes, io.BytesIO):
        pdf_bytes = pdf_bytes.getvalue()
    if not isinstance(pdf_bytes, (bytes, bytearray)):
        raise TypeError("Schedule generator must return bytes/BytesIO")
    return bytes(pdf_bytes)


# -----------------------------
# Routes
# -----------------------------
@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "time": datetime.utcnow().isoformat() + "Z"})


@app.post("/api/generate/contract")
@limiter.limit("30/minute")
def generate_contract():
    try:
        data = request.get_json(silent=True) or {}
        validated = GenerateRequest.model_validate(data)
        pdf_bytes = _generate_contract_pdf_bytes(validated.model_dump())
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype="application/pdf",
            as_attachment=True,
            download_name="contract.pdf",
        )
    except ValidationError as ve:
        return jsonify({"error": "Invalid input", "details": ve.errors()}), 400
    except Exception as e:
        # Log in real prod (e.g., Sentry); keep message concise for clients
        return jsonify({"error": str(e)}), 500


@app.post("/api/generate/schedule")
@limiter.limit("30/minute")
def generate_schedule():
    try:
        data = request.get_json(silent=True) or {}
        validated = GenerateRequest.model_validate(data)
        pdf_bytes = _generate_schedule_pdf_bytes(validated.model_dump())
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype="application/pdf",
            as_attachment=True,
            download_name="payment_schedule.pdf",
        )
    except ValidationError as ve:
        return jsonify({"error": "Invalid input", "details": ve.errors()}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# Entrypoint
# -----------------------------
if __name__ == "__main__":
    # Render sets $PORT; for local dev we default to 5000
    import os
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)
