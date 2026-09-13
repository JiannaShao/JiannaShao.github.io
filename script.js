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
     SIDE-VIEW TEXT FISH — REFERENCE LAYOUT
     Four text-block depth layers, orthographic side view,
     smaller letter blocks, real J/S text, no O bubbles.
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

        // Orthographic camera = true side view with no perspective angle.
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

        // Lock the whole construction into a perfect side view.
        fishGroup.rotation.set(0, 0, 0);
        fishGroup.position.set(0, 0, 0);

        scene.add(fishGroup);

        const FISH_TEXT = 'SWIMEAT';

        // Existing fish palette retained.
        const frontColor = '#85a4ab';
        const sideColor = '#48666d';
        const darkEdgeColor = '#2f484f';
        const navyColor = '#14253d';
        const lightColor = '#e1ebe7';

        // Both sizes are smaller than the previous fish's text blocks.
        // Outline/reference-red areas use SMALL.
        // Eye/fin/reference-blue areas use LARGE.
        const SMALL_BLOCK_SIZE = 0.125;
        const LARGE_BLOCK_SIZE = 0.175;

        // Exactly four depth layers.
        const TEXT_LAYERS = [
          -0.18,
          -0.06,
          0.06,
          0.18
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

          const canvas = document.createElement('canvas');

          canvas.width = 128;
          canvas.height = 128;

          const ctx = canvas.getContext('2d');

          ctx.clearRect(0, 0, 128, 128);

          ctx.font = '700 90px Georgia, serif';
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

        // Reuse geometry instead of generating a new box for every character.
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
          rotation = 0
        ) {
          const letter = nextLetter();

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

          // Only Z rotation is used to trace the flat silhouette.
          // No X/Y tilt is added.
          mesh.rotation.set(
            0,
            0,
            rotation
          );

          fishGroup.add(mesh);

          textMeshes.push(mesh);
        }

        function addLayeredBlock(
          x,
          y,
          size,
          color = null,
          rotation = 0
        ) {
          TEXT_LAYERS.forEach((z) => {
            addTextBlock(
              x,
              y,
              size,
              z,
              color,
              rotation
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
          color = null
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
            const t =
              i / count;

            addLayeredBlock(
              x1 + dx * t,
              y1 + dy * t,
              size,
              color,
              angle
            );
          }
        }

        function makeCurve(
          pointFunction,
          steps,
          size,
          color = null
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
              angle
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

        /* =====================================================
           OUTER + INNER FRAME
        ===================================================== */

        makeRoundedRectangle(
          0,
          0,
          10.65,
          5.72,
          1.05,
          SMALL_BLOCK_SIZE
        );

        makeRoundedRectangle(
          -0.08,
          -0.01,
          9.73,
          4.85,
          0.88,
          SMALL_BLOCK_SIZE
        );

        /* =====================================================
           CENTRAL DIVIDER
        ===================================================== */

        makeLine(
          0.36,
          2.60,
          0.36,
          -2.15,
          0.15,
          SMALL_BLOCK_SIZE
        );

        makeLine(
          0.99,
          2.60,
          0.99,
          -2.15,
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
                0.675 +
                Math.cos(angle) *
                0.315,

              y:
                2.60 +
                Math.sin(angle) *
                0.315
            };
          },
          7,
          SMALL_BLOCK_SIZE
        );

        /* =====================================================
           BOTTOM OVAL / EYE DETAIL
        ===================================================== */

        makeCurve(
          (t) => {
            const angle =
              t *
              Math.PI *
              2;

            return {
              x:
                0.675 +
                Math.cos(angle) *
                0.66,

              y:
                -2.49 +
                Math.sin(angle) *
                0.47
            };
          },
          22,
          SMALL_BLOCK_SIZE
        );

        makeCurve(
          (t) => {
            const angle =
              t *
              Math.PI *
              2;

            return {
              x:
                0.675 +
                Math.cos(angle) *
                0.33,

              y:
                -2.49 +
                Math.sin(angle) *
                0.17
            };
          },
          13,
          LARGE_BLOCK_SIZE,
          lightColor
        );

        makeLine(
          0.675,
          -2.60,
          0.675,
          -2.38,
          0.07,
          LARGE_BLOCK_SIZE,
          navyColor
        );

        /* =====================================================
           THREE STACKED FISH
        ===================================================== */

        function buildSmallFish(centerY) {
          const snoutX = -4.38;
          const rearX = -0.15;

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
                  0.76
              };
            },
            19,
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
                  0.76
              };
            },
            19,
            SMALL_BLOCK_SIZE
          );

          // Rounded rear edge.
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
                  0.63
              };
            },
            10,
            SMALL_BLOCK_SIZE
          );

          // Gill / chevron.
          makeLine(
            -2.34,
            centerY + 0.65,
            -2.07,
            centerY + 0.38,
            0.12,
            SMALL_BLOCK_SIZE
          );

          makeLine(
            -2.07,
            centerY + 0.38,
            -1.89,
            centerY,
            0.12,
            SMALL_BLOCK_SIZE
          );

          makeLine(
            -1.89,
            centerY,
            -2.07,
            centerY - 0.38,
            0.12,
            SMALL_BLOCK_SIZE
          );

          makeLine(
            -2.07,
            centerY - 0.38,
            -2.34,
            centerY - 0.65,
            0.12,
            SMALL_BLOCK_SIZE
          );

          // Eye: larger blocks.
          makeCurve(
            (t) => {
              const angle =
                t *
                Math.PI *
                2;

              return {
                x:
                  -3.13 +
                  Math.cos(angle) *
                  0.17,

                y:
                  centerY +
                  Math.sin(angle) *
                  0.17
              };
            },
            10,
            LARGE_BLOCK_SIZE,
            navyColor
          );

          // Reference-blue fin/teardrop: larger blocks.
          makeCurve(
            (t) => {
              const angle =
                t *
                Math.PI *
                2;

              const cos =
                Math.cos(angle);

              let x =
                -1.05 +
                cos *
                0.72;

              if (cos > 0) {
                x +=
                  cos *
                  0.17;
              }

              return {
                x,
                y:
                  centerY +
                  Math.sin(angle) *
                  0.33
              };
            },
            17,
            LARGE_BLOCK_SIZE,
            frontColor
          );
        }

        buildSmallFish(1.57);
        buildSmallFish(0);
        buildSmallFish(-1.57);

        /* =====================================================
           ACTUAL J + S TEXT
           Real DOM letters, not block-built glyphs.
        ===================================================== */

        function makeAhsingLetter(
          letter,
          className,
          left,
          top,
          fontSize
        ) {
          const el =
            document.createElement('div');

          el.className =
            `fish-ahsing-letter ${className}`;

          el.textContent =
            letter;

          Object.assign(
            el.style,
            {
              position: 'absolute',
              zIndex: '20',
              left,
              top,
              transform:
                'translate(-50%, -50%)',
              fontFamily:
                "'Ahsing', 'DM Serif Display', Georgia, serif",
              fontSize,
              fontWeight: '400',
              lineHeight: '0.78',
              color: '#222222',
              pointerEvents: 'none',
              userSelect: 'none',
              whiteSpace: 'nowrap'
            }
          );

          fishHost.appendChild(el);

          return el;
        }

        const jLetter =
          makeAhsingLetter(
            'J',
            'fish-ahsing-j',
            '75%',
            '36%',
            '128px'
          );

        const sLetter =
          makeAhsingLetter(
            'S',
            'fish-ahsing-s',
            '78%',
            '66%',
            '142px'
          );

        // Ask the browser to resolve Ahsing if the site already loads it.
        if (
          document.fonts &&
          document.fonts.load
        ) {
          document.fonts
            .load("128px Ahsing")
            .catch(() => {});
        }

        /* =====================================================
           LETTER / COLOR REGENERATION
           Geometry never changes, so the layout remains stable.
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
            7.25;

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

          // Scale the real letters with the fish viewport.
          if (width < 500) {
            jLetter.style.fontSize =
              '88px';

            sLetter.style.fontSize =
              '98px';
          } else if (width < 650) {
            jLetter.style.fontSize =
              '106px';

            sLetter.style.fontSize =
              '118px';
          } else {
            jLetter.style.fontSize =
              '128px';

            sLetter.style.fontSize =
              '142px';
          }
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
           RENDER
           No camera/fish rotation: permanent perfect side view.
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