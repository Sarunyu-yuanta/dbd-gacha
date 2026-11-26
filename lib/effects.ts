// ===== Canvas effects: snow, confetti, fireworks (client only) =====
import { Music } from './music';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Snow ----------
type SnowOpts = { count: number; minR: number; maxR: number; speed: number; blur?: number; flakes?: boolean };
type Flake = { x: number; y: number; r: number; depth: number; vy: number; phase: number; sway: number; rot: number; vr: number; star: boolean; a: number };

/** Starts a snow animation on the canvas. Returns a cleanup function. */
export function startSnow(canvas: HTMLCanvasElement, { count, minR, maxR, speed, blur, flakes }: SnowOpts) {
  const c = canvas.getContext('2d');
  if (!c) return () => {};
  let w = 0, h = 0, dpr = 1, mouseX = 0.5, raf = 0, last = performance.now();
  const parts: Flake[] = [];
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.5); // soft snow doesn't need retina res
    w = canvas.width = innerWidth * dpr; h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px';
  };
  const onMove = (e: PointerEvent) => { mouseX = e.clientX / innerWidth; };
  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', onMove);

  const make = (init: boolean): Flake => {
    const r = minR + Math.random() * (maxR - minR);
    return {
      x: Math.random() * w, y: init ? Math.random() * h : -20 * dpr, r: r * dpr, depth: r / maxR,
      vy: speed * (0.5 + r / maxR) * dpr * (0.7 + Math.random() * 0.6),
      phase: Math.random() * Math.PI * 2, sway: 0.5 + Math.random() * 1.5,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.02,
      star: !!flakes && r > maxR * 0.6 && Math.random() < 0.6, a: 0.55 + Math.random() * 0.45,
    };
  };
  const n = prefersReducedMotion() ? Math.ceil(count / 4) : count;
  for (let i = 0; i < n; i++) parts.push(make(true));

  // Pre-render sprites once (gradient dot + 6-arm flake, blur baked in) and
  // just drawImage them each frame — no per-frame gradients, paths or filters.
  const SPRITE = 64, pad = (blur ?? 0) * 3;
  const sprite = (draw: (g: CanvasRenderingContext2D, r: number) => void) => {
    const s = document.createElement('canvas');
    s.width = s.height = SPRITE + pad * 2;
    const g = s.getContext('2d')!;
    if (blur) g.filter = `blur(${blur}px)`;
    g.translate(s.width / 2, s.height / 2);
    draw(g, SPRITE / 2);
    return s;
  };
  const dot = sprite((g, r) => {
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
  });
  // flake arms reach 1.6r, so scale the sprite so 1.6r fits in SPRITE/2
  const FLAKE_K = 1.6;
  const flake = sprite((g, R) => {
    const r = R / FLAKE_K;
    g.strokeStyle = '#fff'; g.lineWidth = Math.max(1.5, r * 0.18); g.lineCap = 'round';
    for (let k = 0; k < 6; k++) {
      g.rotate(Math.PI / 3);
      g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -r * 1.55);
      g.moveTo(0, -r * 0.9); g.lineTo(-r * 0.45, -r * 1.3);
      g.moveTo(0, -r * 0.9); g.lineTo(r * 0.45, -r * 1.3);
      g.stroke();
    }
  });
  const spriteScale = (SPRITE + pad * 2) / SPRITE;

  const frame = (now: number) => {
    const dt = Math.min(50, now - last) / 16.67; last = now;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, w, h);
    const px = mouseX - 0.5;
    for (const p of parts) {
      p.phase += 0.01 * dt * p.sway;
      p.y += p.vy * dt;
      p.x += (Math.sin(p.phase) * 0.6 + 0.3) * dpr * dt * p.depth - px * p.depth * 1.2 * dpr * dt;
      p.rot += p.vr * dt;
      if (p.y > h + 20 * dpr || p.x < -40 * dpr || p.x > w + 40 * dpr) Object.assign(p, make(false), { x: Math.random() * w });
      c.globalAlpha = p.a;
      if (p.star) {
        const size = p.r * FLAKE_K * 2 * spriteScale;
        const cos = Math.cos(p.rot), sin = Math.sin(p.rot);
        c.setTransform(cos, sin, -sin, cos, p.x, p.y);
        c.drawImage(flake, -size / 2, -size / 2, size, size);
        c.setTransform(1, 0, 0, 1, 0, 0);
      } else {
        const size = p.r * 2 * spriteScale;
        c.drawImage(dot, p.x - size / 2, p.y - size / 2, size, size);
      }
    }
    c.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    removeEventListener('resize', resize);
    removeEventListener('pointermove', onMove);
  };
}

