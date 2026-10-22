/* Shows approved customer reviews from the published Google Sheet tab "Reviews – Public".
 * Approve a review: type Yes in column I of "Form Responses 2". Shows within ~5 min. */
(function () {
  const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTF8S_VftRMKVv0T9wJnJpkEtmOaG_9_0PjHCO-qxGYG9ZH2rkQvPOeKgkeN_6QIH2h-hKGVCU1Yuxg/pub?gid=1288716198&single=true&output=csv';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function parseCSV(t) {
    const rows = []; let row = [], f = '', q = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
      else f += c;
    }
    if (f || row.length) { row.push(f); rows.push(row); }
    return rows;
  }

  window.renderReviews = async function (listEl, sectionEl, max) {
    try {
      const txt = await fetch(CSV_URL, { cache: 'no-store' }).then(r => { if (!r.ok) throw 0; return r.text(); });
      // columns: Timestamp, Name, Service, Rating, Review
      const rows = parseCSV(txt).slice(1).filter(r => r[1] && r[4]);
      if (!rows.length) return;
      listEl.innerHTML = rows.slice(0, max || 30).map(r => {
        const n = Math.max(0, Math.min(5, parseInt(r[3], 10) || 0));
        return `<div class="rv-item"><div class="s">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</div>
          <p>“${esc(r[4])}”</p><small>— ${esc(r[1])}${r[2] ? ' · ' + esc(r[2]) : ''}</small></div>`;
      }).join('');
      sectionEl.style.display = '';
    } catch (e) { /* no reviews shown if sheet unreachable */ }
  };
})();
