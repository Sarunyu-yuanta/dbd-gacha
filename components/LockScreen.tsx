'use client';

import { useEffect } from 'react';
import { Music } from '@/lib/music';

type Props = {
  target: number; // unlock time (ms)
  now: number;
  unlocking: boolean;
  fading: boolean;
};

const LABELS = { d: 'วัน', h: 'ชั่วโมง', m: 'นาที', s: 'วินาที' } as const;

/** Countdown screen shown until the event date. */
export default function LockScreen({ target, now, unlocking, fading }: Props) {
  const total = Math.floor(Math.max(0, target - now) / 1000);
  const vals = {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };

  // last-10-seconds ticking
  useEffect(() => {
    if (total > 0 && total <= 10) Music.sfx('tick');
  }, [total]);

  const date = new Date(target).toLocaleString('th-TH', { dateStyle: 'full', timeStyle: 'short' });

  return (
    <div className={'overlay lock' + (fading ? ' fade' : '')}>
      <div className="lock-inner">
        <h2 className="lock-title">🔒 ตู้กาชาปองยังถูกล็อกอยู่!</h2>
        <p className="lock-sub">ซานต้ายังห่อของขวัญไม่เสร็จ 🎅 อดใจรออีกนิดนะ~</p>
        <div className={'locked-gift' + (unlocking ? ' unlock' : '')}>
          <div className="lg-box"><span>🎁</span></div>
          <div className="chain c1" /><div className="chain c2" />
          <div className="padlock">{unlocking ? '🔓' : '🔒'}</div>
        </div>
        <div className="countdown">
          {(Object.keys(LABELS) as (keyof typeof LABELS)[]).map((k) => {
            const v = String(vals[k]).padStart(2, '0');
            return (
              <div className="cd-box" key={k}>
                <div className="cd-num">{v}</div>
                <div className="cd-lbl">{LABELS[k]}</div>
              </div>
            );
          })}
        </div>
        <p className="lock-date">เปิดตู้: {date} น.</p>
      </div>
    </div>
  );
}
