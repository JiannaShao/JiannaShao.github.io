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

    // ---- Icons on the rail (same line style as the logo) ----
    const ICONS = {
      about: '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20.2c.6-3.8 3.6-6.4 7.2-6.4s6.6 2.6 7.2 6.4"/>',
      portfolios: '<path d="M3 7.6c0-.9.7-1.6 1.6-1.6h4.2l2 2.2h8.6c.9 0 1.6.7 1.6 1.6v7.6c0 .9-.7 1.6-1.6 1.6H4.6c-.9 0-1.6-.7-1.6-1.6z"/><path d="M3 10.6h18"/>',
      projects: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
      gallery: '<path d="M12 3.2l8 4.4v8.8L12 20.8l-8-4.4V7.6z"/><path d="M4 7.6l8 4.4 8-4.4M12 12v8.8"/>',
      contact: '<rect x="3" y="5.5" width="18" height="13" rx="1.8"/><path d="M3.6 6.6l8.4 6.4 8.4-6.4"/>'
    };
    const iconFor = (el) => {
      const href = (el.getAttribute('href') || '').toLowerCase();
      const text = el.textContent.trim().toLowerCase();
      if (el.classList.contains('side-dropdown-toggle')) return 'portfolios';
      if (href.includes('#about')) return 'about';
      if (href.includes('#contact')) return 'contact';
      if (href.includes('project.html')) return 'projects';
      if (href.includes('art.html') || text.includes('gallery')) return 'gallery';
      return null;
    };
    const makeIcon = (key) => {
      const span = document.createElement('span');
      span.className = 'side-icon';
      span.setAttribute('aria-hidden', 'true');
      span.innerHTML = `<svg viewBox="0 0 24 24">${ICONS[key]}</svg>`;
      return span;
    };
    sideNav.querySelectorAll('.side-main-link, .side-dropdown-toggle').forEach((el) => {
      const key = iconFor(el);
      if (!key || el.querySelector('.side-icon')) return;
      el.dataset.section = key;
      if (el.classList.contains('side-dropdown-toggle')) {
        const first = el.querySelector('span:not(.side-dropdown-arrow)');
        if (first) first.classList.add('side-label');
      } else {
        const label = document.createElement('span');
        label.className = 'side-label';
        while (el.firstChild) label.appendChild(el.firstChild);
        el.appendChild(label);
      }
      el.prepend(makeIcon(key));
    });

    // ---- Logo redraws itself on hover ----
    sideNav.querySelectorAll('.side-logo circle, .side-logo path').forEach((el) => {
      el.setAttribute('pathLength', '1');
    });

    // ---- "You are here" marker ----
    const links = sideNav.querySelector('.side-links');
    const items = {};
    sideNav.querySelectorAll('[data-section]').forEach((el) => { items[el.dataset.section] = el; });
    let marker = null;
    let current = null;
    if (links) {
      marker = document.createElement('span');
      marker.className = 'side-marker';
      marker.setAttribute('aria-hidden', 'true');
      links.prepend(marker);
    }
    const placeMarker = () => {
      if (!marker || !current || !items[current]) { if (marker) marker.style.opacity = '0'; return; }
      const el = items[current];
      const top = el.offsetTop + el.offsetHeight / 2;
      marker.style.transform = `translateY(${top}px)`;
      marker.style.opacity = '1';
      Object.entries(items).forEach(([k, a]) => {
        if (k === current) a.setAttribute('aria-current', a.tagName === 'A' ? 'location' : 'true');
        else a.removeAttribute('aria-current');
      });
    };
    const setCurrent = (key) => {
      if (key === current) return;
      current = key;
      placeMarker();
    };

    const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const PAGE_SECTION = {
      'design.html': 'portfolios', 'art-portfolio.html': 'portfolios', 'research.html': 'portfolios',
      'project.html': 'projects', 'art.html': 'gallery'
    };
    if (PAGE_SECTION[page]) {
      setCurrent(PAGE_SECTION[page]);
      // also mark the matching portfolio in the dropdown
      sideNav.querySelectorAll('.side-submenu a').forEach((a) => {
        if ((a.getAttribute('href') || '').toLowerCase() === page) a.classList.add('is-current');
      });
    } else {
      // Home: follow the section in view
      const HOME = [['about', 'about'], ['work', 'portfolios'], ['projects', 'projects'],
                    ['art', 'gallery'], ['resume', 'about'], ['contact', 'contact']];
      const sections = HOME.map(([id, key]) => [document.getElementById(id), key]).filter(([el]) => el);
      const pickSection = () => {
        const line = window.innerHeight * 0.4;
        let key = sections.length ? sections[0][1] : null;
        sections.forEach(([el, k]) => { if (el.getBoundingClientRect().top <= line) key = k; });
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (atBottom && sections.length) key = sections[sections.length - 1][1];
        setCurrent(key);
      };
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => { ticking = false; pickSection(); });
      }, { passive: true });
      pickSection();
    }
    if (links && 'ResizeObserver' in window) new ResizeObserver(placeMarker).observe(links);
    window.addEventListener('resize', placeMarker);

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
