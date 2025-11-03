// Smart API base: local dev → Flask on 127.0.0.1:5000, otherwise → Render API
const isLocal = ["localhost", "127.0.0.1", ""].includes(location.hostname);
const API_BASE = isLocal ? "http://127.0.0.1:5000" : "https://trustlend-api.onrender.com";

// Collect payload from the form
function getPayload() {
  const val = (id) => document.getElementById(id).value.trim();
  const tier =
    [...document.querySelectorAll('input[name="tier"]')].find((r) => r.checked)
      ?.value || "Essential";

  return {
    lender: {
      name: val("lenderName"),
      email: val("lenderEmail"),
      phone: val("lenderPhone"),
    },
    borrower: {
      name: val("borrowerName"),
      email: val("borrowerEmail"),
      phone: val("borrowerPhone"),
    },
    loan: {
      principal: Number(val("principal") || 0),
      flatFee: Number(val("flatFee") || 0),
      startDate: val("startDate"),
      termMonths: Number(val("termMonths") || 1),
      paymentFrequency: document.getElementById("paymentFrequency").value,
    },
    tier,
  };
}

// Call the API and trigger a file download
async function callApi(path, payload) {
  const status = document.getElementById("status");
  status.textContent = "Preparing your document…";

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Expecting a PDF back
    const ctype = res.headers.get("content-type") || "";
    if (!res.ok || !ctype.includes("application/pdf")) {
      // Try to read JSON error if present
      let errMsg = "Failed to generate PDF";
      try {
        const errJson = await res.json();
        if (errJson?.error) errMsg = errJson.error;
      } catch (_) {
        /* ignore parse error */
      }
      throw new Error(errMsg);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = path.includes("schedule")
      ? "payment_schedule.pdf"
      : "contract.pdf";
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

// Wire up buttons
document
  .getElementById("btnContract")
  .addEventListener("click", () => callApi("/api/generate/contract", getPayload()));

document
  .getElementById("btnSchedule")
  .addEventListener("click", () => callApi("/api/generate/schedule", getPayload()));
