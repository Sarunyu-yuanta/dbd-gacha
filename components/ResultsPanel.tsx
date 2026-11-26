'use client';

import { useEffect, useRef } from 'react';
import type { DrawResult } from '@/lib/types';
import Chip, { who, type People } from './Chip';

export function ResultRow({ r, i, people, isNew, delay }: { r: DrawResult; i: number; people: People; isNew?: boolean; delay?: number }) {
  return (
    <li className={'res' + (isNew ? ' new' : '')} style={delay !== undefined ? { animationDelay: `${delay}s` } : undefined}>
      <span className="no">{i + 1}</span>
      <Chip p={who(people, r.drawer)} />
      <span className="arrow">ได้ของ<span className="gift-fly">🎁</span></span>
      <Chip p={who(people, r.owner)} />
    </li>
  );
}

/** Right panel: who got whose gift, in order. */
export default function ResultsPanel({ results, people, animateLast }: { results: DrawResult[]; people: People; animateLast: boolean }) {
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    if (animateLast) listRef.current?.lastElementChild?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [results.length, animateLast]);

  return (
    <section className="panel panel-results">
      <h2 className="panel-title">🎁 ใครได้ของใคร <span className="count">{results.length}</span></h2>
      <ol className="results" ref={listRef}>
        {results.map((r, i) => (
          <ResultRow key={r.at + r.drawer} r={r} i={i} people={people} isNew={animateLast && i === results.length - 1} />
        ))}
      </ol>
      {!results.length && (
        <div className="empty-results">ยังไม่มีใครเปิดกาชาปอง<br />⛄ รอลุ้นกันนะ~</div>
      )}
    </section>
  );
}
