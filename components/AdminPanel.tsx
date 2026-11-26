'use client';

import { useState } from 'react';
import type { GameState } from '@/lib/types';

type Props = {
  state: GameState;
  dev: boolean;
  onClose: () => void;
  onSaveNames: (names: string[]) => void;
  onSaveEvent: (iso: string) => void;
  onUndo: () => void;
  onReset: () => void;
  onCopy: () => void;
  onDevChange: (on: boolean) => void;
  onSimulate: () => void;
};

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 🛠️ Settings: participants, event date, undo/reset, dev mode. */
export default function AdminPanel(props: Props) {
  const { state, dev, onClose } = props;
  const [names, setNames] = useState(state.participants.map((p) => p.name).join('\n'));
  const [eventAt, setEventAt] = useState(toLocalInput(state.eventDate));

  return (
    <div className="overlay admin" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-card">
        <button className="close-x" onClick={onClose} aria-label="ปิด">✖</button>
        <h2>🛠️ ตั้งค่างาน</h2>

        <label className="field">
          <span>รายชื่อผู้ร่วมกิจกรรม (บรรทัดละ 1 คน)</span>
          <textarea rows={8} value={names} onChange={(e) => setNames(e.target.value)} />
        </label>
        <button className="btn" onClick={() => props.onSaveNames(names.split('\n').map((s) => s.trim()).filter(Boolean))}>
          💾 บันทึกรายชื่อ (ล้างผลการจับ)
        </button>

        <label className="field">
          <span>วัน-เวลาเปิดตู้กาชาปอง</span>
          <input type="datetime-local" value={eventAt} onChange={(e) => setEventAt(e.target.value)} />
        </label>
        <button className="btn" onClick={() => eventAt && props.onSaveEvent(new Date(eventAt).toISOString())}>📅 บันทึกวันเวลา</button>

        <div className="admin-row">
          <button className="btn" onClick={props.onUndo} disabled={!state.results.length}>↩️ ย้อนตาล่าสุด</button>
          <button className="btn" onClick={props.onReset}>🔄 เริ่มใหม่ (ล้างผล)</button>
          <button className="btn" onClick={props.onCopy}>📋 คัดลอกผล</button>
        </div>

        <div className="dev-box">
          <label className="switch">
            <span>🛠 Dev mode (ข้ามการล็อก)</span>
            <input type="checkbox" role="switch" checked={dev} onChange={(e) => props.onDevChange(e.target.checked)} />
            <span className="switch-track" aria-hidden><span className="switch-thumb" /></span>
          </label>
          {dev && <button className="btn" onClick={props.onSimulate}>⏱ จำลองนับถอยหลัง 10 วิ</button>}
        </div>
      </div>
    </div>
  );
}
