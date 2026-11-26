/* Animațiile pentru § 2 „Sistemul solar” (clasa a 9-a). */
(function () {
  "use strict";

  const F = window.Fizica;
  const $ = function (id) { return document.getElementById(id); };
  const PI = Math.PI;
  const TAU = 2 * Math.PI;
  const SANS = F.SANS;
  const ALB = "#eef1f8";
  const PAL = "#a9b4d0";
  const ROZ = "#ff8cc0";

  const neted = function (x) { x = F.limita(x); return x * x * (3 - 2 * x); };
  const lerp = function (a, b, u) { return a + (b - a) * u; };
  const mii = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); };   // 142984 → "142 984"

  // generator de numere aleatoare cu sămînță: același „cer” la fiecare deschidere
  function aleator(seed) {
    return function () {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function font(o) {
    return (o.italic ? "italic " : "") + (o.greutate || 600) + " " + (o.marime || 16) + "px " + SANS;
  }

  function text(ctx, s, x, y, o) {
    o = o || {};
    ctx.font = font(o);
    ctx.textAlign = o.align || "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = o.culoare || ALB;
    ctx.fillText(s, x, y);
    return ctx.measureText(s).width;
  }

  function rupe(ctx, s, maxW, o) {
    ctx.font = font(o);
    const r = [];
    let linie = "";
    s.split(" ").forEach(function (w) {
      const inc = linie ? linie + " " + w : w;
      if (linie && ctx.measureText(inc).width > maxW) { r.push(linie); linie = w; } else linie = inc;
    });
    if (linie) r.push(linie);
    return r;
  }

  // paragraf rupt pe rînduri; întoarce înălțimea ocupată
  function paragraf(ctx, s, x, y, maxW, o) {
    o = o || {};
    const pas = o.pas || (o.marime || 16) * 1.4;
    const L = rupe(ctx, s, maxW, o);
    L.forEach(function (l, i) { text(ctx, l, x, y + i * pas, o); });
    return L.length * pas;
  }

  function linie(ctx, x1, y1, x2, y2, culoare, grosime, punctat) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = grosime || 1.2;
    ctx.strokeStyle = culoare || PAL;
    if (punctat) ctx.setLineDash(punctat);
    ctx.stroke();
    ctx.restore();
  }

  function caseta(ctx, x, y, w, h) {
    F.rotunjit(ctx, x, y, w, h, 12);
    ctx.fillStyle = "rgba(14, 20, 48, 0.82)";
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.stroke();
  }

  // fundalul „cer înstelat”: dreptunghi rotunjit (sau cerc) cu stele care sclipesc.
  // Lasă decuparea activă: apelantul face ctx.save() înainte și ctx.restore() după.
  function cer(w, h, n, seed) {
    const r = aleator(seed || 1);
    const stele = [];
    for (let i = 0; i < n; i++) stele.push([r() * w, r() * h, 0.6 + r() * 1.1, r() * TAU, 0.3 + r() * 0.6]);
    return function (ctx, t, o) {
      o = o || {};
      if (o.cerc) { ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(w, h) / 2 - 3, 0, TAU); }
      else F.rotunjit(ctx, 0, 0, w, h, 18);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#0a0f26");
      g.addColorStop(1, "#1a2350");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.clip();
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < stele.length; i++) {
        const s = stele[i];
        ctx.globalAlpha = s[4] * (0.7 + 0.3 * Math.sin(t * 1.4 + s[3]));
        ctx.fillRect(s[0], s[1], s[2], s[2]);
      }
      ctx.globalAlpha = 1;
    };
  }

  // ---------- Soarele, planetele, sateliții ----------

  function soare(ctx, x, y, R) {
    const Rs = Math.max(R, 2.5);
    const H = Rs + Math.min(Rs * 1.3, 46) + 6;
    const h = ctx.createRadialGradient(x, y, Rs * 0.6, x, y, H);
    h.addColorStop(0, "rgba(255, 190, 60, 0.6)");
    h.addColorStop(1, "rgba(255, 190, 60, 0)");
    ctx.fillStyle = h;
    ctx.beginPath();
    ctx.arc(x, y, H, 0, TAU);
    ctx.fill();
    const g = ctx.createRadialGradient(x - Rs * 0.25, y - Rs * 0.25, Rs * 0.1, x, y, Rs);
    g.addColorStop(0, "#fff6c8");
    g.addColorStop(0.55, "#ffc53d");
    g.addColorStop(1, "#ef8a12");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, Rs, 0, TAU);
    ctx.fill();
  }

  function bila(ctx, x, y, R, c) {
    const g = ctx.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.08, x, y, R);
    g.addColorStop(0, c[0]);
    g.addColorStop(0.55, c[1]);
    g.addColorStop(1, c[2]);
    ctx.beginPath();
    ctx.arc(x, y, R, 0, TAU);
    ctx.fillStyle = g;
    ctx.fill();
  }

  // umbra peste detalii, ca bila să rămînă „rotundă”
  function umbra(ctx, x, y, R) {
    const g = ctx.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.1, x, y, R * 1.02);
    g.addColorStop(0, "rgba(255, 255, 255, 0.10)");
    g.addColorStop(0.55, "rgba(0, 0, 0, 0)");
    g.addColorStop(1, "rgba(0, 0, 20, 0.35)");
    ctx.fillStyle = g;
    ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
  }

  // pete eliptice: [dx, dy, rx, ry, unghi] în raze
  function pete(ctx, x, y, R, lista, culoare) {
    ctx.fillStyle = culoare;
    lista.forEach(function (p) {
      ctx.beginPath();
      ctx.ellipse(x + p[0] * R, y + p[1] * R, p[2] * R, (p[3] || p[2]) * R, p[4] || 0, 0, TAU);
      ctx.fill();
    });
  }

  function benzi(ctx, x, y, R, lista) {
    lista.forEach(function (b) {
      ctx.fillStyle = b[2];
      ctx.fillRect(x - R, y + b[0] * R, 2 * R, b[1] * R);
    });
  }

  // inelele lui Saturn: jumătatea din spate se desenează înaintea planetei, cea din față — după
  function inel(ctx, x, y, R, spate) {
    const rot = -0.3, k = 0.3;
    const a0 = spate ? PI : 0, a1 = spate ? TAU : PI;
    [[1.24, 1.52, "rgba(190, 165, 118, 0.55)"], [1.58, 2.25, "rgba(232, 210, 160, 0.92)"]].forEach(function (q) {
      ctx.beginPath();
      ctx.ellipse(x, y, R * q[1], R * q[1] * k, rot, a0, a1, false);
      ctx.ellipse(x, y, R * q[0], R * q[0] * k, rot, a1, a0, true);
      ctx.closePath();
      ctx.fillStyle = q[2];
      ctx.fill();
    });
  }

  const PL = [
    {
      nume: "Mercur", d: 4879, ua: 0.39, mkm: "58", T: 0.241, tip: 0,
      c: ["#ddd8d2", "#a39b92", "#5f5852"],
      masa: [["0,055 · "], ["M", "i"], ["P", "sub"]], rev: "88 de zile", rot: "59 de zile", sat: "0",
      temp: "−180 °C … +430 °C",
      fapt: "Cea mai mică planetă și cea mai apropiată de Soare. Aproape nu are atmosferă, de aceea ziua se încălzește foarte tare, iar noaptea se răcește foarte mult.",
    },
    {
      nume: "Venus", d: 12104, ua: 0.72, mkm: "108", T: 0.615, tip: 0,
      c: ["#fff3cf", "#e6c27a", "#a7793a"],
      masa: [["0,815 · "], ["M", "i"], ["P", "sub"]], rev: "225 de zile", rot: "243 de zile (în sens invers)", sat: "0",
      temp: "+465 °C",
      fapt: "Cea mai fierbinte planetă: atmosfera groasă de dioxid de carbon păstrează căldura (efectul de seră). Pe cer este cel mai strălucitor „astru” după Soare și Lună — Luceafărul.",
    },
    {
      nume: "Pămîntul", d: 12756, ua: 1, mkm: "150", T: 1, tip: 0,
      c: ["#8fd0ff", "#2f7fd6", "#174a94"],
      masa: [["M", "i"], ["P", "sub"], [" = 6 · 10"], ["24", "sup"], [" kg"]], rev: "365 de zile", rot: "24 h", sat: "1 (Luna)",
      temp: "+15 °C (în medie)",
      fapt: "Singura planetă cunoscută pe care există viață. Apa lichidă acoperă circa 71 % din suprafața ei.",
    },
    {
      nume: "Marte", d: 6792, ua: 1.52, mkm: "228", T: 1.881, tip: 0,
      c: ["#ffb08a", "#d0602f", "#7c2c12"],
      masa: [["0,107 · "], ["M", "i"], ["P", "sub"]], rev: "687 de zile", rot: "24 h 37 min", sat: "2 (Phobos și Deimos)",
      temp: "−65 °C (în medie)",
      fapt: "Planeta roșie: solul ei conține mult oxid de fier („rugină”). Aici se află cel mai înalt vulcan din sistemul solar — Olympus Mons, de circa 22 km.",
    },
    {
      nume: "Jupiter", d: 142984, ua: 5.2, mkm: "778", T: 11.86, tip: 1,
      c: ["#f6e3c4", "#d4a676", "#8a5a35"],
      masa: [["318 · "], ["M", "i"], ["P", "sub"]], rev: "11,9 ani", rot: "9 h 56 min", sat: "peste 100",
      temp: "−110 °C (la nivelul norilor)",
      fapt: "Cea mai mare planetă: masa ei este de 2,5 ori mai mare decît masa tuturor celorlalte planete luate împreună. Marea Pată Roșie este o furtună mai mare decît Pămîntul.",
    },
    {
      nume: "Saturn", d: 120536, ua: 9.58, mkm: "1 433", T: 29.46, tip: 1,
      c: ["#fbf0cf", "#e2c785", "#9a7a3e"],
      masa: [["95 · "], ["M", "i"], ["P", "sub"]], rev: "29,5 ani", rot: "10 h 34 min", sat: "peste 280",
      temp: "−140 °C (la nivelul norilor)",
      fapt: "Are cele mai frumoase inele, formate din bucăți de gheață și rocă. Densitatea medie a planetei este mai mică decît densitatea apei.",
    },
    {
      nume: "Uranus", d: 51118, ua: 19.2, mkm: "2 872", T: 84.01, tip: 1,
      c: ["#e6fbfb", "#94dbe0", "#4a9aa6"],
      masa: [["14,5 · "], ["M", "i"], ["P", "sub"]], rev: "84 de ani", rot: "17 h 14 min", sat: "29",
      temp: "−195 °C",
      fapt: "Axa lui de rotație este înclinată cu circa 98°, de aceea planeta parcă „se rostogolește” pe orbită.",
    },
    {
      nume: "Neptun", d: 49528, ua: 30.1, mkm: "4 495", T: 164.8, tip: 1,
      c: ["#a9c4ff", "#3e6fe0", "#1d3a8f"],
      masa: [["17,1 · "], ["M", "i"], ["P", "sub"]], rev: "165 de ani", rot: "16 h 6 min", sat: "16",
      temp: "−200 °C",
      fapt: "A fost descoperit în 1846 „pe vîrful creionului” — prin calcule bazate pe legea atracției universale. Aici bat cele mai puternice vînturi: pînă la 2 000 km/h.",
    },
  ];
  const ORDIN = ["prima", "a doua", "a treia", "a patra", "a cincea", "a șasea", "a șaptea", "a opta"];

  const DETALII = [
    function (ctx, x, y, R) {
      pete(ctx, x, y, R, [[-0.3, -0.2, 0.16], [0.35, 0.12, 0.12], [0, 0.45, 0.1], [-0.45, 0.35, 0.08], [0.22, -0.5, 0.09], [0.55, -0.1, 0.07]],
        "rgba(70, 64, 58, 0.32)");
    },
    function (ctx, x, y, R) {
      pete(ctx, x, y, R, [[-0.1, -0.35, 0.7, 0.12, 0.15], [0.1, 0.05, 0.75, 0.1, -0.1], [0, 0.42, 0.6, 0.1, 0.1]], "rgba(255, 250, 230, 0.22)");
    },
    function (ctx, x, y, R) {
      pete(ctx, x, y, R, [[-0.35, -0.25, 0.42, 0.26, 0.5], [0.25, 0.05, 0.3, 0.42, -0.4], [-0.1, 0.5, 0.36, 0.16, 0.2], [0.55, -0.45, 0.22, 0.14, 0.3]],
        "rgba(92, 168, 84, 0.9)");
      pete(ctx, x, y, R, [[0, -0.97, 0.45, 0.14]], "rgba(255, 255, 255, 0.75)");
      pete(ctx, x, y, R, [[-0.2, 0.12, 0.5, 0.07, 0.3], [0.32, -0.3, 0.35, 0.06, -0.2]], "rgba(255, 255, 255, 0.3)");
    },
    function (ctx, x, y, R) {
      pete(ctx, x, y, R, [[-0.2, 0.1, 0.35, 0.16, 0.4], [0.35, -0.15, 0.2, 0.12, -0.3], [0.1, 0.45, 0.25, 0.1, 0]], "rgba(110, 40, 20, 0.35)");
      pete(ctx, x, y, R, [[0, -0.95, 0.36, 0.13]], "rgba(255, 255, 255, 0.85)");
    },
    function (ctx, x, y, R) {
      benzi(ctx, x, y, R, [[-0.66, 0.12, "rgba(150, 95, 55, 0.4)"], [-0.34, 0.15, "rgba(160, 100, 60, 0.5)"],
        [0.04, 0.12, "rgba(250, 235, 210, 0.35)"], [0.22, 0.16, "rgba(150, 95, 55, 0.5)"], [0.56, 0.1, "rgba(160, 110, 70, 0.4)"]]);
      pete(ctx, x, y, R, [[0.28, 0.32, 0.2, 0.11]], "rgba(196, 82, 52, 0.85)");
    },
    function (ctx, x, y, R) {
      benzi(ctx, x, y, R, [[-0.45, 0.12, "rgba(170, 135, 70, 0.3)"], [0.08, 0.1, "rgba(170, 135, 70, 0.25)"], [0.4, 0.12, "rgba(170, 135, 70, 0.3)"]]);
    },
    function (ctx, x, y, R) {
      benzi(ctx, x, y, R, [[-0.5, 0.12, "rgba(255, 255, 255, 0.12)"], [0.3, 0.1, "rgba(60, 140, 150, 0.15)"]]);
    },
    function (ctx, x, y, R) {
      pete(ctx, x, y, R, [[-0.2, -0.05, 0.18, 0.1, 0]], "rgba(15, 25, 80, 0.55)");
      pete(ctx, x, y, R, [[0.15, 0.35, 0.4, 0.05, 0.1], [-0.1, -0.5, 0.3, 0.04, 0]], "rgba(220, 235, 255, 0.35)");
    },
  ];

  function planeta(ctx, i, x, y, R) {
    const p = PL[i];
    if (i === 5 && R > 1.2) inel(ctx, x, y, R, true);
    if (R < 2.4) {
      ctx.beginPath();
      ctx.arc(x, y, Math.max(R, 1.3), 0, TAU);
      ctx.fillStyle = p.c[1];
      ctx.fill();
    } else {
      bila(ctx, x, y, R, p.c);
      if (R >= 5) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, R, 0, TAU);
        ctx.clip();
        DETALII[i](ctx, x, y, R);
        umbra(ctx, x, y, R);
        ctx.restore();
      }
    }
    if (i === 5 && R > 1.2) inel(ctx, x, y, R, false);
  }

  // un satelit (sau alt corp mic) cu pete
  function corp(ctx, x, y, R, c, lista, culoare) {
    bila(ctx, x, y, R, c);
    if (lista && R > 4) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, R, 0, TAU);
      ctx.clip();
      pete(ctx, x, y, R, lista, culoare);
      umbra(ctx, x, y, R);
      ctx.restore();
    }
  }

  // Planetele pe orbite circulare privite oblic.
  // k: cît de „turtite” par orbitele (1 = privite de sus); rot: rotirea întregului plan.
  function sistem(ctx, o) {
    const rot = o.rot || 0, cs = Math.cos(rot), sn = Math.sin(rot);
    const k = o.k;
    if (o.orbite > 0) {
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(160, 178, 230, " + 0.35 * o.orbite + ")";
      o.raze.forEach(function (r) {
        ctx.beginPath();
        ctx.ellipse(o.cx, o.cy, r, Math.max(0.6, r * k), rot, 0, TAU);
        ctx.stroke();
      });
    }
    const L = o.raze.map(function (r, i) {
      const X = r * Math.cos(o.unghiuri[i]), Y = -r * Math.sin(o.unghiuri[i]) * k;
      return { i: i, x: o.cx + X * cs - Y * sn, y: o.cy + X * sn + Y * cs, z: Math.sin(o.unghiuri[i]) };
    });
    L.sort(function (A, B) { return B.z - A.z; });   // întîi cele din spatele Soarelui
    let gata = false;
    L.forEach(function (p) {
      if (!gata && p.z < 0) { soare(ctx, o.cx, o.cy, o.soare); gata = true; }
      planeta(ctx, p.i, p.x, p.y, o.mari[p.i]);
    });
    if (!gata) soare(ctx, o.cx, o.cy, o.soare);
    if (o.nume > 0) {
      ctx.globalAlpha = o.nume;
      L.forEach(function (p) {
        text(ctx, PL[p.i].nume, p.x, p.y - o.mari[p.i] - 7, { marime: 13, align: "center", culoare: PAL });
      });
      ctx.globalAlpha = 1;
    }
    return L;
  }

  // =====================================================================
  //  Slide 1: sistemul solar privit oblic, într-un „hublou”
  // =====================================================================
  Deck.animatie($("a-titlu"), function (a) {
    const fon = cer(a.w, a.h, 90, 3);
    const RAZE = [52, 74, 98, 122, 160, 196, 226, 252];
    const MARI = [3, 4.8, 5.2, 3.8, 13, 11, 7.5, 7.2];
    const F0 = [0.4, 2.2, 3.9, 1.0, 5.6, 2.9, 0.8, 4.4];
    return function (ctx, t) {
      ctx.save();
      fon(ctx, t, { cerc: true });
      const ung = PL.map(function (p, i) { return F0[i] + TAU * t / (7 * Math.sqrt(p.T)); });
      sistem(ctx, { cx: 280, cy: 286, raze: RAZE, mari: MARI, unghiuri: ung, k: 0.34, rot: -0.22, soare: 24, orbite: 1 });
      ctx.restore();
      ctx.beginPath();
      ctx.arc(280, 280, 277, 0, TAU);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(194, 37, 122, 0.35)";
      ctx.stroke();
    };
  });

  // =====================================================================
  //  Slide 2: planetele se rotesc în același sens, în același plan
  //  (perioadele sînt reale: 1 an pămîntesc = 6 s)
  // =====================================================================
  Deck.animatie($("a-sistem"), function (a) {
    const W = a.w, H = a.h, CX = 320, CY = 272;
    const fon = cer(W, H, 120, 5);
    const RAZE = [42, 60, 80, 100, 140, 178, 212, 240];
    const MARI = [3, 4.6, 5, 3.8, 11, 9, 7, 7];
    const F0 = [0.5, 2.1, 4.0, 1.2, 3.3, 5.2, 0.9, 2.7];
    const AN = 6, CICLU = 32;
    function lateral(tc) {   // 0 = privim de sus, 1 = privim din lateral
      if (tc < 17) return 0;
      if (tc < 20) return neted((tc - 17) / 3);
      if (tc < 27) return 1;
      if (tc < 30) return 1 - neted((tc - 27) / 3);
      return 0;
    }
    function sensul(ctx, k, al) {
      if (al <= 0) return;
      ctx.save();
      ctx.globalAlpha = al;
      const r = 258;
      ctx.beginPath();
      for (let g = 22; g <= 62; g += 2) {
        const f = g * PI / 180;
        const x = CX + r * Math.cos(f), y = CY - r * Math.sin(f) * k;
        if (g === 22) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 3;
      ctx.strokeStyle = ROZ;
      ctx.stroke();
      const f1 = 62 * PI / 180, f2 = 68 * PI / 180;
      F.sageata(ctx, CX + r * Math.cos(f1), CY - r * Math.sin(f1) * k, CX + r * Math.cos(f2), CY - r * Math.sin(f2) * k,
        { culoare: ROZ, grosime: 3, cap: 14 });
      ctx.restore();
    }
    return function (ctx, t) {
      const tc = t % CICLU;
      const u = lateral(tc);
      const k = 1 - 0.93 * u;
      const vizibil = F.limita(1 - u * 2.2);
      ctx.save();
      fon(ctx, t);
      const ung = PL.map(function (p, i) { return F0[i] + TAU * t / (AN * p.T); });
      sistem(ctx, { cx: CX, cy: CY, raze: RAZE, mari: MARI, unghiuri: ung, k: k, soare: 17, orbite: 1, nume: vizibil });
      sensul(ctx, k, vizibil);

      // ce vedem acum
      ctx.globalAlpha = 1 - u;
      text(ctx, "Privire de sus", 18, 32, { marime: 17, greutate: 700 });
      text(ctx, "(de la Polul Nord)", 18, 52, { marime: 14, culoare: PAL });
      ctx.globalAlpha = u;
      text(ctx, "Privire din lateral", 18, 32, { marime: 17, greutate: 700 });
      ctx.globalAlpha = 1;
      text(ctx, "nu la scară", 18, 74, { marime: 13, culoare: PAL, italic: true });
      text(ctx, "Au trecut: " + F.numar(t / AN, 1) + " ani", W - 18, 32, { marime: 16, align: "right", greutate: 700 });
      text(ctx, "(1 an pămîntesc = 6 s)", W - 18, 52, { marime: 13, align: "right", culoare: PAL });

      ctx.globalAlpha = 1 - u;
      text(ctx, "Privim de la Polul Nord: toate planetele se rotesc în jurul", W / 2, H - 46, { marime: 17, align: "center" });
      text(ctx, "Soarelui în același sens — împotriva acelor ceasornicului.", W / 2, H - 22, { marime: 17, align: "center" });
      ctx.globalAlpha = u;
      text(ctx, "Privim din lateral: orbitele planetelor", W / 2, H - 46, { marime: 17, align: "center" });
      text(ctx, "se află aproape în același plan.", W / 2, H - 22, { marime: 17, align: "center" });
      ctx.globalAlpha = 1;
      ctx.restore();
    };
  });

  // =====================================================================
  //  Slide 3: desenul ilustrativ ↔ mărimile la scară ↔ distanțele la scară
  // =====================================================================
  Deck.animatie($("a-scara"), function (a) {
    const W = a.w, H = a.h;
    const fon = cer(W, H, 230, 9);
    const KM = 950;         // modul 1: 1 px = 950 km
    const AU = 44.5;        // modul 2: 1 u. a. = 44,5 px
    const AUM = 445;        // caseta mărită de 10 ori
    const Y0 = 245, Y2 = 330;
    const STARI = [
      {
        s: { x: 70, y: Y0, R: 80 },
        p: [[205, 9], [268, 14], [340, 15], [410, 11], [530, 46], [700, 38], [860, 26], [990, 25]]
          .map(function (q) { return { x: q[0], y: Y0, R: q[1] }; }),
      },
      {
        s: { x: 153 - 696000 / KM, y: Y0, R: 696000 / KM },
        p: [205, 265, 330, 395, 520, 780, 1000, 1090].map(function (x, i) { return { x: x, y: Y0, R: PL[i].d / 2 / KM }; }),
      },
      {
        s: { x: 40, y: Y2, R: 7 },
        p: PL.map(function (q, i) { return { x: 40 + AU * q.ua, y: Y2, R: [2.2, 2.8, 3, 2.4, 6, 5.5, 4.5, 4.5][i] }; }),
      },
    ];
    const butoane = Array.prototype.slice.call(document.querySelectorAll("#moduri-scara .buton-mic"));
    let mod = 0, din = 0, tSchimb = -10, auto = true, tAcum = 0;

    function marcheaza() {
      butoane.forEach(function (b) { b.classList.toggle("activ", +b.dataset.mod === mod); });
    }
    function alege(m) {
      if (m === mod) return;
      din = mod;
      mod = m;
      tSchimb = tAcum;
      marcheaza();
    }
    butoane.forEach(function (b) {
      b.addEventListener("click", function () { auto = false; alege(+b.dataset.mod); });
    });
    function reset() { mod = 0; din = 0; tSchimb = -10; auto = true; marcheaza(); }

    function bara(ctx, x, y, lung, eticheta) {
      linie(ctx, x, y, x + lung, y, ALB, 2);
      linie(ctx, x, y - 6, x, y + 6, ALB, 2);
      linie(ctx, x + lung, y - 6, x + lung, y + 6, ALB, 2);
      text(ctx, eticheta, x + lung + 12, y + 5, { marime: 15 });
    }

    // etichetă cu nume + valoare, deasupra sau dedesubt, cu o liniuță spre planetă
    function eticheta(ctx, x, yP, R, sus, rind1, rind2, al) {
      ctx.globalAlpha = al;
      if (sus) {
        linie(ctx, x, yP - R - 4, x, 208, "rgba(169, 180, 208, 0.6)", 1);
        text(ctx, rind1, x, 182, { marime: 15, align: "center", greutate: 700 });
        text(ctx, rind2, x, 201, { marime: 14, align: "center", culoare: PAL });
      } else {
        const y0 = R > 20 ? 352 : 290;
        linie(ctx, x, yP + R + 4, x, y0 - 18, "rgba(169, 180, 208, 0.6)", 1);
        text(ctx, rind1, x, y0, { marime: 15, align: "center", greutate: 700 });
        text(ctx, rind2, x, y0 + 19, { marime: 14, align: "center", culoare: PAL });
      }
      ctx.globalAlpha = 1;
    }

    function draw(ctx, t) {
      tAcum = t;
      if (auto && t - Math.max(tSchimb, 0) > 12) alege((mod + 1) % 3);
      const dt = t - tSchimb;
      const u = neted(dt / 1.6);
      const al = [0, 0, 0];
      al[mod] += F.limita((dt - 0.9) / 0.7);
      if (din !== mod) al[din] += F.limita(1 - dt / 0.5);
      const A = STARI[din], B = STARI[mod];

      ctx.save();
      fon(ctx, t);

      // modul 0: arce de orbită în jurul Soarelui
      if (al[0] > 0) {
        ctx.globalAlpha = al[0];
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "rgba(160, 178, 230, 0.35)";
        STARI[0].p.forEach(function (p) {
          const r = p.x - STARI[0].s.x;
          const g = Math.asin(Math.min(1, 200 / r));
          ctx.beginPath();
          ctx.arc(STARI[0].s.x, Y0, r, -g, g);
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }

      // modul 2: axa distanțelor
      if (al[2] > 0) {
        ctx.globalAlpha = al[2];
        linie(ctx, 40, Y2, 1395, Y2, "rgba(169, 180, 208, 0.7)", 1.5);
        for (let d = 0; d <= 30; d += 5) {
          const x = 40 + AU * d;
          linie(ctx, x, Y2 - 5, x, Y2 + 5, "rgba(169, 180, 208, 0.9)", 1.5);
          text(ctx, d === 30 ? "30 u. a." : String(d), x, Y2 + 26, { marime: 14, align: "center", culoare: PAL });
        }
        ctx.globalAlpha = 1;
      }

      // Soarele și planetele (se „transformă” dintr-un mod în altul)
      soare(ctx, lerp(A.s.x, B.s.x, u), lerp(A.s.y, B.s.y, u), lerp(A.s.R, B.s.R, u));
      PL.forEach(function (q, i) {
        planeta(ctx, i, lerp(A.p[i].x, B.p[i].x, u), lerp(A.p[i].y, B.p[i].y, u), lerp(A.p[i].R, B.p[i].R, u));
      });

      // ---------- textele modului 0 ----------
      if (al[0] > 0) {
        ctx.globalAlpha = al[0];
        STARI[0].p.forEach(function (p, i) {
          text(ctx, PL[i].nume, p.x, Y0 + 72, { marime: 15, align: "center", greutate: 700 });
        });
        text(ctx, "Soarele", 70, Y0 + 112, { marime: 15, align: "center", greutate: 700 });
        text(ctx, "Desen ilustrativ", 1080, 100, { marime: 24, greutate: 800 });
        let y = 140;
        y += paragraf(ctx, "Așa desenăm de obicei sistemul solar: planetele sînt mărite, iar distanțele dintre ele — micșorate, ca toate să încapă pe pagină.",
          1080, y, 310, { marime: 17, greutate: 500 });
        paragraf(ctx, "Nici mărimile, nici distanțele nu sînt la scară.", 1080, y + 12, 310, { marime: 17, greutate: 700, culoare: ROZ });
        ctx.globalAlpha = 1;
      }

      // ---------- textele modului 1 ----------
      if (al[1] > 0) {
        const S = STARI[1];
        ctx.globalAlpha = al[1];
        text(ctx, "Soarele", 22, Y0 - 6, { marime: 17, greutate: 800, culoare: "#5a2600" });
        text(ctx, "1 392 000 km", 22, Y0 + 15, { marime: 14, greutate: 700, culoare: "#5a2600" });
        S.p.forEach(function (p, i) {
          const d = mii(PL[i].d) + " km";
          eticheta(ctx, p.x, Y0, i === 5 ? 44 : p.R, i === 1 || i === 3, PL[i].nume, d, al[1]);
        });
        ctx.globalAlpha = al[1];
        text(ctx, "Mărimile la scară", 1150, 60, { marime: 24, greutate: 800 });
        bara(ctx, 1150, 92, 50000 / KM, "= 50 000 km");
        paragraf(ctx, "Diametrul Soarelui este de 109 ori mai mare decît diametrul Pămîntului.", 1150, 132, 250, { marime: 16, greutate: 500 });
        paragraf(ctx, "Distanțele dintre planete nu sînt la scară.", 1150, 222, 250, { marime: 16, greutate: 700, culoare: ROZ });
        text(ctx, "În Soare ar încăpea circa 1,3 milioane de Pămînturi.", 700, 432, { marime: 18, align: "center" });
        text(ctx, "Masele tuturor planetelor alcătuiesc doar ~ 0,1 % din masa Soarelui.", 700, 462, { marime: 18, align: "center", culoare: PAL });
        ctx.globalAlpha = 1;
      }

      // ---------- textele modului 2 ----------
      if (al[2] > 0) {
        ctx.globalAlpha = al[2];
        // planetele gigante: deasupra axei
        [4, 5, 6, 7].forEach(function (i) {
          const x = 40 + AU * PL[i].ua;
          const dr = i === 7, xa = dr ? 1404 : x, aln = dr ? "right" : "center";
          text(ctx, PL[i].nume, xa, Y2 - 62, { marime: 16, align: aln, greutate: 700 });
          text(ctx, F.numar(PL[i].ua, PL[i].ua < 10 ? 2 : 1).replace(/,?0+$/, "") + " u. a.", xa, Y2 - 43, { marime: 14, align: aln, culoare: PAL });
          text(ctx, PL[i].mkm + " mil. km", xa, Y2 - 26, { marime: 14, align: aln, culoare: PAL });
        });
        text(ctx, "Soarele", 40, Y2 + 52, { marime: 14, align: "left", culoare: PAL });

        // caseta: planetele telurice mărite de 10 ori
        caseta(ctx, 24, 22, 758, 150);
        linie(ctx, 24, 172, 40, Y2 - 8, "rgba(169, 180, 208, 0.6)", 1, [5, 5]);
        linie(ctx, 782, 172, 40 + AU * 1.6, Y2 - 8, "rgba(169, 180, 208, 0.6)", 1, [5, 5]);
        text(ctx, "Planetele telurice — aceeași scară, dar mărit de 10 ori", 40, 46, { marime: 15, greutate: 700, culoare: PAL });
        linie(ctx, 52, 150, 770, 150, "rgba(169, 180, 208, 0.6)", 1.2);
        soare(ctx, 52, 150, 6);
        [0, 1, 2, 3].forEach(function (i) {
          const x = 52 + AUM * PL[i].ua;
          planeta(ctx, i, x, 150, [4, 6, 6.5, 4.5][i]);
          text(ctx, PL[i].nume, x, 86, { marime: 15, align: "center", greutate: 700 });
          text(ctx, F.numar(PL[i].ua, 2).replace(/,?0+$/, "") + " u. a.", x, 105, { marime: 14, align: "center", culoare: PAL });
          text(ctx, PL[i].mkm + " mil. km", x, 123, { marime: 14, align: "center", culoare: PAL });
        });

        text(ctx, "Distanțele la scară", 830, 52, { marime: 24, greutate: 800 });
        bara(ctx, 830, 84, AU, "= 1 u. a. = 150 000 000 km");
        paragraf(ctx, "Planetele și Soarele sînt desenate mult mărite: la această scară Soarele ar avea 0,4 px, iar Pămîntul — 0,004 px.",
          830, 122, 560, { marime: 16, greutate: 500 });

        text(ctx, "Lumina Soarelui ajunge pînă la Pămînt în 8 min 20 s, iar pînă la Neptun — în circa 4 ore.", 710, 410, { marime: 18, align: "center" });
        text(ctx, "Dacă Soarele ar fi o minge cu diametrul de 1 m, Pămîntul ar fi o bilă de 9 mm aflată la 107 m de ea,", 710, 442, { marime: 17, align: "center", culoare: PAL });
        text(ctx, "Jupiter — o minge de 10 cm la 560 m, iar Neptun s-ar afla la 3,2 km.", 710, 468, { marime: 17, align: "center", culoare: PAL });
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }
    return { reset: reset, draw: draw };
  });

  // =====================================================================
  //  Slide 4: planetele, una cîte una (clic pe o planetă)
  // =====================================================================
  Deck.animatie($("a-planete"), function (a) {
    const W = a.w, H = a.h;
    const fon = cer(W, H, 110, 13);
    const XS = PL.map(function (p, i) { return 52 + i * 105; });
    const MS = [7, 11, 12, 9, 25, 20, 15, 15];
    const GRUPA = [["planetă telurică", "#7ddc9f"], ["planetă gigantă", "#ffb35c"]];
    let sel = 0, tSel = 0, auto = true, tAcum = 0, hx = XS[0];

    a.canvas.addEventListener("click", function (e) {
      const r = a.canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
      let i = (sel + 1) % PL.length;
      if (y < 128) {
        let best = Infinity;
        XS.forEach(function (xx, j) { if (Math.abs(x - xx) < best) { best = Math.abs(x - xx); i = j; } });
      }
      sel = i;
      tSel = tAcum;
      auto = false;
    });
    function reset() { sel = 0; tSel = 0; auto = true; hx = XS[0]; }

    function comparatie(ctx, i, al) {
      ctx.globalAlpha = al;
      const pamint = i === 2;
      text(ctx, pamint ? "Pămîntul și Luna, la aceeași scară:" : "Comparat cu Pămîntul, la aceeași scară:", 175, 462,
        { marime: 14, align: "center", culoare: PAL });
      const d2 = pamint ? 3474 : 12756;
      const mare = Math.max(PL[i].d, d2);
      const R1 = 44 * PL[i].d / mare, R2 = 44 * d2 / mare;
      const jos = 566;
      planeta(ctx, i, 112, jos - R1, R1);
      if (pamint) corp(ctx, 248, jos - R2, R2, ["#f1f1ef", "#b9b9bd", "#77787e"], [[-0.3, -0.2, 0.22], [0.3, 0.25, 0.18]], "rgba(110, 112, 118, 0.35)");
      else planeta(ctx, 2, 248, jos - R2, R2);
      text(ctx, PL[i].nume, 112, 594, { marime: 14, align: "center", greutate: 700 });
      text(ctx, pamint ? "Luna" : "Pămîntul", 248, 594, { marime: 14, align: "center", greutate: 700 });
      ctx.globalAlpha = 1;
    }

    function draw(ctx, t, dt) {
      tAcum = t;
      if (auto && t - tSel > 9) { sel = (sel + 1) % PL.length; tSel = t; }
      hx += (XS[sel] - hx) * Math.min(1, (dt || 0.016) * 10);
      const al = neted((t - tSel) / 0.45);
      const p = PL[sel];

      ctx.save();
      fon(ctx, t);

      // șirul planetelor
      F.rotunjit(ctx, hx - 50, 8, 100, 112, 14);
      ctx.fillStyle = "rgba(255, 140, 192, 0.14)";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255, 140, 192, 0.6)";
      ctx.stroke();
      PL.forEach(function (q, i) {
        planeta(ctx, i, XS[i], 56, MS[i]);
        text(ctx, q.nume, XS[i], 106, { marime: 14, align: "center", greutate: i === sel ? 800 : 600, culoare: i === sel ? ROZ : PAL });
      });
      linie(ctx, 16, 130, W - 16, 130, "rgba(255, 255, 255, 0.15)", 1);

      // planeta aleasă, mare
      const R = (sel === 5 ? 62 : 100) * (0.92 + 0.08 * al);
      ctx.globalAlpha = al;
      planeta(ctx, sel, 175, 288, R);
      ctx.globalAlpha = 1;
      comparatie(ctx, sel, al);

      // fișa planetei
      caseta(ctx, 350, 142, 478, 476);
      ctx.globalAlpha = al;
      text(ctx, p.nume, 374, 188, { marime: 32, greutate: 800 });
      text(ctx, ORDIN[sel] + " planetă de la Soare", 374, 214, { marime: 15, culoare: PAL });
      const g = GRUPA[p.tip];
      ctx.font = font({ marime: 14, greutate: 700 });
      const lw = ctx.measureText(g[0]).width + 22;
      F.rotunjit(ctx, 812 - lw, 166, lw, 28, 14);
      ctx.fillStyle = g[1] + "33";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = g[1];
      ctx.stroke();
      text(ctx, g[0], 812 - lw / 2, 185, { marime: 14, align: "center", greutate: 700, culoare: g[1] });

      const rinduri = [
        ["Diametrul", mii(p.d) + " km"],
        ["Masa", p.masa],
        ["Distanța pînă la Soare", F.numar(p.ua, p.ua < 10 ? 2 : 1).replace(/,?0+$/, "") + " u. a. (" + p.mkm + " mil. km)"],
        ["Perioada de revoluție", p.rev],
        ["Perioada de rotație", p.rot],
        ["Sateliți", p.sat],
        ["Temperatura", p.temp],
      ];
      rinduri.forEach(function (r, j) {
        const y = 256 + j * 33;
        text(ctx, r[0], 374, y, { marime: 15, culoare: PAL });
        if (Array.isArray(r[1])) F.scrie(ctx, r[1], 568, y, { marime: 17, culoare: ALB, greutate: 700 });
        else text(ctx, r[1], 568, y, { marime: 17, greutate: 700 });
      });
      linie(ctx, 374, 474, 804, 474, "rgba(255, 255, 255, 0.15)", 1);
      paragraf(ctx, p.fapt, 374, 502, 432, { marime: 16, greutate: 500, pas: 23 });
      F.scrie(ctx, [["M", "i"], ["P", "sub"], [" — masa Pămîntului"]], 804, 604, { marime: 13, align: "right", culoare: PAL, greutate: 500 });
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    return { reset: reset, draw: draw };
  });

  // =====================================================================
  //  Slide 5: sateliții galileeni + cei mai mari sateliți la aceeași scară
  // =====================================================================
  const LUNA_C = ["#f1f1ef", "#b9b9bd", "#6f7076"];
  const LUNA_P = [[-0.3, -0.2, 0.22], [0.3, 0.25, 0.18], [0.05, 0.5, 0.12], [0.35, -0.4, 0.1]];
  const SAT = {
    Io: { c: ["#fff3b0", "#e3c44f", "#9a7a1e"], p: [[-0.3, -0.2, 0.12], [0.3, 0.2, 0.1], [0.1, -0.45, 0.08], [-0.2, 0.45, 0.09]], pc: "rgba(190, 90, 30, 0.55)" },
    Europa: { c: ["#fffaf0", "#dccbb0", "#8d7c62"], p: [[0, 0, 0.9, 0.04, 0.5], [0, 0.1, 0.9, 0.035, -0.7], [0.1, -0.2, 0.8, 0.03, 0.1]], pc: "rgba(140, 90, 50, 0.45)" },
    Ganimede: { c: ["#e6ddd2", "#a39686", "#5d5348"], p: [[-0.25, -0.15, 0.35, 0.25, 0.3], [0.3, 0.3, 0.25, 0.2, 0]], pc: "rgba(230, 222, 210, 0.35)" },
    Calisto: { c: ["#c9beb2", "#7a6f63", "#3f3831"], p: [[-0.3, -0.3, 0.06], [0.2, -0.1, 0.05], [0.4, 0.3, 0.06], [-0.1, 0.4, 0.05], [0.05, 0.1, 0.04]], pc: "rgba(255, 255, 255, 0.55)" },
    Titan: { c: ["#ffe2a6", "#d9a24a", "#8a5a1c"] },
    Luna: { c: LUNA_C, p: LUNA_P, pc: "rgba(110, 112, 118, 0.35)" },
    Triton: { c: ["#fbeee8", "#cdb3a8", "#7e665c"], p: [[0, 0.7, 0.8, 0.35]], pc: "rgba(255, 240, 235, 0.45)" },
  };

  Deck.animatie($("a-sateliti"), function (a) {
    const W = a.w, H = a.h, JX = 380, JY = 150, K = 0.3;
    const fon = cer(W, H, 110, 19);
    const GAL = [
      { nume: "Io", r: 82, R: 6.5, T: 1.769, f: 0.3 },
      { nume: "Europa", r: 124, R: 6, T: 3.551, f: 2.4 },
      { nume: "Ganimede", r: 178, R: 9, T: 7.155, f: 4.2 },
      { nume: "Calisto", r: 262, R: 8.5, T: 16.689, f: 1.3 },
    ];
    const MARI = [
      ["Ganimede", "(Jupiter)", 5268],
      ["Titan", "(Saturn)", 5150],
      ["Mercur", "planeta", 4879],
      ["Calisto", "(Jupiter)", 4821],
      ["Io", "(Jupiter)", 3643],
      ["Luna", "(Pămîntul)", 3474],
      ["Europa", "(Jupiter)", 3122],
      ["Triton", "(Neptun)", 2707],
    ];
    const SC = 40 / 5268, GOL = 22;
    const total = MARI.reduce(function (s, m) { return s + 2 * m[2] * SC; }, 0) + GOL * (MARI.length - 1);

    function satelit(ctx, nume, x, y, R) {
      const s = SAT[nume];
      corp(ctx, x, y, R, s.c, s.p, s.pc);
    }

    return function (ctx, t) {
      ctx.save();
      fon(ctx, t);
      text(ctx, "Cei patru sateliți mari ai lui Jupiter", W / 2, 30, { marime: 18, align: "center", greutate: 700 });

      ctx.lineWidth = 1.1;
      ctx.strokeStyle = "rgba(160, 178, 230, 0.3)";
      GAL.forEach(function (g) { ctx.beginPath(); ctx.ellipse(JX, JY, g.r, g.r * K, 0, 0, TAU); ctx.stroke(); });
      const poz = GAL.map(function (g) {
        const u = g.f + TAU * t / (1.6 * g.T);
        return { g: g, x: JX + g.r * Math.cos(u), y: JY - g.r * Math.sin(u) * K, z: Math.sin(u) };
      });
      poz.forEach(function (p) { if (p.z > 0) satelit(ctx, p.g.nume, p.x, p.y, p.g.R); });
      planeta(ctx, 4, JX, JY, 40);
      poz.forEach(function (p) { if (p.z <= 0) satelit(ctx, p.g.nume, p.x, p.y, p.g.R); });
      poz.forEach(function (p) { text(ctx, p.g.nume, p.x, p.y + p.g.R + 14, { marime: 13, align: "center", culoare: PAL }); });

      text(ctx, "O rotație în jurul lui Jupiter durează:", W / 2, 252, { marime: 15, align: "center", culoare: PAL });
      text(ctx, "Io — 1,8 zile · Europa — 3,6 zile · Ganimede — 7,2 zile · Calisto — 16,7 zile", W / 2, 274, { marime: 15, align: "center" });
      linie(ctx, 20, 298, W - 20, 298, "rgba(255, 255, 255, 0.15)", 1);

      text(ctx, "Cei mai mari sateliți și planeta Mercur, la aceeași scară", W / 2, 334, { marime: 18, align: "center", greutate: 700 });
      let x = (W - total) / 2;
      MARI.forEach(function (m) {
        const R = m[2] * SC;
        x += R;
        if (m[0] === "Mercur") {
          planeta(ctx, 0, x, 420, R);
          ctx.save();
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(x, 420, R + 5, 0, TAU);
          ctx.strokeStyle = "rgba(255, 140, 192, 0.7)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        } else satelit(ctx, m[0], x, 420, R);
        const merc = m[0] === "Mercur";
        text(ctx, m[0], x, 494, { marime: 15, align: "center", greutate: 700, culoare: merc ? ROZ : ALB });
        text(ctx, m[1], x, 512, { marime: 12, align: "center", culoare: merc ? ROZ : PAL });
        text(ctx, mii(m[2]) + " km", x, 531, { marime: 13, align: "center" });
        x += R + GOL;
      });
      text(ctx, "Ganimede și Titan sînt mai mari decît planeta Mercur.", W / 2, 578, { marime: 16, align: "center", culoare: PAL });
      ctx.restore();
    };
  });

  // =====================================================================
  //  Slide 6: Pluton și Neptun (rezonanța 3 : 2) și centura Kuiper
  // =====================================================================
  Deck.animatie($("a-pitice"), function (a) {
    const W = a.w, H = a.h, CX = 360, CY = 296, S = 5;
    const fon = cer(W, H, 80, 17);
    const TN = 12, TP = TN * 247.9 / 164.8;        // perioadele: Neptun 165 de ani, Pluton 248 de ani
    const AP = 39.5, EP = 0.25, BP = AP * Math.sqrt(1 - EP * EP);
    const FP = 3.75;                                // direcția periheliului lui Pluton
    const r = aleator(21);
    const centura = [];
    for (let i = 0; i < 650; i++) {
      const ua = r() < 0.2 ? 30 + r() * 6 : 36 + r() * 12 + (r() < 0.1 ? r() * 4 : 0);
      centura.push([ua, r() * TAU, 0.8 + r() * 1.0, 0.25 + r() * 0.45]);
    }

    function pluton(t) {
      const M = TAU * t / TP + PI * 0.15;
      let E = M;
      for (let j = 0; j < 6; j++) E -= (E - EP * Math.sin(E) - M) / (1 - EP * Math.cos(E));
      const x = AP * (Math.cos(E) - EP), y = BP * Math.sin(E);
      const X = x * Math.cos(FP) - y * Math.sin(FP), Y = x * Math.sin(FP) + y * Math.cos(FP);
      return { x: CX + S * X, y: CY - S * Y, r: Math.hypot(X, Y) };
    }

    return function (ctx, t) {
      ctx.save();
      fon(ctx, t);

      // centura Kuiper
      ctx.fillStyle = "#cfd9ff";
      centura.forEach(function (c) {
        const u = c[1] + TAU * t / (TN * Math.pow(c[0] / 30.1, 1.5));
        ctx.globalAlpha = c[3];
        ctx.fillRect(CX + S * c[0] * Math.cos(u), CY - S * c[0] * Math.sin(u), c[2], c[2]);
      });
      ctx.globalAlpha = 1;

      // orbitele lui Jupiter, Saturn, Uranus (slab) și Neptun
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(160, 178, 230, 0.25)";
      [5.2, 9.58, 19.2].forEach(function (d) { ctx.beginPath(); ctx.arc(CX, CY, S * d, 0, TAU); ctx.stroke(); });
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(110, 150, 255, 0.75)";
      ctx.beginPath();
      ctx.arc(CX, CY, S * 30.1, 0, TAU);
      ctx.stroke();
      // orbita lui Pluton
      ctx.save();
      ctx.setLineDash([7, 6]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(232, 196, 160, 0.85)";
      ctx.beginPath();
      ctx.ellipse(CX - S * AP * EP * Math.cos(FP), CY + S * AP * EP * Math.sin(FP), S * AP, S * BP, -FP, 0, TAU);
      ctx.stroke();
      ctx.restore();

      soare(ctx, CX, CY, 6);

      const uN = FP + PI / 2 + TAU * (t + 0.075 * TP) / TN;   // la periheliul lui Pluton, Neptun e la 90° de el
      const N = { x: CX + S * 30.1 * Math.cos(uN), y: CY - S * 30.1 * Math.sin(uN) };
      planeta(ctx, 7, N.x, N.y, 7);
      text(ctx, "Neptun", N.x, N.y - 13, { marime: 14, align: "center", greutate: 700, culoare: "#9fbcff" });

      const P = pluton(t);
      const inauntru = P.r < 30.1;
      if (inauntru) {
        const g = ctx.createRadialGradient(P.x, P.y, 2, P.x, P.y, 18);
        g.addColorStop(0, "rgba(255, 140, 192, 0.7)");
        g.addColorStop(1, "rgba(255, 140, 192, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(P.x, P.y, 18, 0, TAU);
        ctx.fill();
      }
      corp(ctx, P.x, P.y, 5, ["#fff1e2", "#d8b89a", "#8a6a50"]);
      text(ctx, "Pluton", P.x, P.y - 11, { marime: 14, align: "center", greutate: 700, culoare: "#f0d2b4" });
      if (inauntru) text(ctx, "mai aproape de Soare decît Neptun!", P.x, P.y + 24, { marime: 13, align: "center", culoare: ROZ });

      text(ctx, "centura Kuiper", CX + S * 48 * Math.cos(4.36), CY - S * 48 * Math.sin(4.36) + 6, { marime: 15, align: "center", italic: true, culoare: PAL });

      // caseta: Luna, Pluton, Caron la aceeași scară
      caseta(ctx, 12, 12, 200, 132);
      text(ctx, "La aceeași scară:", 24, 34, { marime: 13, greutate: 700, culoare: PAL });
      const sc = 30 / 3474, jos = 112;
      corp(ctx, 52, jos - 3474 * sc, 3474 * sc, LUNA_C, LUNA_P, "rgba(110, 112, 118, 0.35)");
      corp(ctx, 122, jos - 2377 * sc, 2377 * sc, ["#fff1e2", "#d8b89a", "#8a6a50"], [[0.2, 0.2, 0.4, 0.3, 0.3]], "rgba(255, 248, 240, 0.5)");
      corp(ctx, 172, jos - 1212 * sc, 1212 * sc, ["#e9e4df", "#a79e96", "#5e5751"], [[0, -0.75, 0.5, 0.25]], "rgba(150, 70, 50, 0.45)");
      text(ctx, "Luna", 52, 133, { marime: 12, align: "center" });
      text(ctx, "Pluton", 122, 133, { marime: 12, align: "center" });
      text(ctx, "Caron", 172, 133, { marime: 12, align: "center" });

      // legenda perioadelor
      caseta(ctx, 494, 12, 214, 86);
      text(ctx, "O rotație în jurul Soarelui:", 508, 34, { marime: 13, greutate: 700, culoare: PAL });
      planeta(ctx, 7, 516, 56, 5);
      text(ctx, "Neptun — 165 de ani", 530, 61, { marime: 14 });
      corp(ctx, 516, 82, 4.5, ["#fff1e2", "#d8b89a", "#8a6a50"]);
      text(ctx, "Pluton — 248 de ani", 530, 87, { marime: 14 });

      const cap = Math.floor(t / 7) % 2;
      text(ctx, cap === 0 ? "În timp ce Pluton face 2 rotații în jurul Soarelui, Neptun face exact 3."
        : "Uneori Pluton este mai aproape de Soare decît Neptun, dar ei nu se ciocnesc niciodată.",
        W / 2, H - 14, { marime: 15, align: "center" });
      ctx.restore();
    };
  });

  // =====================================================================
  //  Slide 7: centura de asteroizi (cei mai apropiați de Soare — mai repezi)
  // =====================================================================
  Deck.animatie($("a-asteroizi"), function (a) {
    const W = a.w, H = a.h, CX = 380, CY = 290, S = 40, AN = 6;
    const fon = cer(W, H, 70, 23);
    const r = aleator(29);
    const ast = [];
    while (ast.length < 720) {
      const ua = 2.15 + (r() + r()) / 2 * 1.2;
      if ((Math.abs(ua - 2.5) < 0.03 || Math.abs(ua - 2.82) < 0.025 || Math.abs(ua - 2.95) < 0.02) && r() < 0.85) continue;
      ast.push({ a: ua, f: r() * TAU, e: r() * 0.1, w: r() * TAU, m: 0.9 + r() * 1.1, al: 0.35 + r() * 0.5 });
    }
    const IN = [0, 1, 2, 3, 4];
    const MARI = [2.4, 3.4, 3.8, 3, 9];
    const FZ = [1.0, 2.6, 4.4, 0.4, 2.0];
    // forma neregulată a unui asteroid mic
    const forma = [];
    for (let j = 0; j < 28; j++) {
      const f = j / 28 * TAU;
      forma.push([f, 1 + 0.22 * Math.sin(2 * f + 0.6) + 0.12 * Math.sin(3 * f + 2.1) + 0.06 * Math.sin(5 * f + 1.3)]);
    }

    function asteroidMic(ctx, x, y, R, u) {
      ctx.save();
      ctx.beginPath();
      forma.forEach(function (q, j) {
        const px = x + R * q[1] * Math.cos(q[0] + u) * 1.25, py = y + R * q[1] * Math.sin(q[0] + u) * 0.8;
        if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.closePath();
      const g = ctx.createRadialGradient(x - R * 0.5, y - R * 0.5, R * 0.1, x, y, R * 1.4);
      g.addColorStop(0, "#d9cfc4");
      g.addColorStop(0.6, "#8c7f72");
      g.addColorStop(1, "#4a4038");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.clip();
      ctx.fillStyle = "rgba(50, 42, 36, 0.4)";
      [[0.3, 0.2, 0.18], [1.9, 0.5, 0.12], [3.6, 0.35, 0.15], [5.0, 0.6, 0.1]].forEach(function (c) {
        ctx.beginPath();
        ctx.arc(x + R * c[1] * Math.cos(c[0] + u) * 1.25, y + R * c[1] * Math.sin(c[0] + u) * 0.8, R * c[2], 0, TAU);
        ctx.fill();
      });
      ctx.restore();
    }

    const CAP = [
      "Centura de asteroizi se află între orbitele lui Marte și Jupiter, la 2,2–3,3 u. a. de Soare.",
      "Asteroizii mai apropiați de Soare se mișcă mai repede — la fel ca planetele.",
      "Aici un an pămîntesc durează 6 s; Jupiter face o rotație în jurul Soarelui în aproape 12 ani.",
    ];

    return function (ctx, t) {
      ctx.save();
      fon(ctx, t);

      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(160, 178, 230, 0.3)";
      IN.forEach(function (i) { ctx.beginPath(); ctx.arc(CX, CY, S * PL[i].ua, 0, TAU); ctx.stroke(); });

      ctx.fillStyle = "#d8cbb8";
      ast.forEach(function (q) {
        const u = q.f + TAU * t / (AN * Math.pow(q.a, 1.5));
        const rr = q.a * (1 - q.e * Math.cos(u - q.w));
        ctx.globalAlpha = q.al;
        ctx.fillRect(CX + S * rr * Math.cos(u), CY - S * rr * Math.sin(u), q.m, q.m);
      });
      ctx.globalAlpha = 1;

      soare(ctx, CX, CY, 9);
      IN.forEach(function (i) {
        const u = FZ[i] + TAU * t / (AN * PL[i].T);
        const x = CX + S * PL[i].ua * Math.cos(u), y = CY - S * PL[i].ua * Math.sin(u);
        planeta(ctx, i, x, y, MARI[i]);
        if (i >= 2) text(ctx, PL[i].nume, x, y - MARI[i] - 6, { marime: 13, align: "center", greutate: 700, culoare: PAL });
      });
      text(ctx, "centura de asteroizi", CX, CY + S * 3.3 + 22, { marime: 15, align: "center", greutate: 700, culoare: ROZ });

      // caseta: un asteroid mic, de formă neregulată
      caseta(ctx, 12, 12, 188, 148);
      text(ctx, "Un asteroid mic:", 26, 34, { marime: 13, greutate: 700, culoare: PAL });
      asteroidMic(ctx, 106, 88, 30, t * 0.5);
      text(ctx, "formă neregulată", 106, 148, { marime: 13, align: "center" });

      // caseta: Luna și cei mai mari asteroizi, la aceeași scară
      caseta(ctx, 556, 12, 192, 148);
      text(ctx, "La aceeași scară:", 570, 34, { marime: 13, greutate: 700, culoare: PAL });
      const sc = 28 / 3474;
      corp(ctx, 598, 86, 28, LUNA_C, LUNA_P, "rgba(110, 112, 118, 0.35)");
      text(ctx, "Luna", 598, 132, { marime: 12, align: "center", greutate: 700 });
      text(ctx, "3 474 km", 598, 148, { marime: 12, align: "center", culoare: PAL });
      [["Ceres", 940, 64], ["Vesta", 525, 96], ["Pallas", 510, 124]].forEach(function (q) {
        corp(ctx, 646, q[2], q[1] * sc, ["#d9cfc4", "#8c7f72", "#4a4038"]);
        text(ctx, q[0] + " — " + q[1] + " km", 660, q[2] + 4, { marime: 12 });
      });

      const k = Math.floor(t / 6) % CAP.length;
      text(ctx, CAP[k], W / 2, H - 18, { marime: 15, align: "center" });
      ctx.restore();
    };
  });

  // =====================================================================
  //  Slide 8: cometa pe orbita alungită; coada — mereu în partea opusă Soarelui
  // =====================================================================
  Deck.animatie($("a-comete"), function (a) {
    const W = a.w, H = a.h, SX = 150, SY = 190;
    const fon = cer(W, H, 90, 31);
    const AC = 290, EC = 0.87, BC = AC * Math.sqrt(1 - EC * EC), TC = 16, AN = 4;
    const ORB = [[22, 0, 0.241], [40, 1, 0.615], [55, 2, 1], [84, 3, 1.881]];

    function pozitie(t) {
      const M = PI + TAU * t / TC;
      let E = M;
      for (let j = 0; j < 8; j++) E -= (E - EC * Math.sin(E) - M) / (1 - EC * Math.cos(E));
      return { x: SX - AC * (Math.cos(E) - EC), y: SY + BC * Math.sin(E) };
    }

    // coadă din „puf”: puncte tot mai mari și mai transparente de-a lungul unei curbe
    function coada(ctx, P, C, Q, n, r0, r1, culoare, alfa, t, viteza) {
      for (let j = 0; j < n; j++) {
        let s = j / n;
        if (viteza) s = (s + t * viteza) % 1;
        const x = (1 - s) * (1 - s) * P.x + 2 * s * (1 - s) * C.x + s * s * Q.x;
        const y = (1 - s) * (1 - s) * P.y + 2 * s * (1 - s) * C.y + s * s * Q.y;
        const rr = r0 + (r1 - r0) * s;
        ctx.globalAlpha = alfa * (1 - s);
        ctx.fillStyle = culoare;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function coama(ctx, x, y, R, al) {
      const g = ctx.createRadialGradient(x, y, 1, x, y, R);
      g.addColorStop(0, "rgba(235, 245, 255, " + 0.95 * al + ")");
      g.addColorStop(0.4, "rgba(170, 215, 255, " + 0.45 * al + ")");
      g.addColorStop(1, "rgba(150, 200, 255, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, R, 0, TAU);
      ctx.fill();
    }

    return function (ctx, t) {
      ctx.save();
      fon(ctx, t);

      // orbitele planetelor interioare și orbita cometei
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(160, 178, 230, 0.3)";
      ORB.forEach(function (o) { ctx.beginPath(); ctx.arc(SX, SY, o[0], 0, TAU); ctx.stroke(); });
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "rgba(200, 225, 255, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(SX + AC * EC, SY, AC, BC, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
      soare(ctx, SX, SY, 12);
      text(ctx, "Soarele", SX, SY + 36, { marime: 13, align: "center", culoare: PAL });
      ORB.forEach(function (o, j) {
        const u = j * 1.7 + TAU * t / (AN * o[2]);
        const x = SX + o[0] * Math.cos(u), y = SY - o[0] * Math.sin(u);
        planeta(ctx, o[1], x, y, [2, 2.8, 3.2, 2.6][j]);
        if (o[1] === 2) text(ctx, "Pămîntul", x, y - 8, { marime: 12, align: "center", culoare: "#9fc8ff" });
      });
      text(ctx, "orbita cometei", SX + AC * EC, SY - BC - 12, { marime: 14, align: "center", italic: true, culoare: PAL });

      // cometa
      const P = pozitie(t), P0 = pozitie(t - 0.05);
      const dx = P.x - SX, dy = P.y - SY, d = Math.hypot(dx, dy);
      const ux = dx / d, uy = dy / d;
      let vx = P.x - P0.x, vy = P.y - P0.y;
      const vl = Math.hypot(vx, vy) || 1;
      vx /= vl; vy /= vl;
      const f = neted((200 - d) / 150);
      if (f > 0) {
        const Li = 175 * f, Ld = 120 * f;
        coada(ctx, P, { x: P.x + ux * Ld * 0.5, y: P.y + uy * Ld * 0.5 },
          { x: P.x + (ux * 0.85 - vx * 0.5) * Ld, y: P.y + (uy * 0.85 - vy * 0.5) * Ld }, 36, 2, 11, "#ffe9b8", 0.3 * f, t, 0);
        coada(ctx, P, { x: P.x + ux * Li * 0.5, y: P.y + uy * Li * 0.5 }, { x: P.x + ux * Li, y: P.y + uy * Li }, 40, 1.5, 6, "#9cc8ff", 0.4 * f, t, 0);
      }
      coama(ctx, P.x, P.y, 4 + 12 * f, 0.4 + 0.6 * f);
      ctx.fillStyle = "#dfe6ee";
      ctx.beginPath();
      ctx.arc(P.x, P.y, 2, 0, TAU);
      ctx.fill();
      text(ctx, "cometa", P.x, P.y - 12 - 8 * f, { marime: 13, align: "center", greutate: 700 });

      text(ctx, "Cînd se apropie de Soare, gheața cometei se evaporă: apar coama și coada.", W / 2, 360, { marime: 15, align: "center" });
      text(ctx, "Coada este îndreptată întotdeauna în partea opusă Soarelui.", W / 2, 381, { marime: 15, align: "center", greutate: 700, culoare: ROZ });

      // structura cometei, mărit
      caseta(ctx, 14, 398, W - 28, H - 410);
      text(ctx, "Structura cometei (desen mărit)", 30, 424, { marime: 15, greutate: 700, culoare: PAL });
      const N = { x: 560, y: 505 };
      coada(ctx, N, { x: 300, y: 515 }, { x: 60, y: 585 }, 70, 3, 16, "#ffe9b8", 0.3, t, 0);
      coada(ctx, N, { x: 300, y: 510 }, { x: 40, y: 500 }, 70, 2, 9, "#9cc8ff", 0.45, t, 0);
      // particule care pleacă din coadă
      ctx.fillStyle = "#cfe3ff";
      for (let j = 0; j < 18; j++) {
        const s = (j / 18 + t * 0.12) % 1;
        ctx.globalAlpha = 0.7 * (1 - s);
        ctx.fillRect(560 - 520 * s, 505 - 5 * s + Math.sin(j * 2.3) * 4 * s, 2, 2);
      }
      ctx.globalAlpha = 1;
      coama(ctx, N.x, N.y, 36, 1);
      ctx.fillStyle = "#5d5752";
      ctx.beginPath();
      ctx.ellipse(N.x, N.y, 5.5, 4, 0.4, 0, TAU);
      ctx.fill();
      linie(ctx, N.x, N.y - 7, N.x, 446, "rgba(238, 241, 248, 0.7)", 1);
      text(ctx, "nucleul (cîțiva km)", N.x, 440, { marime: 14, align: "center", greutate: 700 });
      linie(ctx, N.x + 22, N.y + 24, N.x + 40, 556, "rgba(238, 241, 248, 0.7)", 1);
      text(ctx, "coama", N.x + 42, 572, { marime: 14, align: "center", greutate: 700 });
      text(ctx, "coada de gaz — milioane de km", 250, 490, { marime: 14, align: "center", greutate: 700, culoare: "#a9cdff" });
      text(ctx, "coada de praf", 300, 568, { marime: 14, align: "center", greutate: 700, culoare: "#ffe1a0" });
      F.sageata(ctx, 640, 505, 728, 505, { culoare: "#ffd36b", grosime: 3, cap: 13 });
      text(ctx, "spre Soare", 684, 492, { marime: 14, align: "center", greutate: 700, culoare: "#ffd36b" });
      ctx.restore();
    };
  });

  // =====================================================================
  //  Slide 9: meteoroid → meteor → meteorit
  // =====================================================================
  Deck.animatie($("a-meteori"), function (a) {
    const W = a.w, H = a.h, SOL = 570, PXKM = 3.6, CICLU = 12;
    const fon = cer(W, H, 120, 37);
    const yH = function (h) { return SOL - h * PXKM; };
    const D = [-0.387, 0.922];                       // direcția de cădere (toți meteorii sînt paraleli)
    const START = [705, 10];
    const L1 = (yH(120) - START[1]) / D[1];          // drumul pînă la 120 km
    const L2 = (yH(30) - yH(120)) / D[1];            // drumul în care arde
    // poziția meteoroidului principal la momentul tc al ciclului
    function principal(tc) {
      if (tc < 2.4) {
        const s = L1 * tc / 2.4;
        return { x: START[0] + D[0] * s, y: START[1] + D[1] * s, faza: 0 };
      }
      if (tc < 4.4) {
        const s = L1 + L2 * (tc - 2.4) / 2;
        return { x: START[0] + D[0] * s, y: START[1] + D[1] * s, faza: 1 };
      }
      const x0 = START[0] + D[0] * (L1 + L2), y0 = yH(30);
      if (tc < 6.6) {
        const u = (tc - 4.4) / 2.2;
        return { x: x0 - 30 * u + 10 * u * u, y: y0 + (SOL - 4 - y0) * u, faza: 2 };
      }
      return { x: x0 - 20, y: SOL - 4, faza: 3 };
    }
    function stralucire(y) {          // cît de tare arde la înălțimea dată (0…1)
      const h = (SOL - y) / PXKM;
      return h > 120 ? 0 : h < 30 ? 0 : Math.pow(Math.sin(PI * (120 - h) / 90), 0.7);
    }
    function dira(ctx, x, y, lung, lat, b) {
      const x2 = x - D[0] * lung, y2 = y - D[1] * lung;
      const g = ctx.createLinearGradient(x, y, x2, y2);
      g.addColorStop(0, "rgba(255, 245, 210, " + b + ")");
      g.addColorStop(0.3, "rgba(255, 190, 120, " + 0.6 * b + ")");
      g.addColorStop(1, "rgba(255, 140, 90, 0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = lat;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      const h = ctx.createRadialGradient(x, y, 0, x, y, 4 + 12 * b);
      h.addColorStop(0, "rgba(255, 250, 230, " + b + ")");
      h.addColorStop(1, "rgba(255, 200, 120, 0)");
      ctx.fillStyle = h;
      ctx.beginPath();
      ctx.arc(x, y, 4 + 12 * b, 0, TAU);
      ctx.fill();
    }
    function piatra(ctx, x, y, R) {
      ctx.fillStyle = "#8b8178";
      ctx.beginPath();
      ctx.ellipse(x, y, R * 1.25, R, 0.5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.beginPath();
      ctx.arc(x - R * 0.3, y - R * 0.3, R * 0.4, 0, TAU);
      ctx.fill();
    }
    function avion(ctx, x, y) {
      ctx.fillStyle = "#cdd6ea";
      ctx.beginPath();
      ctx.ellipse(x, y, 16, 3, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 2, y); ctx.lineTo(x - 9, y + 10); ctx.lineTo(x - 5, y + 10); ctx.lineTo(x + 5, y);
      ctx.moveTo(x - 2, y); ctx.lineTo(x - 9, y - 10); ctx.lineTo(x - 5, y - 10); ctx.lineTo(x + 5, y);
      ctx.moveTo(x - 13, y); ctx.lineTo(x - 17, y - 7); ctx.lineTo(x - 14, y - 7); ctx.lineTo(x - 9, y);
      ctx.fill();
    }
    const CAP = [
      "Meteoroidul zboară prin spațiu cu viteza de zeci de kilometri pe secundă (11–72 km/s).",
      "În atmosferă el se încălzește puternic din cauza frecării cu aerul și arde: vedem un meteor.",
      "Un corp mai mare nu arde complet: aerul îl frînează…",
      "…și el cade pe Pămînt. Ce a ajuns pe suprafața Pămîntului este un meteorit.",
    ];

    return function (ctx, t) {
      const tc = t % CICLU, nr = Math.floor(t / CICLU);
      ctx.save();
      fon(ctx, t);
      // atmosfera
      const g = ctx.createLinearGradient(0, yH(140), 0, SOL);
      g.addColorStop(0, "rgba(40, 70, 140, 0)");
      g.addColorStop(1, "rgba(60, 100, 170, 0.55)");
      ctx.fillStyle = g;
      ctx.fillRect(0, yH(140), W, SOL - yH(140));
      // zona în care ard meteorii
      ctx.fillStyle = "rgba(255, 140, 192, 0.08)";
      ctx.fillRect(56, yH(120), W - 56, yH(70) - yH(120));
      linie(ctx, 56, yH(120), W, yH(120), "rgba(255, 140, 192, 0.55)", 1.2, [6, 5]);
      linie(ctx, 56, yH(70), W, yH(70), "rgba(255, 140, 192, 0.55)", 1.2, [6, 5]);
      text(ctx, "aici ard meteorii (70–120 km)", 72, yH(120) + 22, { marime: 14, greutate: 700, culoare: ROZ });

      // axa înălțimii
      linie(ctx, 56, SOL, 56, yH(146), "rgba(169, 180, 208, 0.8)", 1.5);
      for (let h = 0; h <= 140; h += 20) {
        linie(ctx, 50, yH(h), 62, yH(h), "rgba(169, 180, 208, 0.8)", 1.5);
        if (h > 0) linie(ctx, 62, yH(h), W, yH(h), "rgba(169, 180, 208, 0.07)", 1);
        text(ctx, String(h), 44, yH(h) + 5, { marime: 13, align: "right", culoare: PAL });
      }
      text(ctx, "h, km", 14, yH(146) - 6, { marime: 13, greutate: 700, culoare: PAL });

      avion(ctx, 170, yH(10));
      text(ctx, "avion (10 km)", 194, yH(10) + 5, { marime: 12, culoare: PAL });

      // meteori mici, paraleli (ca într-o ploaie de meteori)
      const r = aleator(nr * 7 + 3);
      for (let j = 0; j < 9; j++) {
        const t0 = 0.3 + j * 1.25 + r() * 0.5, x0 = 160 + r() * 600, h0 = 118 - r() * 6, lung = 70 + r() * 70;
        const dtm = tc - t0;
        if (dtm < 0 || dtm > 0.55) continue;
        const s = lung * dtm / 0.55;
        const x = x0 + D[0] * s, y = yH(h0) + D[1] * s;
        dira(ctx, x, y, Math.min(s, 60), 2, 0.8 * Math.sin(PI * dtm / 0.55));
      }

      // meteoroidul principal
      const P = principal(tc);
      const b = P.faza === 1 ? stralucire(P.y) : 0;
      if (P.faza === 1) dira(ctx, P.x, P.y, 40 + 110 * b, 2 + 4 * b, Math.max(0.25, b));
      if (P.faza === 2) {
        const u = (tc - 4.4) / 2.2;
        const rosu = F.limita(1 - u * 1.5);
        ctx.fillStyle = "rgba(255, 120, 60, " + 0.8 * rosu + ")";
        ctx.beginPath();
        ctx.arc(P.x, P.y, 6, 0, TAU);
        ctx.fill();
      }
      piatra(ctx, P.x, P.y, P.faza === 3 ? 6 : 4.5);
      if (P.faza === 3) {
        const u = F.limita((tc - 6.6) / 0.8);
        if (u < 1) {
          ctx.globalAlpha = 1 - u;
          ctx.strokeStyle = "#cbb89f";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(P.x, SOL, 8 + 40 * u, 3 + 10 * u, 0, PI, TAU);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // solul
      ctx.fillStyle = "#18231d";
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, SOL - 14);
      ctx.quadraticCurveTo(70, SOL - 34, 150, SOL - 6);
      ctx.lineTo(W, SOL);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      if (P.faza === 3) piatra(ctx, P.x, P.y, 6);

      // etichete
      if (P.faza === 0) {
        text(ctx, "meteoroid", P.x - 14, P.y + 6, { marime: 16, greutate: 800, align: "right" });
      } else if (P.faza === 1) {
        text(ctx, "meteor", P.x - 20, P.y + 2, { marime: 16, greutate: 800, align: "right", culoare: "#ffe7b0" });
        text(ctx, "(„stea căzătoare”)", P.x - 20, P.y + 20, { marime: 13, align: "right", culoare: "#ffe7b0" });
      } else if (P.faza === 3) {
        linie(ctx, P.x + 8, P.y - 8, P.x + 30, P.y - 40, ALB, 1.2);
        text(ctx, "meteorit", P.x + 32, P.y - 44, { marime: 16, greutate: 800 });
      }
      text(ctx, CAP[P.faza], W / 2, H - 14, { marime: 15, align: "center" });
      ctx.restore();
    };
  });
})();
