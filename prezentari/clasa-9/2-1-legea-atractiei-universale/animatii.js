/* Animațiile pentru § 1 „Legea atracției universale” (clasa a 9-a). */
(function () {
  "use strict";

  const F = window.Fizica;
  const $ = function (id) { return document.getElementById(id); };
  const PI = Math.PI;
  const CERNEALA = "#1f2430";
  const GRI = "#5f6573";
  const AXA = "#8a919c";
  const FORTA = "#d42a7f";    // săgețile forțelor, roz ca în manual
  const ACCENT = "#c2257a";
  const CURBA = "#2f6fd0";

  const neted = function (x) { x = F.limita(x); return x * x * (3 - 2 * x); };
  const vec = function (l, ind) { return ind ? [[l, "v"], [ind, "sub"]] : [[l, "v"]]; };
  const it = function (l, ind) { return ind ? [[l, "i"], [ind, "sub"]] : [[l, "i"]]; };
  const cat = function () { return Array.prototype.concat.apply([], arguments); };
  const zece = function (exp) { return [["10"], [exp, "sup"]]; };   // 10 la puterea exp

  function latime(ctx, parti, m) { return F.scrie(ctx, parti, -5000, -5000, { marime: m }); }

  // expresie din bucăți: { p: părți } sau fracție { num, den }
  function expresie(ctx, bucati, x, y, o) {
    o = o || {};
    const m = o.marime || 24;
    const mf = m * 0.86;
    const lat = bucati.map(function (b) {
      return b.num ? Math.max(latime(ctx, b.num, mf), latime(ctx, b.den, mf)) + 12 : latime(ctx, b.p, m);
    });
    const total = lat.reduce(function (s, w) { return s + w; }, 0);
    let xx = o.align === "center" ? x - total / 2 : o.align === "right" ? x - total : x;
    bucati.forEach(function (b, i) {
      const c = b.c || o.culoare || CERNEALA;
      if (b.num) {
        const cx = xx + lat[i] / 2;
        F.scrie(ctx, b.num, cx, y - m * 0.55, { marime: mf, align: "center", culoare: c });
        F.scrie(ctx, b.den, cx, y + m * 0.78, { marime: mf, align: "center", culoare: c });
        ctx.fillStyle = c;
        ctx.fillRect(xx + 3, y - m * 0.36, lat[i] - 6, Math.max(1.5, m * 0.07));
      } else {
        F.scrie(ctx, b.p, xx, y, { marime: m, culoare: c, greutate: o.greutate });
      }
      xx += lat[i];
    });
    return total;
  }

  // ---------- corpurile ----------

  function bila(ctx, x, y, R) {
    const g = ctx.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.08, x, y, R);
    g.addColorStop(0, "#f7f7f8");
    g.addColorStop(0.55, "#b4b7bd");
    g.addColorStop(1, "#6d7179");
    ctx.beginPath();
    ctx.arc(x, y, R, 0, PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  function pamint(ctx, x, y, R) {
    ctx.save();
    if (R < 4) {
      ctx.beginPath();
      ctx.arc(x, y, Math.max(R, 1.6), 0, PI * 2);
      ctx.fillStyle = "#2f7fd6";
      ctx.fill();
      ctx.restore();
      return;
    }
    ctx.beginPath();
    ctx.arc(x, y, R, 0, PI * 2);
    const g = ctx.createRadialGradient(x - R * 0.3, y - R * 0.35, R * 0.1, x, y, R);
    g.addColorStop(0, "#8fd0ff");
    g.addColorStop(0.6, "#2f7fd6");
    g.addColorStop(1, "#174a94");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = "rgba(92, 168, 84, 0.9)";
    [[-0.35, -0.25, 0.42, 0.26, 0.5], [0.25, 0.05, 0.3, 0.42, -0.4], [-0.1, 0.5, 0.36, 0.16, 0.2], [0.55, -0.45, 0.22, 0.14, 0.3]]
      .forEach(function (c) {
        ctx.beginPath();
        ctx.ellipse(x + c[0] * R, y + c[1] * R, c[2] * R, c[3] * R, c[4], 0, PI * 2);
        ctx.fill();
      });
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.beginPath();
    ctx.ellipse(x, y - R * 0.97, R * 0.45, R * 0.14, 0, 0, PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function luna(ctx, x, y, R) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, Math.max(R, 1.4), 0, PI * 2);
    const g = ctx.createRadialGradient(x - R * 0.3, y - R * 0.35, R * 0.1, x, y, Math.max(R, 1.4));
    g.addColorStop(0, "#f1f1ef");
    g.addColorStop(1, "#8f9095");
    ctx.fillStyle = g;
    ctx.fill();
    if (R > 9) {
      ctx.clip();
      ctx.fillStyle = "rgba(110, 112, 118, 0.35)";
      [[-0.3, -0.2, 0.22], [0.3, 0.25, 0.18], [0.05, 0.5, 0.12], [0.35, -0.4, 0.1]].forEach(function (c) {
        ctx.beginPath();
        ctx.arc(x + c[0] * R, y + c[1] * R, c[2] * R, 0, PI * 2);
        ctx.fill();
      });
    }
    ctx.restore();
  }

  function soare(ctx, x, y, R) {
    const Rs = Math.max(R, 2);
    const h = ctx.createRadialGradient(x, y, Rs * 0.5, x, y, Rs * 2.4 + 6);
    h.addColorStop(0, "rgba(255, 196, 60, 0.55)");
    h.addColorStop(1, "rgba(255, 196, 60, 0)");
    ctx.fillStyle = h;
    ctx.beginPath();
    ctx.arc(x, y, Rs * 2.4 + 6, 0, PI * 2);
    ctx.fill();
    const g = ctx.createRadialGradient(x - Rs * 0.25, y - Rs * 0.25, Rs * 0.1, x, y, Rs);
    g.addColorStop(0, "#fff6c2");
    g.addColorStop(0.55, "#ffc53d");
    g.addColorStop(1, "#ef8f12");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, Rs, 0, PI * 2);
    ctx.fill();
  }

  // un elev, desenat simplu: cap rotund și corp rotunjit; (x, y) = tălpile
  function elev(ctx, x, y, h, culoare) {
    const cap = h * 0.13;
    ctx.save();
    ctx.fillStyle = culoare;
    ctx.beginPath();
    ctx.arc(x, y - h + cap, cap, 0, PI * 2);
    ctx.fill();
    const w = h * 0.36, top = y - h + cap * 2.25;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(x - w / 2, top + w * 0.4);
    ctx.quadraticCurveTo(x - w / 2, top, x, top);
    ctx.quadraticCurveTo(x + w / 2, top, x + w / 2, top + w * 0.4);
    ctx.lineTo(x + w / 2, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function linie(ctx, x1, y1, x2, y2, o) {
    o = o || {};
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = o.grosime || 1.5;
    ctx.strokeStyle = o.culoare || AXA;
    if (o.punctat) ctx.setLineDash(o.punctat);
    ctx.stroke();
    ctx.restore();
  }

  // cotă: segment cu capete scurte și eticheta la mijloc (deasupra)
  function cota(ctx, A, B, eticheta, o) {
    o = o || {};
    const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L;
    const c = o.culoare || GRI;
    linie(ctx, A.x, A.y, B.x, B.y, { culoare: c, grosime: 1.6 });
    [A, B].forEach(function (P) { linie(ctx, P.x - nx * 8, P.y - ny * 8, P.x + nx * 8, P.y + ny * 8, { culoare: c, grosime: 1.6 }); });
    if (eticheta) {
      const d = o.dist || 14;
      F.scrie(ctx, eticheta, (A.x + B.x) / 2 - nx * d, (A.y + B.y) / 2 - ny * d + 7, { marime: o.marime || 22, align: "center", culoare: o.culoareText || CERNEALA });
    }
  }

  function legenda(ctx, parti, x, y, o) {
    o = o || {};
    F.scrie(ctx, parti, x, y, { marime: o.marime || 20, align: o.align || "center", culoare: o.culoare || GRI, greutate: o.greutate || 500 });
  }

  // =====================================================================
  //  1. Titlu: Pămîntul și Luna se atrag reciproc
  // =====================================================================
  Deck.animatie($("a-titlu"), function (a) {
    const O = { x: 270, y: 290 };
    const RO = 205;
    return function (ctx, t) {
      ctx.save();
      ctx.setLineDash([3, 9]);
      ctx.beginPath();
      ctx.arc(O.x, O.y, RO, 0, PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(138, 145, 156, 0.7)";
      ctx.stroke();
      ctx.restore();

      const th = 0.6 + t * 0.32;               // în sens trigonometric
      const L = { x: O.x + RO * Math.cos(th), y: O.y - RO * Math.sin(th) };
      const ux = (O.x - L.x) / RO, uy = (O.y - L.y) / RO;
      linie(ctx, O.x, O.y, L.x, L.y, { culoare: "rgba(138, 145, 156, 0.55)", punctat: [6, 7] });
      pamint(ctx, O.x, O.y, 64);
      luna(ctx, L.x, L.y, 19);
      const LF = 46;
      F.sageata(ctx, L.x + ux * 22, L.y + uy * 22, L.x + ux * (22 + LF), L.y + uy * (22 + LF), { culoare: FORTA, grosime: 5, cap: 18 });
      F.sageata(ctx, O.x - ux * 66, O.y - uy * 66, O.x - ux * (66 + LF), O.y - uy * (66 + LF), { culoare: FORTA, grosime: 5, cap: 18 });
      // etichetele, de o parte a săgeților
      const nx = -uy, ny = ux;
      F.scrie(ctx, vec("F"), L.x + ux * 45 + nx * 28, L.y + uy * 45 + ny * 28 + 10, { marime: 28, align: "center", culoare: FORTA });
      F.scrie(ctx, vec("F"), O.x - ux * 89 - nx * 28, O.y - uy * 89 - ny * 28 + 10, { marime: 28, align: "center", culoare: FORTA });
    };
  });

  // =====================================================================
  //  2. Fig. 1: două corpuri se atrag; F ~ m1·m2 / r²
  // =====================================================================
  (function () {
    const c = $("a-atractie");
    if (!c) return;
    const in1 = $("m1"), in2 = $("m2"), inR = $("dist");
    const out1 = $("m1-val"), out2 = $("m2-val"), outR = $("dist-val");
    const st = { k1: 1, k2: 1, kr: 1, ang: 0, auto: true, ta: 0 };

    function arata() {
      in1.value = st.k1; in2.value = st.k2; inR.value = st.kr;
      out1.textContent = "× " + F.numar(st.k1, 1);
      out2.textContent = "× " + F.numar(st.k2, 1);
      outR.textContent = "× " + F.numar(st.kr, 1);
    }
    [[in1, "k1"], [in2, "k2"], [inR, "kr"]].forEach(function (p) {
      p[0].addEventListener("input", function () {
        st.auto = false;
        st.ang = 0;
        st[p[1]] = +p[0].value;
        arata();
      });
    });
    $("demo").addEventListener("click", function () { st.auto = true; st.ta = 0; });

    // demonstrația: [început, sfîrșit] pentru fiecare schimbare
    const T = 27;
    function demo(ta) {
      const u = function (a, b) { return neted((ta - a) / (b - a)); };
      let k1 = 1 + u(3, 5) - u(12, 13.5);
      let k2 = 1 + u(7.5, 9.5) - u(12, 13.5);
      let kr = 1 + u(13.5, 15.5) - u(18, 19.5);
      let ang = 0;
      if (ta > 19.5 && ta < 26.5) ang = Math.sin(((ta - 19.5) / 7) * PI * 2) * 0.62 * Math.sin(((ta - 19.5) / 7) * PI);
      st.k1 = Math.round(k1 * 100) / 100; st.k2 = Math.round(k2 * 100) / 100; st.kr = Math.round(kr * 100) / 100;
      st.ang = ang;
      let mesaj;
      if (ta < 3) mesaj = [["Corpurile se atrag cu forțe egale în modul și opuse ca sens."]];
      else if (ta < 7.5) mesaj = cat([["Masa "]], it("m", "1"), [[" crește de 2 ori  →  forța crește de 2 ori."]]);
      else if (ta < 12) mesaj = cat([["Și masa "]], it("m", "2"), [[" crește de 2 ori  →  forța e de 4 ori mai mare."]]);
      else if (ta < 13.5) mesaj = [["Revenim la masele de la început."]];
      else if (ta < 19.5) mesaj = cat([["Distanța "]], it("r"), [[" crește de 2 ori  →  forța scade de 2"]], [["2", "sup"]], [[" = 4 ori."]]);
      else mesaj = [["Forțele sînt orientate de-a lungul dreptei ce unește corpurile."]];
      return mesaj;
    }

    const MID = { x: 380, y: 236 };
    const PXR = 280, L0 = 28;

    Deck.animatie(c, function () { return {
      reset: function () { st.auto = true; st.ta = 0; },
      draw: function (ctx, t, dt) {
        let mesaj = null;
        if (st.auto) {
          st.ta = (st.ta + dt) % T;
          mesaj = demo(st.ta);
          arata();
        }
        $("demo").classList.toggle("activ", st.auto);

        const r = PXR * st.kr;
        const ux = Math.cos(st.ang), uy = -Math.sin(st.ang);
        const nx = -uy, ny = ux;                               // normala (în jos pentru unghi 0)
        const P1 = { x: MID.x - ux * r / 2, y: MID.y - uy * r / 2 };
        const P2 = { x: MID.x + ux * r / 2, y: MID.y + uy * r / 2 };
        const R1 = 22 * Math.cbrt(st.k1 * 1.6), R2 = 12 * Math.cbrt(st.k2 * 1.6);

        // dreapta ce unește corpurile
        linie(ctx, P1.x - ux * 70, P1.y - uy * 70, P2.x + ux * 70, P2.y + uy * 70, { culoare: "rgba(138, 145, 156, 0.8)", punctat: [7, 7] });
        // cota r, deasupra
        const dc = Math.max(R1, R2) + 30;
        cota(ctx, { x: P1.x - nx * dc, y: P1.y - ny * dc }, { x: P2.x - nx * dc, y: P2.y - ny * dc }, it("r"), { dist: 14, marime: 26 });
        linie(ctx, P1.x - nx * (R1 + 4), P1.y - ny * (R1 + 4), P1.x - nx * (dc + 8), P1.y - ny * (dc + 8), { culoare: "rgba(138, 145, 156, 0.6)", grosime: 1 });
        linie(ctx, P2.x - nx * (R2 + 4), P2.y - ny * (R2 + 4), P2.x - nx * (dc + 8), P2.y - ny * (dc + 8), { culoare: "rgba(138, 145, 156, 0.6)", grosime: 1 });

        bila(ctx, P1.x, P1.y, R1);
        bila(ctx, P2.x, P2.y, R2);
        F.scrie(ctx, it("m", "1"), P1.x + nx * (R1 + 24) - ux * (R1 * 0.6 + 12), P1.y + ny * (R1 + 24) - uy * (R1 * 0.6 + 12) + 8, { marime: 26, align: "center" });
        F.scrie(ctx, it("m", "2"), P2.x + nx * (R2 + 24) + ux * (R2 * 0.6 + 12), P2.y + ny * (R2 + 24) + uy * (R2 * 0.6 + 12) + 8, { marime: 26, align: "center" });

        // forțele: pornesc de la suprafața fiecărui corp, spre celălalt
        const f = (st.k1 * st.k2) / (st.kr * st.kr);
        const L = L0 * f;
        const A1 = { x: P1.x + ux * R1, y: P1.y + uy * R1 };
        const B1 = { x: A1.x + ux * L, y: A1.y + uy * L };
        const A2 = { x: P2.x - ux * R2, y: P2.y - uy * R2 };
        const B2 = { x: A2.x - ux * L, y: A2.y - uy * L };
        const cap = Math.min(16, L * 0.7);
        F.sageata(ctx, A1.x, A1.y, B1.x, B1.y, { culoare: FORTA, grosime: 4.5, cap: cap });
        F.sageata(ctx, A2.x, A2.y, B2.x, B2.y, { culoare: FORTA, grosime: 4.5, cap: cap });
        const de = 32, dl = Math.max(L / 2, 24);
        F.scrie(ctx, vec("F", "21"), A1.x + ux * dl + nx * de, A1.y + uy * dl + ny * de + 9, { marime: 26, align: "center", culoare: FORTA });
        F.scrie(ctx, vec("F", "12"), A2.x - ux * dl + nx * de, A2.y - uy * dl + ny * de + 9, { marime: 26, align: "center", culoare: FORTA });

        // citirea: F = k1·k2 / kr² · F0
        F.scrie(ctx, [["Fig. 1"]], 20, 34, { marime: 19, culoare: GRI, greutate: 500 });
        expresie(ctx, [
          { p: cat(it("F"), [[" = "]]) },
          { num: [[F.numar(st.k1, 1) + " · " + F.numar(st.k2, 1)]], den: [[F.numar(st.kr, 1)], ["2", "sup"]] },
          { p: cat([[" · "]], it("F", "0"), [[" = "]]) },
          { p: cat([[F.numar(f, 2) + " "]], it("F", "0")), c: ACCENT },
        ], 740, 56, { marime: 24, align: "right" });

        if (mesaj) legenda(ctx, mesaj, 380, 452, { marime: 21, culoare: CERNEALA, greutate: 600 });
        else legenda(ctx, cat(it("F", "0"), [[" — forța de la început (masele și distanța × 1)"]]), 380, 452, { marime: 19 });
      },
    }; });
    arata();
  })();

  // =====================================================================
  //  3. Exemple de calcul cu formula (1)
  // =====================================================================
  (function () {
    const c = $("a-exemple");
    if (!c) return;
    const W = 640;
    const CY = 200;          // linia corpurilor în desen
    const G = [["6,67·10"], ["−11", "sup"]];

    const cazuri = [
      {
        titlu: "Două bile de 1 kg, la 1 m una de alta",
        desen: function (ctx) {
          bila(ctx, 190, CY, 44);
          bila(ctx, 450, CY, 44);
          cota(ctx, { x: 190, y: CY - 78 }, { x: 450, y: CY - 78 }, [["r = 1 m"]], { marime: 21 });
          F.sageata(ctx, 236, CY, 248, CY, { culoare: FORTA, grosime: 3, cap: 9 });
          F.sageata(ctx, 404, CY, 392, CY, { culoare: FORTA, grosime: 3, cap: 9 });
          legenda(ctx, [["1 kg"]], 190, CY + 76); legenda(ctx, [["1 kg"]], 450, CY + 76);
        },
        date: cat(it("m", "1"), [[" = 1 kg,   "]], it("m", "2"), [[" = 1 kg,   "]], it("r"), [[" = 1 m"]]),
        num: [["1 · 1"]], den: [["1"], ["2", "sup"]],
        rez: cat(it("F"), [[" = 6,67·10"]], [["−11", "sup"]], [[" N"]]),
        nota: [
          [["Aceasta este semnificația constantei γ: forța cu care"]],
          [["se atrag două corpuri de 1 kg aflate la 1 m."]],
        ],
      },
      {
        titlu: "Doi elevi de 50 kg, la 1 m unul de altul",
        desen: function (ctx) {
          elev(ctx, 200, CY + 70, 150, "#5b8fd8");
          elev(ctx, 440, CY + 70, 150, "#e0559c");
          cota(ctx, { x: 200, y: CY - 104 }, { x: 440, y: CY - 104 }, [["r = 1 m"]], { marime: 21 });
          legenda(ctx, [["50 kg"]], 200, CY + 98); legenda(ctx, [["50 kg"]], 440, CY + 98);
        },
        date: cat(it("m", "1"), [[" = 50 kg,   "]], it("m", "2"), [[" = 50 kg,   "]], it("r"), [[" = 1 m"]]),
        num: [["50 · 50"]], den: [["1"], ["2", "sup"]],
        rez: cat(it("F"), [[" ≈ 1,67·10"]], [["−7", "sup"]], [[" N"]]),
        nota: [
          [["Forța e de miliarde de ori mai mică decît greutatea"]],
          [["elevului — de aceea n-o simțim."]],
        ],
      },
      {
        titlu: "Pămîntul și un elev de 50 kg",
        desen: function (ctx) {
          const RE = 84, yC = CY + 20;
          pamint(ctx, 250, yC, RE);
          const yP = yC - RE;
          elev(ctx, 250, yP + 2, 44, "#e0559c");
          linie(ctx, 250, yC, 250, yP, { culoare: "#fff", grosime: 2.5 });
          ctx.beginPath(); ctx.arc(250, yC, 4.5, 0, PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
          F.scrie(ctx, it("r"), 262, yC - RE / 2 + 8, { marime: 24, culoare: "#fff" });
          F.scrie(ctx, cat(it("r"), [[" = "]], it("R", "P"), [[" = 6,4·10"]], [["6", "sup"]], [[" m"]]), 352, yC - 26, { marime: 21, align: "left" });
          legenda(ctx, [["(de la elev pînă la centrul Pămîntului)"]], 352, yC + 4, { marime: 16, align: "left" });
          legenda(ctx, [["(elevul e desenat mărit)"]], 352, yC + 30, { marime: 16, align: "left" });
        },
        date: cat(it("M", "P"), [[" = 6·10"]], [["24", "sup"]], [[" kg,   "]], it("m"), [[" = 50 kg,   "]], it("r"), [[" = 6,4·10"]], [["6", "sup"]], [[" m"]]),
        num: [["6·10"], ["24", "sup"], [" · 50"]], den: [["(6,4·10"], ["6", "sup"], [")"], ["2", "sup"]],
        rez: cat(it("F"), [[" ≈ 489 N"]]),
        nota: [
          [["Este chiar greutatea elevului: "]].concat(it("G"), [[" = "]], it("mg"), [[" ≈ 490 N."]]),
          [["Distanța se măsoară pînă la centrul Pămîntului."]],
        ],
      },
      {
        titlu: "Pămîntul și Luna (desen la scară)",
        desen: function (ctx) {
          const x1 = 50, x2 = 50 + 540;                       // 384 400 km ↔ 540 px
          const k = 540 / 384400;
          pamint(ctx, x1, CY, 6371 * k);
          luna(ctx, x2, CY, 1737 * k);
          cota(ctx, { x: x1, y: CY - 50 }, { x: x2, y: CY - 50 }, cat(it("r"), [[" = 3,84·10"]], [["8", "sup"]], [[" m"]]), { marime: 21 });
          legenda(ctx, [["Pămîntul"]], x1 + 10, CY + 46, { align: "left" });
          legenda(ctx, [["Luna"]], x2, CY + 46);
        },
        date: cat(it("M", "P"), [[" = 6·10"]], [["24", "sup"]], [[" kg,  "]], it("m", "L"), [[" = 7,35·10"]], [["22", "sup"]], [[" kg,  "]], it("r"), [[" = 3,84·10"]], [["8", "sup"]], [[" m"]]),
        num: [["6·10"], ["24", "sup"], [" · 7,35·10"], ["22", "sup"]], den: [["(3,84·10"], ["8", "sup"], [")"], ["2", "sup"]],
        rez: cat(it("F"), [[" ≈ 2·10"]], [["20", "sup"]], [[" N"]]),
        nota: [
          [["Pămîntul și Luna sînt mici față de distanța dintre"]],
          [["centrele lor — le putem considera punctiforme."]],
        ],
      },
      {
        titlu: "Soarele și Pămîntul (desen la scară)",
        desen: function (ctx) {
          const x1 = 50, x2 = 590;                            // 1,5·10⁸ km ↔ 540 px
          const k = 540 / 1.5e8;
          soare(ctx, x1, CY, 696000 * k);
          pamint(ctx, x2, CY, 1.6);
          cota(ctx, { x: x1, y: CY - 50 }, { x: x2, y: CY - 50 }, cat(it("r"), [[" = 1,5·10"]], [["11", "sup"]], [[" m"]]), { marime: 21 });
          legenda(ctx, [["Soarele"]], x1 + 6, CY + 46, { align: "left" });
          legenda(ctx, [["Pămîntul"]], x2 + 6, CY + 46, { align: "right" });
          legenda(ctx, [["(la această scară Pămîntul ar avea 0,02 px)"]], 320, CY + 84, { marime: 17 });
        },
        date: cat(it("M", "S"), [[" = 2·10"]], [["30", "sup"]], [[" kg,   "]], it("M", "P"), [[" = 6·10"]], [["24", "sup"]], [[" kg,   "]], it("r"), [[" = 1,5·10"]], [["11", "sup"]], [[" m"]]),
        num: [["2·10"], ["30", "sup"], [" · 6·10"], ["24", "sup"]], den: [["(1,5·10"], ["11", "sup"], [")"], ["2", "sup"]],
        rez: cat(it("F"), [[" ≈ 3,6·10"]], [["22", "sup"]], [[" N"]]),
        nota: [
          [["Această forță menține Pămîntul pe orbita lui"]],
          [["în jurul Soarelui."]],
        ],
      },
    ];

    const DUR = 9;
    const st = { i: 0, tc: 0 };
    c.addEventListener("click", function () { st.i = (st.i + 1) % cazuri.length; st.tc = 0; });

    Deck.animatie(c, function () { return {
      reset: function () { st.i = 0; st.tc = 0; },
      draw: function (ctx, t, dt) {
        st.tc += dt;
        if (st.tc > DUR) { st.tc = 0; st.i = (st.i + 1) % cazuri.length; }
        const k = cazuri[st.i];
        const al = Math.min(F.limita(st.tc / 0.5), F.limita((DUR - st.tc) / 0.4));

        // cartonașul
        F.cutie(ctx, 6, 6, W - 12, 588, { fond: "#fff", contur: "#e4dde3", raza: 20 });
        ctx.save();
        ctx.globalAlpha = al;
        F.scrie(ctx, [[(st.i + 1) + ". " + k.titlu]], W / 2, 44, { marime: 23, align: "center", greutate: 700 });
        k.desen(ctx);

        F.scrie(ctx, k.date, W / 2, 352, { marime: 20, align: "center", culoare: GRI, greutate: 500 });
        expresie(ctx, [
          { p: cat(it("F"), [[" = "]], it("γ"), [[" · "]]) },
          { num: cat(it("m", "1"), it("m", "2")), den: cat(it("r"), [["2", "sup"]]) },
          { p: cat([[" = "]], G, [[" · "]]) },
          { num: k.num, den: k.den },
          { p: [[" N"]] },
        ], W / 2, 420, { marime: 23, align: "center" });
        F.scrie(ctx, k.rez, W / 2, 486, { marime: 27, align: "center", culoare: ACCENT, greutate: 700 });
        k.nota.forEach(function (rand, j) {
          F.scrie(ctx, rand, W / 2, 530 + j * 26, { marime: 19, align: "center", culoare: GRI, greutate: 500 });
        });
        ctx.restore();

        // punctele de progres
        for (let j = 0; j < cazuri.length; j++) {
          ctx.beginPath();
          ctx.arc(W / 2 + (j - 2) * 20, 18 + 560, j === st.i ? 5 : 3.5, 0, PI * 2);
          ctx.fillStyle = j === st.i ? ACCENT : "#d7cfd5";
          ctx.fill();
        }
      },
    }; });
  })();

  // =====================================================================
  //  4. Forța scade cu pătratul distanței, dar nu devine niciodată zero
  // =====================================================================
  Deck.animatie($("a-distanta"), function (a) {
    const X0 = 62, PXR = 52;           // centrul Pămîntului și scara: 1 R ↔ 52 px
    const YS = 128;                    // linia corpului în desenul de sus
    const GY0 = 500, GH = 250;         // graficul: axa r la y = 500, F0 ↔ 250 px
    const T = 17;
    const X = function (rho) { return X0 + rho * PXR; };
    const Y = function (f) { return GY0 - f * GH; };
    const urme = [2, 3, 4];

    function rhoLa(tc) {
      if (tc < 1) return 1;
      if (tc < 12) return 1 + 9 * Math.pow((tc - 1) / 11, 1.6);
      if (tc < 14.5) return 10;
      return 10 - 9 * neted((tc - 14.5) / 2.5);
    }

    return function (ctx, t) {
      const tc = t % T;
      const rho = rhoLa(tc);
      const merge = tc < 14.5;

      // ----- desenul de sus -----
      pamint(ctx, X0, YS, PXR);
      linie(ctx, X0, YS, X(10.4), YS, { culoare: "rgba(138, 145, 156, 0.6)", punctat: [5, 7] });
      const xb = X(rho);
      bila(ctx, xb, YS, 11);
      const L = 104 / (rho * rho);
      if (L > 2) F.sageata(ctx, xb - 13, YS, xb - 13 - L, YS, { culoare: FORTA, grosime: 4.5, cap: Math.min(15, L * 0.8) });
      if (L > 14) F.scrie(ctx, vec("F"), xb - 13 - L / 2, YS - 22, { marime: 24, align: "center", culoare: FORTA });
      F.scrie(ctx, cat(it("r"), [[" = " + F.numar(rho, 1) + " "]], it("R")), Math.min(Math.max(xb, X0 + PXR + 48), X(9.2)), YS + 44, { marime: 20, align: "center", culoare: GRI });
      linie(ctx, X0, YS, X0 + PXR, YS, { culoare: "#fff", grosime: 2 });
      ctx.beginPath(); ctx.arc(X0, YS, 3.5, 0, PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
      F.scrie(ctx, it("R"), X0 + PXR * 0.5, YS - 9, { marime: 22, align: "center", culoare: "#fff" });

      // ----- graficul F(r) -----
      F.sageata(ctx, X0, GY0, X(10.7), GY0, { culoare: AXA, grosime: 2, cap: 11 });
      F.sageata(ctx, X0, GY0, X0, Y(1) - 34, { culoare: AXA, grosime: 2, cap: 11 });
      F.scrie(ctx, it("F"), X0 + 12, Y(1) - 24, { marime: 22 });
      F.scrie(ctx, it("r"), X(10.7) - 6, GY0 - 14, { marime: 22, align: "center" });
      for (let k = 1; k <= 10; k++) {
        linie(ctx, X(k), GY0 - 5, X(k), GY0 + 5, { culoare: AXA });
        if (k <= 4 || k === 10) F.scrie(ctx, k === 1 ? it("R") : cat([[String(k)]], it("R")), X(k), GY0 + 28, { marime: 18, align: "center", culoare: GRI });
      }
      linie(ctx, X0 - 5, Y(1), X0 + 5, Y(1), { culoare: AXA });
      F.scrie(ctx, it("F", "0"), X0 - 8, Y(1) + 7, { marime: 18, align: "right", culoare: GRI });

      // curba, desenată pînă la poziția corpului
      ctx.save();
      ctx.beginPath();
      const capat = merge ? rho : 10;
      for (let r = 1; r <= capat + 1e-6; r += 0.02) {
        const x = X(r), y = Y(1 / (r * r));
        if (r === 1) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = CURBA;
      ctx.stroke();
      ctx.restore();

      // urmele: F0/4, F0/9, F0/16
      urme.forEach(function (k) {
        if (rho < k - 1e-6 && merge) return;
        const y = Y(1 / (k * k));
        linie(ctx, X0, y, X(k), y, { culoare: "rgba(47, 111, 208, 0.45)", punctat: [4, 5] });
        linie(ctx, X(k), y, X(k), GY0, { culoare: "rgba(47, 111, 208, 0.45)", punctat: [4, 5] });
        ctx.beginPath(); ctx.arc(X(k), y, 5, 0, PI * 2); ctx.fillStyle = CURBA; ctx.fill();
        expresie(ctx, [{ num: it("F", "0"), den: [[String(k * k)]], c: CURBA }], X(k) + 22, y - 20, { marime: 19 });
      });
      // punctul curent
      if (merge) {
        ctx.beginPath(); ctx.arc(X(rho), Y(1 / (rho * rho)), 7, 0, PI * 2);
        ctx.fillStyle = "#fff"; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = FORTA; ctx.stroke();
        linie(ctx, X(rho), Y(1 / (rho * rho)) + 8, X(rho), YS + 56, { culoare: "rgba(212, 42, 127, 0.3)", punctat: [3, 5] });
      }

      // mesajul
      let mesaj;
      if (rho < 1.9) mesaj = [["Cu cît corpul e mai departe, cu atît forța e mai mică."]];
      else if (rho < 2.9) mesaj = cat(it("r"), [[" de 2 ori mai mare  →  "]], it("F"), [[" de 4 ori mai mică"]]);
      else if (rho < 3.9) mesaj = cat(it("r"), [[" de 3 ori mai mare  →  "]], it("F"), [[" de 9 ori mai mică"]]);
      else if (tc < 14.5) mesaj = [["Forța scade, dar nu devine niciodată zero."]];
      else mesaj = [["Forțele gravitaționale acționează la distanțe foarte mari."]];
      legenda(ctx, mesaj, 320, 578, { marime: 20, culoare: CERNEALA, greutate: 600 });
    };
  });
})();
