/* ══════════════════════════════════════════
   ph4seon3 — script.js
   ══════════════════════════════════════════ */

// ─── 1. TYPEWRITER ───────────────────────────────────────────────────────────

const lines = [
  { text: '$ whoami',                              cls: 'cmd', pause: 500 },
  { text: 'ph4seon3  //  jeffy k.',                cls: 'hi',  pause: 700 },
  { text: '$ cat about.txt',                       cls: 'cmd', pause: 400 },
  { text: 'cutting frames for people who ship code.', cls: 'out', pause: 300 },
  { text: 'clients: @t3dotgg @LowLevelTV',          cls: 'dim', pause: 120 },
  { text: '         @bmdavis419 @chantastic',       cls: 'dim', pause: 300 },
  { text: '         and more...',                   cls: 'dim', pause: 600 },
  { text: '$ _',                                   cls: 'cmd', pause: 0, done: true },
];

const output = document.getElementById('typewriter-output');
const cursor = document.getElementById('term-cursor');

// Skip typewriter if reduced motion is preferred
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReduced) {
  // Render all lines instantly
  lines.forEach(line => {
    if (line.done) return;
    const el = document.createElement('span');
    el.className = 'line ' + (line.cls || '');
    el.textContent = line.text;
    output.appendChild(el);
  });
  cursor.style.display = 'inline-block';
} else {
  let lineIdx = 0;
  let charIdx = 0;
  let currentEl = null;

  function type() {
    const line = lines[lineIdx];
    if (!line) return;

    // Start a new line element
    if (charIdx === 0) {
      currentEl = document.createElement('span');
      currentEl.className = 'line ' + (line.cls || '');
      output.appendChild(currentEl);
    }

    if (line.done) {
      // Show blinking cursor, stop
      cursor.style.display = 'inline-block';
      return;
    }

    if (charIdx < line.text.length) {
      currentEl.textContent += line.text[charIdx];
      charIdx++;
      // Vary speed slightly for realism
      const delay = line.cls === 'cmd' ? 55 : 28;
      setTimeout(type, delay + Math.random() * 20);
    } else {
      // Line done — pause then move to next
      charIdx = 0;
      lineIdx++;
      setTimeout(type, line.pause);
    }
  }

  // Small initial delay before typing starts
  setTimeout(type, 600);
}


// ─── 2. NAV SCROLL HIGHLIGHT ─────────────────────────────────────────────────

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.navbar-links a[href^="#"]');

if (sections.length && navLinks.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.navbar-links a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.35, rootMargin: `-${56}px 0px 0px 0px` });

  sections.forEach(s => observer.observe(s));
}


// ─── 3. YOUTUBE — FETCH PLAYLISTS + LIGHTBOX ─────────────────────────────────

const YT_API_KEY   = 'AIzaSyCxDa_Tlu1HOIiURSC14tJklTdemKi-BXo';
const PLAYLISTS    = [
  'PLSnIfBVgQ8o1QijR2y5-dFGARPcicl3jS',
  'PLSnIfBVgQ8o05YYirWMuEvyHkHmM-y2Ql',
];

const modal        = document.getElementById('yt-modal');
const modalIframe  = document.getElementById('yt-modal-iframe');
const closeBtn     = document.getElementById('yt-modal-close');
const backdrop     = document.getElementById('yt-modal-backdrop');
const featuredEl   = document.getElementById('yt-featured');
const gridEl       = document.getElementById('yt-grid');

// Fisher-Yates shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function fetchPlaylist(playlistId) {
  const videos = [];
  let pageToken = '';
  // Fetch up to 3 pages (150 videos max) to avoid burning quota
  for (let page = 0; page < 3; page++) {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('playlistId', playlistId);
    url.searchParams.set('key', YT_API_KEY);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res  = await fetch(url);
    const data = await res.json();
    if (!data.items) break;

    for (const item of data.items) {
      const s = item.snippet;
      // Skip deleted/private videos
      if (!s.thumbnails || s.title === 'Deleted video' || s.title === 'Private video') continue;
      videos.push({
        id:    s.resourceId.videoId,
        title: s.title,
        thumb: (s.thumbnails.maxres || s.thumbnails.high || s.thumbnails.medium).url,
      });
    }

    pageToken = data.nextPageToken || '';
    if (!pageToken) break;
  }
  return videos;
}

function makeThumbCard(video) {
  const card = document.createElement('div');
  card.className = 'yt-thumb-card';
  card.dataset.videoId = video.id;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.innerHTML = `
    <div class="yt-thumb-img-wrap">
      <img src="${video.thumb}" alt="${video.title}" loading="lazy" />
      <div class="yt-play-overlay"><span class="play-btn">▶</span></div>
    </div>
    <p class="yt-thumb-title">${video.title}</p>
  `;
  card.addEventListener('click', () => openModal(video.id));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(video.id); }
  });
  return card;
}

function renderFeatured(video) {
  featuredEl.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1"
      title="${video.title}"
      frameborder="0"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowfullscreen
      loading="lazy">
    </iframe>
  `;
}

async function loadYouTube() {
  try {
    const [list1, list2] = await Promise.all(PLAYLISTS.map(fetchPlaylist));
    const all = shuffle([...list1, ...list2]);

    if (all.length === 0) {
      featuredEl.innerHTML = '<div class="yt-loading">no videos found</div>';
      return;
    }

    // Featured = first after shuffle
    renderFeatured(all[0]);
    // Remaining cards (skip featured)
    all.slice(1).forEach(v => gridEl.appendChild(makeThumbCard(v)));
  } catch (err) {
    console.error('YouTube fetch failed:', err);
    featuredEl.innerHTML = '<div class="yt-loading">could not load videos</div>';
  }
}

loadYouTube();

// Lightbox
function openModal(videoId) {
  modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
}

function closeModal() {
  modal.classList.remove('open');
  modalIframe.src = '';
  document.body.style.overflow = '';
}

if (closeBtn) closeBtn.addEventListener('click', closeModal);
if (backdrop)  backdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});
