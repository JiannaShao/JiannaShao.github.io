/* =========================================================
   ART PORTFOLIO TITLE — every letter is scribbled in at the
   same time: a loose pen line zig-zags back and forth inside
   each letter's real outline (Gulax, read with opentype.js),
   then the solid letters settle in underneath.
   ========================================================= */
(function () {
  var title = document.getElementById('ap-title');
  if (!title) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  // split into letter spans, grouped per word so words never break
  var chars = [];
  title.querySelectorAll('.ap-line').forEach(function (line) {
    var text = line.textContent.trim();
    line.textContent = '';
    line.setAttribute('aria-hidden', 'true');
    text.split(/(\s+)/).forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) { line.appendChild(document.createTextNode(' ')); return; }
      var word = document.createElement('span');
      word.className = 'ap-word';
      for (var i = 0; i < part.length; i++) {
        var s = document.createElement('span');
        s.className = 'ap-ch';
        s.textContent = part[i];
        word.appendChild(s);
        chars.push({ span: s, ch: part[i], line: line });
      }
      line.appendChild(word);
    });
    var probe = document.createElement('span');
    probe.className = 'ap-baseline';
    line.appendChild(probe);
  });
  if (reduce || !window.opentype) return;
  title.classList.add('is-scribbling');

  var DUR = 1900;        // ms for every letter's scribble
  var PAD = 40;
  var seed = 11;
  var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function finish(svg) {
    title.classList.remove('is-scribbling');
    title.classList.add('is-scribbled');
    if (svg) {
      svg.classList.add('is-done');
      setTimeout(function () { if (svg.parentNode) svg.parentNode.removeChild(svg); }, 900);
    }
  }

  function scribble(font) {
    var tr = title.getBoundingClientRect();
    var W = tr.width + PAD * 2, H = tr.height + PAD * 2;
    var svg = el('svg', { 'class': 'ap-scribble', 'aria-hidden': 'true', viewBox: '0 0 ' + W + ' ' + H });
    Object.assign(svg.style, { left: -PAD + 'px', top: -PAD + 'px', width: W + 'px', height: H + 'px' });
    var defs = el('defs', {}, svg);
    title.appendChild(svg);

    var lines = [];
    chars.forEach(function (c, i) {
      if (/\s/.test(c.ch)) return;
      var r = c.span.getBoundingClientRect();
      var lastOfLine = c.line.querySelector('.ap-baseline').getBoundingClientRect();
      // letters on the same row share a top; the probe gives the baseline offset
      var spans = c.line.querySelectorAll('.ap-ch');
      var toBase = lastOfLine.top - spans[spans.length - 1].getBoundingClientRect().top;
      var base = r.top + toBase - tr.top + PAD;
      var size = parseFloat(getComputedStyle(c.span).fontSize);
      var glyph = font.getPath(c.ch, r.left - tr.left + PAD, base, size);
      var bb = glyph.getBoundingBox();
      if (!isFinite(bb.x1) || bb.x2 - bb.x1 < 1) return;

      var id = 'ap-clip-' + i;
      var cp = el('clipPath', { id: id }, defs);
      el('path', { d: glyph.toPathData(2) }, cp);

      // zig-zag scribble across the letter at a slight random angle
      var ang = (-28 + rnd() * 20) * Math.PI / 180;
      var cx = (bb.x1 + bb.x2) / 2, cy = (bb.y1 + bb.y2) / 2;
      var reach = Math.hypot(bb.x2 - bb.x1, bb.y2 - bb.y1) / 2 + 4;
      var step = Math.max(4, size * 0.07);
      var pen = Math.max(1.8, size * 0.042);
      var ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
      var d = '', k = 0;
      for (var t = -reach; t <= reach; t += step) {
        var side = k % 2 ? -1 : 1;
        var j1 = (rnd() - 0.5) * step * 0.9, j2 = (rnd() - 0.5) * step * 0.9;
        var ax = cx + nx * (t + j1) - ux * reach * side;
        var ay = cy + ny * (t + j1) - uy * reach * side;
        var bx = cx + nx * (t + step / 2 + j2) + ux * reach * side;
        var by = cy + ny * (t + step / 2 + j2) + uy * reach * side;
        // a loose curve rather than a ruler-straight stroke
        var mx = (ax + bx) / 2 + nx * (rnd() - 0.5) * step * 1.4;
        var my = (ay + by) / 2 + ny * (rnd() - 0.5) * step * 1.4;
        d += (k ? ' L' : 'M') + ax.toFixed(1) + ' ' + ay.toFixed(1) + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + bx.toFixed(1) + ' ' + by.toFixed(1);
        k++;
      }
      var g = el('g', { 'clip-path': 'url(#' + id + ')' }, svg);
      var p = el('path', { d: d, 'class': 'ap-pen', 'stroke-width': pen.toFixed(2) }, g);
      var len = p.getTotalLength() || 1;
      p.style.strokeDasharray = len + ' ' + len;
      p.style.strokeDashoffset = len;
      lines.push({ p: p, len: len, delay: rnd() * 160, dur: DUR * (0.85 + rnd() * 0.3) });
    });

    var t0 = performance.now();
    var end = Math.max.apply(null, lines.map(function (l) { return l.delay + l.dur; }));
    (function loop() {
      var now = performance.now() - t0;
      lines.forEach(function (l) {
        var k = Math.min(1, Math.max(0, (now - l.delay) / l.dur));
        l.p.style.strokeDashoffset = l.len * (1 - k);
      });
      if (now < end) requestAnimationFrame(loop);
      else finish(svg);
    })();
  }

  var fontP = new Promise(function (res, rej) {
    window.opentype.load('fonts/Gulax.otf', function (err, f) { err ? rej(err) : res(f); });
  });
  var webFont = document.fonts && document.fonts.load ? document.fonts.load('400 100px "Gulax"').catch(function () {}) : Promise.resolve();
  function go() {
    Promise.all([fontP, webFont]).then(function (r) { scribble(r[0]); }).catch(function () { finish(null); });
  }
  if (window.__siteRevealed || !window.siteLoader) go();
  else window.addEventListener('site:revealed', go, { once: true });
  window.addEventListener('resize', function () {
    if (title.classList.contains('is-scribbling')) finish(title.querySelector('.ap-scribble'));
  });
})();
