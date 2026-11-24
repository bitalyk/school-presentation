(function () {
  "use strict";

  const date = window.PREZENTARI || {};
  const root = document.body.dataset.root || "";

  const lista = (clasa) => (Array.isArray(date[clasa]) ? date[clasa] : []);

  // 1 prezentare · 2–19 prezentări · 20 de prezentări
  function numarPrezentari(n) {
    if (n === 1) return "1 prezentare";
    const r = n % 100;
    if (n === 0 || (r >= 1 && r <= 19)) return n + " prezentări";
    return n + " de prezentări";
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function rezolva(link) {
    // adresele web și căile absolute rămân la fel; cele relative pornesc din rădăcina site-ului
    return /^([a-z][a-z0-9+.-]*:|\/|#)/i.test(link) ? link : root + link;
  }

  function tip(link) {
    const l = link.toLowerCase();
    if (l.includes("docs.google.com/presentation")) return "Google Slides";
    if (l.includes("canva.com")) return "Canva";
    const ext = l.split(/[?#]/)[0].split(".").pop();
    const tipuri = { pdf: "PDF", pptx: "PowerPoint", ppt: "PowerPoint", odp: "Impress", html: "Web", htm: "Web", mp4: "Video" };
    return tipuri[ext] || "Link";
  }

  function formatData(s) {
    const d = new Date(s + "T00:00:00");
    if (isNaN(d)) return s;
    return d.toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });
  }

  function card(p) {
    const link = (p.link || "").trim();
    const c = el(link ? "a" : "div", "prez" + (link ? "" : " prez-pregatire"));
    if (link) {
      c.href = rezolva(link);
      if (/^https?:/i.test(link)) {
        c.target = "_blank";
        c.rel = "noopener";
      }
    }
    c.appendChild(el("span", "prez-tip", link ? tip(link) : "În pregătire"));
    c.appendChild(el("span", "prez-titlu", p.titlu || "Fără titlu"));
    if (p.descriere) c.appendChild(el("span", "prez-desc", p.descriere));
    if (p.data) c.appendChild(el("span", "prez-data", formatData(p.data)));
    return c;
  }

  function gol() {
    const g = el("div", "gol");
    g.innerHTML =
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/><path d="M7 12l3-3 2 2 4-4"/></svg>';
    g.appendChild(el("p", "gol-titlu", "Încă nu sunt prezentări"));
    g.appendChild(el("p", null, "Prezentările pentru această clasă vor apărea aici."));
    return g;
  }

  // numărul de prezentări (pe pagina principală și în antetul clasei)
  document.querySelectorAll("[data-count]").forEach((e) => {
    e.textContent = numarPrezentari(lista(e.dataset.count).length);
  });

  // lista de pe pagina unei clase
  const container = document.getElementById("lista");
  const clasa = document.body.dataset.clasa;
  if (!container || !clasa) return;

  const prez = lista(clasa);
  if (prez.length === 0) {
    container.appendChild(gol());
    return;
  }

  // grupare pe capitole, în ordinea în care apar în listă
  const grupuri = [];
  const index = {};
  prez.forEach((p) => {
    const cap = (p.capitol || "").trim();
    if (!(cap in index)) {
      index[cap] = grupuri.length;
      grupuri.push({ titlu: cap, items: [] });
    }
    grupuri[index[cap]].items.push(p);
  });
  const areCapitole = grupuri.some((g) => g.titlu);

  grupuri.forEach((g) => {
    const sec = el("section", "capitol");
    if (areCapitole) sec.appendChild(el("h2", null, g.titlu || "Altele"));
    const grid = el("div", "prez-grid");
    g.items.forEach((p) => grid.appendChild(card(p)));
    sec.appendChild(grid);
    container.appendChild(sec);
  });
})();
