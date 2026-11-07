/* Projects title: split-flap board. Each letter flips through random
   characters, then lands on its own letter, left to right. */
(() => {
  const h = document.querySelector('.project-hero h1');
  if (!h || h.dataset.flap) return;
  h.dataset.flap = '1';
  const word = h.textContent.trim();
  h.setAttribute('aria-label', word);
  h.textContent = '';
  const chars = 'ABCDEFGHJKLNPRSTUVXYZabdeghknopqrstuxyz';
  const cells = [...word].map(c => {
    const s = document.createElement('span');
    s.className = 'pf-ch';
    s.setAttribute('aria-hidden', 'true');
    s.textContent = c;
    h.appendChild(s);
    return s;
  });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // lock each cell to its final letter's width so the word never jiggles
  const lock = () => cells.forEach(s => { s.style.width = ''; s.style.width = s.getBoundingClientRect().width + 'px'; });
  const unlock = () => cells.forEach(s => { s.style.width = ''; });

  const flip = (s, c) => {
    s.textContent = c;
    s.classList.remove('is-flip');
    void s.offsetWidth;
    s.classList.add('is-flip');
  };

  let ran = false;
  const run = () => {
    if (ran) return; ran = true;
    lock();
    h.classList.add('is-flapping');
    const step = 58;
    let left = cells.length;
    cells.forEach((s, i) => {
      const final = word[i];
      const turns = 7 + i * 2;
      let n = 0;
      setTimeout(function tick() {
        if (n < turns) {
          let c; do { c = chars[Math.floor(Math.random() * chars.length)]; } while (c === final);
          flip(s, c); n++;
          setTimeout(tick, step);
        } else {
          flip(s, final);
          s.classList.add('is-set');
          if (--left === 0) setTimeout(() => { h.classList.remove('is-flapping'); unlock(); }, 400);
        }
      }, i * 40);
    });
  };

  const root = document.documentElement;
  const start = () => setTimeout(run, 250);
  if (!root.classList.contains('site-loading')) start();
  else new MutationObserver((m, o) => {
    if (!root.classList.contains('site-loading')) { o.disconnect(); start(); }
  }).observe(root, { attributes: true, attributeFilter: ['class'] });
  addEventListener('resize', () => { if (h.classList.contains('is-flapping')) lock(); });
})();
