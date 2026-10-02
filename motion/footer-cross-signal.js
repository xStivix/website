const bell = (distance, radius) => Math.exp(-Math.pow(distance / radius, 2));
const ease = (rate, dt) => 1 - Math.exp(-rate * dt);

// Above and beside the grid, keep the gentle distance falloff. Below it,
// follow the actual link rows and reach zero at the copyright text.
export function footerPointerProximity(x, y, width, scale = 1, lowerFade = []) {
  const dx = Math.max(0, -x, x - width);
  const dy = Math.max(0, -y);
  const distance = Math.hypot(dx, dy);
  let lowerStrength = 1;
  for (let i = 1; i < lowerFade.length; i++) {
    const [fromY, fromStrength] = lowerFade[i - 1];
    const [toY, toStrength] = lowerFade[i];
    if (y < fromY) break;
    const progress = Math.min(1, (y - fromY) / Math.max(1, toY - fromY));
    const smooth = progress * progress * (3 - 2 * progress);
    lowerStrength = fromStrength + (toStrength - fromStrength) * smooth;
    if (y <= toY) break;
  }
  return (.08 + .92 * Math.exp(-distance / (65 * scale))) * lowerStrength;
}

// Preserve the existing footer's eight rows, edge inset and resting dots.
export function createFooterDots(width, height, scale) {
  const step = 20 * scale, edge = 6 * scale;
  const span = Math.max(0, width - 2 * edge);
  const columns = Math.max(2, Math.round(span / step) + 1);
  const dots = [];
  for (let y = step / 2; y < height; y += step) {
    for (let column = 0; column < columns; column++) {
      dots.push({ x: edge + column * span / (columns - 1), y, r: 2 * scale, a: .65 });
    }
  }
  return dots;
}

// Cross Signal motion, with intensity controlled by proximity to the grid.
export function crossSignalTarget(point, state, scale, time) {
  const dx = (point.x - state.pointer.x) / scale;
  const dy = (point.y - state.pointer.y) / scale;
  const distance = Math.hypot(dx, dy);
  if (state.reduced) {
    const focus = bell(distance, 84) * state.strength;
    return { r: (2 + 2.1 * focus) * scale, a: Math.min(1, .65 + .35 * focus) };
  }
  const core = bell(distance, 32) * state.strength;
  let radius = 2 + 2.35 * core, alpha = .65 + .35 * core;
  for (const wave of state.waves) {
    const age = (time - wave.time) / 1.65;
    if (age < 0 || age > 1) continue;
    const x = (point.x - wave.x) / scale, y = (point.y - wave.y) / scale;
    const front = age * 420;
    const horizontal = bell(y, 12) * bell(Math.abs(x) - front, 44);
    const vertical = bell(x, 12) * bell(Math.abs(y) - front, 36);
    const strength = Math.min(wave.strength ?? 1, state.strength);
    const signal = Math.max(horizontal, vertical) * Math.pow(1 - age, .8) * strength;
    radius += 2.7 * signal;
    alpha += .4 * signal;
  }
  return { r: Math.min(5.8, radius) * scale, a: Math.min(1, alpha) };
}

