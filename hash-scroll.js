/* Links like project.html#project-four: content above the target keeps
   growing after the first jump (lazy images, the fridge and garden laying
   themselves out, the loader lifting), which pushes the section down the
   page. Keep the section pinned to the top until the page settles, or until
   the visitor scrolls on their own. */
(() => {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const offset = () => (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
  let userMoved = false;
  const stop = () => { userMoved = true; };
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((e) => addEventListener(e, stop, { passive: true, once: true }));
  const pin = () => {
    if (userMoved) return;
    const top = target.getBoundingClientRect().top + scrollY - offset();
    if (Math.abs(scrollY - top) > 2) scrollTo({ top, behavior: 'instant' });
  };
  pin();
  const ro = 'ResizeObserver' in window ? new ResizeObserver(pin) : null;
  if (ro) ro.observe(document.body);
  addEventListener('load', pin);
  const t0 = performance.now();
  (function tick() {
    pin();
    if (!userMoved && performance.now() - t0 < 6000) requestAnimationFrame(tick);
    else if (ro) ro.disconnect();
  })();
})();
