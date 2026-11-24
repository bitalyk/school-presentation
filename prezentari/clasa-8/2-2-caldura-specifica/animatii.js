/* Animațiile pentru tema 2.2 „Căldura specifică. Capacitatea termică”. */
(function () {
  "use strict";

  const F = window.Fizica;
  const $ = function (id) { return document.getElementById(id); };
  const font = function (g, m) { return g + " " + m + "px " + F.SANS; };
  const CERNEALA = "#1f2430";
  const GRI = "#5f6573";
  const PORTOCALIU = "#c95a1c";
  const LINIE = "#e6ddd0";

  // Ilustrativ: viteza particulelor crește cu temperatura (în °C, scara 0…100).
  const viteza = function (t) { return 0.15 + 0.85 * F.limita(t / 100); };
  const culoare = function (t, alfa) { return F.culoareTemp(t / 100, alfa); };
  // estompare scurtă la capătul fiecărei bucle, ca reluarea să se vadă clar
  const estompare = function (s, per) { return F.limita(Math.min(s / 0.4, (per - s) / 0.4)); };

  // =====================================================================
  //  Piese de laborator: pahar, trepied, spirtieră, termometru
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
    F.sageata(ctx, x, yJos, x, ySus, { culoare: "#e0702f", grosime: 4, cap: 14 });
    F.scrie(ctx, [["Q", "i"]], x + 6, (yJos + ySus) / 2 + 8, { marime: marime, culoare: "#e0702f" });
    ctx.globalAlpha = a0;
  }

  // Un vas (pahar) cu lichid, pe trepied, cu spirtieră și termometru.
  // o: cx, jos (fundul paharului), w, h, nivel (înălțimea lichidului), n, r (particule), k (spirtiera),
  //    lichid: "apa" | "ulei", termo: (t) → 0…1 pentru termometru
  function Vas(o) {
    this.o = o;
    this.x = o.cx - o.w / 2;
    this.sus = o.jos - o.h;
    this.placa = o.jos + 4;
    this.masa = o.jos + 10 + 92 * o.k;
    this.lat = o.latTermo || 14;
    this.xt = this.x + o.w - 14 - this.lat / 2;
    const top = o.jos - o.nivel;
    this.P = new F.Particule({
      x: this.x + 6, y: top + 4, w: o.w - 26 - this.lat, h: o.nivel - 8,
      n: o.n, r: o.r, viteza: o.viteza || 150,
    });
  }

  Vas.prototype.pas = function (dt, tc) { this.P.pas(dt, viteza(tc)); };

  Vas.prototype.deseneaza = function (ctx, t, tc, flacara) {
    const o = this.o;
    const lp = o.w + 50;
    spirtiera(ctx, o.cx, this.masa, o.k, t, flacara);
    sageataQ(ctx, o.cx + (40 * o.k + lp / 2 - 10) / 2 - 4, this.masa - 12 * o.k, this.placa + 12, flacara,
      Math.round(F.limita(24 * o.k, 18, 26)));

    // trepiedul cu sita
    ctx.strokeStyle = "#8a919c";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(o.cx - lp / 2 + 10, this.placa + 4); ctx.lineTo(o.cx - lp / 2 - 8, this.masa);
    ctx.moveTo(o.cx + lp / 2 - 10, this.placa + 4); ctx.lineTo(o.cx + lp / 2 + 8, this.masa);
    ctx.stroke();
    ctx.fillStyle = "#9aa1ab";
    ctx.fillRect(o.cx - lp / 2, this.placa, lp, 6);

    // lichidul
    const top = o.jos - o.nivel;
    contur(ctx, this.x + 3, top, o.w - 6, o.jos - 3, 14);
    ctx.closePath();
    ctx.fillStyle = o.lichid === "ulei" ? "rgba(232,180,40,0.42)" : culoare(tc, 0.2);
    ctx.fill();
    if (o.lichid === "ulei") {
      ctx.fillStyle = culoare(tc, 0.12);
      ctx.fill();
    }
    this.P.deseneaza(ctx, culoare(tc));

    // termometrul scufundat în lichid
    const termo = o.termo || function (x) { return x / 100; };
    const peste = o.peste === undefined ? 30 : o.peste;
    F.termometru(ctx, this.xt, this.sus - peste, o.h + peste - 8, termo(tc), { latime: this.lat, gradatii: false });

    // paharul
    contur(ctx, this.x, this.sus, o.w, o.jos, 16);
    ctx.strokeStyle = "#8d96a3";
    ctx.lineWidth = 3.5;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.x - 7, this.sus - 4); ctx.lineTo(this.x, this.sus + 4);
    ctx.moveTo(this.x + o.w + 7, this.sus - 4); ctx.lineTo(this.x + o.w, this.sus + 4);
    ctx.stroke();
  };

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
    F.rotunjit(ctx, x - lat / 2, y - h / 2, lat, h, h / 2);
    ctx.fillStyle = o.fond || PORTOCALIU;
    ctx.fill();
    F.scrie(ctx, parti, x, y + m * 0.36, { marime: m, greutate: 700, align: "center", culoare: o.culoare || "#ffffff" });
  }

  // =====================================================================
  //  1. Titlu: apă încălzită la flacăra spirtierei
  // =====================================================================
  Deck.animatie($("a-titlu"), function (a) {
    const V = new Vas({ cx: 270, jos: 372, w: 240, h: 250, nivel: 170, n: 18, r: 11, k: 1.3, latTermo: 18, viteza: 210 });
    const PER = 10;
    return function (ctx, t, dt) {
      const s = t % PER;
      const tc = 20 + 65 * F.limita((s - 0.6) / 8);
      ctx.globalAlpha = estompare(s, PER);
      V.pas(dt, tc);
      masa(ctx, 40, a.w - 20, V.masa);
      V.deseneaza(ctx, t, tc, F.limita((s - 0.2) / 0.4));
      ctx.globalAlpha = 1;
    };
  });

  // =====================================================================
  //  Grafic simplu: axe, gradații, etichete
  // =====================================================================
  function axe(ctx, g) {
    // g: x0, x1, y0 (jos), y1 (sus), xMax, yMax, pasX, pasY, eticheteX(i), titluY, titluX
    ctx.strokeStyle = "#eee6da";
    ctx.lineWidth = 1.5;
    for (let v = g.pasY; v <= g.yMax + 1e-9; v += g.pasY) {
      const y = g.Y(v);
      ctx.beginPath(); ctx.moveTo(g.x0, y); ctx.lineTo(g.x1, y); ctx.stroke();
    }
    F.sageata(ctx, g.x0, g.y0, g.x0, g.y1 - 22, { culoare: "#8a919c", grosime: 2.5, cap: 12 });
    F.sageata(ctx, g.x0, g.y0, g.x1 + 24, g.y0, { culoare: "#8a919c", grosime: 2.5, cap: 12 });
    ctx.font = font(600, 18);
    ctx.fillStyle = GRI;
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";
    for (let v = 0; v <= g.yMax + 1e-9; v += g.pasY) ctx.fillText(F.numar(v), g.x0 - 8, g.Y(v));
    ctx.textBaseline = "alphabetic";
    for (let i = 1; i * g.pasX <= g.xMax + 1e-9; i++) {
      const x = g.X(i * g.pasX);
      ctx.strokeStyle = "#8a919c";
      ctx.beginPath(); ctx.moveTo(x, g.y0 - 5); ctx.lineTo(x, g.y0 + 5); ctx.stroke();
      F.scrie(ctx, g.eticheteX(i), x, g.y0 + 28, { marime: 18, align: "center", culoare: GRI });
    }
    F.scrie(ctx, g.titluY, g.x0 + 12, g.y1 - 12, { marime: 20, culoare: CERNEALA });
    F.scrie(ctx, g.titluX, g.x1 + 26, g.y0 - 14, { marime: 20, align: "right", culoare: CERNEALA });
  }

  function grafic(g) {
    g.X = function (v) { return g.x0 + (v / g.xMax) * (g.x1 - g.x0); };
    g.Y = function (v) { return g.y0 - (v / g.yMax) * (g.y0 - g.y1); };
    return g;
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

  // timpul simulării: 2 s de animație = 1 min de experiment
  const SEC_PE_MIN = 2;
  const START = 0.8;
  const tau = function (s) { return F.limita((s - START) / SEC_PE_MIN, 0, 5); };
  // flacăra se aprinde la început și se stinge după 5 min
  const flacara = function (s) {
    return F.limita((s - 0.3) / 0.4) * F.limita((START + 5 * SEC_PE_MIN + 0.3 - s) / 0.3);
  };

  // =====================================================================
  //  2. Experimentul nr. 1: același vas, încălzit mai mult → Δt mai mare
  // =====================================================================
  Deck.animatie($("a-exp1"), function (a) {
    const V = new Vas({ cx: 170, jos: 330, w: 210, h: 220, nivel: 140, n: 14, r: 9, k: 1.1, latTermo: 16, viteza: 190 });
    const T0 = 20, RATA = 5; // °C pe minut
    const G = grafic({ x0: 470, x1: 750, y0: 400, y1: 90, xMax: 5, yMax: 30, pasX: 1, pasY: 10 });
    G.eticheteX = function (i) { return i === 1 ? [["Q", "i"], ["1", "sub"]] : [[i + ""], ["Q", "i"], ["1", "sub"]]; };
    G.titluY = [["Δ"], ["t", "i"], [", °C"]];
    G.titluX = [["Q", "i"]];
    const PER = START + 5 * SEC_PE_MIN + 3.6;

    return function (ctx, t, dt) {
      const s = t % PER;
      const m = tau(s);
      const tc = T0 + RATA * m;
      ctx.globalAlpha = estompare(s, PER);
      const baza = ctx.globalAlpha;

      V.pas(dt, tc);
      masa(ctx, 20, 340, V.masa);
      V.deseneaza(ctx, t, tc, flacara(s));

      // citiri sub vas
      F.scrie(ctx, [["timpul încălzirii: "], ["τ", "i"], [" = " + F.numar(m, 1) + " min"]], 175, V.masa + 50,
        { marime: 21, align: "center", culoare: GRI });
      F.scrie(ctx, [["t", "i"], [" = " + F.numar(tc) + " °C"]], 175, V.masa + 98,
        { marime: 30, greutate: 800, align: "center", culoare: culoare(tc) });
      F.scrie(ctx, [["Δ"], ["t", "i"], [" = " + F.numar(tc - T0) + " °C"]], 175, V.masa + 140,
        { marime: 30, greutate: 800, align: "center", culoare: CERNEALA });

      // graficul Δt(Q)
      F.scrie(ctx, [["în fiecare minut apa primește "], ["Q", "i"], ["1", "sub"]],
        (G.x0 + G.x1) / 2, 34, { marime: 19, align: "center", culoare: GRI });
      axe(ctx, G);
      ctx.strokeStyle = PORTOCALIU;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(G.X(0), G.Y(0));
      ctx.lineTo(G.X(m), G.Y(RATA * m));
      ctx.stroke();

      const repere = [
        { q: 1, text: [["1) "], ["Q", "i"], ["1", "sub"], [" mică  →  Δ"], ["t", "i"], ["1", "sub"], [" = 5 °C"]] },
        { q: 5, text: [["2) "], ["Q", "i"], ["2", "sub"], [" = 5"], ["Q", "i"], ["1", "sub"], [" mare  →  Δ"], ["t", "i"], ["2", "sub"], [" = 25 °C"]] },
      ];
      repere.forEach(function (r, i) {
        const f = F.limita((m - r.q) * 4 + 1);
        if (m < r.q - 0.001) return;
        ctx.globalAlpha = baza * f;
        punctat(ctx, G.X(r.q), G.Y(RATA * r.q), G.x0, G.Y(RATA * r.q), "rgba(201,90,28,0.6)");
        punctat(ctx, G.X(r.q), G.Y(RATA * r.q), G.X(r.q), G.y0, "rgba(201,90,28,0.6)");
        punct(ctx, G.X(r.q), G.Y(RATA * r.q), PORTOCALIU, 8);
        ctx.font = font(800, 16);
        ctx.fillStyle = PORTOCALIU;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(F.numar(RATA * r.q), G.x0 + 6, G.Y(RATA * r.q) - 11);
        ctx.textBaseline = "alphabetic";
        F.scrie(ctx, r.text, 384, G.y0 + 76 + i * 40, { marime: 21, culoare: CERNEALA });
        ctx.globalAlpha = baza;
      });

      const fin = F.limita((s - START - 5 * SEC_PE_MIN - 0.4) / 0.4);
      if (fin > 0) {
        ctx.globalAlpha = baza * fin;
        pastila(ctx, [["Δ"], ["t", "i"], [" ∼ "], ["Q", "i"]], (G.x0 + G.x1) / 2, G.y0 + 170, { marime: 26 });
      }
      ctx.globalAlpha = 1;
    };
  });

  // =====================================================================
  //  3–4. Experimentele nr. 2 și nr. 3: două vase, tabel și grafic t(τ)
  // =====================================================================
  function laborator(id, cfg) {
    Deck.animatie($(id), function (a) {
      const T0 = 20;
      const XV = [140, 540];
      const vase = cfg.vase.map(function (v, i) {
        return new Vas({
          cx: XV[i], jos: 264, w: 150, h: 175, nivel: v.nivel, n: v.n, r: 7.5, k: 0.85,
          lichid: v.lichid, latTermo: 13, viteza: 140, peste: 16,
        });
      });
      const G = grafic({ x0: 470, x1: 712, y0: 590, y1: 410, xMax: 5, yMax: 100, pasX: 1, pasY: 20 });
      G.eticheteX = function (i) { return [[i + ""]]; };
      G.titluY = [["t", "i"], [", °C"]];
      G.titluX = [["τ", "i"], [", min"]];
      const PER = START + 5 * SEC_PE_MIN + 3.8;

      // tabelul
      const TX = 6, TY = 384, CW = [92, 142, 142], HH = 58, RH = 30;
      function tabel(ctx, m, baza) {
        const lat = CW[0] + CW[1] + CW[2];
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(TX, TY, lat, HH + 6 * RH);
        ctx.fillStyle = "#f6efe5";
        ctx.fillRect(TX, TY, lat, HH);
        ctx.strokeStyle = "#cfc4b4";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(TX, TY, lat, HH + 6 * RH);
        let x = TX;
        for (let c = 0; c < 2; c++) {
          x += CW[c];
          ctx.beginPath(); ctx.moveTo(x, TY); ctx.lineTo(x, TY + HH + 6 * RH); ctx.stroke();
        }
        for (let r = 0; r <= 6; r++) {
          ctx.beginPath(); ctx.moveTo(TX, TY + HH + r * RH); ctx.lineTo(TX + lat, TY + HH + r * RH); ctx.stroke();
        }
        F.scrie(ctx, [["τ", "i"], [", min"]], TX + CW[0] / 2, TY + 36, { marime: 19, align: "center" });
        cfg.vase.forEach(function (v, i) {
          const cx = TX + CW[0] + CW[1] * i + CW[1 + i] / 2;
          F.scrie(ctx, [[v.nume]], cx, TY + 25, { marime: 19, greutate: 800, align: "center", culoare: v.culoare });
          F.scrie(ctx, v.sub, cx, TY + 48, { marime: 15, align: "center", culoare: GRI });
        });
        for (let r = 0; r <= 5; r++) {
          const f = F.limita((m - r) * 5 + 1);
          if (m < r - 1e-6 || f <= 0) continue;
          const y = TY + HH + r * RH + 22;
          ctx.globalAlpha = baza * f;
          F.scrie(ctx, [[r + ""]], TX + CW[0] / 2, y, { marime: 19, align: "center", culoare: GRI });
          cfg.vase.forEach(function (v, i) {
            const cx = TX + CW[0] + CW[1] * i + CW[1 + i] / 2;
            F.scrie(ctx, [[F.numar(T0 + v.rata * r) + " °C"]], cx, y, { marime: 19, greutate: 700, align: "center", culoare: CERNEALA });
          });
          ctx.globalAlpha = baza;
        }
      }

      return function (ctx, t, dt) {
        const s = t % PER;
        const m = tau(s);
        ctx.globalAlpha = estompare(s, PER);
        const baza = ctx.globalAlpha;
        masa(ctx, 0, a.w, vase[0].masa);

        cfg.vase.forEach(function (v, i) {
          const V = vase[i];
          const tc = T0 + v.rata * m;
          V.pas(dt, tc);
          V.deseneaza(ctx, t, tc, flacara(s));
          // eticheta vasului
          F.scrie(ctx, [[v.nume]], XV[i], 28, { marime: 22, greutate: 800, align: "center", culoare: v.culoare });
          F.scrie(ctx, v.sub, XV[i], 54, { marime: 18, align: "center", culoare: GRI });
          // citirea temperaturii
          const xr = XV[i] + 165;
          F.scrie(ctx, [["t", "i"], [" = " + F.numar(tc) + " °C"]], xr, 168,
            { marime: 26, greutate: 800, align: "center", culoare: culoare(tc) });
          F.scrie(ctx, [["Δ"], ["t", "i"], [" = " + F.numar(tc - T0) + " °C"]], xr, 204,
            { marime: 20, greutate: 700, align: "center", culoare: CERNEALA });
        });
        F.scrie(ctx, [["τ", "i"], [" = " + F.numar(m, 1) + " min"]], a.w / 2 + 2, 34,
          { marime: 20, greutate: 700, align: "center", culoare: GRI });

        tabel(ctx, m, baza);

        axe(ctx, G);
        cfg.vase.forEach(function (v) {
          ctx.strokeStyle = v.culoare;
          ctx.lineWidth = 4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(G.X(0), G.Y(T0));
          ctx.lineTo(G.X(m), G.Y(T0 + v.rata * m));
          ctx.stroke();
          for (let r = 0; r <= Math.floor(m + 1e-6); r++) punct(ctx, G.X(r), G.Y(T0 + v.rata * r), v.culoare, 5);
          if (m > 0.05) {
            F.scrie(ctx, [[v.scurt]], G.X(m) + 10, G.Y(T0 + v.rata * m) + 7, { marime: 19, greutate: 800, culoare: v.culoare });
          }
        });

        const fin = F.limita((s - START - 5 * SEC_PE_MIN - 0.4) / 0.4);
        if (fin > 0) {
          ctx.globalAlpha = baza * fin;
          pastila(ctx, cfg.relatie, G.x0 + 142, G.y1 + 26, { marime: 21, pad: 14 });
        }
        ctx.globalAlpha = 1;
      };
    });
  }

  laborator("a-exp2", {
    vase: [
      { nume: "Vasul A", scurt: "A", sub: [["m", "i"], ["1", "sub"], [" = 100 g"]], nivel: 52, n: 5, rata: 8, culoare: "#d9452b" },
      { nume: "Vasul B", scurt: "B", sub: [["m", "i"], ["2", "sub"], [" = 200 g = 2"], ["m", "i"], ["1", "sub"]], nivel: 104, n: 10, rata: 4, culoare: "#2a74d6" },
    ],
    relatie: [["Δ"], ["t", "i"], [" ∼ 1/"], ["m", "i"]],
  });

  // aceeași masă: uleiul (mai puțin dens) urcă puțin mai sus în vas
  laborator("a-exp3", {
    vase: [
      { nume: "Vasul A", scurt: "ulei", sub: [["ulei vegetal, "], ["m", "i"], ["1", "sub"]], nivel: 86, n: 8, rata: 10, culoare: "#b7800b", lichid: "ulei" },
      { nume: "Vasul B", scurt: "apă", sub: [["apă, "], ["m", "i"], ["2", "sub"], [" = "], ["m", "i"], ["1", "sub"]], nivel: 78, n: 8, rata: 4, culoare: "#2a74d6" },
    ],
    relatie: [["Δ"], ["t", "i"], [" depinde de substanță"]],
  });

  // =====================================================================
  //  5. Căldura specifică a unor substanțe
  // =====================================================================
  Deck.animatie($("a-specifica"), function (a) {
    const DATE = [
      ["apă", "apă", 4200],
      ["gheață", "gheață", 2100],
      ["ulei vegetal", "ulei vegetal", 1700],
      ["aluminiu", "aluminiu", 920],
      ["fier", "fier", 460],
      ["cupru", "cupru", 400],
      ["plumb", "plumb", 140],
    ];
    const X0 = 150, XM = 500, Y0 = 56, RH = 44;
    const PAS = 2.4, CRESTERE = 1.2;
    return function (ctx, t) {
      F.scrie(ctx, [["Căldura specifică "], ["c", "i"], [" a unor substanțe, J/(kg · °C)"]], 0, 26, { marime: 20, greutate: 700 });
      const cr = F.limita(t / CRESTERE);
      const ease = 1 - Math.pow(1 - cr, 3);
      const activ = t < CRESTERE + 0.3 ? -1 : Math.floor((t - CRESTERE - 0.3) / PAS) % DATE.length;
      DATE.forEach(function (d, i) {
        const y = Y0 + i * RH;
        const lat = (d[2] / 4200) * (XM - X0) * ease;
        const sel = i === activ;
        ctx.font = font(sel ? 800 : 600, 20);
        ctx.fillStyle = sel ? PORTOCALIU : CERNEALA;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(d[0], X0 - 12, y + 15);
        F.rotunjit(ctx, X0, y + 3, Math.max(lat, 4), 24, 8);
        ctx.fillStyle = sel ? PORTOCALIU : "#e9b48f";
        ctx.fill();
        ctx.font = font(800, 19);
        ctx.fillStyle = sel ? PORTOCALIU : GRI;
        ctx.textAlign = "left";
        ctx.fillText(String(Math.round(d[2] * ease)), X0 + lat + 10, y + 15);
        ctx.textBaseline = "alphabetic";
      });
      if (activ >= 0) {
        const d = DATE[activ];
        const f = F.limita(((t - CRESTERE - 0.3) % PAS) / 0.3) * F.limita((PAS - ((t - CRESTERE - 0.3) % PAS)) / 0.3);
        ctx.globalAlpha = f;
        F.scrie(ctx, [["Pentru a încălzi 1 kg de " + d[1] + " cu 1 °C sunt necesari " + d[2] + " J."]],
          a.w / 2, Y0 + DATE.length * RH + 34, { marime: 19, greutate: 700, align: "center", culoare: PORTOCALIU });
        ctx.globalAlpha = 1;
      }
    };
  });

  // =====================================================================
  //  6. Capacitatea termică: o cană și o oală cu apă, încălzite cu 1 °C
  // =====================================================================
  Deck.animatie($("a-capacitate"), function (a) {
    const termo = function (tc) { return (tc - 17) / 6; };
    const corpuri = [
      { nume: [["cană: "], ["m", "i"], [" = 0,2 kg apă"]], C: 840,
        V: new Vas({ cx: 130, jos: 236, w: 100, h: 110, nivel: 42, n: 4, r: 7, k: 0.75, latTermo: 12, termo: termo, viteza: 120 }) },
      { nume: [["oală: "], ["m", "i"], [" = 1 kg apă"]], C: 4200,
        V: new Vas({ cx: 425, jos: 236, w: 230, h: 150, nivel: 104, n: 16, r: 8, k: 0.75, latTermo: 14, termo: termo, viteza: 120 }) },
    ];
    const T0 = 20, PUTERE = 600; // J pe secundă de animație (aceeași spirtieră)
    const PER = 0.8 + 7 + 3.4;
    return function (ctx, t, dt) {
      const s = t % PER;
      ctx.globalAlpha = estompare(s, PER);
      const baza = ctx.globalAlpha;
      masa(ctx, 0, a.w, corpuri[0].V.masa);
      corpuri.forEach(function (c) {
        const Q = F.limita(PUTERE * (s - 0.8), 0, c.C);
        const tc = T0 + Q / c.C;
        const gata = Q >= c.C;
        const fl = F.limita((s - 0.3) / 0.4) * (gata ? F.limita(1 - (s - 0.8 - c.C / PUTERE) / 0.3) : 1);
        c.V.pas(dt, tc);
        c.V.deseneaza(ctx, t, tc, fl);
        const x = c.V.o.cx;
        F.scrie(ctx, c.nume, x, 24, { marime: 19, greutate: 700, align: "center", culoare: CERNEALA });
        F.scrie(ctx, [["t", "i"], [" = " + F.numar(tc, 1) + " °C"]], x, 56,
          { marime: 24, greutate: 800, align: "center", culoare: culoare(30 + (tc - T0) * 40) });
        F.scrie(ctx, [["Q", "i"], [" = " + Math.round(Q) + " J"]], x, c.V.masa + 34,
          { marime: 22, greutate: 700, align: "center", culoare: "#e0702f" });
        if (gata) {
          ctx.globalAlpha = baza * F.limita((s - 0.8 - c.C / PUTERE) / 0.4);
          pastila(ctx, [["Δ"], ["t", "i"], [" = 1 °C  →  "], ["C", "i"], [" = " + c.C + " J/°C"]], x, c.V.masa + 68,
            { marime: 18, pad: 14, fond: "#1f8a5b" });
          ctx.globalAlpha = baza;
        }
      });
      ctx.globalAlpha = 1;
    };
  });
})();
