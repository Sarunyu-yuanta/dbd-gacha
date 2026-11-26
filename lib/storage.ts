// ===== State persistence (localStorage, client only) =====
import { AVATARS, COLORS, DEFAULT_NAMES, EVENT_DATE } from './config';
import type { GameState, Participant } from './types';

const KEY = 'xmasGacha.v1';
const DEV_KEY = 'xmasGacha.dev'; // 'on' | 'off' | (missing = follow NODE_ENV)
const MUTE_KEY = 'xmasGacha.muted';

const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };
const del = (k: string) => { try { localStorage.removeItem(k); } catch { /* ignore */ } };

export function makeParticipants(names: string[], previous: Participant[] = []): Participant[] {
  const used = new Set<string>();
  return names.map((name, i) => {
    const prev = previous.find((p) => p.name === name && !used.has(p.id));
    if (prev) { used.add(prev.id); return { ...prev }; }
    return {
      id: 'p' + Date.now().toString(36) + i + Math.random().toString(36).slice(2, 6),
      name,
      avatar: AVATARS[i % AVATARS.length],
      color: COLORS[i % COLORS.length],
    };
  });
}

export function defaultState(): GameState {
  return {
    participants: makeParticipants(DEFAULT_NAMES),
    eventDate: EVENT_DATE,
    results: [],
    currentDrawer: null,
    needWheel: false,
  };
}

export function loadState(): GameState {
  const raw = get(KEY);
  if (!raw) return defaultState();
  try {
    const s = JSON.parse(raw);
    if (!Array.isArray(s.participants) || !Array.isArray(s.results)) return defaultState();
    return { ...defaultState(), ...s };
  } catch {
    return defaultState();
  }
}

export const saveState = (s: GameState) => set(KEY, JSON.stringify(s));

export type DevPref = 'on' | 'off' | null;
export const getDevPref = (): DevPref => {
  const v = get(DEV_KEY);
  return v === 'on' || v === 'off' ? v : null;
};
export const setDevPref = (v: DevPref) => (v ? set(DEV_KEY, v) : del(DEV_KEY));

export const getMuted = () => get(MUTE_KEY) === '1';
export const setMuted = (on: boolean) => (on ? set(MUTE_KEY, '1') : del(MUTE_KEY));
