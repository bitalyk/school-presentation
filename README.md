# Prezentări de fizică

Site static cu prezentări pentru lecțiile de fizică, pe clase: **a 8-a**, **a 9-a** și **a 10-a**.
Nu are nevoie de instalare sau de internet: sunt doar fișiere HTML, CSS și JavaScript.

## Structura

```
index.html              pagina principală (alegerea clasei)
clasa-8/index.html      pagina clasei a 8-a
clasa-9/index.html      pagina clasei a 9-a
clasa-10/index.html     pagina clasei a 10-a
assets/js/prezentari.js LISTA PREZENTĂRILOR — aici adaugi prezentări noi
prezentari/clasa-N/     fișierele prezentărilor (PDF, PowerPoint, HTML …)
```

## Cum adaugi o prezentare

1. Copiază fișierul în `prezentari/clasa-9/` (sau clasa potrivită).
2. Deschide `assets/js/prezentari.js` și adaugă în lista clasei:

   ```js
   "9": [
     {
       titlu: "Mișcarea rectilinie uniformă",
       capitol: "Mecanică",
       descriere: "Viteza, legea mișcării, grafice.",
       link: "prezentari/clasa-9/miscarea-uniforma.pdf",
       data: "2026-11-24"
     },
   ],
   ```

   `capitol`, `descriere` și `data` sunt opționale. `link` poate fi și o adresă web (de ex. Google Slides).

## Prezentările HTML (cu animații)

Fiecare prezentare HTML stă în folderul ei, de ex. `prezentari/clasa-8/2-1-structura-substantei/`
(`index.html` = slide-urile, `animatii.js` = animațiile). Toate folosesc motorul comun din `assets/deck/`.

În timpul prezentării:

| Tasta | Acțiune |
|---|---|
| → · Spațiu · PageDown | slide-ul următor (merge și cu telecomanda de prezentare) |
| ← · PageUp | slide-ul anterior |
| F | ecran complet |
| Home / End | primul / ultimul slide |

Pe telefon sau tabletă: glisează stânga/dreapta.

## Cum pornești site-ul

- **Cel mai simplu:** dublu-clic pe `index.html` (merge și de pe un stick USB).
- **Ca server local:**

  ```sh
  python3 -m http.server 8000
  ```

  apoi deschide <http://localhost:8000>.
