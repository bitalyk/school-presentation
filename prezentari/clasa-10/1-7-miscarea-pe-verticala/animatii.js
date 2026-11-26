/* Animațiile pentru 1.7 e) „Mișcarea corpului pe verticală” (clasa a 10-a). */
(function () {
  "use strict";

  const F = window.Fizica;
  const $ = function (id) { return document.getElementById(id); };
  const CERNEALA = "#1f2430";
  const GRI = "#5f6573";
  const AXA = "#8a919c";
  const ROSU = "#e0314b";     // viteza
  const VIOLET = "#8a5bd0";   // accelerația g
  const ALBASTRU = "#2a74d6"; // rezistența aerului
  const G = 9.8;

  const neted = function (x) { x = F.limita(x); return x * x * (3 - 2 * x); };
  const vec = function (l, ind) { return ind ? [[l, "v"], [ind, "sub"]] : [[l, "v"]]; };
  const it = function (l, ind) { return ind ? [[l, "i"], [ind, "sub"]] : [[l, "i"]]; };
  const cat = function () { return Array.prototype.concat.apply([], arguments); };

  function axaY(ctx, x, yJos, ySus, eticheta) {
    F.sageata(ctx, x, yJos, x, ySus, { culoare: AXA, grosime: 2, cap: 12 });
    if (eticheta) F.scrie(ctx, it(eticheta), x - 14, ySus + 10, { marime: 22, align: "right", culoare: GRI });
  }

  function bila(ctx, x, y, r) {
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
    g.addColorStop(0, "#c9ced8");
    g.addColorStop(0.55, "#7b8494");
    g.addColorStop(1, "#3b4250");
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  // pană: tija orizontală, centrată în (x, y), rotită cu unghiul `ung`
  function pana(ctx, x, y, ung) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ung);
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.bezierCurveTo(-12, -16, 14, -14, 28, -1);
    ctx.bezierCurveTo(14, 11, -10, 13, -24, 0);
    ctx.closePath();
    ctx.fillStyle = "#f6f3ec";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#9aa0ab";
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(120, 126, 138, 0.55)";
    for (let k = -16; k <= 20; k += 6) {
      ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k + 6, -9 + Math.abs(k) * 0.12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k + 6, 8 - Math.abs(k) * 0.1); ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-32, 2); ctx.quadraticCurveTo(0, 1, 30, -1);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#7d8390";
    ctx.stroke();
    ctx.restore();
  }

  // săgeată cu etichetă (eticheta se scrie doar dacă săgeata nu e prea mică)
  function vector(ctx, x1, y1, x2, y2, culoare, eticheta, o) {
    o = o || {};
    const lung = Math.hypot(x2 - x1, y2 - y1);
    if (lung < 3) return;
    F.sageata(ctx, x1, y1, x2, y2, { culoare: culoare, grosime: o.grosime || 3, cap: Math.min(12, lung * 0.7) });
    if (eticheta && lung > (o.min || 12)) {
      F.scrie(ctx, eticheta, x2 + (o.dx || 0), y2 + (o.dy || 0), { marime: o.marime || 18, align: o.align, culoare: culoare });
    }
  }

  // text compus din bucăți: { p: părți } sau fracție { num, den }; fiecare cu culoarea ei (c)
  function latime(ctx, parti, m) { return F.scrie(ctx, parti, -5000, -5000, { marime: m }); }
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
        F.scrie(ctx, b.p, xx, y, { marime: m, culoare: c });
      }
      xx += lat[i];
    });
    return total;
  }

  // =====================================================================
  //  1. Titlu: corp aruncat în sus, cu imaginile lui la intervale egale de timp
  // =====================================================================
  Deck.animatie($("a-titlu"), function (a) {
    const X = 250, Y0 = 500, PX = 19, V0 = 19.6, TZB = 2 * V0 / G, PAUZA = 0.9;
    return function (ctx, t) {
      const ciclu = TZB / 1.25 + PAUZA;
      const ta = Math.min((t % ciclu) * 1.25, TZB);
      ctx.fillStyle = "#d8cfc2";
      ctx.fillRect(X - 150, Y0 + 14, 300, 4);
      axaY(ctx, X - 70, Y0 + 14, 60, "y");
      // imaginile la fiecare 0,2 s (mai dese sus, unde viteza e mică)
      for (let k = 0; k * 0.2 <= ta; k++) {
        const tk = k * 0.2;
        const yk = Y0 - (V0 * tk - G * tk * tk / 2) * PX;
        const dx = tk <= V0 / G ? -14 : 14;
        ctx.beginPath();
        ctx.arc(X + dx, yk, 7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(207, 39, 65, 0.22)";
        ctx.fill();
      }
      const vy = V0 - G * ta;
      const y = Y0 - (V0 * ta - G * ta * ta / 2) * PX;
      const xb = X + (vy >= 0 ? -14 : 14);
      bila(ctx, xb, y, 15);
      vector(ctx, xb + 28, y, xb + 28, y - vy * 6.5, ROSU, vec("v"), { dx: 8, dy: vy > 0 ? 14 : 0, marime: 24 });
      vector(ctx, X + 110, 150, X + 110, 230, VIOLET, vec("g"), { dx: 10, dy: -6, marime: 24 });
    };
  });

  // =====================================================================
  //  2. Bila și pana: în aer și în vid (încetinit de 4 ori)
  // =====================================================================
  Deck.animatie($("a-cadere"), function (a) {
    const TUB = [175, 525], LT = 200, SUS = 70, JOS = 520;
    const Y0 = 118, H = 1.2, PXM = 300; // 1,2 m de cădere = 360 px
    const INCET = 4, ASTEAPTA = 0.9, CICLU = 9.4, KV = 14;
    const VT_BILA = 30, VT_PANA = 0.8; // vitezele limită în aer, m/s
    const corp = {
      // cădere cu rezistența aerului (forță ∝ v²): v = vt·th(g t / vt)
      aer: function (vt, tau) {
        const x = (G * tau) / vt;
        return { y: (vt * vt / G) * Math.log(Math.cosh(x)), v: vt * Math.tanh(x) };
      },
      vid: function (tau) { return { y: G * tau * tau / 2, v: G * tau }; },
      aterizare: function (vt) { return vt ? (Math.acosh(Math.exp((H * G) / (vt * vt))) * vt) / G : Math.sqrt((2 * H) / G); },
    };
    const T_BILA = corp.aterizare(VT_BILA), T_PANA = corp.aterizare(VT_PANA), T_VID = corp.aterizare(0);
    // moleculele de aer din primul tub
    const aer = [];
    for (let i = 0; i < 60; i++) {
      aer.push({ x: Math.random() * (LT - 20), y: Math.random() * (JOS - SUS - 20), vx: (Math.random() - 0.5) * 50, vy: (Math.random() - 0.5) * 50 });
    }

    function tub(ctx, cx, titlu, nota) {
      const x = cx - LT / 2;
      F.rotunjit(ctx, x, SUS, LT, JOS - SUS, 26);
      ctx.fillStyle = "rgba(220, 234, 246, 0.35)";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#a9b7c6";
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.fillRect(x + 14, SUS + 24, 8, JOS - SUS - 48);
      ctx.fillStyle = "#8c939f";
      F.rotunjit(ctx, x - 8, SUS - 14, LT + 16, 18, 6); ctx.fill();
      F.rotunjit(ctx, x - 8, JOS - 4, LT + 16, 18, 6); ctx.fill();
      F.scrie(ctx, [[titlu]], cx, SUS - 30, { marime: 26, greutate: 800, align: "center" });
      if (nota) F.scrie(ctx, [[nota]], cx, SUS + 30, { marime: 15, align: "center", culoare: GRI });
    }

    function draw(ctx, t, dt) {
      const tc = t % CICLU;
      const tau = Math.max(0, (tc - ASTEAPTA) / INCET); // timpul real al căderii

      // tubul cu aer: moleculele se mișcă haotic
      tub(ctx, TUB[0], "În aer");
      aer.forEach(function (p) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < 0 || p.x > LT - 20) p.vx *= -1;
        if (p.y < 0 || p.y > JOS - SUS - 20) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(TUB[0] - LT / 2 + 10 + p.x, SUS + 10 + p.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(42, 116, 214, 0.28)";
        ctx.fill();
      });
      tub(ctx, TUB[1], "În vid", "aerul a fost evacuat");

      const corpuri = [
        { tub: 0, fel: "bila", s: corp.aer(VT_BILA, Math.min(tau, T_BILA)), tj: T_BILA, gr: 48, vt: VT_BILA },
        { tub: 0, fel: "pana", s: corp.aer(VT_PANA, Math.min(tau, T_PANA)), tj: T_PANA, gr: 28, vt: VT_PANA },
        { tub: 1, fel: "bila", s: corp.vid(Math.min(tau, T_VID)), tj: T_VID, gr: 48 },
        { tub: 1, fel: "pana", s: corp.vid(Math.min(tau, T_VID)), tj: T_VID, gr: 28 },
      ];
      corpuri.forEach(function (c) {
        const cx = TUB[c.tub];
        const jos = tau >= c.tj;
        const v = jos ? 0 : c.s.v;
        const y = Y0 + Math.min(c.s.y, H) * PXM;
        let x, ung = 0;
        if (c.fel === "bila") {
          x = cx - 48;
          bila(ctx, x, y, 14);
        } else {
          const ta = tau * INCET;
          const leagana = c.tub === 0 && !jos && tau > 0;
          x = cx + 34 + (leagana ? 14 * Math.sin(1.4 * ta) : 0);
          ung = leagana ? 0.32 * Math.sin(1.4 * ta + 1.2) : -0.12;
          pana(ctx, x, y, ung);
        }
        // forțele: greutatea în jos; în aer și rezistența aerului în sus
        const xf = c.fel === "bila" ? x : x - 2;
        const st = c.fel === "bila" ? { dx: -8, align: "right" } : { dx: 7, align: "left" };
        if (!jos) {
          vector(ctx, xf, y, xf, y + c.gr, VIOLET, vec("G"), { dx: st.dx, dy: 8, align: st.align, marime: 17, grosime: 2.5 });
          if (c.vt) {
            const fr = c.gr * Math.pow(v / c.vt, 2);
            vector(ctx, xf, y, xf, y - fr, ALBASTRU, cat(vec("F"), [["rez", "sub"]]), { dx: st.dx, dy: 2, align: st.align, marime: 17, grosime: 2.5, min: 14 });
          }
        }
        // viteza
        const xv = c.fel === "bila" ? x + 24 : x + 46;
        vector(ctx, xv, y, xv, y + v * KV, ROSU, vec("v"), { dx: 6, dy: 4, marime: 18, min: 16 });
      });

      // cronometrul și timpii de cădere
      const tAfis = Math.min(tau, T_PANA);
      F.scrie(ctx, [["t", "i"], [" = " + F.numar(tAfis, 2) + " s"]], 350, 40, { marime: 22, align: "center" });
      F.scrie(ctx, [["încetinit de 4 ori"]], 350, 62, { marime: 15, align: "center", culoare: GRI });
      [[0, T_BILA, T_PANA], [1, T_VID, T_VID]].forEach(function (r) {
        const cx = TUB[r[0]];
        const rand = function (nume, tj, y) {
          const gata = tau >= tj;
          F.scrie(ctx, [[nume + ": "], [gata ? F.numar(tj, 2) + " s" : "…"]], cx, y,
            { marime: 18, align: "center", culoare: gata ? CERNEALA : GRI, greutate: gata ? 700 : 500 });
        };
        rand("bila", r[1], 554);
        rand("pana", r[2], 578);
      });

      // legenda
      let lx = 52;
      [[ROSU, vec("v"), " viteza"], [VIOLET, vec("G"), " greutatea"], [ALBASTRU, cat(vec("F"), [["rez", "sub"]]), " rezistența aerului"]].forEach(function (l) {
        F.sageata(ctx, lx, 626, lx + 30, 626, { culoare: l[0], grosime: 3, cap: 10 });
        lx += 38;
        lx += F.scrie(ctx, cat(l[1], [[l[2]]]), lx, 632, { marime: 17, culoare: CERNEALA }) + 30;
      });
    }
    return { draw: draw };
  });

  // =====================================================================
  //  3. Corpul aruncat vertical în sus (fig. 1.36) + graficele v_y(t) și y(t)
  // =====================================================================
  Deck.animatie($("a-aruncare"), function (a) {
    const XA = 118, YO = 548, PXM = 15.5, KV = 4.6;
    const GX0 = 380, GX1 = 830, PXS = 88;          // axa timpului: 0…5 s
    const V_Y0 = 150, V_PX = 4.2;                   // graficul vitezei: zero la y = 150
    const Y_Y0 = 500, Y_PX = 5.6;                   // graficul coordonatei: zero la y = 500
    const TEMPO = 0.8, ASTEAPTA = 0.7, PAUZA = 1.8;
    const st = { v0: 19.6, start: null };
    const slider = $("v0"), afis = $("v0-val");
    function citeste() {
      st.v0 = +slider.value;
      afis.textContent = F.numar(st.v0, 1) + " m/s";
      st.start = null; // aruncăm din nou
    }
    slider.addEventListener("input", citeste);
    slider.addEventListener("change", function () { slider.blur(); });

    function graficAxe(ctx, y0, sus, jos, titlu, gradatii, px) {
      ctx.strokeStyle = AXA; ctx.lineWidth = 1.5;
      F.sageata(ctx, GX0, jos, GX0, sus, { culoare: AXA, grosime: 1.5, cap: 10 });
      F.sageata(ctx, GX0, y0, GX1 + 10, y0, { culoare: AXA, grosime: 1.5, cap: 10 });
      F.scrie(ctx, titlu, GX0 + 10, sus + 6, { marime: 17, culoare: GRI });
      F.scrie(ctx, [["t", "i"], [", s"]], GX1 + 12, y0 - 10, { marime: 16, align: "right", culoare: GRI });
      ctx.font = "500 14px " + F.SANS;
      for (let s = 1; s <= 5; s++) {
        const x = GX0 + s * PXS;
        ctx.fillStyle = AXA; ctx.fillRect(x - 0.75, y0 - 4, 1.5, 8);
        F.scrie(ctx, [[s + ""]], x, y0 + 20, { marime: 14, align: "center", culoare: GRI, greutate: 500 });
      }
      gradatii.forEach(function (g) {
        const y = y0 - g * px;
        ctx.fillStyle = "rgba(138, 145, 156, 0.25)"; ctx.fillRect(GX0, y - 0.5, GX1 - GX0, 1);
        F.scrie(ctx, [[F.numar(g)]], GX0 - 8, y + 5, { marime: 14, align: "right", culoare: GRI, greutate: 500 });
      });
    }

    function draw(ctx, t) {
      if (st.start === null) st.start = t;
      const v0 = st.v0, tz = 2 * v0 / G, tu = v0 / G, hmax = v0 * v0 / (2 * G);
      const ciclu = ASTEAPTA + tz / TEMPO + PAUZA;
      const tc = (t - st.start) % ciclu;
      const tr = F.limita((tc - ASTEAPTA) * TEMPO, 0, tz); // timpul real de la aruncare
      const zbor = tc > ASTEAPTA && tr < tz;
      const vy = zbor ? v0 - G * tr : tc <= ASTEAPTA ? v0 : 0;
      const y = v0 * tr - G * tr * tr / 2;

      // ---- fig. 1.36: axa Oy, corpul, vectorii
      ctx.fillStyle = "#d8cfc2"; ctx.fillRect(XA - 80, YO + 2, 200, 4);
      axaY(ctx, XA, YO + 30, 30, "y");
      F.scrie(ctx, it("O"), XA - 14, YO + 2, { marime: 22, align: "right" });
      const yH = YO - hmax * PXM;
      ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = "#b9a9c9"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(XA - 70, yH); ctx.lineTo(XA + 185, yH); ctx.stroke(); ctx.restore();
      F.scrie(ctx, cat(vec("v", "y"), [[" = 0"]]), XA - 24, yH - 10, { marime: 18, align: "right", culoare: ROSU });
      F.scrie(ctx, cat(it("H", "max"), [[" = " + F.numar(hmax, 1) + " m"]]), XA + 185, yH + 22, { marime: 17, align: "right" });
      // urmele la fiecare 0,2 s
      for (let k = 1; k * 0.2 < tr; k++) {
        const tk = k * 0.2, yk = YO - (v0 * tk - G * tk * tk / 2) * PXM;
        ctx.beginPath(); ctx.arc(XA, yk, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(207, 39, 65, 0.22)"; ctx.fill();
      }
      const yb = YO - y * PXM - 11;
      bila(ctx, XA, yb, 11);
      if (Math.abs(vy) * KV > 4) {
        vector(ctx, XA + 26, yb, XA + 26, yb - vy * KV, ROSU, tc <= ASTEAPTA ? vec("v", "0") : vec("v", "y"), { dx: 8, dy: vy > 0 ? 16 : 0, marime: 20, min: 30 });
      }
      vector(ctx, XA - 28, yb, XA - 28, yb + 48, VIOLET, vec("g"), { dx: -8, dy: 0, align: "right", marime: 20 });

      // ---- graficele
      graficAxe(ctx, V_Y0, 28, 272, cat(it("v", "y")).concat([[", m/s"]]), [-20, -10, 10, 20], V_PX);
      graficAxe(ctx, Y_Y0, 318, Y_Y0 + 4, cat(it("y")).concat([[", m"]]), [10, 20, 30], Y_PX);
      // t_urc: linie punctată prin ambele grafice
      const xu = GX0 + tu * PXS;
      ctx.save(); ctx.setLineDash([5, 6]); ctx.strokeStyle = "rgba(95, 101, 115, 0.45)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(xu, 40); ctx.lineTo(xu, Y_Y0); ctx.stroke(); ctx.restore();
      F.scrie(ctx, it("t", "urc"), xu + 6, 42, { marime: 17, culoare: GRI });
      function curba(f, y0, px, pana, stil) {
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const ti = (pana * i) / 120;
          const x = GX0 + ti * PXS, yy = y0 - f(ti) * px;
          if (i === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.strokeStyle = stil.c; ctx.lineWidth = stil.w;
        if (stil.dash) ctx.setLineDash(stil.dash);
        ctx.stroke();
        ctx.restore();
      }
      const fv = function (x) { return v0 - G * x; }, fy = function (x) { return v0 * x - G * x * x / 2; };
      curba(fv, V_Y0, V_PX, tz, { c: "rgba(224, 49, 75, 0.25)", w: 2, dash: [6, 6] });
      curba(fy, Y_Y0, Y_PX, tz, { c: "rgba(224, 49, 75, 0.25)", w: 2, dash: [6, 6] });
      if (tr > 0) {
        curba(fv, V_Y0, V_PX, tr, { c: ROSU, w: 3.5 });
        curba(fy, Y_Y0, Y_PX, tr, { c: ROSU, w: 3.5 });
      }
      [[V_Y0 - fv(tr) * V_PX], [Y_Y0 - fy(tr) * Y_PX]].forEach(function (p) {
        ctx.beginPath(); ctx.arc(GX0 + tr * PXS, p[0], 6, 0, Math.PI * 2);
        ctx.fillStyle = ROSU; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = "#fff"; ctx.stroke();
      });
      F.scrie(ctx, [["dreaptă"]], GX0 + tz * 0.75 * PXS + 16, V_Y0 - fv(tz * 0.75) * V_PX - 4, { marime: 15, culoare: GRI });
      F.scrie(ctx, [["parabolă"]], GX0 + tu * PXS, Y_Y0 - hmax * Y_PX - 12, { marime: 15, align: "center", culoare: GRI });

      // ---- valorile
      F.cutie(ctx, GX0 - 10, 540, GX1 - GX0 + 24, 50, { fond: "rgba(255,255,255,0.94)", contur: "#eadde0", raza: 12 });
      const val = cat([["t", "i"], [" = " + F.numar(tr, 2) + " s      "]], it("v", "y"), [[" = " + F.numar(vy, 1) + " m/s      "]],
        it("y"), [[" = " + F.numar(y, 1) + " m"]]);
      F.scrie(ctx, val, (GX0 + GX1) / 2 + 2, 572, { marime: 20, align: "center", greutate: 700 });
    }
    return { draw: draw, reset: function () { st.start = null; } };
  });

  // =====================================================================
  //  4. De la legile vectoriale la formulele scalare (1.39) și (1.40)
  // =====================================================================
  Deck.animatie($("a-derivare"), function (a) {
    const OX = 150, OY = 470, V0L = 170, GX = 228, GS = 190, GJ = 290;
    const PAS = 2.2, CICLU = 11 * PAS;
    const XR = 330; // începutul coloanei cu formule

    function apare(t, pas) { return neted((t - pas * PAS) / 0.6); }

    function draw(ctx, t) {
      const tc = t % CICLU;
      const stinge = 1 - neted((tc - (CICLU - 0.6)) / 0.6);
      ctx.globalAlpha = stinge;
      const pas = Math.floor(tc / PAS);

      // ---- desenul: axele, corpul, v0 și g
      F.sageata(ctx, 24, OY, 300, OY, { culoare: AXA, grosime: 2, cap: 12 });
      F.scrie(ctx, it("x"), 296, OY + 28, { marime: 22, align: "right", culoare: GRI });
      axaY(ctx, OX, OY + 40, 50, "y");
      F.scrie(ctx, it("O"), OX - 12, OY + 26, { marime: 22, align: "right" });

      const kOy = apare(tc, 3), kG = apare(tc, 4), kOx = apare(tc, 2);
      // proiecțiile pe Oy (benzi colorate pe axă)
      if (kOy > 0) {
        ctx.fillStyle = "rgba(224, 49, 75, " + 0.28 * kOy + ")";
        ctx.fillRect(OX - 7, OY - V0L, 14, V0L);
        ctx.globalAlpha = stinge * kOy;
        expresie(ctx, [{ p: cat(it("v"), [["0y", "sub"]]) }, { p: [[" = +"]] }, { p: it("v", "0") }], OX - 16, OY - V0L / 2 + 8, { marime: 21, align: "right", culoare: ROSU });
        ctx.globalAlpha = stinge;
      }
      if (kG > 0) {
        ctx.save();
        ctx.setLineDash([5, 5]); ctx.strokeStyle = "rgba(138, 91, 208, " + 0.7 * kG + ")"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(GX, GS); ctx.lineTo(OX, GS); ctx.moveTo(GX, GJ); ctx.lineTo(OX, GJ); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = "rgba(138, 91, 208, " + 0.3 * kG + ")";
        ctx.fillRect(OX - 7, GS, 14, GJ - GS);
        ctx.globalAlpha = stinge * kG;
        F.scrie(ctx, cat(it("g", "y"), [[" = −"]], it("g")), OX - 16, (GS + GJ) / 2 + 8, { marime: 21, align: "right", culoare: VIOLET });
        ctx.globalAlpha = stinge;
      }
      if (kOx > 0) {
        ctx.globalAlpha = stinge * kOx;
        F.scrie(ctx, cat(it("v"), [["0x", "sub"]], [[" = 0;  "]], it("g", "x"), [[" = 0"]]), OX + 6, OY + 66, { marime: 19, align: "center", culoare: CERNEALA });
        F.scrie(ctx, cat([["⇒ "]], it("v", "x"), [[" = 0,  "]], it("x"), [[" = 0"]]), OX + 6, OY + 98, { marime: 19, align: "center", culoare: CERNEALA, greutate: 700 });
        ctx.globalAlpha = stinge;
      }
      bila(ctx, OX, OY - 10, 10);
      vector(ctx, OX + 22, OY - 10, OX + 22, OY - 10 - V0L + 10, ROSU, vec("v", "0"), { dx: 8, dy: 14, marime: 22 });
      vector(ctx, GX, GS, GX, GJ, VIOLET, vec("g"), { dx: 10, dy: -8, marime: 22 });

      // ---- formulele, pas cu pas
      const randuri = [
        // [pas, y, bucăți, opțiuni]
        [0, 60, [{ p: [["Viteza:"]] }], { marime: 18, culoare: GRI }],
        [0, 98, [{ p: vec("v") }, { p: [[" = "]] }, { p: vec("v", "0") }, { p: [[" + "]] }, { p: vec("g") }, { p: it("t") }]],
        [5, 142, [{ p: it("v", "y") }, { p: [[" = "]] }, { p: cat(it("v"), [["0y", "sub"]]) }, { p: [[" + "]] }, { p: it("g", "y") }, { p: it("t") }]],
        [6, 186, [{ p: it("v", "y") }, { p: [[" = "]] }, { p: it("v", "0"), c: ROSU }, { p: [[" + ("]] }, { p: cat([["−"]], it("g")), c: VIOLET }, { p: [[")"]] }, { p: it("t") }]],
        [0, 300, [{ p: [["Coordonata:"]] }], { marime: 18, culoare: GRI }],
        [0, 346, [{ p: vec("r") }, { p: [[" = "]] }, { p: vec("r", "0") }, { p: [[" + "]] }, { p: vec("v", "0") }, { p: it("t") }, { p: [[" + "]] }, { num: cat(vec("g"), it("t"), [["2", "sup"]]), den: [["2"]] }]],
        [5, 410, [{ p: it("y") }, { p: [[" = "]] }, { p: it("y", "0") }, { p: [[" + "]] }, { p: cat(it("v"), [["0y", "sub"]]) }, { p: it("t") }, { p: [[" + "]] }, { num: cat(it("g", "y"), it("t"), [["2", "sup"]]), den: [["2"]] }]],
        [6, 474, [{ p: it("y") }, { p: [[" = "]] }, { p: [["0"]], c: GRI }, { p: [[" + "]] }, { p: it("v", "0"), c: ROSU }, { p: it("t") }, { p: [[" + "]] }, { num: cat([["("]], [["−"]], it("g"), [[")"]], it("t"), [["2", "sup"]]), den: [["2"]], c: VIOLET }]],
      ];
      randuri.forEach(function (r) {
        const k = apare(tc, r[0]);
        if (k <= 0) return;
        ctx.globalAlpha = stinge * k;
        expresie(ctx, r[2], XR + 20, r[1], Object.assign({ marime: 26 }, r[3] || {}));
      });
      ctx.globalAlpha = stinge;
      // săgețile „proiectăm pe Oy”
      [[5, 112, 124], [5, 368, 384]].forEach(function (s) {
        const k = apare(tc, s[0]);
        if (k <= 0) return;
        ctx.globalAlpha = stinge * k;
        F.sageata(ctx, XR + 8, s[1] - 8, XR + 8, s[2] + 8, { culoare: GRI, grosime: 2, cap: 8 });
        ctx.globalAlpha = stinge;
      });
      // rezultatele, în chenar
      [[7, 238, [{ p: it("v", "y") }, { p: [[" = "]] }, { p: it("v", "0") }, { p: [[" − "]] }, { p: it("g") }, { p: it("t") }], "(1.39)"],
        [7, 548, [{ p: it("y") }, { p: [[" = "]] }, { p: it("v", "0") }, { p: it("t") }, { p: [[" − "]] }, { num: cat(it("g"), it("t"), [["2", "sup"]]), den: [["2"]] }], "(1.40)"]].forEach(function (r) {
        const k = apare(tc, r[0]);
        if (k <= 0) return;
        ctx.globalAlpha = stinge * k;
        F.cutie(ctx, XR + 4, r[1] - 40, 470, r[2].some(function (b) { return b.num; }) ? 74 : 58, { fond: "#fff", contur: "#cf2741", raza: 14 });
        const h = r[2].some(function (b) { return b.num; }) ? 6 : 0;
        expresie(ctx, r[2], XR + 26, r[1] + h, { marime: 30 });
        F.scrie(ctx, [[r[3]]], XR + 456, r[1] + h, { marime: 19, align: "right", culoare: GRI });
        ctx.globalAlpha = stinge;
      });
      // ce se întâmplă acum
      const lege = cat([["Legile mișcării uniform variate, cu "]], vec("a"), [[" = "]], vec("g"));
      const mesaje = [
        lege,
        lege,
        cat([["Pe axa "]], it("Ox"), [[" proiecțiile sunt nule"]]),
        cat(vec("v", "0"), [[" are sensul axei "]], it("Oy"), [[": proiecția e pozitivă"]]),
        cat(vec("g"), [[" este opus axei "]], it("Oy"), [[": proiecția e negativă"]]),
        cat([["Scriem legile pe axa "]], it("Oy")),
        [["Înlocuim proiecțiile"]],
        [["Formulele scalare (1.39) și (1.40)"]],
      ];
      F.scrie(ctx, mesaje[Math.min(pas, mesaje.length - 1)], XR + 20, 26, { marime: 19, greutate: 700, culoare: "#cf2741" });
      ctx.globalAlpha = 1;
    }
    return { draw: draw };
  });
})();
