/* 00 Resonance with a slightly larger globe and layered particle brightness. */
const TAU = Math.PI * 2;
const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
const smooth = (lo, hi, n) => {
  const t = clamp((n - lo) / (hi - lo));
  return t * t * (3 - 2 * t);
};
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const sphere = (lat, lon) => ({
  x: Math.cos(lat) * Math.sin(lon),
  y: Math.sin(lat),
  z: Math.cos(lat) * Math.cos(lon)
});
const origins = [sphere(.56, -.66), sphere(-.45, -.40), sphere(.14, .66)];
let seed = 9826, extraSeed = 4821;
const random = () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
const extraRandom = () => { extraSeed = (Math.imul(1664525, extraSeed) + 1013904223) >>> 0; return extraSeed / 4294967296; };
const points = [], extraPoints = [];

// A finer spherical grid gives the left side enough detail to dissolve gradually.
for (let row = 1; row < 46; row++) {
  const lat = -Math.PI / 2 + row / 46 * Math.PI;
  const count = Math.max(4, Math.round(TAU * Math.cos(lat) / .070));
  for (let j = 0; j < count; j++) {
    const occupancy = random();
    if (occupancy > .90) continue;
    const extra = occupancy > .82;
    const rand = extra ? extraRandom : random;
    const p = sphere(lat, j / count * TAU + (row % 2) * Math.PI / count);
    p.variation = rand(); p.phase = rand() * TAU; p.space = rand();
    p.distances = origins.map(origin => Math.acos(clamp(dot(origin, p), -1, 1)));
    (extra ? extraPoints : points).push(p);
  }
}
const particles = points.concat(extraPoints);
// Reuse projection objects; particle positions, sizes and draw order stay exact.
const projections = particles.map(() => ({ x: 0, y: 0, z: 0, r: 0, alpha: 0 }));
const projected = [];
const waves = origins.map(() => ({ center: 0, strength: 0 }));

// Extend contact lighting around the existing globe silhouette. Outside
// pointers are projected onto its rim so the echo still reaches the particles.
export function resonanceTouchAt(x, y) {
  const dx = x - 300, dy = y - 262;
  const normalized = Math.hypot(dx / 215, dy / 210);
  const inside = normalized <= 1;
  const distance = inside ? 0 : Math.hypot(dx, dy) * (1 - 1 / normalized);
  const strength = 1 - smooth(0, 330, distance);
  const projection = inside ? 1 : 1 / normalized;
  return { x: 300 + dx * projection, y: 262 + dy * projection, strength, inside };
}

export function drawResonance(ctx, { width, dpr = 1, time = 0, touchEcho = null }) {
  if (!width) return;
  const scale = width / 600;
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  ctx.clearRect(0, 0, 600, 560);
  ctx.fillStyle = '#f5f5f5';
  const yaw = .06 + time * .055, tilt = .14;
  const ca = Math.cos(yaw), sa = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt);
  const camera = 4.4, radius = 191, cx = 300, cy = 262;
  projected.length = 0;
  for (let i = 0; i < waves.length; i++) {
    const phase = (time / 6.8 + i / 3) % 1;
    waves[i].center = phase * 1.55;
    waves[i].strength = Math.sin(Math.PI * phase);
  }
  const echo = touchEcho && touchEcho.pointer.strength > 0 ? {
    pointer: touchEcho.pointer,
    ripples: touchEcho.ripples.map(pulse => {
      const progress = (time - pulse.time) / 1.65;
      return {
        ...pulse, progress,
        radius: progress * 245,
        echoRadius: Math.max(0, progress - .17) * 245,
        decay: Math.pow(1 - progress, .65),
        strength: Math.min(pulse.strength ?? 1, touchEcho.pointer.strength)
      };
    }).filter(pulse => pulse.progress >= 0 && pulse.progress <= 1)
  } : null;

  for (let index = 0; index < particles.length; index++) {
    const p = particles[index];
    let wave = 0;
    for (let i = 0; i < waves.length; i++) {
      wave += Math.exp(-Math.pow((p.distances[i] - waves[i].center) / .11, 2)) * waves[i].strength;
    }
    const lift = 1 + wave * .021;
    let x = p.x * ca + p.z * sa;
    const z = p.z * ca - p.x * sa;
    let y = p.y * ct - z * st;
    const depth = p.y * st + z * ct;
    // Evaluate density before the drift, in view space, so the gradient stays
    // left-to-right while the globe rotates. Smooth fades avoid popping dots.
    const densityFalloff = Math.pow(smooth(-.95, .95, x), .8);
    const edge = Math.max(0, (x + .38) / 1.38);
    const dissolve = edge * edge * (.25 + p.variation * .75);
    x += dissolve * (.36 + .16 * Math.sin(time * .30 + p.phase));
    y += dissolve * .16 * Math.sin(time * .22 + p.phase);
    const fade = (1 - dissolve * .35) * smooth(0, .18, p.space - densityFalloff * .86);
    const perspective = camera / (camera - depth * lift);
    const front = smooth(.10, .47, depth);
    const rear = smooth(.02, .65, -depth) * smooth(.40, .80, p.variation);
    let alpha = ((.54 + .40 * Math.max(0, depth)) * front + .085 * rear) * fade;
    alpha *= .82 + .18 * p.space;
    // Quieter particles sit behind the normal tones; the wave can light up both.
    const baseTone = .44 + .56 * smooth(.20, .38, p.variation);
    alpha = clamp(alpha * .94 * baseTone + wave * .62 * fade);
    let r = 1.82 * (.83 + .17 * perspective) * (.95 + .10 * p.variation);
    r *= 1 + wave * .14;
    const q = projections[index];
    q.x = cx + x * lift * perspective * radius;
    q.y = cy - y * lift * perspective * radius;
    q.z = depth; q.r = r; q.alpha = alpha;
    if (echo) applyTouchEcho(q, echo, fade);
    if (q.alpha >= .002 && q.r > 0) projected.push(q);
  }

  projected.sort((a, b) => a.z - b.z);
  for (const p of projected) {
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Additional light only: the original rotation, waves and point sizes stay intact.
function applyTouchEcho(q, state, fade) {
  const { pointer, ripples } = state;
  const front = smooth(-.08, .42, q.z);
  const distance = Math.hypot(q.x - pointer.x, q.y - pointer.y);
  const contact = Math.exp(-Math.pow(distance / 34, 2)) * pointer.strength * front;
  q.alpha = clamp(q.alpha + contact * .88 * fade);
  for (const pulse of ripples) {
    const d = Math.hypot(q.x - pulse.x, q.y - pulse.y);
    const band = Math.exp(-Math.pow((d - pulse.radius) / 10, 2));
    const echo = Math.exp(-Math.pow((d - pulse.echoRadius) / 7, 2)) * .42;
    q.alpha = clamp(q.alpha + (band + echo) * pulse.decay * front * fade * 1.05 * pulse.strength);
  }
}
