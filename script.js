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
        camera.position.set(0, 0, 9.4);

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
        const sideColor = '#48666d';
        const darkEdgeColor = '#2f484f';

        const textureCache = new Map();

        function makeLetterTexture(letter, color) {
          const key = `${letter}-${color}`;
          if (textureCache.has(key)) return textureCache.get(key);

          const c = document.createElement('canvas');
          c.width = 128;
          c.height = 128;

          const ctx = c.getContext('2d');
          ctx.clearRect(0, 0, 128, 128);
          ctx.font = '700 88px Georgia, serif';
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

        function addLetter(
          letter,
          x,
          y,
          z,
          size,
          color,
          rotZ = 0,
          thickness = 0.08,
          rotX = 0,
          rotY = 0
        ) {
          const material = new THREE.MeshBasicMaterial({
            map: makeLetterTexture(letter, color),
            transparent: true,
            depthWrite: true,
            side: THREE.DoubleSide
          });

          // Slightly thicker geometry: shallow box instead of flat plane.
          const geo = new THREE.BoxGeometry(size, size, thickness);
          const mesh = new THREE.Mesh(geo, material);

          mesh.position.set(x, y, z);
          mesh.rotation.set(
            rotX + rand(-0.10, 0.10),
            rotY + rand(-0.10, 0.10),
            rotZ + rand(-0.08, 0.08)
          );
          fishGroup.add(mesh);
        }

        let letterIndex = 0;

        function nextLetter() {
          const ch = FISH_TEXT[letterIndex % FISH_TEXT.length];
          letterIndex++;
          return ch;
        }

        function rand(min, max) {
          return min + Math.random() * (max - min);
        }

        function clamp(v, min, max) {
          return Math.max(min, Math.min(max, v));
        }

        // -------------------------------------------------
        // BODY SHAPE
        // Organic fish body using an ellipse with soft
        // narrowing toward head and tail.
        // -------------------------------------------------
        function bodyHalfHeight(x) {
          const center = -0.15;
          const rx = 4.18;

          const normalized = (x - center) / rx;
          const ellipse = Math.sqrt(Math.max(0, 1 - normalized * normalized));

          let h = 1.55 * ellipse;

          // Slightly taper head and tail for a fish-like profile.
          if (x < -3.10) {
            const headT = Math.max(0, Math.min(1, (x + 4.18) / 1.08));
            h *= 0.28 + Math.pow(headT, 0.72) * 0.72;
          }

          if (x > 2.55) {
            h *= 1 - ((x - 2.55) / 1.15) * 0.25;
          }

          return Math.max(0, h);
        }

        // Tangent-like angle based on local silhouette slope.
        function silhouetteAngle(x, top = true) {
          const eps = 0.03;
          const y1 = bodyHalfHeight(x - eps);
          const y2 = bodyHalfHeight(x + eps);

          const slope = (y2 - y1) / (2 * eps);
          const angle = Math.atan(slope);

          return top ? angle : -angle;
        }

        // -------------------------------------------------
        // EDGE LETTERS
        // Concentrate text near top and bottom silhouette
        // rather than filling the center uniformly.
        // -------------------------------------------------
        const bodyXStep = 0.24;

        for (let x = -4.05; x <= 3.35; x += bodyXStep) {
          const hh = bodyHalfHeight(x);
          if (hh <= 0.12) continue;

          // Top edge
          for (let layer = 0; layer < 3; layer++) {
            const inset = layer * 0.15 + rand(-0.04, 0.05);

            const y = hh - inset + rand(-0.07, 0.07);
            const z = rand(-0.72, 0.72);

            addLetter(
              nextLetter(),
              x + rand(-0.06, 0.06),
              y,
              z,
              rand(0.27, 0.39),
              layer === 0 ? darkEdgeColor : frontColor,
              silhouetteAngle(x, true) + rand(-0.15, 0.15),
              rand(0.10, 0.17),
              rand(-0.08, 0.08),
              rand(-0.12, 0.12)
            );
          }

          // Bottom edge
          for (let layer = 0; layer < 3; layer++) {
            const inset = layer * 0.15 + rand(-0.04, 0.05);

            const y = -hh + inset + rand(-0.07, 0.07);
            const z = rand(-0.72, 0.72);

            addLetter(
              nextLetter(),
              x + rand(-0.06, 0.06),
              y,
              z,
              rand(0.27, 0.39),
              layer === 0 ? darkEdgeColor : frontColor,
              silhouetteAngle(x, false) + rand(-0.15, 0.15),
              rand(0.10, 0.17),
              rand(-0.08, 0.08),
              rand(-0.12, 0.12)
            );
          }
        }

        // -------------------------------------------------
        // SPARSE INTERIOR
        // Keep center much emptier, with only occasional
        // text pieces for volume.
        // -------------------------------------------------
        for (let i = 0; i < 120; i++) {
          const x = rand(-2.8, 2.15);
          const hh = bodyHalfHeight(x);

          if (hh <= 0.2) continue;

          const y = rand(-hh * 0.64, hh * 0.64);

          // Create a central empty band.
          if (Math.abs(y) < hh * 0.34 && Math.random() < 0.78) continue;

          addLetter(
            nextLetter(),
            x + rand(-0.08, 0.08),
            y + rand(-0.08, 0.08),
            rand(-0.78, 0.78),
            rand(0.22, 0.34),
            Math.random() < 0.65 ? frontColor : sideColor,
            rand(-0.72, 0.72),
            rand(0.09, 0.15),
            rand(-0.14, 0.14),
            rand(-0.16, 0.16)
          );
        }

        // -------------------------------------------------
        // TAIL
        // Two-lobed mermaid-style tail: one upper lobe,
        // one lower lobe, with a narrow waist at the base.
        // -------------------------------------------------
        const tailBaseX = 2.95;
        const tailTipX = 5.35;

        // Upper lobe
        for (let t = 0; t <= 1; t += 0.055) {
          const x = tailBaseX + (tailTipX - tailBaseX) * t;

          const arch = Math.sin(t * Math.PI);
          const y =
            0.18 +
            arch * 1.55 +
            t * 0.20;

          addLetter(
            nextLetter(),
            x + rand(-0.05, 0.05),
            y + rand(-0.05, 0.05),
            rand(-0.76, 0.76),
            rand(0.29, 0.42),
            t > 0.78 ? darkEdgeColor : frontColor,
            rand(0.25, 0.58),
            rand(0.11, 0.18),
            rand(-0.12, 0.12),
            rand(-0.15, 0.15)
          );

          if (t > 0.15 && t < 0.90 && Math.random() < 0.55) {
            addLetter(
              nextLetter(),
              x,
              y - rand(0.18, 0.48),
              rand(-0.72, 0.72),
              rand(0.22, 0.32),
              sideColor,
              rand(0.12, 0.42),
              rand(0.09, 0.15),
              rand(-0.12, 0.12),
              rand(-0.14, 0.14)
            );
          }
        }

        // Lower lobe
        for (let t = 0; t <= 1; t += 0.055) {
          const x = tailBaseX + (tailTipX - tailBaseX) * t;

          const arch = Math.sin(t * Math.PI);
          const y =
            -0.18 -
            arch * 1.55 -
            t * 0.20;

          addLetter(
            nextLetter(),
            x + rand(-0.05, 0.05),
            y + rand(-0.05, 0.05),
            rand(-0.76, 0.76),
            rand(0.29, 0.42),
            t > 0.78 ? darkEdgeColor : frontColor,
            rand(-0.58, -0.25),
            rand(0.11, 0.18),
            rand(-0.12, 0.12),
            rand(-0.15, 0.15)
          );

          if (t > 0.15 && t < 0.90 && Math.random() < 0.55) {
            addLetter(
              nextLetter(),
              x,
              y + rand(0.18, 0.48),
              rand(-0.72, 0.72),
              rand(0.22, 0.32),
              sideColor,
              rand(-0.42, -0.12),
              rand(0.09, 0.15),
              rand(-0.12, 0.12),
              rand(-0.14, 0.14)
            );
          }
        }

        // -------------------------------------------------
        // DORSAL FIN
        // Curved arc of letters with smooth angle changes.
        // -------------------------------------------------
        for (let t = 0; t <= 1; t += 0.08) {
          const x = -1.55 + t * 1.7;
          const base = bodyHalfHeight(x);
          const lift = Math.pow(Math.sin(t * Math.PI), 1.35) * 1.22;
          const y = base + lift;

          const rot = -0.52 + t * 1.04;

          addLetter(
            nextLetter(),
            x,
            y,
            rand(-0.68, 0.68),
            rand(0.29, 0.40),
            frontColor,
            rot,
            rand(0.11, 0.18),
            rand(-0.1, 0.1),
            rand(-0.12, 0.12)
          );
        }

        // -------------------------------------------------
        // BOTTOM FIN
        // -------------------------------------------------
        for (let t = 0; t <= 1; t += 0.09) {
          const x = -0.45 + t * 1.45;
          const base = -bodyHalfHeight(x);
          const drop = Math.pow(Math.sin(t * Math.PI), 1.4) * 0.94;
          const y = base - drop;

          const rot = 0.48 - t * 0.96;

          addLetter(
            nextLetter(),
            x,
            y,
            rand(-0.68, 0.68),
            rand(0.28, 0.38),
            frontColor,
            rot,
            rand(0.11, 0.17),
            rand(-0.1, 0.1),
            rand(-0.12, 0.12)
          );
        }

        // -------------------------------------------------
        // SIDE / PECTORAL FINS
        // Mirrored on both sides, with tips pointing toward tail.
        // -------------------------------------------------
        for (const side of [-1, 1]) {
          for (let t = 0; t <= 1; t += 0.09) {
            const x = -1.70 + t * 1.52;

            // Root near shoulder, pointed end trails backward toward tail.
            const sweep = Math.pow(t, 1.15);
            const y =
              -0.12 -
              Math.sin(t * Math.PI) * 0.70;

            const z =
              side * (
                0.30 +
                Math.sin(t * Math.PI) * 0.72
              );

            addLetter(
              nextLetter(),
              x + sweep * 0.42,
              y,
              z,
              rand(0.27, 0.37),
              side === 1 ? frontColor : sideColor,
              -0.52 + t * 0.28,
              rand(0.11, 0.17),
              side * rand(-0.12, 0.12),
              side * rand(0.15, 0.30)
            );
          }
        }

        // -------------------------------------------------
        // HEAD + EYES
        // Eye rings on both sides of the fish.
        // -------------------------------------------------
        for (const side of [-1, 1]) {
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
            addLetter(
              'O',
              -2.72 + Math.cos(a) * 0.23,
              0.34 + Math.sin(a) * 0.23,
              side * 0.62 + rand(-0.035, 0.035),
              0.26,
              darkEdgeColor,
              a + Math.PI / 2,
              0.13,
              rand(-0.06, 0.06),
              side * rand(0.06, 0.12)
            );
          }
        }

        // Small mouth / snout accents.
        for (let i = 0; i < 9; i++) {
          const t = i / 8;

          addLetter(
            nextLetter(),
            -4.04 + t * 0.62,
            -0.02 + t * 0.04,
            rand(-0.18, 0.35),
            rand(0.22, 0.30),
            darkEdgeColor,
            rand(-0.18, 0.18),
            rand(0.08, 0.12)
          );
        }

        // Extra contour depth layers for a fuller 3D text volume.
        const contourMeshes = fishGroup.children.slice();

        contourMeshes.forEach((mesh, i) => {
          if (i % 4 !== 0) return;

          const cloneBack = mesh.clone();
          cloneBack.position.z -= rand(0.16, 0.32);
          cloneBack.position.x += rand(-0.035, 0.035);
          cloneBack.position.y += rand(-0.035, 0.035);
          cloneBack.rotation.z += rand(-0.08, 0.08);
          cloneBack.scale.multiplyScalar(rand(0.94, 1.04));
          fishGroup.add(cloneBack);

          if (i % 8 === 0) {
            const cloneFront = mesh.clone();
            cloneFront.position.z += rand(0.18, 0.38);
            cloneFront.position.x += rand(-0.035, 0.035);
            cloneFront.position.y += rand(-0.035, 0.035);
            cloneFront.rotation.z += rand(-0.10, 0.10);
            cloneFront.scale.multiplyScalar(rand(0.92, 1.03));
            fishGroup.add(cloneFront);
          }
        });

        // -------------------------------------------------
        // Initial angle + interaction
        // -------------------------------------------------
        fishGroup.rotation.y = -0.24;
        fishGroup.rotation.x = 0.04;

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

          fishGroup.rotation.x = clamp(
            fishGroup.rotation.x,
            -0.65,
            0.65
          );

          lastX = e.clientX;
          lastY = e.clientY;
        });

        function stopDrag(e) {
          dragging = false;
          renderer.domElement.style.cursor = 'grab';

          if (
            e?.pointerId !== undefined &&
            renderer.domElement.hasPointerCapture?.(e.pointerId)
          ) {
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