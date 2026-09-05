/* Local refinements; keep the original site's script unchanged. */
(() => {
  const hero = document.getElementById('home');
  const scrollCue = hero?.querySelector('.hero-editorial__desktop-scroll');
  if (!hero || !scrollCue) return;

  const desktop = window.matchMedia('(min-width: 768px)');
  let frame = 0;

  function updateScrollCue() {
    frame = 0;

    if (!desktop.matches) {
      scrollCue.style.removeProperty('--hero-scroll-opacity');
      scrollCue.removeAttribute('data-scroll-hidden');
      return;
    }

    const { top, height } = hero.getBoundingClientRect();
    // Fade during the first part of the scroll, before reaching About.
    const fadeDistance = Math.max(1, Math.min(240, height * .3));
    const progress = Math.max(0, Math.min(1, -top / fadeDistance));

    scrollCue.style.setProperty('--hero-scroll-opacity', String(1 - progress));
    scrollCue.toggleAttribute('data-scroll-hidden', progress === 1);
  }

  function scheduleUpdate() {
    if (!frame) frame = window.requestAnimationFrame(updateScrollCue);
  }

  // The original site can scroll either body or the document. Capture also
  // receives the body's non-bubbling scroll events in that layout.
  window.addEventListener('scroll', scheduleUpdate, { passive: true, capture: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  desktop.addEventListener('change', scheduleUpdate);
  updateScrollCue();
})();
