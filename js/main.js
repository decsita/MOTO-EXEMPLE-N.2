/* Coastline Moto Watamu: lingua, comparsa delle sezioni, contatori, effetti al passaggio del mouse. */
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Lingua: i testi stanno in i18n/en.json e i18n/sw.json ---------- */
async function setLang(lang) {
  let t;
  try {
    t = await (await fetch(`i18n/${lang}.json`)).json();
  } catch {
    return; // senza rete restano i testi inglesi scritti nell'HTML
  }
  root.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (t[el.dataset.i18n] != null) el.textContent = t[el.dataset.i18n];
  });
  document.querySelectorAll('[data-i18n-label]').forEach(el => {
    el.setAttribute('aria-label', t[el.dataset.i18nLabel]);
  });
  // Link WhatsApp: il numero è nell'href dell'HTML, qui si aggiunge solo il messaggio
  document.querySelectorAll('a[data-wa]').forEach(a => {
    const model = a.dataset.waModel ? a.dataset.waModel + '.' : '';
    a.href = a.href.split('?')[0] + '?text=' + encodeURIComponent(t[a.dataset.wa] + model);
  });
  document.querySelectorAll('[data-lang]').forEach(b => {
    const on = b.dataset.lang === lang;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on);
  });
}
document.querySelectorAll('[data-lang]').forEach(b => {
  b.addEventListener('click', () => setLang(b.dataset.lang));
});
setLang('en');

/* ---------- Comparsa delle sezioni e contatori dei dati tecnici ---------- */
function countUp(el) {
  const end = Number(el.dataset.count), t0 = performance.now();
  (function step(now) {
    const k = Math.min(1, (now - t0) / 1400);
    el.textContent = Math.round(end * (1 - (1 - k) ** 3));
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}
if (reduced || !('IntersectionObserver' in window)) {
  root.classList.remove('js'); // tutto visibile subito, niente movimento
} else {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      en.target.classList.add('in');
      if (en.target.dataset.count) countUp(en.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.rv, [data-count]').forEach(el => io.observe(el));

  addEventListener('scroll', () => root.style.setProperty('--sy', Math.round(scrollY)), { passive: true });

  /* Parallasse delle scritte di sfondo nella hero */
  const hero = document.querySelector('.hero');
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    hero.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  });
  hero.addEventListener('mouseleave', () => {
    hero.style.setProperty('--mx', 0);
    hero.style.setProperty('--my', 0);
  });

  /* Inclinazione 3D delle schede, solo con il mouse */
  if (matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 10 + 'deg');
        card.style.setProperty('--rx', ((e.clientY - r.top) / r.height - 0.5) * -8 + 'deg');
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--rx', '0deg');
      });
    });
  }
}