export function mountFooterSignal(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const interactionArea = canvas.closest('.footer-magnet') || canvas;
  const footerLinks = Array.from(interactionArea.querySelectorAll('ul a'));
  const copyright = interactionArea.querySelector('.footer-bottom__copy');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const state = { pointer: { x: -1e5, y: -1e5 }, strength: 0, waves: [], reduced: reduced.matches };
  let dots = [], width = 0, height = 0, scale = 1, lastSize = '';
  let visible = false, inside = false, frame = 0, previous = 0, time = 0;
  let targetStrength = 0, lastPointer = null;
  let lowerFade = [];
  let lastPulse = -10, pulseX = 0, pulseY = 0;

  function paint() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    for (const point of dots) {
      ctx.globalAlpha = point.a;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function reset() {
    inside = false;
    targetStrength = 0;
    state.strength = 0;
    state.waves.length = 0;
    state.pointer.x = state.pointer.y = -1e5;
    lastPulse = -10;
    previous = 0;
    for (const point of dots) { point.r = 2 * scale; point.a = .65; }
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastPointer = null;
    reset();
    paint();
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) { stop(); return; }
    const dpr = Math.min(devicePixelRatio || 1, 3);
    const responsive = getComputedStyle(canvas).getPropertyValue('--magnet-responsive').trim() === '1';
    const layoutScale = responsive ? bounds.height / 160 : 1;
    const linkRows = footerLinks.map(link => link.getBoundingClientRect())
      .filter(rect => rect.width && rect.height)
      .map(rect => rect.top + rect.height / 2 - bounds.top);
    const firstLink = Math.max(bounds.height + 1, linkRows.length ? Math.min(...linkRows) : bounds.height + 100 * layoutScale);
    const lastLink = Math.max(firstLink + 1, linkRows.length ? Math.max(...linkRows) : firstLink + 48 * layoutScale);
    const end = Math.max(lastLink + 1, copyright
      ? copyright.getBoundingClientRect().top - bounds.top
      : interactionArea.getBoundingClientRect().bottom - bounds.top);
    lowerFade = [[bounds.height, 1], [firstLink, .95], [lastLink, .55], [end, 0]];
    const size = `${bounds.width}:${bounds.height}:${dpr}:${responsive}`;
    if (size === lastSize) return;
    lastSize = size;
    width = bounds.width; height = bounds.height;
    scale = responsive ? height / 160 : 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = createFooterDots(width, height, scale);
    stop();
    canvas.dataset.footerEffect = 'cross-signal';
    canvas.dataset.ready = 'true';
  }
  function wake() {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function tick(now) {
    frame = 0;
    const dt = previous ? Math.min((now - previous) / 1000, 1 / 30) : 1 / 60;
    previous = now; time += dt;
    state.strength = state.reduced ? targetStrength
      : state.strength + (targetStrength - state.strength) * ease(inside ? 25 : 7, dt);
    state.waves = state.waves.filter(wave => time - wave.time < 1.7);
    let movement = 0;
    for (const point of dots) {
      const target = crossSignalTarget(point, state, scale, time);
      if (state.reduced) { point.r = target.r; point.a = target.a; }
      else {
        point.r += (target.r - point.r) * ease(target.r > point.r ? 21 : 8, dt);
        point.a += (target.a - point.a) * ease(13, dt);
      }
      movement = Math.max(movement, Math.abs(point.r - target.r), Math.abs(point.a - target.a));
    }
    paint();
    if (!state.reduced && (inside || state.strength > .001 || state.waves.length || movement > .005)) wake();
    else if (!inside) { reset(); paint(); }
    else previous = 0;
  }
  function pulse(x, y) {
    if (state.reduced) return;
    state.waves.push({ x, y, time, strength: targetStrength });
    if (state.waves.length > 8) state.waves.shift();
    lastPulse = time; pulseX = x; pulseY = y;
  }
  function move(event) {
    if (event.pointerType === 'touch' || !visible || document.hidden) return;
    const bounds = canvas.getBoundingClientRect();
    lastPointer = { clientX: event.clientX, clientY: event.clientY, pointerType: event.pointerType };
    targetStrength = footerPointerProximity(event.clientX - bounds.left, event.clientY - bounds.top, width, scale, lowerFade);
    if (!targetStrength) {
      inside = false;
      if (state.strength || state.waves.length) wake();
      return;
    }
    // Project the surrounding footer onto the nearest grid edge without
    // changing the resting dot positions.
    const x = Math.max(6 * scale, Math.min(width - 6 * scale, event.clientX - bounds.left));
    const y = Math.max(10 * scale, Math.min(height - 10 * scale, event.clientY - bounds.top));
    if (!inside || (time - lastPulse > .28 && Math.hypot(x - pulseX, y - pulseY) > 45 * scale)) pulse(x, y);
    inside = true;
    state.pointer.x = x; state.pointer.y = y;
    wake();
  }
  function leave() { inside = false; targetStrength = 0; lastPointer = null; wake(); }
  function scroll() {
    if (!lastPointer) return;
    const bounds = interactionArea.getBoundingClientRect();
    if (lastPointer.clientX < bounds.left || lastPointer.clientX > bounds.right ||
        lastPointer.clientY < bounds.top || lastPointer.clientY > bounds.bottom) leave();
    else move(lastPointer);
  }
  function click(event) {
    if (event.pointerType === 'touch' || !visible || document.hidden) return;
    move(event);
    if (inside && time - lastPulse > .09) pulse(state.pointer.x, state.pointer.y);
  }
  function visibility() { if (document.hidden) stop(); else resize(); }
  function preference() { state.reduced = reduced.matches; stop(); }

  interactionArea.addEventListener('pointerenter', move);
  interactionArea.addEventListener('pointermove', move);
  interactionArea.addEventListener('pointerdown', click);
  interactionArea.addEventListener('pointerleave', leave);
  interactionArea.addEventListener('pointercancel', leave);
  window.addEventListener('blur', stop);
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', scroll, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  document.addEventListener('pagechange', resize);
  reduced.addEventListener('change', preference);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resizeObserver.observe(interactionArea);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) resize(); else stop();
  });
  visibilityObserver.observe(canvas);
  resize();
  return {
    destroy() {
      stop(); resizeObserver.disconnect(); visibilityObserver.disconnect();
      for (const [name, handler] of [['pointerenter', move], ['pointermove', move], ['pointerdown', click], ['pointerleave', leave], ['pointercancel', leave]]) interactionArea.removeEventListener(name, handler);
      window.removeEventListener('blur', stop);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', scroll);
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('pagechange', resize);
      reduced.removeEventListener('change', preference);
    }
  };
}
