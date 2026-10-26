/* =========================================================
   FINE ART — opens a work large when clicked.
   Arrows / keyboard (← → Esc) / swipe move between works;
   clicking the large image zooms in further and pans with the pointer.
   ========================================================= */
(function () {
  var works = Array.prototype.slice.call(document.querySelectorAll('main.portfolio > .artwork'));
  if (!works.length) return;

  // count line under the header, from the works themselves
  var years = works.map(function (w) {
    var m = (w.querySelector('.artwork-subtitle') || {}).textContent.match(/\d{4}/);
    return m ? +m[0] : null;
  }).filter(Boolean);
  var header = document.querySelector('.portfolio-header');
  if (header && years.length) {
    var count = document.createElement('p');
    count.className = 'ag-count';
    var lo = Math.min.apply(null, years), hi = Math.max.apply(null, years);
    count.textContent = works.length + ' works · ' + (lo === hi ? lo : lo + '–' + hi);
    header.appendChild(count);
  }

  var data = works.map(function (w) {
    var img = w.querySelector('img');
    var t = function (sel) { var el = w.querySelector(sel); return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; };
    return { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '', title: t('h2'), sub: t('.artwork-subtitle'), desc: t('.artwork-description') };
  });

  // ---- build the viewer once ----
  var icon = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; };
  var box = document.createElement('div');
  box.className = 'ag-lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Artwork viewer');
  box.innerHTML =
    '<div class="ag-stage"><img alt=""></div>' +
    '<div class="ag-info"><p class="ag-index"></p><h2></h2><p class="ag-sub"></p><p class="ag-desc"></p>' +
    '<p class="ag-hint">Click the image to zoom · ← → to browse · Esc to close</p></div>' +
    '<button type="button" class="ag-btn ag-close" aria-label="Close">' + icon('M6 6l12 12M18 6L6 18') + '</button>' +
    '<button type="button" class="ag-btn ag-prev" aria-label="Previous work">' + icon('M15 5l-7 7 7 7') + '</button>' +
    '<button type="button" class="ag-btn ag-next" aria-label="Next work">' + icon('M9 5l7 7-7 7') + '</button>';
  document.body.appendChild(box);

  var stage = box.querySelector('.ag-stage');
  var big = stage.querySelector('img');
  var idxEl = box.querySelector('.ag-index');
  var titleEl = box.querySelector('h2');
  var subEl = box.querySelector('.ag-sub');
  var descEl = box.querySelector('.ag-desc');
  var current = 0;
  var lastFocus = null;
  var zoomed = false;

  function unzoom() {
    zoomed = false;
    stage.classList.remove('is-zoomed');
    big.style.transform = '';
  }

  function show(i) {
    current = (i + data.length) % data.length;
    var d = data[current];
    unzoom();
    big.style.opacity = '0';
    big.onload = function () { big.style.opacity = '1'; };
    big.src = d.src;
    big.alt = d.alt;
    if (big.complete) big.style.opacity = '1';
    idxEl.textContent = (current + 1) + ' / ' + data.length;
    titleEl.textContent = d.title;
    subEl.textContent = d.sub;
    descEl.textContent = d.desc;
    descEl.hidden = !d.desc;
    // warm the neighbours so arrowing is instant
    [current + 1, current - 1].forEach(function (k) {
      var n = data[(k + data.length) % data.length];
      var pre = new Image(); pre.src = n.src;
    });
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    box.classList.add('is-open');
    document.body.classList.add('ag-locked');
    box.querySelector('.ag-close').focus();
  }
  function close() {
    box.classList.remove('is-open');
    document.body.classList.remove('ag-locked');
    unzoom();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  works.forEach(function (w, i) {
    w.setAttribute('tabindex', '0');
    w.setAttribute('role', 'button');
    w.setAttribute('aria-label', 'View ' + data[i].title);
    w.addEventListener('click', function () { open(i); });
    w.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  box.querySelector('.ag-close').addEventListener('click', close);
  box.querySelector('.ag-prev').addEventListener('click', function () { show(current - 1); });
  box.querySelector('.ag-next').addEventListener('click', function () { show(current + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });

  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); zoomed ? unzoom() : close(); }
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'Tab') {                      // keep focus inside the viewer
      var f = box.querySelectorAll('button');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // ---- zoom: click to 2.2x, image follows the pointer ----
  var ZOOM = 2.2;
  function pan(clientX, clientY) {
    var r = stage.getBoundingClientRect();
    var x = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    var y = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    big.style.transformOrigin = (x * 100) + '% ' + (y * 100) + '%';
  }
  stage.addEventListener('click', function (e) {
    if (e.target !== big) return;
    zoomed = !zoomed;
    stage.classList.toggle('is-zoomed', zoomed);
    if (zoomed) { pan(e.clientX, e.clientY); big.style.transform = 'scale(' + ZOOM + ')'; }
    else big.style.transform = '';
  });
  stage.addEventListener('mousemove', function (e) { if (zoomed) pan(e.clientX, e.clientY); });

  // ---- swipe between works on touch screens (when not zoomed) ----
  var sx = 0, sy = 0, st = 0;
  stage.addEventListener('touchstart', function (e) {
    var t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now();
  }, { passive: true });
  stage.addEventListener('touchmove', function (e) {
    if (!zoomed) return;
    var t = e.touches[0]; pan(t.clientX, t.clientY);
  }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (zoomed) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - sx, dy = t.clientY - sy;
    if (Date.now() - st < 600 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      show(current + (dx < 0 ? 1 : -1));
    }
  });

  // same right-click protection as the grid
  big.addEventListener('contextmenu', function (e) { e.preventDefault(); });
})();
