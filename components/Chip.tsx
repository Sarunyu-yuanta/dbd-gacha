import type { CSSProperties } from 'react';
import type { Participant } from '@/lib/types';

export type People = Map<string, Participant>;

const UNKNOWN: Participant = { id: '?', name: '?', avatar: '❔', color: '#cccccc' };
export const who = (people: People, id: string | null | undefined): Participant =>
  (id && people.get(id)) || UNKNOWN;

export const colorVar = (color: string) => ({ '--c': color }) as CSSProperties;

export default function Chip({ p }: { p: Participant }) {
  return (
    <span className="chip" style={colorVar(p.color)}>
      <span className="av">{p.avatar}</span>
      {p.name}
    </span>
  );
}
