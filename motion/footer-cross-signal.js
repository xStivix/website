// All dimensions are in grid units and scale with the existing dot spacing.
const restingRadius = 1.65;
const hoverGrowth = 1.45;
const restingAlpha = 0.65;
const spotWidth = 137, spotHeight = 82;

function spotStrength(dx, dy) {
  const falloff = Math.max(0, 1 - (dx / spotWidth) ** 2 - (dy / spotHeight) ** 2);
  return falloff * falloff;
}

export function createFooterDots(width, height, scale) {
  const step = 20 * scale, edge = 6 * scale;
  const span = Math.max(0, width - 2 * edge);
  const columns = Math.max(2, Math.round(span / step) + 1);
  const dots = [];
  for (let y = step / 2; y < height; y += step) {
    for (let column = 0; column < columns; column++) {
      dots.push({ x: edge + column * span / (columns - 1), y, intensity: 0 });
    }
  }
  return dots;
}

export function mountFooterSignal(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const footer = canvas.closest('.footer-magnet') || canvas;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let dots = [], width = 0, height = 0, scale = 1, lastSize = '';
  let visible = false, frame = 0, previous = 0;
  let pointer = null;

  function paint() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    for (const dot of dots) {
      ctx.globalAlpha = restingAlpha + (1 - restingAlpha) * dot.intensity;
      const radius = (restingRadius + hoverGrowth * dot.intensity) * scale;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    pointer = null;
    for (const dot of dots) dot.intensity = 0;
    paint();
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) { stop(); return; }
    const dpr = Math.min(devicePixelRatio || 1, 3);
    const responsive = getComputedStyle(canvas).getPropertyValue('--magnet-responsive').trim() === '1';
    const size = [bounds.width, bounds.height, dpr, responsive].join(':');
    if (size === lastSize) return;
    lastSize = size;
    width = bounds.width;
    height = bounds.height;
    scale = responsive ? height / 160 : 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = createFooterDots(width, height, scale);
    paint();
    canvas.dataset.footerEffect = 'hover';
    canvas.dataset.ready = 'true';
    if (pointer) wake();
  }

  function wake() {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }

  function tick(now) {
    frame = 0;
    const dt = previous ? (now - previous) / 1000 : 1 / 60;
    const rise = reducedMotion.matches ? 1 : 1 - Math.exp(-32 * dt);
    const fade = reducedMotion.matches ? 1 : 1 - Math.exp(-4.5 * dt);
    const bounds = pointer && canvas.getBoundingClientRect();
    const x = bounds ? pointer.x - bounds.left : Infinity;
    const y = bounds ? pointer.y - bounds.top : Infinity;
    const marginX = spotWidth * scale, marginY = spotHeight * scale;
    const inReach = x > -marginX && x < width + marginX && y > -marginY && y < height + marginY;
    let changed = false, settling = false;
    for (const dot of dots) {
      const target = inReach ? spotStrength((dot.x - x) / scale, (dot.y - y) / scale) : 0;
      const delta = target - dot.intensity;
      if (delta === 0) continue;
      const blend = delta > 0 ? rise : fade;
      dot.intensity = blend === 1 || Math.abs(delta) < .002 ? target : dot.intensity + delta * blend;
      changed = true;
      if (dot.intensity !== target) settling = true;
    }
    if (changed) paint();
    previous = settling ? now : 0;
    if (settling) wake();
  }

  function move(event) {
    if (event.pointerType === 'touch') { leave(); return; }
    if (!visible || document.hidden) return;
    if (pointer && pointer.x === event.clientX && pointer.y === event.clientY) return;
    pointer = { x: event.clientX, y: event.clientY };
    wake();
  }

  function leave() {
    pointer = null;
    wake();
  }

  function scroll() {
    if (pointer) wake();
  }

  function visibility() {
    if (document.hidden) stop();
    else resize();
  }

  footer.addEventListener('pointermove', move);
  footer.addEventListener('pointerleave', leave);
  footer.addEventListener('pointercancel', leave);
  document.addEventListener('scroll', scroll, { capture: true, passive: true });
  document.addEventListener('visibilitychange', visibility);
  document.addEventListener('pagechange', resize);
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('blur', stop);
  reducedMotion.addEventListener('change', wake);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { resize(); if (pointer) wake(); }
    else stop();
  });
  visibilityObserver.observe(canvas);
  resize();

  return {
    destroy() {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      footer.removeEventListener('pointermove', move);
      footer.removeEventListener('pointerleave', leave);
      footer.removeEventListener('pointercancel', leave);
      document.removeEventListener('scroll', scroll, true);
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('pagechange', resize);
      window.removeEventListener('resize', resize);
      window.removeEventListener('blur', stop);
      reducedMotion.removeEventListener('change', wake);
    }
  };
}
