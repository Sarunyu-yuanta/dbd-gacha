'use client';

import { useEffect, useRef } from 'react';
import type { DrawResult } from '@/lib/types';
import { Music } from '@/lib/music';
import { sideCannons, startFireworks } from '@/lib/effects';
import { ResultRow } from './ResultsPanel';
import type { People } from './Chip';

/** Final summary with New Year fireworks. */
export default function DoneOverlay({ results, people, onClose }: { results: DrawResult[]; people: People; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stop = canvasRef.current ? startFireworks(canvasRef.current) : () => {};
    Music.sfx('fanfare');
    void sideCannons(2500);
    return stop;
  }, []);

  return (
    <div className="overlay done-overlay">
      <canvas ref={canvasRef} className="fireworks" />
      <div className="done-card">
        <h2 className="done-title">🎊 จับครบทุกคนแล้ว! 🎊</h2>
        <p className="done-sub">Merry Christmas &amp; Happy New Year <b className="year">2027</b> 🎆</p>
        <ol className="results summary">
          {results.map((r, i) => <ResultRow key={r.at + r.drawer} r={r} i={i} people={people} delay={i * 0.08} />)}
        </ol>
        <button className="big-btn" onClick={onClose}>กลับไปดูบอร์ด 🎄</button>
      </div>
    </div>
  );
}
