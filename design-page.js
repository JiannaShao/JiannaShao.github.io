/* =========================================================
   PRODUCT DESIGN PAGE
   1. Blueprint title: construction lines and dimensions draw in,
      the letters are drafted as thin blue outlines (real glyph
      shapes from the bundled DM Serif Display), then inked navy.
   2. Sketch-to-final slider.
   3. Exploded view of the guiro concept model.
   ========================================================= */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SVGNS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------------- 1. BLUEPRINT TITLE ---------------- */
  var title = document.getElementById('dx-title');
  if (title) {
    var chars = [];
    title.querySelectorAll('.dx-line').forEach(function (line) {
      var text = line.textContent.trim();
      line.textContent = '';
      line.setAttribute('aria-hidden', 'true');
      text.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { line.appendChild(document.createTextNode(' ')); return; }
        var word = document.createElement('span');
        word.className = 'dx-word';
        word.style.whiteSpace = 'nowrap';
        word.style.display = 'inline-block';
        for (var i = 0; i < part.length; i++) {
          var ch = part[i];
          var s = document.createElement('span');
          s.className = 'dx-ch';
          s.textContent = ch;
          word.appendChild(s);
          chars.push({ span: s, ch: ch, line: line });
        }
        line.appendChild(word);
      });
      var probe = document.createElement('span');
      probe.className = 'dx-baseline';
      line.appendChild(probe);
    });

    if (!reduce && window.opentype) {
      title.classList.add('is-drafting');
      var PAD = 60;
      var svg = el('svg', { 'class': 'dx-blueprint', 'aria-hidden': 'true' });

      var draw = function (font) {
        var tr = title.getBoundingClientRect();
        var W = tr.width + PAD * 2, H = tr.height + PAD * 2;
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        Object.assign(svg.style, { left: -PAD + 'px', top: -PAD + 'px', width: W + 'px', height: H + 'px' });
        title.appendChild(svg);

        var anims = [];   // [element, delay, duration]
        var trace = function (node, delay, dur) {
          var len = node.getTotalLength ? node.getTotalLength() : 0;
          if (!len) return;
          node.style.strokeDasharray = len + ' ' + len;
          node.style.strokeDashoffset = len;
          anims.push([node, len, delay, dur]);
        };

        // lines: baseline, x-height, cap height for each title line
        var lines = [];
        title.querySelectorAll('.dx-line').forEach(function (line) {
          var spans = line.querySelectorAll('.dx-ch');
          if (!spans.length) return;
          var first = spans[0].getBoundingClientRect();
          var last = spans[spans.length - 1].getBoundingClientRect();
          var base = line.querySelector('.dx-baseline').getBoundingClientRect().top - tr.top + PAD;
          var size = parseFloat(getComputedStyle(spans[0]).fontSize);
          var u = size / font.unitsPerEm;
          var capH = (font.tables.os2 && font.tables.os2.sCapHeight) || font.unitsPerEm * 0.7;
          var xH = (font.tables.os2 && font.tables.os2.sxHeight) || font.unitsPerEm * 0.48;
          lines.push({ x0: first.left - tr.left + PAD, x1: last.right - tr.left + PAD, base: base, cap: base - capH * u, xh: base - xH * u, size: size });
        });

        var t = 0;
        lines.forEach(function (L) {
          [L.cap, L.xh, L.base].forEach(function (y, i) {
            var g = el('line', { x1: L.x0 - 30, y1: y, x2: L.x1 + 30, y2: y, 'class': 'bp-guide bp-fade' }, svg);
            trace(g, t + i * 90, 520);
          });
          // overall width dimension above the line
          var dy = L.cap - Math.max(18, L.size * 0.16);
          var dim = el('path', { d: 'M' + L.x0 + ' ' + (dy - 6) + 'v12M' + L.x1 + ' ' + (dy - 6) + 'v12M' + L.x0 + ' ' + dy + 'H' + L.x1, 'class': 'bp-dim bp-fade' }, svg);
          trace(dim, t + 280, 520);
          // cap-height dimension at the left
          var dx = L.x0 - Math.max(16, L.size * 0.12);
          var dim2 = el('path', { d: 'M' + (dx - 6) + ' ' + L.cap + 'h12M' + (dx - 6) + ' ' + L.base + 'h12M' + dx + ' ' + L.cap + 'V' + L.base, 'class': 'bp-dim bp-fade' }, svg);
          trace(dim2, t + 380, 420);
          var label = el('text', { x: (L.x0 + L.x1) / 2, y: dy - 8, 'text-anchor': 'middle', 'class': 'bp-dim-text bp-fade', opacity: 0 }, svg);
          label.textContent = 'SCALE 1:1';
          anims.push([label, 0, t + 700, 300, 'fade']);
          t += 160;
        });

        // letters unfold like folded paper, one after another (overlapping)
        var STEP = 45, FOLD = 760, startG = 520;
        chars.forEach(function (c, i) {
          ['top', 'bot'].forEach(function (k) {
            var h = document.createElement('span');
            h.className = 'dx-half dx-half-' + k;
            h.textContent = c.ch;
            c.span.appendChild(h);
          });
          c.inkAt = startG + i * STEP;
        });
        var total = startG + (chars.length - 1) * STEP + FOLD;

        var t0 = performance.now();
        var inked = 0;
        (function loop() {
          var now = performance.now() - t0;
          anims.forEach(function (a) {
            var node = a[0], len = a[1], delay = a[2], dur = a[3];
            var k = Math.min(1, Math.max(0, (now - delay) / dur));
            if (a[4] === 'fade') node.setAttribute('opacity', k);
            else node.style.strokeDashoffset = len * (1 - (1 - Math.pow(1 - k, 3)));
          });
          chars.forEach(function (c) {
            if (!c.done && now >= c.inkAt) { c.done = true; inked++; c.span.classList.add('is-folding'); }
          });
          if (now < total + 120) requestAnimationFrame(loop);
          else {
            title.classList.remove('is-drafting');
            chars.forEach(function (c) {
              c.span.classList.remove('is-folding');
              c.span.querySelectorAll('.dx-half').forEach(function (h) { h.remove(); });
            });
            setTimeout(function () { svg.classList.add('is-done'); }, 700);
            setTimeout(function () { if (svg.parentNode) svg.parentNode.removeChild(svg); }, 1500);
          }
        })();
      };

      var go = function () {
        Promise.all([
          new Promise(function (res, rej) {
            window.opentype.load('fonts/DMSerifDisplay-Regular.ttf', function (err, f) { err ? rej(err) : res(f); });
          }),
          document.fonts && document.fonts.load ? document.fonts.load('400 100px "DM Serif Display"').catch(function () {}) : null
        ]).then(function (r) { draw(r[0]); }, function () {
          title.classList.remove('is-drafting');
        });
      };
      if (window.__siteRevealed || !window.siteLoader) go();
      else window.addEventListener('site:revealed', go, { once: true });

      window.addEventListener('resize', function () {
        if (title.classList.contains('is-drafting') || svg.parentNode) {
          title.classList.remove('is-drafting');
          document.querySelectorAll('#dx-title .dx-half').forEach(function (h) { h.remove(); });
          if (svg.parentNode) svg.parentNode.removeChild(svg);
        }
      });
    }
  }

  /* ---------------- 2. SKETCH-TO-FINAL SLIDER ---------------- */
  document.querySelectorAll('[data-compare]').forEach(function (box) {
    var range = box.querySelector('.dx-compare-range');
    var set = function (v) { box.style.setProperty('--pos', v + '%'); };
    range.addEventListener('input', function () { set(range.value); });
    set(range.value);
  });

  /* ---------------- 3. EXPLODED VIEW ---------------- */
  var ex = document.querySelector('.dx-explode');
  if (ex) {
    // anchor = point on the model (image px, 1201 x 762); label = where the tag sits
    var PARTS = [
      // anchors are where each part sits once the view has opened
      { name: 'Striker',            anchor: [129, 516], label: [125, 730] },
      { name: 'Strings',            anchor: [506, 300], label: [450, 40] },
      { name: 'Textured ridges',    anchor: [741, 395], label: [880, 120] },
      { name: 'Resonating chamber', anchor: [676, 600], label: [940, 730] }
    ];
    var lines = ex.querySelector('.dx-ex-lines');
    var list = ex.querySelector('.dx-ex-labels');
    PARTS.forEach(function (p) {
      var ln = el('line', { x1: p.anchor[0], y1: p.anchor[1], x2: p.label[0], y2: p.label[1], pathLength: 1 }, lines);
      el('circle', { cx: p.anchor[0], cy: p.anchor[1], r: 6 }, lines);
      var li = document.createElement('li');
      li.textContent = p.name;
      li.style.left = (p.label[0] / 1201 * 100) + '%';
      li.style.top = (p.label[1] / 762 * 100) + '%';
      list.appendChild(li);
    });
    var hoverable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (hoverable) {
      ex.addEventListener('mouseenter', function () { ex.classList.add('is-open'); });
      ex.addEventListener('mouseleave', function () { ex.classList.remove('is-open'); });
    }
    ex.addEventListener('click', function () { if (!hoverable) ex.classList.toggle('is-open'); });
    ex.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ex.classList.toggle('is-open'); }
    });
    ex.addEventListener('focus', function () { ex.classList.add('is-open'); });
    ex.addEventListener('blur', function () { ex.classList.remove('is-open'); });
  }
})();
