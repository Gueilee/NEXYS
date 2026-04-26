/* ══════════════════════════════════════════════════════
   NEXYS — main.js
══════════════════════════════════════════════════════ */

'use strict';

/* ── Header scroll effect ───────────────────────────── */
(function () {
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Mobile nav ─────────────────────────────────────── */
(function () {
  const btn  = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.querySelectorAll('.nav-link').forEach(link =>
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    })
  );

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      btn.focus();
    }
  });
})();

/* ── Smooth scroll for anchors ──────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Scroll reveal ──────────────────────────────────── */
(function () {
  const elements = document.querySelectorAll('.reveal-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();

/* ── Animated counters ──────────────────────────────── */
(function () {
  const counters = document.querySelectorAll('.count');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target  = parseInt(el.dataset.to, 10);
    const suffix  = el.dataset.suffix || '';
    const dur     = 1800;
    const start   = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / dur, 1);
      const value    = Math.round(easeOut(progress) * target);
      el.textContent = value + (progress === 1 ? suffix : '');
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();

/* ── FAQ accordion ──────────────────────────────────── */
(function () {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.faq-q');
    const ans = item.querySelector('.faq-a');
    if (!btn || !ans) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      items.forEach(other => {
        const otherBtn = other.querySelector('.faq-q');
        const otherAns = other.querySelector('.faq-a');
        if (!otherBtn || !otherAns) return;
        otherBtn.setAttribute('aria-expanded', 'false');
        otherAns.hidden = true;
        otherAns.style.maxHeight = '0';
      });

      // Toggle clicked
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        ans.hidden = false;
        ans.style.maxHeight = ans.scrollHeight + 'px';
      }
    });
  });
})();

/* ── Contact form ───────────────────────────────────── */
(function () {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const submitBtn = form ? form.querySelector('[type="submit"]') : null;
  if (!form) return;

  function showSuccess() {
    form.reset();
    if (success) {
      success.removeAttribute('hidden');
      success.style.display = 'flex';
      setTimeout(() => { success.setAttribute('hidden', ''); }, 8000);
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Solicitar diagnóstico gratuito';
    }
  }

  function saveLeadLocally(lead) {
    try {
      const key   = 'nexys_leads';
      const leads = JSON.parse(localStorage.getItem(key) || '[]');
      leads.push({ ...lead, timestamp: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(leads));
    } catch (_) { /* storage unavailable */ }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#FF5F57';
        valid = false;
        field.addEventListener('input', () => (field.style.borderColor = ''), { once: true });
      }
    });
    if (!valid) return;

    const data      = new FormData(form);
    const name      = data.get('name')?.trim()      || '';
    const email     = data.get('email')?.trim()     || '';
    const whatsapp  = data.get('whatsapp')?.trim()  || '';
    const company   = data.get('company')?.trim()   || '';
    const challenge = data.get('challenge')?.trim() || '';
    const lead      = { name, email, whatsapp, company, challenge };

    if (submitBtn) {
      submitBtn.disabled    = true;
      submitBtn.textContent = 'Enviando…';
    }

    /* Primary: Formsubmit.co — envia e-mail para nexys.consultoria@gmail.com.
       Na PRIMEIRA submissão, chegará um e-mail de ativação — clique no link.
       Após isso, cada lead chega como e-mail formatado na sua caixa. */
    fetch('https://formsubmit.co/ajax/nexys.consultoria@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        ...lead,
        _subject:  `[NEXYS] Novo lead — ${name}`,
        _template: 'table',
        _captcha:  'false',
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('formsubmit_error');
        return res.json();
      })
      .then(() => {
        saveLeadLocally(lead);
        showSuccess();
      })
      .catch(() => {
        /* Fallback: abre cliente de e-mail do usuário */
        const subject = encodeURIComponent(`[NEXYS] Diagnóstico gratuito — ${name}`);
        const body    = encodeURIComponent(
          `Nome: ${name}\nE-mail: ${email}\nWhatsApp: ${whatsapp}\nEmpresa: ${company}\n\nDesafio:\n${challenge}`
        );
        window.location.href = `mailto:nexys.consultoria@gmail.com?subject=${subject}&body=${body}`;
        saveLeadLocally(lead);
        showSuccess();
      });
  });
})();

/* ── Active nav link on scroll ──────────────────────── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  const navH = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;

  const onScroll = () => {
    const scrollY = window.scrollY + navH() + 32;
    let current   = '';

    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) current = sec.id;
    });

    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Card tilt on mouse move (subtle) ───────────────── */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.service-card, .diff-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = (e.clientX - rect.left) / rect.width  - 0.5;
      const y      = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-3px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();
