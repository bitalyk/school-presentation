/* Desenele interactive pentru § 6 „Instrumente optice” (clasa a 9-a).
   Obiectele se pot trage cu mouse-ul sau cu degetul; imaginile se construiesc din nou la fiecare cadru,
   după regulile lentilei subțiri. Până la prima atingere, obiectele se mișcă singure (demonstrație). */
(function () {
  "use strict";

  const F = window.Fizica;
  const $ = function (id) { return document.getElementById(id); };
  const CERNEALA = "#1f2430";
  const GRI = "#5f6573";
  const AXA = "#8a919c";
  const RAZA = "#d42a7f";
  const IMAGINE = "#b0186a";
  const VERDE = "#1f8a5b";
  const AVERTISMENT = "#c0461b";
  const LENTILA_FOND = "rgba(236, 104, 150, 0.40)";
  const LENTILA_CONTUR = "#c64f7a";

  const neted = function (x) { x = F.limita(x); return x * x * (3 - 2 * x); };

  // =====================================================================
  //  Lentila subțire: trasarea razelor și formarea imaginii
  //  (coordonate de ecran: y crește în jos; „h” = înălțimea față de axă, negativă deasupra)
  // =====================================================================

  // o rază = un punct și panta dy/dx; după lentilă: panta' = panta − h/f
  function prinLentila(r, xL, f, ya) {
    const y = r.y + r.s * (xL - r.x);
    return { x: xL, y: y, s: r.s - (y - ya) / f };
  }
  const laX = function (r, x) { return r.y + r.s * (x - r.x); };

  // imaginea unui obiect aflat la xo, cu înălțimea h, dată de lentila (xL, f)
  function imagine(xL, f, xo, h) {
    const d = xL - xo;
    if (Math.abs(d - f) < 1e-6) return null;
    const dp = (d * f) / (d - f);
    return { x: xL + dp, h: (-h * dp) / d, reala: dp > 0, m: Math.abs(dp / d), dp: dp, d: d };
  }

  // =====================================================================
  //  Piese de desen
  // =====================================================================

  function axa(ctx, x1, x2, y) {
    ctx.strokeStyle = AXA;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
  }

  function lentila(ctx, x, y, h, o) {
    o = o || {};
    const g = o.gros || Math.max(9, h * 0.07);
    ctx.beginPath();
    ctx.moveTo(x, y - h / 2);
    ctx.quadraticCurveTo(x + 2 * g, y, x, y + h / 2);
    ctx.quadraticCurveTo(x - 2 * g, y, x, y - h / 2);
    ctx.closePath();
    ctx.fillStyle = o.fond || LENTILA_FOND;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = o.contur || LENTILA_CONTUR;
    ctx.stroke();
  }

  // lentilă plan-convexă (pentru condensor): partea plană spre `plan` (−1 stânga, +1 dreapta)
  function lentilaPlanConvexa(ctx, x, y, h, plan) {
    const g = 16;
    ctx.beginPath();
    ctx.moveTo(x, y - h / 2);
    ctx.lineTo(x, y + h / 2);
    ctx.quadraticCurveTo(x - plan * 2 * g, y, x, y - h / 2);
    ctx.closePath();
    ctx.fillStyle = "rgba(220, 70, 150, 0.55)";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = LENTILA_CONTUR;
    ctx.stroke();
  }

  function punctAxa(ctx, x, y, eticheta, o) {
    o = o || {};
    ctx.beginPath();
    ctx.arc(x, y, o.r || 4.5, 0, Math.PI * 2);
    ctx.fillStyle = o.culoare || CERNEALA;
    ctx.fill();
    if (eticheta) F.scrie(ctx, eticheta, x + (o.dx || 0), y + (o.dy || 30), { marime: o.marime || 20, align: "center", culoare: o.culoare || CERNEALA });
  }

  // săgeată verticală (obiect sau imagine) de la axă (y0) la vârf (y1)
  function sageataVert(ctx, x, y0, y1, o) {
    o = o || {};
    const c = o.culoare || CERNEALA;
    const lung = Math.abs(y1 - y0);
    if (lung < 1) return;
    const dir = y1 < y0 ? -1 : 1;
    const cap = Math.min(o.cap || 14, lung * 0.6);
    ctx.save();
    ctx.strokeStyle = c;
    ctx.fillStyle = c;
    ctx.lineWidth = o.grosime || 4;
    ctx.lineCap = "round";
    if (o.punctat) ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1 - dir * cap * 0.7); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha *= o.punctat ? 0.85 : 1;
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x - cap * 0.55, y1 - dir * cap);
    ctx.lineTo(x + cap * 0.55, y1 - dir * cap);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // o rază: linie frântă prin `puncte`, cu o săgeată mică la mijlocul fiecărui segment
  function raza(ctx, puncte, o) {
    o = o || {};
    ctx.save();
    ctx.strokeStyle = o.culoare || RAZA;
    ctx.fillStyle = o.culoare || RAZA;
    ctx.lineWidth = o.grosime || 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (o.punctat) { ctx.setLineDash([7, 7]); ctx.globalAlpha *= 0.75; ctx.lineWidth = 2; }
    ctx.beginPath();
    ctx.moveTo(puncte[0][0], puncte[0][1]);
    for (let i = 1; i < puncte.length; i++) ctx.lineTo(puncte[i][0], puncte[i][1]);
    ctx.stroke();
    ctx.setLineDash([]);
    if (o.sageti !== false && !o.punctat) {
      for (let i = 1; i < puncte.length; i++) {
        const a = puncte[i - 1], b = puncte[i];
        const lung = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (lung < 60) continue;
        const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        ctx.beginPath();
        ctx.moveTo(mx + 7 * Math.cos(ang), my + 7 * Math.sin(ang));
        ctx.lineTo(mx - 6 * Math.cos(ang) - 5.5 * Math.sin(ang), my - 6 * Math.sin(ang) + 5.5 * Math.cos(ang));
        ctx.lineTo(mx - 6 * Math.cos(ang) + 5.5 * Math.sin(ang), my - 6 * Math.sin(ang) - 5.5 * Math.cos(ang));
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // ochiul observatorului, privind spre stânga
  function ochi(ctx, x, y, s) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.quadraticCurveTo(4, -26, 26, -6);
    ctx.lineTo(26, 6);
    ctx.quadraticCurveTo(4, 26, -22, 0);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = CERNEALA;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-8, 0, 8.5, 0, Math.PI * 2);
    ctx.fillStyle = "#3d6f9e";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-9, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = CERNEALA;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-14, -14); ctx.quadraticCurveTo(6, -30, 28, -12);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // inel care pulsează în jurul unui obiect care se poate trage
  function maner(ctx, x, y, t, invita) {
    const p = invita ? 0.5 + 0.5 * Math.sin(t * 4) : 0;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 13 + 5 * p, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(194, 37, 122, " + (0.1 + 0.08 * p) + ")";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(194, 37, 122, " + (0.55 + 0.35 * p) + ")";
    ctx.stroke();
    ctx.restore();
  }

  // panou cu text: rânduri de forma { parti, culoare, greutate }
  function panou(ctx, x, y, w, randuri, o) {
    o = o || {};
    const rh = o.rand || 30;
    const h = randuri.length * rh + 22;
    F.cutie(ctx, x, y, w, h, { fond: "rgba(255,255,255,0.94)", contur: "#e9dfe6", raza: 14 });
    randuri.forEach(function (r, i) {
      F.scrie(ctx, r.parti, x + 18, y + 33 + i * rh, {
        marime: r.marime || o.marime || 19, greutate: r.greutate || 600, culoare: r.culoare || CERNEALA,
      });
    });
    return h;
  }

  const lit = function (l, ind) { return ind ? [[l, "i"], [ind, "sub"]] : [[l, "i"]]; };
  const AB = [["AB", "i"]];
  const A1B1 = [["A", "i"], ["1", "sub"], ["B", "i"], ["1", "sub"]];
  const A2B2 = [["A", "i"], ["2", "sub"], ["B", "i"], ["2", "sub"]];
  const cat = function () { return Array.prototype.concat.apply([], arguments); };

  // =====================================================================
  //  Tragerea cu mouse-ul sau cu degetul
  //  o.tinte() → [{ id, x, y, r } sau { id, x1, y1, x2, y2 }];  o.muta(id, x, y)
  // =====================================================================
  function tragere(a, o) {
    const c = a.canvas;
    c.classList.add("interactiv");
    let activ = null;
    function poz(e) {
      const r = c.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * a.w, ((e.clientY - r.top) / r.height) * a.h];
    }
    function gaseste(p) {
      let best = null, bd = Infinity;
      o.tinte().forEach(function (t) {
        let d;
        if (t.r !== undefined) d = Math.hypot(p[0] - t.x, p[1] - t.y) - t.r;
        else d = Math.max(t.x1 - p[0], p[0] - t.x2, t.y1 - p[1], p[1] - t.y2);
        if (d <= 0 && d < bd) { bd = d; best = t; }
      });
      return best;
    }
    c.addEventListener("pointerdown", function (e) {
      const p = poz(e);
      const t = gaseste(p);
      if (!t) return;
      const ref = t.r !== undefined ? [t.x, t.y] : [(t.x1 + t.x2) / 2, (t.y1 + t.y2) / 2];
      activ = { id: t.id, dx: ref[0] - p[0], dy: ref[1] - p[1] };
      c.setPointerCapture(e.pointerId);
      c.classList.add("trage");
      e.preventDefault();
    });
    c.addEventListener("pointermove", function (e) {
      const p = poz(e);
      if (activ) o.muta(activ.id, p[0] + activ.dx, p[1] + activ.dy);
      else c.classList.toggle("prinde", !!gaseste(p));
    });
    function gata() {
      if (!activ) return;
      activ = null;
      c.classList.remove("trage");
    }
    c.addEventListener("pointerup", gata);
    c.addEventListener("pointercancel", gata);
  }

  // =====================================================================
  //  1. Titlu: razele paralele se strâng în focarul lentilei
  // =====================================================================
  Deck.animatie($("a-titlu"), function (a) {
    const YA = 280, XL = 230, f = 170;
    return function (ctx, t) {
      axa(ctx, 10, 550, YA);
      [-120, -60, 0, 60, 120].forEach(function (h) {
        const r = prinLentila({ x: 0, y: YA + h, s: 0 }, XL, f, YA);
        ctx.save();
        ctx.strokeStyle = RAZA;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.9;
        ctx.setLineDash([16, 12]);
        ctx.lineDashOffset = -t * 70;
        ctx.beginPath();
        ctx.moveTo(0, YA + h);
        ctx.lineTo(XL, YA + h);
        ctx.lineTo(560, laX(r, 560));
        ctx.stroke();
        ctx.restore();
      });
      lentila(ctx, XL, YA, 330, { gros: 26 });
      const p = 0.5 + 0.5 * Math.sin(t * 3);
      const g = ctx.createRadialGradient(XL + f, YA, 2, XL + f, YA, 30 + 8 * p);
      g.addColorStop(0, "rgba(255, 214, 90, 0.95)");
      g.addColorStop(1, "rgba(255, 214, 90, 0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(XL + f, YA, 40, 0, Math.PI * 2); ctx.fill();
      punctAxa(ctx, XL + f, YA, lit("F"), { dy: 36, marime: 26 });
      punctAxa(ctx, XL - f, YA, lit("F"), { dy: 36, marime: 26 });
      F.scrie(ctx, lit("O"), XL + 16, YA + 30, { marime: 24 });
    };
  });

  // =====================================================================
  //  2. Lupa: obiectul între lupă și focar → imagine virtuală, dreaptă, mărită
  // =====================================================================
  Deck.animatie($("a-lupa"), function (a) {
    const YA = 440, XL = 600, f = 170, PXCM = f / 5; // f = 5 cm
    const st = { auto: true, d: 0.4 * f, h: 60 };
    tragere(a, {
      tinte: function () { return [{ id: "B", x: XL - st.d, y: YA - st.h, r: 34 }]; },
      muta: function (id, x, y) {
        st.auto = false;
        st.d = F.limita(XL - x, 0.25 * f, 0.75 * f);
        st.h = F.limita(YA - y, 25, 85);
      },
    });

    function draw(ctx, t) {
      if (st.auto) st.d = f * (0.5 + 0.22 * Math.sin(t * 0.7 - 1.2));
      const xo = XL - st.d, yB = YA - st.h;
      const im = imagine(XL, f, xo, -st.h);
      const xi = im.x, yi = YA + im.h;

      // zona în care se pune obiectul: între F și lupă
      ctx.fillStyle = "rgba(194, 37, 122, 0.08)";
      ctx.fillRect(XL - f, YA - 3, f, 6);
      F.scrie(ctx, [["obiectul se pune între "], ["F", "i"], [" și lupă"]], XL - f / 2, YA + 88,
        { marime: 17, align: "center", culoare: "#a0407a" });

      axa(ctx, 10, 850, YA);
      // prelungirile (punctate) ale razelor refractate: ele se întâlnesc în B₁
      raza(ctx, [[XL, yB], [xi, yi]], { punctat: true });
      raza(ctx, [[XL, YA], [xi, yi]], { punctat: true });
      // razele reale
      const r1 = { x: XL, y: yB, s: (YA - yB) / f };
      const r2 = { x: XL, y: YA, s: (YA - yB) / (XL - xo) };
      raza(ctx, [[xo, yB], [XL, yB], [850, laX(r1, 850)]]);
      raza(ctx, [[xo, yB], [XL, YA], [850, laX(r2, 850)]]);

      lentila(ctx, XL, YA, 300);
      punctAxa(ctx, XL - f, YA, lit("F"));
      punctAxa(ctx, XL + f, YA, lit("F"));
      punctAxa(ctx, XL - 2 * f, YA, [["2"], ["F", "i"]]);
      F.scrie(ctx, lit("O"), XL + 14, YA + 28, { marime: 20 });

      // imaginea (virtuală → punctată) și obiectul
      sageataVert(ctx, xi, YA, yi, { culoare: IMAGINE, punctat: true, grosime: 3.5, cap: 18 });
      F.scrie(ctx, lit("A", "1"), xi, YA + 56, { marime: 20, align: "center", culoare: IMAGINE });
      F.scrie(ctx, lit("B", "1"), xi - 14, yi - 6, { marime: 20, align: "right", culoare: IMAGINE });
      sageataVert(ctx, xo, YA, yB, { cap: 14 });
      F.scrie(ctx, lit("A"), xo, YA + 56, { marime: 20, align: "center" });
      F.scrie(ctx, lit("B"), xo - 12, yB - 4, { marime: 20, align: "right" });
      maner(ctx, xo, yB, t, st.auto);
      ochi(ctx, 818, YA + 2, 1.05);

      panou(ctx, 628, 16, 222, [
        { parti: [["Lupa: "], ["f", "i"], [" = 5 cm"]] },
        { parti: [["Obiectul: "], ["d", "i"], [" = " + F.numar(st.d / PXCM, 1) + " cm"]] },
        { parti: cat([["Imaginea "]], A1B1, [[":"]]), greutate: 800 },
        { parti: [["virtuală, dreaptă,"]], culoare: IMAGINE, greutate: 700 },
        { parti: [["mărită de " + F.numar(im.m, 1) + " ori"]], culoare: IMAGINE, greutate: 700 },
      ]);
    }
    return { draw: draw, reset: function () { st.auto = true; st.h = 60; } };
  });

  // =====================================================================
  //  3. Aparatul fotografic: obiect departe → imagine reală, micșorată, răsturnată, pe film
  // =====================================================================
  Deck.animatie($("a-foto"), function (a) {
    const YA = 260, XL = 560, f = 70, PXMM = f / 50; // f = 50 mm
    const st = { auto: true, d: 4 * f, h: 105 };
    tragere(a, {
      tinte: function () { return [{ id: "B", x: XL - st.d, y: YA - st.h, r: 34 }]; },
      muta: function (id, x, y) {
        st.auto = false;
        st.d = F.limita(XL - x, 2.4 * f, 7.6 * f);
        st.h = F.limita(YA - y, 40, 122);
      },
    });

    function draw(ctx, t) {
      if (st.auto) st.d = f * (5 + 2.4 * Math.sin(t * 0.5 - 1.6));
      const xo = XL - st.d, yB = YA - st.h;
      const im = imagine(XL, f, xo, -st.h);
      const xi = im.x, yi = YA + im.h;

      // corpul aparatului (desenat în spate)
      F.rotunjit(ctx, XL + 12, YA - 142, 190, 284, 18);
      ctx.fillStyle = "rgba(31, 36, 48, 0.05)";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#7d8390";
      ctx.stroke();
      F.rotunjit(ctx, XL - 24, YA - 132, 36, 264, 10);
      ctx.fillStyle = "rgba(31, 36, 48, 0.05)";
      ctx.fill();
      ctx.stroke();
      F.rotunjit(ctx, XL + 140, YA - 158, 44, 16, 5);
      ctx.fillStyle = "#9aa0ab";
      ctx.fill();
      F.scrie(ctx, [["aparatul fotografic"]], XL + 107, YA - 170, { marime: 17, align: "center", culoare: GRI });

      axa(ctx, 10, 850, YA);
      // filmul: se pune acolo unde se formează imaginea
      ctx.fillStyle = "#4a3b2c";
      ctx.fillRect(xi - 3, YA - 120, 6, 240);
      F.scrie(ctx, [["filmul"]], xi + 4, YA + 166, { marime: 18, greutate: 700, align: "center", culoare: "#4a3b2c" });

      // trei raze de la B: paralelă cu axa, prin centrul optic, prin focar
      const yF = YA + ((YA - yB) / (XL - f - xo)) * f; // raza prin F lovește lentila aici
      raza(ctx, [[xo, yB], [XL, yB], [xi, yi]]);
      raza(ctx, [[xo, yB], [xi, yi]]);
      raza(ctx, [[xo, yB], [XL, yF], [xi, yi]]);

      lentila(ctx, XL, YA, 262);
      for (let k = 1; k <= 7; k++) punctAxa(ctx, XL - k * f, YA, k === 1 ? lit("F") : [[k + ""], ["F", "i"]], { marime: 18 });
      punctAxa(ctx, XL + f, YA, lit("F"), { marime: 18 });
      punctAxa(ctx, XL + 2 * f, YA, [["2"], ["F", "i"]], { marime: 18 });
      F.scrie(ctx, lit("O"), XL + 12, YA - 10, { marime: 20 });

      sageataVert(ctx, xi, YA, yi, { culoare: IMAGINE, grosime: 3.5, cap: 12 });
      F.scrie(ctx, lit("B", "1"), xi + 12, Math.max(yi + 22, YA + 60), { marime: 19, culoare: IMAGINE });
      F.scrie(ctx, lit("A", "1"), xi + 10, YA - 8, { marime: 19, culoare: IMAGINE });
      sageataVert(ctx, xo, YA, yB, { cap: 16 });
      F.scrie(ctx, lit("A"), xo, YA + 56, { marime: 20, align: "center" });
      F.scrie(ctx, lit("B"), xo - 12, yB - 2, { marime: 20, align: "right" });
      maner(ctx, xo, yB, t, st.auto);

      panou(ctx, 16, 484, 828, [
        { parti: [["Obiectivul: "], ["f", "i"], [" = 50 mm.   Obiectul: "], ["d", "i"], [" = " + F.numar(st.d / f, 1) + " · "], ["F", "i"],
          [" = " + Math.round(st.d / PXMM) + " mm"]] },
        { parti: cat([["Imaginea "]], A1B1, [[" — reală, micșorată (de " + F.numar(1 / im.m, 1) + " ori), răsturnată"]]),
          culoare: IMAGINE, greutate: 800 },
        { parti: [["Distanța obiectiv – film: "], ["d", "i"], ["′ = " + Math.round(im.dp / PXMM) + " mm  (puțin mai mare decât "], ["f", "i"], [")"]] },
      ], { rand: 34, marime: 20 });
    }
    return { draw: draw, reset: function () { st.auto = true; st.h = 105; } };
  });

  // =====================================================================
  //  4. Microscopul: obiectivul L₁ dă A₁B₁ (reală, mărită); ocularul L₂ lucrează ca o lupă
  // =====================================================================
  Deck.animatie($("a-microscop"), function (a) {
    const YA = 200, X1 = 210, f1 = 60, f2 = 150;
    const VEDERE = 200; // observatorul reglează ocularul până vede A₂B₂ la această distanță de L₂
    const st = { demo: true, regleaza: true, d: 1.3 * f1, h: 18, L2: 0 };
    const pozA1 = function () { return X1 + (st.d * f1) / (st.d - f1); };
    const ocularReglat = function () { return F.limita(pozA1() + (VEDERE * f2) / (VEDERE + f2), 300, 760); };
    st.L2 = ocularReglat();
    tragere(a, {
      tinte: function () {
        return [
          { id: "B", x: X1 - st.d, y: YA - st.h, r: 28 },
          { id: "L2", x1: st.L2 - 26, x2: st.L2 + 26, y1: YA - 150, y2: YA + 150 },
        ];
      },
      muta: function (id, x, y) {
        st.demo = false;
        if (id === "B") {
          st.d = F.limita(X1 - x, 1.2 * f1, 1.45 * f1);
          st.h = F.limita(YA - y, 8, 26);
        } else {
          st.regleaza = false; // de acum ocularul stă unde l-a lăsat elevul
          st.L2 = F.limita(x, 300, 760);
        }
      },
    });

    function draw(ctx, t, dt) {
      if (st.demo) st.d = f1 * (1.32 + 0.11 * Math.sin(t * 0.55 - 0.5));
      if (st.regleaza) st.L2 += (ocularReglat() - st.L2) * Math.min(1, dt * 5);
      const xo = X1 - st.d;
      let h = -st.h;
      let i1 = imagine(X1, f1, xo, h);
      let u2 = st.L2 - i1.x;
      const clar = u2 > 4 && u2 < f2 * 0.985;
      let i2 = clar ? imagine(st.L2, f2, i1.x, i1.h) : null;
      if (i2 && Math.abs(i2.h) > 290) { // A₂B₂ să încapă în desen
        h *= 290 / Math.abs(i2.h);
        i1 = imagine(X1, f1, xo, h);
        i2 = imagine(st.L2, f2, i1.x, i1.h);
      }
      const yB = YA + h;
      const xi1 = i1.x, yi1 = YA + i1.h;

      axa(ctx, 10, 850, YA);

      // razele: paralelă cu axa și prin centrul optic O₁; trec prin L₁, apoi prin L₂
      const iesiri = [];
      [{ x: xo, y: yB, s: 0 }, { x: xo, y: yB, s: (YA - yB) / (X1 - xo) }].forEach(function (r0) {
        const r1 = prinLentila(r0, X1, f1, YA);
        const r2 = prinLentila(r1, st.L2, f2, YA);
        iesiri.push(r2);
        const xEnd = Math.min(850, st.L2 + 170);
        raza(ctx, [[xo, yB], [X1, r1.y], [st.L2, r2.y], [xEnd, laX(r2, xEnd)]]);
      });
      if (i2) {
        const xi2 = i2.x, yi2 = YA + i2.h;
        iesiri.forEach(function (r) { raza(ctx, [[r.x, r.y], [xi2, yi2]], { punctat: true }); });
        sageataVert(ctx, xi2, YA, yi2, { culoare: IMAGINE, punctat: true, grosime: 3.5, cap: 18 });
        if (xi2 > 24) {
          F.scrie(ctx, lit("A", "2"), xi2 + 8, YA - 12, { marime: 20, culoare: IMAGINE });
          F.scrie(ctx, lit("B", "2"), xi2 - 12, yi2 + 6, { marime: 20, align: "right", culoare: IMAGINE });
        }
      }

      lentila(ctx, X1, YA, 120);
      lentila(ctx, st.L2, YA, 300);
      punctAxa(ctx, X1 - f1, YA, lit("F", "1"), { marime: 18, dy: 30, dx: 8 });
      punctAxa(ctx, X1 + f1, YA, lit("F", "1"), { marime: 18, dy: -14 });
      punctAxa(ctx, st.L2 - f2, YA, lit("F", "2"), { marime: 18, dy: -14 });
      if (st.L2 + f2 < 850) punctAxa(ctx, st.L2 + f2, YA, lit("F", "2"), { marime: 18, dy: -14 });
      F.scrie(ctx, cat(lit("L", "1"), [[" obiectiv"]]), X1, YA - 72, { marime: 19, align: "center" });
      F.scrie(ctx, cat(lit("L", "2"), [[" ocular"]]), st.L2, YA - 162, { marime: 19, align: "center" });
      maner(ctx, st.L2, YA - 128, t, st.demo);

      sageataVert(ctx, xi1, YA, yi1, { culoare: IMAGINE, grosime: 3.5, cap: 12 });
      F.scrie(ctx, lit("A", "1"), xi1, YA - 12, { marime: 19, align: "center", culoare: IMAGINE });
      F.scrie(ctx, lit("B", "1"), xi1 + 10, yi1 + 16, { marime: 19, culoare: IMAGINE });
      sageataVert(ctx, xo, YA, yB, { cap: 8, grosime: 3 });
      F.scrie(ctx, lit("A"), xo, YA + 26, { marime: 19, align: "center" });
      F.scrie(ctx, lit("B"), xo, yB - 16, { marime: 19, align: "center" });
      maner(ctx, xo, yB, t, st.demo);
      ochi(ctx, Math.min(st.L2 + 115, 830), YA + 2, 1);

      const randuri = [
        { parti: cat([["Obiectivul "]], lit("L", "1"), [[": "]], A1B1, [[" — reală, răsturnată, mărită de " + F.numar(i1.m, 1) + " ori"]]) },
      ];
      if (i2) {
        randuri.push({ parti: cat([["Ocularul "]], lit("L", "2"), [[" (ca o lupă): "]], A2B2, [[" — virtuală, răsturnată, mărită de " + F.numar(i2.m, 1) + " ori"]]), culoare: IMAGINE, greutate: 700 });
        randuri.push({ parti: [["Microscopul mărește de " + F.numar(i1.m, 1) + " × " + F.numar(i2.m, 1) + " ≈ " + Math.round(i1.m * i2.m) + " ori"]], greutate: 800 });
      } else {
        randuri.push({ parti: cat(A1B1, [[" nu este între "]], lit("L", "2"), [[" și "]], lit("F", "2"), [[" → ochiul nu vede imaginea clar."]]), culoare: AVERTISMENT, greutate: 700 });
        randuri.push({ parti: cat([["Trageți ocularul "]], lit("L", "2"), [[" până când "]], A1B1, [[" ajunge între "]], lit("L", "2"), [[" și "]], lit("F", "2"), [["."]]), culoare: AVERTISMENT });
      }
      panou(ctx, 16, 524, 828, randuri, { rand: 30, marime: 19 });
    }
    return {
      draw: draw,
      reset: function () { st.demo = true; st.regleaza = true; st.h = 18; st.d = 1.3 * f1; st.L2 = ocularReglat(); },
    };
  });

  // =====================================================================
  //  5. Luneta: razele paralele de la un obiect îndepărtat; ocularul se reglează până când F₂ = F₁
  // =====================================================================
  Deck.animatie($("a-luneta"), function (a) {
    const YA = 250, X1 = 110, f1 = 400, F1 = X1 + f1, f2 = 130;
    const st = { auto: true, u2: 90, py: 86 };
    const panta = function () { return 0.06 + ((120 - st.py) / 80) * 0.08; };
    tragere(a, {
      tinte: function () {
        const L2 = F1 + st.u2;
        return [
          { id: "P", x: 46, y: st.py, r: 32 },
          { id: "L2", x1: L2 - 26, x2: L2 + 26, y1: YA - 120, y2: YA + 120 },
        ];
      },
      muta: function (id, x, y) {
        st.auto = false;
        if (id === "P") st.py = F.limita(y, 40, 120);
        else {
          st.u2 = F.limita(x - F1, 40, 165);
          if (Math.abs(st.u2 - f2) < 6) st.u2 = f2; // „se prinde” când focarele coincid
        }
      },
    });

    function draw(ctx, t) {
      if (st.auto) {
        const P = 10, s = t % P;
        const k = s < 4 ? neted(s / 4) : s < 6 ? 1 : 1 - neted((s - 6) / 4);
        st.u2 = 70 + (f2 - 70) * k;
      }
      const L2 = F1 + st.u2;
      const s = panta();
      const yB1 = YA + f1 * s;
      const laInfinit = Math.abs(st.u2 - f2) < 0.5;
      const virtuala = st.u2 < f2 - 0.5;
      const i2 = virtuala ? imagine(L2, f2, F1, yB1 - YA) : null;

      axa(ctx, 10, 850, YA);
      const iesiri = [];
      [-80, 0, 80].forEach(function (hh) {
        const r0 = { x: X1, y: YA + hh, s: s };
        const r1 = prinLentila(r0, X1, f1, YA);
        const r2 = prinLentila(r1, L2, f2, YA);
        iesiri.push(r2);
        raza(ctx, [[0, laX(r0, 0)], [X1, r1.y], [L2, r2.y], [850, laX(r2, 850)]]);
      });
      if (i2) {
        const xi2 = i2.x, yi2 = YA + i2.h;
        iesiri.forEach(function (r) { raza(ctx, [[r.x, r.y], [xi2, yi2]], { punctat: true }); });
        sageataVert(ctx, xi2, YA, yi2, { culoare: IMAGINE, punctat: true, grosime: 3.5, cap: 18 });
        if (xi2 > 20) {
          F.scrie(ctx, lit("A", "2"), xi2, YA - 12, { marime: 20, align: "center", culoare: IMAGINE });
          F.scrie(ctx, lit("B", "2"), xi2 - 12, Math.min(yi2 + 10, 450), { marime: 20, align: "right", culoare: IMAGINE });
        }
      }

      lentila(ctx, X1, YA, 240, { gros: 13 });
      lentila(ctx, L2, YA, 220);
      F.scrie(ctx, lit("L", "1"), X1, YA - 132, { marime: 21, align: "center" });
      F.scrie(ctx, [["obiectiv"]], X1, YA + 146, { marime: 17, align: "center", culoare: GRI });
      F.scrie(ctx, lit("L", "2"), L2, YA - 122, { marime: 21, align: "center" });
      F.scrie(ctx, [["ocular"]], L2, YA + 136, { marime: 17, align: "center", culoare: GRI });
      maner(ctx, L2, YA - 96, t, st.auto);

      if (laInfinit) {
        punctAxa(ctx, F1, YA, cat(lit("F", "1"), [[" = "]], lit("F", "2")), { marime: 18, dy: -14, culoare: VERDE });
      } else {
        punctAxa(ctx, F1, YA, lit("F", "1"), { marime: 18, dy: -14 });
        const gol = Math.abs(L2 - f2 - F1), semn = L2 - f2 < F1 ? -1 : 1;
        punctAxa(ctx, L2 - f2, YA, lit("F", "2"), { marime: 18, dy: -14, dx: gol < 34 ? semn * (34 - gol) : 0 });
      }

      sageataVert(ctx, F1, YA, yB1, { culoare: IMAGINE, grosime: 3.5, cap: 10 });
      F.scrie(ctx, lit("A", "1"), F1 - 8, YA + 22, { marime: 18, align: "right", culoare: IMAGINE });
      F.scrie(ctx, lit("B", "1"), F1 + 10, yB1 + 14, { marime: 18, culoare: IMAGINE });
      ochi(ctx, Math.min(L2 + 100, 830), YA + 2, 1);

      // obiectul îndepărtat: o planetă (se trage în sus și în jos)
      const px = 46, py = st.py;
      ctx.save();
      ctx.beginPath(); ctx.arc(px, py, 15, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(px - 5, py - 5, 2, px, py, 15);
      g.addColorStop(0, "#ffe1a0"); g.addColorStop(1, "#d99a2b");
      ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.ellipse(px, py, 26, 7, -0.35, 0, Math.PI * 2);
      ctx.strokeStyle = "#b9822a"; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.restore();
      maner(ctx, px, py, t, st.auto);
      F.scrie(ctx, [["obiect foarte îndepărtat"]], px + 40, py - 18, { marime: 16, culoare: GRI });

      const randuri = [
        { parti: cat([["Razele ajung la "]], lit("L", "1"), [[" practic paralele → "]], A1B1, [[" se află în planul focal "]], lit("F", "1"), [["."]]) },
      ];
      if (laInfinit) {
        randuri.push({ parti: cat(lit("F", "2"), [[" coincide cu "]], lit("F", "1"), [[": razele ies paralele → "]], A2B2, [[" se vede la infinit."]]), culoare: VERDE, greutate: 800 });
      } else if (i2) {
        randuri.push({ parti: cat([["Ocularul "]], lit("L", "2"), [[": "]], A2B2, [[" — virtuală, răsturnată, mărită de " + F.numar(i2.m, 1) + " ori."]]), culoare: IMAGINE, greutate: 700 });
      } else {
        randuri.push({ parti: cat(A1B1, [[" este după "]], lit("F", "2"), [[" → ochiul nu vede clar. Trageți ocularul spre stânga."]]), culoare: AVERTISMENT, greutate: 700 });
      }
      randuri.push({ parti: cat([["Trageți ocularul "]], lit("L", "2"), [[" până când "]], lit("F", "2"), [[" coincide cu "]], lit("F", "1"), [["."]]), culoare: GRI });
      panou(ctx, 16, 488, 828, randuri, { rand: 33, marime: 19 });
    }
    return { draw: draw, reset: function () { st.auto = true; st.py = 86; } };
  });

  // =====================================================================
  //  6. Aparatul de proiecție: obiectul (răsturnat) între F și 2F → imagine reală, mărită, pe ecran
  // =====================================================================
  Deck.animatie($("a-proiector"), function (a) {
    const YA = 240, XO = 400, f = 100, H = 50;
    const XS = 95; // sursa S
    const st = { auto: true, x: 240 };
    tragere(a, {
      tinte: function () { return [{ id: "AB", x1: st.x - 22, x2: st.x + 22, y1: YA - 44, y2: YA + 44 }]; },
      muta: function (id, x) { st.auto = false; st.x = F.limita(x, 200, 269); },
    });

    function draw(ctx, t) {
      if (st.auto) st.x = 236 + 31 * Math.sin(t * 0.6);
      // obiectul e pus răsturnat: A sus, B jos (vârful săgeții în jos)
      const yA = YA - H / 2, yB = YA + H / 2;
      const iA = imagine(XO, f, st.x, yA - YA), iB = imagine(XO, f, st.x, yB - YA);
      const xE = iA.x, yA1 = YA + iA.h, yB1 = YA + iB.h;
      const m = iA.m;

      // lumina: de la sursă prin condensor, se strânge spre obiectiv, apoi se lărgește pe ecran
      const p = 0.5 + 0.5 * Math.sin(t * 2.4);
      ctx.fillStyle = "rgba(255, 205, 80, 0.22)";
      ctx.beginPath();
      ctx.moveTo(XS, YA); ctx.lineTo(150, YA - 70); ctx.lineTo(176, YA - 70);
      ctx.lineTo(XO, YA - 12); ctx.lineTo(xE, yB1 - 16); ctx.lineTo(xE, yA1 + 16);
      ctx.lineTo(XO, YA + 12); ctx.lineTo(176, YA + 70); ctx.lineTo(150, YA + 70);
      ctx.closePath();
      ctx.fill();

      axa(ctx, 10, 850, YA);

      // oglinda concavă N, în spatele sursei
      ctx.save();
      ctx.strokeStyle = "#7d8390";
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(XS, YA, 58, Math.PI * 0.68, Math.PI * 1.32); ctx.stroke();
      ctx.lineWidth = 1.5;
      for (let k = -4; k <= 4; k++) {
        const ang = Math.PI + k * 0.13;
        const x0 = XS + 58 * Math.cos(ang), y0 = YA + 58 * Math.sin(ang);
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 - 8, y0 + 6); ctx.stroke();
      }
      ctx.restore();
      F.scrie(ctx, lit("N"), XS - 62, YA - 62, { marime: 20, align: "center" });

      // sursa S (în focarul condensorului)
      const g = ctx.createRadialGradient(XS, YA, 2, XS, YA, 26 + 4 * p);
      g.addColorStop(0, "rgba(255, 236, 150, 1)");
      g.addColorStop(0.5, "rgba(255, 200, 60, 0.7)");
      g.addColorStop(1, "rgba(255, 200, 60, 0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(XS, YA, 32, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(XS, YA, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#ffcf3d"; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = "#b98a12"; ctx.stroke();
      F.scrie(ctx, lit("S"), XS, YA - 36, { marime: 20, align: "center" });

      // condensorul C: două lentile plan-convexe
      lentilaPlanConvexa(ctx, 150, YA, 150, -1);
      lentilaPlanConvexa(ctx, 176, YA, 150, 1);
      F.scrie(ctx, lit("C"), 163, YA + 102, { marime: 20, align: "center" });

      // construcția imaginii: razele prin centrul O și raza paralelă din B
      raza(ctx, [[st.x, yA], [XO, YA], [xE, yA1]], { grosime: 2 });
      raza(ctx, [[st.x, yB], [XO, YA], [xE, yB1]], { grosime: 2 });
      raza(ctx, [[st.x, yB], [XO, yB], [xE, yB1]], { grosime: 2 });

      // ecranul E (văzut puțin din lateral), mutat acolo unde se formează imaginea
      const hE = Math.max(110, Math.abs(yB1 - YA) + 30);
      ctx.beginPath();
      ctx.moveTo(xE - 12, YA - hE - 10); ctx.lineTo(xE + 12, YA - hE + 10);
      ctx.lineTo(xE + 12, YA + hE + 10); ctx.lineTo(xE - 12, YA + hE - 10);
      ctx.closePath();
      ctx.fillStyle = "rgba(150, 156, 168, 0.35)";
      ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = "#7d8390"; ctx.stroke();
      F.scrie(ctx, lit("E"), xE + 24, YA + hE + 4, { marime: 20 });
      sageataVert(ctx, xE, yA1, yB1, { culoare: IMAGINE, grosime: 5, cap: 18 });
      F.scrie(ctx, lit("B", "1"), xE + 20, yB1 + 8, { marime: 19, culoare: IMAGINE });
      F.scrie(ctx, lit("A", "1"), xE + 20, yA1 + 4, { marime: 19, culoare: IMAGINE });

      lentila(ctx, XO, YA, 130, { fond: "rgba(150, 156, 168, 0.45)", contur: "#7d8390" });
      F.scrie(ctx, lit("O"), XO, YA - 76, { marime: 20, align: "center" });
      punctAxa(ctx, XO - f, YA, lit("F"), { marime: 18, dy: 64 });
      punctAxa(ctx, XO - 2 * f, YA, [["2"], ["F", "i"]], { marime: 18, dy: 64 });
      punctAxa(ctx, XO + f, YA, lit("F"), { marime: 18, dy: 28 });

      // obiectul (diapozitivul), pus răsturnat
      F.rotunjit(ctx, st.x - 9, YA - 40, 18, 80, 3);
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = "#a9aeb8"; ctx.stroke();
      sageataVert(ctx, st.x, yA, yB, { grosime: 3.5, cap: 11 });
      F.scrie(ctx, lit("A"), st.x + 14, yA - 4, { marime: 18 });
      F.scrie(ctx, lit("B"), st.x + 14, yB + 14, { marime: 18 });
      maner(ctx, st.x, YA - 56, t, st.auto);

      panou(ctx, 16, 478, 828, [
        { parti: cat([["Obiectul "]], AB, [[" — între "]], lit("F"), [[" și 2"]], lit("F"), [[" ale obiectivului: "]], lit("d"), [[" = " + F.numar((XO - st.x) / f, 2) + " · "]], lit("F")) },
        { parti: cat([["Imaginea "]], A1B1, [[" pe ecran — reală, răsturnată, mărită de " + F.numar(m, 1) + " ori"]]), culoare: IMAGINE, greutate: 800 },
        { parti: cat(AB, [[" este pus răsturnat în aparat → pe ecran imaginea se vede dreaptă."]]) },
      ], { rand: 33, marime: 19 });
    }
    return { draw: draw, reset: function () { st.auto = true; } };
  });
})();
