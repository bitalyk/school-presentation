/* Animațiile pentru 2.2 „Principiul fundamental al dinamicii” (clasa a 10-a). */
(function () {
  "use strict";

  const F = window.Fizica;
  const $ = function (id) { return document.getElementById(id); };
  const PI = Math.PI;
  const CERNEALA = "#1f2430";
  const GRI = "#5f6573";
  const VITEZA = "#e0314b";
  const ACCEL = "#9b59d0";
  const ACCEL_INCHIS = "#6b35a6";
  const FORTA = "#2f7fd6";
  const REZULTANTA = "#173f73";
  const GREUTATE = "#2e9e5b";
  const TEAL = "#0f8a79";
  const SOL = "#d5d9df";

  const neted = function (x) { x = F.limita(x); return x * x * (3 - 2 * x); };
  const estompare = function (s, per, d) { d = d || 0.4; return F.limita(Math.min(s / d, (per - s) / d)); };

  function pastila(ctx, parti, x, y, o) {
    o = o || {};
    const m = o.marime || 20;
    const lat = F.scrie(ctx, parti, -9999, -9999, { marime: m, greutate: 700 }) + 2 * (o.pad || 16);
    const h = m * 1.75;
    if (o.stanga) x += lat / 2;
    F.rotunjit(ctx, x - lat / 2, y - h / 2, lat, h, h / 2);
    ctx.fillStyle = o.fond || TEAL;
    ctx.fill();
    F.scrie(ctx, parti, x, y + m * 0.36, { marime: m, greutate: 700, align: "center", culoare: o.culoare || "#ffffff" });
    return lat;
  }

  function punctat(ctx, x1, y1, x2, y2, c, l) {
    ctx.save();
    ctx.setLineDash([7, 6]);
    ctx.strokeStyle = c;
    ctx.lineWidth = l || 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.restore();
  }

  function roata(ctx, cx, cy, R, rot) {
    ctx.fillStyle = "#23262e";
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * PI); ctx.fill();
    ctx.fillStyle = "#cfd3da";
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.45, 0, 2 * PI); ctx.fill();
    ctx.strokeStyle = "#23262e";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
      const a = rot + (k * 2 * PI) / 3;
      ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R * 0.45, cy + Math.sin(a) * R * 0.45);
    }
    ctx.stroke();
  }

  // cărucior: x = marginea din stânga, y = solul; întoarce vârful caroseriei
  function carut(ctx, x, y, L, rot, o) {
    o = o || {};
    const R = o.R || 14, H = o.H || 36;
    const yc = y - 2 * R - 2;
    ctx.fillStyle = o.culoare || "#2bb5a0";
    ctx.beginPath();
    ctx.moveTo(x, yc - H); ctx.lineTo(x + L, yc - H); ctx.lineTo(x + L - 12, yc); ctx.lineTo(x + 12, yc);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.09)";
    ctx.fillRect(x, yc - H, L, 7);
    roata(ctx, x + 30, y - R, R, rot);
    roata(ctx, x + L - 30, y - R, R, rot);
    return yc - H;
  }

  // un corp (cub) de pe cărucior sau suspendat: x, y = colțul din stânga sus
  function bloc(ctx, x, y, s, c) {
    F.rotunjit(ctx, x, y, s, s, 5);
    ctx.fillStyle = c || "#c99a3b";
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(x + 4, y + 4, 5, s - 8);
  }

  // =====================================================================
  //  1. Titlu: căruciorul tras de forța F⃗ se mișcă accelerat
  // =====================================================================
  Deck.animatie($("a-titlu"), function (a) {
    const YS = 400, AC = 62, X0 = 24, L = 150;
    const TMAX = Math.sqrt((2 * (a.w - X0 - L - 110)) / AC);
    const PER = TMAX + 1.6;
    const poz = function (u) { return X0 + (AC * u * u) / 2; };
    return function (ctx, t) {
      const s = t % PER;
      const u = F.limita(s - 0.5, 0, TMAX);
      ctx.globalAlpha = estompare(s, PER);
      const baza = ctx.globalAlpha;

      F.scrie(ctx, [["m", "i"], [" "], ["a", "v"], [" = "], ["F", "v"]], a.w / 2, 140,
        { marime: 54, greutate: 800, align: "center", culoare: CERNEALA });
      F.scrie(ctx, [["accelerația are direcția și sensul forței"]], a.w / 2, 186,
        { marime: 21, greutate: 700, align: "center", culoare: TEAL });

      ctx.fillStyle = SOL;
      ctx.fillRect(8, YS, a.w - 16, 9);
      // urmele la intervale egale de timp: distanțele cresc
      for (let k = 4; k >= 1; k--) {
        const uk = u - 0.62 * k;
        if (uk < 0) continue;
        ctx.globalAlpha = baza * (0.2 / k + 0.04);
        carut(ctx, poz(uk), YS, L, poz(uk) / 14);
        ctx.globalAlpha = baza;
        ctx.fillStyle = GRI;
        ctx.beginPath(); ctx.arc(poz(uk) + L, YS + 20, 4, 0, 2 * PI); ctx.fill();
      }
      const x = poz(u);
      const sus = carut(ctx, x, YS, L, x / 14);
      bloc(ctx, x + 30, sus - 40, 40, "#ef4560");
      bloc(ctx, x + 78, sus - 40, 40, "#ef4560");
      ctx.fillStyle = CERNEALA;
      ctx.beginPath(); ctx.arc(x + L, YS + 20, 5, 0, 2 * PI); ctx.fill();
      // firul și forța
      const yf = sus + 18;
      ctx.strokeStyle = "#8a6d3b";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x + L, yf); ctx.lineTo(x + L + 110, yf); ctx.stroke();
      F.sageata(ctx, x + L + 6, yf, x + L + 100, yf, { culoare: FORTA, grosime: 6, cap: 17 });
      F.scrie(ctx, [["F", "v"]], x + L + 72, yf - 16, { marime: 28, align: "center", culoare: FORTA });
      // accelerația
      F.sageata(ctx, x + 22, sus - 76, x + 128, sus - 76, { culoare: ACCEL, grosime: 5, cap: 15 });
      F.scrie(ctx, [["a", "v"]], x + 75, sus - 90, { marime: 26, align: "center", culoare: ACCEL });
      ctx.globalAlpha = 1;
    };
  });

  // =====================================================================
  //  2. Cărucioarele cu magneți: se resping / se atrag (fig. 2.5)
  // =====================================================================
  Deck.animatie($("a-magneti"), function (a) {
    const M1 = 3, M2 = 2, K = 1500000, C = 80;
    const YS = 300, L = 128, MG = 46, MC = 12;
    const SC = 1 / 200;      // px/s² → m/s² (doar pentru afișaj)
    const T0 = 0.9;          // eliberarea
    const FAZE = [
      { d0: 6, semn: 1, dur: 2.5, poli: ["N", "N"], lit: "a)", nume: "se resping",
        txt: "Polii de același nume sunt față în față" },
      { d0: 130, semn: -1, dur: 3.1, poli: ["N", "S"], lit: "b)", nume: "se atrag",
        txt: "Polii de nume diferite sunt față în față" },
    ];
    // simularea, o singură dată: 120 de valori pe secundă
    FAZE.forEach(function (f) {
      const h = 1 / 960;
      let x1 = 0, x2 = 0, v1 = 0, v2 = 0, lipit = false;
      f.p = []; f.tLipit = Infinity;
      for (let i = 0; i <= Math.round(f.dur / h); i++) {
        const d = f.d0 + x2 - x1;
        const fm = lipit ? 0 : K / ((d + C) * (d + C));
        const a1 = (-f.semn * fm) / M1, a2 = (f.semn * fm) / M2;
        if (i % 8 === 0) f.p.push({ x1: x1, x2: x2, a1: Math.abs(a1), a2: Math.abs(a2) });
        if (lipit) continue;
        v1 += a1 * h; v2 += a2 * h; x1 += v1 * h; x2 += v2 * h;
        if (f.d0 + x2 - x1 <= 0) {
          const ex = -(f.d0 + x2 - x1);
          x1 -= (ex * M2) / (M1 + M2); x2 += (ex * M1) / (M1 + M2);
          v1 = v2 = 0; lipit = true; f.tLipit = i * h;
        }
      }
      f.per = T0 + f.dur + 1.6;
    });
    const AMAX = 130;
    const PER = FAZE[0].per + FAZE[1].per;

    function magnet(ctx, x, y, fata, spre) {
      // x = fața dinspre celălalt cărucior; spre = +1 (magnetul e la dreapta feței) sau −1
      const alt = fata === "N" ? "S" : "N";
      const culori = { N: "#e0314b", S: "#2f7fd6" };
      const x0 = spre > 0 ? x : x - MG;
      const jum = MG / 2;
      const st = spre > 0 ? fata : alt, dr = spre > 0 ? alt : fata;
      ctx.fillStyle = culori[st];
      ctx.fillRect(x0, y, jum, 22);
      ctx.fillStyle = culori[dr];
      ctx.fillRect(x0 + jum, y, jum, 22);
      F.scrie(ctx, [[st]], x0 + jum / 2, y + 17, { marime: 15, greutate: 800, align: "center", culoare: "#fff" });
      F.scrie(ctx, [[dr]], x0 + jum * 1.5, y + 17, { marime: 15, greutate: 800, align: "center", culoare: "#fff" });
    }

    function grafic(ctx, f, n, x0, y0, w, h) {
      ctx.strokeStyle = GRI;
      ctx.lineWidth = 2;
      F.sageata(ctx, x0, y0 + h, x0 + w + 12, y0 + h, { culoare: GRI, grosime: 2, cap: 9 });
      F.sageata(ctx, x0, y0 + h, x0, y0 - 10, { culoare: GRI, grosime: 2, cap: 9 });
      F.scrie(ctx, [["a", "i"]], x0 - 16, y0 + 2, { marime: 20, align: "center", culoare: GRI });
      F.scrie(ctx, [["t", "i"]], x0 + w + 12, y0 + h + 24, { marime: 20, align: "center", culoare: GRI });
      [["a2", ACCEL_INCHIS], ["a1", ACCEL]].forEach(function (c) {
        ctx.strokeStyle = c[1];
        ctx.lineWidth = 3.5;
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (let i = 0; i <= n; i += 2) {
          const px = x0 + (i / (f.p.length - 1)) * w;
          const py = y0 + h - (Math.min(f.p[i][c[0]], AMAX) / AMAX) * h;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });
    }

    return function (ctx, t) {
      let s = t % PER, fi = 0;
      if (s >= FAZE[0].per) { s -= FAZE[0].per; fi = 1; }
      const f = FAZE[fi];
      ctx.globalAlpha = estompare(s, f.per, 0.35);
      const baza = ctx.globalAlpha;
      const u = F.limita(s - T0, 0, f.dur);
      const n = Math.min(f.p.length - 1, Math.round(u * 120));
      const st = f.p[n];
      const misca = s > T0 && u < f.tLipit;

      // titlu: a) / b)
      FAZE.forEach(function (g, i) {
        ctx.globalAlpha = baza * (i === fi ? 1 : 0.45);
        pastila(ctx, [[g.lit + " " + g.nume]], a.w / 2 + (i ? 100 : -100), 26,
          { marime: 19, fond: i === fi ? TEAL : "#e4e7eb", culoare: i === fi ? "#fff" : CERNEALA });
      });
      ctx.globalAlpha = baza;
      F.scrie(ctx, [[s < T0 ? f.txt + ": le eliberăm" : f.txt]], a.w / 2, 82,
        { marime: 20, greutate: 700, align: "center", culoare: GRI });

      // șina
      ctx.fillStyle = SOL;
      ctx.fillRect(10, YS, a.w - 20, 9);

      const c1 = a.w / 2 - f.d0 / 2 + st.x1;   // fața magnetului 1
      const c2 = a.w / 2 + f.d0 / 2 + st.x2;   // fața magnetului 2
      // căruciorul 1 (masa mai mare)
      const x1 = c1 - MC - L;
      const sus1 = carut(ctx, x1, YS, L, x1 / 14);
      for (let k = 0; k < 3; k++) bloc(ctx, x1 + 6 + k * 27, sus1 - 25, 25);
      magnet(ctx, c1, sus1 - 22, f.poli[0], -1);
      F.scrie(ctx, [["m", "i"], ["1", "sub"]], x1 + L / 2, YS - 44, { marime: 20, greutate: 700, align: "center", culoare: "#fff" });
      // căruciorul 2
      const x2 = c2 + MC;
      const sus2 = carut(ctx, x2, YS, L, x2 / 14);
      for (let k = 0; k < 2; k++) bloc(ctx, x2 + MG - MC + 12 + k * 27, sus2 - 25, 25);
      magnet(ctx, c2, sus2 - 22, f.poli[1], 1);
      F.scrie(ctx, [["m", "i"], ["2", "sub"]], x2 + L / 2, YS - 44, { marime: 20, greutate: 700, align: "center", culoare: "#fff" });

      // accelerațiile
      if (misca) {
        const l1 = 16 + st.a1 * 0.9, l2 = 16 + st.a2 * 0.9;
        const m1 = x1 + L / 2, m2 = x2 + L / 2, ya = sus1 - 62;
        const s1 = -f.semn, s2 = f.semn;
        F.sageata(ctx, m1 - (s1 * l1) / 2, ya, m1 + (s1 * l1) / 2, ya, { culoare: ACCEL, grosime: 5, cap: 14 });
        F.sageata(ctx, m2 - (s2 * l2) / 2, ya, m2 + (s2 * l2) / 2, ya, { culoare: ACCEL_INCHIS, grosime: 5, cap: 14 });
        F.scrie(ctx, [["a", "v"], ["1", "sub"]], m1, ya - 16, { marime: 22, align: "center", culoare: ACCEL });
        F.scrie(ctx, [["a", "v"], ["2", "sub"]], m2, ya - 16, { marime: 22, align: "center", culoare: ACCEL_INCHIS });
      } else if (u >= f.tLipit) {
        F.scrie(ctx, [["s-au lipit și s-au oprit"]], a.w / 2, sus1 - 60, { marime: 20, greutate: 700, align: "center", culoare: GRI });
      }
      F.scrie(ctx, [["m", "i"], ["1", "sub"], [" = 0,6 kg"]], x1 + L / 2, YS + 34, { marime: 18, greutate: 600, align: "center", culoare: GRI });
      F.scrie(ctx, [["m", "i"], ["2", "sub"], [" = 0,4 kg"]], x2 + L / 2, YS + 34, { marime: 18, greutate: 600, align: "center", culoare: GRI });

      // graficul a(t) și valorile
      grafic(ctx, f, n, 56, 392, 330, 150);
      const xr = 448;
      const v1 = misca ? F.numar(st.a1 * SC, 2) : "0", v2 = misca ? F.numar(st.a2 * SC, 2) : "0";
      F.scrie(ctx, [["a", "i"], ["1", "sub"], [" = " + v1 + " m/s²"]], xr, 420, { marime: 22, greutate: 700, culoare: ACCEL });
      F.scrie(ctx, [["a", "i"], ["2", "sub"], [" = " + v2 + " m/s²"]], xr, 456, { marime: 22, greutate: 700, culoare: ACCEL_INCHIS });
      const rap = misca ? F.numar(st.a2 / st.a1, 2) : "—";
      pastila(ctx, [["a", "i"], ["2", "sub"], [" / "], ["a", "i"], ["1", "sub"], [" = " + rap]], xr, 506,
        { marime: 22, fond: TEAL, stanga: true });
      F.scrie(ctx, [["același raport"]], xr, 552, { marime: 18, greutate: 700, culoare: TEAL });

      F.scrie(ctx, [["m", "i"], ["1", "sub"], [" / "], ["m", "i"], ["2", "sub"], [" = 0,6 / 0,4 = 1,5 = "],
        ["a", "i"], ["2", "sub"], [" / "], ["a", "i"], ["1", "sub"]], a.w / 2, 604,
        { marime: 23, greutate: 800, align: "center", culoare: CERNEALA });
      ctx.globalAlpha = 1;
    };
  });

  // =====================================================================
  //  3. Cântarul: aditivitatea masei (m = m1 + m2)
  // =====================================================================
  Deck.animatie($("a-cantar"), function (a) {
    const PX = 160, PY = 160, PER = 10.5;
    // momentele în care corpurile coboară pe platformă și pleacă
    const C1 = { jos: 0.4, sus: 2.9, rev: 5.3 }, C2 = { jos: 3.3 };
    function coborare(s, t0) { return neted((s - t0) / 0.6); }
    function cilindru(ctx, x, yb) { // m1: cilindru roșu, baza la yb
      ctx.fillStyle = "#c92a3e";
      ctx.beginPath(); ctx.ellipse(x, yb, 26, 7, 0, 0, 2 * PI); ctx.fill();
      ctx.fillStyle = "#e5455a";
      ctx.fillRect(x - 26, yb - 52, 52, 52);
      ctx.fillStyle = "#f07b8a";
      ctx.beginPath(); ctx.ellipse(x, yb - 52, 26, 7, 0, 0, 2 * PI); ctx.fill();
      F.scrie(ctx, [["m", "i"], ["1", "sub"]], x, yb - 20, { marime: 19, greutate: 700, align: "center", culoare: "#fff" });
    }
    function cub(ctx, x, yb) { // m2: cub albastru
      F.rotunjit(ctx, x - 22, yb - 44, 44, 44, 4);
      ctx.fillStyle = "#3d86d8";
      ctx.fill();
      F.scrie(ctx, [["m", "i"], ["2", "sub"]], x, yb - 15, { marime: 19, greutate: 700, align: "center", culoare: "#fff" });
    }
    return function (ctx, t) {
      const s = t % PER;
      ctx.globalAlpha = estompare(s, PER);
      const baza = ctx.globalAlpha;
      // poziția corpurilor: 0 = sus (în aer), 1 = pe platformă
      let p1 = 0, p2 = 0;
      if (s < C1.sus) p1 = coborare(s, C1.jos);
      else if (s < C1.rev) p1 = 1 - coborare(s, C1.sus);
      else p1 = coborare(s, C1.rev);
      p2 = s < C2.jos ? 0 : coborare(s, C2.jos);
      const masa = 200 * neted((p1 - 0.85) / 0.15) + 150 * neted((p2 - 0.85) / 0.15);
      const tasare = masa / 350 * 3;

      // cântarul
      ctx.fillStyle = "#d9dde3";
      F.rotunjit(ctx, PX - 150, PY + 6, 300, 58, 12);
      ctx.fill();
      ctx.fillStyle = "#b9bfc8";
      F.rotunjit(ctx, PX - 140, PY - 4 + tasare, 280, 12, 5);
      ctx.fill();
      F.rotunjit(ctx, PX - 62, PY + 18, 124, 36, 6);
      ctx.fillStyle = "#1d2b24";
      ctx.fill();
      F.scrie(ctx, [[Math.round(masa) + " g"]], PX + 52, PY + 46, { marime: 26, greutate: 800, align: "right", culoare: "#6ff0a8" });

      const yb = PY - 4 + tasare;
      const sus = 130;
      if (p1 > 0.001 || s < C1.jos + 0.1) {
        ctx.globalAlpha = baza * F.limita(p1 * 3 + (s < C1.jos ? F.limita(s / 0.3) : 0));
        cilindru(ctx, PX - 50, yb - (1 - p1) * sus);
        ctx.globalAlpha = baza;
      }
      if (s > C2.jos - 0.3) {
        ctx.globalAlpha = baza * F.limita((s - C2.jos + 0.3) / 0.3);
        cub(ctx, PX + 48, yb - (1 - p2) * sus);
        ctx.globalAlpha = baza;
      }

      // rezultatele
      const xr = 338;
      const rand = function (t0, parti, y, cul) {
        if (s < t0) return;
        ctx.globalAlpha = baza * F.limita((s - t0) / 0.4);
        F.scrie(ctx, parti, xr, y, { marime: 24, greutate: 700, culoare: cul || CERNEALA });
        ctx.globalAlpha = baza;
      };
      rand(1.3, [["m", "i"], ["1", "sub"], [" = 200 g"]], 50);
      rand(4.2, [["m", "i"], ["2", "sub"], [" = 150 g"]], 94);
      rand(6.3, [["m", "i"], [" = "], ["m", "i"], ["1", "sub"], [" + "], ["m", "i"], ["2", "sub"], [" = 350 g"]], 142, TEAL);
      if (s > 6.9) {
        ctx.globalAlpha = baza * F.limita((s - 6.9) / 0.4);
        pastila(ctx, [["masa este aditivă"]], xr, 190, { marime: 19, fond: TEAL, stanga: true });
      }
      ctx.globalAlpha = 1;
    };
  });

  // =====================================================================
  //  4. Resortul: l0, Δl, F⃗ + G⃗ = 0, apoi două corpuri (fig. 2.6, 2.7)
  // =====================================================================
  Deck.animatie($("a-resort"), function (a) {
    const XS = 200, YSUS = 64, L0 = 170, DL = 84, LAT = 30, NSP = 12;
    const YC = YSUS + L0;          // capătul resortului nedeformat
    const HB = 46, WB = 44, CR = 10;  // corpul: înălțime, lățime, cârligul
    const NPX = 46;                // 1 N → 46 px pe săgeți
    const T = { v1: 1.6, s1: 2.5, v2: 7.0, s2: 7.8, per: 13.4 };

    function alungire(s) {
      if (s < T.s1) return 0;
      if (s < T.s2) { const u = s - T.s1; return DL - DL * Math.exp(-1.5 * u) * Math.cos(6.3 * u); }
      const u = s - T.s2;
      return 2 * DL - DL * Math.exp(-1.5 * u) * Math.cos(4.5 * u);
    }
    function resort(ctx, y2) {
      ctx.strokeStyle = "#6b7280";
      ctx.lineWidth = 3.5;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(XS, YSUS);
      ctx.lineTo(XS, YSUS + 12);
      const h = (y2 - 12 - (YSUS + 12)) / (NSP * 2);
      for (let i = 0; i < NSP * 2; i++) ctx.lineTo(XS + (i % 2 ? -LAT / 2 : LAT / 2), YSUS + 12 + h * (i + 0.5));
      ctx.lineTo(XS, y2 - 12);
      ctx.lineTo(XS, y2);
      ctx.stroke();
    }
    function corp(ctx, x, ysus) {
      ctx.strokeStyle = "#7a5f22";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, ysus + 4, 6, PI, 2 * PI); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, ysus + 4); ctx.lineTo(x, ysus + CR); ctx.stroke();
      F.rotunjit(ctx, x - WB / 2, ysus + CR, WB, HB, 6);
      const g = ctx.createLinearGradient(x - WB / 2, 0, x + WB / 2, 0);
      g.addColorStop(0, "#b8862c"); g.addColorStop(0.4, "#e6bf5c"); g.addColorStop(1, "#a97a22");
      ctx.fillStyle = g;
      ctx.fill();
      F.scrie(ctx, [["1 N"]], x, ysus + CR + HB / 2 + 6, { marime: 15, greutate: 800, align: "center", culoare: "#5b4310" });
    }
    function acolada(ctx, x, y1, y2, parti) {
      if (y2 - y1 < 6) return;
      ctx.strokeStyle = CERNEALA;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 8, y1); ctx.lineTo(x, y1); ctx.lineTo(x, y2); ctx.lineTo(x + 8, y2);
      ctx.stroke();
      F.scrie(ctx, parti, x - 10, (y1 + y2) / 2 + 8, { marime: 22, align: "right", culoare: CERNEALA });
    }

    return function (ctx, t) {
      const s = t % T.per;
      ctx.globalAlpha = estompare(s, T.per);
      const baza = ctx.globalAlpha;
      const x = alungire(s);
      const yEnd = YC + x;

      // suportul
      ctx.fillStyle = "#9aa1ab";
      ctx.fillRect(XS - 110, YSUS - 16, 300, 16);
      // scara dinamometrului (în newtoni)
      const xs = XS + 58;
      F.rotunjit(ctx, xs, YC - 22, 60, 3 * DL + 44, 6);
      ctx.fillStyle = "#f1f3f5";
      ctx.fill();
      ctx.strokeStyle = "#c3c8cf";
      ctx.lineWidth = 2;
      ctx.stroke();
      for (let k = 0; k <= 6; k++) {
        const y = YC + (k * DL) / 2;
        ctx.strokeStyle = GRI;
        ctx.lineWidth = k % 2 ? 1.5 : 2.5;
        ctx.beginPath(); ctx.moveTo(xs, y); ctx.lineTo(xs + (k % 2 ? 12 : 20), y); ctx.stroke();
        if (k % 2 === 0) F.scrie(ctx, [[String(k / 2)]], xs + 40, y + 7, { marime: 19, greutate: 700, align: "center", culoare: CERNEALA });
      }
      F.scrie(ctx, [["N"]], xs + 30, YC - 30, { marime: 19, greutate: 800, align: "center", culoare: GRI });

      resort(ctx, yEnd);
      // indicatorul
      ctx.fillStyle = VITEZA;
      ctx.beginPath(); ctx.moveTo(xs - 2, yEnd); ctx.lineTo(xs - 16, yEnd - 7); ctx.lineTo(xs - 16, yEnd + 7); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = VITEZA;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(XS, yEnd); ctx.lineTo(xs - 14, yEnd); ctx.stroke();

      // corpurile (vin din dreapta și se agață)
      const vine = function (t0, t1) { return 1 - neted((s - t0) / (t1 - t0 - 0.15)); };
      let n = 0;
      if (s > T.v1) {
        const d = s < T.s1 ? vine(T.v1, T.s1) : 0;
        ctx.globalAlpha = baza * F.limita((s - T.v1) / 0.5);
        corp(ctx, XS, yEnd + d * 40);
        ctx.globalAlpha = baza;
        if (s >= T.s1) n = 1;
      }
      if (s > T.v2) {
        const d = s < T.s2 ? vine(T.v2, T.s2) : 0;
        ctx.globalAlpha = baza * F.limita((s - T.v2) / 0.5);
        corp(ctx, XS, yEnd + CR + HB + d * 40);
        ctx.globalAlpha = baza;
        if (s >= T.s2) n = 2;
      }

      // lungimile
      acolada(ctx, XS - 70, YSUS, YC, [["l", "i"], ["0", "sub"]]);
      if (x > 6) acolada(ctx, XS - 70, YC, yEnd, n === 2 && s > T.s2 + 2.2 ? [["2Δ"], ["l", "i"]] : [["Δ"], ["l", "i"]]);

      // forțele, cu punct comun de aplicație
      const fe = x / DL;   // forța elastică, în N
      if (n > 0) {
        const yc = yEnd + CR + (n * (HB + CR) - CR) / 2;
        F.sageata(ctx, XS, yc, XS, yc - fe * NPX, { culoare: FORTA, grosime: 5, cap: 14 });
        F.sageata(ctx, XS, yc, XS, yc + n * NPX, { culoare: GREUTATE, grosime: 5, cap: 14 });
        ctx.fillStyle = CERNEALA;
        ctx.beginPath(); ctx.arc(XS, yc, 4.5, 0, 2 * PI); ctx.fill();
        F.scrie(ctx, [["F", "v"]], XS - 30, yc - fe * NPX + 22, { marime: 24, greutate: 700, align: "center", culoare: FORTA });
        F.scrie(ctx, [["G", "v"]], XS - 30, yc + n * NPX - 4, { marime: 24, greutate: 700, align: "center", culoare: GREUTATE });
      }

      // explicațiile
      const xt = 344;
      let fazaTxt, liniste = false;
      if (s < T.v1) fazaTxt = ["a) resortul nedeformat:", "lungimea l₀"];
      else if (s < T.v2) { fazaTxt = ["b) suspendăm un corp:", "resortul se alungește"]; liniste = s > T.s1 + 2.3; }
      else { fazaTxt = ["c) încă un corp:", "alungirea se dublează"]; liniste = s < T.s2 || s > T.s2 + 2.4; }
      F.scrie(ctx, [[fazaTxt[0]]], xt, 112, { marime: 19, greutate: 800, culoare: CERNEALA });
      F.scrie(ctx, [[fazaTxt[1]]], xt, 138, { marime: 19, greutate: 600, culoare: GRI });
      F.scrie(ctx, [["dinamometrul:"]], xt, 196, { marime: 18, greutate: 600, culoare: GRI });
      F.scrie(ctx, [["F", "i"], [" = " + F.numar(Math.max(0, fe), 1) + " N"]], xt, 228, { marime: 26, greutate: 800, culoare: FORTA });
      if (n > 0) F.scrie(ctx, [["G", "i"], [" = " + n + " N"]], xt, 262, { marime: 26, greutate: 800, culoare: GREUTATE });
      if (liniste) {
        ctx.globalAlpha = baza * F.limita((s - (n === 1 ? T.s1 + 2.3 : T.s2 + 2.4)) / 0.4);
        F.scrie(ctx, [["corpul este în repaus:"]], xt, 318, { marime: 18, greutate: 600, culoare: GRI });
        pastila(ctx, [["F", "v"], [" + "], ["G", "v"], [" = 0"]], xt, 356, { marime: 22, fond: TEAL, stanga: true });
        F.scrie(ctx, [["module egale,"]], xt, 406, { marime: 18, greutate: 600, culoare: CERNEALA });
        F.scrie(ctx, [["aceeași dreaptă-suport,"]], xt, 430, { marime: 18, greutate: 600, culoare: CERNEALA });
        F.scrie(ctx, [["sensuri opuse"]], xt, 454, { marime: 18, greutate: 600, culoare: CERNEALA });
        ctx.globalAlpha = baza;
      } else if (n > 0) {
        F.scrie(ctx, [["oscilează: "], ["F", "i"], [" ≠ "], ["G", "i"]], xt, 318, { marime: 18, greutate: 600, culoare: GRI });
      }
      ctx.globalAlpha = 1;
    };
  });

  // =====================================================================
  //  5. Căruciorul, firul și scripetele: a ~ F, a ~ 1/m (fig. 2.8)
  // =====================================================================
  Deck.animatie($("a-scripete"), function (a) {
    const TY = 286, L = 128, GAP = 8, S = 236, XF0 = 300;
    const PX = 642, PR = 17;
    const HOOK = TY - 44;              // înălțimea firului
    const PY = HOOK + PR;
    const BS = 30;                     // corpurile
    const T1 = 2.3;
    const RUL = [
      { lit: "a)", pe: 2, atarna: 1, carute: 1, a: 1, t: T1, eticheta: [["a", "i"], ["1", "sub"]],
        txt: "un corp suspendat: forța G", rez: [["F", "i"], [" = "], ["G", "i"], [", "], ["m", "i"]] },
      { lit: "b)", pe: 1, atarna: 2, carute: 1, a: 2, t: T1 / Math.SQRT2, eticheta: [["2"], ["a", "i"], ["1", "sub"]],
        txt: "mutăm un corp: forța 2G, aceeași masă", rez: [["F", "i"], [" = 2"], ["G", "i"], [", "], ["m", "i"]] },
      { lit: "c)", pe: 2, atarna: 1, carute: 2, a: 0.5, t: T1 * Math.SQRT2, eticheta: [["a", "i"], ["1", "sub"], [" / 2"]],
        txt: "un cărucior identic: masa 2m", rez: [["F", "i"], [" = "], ["G", "i"], [", 2"], ["m", "i"]] },
    ];
    const PRE = 0.9, POST = 1.3;
    let acc = 0;
    RUL.forEach(function (r) { r.inceput = acc; r.per = PRE + r.t + POST; acc += r.per; });
    const FINAL = 3.2, PER = acc + FINAL;

    function scena(ctx, r, d, v, arata) {
      // masa
      ctx.fillStyle = "#c8a67a";
      ctx.fillRect(14, TY, PX - 10, 14);
      ctx.fillStyle = "#b08e62";
      ctx.fillRect(30, TY + 14, 12, 330);
      ctx.fillRect(PX - 40, TY + 14, 12, 330);
      // scripetele
      ctx.strokeStyle = "#7d8591";
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(PX - 22, TY + 4); ctx.lineTo(PX, PY); ctx.stroke();
      ctx.fillStyle = "#aeb4bd";
      ctx.beginPath(); ctx.arc(PX, PY, PR, 0, 2 * PI); ctx.fill();
      ctx.strokeStyle = "#7d8591";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(PX + Math.cos(d / PR) * PR, PY + Math.sin(d / PR) * PR); ctx.lineTo(PX - Math.cos(d / PR) * PR, PY - Math.sin(d / PR) * PR);
      ctx.stroke();
      ctx.fillStyle = "#5f6573";
      ctx.beginPath(); ctx.arc(PX, PY, 4, 0, 2 * PI); ctx.fill();

      // cărucioarele (frontul la XF0 + d)
      const xf = XF0 + d;
      let sus = 0;
      for (let k = 0; k < r.carute; k++) {
        const x = xf - L - k * (L + GAP);
        sus = carut(ctx, x, TY, L, x / 13, { R: 13, H: 30 });
        const nb = k === 0 ? r.pe : 2;
        for (let b = 0; b < nb; b++) bloc(ctx, x + 18 + b * (BS + 6), sus - BS, BS);
        if (k > 0) { ctx.fillStyle = "#3d4452"; ctx.fillRect(x + L - 2, TY - 46, GAP + 4, 6); }
      }
      // firul
      const yh = TY + 18 + d;     // vârful corpurilor suspendate
      ctx.strokeStyle = "#8a6d3b";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(xf, HOOK); ctx.lineTo(PX, HOOK);
      ctx.arc(PX, PY, PR, -PI / 2, 0);
      ctx.lineTo(PX + PR, yh);
      ctx.stroke();
      for (let b = 0; b < r.atarna; b++) bloc(ctx, PX + PR - BS / 2, yh + b * (BS + 2), BS);
      // forța de greutate a corpurilor suspendate
      const ygc = yh + (r.atarna * (BS + 2)) / 2;
      if (arata) {
        F.sageata(ctx, PX + PR + 24, ygc, PX + PR + 24, ygc + 26 + r.atarna * 22, { culoare: GREUTATE, grosime: 4, cap: 11 });
        F.scrie(ctx, [[r.atarna === 2 ? "2" : ""], ["G", "i"]], PX + PR + 2 - 4, ygc + 50 + r.atarna * 22, { marime: 19, greutate: 800, align: "center", culoare: GREUTATE });
      }
      // accelerația
      if (v > 0) {
        const la = 34 + r.a * 46;
        F.sageata(ctx, xf - L / 2 - la / 2, sus - 58, xf - L / 2 + la / 2, sus - 58, { culoare: ACCEL, grosime: 5, cap: 14 });
        F.scrie(ctx, [["a", "v"]], xf - L / 2, sus - 72, { marime: 22, align: "center", culoare: ACCEL });
      }
    }

    return function (ctx, t) {
      const s = t % PER;
      const final = s >= acc;
      let ri = RUL.length - 1;
      for (let i = 0; i < RUL.length; i++) if (s >= RUL[i].inceput && s < RUL[i].inceput + RUL[i].per) ri = i;
      const r = RUL[ri];
      const u = final ? r.per : s - r.inceput;
      const tt = F.limita(u - PRE, 0, r.t);
      const ac = (2 * S) / (r.t * r.t);
      const d = (ac * tt * tt) / 2;
      const v = u > PRE && u < PRE + r.t ? 1 : 0;

      let vis = final ? 1 : estompare(u, r.per, 0.3);
      if (final) vis = F.limita((PER - s) / 0.4);
      ctx.globalAlpha = vis;
      scena(ctx, r, d, v, true);
      // reperele: start și sosire
      punctat(ctx, XF0, TY - 4, XF0, 112, "rgba(95,101,115,0.7)");
      punctat(ctx, XF0 + S, TY - 4, XF0 + S, 112, "rgba(95,101,115,0.7)");
      F.sageata(ctx, XF0 + 4, 124, XF0 + S - 4, 124, { culoare: GRI, grosime: 2, cap: 9 });
      F.sageata(ctx, XF0 + S - 4, 124, XF0 + 4, 124, { culoare: GRI, grosime: 2, cap: 9 });
      F.scrie(ctx, [["s", "i"]], XF0 + S / 2, 116, { marime: 20, align: "center", culoare: GRI });
      F.scrie(ctx, [[r.lit + " " + r.txt]], 20, 36, { marime: 21, greutate: 800, culoare: CERNEALA });
      ctx.globalAlpha = final ? vis : 1;

      // tabelul rezultatelor (sub masă)
      const y0 = 370, xb = 300;
      F.scrie(ctx, [["accelerația"]], xb, y0 - 20, { marime: 17, greutate: 700, culoare: GRI });
      RUL.forEach(function (q, i) {
        const y = y0 + i * 52;
        const gata = final || i < ri || (i === ri && u > PRE + q.t);
        const activ = i === ri && !final;
        ctx.globalAlpha *= activ || gata ? 1 : 0.4;
        F.scrie(ctx, [[q.lit + " "]].concat(q.rez), 64, y + 8, { marime: 20, greutate: 700, culoare: CERNEALA });
        if (gata) {
          const cr = i === ri && !final ? F.limita((u - PRE - q.t) / 0.5) : 1;
          F.rotunjit(ctx, xb, y - 12, 92 * q.a * neted(cr), 24, 5);
          ctx.fillStyle = ACCEL;
          ctx.fill();
          F.scrie(ctx, q.eticheta, xb + 92 * q.a + 12, y + 8, { marime: 20, greutate: 700, culoare: ACCEL_INCHIS });
        }
        ctx.globalAlpha = final ? vis : 1;
      });
      // concluziile
      const conc = function (cond, parti, y) {
        if (!cond) return;
        pastila(ctx, parti, 64, y, { marime: 20, fond: TEAL, stanga: true });
      };
      conc(final || ri > 1 || (ri === 1 && u > PRE + RUL[1].t + 0.3),
        [["a", "i"], [" ~ "], ["F", "i"], ["  ("], ["m", "i"], [" = const.)"]], 538);
      conc(final || (ri === 2 && u > PRE + RUL[2].t + 0.3),
        [["a", "i"], [" ~ 1/"], ["m", "i"], ["  ("], ["F", "i"], [" = const.)"]], 590);
      if (final) {
        ctx.globalAlpha = vis * F.limita((s - acc) / 0.4);
        pastila(ctx, [["m", "i"], ["a", "v"], [" = "], ["F", "v"]], 440, 564, { marime: 30, pad: 22, fond: ACCEL_INCHIS });
      }
      ctx.globalAlpha = 1;
    };
  });

  // =====================================================================
  //  6. Rezultanta forțelor: m a⃗ = F⃗1 + F⃗2 + F⃗3; forțe compensate → v⃗ = const.
  // =====================================================================
  Deck.animatie($("a-rezultanta"), function (a) {
    const CAZ = [
      { O: [165, 300], F: [[212, -75], [25, 188], [-88, -62]], nume: "1) forțe necompensate" },
      { O: [110, 310], F: [[186, 0], [-93, 155], [-93, -155]], nume: "2) forțe compensate", v: 26 },
    ];
    const DUR = 8.6, PER = 2 * DUR;
    const ACC = 26;
    const CULORI = ["#2f7fd6", "#1aa0b8", "#5a63d8"];

    function vector(ctx, x, y, dx, dy, cul, gros) {
      if (Math.hypot(dx, dy) < 3) return;
      F.sageata(ctx, x, y, x + dx, y + dy, { culoare: cul, grosime: gros || 5, cap: 15 });
    }

    return function (ctx, t) {
      const s = t % PER;
      const ci = s < DUR ? 0 : 1;
      const u = s - ci * DUR;
      const c = CAZ[ci];
      ctx.globalAlpha = estompare(u, DUR);
      const baza = ctx.globalAlpha;

      // poziția corpului
      let ox = c.O[0], oy = c.O[1];
      const R = c.F.reduce(function (q, f) { return [q[0] + f[0], q[1] + f[1]]; }, [0, 0]);
      const mR = Math.hypot(R[0], R[1]);
      if (ci === 0 && u > 5) {
        const d = (ACC * (u - 5) * (u - 5)) / 2;
        ox += (R[0] / mR) * d; oy += (R[1] / mR) * d;
      }
      if (ci === 1) ox += c.v * u;

      // urmele corpului la intervale egale de timp
      if (ci === 1) {
        for (let k = 1; k <= 4; k++) {
          const xk = ox - k * c.v * 1.2;
          if (xk < c.O[0] - 1) break;
          ctx.globalAlpha = baza * 0.14;
          ctx.fillStyle = "#7d8591";
          ctx.beginPath(); ctx.arc(xk, oy, 26, 0, 2 * PI); ctx.fill();
        }
        ctx.globalAlpha = baza;
      } else if (u > 5) {
        for (let k = 1; k <= 4; k++) {
          const uk = u - 5 - k * 0.6;
          if (uk < 0) break;
          const d = (ACC * uk * uk) / 2;
          ctx.globalAlpha = baza * 0.14;
          ctx.fillStyle = "#7d8591";
          ctx.beginPath(); ctx.arc(c.O[0] + (R[0] / mR) * d, c.O[1] + (R[1] / mR) * d, 26, 0, 2 * PI); ctx.fill();
        }
        ctx.globalAlpha = baza;
      }

      // corpul
      const g = ctx.createRadialGradient(ox - 8, oy - 10, 3, ox, oy, 28);
      g.addColorStop(0, "#e8ebef"); g.addColorStop(1, "#8b93a0");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(ox, oy, 26, 0, 2 * PI); ctx.fill();
      F.scrie(ctx, [["m", "i"]], ox - 12, oy + 20, { marime: 18, greutate: 700, align: "center", culoare: CERNEALA });

      // forțele de la corp
      const cr = neted(u / 0.8);
      const copie = u > 1.2;
      const rez = neted((u - 3.4) / 0.7);
      const eticheta = function (i, x, y, al) {
        ctx.globalAlpha = baza * al;
        F.scrie(ctx, [["F", "v"], [String(i + 1), "sub"]], x, y + 8, { marime: 22, greutate: 700, align: "center", culoare: CULORI[i] });
        ctx.globalAlpha = baza;
      };
      c.F.forEach(function (f, i) {
        const vechi = copie ? (i === 0 ? 0 : 0.45 * (1 - rez)) : 1;
        if (vechi <= 0.01) return;
        ctx.globalAlpha = baza * vechi;
        vector(ctx, ox, oy, f[0] * cr, f[1] * cr, CULORI[i]);
        ctx.globalAlpha = baza;
        if (cr > 0.9) {
          const m = Math.hypot(f[0], f[1]);
          eticheta(i, ox + f[0] + (f[0] / m) * 22, oy + f[1] + (f[1] / m) * 22, copie ? vechi : 1);
        }
      });
      // regula poligonului: vectorii se pun cap la coadă
      if (copie) {
        let px = ox, py = oy;
        c.F.forEach(function (f, i) {
          const intra = i === 0 ? 1 : neted((u - 1.2 - (i - 1) * 1.0) / 0.9);
          if (intra <= 0) return;
          const sx = ox + (px - ox) * intra, sy = oy + (py - oy) * intra;
          vector(ctx, sx, sy, f[0], f[1], CULORI[i], 4.5);
          if (i === 0 || intra >= 1) {
            const m = Math.hypot(f[0], f[1]);
            const al = i === 0 ? 1 : F.limita((u - 1.2 - (i - 1) * 1.0 - 0.9) / 0.4);
            eticheta(i, sx + f[0] / 2 + (f[1] / m) * 22, sy + f[1] / 2 - (f[0] / m) * 22, al);
          }
          px += f[0]; py += f[1];
        });
      }
      ctx.fillStyle = CERNEALA;
      ctx.beginPath(); ctx.arc(ox, oy, 5, 0, 2 * PI); ctx.fill();

      if (ci === 0) {
        if (rez > 0) {
          vector(ctx, ox, oy, R[0] * rez, R[1] * rez, REZULTANTA, 7);
          F.scrie(ctx, [["F", "v"]], ox + R[0] * 0.62 + (R[1] / mR) * 20, oy + R[1] * 0.62 - (R[0] / mR) * 20 + 6, { marime: 26, greutate: 800, align: "center", culoare: REZULTANTA });
        }
        const ap = neted((u - 4.3) / 0.6);
        if (ap > 0) {
          const k = 0.6 * ap, nx = -R[1] / mR, ny = R[0] / mR;   // deplasat perpendicular, sub F⃗
          ctx.globalAlpha = baza * ap;
          vector(ctx, ox + nx * 34, oy + ny * 34, R[0] * k, R[1] * k, ACCEL, 5);
          F.scrie(ctx, [["a", "v"]], ox + nx * 58 + R[0] * k * 0.5, oy + ny * 58 + R[1] * k * 0.5 + 8, { marime: 24, greutate: 700, align: "center", culoare: ACCEL });
          ctx.globalAlpha = baza;
        }
      } else {
        // viteza constantă
        F.sageata(ctx, ox - 30, oy - 48, ox + 40, oy - 48, { culoare: VITEZA, grosime: 5, cap: 14 });
        F.scrie(ctx, [["v", "v"]], ox + 5, oy - 62, { marime: 22, greutate: 700, align: "center", culoare: VITEZA });
      }

      // textele
      if (ci === 0) {
        F.scrie(ctx, [["m", "i"], ["a", "v"], [" = "], ["F", "v"], ["1", "sub"], [" + "], ["F", "v"], ["2", "sub"], [" + "], ["F", "v"], ["3", "sub"], [" = "], ["F", "v"]],
          a.w / 2, 50, { marime: 30, greutate: 800, align: "center", culoare: CERNEALA });
        F.scrie(ctx, [[u < 3.4 ? "construim rezultanta: vectorii cap la coadă" : "accelerația are direcția și sensul rezultantei"]],
          a.w / 2, 92, { marime: 19, greutate: 700, align: "center", culoare: GRI });
      } else {
        F.scrie(ctx, [["F", "v"], ["1", "sub"], [" + "], ["F", "v"], ["2", "sub"], [" + "], ["F", "v"], ["3", "sub"], [" = 0"]],
          a.w / 2, 50, { marime: 30, greutate: 800, align: "center", culoare: CERNEALA });
        F.scrie(ctx, [[u < 3.4 ? "vectorii cap la coadă formează un poligon închis" : "rezultanta este nulă: corpul se mișcă uniform"]],
          a.w / 2, 92, { marime: 19, greutate: 700, align: "center", culoare: GRI });
        if (rez > 0) {
          ctx.globalAlpha = baza * rez;
          pastila(ctx, [["F", "v"], [" = 0  ⇒  "], ["a", "v"], [" = 0  ⇒  "], ["v", "v"], [" = const."]], a.w / 2, 530,
            { marime: 22, pad: 20, fond: TEAL });
          ctx.globalAlpha = baza;
        }
      }
      CAZ.forEach(function (q, i) {
        ctx.globalAlpha = baza * (i === ci ? 1 : 0.45);
        pastila(ctx, [[q.nume]], a.w / 2 + (i ? 130 : -130), 594,
          { marime: 18, fond: i === ci ? TEAL : "#e4e7eb", culoare: i === ci ? "#fff" : CERNEALA });
      });
      ctx.globalAlpha = 1;
    };
  });
})();
