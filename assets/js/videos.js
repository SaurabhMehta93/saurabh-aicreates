/* Auto video gallery – reads the videos/ folder list from GitHub, so a new video
 * pushed into videos/<folder>/ shows up on the site with no code change.
 *  - Folders in OUR_WORK  -> "Our Work" (home page)
 *  - Any other folder      -> a client section on clients.html
 */
(function () {
  const REPO = 'SaurabhMehta93/saurabh-aicreates', BRANCH = 'main';
  const OUR_WORK = { 'wedding': 'Wedding', 'birthday': 'Birthday', 'family-story': 'Family Story', 'devotional': 'Devotional' };
  // Optional nicer names for client folders. New folders without an entry get an auto name.
  const CLIENT_NAMES = {
    'sanket_trivedi': 'Dr. Sanket Trivedi – Rudraksh Orthopaedic Hospital',
    'ganapati_videos': 'Ganpati Aagman Videos',
    'AbscratArt': 'Abstract Art',
    'Shreeji': 'Shreeji'
  };
  const EXT = /\.(mp4|webm|mov|m4v)$/i;

  const pretty = s => s.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const url = p => p.split('/').map(encodeURIComponent).join('/');

  async function listVideos() {
    let paths = [];
    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`);
      if (r.ok) paths = (await r.json()).tree.filter(t => t.type === 'blob').map(t => t.path);
    } catch (e) {}
    // backup list (used for local preview or if GitHub API limit is hit)
    if (!paths.some(p => p.startsWith('videos/') && EXT.test(p))) {
      try { paths = await fetch('videos/videos.json').then(r => r.json()); } catch (e) {}
    }
    const groups = {};
    paths.filter(p => /^videos\/[^/]+\/[^/]+$/.test(p) && EXT.test(p)).forEach(p => {
      const f = p.split('/')[1];
      (groups[f] = groups[f] || []).push(p);
    });
    Object.values(groups).forEach(a => a.sort((x, y) => x.localeCompare(y, undefined, { numeric: true })));
    return groups;
  }

  const card = p => `<div class="vid"><video src="${url(p)}#t=0.1" controls playsinline preload="metadata"></video></div>`;

  window.renderOurWork = async function (el) {
    const g = await listVideos();
    const html = Object.keys(OUR_WORK).filter(k => g[k]).map(k => g[k].map(card).join('')).join('');
    if (html) el.innerHTML = html;
  };

  window.renderClients = async function (el, navEl) {
    const g = await listVideos();
    const clients = Object.keys(g).filter(k => !OUR_WORK[k]).sort((a, b) => a.localeCompare(b));
    if (!clients.length) { el.innerHTML = '<p class="note" style="text-align:center">Client videos coming soon.</p>'; return; }
    const name = k => CLIENT_NAMES[k] || pretty(k);
    const id = k => 'c-' + k.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (navEl) navEl.innerHTML = clients.map(k => `<a class="tab" href="#${id(k)}">${esc(name(k))}</a>`).join('');
    el.innerHTML = clients.map(k => `
      <div class="client-block" id="${id(k)}">
        <div class="client-head"><h3>${esc(name(k))}</h3><span>${g[k].length} video${g[k].length > 1 ? 's' : ''}</span></div>
        <div class="gallery">${g[k].map(card).join('')}</div>
      </div>`).join('');
  };
})();
