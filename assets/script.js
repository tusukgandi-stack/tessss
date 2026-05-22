// ===== AVORIX LAB — Global Scripts =====

// Custom Cursor
const cur = document.getElementById('cur');
const ring = document.getElementById('curRing');
let mx = 0, my = 0, rx = 0, ry = 0;

// Boot Screen Logic
window.addEventListener('DOMContentLoaded', () => {
  const bootTextEl = document.getElementById('bootText');
  const bootScreen = document.getElementById('boot-screen');

  if (bootTextEl && bootScreen) {
    const messages = [
      "AVORIX_LAB OS v2.0",
      "> Initializing core modules...",
      "> Establishing secure connection... [OK]",
      "> System ready."
    ];

    let msgIndex = 0;
    let textBuffer = "";

    function typeLine() {
      if (msgIndex >= messages.length) {
        setTimeout(() => { bootScreen.classList.add('hidden'); }, 400);
        return;
      }
      textBuffer += messages[msgIndex] + "<br/>";
      bootTextEl.innerHTML = textBuffer + '<span class="boot-cursor"></span>';
      msgIndex++;
      setTimeout(typeLine, 300);
    }
    setTimeout(typeLine, 200);
  }

  // Init reveal observer
  initReveal();
  // Init clock
  tick();
  setInterval(tick, 1000);
});


// Cursor animation
if (cur && ring && window.matchMedia('(pointer:fine)').matches) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px'; cur.style.top = my + 'px';
  });
  (function animR() {
    rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animR);
  })();
  document.querySelectorAll('a, button, .bc, .tool-card, .faq-q, .glitch-txt, .article-card').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('hov'));
    el.addEventListener('mouseleave', () => cur.classList.remove('hov'));
  });
}

// Dynamic Mouse Glow for Bento Cards
document.querySelectorAll('.bc').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

// Mobile Menu
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }));
}


// Matrix Easter Egg (type "avorixlab")
let secretCode = 'avorixlab';
let inputBuffer = '';
let matrixActive = false;

document.addEventListener('keydown', (e) => {
  if (matrixActive) return;
  inputBuffer += e.key.toLowerCase();
  if (inputBuffer.length > secretCode.length) inputBuffer = inputBuffer.slice(-secretCode.length);
  if (inputBuffer === secretCode) activateMatrix();
});

function activateMatrix() {
  matrixActive = true;
  document.body.classList.add('matrix-mode');
  const statusEl = document.querySelector('.nav-status');
  if (statusEl) statusEl.innerHTML = '<span class="dot"></span>OVERRIDE ACCEPTED';

  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();

  const alphabet = 'アァカサタナハマヤャラワガザダバパABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const fontSize = 16;
  let columns = Math.floor(canvas.width / fontSize);
  let drops = Array.from({ length: columns }, () => 1);

  function draw() {
    ctx.fillStyle = 'rgba(2, 6, 2, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  setInterval(draw, 30);
  window.addEventListener('resize', () => {
    resize();
    columns = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: columns }, () => 1);
  });
}

// FAQ Accordion
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!isActive) item.classList.add('active');
  });
});

// Scroll Reveal
function initReveal() {
  const obs = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
  }), { threshold: 0.1, rootMargin: '0px 0px -45px 0px' });
  document.querySelectorAll('.r').forEach(el => obs.observe(el));
}

// Clock
function tick() {
  const t = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
  const clock = document.getElementById('clock');
  if (clock) clock.textContent = t + ' WIB';
}
