/* =========================================================
   SITE CHROME — shared sidebar + scroll snake behaviour.
   Used by every page that has the sidebar, so they all act alike.
   ========================================================= */
(function () {
  const MOBILE = window.matchMedia('(max-width: 800px)');
  const FINE_HOVER = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* ---------------- SIDEBAR ---------------- */
  const sideNav = document.getElementById('side-nav');

  if (sideNav) {
    // Desktop: open while the pointer is over the rail.
    sideNav.addEventListener('mouseenter', () => {
      if (!MOBILE.matches) sideNav.classList.add('hover-open');
    });
    sideNav.addEventListener('mouseleave', () => {
      sideNav.classList.remove('hover-open');
    });

    // Touch devices wider than phones: tapping the logo opens the rail first.
    const brand = sideNav.querySelector('.side-brand');
    if (brand) {
      brand.addEventListener('click', (e) => {
        if (!MOBILE.matches && !FINE_HOVER.matches && !sideNav.classList.contains('hover-open')) {
          e.preventDefault();
          sideNav.classList.add('hover-open');
        }
      });
    }

    // Portfolios dropdown
    sideNav.querySelectorAll('.side-dropdown-toggle').forEach((toggle) => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const dropdown = toggle.closest('.side-dropdown');
        if (!dropdown) return;
        const willOpen = !dropdown.classList.contains('is-open');
        dropdown.classList.toggle('is-open', willOpen);
        toggle.setAttribute('aria-expanded', String(willOpen));
      });
    });

    // Phones: menu button + backdrop
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chrome-menu-btn';
    btn.setAttribute('aria-label', 'Open menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'side-nav');
    btn.innerHTML = '<span></span><span></span><span></span>';

    const scrim = document.createElement('div');
    scrim.className = 'chrome-scrim';
    scrim.setAttribute('aria-hidden', 'true');

    document.body.appendChild(scrim);
    document.body.appendChild(btn);

    const setMenu = (open) => {
      sideNav.classList.toggle('mobile-open', open);
      scrim.classList.toggle('is-visible', open);
      document.body.classList.toggle('chrome-menu-locked', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    btn.addEventListener('click', () => setMenu(!sideNav.classList.contains('mobile-open')));
    scrim.addEventListener('click', () => setMenu(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });

    // Close after choosing a link (needed for same-page anchors like #about).
    sideNav.querySelectorAll('.side-links a, .side-brand').forEach((link) => {
      link.addEventListener('click', () => {
        if (MOBILE.matches) setMenu(false);
        else if (!FINE_HOVER.matches) sideNav.classList.remove('hover-open');
      });
    });

    MOBILE.addEventListener('change', () => {
      setMenu(false);
      sideNav.classList.remove('hover-open');
    });
  }

  /* ---------------- SCROLL SNAKE ----------------
     An even serpentine: every row is a straight run ending in an
     identical half-circle turn, starting with a full row at the top. */
  const snakeSvg = document.getElementById('snake-svg');
  const snakeGhost = document.getElementById('snake-ghost');
  const snakePath = document.getElementById('snake-path');
  // Open circle that rides along the snake at the current scroll position
  let snakeHead = null;
  if (snakeSvg && snakePath) {
    snakeHead = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    snakeHead.setAttribute('id', 'snake-head');
    snakeHead.setAttribute('r', '4');
    snakeSvg.appendChild(snakeHead);
  }
  let snakeLength = 0;

  function buildSnake() {
    if (!snakeSvg || !snakeGhost || !snakePath) return;
    const rect = snakeSvg.getBoundingClientRect();
    if (!rect.width || !rect.height) return; // hidden (phones)

    const W = rect.width;
    const H = rect.height;
    snakeSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    snakeSvg.setAttribute('preserveAspectRatio', 'none');

    const stroke = 4.5;
    const pad = stroke / 2 + 1;
    const r = Math.max(5, Math.min(8, (W - pad * 2) / 4)); // turn radius
    const leftX = pad + r;
    const rightX = W - pad - r;
    const rowGap = r * 2;

    const rows = Math.max(2, Math.floor((H - pad * 2) / rowGap) + 1);
    const top = pad + (H - pad * 2 - (rows - 1) * rowGap) / 2; // centred

    let y = top;
    let d = `M ${leftX} ${y} L ${rightX} ${y}`;
    let atRight = true;

    for (let i = 1; i < rows; i++) {
      const nextY = y + rowGap;
      if (atRight) {
        d += ` A ${r} ${r} 0 0 1 ${rightX} ${nextY} L ${leftX} ${nextY}`;
      } else {
        d += ` A ${r} ${r} 0 0 0 ${leftX} ${nextY} L ${rightX} ${nextY}`;
      }
      y = nextY;
      atRight = !atRight;
    }

    snakeGhost.setAttribute('d', d);
    snakePath.setAttribute('d', d);
    snakeLength = snakePath.getTotalLength();
    snakePath.style.strokeDasharray = `${snakeLength} ${snakeLength}`;
    updateSnake();
  }

  function updateSnake() {
    if (!snakePath || !snakeLength) return;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    let progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    if (window.scrollY <= 1) progress = 0;
    if (window.scrollY >= maxScroll - 1) progress = maxScroll > 0 ? 1 : 0;
    progress = Math.max(0, Math.min(1, progress));
    snakePath.style.strokeDashoffset = `${snakeLength * (1 - progress)}`;
    if (snakeHead) {
      const pt = snakePath.getPointAtLength(snakeLength * progress);
      snakeHead.setAttribute('cx', pt.x.toFixed(2));
      snakeHead.setAttribute('cy', pt.y.toFixed(2));
    }
  }

  if (snakeSvg && snakeGhost && snakePath) {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; updateSnake(); });
    };
    buildSnake();
    requestAnimationFrame(buildSnake);
    window.addEventListener('load', buildSnake, { once: true });
    window.addEventListener('resize', buildSnake, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    // Page height changes as images load — keep progress accurate.
    if ('ResizeObserver' in window) new ResizeObserver(updateSnake).observe(document.body);
  }
})();
