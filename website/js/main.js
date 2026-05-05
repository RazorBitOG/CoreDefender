/* ============================================
   CoreDefender — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Theme Toggle ----
  const themeBtn = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('cd-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  else if (!prefersDark) document.documentElement.setAttribute('data-theme', 'light');

  themeBtn?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('cd-theme', next);
    themeBtn.innerHTML = next === 'light' ? '🌙' : '☀️';
  });
  // set initial icon
  if (themeBtn) themeBtn.innerHTML = document.documentElement.getAttribute('data-theme') === 'light' ? '🌙' : '☀️';

  // ---- Navbar scroll ----
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ---- Mobile nav ----
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav-close');
  mobileToggle?.addEventListener('click', () => mobileNav?.classList.add('open'));
  mobileClose?.addEventListener('click', () => mobileNav?.classList.remove('open'));
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

  // ---- Smooth scroll for nav links ----
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // ---- Scroll reveal ----
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => revealObserver.observe(el));

  // ---- FAQ accordion ----
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
  });

  // ---- Scan animation ----
  const scanCircle = document.querySelector('.scan-circle');
  const scanPercent = document.querySelector('.scan-percent');
  const scanFilesVal = document.getElementById('scan-files');
  const scanThreatsVal = document.getElementById('scan-threats');
  let scanTriggered = false;

  if (scanCircle) {
    const scanObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !scanTriggered) {
          scanTriggered = true;
          scanCircle.classList.add('animating');
          let pct = 0;
          const interval = setInterval(() => {
            pct += 1;
            if (scanPercent) scanPercent.textContent = pct + '%';
            if (scanFilesVal) scanFilesVal.textContent = Math.floor(pct * 1428.56).toLocaleString();
            if (pct >= 100) {
              clearInterval(interval);
              if (scanThreatsVal) scanThreatsVal.textContent = '0';
            }
          }, 20);
        }
      });
    }, { threshold: 0.5 });
    scanObserver.observe(scanCircle);
  }

  // ---- Hero counter animation ----
  function animateCounter(el, target, duration = 2000) {
    let start = 0;
    const step = target / (duration / 16);
    const tick = () => {
      start += step;
      if (start >= target) { el.textContent = target.toLocaleString() + (el.dataset.suffix || ''); return; }
      el.textContent = Math.floor(start).toLocaleString() + (el.dataset.suffix || '');
      requestAnimationFrame(tick);
    };
    tick();
  }
  document.querySelectorAll('[data-counter]').forEach(el => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { animateCounter(el, parseInt(el.dataset.counter), 2000); observer.disconnect(); }
    }, { threshold: 0.5 });
    observer.observe(el);
  });

  // ---- Particle Background (mouse-reactive) ----
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;
    let mouse = { x: -9999, y: -9999 };
    const MOUSE_RADIUS = 160;

    function resize() {
      w = canvas.width = canvas.parentElement.offsetWidth;
      h = canvas.height = canvas.parentElement.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Track mouse over hero section
    const heroEl = document.querySelector('.hero');
    heroEl?.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    heroEl?.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.baseVx = (Math.random() - 0.5) * 0.4;
        this.baseVy = (Math.random() - 0.5) * 0.4;
        this.vx = this.baseVx;
        this.vy = this.baseVy;
        this.r = Math.random() * 1.5 + 0.5;
        this.alpha = Math.random() * 0.4 + 0.1;
      }
      update() {
        // Mouse interaction — gentle attraction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.015;
          this.vx += dx / dist * force;
          this.vy += dy / dist * force;
        }
        // Dampen back toward base velocity
        this.vx += (this.baseVx - this.vx) * 0.02;
        this.vy += (this.baseVy - this.vy) * 0.02;

        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
      }
      draw() {
        // Glow up near mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const boost = dist < MOUSE_RADIUS ? (1 - dist / MOUSE_RADIUS) * 0.5 : 0;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r + boost, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${Math.min(this.alpha + boost, 0.8)})`;
        ctx.fill();
      }
    }

    const count = Math.min(90, Math.floor(w * h / 10000));
    for (let i = 0; i < count; i++) particles.push(new Particle());

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.08 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        // Draw line from particle to mouse if close
        const dxm = particles[i].x - mouse.x;
        const dym = particles[i].y - mouse.y;
        const distM = Math.sqrt(dxm * dxm + dym * dym);
        if (distM < MOUSE_RADIUS) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(0, 212, 255, ${0.12 * (1 - distM / MOUSE_RADIUS)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ---- Download button interaction ----
  const dlBtn = document.getElementById('download-btn');
  if (dlBtn) {
    dlBtn.addEventListener('click', (e) => {
      e.preventDefault();
      dlBtn.innerHTML = '⏳ Preparing download...';
      dlBtn.style.pointerEvents = 'none';
      setTimeout(() => {
        dlBtn.innerHTML = '✅ Download Started!';
        setTimeout(() => {
          dlBtn.innerHTML = '⬇ Download Free — Windows';
          dlBtn.style.pointerEvents = 'auto';
        }, 2000);
      }, 1500);
    });
  }
});
