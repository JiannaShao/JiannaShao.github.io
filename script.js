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

  // Sidebar dropdowns.
  // Submenus remain in normal flow, so items below slide down and retract
  // automatically as each dropdown opens/closes.
  document.querySelectorAll('.side-dropdown-toggle').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const dropdown =
        toggle.closest('.side-dropdown');

      const willOpen =
        !dropdown.classList.contains('is-open');

      dropdown.classList.toggle(
        'is-open',
        willOpen
      );

      toggle.setAttribute(
        'aria-expanded',
        String(willOpen)
      );
    });
  });

  // The four project pages do not exist yet, so keep those labels clickable
  // without navigating away or jumping to the top of the page.
  document.querySelectorAll('[data-placeholder-project]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
    });
  });

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
        camera.position.set(
          -3.22,
          2.52,
          8.85
        );
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        fishHost.appendChild(renderer.domElement);

        const fishGroup = new THREE.Group();
        fishGroup.scale.setScalar(1.04);
        fishGroup.position.set(
          0.34,
          0.05,
          0
        );
        scene.add(fishGroup);

        const FISH_TEXT =
          'SWIMEAT';

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
          ctx.font = '700 90px Georgia, serif';
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

        function makeOutlinedLetterTexture(
          letter,
          fillColor,
          strokeColor,
          strokeWidth = 5
        ) {
          const key =
            `outline-${letter}-${fillColor}-${strokeColor}-${strokeWidth}`;

          if (textureCache.has(key)) {
            return textureCache.get(key);
          }

          const c =
            document.createElement('canvas');

          c.width = 128;
          c.height = 128;

          const ctx =
            c.getContext('2d');

          ctx.clearRect(
            0,
            0,
            128,
            128
          );

          ctx.font =
            '700 90px Georgia, serif';

          ctx.textAlign =
            'center';

          ctx.textBaseline =
            'middle';

          ctx.lineJoin =
            'round';

          ctx.strokeStyle =
            strokeColor;

          ctx.lineWidth =
            strokeWidth;

          ctx.strokeText(
            letter,
            64,
            66
          );

          ctx.fillStyle =
            fillColor;

          ctx.fillText(
            letter,
            64,
            66
          );

          const tex =
            new THREE.CanvasTexture(c);

          tex.colorSpace =
            THREE.SRGBColorSpace;

          tex.minFilter =
            THREE.LinearFilter;

          tex.magFilter =
            THREE.LinearFilter;

          textureCache.set(
            key,
            tex
          );

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
          // V64 — reduce total fish letter blocks by about 10%.
          if (Math.random() < 0.10) return;

          // Stronger visible accent mix.
          // 40% navbar light green, 8% white, remainder original fish colors.
          const accentRoll = Math.random();
          const resolvedColor =
            accentRoll < 0.40
              ? '#e1ebe7'
              : accentRoll < 0.48
                ? '#14253d'
                : color;

          const material = new THREE.MeshBasicMaterial({
            map: makeLetterTexture(letter, resolvedColor),
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
          // Long torpedo/tuna-like body.
          // Pointed at the snout, fullest just behind the head,
          // then gradually narrows into the tail peduncle.
          const noseX = -4.65;
          const shoulderX = -2.55;
          const bellyCenterX = -0.55;
          const tailBaseX = 3.25;

          if (x < noseX || x > tailBaseX) return 0;

          let h = 0;

          // Sharp triangular-ish snout transitioning into the body.
          if (x <= shoulderX) {
            const t = (x - noseX) / (shoulderX - noseX);
            h = 0.10 + Math.pow(t, 0.72) * 1.36;
          } else {
            // Long smooth torso.
            const bodyT = (x - shoulderX) / (tailBaseX - shoulderX);

            // Fullest around the front/mid body, then taper smoothly.
            const crown =
              1.46 -
              0.12 * Math.pow((x - bellyCenterX) / 2.9, 2);

            const taper =
              1.0 -
              Math.pow(Math.max(0, bodyT - 0.46) / 0.54, 1.28) * 0.58;

            h = crown * taper;
          }

          // Extra narrowing right before tail.
          if (x > 2.65) {
            const t = (x - 2.65) / 0.60;
            h *= 1 - 0.42 * t;
          }

          return Math.max(0.08, h);
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

        for (let x = -4.58; x <= 3.18; x += bodyXStep) {
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
          const x = rand(-4.15, 2.85);
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
        // Mermaid-tail silhouette:
        // narrow center stem feeding into two broad curved lobes.
        // -------------------------------------------------
        const tailBaseX = 3.02;
        const tailForkX = 3.55;
        const tailTipX = 5.35;

        // Narrow stem between body and fork.
        for (let t = 0; t <= 1; t += 0.11) {
          const x = tailBaseX + (tailForkX - tailBaseX) * t;

          for (const side of [-1, 1]) {
            addLetter(
              nextLetter(),
              x + rand(-0.035, 0.035),
              side * rand(0.08, 0.20),
              rand(-0.58, 0.58),
              rand(0.24, 0.33),
              side === 1 ? frontColor : sideColor,
              side * rand(0.02, 0.14),
              rand(0.10, 0.16),
              rand(-0.10, 0.10),
              rand(-0.12, 0.12)
            );
          }
        }

        // Upper rounded lobe, ending in a point.
        for (let t = 0; t <= 1; t += 0.045) {
          const x = tailForkX + (tailTipX - tailForkX) * t;

          // Broad near the middle, narrows sharply toward point.
          const bulge = Math.sin(t * Math.PI);
          const y =
            0.08 +
            1.56 * Math.pow(bulge, 0.82) +
            0.12 * t;

          addLetter(
            nextLetter(),
            x + rand(-0.04, 0.04),
            y + rand(-0.045, 0.045),
            rand(-0.72, 0.72),
            rand(0.27, 0.39),
            t > 0.80 ? darkEdgeColor : frontColor,
            rand(0.26, 0.54),
            rand(0.10, 0.17),
            rand(-0.11, 0.11),
            rand(-0.15, 0.15)
          );

          if (t > 0.12 && t < 0.88 && Math.random() < 0.68) {
            addLetter(
              nextLetter(),
              x - rand(0.02, 0.12),
              y - rand(0.18, 0.52),
              rand(-0.68, 0.68),
              rand(0.20, 0.30),
              sideColor,
              rand(0.10, 0.40),
              rand(0.09, 0.14),
              rand(-0.11, 0.11),
              rand(-0.14, 0.14)
            );
          }
        }

        // Lower rounded lobe, ending in a point.
        for (let t = 0; t <= 1; t += 0.045) {
          const x = tailForkX + (tailTipX - tailForkX) * t;

          const bulge = Math.sin(t * Math.PI);
          const y =
            -0.08 -
            1.56 * Math.pow(bulge, 0.82) -
            0.12 * t;

          addLetter(
            nextLetter(),
            x + rand(-0.04, 0.04),
            y + rand(-0.045, 0.045),
            rand(-0.72, 0.72),
            rand(0.27, 0.39),
            t > 0.80 ? darkEdgeColor : frontColor,
            rand(-0.54, -0.26),
            rand(0.10, 0.17),
            rand(-0.11, 0.11),
            rand(-0.15, 0.15)
          );

          if (t > 0.12 && t < 0.88 && Math.random() < 0.68) {
            addLetter(
              nextLetter(),
              x - rand(0.02, 0.12),
              y + rand(0.18, 0.52),
              rand(-0.68, 0.68),
              rand(0.20, 0.30),
              sideColor,
              rand(-0.40, -0.10),
              rand(0.09, 0.14),
              rand(-0.11, 0.11),
              rand(-0.14, 0.14)
            );
          }
        }

        // Straighten the very back edge of the two tail lobes.
        // These vertical rows prevent the trailing silhouette from curling inward.
        for (const side of [-1, 1]) {
          const outerY = side * 0.28;
          const innerY = side * 0.08;

          for (let i = 0; i <= 5; i++) {
            const u = i / 5;
            const y = innerY + (outerY - innerY) * u;

            addLetter(
              nextLetter(),
              tailTipX + rand(-0.025, 0.025),
              y,
              rand(-0.60, 0.60),
              rand(0.23, 0.31),
              darkEdgeColor,
              side * rand(-0.08, 0.08),
              rand(0.10, 0.15),
              rand(-0.08, 0.08),
              rand(-0.10, 0.10)
            );
          }
        }

        // -------------------------------------------------
        // DORSAL FIN
        // Tall pointed dorsal fin located behind the head.
        // -------------------------------------------------
        for (let t = 0; t <= 1; t += 0.075) {
          const x = -2.05 + t * 1.65;
          const base = bodyHalfHeight(x);

          const peak =
            Math.pow(Math.sin(t * Math.PI), 1.55) * 1.34;

          const y = base + peak;

          addLetter(
            nextLetter(),
            x,
            y,
            rand(-0.68, 0.68),
            rand(0.28, 0.39),
            frontColor,
            -0.66 + t * 1.18,
            rand(0.11, 0.18),
            rand(-0.10, 0.10),
            rand(-0.14, 0.14)
          );
        }

        // -------------------------------------------------
        // BOTTOM FIN
        // Smaller pointed ventral fin farther back.
        // -------------------------------------------------
        for (let t = 0; t <= 1; t += 0.085) {
          const x = 0.15 + t * 1.65;
          const base = -bodyHalfHeight(x);

          const drop =
            Math.pow(Math.sin(t * Math.PI), 1.15) * 0.82;

          const y = base - drop;

          addLetter(
            nextLetter(),
            x,
            y,
            rand(-0.66, 0.66),
            rand(0.27, 0.37),
            frontColor,
            0.42 - t * 0.78,
            rand(0.11, 0.17),
            rand(-0.10, 0.10),
            rand(-0.14, 0.14)
          );
        }

        // Small mouth / snout accents.
        for (let i = 0; i < 9; i++) {
          const t = i / 8;

          addLetter(
            nextLetter(),
            -4.56 + t * 0.64,
            -0.02 + t * 0.04,
            rand(-0.18, 0.35),
            rand(0.22, 0.30),
            darkEdgeColor,
            rand(-0.18, 0.18),
            rand(0.08, 0.12)
          );
        }

        // -------------------------------------------------
        // V29 — TWO ADDITIONAL ROUNDED TEXT LAYERS
        // Only two extra layers: one behind and one in front.
        // Each clone gets slight letter-by-letter variation so
        // the layers do not look like exact duplicates.
        // -------------------------------------------------
        const volumeSource = fishGroup.children.slice();

        const volumeDepths = [-0.58, 0.58];

        volumeSource.forEach((mesh, i) => {
          const isLikelyEdge =
            Math.abs(mesh.position.y) > 0.55 ||
            mesh.position.x > 2.7 ||
            mesh.position.x < -3.0;

          // Preserve a little more negative space through the middle.
          if (!isLikelyEdge && Math.random() > 0.78) return;

          volumeDepths.forEach((depth) => {
            const clone = mesh.clone();

            clone.position.z += depth + rand(-0.055, 0.055);

            // Small positional differences from layer to layer.
            clone.position.x += rand(-0.055, 0.055);
            clone.position.y += rand(-0.055, 0.055);

            // Stronger rounding: pull layers inward more as they move
            // away from the center, so the fish reads less like stacked slabs.
            const absDepth = Math.abs(depth);

            if (absDepth > 0.40) {
              clone.position.y *= rand(0.68, 0.76);
              clone.position.x =
                -0.15 +
                (clone.position.x + 0.15) * rand(0.86, 0.91);
            } else {
              clone.position.y *= rand(0.79, 0.85);
              clone.position.x =
                -0.15 +
                (clone.position.x + 0.15) * rand(0.91, 0.95);
            }

            // Each letter tilts a little differently on every axis.
            clone.rotation.x += rand(-0.10, 0.10);
            clone.rotation.y += rand(-0.10, 0.10);
            clone.rotation.z += rand(-0.09, 0.09);

            // Even stronger rounded falloff:
            // ±0.28 = 37–43%
            // ±0.58 = 17–23%
            const scaleVariance =
              absDepth > 0.40
                ? rand(0.17, 0.23)
                : rand(0.37, 0.43);

            clone.scale.multiplyScalar(scaleVariance);

            fishGroup.add(clone);
          });
        });


        // -------------------------------------------------
        // VISUAL REGENERATION
        // Every 5 seconds, regenerate the visible text composition:
        // new letters, colors, positions, angles, depth and size.
        // The underlying silhouette remains stable.
        // -------------------------------------------------
        const regenerationStates =
          fishGroup.children.map((mesh) => ({
            mesh,
            x: mesh.position.x,
            y: mesh.position.y,
            z: mesh.position.z,
            rx: mesh.rotation.x,
            ry: mesh.rotation.y,
            rz: mesh.rotation.z,
            sx: mesh.scale.x,
            sy: mesh.scale.y,
            sz: mesh.scale.z
          }));

        function randomFishColor() {
          const roll = Math.random();

          if (roll < 0.40) return '#e1ebe7';
          if (roll < 0.49) return '#14253d';
          if (roll < 0.72) return frontColor;
          if (roll < 0.90) return sideColor;
          return darkEdgeColor;
        }

        function regenerateFishVisual() {
          regenerationStates.forEach((state) => {
            const mesh = state.mesh;

            // Re-randomize the visible character.
            const newLetter =
              FISH_TEXT[
                Math.floor(Math.random() * FISH_TEXT.length)
              ];

            const newColor =
              randomFishColor();

            // Give each mesh its own material so each regeneration
            // can change independently even when geometry was cloned.
            if (mesh.material) {
              const nextMaterial =
                mesh.material.clone();

              nextMaterial.map =
                makeLetterTexture(
                  newLetter,
                  newColor
                );

              nextMaterial.needsUpdate = true;

              mesh.material =
                nextMaterial;
            }

            // Rebuild the visual arrangement around the original silhouette.
            mesh.position.set(
              state.x + rand(-0.075, 0.075),
              state.y + rand(-0.075, 0.075),
              state.z + rand(-0.095, 0.095)
            );

            mesh.rotation.set(
              state.rx + rand(-0.15, 0.15),
              state.ry + rand(-0.15, 0.15),
              state.rz + rand(-0.13, 0.13)
            );

            const sizeVariation =
              rand(0.90, 1.10);

            mesh.scale.set(
              state.sx * sizeVariation,
              state.sy * sizeVariation,
              state.sz * sizeVariation
            );
          });
        }

        // Regenerate immediately on load, then twice per second.
        regenerateFishVisual();

        setInterval(
          regenerateFishVisual,
          500
        );

        // -------------------------------------------------
        // Initial angle + interaction
        // -------------------------------------------------
        fishGroup.rotation.y = THREE.MathUtils.degToRad(5);
        fishGroup.rotation.x = 0.04;

        renderer.domElement.style.cursor = 'default';



        // -------------------------------------------------
        // FLOATING WHITE "O" BUBBLES
        // -------------------------------------------------
        const bubbleGroup =
          new THREE.Group();

        scene.add(bubbleGroup);

        const bubbles = [];

        function spawnTextBubble() {
          const bubbleSize =
            rand(0.20, 0.37);

          const geometry =
            new THREE.PlaneGeometry(
              bubbleSize,
              bubbleSize
            );

          const material =
            new THREE.MeshBasicMaterial({
              map: makeOutlinedLetterTexture('O', '#ffffff', '#14253d', 5),
              transparent: true,
              opacity: rand(0.58, 0.90),
              depthWrite: false,
              side: THREE.DoubleSide
            });

          const bubble =
            new THREE.Mesh(
              geometry,
              material
            );

          // Spawn at the mouth in fish-local coordinates,
          // then convert that point into scene/world coordinates.
          const bubbleSpawnPoint =
            new THREE.Vector3(
              -3.60 + rand(-0.12, 0.16),
              1.18 + rand(-0.05, 0.14),
              0.48 + rand(-0.08, 0.12)
            );

          fishGroup.localToWorld(
            bubbleSpawnPoint
          );

          bubble.position.copy(
            bubbleSpawnPoint
          );

          bubble.userData = {
            riseSpeed: rand(0.38, 0.68),
            driftSpeed: rand(-0.10, 0.10),
            wobbleSpeed: rand(1.2, 2.3),
            wobbleAmount: rand(0.035, 0.075),
            phase: rand(0, Math.PI * 2),
            life: 0
          };

          bubbleGroup.add(
            bubble
          );

          bubbles.push(
            bubble
          );
        }

        function spawnBubbleTrail() {
          // One bubble at a time for a more regular trail.
          spawnTextBubble();

          setTimeout(
            spawnBubbleTrail,
            rand(2200, 2700)
          );
        }

        setTimeout(
          spawnBubbleTrail,
          rand(1600, 2100)
        );

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

        let lastFishFrame =
          performance.now();

        function animateFish(now = performance.now()) {
          requestAnimationFrame(animateFish);

          const delta =
            Math.min(
              (now - lastFishFrame) / 1000,
              0.05
            );

          lastFishFrame =
            now;

          const time =
            now / 1000;

          for (let i = bubbles.length - 1; i >= 0; i--) {
            const bubble =
              bubbles[i];

            const data =
              bubble.userData;

            data.life +=
              delta;

            bubble.position.y +=
              data.riseSpeed * delta;

            bubble.position.x +=
              data.driftSpeed * delta +
              Math.sin(
                time * data.wobbleSpeed +
                data.phase
              ) *
              data.wobbleAmount *
              delta;

            bubble.rotation.z +=
              0.22 * delta;

            // Fade slightly near the end.
            if (data.life > 4.2) {
              bubble.material.opacity =
                Math.max(
                  0,
                  0.90 -
                  (data.life - 4.2) * 0.75
                );
            }

            if (
              data.life > 5.35 ||
              bubble.position.y > 4.25
            ) {
              bubbleGroup.remove(
                bubble
              );

              bubble.geometry.dispose();
              bubble.material.dispose();

              bubbles.splice(
                i,
                1
              );
            }
          }

          renderer.render(
            scene,
            camera
          );
        }

        animateFish();
      } catch (error) {
        console.error('3D text fish failed to load:', error);
        fishHost.textContent = '3D fish unavailable';
      }
    })();
  }

})();