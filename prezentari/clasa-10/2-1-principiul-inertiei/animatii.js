/* Animațiile pentru 2.1 „Principiul inerției. Sisteme de referință inerțiale” (clasa a 10-a). */
(function () {
  "use strict";

  const F = window.Fizica;
  const $ = function (id) { return document.getElementById(id); };
  const PI = Math.PI;
  const CERNEALA = "#1f2430";
  const GRI = "#5f6573";
  const SOL = "#b9bec6";
  const VITEZA = "#e0314b";
  const ACTIUNE = "#e07a1f";
  const TEAL = "#0f8a79";
  const ALBASTRU = "#2f7fd6";

  const neted = function (x) { x = F.limita(x); return x * x * (3 - 2 * x); };
  const estompare = function (s, per) { return F.limita(Math.min(s / 0.4, (per - s) / 0.4)); };

  function pastila(ctx, parti, x, y, o) {
    o = o || {};
    const m = o.marime || 20;
    const lat = F.scrie(ctx, parti, -9999, -9999, { marime: m, greutate: 700 }) + 2 * (o.pad || 16);
    const h = m * 1.75;
    if (o.stanga) x += lat / 2;
    F.rotunjit(ctx, x - lat / 2, y - h / 2, lat, h, h / 2);
    ctx.fillStyle = o.fond || TEAL;
    ctx.fill();
    if (o.contur) { ctx.strokeStyle = o.contur; ctx.lineWidth = 2; ctx.stroke(); }
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

  // vectorul vitezei deasupra unui corp, cu eticheta v⃗
  function vitezaVec(ctx, x, y, lung, o) {
    o = o || {};
    if (lung < 4) {
      if (o.zero) F.scrie(ctx, [["v", "v"], [" = 0"]], x, y + 8, { marime: o.marime || 22, align: "center", culoare: VITEZA });
      return;
    }
    F.sageata(ctx, x - lung / 2, y, x + lung / 2, y, { culoare: VITEZA, grosime: 4, cap: 13 });
    F.scrie(ctx, [["v", "v"]], x, y - 12, { marime: o.marime || 22, align: "center", culoare: VITEZA });
  }

  // ---------------------------------------------------------------------
  //  Căruciorul încărcat (fig. 2.2): x = capătul din stânga (mânerul), y = solul
  // ---------------------------------------------------------------------
  const CAR = { L: 170, R: 17 };
  function carucior(ctx, x, y, roti, o) {
    o = o || {};
    const L = CAR.L, R = CAR.R;
    const yc = y - R * 2 - 4;  // partea de jos a caroseriei
    // mânerul
    ctx.strokeStyle = "#3d4452";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + 16, yc - 20); ctx.lineTo(x + 2, yc - 82); ctx.lineTo(x - 10, yc - 84);
    ctx.stroke();
    // încărcătura
    if (!o.farana) {
      F.rotunjit(ctx, x + 50, yc - 44 - 74, 86, 76, 6);
      ctx.fillStyle = "#ef4560";
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillRect(x + 56, yc - 112, 10, 62);
    }
    // caroseria
    ctx.fillStyle = "#2bb5a0";
    ctx.beginPath();
    ctx.moveTo(x + 10, yc - 44);
    ctx.lineTo(x + L - 6, yc - 44);
    ctx.lineTo(x + L - 18, yc);
    ctx.lineTo(x + 26, yc);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#23a08d";
    ctx.fillRect(x + 10, yc - 44, L - 16, 8);
    // roțile
    [x + 46, x + L - 40].forEach(function (cx) {
      ctx.fillStyle = "#c7b6e8";
      ctx.beginPath(); ctx.arc(cx, y - R, R + 8, PI, 2 * PI); ctx.fill();
      ctx.fillStyle = "#23262e";
      ctx.beginPath(); ctx.arc(cx, y - R, R, 0, 2 * PI); ctx.fill();
      ctx.fillStyle = "#cfd3da";
      ctx.beginPath(); ctx.arc(cx, y - R, R * 0.45, 0, 2 * PI); ctx.fill();
      ctx.strokeStyle = "#23262e";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let k = 0; k < 3; k++) {
        const a = roti + (k * PI * 2) / 3;
        ctx.moveTo(cx, y - R); ctx.lineTo(cx + Math.cos(a) * R * 0.45, y - R + Math.sin(a) * R * 0.45);
      }
      ctx.stroke();
    });
    return { maner: { x: x - 6, y: yc - 84 }, sus: yc - 118 };
  }

  // ---------------------------------------------------------------------
  //  Omuleț stilizat (pictogramă). x = șoldul, y = solul, inc = înclinarea trunchiului
  //  (+ spre dreapta), mana = punctul apucat, faza/amp = pasul, pic = tălpile față de șold.
  // ---------------------------------------------------------------------
  function articulatie(A, B, l1, l2, dir) {
    const d = Math.max(1, Math.min(Math.hypot(B.x - A.x, B.y - A.y), l1 + l2 - 0.5));
    const ang = Math.atan2(B.y - A.y, B.x - A.x);
    const a = Math.acos(F.limita((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
    return { x: A.x + l1 * Math.cos(ang - dir * a), y: A.y + l1 * Math.sin(ang - dir * a) };
  }
  function segment(ctx, pts, l) {
    ctx.lineWidth = l;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }
  function om(ctx, o) {
    const C = o.culoare || "#3d4452";
    const H = { x: o.x, y: o.y - 88 };
    const U = { x: H.x + Math.sin(o.inc) * 66, y: H.y - Math.cos(o.inc) * 66 };
    const K = { x: U.x + Math.sin(o.inc) * 28, y: U.y - Math.cos(o.inc) * 28 };
    ctx.strokeStyle = C;
    ctx.fillStyle = C;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const amp = o.amp || 0, faza = o.faza || 0, pic = o.pic || 0;
    [1, -1].forEach(function (s, i) {
      const ridic = amp > 0 ? Math.max(0, Math.sin(faza + (i ? PI : 0))) * 10 : 0;
      const P = { x: H.x + pic + s * amp * Math.cos(faza), y: o.y - 6 - ridic };
      const G = articulatie(H, P, 48, 48, 1);
      ctx.globalAlpha *= i ? 0.8 : 1;
      segment(ctx, [H, G, P], 14);
      segment(ctx, [P, { x: P.x + 14, y: P.y + 1 }], 9);
      ctx.globalAlpha /= i ? 0.8 : 1;
    });
    segment(ctx, [H, U], 22);
    let M = o.mana || { x: U.x + 20, y: U.y + 60 };
    if (o.liber) M = { x: M.x + (U.x + 22 - M.x) * o.liber, y: M.y + (U.y + 62 - M.y) * o.liber };
    const dm = Math.hypot(M.x - U.x, M.y - U.y);
    if (dm > 70) M = { x: U.x + ((M.x - U.x) * 70) / dm, y: U.y + ((M.y - U.y) * 70) / dm };
    [0, 1].forEach(function (i) {
      const Mi = { x: M.x - i * 3, y: M.y + i * 3 };
      const E = articulatie(U, Mi, 36, 36, -1);
      ctx.globalAlpha *= i ? 0.8 : 1;
      segment(ctx, [U, E, Mi], 11);
      ctx.globalAlpha /= i ? 0.8 : 1;
    });
    ctx.beginPath();
    ctx.arc(K.x, K.y, 15, 0, 2 * PI);
    ctx.fill();
  }
  // poziția șoldului astfel încât umărul să fie la distanța „brat” de punctul apucat
  function soldPentru(M, inc, brat) {
    return M.x - Math.sin(inc) * 66 - brat;
  }

  // =====================================================================
  //  1. Titlu: căruciorul în mișcare rectilinie uniformă
  // =====================================================================
  Deck.animatie($("a-titlu"), function (a) {
    const V = 120, YS = 380;
    const PER = (a.w + CAR.L + 60) / V;
    return function (ctx, t) {
      const s = t % PER;
      const x = -CAR.L - 20 + V * s;
      // urme la intervale egale de timp
      ctx.fillStyle = "#e3e6ea";
      ctx.fillRect(10, YS, a.w - 20, 8);
      for (let k = 1; k <= 3; k++) {
        const xg = x - k * 96;
        if (xg < -CAR.L) continue;
        ctx.globalAlpha = 0.16 / k;
        carucior(ctx, xg, YS, -(xg / CAR.R));
      }
      ctx.globalAlpha = 1;
      const c = carucior(ctx, x, YS, x / CAR.R);
      vitezaVec(ctx, x + 93, c.sus - 26, 110, { marime: 24 });
      F.scrie(ctx, [["v", "v"], [" = const."]], a.w / 2, 104, { marime: 34, greutate: 800, align: "center", culoare: CERNEALA });
      F.scrie(ctx, [["în virtutea inerției"]], a.w / 2, 146, { marime: 22, greutate: 700, align: "center", culoare: TEAL });
      // gradații pe sol: distanțe egale în intervale egale de timp
      ctx.strokeStyle = "#9aa1ab";
      ctx.lineWidth = 2;
      for (let gx = 40; gx < a.w; gx += 96) {
        ctx.beginPath(); ctx.moveTo(gx, YS + 8); ctx.lineTo(gx, YS + 20); ctx.stroke();
      }
    };
  });

  // =====================================================================
  //  2. Bila pe lână, carton, sticlă și pe o suprafață ideală (fig. 2.1)
  // =====================================================================
  Deck.animatie($("a-bile"), function (a) {
    const X0 = 64, XMAX = a.w - 24, RB = 15, V0 = 250;
    const PISTE = [
      { nume: "lână", l: 120, fond: "#efe3cf", desen: "lana", ind: "1" },
      { nume: "carton", l: 245, fond: "#d9b98a", desen: "carton", ind: "2" },
      { nume: "sticlă", l: 430, fond: "#d6ebf7", desen: "sticla", ind: "3" },
      { nume: "suprafață ideală (fără frânare)", l: Infinity, fond: "#f1f3f5", desen: "ideal" },
    ];
    const Y = function (i) { return 110 + i * 112; };
    const START = 0.9;
    const PER = START + 5.8 + 2.4;
    // fibrele de carton, puse o singură dată
    const fibre = [];
    for (let k = 0; k < 70; k++) fibre.push([Math.random(), Math.random(), Math.random()]);

    function pista(ctx, p, y) {
      const x1 = 26, x2 = a.w - 14, h = 16;
      ctx.save();
      F.rotunjit(ctx, x1, y, x2 - x1, h, 4);
      ctx.fillStyle = p.fond;
      ctx.fill();
      ctx.clip();
      if (p.desen === "lana") {
        ctx.strokeStyle = "rgba(160,130,90,0.55)";
        ctx.lineWidth = 2;
        for (let x = x1 - 10; x < x2; x += 9) {
          ctx.beginPath();
          ctx.moveTo(x, y + h);
          ctx.quadraticCurveTo(x + 6, y + h / 2, x + 1, y - 2);
          ctx.stroke();
        }
      } else if (p.desen === "carton") {
        ctx.strokeStyle = "rgba(120,80,40,0.35)";
        ctx.lineWidth = 1.5;
        fibre.forEach(function (f) {
          const fx = x1 + f[0] * (x2 - x1), fy = y + 2 + f[1] * (h - 4);
          ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + 6 + f[2] * 8, fy + (f[2] - 0.5) * 3); ctx.stroke();
        });
      } else if (p.desen === "sticla") {
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 3;
        for (let x = x1 + 30; x < x2; x += 110) {
          ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + 14, y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x + 12, y + h); ctx.lineTo(x + 20, y); ctx.stroke();
        }
      }
      ctx.restore();
      ctx.fillStyle = "#c3c8cf";
      ctx.fillRect(x1, y + h, x2 - x1, 6);
    }

    function bila(ctx, x, y, rot) {
      const g = ctx.createRadialGradient(x - RB * 0.35, y - RB * 0.4, 2, x, y, RB);
      g.addColorStop(0, "#ff9b8f");
      g.addColorStop(0.45, "#e5302b");
      g.addColorStop(1, "#9c1611");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, RB, 0, 2 * PI); ctx.fill();
      // o linie care se rotește, ca să se vadă rostogolirea
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, RB * 0.62, rot, rot + 1.2);
      ctx.stroke();
    }

    return function (ctx, t) {
      const s = t % PER;
      ctx.globalAlpha = estompare(s, PER);
      const baza = ctx.globalAlpha;
      const tt = Math.max(0, s - START);

      F.scrie(ctx, [["Aceeași viteză inițială "], ["v", "v"], ["0", "sub"], [", suprafețe diferite"]], a.w / 2, 30,
        { marime: 21, greutate: 700, align: "center", culoare: CERNEALA });

      PISTE.forEach(function (p, i) {
        const y = Y(i);
        F.scrie(ctx, [[p.nume]], 28, y - 52, { marime: 19, greutate: 800, culoare: i === 3 ? TEAL : GRI });
        pista(ctx, p, y);
        // mișcarea uniform încetinită: v = v0 − a·t, a = v0² / (2l)
        let x, v;
        if (p.l === Infinity) { x = V0 * tt; v = V0; }
        else {
          const acc = (V0 * V0) / (2 * p.l), tStop = V0 / acc;
          const u = Math.min(tt, tStop);
          x = V0 * u - (acc * u * u) / 2;
          v = V0 - acc * u;
        }
        const xb = X0 + x, yb = y - RB;
        // marcajul de start
        ctx.strokeStyle = "#8a919c";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(X0, y - 4); ctx.lineTo(X0, y - 40); ctx.stroke();
        if (xb < XMAX + RB) bila(ctx, xb, yb, xb / RB);
        if (s < START) vitezaVec(ctx, X0, yb - 30, 0, {});
        else if (v > 1 && xb < XMAX - 30) vitezaVec(ctx, xb + 6, yb - 28, 20 + v * 0.3, { marime: 20 });

        if (p.l !== Infinity && v <= 1) {
          // bila s-a oprit: distanța l și v⃗ = 0
          const al = F.limita((tt - (2 * p.l) / V0) / 0.4);
          ctx.globalAlpha = baza * al;
          punctat(ctx, X0, yb, xb - RB - 4, yb, "rgba(95,101,115,0.8)");
          F.scrie(ctx, [["l", "i"], [p.ind, "sub"]], (X0 + xb) / 2 - 4, yb - 10, { marime: 22, align: "center", culoare: CERNEALA });
          ctx.strokeStyle = CERNEALA;
          ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(xb + RB + 6, y - 2); ctx.lineTo(xb + RB + 6, y - 46); ctx.stroke();
          F.scrie(ctx, [["v", "v"], [" = 0"]], xb + RB + 14, y - 18, { marime: 19, culoare: VITEZA });
          ctx.globalAlpha = baza;
        }
        if (p.l === Infinity && xb > XMAX - 30) {
          ctx.globalAlpha = baza * F.limita((xb - XMAX + 30) / 60);
          F.scrie(ctx, [["nu se oprește niciodată →"]], XMAX - 4, y - 50, { marime: 19, greutate: 800, align: "right", culoare: TEAL });
          ctx.globalAlpha = baza;
        }
      });

      // concluzia
      if (tt > 3.9) {
        ctx.globalAlpha = baza * F.limita((tt - 3.9) / 0.5);
        F.scrie(ctx, [["l", "i"], ["1", "sub"], [" < "], ["l", "i"], ["2", "sub"], [" < "], ["l", "i"], ["3", "sub"]],
          a.w / 2, 548, { marime: 30, greutate: 700, align: "center", culoare: CERNEALA });
        F.scrie(ctx, [["suprafața mai netedă → frânarea mai mică"]], a.w / 2, 584,
          { marime: 20, greutate: 700, align: "center", culoare: TEAL });
      }
      ctx.globalAlpha = 1;
    };
  });

  // =====================================================================
  //  3. Căruciorul: a) repaus, b) pus în mișcare, c) oprit (fig. 2.2)
  // =====================================================================
  Deck.animatie($("a-carucior"), function (a) {
    const YS = 420, X0 = 112, VM = 120;
    // momentele: intrarea omului, împingerea, mersul, frânarea, repausul final
    const T = { intra: 2.6, imp: 3.9, mers: 5.7, fran: 6.9, stop: 8.6, per: 11.4 };
    const AIMP = VM / (T.mers - T.imp), AFR = VM / (T.stop - T.fran);
    const D1 = (VM * (T.mers - T.imp)) / 2, D2 = VM * (T.fran - T.mers);

    function miscare(s) {
      if (s < T.imp) return { x: X0, v: 0 };
      if (s < T.mers) { const u = s - T.imp; return { x: X0 + (AIMP * u * u) / 2, v: AIMP * u }; }
      if (s < T.fran) { const u = s - T.mers; return { x: X0 + D1 + VM * u, v: VM }; }
      const u = Math.min(s, T.stop) - T.fran;
      return { x: X0 + D1 + D2 + VM * u - (AFR * u * u) / 2, v: Math.max(0, VM - AFR * u) };
    }

    return function (ctx, t) {
      const s = t % T.per;
      ctx.globalAlpha = estompare(s, T.per);
      const baza = ctx.globalAlpha;
      const m = miscare(s);

      // solul cu gradații
      ctx.fillStyle = "#d5d9df";
      ctx.fillRect(10, YS, a.w - 20, 10);
      ctx.strokeStyle = "#aab0b9";
      ctx.lineWidth = 2;
      for (let gx = 40; gx < a.w; gx += 60) { ctx.beginPath(); ctx.moveTo(gx, YS + 10); ctx.lineTo(gx, YS + 20); ctx.stroke(); }

      const c = carucior(ctx, m.x, YS, (m.x - X0) / CAR.R);
      const M = c.maner;

      // omul
      if (s > T.intra - 2) {
        let inc, brat, xs, amp = 0, faza = 0, pic = 0, liber = 0;
        if (s < T.intra) {
          // vine spre cărucior
          const u = (s - T.intra + 2) / 2;
          inc = 0.08;
          brat = 40;
          xs = soldPentru(M, inc, brat) - 130 * (1 - neted(u * 0.6 + 0.4 * u * u));
          amp = 22 * (1 - u * 0.6); faza = s * 9; pic = 0; liber = 1 - neted((u - 0.55) / 0.45);
        } else if (s < T.imp) {
          const u = neted((s - T.intra) / (T.imp - T.intra));
          inc = 0.08 + 0.32 * u; brat = 40 - 6 * u; pic = -26 * u;
          xs = soldPentru(M, inc, brat);
        } else if (s < T.mers) {
          inc = 0.4; brat = 34; pic = -26; amp = 20; faza = (m.x - X0) / 14;
          xs = soldPentru(M, inc, brat);
        } else if (s < T.fran) {
          const u = neted((s - T.mers) / 0.5);
          inc = 0.4 - 0.32 * u; brat = 34 + 8 * u; pic = -26 * (1 - u); amp = 20; faza = (m.x - X0) / 14;
          xs = soldPentru(M, inc, brat);
        } else {
          const u = neted((s - T.fran) / 0.4);
          inc = 0.08 - 0.36 * u; brat = 42 + 10 * u; pic = 30 * u; amp = 20 * (1 - neted((s - T.fran) / (T.stop - T.fran)));
          faza = (m.x - X0) / 14;
          xs = soldPentru(M, inc, brat);
        }
        om(ctx, { x: xs, y: YS, inc: inc, mana: M, amp: amp, faza: faza, pic: pic, liber: liber });

        // acțiunea din exterior
        const imp = s > T.imp - 0.2 && s < T.mers ? F.limita(Math.min((s - T.imp + 0.2) / 0.3, (T.mers - s) / 0.3)) : 0;
        const fr = s > T.fran && s < T.stop ? F.limita(Math.min((s - T.fran) / 0.3, (T.stop - s) / 0.3)) : 0;
        if (imp > 0) {
          ctx.globalAlpha = baza * imp;
          F.sageata(ctx, M.x + 10, M.y + 34, M.x + 82, M.y + 34, { culoare: ACTIUNE, grosime: 6, cap: 16 });
          ctx.globalAlpha = baza;
        }
        if (fr > 0) {
          ctx.globalAlpha = baza * fr;
          F.sageata(ctx, M.x + 82, M.y + 34, M.x + 10, M.y + 34, { culoare: ACTIUNE, grosime: 6, cap: 16 });
          ctx.globalAlpha = baza;
        }
      }

      // viteza
      vitezaVec(ctx, m.x + 93, c.sus - 28, m.v * 0.9, { zero: true, marime: 24 });

      // explicația fazei
      let lit, txt, cul;
      if (s < T.imp) { lit = 0; txt = ["Căruciorul este în repaus:", "alte corpuri nu acționează asupra lui"]; cul = CERNEALA; }
      else if (s < T.mers) { lit = 1; txt = ["O acțiune din exterior", "îl scoate din starea de repaus"]; cul = ACTIUNE; }
      else if (s < T.fran) { lit = 1; txt = ["Căruciorul se mișcă", ""]; cul = CERNEALA; }
      else if (s < T.stop + 0.2) { lit = 2; txt = ["Pentru a-l opri este necesară", "o acțiune din exterior"]; cul = ACTIUNE; }
      else { lit = 2; txt = ["Căruciorul s-a oprit", ""]; cul = CERNEALA; }
      F.scrie(ctx, [[txt[0]]], a.w / 2, 56, { marime: 24, greutate: 800, align: "center", culoare: cul });
      if (txt[1]) F.scrie(ctx, [[txt[1]]], a.w / 2, 90, { marime: 24, greutate: 800, align: "center", culoare: cul });

      // a) b) c)
      const etich = [["a)", "repaus"], ["b)", "pus în mișcare"], ["c)", "oprit"]];
      etich.forEach(function (e, i) {
        const x = 130 + i * 220;
        const activ = i === lit;
        ctx.globalAlpha = baza * (activ ? 1 : 0.45);
        pastila(ctx, [[e[0] + " " + e[1]]], x, 520, { marime: 19, pad: 16, fond: activ ? TEAL : "#e4e7eb", culoare: activ ? "#fff" : CERNEALA });
      });
      ctx.globalAlpha = 1;
    };
  });

  // =====================================================================
  //  4. Bila suspendată de fir: firul se taie, bila cade (fig. 2.3)
  // =====================================================================
  Deck.animatie($("a-fir"), function (a) {
    const CX = 200, YSUS = 70, L = 230, RB = 30, YSOL = 560;
    const T = { taie: 3.2, cade: 3.7, per: 9 };
    const G = 520; // px/s², încetinit
    const YB0 = YSUS + L + RB;
    const tCadere = Math.sqrt((2 * (YSOL - RB - YB0)) / G);

    function forfecuta(ctx, x, y, inchis) {
      const desch = 0.38 * (1 - inchis);
      ctx.save();
      ctx.translate(x, y);
      [-1, 1].forEach(function (s) {
        ctx.save();
        ctx.rotate(s * desch);
        ctx.fillStyle = "#9aa3ad";
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(-62, s * 4); ctx.lineTo(-62, s * -3); ctx.closePath();
        ctx.moveTo(0, -3 * s); ctx.lineTo(54, -s * 6); ctx.lineTo(54, s * 2); ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#e07a1f";
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.ellipse(70, -s * 10, 15, 10, 0, 0, 2 * PI); ctx.stroke();
        ctx.restore();
      });
      ctx.fillStyle = "#3d4452";
      ctx.beginPath(); ctx.arc(0, 0, 4, 0, 2 * PI); ctx.fill();
      ctx.restore();
    }

    function bila(ctx, x, y) {
      const g = ctx.createRadialGradient(x - RB * 0.35, y - RB * 0.4, 3, x, y, RB);
      g.addColorStop(0, "#ff8f86");
      g.addColorStop(0.5, "#e5302b");
      g.addColorStop(1, "#9c1611");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, RB, 0, 2 * PI); ctx.fill();
      ctx.fillStyle = "#d9304a";
      ctx.fillRect(x - 5, y - RB - 7, 10, 9);
    }

    function actiune(ctx, x, y1, y2, cul, rand1, rand2, xt) {
      F.sageata(ctx, x, y1, x, y2, { culoare: cul, grosime: 6, cap: 17 });
      F.scrie(ctx, [[rand1]], xt, (y1 + y2) / 2 - 4, { marime: 18, greutate: 800, culoare: cul });
      F.scrie(ctx, [[rand2]], xt, (y1 + y2) / 2 + 18, { marime: 18, greutate: 800, culoare: cul });
    }

    return function (ctx, t) {
      const s = t % T.per;
      ctx.globalAlpha = estompare(s, T.per);
      const baza = ctx.globalAlpha;

      // suportul și podeaua
      ctx.fillStyle = "#b3b9c2";
      ctx.fillRect(CX - 110, YSUS - 14, 220, 14);
      ctx.fillStyle = "#d5d9df";
      ctx.fillRect(20, YSOL, a.w - 40, 10);

      const taiat = s >= T.cade;
      const tc = Math.max(0, s - T.cade);
      const tf = Math.min(tc, tCadere);
      const yb = taiat ? YB0 + (G * tf * tf) / 2 : YB0;
      const pePamant = taiat && tc >= tCadere;
      const yTaiere = YSUS + L * 0.5;

      ctx.strokeStyle = "#f2b705";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      if (!taiat) {
        ctx.beginPath(); ctx.moveTo(CX, YSUS); ctx.lineTo(CX, yb - RB - 6); ctx.stroke();
      } else {
        // capătul de sus se strânge ondulat
        const r = neted(tc / 0.6);
        const lung = (yTaiere - YSUS) * (1 - 0.3 * r);
        ctx.beginPath();
        ctx.moveTo(CX, YSUS);
        for (let k = 0; k <= 30; k++) {
          const u = k / 30;
          ctx.lineTo(CX + Math.sin(u * PI * 3) * 14 * r * u, YSUS + lung * u);
        }
        ctx.stroke();
        // bucata de jos cade cu bila; după ce bila atinge podeaua, firul se culcă
        const ybj = Math.min(yb, YSOL - RB) - RB - 6, lj = YB0 - RB - 6 - yTaiere - 8;
        const culcat = pePamant ? neted((tc - tCadere) / 0.5) * 1.35 : 0;
        ctx.beginPath();
        ctx.moveTo(CX, ybj);
        for (let k = 1; k <= 20; k++) {
          const u = k / 20, an = culcat * (0.4 + 0.6 * u);
          ctx.lineTo(CX + Math.sin(an) * lj * u + Math.sin(u * PI * 2) * 4 * culcat,
                     ybj - Math.cos(an) * lj * u);
        }
        ctx.stroke();
      }
      bila(ctx, CX, Math.min(yb, YSOL - RB));

      // foarfeca
      if (s > T.taie - 1 && s < T.cade + 0.8) {
        const al = F.limita(Math.min((s - T.taie + 1) / 0.4, (T.cade + 0.8 - s) / 0.4));
        ctx.globalAlpha = baza * al;
        forfecuta(ctx, CX + 4, yTaiere, neted((s - T.taie) / (T.cade - T.taie)));
        ctx.globalAlpha = baza;
      }

      // acțiunile
      const ybv = Math.min(yb, YSOL - RB);
      if (!taiat) {
        actiune(ctx, CX - 50, YB0 - 8, YB0 - 98, TEAL, "acțiunea", "firului", CX - 160);
        actiune(ctx, CX + 50, YB0 + 8, YB0 + 98, ALBASTRU, "acțiunea", "Pământului", CX + 62);
        if (s > 0.8) {
          ctx.globalAlpha = baza * F.limita((s - 0.8) / 0.4);
          pastila(ctx, [["se compensează"]], 430, 210, { marime: 19, fond: TEAL });
          vitezaVec(ctx, 430, 268, 0, { zero: true, marime: 22 });
          ctx.globalAlpha = baza;
        }
      } else if (!pePamant) {
        actiune(ctx, CX + 50, ybv + 8, ybv + 98, ALBASTRU, "acțiunea", "Pământului", CX + 62);
        pastila(ctx, [["acțiune necompensată"]], 410, 210, { marime: 19, fond: ALBASTRU });
        F.scrie(ctx, [["bila cade"]], 410, 262, { marime: 22, greutate: 800, align: "center", culoare: VITEZA });
      } else {
        ctx.globalAlpha = baza * F.limita((tc - tCadere) / 0.3);
        F.scrie(ctx, [["Bila a fost scoasă din"]], 400, 226, { marime: 20, greutate: 700, align: "center", culoare: CERNEALA });
        F.scrie(ctx, [["starea de repaus"]], 400, 252, { marime: 20, greutate: 700, align: "center", culoare: CERNEALA });
        ctx.globalAlpha = baza;
      }

      F.scrie(ctx, [[taiat ? "b)" : "a)"]], 40, 120, { marime: 26, greutate: 800, culoare: GRI });
      ctx.globalAlpha = 1;
    };
  });

  // =====================================================================
  //  5. Observatorul pe disc rotitor: sistem inerțial și neinerțial
  // =====================================================================
  Deck.animatie($("a-disc"), function (a) {
    const O = { x: a.w / 2, y: 322 }, RD = 100, W = 0.55;
    // pomi și case: [unghi, rază, tip]
    const OB = [
      [0.2, 182, "pom"], [0.9, 210, "casa"], [1.6, 178, "pom"], [2.25, 205, "pom"], [2.9, 192, "casa"],
      [3.6, 212, "pom"], [4.25, 184, "pom"], [4.95, 204, "casa"], [5.6, 192, "pom"],
    ];
    const butoane = Array.prototype.slice.call(document.querySelectorAll("#moduri-disc .buton-mic"));
    let mod = 0, auto = true, tAcum = 0, k = 0, tMod = 0;

    function marcheaza() { butoane.forEach(function (b) { b.classList.toggle("activ", +b.dataset.mod === mod); }); }
    butoane.forEach(function (b) {
      b.addEventListener("click", function () { auto = false; mod = +b.dataset.mod; tMod = tAcum; marcheaza(); });
    });
    marcheaza();

    function pom(ctx, x, y) {
      ctx.fillStyle = "#3f9a52";
      ctx.beginPath(); ctx.arc(x, y, 17, 0, 2 * PI); ctx.fill();
      ctx.fillStyle = "#5cb86c";
      ctx.beginPath(); ctx.arc(x - 4, y - 4, 10, 0, 2 * PI); ctx.fill();
      ctx.fillStyle = "#7a5432";
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 2 * PI); ctx.fill();
    }
    function casa(ctx, x, y, ang) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.fillStyle = "#d9674a";
      ctx.fillRect(-20, -16, 40, 32);
      ctx.fillStyle = "#b9533a";
      ctx.fillRect(-20, -16, 40, 16);
      ctx.strokeStyle = "#8f3e2b";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.stroke();
      ctx.restore();
    }
    function observator(ctx, x, y, ang) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.fillStyle = "#e07a1f";
      ctx.beginPath(); ctx.ellipse(0, 0, 15, 9, 0, 0, 2 * PI); ctx.fill();
      ctx.fillStyle = "#3d4452";
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, 2 * PI); ctx.fill();
      ctx.restore();
    }

    return {
      reset: function () { mod = 0; auto = true; tAcum = 0; k = 0; tMod = 0; marcheaza(); },
      draw: function (ctx, t, dt) {
        tAcum = t;
        if (auto) {
          const m = Math.floor(t / 7.5) % 2;
          if (m !== mod) { mod = m; tMod = t; marcheaza(); }
        }
        // k: 0 = privim față de Pământ, 1 = față de disc (trecere lină)
        k += (mod - k) * Math.min(1, dt * 3.2);
        const th = W * t;           // cât s-a rotit discul față de Pământ
        const rot = -th * k;        // rotirea întregii imagini (față de disc: discul pare fix)

        // terenul
        ctx.fillStyle = "#eef3e6";
        ctx.beginPath(); ctx.arc(O.x, O.y, 238, 0, 2 * PI); ctx.fill();

        // traiectoriile pomilor văzute de pe disc
        if (k > 0.05) {
          ctx.save();
          ctx.globalAlpha *= k * 0.7;
          ctx.setLineDash([5, 7]);
          ctx.strokeStyle = "#8fb59a";
          ctx.lineWidth = 1.5;
          [180, 192, 205, 211].forEach(function (r) { ctx.beginPath(); ctx.arc(O.x, O.y, r, 0, 2 * PI); ctx.stroke(); });
          ctx.restore();
        }
        OB.forEach(function (o) {
          const ang = o[0] + rot;
          const x = O.x + Math.cos(ang) * o[1], y = O.y + Math.sin(ang) * o[1];
          if (o[2] === "pom") pom(ctx, x, y);
          else casa(ctx, x, y, ang + PI / 2);
        });

        // discul
        const ad = th + rot;
        ctx.fillStyle = "#c9ced6";
        ctx.beginPath(); ctx.arc(O.x, O.y, RD, 0, 2 * PI); ctx.fill();
        ctx.strokeStyle = "#9aa1ab";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#aeb4bd";
        for (let i = 0; i < 8; i++) {
          const a1 = ad + (i * PI) / 4;
          ctx.beginPath(); ctx.moveTo(O.x, O.y); ctx.lineTo(O.x + Math.cos(a1) * RD, O.y + Math.sin(a1) * RD); ctx.stroke();
        }
        ctx.fillStyle = "#7d8591";
        ctx.beginPath(); ctx.arc(O.x, O.y, 7, 0, 2 * PI); ctx.fill();
        // sensul de rotație al discului (față de Pământ)
        if (k < 0.95) {
          ctx.save();
          ctx.globalAlpha *= 1 - k;
          ctx.strokeStyle = TEAL;
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(O.x, O.y, RD + 16, -2.3, -0.9); ctx.stroke();
          const ae = -0.9;
          F.sageata(ctx, O.x + Math.cos(ae - 0.2) * (RD + 16), O.y + Math.sin(ae - 0.2) * (RD + 16),
            O.x + Math.cos(ae) * (RD + 16), O.y + Math.sin(ae) * (RD + 16), { culoare: TEAL, grosime: 3, cap: 12 });
          ctx.restore();
        }
        // observatorul de pe disc
        const ao = -PI / 2 + 0.4 + ad;
        observator(ctx, O.x + Math.cos(ao) * 70, O.y + Math.sin(ao) * 70, ao + PI / 2);
        // săgeți curbe lângă pomi, când îi privim de pe disc
        if (k > 0.3) {
          ctx.save();
          ctx.globalAlpha *= F.limita((k - 0.3) / 0.5);
          [0.55, 2.6, 4.6].forEach(function (a0) {
            const a1 = a0 + rot, r = 228;
            ctx.strokeStyle = VITEZA;
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(O.x, O.y, r, a1 + 0.22, a1 - 0.08, true); ctx.stroke();
            F.sageata(ctx, O.x + Math.cos(a1) * r, O.y + Math.sin(a1) * r,
              O.x + Math.cos(a1 - 0.14) * r, O.y + Math.sin(a1 - 0.14) * r, { culoare: VITEZA, grosime: 3, cap: 12 });
          });
          ctx.restore();
        }

        // explicația
        const ePam = k < 0.5;
        F.scrie(ctx, [["Sistemul de referință: " + (ePam ? "Pământul" : "discul")]], O.x, 22,
          { marime: 21, greutate: 800, align: "center", culoare: CERNEALA });
        F.scrie(ctx, [[ePam ? "Pomii și casele sunt în repaus." : "Pomii și casele se rotesc în jurul discului,"]], O.x, 52,
          { marime: 18, greutate: 600, align: "center", culoare: GRI });
        if (!ePam) F.scrie(ctx, [["deși nu acționează nimic asupra lor."]], O.x, 74, { marime: 18, greutate: 600, align: "center", culoare: GRI });
        pastila(ctx, [[ePam ? "sistem inerțial" : "sistem neinerțial"]], O.x, a.h - 22,
          { marime: 20, pad: 20, fond: ePam ? TEAL : VITEZA });
        void tMod;
      },
    };
  });
})();
