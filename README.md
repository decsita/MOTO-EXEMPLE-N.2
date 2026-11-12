# Coastline Moto Watamu — demo DEC'S

Sito di esempio (demo) per un concessionario moto in Kenya. Contenuti di esempio, non un cliente reale.
Online: https://mediumblue-butterfly-167918.hostingersite.com — si aggiorna da solo a ogni push sul branch `main` (auto-deploy Hostinger).

## Come si modifica

Non si lavora mai direttamente su `main`: si crea un branch, si apre una PR e si fa il merge dopo il controllo.

```bash
git clone https://github.com/decsita/MOTO-EXEMPLE-N.2
cd MOTO-EXEMPLE-N.2
git checkout -b nome-della-modifica
# modifica i file, poi:
git commit -am "testo della modifica" && git push -u origin nome-della-modifica
```

HTML, CSS e JavaScript normali, senza passaggi di build: Hostinger pubblica il repository così com'è.

| Cosa | Dove |
|---|---|
| Struttura delle sezioni, modelli, prezzi, dati tecnici | `index.html` |
| Testi EN e SW | `i18n/en.json` e `i18n/sw.json` (stesse chiavi nei due file) |
| Numero WhatsApp | `index.html`: cerca `wa.me/254700000000` e sostituisci ovunque |
| Colori, font, spaziature | `css/style.css` |
| Cambio lingua, animazioni | `js/main.js` |
| Immagini | cartella `img/` |

### Come funzionano i testi

Ogni testo traducibile in `index.html` ha un attributo `data-i18n="chiave"`. Il testo inglese è scritto anche
nell'HTML (così la pagina si legge subito), ma la fonte sono i file in `i18n/`: all'apertura lo script li
carica e sostituisce i testi. Per cambiare un testo: modifica la chiave in **entrambi** i file `i18n/` e,
per l'inglese, anche in `index.html`.

Per provare il sito in locale serve un piccolo server (i file `i18n/` non si caricano aprendo `index.html`
con un doppio clic): `npx serve .` oppure `python -m http.server`.

La demo resta fuori dai motori di ricerca (`noindex` + `robots.txt`).
