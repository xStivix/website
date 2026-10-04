/* Keep the About globe idle while hidden or outside the viewport. */
(() => {
  const art = document.getElementById('about-resonance');
  if (!art) return;
  const canvas = art.querySelector('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let draw = null, locateTouch = null, pending = false, disposed = false;
  let visible = false, width = 0, dpr = 1;
  let time = 0, previous = 0, frame = 0;
  const touchEcho = { pointer: { x: 300, y: 262, strength: 0 }, ripples: [] };
  let onSurface = false, inRange = false, targetStrength = 0, lastPointer = null;
  let lastPulse = -10, pulseX = 300, pulseY = 262;
  const clearTouch = (immediate = false) => {
    onSurface = false;
    inRange = false;
    targetStrength = 0;
    if (immediate) {
      touchEcho.pointer.strength = 0;
      touchEcho.ripples = [];
    }
  };
  const pulse = (x, y, rawX = x, rawY = y) => {
    touchEcho.ripples.push({ x, y, time, strength: targetStrength });
    if (touchEcho.ripples.length > 12) touchEcho.ripples.shift();
    lastPulse = time; pulseX = rawX; pulseY = rawY;
  };

  const paint = () => {
    if (!draw || !width) return;
    draw(ctx, { width, dpr, time, touchEcho });
    art.dataset.ready = 'true';
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
  };
  const active = () => visible && width > 0 && !document.hidden && !reduced.matches && !disposed;
  const tick = now => {
    frame = 0;
    if (!active()) { previous = 0; return; }
    const dt = previous ? Math.min(.1, (now - previous) / 1000) : 0;
    time += dt;
    previous = now;
    touchEcho.pointer.strength += (targetStrength - touchEcho.pointer.strength) * (1 - Math.exp(-dt * 4.8));
    touchEcho.ripples = touchEcho.ripples.filter(p => time - p.time < 1.65);
    paint();
    frame = requestAnimationFrame(tick);
  };
  async function sync() {
    if (disposed) return;
    if (!visible || document.hidden || reduced.matches) clearTouch(true);
    if (!draw && visible && width > 0 && !pending && !art.dataset.error) {
      pending = true;
      try {
        const module = await import('./motion/resonance.js?v=20261004-larger-dots');
        if (disposed) return;
        draw = module.drawResonance;
        locateTouch = module.resonanceTouchAt;
      } catch (error) {
        art.dataset.error = 'true';
        console.warn('Resonance: displaying the still image.', error);
      } finally { pending = false; }
    }
    if (!draw) return;
    if (visible) paint();
    if (active()) {
      if (!frame) frame = requestAnimationFrame(tick);
    } else stop();
  }
  const move = event => {
    if (event.pointerType === 'touch' || !draw || !width || !visible || disposed || document.hidden) return;
    const rect = art.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    lastPointer = { clientX: event.clientX, clientY: event.clientY, pointerType: event.pointerType };
    const x = (event.clientX - rect.left) / rect.width * 600;
    const y = (event.clientY - rect.top) / rect.height * 560;
    const contact = locateTouch(x, y);
    const moved = Math.hypot(x - pulseX, y - pulseY) > 42;
    targetStrength = contact.strength;
    if (targetStrength && !reduced.matches &&
        (!inRange || (contact.inside && !onSurface) || (moved && time - lastPulse > .28))) {
      pulse(contact.x, contact.y, x, y);
    }
    onSurface = contact.inside;
    inRange = targetStrength > 0;
    touchEcho.pointer.x = contact.x;
    touchEcho.pointer.y = contact.y;
    if (onSurface) touchEcho.pointer.strength = 1;
    // Reduced motion keeps only direct, static contact lighting.
    if (reduced.matches) { touchEcho.pointer.strength = targetStrength; paint(); }
  };
  const leave = () => {
    lastPointer = null;
    clearTouch(reduced.matches);
    if (reduced.matches) paint();
  };
  const press = event => {
    if (event.button !== 0 || event.pointerType === 'touch') return;
    move(event);
    if (inRange && !reduced.matches && time - lastPulse > .09) {
      const rect = art.getBoundingClientRect();
      pulse(touchEcho.pointer.x, touchEcho.pointer.y,
        (event.clientX - rect.left) / rect.width * 600,
        (event.clientY - rect.top) / rect.height * 560);
    }
  };
  const scroll = () => { if (lastPointer) move(lastPointer); };
  const resize = new ResizeObserver(() => {
    clearTouch(true);
    const rect = art.getBoundingClientRect();
    width = rect.width;
    dpr = Math.min(3, Math.max(2, devicePixelRatio || 1));
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    paint();
    sync();
  });
  const observer = new IntersectionObserver(entries => {
    const entry = entries[0];
    visible = entry.isIntersecting && entry.intersectionRect.width > 0;
    sync();
  });
  const pageChange = () => {
    const rect = art.getBoundingClientRect();
    visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 &&
      rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
    sync();
  };
  resize.observe(art);
  observer.observe(art);
  // Listen beyond the canvas without adding an overlay or changing the cursor.
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerleave', leave);
  document.addEventListener('pointercancel', leave);
  document.addEventListener('pointerdown', press, { passive: true });
  window.addEventListener('scroll', scroll, { passive: true });
  window.addEventListener('blur', leave);
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('pagechange', pageChange);
  window.addEventListener('pageshow', pageChange);
  window.addEventListener('pagehide', event => {
    stop();
    if (event.persisted) return;
    disposed = true;
    observer.disconnect();
    resize.disconnect();
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerleave', leave);
    document.removeEventListener('pointercancel', leave);
    document.removeEventListener('pointerdown', press);
    window.removeEventListener('scroll', scroll);
    window.removeEventListener('blur', leave);
    reduced.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
    document.removeEventListener('pagechange', pageChange);
    window.removeEventListener('pageshow', pageChange);
  });
})();
