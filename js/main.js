/* Coastline Moto Watamu: lingua, comparsa delle sezioni, contatori, effetti al passaggio del mouse. */
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Lingua: i testi stanno in i18n/en.json e i18n/sw.json ---------- */
async function setLang(lang, chosen) {
  let t;
  try {
    t = await (await fetch(`i18n/${lang}.json`)).json();
  } catch {
    root.classList.remove('i18n-wait');
    return; // senza rete restano i testi inglesi scritti nell'HTML
  }
  root.lang = lang;
  root.classList.remove('i18n-wait');
  // L'indirizzo segue la lingua (?lang=sw); la scelta fatta dal visitatore resta salvata
  const url = new URL(location.href);
  if (chosen || lang !== 'en' || url.searchParams.has('lang')) {
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
  }
  if (chosen) try { localStorage.setItem('lang', lang); } catch {}
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (t[el.dataset.i18n] != null) el.textContent = t[el.dataset.i18n];
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => { el.alt = t[el.dataset.i18nAlt]; });
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
  b.addEventListener('click', () => setLang(b.dataset.lang, true));
});
setLang(root.lang === 'sw' ? 'sw' : 'en'); // la lingua iniziale la decide lo script nell'<head>

/* ---------- Header: diventa pieno dopo la hero; menu a tendina sul telefono ---------- */
const hdr = document.querySelector('.hdr');
const onScroll = () => hdr.classList.toggle('solid', scrollY > 40);
onScroll();
addEventListener('scroll', onScroll, { passive: true });

const menuBtn = document.querySelector('.menu-btn');
const nav = document.getElementById('nav');
function menu(open) {
  menuBtn.setAttribute('aria-expanded', open);
  nav.classList.toggle('open', open);
  hdr.classList.toggle('solid', open || scrollY > 40);
}
menuBtn.addEventListener('click', () => menu(menuBtn.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', e => { if (e.target.closest('a')) menu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { menu(false); menuBtn.focus(); } });

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

/* ---------- Video d'apertura ----------
   Sequenza: moto spenta nel deserto -> il visitatore tocca "Start" -> si accendono le luci, rombo del motore
   a tutta potenza, la moto sfreccia e colpisce la camera -> lampo arancione e si apre il sito.
   L'audio parte solo dopo un tocco (regola dei browser): per questo c'e' il pulsante d'avviamento.
   Per accenderlo: metti i file in video/ e scrivi data-intro="on" sul tag <html> in index.html.
   File: intro-9x16 (telefono, 720x1280) e intro-16x9 (computer, 1280x720), ognuno in .webm (AV1+Opus),
   .mp4 (H.264+AAC) e .webp (primo fotogramma, la moto spenta). */
(function () {
  const box = document.getElementById('intro');
  if (!root.classList.contains('intro-on') || !box) return;
  const v = box.querySelector('video');
  const start = box.querySelector('.intro-start');
  const IMPACT = 0.35;   // secondi prima della fine in cui parte il lampo dell'impatto
  let done = false;

  function reveal(impact) {
    if (done) return;
    done = true;
    try { sessionStorage.setItem('introSeen', '1'); } catch {}
    if (impact) box.classList.add('hit');
    box.classList.add('out');
    // l'audio sfuma invece di tagliarsi di colpo
    const fade = setInterval(() => { v.volume = Math.max(0, v.volume - 0.1); if (!v.volume) clearInterval(fade); }, 60);
    setTimeout(() => { v.pause(); root.classList.remove('intro-on'); box.remove(); }, impact ? 1100 : 600);
  }

  const name = innerHeight > innerWidth ? 'video/intro-9x16' : 'video/intro-16x9';
  v.poster = name + '.webp';
  v.innerHTML = `<source src="${name}.webm" type='video/webm; codecs="av01.0.05M.08, opus"'><source src="${name}.mp4" type="video/mp4">`;
  v.preload = 'auto';   // scarica mentre il visitatore guarda la moto spenta
  v.load();
  setTimeout(() => start.focus({ preventScroll: true }), 300);

  start.addEventListener('click', () => {
    box.classList.add('go');
    v.muted = false;
    if (navigator.vibrate) navigator.vibrate([40, 40, 120]);   // piccola vibrazione d'avviamento sui telefoni Android
    const p = v.play();
    if (p) p.catch(() => { v.muted = true; v.play().catch(() => reveal(false)); });
    // rete lenta: se dopo 4 s dal tocco il video non e' partito, si apre il sito
    setTimeout(() => { if (v.currentTime === 0) reveal(false); }, 4000);
  });

  v.addEventListener('timeupdate', () => { if (v.duration && v.duration - v.currentTime < IMPACT) reveal(true); });
  v.addEventListener('ended', () => reveal(true));
  v.addEventListener('error', () => reveal(false), true);
  box.querySelector('.intro-skip').addEventListener('click', () => reveal(false));
  addEventListener('keydown', e => { if (e.key === 'Escape') reveal(false); });
})();
