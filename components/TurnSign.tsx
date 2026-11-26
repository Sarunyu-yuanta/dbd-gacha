import type { CSSProperties, ReactNode } from 'react';
import type { Participant, Phase } from '@/lib/types';
import { colorVar } from './Chip';

/** "ตานี้ถึงคิว" sign above the machine. Re-mounts (key) on change to replay the pop animation. */
export default function TurnSign({ phase, drawer }: { phase: Phase; drawer: Participant | null }) {
  let key: string = phase;
  let name: ReactNode;
  let hint: string;
  let style: CSSProperties | undefined;

  if (phase === 'playing' && drawer) {
    key = drawer.id;
    name = <><span className="av">{drawer.avatar}</span>{drawer.name}</>;
    hint = 'หมุนลูกบิดบนตู้ได้เลย!';
    style = colorVar(drawer.color);
  } else if (phase === 'setup') {
    name = '❓ ใครกันนะ?'; hint = 'หมุนลูกบิดเพื่อสุ่มคนกดคนแรก';
  } else if (phase === 'done') {
    name = '🎊 ครบแล้ว!'; hint = 'หมุนลูกบิดเพื่อดูสรุปผล 🎄';
  } else {
    name = '📝 ใส่รายชื่อก่อน'; hint = 'กด ⚙️ มุมขวาบนเพื่อเพิ่มรายชื่ออย่างน้อย 2 คน';
  }

  return (
    <div className="turn-sign pop" key={key}>
      <div className="sign-ribbon">🎯 ตานี้ถึงคิว</div>
      <div className="sign-name" style={style}>{name}</div>
      <div className="sign-hint">{hint}</div>
    </div>
  );
}
