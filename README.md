# Coastline Moto Watamu — demo DEC'S

Sito di esempio (demo) per un concessionario moto in Kenya. Contenuti di esempio, non un cliente reale.
Online: https://mediumblue-butterfly-167918.hostingersite.com — si aggiorna da solo a ogni push sul branch `main` (auto-deploy Hostinger).

## Come si modifica

```bash
gh repo clone decsita/MOTO-EXEMPLE-N.2
cd MOTO-EXEMPLE-N.2
# modifica index.html
git commit -am "testo della modifica" && git push   # dopo ~1 minuto è online
```

Tutto sta in `index.html`:

| Cosa | Dove |
|---|---|
| Testi EN e SW | oggetto `T = { en: {...}, sw: {...} }` nello script in fondo |
| Modelli, prezzi, dati tecnici | `MODELS` e `SPECS` nello stesso script |
| Numero WhatsApp | `var WA = 'https://wa.me/...'` |
| Colori, font, spaziature | `<style>` nell'`<head>` |
| Struttura delle sezioni | `<template id="dc-tpl">`: i `{{nome}}` sono riempiti dallo script |
| Immagini | cartella `img/` |

Il piccolo script `dc-lite` (in `index.html`) riempie i `{{segnaposto}}` e ripete i blocchi `<sc-for>`: non va toccato.

La demo resta fuori dai motori di ricerca (`noindex` + `robots.txt`).
