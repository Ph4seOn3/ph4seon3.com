/* ══════════════════════════════════════════
   ph4seon3 — script.js
   ══════════════════════════════════════════ */

// ─── 1. TYPEWRITER ───────────────────────────────────────────────────────────

const lines = [
  { text: '$ whoami',                              cls: 'cmd', pause: 500 },
  { text: 'ph4seon3  //  jeffy k.',                cls: 'hi',  pause: 700 },
  { text: '$ cat about.txt',                       cls: 'cmd', pause: 400 },
  { text: 'production partner for technical creators.', cls: 'out', pause: 300 },
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


// ─── 2. SCROLL REVEAL ────────────────────────────────────────────────────────

const revealEls = document.querySelectorAll('[data-reveal]');

if (revealEls.length && !prefersReduced) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0);
        setTimeout(() => el.classList.add('is-visible'), delay);
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));
} else {
  // No animation — just show everything
  revealEls.forEach(el => el.classList.add('is-visible'));
}


// ─── 3. COUNT-UP ─────────────────────────────────────────────────────────────

function countUp(el, finalText, duration = 1400) {
  const isMillion = finalText.includes('M');
  const targetNum = parseFloat(finalText.replace(/[^0-9.]/g, ''));
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * targetNum;

    if (isMillion) {
      el.textContent = '~' + current.toFixed(1) + 'M';
    } else {
      el.textContent = Math.round(current).toString();
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = finalText;
    }
  }

  requestAnimationFrame(update);
}

const statNumbers = document.querySelectorAll('.stat-number[data-final]');
let statsCounted = false;

if (statNumbers.length) {
  const statsSection = document.getElementById('stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !statsCounted) {
        statsCounted = true;
        statNumbers.forEach(el => {
          if (!prefersReduced) countUp(el, el.dataset.final);
          else el.textContent = el.dataset.final;
        });
        statsObserver.disconnect();
      }
    }, { threshold: 0.4 });
    statsObserver.observe(statsSection);
  }
}


// ─── 4. NAV SCROLL HIGHLIGHT ─────────────────────────────────────────────────

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

// ─── 5. FOOTER YEAR ───────────────────────────────────────────────────────────

const footerYear = document.querySelector('.footer-year');

if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}
