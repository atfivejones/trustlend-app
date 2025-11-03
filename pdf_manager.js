
// Set your API base (local or deployed)
// const API_BASE = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  // pdf_manager.js
const API_BASE = "https://trustlend-api.onrender.com";  // your API URL

  ? "http://127.0.0.1:5000"
  : "https://YOUR-DEPLOYED-API-DOMAIN";

function getPayload() {
  const val = id => document.getElementById(id).value.trim();
  const tier = [...document.querySelectorAll('input[name="tier"]')].find(r=>r.checked)?.value || "Essential";
  return {
    lender: { name: val("lenderName"), email: val("lenderEmail"), phone: val("lenderPhone") },
    borrower: { name: val("borrowerName"), email: val("borrowerEmail"), phone: val("borrowerPhone") },
    loan: {
      principal: Number(val("principal") || 0),
      flatFee: Number(val("flatFee") || 0),
      startDate: val("startDate"),
      termMonths: Number(val("termMonths") || 1),
      paymentFrequency: document.getElementById("paymentFrequency").value
    },
    tier
  };
}

async function callApi(path, payload) {
  const status = document.getElementById("status");
  status.textContent = "Preparing your document…";
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok || !res.headers.get("content-type")?.includes("application/pdf")) {
      const err = await res.json().catch(()=>({}));
      throw new Error(err.error || "Failed to generate PDF");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = path.includes("schedule") ? "payment_schedule.pdf" : "contract.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    status.textContent = "Done. Your PDF has downloaded.";
  } catch (e) {
    console.error(e);
    status.textContent = `Error: ${e.message}`;
  }
}

document.getElementById("btnContract").addEventListener("click", () => {
  callApi("/api/generate/contract", getPayload());
});

document.getElementById("btnSchedule").addEventListener("click", () => {
  callApi("/api/generate/schedule", getPayload());
});
