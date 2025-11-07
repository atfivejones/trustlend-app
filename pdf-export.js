// --- TrustLend PDF payload bridge (auto-injected) ---
function __tl_preparePdfPayload(extra){
  try {
    if (typeof buildPdfPayload === 'function') return buildPdfPayload(extra||{});
    if (typeof collectContractData === 'function') {
      const base = collectContractData();
      if (window.noteExportMeta && window.noteExportMeta.receipt) base.paymentReceipt = window.noteExportMeta.receipt;
      return Object.assign({}, base, extra||{});
    }
  } catch(e){ console.warn('preparePdfPayload fallback', e); }
  return extra||{};
}
// --- end bridge ---

// pdf-export.js (POST version) - sends payload to your backend for Documint PDF generation
window.TrustLendPdf = (function(){
  function downloadBlob(blob, filename){
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'promissory-note.pdf';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }
  async function exportViaServer(payload){
    try {
      const resp = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const ct = resp.headers.get('Content-Type') || '';
      if (!resp.ok) {
        const text = await resp.text().catch(()=>''); 
        alert('PDF error: ' + text);
        return;
      }
      if (ct.includes('application/pdf') || ct.includes('application/octet-stream')) {
        const blob = await resp.blob();
        downloadBlob(blob, (payload && payload.title ? payload.title : 'promissory-note') + '.pdf');
      } else {
        const json = await resp.json().catch(()=>null);
        if (json && json.documint && (json.documint.url || json.documint.download_url)) {
          window.open(json.documint.url || json.documint.download_url, '_blank');
        } else {
          alert('PDF created. Check server logs/response for details.');
          console.log('PDF response:', json);
        }
      }
    } catch (e) {
      console.error(e);
      alert('PDF request failed: ' + (e && e.message ? e.message : e));
    }
  }
  return { export: exportViaServer };
})();
