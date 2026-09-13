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
     SIDE-VIEW TEXT FISH — REFERENCE LAYOUT V3
     This fully replaces the old fish generator.
  ===================================================== */
  const fishHost = document.getElementById('text-fish-3d');

  if (fishHost) {
    (async () => {
      try {
        const THREE = await import(
          'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js'
        );

        fishHost.innerHTML = '';

        const scene = new THREE.Scene();

        /* Perfect side view: no perspective and no camera angle. */
        const camera = new THREE.OrthographicCamera(
          -6.7,
          6.7,
          3.8,
          -3.8,
          0.1,
          100
        );

        camera.position.set(0, 0, 12);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true
        });

        renderer.setPixelRatio(
          Math.min(window.devicePixelRatio || 1, 2)
        );

        renderer.setClearColor(0x000000, 0);
        fishHost.appendChild(renderer.domElement);

        const fishGroup = new THREE.Group();

        /*
          Smaller, less wide, and farther right than the prior version.
        */
        fishGroup.scale.set(
          0.95,
          1.15,
          1
        );

        fishGroup.position.set(
          0.90,
          0.02,
          0
        );

        fishGroup.rotation.set(0, 0, 0);
        scene.add(fishGroup);

        const FISH_TEXT = 'SWIMEAT';

        const frontColor = '#85a4ab';
        const sideColor = '#48666d';
        const darkColor = '#2f484f';
        const navyColor = '#14253d';
        const lightColor = '#e1ebe7';

        /*
          The actual letters are at least 5px larger than before.
          Previous fish used 90px. This uses 105px.
        */
        const LETTER_FONT_PX = 140;

        /*
          Block geometry itself stays compact.
          Blue/J/S areas use slightly larger blocks.
        */
        const SMALL_BLOCK_SIZE = 0.14;
        const LARGE_BLOCK_SIZE = 0.19;

        /*
          Exactly four text layers.
          Front layer is highest.
          Each layer behind it is about 2px visually lower.
        */
        const TEXT_LAYERS = [
          { z:  0.18, x:  0.0000, y:  0.000 },
          { z:  0.06, x: -0.0225, y: -0.045 },
          { z: -0.06, x: -0.0450, y: -0.090 }
        ];

        let letterIndex = 0;

        function nextLetter() {
          const ch =
            FISH_TEXT[
              letterIndex %
              FISH_TEXT.length
            ];

          letterIndex++;
          return ch;
        }

        function randomColor() {
          const r = Math.random();

          if (r < 0.34) return frontColor;
          if (r < 0.60) return sideColor;
          if (r < 0.80) return darkColor;
          if (r < 0.92) return navyColor;

          return lightColor;
        }

        const textureCache = new Map();

        function makeLetterTexture(
          letter,
          color,
          fontPx = LETTER_FONT_PX
        ) {
          const roundedFontPx =
            Math.round(fontPx);

          const key =
            `${letter}-${color}-${roundedFontPx}`;

          if (textureCache.has(key)) {
            return textureCache.get(key);
          }

          const canvas =
            document.createElement('canvas');

          canvas.width = 128;
          canvas.height = 128;

          const ctx =
            canvas.getContext('2d');

          ctx.clearRect(
            0,
            0,
            128,
            128
          );

          ctx.font =
            `700 ${roundedFontPx}px Georgia, serif`;

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = color;

          ctx.fillText(
            letter,
            64,
            66
          );

          const texture =
            new THREE.CanvasTexture(canvas);

          texture.colorSpace =
            THREE.SRGBColorSpace;

          texture.minFilter =
            THREE.LinearFilter;

          texture.magFilter =
            THREE.LinearFilter;

          textureCache.set(
            key,
            texture
          );

          return texture;
        }

        const smallGeometry =
          new THREE.BoxGeometry(
            SMALL_BLOCK_SIZE,
            SMALL_BLOCK_SIZE,
            0.035
          );

        const largeGeometry =
          new THREE.BoxGeometry(
            LARGE_BLOCK_SIZE,
            LARGE_BLOCK_SIZE,
            0.035
          );

        const textMeshes = [];

        function addBlock(
          x,
          y,
          size,
          z,
          color = null,
          rotation = 0,
          lockColor = false
        ) {
          const resolvedColor =
            color || randomColor();

          const mesh =
            new THREE.Mesh(
              size === LARGE_BLOCK_SIZE
                ? largeGeometry
                : smallGeometry,

              new THREE.MeshBasicMaterial({
                map: makeLetterTexture(
                  nextLetter(),
                  resolvedColor,
                  LETTER_FONT_PX +
                  (
                    Math.random() *
                    30 -
                    10
                  )
                ),
                transparent: true,
                depthWrite: true,
                side: THREE.DoubleSide
              })
            );

          mesh.position.set(
            x,
            y,
            z
          );

          mesh.rotation.set(
            0,
            0,
            rotation
          );

          mesh.userData.lockColor =
            lockColor
              ? resolvedColor
              : null;

          fishGroup.add(mesh);
          textMeshes.push(mesh);
        }

        function addFourLayers(
          x,
          y,
          size,
          color = null,
          rotation = 0,
          lockColor = false
        ) {
          TEXT_LAYERS.forEach((layer) => {
            addBlock(
              x + layer.x,
              y + layer.y,
              size,
              layer.z,
              color,
              rotation,
              lockColor
            );
          });
        }

        function drawLine(
          x1,
          y1,
          x2,
          y2,
          spacing,
          size,
          color = null,
          lockColor = false
        ) {
          const dx = x2 - x1;
          const dy = y2 - y1;

          const distance =
            Math.hypot(dx, dy);

          const steps =
            Math.max(
              1,
              Math.ceil(
                distance / spacing
              )
            );

          const angle =
            Math.atan2(dy, dx);

          for (
            let i = 0;
            i <= steps;
            i++
          ) {
            const t =
              i / steps;

            addFourLayers(
              x1 + dx * t,
              y1 + dy * t,
              size,
              color,
              angle,
              lockColor
            );
          }
        }

        function drawCurve(
          pointFunction,
          steps,
          size,
          color = null,
          lockColor = false
        ) {
          for (
            let i = 0;
            i <= steps;
            i++
          ) {
            const t =
              i / steps;

            const p =
              pointFunction(t);

            const q =
              pointFunction(
                Math.min(
                  1,
                  t + 0.01
                )
              );

            const angle =
              Math.atan2(
                q.y - p.y,
                q.x - p.x
              );

            addFourLayers(
              p.x,
              p.y,
              size,
              color,
              angle,
              lockColor
            );
          }
        }

        function roundedRect(
          cx,
          cy,
          width,
          height,
          radius,
          size
        ) {
          const left =
            cx - width / 2;

          const right =
            cx + width / 2;

          const top =
            cy + height / 2;

          const bottom =
            cy - height / 2;

          drawLine(
            left + radius,
            top,
            right - radius,
            top,
            0.17,
            size
          );

          drawLine(
            right,
            top - radius,
            right,
            bottom + radius,
            0.17,
            size
          );

          drawLine(
            right - radius,
            bottom,
            left + radius,
            bottom,
            0.17,
            size
          );

          drawLine(
            left,
            bottom + radius,
            left,
            top - radius,
            0.17,
            size
          );

          const corners = [
            [right - radius, top - radius, 0, Math.PI / 2],
            [left + radius, top - radius, Math.PI / 2, Math.PI],
            [left + radius, bottom + radius, Math.PI, Math.PI * 1.5],
            [right - radius, bottom + radius, Math.PI * 1.5, Math.PI * 2]
          ];

          corners.forEach(
            ([
              ccx,
              ccy,
              a1,
              a2
            ]) => {
              drawCurve(
                (t) => {
                  const a =
                    a1 +
                    (
                      a2 -
                      a1
                    ) *
                    t;

                  return {
                    x:
                      ccx +
                      Math.cos(a) *
                      radius,

                    y:
                      ccy +
                      Math.sin(a) *
                      radius
                  };
                },
                6,
                size
              );
            }
          );
        }

        function fillGrid(
          minX,
          maxX,
          minY,
          maxY,
          spacing,
          size,
          color,
          contains
        ) {
          let row = 0;

          for (
            let y = minY;
            y <= maxY;
            y += spacing
          ) {
            const stagger =
              row % 2
                ? spacing * 0.5
                : 0;

            for (
              let x = minX + stagger;
              x <= maxX;
              x += spacing
            ) {
              if (
                contains(
                  x,
                  y
                )
              ) {
                addFourLayers(
                  x,
                  y,
                  size,
                  color,
                  0,
                  false
                );
              }
            }

            row++;
          }
        }

        function fillEllipse(
          cx,
          cy,
          rx,
          ry,
          spacing,
          size,
          color
        ) {
          fillGrid(
            cx - rx,
            cx + rx,
            cy - ry,
            cy + ry,
            spacing,
            size,
            color,
            (x, y) => {
              const nx =
                (x - cx) / rx;

              const ny =
                (y - cy) / ry;

              return (
                nx * nx +
                ny * ny
              ) <= 1;
            }
          );
        }

        function pointsOnCatmull(
          coords,
          divisions
        ) {
          const curve =
            new THREE.CatmullRomCurve3(
              coords.map(
                ([x, y]) =>
                  new THREE.Vector3(
                    x,
                    y,
                    0
                  )
              ),
              false,
              'centripetal'
            );

          return curve
            .getPoints(divisions)
            .map((p) => ({
              x: p.x,
              y: p.y
            }));
        }

        function fillStroke(
          points,
          radius,
          spacing,
          size,
          color
        ) {
          let minX = Infinity;
          let maxX = -Infinity;
          let minY = Infinity;
          let maxY = -Infinity;

          points.forEach((p) => {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
          });

          fillGrid(
            minX - radius,
            maxX + radius,
            minY - radius,
            maxY + radius,
            spacing,
            size,
            color,
            (x, y) => {
              let nearest = Infinity;

              points.forEach((p) => {
                const dx = x - p.x;
                const dy = y - p.y;

                nearest =
                  Math.min(
                    nearest,
                    dx * dx +
                    dy * dy
                  );
              });

              return (
                nearest <=
                radius * radius
              );
            }
          );
        }

        function fillVariableStroke(
          points,
          radiusFunction,
          spacing,
          size,
          color
        ) {
          let minX = Infinity;
          let maxX = -Infinity;
          let minY = Infinity;
          let maxY = -Infinity;
          let maxRadius = 0;

          points.forEach((p, i) => {
            const t =
              points.length > 1
                ? i / (points.length - 1)
                : 0;

            const radius =
              radiusFunction(t);

            maxRadius =
              Math.max(
                maxRadius,
                radius
              );

            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
          });

          fillGrid(
            minX - maxRadius,
            maxX + maxRadius,
            minY - maxRadius,
            maxY + maxRadius,
            spacing,
            size,
            color,
            (x, y) => {
              let inside = false;

              for (
                let i = 0;
                i < points.length;
                i++
              ) {
                const p =
                  points[i];

                const t =
                  points.length > 1
                    ? i / (points.length - 1)
                    : 0;

                const radius =
                  radiusFunction(t);

                const dx =
                  x - p.x;

                const dy =
                  y - p.y;

                if (
                  dx * dx +
                  dy * dy <=
                  radius * radius
                ) {
                  inside = true;
                  break;
                }
              }

              return inside;
            }
          );
        }

        /* =====================================================
           REFERENCE FRAME
        ===================================================== */

        roundedRect(
          0,
          0,
          10.45,
          5.55,
          1.02,
          SMALL_BLOCK_SIZE
        );

        roundedRect(
          -0.05,
          -0.01,
          9.58,
          4.72,
          0.84,
          SMALL_BLOCK_SIZE
        );

        /* =====================================================
           CENTER DIVIDER
        ===================================================== */

        drawLine(
          0.06,
          2.48,
          0.06,
          -2.05,
          0.145,
          SMALL_BLOCK_SIZE
        );

        drawLine(
          1.18,
          2.48,
          1.18,
          -2.05,
          0.145,
          SMALL_BLOCK_SIZE
        );

        drawCurve(
          (t) => {
            const a =
              Math.PI -
              Math.PI * t;

            return {
              x:
                0.62 +
                Math.cos(a) *
                0.56,

              y:
                2.48 +
                Math.sin(a) *
                0.32
            };
          },
          7,
          SMALL_BLOCK_SIZE
        );

        /* =====================================================
           BOTTOM EYE
        ===================================================== */

        drawCurve(
          (t) => {
            const a =
              t *
              Math.PI *
              2;

            return {
              x:
                0.62 +
                Math.cos(a) *
                0.64,

              y:
                -2.38 +
                Math.sin(a) *
                0.45
            };
          },
          21,
          SMALL_BLOCK_SIZE
        );

        fillEllipse(
          0.62,
          -2.38,
          0.31,
          0.15,
          0.14,
          LARGE_BLOCK_SIZE,
          lightColor
        );

        fillEllipse(
          0.62,
          -2.38,
          0.07,
          0.115,
          0.105,
          LARGE_BLOCK_SIZE,
          null
        );

        /* =====================================================
           THREE LEFT-SIDE FISH
        ===================================================== */

        function makeLeftFish(centerY) {
          const snoutX = -4.25;
          const backX = 0.10;

          drawCurve(
            (t) => {
              const x =
                snoutX +
                (
                  backX -
                  snoutX
                ) *
                t;

              const arch =
                Math.sin(
                  t *
                  Math.PI
                );

              return {
                x,
                y:
                  centerY +
                  arch *
                  0.71
              };
            },
            18,
            SMALL_BLOCK_SIZE
          );

          drawCurve(
            (t) => {
              const x =
                snoutX +
                (
                  backX -
                  snoutX
                ) *
                t;

              const arch =
                Math.sin(
                  t *
                  Math.PI
                );

              return {
                x,
                y:
                  centerY -
                  arch *
                  0.71
              };
            },
            18,
            SMALL_BLOCK_SIZE
          );

          drawCurve(
            (t) => {
              const a =
                Math.PI / 2 -
                t *
                Math.PI;

              return {
                x:
                  backX -
                  0.26 +
                  Math.cos(a) *
                  0.26,

                y:
                  centerY +
                  Math.sin(a) *
                  0.59
              };
            },
            10,
            SMALL_BLOCK_SIZE
          );

          // Inner chevron.
          drawLine(
            -2.25,
            centerY + 0.59,
            -1.98,
            centerY + 0.34,
            0.115,
            SMALL_BLOCK_SIZE
          );

          drawLine(
            -1.98,
            centerY + 0.34,
            -1.80,
            centerY,
            0.115,
            SMALL_BLOCK_SIZE
          );

          drawLine(
            -1.80,
            centerY,
            -1.98,
            centerY - 0.34,
            0.115,
            SMALL_BLOCK_SIZE
          );

          drawLine(
            -1.98,
            centerY - 0.34,
            -2.25,
            centerY - 0.59,
            0.115,
            SMALL_BLOCK_SIZE
          );

          /* Filled blue eye. */
          fillEllipse(
            -3.07,
            centerY,
            0.20,
            0.20,
            0.145,
            LARGE_BLOCK_SIZE,
            null
          );

          /* Filled blue/teal fin shape. */
          fillGrid(
            -1.75,
            -0.20,
            centerY - 0.34,
            centerY + 0.34,
            0.15,
            LARGE_BLOCK_SIZE,
            null,
            (x, y) => {
              const cx = -1.02;
              const cy = centerY;

              const nx =
                (x - cx) / 0.76;

              const ny =
                (y - cy) / 0.32;

              if (
                nx * nx +
                ny * ny >
                1
              ) {
                return false;
              }

              if (x > -0.68) {
                const remaining =
                  Math.max(
                    0.02,
                    0.32 *
                    (
                      1 -
                      (
                        x + 0.68
                      ) /
                      0.48
                    )
                  );

                return (
                  Math.abs(
                    y - cy
                  ) <=
                  remaining
                );
              }

              return true;
            }
          );
        }

        makeLeftFish(1.49);
        makeLeftFish(0);
        makeLeftFish(-1.49);

        /* =====================================================
           SMILEY FACE — BUILT FROM LETTER BLOCKS
        ===================================================== */

        const smileCenterX = 3.30;
        const smileCenterY = -0.34;
        const smileRadius = 1.44;

        drawCurve(
          (t) => {
            const a =
              t *
              Math.PI *
              2;

            return {
              x:
                smileCenterX +
                Math.cos(a) *
                smileRadius,

              y:
                smileCenterY +
                Math.sin(a) *
                1.14
            };
          },
          34,
          LARGE_BLOCK_SIZE,
          null,
          false
        );

        fillEllipse(
          smileCenterX - 0.46,
          smileCenterY + 0.22,
          0.17,
          0.17,
          0.13,
          LARGE_BLOCK_SIZE,
          null
        );

        fillEllipse(
          smileCenterX + 0.46,
          smileCenterY + 0.22,
          0.17,
          0.17,
          0.13,
          LARGE_BLOCK_SIZE,
          null
        );

        drawCurve(
          (t) => {
            const startA =
              Math.PI * 0.10;

            const endA =
              Math.PI * 0.90;

            const a =
              startA +
              (
                endA -
                startA
              ) *
              t;

            return {
              x:
                smileCenterX +
                Math.cos(a) *
                0.78,

              y:
                smileCenterY -
                0.18 -
                Math.sin(a) *
                0.48
            };
          },
          20,
          LARGE_BLOCK_SIZE,
          null,
          false
        );

        /* =====================================================
           REGENERATE LETTERS ONLY
           Geometry stays locked to the reference layout.
        ===================================================== */

        function regenerateFish() {
          textMeshes.forEach((mesh) => {
            const letter =
              FISH_TEXT[
                Math.floor(
                  Math.random() *
                  FISH_TEXT.length
                )
              ];

            const color =
              mesh.userData.lockColor ||
              randomColor();

            const material =
              mesh.material.clone();

            material.map =
              makeLetterTexture(
                letter,
                color,
                LETTER_FONT_PX +
                (
                  Math.random() *
                  30 -
                  10
                )
              );

            material.needsUpdate = true;
            mesh.material = material;
          });
        }

        regenerateFish();

        setInterval(
          regenerateFish,
          650
        );

        function resizeFish() {
          const rect =
            fishHost.getBoundingClientRect();

          const width =
            Math.max(
              280,
              rect.width
            );

          const height =
            Math.max(
              210,
              rect.height
            );

          renderer.setSize(
            width,
            height,
            false
          );

          const aspect =
            width / height;

          const viewHeight = 7.6;
          const viewWidth =
            viewHeight *
            aspect;

          camera.left =
            -viewWidth / 2;

          camera.right =
            viewWidth / 2;

          camera.top =
            viewHeight / 2;

          camera.bottom =
            -viewHeight / 2;

          camera.updateProjectionMatrix();
        }

        const resizeObserver =
          new ResizeObserver(
            resizeFish
          );

        resizeObserver.observe(
          fishHost
        );

        resizeFish();

        function animateFish() {
          requestAnimationFrame(
            animateFish
          );

          fishGroup.rotation.set(
            0,
            0,
            0
          );

          renderer.render(
            scene,
            camera
          );
        }

        animateFish();

      } catch (error) {
        console.error(
          '3D text fish failed to load:',
          error
        );

        fishHost.textContent =
          '3D fish unavailable';
      }
    })();
  }

})();