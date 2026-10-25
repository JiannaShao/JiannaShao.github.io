(() => {
  /* Sidebar behaviour lives in site-chrome.js */

  // The four project pages do not exist yet, so keep those labels clickable
  // without navigating away or jumping to the top of the page.
  document.querySelectorAll('[data-placeholder-project]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
    });
  });

  /* Scroll snake lives in site-chrome.js */

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
     HERO POSTCARD
     A thin card (box) with the front painting on one face
     and the back of the postcard on the other. Spins slowly
     on its own; drag left/right to turn it, and it coasts
     back into the slow spin after you let go.
  ===================================================== */
  const postcardHost = document.getElementById('hero-postcard');

  if (postcardHost) {
    (async () => {
      try {
        const THREE = await import(
          'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js'
        );

        const FRONT_SRC = 'Postcard/postcard-front.jpg';
        const BACK_SRC = 'Postcard/2.png';
        const EDGE_COLOR = 0xf8f7f5;          // card-stock colour sampled from the images
        const CARD_W = 1.6;                   // card is 1650 x 1275 (≈ 1.294 : 1)
        const CARD_H = CARD_W * (1275 / 1650);
        const CARD_D = 0.018;                 // very thin

        const AUTO_SPEED = 0.35;              // radians per second (slow spin)
        const DRAG_SENS = 0.0105;             // radians per pixel dragged
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // ---- scene ----
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 80);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        // ---- textures ----
        const loader = new THREE.TextureLoader();
        const loadTex = (src) => new Promise((resolve, reject) => {
          loader.load(src, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            resolve(tex);
          }, undefined, reject);
        });
        const [frontTex, backTex] = await Promise.all([loadTex(FRONT_SRC), loadTex(BACK_SRC)]);

        // ---- card ----
        // Faces show the artwork in true colour; the thin edges are lit so
        // the card reads as a physical object while it turns.
        const edgeMat = new THREE.MeshLambertMaterial({ color: EDGE_COLOR });
        const frontMat = new THREE.MeshBasicMaterial({ map: frontTex });
        const backMat = new THREE.MeshBasicMaterial({ map: backTex });

        // BoxGeometry face order: +x, -x, +y, -y, +z (front), -z (back)
        const card = new THREE.Mesh(
          new THREE.BoxGeometry(CARD_W, CARD_H, CARD_D),
          [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat]
        );
        card.rotation.x = -0.06;             // tiny tilt so the edge catches light
        scene.add(card);

        scene.add(new THREE.AmbientLight(0xffffff, 1.6));
        const sun = new THREE.DirectionalLight(0xffffff, 1.4);
        sun.position.set(2, 3, 4);
        scene.add(sun);

        postcardHost.appendChild(renderer.domElement);
        postcardHost.classList.add('is-3d');

        // ---- fit the card to whatever size the header gives us ----
        function resizePostcard() {
          const rect = postcardHost.getBoundingClientRect();
          const width = Math.max(1, rect.width);
          const height = Math.max(1, rect.height);
          renderer.setSize(width, height, false);

          const aspect = width / height;
          camera.aspect = aspect;

          // Distance at which the card (plus margin for perspective while
          // turning) fits both the width and the height of the box.
          const margin = 1.16;
          const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
          const distForHeight = (CARD_H * margin / 2) / Math.tan(halfFov);
          const distForWidth = (CARD_W * margin / 2) / (Math.tan(halfFov) * aspect);
          camera.position.set(0, 0, Math.max(distForHeight, distForWidth) + CARD_D);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
        }
        new ResizeObserver(resizePostcard).observe(postcardHost);
        resizePostcard();

        // ---- drag to turn (left/right only) ----
        let angle = 0;
        let velocity = reduceMotion ? 0 : AUTO_SPEED;   // radians per second
        let dragging = false;
        let lastX = 0;
        let lastT = 0;
        let dragVel = 0;

        postcardHost.addEventListener('pointerdown', (e) => {
          dragging = true;
          lastX = e.clientX;
          lastT = performance.now();
          dragVel = 0;
          postcardHost.classList.add('is-dragging');
          postcardHost.setPointerCapture(e.pointerId);
        });

        postcardHost.addEventListener('pointermove', (e) => {
          if (!dragging) return;
          const now = performance.now();
          const dx = e.clientX - lastX;
          const dt = Math.max(1, now - lastT) / 1000;
          angle += dx * DRAG_SENS;
          // smoothed drag speed, used for the coast after release
          dragVel = dragVel * 0.6 + (dx * DRAG_SENS / dt) * 0.4;
          lastX = e.clientX;
          lastT = now;
        });

        const endDrag = () => {
          if (!dragging) return;
          dragging = false;
          postcardHost.classList.remove('is-dragging');
          // ignore stale speed if the pointer paused before letting go
          const idle = (performance.now() - lastT) / 1000;
          velocity = idle > 0.12 ? 0 : THREE.MathUtils.clamp(dragVel, -9, 9);
        };
        postcardHost.addEventListener('pointerup', endDrag);
        postcardHost.addEventListener('pointercancel', endDrag);
        postcardHost.addEventListener('lostpointercapture', endDrag);

        // ---- animate ----
        let visible = true;
        new IntersectionObserver((entries) => {
          visible = entries[0].isIntersecting;
        }).observe(postcardHost);

        const clock = new THREE.Clock();
        const target = reduceMotion ? 0 : AUTO_SPEED;

        function animatePostcard() {
          requestAnimationFrame(animatePostcard);
          const dt = Math.min(clock.getDelta(), 0.05);
          if (!visible) return;

          if (!dragging) {
            // coast: ease the release speed back to the slow auto-spin
            // (keeps the direction the person flicked it)
            const dir = Math.sign(velocity) || 1;
            const goal = target * dir;
            velocity += (goal - velocity) * (1 - Math.exp(-dt * 1.6));
            angle += velocity * dt;
          }

          card.rotation.y = angle;
          renderer.render(scene, camera);
        }
        animatePostcard();

      } catch (error) {
        // The plain image stays visible if 3D can't load.
        console.error('Postcard 3D failed to load:', error);
      }
    })();
  }

})();