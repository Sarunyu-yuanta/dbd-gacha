'use client';

import { memo, useEffect, useRef, useState, type CSSProperties } from 'react';
import { startSnow } from '@/lib/effects';

type Star = { left: number; top: number; delay: number; dur: number; big: boolean };
type Bulb = { left: number; top: number; color: string; delay: number };
const BULB_COLORS = ['#ff3b5c', '#ffd23f', '#3ddc97', '#4cc9f0', '#c77dff', '#ff8c42'];

/** Night sky, stars, hills, trees, string lights, flying sleigh and snow. */
function Scenery() {
  const [stars, setStars] = useState<Star[]>([]);
  const [bulbs, setBulbs] = useState<Bulb[]>([]);
  const [sleighs, setSleighs] = useState<{ id: number; top: number }[]>([]);
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  // random stars (client only, avoids hydration mismatch)
  useEffect(() => {
    setStars(Array.from({ length: 90 }, () => ({
      left: Math.random() * 100, top: Math.random() * 60,
      delay: Math.random() * 4, dur: 2 + Math.random() * 3, big: Math.random() < 0.12,
    })));
  }, []);

  // string lights sized to the viewport
  useEffect(() => {
    const build = () => {
      const n = Math.max(10, Math.floor(innerWidth / 46));
      setBulbs(Array.from({ length: n }, (_, i) => {
        const x = (i + 0.5) / n;
        return { left: x * 100, top: Math.sin(x * Math.PI * 6) * 6 + 10, color: BULB_COLORS[i % BULB_COLORS.length], delay: (i % 3) * 0.4 };
      }));
    };
    build();
    addEventListener('resize', build);
    return () => removeEventListener('resize', build);
  }, []);

  // Santa flies by every ~28s
  useEffect(() => {
    let id = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const fly = () => {
      const s = { id: ++id, top: 6 + Math.random() * 18 };
      setSleighs((v) => [...v, s]);
      timers.push(setTimeout(() => setSleighs((v) => v.filter((x) => x.id !== s.id)), 14000));
    };
    timers.push(setTimeout(fly, 3000));
    const iv = setInterval(fly, 28000);
    return () => { clearInterval(iv); timers.forEach(clearTimeout); };
  }, []);

  // snow
  useEffect(() => {
    const stops = [
      backRef.current && startSnow(backRef.current, { count: 160, minR: 1, maxR: 4.5, speed: 0.9, flakes: true }),
      frontRef.current && startSnow(frontRef.current, { count: 18, minR: 5, maxR: 9, speed: 1.6, blur: 2, flakes: true }),
    ];
    return () => stops.forEach((s) => s && s());
  }, []);

  return (
    <>
      <div className="sky" aria-hidden>
        <div className="stars">
          {stars.map((s, i) => (
            <i key={i} className={'star' + (s.big ? ' big' : '')}
              style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }} />
          ))}
        </div>
        <div className="moon" />
        <div className="aurora" />
      </div>
      <canvas ref={backRef} className="snow-canvas back" aria-hidden />
      <div className="scenery" aria-hidden>
        <div className="hill hill-1" />
        <div className="hill hill-2" />
        <div className="tree t1">🎄</div><div className="tree t2">🌲</div><div className="tree t3">🎄</div>
        <div className="tree t4">🌲</div><div className="tree t5">🎄</div>
        <div className="house">🏠<span className="chimney-smoke">💨</span></div>
        <div className="snowman">⛄</div>
        <div className="penguin">🐧</div>
        <div className="gifts-pile">🎁<span>🎁</span><span>🎀</span></div>
      </div>
      <div className="lights" aria-hidden>
        {bulbs.map((b, i) => (
          <i key={i} style={{ left: `${b.left}%`, top: `${b.top}px`, animationDelay: `${b.delay}s`, '--c': b.color } as CSSProperties} />
        ))}
      </div>
      <div className="sleigh-layer" aria-hidden>
        {sleighs.map((s) => (
          <div key={s.id} className="sleigh" style={{ top: `${s.top}vh` }}>
            <span>🦌</span><span>🦌</span><span>🦌</span><span className="sl">🛷</span><span className="santa">🎅</span><span className="trail">✨</span>
          </div>
        ))}
      </div>
      <canvas ref={frontRef} className="snow-canvas front" aria-hidden />
    </>
  );
}

export default memo(Scenery);
