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

  /* FEATURED PORTFOLIOS: hovering a card fades through a few more images */
  const reduceMotionPrefs = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.work-image[data-previews]').forEach((card) => {
    const srcs = card.dataset.previews.split(/\s+/).filter(Boolean);
    if (!srcs.length) return;
    const layers = srcs.map((src) => {
      const layer = document.createElement('div');
      layer.className = 'work-preview';
      layer.dataset.src = src;
      card.appendChild(layer);
      return layer;
    });
    const dots = document.createElement('div');
    dots.className = 'work-dots';
    dots.setAttribute('aria-hidden', 'true');
    dots.innerHTML = '<i class="is-on"></i>' + srcs.map(() => '<i></i>').join('');
    card.appendChild(dots);
    const dotEls = [...dots.children];

    const load = () => layers.forEach((l) => {
      if (!l.style.backgroundImage) l.style.backgroundImage = `url("${l.dataset.src}")`;
    });
    let timer = null;
    let step = 0;
    const show = (i) => {
      layers.forEach((l, k) => l.classList.toggle('is-on', k === i - 1));
      dotEls.forEach((d, k) => d.classList.toggle('is-on', k === i));
    };
    card.addEventListener('mouseenter', () => {
      load();
      if (reduceMotionPrefs) return;
      step = 0;
      timer = setInterval(() => { step = (step + 1) % (srcs.length + 1); show(step); }, 1100);
    });
    card.addEventListener('mouseleave', () => {
      clearInterval(timer);
      timer = null;
      show(0);
    });
    // fetch the extra images quietly once the page is idle, so hovering is instant
    const warm = () => setTimeout(load, 2500);
    if (window.__siteRevealed || !window.siteLoader) warm();
    else window.addEventListener('site:revealed', warm, { once: true });
  });

  /* CONTACT: copy email */
  const copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    const label = copyBtn.querySelector('.contact-action-label');
    const email = copyBtn.dataset.email;
    const flash = (text) => {
      label.textContent = text;
      copyBtn.classList.add('is-copied');
      clearTimeout(copyBtn._t);
      copyBtn._t = setTimeout(() => {
        label.textContent = 'Copy email';
        copyBtn.classList.remove('is-copied');
      }, 1800);
    };
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(email);
        flash('Copied!');
      } catch (e) {
        // clipboard blocked: fall back to the email app
        window.location.href = `mailto:${email}`;
      }
    });
  }

  /* RESUME PREVIEW / LIGHTBOX */
  const resumeCanvasZoom = document.getElementById('resume-canvas-zoom');
  const resumeButton = document.getElementById('resume-preview-button');
  const resumeLightbox = document.getElementById('resume-lightbox');
  const resumeClose = document.getElementById('resume-lightbox-close');

  if (resumeCanvasZoom && resumeButton && resumeLightbox && resumeClose) {
    // The viewer opens right away on click; the sharp PDF render replaces a
    // preview image as soon as the PDF library is ready. If the library can't
    // load at all, the click opens the PDF itself instead.
    let drawResume = null;          // set once pdf.js has loaded the PDF
    let resumeFailed = false;
    let placeholder = null;

    function openResume() {
      if (resumeFailed) {
        window.open('Resume.pdf', '_blank', 'noopener');
        return;
      }
      resumeLightbox.classList.add('open');
      resumeLightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('resume-zoom-open');
      if (drawResume) {
        drawResume();
      } else if (!placeholder) {
        placeholder = document.createElement('img');
        placeholder.className = 'resume-lightbox-placeholder';
        placeholder.src = 'Resume-preview.jpg';
        placeholder.alt = 'Résumé (loading full quality)';
        resumeCanvasZoom.style.display = 'none';
        resumeCanvasZoom.parentNode.insertBefore(placeholder, resumeCanvasZoom);
      }
    }

    function closeResume() {
      resumeLightbox.classList.remove('open');
      resumeLightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('resume-zoom-open');
    }

    resumeButton.addEventListener('click', openResume);
    resumeClose.addEventListener('click', closeResume);
    resumeLightbox.addEventListener('click', (e) => {
      if (e.target === resumeLightbox) closeResume();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeResume();
    });

    (async () => {
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

          await page.render({ canvasContext: ctx, viewport }).promise;
        }

        drawResume = async () => {
          await draw(resumeCanvasZoom, Math.min(window.innerWidth * 0.88, 1100));
          resumeCanvasZoom.style.display = '';
          if (placeholder) { placeholder.remove(); placeholder = null; }
        };
        if (resumeLightbox.classList.contains('open')) drawResume();
      } catch (error) {
        console.error('Resume.pdf preview failed:', error);
        resumeFailed = true;
      }
    })();
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

  // The name waits (hidden) for its slide-out intro; the loader waits for the 3D.
  const heroName = document.querySelector('.hero-name');
  /* Paint stroke under the name: starts at the sidebar's edge (screen edge on
     phones) and runs to just past the end of the name. */
  const heroStroke = document.querySelector('.hero-stroke');
  const placeStroke = () => {
    if (!heroStroke || !heroName) return;
    const row = heroStroke.offsetParent || heroName.parentElement;
    const rowRect = row.getBoundingClientRect();
    const nameRect = heroName.getBoundingClientRect();
    const nav = document.getElementById('side-nav');
    const navRight = nav && getComputedStyle(nav).transform === 'none' && window.innerWidth > 800
      ? nav.getBoundingClientRect().right : 0;
    // widest line of the name, measured without any animation offset
    let right = nameRect.left;
    heroName.querySelectorAll('.hero-name-part').forEach((p) => {
      const r = p.getBoundingClientRect();
      const tx = new DOMMatrix(getComputedStyle(p).transform).m41 || 0;
      const tr = (getComputedStyle(p).translate || '').split(' ')[0];
      right = Math.max(right, r.right - tx - (parseFloat(tr) || 0));
    });
    const phone = window.innerWidth <= 800;
    // the name text is drawn 5% smaller (--name-scale); the stroke keeps the
    // size it had for the full-size name, centred on the text
    const NS = parseFloat(getComputedStyle(heroName).getPropertyValue('--name-scale')) || 1;
    const H0 = nameRect.height / NS;
    const grow = (H0 - nameRect.height) / 2;
    const padTop = H0 * (phone ? 0.25 : 0.46) + grow;     // extra room above JIANNA
    const padBot = H0 * (phone ? 0.25 : 0.46) + grow;
    right = nameRect.left + (right - nameRect.left) / NS;
    // the name is nudged right with CSS `left`; the stroke moves with it
    const shift = parseFloat(getComputedStyle(heroName).left) || 0;
    const left = navRight - rowRect.left + shift;
    heroStroke.style.left = `${left}px`;
    // the name text can be nudged down with CSS `top`; the stroke stays put
    const drop = parseFloat(getComputedStyle(heroName).top) || 0;
    heroStroke.style.top = `${nameRect.top - drop - rowRect.top - padTop}px`;
    heroStroke.style.height = `${nameRect.height + padTop + padBot}px`;
    // the right-hand U-turn ends a little past the last letter (clear of the envelope)
    // phones: just past the name; wider screens: across the whole heading row,
    // running on behind the envelope / postcard
    const width = phone
      ? (right - rowRect.left) - left + H0 * 0.13
      : rowRect.width - left;
    heroStroke.style.width = `${width}px`;   // 8% narrower
  };
  /* Background behind the name: one wide dry-brush stroke that snakes from the
     top left to the bottom right, like the scroll snake in the sidebar:
     straight runs joined by round U-turns, the runs tilted down to the right.
     Painted along its path on a canvas at screen resolution. */
  let brushCanvas = null;
  let brushAnim = 0;
  const reduceMotionBrush = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // rows = runs; gap = distance between runs and wd = brush width (× box height);
  // tilt in degrees; the first run starts off the left edge
  const BRUSH_SNAKE = { rows: 3, gap: .285, wd: .31, tilt: 3.5, dur: 1700 };
  const snakePoints = (w, h) => {
    const S = BRUSH_SNAKE;
    const th = S.tilt * Math.PI / 180;
    const u = [Math.cos(th), Math.sin(th)], n = [-Math.sin(th), Math.cos(th)];
    const gap = S.gap * h, r = gap / 2;
    const cx = w * .5, cy = h * .5;
    // run length leaves room for the U-turns inside the box
    const half = (w - 2 * (r + S.wd * h * .5)) / 2 / Math.cos(th);
    const P = (t, i) => [cx + u[0] * t + n[0] * i * gap, cy + u[1] * t + n[1] * i * gap];
    const pts = [];
    const line = (A, B, steps) => { for (let q = 0; q < steps; q++) pts.push([A[0] + (B[0] - A[0]) * q / steps, A[1] + (B[1] - A[1]) * q / steps]); };
    const turn = (i, side) => {          // semicircle from run i to run i+1 on the given side (+1 right, -1 left)
      const c = P(side * half, i + .5);
      const a0 = Math.atan2(-n[1], -n[0]);
      for (let q = 0; q < 40; q++) {
        const a = a0 + side * Math.PI * q / 40;
        pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]);
      }
    };
    const first = -(S.rows - 1) / 2;
    for (let k2 = 0; k2 < S.rows; k2++) {
      const i = first + k2;
      const dir = k2 % 2 ? -1 : 1;          // even runs go right, odd runs go left
      const start = k2 === 0 ? -(half + r + S.wd * h * .5) / Math.cos(th) : -dir * half;   // first run starts at the left edge and fades in, like the end
      const end = k2 === S.rows - 1 ? dir * (half + r * 1.4) : dir * half;
      line(P(start, i), P(end, i), 90);
      if (k2 < S.rows - 1) turn(i, dir);
      else pts.push(P(end, i));
    }
    // even out the spacing along the path
    const len = [0];
    for (let q = 1; q < pts.length; q++) len.push(len[q - 1] + Math.hypot(pts[q][0] - pts[q - 1][0], pts[q][1] - pts[q - 1][1]));
    const total = len[len.length - 1], out = [], M = 600;
    let q = 1;
    for (let m = 0; m <= M; m++) {
      const d = total * m / M;
      while (q < len.length - 1 && len[q] < d) q++;
      const f = (d - len[q - 1]) / ((len[q] - len[q - 1]) || 1);
      out.push([pts[q - 1][0] + (pts[q][0] - pts[q - 1][0]) * f, pts[q - 1][1] + (pts[q][1] - pts[q - 1][1]) * f]);
    }
    return { pts: out, len: total };
  };
  const buildBrush = (w, h) => {
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const shades = ['#14253d', '#14253d', '#12223a', '#0f1d31', '#172a45', '#1b3050', '#16294a', '#203655', '#0c1829', '#2a4262'];
    const k = h / 520;
    return [BRUSH_SNAKE].map((S) => {
      const { pts, len } = snakePoints(w, h);
      const N = pts.length - 1;
      const nf = len / w;                 // keeps the dry streaks a similar length to before
      const nrm = pts.map((pt, i) => {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N, i + 1)];
        const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
        return [-dy / L, dx / L];
      });
      const width = S.wd * h;
      const B = Math.round(width / (1.15 * k));
      // smooth 2D value noise so dry gaps clump across neighbouring bristles
      const sd = rnd() * 1000;
      const hsh = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7 + sd) * 43758.5453; return v - Math.floor(v); };
      const noise = (x, y) => {
        const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
        const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
        const a1 = hsh(xi, yi), b1 = hsh(xi + 1, yi), c1 = hsh(xi, yi + 1), d1 = hsh(xi + 1, yi + 1);
        return a1 + (b1 - a1) * u + (c1 - a1) * v + (a1 - b1 - c1 + d1) * u * v;
      };
      const bristles = [];
      for (let j = 0; j < B; j++) {
        const o = (j / (B - 1) - .5) + (rnd() - .5) * .01;
        const edge = Math.min(1, (.5 - Math.abs(o)) * 6);
        const tEnd = .97 + rnd() * .03 * (.5 + .5 * edge);
        const tStart = rnd() * .02 * (.5 + .5 * edge) + (1 - edge) * rnd() * .015;
        const runs = [];
        let on = false, start = 0;
        for (let t = tStart; t <= tEnd; t += .002) {
          // clumped streaks (long along the stroke, narrow across it) + fine grain
          const n1 = noise(o * 26, t * 5 * nf);
          const n2 = noise(o * 90 + 7, t * 22 * nf);
          // solid where the lettering sits; dry at the rims and toward the end
          const dry = .02 + (1 - edge) * .3 + Math.max(0, t - .93) * 3 + Math.max(0, .05 - t) * 4;
          const paint = n1 * .75 + n2 * .25 > dry;
          if (paint && !on) { on = true; start = t; }
          if (!paint && on) { on = false; if (t - start > .0015) runs.push([start, t]); }
        }
        if (on && tEnd - start > .0015) runs.push([start, tEnd]);
        bristles.push({
          o, runs,
          lw: k * (1.6 + rnd() * 1.6),
          col: shades[Math.floor(rnd() * shades.length)],
          a: 1
        });
      }
      return { pts, nrm, width, bristles, dur: S.dur };
    });
  };
  // draw the part of one stroke between progress t0 and t1
  const paintSegment = (ctx, st, t0, t1) => {
    const N = st.pts.length - 1;
    const at = (t, o) => {
      const f = t * N, i = Math.min(N - 1, Math.floor(f)), r = f - i;
      const x = st.pts[i][0] + (st.pts[i + 1][0] - st.pts[i][0]) * r;
      const y = st.pts[i][1] + (st.pts[i + 1][1] - st.pts[i][1]) * r;
      // slight pressure change along the stroke
      const wid = st.width * (.95 + .05 * Math.sin(t * 13 + 1));
      return [x + st.nrm[i][0] * o * wid, y + st.nrm[i][1] * o * wid];
    };
    st.bristles.forEach((b) => {
      ctx.strokeStyle = b.col;
      ctx.globalAlpha = b.a;
      ctx.lineWidth = b.lw;
      b.runs.forEach(([ra, rb]) => {
        const a = Math.max(ra, t0), z = Math.min(rb, t1);
        if (z <= a) return;
        // opacity fades in at the very start and out over the last stretch
        const FIN = .06, FOUT = .9;
        const solidA = Math.max(a, FIN), solidZ = Math.min(z, FOUT);
        const line = (from, to, alpha) => {
          ctx.globalAlpha = Math.max(0, alpha);
          ctx.beginPath();
          const steps = Math.max(1, Math.ceil((to - from) * 300));
          for (let s2 = 0; s2 <= steps; s2++) {
            const [x, y] = at(from + (to - from) * s2 / steps, b.o);
            s2 ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
          ctx.stroke();
        };
        // solid middle as one line
        if (solidZ > solidA) line(solidA, solidZ, b.a);
        // fading start and end in short steps
        const FADE_STEP = .003;
        for (let x0 = a; x0 < Math.min(z, FIN); x0 += FADE_STEP) {
          const x1 = Math.min(x0 + FADE_STEP, z, FIN);
          line(x0, x1, b.a * Math.pow(((x0 + x1) / 2) / FIN, 1.3));
        }
        for (let x0 = Math.max(a, FOUT); x0 < z; x0 += FADE_STEP) {
          const x1 = Math.min(x0 + FADE_STEP, z);
          const m = (x0 + x1) / 2;
          line(x0, x1, b.a * Math.pow(1 - (m - FOUT) / (1 - FOUT), 1.3));
        }
      });
    });
    ctx.globalAlpha = 1;
  };
  const drawBrush = (animate) => {
    if (!heroStroke) return;
    const w = Math.round(heroStroke.offsetWidth), h = Math.round(heroStroke.offsetHeight);
    if (!w || !h) return;
    if (!brushCanvas) {
      brushCanvas = document.createElement('canvas');
      brushCanvas.className = 'hero-stroke-canvas';
      heroStroke.appendChild(brushCanvas);
    }
    cancelAnimationFrame(brushAnim);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // the canvas bleeds past the box top and bottom so the tilted runs aren't cut flat
    // and past the sides so the round U-turns keep their full curve
    const bleed = Math.round(h * .12), bx = Math.round(h * .1);
    brushCanvas.width = (w + bx * 2) * dpr; brushCanvas.height = (h + bleed * 2) * dpr;
    brushCanvas.style.width = (w + bx * 2) + 'px'; brushCanvas.style.height = (h + bleed * 2) + 'px';
    brushCanvas.style.top = -bleed + 'px'; brushCanvas.style.left = -bx + 'px';
    brushCanvas.style.bottom = 'auto'; brushCanvas.style.right = 'auto';
    const ctx = brushCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, bx * dpr, bleed * dpr);
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'round';
    ctx.clearRect(-bx, -bleed, w + bx * 2, h + bleed * 2);
    const strokes = buildBrush(w, h);
    if (!animate || reduceMotionBrush) { strokes.forEach((st) => paintSegment(ctx, st, 0, 1)); return; }
    // each stroke starts a little before the previous one finishes
    let t = 0;
    const plan = strokes.map((st) => { const p = { st, start: t, done: 0 }; t += st.dur * .5; return p; });
    const ease = (x) => (x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2) * .35 + (1 - Math.pow(1 - x, 1.6)) * .65;
    const t0 = performance.now();
    const frame = () => {
      const now = performance.now() - t0;
      let busy = false;
      plan.forEach((p) => {
        const k2 = Math.min(1, Math.max(0, (now - p.start) / p.st.dur));
        const prog = ease(k2);
        if (prog > p.done) { paintSegment(ctx, p.st, p.done > .06 && p.done < .9 ? p.done - .0015 : p.done, prog); p.done = prog; }
        if (k2 < 1) busy = true;
      });
      if (busy) brushAnim = requestAnimationFrame(frame);
    };
    brushAnim = requestAnimationFrame(frame);
  };
  // painted (animated) once per page load; later calls do nothing
  let strokePainted = false;
  const paintStroke = () => {
    if (!heroStroke || strokePainted) return;
    strokePainted = true;
    placeStroke();
    drawBrush(true);
  };
  // only a real width change (not a phone's address bar showing/hiding)
  // re-lays the stroke out, and then without animating
  let strokeW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (!strokePainted || window.innerWidth === strokeW) return;
    strokeW = window.innerWidth;
    placeStroke();
    drawBrush(false);
  });
  const showNamePlain = () => {
    if (heroName) heroName.classList.remove('name-intro-pending');
    paintStroke();
  };
  if (postcardHost && heroName) {
    heroName.classList.add('name-intro-pending');
    setTimeout(showNamePlain, 20000);            // safety net
  }
  const whenRevealed = (fn) => {
    if (window.__siteRevealed || !window.siteLoader) fn();
    else window.addEventListener('site:revealed', fn, { once: true });
  };

  if (postcardHost) {
    if (window.siteLoader) window.siteLoader.wait('postcard');
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

          const margin = 1.19;   // smaller margin = bigger postcard
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
        let shakeT0 = Infinity;   // set when the page is revealed
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
              const st = time - shakeT0;         // shakes start once the page is revealed
              const p = st < 0 ? -1 : (st % SHAKE_EVERY) - (SHAKE_EVERY - SHAKE_LEN);
              if (p > 0) {
                const amp = Math.sin(Math.PI * (p / SHAKE_LEN));   // swell in and out
                rz = 0.07 * amp * Math.sin(p * 34);
                by = 0.03 * amp * Math.abs(Math.sin(p * 17));
              }
            }
            if (!reduceMotion) {
              const st = time - shakeT0;
              const cycle = Math.floor(st / SHAKE_EVERY);
              if (st >= 0 && (st % SHAKE_EVERY) > SHAKE_EVERY - SHAKE_LEN && cycle !== lastFxCycle) {
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
        renderer.render(scene, camera);
        if (window.siteLoader) window.siteLoader.done('postcard');

        // ---- intro: "Jianna" and "Shao" slide out from behind the envelope ----
        function playNameIntro() {
          if (!heroName || reduceMotion) { showNamePlain(); shakeT0 = clock.elapsedTime; return; }
          env.updateMatrixWorld(true);
          const cRect = renderer.domElement.getBoundingClientRect();
          const corners = [[-ENV_W / 2, ENV_H / 2], [ENV_W / 2, ENV_H / 2], [-ENV_W / 2, -ENV_H / 2], [ENV_W / 2, -ENV_H / 2]]
            .map(([x, y]) => { const q = toScreen(x, y); return { x: q.x + cRect.left, y: q.y + cRect.top }; });
          const envL = Math.min(...corners.map((c) => c.x));
          const envR = Math.max(...corners.map((c) => c.x));
          const envT = Math.min(...corners.map((c) => c.y));
          const envB = Math.max(...corners.map((c) => c.y));
          const nRect = heroName.getBoundingClientRect();
          const stacked = envT >= nRect.bottom - 4;   // phones: envelope sits below the name

          // Only show the part of the name that has come out past the envelope's edge.
          heroName.style.clipPath = stacked
            ? `inset(-40% -40% ${nRect.bottom - envT}px -40%)`
            : `inset(-40% ${nRect.right - envL}px -40% -40%)`;
          heroName.classList.remove('name-intro-pending');

          const parts = [...heroName.querySelectorAll('.hero-name-part')];
          paintStroke();                              // stroke sweeps in with the name
          const anims = parts.map((part, i) => {
            const r = part.getBoundingClientRect();
            const from = stacked
              ? `0px ${Math.round((envT + envB) / 2 - r.top)}px`
              : `${Math.round((envL + envR) / 2 - r.left)}px 0px`;
            return part.animate(
              [{ translate: from }, { translate: '0px 0px' }],
              { duration: 1600, delay: 150 + i * 240, easing: 'cubic-bezier(.22,.8,.2,1)', fill: 'backwards' }
            );
          });
          Promise.all(anims.map((a) => a.finished)).then(() => {
            heroName.style.clipPath = '';
          }, () => { heroName.style.clipPath = ''; });
          shakeT0 = clock.elapsedTime + 1.4;        // first shake once the name has landed
        }
        whenRevealed(() => requestAnimationFrame(playNameIntro));

      } catch (error) {
        // The plain image stays visible if 3D can't load.
        console.error('Postcard 3D failed to load:', error);
        postcardHost.classList.add('is-failed');
        showNamePlain();
        if (window.siteLoader) window.siteLoader.done('postcard');
      }
    })();
  }

})();