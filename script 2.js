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
     SIDE-VIEW TEXT FISH — REFERENCE LAYOUT V2
     - slightly smaller
     - shifted right
     - less wide
     - filled blue details
     - filled J + S made from text blocks
     - exactly four depth layers
     - each deeper layer sits ~2px lower
     - no floating O bubbles
  ===================================================== */
  const fishHost = document.getElementById('text-fish-3d');

  if (fishHost) {
    (async () => {
      try {
        const THREE = await import(
          'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js'
        );

        fishHost.innerHTML = '';
        fishHost.style.position = 'relative';
        fishHost.style.overflow = 'visible';

        const scene = new THREE.Scene();

        /* Perfect orthographic side view. */
        const camera = new THREE.OrthographicCamera(
          -6.4,
          6.4,
          3.75,
          -3.75,
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
          Smaller overall, less wide, and shifted slightly right.
          X is compressed more than Y to better match the reference.
        */
        fishGroup.scale.set(
          0.82,
          0.90,
          1
        );

        fishGroup.position.set(
          0.62,
          0,
          0
        );

        fishGroup.rotation.set(
          0,
          0,
          0
        );

        scene.add(fishGroup);

        const FISH_TEXT = 'SWIMEAT';

        /* Existing palette retained. */
        const frontColor = '#85a4ab';
        const sideColor = '#48666d';
        const darkEdgeColor = '#2f484f';
        const navyColor = '#14253d';
        const lightColor = '#e1ebe7';

        /*
          Blocks themselves stay compact, but the letters inside
          each block are now larger.
        */
        const SMALL_BLOCK_SIZE = 0.135;
        const LARGE_BLOCK_SIZE = 0.185;

        /*
          Exactly four layers.
          Camera is on +Z, so +0.18 is the front layer.
          Every deeper layer sits roughly 2 screen pixels lower.
        */
        const TEXT_LAYERS = [
          {
            z: 0.18,
            yOffset: 0
          },
          {
            z: 0.06,
            yOffset: -0.038
          },
          {
            z: -0.06,
            yOffset: -0.076
          },
          {
            z: -0.18,
            yOffset: -0.114
          }
        ];

        let letterIndex = 0;

        function nextLetter() {
          const letter =
            FISH_TEXT[
              letterIndex %
              FISH_TEXT.length
            ];

          letterIndex++;
          return letter;
        }

        function rand(min, max) {
          return min + Math.random() * (max - min);
        }

        const textureCache = new Map();

        function makeLetterTexture(letter, color) {
          const key = `${letter}-${color}`;

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

          /*
            Previous version used 90px.
            This is 10px larger.
          */
          ctx.font =
            '700 100px Georgia, serif';

          ctx.textAlign =
            'center';

          ctx.textBaseline =
            'middle';

          ctx.fillStyle =
            color;

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

        function randomFishColor() {
          const roll = Math.random();

          if (roll < 0.34) {
            return frontColor;
          }

          if (roll < 0.60) {
            return sideColor;
          }

          if (roll < 0.80) {
            return darkEdgeColor;
          }

          if (roll < 0.92) {
            return navyColor;
          }

          return lightColor;
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

        function addTextBlock(
          x,
          y,
          size,
          z,
          color = null,
          rotation = 0,
          lockColor = false
        ) {
          const letter =
            nextLetter();

          const resolvedColor =
            color ||
            randomFishColor();

          const material =
            new THREE.MeshBasicMaterial({
              map: makeLetterTexture(
                letter,
                resolvedColor
              ),
              transparent: true,
              depthWrite: true,
              side: THREE.DoubleSide
            });

          const geometry =
            size === LARGE_BLOCK_SIZE
              ? largeGeometry
              : smallGeometry;

          const mesh =
            new THREE.Mesh(
              geometry,
              material
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

          mesh.userData.lockedColor =
            lockColor
              ? resolvedColor
              : null;

          fishGroup.add(mesh);
          textMeshes.push(mesh);
        }

        function addLayeredBlock(
          x,
          y,
          size,
          color = null,
          rotation = 0,
          lockColor = false
        ) {
          TEXT_LAYERS.forEach((layer) => {
            addTextBlock(
              x,
              y + layer.yOffset,
              size,
              layer.z,
              color,
              rotation,
              lockColor
            );
          });
        }

        function makeLine(
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

          const count =
            Math.max(
              1,
              Math.ceil(
                distance /
                spacing
              )
            );

          const angle =
            Math.atan2(
              dy,
              dx
            );

          for (
            let i = 0;
            i <= count;
            i++
          ) {
            const t = i / count;

            addLayeredBlock(
              x1 + dx * t,
              y1 + dy * t,
              size,
              color,
              angle,
              lockColor
            );
          }
        }

        function makeCurve(
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

            const point =
              pointFunction(t);

            const next =
              pointFunction(
                Math.min(
                  1,
                  t + 0.01
                )
              );

            const angle =
              Math.atan2(
                next.y - point.y,
                next.x - point.x
              );

            addLayeredBlock(
              point.x,
              point.y,
              size,
              color,
              angle,
              lockColor
            );
          }
        }

        function makeRoundedRectangle(
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

          makeLine(
            left + radius,
            top,
            right - radius,
            top,
            0.18,
            size
          );

          makeLine(
            right,
            top - radius,
            right,
            bottom + radius,
            0.18,
            size
          );

          makeLine(
            right - radius,
            bottom,
            left + radius,
            bottom,
            0.18,
            size
          );

          makeLine(
            left,
            bottom + radius,
            left,
            top - radius,
            0.18,
            size
          );

          const corners = [
            {
              cx: right - radius,
              cy: top - radius,
              start: 0,
              end: Math.PI / 2
            },
            {
              cx: left + radius,
              cy: top - radius,
              start: Math.PI / 2,
              end: Math.PI
            },
            {
              cx: left + radius,
              cy: bottom + radius,
              start: Math.PI,
              end: Math.PI * 1.5
            },
            {
              cx: right - radius,
              cy: bottom + radius,
              start: Math.PI * 1.5,
              end: Math.PI * 2
            }
          ];

          corners.forEach((corner) => {
            makeCurve(
              (t) => {
                const angle =
                  corner.start +
                  (
                    corner.end -
                    corner.start
                  ) *
                  t;

                return {
                  x:
                    corner.cx +
                    Math.cos(angle) *
                    radius,

                  y:
                    corner.cy +
                    Math.sin(angle) *
                    radius
                };
              },
              6,
              size
            );
          });
        }

        function fillShapeGrid(
          minX,
          maxX,
          minY,
          maxY,
          spacing,
          size,
          color,
          containsPoint
        ) {
          let row = 0;

          for (
            let y = minY;
            y <= maxY;
            y += spacing
          ) {
            const stagger =
              row % 2 === 0
                ? 0
                : spacing * 0.5;

            for (
              let x = minX + stagger;
              x <= maxX;
              x += spacing
            ) {
              if (
                containsPoint(
                  x,
                  y
                )
              ) {
                addLayeredBlock(
                  x,
                  y,
                  size,
                  color,
                  0,
                  true
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
          fillShapeGrid(
            cx - rx,
            cx + rx,
            cy - ry,
            cy + ry,
            spacing,
            size,
            color,
            (x, y) => {
              const nx =
                (x - cx) /
                rx;

              const ny =
                (y - cy) /
                ry;

              return (
                nx * nx +
                ny * ny
              ) <= 1;
            }
          );
        }

        /*
          Filled thick stroke helper.
          Used for the block-built J and S.
        */
        function fillStroke(
          samples,
          radius,
          spacing,
          size,
          color
        ) {
          let minX = Infinity;
          let maxX = -Infinity;
          let minY = Infinity;
          let maxY = -Infinity;

          samples.forEach((p) => {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
          });

          fillShapeGrid(
            minX - radius,
            maxX + radius,
            minY - radius,
            maxY + radius,
            spacing,
            size,
            color,
            (x, y) => {
              let best =
                Infinity;

              for (
                const point of samples
              ) {
                const dx =
                  x - point.x;

                const dy =
                  y - point.y;

                const d =
                  dx * dx +
                  dy * dy;

                if (d < best) {
                  best = d;
                }
              }

              return (
                best <=
                radius * radius
              );
            }
          );
        }

        function sampleCatmullRom(
          points,
          divisions
        ) {
          const curve =
            new THREE.CatmullRomCurve3(
              points.map(
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

        /* =====================================================
           OUTER + INNER FRAME
        ===================================================== */

        makeRoundedRectangle(
          0,
          0,
          10.55,
          5.65,
          1.05,
          SMALL_BLOCK_SIZE
        );

        makeRoundedRectangle(
          -0.07,
          -0.02,
          9.70,
          4.82,
          0.88,
          SMALL_BLOCK_SIZE
        );

        /* =====================================================
           CENTRAL DIVIDER
        ===================================================== */

        makeLine(
          0.34,
          2.55,
          0.34,
          -2.13,
          0.15,
          SMALL_BLOCK_SIZE
        );

        makeLine(
          0.98,
          2.55,
          0.98,
          -2.13,
          0.15,
          SMALL_BLOCK_SIZE
        );

        makeCurve(
          (t) => {
            const angle =
              Math.PI -
              Math.PI * t;

            return {
              x:
                0.66 +
                Math.cos(angle) *
                0.32,

              y:
                2.55 +
                Math.sin(angle) *
                0.32
            };
          },
          7,
          SMALL_BLOCK_SIZE
        );

        /* =====================================================
           BOTTOM EYE DETAIL
        ===================================================== */

        makeCurve(
          (t) => {
            const angle =
              t *
              Math.PI *
              2;

            return {
              x:
                0.66 +
                Math.cos(angle) *
                0.65,

              y:
                -2.46 +
                Math.sin(angle) *
                0.46
            };
          },
          21,
          SMALL_BLOCK_SIZE
        );

        fillEllipse(
          0.66,
          -2.46,
          0.32,
          0.16,
          0.15,
          LARGE_BLOCK_SIZE,
          lightColor
        );

        fillEllipse(
          0.66,
          -2.46,
          0.075,
          0.12,
          0.11,
          LARGE_BLOCK_SIZE,
          navyColor
        );

        /* =====================================================
           THREE STACKED FISH
        ===================================================== */

        function buildSmallFish(centerY) {
          const snoutX = -4.36;
          const rearX = -0.12;

          makeCurve(
            (t) => {
              const x =
                snoutX +
                (
                  rearX -
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
                  0.74
              };
            },
            18,
            SMALL_BLOCK_SIZE
          );

          makeCurve(
            (t) => {
              const x =
                snoutX +
                (
                  rearX -
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
                  0.74
              };
            },
            18,
            SMALL_BLOCK_SIZE
          );

          makeCurve(
            (t) => {
              const angle =
                Math.PI / 2 -
                t *
                Math.PI;

              return {
                x:
                  rearX -
                  0.27 +
                  Math.cos(angle) *
                  0.27,

                y:
                  centerY +
                  Math.sin(angle) *
                  0.61
              };
            },
            10,
            SMALL_BLOCK_SIZE
          );

          /*
            Gill/chevron follows the supplied layout.
          */
          makeLine(
            -2.31,
            centerY + 0.63,
            -2.02,
            centerY + 0.36,
            0.12,
            SMALL_BLOCK_SIZE
          );

          makeLine(
            -2.02,
            centerY + 0.36,
            -1.84,
            centerY,
            0.12,
            SMALL_BLOCK_SIZE
          );

          makeLine(
            -1.84,
            centerY,
            -2.02,
            centerY - 0.36,
            0.12,
            SMALL_BLOCK_SIZE
          );

          makeLine(
            -2.02,
            centerY - 0.36,
            -2.31,
            centerY - 0.63,
            0.12,
            SMALL_BLOCK_SIZE
          );

          /*
            FILLED eye — larger blocks.
          */
          fillEllipse(
            -3.12,
            centerY,
            0.20,
            0.20,
            0.15,
            LARGE_BLOCK_SIZE,
            navyColor
          );

          /*
            FILLED blue/teal teardrop shape.
            A filled ellipse is clipped toward the right into a point.
          */
          fillShapeGrid(
            -1.82,
            -0.23,
            centerY - 0.38,
            centerY + 0.38,
            0.16,
            LARGE_BLOCK_SIZE,
            frontColor,
            (x, y) => {
              const cx = -1.05;
              const cy = centerY;

              const nx =
                (x - cx) /
                0.78;

              const ny =
                (y - cy) /
                0.35;

              const insideEllipse =
                (
                  nx * nx +
                  ny * ny
                ) <= 1;

              if (!insideEllipse) {
                return false;
              }

              /*
                Slightly sharpen the right side to echo the reference.
              */
              if (x > -0.72) {
                const allowable =
                  0.35 *
                  (
                    1 -
                    (
                      x + 0.72
                    ) /
                    0.49
                  );

                return (
                  Math.abs(
                    y - cy
                  ) <=
                  Math.max(
                    0.03,
                    allowable
                  )
                );
              }

              return true;
            }
          );
        }

        buildSmallFish(1.55);
        buildSmallFish(0);
        buildSmallFish(-1.55);

        /* =====================================================
           FILLED J + S BUILT FROM TEXT BLOCKS
        ===================================================== */

        /*
          J: straight upper stem with a rounded hooked bottom.
        */
        const jStem = [];

        for (
          let i = 0;
          i <= 24;
          i++
        ) {
          const t =
            i / 24;

          jStem.push({
            x: 3.08,
            y:
              2.00 -
              t *
              1.42
          });
        }

        const jHook =
          sampleCatmullRom(
            [
              [3.08, 0.60],
              [3.02, 0.24],
              [2.70, 0.05],
              [2.28, 0.12],
              [2.02, 0.38]
            ],
            42
          );

        fillStroke(
          [
            ...jStem,
            ...jHook
          ],
          0.28,
          0.145,
          SMALL_BLOCK_SIZE,
          darkEdgeColor
        );

        /*
          S: filled serpentine block letter.
          This stays inside the right compartment like the reference.
        */
        const sPath =
          sampleCatmullRom(
            [
              [3.92, -0.18],
              [3.63, 0.03],
              [3.10, -0.02],
              [2.62, -0.38],
              [2.75, -0.72],
              [3.43, -0.86],
              [3.82, -1.17],
              [3.70, -1.50],
              [3.14, -1.62],
              [2.68, -1.42]
            ],
            74
          );

        fillStroke(
          sPath,
          0.27,
          0.145,
          SMALL_BLOCK_SIZE,
          darkEdgeColor
        );

        /* =====================================================
           LETTER REGENERATION
           Locked-color shapes keep their intended category color.
        ===================================================== */

        function regenerateFishVisual() {
          textMeshes.forEach((mesh) => {
            const newLetter =
              FISH_TEXT[
                Math.floor(
                  Math.random() *
                  FISH_TEXT.length
                )
              ];

            const newColor =
              mesh.userData.lockedColor ||
              randomFishColor();

            const nextMaterial =
              mesh.material.clone();

            nextMaterial.map =
              makeLetterTexture(
                newLetter,
                newColor
              );

            nextMaterial.needsUpdate =
              true;

            mesh.material =
              nextMaterial;
          });
        }

        regenerateFishVisual();

        setInterval(
          regenerateFishVisual,
          650
        );

        /* =====================================================
           RESPONSIVE RESIZE
        ===================================================== */

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
            width /
            height;

          const viewHeight =
            7.45;

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

        /* =====================================================
           RENDER — permanent perfect side view
        ===================================================== */

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