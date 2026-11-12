/* Mappa: si carica solo quando la sezione "Find us" si avvicina, poi vola dal Kenya fino al negozio a Watamu.
   Libreria MapLibre GL (licenza BSD, nel repository in js/vendor), mappe OpenFreeMap senza chiave API.
   Se il telefono non ha WebGL o la rete non risponde, resta il disegno della mappa scritto nell'HTML. */
(function () {
  const box = document.getElementById('map');
  if (!box || !('IntersectionObserver' in window)) return;

  const SHOP = [40.0135, -3.3448];          // Watamu Road, Watamu (lng, lat) — stesso punto del link "Indicazioni"
  const WIDE = { center: [38.4, -1.2], zoom: 4.6, pitch: 0, bearing: 0 };          // Kenya intero
  const NEAR = { center: SHOP, zoom: 15.4, pitch: 55, bearing: -28 };               // il negozio, inclinato in 3D
  const STYLE = 'https://tiles.openfreemap.org/styles/dark';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const webgl = (() => {
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
    catch { return false; }
  })();
  if (!webgl) return;

  function load(src, tag) {
    return new Promise((ok, ko) => {
      const el = document.createElement(tag);
      if (tag === 'link') { el.rel = 'stylesheet'; el.href = src; } else { el.src = src; }
      el.onload = ok; el.onerror = ko;
      document.head.appendChild(el);
    });
  }

  let map, ready = false, flown = false;
  function fly() {
    if (flown || !map) return;
    flown = true;
    map.flyTo({ ...NEAR, duration: 6500, curve: 1.5, essential: true });
  }

  async function start() {
    try {
      await Promise.all([load('js/vendor/maplibre-gl.css', 'link'), load('js/vendor/maplibre-gl.js', 'script')]);
    } catch { return; }
    const holder = document.createElement('div');
    holder.className = 'map-gl';
    box.appendChild(holder);
    map = new maplibregl.Map({
      container: holder,
      style: STYLE,
      ...(reduced ? NEAR : WIDE),
      attributionControl: { compact: true },
      cooperativeGestures: true,   // sul telefono la pagina scorre normalmente, la mappa si muove con due dita
      dragRotate: false,
      maxPitch: 60
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    const pin = document.createElement('div');
    pin.className = 'map-pin';
    pin.innerHTML = '<span></span>';
    new maplibregl.Marker({ element: pin }).setLngLat(SHOP).addTo(map);

    // Se lo stile della mappa non arriva (rete assente o bloccata) si torna al disegno di riserva
    map.on('error', () => { if (!ready && map) { map.remove(); map = null; holder.remove(); } });

    map.once('load', () => {
      // Acqua e terra nei colori del sito
      for (const l of map.getStyle().layers) {
        if (l.type === 'fill' && /water/.test(l.id)) map.setPaintProperty(l.id, 'fill-color', '#0b1820');
        if (l.type === 'background') map.setPaintProperty(l.id, 'background-color', '#121214');
      }
      ready = true;
      box.classList.add('live');   // nasconde il disegno di riserva
      if (!reduced && visible) setTimeout(fly, 400);
    });
  }

  let started = false, visible = false;
  new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting && !started) { started = true; start(); }
    }
  }, { rootMargin: '600px 0px' }).observe(box);

  new IntersectionObserver(entries => {
    for (const e of entries) {
      visible = e.isIntersecting;
      if (visible && ready && !reduced) fly();
    }
  }, { threshold: 0.45 }).observe(box);
})();
