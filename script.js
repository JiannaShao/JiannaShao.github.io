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
     Starts sealed in an envelope that gives a small shake
     every few seconds. Click / tap (or Enter) to open: the
     flap lifts, the card jumps out, the envelope drops away,
     and the card spins slowly. Drag left/right to turn it;
     it coasts back into the slow spin after you let go.
  ===================================================== */
  const postcardHost = document.getElementById('hero-postcard');

  if (postcardHost) {
    (async () => {
      try {
        const THREE = await import(
          'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js'
        );

        const wrap = postcardHost.closest('.hero-postcard-wrap') || postcardHost;
        const FRONT_SRC = 'Postcard/postcard-front.jpg';
        const BACK_SRC = 'Postcard/2.png';
        const CREAM = 0xf8f7f5;               // envelope paper
        const CARD_EDGE = 0xeae8e2;           // postcard stock, sampled from the new card images
        const NAVY = '#14253d';

        const CARD_W = 1.6;                   // card is 1650 x 1275
        const CARD_H = CARD_W * (1275 / 1650);
        const CARD_D = 0.018;

        // Envelope is a little larger than the card so it fits inside.
        const ENV_W = CARD_W * 1.36;           // wider envelope
        const ENV_H = ENV_W * (1275 / 1650);   // same proportions as the postcard
        const ENV_D = 0.06;
        // Phones have less room above the box (the name sits right on top), so the
        // envelope starts a little smaller and lower there; the card still rises fully out.
        const PHONE = window.matchMedia('(max-width: 800px)').matches;
        const ENV_SCALE = PHONE ? 0.6 : 0.7;   // envelope + card start smaller...
        const ENV_Y = PHONE ? -0.36 : -0.12;   // ...and low, so the card can rise out in frame

        const AUTO_SPEED = 0.35;              // radians per second
        const DRAG_SENS = 0.0105;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // ---- scene ----
        const scene = new THREE.Scene();
        const BASE_FOV = 22;
        const camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.1, 80);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        scene.add(new THREE.AmbientLight(0xffffff, 1.6));
        const sun = new THREE.DirectionalLight(0xffffff, 1.4);
        sun.position.set(2, 3, 4);
        scene.add(sun);

        // ---- textures ----
        const loader = new THREE.TextureLoader();
        const loadTex = (src) => new Promise((resolve, reject) => {
          loader.load(src, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            resolve(tex);
          }, undefined, reject);
        });
        const canvasTex = (w, h, draw) => {
          const c = document.createElement('canvas');
          c.width = w; c.height = h;
          draw(c.getContext('2d'), w, h);
          const t = new THREE.CanvasTexture(c);
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = renderer.capabilities.getMaxAnisotropy();
          return t;
        };
        const [frontTex, backTex, stampTex] = await Promise.all([
          loadTex(FRONT_SRC), loadTex(BACK_SRC), loadTex('Postcard/EnvelopeStamp.png')
        ]);

        // ---- postcard ----
        const edgeMat = new THREE.MeshLambertMaterial({ color: CARD_EDGE });
        const card = new THREE.Mesh(
          new THREE.BoxGeometry(CARD_W, CARD_H, CARD_D),
          [edgeMat, edgeMat, edgeMat, edgeMat,
           new THREE.MeshBasicMaterial({ map: frontTex }),
           new THREE.MeshBasicMaterial({ map: backTex })]
        );
        scene.add(card);

        // ---- envelope ----
        const env = new THREE.Group();
        const fadeMats = [];
        // Unlit materials keep the paper a true cream instead of greying it.
        const mat = (opts) => {
          const m = new THREE.MeshBasicMaterial({ transparent: true, ...opts });
          fadeMats.push(m);
          return m;
        };

        // Flap side faces the viewer: faint fold lines of the side and bottom flaps.
        const panelTex = canvasTex(2048, Math.round(2048 * ENV_H / ENV_W), (g, w, h) => {
          g.fillStyle = '#f8f7f5'; g.fillRect(0, 0, w, h);
          const cx = w / 2, cy = h * 0.56;
          // bottom pocket: a soft gradient instead of a flat tint
          const pocket = g.createLinearGradient(0, cy, 0, h);
          pocket.addColorStop(0, 'rgba(20,37,61,0.012)');
          pocket.addColorStop(1, 'rgba(20,37,61,0.03)');
          g.fillStyle = pocket;
          g.beginPath(); g.moveTo(0, h); g.lineTo(cx, cy); g.lineTo(w, h); g.closePath(); g.fill();
          g.lineJoin = 'round'; g.lineCap = 'round';
          g.strokeStyle = 'rgba(20,37,61,0.12)'; g.lineWidth = 5;
          g.beginPath(); g.moveTo(0, h); g.lineTo(cx, cy); g.lineTo(w, h); g.stroke();
          g.beginPath(); g.moveTo(0, 0); g.lineTo(cx * 0.92, cy * 0.98); g.stroke();
          g.beginPath(); g.moveTo(w, 0); g.lineTo(w - cx * 0.92, cy * 0.98); g.stroke();
          g.strokeStyle = 'rgba(20,37,61,0.2)'; g.lineWidth = 6;    // crisp outer edge
          g.strokeRect(3, 3, w - 6, h - 6);
        });
        const plainEdge = mat({ color: CREAM });
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(ENV_W, ENV_H, ENV_D),
          [plainEdge, plainEdge, plainEdge, plainEdge,
           mat({ map: panelTex }), mat({ color: CREAM })]
        );
        env.add(body);

        // Flap: triangle hinged on the top edge of the front panel.
        const FLAP_L = ENV_H * 0.64;
        const flapShape = new THREE.Shape();
        flapShape.moveTo(-ENV_W / 2, 0);
        flapShape.lineTo(ENV_W / 2, 0);
        flapShape.lineTo(ENV_W * 0.035, -FLAP_L + 0.02);
        flapShape.quadraticCurveTo(0, -FLAP_L - 0.01, -ENV_W * 0.035, -FLAP_L + 0.02);
        flapShape.closePath();
        // Like a real envelope, the flap is attached to the FAR panel and folds
        // over the top edge onto the near side. Opening swings it up and back,
        // so the card slides out in front of it.
        const flapPivot = new THREE.Group();
        flapPivot.position.set(0, ENV_H / 2, -ENV_D / 2);
        const flapLeaf = new THREE.Group();
        flapLeaf.position.z = ENV_D + 0.003;     // closed: lies on the near panel
        flapPivot.add(flapLeaf);
        const flap = new THREE.Mesh(
          new THREE.ShapeGeometry(flapShape),
          mat({ color: 0xf2f0ea, side: THREE.DoubleSide })
        );
        flapLeaf.add(flap);

        // Flap outline so it reads against the panel
        const outline = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(
            flapShape.getPoints(12).map((p) => new THREE.Vector3(p.x, p.y, 0.001))
          ),
          new THREE.LineBasicMaterial({ color: 0x14253d, transparent: true, opacity: 0.3 })
        );
        flapLeaf.add(outline);

        // Photo stamp on the flap's point (2x the old seal), with a soft shadow
        const STAMP = 0.74;
        const STAMP_Y = -FLAP_L + 0.17;        // a little lower, over the flap's point
        const stampShadowTex = canvasTex(256, 256, (g, w) => {
          const r = g.createRadialGradient(w / 2, w / 2, w * 0.4, w / 2, w / 2, w / 2);
          r.addColorStop(0, 'rgba(20,37,61,0.3)');
          r.addColorStop(1, 'rgba(20,37,61,0)');
          g.fillStyle = r; g.fillRect(0, 0, w, w);
        });
        const stampShadowMat = new THREE.MeshBasicMaterial({ map: stampShadowTex, transparent: true, depthWrite: false });
        fadeMats.push(stampShadowMat);
        const stampShadow = new THREE.Mesh(new THREE.PlaneGeometry(STAMP * 1.07, STAMP * 1.07), stampShadowMat);
        stampShadow.position.set(0.008, STAMP_Y - 0.014, 0.003);
        flapLeaf.add(stampShadow);

        const stampMat = new THREE.MeshBasicMaterial({ map: stampTex, transparent: true });
        fadeMats.push(stampMat);
        const stamp = new THREE.Mesh(new THREE.PlaneGeometry(STAMP, STAMP), stampMat);
        stamp.position.set(0, STAMP_Y, 0.006);
        flapLeaf.add(stamp);

        env.add(flapPivot);

        // Soft drop shadow so the envelope lifts off the page
        const shadowTex = canvasTex(1024, 840, (g, w, h) => {
          g.clearRect(0, 0, w, h);
          g.shadowColor = 'rgba(20,37,61,0.24)';
          g.shadowBlur = 90;
          g.shadowOffsetX = w * 2;                 // draw off-canvas, keep only the blur
          g.fillStyle = '#000';
          g.fillRect(-w * 2 + 140, 140, w - 280, h - 280);
        });
        const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
        fadeMats.push(shadowMat);
        const shadow = new THREE.Mesh(new THREE.PlaneGeometry(ENV_W * 1.35, ENV_H * 1.4), shadowMat);
        shadow.position.set(0.04, -0.09, -ENV_D / 2 - 0.02);
        env.add(shadow);

        scene.add(env);

        postcardHost.appendChild(renderer.domElement);
        postcardHost.classList.add('is-3d');

        // ---- shake effect: cartoon motion lines + a "!" (2D layer over the canvas) ----
        const fxLayer = document.createElement('div');
        fxLayer.className = 'postcard-fx';
        fxLayer.setAttribute('aria-hidden', 'true');
        postcardHost.appendChild(fxLayer);
        const SVG_NS = 'http://www.w3.org/2000/svg';
        let fxW = 1, fxH = 1;
        const tmpV = new THREE.Vector3();
        const toScreen = (x, y) => {
          tmpV.set(x, y, ENV_D / 2).applyMatrix4(env.matrixWorld).project(camera);
          return { x: (tmpV.x + 1) / 2 * fxW, y: (1 - tmpV.y) / 2 * fxH };
        };
        const svgEl = (tag, attrs) => {
          const el = document.createElementNS(SVG_NS, tag);
          Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
          return el;
        };

        // Spots around the top of the envelope (local x, y) with the direction the
        // lines flick (screen degrees; negative = up). Each shake uses the next pair.
        const FX_SPOTS = {
          tl:   { x: -ENV_W / 2,    y: ENV_H / 2,        dir: -135 },
          tr:   { x:  ENV_W / 2,    y: ENV_H / 2,        dir: -45 },
          topL: { x: -ENV_W * 0.28, y: ENV_H / 2,        dir: -100 },
          topR: { x:  ENV_W * 0.02, y: ENV_H / 2,        dir: -80 },
          sideL:{ x: -ENV_W / 2,    y: ENV_H * 0.22,     dir: -165 },
          sideR:{ x:  ENV_W / 2,    y: ENV_H * 0.22,     dir: -15 }
        };
        const FX_PAIRS = [['tl', 'tr'], ['topL', 'sideR'], ['sideL', 'tr'], ['tl', 'topR'], ['topL', 'sideR'], ['sideL', 'topR']];
        // "!" spot and tilt for each pair above, chosen to stay clear of its lines
        // (x is a fraction of the envelope width from centre; tilt in degrees, + = right)
        const BANG_SPOTS = [
          { x: 0.08, tilt: 10 },
          { x: 0.22, tilt: 18 },
          { x: -0.06, tilt: 6 },
          { x: 0.28, tilt: 14 },
          { x: 0.12, tilt: 20 },
          { x: -0.18, tilt: 8 }
        ];
        let fxTurn = 0;

        function spawnShakeFx() {
          env.updateMatrixWorld(true);
          const tl = toScreen(-ENV_W / 2, ENV_H / 2);
          const tr = toScreen(ENV_W / 2, ENV_H / 2);
          const unit = Math.hypot(tr.x - tl.x, tr.y - tl.y) / 18;   // scales with envelope size
          const svg = svgEl('svg', { width: fxW, height: fxH, viewBox: `0 0 ${fxW} ${fxH}` });
          fxLayer.appendChild(svg);
          const anims = [];

          // short strokes fanning out from this shake's two spots
          const turn = fxTurn++ % FX_PAIRS.length;
          const pair = FX_PAIRS[turn];
          const bangSpot = BANG_SPOTS[turn];
          pair.forEach((key) => {
            const spot = FX_SPOTS[key];
            const c = toScreen(spot.x, spot.y);
            [-26, 0, 26].forEach((spread, i) => {
              const a = (spot.dir + spread) * Math.PI / 180;
              const dx = Math.cos(a);
              const dy = Math.sin(a);
              const start = unit * 0.7;
              const len = unit * (i === 1 ? 1.05 : 0.8);      // middle stroke a touch longer
              const line = svgEl('line', {
                x1: c.x + dx * start, y1: c.y + dy * start,
                x2: c.x + dx * (start + len), y2: c.y + dy * (start + len),
                stroke: NAVY, 'stroke-width': Math.max(2, unit * 0.3), 'stroke-linecap': 'round'
              });
              svg.appendChild(line);
              anims.push(line.animate([
                { opacity: 0, transform: 'translate(0px, 0px)' },
                { opacity: 1, offset: 0.2 },
                { opacity: 0, offset: 0.75 },
                { opacity: 0, transform: `translate(${dx * unit * 1.1}px, ${dy * unit * 1.1 - unit * 0.5}px)` }
              ], { duration: 520, delay: i * 40, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' }));
            });
          });

          // a "!" a little right of centre, tilted to the right
          const top = toScreen(ENV_W * bangSpot.x, ENV_H / 2);
          const tilt = bangSpot.tilt;
          const u = unit;
          const bang = svgEl('g', {});
          bang.appendChild(svgEl('path', {
            d: `M ${-0.34 * u} ${-3.1 * u} L ${0.34 * u} ${-3.1 * u} L ${0.2 * u} ${-1.15 * u} L ${-0.2 * u} ${-1.15 * u} Z`,
            fill: NAVY, stroke: NAVY, 'stroke-width': Math.max(1.5, u * 0.18), 'stroke-linejoin': 'round'
          }));
          bang.appendChild(svgEl('circle', { cx: 0, cy: -0.45 * u, r: 0.32 * u, fill: NAVY }));
          svg.appendChild(bang);
          const bx = top.x;
          const by = top.y - u * 0.6;
          anims.push(bang.animate([
            { opacity: 0, transform: `translate(${bx}px, ${by + u}px) rotate(${tilt - 10}deg) scale(.5)` },
            { opacity: 1, transform: `translate(${bx}px, ${by - u * 0.5}px) rotate(${tilt + 2}deg) scale(1.12)`, offset: 0.3 },
            { opacity: 1, transform: `translate(${bx}px, ${by - u * 1.0}px) rotate(${tilt}deg) scale(1.05)`, offset: 0.5 },
            { opacity: 0, transform: `translate(${bx}px, ${by - u * 2.0}px) rotate(${tilt}deg) scale(1)` }
          ], { duration: 640, easing: 'ease-out', fill: 'both' }));

          Promise.all(anims.map((an) => an.finished)).then(() => svg.remove(), () => svg.remove());
        }

        // ---- fit to the header box (full-size card with breathing room) ----
        // The canvas extends past the header box on every side (more above and
        // below) so the card and envelope are never cut off mid-animation.
        // The framing is still computed from the box itself, so the resting
        // card sits exactly where it did; the box (and page layout) is unchanged.
        let stillDrawn = false;   // skip redraws while the sealed envelope is at rest
        const MOBILE = window.matchMedia('(max-width: 800px)');
        function resizePostcard() {
          const rect = postcardHost.getBoundingClientRect();
          const width = Math.max(1, rect.width);
          const height = Math.max(1, rect.height);
          const padX = MOBILE.matches ? 0 : Math.round(width * 0.06);  // phones: no sideways overflow
          const padY = Math.round(height * 0.34);
          const cw = width + padX * 2;
          const ch = height + padY * 2;
          renderer.setSize(cw, ch, true);
          renderer.domElement.style.left = `${-padX}px`;
          renderer.domElement.style.top = `${-padY}px`;
          fxW = cw; fxH = ch;
          Object.assign(fxLayer.style, { left: `${-padX}px`, top: `${-padY}px`, width: `${cw}px`, height: `${ch}px` });

          const margin = 1.29;
          const tanBase = Math.tan(THREE.MathUtils.degToRad(BASE_FOV / 2));
          const boxAspect = width / height;
          const distH = (CARD_H * margin / 2) / tanBase;
          const distW = (CARD_W * margin / 2) / (tanBase * boxAspect);
          camera.position.set(0, 0, Math.max(distH, distW) + CARD_D);
          camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(tanBase * ch / height));
          camera.aspect = cw / ch;
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
          stillDrawn = false;
        }
        new ResizeObserver(resizePostcard).observe(postcardHost);
        resizePostcard();

        // ---- states: sealed -> opening -> spinning ----
        let state = 'sealed';
        let openStart = 0;
        wrap.classList.add('is-sealed');
        postcardHost.setAttribute('tabindex', '0');
        postcardHost.setAttribute('role', 'button');
        postcardHost.setAttribute('aria-label', 'Envelope with a postcard inside. Press to open.');

        const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);
        const easeBack = (t) => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
        const seg = (t, a, b) => THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
        const lerp = THREE.MathUtils.lerp;

        // Card starts tucked inside the envelope
        const envTop = ENV_Y + (ENV_H / 2) * ENV_SCALE;
        const peakY = envTop + (CARD_H / 2) * ENV_SCALE + 0.04;   // fully clear of the opening
        card.position.set(0, ENV_Y, 0);
        card.scale.setScalar(ENV_SCALE);
        env.position.set(0, ENV_Y, 0);
        env.scale.setScalar(ENV_SCALE);

        function openEnvelope() {
          if (state !== 'sealed') return;
          state = 'opening';
          openStart = performance.now();
          wrap.classList.remove('is-sealed');
          fxLayer.classList.add('is-done');
          postcardHost.removeAttribute('role');
          postcardHost.removeAttribute('tabindex');
          postcardHost.setAttribute('aria-label',
            'Postcard: Family Dinner painting by Jianna Shao on the front, Wesleyan University details on the back. Drag to turn it over.');
        }
        postcardHost.addEventListener('click', openEnvelope);
        postcardHost.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
        });

        // ---- drag to turn (only once it's out) ----
        let angle = 0;
        let velocity = reduceMotion ? 0 : AUTO_SPEED;
        let dragging = false, lastX = 0, lastT = 0, dragVel = 0;

        postcardHost.addEventListener('pointerdown', (e) => {
          if (state !== 'spinning') return;
          introStart = 0;
          dragging = true;
          lastX = e.clientX; lastT = performance.now(); dragVel = 0;
          postcardHost.classList.add('is-dragging');
          postcardHost.setPointerCapture(e.pointerId);
        });
        postcardHost.addEventListener('pointermove', (e) => {
          if (!dragging) return;
          const now = performance.now();
          const dx = e.clientX - lastX;
          const dt = Math.max(1, now - lastT) / 1000;
          angle += dx * DRAG_SENS;
          dragVel = dragVel * 0.6 + (dx * DRAG_SENS / dt) * 0.4;
          lastX = e.clientX; lastT = now;
        });
        const endDrag = () => {
          if (!dragging) return;
          dragging = false;
          postcardHost.classList.remove('is-dragging');
          const idle = (performance.now() - lastT) / 1000;
          velocity = idle > 0.12 ? 0 : THREE.MathUtils.clamp(dragVel, -9, 9);
        };
        postcardHost.addEventListener('pointerup', endDrag);
        postcardHost.addEventListener('pointercancel', endDrag);
        postcardHost.addEventListener('lostpointercapture', endDrag);

        // ---- animate ----
        let visible = true;
        new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; })
          .observe(postcardHost);

        const clock = new THREE.Clock();
        const target = reduceMotion ? 0 : AUTO_SPEED;
        const SHAKE_EVERY = 2.0;   // seconds between shakes
        const SHAKE_LEN = 0.7;     // seconds of shaking
        let lastFxCycle = -1;
        const INTRO_TURN = Math.PI;       // a quick half-turn to show the back
        const INTRO_MS = 700;
        let introStart = 0;
        let introFrom = 0;

        function animatePostcard() {
          requestAnimationFrame(animatePostcard);
          const dt = Math.min(clock.getDelta(), 0.05);
          if (!visible) return;
          const time = clock.elapsedTime;

          if (state === 'sealed') {
            // a little shake, then rest, repeated
            let rz = 0, by = 0;
            if (!reduceMotion) {
              const p = (time % SHAKE_EVERY) - (SHAKE_EVERY - SHAKE_LEN);
              if (p > 0) {
                const amp = Math.sin(Math.PI * (p / SHAKE_LEN));   // swell in and out
                rz = 0.07 * amp * Math.sin(p * 34);
                by = 0.03 * amp * Math.abs(Math.sin(p * 17));
              }
            }
            if (!reduceMotion) {
              const cycle = Math.floor(time / SHAKE_EVERY);
              if ((time % SHAKE_EVERY) > SHAKE_EVERY - SHAKE_LEN && cycle !== lastFxCycle) {
                lastFxCycle = cycle;
                spawnShakeFx();
              }
            }
            const still = rz === 0 && by === 0;
            if (still && stillDrawn) return;      // nothing moved: don't redraw
            stillDrawn = still;
            env.rotation.z = rz;
            env.position.y = ENV_Y + by;
            card.rotation.z = rz;
            card.position.y = ENV_Y + by;
          } else if (state === 'opening') {
            const t = (performance.now() - openStart) / 1000;
            env.rotation.z = lerp(env.rotation.z, 0, 0.25);
            card.rotation.z = env.rotation.z;

            // 1) flap lifts and folds back behind the envelope
            flapPivot.rotation.x = lerp(0, -Math.PI - 0.25, easeOut(seg(t, 0, 0.4)));

            // 2) card slides straight up and fully out of the opening
            const rise = ease(seg(t, 0.32, 1.0));
            // 3) once clear, it comes forward to the centre at full size
            const pop = seg(t, 1.0, 1.65);
            card.position.y = lerp(lerp(ENV_Y, peakY, rise), 0, ease(pop));
            card.scale.setScalar(lerp(ENV_SCALE, 1, easeBack(pop)));
            // while it grows, keep its top edge from rising above where it peaked
            const maxTop = Math.max(peakY + (CARD_H / 2) * ENV_SCALE, CARD_H / 2);
            card.position.y = Math.min(card.position.y, maxTop - (CARD_H / 2) * card.scale.y);
            card.position.z = Math.sin(Math.PI * pop) * 0.4;

            // 4) envelope drops away and fades
            const drop = seg(t, 1.0, 1.7);
            env.position.y = lerp(ENV_Y, ENV_Y - 0.55, ease(drop));
            fadeMats.forEach((m) => { m.opacity = 1 - drop; });
            outline.material.opacity = 0.3 * (1 - drop);

            if (t >= 1.75) {
              scene.remove(env);
              card.position.set(0, 0, 0);
              card.scale.setScalar(1);
              card.rotation.z = 0;
              state = 'spinning';
              // whip round fast to show the back, then ease into the slow spin
              if (!reduceMotion) {
                introStart = performance.now();
                introFrom = angle;
                velocity = 0;
              } else {
                velocity = target;
              }
            }
          } else {
            if (introStart && !dragging) {
              const k = Math.min(1, (performance.now() - introStart) / INTRO_MS);
              angle = introFrom + INTRO_TURN * (1 - Math.pow(1 - k, 3));   // fast, then slows
              if (k >= 1) introStart = 0;          // hand over to the normal spin below
            } else if (!dragging) {
              const dir = Math.sign(velocity) || 1;
              velocity += (target * dir - velocity) * (1 - Math.exp(-dt * 1.6));
              angle += velocity * dt;
            }
            card.rotation.y = angle;
          }

          renderer.render(scene, camera);
        }
        animatePostcard();

      } catch (error) {
        // The plain image stays visible if 3D can't load.
        console.error('Postcard 3D failed to load:', error);
        postcardHost.classList.add('is-failed');
      }
    })();
  }

})();