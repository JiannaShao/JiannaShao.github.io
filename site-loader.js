/* =========================================================
   SITE LOADER
   Keeps the loading screen up until the page is ready:
   - every <img> on the page has loaded (or failed)
   - web fonts are ready
   - the window "load" event has fired (CSS background images etc.)
   - any 3D scene the page registered has finished loading
   Pages register extra work with:
     siteLoader.wait('name'); siteLoader.progress('name', 0..1); siteLoader.done('name');
   When it lifts, it fires a "site:revealed" event on window.
   ========================================================= */
(function () {
  var root = document.documentElement;
  root.classList.add('site-loading');

  var MIN_SHOW = 1000;     // ms; avoids a flash when everything is cached
  var MAX_WAIT = 15000;    // ms; never trap a visitor behind the loader
  var start = Date.now();

  var waits = {};          // name -> 0..1
  var imgs = [];
  var imgsDone = 0;
  var domReady = false;
  var winLoaded = false;
  var fontsReady = false;
  var finished = false;
  var shown = 0;           // displayed progress, only ever moves forward

  function fraction() {
    var parts = [];
    parts.push(domReady ? 1 : 0);
    parts.push(winLoaded ? 1 : 0);
    parts.push(fontsReady ? 1 : 0);
    // images count together as a few steps so a long gallery moves smoothly
    var imgFrac = imgs.length ? imgsDone / imgs.length : (domReady ? 1 : 0);
    parts.push(imgFrac, imgFrac, imgFrac);
    Object.keys(waits).forEach(function (k) { parts.push(waits[k], waits[k]); });
    var sum = 0;
    parts.forEach(function (p) { sum += p; });
    return sum / parts.length;
  }

  function allDone() {
    if (!domReady || !winLoaded || !fontsReady) return false;
    if (imgsDone < imgs.length) return false;
    for (var k in waits) if (waits[k] < 1) return false;
    return true;
  }

  function paint() {
    var bar = document.querySelector('.site-loader-bar span');
    shown = Math.max(shown, finished ? 1 : Math.min(0.97, fraction()));
    if (bar) bar.style.transform = 'scaleX(' + shown.toFixed(3) + ')';
  }

  function update() {
    if (finished) return;
    paint();
    if (allDone()) finish();
  }

  function finish() {
    if (finished) return;
    finished = true;
    paint();
    var delay = Math.max(250, MIN_SHOW - (Date.now() - start));
    setTimeout(function () {
      var el = document.getElementById('site-loader');
      if (el) {
        el.classList.add('is-done');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 500);
      }
      root.classList.remove('site-loading');
      window.__siteRevealed = true;
      window.dispatchEvent(new Event('site:revealed'));
    }, delay);
  }

  window.siteLoader = {
    wait: function (name) {
      if (finished) return;
      if (!(name in waits)) waits[name] = 0;
      update();
    },
    progress: function (name, f) {
      if (name in waits && waits[name] < 1) waits[name] = Math.max(waits[name], Math.min(0.99, f));
      update();
    },
    done: function (name) {
      waits[name] = 1;
      update();
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    domReady = true;
    imgs = Array.prototype.slice.call(document.images).filter(function (img) {
      return img.getAttribute('loading') !== 'lazy';
    });
    imgs.forEach(function (img) {
      if (img.complete) { imgsDone++; return; }
      var settle = function () { imgsDone++; update(); };
      img.addEventListener('load', settle, { once: true });
      img.addEventListener('error', settle, { once: true });
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { fontsReady = true; update(); });
    } else {
      fontsReady = true;
    }
    update();
  });

  window.addEventListener('load', function () { winLoaded = true; update(); });

  // Safety net: lift the loader no matter what after MAX_WAIT.
  setTimeout(finish, MAX_WAIT);

  // Coming back via the browser's back button shows the page as it was.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      finished = true;
      var el = document.getElementById('site-loader');
      if (el && el.parentNode) el.parentNode.removeChild(el);
      root.classList.remove('site-loading');
    }
  });
})();
