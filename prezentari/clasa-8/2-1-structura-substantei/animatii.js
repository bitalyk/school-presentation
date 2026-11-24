/* Animațiile pentru tema 2.1 (clasa a 8-a). Folosește Deck și Fizica din assets/deck/deck.js. */
(function () {
  "use strict";

  const F = window.Fizica;
  const $ = function (id) { return document.getElementById(id); };
  const font = function (g, m) { return g + " " + m + "px " + F.SANS; };
  const CERNEALA = "#1f2430";
  const GRI = "#5f6573";
  const PORTOCALIU = "#c95a1c";

  // Ilustrativ: viteza particulelor crește cu temperatura (în °C, scara 0…100).
  const viteza = function (t) { return 0.15 + 0.85 * F.limita(t / 100); };
  const culoare = function (t, alfa) { return F.culoareTemp(t / 100, alfa); };
  // estompare scurtă la capătul fiecărei bucle, ca reluarea să se vadă clar
  const estompare = function (s, per) { return F.limita(Math.min(s / 0.4, (per - s) / 0.4)); };

  // ---------------------------------------------------------------
  // 1. Titlu: „lupa” prin care se văd moleculele în mișcare
  // ---------------------------------------------------------------
  Deck.animatie($("a-titlu"), function () {
    const cx = 250, cy = 250, R = 205;
    const P = new F.Particule({ x: cx - R, y: cy - R, w: 2 * R, h: 2 * R, n: 44, r: 14, viteza: 120 });
    const dupaViteza = function (p) {
      return F.culoareTemp((Math.hypot(p.vx, p.vy) / P.v - 0.45) / 1.1);
    };
    return function (ctx, t, dt) {
      P.pas(dt, 1);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      F.rotunjit(ctx, R + 4, -20, 170, 40, 20);
      ctx.fillStyle = "#6b4630";
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = "#fff8f0";
      ctx.fill();
      ctx.clip();
      P.deseneaza(ctx, dupaViteza);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.lineWidth = 16;
      ctx.strokeStyle = "#3b3f4a";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R - 28, Math.PI * 1.12, Math.PI * 1.38);
      ctx.lineWidth = 9;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.stroke();
    };
  });

  // ---------------------------------------------------------------
  // 2. Corp cald / corp rece
  // ---------------------------------------------------------------
  function panouTemperatura(id, tc) {
    Deck.animatie($(id), function (a) {
      const bx = 6, by = 6, bw = a.w - 100, bh = a.h - 12;
      const P = new F.Particule({ x: bx, y: by, w: bw, h: bh, n: 24, r: 12, viteza: 250 });
      return function (ctx, t, dt) {
        P.pas(dt, viteza(tc));
        F.cutie(ctx, bx, by, bw, bh, { tenta: culoare(tc, 0.07) });
        P.deseneaza(ctx, culoare(tc));
        F.termometru(ctx, a.w - 52, 10, a.h - 20, tc / 100);
      };
    });
  }
  panouTemperatura("a-cald", 85);
  panouTemperatura("a-rece", 10);

  // ---------------------------------------------------------------
  // 3. Proces termic / echilibru termic — cu termometru și grafic t(timp)
  // ---------------------------------------------------------------
  function panouGrafic(id, temperatura) {
    Deck.animatie($(id), function (a) {
      const bx = 6, by = 6, bw = a.w - 130, bh = 180;
      const gx = bx + 56, gy = by + bh + 14, gw = bw - 56, gh = 78;
      const xt = a.w - 62;
      const FEREASTRA = 8; // secunde afișate pe grafic
      const P = new F.Particule({ x: bx, y: by, w: bw, h: bh, n: 20, r: 11, viteza: 260 });
      let ist = [];
      return {
        reset: function () { ist = []; },
        draw: function (ctx, t, dt) {
          const tc = temperatura(t);
          P.pas(dt, viteza(tc));
          F.cutie(ctx, bx, by, bw, bh, { tenta: culoare(tc, 0.08) });
          P.deseneaza(ctx, culoare(tc));

          F.termometru(ctx, xt, 6, 206, tc / 100);
          ctx.font = font(800, 30);
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          ctx.fillStyle = culoare(tc);
          ctx.fillText(F.numar(tc) + " °C", xt, 254);

          // grafic
          ist.push([t, tc]);
          while (ist.length > 2 && ist[0][0] < t - FEREASTRA) ist.shift();
          ctx.strokeStyle = "#cfc4b4";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(gx, gy + gh);
          ctx.lineTo(gx + gw, gy + gh);
          ctx.stroke();
          ctx.font = font(600, 16);
          ctx.fillStyle = GRI;
          ctx.textAlign = "right";
          ctx.fillText("t, °C", gx - 10, gy + 14);
          ctx.fillText("timp →", gx + gw, gy + gh + 18);
          const yv = function (v) { return gy + gh - 6 - (v / 100) * (gh - 12); };
          ctx.beginPath();
          ist.forEach(function (q, i) {
            const x = gx + gw - ((t - q[0]) / FEREASTRA) * gw;
            if (i) ctx.lineTo(x, yv(q[1]));
            else ctx.moveTo(x, yv(q[1]));
          });
          ctx.strokeStyle = PORTOCALIU;
          ctx.lineWidth = 3;
          ctx.lineJoin = "round";
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(gx + gw, yv(tc), 5, 0, Math.PI * 2);
          ctx.fillStyle = PORTOCALIU;
          ctx.fill();
        },
      };
    });
  }
  // particulele accelerează, apoi încetinesc, apoi iar accelerează (20 °C ↔ 80 °C)
  panouGrafic("a-proces", function (t) { return 50 - 30 * Math.cos((2 * Math.PI * t) / 8); });
  panouGrafic("a-echilibru", function () { return 40; });

  // ---------------------------------------------------------------
  // 4. Scara Celsius și scara Kelvin, până la zero absolut
  // ---------------------------------------------------------------
  Deck.animatie($("a-scari"), function (a) {
    const slider = $("t-slider");
    const buton = $("t-auto");
    const ZERO = -273.15;
    let auto = true, ta = 0, tinta = 20, tc = 20;

    function eticheta() { buton.textContent = auto ? "⏸ Pauză" : "▶ Animație"; }
    slider.addEventListener("input", function () {
      auto = false;
      tinta = parseFloat(slider.value);
      eticheta();
    });
    slider.addEventListener("change", function () { slider.blur(); });
    buton.addEventListener("click", function () {
      auto = !auto;
      ta = 0;
      tinta = tc;
      eticheta();
      buton.blur();
    });
    eticheta();

    const neted = function (x) { x = F.limita(x); return x * x * (3 - 2 * x); };
    // 20 °C → 100 °C → zero absolut (pauză) → 20 °C, în buclă de 16 s
    function profil(s) {
      s = s % 16;
      if (s < 1.5) return 20;
      if (s < 4) return 20 + 80 * neted((s - 1.5) / 2.5);
      if (s < 5) return 100;
      if (s < 11) return 100 + (ZERO - 100) * neted((s - 5) / 6);
      if (s < 14) return ZERO;
      return ZERO + (20 - ZERO) * neted((s - 14) / 2);
    }

    const xt = 190;
    const g = F.geomTermometru(52, 468, 22);
    const yDin = function (c) { return g.jos - ((c - ZERO) / 373.15) * (g.jos - g.sus); };
    const repere = [
      { c: 100, tc: "100 °C", tk: "373,15 K", d: "fierberea apei" },
      { c: 0, tc: "0 °C", tk: "273,15 K", d: "topirea gheții" },
      { c: ZERO, tc: "−273,15 °C", tk: "0 K", d: "zero absolut" },
    ];
    const bx = 372, by = 40, bw = 262, bh = 300;
    const P = new F.Particule({ x: bx, y: by, w: bw, h: bh, n: 16, r: 12, viteza: 220 });

    return {
      reset: function () { auto = true; ta = 0; tinta = tc = 20; eticheta(); },
      draw: function (ctx, t, dt) {
        if (auto) {
          ta += dt;
          tinta = profil(ta);
          slider.value = tinta;
        }
        tc += (tinta - tc) * Math.min(1, dt * 8);
        if (Math.abs(tinta - tc) < 0.02) tc = tinta;
        const zero = tc <= ZERO + 0.01;
        const f = (tc - ZERO) / 373.15;

        // termometrul cu două scări
        ctx.font = font(700, 17);
        ctx.fillStyle = GRI;
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "right";
        ctx.fillText("scara Celsius", xt - 40, 24);
        ctx.textAlign = "left";
        ctx.fillText("scara Kelvin", xt + 40, 24);
        F.termometru(ctx, xt, 52, 468, f, { latime: 22, gradatii: false });
        repere.forEach(function (r) {
          const y = yDin(r.c);
          ctx.strokeStyle = "#8f97a3";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(xt - 30, y);
          ctx.lineTo(xt + 30, y);
          ctx.stroke();
          ctx.textAlign = "right";
          ctx.fillStyle = CERNEALA;
          ctx.font = font(700, 21);
          ctx.fillText(r.tc, xt - 38, y + 7);
          ctx.font = "italic " + font(500, 16);
          ctx.fillStyle = GRI;
          ctx.fillText(r.d, xt - 38, y + 28);
          ctx.textAlign = "left";
          ctx.fillStyle = CERNEALA;
          ctx.font = font(700, 21);
          ctx.fillText(r.tk, xt + 38, y + 7);
        });

        // particulele
        P.pas(dt, zero ? 0 : f);
        F.cutie(ctx, bx, by, bw, bh, { tenta: F.culoareTemp(f, 0.08) });
        P.deseneaza(ctx, F.culoareTemp(f));
        if (zero) {
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          F.rotunjit(ctx, bx + 14, by + bh / 2 - 48, bw - 28, 96, 14);
          ctx.fill();
          ctx.textAlign = "center";
          ctx.fillStyle = "#2a74d6";
          ctx.font = font(800, 27);
          ctx.fillText("Zero absolut", bx + bw / 2, by + bh / 2 - 8);
          ctx.fillStyle = CERNEALA;
          ctx.font = font(600, 19);
          ctx.fillText("particulele nu se mișcă", bx + bw / 2, by + bh / 2 + 26);
        }

        // valorile
        const tr = Math.round(tc);
        const textT = zero ? "0" : F.numar(tr + 273.15, 2);
        const textt = zero ? "−273,15" : F.numar(tr);
        F.scrie(ctx, [["T", "i"], [" = " + textT + " K"]], bx + bw / 2, 402, { marime: 34, greutate: 800, align: "center" });
        F.scrie(ctx, [["t", "i"], [" = " + textt + " °C"]], bx + bw / 2, 450, { marime: 28, align: "center", culoare: GRI });
      },
    };
  });

  // ---------------------------------------------------------------
  // 5. Încălzirea și răcirea apei dintr-un pahar
  // ---------------------------------------------------------------
  function contur(ctx, x, sus, w, jos, r) {
    ctx.beginPath();
    ctx.moveTo(x, sus);
    ctx.lineTo(x, jos - r);
    ctx.arcTo(x, jos, x + r, jos, r);
    ctx.lineTo(x + w - r, jos);
    ctx.arcTo(x + w, jos, x + w, jos - r, r);
    ctx.lineTo(x + w, sus);
  }

  function scenaPahar(id, incalzire) {
    Deck.animatie($(id), function (a) {
      const px = 170, pw = 250, ps = 34, pj = 250, apa = 92;
      const cx = px + pw / 2, cy = (ps + pj) / 2;
      const P = new F.Particule({ x: px + 5, y: apa + 4, w: pw - 10, h: pj - apa - 8, n: 18, r: 10, viteza: 250 });
      const PER = 10.5;
      const temp = incalzire
        ? function (s) { return 20 + 70 * F.limita((s - 0.6) / 7.4); }
        : function (s) { return 20 + 70 * Math.exp(-Math.max(0, s - 0.6) / 2.1); };

      function suport(ctx) {
        ctx.fillStyle = "#e6ddd0";
        ctx.fillRect(10, 350, a.w - 20, 6);
        ctx.strokeStyle = "#8a919c";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(px - 18, 262); ctx.lineTo(px - 44, 349);
        ctx.moveTo(px + pw + 18, 262); ctx.lineTo(px + pw + 44, 349);
        ctx.stroke();
        ctx.fillStyle = "#9aa1ab";
        ctx.fillRect(px - 34, 254, pw + 68, 8);
      }

      function spirtiera(ctx, t) {
        ctx.fillStyle = "rgba(120,170,220,0.35)";
        F.rotunjit(ctx, cx - 40, 312, 80, 38, 12);
        ctx.fill();
        ctx.strokeStyle = "#8f97a3";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = "#b7bec8";
        ctx.fillRect(cx - 12, 300, 24, 13);
        ctx.fillStyle = "#4a4a4a";
        ctx.fillRect(cx - 3, 292, 6, 9);
        const varf = 292 - (27 + 3 * Math.sin(t * 13) + 2 * Math.sin(t * 7.3));
        const vx = cx + 3 * Math.sin(t * 5.1);
        const gr = ctx.createLinearGradient(0, 292, 0, varf);
        gr.addColorStop(0, "#ffb02e");
        gr.addColorStop(1, "rgba(255,90,30,0.85)");
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.moveTo(cx - 10, 292);
        ctx.quadraticCurveTo(cx - 13, 270, vx, varf);
        ctx.quadraticCurveTo(cx + 13, 270, cx + 10, 292);
        ctx.quadraticCurveTo(cx, 298, cx - 10, 292);
        ctx.fill();
        ctx.fillStyle = "rgba(70,130,255,0.75)";
        ctx.beginPath();
        ctx.ellipse(cx, 287, 4, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // săgeți spre exterior: căldura cedată mediului (mai intens când apa e mai caldă)
      const DIRECTII = [180, 0, -40, -140, 30, 150, -90];
      function sageti(ctx, t, tc) {
        const intensitate = F.limita((tc - 20) / 70);
        DIRECTII.forEach(function (gr, i) {
          const u = (gr * Math.PI) / 180;
          const o = ((t * 30 + i * 9) % 36);
          const r0 = 150 + o;
          const x1 = cx + Math.cos(u) * r0, y1 = cy + Math.sin(u) * r0 * 0.85;
          const x2 = cx + Math.cos(u) * (r0 + 46), y2 = cy + Math.sin(u) * (r0 + 46) * 0.85;
          ctx.globalAlpha *= (0.25 + 0.75 * intensitate) * (1 - o / 36);
          F.sageata(ctx, x1, y1, x2, y2, { culoare: "#e0702f", grosime: 5, cap: 16 });
          ctx.globalAlpha = baza;
        });
      }

      let baza = 1;
      return function (ctx, t, dt) {
        const s = t % PER;
        const tc = temp(s);
        baza = estompare(s, PER);
        ctx.globalAlpha = baza;
        P.pas(dt, viteza(tc));

        suport(ctx);
        if (incalzire) spirtiera(ctx, t);
        else sageti(ctx, t, tc);

        contur(ctx, px + 3, apa, pw - 6, pj - 3, 18);
        ctx.closePath();
        ctx.fillStyle = culoare(tc, 0.2);
        ctx.fill();
        P.deseneaza(ctx, culoare(tc));
        F.termometru(ctx, px + pw - 42, 4, 236, tc / 100);

        contur(ctx, px, ps, pw, pj, 20);
        ctx.strokeStyle = "#8d96a3";
        ctx.lineWidth = 3.5;
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px - 8, ps - 4); ctx.lineTo(px, ps + 4);
        ctx.moveTo(px + pw + 8, ps - 4); ctx.lineTo(px + pw, ps + 4);
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.font = font(600, 18);
        ctx.fillStyle = GRI;
        ctx.fillText("temperatura apei", 570, 40);
        ctx.font = font(800, 44);
        ctx.fillStyle = culoare(tc);
        ctx.fillText(F.numar(tc) + " °C", 570, 88);
        ctx.globalAlpha = 1;
      };
    });
  }
  scenaPahar("a-incalzire", true);
  scenaPahar("a-racire", false);

  // ---------------------------------------------------------------
  // 6. Energia internă: mișcare (săgeți) + interacțiune (linii)
  // ---------------------------------------------------------------
  Deck.animatie($("a-energie"), function (a) {
    const b = 6, w = a.w - 2 * b, h = a.h - 2 * b;
    const P = new F.Particule({ x: b, y: b, w: w, h: h, n: 15, r: 15, viteza: 120 });
    const D = 150;
    return function (ctx, t, dt) {
      P.pas(dt, 1);
      F.cutie(ctx, b, b, w, h, { fond: "#fffaf4" });
      ctx.save();
      F.rotunjit(ctx, b, b, w, h, 14);
      ctx.clip();
      const L = P.lista;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      for (let i = 0; i < L.length; i++) {
        for (let j = i + 1; j < L.length; j++) {
          const d = Math.hypot(L[i].x - L[j].x, L[i].y - L[j].y);
          if (d > D) continue;
          ctx.strokeStyle = "rgba(42,116,214," + (0.15 + 0.6 * (1 - d / D)) + ")";
          ctx.beginPath();
          ctx.moveTo(L[i].x, L[i].y);
          ctx.lineTo(L[j].x, L[j].y);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
      P.deseneaza(ctx, "#e07a3a");
      L.forEach(function (p) {
        const v = Math.hypot(p.vx, p.vy);
        if (v < 1) return;
        const ux = p.vx / v, uy = p.vy / v, start = P.r + 2, lung = v * 0.42;
        F.sageata(ctx, p.x + ux * start, p.y + uy * start, p.x + ux * (start + lung), p.y + uy * (start + lung),
          { culoare: CERNEALA, grosime: 2.5, cap: 10 });
      });
      ctx.restore();
    };
  });

  // ---------------------------------------------------------------
  // 7. Transferul de căldură între un corp cald și unul rece
  // ---------------------------------------------------------------
  Deck.animatie($("a-transfer"), function (a) {
    const PER = 11, by = 56, bh = 210;
    const C1 = { x: 8, w: 306 }, C2 = { x: 326, w: 306 };
    const P1 = new F.Particule({ x: C1.x, y: by, w: C1.w, h: bh, n: 15, r: 11, viteza: 260 });
    const P2 = new F.Particule({ x: C2.x, y: by, w: C2.w, h: bh, n: 15, r: 11, viteza: 260 });
    const lung = function (tc) { return (230 * (tc + 20)) / 100; }; // lungimea barei U (ilustrativ)
    const yb = 330, hb = 26;

    function bara(ctx, C, tc, tInit) {
      const x0 = C.x + 30;
      F.scrie(ctx, [["U", "i"]], C.x + 4, yb + 22, { marime: 24 });
      ctx.fillStyle = "#efe8de";
      F.rotunjit(ctx, x0, yb, 260, hb, 6);
      ctx.fill();
      ctx.fillStyle = culoare(tc);
      F.rotunjit(ctx, x0, yb, lung(tc), hb, 6);
      ctx.fill();
      const xm = x0 + lung(tInit), xe = x0 + lung(tc);
      ctx.strokeStyle = CERNEALA;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(xm, yb - 10);
      ctx.lineTo(xm, yb + hb + 6);
      ctx.stroke();
      ctx.setLineDash([]);
      F.scrie(ctx, [["U", "i"], ["1", "sub"]], xm, yb - 16, { marime: 20, align: "center" });
      if (Math.abs(xe - xm) > 34) F.scrie(ctx, [["U", "i"], ["2", "sub"]], xe, yb - 16, { marime: 20, align: "center" });
      return { xm: xm, xe: xe };
    }

    return function (ctx, t, dt) {
      const s = t % PER;
      const k = s < 1.2 ? 1 : Math.exp(-(s - 1.2) / 1.7);
      const t1 = 50 + 30 * k, t2 = 50 - 30 * k;
      const baza = estompare(s, PER);
      ctx.globalAlpha = baza;
      P1.pas(dt, viteza(t1));
      P2.pas(dt, viteza(t2));

      // numele și temperatura fiecărui corp, centrate deasupra lui
      [[C1, "Corpul 1", t1], [C2, "Corpul 2", t2]].forEach(function (c) {
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "left";
        ctx.font = font(700, 22);
        const w1 = ctx.measureText(c[1] + ":  ").width;
        ctx.font = font(800, 26);
        const text = F.numar(c[2]) + " °C";
        const x = c[0].x + c[0].w / 2 - (w1 + ctx.measureText(text).width) / 2;
        ctx.font = font(700, 22);
        ctx.fillStyle = CERNEALA;
        ctx.fillText(c[1] + ":", x, 38);
        ctx.font = font(800, 26);
        ctx.fillStyle = culoare(c[2]);
        ctx.fillText(text, x + w1, 38);
      });

      F.cutie(ctx, C1.x, by, C1.w, bh, { tenta: culoare(t1, 0.08) });
      F.cutie(ctx, C2.x, by, C2.w, bh, { tenta: culoare(t2, 0.08) });
      P1.deseneaza(ctx, culoare(t1));
      P2.deseneaza(ctx, culoare(t2));
      ctx.fillStyle = "#cfc4b4";
      ctx.fillRect(C1.x + C1.w, by + 10, C2.x - C1.x - C1.w, bh - 20);

      // săgeata Q (cât timp există diferență de temperatură) sau „Echilibru termic”
      const ym = by + bh / 2;
      const flux = F.limita((t1 - t2) / 60);
      if (flux > 0.03) {
        ctx.globalAlpha = baza * (0.3 + 0.7 * flux);
        F.sageata(ctx, 244, ym, 404, ym, { culoare: "#ffffff", grosime: 17, cap: 34 });
        F.sageata(ctx, 248, ym, 396, ym, { culoare: PORTOCALIU, grosime: 9, cap: 24 });
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        F.rotunjit(ctx, 298, ym - 62, 44, 40, 10);
        ctx.fill();
        F.scrie(ctx, [["Q", "i"]], 320, ym - 31, { marime: 28, align: "center", culoare: PORTOCALIU });
      } else {
        ctx.globalAlpha = baza * F.limita((0.03 - flux) / 0.02);
        ctx.font = font(800, 22);
        const text = "Echilibru termic";
        const w = ctx.measureText(text).width + 32;
        ctx.fillStyle = "#1a9a6b";
        F.rotunjit(ctx, 320 - w / 2, ym - 22, w, 44, 22);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(text, 320, ym + 8);
      }
      ctx.globalAlpha = baza;

      // energia internă a fiecărui corp
      bara(ctx, C1, t1, 80);
      const b2 = bara(ctx, C2, t2, 20);
      if (b2.xe - b2.xm > 8) {
        const yq = yb + hb + 16;
        ctx.strokeStyle = PORTOCALIU;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(b2.xm, yq - 6); ctx.lineTo(b2.xm, yq); ctx.lineTo(b2.xe, yq); ctx.lineTo(b2.xe, yq - 6);
        ctx.stroke();
        F.scrie(ctx, [["Q", "i"]], (b2.xm + b2.xe) / 2, yq + 26, { marime: 22, align: "center", culoare: PORTOCALIU });
      }
      F.scrie(ctx, [["cedează căldură — "], ["U", "i"], [" scade"]], C1.x + C1.w / 2, 450,
        { marime: 21, greutate: 700, align: "center", culoare: culoare(80) });
      F.scrie(ctx, [["primește căldură — "], ["U", "i"], [" crește"]], C2.x + C2.w / 2, 450,
        { marime: 21, greutate: 700, align: "center", culoare: culoare(20) });
      ctx.globalAlpha = 1;
    };
  });
})();
