/* Existing sample/client video galleries + dynamic invitation template gallery. */
(function () {
  const REPO = 'SaurabhMehta93/saurabh-aicreates', BRANCH = 'main';
  const OUR_WORK = { wedding: 'Wedding', birthday: 'Birthday', 'family-story': 'Family Story', devotional: 'Devotional' };
  const CLIENT_NAMES = {
    sanket_trivedi: 'Dr. Sanket Trivedi – Rudraksh Orthopaedic Hospital',
    ganapati_videos: 'Ganpati Aagman Videos',
    AbscratArt: 'Abstract Art',
    Shreeji: 'Shreeji'
  };
  const EXT = /\.(mp4|webm|mov|m4v)$/i;
  const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;
  const pretty = s => s.replace(/^\d+[_-]?/, '').replace(/^[A-Z]+\d*[_-]?/i, '').replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url = p => p.split('/').map(encodeURIComponent).join('/');

  async function getTreePaths() {
    const r = await fetch(`https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`);
    if (!r.ok) throw new Error('Could not load the GitHub media list.');
    const data = await r.json();
    if (data.truncated) throw new Error('The GitHub media list is too large to read completely.');
    return (data.tree || []).filter(x => x.type === 'blob').map(x => x.path);
  }

  async function listVideos() {
    let paths = [];
    try { paths = await getTreePaths(); } catch (e) {
      try { paths = await fetch('videos/videos.json').then(r => r.json()); } catch (_) {}
    }
    const groups = {};
    paths.filter(p => /^videos\/[^/]+\/[^/]+$/.test(p) && EXT.test(p)).forEach(p => {
      const f = p.split('/')[1]; (groups[f] = groups[f] || []).push(p);
    });
    Object.values(groups).forEach(a => a.sort((x,y) => x.localeCompare(y, undefined, {numeric:true})));
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
    const clients = Object.keys(g).filter(k => !OUR_WORK[k]).sort((a,b) => a.localeCompare(b));
    if (!clients.length) { el.innerHTML = '<p class="note">Client videos coming soon.</p>'; return; }
    const name = k => CLIENT_NAMES[k] || pretty(k);
    const id = k => 'c-' + k.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    if (navEl) navEl.innerHTML = clients.map(k => `<a class="tab" href="#${id(k)}">${esc(name(k))}</a>`).join('');
    el.innerHTML = clients.map(k => `<div class="client-block" id="${id(k)}"><div class="client-head"><h3>${esc(name(k))}</h3><span>${g[k].length} video${g[k].length>1?'s':''}</span></div><div class="gallery">${g[k].map(card).join('')}</div></div>`).join('');
  };

  function titleFromFolder(folder) { return pretty(folder); }
  function categoryFromFolder(folder) {
    const labels = {'1_wedding':'Wedding Invitations','2_save_the_date':'Save The Date','3_engagement':'Engagement','4_shop_opening':'Shop Opening','5_birthday':'Birthday'};
    return labels[folder] || pretty(folder);
  }
  window.renderInvitationTemplates = async function (el, navEl) {
    if (!el) return;
    el.innerHTML = '<p class="note">Loading invitation templates…</p>';
    try {
      const paths = await getTreePaths();
      const base = 'videos/invitation_videos/templates/';
      const files = paths.filter(p => p.startsWith(base));
      const videos = files.filter(p => EXT.test(p));
      const templates = videos.map(videoPath => {
        const parts = videoPath.slice(base.length).split('/');
        if (parts.length !== 3) return null;
        const [category, folder] = parts;
        const siblings = files.filter(p => p.startsWith(base + category + '/' + folder + '/'));
        const cover = siblings.find(p => /\/IMG_Cover\.(png|jpe?g|webp)$/i.test(p))
          || siblings.find(p => /\/IMG_Cover_Final\.(png|jpe?g|webp)$/i.test(p))
          || siblings.find(p => IMAGE_EXT.test(p));
        return {category, folder, title:titleFromFolder(folder), video:videoPath, cover};
      }).filter(Boolean).sort((a,b) => a.category.localeCompare(b.category) || a.folder.localeCompare(b.folder, undefined, {numeric:true}));
      if (!templates.length) { el.innerHTML = '<p class="note">Invitation templates will appear here soon.</p>'; return; }
      const categories = [...new Set(templates.map(t => t.category))];
      if (navEl) navEl.innerHTML = '<button class="tab active" type="button" data-filter="all">All Templates</button>' +
        categories.map(c => `<button class="tab" type="button" data-filter="${esc(c)}">${esc(categoryFromFolder(c))}</button>`).join('');
      el.innerHTML = categories.map(category => {
        const items = templates.filter(t => t.category === category);
        return `<section class="template-category" data-category="${esc(category)}"><div class="client-head"><h3>${esc(categoryFromFolder(category))}</h3><span>${items.length} templates</span></div><div class="template-grid">${items.map(t => `
          <article class="template-card">
            <div class="template-media">
              ${t.cover ? `<img src="${url(t.cover)}" alt="${esc(t.title)} invitation cover" loading="lazy">` : '<div class="template-no-cover">Preview unavailable</div>'}
              <button class="template-play" type="button" aria-label="Play ${esc(t.title)} video">▶</button>
              <video src="${url(t.video)}#t=0.1" controls playsinline preload="none" aria-label="${esc(t.title)} invitation video"></video>
            </div>
            <div class="template-info"><h4>${esc(t.title)}</h4><span>${esc(categoryFromFolder(t.category))}</span></div>
          </article>`).join('')}</div></section>`;
      }).join('');
      el.querySelectorAll('.template-play').forEach(button => button.addEventListener('click', () => {
        const media = button.closest('.template-media'), video = media.querySelector('video');
        media.classList.add('is-playing'); video.preload = 'metadata'; video.play().catch(() => {});
      }));
      el.querySelectorAll('.template-media video').forEach(video => video.addEventListener('pause', () => {
        if (video.ended) video.closest('.template-media').classList.remove('is-playing');
      }));
      if (navEl) navEl.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
        navEl.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === button));
        const filter = button.dataset.filter;
        el.querySelectorAll('.template-category').forEach(section => section.hidden = filter !== 'all' && section.dataset.category !== filter);
      }));
    } catch (error) {
      el.innerHTML = '<p class="note">Unable to load invitation videos right now. Please refresh the page.</p>';
      console.error(error);
    }
  };
})();
