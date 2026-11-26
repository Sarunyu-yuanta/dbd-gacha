import type { GameState, Participant } from '@/lib/types';
import { giftsLeft, undrawn } from '@/lib/draw';
import { colorVar } from './Chip';

function Person({ p, current, hasGift, done }: { p: Participant; current: boolean; hasGift: boolean; done: boolean }) {
  return (
    <li className={'person' + (current ? ' current' : '')} style={colorVar(p.color)}>
      <span className="av">{p.avatar}</span>
      <span className="nm">{p.name}</span>
      {hasGift && <span className="gift-ic" title="ของขวัญยังอยู่ในตู้">🎁</span>}
      {current && <span className="turn-tag">ตานี้!</span>}
      {done && <span className="tick">✓</span>}
    </li>
  );
}

/** Left panel: who hasn't pressed yet / who already did. */
export default function PeoplePanel({ state }: { state: GameState }) {
  const und = new Set(undrawn(state));
  const gifts = new Set(giftsLeft(state));
  const remain = state.participants.filter((p) => und.has(p.id));
  const done = state.participants.filter((p) => !und.has(p.id));
  const row = (p: Participant) => (
    <Person key={p.id} p={p} current={p.id === state.currentDrawer} hasGift={gifts.has(p.id)} done={!und.has(p.id)} />
  );

  return (
    <section className="panel panel-people">
      <h2 className="panel-title">
        👥 ยังไม่ได้กด <span className="count">{remain.length}/{state.participants.length}</span>
      </h2>
      <ul className="people">
        {remain.length ? remain.map(row) : <li className="nobody">ครบทุกคนแล้ว 🎉</li>}
      </ul>
      {done.length > 0 && (
        <>
          <h3 className="sub-title">✅ กดแล้ว</h3>
          <ul className="people done">{done.map(row)}</ul>
        </>
      )}
    </section>
  );
}
