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
  window.renderReviewSlider = async function (sectionEl, trackEl, dotsEl) {
    if (!sectionEl || !trackEl || !dotsEl) return;
    try {
      const txt = await fetch(CSV_URL, { cache: 'no-store' }).then(r => { if (!r.ok) throw 0; return r.text(); });
      const rows = parseCSV(txt).slice(1).filter(r => r[1] && r[4]);
      if (!rows.length) return;
      trackEl.innerHTML = rows.map(r => {
        const rating = Math.max(0, Math.min(5, parseInt(r[3], 10) || 0));
        return `<article class="review-slide"><div class="review-google"><span class="google-g">G</span> CLIENT REVIEW</div><div class="review-stars" aria-label="${rating} out of 5 stars">${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</div><p>“${esc(r[4])}”</p><div class="review-author"><strong>${esc(r[1])}</strong><span>${r[2] ? esc(r[2]) : 'Verified Client'}</span></div></article>`;
      }).join('');
      const slides = [...trackEl.children];
      let index = 0, timer;
      const visible = () => window.matchMedia('(max-width: 680px)').matches ? 1 : (window.matchMedia('(max-width: 980px)').matches ? 2 : 3);
      const maxIndex = () => Math.max(0, slides.length - visible());
      const dotsCount = () => maxIndex() + 1;
      const render = () => {
        index = Math.min(index, maxIndex());
        const width = slides[0].getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(trackEl).gap) || 0;
        trackEl.style.transform = `translateX(-${index * (width + gap)}px)`;
        dotsEl.innerHTML = Array.from({length:dotsCount()}, (_,i) => `<button type="button" class="review-dot ${i===index?'active':''}" aria-label="Go to review group ${i+1}" data-index="${i}"></button>`).join('');
        dotsEl.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => { index=Number(btn.dataset.index); render(); restart(); }));
      };
      const step = delta => { index = (index + delta + dotsCount()) % dotsCount(); render(); };
      sectionEl.querySelector('.review-prev').addEventListener('click', () => {step(-1);restart();});
      sectionEl.querySelector('.review-next').addEventListener('click', () => {step(1);restart();});
      const restart = () => { clearInterval(timer); if (dotsCount()>1) timer=setInterval(()=>step(1),5000); };
      sectionEl.hidden = false;
      render(); restart();
      window.addEventListener('resize', render);
      sectionEl.addEventListener('mouseenter', () => clearInterval(timer));
      sectionEl.addEventListener('mouseleave', restart);
    } catch (e) { console.warn('Could not load client reviews', e); }
  };

})();