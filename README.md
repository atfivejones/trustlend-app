
# TrustLend PDF Generation — Starter Kit

This kit ships a minimal, production-friendly path to generate professional PDFs from your TrustLend form.

## What you get
- **Flask API** (`pdf_service.py`) with:
  - `GET /api/health`
  - `POST /api/generate/contract`
  - `POST /api/generate/schedule`
- **ReportLab**-based generator (`pdf_generator.py`)
- **Static frontend** (`trustlend_complete.html` + `pdf_manager.js`)
- **Deployment**
  - Local: `./start_pdf_service.sh`
  - Render/Railway: use `pdf_service.py` as web service start command
  - Dockerfile + docker-compose

---

## 1) Run locally (10 minutes)

```bash
# 1. Create & activate a virtualenv (recommended)
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the API
python pdf_service.py
# or: ./start_pdf_service.sh

# 4. Open the frontend (static file):
#    Double-click trustlend_complete.html or serve it locally (e.g., VSCode Live Server).
```

**Health check**
```bash
curl http://127.0.0.1:5000/api/health
```

**Generate a contract**
```bash
cat > payload.json <<'JSON'
{
  "lender": {"name":"John Lender","email":"john@example.com","phone":"+14045551234"},
  "borrower": {"name":"Jane Borrower","email":"jane@example.com","phone":"+14045557654"},
  "loan": {"principal": 1000, "flatFee": 100, "startDate":"2025-11-02", "termMonths": 6, "paymentFrequency": "monthly"},
  "tier": "Maximum"
}
JSON

curl -sS -X POST http://127.0.0.1:5000/api/generate/contract   -H "Content-Type: application/json"   --data @payload.json --output contract.pdf
open contract.pdf 2>/dev/null || start contract.pdf 2>/dev/null || xdg-open contract.pdf 2>/dev/null
```

---

## 2) Deploy the API (Render/Railway)

- Create a **new Web Service** from your GitHub repo.
- **Start command**: `python pdf_service.py`
- **Port**: 5000 (service will bind to `$PORT` automatically)
- Add environment variables as needed; enable auto-deploys on push.

**CORS** — Update allowed origins inside `pdf_service.py` (look for `CORS(...)`).

---

## 3) Deploy the frontend (Vercel or static hosting)

- For **Vercel**, create a project and add only the **frontend files** if you prefer (or your existing Next.js app).
- Set your **API base URL** in `pdf_manager.js` (look for `API_BASE`).

---

## 4) Docker (optional)

```bash
docker build -t trustlend-api .
docker run -p 5000:5000 trustlend-api
```

Or with Compose:
```bash
docker-compose up --build
```

---

## Files
- `pdf_service.py` — Flask API with validation & CORS
- `pdf_generator.py` — ReportLab PDF builder
- `requirements.txt` — Python deps
- `start_pdf_service.sh` — Local start helper
- `trustlend_complete.html` — Static UI
- `pdf_manager.js` — Frontend → API integration
- `Dockerfile`, `docker-compose.yml` — Container deploy

---

## Notes
- The amortization in this starter uses a **flat-fee, no-interest** example to match your product direction.
- You can easily switch to standard amortization later.
- Signature & Execution Certificate pages can be appended where indicated in `pdf_generator.py`.
