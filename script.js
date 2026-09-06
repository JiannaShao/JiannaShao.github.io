(() => {
  /* SIDEBAR
     Hover anywhere over the collapsed rail to open.
     Keep it open while the pointer remains over the sidebar.
     Close when the pointer leaves the sidebar. */
  const sideNav = document.getElementById('side-nav');

  if (sideNav) {
    sideNav.addEventListener('mouseenter', () => {
      sideNav.classList.add('hover-open');
    });

    sideNav.addEventListener('mouseleave', () => {
      sideNav.classList.remove('hover-open');
    });

    // Touch/click fallback for devices without hover.
    const sideBrand = document.querySelector('.side-brand');

    if (sideBrand) {
      sideBrand.addEventListener('click', (e) => {
        if (window.matchMedia('(hover:none)').matches) {
          e.preventDefault();
          sideNav.classList.toggle('hover-open');
        }
      });
    }

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

    snakeSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    snakeSvg.setAttribute('preserveAspectRatio', 'none');

    const stroke = 4.5;
    const edge = stroke / 2 + 3;
    const radius = Math.min(8, Math.max(6, (W - edge * 2) / 4));

    const leftX = edge + radius;
    const rightX = W - edge - radius;

    // First row uses the exact same geometry as every later row:
    // straight horizontal segment followed by an exact semicircle.
    let y = edge + 2;
    let d = `M ${rightX} ${y} L ${leftX} ${y}`;
    let turnRight = true;

    while (y + radius * 2 <= H - edge - 2) {
      const nextY = y + radius * 2;

      if (turnRight) {
        d += ` A ${radius} ${radius} 0 0 1 ${rightX} ${nextY}`;
        d += ` L ${leftX} ${nextY}`;
      } else {
        d += ` A ${radius} ${radius} 0 0 0 ${leftX} ${nextY}`;
        d += ` L ${rightX} ${nextY}`;
      }

      y = nextY;
      turnRight = !turnRight;
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
  const resumeCanvasZoom = document.getElementById('resume-canvas-zoom');
  const resumeButton = document.getElementById('resume-preview-button');
  const resumeLightbox = document.getElementById('resume-lightbox');
  const resumeClose = document.getElementById('resume-lightbox-close');

  if (resumeCanvasZoom && resumeButton && resumeLightbox && resumeClose) {
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
  /* =====================================================
     ROTATABLE 3D TEXT FISH
     Edit FISH_TEXT below later to change the letters.
  ===================================================== */
  const fishHost = document.getElementById('text-fish-3d');

  if (fishHost) {
    (async () => {
      try {
        const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
        camera.position.set(0, 0, 9.2);

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        fishHost.appendChild(renderer.domElement);

        const fishGroup = new THREE.Group();
        scene.add(fishGroup);

        const FISH_TEXT =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789SHAOWESLEYAN';

        const frontColor = '#85a4ab';
        const sideColor = '#45636b';

        // Make one letter into a canvas texture, then place it as a small plane.
        const textureCache = new Map();

        function makeLetterTexture(letter, color) {
          const key = `${letter}-${color}`;
          if (textureCache.has(key)) return textureCache.get(key);

          const c = document.createElement('canvas');
          c.width = 128;
          c.height = 128;

          const ctx = c.getContext('2d');
          ctx.clearRect(0, 0, 128, 128);
          ctx.font = '700 86px Georgia, serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = color;
          ctx.fillText(letter, 64, 66);

          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          textureCache.set(key, tex);
          return tex;
        }

        function addLetter(letter, x, y, z, size, color, rotZ = 0) {
          const material = new THREE.MeshBasicMaterial({
            map: makeLetterTexture(letter, color),
            transparent: true,
            depthWrite: true,
            side: THREE.DoubleSide
          });

          const geo = new THREE.PlaneGeometry(size, size);
          const mesh = new THREE.Mesh(geo, material);
          mesh.position.set(x, y, z);
          mesh.rotation.z = rotZ;
          fishGroup.add(mesh);
        }

        let letterIndex = 0;
        function nextLetter() {
          const ch = FISH_TEXT[letterIndex % FISH_TEXT.length];
          letterIndex++;
          return ch;
        }

        // Fish silhouette: elliptical body, tail, fins, and a hollow eye area.
        // Each point gets several depth layers so the object reads as genuinely 3D.
        const points = [];

        const bodyStep = 0.34;
        for (let y = -1.55; y <= 1.55; y += bodyStep) {
          for (let x = -3.25; x <= 2.55; x += bodyStep) {
            const nx = (x + 0.45) / 3.15;
            const ny = y / 1.52;
            const insideBody = nx * nx + ny * ny <= 1;

            // Narrow the snout slightly.
            const snoutCut = x < -2.65 && Math.abs(y) > (x + 3.25) * 1.8 + 0.15;

            // Leave subtle negative space around the eye.
            const eyeHole =
              ((x + 2.28) ** 2) / 0.18 +
              ((y - 0.35) ** 2) / 0.10 < 1;

            if (insideBody && !snoutCut && !eyeHole) {
              points.push([x, y, 'body']);
            }
          }
        }

        // Tail triangles.
        for (let y = -1.75; y <= 1.75; y += bodyStep) {
          for (let x = 2.1; x <= 4.0; x += bodyStep) {
            const t = (x - 2.1) / 1.9;
            const halfHeight = 0.48 + t * 1.35;
            if (Math.abs(y) <= halfHeight && Math.abs(y) >= t * 0.12) {
              points.push([x, y, 'tail']);
            }
          }
        }

        // Top and bottom fins.
        for (let x = -1.45; x <= 0.25; x += bodyStep) {
          const t = (x + 1.45) / 1.7;
          const topY = 1.38 + Math.sin(t * Math.PI) * 1.02;
          points.push([x, topY, 'fin']);
        }

        for (let x = -0.55; x <= 1.0; x += bodyStep) {
          const t = (x + 0.55) / 1.55;
          const bottomY = -1.34 - Math.sin(t * Math.PI) * 0.82;
          points.push([x, bottomY, 'fin']);
        }

        // Side fin.
        for (let x = -1.7; x <= -0.35; x += bodyStep) {
          const t = (x + 1.7) / 1.35;
          const finY = -0.25 - Math.sin(t * Math.PI) * 0.72;
          points.push([x, finY, 'fin']);
        }

        // Build several shallow z-layers to give the text fish thickness.
        const depthLayers = [-0.34, -0.17, 0, 0.17, 0.34];

        for (const [x, y, region] of points) {
          depthLayers.forEach((z, zi) => {
            // Slightly thinner population on rear layers keeps it readable.
            if (zi !== 2 && Math.random() > 0.58) return;

            const edgeBias =
              region === 'tail' || region === 'fin' ? 0.28 : 0.0;

            addLetter(
              nextLetter(),
              x,
              y,
              z,
              0.34 + edgeBias,
              zi === 2 ? frontColor : sideColor,
              (Math.random() - 0.5) * 0.18
            );
          });
        }

        // Eye ring made from O characters.
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 5) {
          addLetter(
            'O',
            -2.28 + Math.cos(a) * 0.25,
            0.35 + Math.sin(a) * 0.25,
            0.46,
            0.28,
            '#233b42',
            a * 0.12
          );
        }

        // Gentle initial angle so the depth is visible immediately.
        fishGroup.rotation.y = -0.28;
        fishGroup.rotation.x = 0.05;

        let dragging = false;
        let lastX = 0;
        let lastY = 0;

        renderer.domElement.style.cursor = 'grab';

        renderer.domElement.addEventListener('pointerdown', (e) => {
          dragging = true;
          lastX = e.clientX;
          lastY = e.clientY;
          renderer.domElement.setPointerCapture(e.pointerId);
          renderer.domElement.style.cursor = 'grabbing';
        });

        renderer.domElement.addEventListener('pointermove', (e) => {
          if (!dragging) return;

          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;

          fishGroup.rotation.y += dx * 0.008;
          fishGroup.rotation.x += dy * 0.005;

          fishGroup.rotation.x = Math.max(
            -0.65,
            Math.min(0.65, fishGroup.rotation.x)
          );

          lastX = e.clientX;
          lastY = e.clientY;
        });

        function stopDrag(e) {
          dragging = false;
          renderer.domElement.style.cursor = 'grab';

          if (e?.pointerId !== undefined &&
              renderer.domElement.hasPointerCapture?.(e.pointerId)) {
            renderer.domElement.releasePointerCapture(e.pointerId);
          }
        }

        renderer.domElement.addEventListener('pointerup', stopDrag);
        renderer.domElement.addEventListener('pointercancel', stopDrag);

        function resizeFish() {
          const rect = fishHost.getBoundingClientRect();
          const w = Math.max(280, rect.width);
          const h = Math.max(190, rect.height);

          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }

        const resizeObserver = new ResizeObserver(resizeFish);
        resizeObserver.observe(fishHost);
        resizeFish();

        function animateFish() {
          requestAnimationFrame(animateFish);
          renderer.render(scene, camera);
        }

        animateFish();
      } catch (error) {
        console.error('3D text fish failed to load:', error);
        fishHost.textContent = '3D fish unavailable';
      }
    })();
  }

})();