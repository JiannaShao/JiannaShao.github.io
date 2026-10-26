/* =========================================================
   RESEARCH TITLE — letters are "welded" in one at a time:
   each flashes azure-hot with a small burst of sparks, then
   cools to navy like a fresh weld bead.
   ========================================================= */
(function () {
  var title = document.getElementById('rx-title');
  if (!title) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // Split each line into letter spans (the h1 keeps an aria-label with the full text).
  var chars = [];
  title.querySelectorAll('.rx-line').forEach(function (line) {
    var text = line.textContent;
    line.textContent = '';
    line.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.className = 'rx-ch';
      span.textContent = text[i];
      line.appendChild(span);
      if (text[i] !== ' ') chars.push(span);
    }
  });
  title.classList.add('is-welding');

  // Spark layer covering the title (a little bigger so sparks can fly out)
  var canvas = document.createElement('canvas');
  canvas.className = 'rx-sparks';
  canvas.setAttribute('aria-hidden', 'true');
  title.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var PAD = 80;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  function size() {
    var r = title.getBoundingClientRect();
    canvas.style.left = -PAD + 'px';
    canvas.style.top = -PAD + 'px';
    canvas.style.width = (r.width + PAD * 2) + 'px';
    canvas.style.height = (r.height + PAD * 2) + 'px';
    canvas.width = Math.round((r.width + PAD * 2) * dpr);
    canvas.height = Math.round((r.height + PAD * 2) * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  var sparks = [];
  var running = false;
  var COLORS = ['#ffffff', '#e9fdff', '#9ff3fb', '#3fd8e8', '#1fb7d6'];

  function burst(span) {
    var t = title.getBoundingClientRect();
    var r = span.getBoundingClientRect();
    // weld point: lower-middle of the letter
    var x = r.left - t.left + r.width * 0.5 + PAD;
    var y = r.top - t.top + r.height * 0.78 + PAD;
    var n = 16 + Math.floor(Math.random() * 8);
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5;   // mostly upward fan
      var v = 2.2 + Math.random() * 4.8;
      sparks.push({
        x: x, y: y,
        px: x, py: y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 1,
        life: 0,
        max: 22 + Math.random() * 26,
        c: COLORS[Math.floor(Math.random() * COLORS.length)]
      });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i];
      s.px = s.x; s.py = s.y;
      s.vy += 0.22;             // gravity
      s.vx *= 0.985;
      s.x += s.vx; s.y += s.vy;
      s.life++;
      var k = 1 - s.life / s.max;
      if (k <= 0) { sparks.splice(i, 1); continue; }
      ctx.strokeStyle = s.c;
      ctx.globalAlpha = k;
      ctx.lineWidth = 1.6 * k + 0.4;
      ctx.beginPath();
      ctx.moveTo(s.px, s.py);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (sparks.length) requestAnimationFrame(tick);
    else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  function weld() {
    size();
    var STEP = 85;   // ms between letters
    chars.forEach(function (span, i) {
      setTimeout(function () {
        span.classList.add('is-hot');
        burst(span);
      }, 250 + i * STEP);
    });
    // tidy up once everything has cooled
    setTimeout(function () {
      title.classList.remove('is-welding');
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }, 250 + chars.length * STEP + 2200);
  }

  window.addEventListener('resize', function () { if (canvas.parentNode) size(); });

  // Start once the loading screen lifts (or right away if there isn't one).
  if (window.__siteRevealed || !window.siteLoader) weld();
  else window.addEventListener('site:revealed', weld, { once: true });
})();