// ---------- Confetti ----------
const COLORS = ['#ff3b5c', '#ffd23f', '#3ddc97', '#ffffff', '#4cc9f0', '#c77dff'];
type ConfettiFn = typeof import('canvas-confetti');
let confettiP: Promise<ConfettiFn> | null = null;
let shapes: unknown[] | null = null;
const loadConfetti = () => (confettiP ??= import('canvas-confetti').then((m) => (m.default ?? m) as ConfettiFn));

export async function burst(x = 0.5, y = 0.5) {
  const confetti = await loadConfetti();
  confetti({ particleCount: 140, spread: 100, startVelocity: 45, origin: { x, y }, colors: COLORS, zIndex: 2000 });
  if (shapes === null) {
    try { shapes = ['🎄', '⭐', '🎁', '❄️', '🔔'].map((text) => confetti.shapeFromText({ text, scalar: 2 })); }
    catch { shapes = []; }
  }
  if (shapes.length) {
    confetti({ particleCount: 25, spread: 120, startVelocity: 35, origin: { x, y }, shapes: shapes as never, scalar: 2, zIndex: 2000 });
  }
}

export async function sideCannons(ms = 1500) {
  const confetti = await loadConfetti();
  const end = Date.now() + ms;
  const f = () => {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors: COLORS, zIndex: 2000 });
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors: COLORS, zIndex: 2000 });
    if (Date.now() < end) requestAnimationFrame(f);
  };
  f();
}

// ---------- Fireworks ----------
type Rocket = { x: number; y: number; vx: number; vy: number; hue: number; ty: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; hue: number };

/** Starts fireworks on the canvas. Returns a stop function. */
export function startFireworks(canvas: HTMLCanvasElement) {
  const c = canvas.getContext('2d');
  if (!c) return () => {};
  let running = true, rockets: Rocket[] = [], sparks: Spark[] = [], w = 0, h = 0, launchT = 0, raf = 0;
  const resize = () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; };
  resize();
  addEventListener('resize', resize);
  const launch = () => rockets.push({
    x: w * (0.15 + Math.random() * 0.7), y: h, vx: (Math.random() - 0.5) * 2,
    vy: -(h / 70 + Math.random() * 4), hue: Math.floor(Math.random() * 360), ty: h * (0.15 + Math.random() * 0.3),
  });
  const explode = (r: Rocket) => {
    const n = 70 + Math.random() * 40;
    const heart = Math.random() < 0.25;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const sp = 2 + Math.random() * 4;
      let vx = Math.cos(a) * sp, vy = Math.sin(a) * sp;
      if (heart) {
        const k = 0.25;
        vx = 16 * Math.pow(Math.sin(a), 3) * k;
        vy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * k;
      }
      sparks.push({ x: r.x, y: r.y, vx, vy, life: 1, hue: r.hue + Math.random() * 40 });
    }
    Music.sfx('boom');
  };
  const frame = (t: number) => {
    if (!running) { c.clearRect(0, 0, w, h); return; }
    c.globalCompositeOperation = 'destination-out';
    c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = 'lighter';
    if (t - launchT > 650) { launch(); launchT = t; }
    rockets = rockets.filter((r) => {
      r.x += r.vx; r.y += r.vy; r.vy += 0.05;
      c.fillStyle = `hsl(${r.hue},100%,75%)`; c.beginPath(); c.arc(r.x, r.y, 3, 0, 7); c.fill();
      if (r.y <= r.ty || r.vy >= 0) { explode(r); return false; }
      return true;
    });
    sparks = sparks.filter((s) => {
      s.x += s.vx; s.y += s.vy; s.vy += 0.045; s.vx *= 0.985; s.vy *= 0.985; s.life -= 0.012;
      c.fillStyle = `hsla(${s.hue},100%,65%,${s.life})`;
      c.beginPath(); c.arc(s.x, s.y, 2.2, 0, 7); c.fill();
      return s.life > 0;
    });
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => { running = false; cancelAnimationFrame(raf); removeEventListener('resize', resize); };
}
