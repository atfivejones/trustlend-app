
/**
 * TrustLend contracts.js (cleanup)
 * - Removes any legacy duplicate "Payment Breakdown in Preview"
 * - Exposes a helper to pull canonical inputs for PDF payloads & Documint
 */
export function collectContractData(){
  const $ = (id)=>document.getElementById(id);
  const clean = (s)=> (s||"").toString().trim();
  const num = (s)=> (isFinite(parseFloat(s)) ? parseFloat(s) : 0);
  const get = (id)=> (document.getElementById(id)?.value ?? "");

  return {
    principal: num(get('principal')),
    loanDate: clean(get('loanDate')),
    dueDate: clean(get('dueDate')),
    schedule: clean(get('paymentSchedule')),
    firstPaymentDue: clean(get('firstPaymentDue')),
    borrowerName: clean(get('borrowerFullName') || get('borrowerName')),
    lenderName: clean(get('lenderFullName') || get('lenderName')),
    // breakdown rows (if present)
    breakdown: Array.from(document.querySelectorAll('#breakdownBody tr')).map(tr => {
      const tds = tr.querySelectorAll('td');
      return {
        index: (tds[0]?.textContent||'').trim(),
        date: (tds[1]?.textContent||'').trim(),
        amount: (tds[2]?.textContent||'').replace('$','').trim()
      };
    })
  };
}
