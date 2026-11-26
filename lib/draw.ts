// ===== Draw logic: chain ("ต่อกันเป็นทอด") gift exchange =====
// - คนกดจะไม่ได้ของขวัญของตัวเอง
// - คนกดตาถัดไป = เจ้าของของขวัญที่เพิ่งได้ไป (ถ้าเขายังไม่ได้กด)
// - ถ้าวงครบรอบ (เจ้าของกดไปแล้ว) จะสุ่มคนต่อไปจากคนที่ยังไม่ได้กด
// - กันทางตัน: ไม่ปล่อยให้คนสุดท้ายเหลือแต่ของขวัญของตัวเอง
import type { GameState, NextDrawer, Phase } from './types';

type DrawState = Pick<GameState, 'participants' | 'results'>;

export const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function undrawn(s: DrawState): string[] {
  const done = new Set(s.results.map((r) => r.drawer));
  return s.participants.filter((p) => !done.has(p.id)).map((p) => p.id);
}

export function giftsLeft(s: DrawState): string[] {
  const taken = new Set(s.results.map((r) => r.owner));
  return s.participants.filter((p) => !taken.has(p.id)).map((p) => p.id);
}

export function pickGift(s: DrawState, drawer: string): string {
  const und = undrawn(s);
  const gifts = giftsLeft(s);
  let options = gifts.filter((g) => g !== drawer);
  // เหลือ 2 คน: ถ้าของของอีกคนยังอยู่ ต้องหยิบอันนั้น ไม่งั้นคนสุดท้ายจะเหลือแต่ของตัวเอง
  if (und.length === 2) {
    const other = und.find((x) => x !== drawer);
    if (other && gifts.includes(other)) options = [other];
  }
  return pick(options);
}

export function nextDrawer(s: DrawState, lastOwner: string): NextDrawer {
  const und = undrawn(s);
  if (!und.length) return null;
  if (und.includes(lastOwner)) return { id: lastOwner, chained: true };
  return { id: pick(und), chained: false };
}

export function phaseOf(s: GameState): Phase {
  if (s.participants.length < 2) return 'empty';
  if (s.results.length >= s.participants.length) return 'done';
  if (!s.currentDrawer) return 'setup';
  return 'playing';
}
