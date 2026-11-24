/*
  Motor comun pentru prezentări.
  - slide-uri 16:9 (1600×900) scalate pe orice ecran;
  - navigare: săgeți, Spațiu, PageUp/PageDown (telecomanda de prezentare), butoane, swipe; F = ecran complet;
  - animații pe <canvas data-w data-h>, care rulează doar pe slide-ul activ (Deck.animatie);
  - ajutoare de fizică pentru desen: particule, termometru, săgeți (Fizica).
*/
(function () {
  "use strict";

  const LATIME = 1600;
  const INALTIME = 900;
  const SANS = "'Fizica Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', Ubuntu, sans-serif";
  const SERIF = "'Cambria Math', 'STIX Two Math', 'Latin Modern Math', 'Times New Roman', 'DejaVu Serif', serif";

  const body = document.body;
  const stage = document.querySelector(".stage");
  const slides = Array.prototype.slice.call(stage.querySelectorAll(".slide"));
  const anims = [];
  let curent = -1;
  let scara = 1;

  // ---------- bara de navigare ----------

  const bara = document.createElement("nav");
  bara.className = "bara";
  bara.setAttribute("aria-label", "Navigare");
  bara.innerHTML =
    '<a class="buton" href="' + (body.dataset.inapoi || "../") + '">← ' + (body.dataset.inapoiText || "Înapoi") + "</a>" +
    '<span class="contor" aria-live="polite"></span>' +
    '<span class="grup">' +
    '<button class="buton" type="button" data-act="inapoi" title="Slide-ul anterior (←)" aria-label="Slide-ul anterior">‹</button>' +
    '<button class="buton" type="button" data-act="inainte" title="Slide-ul următor (→)" aria-label="Slide-ul următor">›</button>' +
    '<button class="buton" type="button" data-act="ecran" title="Ecran complet (F)">Ecran complet</button>' +
    "</span>";
  body.appendChild(bara);

  const progres = document.createElement("div");
  progres.className = "progres";
  body.appendChild(progres);
  const contor = bara.querySelector(".contor");

  bara.addEventListener("click", function (e) {
    const b = e.target.closest("button");
    if (!b) return;
    b.blur();
    if (b.dataset.act === "inapoi") mergiLa(curent - 1);
    else if (b.dataset.act === "inainte") mergiLa(curent + 1);
    else ecranComplet();
  });

  function ecranComplet() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  }

  function mergiLa(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === curent) return;
    if (curent >= 0) slides[curent].classList.remove("activ");
    curent = i;
    const s = slides[curent];
    s.classList.add("activ");
    contor.textContent = curent + 1 + " / " + slides.length;
    progres.style.width = ((curent + 1) / slides.length) * 100 + "%";
    if (history.replaceState) history.replaceState(null, "", "#" + (curent + 1));
    const acum = performance.now();
    anims.forEach(function (a) {
      if (a.slide === s) {
        a.t0 = acum;
        if (a.reset) a.reset();
      }
    });
  }

  // ---------- tastatură și atingere ----------

  const INAINTE = ["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"];
  const INAPOI = ["ArrowLeft", "ArrowUp", "PageUp", "Backspace"];

  document.addEventListener("keydown", function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target;
    const k = e.key;
    if (t.closest && t.closest("input, select, textarea")) return;
    if ((k === "Enter" || k === " ") && t.closest && t.closest("a, button")) return;
    if (INAINTE.indexOf(k) >= 0) { e.preventDefault(); mergiLa(curent + 1); }
    else if (INAPOI.indexOf(k) >= 0) { e.preventDefault(); mergiLa(curent - 1); }
    else if (k === "Home") mergiLa(0);
    else if (k === "End") mergiLa(slides.length - 1);
    else if (k === "f" || k === "F") ecranComplet();
  });

  let atingere = null;
  document.addEventListener("touchstart", function (e) {
    atingere = e.target.closest("input, .bara, .interactiv") ? null : [e.touches[0].clientX, e.touches[0].clientY];
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (!atingere) return;
    const dx = e.changedTouches[0].clientX - atingere[0];
    const dy = e.changedTouches[0].clientY - atingere[1];
    atingere = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) mergiLa(curent + (dx < 0 ? 1 : -1));
  });

  // ---------- scalare și animații ----------

  // Un strat invizibil cât tot ecranul: măsurăm ce se vede de fapt, nu window.innerWidth,
  // care poate minți când sistemul are textul mărit (ex. 118 %) sau în ecran complet.
  const masura = document.createElement("div");
  masura.setAttribute("aria-hidden", "true");
  masura.style.cssText = "position:fixed;inset:0;visibility:hidden;pointer-events:none";
  body.appendChild(masura);

  let ultimaFereastra = "";
  function potriveste() {
    stage.style.setProperty("--s", 1);
    const s = stage.getBoundingClientRect();
    const v = masura.getBoundingClientRect();
    if (!s.width || !v.width) return;
    scara = Math.min(v.width / s.width, v.height / s.height);
    stage.style.setProperty("--s", scara);
    ultimaFereastra = v.width + "x" + v.height;
    anims.forEach(dimensiune);
  }

  function dimensiune(a) {
    // pixeli reali pe ecran pentru un pixel de slide (ține cont și de zoom-ul ascuns)
    const lat = a.canvas.getBoundingClientRect().width;
    a.k = (lat > 0 ? lat / a.w : scara) * (window.devicePixelRatio || 1);
    a.canvas.width = Math.max(1, Math.round(a.w * a.k));
    a.canvas.height = Math.max(1, Math.round(a.h * a.k));
  }

  // fabrica(a) întoarce draw(ctx, t, dt) sau { draw, reset }; t = secunde de la intrarea pe slide
  function animatie(canvas, fabrica) {
    if (!canvas) return;
    const a = {
      canvas: canvas,
      ctx: canvas.getContext("2d"),
      w: +canvas.dataset.w,
      h: +canvas.dataset.h,
      slide: canvas.closest(".slide"),
      t0: performance.now(),
    };
    canvas.style.width = a.w + "px";
    canvas.style.height = a.h + "px";
    const r = fabrica(a);
    if (typeof r === "function") a.draw = r;
    else { a.draw = r.draw; a.reset = r.reset; }
    dimensiune(a);
    anims.push(a);
  }

  let ultim = performance.now();
  function bucla(acum) {
    const dt = Math.min(0.05, Math.max(0, (acum - ultim) / 1000));
    ultim = acum;
    const activ = slides[curent];
    for (let i = 0; i < anims.length; i++) {
      const a = anims[i];
      if (a.slide !== activ) continue;
      const ctx = a.ctx;
      ctx.setTransform(a.k, 0, 0, a.k, 0, 0);
      ctx.clearRect(0, 0, a.w, a.h);
      ctx.globalAlpha = 1;
      a.draw(ctx, Math.max(0, (acum - a.t0) / 1000), dt);
    }
    requestAnimationFrame(bucla);
  }

  window.addEventListener("resize", potriveste);
  document.addEventListener("fullscreenchange", potriveste);
  if (window.ResizeObserver) new ResizeObserver(potriveste).observe(masura);
  // plasă de siguranță: verificăm de două ori pe secundă dacă s-a schimbat fereastra
  setInterval(function () {
    const v = masura.getBoundingClientRect();
    if (v.width + "x" + v.height !== ultimaFereastra) potriveste();
  }, 500);
  potriveste();
  const dinAdresa = parseInt(location.hash.slice(1), 10);
  mergiLa(dinAdresa >= 1 ? dinAdresa - 1 : 0);
  requestAnimationFrame(bucla);

  window.Deck = { animatie: animatie, mergiLa: mergiLa };

  // =====================================================================
  //  Ajutoare de desen pentru fizică
  // =====================================================================

  function limita(x, a, b) {
    return Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, x));
  }

  function rotunjit(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function cutie(ctx, x, y, w, h, o) {
    o = o || {};
    rotunjit(ctx, x, y, w, h, o.raza || 14);
    ctx.fillStyle = o.fond || "#ffffff";
    ctx.fill();
    if (o.tenta) { ctx.fillStyle = o.tenta; ctx.fill(); }
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = o.contur || "#cfc4b4";
    ctx.stroke();
  }

  // 0 = rece (albastru) … 1 = cald (roșu)
  const STOPURI = [[44, 116, 214], [146, 92, 186], [222, 70, 44]];
  function culoareTemp(f, alfa) {
    f = limita(f);
    const i = f < 0.5 ? 0 : 1;
    const u = f < 0.5 ? f * 2 : (f - 0.5) * 2;
    const A = STOPURI[i], B = STOPURI[i + 1];
    return "rgba(" +
      Math.round(A[0] + (B[0] - A[0]) * u) + "," +
      Math.round(A[1] + (B[1] - A[1]) * u) + "," +
      Math.round(A[2] + (B[2] - A[2]) * u) + "," +
      (alfa === undefined ? 1 : alfa) + ")";
  }

  function geomTermometru(y, h, lat) {
    const br = lat * 1.15;
    const yb = y + h - br;
    return { br: br, yb: yb, sus: y + lat * 1.2, jos: yb - br - 6 };
  }

  // x = centrul tubului, y = capătul de sus, h = înălțimea totală; f = 0…1 nivelul lichidului
  function termometru(ctx, x, y, h, f, o) {
    o = o || {};
    const lat = o.latime || 16;
    const g = geomTermometru(y, h, lat);
    const a = Math.asin(lat / 2 / g.br);
    const yc = g.yb - g.br * Math.cos(a);
    ctx.beginPath();
    ctx.moveTo(x - lat / 2, yc);
    ctx.lineTo(x - lat / 2, y + lat / 2);
    ctx.arc(x, y + lat / 2, lat / 2, Math.PI, 0);
    ctx.lineTo(x + lat / 2, yc);
    ctx.arc(x, g.yb, g.br, -Math.PI / 2 + a, Math.PI * 1.5 - a);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#8f97a3";
    ctx.stroke();

    ctx.fillStyle = o.lichid || "#e0452b";
    ctx.beginPath();
    ctx.arc(x, g.yb, g.br - 4.5, 0, Math.PI * 2);
    ctx.fill();
    const nivel = g.jos - limita(f) * (g.jos - g.sus);
    const lw = lat - 8;
    ctx.fillRect(x - lw / 2, nivel, lw, g.yb - nivel);

    if (o.gradatii !== false) {
      ctx.strokeStyle = "#8f97a3";
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= 10; i++) {
        const yy = g.jos - (i / 10) * (g.jos - g.sus);
        const l = i % 5 === 0 ? 10 : 6;
        ctx.beginPath();
        ctx.moveTo(x + lat / 2 + 3, yy);
        ctx.lineTo(x + lat / 2 + 3 + l, yy);
        ctx.stroke();
      }
    }
    return g;
  }

  function sageata(ctx, x1, y1, x2, y2, o) {
    o = o || {};
    const cap = o.cap || 12;
    const lung = Math.hypot(x2 - x1, y2 - y1);
    if (lung < 2) return;
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = ctx.fillStyle = o.culoare || "#1f2430";
    ctx.lineWidth = o.grosime || 3;
    ctx.lineCap = "round";
    const c = Math.min(cap, lung);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2 - Math.cos(ang) * c * 0.8, y2 - Math.sin(ang) * c * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - c * Math.cos(ang - 0.45), y2 - c * Math.sin(ang - 0.45));
    ctx.lineTo(x2 - c * Math.cos(ang + 0.45), y2 - c * Math.sin(ang + 0.45));
    ctx.closePath();
    ctx.fill();
  }

  // număr cu virgulă zecimală și minus tipografic: numar(-273.15, 2) → "−273,15"
  function numar(v, zec) {
    zec = zec || 0;
    if (Math.abs(v) < 0.5 / Math.pow(10, zec)) v = 0;
    return v.toFixed(zec).replace(".", ",").replace("-", "−");
  }

  // text cu variabile în italic și indici: scrie(ctx, [["U","i"],["2","sub"],[" = 5 J"]], x, y, {align, marime})
  function scrie(ctx, parti, x, y, o) {
    o = o || {};
    const m = o.marime || 24;
    const g = o.greutate || 600;
    function fontParte(p) {
      if (p[1] === "sub") return g + " " + Math.round(m * 0.62) + "px " + SANS;
      if (p[1] === "i") return "italic 400 " + Math.round(m * 1.12) + "px " + SERIF;
      return g + " " + m + "px " + SANS;
    }
    let total = 0;
    const latimi = parti.map(function (p) {
      ctx.font = fontParte(p);
      const w = ctx.measureText(p[0]).width;
      total += w;
      return w;
    });
    let xx = o.align === "center" ? x - total / 2 : o.align === "right" ? x - total : x;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = o.culoare || "#1f2430";
    parti.forEach(function (p, i) {
      ctx.font = fontParte(p);
      ctx.fillText(p[0], xx, p[1] === "sub" ? y + m * 0.24 : y);
      xx += latimi[i];
    });
    return total;
  }

  // Particule care se mișcă haotic într-o cutie și se ciocnesc elastic.
  // pas(dt, f): f = factorul de viteză (0 = nemișcate, 1 = viteza de bază).
  function Particule(o) {
    this.x0 = o.x;
    this.y0 = o.y;
    this.w = o.w;
    this.h = o.h;
    this.r = o.r || 10;
    this.v = o.viteza || 150;
    this.lista = [];
    const n = o.n || 20;
    let incercari = 0;
    while (this.lista.length < n && incercari++ < 5000) {
      const x = this.x0 + this.r + Math.random() * (this.w - 2 * this.r);
      const y = this.y0 + this.r + Math.random() * (this.h - 2 * this.r);
      const r2 = Math.pow(2.3 * this.r, 2);
      if (this.lista.some(function (p) { return (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y) < r2; })) continue;
      const ang = Math.random() * Math.PI * 2;
      const mod = this.v * (0.55 + Math.random() * 0.9);
      this.lista.push({ x: x, y: y, vx: Math.cos(ang) * mod, vy: Math.sin(ang) * mod });
    }
  }

  Particule.prototype.pas = function (dt, f) {
    const r = this.r, L = this.lista;
    const xmin = this.x0 + r, xmax = this.x0 + this.w - r;
    const ymin = this.y0 + r, ymax = this.y0 + this.h - r;
    for (let i = 0; i < L.length; i++) {
      const p = L[i];
      p.x += p.vx * f * dt;
      p.y += p.vy * f * dt;
      if (p.x < xmin) { p.x = xmin; p.vx = Math.abs(p.vx); }
      if (p.x > xmax) { p.x = xmax; p.vx = -Math.abs(p.vx); }
      if (p.y < ymin) { p.y = ymin; p.vy = Math.abs(p.vy); }
      if (p.y > ymax) { p.y = ymax; p.vy = -Math.abs(p.vy); }
    }
    const min = 2 * r;
    for (let i = 0; i < L.length; i++) {
      for (let j = i + 1; j < L.length; j++) {
        const a = L[i], b = L[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 >= min * min || d2 === 0) continue;
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
        const s = (min - d) / 2;
        a.x -= nx * s; a.y -= ny * s;
        b.x += nx * s; b.y += ny * s;
        const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (vn < 0) {
          a.vx += vn * nx; a.vy += vn * ny;
          b.vx -= vn * nx; b.vy -= vn * ny;
        }
      }
    }
  };

  // culoare: text sau funcție(p) → text
  Particule.prototype.deseneaza = function (ctx, culoare) {
    const r = this.r;
    const fn = typeof culoare === "function";
    for (let i = 0; i < this.lista.length; i++) {
      const p = this.lista[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = fn ? culoare(p) : culoare;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x - r * 0.35, p.y - r * 0.35, r * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fill();
    }
  };

  window.Fizica = {
    SANS: SANS,
    SERIF: SERIF,
    limita: limita,
    rotunjit: rotunjit,
    cutie: cutie,
    culoareTemp: culoareTemp,
    geomTermometru: geomTermometru,
    termometru: termometru,
    sageata: sageata,
    numar: numar,
    scrie: scrie,
    Particule: Particule,
  };
})();
