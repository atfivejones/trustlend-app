
/**
 * TrustLend forms.js (synced to canonical create-note.html)
 * - Calculates First Payment Due Date from schedule + loanDate (Lump Sum mirrors dueDate)
 * - Generates payment breakdown into #breakdownBody and #breakdownTotal
 * - Keeps Contract Preview fields in sync
 * IDs expected: principal, loanDate, dueDate, paymentSchedule, firstPaymentDue
 * Optional preview spans: #previewPrincipal, #previewLoanDate, #previewDueDate,
 *   #previewSchedule, #previewPaymentAmount
 */
(function(){
  const $ = (id)=>document.getElementById(id);
  const fmtMoney = (n)=> (isFinite(n) ? (Number(n).toFixed(2)) : "0.00");
  const toDate = (v)=> v ? new Date(v+"T00:00:00") : null;
  const ymd = (d)=> d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` : "";

  function addDays(d, n){ const dt = new Date(d); dt.setDate(dt.getDate()+n); return dt; }
  function addMonths(d, n){ const dt = new Date(d); const day = dt.getDate(); dt.setMonth(dt.getMonth()+n); while (dt.getDate()!==day) dt.setDate(dt.getDate()-1); return dt; }

  function syncPreview(){
    const p = $('principal')?.value || 0;
    const loanDate = $('loanDate')?.value || "";
    const dueDate = $('dueDate')?.value || "";
    const sched = $('paymentSchedule')?.value || "";
    $('previewPrincipal') && ($('previewPrincipal').textContent = fmtMoney(p));
    $('previewLoanDate') && ($('previewLoanDate').textContent = loanDate || "—");
    $('previewDueDate') && ($('previewDueDate').textContent = dueDate || "—");
    $('previewSchedule') && ($('previewSchedule').textContent =
      sched==='lump_sum' ? "Lump Sum" :
      sched==='monthly' ? "Monthly" :
      sched==='weekly' ? "Weekly" :
      sched==='biweekly' ? "Bi-weekly" : "—");
  }

  function smartFirstPayment(){
    const sched = $('paymentSchedule')?.value;
    const loanDate = $('loanDate')?.value;
    const dueDate = $('dueDate')?.value;
    if(!sched) return;

    if(sched==='lump_sum'){
      if (dueDate) $('firstPaymentDue') && ($('firstPaymentDue').value = dueDate);
      return;
    }
    if(!loanDate) return;
    const base = toDate(loanDate);
    let out = base;
    if(sched==='weekly') out = addDays(base, 7);
    else if(sched==='biweekly') out = addDays(base, 14);
    else if(sched==='monthly') out = addMonths(base, 1);
    $('firstPaymentDue') && ($('firstPaymentDue').value = ymd(out));
  }

  function generateBreakdown(){
    const sched = $('paymentSchedule')?.value;
    const p = parseFloat($('principal')?.value || "0");
    const loanDate = toDate($('loanDate')?.value);
    const dueDate = toDate($('dueDate')?.value);
    const tbody = document.querySelector('#breakdownBody');
    const totalEl = document.querySelector('#breakdownTotal');
    if(!tbody || !totalEl){ return; }
    tbody.innerHTML = "";
    if(!p || !sched){ totalEl.textContent = "$0.00"; return; }

    // Determine installments and dates
    let dates = [];
    if(sched==='lump_sum'){
      if(!dueDate){ totalEl.textContent = "$"+fmtMoney(p); return; }
      dates = [dueDate];
    } else {
      if(!loanDate || !dueDate){ totalEl.textContent = "$"+fmtMoney(p); return; }
      let cur = toDate($('firstPaymentDue')?.value) || loanDate;
      // make sure first payment date is after loanDate
      if(cur <= loanDate){
        if(sched==='weekly') cur = addDays(loanDate, 7);
        else if(sched==='biweekly') cur = addDays(loanDate, 14);
        else if(sched==='monthly') cur = addMonths(loanDate, 1);
      }
      // iterate until dueDate
      while(cur <= dueDate){
        dates.push(new Date(cur));
        if(sched==='weekly') cur = addDays(cur, 7);
        else if(sched==='biweekly') cur = addDays(cur, 14);
        else if(sched==='monthly') cur = addMonths(cur, 1);
        else break;
      }
      if(dates.length===0) dates = [dueDate];
    }

    // Split principal evenly; push remainder (pennies) to last installment
    const n = dates.length;
    const base = Math.floor((p/n)*100)/100; // floor to cents
    const amounts = Array(n).fill(base);
    const remainder = +(p - base*n).toFixed(2);
    if(remainder>0) amounts[n-1] = +(amounts[n-1] + remainder).toFixed(2);

    let total = 0;
    dates.forEach((d,i)=>{
      const tr = document.createElement('tr');
      const idx = document.createElement('td'); idx.textContent = String(i+1);
      const dt = document.createElement('td'); dt.textContent = ymd(d);
      const amt = document.createElement('td'); amt.className = 'text-right'; amt.textContent = "$"+fmtMoney(amounts[i]);
      total += amounts[i];
      tr.append(idx, dt, amt);
      tbody.appendChild(tr);
    });
    totalEl.textContent = "$"+fmtMoney(total);

    // If there is a preview payment amount field, set the single-payment amount for recurring plans
    if(n>1 && $('previewPaymentAmount')) $('previewPaymentAmount').textContent = fmtMoney(amounts[0]);
    if(n===1 && $('previewPaymentAmount')) $('previewPaymentAmount').textContent = fmtMoney(p);
  }

  function recalc(){
    smartFirstPayment();
    generateBreakdown();
    syncPreview();
  }

  ['principal','loanDate','dueDate','paymentSchedule','firstPaymentDue'].forEach(id=>{
    const el = $(id); if(!el) return;
    ['change','input'].forEach(evt=> el.addEventListener(evt, recalc));
  });

  // on load
  window.addEventListener('DOMContentLoaded', ()=>{
    recalc();
  });
})();
