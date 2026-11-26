'use client';

import { useEffect, useRef, useState } from 'react';
import { Music } from '@/lib/music';
import { burst } from '@/lib/effects';
import { colorVar, who, type People } from './Chip';

type Props = {
  ids: string[];
  target: string; // pre-decided winner; the wheel lands on it
  title: string;
  people: People;
  onClose: () => void;
};

/** Spinning name wheel used to pick the first drawer, or the next one after a cycle closes. */
export default function Wheel({ ids, target, title, people, onClose }: Props) {
  const [stage, setStage] = useState<'ready' | 'spinning' | 'done'>('ready');
  const [deg, setDeg] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Music.sfx('whoosh');
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  const n = ids.length;
  const seg = 360 / n;
  const background = `conic-gradient(${ids.map((id, i) => `${who(people, id).color} ${i * seg}deg ${(i + 1) * seg}deg`).join(',')})`;
  const fontSize = n > 14 ? '0.75rem' : n > 8 ? '0.95rem' : '1.15rem';
  const winner = who(people, target);

  const spin = () => {
    setStage('spinning');
    const idx = ids.indexOf(target);
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    setDeg(360 * 7 + (360 - ((idx + 0.5) * seg + jitter)));
    // ticking that slows down with the wheel
    let t = 0, gap = 45;
    while (t < 4800) { Music.sfx('tick', t / 1000); t += gap; gap *= 1.07; }
    timer.current = setTimeout(() => {
      setStage('done');
      Music.sfx('tada');
      void burst(0.5, 0.45);
    }, 5100);
  };

  return (
    <div className="overlay wheel-overlay">
      <h2 className="overlay-title">{title}</h2>
      <div className="wheel-wrap">
        <div className="wheel-pointer">🔻</div>
        <div
          className="wheel"
          style={{
            background,
            transform: `rotate(${deg}deg)`,
            transition: stage === 'ready' ? 'none' : 'transform 5s cubic-bezier(.12,.72,.1,1)',
          }}
        >
          {ids.map((id, i) => {
            const p = who(people, id);
            const mid = (i + 0.5) * seg;
            return (
              <div key={id} className={'wl' + (mid > 180 ? ' flip' : '')} style={{ transform: `rotate(${mid - 90}deg)`, fontSize }}>
                <span>{p.name} {p.avatar}</span>
              </div>
            );
          })}
          {ids.map((id, i) => <div key={'s' + id} className="wsep" style={{ transform: `rotate(${i * seg}deg)` }} />)}
        </div>
        <div className="wheel-center">🎅</div>
      </div>
      <div className={'wheel-result' + (stage === 'done' ? ' show' : '')}>
        {stage === 'done' && <>ได้แก่… <b style={colorVar(winner.color)}>{winner.avatar} {winner.name}</b> !!</>}
      </div>
      {stage === 'done' ? (
        <button className="big-btn" onClick={onClose}>ไปกันเลย! 🎁</button>
      ) : (
        <button className="big-btn" onClick={spin} disabled={stage === 'spinning'}>หมุนเลย! 🎡</button>
      )}
    </div>
  );
}
