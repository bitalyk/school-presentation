/* Animațiile pentru 1.8 „Mișcarea curbilinie” (clasa a 10-a). */
(function () {
  "use strict";

  const F = window.Fizica;
  const $ = function (id) { return document.getElementById(id); };
  const PI = Math.PI;
  const CERNEALA = "#1f2430";
  const GRI = "#5f6573";
  const AXA = "#8a919c";
  const GALBEN = "#f3b221";   // traiectoria
  const ARC = "#e58f0a";      // arcul parcurs
  const ROSU = "#e0314b";     // viteza
  const TEAL = "#17a589";     // deplasarea (coarda)
  const VIOLET = "#8a5bd0";   // accelerația
  const ACCENT = "#cf2741";

  const neted = function (x) { x = F.limita(x); return x * x * (3 - 2 * x); };
  const vec = function (l, ind) { return ind ? [[l, "v"], [ind, "sub"]] : [[l, "v"]]; };
  const it = function (l, ind) { return ind ? [[l, "i"], [ind, "sub"]] : [[l, "i"]]; };
  const cat = function () { return Array.prototype.concat.apply([], arguments); };
  const grade = function (rad) { return Math.round((rad * 180) / PI); };

  // punct pe cerc: unghiul θ măsurat ca în matematică (sens trigonometric), y-ul ecranului e în jos
  const P = function (O, R, th) { return { x: O.x + R * Math.cos(th), y: O.y - R * Math.sin(th) }; };
  // direcția vitezei pentru mișcarea în sensul acelor de ceasornic
  const tang = function (th) { return { x: Math.sin(th), y: Math.cos(th) }; };
  const spre = function (A, B) { const d = Math.hypot(B.x - A.x, B.y - A.y) || 1; return { x: (B.x - A.x) / d, y: (B.y - A.y) / d }; };

  function cerc(ctx, O, R, o) {
    o = o || {};
    ctx.save();
    ctx.beginPath();
    ctx.arc(O.x, O.y, R, 0, PI * 2);
    ctx.lineWidth = o.grosime || 4;
    ctx.strokeStyle = o.culoare || GALBEN;
    if (o.punctat) ctx.setLineDash(o.punctat);
    ctx.stroke();
    ctx.restore();
  }

  // arc de pe cerc între unghiurile th1 > th2 (parcurs în sensul acelor de ceasornic)
  function arcOrar(ctx, O, R, th1, th2, culoare, grosime) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(O.x, O.y, R, -th1, -th2, false);
    ctx.lineWidth = grosime;
    ctx.lineCap = "round";
    ctx.strokeStyle = culoare;
    ctx.stroke();
    ctx.restore();
  }

  function punct(ctx, p, o) {
    o = o || {};
    ctx.beginPath();
    ctx.arc(p.x, p.y, o.r || 7, 0, PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = o.culoare || ROSU;
    ctx.stroke();
  }

  function centru(ctx, O, eticheta) {
    ctx.beginPath();
    ctx.arc(O.x, O.y, 5, 0, PI * 2);
    ctx.fillStyle = CERNEALA;
    ctx.fill();
    if (eticheta !== false) F.scrie(ctx, it("O"), O.x - 10, O.y + 26, { marime: 22, align: "right" });
  }

  function linie(ctx, A, B, o) {
    o = o || {};
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.lineWidth = o.grosime || 1.5;
    ctx.strokeStyle = o.culoare || AXA;
    if (o.punctat) ctx.setLineDash(o.punctat);
    ctx.stroke();
    ctx.restore();
  }

  // săgeată de la A în direcția d, de lungime L, cu etichetă lângă vârf
  function vector(ctx, A, d, L, culoare, eticheta, o) {
    o = o || {};
    if (L < 3) return null;
    const B = { x: A.x + d.x * L, y: A.y + d.y * L };
    F.sageata(ctx, A.x, A.y, B.x, B.y, { culoare: culoare, grosime: o.grosime || 3.5, cap: Math.min(14, L * 0.6) });
    if (eticheta && L > (o.min || 18)) {
      F.scrie(ctx, eticheta, B.x + (o.dx || 0), B.y + (o.dy || 0), { marime: o.marime || 22, align: o.align || "center", culoare: culoare });
    }
    return B;
  }

  // etichetă pusă la distanța `dist` de punctul p, în direcția d (centrată pe acel loc)
  function langa(ctx, parti, p, d, dist, o) {
    o = o || {};
    const m = o.marime || 21;
    F.scrie(ctx, parti, p.x + d.x * dist, p.y + d.y * dist + m * 0.35, { marime: m, align: "center", culoare: o.culoare || CERNEALA, greutate: o.greutate });
  }

  function arcUnghi(ctx, V, r, a1, a2, culoare) {
    // a1, a2: unghiuri de ecran (canvas), de la a1 la a2 în sens crescător
    ctx.save();
    ctx.beginPath();
    ctx.arc(V.x, V.y, r, a1, a2, false);
    ctx.lineWidth = 2;
    ctx.strokeStyle = culoare || GRI;
    ctx.stroke();
    ctx.restore();
  }

  function latime(ctx, parti, m) { return F.scrie(ctx, parti, -5000, -5000, { marime: m }); }
  // expresie din bucăți: { p: părți } sau fracție { num, den }; fiecare cu culoarea ei (c)
  function expresie(ctx, bucati, x, y, o) {
    o = o || {};
    const m = o.marime || 24;
    const mf = m * 0.84;
    const lat = bucati.map(function (b) {
      return b.num ? Math.max(latime(ctx, b.num, mf), latime(ctx, b.den, mf)) + 10 : latime(ctx, b.p, m);
    });
    const total = lat.reduce(function (s, w) { return s + w; }, 0);
    let xx = o.align === "center" ? x - total / 2 : o.align === "right" ? x - total : x;
    bucati.forEach(function (b, i) {
      const c = b.c || o.culoare || CERNEALA;
      if (b.num) {
        const cx = xx + lat[i] / 2;
        F.scrie(ctx, b.num, cx, y - m * 0.52, { marime: mf, align: "center", culoare: c });
        F.scrie(ctx, b.den, cx, y + m * 0.62, { marime: mf, align: "center", culoare: c });
        ctx.fillStyle = c;
        ctx.fillRect(xx + 3, y - m * 0.36, lat[i] - 6, Math.max(1.5, m * 0.07));
      } else {
        F.scrie(ctx, b.p, xx, y, { marime: m, culoare: c, greutate: o.greutate });
      }
      xx += lat[i];
    });
    return total;
  }

  function apare(t, t1, d) { return neted((t - t1) / (d || 0.6)); }
  // transparența unei faze care durează `dur` secunde: apare și dispare lin
  function faza(tl, dur) { return Math.min(F.limita(tl / 0.5), F.limita((dur - tl) / 0.5)); }

  // disc rigid care se rotește (cu spițe)
  function disc(ctx, O, R, th) {
    const g = ctx.createRadialGradient(O.x - R * 0.3, O.y - R * 0.3, R * 0.1, O.x, O.y, R);
    g.addColorStop(0, "#f4f6fa");
    g.addColorStop(1, "#dde3ec");
    ctx.beginPath();
    ctx.arc(O.x, O.y, R, 0, PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#aab3c2";
    ctx.stroke();
    for (let k = 0; k < 6; k++) {
      linie(ctx, O, P(O, R - 4, th + (k * PI) / 3 + PI / 6), { culoare: "rgba(140, 150, 168, 0.35)", grosime: 2 });
    }
  }

  // =====================================================================
  //  1. Titlu: punct pe cerc, cu viteza tangentă și accelerația spre centru
  // =====================================================================
  Deck.animatie($("a-titlu"), function () {
    const O = { x: 280, y: 286 }, R = 190, W = 0.7;
    return function (ctx, t) {
      const th = PI * 0.8 - W * t;
      cerc(ctx, O, R, { grosime: 5 });
      arcOrar(ctx, O, R, th + 1.3, th, "rgba(224, 49, 75, 0.35)", 8);
      const M = P(O, R, th);
      linie(ctx, O, M, { punctat: [6, 6], culoare: "rgba(95, 101, 115, 0.6)" });
      centru(ctx, O, false);
      const n = spre(M, O);
      vector(ctx, M, n, 78, VIOLET, cat(vec("a"), [["c", "sub"]]), { min: 0, marime: 22, dx: n.y * 22, dy: -n.x * 22 + 8 });
      vector(ctx, M, tang(th), 130, ROSU, vec("v"), { min: 0, marime: 26, dx: 14 * tang(th).x, dy: 14 * tang(th).y + 9 });
      punct(ctx, M, { r: 9 });
    };
  });

  // =====================================================================
  //  2. Fig. 1.42: viteza medie devine tangentă; apoi mișcarea uniformă
  // =====================================================================
  Deck.animatie($("a-tangenta"), function () {
    const O = { x: 395, y: 345 }, R = 245, L = 175, T = 8, W = (2 * PI) / T;
    const M0 = P(O, R, PI);
    const DUR_A = 11.5, DUR_B = 11, CICLU = DUR_A + DUR_B;
    const sus = { x: 0, y: -1 };

    function vMed(phi) { return (L * Math.sin(phi / 2)) / (phi / 2); }

    // coarda M0M și viteza medie corespunzătoare; k = indicele (sau "" pentru cea curentă)
    function pereche(ctx, phi, k, alfa) {
      const M = P(O, R, PI - phi);
      const d = spre(M0, M);
      const coarda = Math.hypot(M.x - M0.x, M.y - M0.y);
      const nSus = { x: d.y, y: -d.x }, nJos = { x: -d.y, y: d.x };
      ctx.save();
      ctx.globalAlpha *= alfa;
      if (coarda > 6) F.sageata(ctx, M0.x, M0.y, M.x, M.y, { culoare: TEAL, grosime: 3, cap: Math.min(14, coarda * 0.5) });
      if (coarda > 110) langa(ctx, vec("s", k), { x: M0.x + d.x * coarda * 0.8, y: M0.y + d.y * coarda * 0.8 }, nJos, 20, { culoare: TEAL });
      const B = vector(ctx, M0, d, vMed(phi), ROSU, null, { grosime: 3.5 });
      if (B && phi > 0.35) langa(ctx, cat(vec("v"), [["med" + k, "sub"]]), B, k ? nJos : nSus, k ? 22 : 30, { culoare: ROSU });
      punct(ctx, M);
      if (coarda > 30) langa(ctx, it("M", k || null), M, spre(O, M), 26);
      ctx.restore();
    }

    function fazaA(ctx, tl) {
      const u = F.limita((tl - 1) / 7);
      const phi = ((3 + 147 * Math.pow(1 - u, 1.6)) * PI) / 180;
      cerc(ctx, O, R);
      centru(ctx, O);
      linie(ctx, { x: M0.x, y: O.y + 110 }, { x: M0.x, y: 30 }, { punctat: [6, 7], culoare: "rgba(95, 101, 115, 0.5)" });
      // pozițiile anterioare rămân desenate (ca în fig. 1.42)
      [[125, "1"], [70, "2"]].forEach(function (g) {
        if ((phi * 180) / PI <= g[0] + 0.5) pereche(ctx, (g[0] * PI) / 180, g[1], 0.5);
      });
      const kv = apare(tl, 8.2, 0.8);
      pereche(ctx, phi, "", 1 - kv);
      // unghiul dintre tangentă și coardă
      if (phi > 0.55) {
        const d = spre(M0, P(O, R, PI - phi));
        arcUnghi(ctx, M0, 48, -PI / 2, Math.atan2(d.y, d.x), GRI);
        const am = (-PI / 2 + Math.atan2(d.y, d.x)) / 2;
        F.scrie(ctx, it("α"), M0.x + 66 * Math.cos(am), M0.y + 66 * Math.sin(am) + 8, { marime: 22, align: "center", culoare: GRI });
      }
      // viteza momentană, tangentă
      if (kv > 0) {
        ctx.save();
        ctx.globalAlpha *= kv;
        vector(ctx, M0, sus, L, ROSU, vec("v"), { grosime: 4.5, dx: -22, dy: 16, marime: 26 });
        ctx.restore();
      }
      punct(ctx, M0, { r: 8 });
      F.scrie(ctx, it("M", "0"), M0.x - 16, M0.y + 8, { marime: 22, align: "right" });
      // Δt și explicația
      const dt = phi / W;
      F.scrie(ctx, cat([["Δ"]], it("t"), [[" = " + F.numar(dt, 2) + " s"]]), 650, 40, { marime: 22, align: "right", greutate: 700 });
      const mesaj = kv > 0.5
        ? cat([["Δ"]], it("t"), [[" → 0:  "]], vec("v"), [["med", "sub"]], [[" devine viteza momentană "]], vec("v"), [[", tangentă la cerc"]])
        : cat([["Cu cât Δ"]], it("t"), [[" e mai mic, cu atât "]], vec("v"), [["med", "sub"]], [[" e mai aproape de tangentă"]]);
      F.scrie(ctx, mesaj, 340, 628, { marime: 20, align: "center", greutate: 700, culoare: kv > 0.5 ? ACCENT : CERNEALA });
    }

    function fazaB(ctx, tl) {
      const tm = F.limita(tl - 0.7, 0, T); // o rotație completă
      const th = PI - W * tm;
      cerc(ctx, O, R, { grosime: 3 });
      // arcele parcurse în fiecare secundă, colorate alternativ
      for (let k = 0; k < Math.ceil(tm); k++) {
        const a = PI - W * k, b = PI - W * Math.min(tm, k + 1);
        arcOrar(ctx, O, R, a, b, k % 2 ? "#f7c95a" : ARC, 9);
      }
      centru(ctx, O);
      // vitezele în momentele t = 1 s, 2 s, ... : același modul, altă direcție
      for (let k = 0; k <= Math.floor(tm) && k < 8; k++) {
        const thk = PI - W * k;
        const Mk = P(O, R, thk);
        ctx.save();
        ctx.globalAlpha *= 0.4;
        vector(ctx, Mk, tang(thk), 105, ROSU, null, { grosime: 3 });
        ctx.restore();
        ctx.beginPath();
        ctx.arc(Mk.x, Mk.y, 4, 0, PI * 2);
        ctx.fillStyle = CERNEALA;
        ctx.fill();
      }
      const M = P(O, R, th);
      const tv = tang(th);
      vector(ctx, M, tv, 105, ROSU, vec("v"), { grosime: 4.5, marime: 26, dx: tv.x * 20, dy: tv.y * 20 + 9, min: 0 });
      punct(ctx, M, { r: 8 });
      F.scrie(ctx, cat(it("t"), [[" = " + F.numar(tm, 1) + " s"]]), 650, 40, { marime: 22, align: "right", greutate: 700 });
      F.scrie(ctx, [["semnele — la fiecare secundă"]], 650, 66, { marime: 16, align: "right", culoare: GRI });
      const mesaj = cat([["În intervale egale de timp — arce egale:  |"]], vec("v"), [["| = const"]]);
      F.scrie(ctx, mesaj, 340, 628, { marime: 20, align: "center", greutate: 700, culoare: ACCENT });
    }

    function draw(ctx, t) {
      const tc = t % CICLU;
      if (tc < DUR_A) {
        ctx.globalAlpha = faza(tc, DUR_A);
        fazaA(ctx, tc);
      } else {
        ctx.globalAlpha = faza(tc - DUR_A, DUR_B);
        fazaB(ctx, tc - DUR_A);
      }
      ctx.globalAlpha = 1;
    }
    return { draw: draw };
  });

  // =====================================================================
  //  3. Coarda și arcul: pentru Δα mic |s| ≈ l
  // =====================================================================
  Deck.animatie($("a-coarda"), function () {
    const O = { x: 360, y: 262 }, R = 205, M0 = P(O, R, PI), CICLU = 12;
    function draw(ctx, t) {
      const tc = t % CICLU;
      ctx.globalAlpha = faza(tc, CICLU);
      const u = F.limita((tc - 0.8) / 7.5);
      const da = ((3 + 147 * Math.pow(1 - u, 1.5)) * PI) / 180;
      const M = P(O, R, PI - da);
      cerc(ctx, O, R, { grosime: 3 });
      linie(ctx, O, M0, { culoare: GRI });
      linie(ctx, O, M, { culoare: GRI });
      centru(ctx, O);
      // unghiul Δα în centru
      arcUnghi(ctx, O, 42, -PI, -PI + da, GRI);
      if (da > 0.45) F.scrie(ctx, cat([["Δ"]], it("α")), O.x + 70 * Math.cos(-PI + da / 2), O.y + 70 * Math.sin(-PI + da / 2) + 8, { marime: 21, align: "center", culoare: GRI });
      F.scrie(ctx, it("r"), (O.x + M0.x) / 2, O.y + 28, { marime: 22, align: "center", culoare: GRI });
      // arcul l și coarda s
      arcOrar(ctx, O, R, PI, PI - da, ARC, 8);
      const coarda = Math.hypot(M.x - M0.x, M.y - M0.y);
      F.sageata(ctx, M0.x, M0.y, M.x, M.y, { culoare: TEAL, grosime: 3.5, cap: Math.min(14, coarda * 0.5) });
      const mijArc = P(O, R + 26, PI - da / 2);
      if (da > 0.3) F.scrie(ctx, it("l"), mijArc.x, mijArc.y + 8, { marime: 24, align: "center", culoare: ARC });
      const mijC = { x: (M0.x + M.x) / 2, y: (M0.y + M.y) / 2 };
      if (coarda > 70) langa(ctx, vec("s"), mijC, spre(mijC, O), 22, { culoare: TEAL, marime: 22 });
      punct(ctx, M0);
      punct(ctx, M);
      F.scrie(ctx, it("M", "0"), M0.x - 14, M0.y + 8, { marime: 21, align: "right" });
      if (da > 0.12) langa(ctx, it("M"), M, spre(O, M), 26);

      // comparația lungimilor
      const lArc = R * da, lCoarda = 2 * R * Math.sin(da / 2), raport = lCoarda / lArc;
      F.cutie(ctx, 30, 486, 620, 146, { fond: "rgba(255,255,255,0.95)", contur: "#eadde0", raza: 14 });
      const X0 = 196, LB = 280;
      F.scrie(ctx, cat([["arcul "]], it("l")), 52, 524, { marime: 20, culoare: ARC, greutate: 700 });
      F.scrie(ctx, cat([["coarda |"]], vec("s"), [["|"]]), 52, 566, { marime: 20, culoare: TEAL, greutate: 700 });
      F.rotunjit(ctx, X0, 509, LB, 18, 9); ctx.fillStyle = ARC; ctx.fill();
      F.rotunjit(ctx, X0, 551, LB * raport, 18, 9); ctx.fillStyle = TEAL; ctx.fill();
      F.scrie(ctx, cat([["|"]], vec("s"), [["| / "]], it("l"), [[" = " + F.numar(raport, 3)]]), 632, 545, { marime: 22, align: "right", greutate: 700 });
      F.scrie(ctx, cat([["Δ"]], it("α"), [[" = " + grade(da) + "°"]]), 52, 612, { marime: 20, greutate: 700 });
      F.scrie(ctx, raport > 0.995 ? cat([["coarda ≈ arcul:  |"]], vec("s"), [["| ≈ "]], it("l")) : [["Micșorăm intervalul de timp Δt…"]],
        632, 612, { marime: 20, align: "right", greutate: 700, culoare: raport > 0.995 ? ACCENT : GRI });
      ctx.globalAlpha = 1;
    }
    return { draw: draw };
  });

  // =====================================================================
  //  4. Perioada și frecvența: numărăm rotațiile și măsurăm timpul
  // =====================================================================
  Deck.animatie($("a-perioada"), function () {
    const O = { x: 250, y: 260 }, R = 185, T = 2, NMAX = 4, START = 0.8, CICLU = 14;
    const S = P(O, R, PI / 2);
    function draw(ctx, t) {
      const tc = t % CICLU;
      ctx.globalAlpha = faza(tc, CICLU);
      const dt = F.limita(tc - START, 0, NMAX * T);
      const N = Math.floor(dt / T + 1e-9);
      const th = PI / 2 - (2 * PI * dt) / T;
      cerc(ctx, O, R);
      // rotația curentă, desenată cu roșu
      const fr = dt / T - N;
      if (dt > 0 && dt < NMAX * T) arcOrar(ctx, O, R, PI / 2, PI / 2 - 2 * PI * fr, "rgba(224, 49, 75, 0.55)", 7);
      centru(ctx, O);
      // reperul de pornire
      linie(ctx, { x: S.x, y: S.y - 30 }, { x: S.x, y: S.y + 16 }, { culoare: CERNEALA, grosime: 3 });
      F.scrie(ctx, [["start"]], S.x + 10, S.y - 22, { marime: 17, culoare: GRI });
      // un puls la fiecare trecere prin start
      if (N >= 1 && fr < 0.25 && dt < NMAX * T + 0.5) {
        ctx.beginPath();
        ctx.arc(S.x, S.y, 10 + 60 * fr, 0, PI * 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(207, 39, 65, " + (1 - fr * 4) + ")";
        ctx.stroke();
      }
      const M = P(O, R, th);
      vector(ctx, M, tang(th), 80, ROSU, null, { grosime: 3.5 });
      punct(ctx, M, { r: 9 });

      // cronometrul
      const C = { x: 560, y: 120 };
      ctx.beginPath(); ctx.arc(C.x, C.y, 58, 0, PI * 2);
      ctx.fillStyle = "#fff"; ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = CERNEALA; ctx.stroke();
      ctx.fillStyle = CERNEALA;
      F.rotunjit(ctx, C.x - 10, C.y - 80, 20, 16, 4); ctx.fill();
      for (let k = 0; k < 12; k++) {
        const a = (k * PI) / 6;
        linie(ctx, { x: C.x + 46 * Math.cos(a), y: C.y + 46 * Math.sin(a) }, { x: C.x + 52 * Math.cos(a), y: C.y + 52 * Math.sin(a) }, { culoare: GRI, grosime: 2 });
      }
      const ac = -PI / 2 + (2 * PI * dt) / 10;
      linie(ctx, C, { x: C.x + 42 * Math.cos(ac), y: C.y + 42 * Math.sin(ac) }, { culoare: ACCENT, grosime: 3 });
      ctx.beginPath(); ctx.arc(C.x, C.y, 5, 0, PI * 2); ctx.fillStyle = ACCENT; ctx.fill();
      F.scrie(ctx, cat([["Δ"]], it("t"), [[" = " + F.numar(dt, 2) + " s"]]), C.x, 222, { marime: 26, align: "center", greutate: 700 });
      F.scrie(ctx, cat(it("N"), [[" = " + N]]), C.x, 300, { marime: 40, align: "center", greutate: 800, culoare: ACCENT });
      F.scrie(ctx, [["rotații complete"]], C.x, 328, { marime: 17, align: "center", culoare: GRI });

      // rezultatele, după ultima rotație
      const k = apare(tc, START + NMAX * T + 0.3, 0.7);
      if (k > 0) {
        ctx.save();
        ctx.globalAlpha *= k;
        F.cutie(ctx, 30, 482, 620, 150, { fond: "#fff", contur: ACCENT, raza: 14 });
        const D = F.numar(NMAX * T, 2) + " s";
        expresie(ctx, [{ p: it("T") }, { p: [[" = "]] }, { num: cat([["Δ"]], it("t")), den: it("N") }, { p: [[" = "]] },
          { num: [[D]], den: [[NMAX + ""]] }, { p: [[" = " + F.numar(T, 2) + " s"]] }], 340, 530, { marime: 26, align: "center" });
        expresie(ctx, [{ p: it("ν") }, { p: [[" = "]] }, { num: it("N"), den: cat([["Δ"]], it("t")) }, { p: [[" = "]] },
          { num: [[NMAX + ""]], den: [[D]] }, { p: cat([[" = " + F.numar(1 / T, 2) + " s"]], [["−1", "sup"]]) }], 340, 598, { marime: 26, align: "center" });
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
    return { draw: draw };
  });

  // =====================================================================
  //  5. Discul rigid: viteza punctelor crește cu distanța până la axă
  // =====================================================================
  Deck.animatie($("a-disc"), function () {
    const O = { x: 330, y: 260 }, RD = 245, T = 6, W = (2 * PI) / T, PXM = 383, KV = 240;
    const raze = [0.2, 0.4, 0.6];
    return function (ctx, t) {
      const th = PI * 0.62 - W * t;
      disc(ctx, O, RD, th);
      raze.forEach(function (r) { cerc(ctx, O, r * PXM, { grosime: 2, culoare: "rgba(229, 143, 10, 0.55)", punctat: [7, 7] }); });
      const capat = P(O, raze[2] * PXM, th);
      linie(ctx, O, capat, { culoare: CERNEALA, grosime: 3 });
      // vârfurile vitezelor stau pe o dreaptă care trece prin axă: v ~ r
      const d = tang(th);
      const vf = { x: capat.x + d.x * KV * W * raze[2], y: capat.y + d.y * KV * W * raze[2] };
      linie(ctx, O, { x: O.x + (vf.x - O.x) * 1.08, y: O.y + (vf.y - O.y) * 1.08 }, { punctat: [5, 6], culoare: "rgba(224, 49, 75, 0.55)" });
      raze.forEach(function (r, i) {
        const M = P(O, r * PXM, th);
        vector(ctx, M, d, KV * W * r, ROSU, cat(vec("v"), [[i + 1 + "", "sub"]]), { grosime: 3.5, marime: 20, dx: -d.y * 16, dy: d.x * 16 + 7, min: 30 });
        punct(ctx, M);
      });
      centru(ctx, O, false);
      // tabelul
      F.cutie(ctx, 30, 516, 620, 120, { fond: "rgba(255,255,255,0.95)", contur: "#eadde0", raza: 14 });
      raze.forEach(function (r, i) {
        const x = 140 + i * 200;
        F.scrie(ctx, cat(it("r", i + 1 + ""), [[" = " + F.numar(r, 1) + " m"]]), x, 548, { marime: 20, align: "center" });
        F.scrie(ctx, cat(it("v", i + 1 + ""), [[" = " + F.numar((2 * PI * r) / T, 2) + " m/s"]]), x, 582, { marime: 20, align: "center", greutate: 700, culoare: ROSU });
      });
      F.scrie(ctx, cat([["Perioada "]], it("T"), [[" = " + T + " s este aceeași pentru toate punctele discului"]]), 340, 620, { marime: 17, align: "center", culoare: GRI });
    };
  });

  // =====================================================================
  //  6. Fig. 1.43: Δv este orientat spre centru → accelerația centripetă
  // =====================================================================
  Deck.animatie($("a-centripeta"), function () {
    const DUR_A = 11, DUR_B = 9, CICLU = DUR_A + DUR_B;
    const OA = { x: 290, y: 596 }, RA = 360, TH0 = (112 * PI) / 180, LV = 165;
    const OB = { x: 340, y: 320 }, RB = 210;

    function fazaA(ctx, tl) {
      const u = F.limita((tl - 1) / 6.5);
      const da = ((12 + 38 * Math.pow(1 - u, 1.3)) * PI) / 180;
      const M0 = P(OA, RA, TH0), M = P(OA, RA, TH0 - da);
      arcOrar(ctx, OA, RA, TH0 + 0.42, TH0 - 1.0, GALBEN, 4);
      linie(ctx, OA, M0, { culoare: GRI });
      linie(ctx, OA, M, { culoare: GRI });
      centru(ctx, OA);
      arcUnghi(ctx, OA, 56, -TH0, -TH0 + da, GRI);
      F.scrie(ctx, cat([["Δ"]], it("α")), OA.x + 78 * Math.cos(-TH0 + da / 2), OA.y + 78 * Math.sin(-TH0 + da / 2) + 8, { marime: 20, align: "center", culoare: GRI });
      [M0, M].forEach(function (p, i) {
        const mij = { x: (OA.x + p.x) / 2, y: (OA.y + p.y) / 2 };
        if (i === 0 || da > 0.3) langa(ctx, it("r"), mij, i ? { x: 1, y: 0 } : { x: -1, y: 0 }, 16, { culoare: GRI });
      });
      // coarda
      const coarda = Math.hypot(M.x - M0.x, M.y - M0.y);
      F.sageata(ctx, M0.x, M0.y, M.x, M.y, { culoare: TEAL, grosime: 2.5, cap: Math.min(12, coarda * 0.5) });
      // vitezele
      const d0 = tang(TH0), d = tang(TH0 - da);
      vector(ctx, M0, d0, LV, ROSU, vec("v", "0"), { dx: -4, dy: -14, marime: 22 });
      const A = vector(ctx, M, d0, LV, "rgba(224, 49, 75, 0.45)", null, { grosime: 3 });
      const B = vector(ctx, M, d, LV, ROSU, null);
      langa(ctx, vec("v"), { x: M.x + d.x * LV * 0.55, y: M.y + d.y * LV * 0.55 }, { x: -d.y, y: d.x }, 20, { culoare: ROSU, marime: 22 });
      // Δv = v − v0, de la vârful lui v0 la vârful lui v
      const ldv = Math.hypot(B.x - A.x, B.y - A.y);
      F.sageata(ctx, A.x, A.y, B.x, B.y, { culoare: VIOLET, grosime: 3.5, cap: Math.min(13, ldv * 0.5) });
      if (ldv > 22) F.scrie(ctx, cat([["Δ"]], vec("v")), Math.max(A.x, B.x) + 10, (A.y + B.y) / 2 + 8, { marime: 21, culoare: VIOLET });
      if (ldv > 30) {
        F.scrie(ctx, it("A"), A.x + 6, A.y - 8, { marime: 18, culoare: GRI });
        F.scrie(ctx, it("B"), B.x + 10, B.y + 16, { marime: 18, culoare: GRI });
      }
      // direcția lui Δv, prelungită: trece (aproape) prin centru
      const kd = spre(A, B);
      linie(ctx, B, { x: B.x + kd.x * 260, y: B.y + kd.y * 260 }, { punctat: [4, 7], culoare: "rgba(138, 91, 208, 0.45)" });
      punct(ctx, M0);
      punct(ctx, M);
      F.scrie(ctx, it("M", "0"), M0.x - 14, M0.y + 4, { marime: 21, align: "right" });
      F.scrie(ctx, it("M"), M.x - 4, M.y + 30, { marime: 21, align: "center" });
      // accelerația centripetă în M0
      const ka = apare(tl, 7.8, 0.8);
      if (ka > 0) {
        ctx.save();
        ctx.globalAlpha *= ka;
        vector(ctx, M0, spre(M0, OA), 120, VIOLET, cat(vec("a"), [["c", "sub"]]), { grosime: 4.5, marime: 24, dx: -26, dy: 0 });
        ctx.restore();
      }
      F.scrie(ctx, cat([["Δ"]], it("α"), [[" = " + grade(da) + "°"]]), 650, 36, { marime: 22, align: "right", greutate: 700 });
      const mesaj = ka > 0.5
        ? cat([["Δ"]], it("t"), [[" → 0:  "]], vec("a"), [["c", "sub"]], [[" este orientată spre centrul cercului"]])
        : cat([["Cu cât Δ"]], it("α"), [[" e mai mic, cu atât Δ"]], vec("v"), [[" e mai aproape de direcția spre centru"]]);
      F.scrie(ctx, mesaj, 650, 70, { marime: 18, align: "right", greutate: 700, culoare: ka > 0.5 ? ACCENT : CERNEALA });
    }

    function fazaB(ctx, tl) {
      const th = PI * 0.9 - 0.75 * tl;
      cerc(ctx, OB, RB);
      arcOrar(ctx, OB, RB, th + 1.1, th, "rgba(224, 49, 75, 0.35)", 8);
      centru(ctx, OB);
      // câteva poziții anterioare: accelerația e mereu spre centru
      for (let k = 1; k <= 3; k++) {
        const thk = th + k * 1.4;
        const Mk = P(OB, RB, thk);
        ctx.save();
        ctx.globalAlpha *= 0.3;
        vector(ctx, Mk, spre(Mk, OB), 90, VIOLET, null, { grosime: 3 });
        vector(ctx, Mk, tang(thk), 110, ROSU, null, { grosime: 3 });
        ctx.restore();
      }
      const M = P(OB, RB, th);
      linie(ctx, OB, M, { punctat: [6, 6], culoare: "rgba(95, 101, 115, 0.6)" });
      const n = spre(M, OB);
      vector(ctx, M, n, 90, VIOLET, cat(vec("a"), [["c", "sub"]]), { grosime: 4.5, marime: 22, dx: -n.y * 22, dy: n.x * 22 + 8, min: 0 });
      const tv = tang(th);
      vector(ctx, M, tv, 110, ROSU, vec("v"), { grosime: 4.5, marime: 24, dx: tv.x * 18, dy: tv.y * 18 + 9, min: 0 });
      punct(ctx, M, { r: 8 });
      F.scrie(ctx, cat(vec("v"), [[" — tangentă la cerc;   "]], vec("a"), [["c", "sub"]], [[" — mereu spre centru"]]), 340, 600, { marime: 20, align: "center", greutate: 700 });
      F.scrie(ctx, cat(it("a", "c"), [[" = "]], it("v"), [["2", "sup"]], [[" / "]], it("r"), [[" — modulul nu se schimbă"]]), 340, 630, { marime: 18, align: "center", culoare: GRI });
    }

    function draw(ctx, t) {
      const tc = t % CICLU;
      if (tc < DUR_A) {
        ctx.globalAlpha = faza(tc, DUR_A);
        fazaA(ctx, tc);
      } else {
        ctx.globalAlpha = faza(tc - DUR_A, DUR_B);
        fazaB(ctx, tc - DUR_A);
      }
      ctx.globalAlpha = 1;
    }
    return { draw: draw };
  });

  // =====================================================================
  //  7. Fig. 1.44: cilindrul se rotește; Δα e același pentru A și B
  // =====================================================================
  Deck.animatie($("a-cilindru"), function () {
    const AX = 260, YS = 128, YJ = 452, RX = 180, RY = 54, YB = 318, RA = 118;
    const F1 = (12 * PI) / 180, F2 = (68 * PI) / 180, CICLU = 10;
    const ku = RY / RX;
    // punct pe elipsa de la nivelul y, la distanța ρ de axă, unghiul φ (φ > 0 = în față)
    const E = function (y, rho, f) { return { x: AX + rho * Math.cos(f), y: y + rho * ku * Math.sin(f) }; };

    function elipsa(ctx, y, rho, f1, f2, o) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(AX, y, rho, rho * ku, 0, f1, f2, false);
      ctx.lineWidth = o.grosime || 2;
      ctx.strokeStyle = o.culoare || GRI;
      if (o.punctat) ctx.setLineDash(o.punctat);
      ctx.stroke();
      ctx.restore();
    }

    function unghi(ctx, y, f1, f, eticheta) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(AX, y);
      ctx.ellipse(AX, y, 52, 52 * ku, 0, f1, f, false);
      ctx.closePath();
      ctx.fillStyle = "rgba(207, 39, 65, 0.18)";
      ctx.fill();
      ctx.restore();
      if (eticheta) {
        const p = E(y, 76, (f1 + f) / 2);
        F.scrie(ctx, cat([["Δ"]], it("α")), p.x, p.y + 10, { marime: 19, align: "center", culoare: ACCENT, greutate: 700 });
      }
    }

    function draw(ctx, t) {
      const tc = t % CICLU;
      ctx.globalAlpha = faza(tc, CICLU);
      const f = F1 + (F2 - F1) * neted((tc - 1.2) / 2.6);
      const gata = tc > 3.9;

      // corpul cilindrului
      const g = ctx.createLinearGradient(AX - RX, 0, AX + RX, 0);
      g.addColorStop(0, "#cfd6e2"); g.addColorStop(0.45, "#f3f5f9"); g.addColorStop(1, "#bcc5d4");
      ctx.beginPath();
      ctx.moveTo(AX - RX, YS);
      ctx.lineTo(AX - RX, YJ);
      ctx.ellipse(AX, YJ, RX, RY, 0, PI, 0, true);
      ctx.lineTo(AX + RX, YS);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#8f99aa";
      ctx.stroke();
      // dungi pe suprafața laterală, care se rotesc odată cu corpul
      for (let k = 0; k < 12; k++) {
        const a = f + (k * PI) / 6;
        if (Math.sin(a) <= 0.05) continue;
        const x = AX + RX * Math.cos(a);
        linie(ctx, { x: x, y: YS + RY * Math.sin(a) }, { x: x, y: YJ + RY * Math.sin(a) }, { culoare: "rgba(143, 153, 170, 0.35)", grosime: 1.5 });
      }
      // fața de sus
      ctx.beginPath();
      ctx.ellipse(AX, YS, RX, RY, 0, 0, PI * 2);
      ctx.fillStyle = "#eef1f6";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#8f99aa";
      ctx.stroke();
      // secțiunea de la nivelul punctului B
      elipsa(ctx, YB, RX, PI, 2 * PI, { punctat: [5, 6], culoare: "rgba(95, 101, 115, 0.5)" });
      elipsa(ctx, YB, RX, 0, PI, { culoare: "rgba(95, 101, 115, 0.55)", grosime: 1.5 });
      // axa de rotație
      linie(ctx, { x: AX, y: 40 }, { x: AX, y: YS }, { culoare: CERNEALA, grosime: 2 });
      linie(ctx, { x: AX, y: YS }, { x: AX, y: YJ + RY }, { culoare: "rgba(31, 36, 48, 0.55)", grosime: 1.5, punctat: [8, 6] });
      linie(ctx, { x: AX, y: YJ + RY }, { x: AX, y: YJ + RY + 50 }, { culoare: CERNEALA, grosime: 2 });
      // sensul rotației, în jurul axei
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(AX, 62, 34, 10, 0, 0.3, PI * 1.6, false);
      ctx.lineWidth = 2.5; ctx.strokeStyle = ACCENT; ctx.stroke();
      ctx.restore();
      const capR = { x: AX + 34 * Math.cos(PI * 1.6), y: 62 + 10 * Math.sin(PI * 1.6) };
      F.sageata(ctx, capR.x - 8, capR.y + 2, capR.x + 2, capR.y - 1, { culoare: ACCENT, grosime: 2.5, cap: 10 });
      F.scrie(ctx, it("ω"), AX + 44, 56, { marime: 24, culoare: ACCENT });

      // punctele: A pe fața de sus, B pe suprafața laterală
      const A0 = { x: AX, y: YS }, B0 = { x: AX, y: YB };
      unghi(ctx, YS, F1, f, gata);
      unghi(ctx, YB, F1, f, gata);
      const Ai = E(YS, RA, F1), Af = E(YS, RA, f), Bi = E(YB, RX, F1), Bf = E(YB, RX, f);
      ctx.save();
      ctx.globalAlpha *= 0.55;
      linie(ctx, A0, Ai, { culoare: CERNEALA, grosime: 2 });
      linie(ctx, B0, Bi, { culoare: CERNEALA, grosime: 2, punctat: [5, 5] });
      ctx.restore();
      linie(ctx, A0, Af, { culoare: CERNEALA, grosime: 2.5 });
      linie(ctx, B0, Bf, { culoare: CERNEALA, grosime: 2.5, punctat: [5, 5] });
      // drumul parcurs de fiecare punct (arcul)
      elipsa(ctx, YS, RA, F1, f, { culoare: ARC, grosime: 4 });
      elipsa(ctx, YB, RX, F1, f, { culoare: ARC, grosime: 4 });
      [[A0, "A", "0", -12, -8, "right"], [B0, "B", "0", -12, -8, "right"]].forEach(function (e) {
        ctx.beginPath(); ctx.arc(e[0].x, e[0].y, 4.5, 0, PI * 2); ctx.fillStyle = CERNEALA; ctx.fill();
        F.scrie(ctx, it(e[1], e[2]), e[0].x + e[3], e[0].y + e[4], { marime: 20, align: e[5] });
      });
      if (tc > 1.3) {
        punct(ctx, Ai, { r: 6, culoare: "rgba(224, 49, 75, 0.6)" });
        punct(ctx, Bi, { r: 6, culoare: "rgba(224, 49, 75, 0.6)" });
        F.scrie(ctx, it("A′"), Ai.x + 12, Ai.y + 6, { marime: 20 });
        F.scrie(ctx, it("B"), Bi.x + 12, Bi.y + 8, { marime: 20 });
      }
      punct(ctx, Af, { r: 7 });
      punct(ctx, Bf, { r: 7 });
      F.scrie(ctx, it(tc > 1.3 ? "A" : "A′"), Af.x + (tc > 1.3 ? -6 : 12), Af.y + (tc > 1.3 ? 30 : 6), { marime: 20, align: tc > 1.3 ? "center" : "left" });
      F.scrie(ctx, it(tc > 1.3 ? "B′" : "B"), Bf.x + (tc > 1.3 ? -6 : 12), Bf.y + (tc > 1.3 ? 32 : 8), { marime: 20, align: tc > 1.3 ? "center" : "left" });

      F.scrie(ctx, cat([["Unghiul de rotație Δ"]], it("α"), [[" este același"]]), 262, 588, { marime: 20, align: "center", greutate: 700, culoare: gata ? ACCENT : CERNEALA });
      F.scrie(ctx, [["pentru toate punctele rigidului"]], 262, 614, { marime: 20, align: "center", greutate: 700, culoare: gata ? ACCENT : CERNEALA });

      // inset: 1 radian
      F.cutie(ctx, 490, 404, 180, 228, { fond: "rgba(255,255,255,0.96)", contur: "#eadde0", raza: 14 });
      F.scrie(ctx, [["1 rad ≈ 57,3°"]], 580, 438, { marime: 19, align: "center", greutate: 700 });
      const C = { x: 566, y: 548 }, r = 62;
      cerc(ctx, C, r, { grosime: 1.5, culoare: "rgba(95, 101, 115, 0.45)" });
      const k = neted(((tc + 5) % CICLU - 1) / 2.5);
      ctx.save();
      ctx.beginPath(); ctx.moveTo(C.x, C.y); ctx.arc(C.x, C.y, 22, -1 * k, 0, false); ctx.closePath();
      ctx.fillStyle = "rgba(207, 39, 65, 0.2)"; ctx.fill();
      ctx.beginPath(); ctx.arc(C.x, C.y, r, -1 * k, 0, false);
      ctx.lineWidth = 5; ctx.strokeStyle = ARC; ctx.stroke();
      ctx.restore();
      linie(ctx, C, { x: C.x + r, y: C.y }, { culoare: CERNEALA, grosime: 2.5 });
      linie(ctx, C, { x: C.x + r * Math.cos(-k), y: C.y + r * Math.sin(-k) }, { culoare: CERNEALA, grosime: 2.5 });
      F.scrie(ctx, it("r"), C.x + r / 2, C.y + 24, { marime: 20, align: "center" });
      if (k > 0.9) {
        F.scrie(ctx, cat(it("l"), [[" = "]], it("r")), C.x + r * Math.cos(-0.5) + 10, C.y + r * Math.sin(-0.5) - 14, { marime: 18, culoare: ARC, greutate: 700 });
        F.scrie(ctx, [["1 rad"]], C.x - 10, C.y - 30, { marime: 15, align: "right", culoare: ACCENT, greutate: 700 });
      }
      ctx.globalAlpha = 1;
    }
    return { draw: draw };
  });

  // =====================================================================
  //  8. v = ωr și a_c = ω²r, cu ω și r alese din cursoare
  // =====================================================================
  Deck.animatie($("a-omega"), function () {
    const O = { x: 236, y: 262 }, RD = 232, PXM = 220, KV = 52, KA = 19;
    const st = { w: 1.5, r: 0.6, th: PI * 0.7 };
    const sw = $("omega"), sr = $("raza"), ow = $("omega-val"), or = $("raza-val");
    function citeste() {
      st.w = +sw.value;
      st.r = +sr.value;
      ow.textContent = F.numar(st.w, 1) + " rad/s";
      or.textContent = F.numar(st.r, 2) + " m";
    }
    [sw, sr].forEach(function (s) {
      s.addEventListener("input", citeste);
      s.addEventListener("change", function () { s.blur(); });
    });
    citeste();

    function draw(ctx, t, dt) {
      st.th -= st.w * dt;
      const w = st.w, r = st.r, v = w * r, ac = w * w * r;
      disc(ctx, O, RD, st.th);
      cerc(ctx, O, r * PXM, { grosime: 2.5, punctat: [7, 7], culoare: ARC });
      const M = P(O, r * PXM, st.th);
      linie(ctx, O, M, { culoare: CERNEALA, grosime: 2.5 });
      const mij = P(O, r * PXM * 0.5, st.th);
      langa(ctx, it("r"), mij, { x: -Math.sin(st.th), y: -Math.cos(st.th) }, 18);
      centru(ctx, O, false);
      const n = spre(M, O), tv = tang(st.th);
      vector(ctx, M, n, KA * ac, VIOLET, cat(vec("a"), [["c", "sub"]]), { grosime: 4, marime: 21, dx: tv.x * -20, dy: tv.y * -20 + 8, min: 14 });
      vector(ctx, M, tv, KV * v, ROSU, vec("v"), { grosime: 4, marime: 23, dx: tv.x * 18, dy: tv.y * 18 + 9, min: 10 });
      punct(ctx, M, { r: 8 });

      // valorile
      const X = 500;
      const rand = function (parti, y, o) { F.scrie(ctx, parti, X, y, Object.assign({ marime: 21 }, o || {})); };
      rand(cat(it("ω"), [[" = " + F.numar(w, 1) + " rad/s"]]), 70, { greutate: 700 });
      rand(cat(it("r"), [[" = " + F.numar(r, 2) + " m"]]), 104, { greutate: 700 });
      rand(cat(it("T"), [[" = 2π/"]], it("ω"), [[" = " + F.numar((2 * PI) / w, 2) + " s"]]), 162);
      rand(cat(it("ν"), [[" = 1/"]], it("T"), [[" = " + F.numar(w / (2 * PI), 2) + " s"]], [["−1", "sup"]]), 196);
      rand(cat(it("v"), [[" = "]], it("ω"), it("r"), [[" = " + F.numar(v, 2) + " m/s"]]), 254, { culoare: ROSU, greutate: 700 });
      rand(cat(it("a", "c"), [[" = "]], it("ω"), [["2", "sup"]], it("r")), 300, { culoare: VIOLET, greutate: 700 });
      rand([["= " + F.numar(ac, 2) + " m/s"], ["2", "sup"]], 330, { culoare: VIOLET, greutate: 700 });
      F.scrie(ctx, [["Schimbați ω și r"]], X, 420, { marime: 16, culoare: GRI });
      F.scrie(ctx, [["cu cursoarele de jos."]], X, 442, { marime: 16, culoare: GRI });
    }
    return { draw: draw };
  });
})();
