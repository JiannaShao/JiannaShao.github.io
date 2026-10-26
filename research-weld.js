/* =========================================================
   RESEARCH TITLE — each letter is "welded" in: a glowing azure
   arc traces the letter's actual outline, throwing sparks from
   the torch point, then the letter fills in hot and cools to
   navy. Letters overlap so the whole title finishes quickly.
   Outlines come from the bundled DM Serif Display font
   (fonts/DMSerifDisplay-Regular.ttf) read with opentype.js.
   ========================================================= */
(function () {
  var title = document.getElementById('rx-title');
  if (!title) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- split into letter spans (kept permanently so nothing shifts afterwards) ----
  var chars = [];
  title.querySelectorAll('.rx-line').forEach(function (line) {
    var text = line.textContent.trim();
    line.textContent = '';
    line.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.className = 'rx-ch';
      span.textContent = text[i];
      line.appendChild(span);
      if (text[i] !== ' ') chars.push({ span: span, ch: text[i], line: line });
    }
    // zero-size marker sitting on the baseline, used to place the outlines
    var probe = document.createElement('span');
    probe.className = 'rx-baseline';
    line.appendChild(probe);
  });
  if (reduce) return;
  title.classList.add('is-welding');

  var STAGGER = 42;     // ms between letter starts (they overlap)
  var TRACE = 520;      // ms for the torch to trace one letter
  var START = 120;      // ms after the page is revealed

  // ---- spark layer ----
  var PAD = 80;
  var canvas = document.createElement('canvas');
  canvas.className = 'rx-sparks';
  canvas.setAttribute('aria-hidden', 'true');
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'rx-arc');
  svg.setAttribute('aria-hidden', 'true');

  function sizeLayers() {
    var r = title.getBoundingClientRect();
    [canvas, svg].forEach(function (el) {
      el.style.left = -PAD + 'px';
      el.style.top = -PAD + 'px';
      el.style.width = (r.width + PAD * 2) + 'px';
      el.style.height = (r.height + PAD * 2) + 'px';
    });
    svg.setAttribute('viewBox', '0 0 ' + (r.width + PAD * 2) + ' ' + (r.height + PAD * 2));
    canvas.width = Math.round((r.width + PAD * 2) * dpr);
    canvas.height = Math.round((r.height + PAD * 2) * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  var sparks = [];
  // saturated azure / turquoise so sparks read against the light page
  var COLORS = ['#00b4d8', '#0096c7', '#13c4e0', '#2ad3ea', '#48cae4', '#0077b6'];
  function emit(x, y, n, power) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      var v = (2.2 + Math.random() * 5.2) * power;
      sparks.push({
        x: x, y: y, px: x, py: y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 2.2 * power,
        life: 0,
        max: 18 + Math.random() * 26,
        c: COLORS[(Math.random() * COLORS.length) | 0]
      });
    }
  }
  function drawSparks(heads) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i];
      s.vy += 0.26;
      s.vx *= 0.98;
      s.x += s.vx; s.y += s.vy;
      var k = 1 - (++s.life) / s.max;
      if (k <= 0) { sparks.splice(i, 1); continue; }
      // streak drawn behind the spark along its motion, like a long-exposure spark
      var tx = s.x - s.vx * 2.6, ty = s.y - s.vy * 2.6;
      ctx.globalAlpha = Math.min(1, k * 1.3);
      ctx.strokeStyle = s.c;
      ctx.lineWidth = 2.2 * k + 0.8;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      // hot white core at the tip
      ctx.globalAlpha = k;
      ctx.fillStyle = '#e9fdff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 0.9 * k + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // bright arc point at each torch
    heads.forEach(function (h) {
      var g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.r);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.3, 'rgba(42,211,234,.95)');
      g.addColorStop(1, 'rgba(0,150,199,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  // ---- fallback if the font can't be read: glow-in letters with sparks ----
  function simpleWeld() {
    title.appendChild(canvas);
    sizeLayers();
    var t0 = performance.now();
    chars.forEach(function (c, i) {
      setTimeout(function () {
        c.span.classList.add('is-hot');
        var tr = title.getBoundingClientRect();
        var r = c.span.getBoundingClientRect();
        emit(r.left - tr.left + r.width / 2 + PAD, r.top - tr.top + r.height * 0.7 + PAD, 18, 1);
      }, START + i * STAGGER * 1.4);
    });
    var end = START + chars.length * STAGGER * 1.4 + 1400;
    (function loop() {
      drawSparks([]);
      if (performance.now() - t0 < end) requestAnimationFrame(loop);
      else finish();
    })();
  }

  function finish() {
    title.classList.remove('is-welding');
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    if (svg.parentNode) svg.parentNode.removeChild(svg);
  }

  // ---- main: trace the real outlines ----
  function traceWeld(font) {
    title.appendChild(svg);
    title.appendChild(canvas);
    sizeLayers();
    var tr = title.getBoundingClientRect();

    var items = chars.map(function (c, i) {
      var r = c.span.getBoundingClientRect();
      var base = c.line.querySelector('.rx-baseline').getBoundingClientRect().top;
      var size = parseFloat(getComputedStyle(c.span).fontSize);
      var d = font.getPath(c.ch, r.left - tr.left + PAD, base - tr.top + PAD, size).toPathData(2);
      var halo = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      halo.setAttribute('d', d);
      halo.setAttribute('class', 'rx-halo');
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      svg.appendChild(halo);
      svg.appendChild(p);
      var len = p.getTotalLength() || 1;
      [halo, p].forEach(function (el) {
        el.style.strokeDasharray = len + ' ' + len;
        el.style.strokeDashoffset = len;
      });
      p.style.strokeWidth = Math.max(1.2, size * 0.014) + 'px';
      halo.style.strokeWidth = Math.max(4, size * 0.05) + 'px';
      // sample points along the outline once, so the torch position is cheap each frame
      var pts = [];
      var N = Math.max(40, Math.round(len / 6));
      for (var j = 0; j <= N; j++) { var q = p.getPointAtLength(len * j / N); pts.push([q.x, q.y]); }
      return { el: p, halo: halo, pts: pts, span: c.span, len: len, start: START + i * STAGGER, size: size, filled: false };
    });

    var t0 = performance.now();
    var end = START + (items.length - 1) * STAGGER + TRACE + 1100;
    (function loop() {
      var t = performance.now() - t0;
      var heads = [];
      items.forEach(function (it) {
        var k = (t - it.start) / TRACE;
        if (k <= 0) return;
        if (k < 1) {
          var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;   // ease in-out
          var off = it.len * (1 - e);
          it.el.style.strokeDashoffset = off;
          it.halo.style.strokeDashoffset = off;
          var pt = it.pts[Math.min(it.pts.length - 1, Math.round(e * (it.pts.length - 1)))];
          heads.push({ x: pt[0], y: pt[1], r: Math.max(6, it.size * 0.07) });
          emit(pt[0], pt[1], 4, Math.max(0.8, it.size / 110));
        } else if (!it.filled) {
          it.filled = true;
          it.el.style.strokeDashoffset = 0;
          it.el.classList.add('is-done');          // arc fades out
          it.halo.style.strokeDashoffset = 0;
          it.halo.classList.add('is-done');
          it.span.classList.add('is-hot');         // letter fills hot, then cools
          var last = it.pts[it.pts.length - 1];
          emit(last[0], last[1], 14, Math.max(0.9, it.size / 100));   // finishing burst
        }
      });
      drawSparks(heads);
      if (t < end || sparks.length) requestAnimationFrame(loop);
      else finish();
    })();
  }

  var fontPromise = (window.opentype
    ? new Promise(function (res, rej) {
        window.opentype.load('fonts/DMSerifDisplay-Regular.ttf', function (err, f) { err ? rej(err) : res(f); });
      })
    : Promise.reject(new Error('opentype.js missing')));
  var webFontReady = document.fonts && document.fonts.load
    ? document.fonts.load('400 100px "DM Serif Display"').catch(function () {})
    : Promise.resolve();

  function go() {
    Promise.all([fontPromise, webFontReady]).then(function (r) {
      traceWeld(r[0]);
    }).catch(function () {
      simpleWeld();
    });
  }

  if (window.__siteRevealed || !window.siteLoader) go();
  else window.addEventListener('site:revealed', go, { once: true });

  window.addEventListener('resize', function () {
    if (title.classList.contains('is-welding')) {
      // layout changed mid-animation: just show the finished title
      chars.forEach(function (c) { c.span.classList.add('is-hot'); });
      finish();
    }
  });
})();
