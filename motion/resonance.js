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

for (let row = 1; row < 31; row++) {
  const lat = -Math.PI / 2 + row / 31 * Math.PI;
  const count = Math.max(4, Math.round(TAU * Math.cos(lat) / .105));
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
  const projected = [];

  for (const p of particles) {
    const wave = p.distances.reduce((value, distance, i) => {
      const phase = (time / 6.8 + i / 3) % 1;
      return value + Math.exp(-Math.pow((distance - phase * 1.55) / .11, 2)) * Math.sin(Math.PI * phase);
    }, 0);
    const lift = 1 + wave * .021;
    let x = p.x * ca + p.z * sa;
    const z = p.z * ca - p.x * sa;
    let y = p.y * ct - z * st;
    const depth = p.y * st + z * ct;
    const edge = Math.max(0, (x + .22) / 1.22);
    const dissolve = edge * edge * (.25 + p.variation * .75);
    x += dissolve * (.18 + .09 * Math.sin(time * .30 + p.phase));
    y += dissolve * .10 * Math.sin(time * .22 + p.phase);
    const fade = (1 - dissolve * .35) * smooth(0, .22, p.space - edge * .56);
    const perspective = camera / (camera - depth * lift);
    const front = smooth(.10, .47, depth);
    const rear = smooth(.02, .65, -depth) * smooth(.40, .80, p.variation);
    let alpha = ((.54 + .40 * Math.max(0, depth)) * front + .085 * rear) * fade;
    alpha *= .82 + .18 * p.space;
    // Quieter particles sit behind the normal tones; the wave can light up both.
    const baseTone = .44 + .56 * smooth(.20, .38, p.variation);
    alpha = clamp(alpha * .67 * baseTone + wave * .62 * fade);
    let r = 1.58 * (.83 + .17 * perspective) * (.95 + .10 * p.variation);
    r *= 1 + wave * .14;
    const q = { x: cx + x * lift * perspective * radius, y: cy - y * lift * perspective * radius, z: depth, r, alpha };
    if (touchEcho) applyTouchEcho(q, touchEcho, time, fade);
    projected.push(q);
  }

  projected.sort((a, b) => a.z - b.z);
  for (const p of projected) {
    if (p.alpha < .002 || p.r <= 0) continue;
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Additional light only: the original rotation, waves and point sizes stay intact.
function applyTouchEcho(q, state, time, fade) {
  const { pointer, ripples } = state;
  const front = smooth(-.08, .42, q.z);
  const distance = Math.hypot(q.x - pointer.x, q.y - pointer.y);
  const contact = Math.exp(-Math.pow(distance / 34, 2)) * pointer.strength * front;
  q.alpha = clamp(q.alpha + contact * .88 * fade);
  for (const pulse of ripples) {
    const progress = (time - pulse.time) / 1.65;
    if (progress < 0 || progress > 1) continue;
    const d = Math.hypot(q.x - pulse.x, q.y - pulse.y);
    const band = Math.exp(-Math.pow((d - progress * 245) / 10, 2));
    const echo = Math.exp(-Math.pow((d - Math.max(0, progress - .17) * 245) / 7, 2)) * .42;
    const strength = Math.min(pulse.strength ?? 1, pointer.strength);
    q.alpha = clamp(q.alpha + (band + echo) * Math.pow(1 - progress, .65) * front * fade * 1.05 * strength);
  }
}
