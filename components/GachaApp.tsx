'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GameState, NextDrawer } from '@/lib/types';
import { IS_DEV_ENV } from '@/lib/config';
import { giftsLeft, nextDrawer, phaseOf, pick, pickGift, undrawn } from '@/lib/draw';
import { getDevPref, getMuted, loadState, makeParticipants, saveState, setDevPref, setMuted } from '@/lib/storage';
import { Music } from '@/lib/music';
import { burst, sideCannons } from '@/lib/effects';
import Scenery from './Scenery';
import Header from './Header';
import PeoplePanel from './PeoplePanel';
import ResultsPanel from './ResultsPanel';
import TurnSign from './TurnSign';
import GachaMachine, { type MachineHandle } from './GachaMachine';
import Wheel from './Wheel';
import Reveal from './Reveal';
import LockScreen from './LockScreen';
import DoneOverlay from './DoneOverlay';
import AdminPanel from './AdminPanel';
import Gate from './Gate';
import Toasts, { useToasts } from './Toasts';
import Chip, { who, type People } from './Chip';

type WheelReq = { ids: string[]; target: string; title: string; key: number };
type RevealReq = { drawer: string; owner: string; next: NextDrawer };
type LockPhase = 'hidden' | 'shown' | 'unlocking';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const peopleOf = (s: GameState): People => new Map(s.participants.map((p) => [p.id, p]));

