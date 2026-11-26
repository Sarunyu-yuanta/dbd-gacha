'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Music } from '@/lib/music';

export type MachineHandle = {
  crank: () => Promise<void>;
  shake: (ms: number) => Promise<void>;
  take: (id: string) => void;
  dropOut: (color: string) => Promise<void>;
  hideOut: () => void;
};

type Props = {
  gifts: { id: string; color: string }[]; // gifts still inside the machine
  ready: boolean; // knob is pressable
  busy: boolean;
  label: string; // what turning the knob does (a11y)
  onKnob: () => void;
};

type Ball = { id: string; el: HTMLDivElement; x: number; y: number; vx: number; vy: number; rot: number };

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Simple circle-constrained ball physics inside the glass dome (imperative DOM for 60fps). */
class BallPit {
  balls: Ball[] = [];
  R = 150;
  r = 22;
  constructor(public dome: HTMLDivElement) {}

  sync(gifts: { id: string; color: string }[]) {
    const want = new Set(gifts.map((g) => g.id));
    this.balls = this.balls.filter((b) => { if (!want.has(b.id)) { b.el.remove(); return false; } return true; });
    const have = new Set(this.balls.map((b) => b.id));
    gifts.forEach((g) => { if (!have.has(g.id)) this.add(g.id, g.color); });
    this.resize();
  }
  add(id: string, color: string) {
    const el = document.createElement('div');
    el.className = 'ball';
    el.style.setProperty('--c', color);
    this.dome.insertBefore(el, this.dome.firstChild);
    this.balls.push({ id, el, x: (Math.random() - 0.5) * this.R, y: -this.R * 0.6 * Math.random(), vx: (Math.random() - 0.5) * 200, vy: 0, rot: Math.random() * 360 });
  }
  resize() {
    this.R = this.dome.clientWidth / 2;
    const n = Math.max(1, this.balls.length);
    this.r = Math.max(11, Math.min(this.R * 0.17, (this.R * 0.62) / Math.sqrt(n)));
    this.balls.forEach((b) => { b.el.style.width = b.el.style.height = this.r * 2 + 'px'; });
  }
  step(dt: number) {
    const R = this.R - this.r - 5, r = this.r, g = 1400, bs = this.balls;
    for (const b of bs) { b.vy += g * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= 0.995; }
    for (let it = 0; it < 3; it++) {
      for (let i = 0; i < bs.length; i++) {
        for (let j = i + 1; j < bs.length; j++) {
          const a = bs[i], b = bs[j];
          const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01;
          if (d < 2 * r) {
            const nx = dx / d, ny = dy / d, o = (2 * r - d) / 2;
            a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o;
            const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (rv < 0) { const imp = (-rv * 0.85) / 2; a.vx -= imp * nx; a.vy -= imp * ny; b.vx += imp * nx; b.vy += imp * ny; }
          }
        }
      }
      for (const b of bs) {
        const d = Math.hypot(b.x, b.y);
        if (d > R) {
          const nx = b.x / d, ny = b.y / d;
          b.x = nx * R; b.y = ny * R;
          const vn = b.vx * nx + b.vy * ny;
          if (vn > 0) { b.vx -= 1.55 * vn * nx; b.vy -= 1.55 * vn * ny; b.vx *= 0.97; }
        }
      }
    }
    for (const b of bs) {
      b.rot += b.vx * dt * 1.5;
      b.el.style.transform = `translate(${b.x - r + this.R}px, ${b.y - r + this.R}px) rotate(${b.rot}deg)`;
    }
  }
  kick(power = 1) {
    this.balls.forEach((b) => { b.vy -= (500 + Math.random() * 700) * power; b.vx += (Math.random() - 0.5) * 900 * power; });
  }
  take(id: string) {
    const i = this.balls.findIndex((b) => b.id === id);
    if (i < 0) return;
    const [b] = this.balls.splice(i, 1);
    b.el.classList.add('sucked');
    setTimeout(() => b.el.remove(), 600);
  }
}

const GachaMachine = forwardRef<MachineHandle, Props>(function GachaMachine({ gifts, ready, busy, label, onKnob }, ref) {
  const domeRef = useRef<HTMLDivElement>(null);
  const machineRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLSpanElement>(null);
  const outRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const pitRef = useRef<BallPit | null>(null);
  const busyRef = useRef(busy);
  busyRef.current = busy;

  // physics loop + idle jiggle
  useEffect(() => {
    const pit = (pitRef.current = new BallPit(domeRef.current!));
    let last = performance.now(), raf = 0;
    const loop = (t: number) => {
      const dt = Math.min(0.033, (t - last) / 1000); last = t;
      pit.step(dt / 2); pit.step(dt / 2);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const idle = setInterval(() => {
      if (busyRef.current || !pit.balls.length) return;
      const b = pit.balls[Math.floor(Math.random() * pit.balls.length)];
      b.vy -= 350; b.vx += (Math.random() - 0.5) * 300;
    }, 1800);
    const onResize = () => pit.resize();
    addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf); clearInterval(idle); removeEventListener('resize', onResize);
      pit.balls.forEach((b) => b.el.remove());
      pitRef.current = null;
    };
  }, []);

  const giftKey = gifts.map((g) => g.id + g.color).join('|');
  useEffect(() => {
    pitRef.current?.sync(gifts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giftKey]);

  useImperativeHandle(ref, () => ({
    async crank() {
      spinRef.current?.classList.add('turn');
      Music.sfx('crank');
      await wait(650);
    },
    async shake(ms) {
      const m = machineRef.current!;
      m.classList.add('shake');
      Music.sfx('rattle');
      const end = performance.now() + ms;
      while (performance.now() < end) { pitRef.current?.kick(0.7); await wait(180); }
      m.classList.remove('shake');
      spinRef.current?.classList.remove('turn');
    },
    take(id) {
      pitRef.current?.take(id);
      if (countRef.current) countRef.current.textContent = String(pitRef.current?.balls.length ?? 0);
    },
    async dropOut(color) {
      const ob = outRef.current!;
      ob.style.setProperty('--c', color);
      ob.classList.remove('hidden', 'drop'); void ob.offsetWidth; ob.classList.add('drop');
      Music.sfx('roll');
      Music.sfx('bounce', 0.75); Music.sfx('bounce', 1.0); Music.sfx('bounce', 1.18);
      await wait(1500);
    },
    hideOut() { outRef.current?.classList.add('hidden'); },
  }), []);

  return (
    <div className="machine-wrap">
      <div className="machine" ref={machineRef}>
        <div className="machine-cap"><span className="cap-star">⭐</span><span className="cap-bow">🎀</span></div>
        <div className="dome" ref={domeRef}>
          <div className="dome-shine" />
          <div className="dome-snow" />
        </div>
        <div className="machine-body">
          <div className="body-lights"><i /><i /><i /><i /><i /><i /><i /></div>
          <div className="machine-label">🎁 DBD GACHA 🎁</div>
          <div className="gifts-left-badge"><span ref={countRef}>{gifts.length}</span> ชิ้นในตู้</div>
          <button className={'knob' + (ready ? ' ready' : '')} aria-label={label} title={label} disabled={busy} onClick={onKnob}>
            <span className="knob-spin" ref={spinRef}><span className="knob-handle" /></span>
          </button>
          <div className="outlet"><div className="outlet-flap" /></div>
          <div className="out-ball hidden" ref={outRef} />
          <div className="holly">🌿</div>
        </div>
        <div className="machine-base" />
      </div>
    </div>
  );
});

export default GachaMachine;
