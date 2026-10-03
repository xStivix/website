/* Load each page's artwork only while its desktop/tablet slot is visible. */
document.querySelectorAll('[data-optical-variant]:not([data-motion="static"]), [data-motion="eclipse"]').forEach(art => {
  const desktop = matchMedia('(min-width: 700px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let scene = null;
  let timeline = null;
  let pending = false;
  let visible = false;
  let disposed = false;

  async function sync() {
    const active = visible && desktop.matches && !reduced.matches && !document.hidden;
    if (disposed) return;
    if (scene) {
      if (active && timeline) scene.setTime(timeline());
      scene.setPlaying(active);
      return;
    }
    if (!active || pending || art.dataset.error) return;
    pending = true;
    try {
      let create;
      if (art.dataset.motion === 'eclipse') {
        const { createEclipse } = await import('./motion/soft-totality.js?v=20260925-about');
        create = () => createEclipse(art, 3, { autoplay: true });
      } else {
        const { createFocusStack, focusTimeline } = await import('./motion/focus-stack.js?v=20260927-middle-grey');
        timeline = focusTimeline;
        create = () => createFocusStack(art, {
          autoplay: true,
          variant: art.dataset.opticalVariant,
          timeline: focusTimeline
        });
      }
      if (disposed || !visible || !desktop.matches || reduced.matches || document.hidden) return;
      scene = create();
    } catch (error) {
      art.dataset.error = 'true';
      art.querySelector('canvas')?.remove();
      console.warn('Optical artwork: displaying the still image.', error);
    } finally {
      pending = false;
    }
  }

  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRect.width > 0;
    sync();
  });
  observer.observe(art);
  // Page navigation fires before paint. Refresh a returning canvas immediately,
  // rather than briefly showing its old frame while IntersectionObserver catches up.
  function pageChange() {
    const rect = art.getBoundingClientRect();
    visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 &&
      rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
    sync();
  }
  if (art.dataset.opticalVariant) document.addEventListener('pagechange', pageChange);
  desktop.addEventListener('change', sync);
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pageshow', sync);
  window.addEventListener('pagehide', event => {
    if (event.persisted) { scene?.setPlaying(false); return; }
    disposed = true;
    observer.disconnect();
    desktop.removeEventListener('change', sync);
    reduced.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
    document.removeEventListener('pagechange', pageChange);
    scene?.dispose();
  });
});
