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

