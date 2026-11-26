'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { NextDrawer, Participant } from '@/lib/types';
import { Music } from '@/lib/music';
import { burst, sideCannons } from '@/lib/effects';
import Chip, { colorVar } from './Chip';

type Props = {
  drawer: Participant;
  owner: Participant;
  next: NextDrawer;
  nextP: Participant | null;
  onNext: () => void;
};

type Stage = 'enter' | 'wiggle' | 'opening' | 'open';

/** Big capsule flies in, wiggles, splits open, and reveals whose gift it is. */
export default function Reveal({ drawer, owner, next, nextP, onNext }: Props) {
  const [stage, setStage] = useState<Stage>('enter');
  const opened = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const open = useCallback(() => {
    if (opened.current) return;
    opened.current = true;
    setStage('opening');
    Music.sfx('pop');
    timers.current.push(setTimeout(() => {
      setStage('open');
      Music.sfx('tada');
      void burst(0.5, 0.5);
      void sideCannons(1200);
    }, 350));
  }, []);

  useEffect(() => {
    Music.sfx('whoosh');
    const t = timers.current;
    t.push(setTimeout(() => setStage((s) => (s === 'enter' ? 'wiggle' : s)), 900));
    t.push(setTimeout(open, 4000));
    return () => t.forEach(clearTimeout);
  }, [open]);

  let nextText;
  if (!next) nextText = <>🎊 ทุกคนได้ของขวัญครบแล้ว!</>;
  else if (next.chained && nextP) nextText = <>ตาต่อไป: <Chip p={nextP} /> <small>(เจ้าของของขวัญชิ้นนี้)</small></>;
  else nextText = <>🔁 วงครบรอบ! เดี๋ยวหมุนวงล้อหาคนต่อไป</>;

  return (
    <div className={'overlay reveal' + (stage === 'open' ? ' opened' : '')}>
      <div className="rays" />
      <div className={'big-capsule ' + stage} style={colorVar(owner.color)} onClick={open}>
        <div className="cap-half cap-top" />
        <div className="cap-half cap-bottom" />
        <div className="cap-hint">แตะเพื่อเปิด! ✨</div>
      </div>
      {stage === 'open' && (
        <div className="reveal-card">
          <div className="rc-top">🎉 ยินดีด้วย! 🎉</div>
          <div className="rc-who">
            <span className="rc-av" style={colorVar(drawer.color)}>{drawer.avatar}</span><b>{drawer.name}</b>
          </div>
          <div className="rc-mid">ได้ของขวัญจาก</div>
          <div className="rc-owner" style={colorVar(owner.color)}>
            <span className="rc-av big">{owner.avatar}</span><b>{owner.name}</b>
          </div>
          <div className="rc-next">{nextText}</div>
          <button className="big-btn" onClick={onNext}>{next ? 'ต่อไป ➜' : 'ดูสรุปผล 🎊'}</button>
        </div>
      )}
    </div>
  );
}
