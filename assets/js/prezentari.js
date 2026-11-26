/*
  Lista prezentărilor, pe clase.

  Pentru a adăuga o prezentare:
    1. Pune fișierul în folderul potrivit: prezentari/clasa-8/, prezentari/clasa-9/ sau prezentari/clasa-10/
       (sau folosește o adresă web, de ex. un link Google Slides).
    2. Adaugă un obiect în lista clasei de mai jos, de exemplu:

    {
      titlu: "Mișcarea rectilinie uniformă",
      capitol: "Mecanică",                                // opțional — grupează prezentările pe capitole
      descriere: "Viteza, legea mișcării, grafice.",      // opțional
      link: "prezentari/clasa-9/miscarea-uniforma.pdf",   // fișier local sau adresă web
      data: "2026-11-24",                                 // opțional, format AAAA-LL-ZZ
      tip: "Test"                                         // opțional — eticheta cardului (altfel se deduce din link)
    },

  Fără „link”, prezentarea apare ca „În pregătire”.
*/
window.PREZENTARI = {
  "8": [
    {
      titlu: "2.1. Structura substanței. Mișcarea moleculelor. Echilibrul termic",
      capitol: "Capitolul 2. Fenomene termice",
      descriere: "Starea termică și temperatura, echilibrul termic și procesul termic, scările de temperatură, încălzirea și răcirea, energia internă, cantitatea de căldură.",
      link: "prezentari/clasa-8/2-1-structura-substantei/index.html",
      data: "2026-11-24"
    },
    {
      titlu: "2.2. Căldura specifică. Capacitatea termică",
      capitol: "Capitolul 2. Fenomene termice",
      descriere: "Trei experimente: Δt depinde de căldura primită, de masă și de substanță; căldura specifică, formula Q = c·m·Δt, capacitatea termică C = c·m.",
      link: "prezentari/clasa-8/2-2-caldura-specifica/index.html",
      data: "2026-11-24"
    },
  ],
  "9": [
    {
      titlu: "§ 6. Instrumente optice",
      capitol: "Capitolul 1. Optica geometrică",
      descriere: "Lupa, aparatul fotografic, microscopul, luneta și aparatul de proiecție — cu desene interactive: trageți de obiect și imaginea se construiește singură.",
      link: "prezentari/clasa-9/1-6-instrumente-optice/index.html",
      data: "2026-11-24"
    },
  ],
  "10": [
    {
      titlu: "1.7. e) Mișcarea corpului pe verticală",
      capitol: "Capitolul 1",
      descriere: "Bila și pana în aer și în vid; corpul aruncat vertical în sus cu graficele v(t) și y(t); cum se obțin formulele (1.39) și (1.40) din legile vectoriale.",
      link: "prezentari/clasa-10/1-7-miscarea-pe-verticala/index.html",
      data: "2026-11-26"
    },
    {
      titlu: "1.8. Mișcarea curbilinie",
      capitol: "Capitolul 1",
      descriere: "Mișcarea circulară uniformă: viteza tangentă, perioada și frecvența, viteza liniară, accelerația centripetă și viteza unghiulară — cu animații.",
      link: "prezentari/clasa-10/1-8-miscarea-curbilinie/index.html",
      data: "2026-11-26"
    },
    {
      titlu: "Evaluare sumativă nr. 1",
      capitol: "Capitolul 1",
      descriere: "4 probleme (2 + 2 + 3 + 3 = 10 puncte): viteza medie, accelerația, aruncarea pe verticală, viteza unghiulară. Foaie gata de tipărit A4 și barem de corectare.",
      link: "prezentari/clasa-10/evaluare-sumativa-1/index.html",
      data: "2026-11-26",
      tip: "Test"
    },
  ],
};
