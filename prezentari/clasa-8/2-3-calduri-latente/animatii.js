/* Animațiile pentru tema 2.3 „Călduri latente”. */
(function () {
  "use strict";

  const F = window.Fizica;
  const $ = function (id) { return document.getElementById(id); };
  const font = function (g, m) { return g + " " + m + "px " + F.SANS; };
  const CERNEALA = "#1f2430";
  const GRI = "#5f6573";
  const PORTOCALIU = "#c95a1c";
  const LINIE = "#e6ddd0";
  const ALBASTRU = "#2a74d6";
  const MOV = "#8a4fc0";
  const ROSU = "#d9452b";
  const CALDURA = "#e0702f";

  // Ilustrativ: viteza particulelor crește cu temperatura (în °C, scara 0…100).
  const viteza = function (t) { return 0.15 + 0.85 * F.limita(t / 100); };
  const culoare = function (t, alfa) { return F.culoareTemp(t / 100, alfa); };
  // estompare scurtă la capătul fiecărei bucle, ca reluarea să se vadă clar
  const estompare = function (s, per) { return F.limita(Math.min(s / 0.4, (per - s) / 0.4)); };
  const neted = function (x) { x = F.limita(x); return x * x * (3 - 2 * x); };

  // =====================================================================
  //  Piese de laborator: pahar, trepied, spirtieră
  // =====================================================================

  function contur(ctx, x, sus, w, jos, r) {
    ctx.beginPath();
    ctx.moveTo(x, sus);
    ctx.lineTo(x, jos - r);
    ctx.arcTo(x, jos, x + r, jos, r);
    ctx.lineTo(x + w - r, jos);
    ctx.arcTo(x + w, jos, x + w, jos - r, r);
    ctx.lineTo(x + w, sus);
  }

  function pahar(ctx, x, sus, w, jos, r) {
    contur(ctx, x, sus, w, jos, r);
    ctx.strokeStyle = "#8d96a3";
    ctx.lineWidth = 3.5;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 7, sus - 4); ctx.lineTo(x, sus + 4);
    ctx.moveTo(x + w + 7, sus - 4); ctx.lineTo(x + w, sus + 4);
    ctx.stroke();
  }

  // spirtiera stă pe masă (yMasa); k = mărimea; flacara = 0 (stinsă) … 1 (aprinsă)
  function spirtiera(ctx, cx, yMasa, k, t, flacara) {
    ctx.fillStyle = "rgba(120,170,220,0.35)";
    F.rotunjit(ctx, cx - 40 * k, yMasa - 38 * k, 80 * k, 38 * k, 12 * k);
    ctx.fill();
    ctx.strokeStyle = "#8f97a3";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = "#b7bec8";
    ctx.fillRect(cx - 12 * k, yMasa - 50 * k, 24 * k, 13 * k);
    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(cx - 3 * k, yMasa - 58 * k, 6 * k, 9 * k);
    if (flacara < 0.02) return;
    const baza = yMasa - 58 * k;
    const h = (27 + 3 * Math.sin(t * 13) + 2 * Math.sin(t * 7.3)) * k * flacara;
    const vx = cx + 3 * k * Math.sin(t * 5.1);
    const gr = ctx.createLinearGradient(0, baza, 0, baza - h);
    gr.addColorStop(0, "#ffb02e");
    gr.addColorStop(1, "rgba(255,90,30,0.85)");
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(cx - 10 * k, baza);
    ctx.quadraticCurveTo(cx - 13 * k, baza - 22 * k * flacara, vx, baza - h);
    ctx.quadraticCurveTo(cx + 13 * k, baza - 22 * k * flacara, cx + 10 * k, baza);
    ctx.quadraticCurveTo(cx, baza + 6 * k, cx - 10 * k, baza);
    ctx.fill();
    ctx.fillStyle = "rgba(70,130,255,0.75)";
    ctx.beginPath();
    ctx.ellipse(cx, baza - 5 * k, 4 * k, 7 * k * flacara, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Q ⇑ : căldura care urcă de la flacără spre vas
  function sageataQ(ctx, x, yJos, ySus, alfa, marime) {
    if (alfa < 0.02) return;
    const a0 = ctx.globalAlpha;
    ctx.globalAlpha = a0 * alfa;
    F.sageata(ctx, x, yJos, x, ySus, { culoare: CALDURA, grosime: 4, cap: 14 });
    F.scrie(ctx, [["Q", "i"]], x + 6, (yJos + ySus) / 2 + 8, { marime: marime, culoare: CALDURA });
    ctx.globalAlpha = a0;
  }

  function trepied(ctx, cx, placa, yMasa, lp) {
    ctx.strokeStyle = "#8a919c";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - lp / 2 + 10, placa + 4); ctx.lineTo(cx - lp / 2 - 8, yMasa);
    ctx.moveTo(cx + lp / 2 - 10, placa + 4); ctx.lineTo(cx + lp / 2 + 8, yMasa);
    ctx.stroke();
    ctx.fillStyle = "#9aa1ab";
    ctx.fillRect(cx - lp / 2, placa, lp, 6);
  }

  function masa(ctx, x1, x2, y) {
    ctx.fillStyle = LINIE;
    ctx.fillRect(x1, y, x2 - x1, 6);
  }

  // etichetă rotunjită („pastilă”) centrată în (x, y)
  function pastila(ctx, parti, x, y, o) {
    o = o || {};
    const m = o.marime || 22;
    ctx.font = font(700, m);
    const lat = F.scrie(ctx, parti, -9999, -9999, { marime: m }) + 2 * (o.pad || 16);
    const h = m * 1.75;
    if (o.stanga) x += lat / 2;
    F.rotunjit(ctx, x - lat / 2, y - h / 2, lat, h, h / 2);
    ctx.fillStyle = o.fond || PORTOCALIU;
    ctx.fill();
    F.scrie(ctx, parti, x, y + m * 0.36, { marime: m, greutate: 700, align: "center", culoare: o.culoare || "#ffffff" });
  }

  function punctat(ctx, x1, y1, x2, y2, c) {
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.restore();
  }

  function punct(ctx, x, y, c, r) {
    ctx.beginPath();
    ctx.arc(x, y, r || 7, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
  }

  // etichetă cu o linie de legătură spre un punct al desenului
  function eticheta(ctx, text, xt, yt, xp, yp, o) {
    o = o || {};
    ctx.strokeStyle = "#8a919c";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(o.xl === undefined ? xt : o.xl, yt + 6); ctx.lineTo(xp, yp); ctx.stroke();
    punct(ctx, xp, yp, "#8a919c", 3);
    F.scrie(ctx, [[text]], xt, yt, { marime: o.marime || 18, greutate: 700, align: o.align || "center", culoare: o.culoare || GRI });
  }

  // un cub de gheață
  function cub(ctx, x, y, s, rot) {
    if (s < 1) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    F.rotunjit(ctx, -s / 2, -s / 2, s, s, s * 0.22);
    ctx.fillStyle = "rgba(218,238,252,0.95)";
    ctx.fill();
    ctx.strokeStyle = "rgba(110,160,210,0.95)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.26, s * 0.12); ctx.lineTo(-s * 0.26, -s * 0.26); ctx.lineTo(s * 0.12, -s * 0.26);
    ctx.stroke();
    ctx.restore();
  }

  // =====================================================================
  //  Vasul cu gheață într-o baie de apă (fig. 1), în coordonate proprii
  // =====================================================================
  const B = { cx: 150, xb: 35, wb: 230, josB: 300, susB: 140, apaB: 168, xi: 85, wi: 130, josI: 288, susI: 112, NIV: 56 };
  B.masa = B.josB + 10 + 92;
  B.xt = B.xi + B.wi - 21;
  // x, y, rotire, ordinea topirii
  const LC = 30; // latura cubului
  const CUBURI = [
    [104, 269, 0.06, 6], [135, 268, -0.05, 8], [166, 269, 0.1, 7],
    [110, 239, -0.14, 3], [141, 238, 0.09, 5], [170, 240, -0.07, 4],
    [122, 209, 0.18, 1], [153, 208, -0.12, 2],
    [137, 179, 0.1, 0],
  ];

  function Baie() {
    this.P = new F.Particule({
      x: B.xi + 4, y: B.josI - 3 - B.NIV, w: B.xt - 12 - B.xi - 4, h: B.NIV, n: 9, r: 6, viteza: 120,
    });
  }

  Baie.prototype.pas = function (dt, tc) { this.P.pas(dt, viteza(Math.max(tc, 0))); };

  // tc = temperatura din vas; g = partea de gheață topită (0…1); fl = flacăra
  Baie.prototype.deseneaza = function (ctx, t, tc, g, fl) {
    spirtiera(ctx, B.cx, B.masa, 1, t, fl);
    sageataQ(ctx, B.cx + 81, B.masa - 12, B.josB + 18, fl, 24);
    trepied(ctx, B.cx, B.josB + 4, B.masa, B.wb + 50);

    // apa din baie (mai caldă decât vasul din ea)
    const tb = F.limita(Math.max(tc, 0) + 22, 20, 100);
    contur(ctx, B.xb + 3, B.apaB, B.wb - 6, B.josB - 3, 14);
    ctx.closePath();
    ctx.fillStyle = culoare(tb, 0.2);
    ctx.fill();

    // vasul interior: se vede doar conținutul lui
    contur(ctx, B.xi, B.susI, B.wi, B.josI, 12);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fill();

    const niv = B.NIV * g;
    const ys = B.josI - 3 - niv;
    if (niv > 0.5) {
      ctx.save();
      contur(ctx, B.xi + 3, B.susI, B.wi - 6, B.josI - 3, 10);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = culoare(Math.max(tc, 0), 0.28);
      ctx.fillRect(B.xi, ys, B.wi, niv + 6);
      ctx.beginPath();
      ctx.rect(B.xi, ys, B.wi, niv + 6);
      ctx.clip();
      ctx.globalAlpha *= F.limita(g * 3);
      this.P.deseneaza(ctx, culoare(Math.max(tc, 0)));
      ctx.restore();
    }

    CUBURI.forEach(function (c, i) {
      const f = F.limita((g - c[3] * 0.06) / 0.52);
      if (f >= 1) return;
      const s = LC * Math.pow(1 - f, 0.75);
      const pluteste = Math.min(B.josI - 3 - s / 2, ys + s * 0.35);
      const y = c[1] + (pluteste - c[1]) * neted(g * 1.6);
      const x = c[0] + Math.sin(t * 1.4 + i * 2) * 1.5 * F.limita(g * 3);
      cub(ctx, x, y, s, c[2] + Math.sin(t + i) * 0.05 * g);
    });

    F.termometru(ctx, B.xt, B.susI - 58, B.josI - B.susI + 50, (tc + 30) / 130, { latime: 14, gradatii: false });
    pahar(ctx, B.xi, B.susI, B.wi, B.josI, 12);
    pahar(ctx, B.xb, B.susB, B.wb, B.josB, 16);
  };

  // =====================================================================
  //  1. Titlu: gheața se topește în baia de apă
  // =====================================================================
  Deck.animatie($("a-titlu"), function () {
    const V = new Baie();
    const PER = 10.5;
    return function (ctx, t, dt) {
      const s = t % PER;
      const g = F.limita((s - 1.6) / 5);
      const tc = s < 1.6 ? -12 + 12 * F.limita((s - 0.4) / 1.2) : 30 * F.limita((s - 6.6) / 3);
      ctx.globalAlpha = estompare(s, PER);
      V.pas(dt, tc);
      ctx.save();
      ctx.translate(78, -26);
      ctx.scale(1.35, 1.35);
      masa(ctx, -20, 320, B.masa);
      V.deseneaza(ctx, t, tc, g, F.limita((s - 0.2) / 0.4));
      ctx.restore();
      ctx.globalAlpha = 1;
    };
  });

  // =====================================================================
  //  2. Experimentul nr. 1: gheața → apă, cu graficul t(τ) ca în fig. 2
  // =====================================================================
  Deck.animatie($("a-exp1"), function (a) {
    const V = new Baie();
    const TA = -20, TD = 85;
    // graficul e schematic, ca în manual: lățimile segmentelor AB, BC, CD
    const X0 = 352, Y0 = 268, LAT = [76, 86, 156];
    const TOT = 14;
    const T1 = (TOT * LAT[0]) / 318, T2 = (TOT * LAT[1]) / 318, T3 = TOT - T1 - T2;
    const START = 0.8;
    const PER = START + TOT + 3.8;
    const X = function (tau) {
      if (tau <= T1) return X0 + (LAT[0] * tau) / T1;
      if (tau <= T1 + T2) return X0 + LAT[0] + (LAT[1] * (tau - T1)) / T2;
      return X0 + LAT[0] + LAT[1] + (LAT[2] * (tau - T1 - T2)) / T3;
    };
    const Y = function (c) { return c < 0 ? Y0 - (c / 20) * 72 : Y0 - (c / TD) * 150; };
    const XE = X0 + LAT[0] + LAT[1] + LAT[2];
    const FAZE = [
      { a: 0, b: T1, q: "1", stare: ["solid"], proces: ["încălzirea", "gheții"], c: ALBASTRU, fond: "rgba(42,116,214,0.08)",
        expl: ["a încălzi gheața până la", "temperatura de topire"] },
      { a: T1, b: T1 + T2, q: "2", stare: ["solid +", "lichid"], proces: ["topirea", "gheții"], c: MOV, fond: "rgba(138,79,192,0.09)",
        expl: ["a topi gheața", "(temperatura nu se schimbă)"] },
      { a: T1 + T2, b: TOT, q: "3", stare: ["lichid"], proces: ["încălzirea", "apei"], c: ROSU, fond: "rgba(217,69,43,0.07)",
        expl: ["a încălzi apa obținută", "la topirea gheții"] },
    ];

    function stare(tau) {
      if (tau < T1) return { tc: TA - (TA * tau) / T1, g: 0, f: 0 };
      if (tau < T1 + T2) return { tc: 0, g: (tau - T1) / T2, f: 1 };
      return { tc: (TD * (tau - T1 - T2)) / T3, g: 1, f: 2 };
    }

    function titlu(ctx, text, x, y) {
      F.scrie(ctx, [[text]], x, y, { marime: 17, greutate: 800, align: "center", culoare: CERNEALA });
      ctx.font = font(800, 17);
      const w = ctx.measureText(text).width;
      ctx.fillStyle = CERNEALA;
      ctx.fillRect(x - w / 2, y + 4, w, 1.5);
    }

    return function (ctx, t, dt) {
      const s = t % PER;
      const tau = F.limita(s - START, 0, TOT);
      const st = stare(tau);
      const fl = F.limita((s - 0.3) / 0.4) * F.limita((START + TOT + 0.3 - s) / 0.3);
      const gata = s > START + TOT;
      ctx.globalAlpha = estompare(s, PER);
      const baza = ctx.globalAlpha;

      // ---- aparatul (fig. 1)
      V.pas(dt, st.tc);
      ctx.save();
      ctx.translate(8, 22);
      masa(ctx, -8, 320, B.masa);
      V.deseneaza(ctx, t, st.tc, st.g, fl);
      ctx.globalAlpha = baza * (1 - neted((st.g - 0.75) / 0.2));
      eticheta(ctx, "gheață", 34, 86, 120, 206, { xl: 56 });
      ctx.globalAlpha = baza * neted((st.g - 0.75) / 0.2);
      eticheta(ctx, "apă", 44, 86, 112, 262, { xl: 56 });
      ctx.globalAlpha = baza;
      eticheta(ctx, "baie de apă", 262, 92, 252, 226);
      ctx.restore();

      // citirea termometrului și ce se întâmplă
      F.scrie(ctx, [["t", "i"], [" = " + F.numar(st.tc) + " °C"]], 158, B.masa + 76,
        { marime: 34, greutate: 800, align: "center", culoare: st.tc < 0 ? ALBASTRU : culoare(st.tc) });
      if (tau > 0.05 && !gata) {
        const nota = st.f === 0 ? "gheața se încălzește"
          : st.f === 1 ? (st.g < 0.22 ? "apar primele picături de apă" : "gheața se topește")
          : "apa se încălzește";
        pastila(ctx, [[nota]], 158, B.masa + 124, { marime: 19, pad: 16, fond: FAZE[st.f].c });
      }

      // ---- graficul t(τ) (fig. 2)
      FAZE.forEach(function (fz) {
        if (tau <= fz.a) return;
        ctx.fillStyle = fz.fond;
        ctx.fillRect(X(fz.a), 40, X(Math.min(tau, fz.b)) - X(fz.a), 362);
      });
      [T1, T1 + T2].forEach(function (v) {
        if (tau >= v) punctat(ctx, X(v), 40, X(v), 402, "rgba(95,101,115,0.6)");
      });
      F.sageata(ctx, X0, Y(TA) + 26, X0, 92, { culoare: "#8a919c", grosime: 2.5, cap: 12 });
      F.sageata(ctx, X0, Y0, XE + 18, Y0, { culoare: "#8a919c", grosime: 2.5, cap: 12 });
      F.scrie(ctx, [["t", "i"], [", °C"]], X0 + 10, 100, { marime: 19, culoare: CERNEALA });
      F.scrie(ctx, [["τ", "i"], [", min"]], XE + 16, Y0 - 12, { marime: 19, align: "right", culoare: CERNEALA });
      F.scrie(ctx, [["0"]], X0 - 10, Y0 + 7, { marime: 18, greutate: 700, align: "right", culoare: GRI });

      titlu(ctx, "Stări de agregare", X0 + 159, 26);
      titlu(ctx, "Procese termice", X0 + 159, 432);
      FAZE.forEach(function (fz, i) {
        const vazut = tau > fz.a || gata;
        const activ = !gata && tau > fz.a && (tau < fz.b || i === 2);
        if (!vazut) return;
        const xm = (X(fz.a) + X(fz.b)) / 2;
        const g = activ ? 800 : 600;
        fz.stare.forEach(function (l, k) {
          F.scrie(ctx, [[l]], xm, 62 + k * 19 - (fz.stare.length - 1) * 9, { marime: 16, greutate: g, align: "center", culoare: activ ? fz.c : CERNEALA });
        });
        fz.proces.forEach(function (l, k) {
          F.scrie(ctx, [[l]], xm, 376 + k * 19, { marime: 16, greutate: g, align: "center", culoare: activ ? fz.c : CERNEALA });
        });
      });

      ctx.strokeStyle = PORTOCALIU;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(X(0), Y(TA));
      [T1, T1 + T2].forEach(function (v) {
        if (tau > v) ctx.lineTo(X(v), Y(stare(v).tc));
      });
      ctx.lineTo(X(tau), Y(st.tc));
      ctx.stroke();

      // literele A, B, C, D și căldurile Q1, Q2, Q3
      const lit = [["A", 0, TA, -16, 8], ["B", T1, 0, -12, -12], ["C", T1 + T2, 0, -12, -12], ["D", TOT, TD, 2, -16]];
      lit.forEach(function (l, i) {
        if (i === 3 ? !gata : i > 0 && tau < l[1] - 1e-6) return;
        punct(ctx, X(l[1]), Y(l[2]), PORTOCALIU, 6);
        F.scrie(ctx, [[l[0]]], X(l[1]) + l[3], Y(l[2]) + l[4], { marime: 19, greutate: 800, align: "center", culoare: CERNEALA });
      });
      const qpoz = [[X0 + 54, Y0 + 58], [X0 + LAT[0] + LAT[1] / 2, Y0 + 32], [X0 + 228, 172]];
      FAZE.forEach(function (fz, i) {
        if (tau <= fz.a) return;
        F.scrie(ctx, [["Q", "i"], [fz.q, "sub"]], qpoz[i][0], qpoz[i][1], { marime: 24, align: "center", culoare: fz.c });
      });
      if (tau > 0 && !gata) punct(ctx, X(tau), Y(st.tc), st.tc < 0 ? ALBASTRU : culoare(st.tc), 8);

      // ---- la ce se consumă căldura
      if (tau > 0.05 && !gata) {
        const fz = FAZE[st.f];
        F.scrie(ctx, [["Q", "i"], [fz.q, "sub"]], 360, 506, { marime: 34, culoare: fz.c });
        F.scrie(ctx, [["–"]], 406, 500, { marime: 22, greutate: 700, culoare: fz.c });
        fz.expl.forEach(function (l, k) {
          F.scrie(ctx, [[l]], 428, 488 + k * 28, { marime: 20, greutate: k === 0 ? 700 : 600, culoare: k === 0 ? CERNEALA : GRI });
        });
      } else if (gata) {
        ctx.globalAlpha = baza * F.limita((s - START - TOT) / 0.4);
        pastila(ctx, [["Q", "i"], [" = "], ["Q", "i"], ["1", "sub"], [" + "], ["Q", "i"], ["2", "sub"], [" + "], ["Q", "i"], ["3", "sub"]],
          X0 + 159, 500, { marime: 24, pad: 20 });
      }
      ctx.globalAlpha = 1;
    };
  });

  // =====================================================================
  //  3. Topirea și solidificarea: rețeaua cristalină se distruge / se refă
  // =====================================================================
  Deck.animatie($("a-topire"), function (a) {
    const BX = 80, BY = 64, BW = 350, BH = 262;
    const R = 12, DX = 38, DY = 33, COL = 8, RAND = 7;
    const ox = BX + (BW - ((COL - 1) * DX + DX / 2)) / 2;
    const oy = BY + (BH - (RAND - 1) * DY) / 2;
    const V0 = 70;
    const P = [];
    for (let r = 0; r < RAND; r++) {
      for (let c = 0; c < COL; c++) {
        P.push({
          sx: ox + c * DX + (r % 2) * DX / 2, sy: oy + r * DY,
          pr: Math.min(r, RAND - 1 - r, c, COL - 1 - c) + Math.random() * 0.95,
          w1: 9 + Math.random() * 5, w2: 8 + Math.random() * 5, f1: Math.random() * 6.3, f2: Math.random() * 6.3,
        });
      }
    }
    const N = P.length;
    P.slice().sort(function (p, q) { return p.pr - q.pr; }).forEach(function (p, i) { p.ord = i; });
    const LEG = [];
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        if (Math.hypot(P[i].sx - P[j].sx, P[i].sy - P[j].sy) < DX * 1.08) LEG.push([i, j]);
      }
    }
    // faze: 0 gheață, 1 topire, 2 apă, 3 solidificare
    const D = [1.4, 7, 1.4, 7, 0.8];
    const PER = D.reduce(function (x, y) { return x + y; }, 0);

    function reset() {
      P.forEach(function (p) { p.liber = false; p.leg = 1; p.x = p.sx; p.y = p.sy; p.vx = p.vy = 0; });
    }
    reset();

    function poz(p, t) {
      const vx = p.sx + 3 * Math.sin(t * p.w1 + p.f1);
      const vy = p.sy + 3 * Math.cos(t * p.w2 + p.f2);
      if (p.leg >= 1) return [vx, vy];
      const k = neted(p.leg);
      return [p.ax + (vx - p.ax) * k, p.ay + (vy - p.ay) * k];
    }

    function faza(s) {
      let acc = 0;
      for (let i = 0; i < D.length; i++) {
        if (s < acc + D[i]) return { i: i, u: (s - acc) / D[i] };
        acc += D[i];
      }
      return { i: 4, u: 1 };
    }

    function sageti(ctx, inauntru, alfa, t) {
      if (alfa < 0.02) return;
      const a0 = ctx.globalAlpha;
      const L = [
        [BX - 52, BY + 80, BX - 10, BY + 80], [BX - 52, BY + 180, BX - 10, BY + 180],
        [BX + 90, BY + BH + 44, BX + 90, BY + BH + 8], [BX + 260, BY + BH + 44, BX + 260, BY + BH + 8],
      ];
      L.forEach(function (l, i) {
        const pul = 0.65 + 0.35 * Math.sin(t * 4 - i);
        ctx.globalAlpha = a0 * alfa * pul;
        if (inauntru) F.sageata(ctx, l[0], l[1], l[2], l[3], { culoare: CALDURA, grosime: 4, cap: 13 });
        else F.sageata(ctx, l[2], l[3], l[0], l[1], { culoare: CALDURA, grosime: 4, cap: 13 });
      });
      ctx.globalAlpha = a0 * alfa;
      F.scrie(ctx, [["Q", "i"]], BX - 34, BY + 140, { marime: 26, align: "center", culoare: CALDURA });
      F.scrie(ctx, [["Q", "i"]], BX + 175, BY + BH + 40, { marime: 26, align: "center", culoare: CALDURA });
      ctx.globalAlpha = a0;
    }

    function bara(ctx, y, eticheta, val, nota, c) {
      F.scrie(ctx, eticheta, 20, y, { marime: 18, greutate: 700, culoare: CERNEALA });
      F.rotunjit(ctx, 20, y + 9, 380, 20, 10);
      ctx.fillStyle = "#f3eee6";
      ctx.fill();
      let x = 20;
      val.forEach(function (v, i) {
        if (v <= 0.5) return;
        F.rotunjit(ctx, x, y + 9, v, 20, 10);
        ctx.fillStyle = c[i];
        ctx.fill();
        x += v;
      });
      if (nota) F.scrie(ctx, nota, 414, y + 25, { marime: 18, greutate: 800, culoare: nota.culoare || GRI });
    }

    return {
      reset: reset,
      draw: function (ctx, t, dt) {
        const s = t % PER;
        const fz = faza(s);
        // câte particule trebuie să fie libere acum
        let liberi = 0;
        if (fz.i === 1) liberi = Math.round(N * fz.u);
        else if (fz.i === 2) liberi = N;
        else if (fz.i === 3) liberi = N - Math.round(N * fz.u);
        const fractie = fz.i === 1 ? fz.u : fz.i === 2 ? 1 : fz.i === 3 ? 1 - fz.u : 0;

        P.forEach(function (p) {
          const trebuie = p.ord < liberi;
          if (trebuie && !p.liber) {
            const q = poz(p, t);
            const ang = Math.random() * Math.PI * 2;
            p.liber = true; p.leg = 0; p.x = q[0]; p.y = q[1];
            p.vx = Math.cos(ang) * V0; p.vy = Math.sin(ang) * V0;
          } else if (!trebuie && p.liber) {
            p.liber = false; p.leg = 0; p.ax = p.x; p.ay = p.y;
          }
          if (!p.liber && p.leg < 1) p.leg = Math.min(1, p.leg + dt / 0.6);
          if (!p.liber) { const q = poz(p, t); p.x = q[0]; p.y = q[1]; }
        });

        // mișcarea particulelor libere
        const dtt = Math.min(dt, 0.05);
        P.forEach(function (p) {
          if (!p.liber) return;
          p.x += p.vx * dtt; p.y += p.vy * dtt;
          if (p.x < BX + R) { p.x = BX + R; p.vx = Math.abs(p.vx); }
          if (p.x > BX + BW - R) { p.x = BX + BW - R; p.vx = -Math.abs(p.vx); }
          if (p.y < BY + R) { p.y = BY + R; p.vy = Math.abs(p.vy); }
          if (p.y > BY + BH - R) { p.y = BY + BH - R; p.vy = -Math.abs(p.vy); }
        });
        for (let i = 0; i < N; i++) {
          for (let j = i + 1; j < N; j++) {
            const p = P[i], q = P[j];
            if (!p.liber && !q.liber) continue;
            const dx = q.x - p.x, dy = q.y - p.y, d2 = dx * dx + dy * dy;
            if (d2 >= 4 * R * R || d2 === 0) continue;
            const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, sup = 2 * R - d;
            if (p.liber && q.liber) {
              p.x -= nx * sup / 2; p.y -= ny * sup / 2; q.x += nx * sup / 2; q.y += ny * sup / 2;
              const vn = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
              if (vn < 0) { p.vx += vn * nx; p.vy += vn * ny; q.vx -= vn * nx; q.vy -= vn * ny; }
            } else {
              // una e prinsă în rețea: cealaltă ricoșează
              const l = p.liber ? p : q, sg = p.liber ? -1 : 1;
              l.x += sg * nx * sup; l.y += sg * ny * sup;
              const vn = (l.vx * nx + l.vy * ny) * sg;
              if (vn < 0) { l.vx -= 2 * vn * nx * sg; l.vy -= 2 * vn * ny * sg; }
            }
          }
        }

        // ---- titlul fazei
        const titluri = [
          { t: "Gheață la 0 °C: rețea cristalină", c: ALBASTRU },
          { t: "TOPIRE: gheața primește căldură", c: CALDURA },
          { t: "Apă la 0 °C: rețeaua s-a distrus", c: ALBASTRU },
          { t: "SOLIDIFICARE: apa cedează căldură", c: CALDURA },
          { t: "Gheață la 0 °C: rețea cristalină", c: ALBASTRU },
        ];
        F.scrie(ctx, [[titluri[fz.i].t]], BX + BW / 2, 34, { marime: 22, greutate: 800, align: "center", culoare: titluri[fz.i].c });

        // ---- vasul cu particule
        F.rotunjit(ctx, BX - 6, BY - 6, BW + 12, BH + 12, 18);
        ctx.fillStyle = "rgba(42,116,214,0.06)";
        ctx.fill();
        ctx.strokeStyle = "#a9b1bc";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.strokeStyle = "rgba(42,116,214,0.4)";
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        LEG.forEach(function (l) {
          const p = P[l[0]], q = P[l[1]];
          if (p.liber || q.liber || p.leg < 0.95 || q.leg < 0.95) return;
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
        });
        ctx.stroke();
        P.forEach(function (p) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
          ctx.fillStyle = "#4f8fdc";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#ffffff";
          ctx.stroke();
        });

        const sag = fz.i === 1 || fz.i === 3 ? F.limita(Math.min(fz.u * 6, (1 - fz.u) * 6)) : 0;
        sageti(ctx, fz.i === 1, sag, t);

        // ---- termometrul: temperatura nu se schimbă
        F.termometru(ctx, 500, BY + 4, BH - 4, 30 / 130, { latime: 16 });
        F.scrie(ctx, [["t", "i"], [" = 0 °C"]], 500, BY + BH + 38, { marime: 22, greutate: 800, align: "center", culoare: ALBASTRU });
        F.scrie(ctx, [["const."]], 500, BY + BH + 62, { marime: 17, greutate: 700, align: "center", culoare: GRI });

        // ---- energiile
        const ec = 150, ep = 50 + 180 * fractie;
        const nota = fz.i === 1 ? { t: "crește ↑", c: CALDURA } : fz.i === 3 ? { t: "scade ↓", c: ALBASTRU } : null;
        bara(ctx, 404, [["Energia cinetică a particulelor"]], [ec], [["nu se schimbă"]], ["#7fb0e6"]);
        const n2 = nota ? [[nota.t]] : null;
        if (n2) n2.culoare = nota.c;
        bara(ctx, 460, [["Energia potențială a particulelor"]], [ep], n2, ["#f0a46b"]);
        bara(ctx, 516, [["Energia internă"]], [ec * 0.5, ep * 0.5], n2, ["#7fb0e6", "#f0a46b"]);
      },
    };
  });

  // =====================================================================
  //  4. Q = λt · m: căldura necesară pentru a topi 0,5 kg, 1 kg, 2 kg de gheață
  // =====================================================================
  Deck.animatie($("a-lambda"), function (a) {
    const L = 3.3; // ·10^5 J/kg
    const CAZURI = [
      { m: 0.5, mt: "0,5" }, { m: 1, mt: "1" }, { m: 2, mt: "2" }, { m: 1, mt: "1", invers: true },
    ];
    const DUR = 4.4;
    const PER = DUR * CAZURI.length;
    const fmt = function (v) { return (Math.round(v * 100) / 100).toString().replace(".", ","); };
    const XC = 140, YF = 250; // centrul blocului, nivelul tăvii

    return function (ctx, t) {
      const s = t % PER;
      const k = Math.floor(s / DUR);
      const u = s - k * DUR;
      const c = CAZURI[k];
      const al = F.limita(Math.min(u / 0.3, (DUR - u) / 0.3));
      const prog = neted((u - 0.5) / 2.8);
      // topire: gheața dispare, apa apare; solidificare: invers
      const gheata = c.invers ? prog : 1 - prog;
      const Q = (c.invers ? -1 : 1) * L * c.m * prog;

      F.scrie(ctx, [["Gheață la 0 °C:  "], ["λ", "i"], ["t", "sub"], [" = 3,3 · 10"], ["5", "sup"], [" J/kg"]],
        a.w / 2, 30, { marime: 21, greutate: 700, align: "center", culoare: CERNEALA });
      ctx.globalAlpha = al;
      F.scrie(ctx, [[c.invers ? "SOLIDIFICARE" : "TOPIRE"]], XC, 72,
        { marime: 19, greutate: 800, align: "center", culoare: c.invers ? ALBASTRU : CALDURA });

      // tava
      ctx.fillStyle = "#c9cfd7";
      F.rotunjit(ctx, XC - 112, YF, 224, 10, 5);
      ctx.fill();
      // apa (o baltă care crește cu masa topită)
      const lat = 60 + 140 * Math.sqrt(c.m / 2);
      const apa = 1 - gheata;
      if (apa > 0.01) {
        ctx.fillStyle = "rgba(42,116,214,0.35)";
        ctx.beginPath();
        ctx.ellipse(XC, YF, (lat / 2) * (0.5 + 0.5 * apa), 4 + 12 * apa * Math.sqrt(c.m), 0, Math.PI, 0);
        ctx.fill();
      }
      // blocul de gheață: aria ∼ masa
      const lb = 72 * Math.sqrt(c.m);
      const hb = lb * gheata;
      if (hb > 1) {
        F.rotunjit(ctx, XC - lb / 2, YF - hb, lb, hb, Math.min(8, hb / 2));
        ctx.fillStyle = "rgba(214,236,252,0.96)";
        ctx.fill();
        ctx.strokeStyle = "rgba(110,160,210,0.95)";
        ctx.lineWidth = 2;
        ctx.stroke();
        if (hb > 16) {
          ctx.strokeStyle = "rgba(255,255,255,0.95)";
          ctx.beginPath();
          ctx.moveTo(XC - lb / 2 + 8, YF - hb + 18); ctx.lineTo(XC - lb / 2 + 8, YF - hb + 8); ctx.lineTo(XC - lb / 2 + 22, YF - hb + 8);
          ctx.stroke();
        }
      }
      F.scrie(ctx, [["m", "i"], [" = " + c.mt + " kg"]], XC, YF + 44, { marime: 22, greutate: 800, align: "center", culoare: CERNEALA });

      // căldura: intră (topire) sau iese (solidificare)
      const sag = F.limita(Math.min((u - 0.4) * 4, (3.4 - u) * 4));
      if (sag > 0) {
        ctx.globalAlpha = al * sag;
        [-1, 1].forEach(function (sg) {
          const x1 = XC + sg * 120, x2 = XC + sg * 78, y = YF - 40;
          if (c.invers) F.sageata(ctx, x2, y, x1, y, { culoare: CALDURA, grosime: 4, cap: 13 });
          else F.sageata(ctx, x1, y, x2, y, { culoare: CALDURA, grosime: 4, cap: 13 });
        });
        F.scrie(ctx, [["Q", "i"]], XC - 100, YF - 54, { marime: 24, align: "center", culoare: CALDURA });
        F.scrie(ctx, [["Q", "i"]], XC + 100, YF - 54, { marime: 24, align: "center", culoare: CALDURA });
        ctx.globalAlpha = al;
      }

      // calculul
      const X0 = 290;
      F.scrie(ctx, [["Q", "i"], [" = "], ["λ", "i"], ["t", "sub"], [" · "], ["m", "i"]], X0, 120, { marime: 26, greutate: 700, culoare: CERNEALA });
      F.scrie(ctx, [["Q", "i"], [" = " + (c.invers ? "− " : "") + "3,3 · 10"], ["5", "sup"], [" J/kg · " + c.mt + " kg"]], X0, 170,
        { marime: 21, greutate: 600, culoare: CERNEALA });
      F.scrie(ctx, [["Q", "i"], [" = " + (Q < -1e-9 ? "−" : "") + fmt(Math.abs(Q)) + " · 10"], ["5", "sup"], [" J"]], X0, 222,
        { marime: 28, greutate: 800, culoare: CALDURA });
      if (u > 3.3) {
        ctx.globalAlpha = al * F.limita((u - 3.3) / 0.3);
        F.scrie(ctx, [[c.invers ? "căldură cedată mediului" : "căldură absorbită de gheață"]], X0, 262,
          { marime: 18, greutate: 700, culoare: c.invers ? ALBASTRU : GRI });
      }
      ctx.globalAlpha = 1;
    };
  });

  // =====================================================================
  //  5. Experimentul nr. 2: picăturile de alcool se evaporă
  // =====================================================================
  Deck.animatie($("a-evaporare"), function (a) {
    // placa de sticlă în perspectivă
    const PL = { tl: [104, 122], tr: [456, 122], br: [520, 226], bl: [40, 226], gros: 12 };
    const PICATURI = [
      { x: 168, y: 196, r: 30, viata: 5.0 }, { x: 262, y: 158, r: 20, viata: 3.4 }, { x: 352, y: 204, r: 26, viata: 4.4 },
      { x: 410, y: 152, r: 16, viata: 2.8 }, { x: 236, y: 212, r: 14, viata: 2.4 },
    ];
    const PIP = 0.5; // s pentru fiecare picătură
    const T_PIP = 0.6 + PICATURI.length * PIP;
    const T_EV = 9; // s pentru 5 min
    const PER = T_PIP + 0.6 + T_EV + 1.8;
    const vap = [];

    // ---- simularea la nivel de particule (fereastra de jos)
    const W = { x: 24, y: 330, w: 512, h: 258, sup: 466 };
    const RP = 8;
    const lichid = [];
    const viteza0 = function () { return 45 + 175 * Math.pow(Math.random(), 2); };
    function nouaParticula() {
      for (let k = 0; k < 60; k++) {
        const x = W.x + RP + Math.random() * (W.w - 2 * RP);
        const y = W.sup + 30 + Math.random() * (W.y + W.h - W.sup - 30 - RP);
        if (lichid.every(function (p) { return Math.hypot(p.x - x, p.y - y) > 2.2 * RP; })) {
          const ang = Math.random() * Math.PI * 2, v = viteza0();
          return { x: x, y: y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v };
        }
      }
      return null;
    }
    while (lichid.length < 84) { const p = nouaParticula(); if (!p) break; lichid.push(p); }
    const zbor = [];
    let asteapta = 0;

    function pipeta(ctx, x, y) {
      ctx.fillStyle = "rgba(215,232,245,0.9)";
      F.rotunjit(ctx, x - 7, y - 70, 14, 64, 6);
      ctx.fill();
      ctx.strokeStyle = "#8d96a3";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 7, y - 10); ctx.lineTo(x - 2, y); ctx.lineTo(x + 2, y); ctx.lineTo(x + 7, y - 10);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(232,140,60,0.7)";
      ctx.fillRect(x - 4, y - 34, 8, 24);
      ctx.fillStyle = "#c2552e";
      F.rotunjit(ctx, x - 12, y - 100, 24, 34, 11);
      ctx.fill();
    }

    function picatura(ctx, x, y, r) {
      if (r < 0.6) return;
      const ry = r * 0.42;
      const g = ctx.createRadialGradient(x - r * 0.3, y - ry * 0.5, 1, x, y, r);
      g.addColorStop(0, "rgba(255,214,160,0.95)");
      g.addColorStop(1, "rgba(226,128,52,0.85)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, r, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(180,90,30,0.55)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.ellipse(x - r * 0.35, y - ry * 0.35, r * 0.22, ry * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    return {
      reset: function () { vap.length = 0; zbor.length = 0; },
      draw: function (ctx, t, dt) {
        const s = t % PER;
        const dtt = Math.min(dt, 0.05);
        ctx.globalAlpha = estompare(s, PER);
        const baza = ctx.globalAlpha;
        const tauEv = F.limita((s - T_PIP - 0.6) / T_EV) * 5; // minute

        // ---- placa
        ctx.fillStyle = "rgba(160,200,230,0.45)";
        ctx.beginPath();
        ctx.moveTo(PL.bl[0], PL.bl[1]); ctx.lineTo(PL.br[0], PL.br[1]);
        ctx.lineTo(PL.br[0], PL.br[1] + PL.gros); ctx.lineTo(PL.bl[0], PL.bl[1] + PL.gros);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "rgba(205,228,244,0.55)";
        ctx.beginPath();
        ctx.moveTo(PL.tl[0], PL.tl[1]); ctx.lineTo(PL.tr[0], PL.tr[1]); ctx.lineTo(PL.br[0], PL.br[1]); ctx.lineTo(PL.bl[0], PL.bl[1]);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#8fb0c8";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeRect(PL.bl[0], PL.bl[1], PL.br[0] - PL.bl[0], PL.gros);

        // ---- picăturile
        PICATURI.forEach(function (p, i) {
          const tc = 0.6 + i * PIP + 0.3; // momentul în care picătura atinge placa
          if (s < tc) {
            // picătura în cădere
            if (s > tc - 0.3) {
              const f = (s - (tc - 0.3)) / 0.3;
              ctx.fillStyle = "rgba(226,128,52,0.9)";
              ctx.beginPath();
              ctx.ellipse(p.x, 106 + (p.y - 106) * f * f, 5, 7, 0, 0, Math.PI * 2);
              ctx.fill();
            }
            return;
          }
          const intinde = F.limita((s - tc) / 0.25);
          const r = p.r * intinde * Math.sqrt(F.limita(1 - tauEv / p.viata));
          picatura(ctx, p.x, p.y, r);
          // vapori (invizibili în realitate): particule mici care se ridică
          if (r > 2 && tauEv > 0 && tauEv < 5 && Math.random() < dtt * (2 + r * 0.25)) {
            vap.push({ x: p.x + (Math.random() - 0.5) * r * 1.4, y: p.y - 3, vx: (Math.random() - 0.5) * 16, viata: 0 });
          }
        });
        for (let i = vap.length - 1; i >= 0; i--) {
          const v = vap[i];
          v.viata += dtt; v.y -= 42 * dtt; v.x += v.vx * dtt;
          if (v.viata > 1.8) { vap.splice(i, 1); continue; }
          ctx.globalAlpha = baza * 0.7 * F.limita(Math.min(v.viata / 0.2, (1.8 - v.viata) / 0.6));
          ctx.fillStyle = "#e07a2f";
          ctx.beginPath(); ctx.arc(v.x, v.y, 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = baza;

        // ---- pipeta
        if (s < T_PIP + 0.4) {
          const k = F.limita((s - 0.6) / PIP, 0, PICATURI.length - 1);
          const i0 = Math.floor(k), f = neted((k - i0 - 0.35) / 0.5);
          const p0 = PICATURI[i0], p1 = PICATURI[Math.min(i0 + 1, PICATURI.length - 1)];
          ctx.globalAlpha = baza * F.limita((T_PIP + 0.4 - s) / 0.4) * F.limita(s / 0.3);
          pipeta(ctx, p0.x + (p1.x - p0.x) * f, 104);
          ctx.globalAlpha = baza;
        }

        // ---- ceasul și etichetele
        pastila(ctx, [["τ", "i"], [" = " + F.numar(tauEv, 1) + " min"]], 470, 30, { marime: 19, pad: 14, fond: CERNEALA });
        eticheta(ctx, "placă de sticlă", 120, 276, 120, PL.bl[1] + PL.gros - 2);
        eticheta(ctx, "picături de alcool", 330, 276, 352, 212);
        if (tauEv > 0.3) {
          ctx.globalAlpha = baza * F.limita((tauEv - 0.3) * 2);
          F.scrie(ctx, [["vapori"]], 300, 92, { marime: 18, greutate: 800, align: "center", culoare: "#e07a2f" });
          ctx.globalAlpha = baza;
        }
        if (tauEv >= 5) {
          ctx.globalAlpha = baza * F.limita((s - T_PIP - 0.6 - T_EV) / 0.4);
          pastila(ctx, [["alcoolul s-a evaporat"]], 280, 180, { marime: 20, pad: 16 });
          ctx.globalAlpha = baza;
        }

        // ---- fereastra: ce se întâmplă la suprafața lichidului
        F.rotunjit(ctx, W.x - 4, W.y - 4, W.w + 8, W.h + 8, 18);
        ctx.fillStyle = "#fbf8f3";
        ctx.fill();
        ctx.strokeStyle = LINIE;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.save();
        F.rotunjit(ctx, W.x, W.y, W.w, W.h, 15);
        ctx.clip();
        ctx.fillStyle = "rgba(232,140,60,0.16)";
        ctx.fillRect(W.x, W.sup, W.w, W.y + W.h - W.sup);
        ctx.strokeStyle = "rgba(201,90,28,0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(W.x, W.sup); ctx.lineTo(W.x + W.w, W.sup); ctx.stroke();

        // pas de simulare: particulele cele mai rapide pot ieși prin suprafață
        lichid.forEach(function (p) {
          p.x += p.vx * dtt; p.y += p.vy * dtt;
          if (p.x < W.x + RP) { p.x = W.x + RP; p.vx = Math.abs(p.vx); }
          if (p.x > W.x + W.w - RP) { p.x = W.x + W.w - RP; p.vx = -Math.abs(p.vx); }
          if (p.y > W.y + W.h - RP) { p.y = W.y + W.h - RP; p.vy = -Math.abs(p.vy); }
          if (p.y < W.sup + RP) {
            if (p.vy < 0 && Math.hypot(p.vx, p.vy) > 180) { p.iese = true; }
            else { p.y = W.sup + RP; p.vy = Math.abs(p.vy); }
          }
        });
        for (let i = lichid.length - 1; i >= 0; i--) {
          if (lichid[i].iese) { const p = lichid.splice(i, 1)[0]; p.viata = 0; zbor.push(p); asteapta += 0.6; }
        }
        for (let i = 0; i < lichid.length; i++) {
          for (let j = i + 1; j < lichid.length; j++) {
            const p = lichid[i], q = lichid[j];
            const dx = q.x - p.x, dy = q.y - p.y, d2 = dx * dx + dy * dy;
            if (d2 >= 4 * RP * RP || d2 === 0) continue;
            const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, sup = (2 * RP - d) / 2;
            p.x -= nx * sup; p.y -= ny * sup; q.x += nx * sup; q.y += ny * sup;
            const vn = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
            if (vn < 0) { p.vx += vn * nx; p.vy += vn * ny; q.vx -= vn * nx; q.vy -= vn * ny; }
          }
        }
        if (asteapta > 0) {
          asteapta -= dtt;
          if (asteapta <= 0 || lichid.length < 78) { const p = nouaParticula(); if (p) lichid.push(p); asteapta = Math.max(0, asteapta); }
        }

        lichid.forEach(function (p) {
          ctx.beginPath(); ctx.arc(p.x, p.y, RP, 0, Math.PI * 2);
          ctx.fillStyle = "#e07a2f"; ctx.fill();
          ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5; ctx.stroke();
        });
        for (let i = zbor.length - 1; i >= 0; i--) {
          const p = zbor[i];
          p.viata += dtt;
          p.x += p.vx * dtt * 0.6; p.y += p.vy * dtt * 0.6;
          if (p.x < W.x + RP || p.x > W.x + W.w - RP) p.vx = -p.vx;
          if (p.y < W.y - 20 || p.viata > 4) { zbor.splice(i, 1); continue; }
          ctx.globalAlpha = baza * F.limita((p.y - W.y) / 50);
          ctx.beginPath(); ctx.arc(p.x, p.y, RP, 0, Math.PI * 2);
          ctx.fillStyle = "#e07a2f"; ctx.fill();
          ctx.strokeStyle = "#8a3a10"; ctx.lineWidth = 2.5; ctx.stroke();
          ctx.globalAlpha = baza;
        }
        ctx.restore();

        F.scrie(ctx, [["La suprafața liberă a lichidului"]], W.x + 16, W.y + 28, { marime: 18, greutate: 800, culoare: CERNEALA });
        F.scrie(ctx, [["vapori"]], W.x + W.w - 16, W.y + 28, { marime: 18, greutate: 800, align: "right", culoare: "#8a3a10" });
        F.scrie(ctx, [["cele mai rapide particule părăsesc lichidul"]], W.x + 16, W.y + 52,
          { marime: 16, greutate: 700, culoare: GRI });
        F.scrie(ctx, [["lichid (alcool) ↓"]], W.x + W.w - 16, W.sup - 10, { marime: 17, greutate: 800, align: "right", culoare: PORTOCALIU });
        F.scrie(ctx, [["suprafața liberă"]], W.x + 16, W.sup - 10, { marime: 16, greutate: 700, culoare: PORTOCALIU });
        ctx.globalAlpha = 1;
      },
    };
  });

  // =====================================================================
  //  6. Experimentul nr. 3: fierberea apei (fig. 4, fig. 5) și condensarea
  // =====================================================================
  Deck.animatie($("a-fierbere"), function (a) {
    const CX = 165, CY = 300, R = 82, GAT = 19, GURA = 128, NIV = 282;
    const PLACA = 84, MASA_Y = CY + R + 2 + 98, K = 1;
    const T_INC = 7, T_FIERB = 11, T_TOT = 18; // minute (= secunde de animație)
    const START = 0.8;
    const PER = START + T_TOT + 2.6;
    const G = { x0: 404, x1: 662, ys: 60, yj: 346, tmax: 110, tauMax: 19 };
    const X = function (v) { return G.x0 + (v / G.tauMax) * (G.x1 - G.x0); };
    const Y = function (c) { return G.yj - (c / G.tmax) * (G.yj - G.ys); };
    const bule = [], abur = [], cad = [];
    const STROPI = [];
    for (let j = 0; j < 11; j++) {
      const x = CX - 85 + j * 17 + (Math.random() - 0.5) * 6;
      STROPI.push({ x: x, r: 0, rata: (1.2 + Math.random()) * Math.exp(-Math.pow((x - CX) / 70, 2)) });
    }

    const a0 = Math.asin(GAT / R);
    function balon(ctx) {
      ctx.beginPath();
      ctx.moveTo(CX - GAT, GURA);
      ctx.lineTo(CX - GAT, CY - R * Math.cos(a0));
      ctx.arc(CX, CY, R, -Math.PI / 2 - a0, -Math.PI / 2 + a0, true);
      ctx.lineTo(CX + GAT, GURA);
    }
    const coarda = function (y) { return Math.sqrt(Math.max(0, R * R - (y - CY) * (y - CY))); };

    function temperatura(tau) { return tau < T_INC ? 25 + (75 * tau) / T_INC : 100; }

    function axe(ctx) {
      ctx.strokeStyle = "#eee6da";
      ctx.lineWidth = 1.5;
      ctx.font = font(600, 17);
      ctx.fillStyle = GRI;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let c = 20; c <= 100; c += 20) {
        ctx.beginPath(); ctx.moveTo(G.x0, Y(c)); ctx.lineTo(G.x1, Y(c)); ctx.stroke();
        ctx.fillText(c + "", G.x0 - 8, Y(c));
      }
      ctx.fillText("0", G.x0 - 8, G.yj);
      ctx.textBaseline = "alphabetic";
      F.sageata(ctx, G.x0, G.yj, G.x0, G.ys - 24, { culoare: "#8a919c", grosime: 2.5, cap: 12 });
      F.sageata(ctx, G.x0, G.yj, G.x1 + 24, G.yj, { culoare: "#8a919c", grosime: 2.5, cap: 12 });
      ctx.strokeStyle = "#8a919c";
      ctx.lineWidth = 2;
      for (let m = 4; m <= 16; m += 4) {
        ctx.beginPath(); ctx.moveTo(X(m), G.yj - 5); ctx.lineTo(X(m), G.yj + 5); ctx.stroke();
        F.scrie(ctx, [[m + ""]], X(m), G.yj + 24, { marime: 16, align: "center", culoare: GRI });
      }
      F.scrie(ctx, [["t", "i"], [", °C"]], G.x0 + 12, G.ys - 12, { marime: 20, culoare: CERNEALA });
      F.scrie(ctx, [["τ", "i"], [", min"]], G.x1 + 26, G.yj - 12, { marime: 20, align: "right", culoare: CERNEALA });
    }

    function textBloc(ctx, linii, x, y) {
      linii.forEach(function (l, i) {
        F.scrie(ctx, [[l]], x, y + i * 26, { marime: 19, greutate: 600, culoare: CERNEALA });
      });
    }

    return {
      reset: function () {
        bule.length = 0; abur.length = 0; cad.length = 0;
        STROPI.forEach(function (p) { p.r = 0; });
      },
      draw: function (ctx, t, dt) {
        const s = t % PER;
        const dtt = Math.min(dt, 0.05);
        const tau = F.limita(s - START, 0, T_TOT);
        const tc = temperatura(tau);
        const fierbe = tau >= T_INC && s < START + T_TOT + 0.2;
        const fl = F.limita((s - 0.3) / 0.4) * F.limita((START + T_TOT + 0.3 - s) / 0.3);
        const placa = neted((tau - T_FIERB) / 1);
        if (s < 0.1) { bule.length = 0; abur.length = 0; cad.length = 0; STROPI.forEach(function (p) { p.r = 0; }); }
        ctx.globalAlpha = estompare(s, PER);
        const baza = ctx.globalAlpha;

        // ---- spirtiera, trepiedul, căldura
        masa(ctx, 0, 330, MASA_Y);
        spirtiera(ctx, CX, MASA_Y, K, t, fl);
        trepied(ctx, CX, CY + R + 2, MASA_Y, 190);
        sageataQ(ctx, CX - 66, MASA_Y - 14, CY + R + 18, fl, 22);
        sageataQ(ctx, CX + 54, MASA_Y - 14, CY + R + 18, fl, 22);

        // ---- bulele
        if (tc > 60 && !fierbe && Math.random() < dtt * ((tc - 60) / 40) * 10) {
          const y = CY + R - 14 - Math.random() * 20;
          const h = coarda(y) - 10;
          bule.push({ x: CX + (Math.random() * 2 - 1) * h, y: y, r: 1.5 + Math.random() * 1.8, vy: -18, viata: 0, max: 0.6 + Math.random() * 0.6, mica: true });
        }
        if (fierbe) {
          const n = dtt * 40;
          for (let k = 0; k < 3; k++) {
            if (Math.random() < n / 3) {
              const y = CY + 20 + Math.random() * (R - 34);
              const h = coarda(y) - 12;
              bule.push({ x: CX + (Math.random() * 2 - 1) * h, y: y, r: 2.5, vy: -40, viata: 0, max: 9, mica: false });
            }
          }
        }
        for (let i = bule.length - 1; i >= 0; i--) {
          const b = bule[i];
          b.viata += dtt;
          if (b.mica) {
            b.y += b.vy * dtt;
            if (b.viata > b.max) { bule.splice(i, 1); continue; }
          } else {
            b.r = Math.min(9, b.r + dtt * 9);
            b.vy -= 160 * dtt;
            b.y += b.vy * dtt;
            b.x += Math.sin(b.viata * 9 + i) * 0.4;
            if (b.y - b.r < NIV) {
              bule.splice(i, 1);
              abur.push({ x: CX + (Math.random() - 0.5) * 20, y: GURA + 20, r: 6, vx: (Math.random() - 0.5) * 10, vy: -60 - Math.random() * 30, viata: 0 });
              continue;
            }
          }
        }

        // ---- apa din balon
        ctx.save();
        balon(ctx);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = culoare(tc, 0.25);
        ctx.fillRect(CX - R, NIV, 2 * R, CY + R - NIV + 4);
        bule.forEach(function (b) {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.55)";
          ctx.fill();
          ctx.strokeStyle = "rgba(70,110,160,0.55)";
          ctx.lineWidth = 1.3;
          ctx.stroke();
        });
        ctx.restore();

        // termometrul și balonul
        F.termometru(ctx, CX + 7, GURA - 24, CY + 40 - (GURA - 24), tc / 110, { latime: 12, gradatii: false });
        balon(ctx);
        ctx.strokeStyle = "#8d96a3";
        ctx.lineWidth = 3.5;
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(CX - GAT - 6, GURA - 4); ctx.lineTo(CX - GAT, GURA + 4);
        ctx.moveTo(CX + GAT + 6, GURA - 4); ctx.lineTo(CX + GAT, GURA + 4);
        ctx.stroke();

        // ---- aburul care iese din balon
        if (fierbe && Math.random() < dtt * 9) {
          abur.push({ x: CX + (Math.random() - 0.5) * 22, y: GURA, r: 5, vx: (Math.random() - 0.5) * 14, vy: -55 - Math.random() * 25, viata: 0 });
        }
        const yPlaca = PLACA + 10;
        for (let i = abur.length - 1; i >= 0; i--) {
          const p = abur[i];
          p.viata += dtt;
          p.x += p.vx * dtt; p.y += p.vy * dtt;
          p.r += dtt * 7;
          if (placa > 0.95 && p.y - p.r < yPlaca) {
            p.y = yPlaca + p.r; p.vy = 0;
            p.vx = (p.x < CX ? -1 : 1) * 40;
          }
          if (p.viata > 2.2) { abur.splice(i, 1); continue; }
          if (p.y > GURA + 2) continue;
          ctx.globalAlpha = baza * 0.5 * F.limita(Math.min(p.viata / 0.2, (2.2 - p.viata) / 1));
          ctx.fillStyle = "#c6cdd6";
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = baza;

        // ---- placa de sticlă și picăturile de condensare
        if (placa > 0) {
          const dx = -260 * (1 - placa);
          ctx.globalAlpha = baza * F.limita(placa * 3);
          ctx.fillStyle = "rgba(190,220,240,0.75)";
          F.rotunjit(ctx, CX - 112 + dx, PLACA, 224, 10, 3);
          ctx.fill();
          ctx.strokeStyle = "#8fb0c8";
          ctx.lineWidth = 2;
          ctx.stroke();
          if (placa > 0.95) {
            STROPI.forEach(function (p) {
              if (fierbe) p.r += dtt * p.rata * 1.6;
              if (p.r > 6.5) {
                cad.push({ x: p.x, y: yPlaca + 6, vy: 0 });
                p.r = 0.5;
              }
              if (p.r < 0.6) return;
              ctx.fillStyle = "rgba(42,116,214,0.55)";
              ctx.beginPath();
              ctx.ellipse(p.x, yPlaca, p.r * 0.9, p.r, 0, 0, Math.PI);
              ctx.fill();
            });
          }
          ctx.globalAlpha = baza;
        }
        for (let i = cad.length - 1; i >= 0; i--) {
          const c = cad[i];
          c.vy += 600 * dtt; c.y += c.vy * dtt;
          if (c.y > GURA + 10) { cad.splice(i, 1); continue; }
          ctx.fillStyle = "rgba(42,116,214,0.7)";
          ctx.beginPath(); ctx.ellipse(c.x, c.y, 3, 4.5, 0, 0, Math.PI * 2); ctx.fill();
        }
        if (placa > 0.9) {
          ctx.globalAlpha = baza * F.limita((placa - 0.9) * 10);
          eticheta(ctx, "placă de sticlă", 68, 58, 80, PLACA + 4);
          ctx.globalAlpha = baza;
        }

        // citirile
        F.scrie(ctx, [["τ", "i"], [" = " + F.numar(tau, 1) + " min"]], CX, MASA_Y + 50, { marime: 20, greutate: 700, align: "center", culoare: GRI });
        F.scrie(ctx, [["t", "i"], [" = " + F.numar(tc) + " °C"]], CX, MASA_Y + 92, { marime: 32, greutate: 800, align: "center", culoare: culoare(tc) });

        // ---- graficul t(τ) (fig. 5)
        axe(ctx);
        if (tau >= T_INC) punctat(ctx, X(T_INC), Y(100), X(T_INC), G.yj, "rgba(95,101,115,0.55)");
        ctx.strokeStyle = PORTOCALIU;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(X(0), Y(25));
        if (tau > T_INC) ctx.lineTo(X(T_INC), Y(100));
        ctx.lineTo(X(tau), Y(tc));
        ctx.stroke();
        punct(ctx, X(0), Y(25), PORTOCALIU, 6);
        F.scrie(ctx, [["A"]], X(0) + 16, Y(25) + 6, { marime: 20, greutate: 800, align: "center", culoare: CERNEALA });
        if (tau >= T_INC) {
          punct(ctx, X(T_INC), Y(100), PORTOCALIU, 6);
          F.scrie(ctx, [["B"]], X(T_INC) - 2, Y(100) - 14, { marime: 20, greutate: 800, align: "center", culoare: CERNEALA });
        }
        if (s > START + T_TOT) {
          punct(ctx, X(T_TOT), Y(100), PORTOCALIU, 6);
          F.scrie(ctx, [["C"]], X(T_TOT), Y(100) - 14, { marime: 20, greutate: 800, align: "center", culoare: CERNEALA });
        } else if (tau > 0) {
          punct(ctx, X(tau), Y(tc), culoare(tc), 8);
        }
        if (tau > 0.5) {
          F.scrie(ctx, [["Încălzirea apei"]], (X(0) + X(T_INC)) / 2 + 30, G.yj - 14, { marime: 16, greutate: 700, align: "center", culoare: ROSU });
        }
        if (tau > T_INC + 0.5) {
          F.scrie(ctx, [["Fierberea apei"]], (X(T_INC) + X(T_TOT)) / 2, Y(100) + 32, { marime: 16, greutate: 700, align: "center", culoare: MOV });
        }

        // ---- explicația fazei curente
        const PX = 352, PY = 418;
        if (tau > 0.05) {
          let titlu, culo, linii;
          if (tau < T_INC) {
            titlu = "Încălzirea apei"; culo = ROSU;
            linii = tc > 60 ? ["Temperatura apei crește.", "Apar bule mici pe fundul", "balonului."] : ["Temperatura apei crește."];
          } else if (tau < T_FIERB) {
            titlu = "Fierberea apei"; culo = MOV;
            linii = ["t = 100 °C = const.", "(la presiune normală).", "Bulele de vapori se formează", "în tot volumul lichidului."];
          } else {
            titlu = "Condensarea vaporilor"; culo = ALBASTRU;
            linii = ["Pe placa de sticlă apar picături", "de apă: vaporii trec în stare", "lichidă și cedează căldură."];
          }
          pastila(ctx, [[titlu]], PX, PY, { marime: 20, pad: 16, fond: culo, stanga: true });
          textBloc(ctx, linii, PX, PY + 46);
        }
        ctx.globalAlpha = 1;
      },
    };
  });
})();