export default function GachaApp() {
  // ---------- game state (persisted) ----------
  const [state, setState] = useState<GameState | null>(null);
  const sRef = useRef<GameState | null>(null);
  /** Persist; `render=false` lets an animation finish before the board updates. */
  const commit = useCallback((next: GameState, render = true) => {
    sRef.current = next;
    saveState(next);
    if (render) setState(next);
  }, []);

  // ---------- UI state ----------
  const [dev, setDev] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [songName, setSongName] = useState('');
  const [gate, setGate] = useState(true);
  const [busy, setBusyState] = useState(false);
  const busyRef = useRef(false);
  const setBusy = (b: boolean) => { busyRef.current = b; setBusyState(b); };
  const [animateLast, setAnimateLast] = useState(false);
  const [wheel, setWheel] = useState<WheelReq | null>(null);
  const wheelResolve = useRef<(() => void) | null>(null);
  const [reveal, setReveal] = useState<RevealReq | null>(null);
  const revealResolve = useRef<(() => void) | null>(null);
  const [doneOpen, setDoneOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [lockPhase, setLockPhase] = useState<LockPhase>('hidden');
  const [lockFading, setLockFading] = useState(false);
  const [simulateUntil, setSimulateUntil] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const { toasts, toast } = useToasts();
  const machine = useRef<MachineHandle>(null);

  // ---------- boot (client only) ----------
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('dev')) setDevPref(params.get('dev') === '0' ? 'off' : 'on');
    const pref = getDevPref();
    const d = pref ? pref === 'on' : IS_DEV_ENV;
    let s = loadState();
    if (s.needWheel) s = { ...s, needWheel: false }; // refreshed mid-wheel: just show the drawer
    sRef.current = s;
    setState(s);
    setDev(d);
    setMutedState(getMuted());
    setNow(Date.now());
    setLockPhase(!d && Date.now() < new Date(s.eventDate).getTime() ? 'shown' : 'hidden');
    Music.onSong(setSongName);
    return () => Music.stop();
  }, []);

  // ---------- countdown lock ----------
  const loaded = state !== null;
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const t = Date.now();
      const locked = simulateUntil ? t < simulateUntil : !dev && t < new Date(sRef.current!.eventDate).getTime();
      if (lockPhase === 'shown') { setNow(t); if (!locked) setLockPhase('unlocking'); }
      else if (lockPhase === 'hidden' && locked) { setNow(t); setLockPhase('shown'); }
    }, 250);
    return () => clearInterval(id);
  }, [loaded, dev, simulateUntil, lockPhase]);

  useEffect(() => {
    if (lockPhase !== 'unlocking') return;
    Music.sfx('unlock');
    const ts = [
      setTimeout(() => { void burst(0.5, 0.45); void sideCannons(1500); Music.sfx('tada', 0.2); }, 700),
      setTimeout(() => setLockFading(true), 2300),
      setTimeout(() => {
        setLockPhase('hidden'); setLockFading(false); setSimulateUntil(null);
        toast('🎄 ตู้กาชาปองเปิดแล้ว! สนุกกันให้เต็มที่นะ 🎁', 3500);
      }, 3100),
    ];
    return () => ts.forEach(clearTimeout);
  }, [lockPhase, toast]);

  // ---------- overlay promises ----------
  const spinWheel = (ids: string[], target: string, title: string) =>
    new Promise<void>((res) => { wheelResolve.current = res; setWheel({ ids, target, title, key: Date.now() }); });
  const closeWheel = () => { setWheel(null); wheelResolve.current?.(); wheelResolve.current = null; };
  const showReveal = (r: RevealReq) => new Promise<void>((res) => { revealResolve.current = res; setReveal(r); });
  const closeReveal = () => { setReveal(null); revealResolve.current?.(); revealResolve.current = null; };

  // ---------- game flow ----------
  async function startGame() {
    const s = sRef.current;
    if (!s || busyRef.current) return;
    setBusy(true);
    const ids = s.participants.map((p) => p.id);
    const first = pick(ids);
    await spinWheel(ids, first, '🎡 ใครจะได้กดคนแรก?');
    commit({ ...sRef.current!, currentDrawer: first, needWheel: false });
    setBusy(false);
  }

  async function doGacha() {
    const s = sRef.current;
    const m = machine.current;
    if (!s || !m || busyRef.current || phaseOf(s) !== 'playing') return;
    setBusy(true);
    setAnimateLast(false);
    const drawer = s.currentDrawer!;
    const owner = pickGift(s, drawer);
    const color = who(peopleOf(s), owner).color;

    // 1-3: crank → shake → one ball rolls out
    await m.crank();
    await m.shake(1300);
    m.take(owner);
    await m.dropOut(color);

    // save immediately (survives a refresh), but update the board after the reveal
    const withResult = { ...s, results: [...s.results, { drawer, owner, at: Date.now() }] };
    const next = nextDrawer(withResult, owner);
    const committed: GameState = { ...withResult, currentDrawer: next?.id ?? null, needWheel: !!(next && !next.chained) };
    commit(committed, false);

    // 4: big capsule reveal
    await showReveal({ drawer, owner, next });
    m.hideOut();
    setAnimateLast(true);
    setState(committed);

    // 5: who's next
    if (!next) { setBusy(false); await wait(400); setDoneOpen(true); return; }
    if (committed.needWheel) {
      const und = undrawn(committed);
      if (und.length > 1) await spinWheel(und, next.id, '🔁 วงครบรอบแล้ว! สุ่มคนต่อไป');
      commit({ ...sRef.current!, needWheel: false });
    } else {
      toast(<>🔗 ส่งต่อให้ <Chip p={who(peopleOf(committed), next.id)} /> เจ้าของของขวัญชิ้นนี้!</>, 3200);
      Music.sfx('sparkle');
    }
    setBusy(false);
  }

  const phase = state ? phaseOf(state) : 'empty';
  function mainAction() {
    if (phase === 'setup') void startGame();
    else if (phase === 'playing') void doGacha();
    else if (phase === 'done') setDoneOpen(true);
    else openAdmin();
  }
  const mainActionRef = useRef(mainAction);
  mainActionRef.current = mainAction;

  // ---------- admin ----------
  function openAdmin() {
    if (busyRef.current) { toast('⏳ รอให้แอนิเมชันจบก่อนนะ'); return; }
    setAdminOpen(true);
  }
  const changeDev = useCallback((on: boolean) => {
    setDevPref(on ? 'on' : 'off');
    setDev(on);
    toast(on ? '🛠 เปิด Dev mode' : '🔒 ปิด Dev mode');
  }, [toast]);
  const resetResults = (s: GameState): GameState => ({ ...s, results: [], currentDrawer: null, needWheel: false });

  const admin = {
    onSaveNames(names: string[]) {
      const s = sRef.current!;
      if (names.length < 2) { toast('⚠️ ต้องมีอย่างน้อย 2 คนนะ'); return; }
      if (s.results.length && !confirm('บันทึกรายชื่อใหม่จะล้างผลการจับทั้งหมด ตกลงไหม?')) return;
      commit(resetResults({ ...s, participants: makeParticipants(names, s.participants) }));
      setAnimateLast(false); setAdminOpen(false);
      toast(`✅ บันทึก ${names.length} คนแล้ว`);
    },
    onSaveEvent(iso: string) {
      commit({ ...sRef.current!, eventDate: iso });
      setAdminOpen(false);
      toast('📅 บันทึกวันเวลาแล้ว');
    },
    onUndo() {
      const s = sRef.current!;
      const last = s.results[s.results.length - 1];
      if (!last) return;
      commit({ ...s, results: s.results.slice(0, -1), currentDrawer: last.drawer, needWheel: false });
      setDoneOpen(false); setAnimateLast(false); setAdminOpen(false);
      toast(<>↩️ ย้อนกลับ: ตานี้เป็นของ <Chip p={who(peopleOf(s), last.drawer)} /> อีกครั้ง</>);
    },
    onReset() {
      if (!confirm('ล้างผลการจับทั้งหมดและเริ่มใหม่?')) return;
      commit(resetResults(sRef.current!));
      setDoneOpen(false); setAnimateLast(false); setAdminOpen(false);
      toast('🔄 เริ่มใหม่แล้ว');
    },
    async onCopy() {
      const s = sRef.current!;
      const people = peopleOf(s);
      const text = '🎄 ผลจับฉลากของขวัญ 🎁\n' +
        s.results.map((r, i) => `${i + 1}. ${who(people, r.drawer).name} ได้ของ ${who(people, r.owner).name}`).join('\n');
      try { await navigator.clipboard.writeText(text); toast('📋 คัดลอกแล้ว'); }
      catch { prompt('คัดลอกข้อความนี้:', text); }
    },
    onSimulate() {
      const t = Date.now();
      setSimulateUntil(t + 10500); setNow(t); setLockPhase('shown'); setAdminOpen(false);
    },
  };

  // ---------- keyboard: type "dev" to toggle, Space/Enter = main button ----------
  const changeDevRef = useRef(changeDev);
  changeDevRef.current = changeDev;
  const devRef = useRef(dev);
  devRef.current = dev;
  useEffect(() => {
    let buf = '';
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      buf = (buf + e.key.toLowerCase()).slice(-3);
      if (buf === 'dev') { buf = ''; changeDevRef.current(!devRef.current); }
      if ((e.key === ' ' || e.key === 'Enter') && !document.querySelector('.overlay')) {
        e.preventDefault();
        mainActionRef.current();
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  // ---------- music ----------
  const enter = () => {
    Music.init();
    if (!getMuted()) Music.start();
    Music.sfx('sparkle');
    setGate(false);
    void burst(0.5, 0.6);
  };
  const toggleMusic = () => {
    const m = !muted;
    setMuted(m); setMutedState(m);
    if (m) Music.stop(); else Music.start();
  };

  // ---------- render ----------
  const people = useMemo(() => (state ? peopleOf(state) : new Map()) as People, [state]);
  const gifts = useMemo(() => (state ? giftsLeft(state).map((id) => ({ id, color: who(people, id).color })) : []), [state, people]);
  const knobLabel = { setup: 'สุ่มคนกดคนแรก', playing: 'หมุนกาชาปอง', done: 'ดูสรุปผล', empty: 'เพิ่มรายชื่อ' }[phase];
  const target = simulateUntil ?? (state ? new Date(state.eventDate).getTime() : 0);

  return (
    <>
      <Scenery />
      <Header
        dev={dev}
        songName={songName}
        muted={muted}
        onToggleMusic={toggleMusic}
        onNextSong={() => Music.next()}
        onAdmin={openAdmin}
      />

      {state && (
        <main className="board">
          <PeoplePanel state={state} />
          <section className="center">
            <TurnSign phase={phase} drawer={state.currentDrawer ? who(people, state.currentDrawer) : null} />
            <GachaMachine
              ref={machine}
              gifts={gifts}
              ready={!busy && phase !== 'empty'}
              busy={busy}
              label={knobLabel}
              onKnob={() => { if (!busyRef.current) mainAction(); }}
            />
          </section>
          <ResultsPanel results={state.results} people={people} animateLast={animateLast} />
        </main>
      )}

      {state && lockPhase !== 'hidden' && (
        <LockScreen target={target} now={now} unlocking={lockPhase === 'unlocking'} fading={lockFading} />
      )}
      {state && wheel && (
        <Wheel key={wheel.key} ids={wheel.ids} target={wheel.target} title={wheel.title} people={people} onClose={closeWheel} />
      )}
      {state && reveal && (
        <Reveal
          drawer={who(people, reveal.drawer)}
          owner={who(people, reveal.owner)}
          next={reveal.next}
          nextP={reveal.next ? who(people, reveal.next.id) : null}
          onNext={closeReveal}
        />
      )}
      {state && doneOpen && <DoneOverlay results={state.results} people={people} onClose={() => setDoneOpen(false)} />}
      {state && adminOpen && (
        <AdminPanel
          state={state}
          dev={dev}
          onClose={() => setAdminOpen(false)}
          onDevChange={changeDev}
          {...admin}
        />
      )}
      {gate && <Gate onEnter={enter} />}
      <Toasts toasts={toasts} />
    </>
  );
}
