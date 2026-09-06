(() => {
  /* CUSTOM CURSOR */
  const cursor = document.querySelector('.xp-cursor');

  if (cursor && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }, { passive: true });
  }

  /* SIDEBAR
     Hover the logo to open.
     Keep it open while the pointer remains anywhere over the sidebar.
     Close when the pointer leaves the sidebar. */
  const sideNav = document.getElementById('side-nav');
  const sideBrand = document.querySelector('.side-brand');

  if (sideNav && sideBrand) {
    sideBrand.addEventListener('mouseenter', () => {
      sideNav.classList.add('hover-open');
    });

    sideNav.addEventListener('mouseleave', () => {
      sideNav.classList.remove('hover-open');
    });

    // Touch/click fallback for devices without hover.
    sideBrand.addEventListener('click', (e) => {
      if (window.matchMedia('(hover:none)').matches) {
        e.preventDefault();
        sideNav.classList.toggle('hover-open');
      }
    });

    document.querySelectorAll('.side-links a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.matchMedia('(hover:none)').matches) {
          sideNav.classList.remove('hover-open');
        }
      });
    });
  }

  /* SCROLLING SNAKE
     Built directly in the visible SVG. It is independent of the sidebar
     and custom cursor, and is rebuilt after load/resize. */
  const snakeSvg = document.getElementById('snake-svg');
  const snakeGhost = document.getElementById('snake-ghost');
  const snakePath = document.getElementById('snake-path');

  let snakeLength = 0;

  function buildSnake() {
    if (!snakeSvg || !snakeGhost || !snakePath) return;

    const rect = snakeSvg.getBoundingClientRect();
    const W = Math.max(36, rect.width || 48);
    const H = Math.max(300, rect.height || window.innerHeight);

    // Use CSS pixel proportions in the viewBox so curves are not distorted.
    snakeSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    snakeSvg.setAttribute('preserveAspectRatio', 'none');

    const stroke = 4.5;
    const edge = stroke / 2 + 3;
    const radius = Math.min(8, Math.max(6, (W - edge * 2) / 4));

    // Keep path well inside both left and right edges.
    const leftX = edge + radius;
    const rightX = W - edge - radius;

    let y = edge + 2;
    let goLeft = true;
    let d = `M ${rightX} ${y} L ${leftX} ${y}`;

    while (y + radius * 2 <= H - edge - 2) {
      const nextY = y + radius * 2;

      if (goLeft) {
        // Exact half-circle on the left.
        d += ` A ${radius} ${radius} 0 0 1 ${rightX} ${nextY}`;
        d += ` L ${leftX} ${nextY}`;
      } else {
        // Exact half-circle on the right.
        d += ` A ${radius} ${radius} 0 0 0 ${leftX} ${nextY}`;
        d += ` L ${rightX} ${nextY}`;
      }

      y = nextY;
      goLeft = !goLeft;
    }

    snakeGhost.setAttribute('d', d);
    snakePath.setAttribute('d', d);

    snakeLength = snakePath.getTotalLength();
    snakePath.style.strokeDasharray = `${snakeLength} ${snakeLength}`;

    updateSnake();
  }

  function updateSnake() {
    if (!snakePath || !snakeLength) return;

    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );

    let progress = 0;

    if (maxScroll > 0) {
      progress = window.scrollY / maxScroll;
    }

    progress = Math.max(0, Math.min(1, progress));

    // Explicit endpoint snap.
    if (window.scrollY <= 1) progress = 0;
    if (window.scrollY >= maxScroll - 1) progress = 1;

    snakePath.style.strokeDashoffset = `${snakeLength * (1 - progress)}`;
  }

  if (snakeSvg && snakeGhost && snakePath) {
    // Build immediately, again once layout settles, and again after full load.
    buildSnake();
    requestAnimationFrame(buildSnake);
    window.addEventListener('load', buildSnake, { once: true });
    window.addEventListener('resize', buildSnake, { passive: true });
    window.addEventListener('scroll', updateSnake, { passive: true });
  }

  /* RESUME PREVIEW / LIGHTBOX */
  const resumeCanvas = document.getElementById('resume-canvas');
  const resumeCanvasZoom = document.getElementById('resume-canvas-zoom');
  const resumeButton = document.getElementById('resume-preview-button');
  const resumeLightbox = document.getElementById('resume-lightbox');
  const resumeClose = document.getElementById('resume-lightbox-close');

  if (resumeCanvas && resumeCanvasZoom && resumeButton && resumeLightbox && resumeClose) {
    async function renderResume() {
      try {
        const pdfjsLib = await import(
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs'
        );

        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

        const pdf = await pdfjsLib.getDocument('Resume.pdf').promise;
        const page = await pdf.getPage(1);

        async function draw(canvas, targetWidth) {
          const base = page.getViewport({ scale: 1 });
          const scale = targetWidth / base.width;
          const viewport = page.getViewport({ scale });
          const ratio = window.devicePixelRatio || 1;

          canvas.width = Math.floor(viewport.width * ratio);
          canvas.height = Math.floor(viewport.height * ratio);
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;

          const ctx = canvas.getContext('2d');
          ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

          await page.render({
            canvasContext: ctx,
            viewport
          }).promise;
        }

        await draw(
          resumeCanvas,
          Math.min(360, resumeButton.clientWidth || 360)
        );

        resumeButton.addEventListener('click', async () => {
          resumeLightbox.classList.add('open');
          resumeLightbox.setAttribute('aria-hidden', 'false');
          document.body.classList.add('resume-zoom-open');

          await draw(
            resumeCanvasZoom,
            Math.min(window.innerWidth * 0.88, 1100)
          );
        });

        function closeResume() {
          resumeLightbox.classList.remove('open');
          resumeLightbox.setAttribute('aria-hidden', 'true');
          document.body.classList.remove('resume-zoom-open');
        }

        resumeClose.addEventListener('click', closeResume);

        resumeLightbox.addEventListener('click', (e) => {
          if (e.target === resumeLightbox) closeResume();
        });

        window.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') closeResume();
        });
      } catch (error) {
        console.error('Resume.pdf preview failed:', error);
      }
    }

    renderResume();
  }
})();