// ===== Music + SFX generated with Web Audio (no audio files needed) =====
// Songs are public-domain carols, played with a music-box / bell synth.
import { getMuted } from './storage';

type Note = { t: number; d: number; f: number };
type Ev = { t: number; d: number; f?: number; v: 'bell' | 'bass' | 'shaker' | 'chime'; acc?: boolean };
type Song = { name: string; bpm: number; bpb: number; melody: string; roots: string[]; pickup?: number; jingle?: boolean; soft?: boolean };

const SEMI: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function freq(name: string): number {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  if (!m) return 0;
  const n = SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) + 1) * 12;
  return 440 * Math.pow(2, (n - 69) / 12);
}
function parse(str: string): { notes: Note[]; len: number } {
  let t = 0;
  const notes: Note[] = [];
  str.trim().split(/\s+/).forEach((tok) => {
    const [n, d] = tok.split(':');
    const dur = parseFloat(d);
    if (n !== 'R') notes.push({ t, d: dur, f: freq(n) });
    t += dur;
  });
  return { notes, len: t };
}
function bassLine(roots: string[], bpb: number, pickup = 0): string {
  let s = pickup ? `R:${pickup} ` : '';
  roots.forEach((r) => {
    s += bpb === 3 ? `${r}2:2 ${r}3:1 ` : `${r}2:${bpb / 2} ${r}3:${bpb / 2} `;
  });
  return s;
}

const SONGS: Song[] = [
  {
    name: 'Jingle Bells', bpm: 168, bpb: 4, jingle: true,
    melody: `E5:1 E5:1 E5:2 E5:1 E5:1 E5:2 E5:1 G5:1 C5:1.5 D5:0.5 E5:4
             F5:1 F5:1 F5:1.5 F5:0.5 F5:1 E5:1 E5:1 E5:0.5 E5:0.5 E5:1 D5:1 D5:1 E5:1 D5:2 G5:2
             E5:1 E5:1 E5:2 E5:1 E5:1 E5:2 E5:1 G5:1 C5:1.5 D5:0.5 E5:4
             F5:1 F5:1 F5:1.5 F5:0.5 F5:1 E5:1 E5:1 E5:0.5 E5:0.5 G5:1 G5:1 F5:1 D5:1 C5:4`,
    roots: ['C', 'C', 'C', 'C', 'F', 'C', 'D', 'G', 'C', 'C', 'C', 'C', 'F', 'C', 'G', 'C'],
  },
  {
    name: 'We Wish You a Merry Christmas', bpm: 150, bpb: 3, pickup: 1,
    melody: `D5:1 G5:1 G5:0.5 A5:0.5 G5:0.5 F#5:0.5 E5:1 E5:1 E5:1
             A5:1 A5:0.5 B5:0.5 A5:0.5 G5:0.5 F#5:1 D5:1 D5:1
             B5:1 B5:0.5 C6:0.5 B5:0.5 A5:0.5 G5:1 E5:1 D5:0.5 D5:0.5
             E5:1 A5:1 F#5:1 G5:3`,
    roots: ['G', 'C', 'A', 'D', 'E', 'C', 'D', 'G'],
  },
  {
    name: 'Deck the Halls', bpm: 132, bpb: 4,
    melody: `G5:1.5 F5:0.5 E5:1 D5:1 C5:1 D5:1 E5:1 C5:1
             D5:0.5 E5:0.5 F5:0.5 D5:0.5 E5:1.5 D5:0.5 C5:1 B4:1 C5:2
             G5:1.5 F5:0.5 E5:1 D5:1 C5:1 D5:1 E5:1 C5:1
             D5:0.5 E5:0.5 F5:0.5 D5:0.5 E5:1.5 D5:0.5 C5:1 B4:1 C5:2
             D5:1.5 E5:0.5 F5:1 D5:1 E5:1.5 F5:0.5 G5:1 D5:1
             E5:0.5 F#5:0.5 G5:1 A5:0.5 B5:0.5 C6:1 B5:1 A5:1 G5:2
             G5:1.5 F5:0.5 E5:1 D5:1 C5:1 D5:1 E5:1 C5:1
             A5:0.5 A5:0.5 A5:0.5 A5:0.5 G5:1.5 F5:0.5 E5:1 D5:1 C5:2`,
    roots: ['C', 'C', 'G', 'C', 'C', 'C', 'G', 'C', 'G', 'C', 'D', 'G', 'C', 'C', 'F', 'C'],
  },
  {
    name: 'Silent Night (music box)', bpm: 96, bpb: 3, soft: true,
    melody: `G5:1.5 A5:0.5 G5:1 E5:3 G5:1.5 A5:0.5 G5:1 E5:3
             D6:2 D6:1 B5:3 C6:2 C6:1 G5:3
             A5:2 A5:1 C6:1.5 B5:0.5 A5:1 G5:1.5 A5:0.5 G5:1 E5:3
             A5:2 A5:1 C6:1.5 B5:0.5 A5:1 G5:1.5 A5:0.5 G5:1 E5:3
             D6:2 D6:1 F6:1.5 D6:0.5 B5:1 C6:3 E6:3
             C6:1 G5:1 E5:1 G5:1.5 F5:0.5 D5:1 C5:6`,
    roots: ['C', 'C', 'C', 'C', 'G', 'G', 'C', 'C', 'F', 'F', 'C', 'C', 'F', 'F', 'C', 'C',
      'G', 'G', 'C', 'C', 'C', 'G', 'C', 'C'],
  },
];

function buildEvents(song: Song): { evs: Ev[]; len: number } {
  const mel = parse(song.melody);
  const bass = parse(bassLine(song.roots, song.bpb, song.pickup || 0));
  const evs: Ev[] = [];
  mel.notes.forEach((n) => evs.push({ ...n, v: 'bell' }));
  bass.notes.forEach((n) => evs.push({ ...n, v: 'bass' }));
  const len = Math.max(mel.len, bass.len);
  if (song.jingle) {
    for (let b = 0; b < len; b += 0.5) evs.push({ t: b, d: 0.5, v: 'shaker', acc: b % 1 === 0 });
  } else {
    for (let b = song.pickup || 0; b < len; b += song.bpb) evs.push({ t: b, d: 1, v: 'chime' });
  }
  evs.sort((a, b) => a.t - b.t);
  return { evs, len };
}

class MusicEngine {
  private ctx: AudioContext | null = null;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private noiseBuf!: AudioBuffer;
  private timer: ReturnType<typeof setInterval> | null = null;
  private playing = false;
  private songIdx = 0;
  private events: Ev[] = [];
  private evIdx = 0;
  private songStart = 0;
  private spb = 0.4;
  private loopLen = 0;
  private loopsDone = 0;
  private listener: (name: string) => void = () => {};

  onSong(fn: (name: string) => void) { this.listener = fn; }
  isPlaying() { return this.playing; }

  init() {
    if (typeof window === 'undefined') return;
    if (this.ctx) { if (this.ctx.state === 'suspended') void this.ctx.resume(); return; }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor(); comp.connect(master);
    this.musicBus = ctx.createGain(); this.musicBus.gain.value = 0.32; this.musicBus.connect(comp);
    this.sfxBus = ctx.createGain(); this.sfxBus.gain.value = 0.55; this.sfxBus.connect(comp);
    const reverb = ctx.createConvolver();
    const len = ctx.sampleRate * 2.2;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    reverb.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = 0.35;
    reverb.connect(wet); wet.connect(comp);
    this.musicBus.connect(reverb); this.sfxBus.connect(reverb);
    this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }

  // ---------- synth voices ----------
  private env(g: GainNode, t: number, peak: number, attack: number, decay: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }
  private osc(type: OscillatorType, f: number, t: number, stop: number, g: GainNode) {
    const o = this.ctx!.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
    o.connect(g); o.start(t); o.stop(stop); return o;
  }
  private gain(dest: AudioNode) { const g = this.ctx!.createGain(); g.connect(dest); return g; }
  private bell(f: number, t: number, dur: number, dest: AudioNode, vol = 0.32) {
    const decay = Math.max(dur, 0.5) + 0.8;
    const g = this.gain(dest); this.env(g, t, vol, 0.006, decay); this.osc('sine', f, t, t + decay + 0.1, g);
    const g2 = this.gain(dest); this.env(g2, t, vol * 0.35, 0.004, decay * 0.4); this.osc('sine', f * 2, t, t + decay, g2);
    const g3 = this.gain(dest); this.env(g3, t, vol * 0.12, 0.002, 0.25); this.osc('triangle', f * 3.01, t, t + 0.4, g3);
  }
  private bass(f: number, t: number, dur: number, dest: AudioNode) {
    const g = this.gain(dest); this.env(g, t, 0.28, 0.01, Math.min(dur, 0.9));
    this.osc('triangle', f, t, t + dur + 0.2, g);
  }
  private noise(t: number, dur: number, type: BiquadFilterType, fq: number, vol: number, dest: AudioNode, q = 1) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource(); src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = fq; f.Q.value = q;
    const g = ctx.createGain(); this.env(g, t, vol, 0.003, dur);
    src.connect(f); f.connect(g); g.connect(dest);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
    return { src, f, g };
  }

  private playEvent(e: Ev, t: number) {
    const d = e.d * this.spb;
    const song = SONGS[this.songIdx];
    if (e.v === 'bell') this.bell(e.f!, t, d, this.musicBus, song.soft ? 0.26 : 0.32);
    else if (e.v === 'bass') this.bass(e.f!, t, d, this.musicBus);
    else if (e.v === 'shaker') this.noise(t, 0.06, 'highpass', 7000, e.acc ? 0.22 : 0.12, this.musicBus);
    else this.bell(freq('C7') * (Math.random() < 0.5 ? 1 : 1.5), t, 0.2, this.musicBus, 0.05);
  }

  private startSong(i: number, at: number) {
    this.songIdx = i % SONGS.length;
    const song = SONGS[this.songIdx];
    const b = buildEvents(song);
    this.events = b.evs; this.loopLen = b.len; this.evIdx = 0; this.loopsDone = 0;
    this.spb = 60 / song.bpm;
    this.songStart = at;
    this.listener(song.name);
  }

  private schedule = () => {
    const ctx = this.ctx!;
    const ahead = ctx.currentTime + 0.25;
    for (let guard = 0; guard < 500; guard++) {
      if (this.evIdx >= this.events.length) {
        this.loopsDone++;
        const end = this.songStart + this.loopLen * this.spb;
        if (this.loopsDone >= 2) this.startSong(this.songIdx + 1, end + 1.2);
        else { this.songStart = end; this.evIdx = 0; }
        continue;
      }
      const e = this.events[this.evIdx];
      const t = this.songStart + e.t * this.spb;
      if (t > ahead) break;
      if (t >= ctx.currentTime - 0.05) this.playEvent(e, t);
      this.evIdx++;
    }
  };

  start() {
    this.init();
    if (!this.ctx || this.playing) return;
    this.playing = true;
    this.startSong(this.songIdx, this.ctx.currentTime + 0.15);
    this.timer = setInterval(this.schedule, 40);
  }
  stop() {
    this.playing = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
  next() {
    this.songIdx = (this.songIdx + 1) % SONGS.length;
    if (this.playing) { this.stop(); this.start(); } else this.listener(SONGS[this.songIdx].name);
  }

  // ---------- SFX ----------
  private SFX: Record<string, (t: number) => void> = {
    click: (t) => this.bell(1800, t, 0.03, this.sfxBus, 0.12),
    tick: (t) => { this.noise(t, 0.03, 'bandpass', 3500, 0.35, this.sfxBus, 4); },
    crank: (t) => {
      for (let i = 0; i < 4; i++) {
        this.noise(t + i * 0.15, 0.05, 'bandpass', 1800, 0.6, this.sfxBus, 6);
        this.bell(900 + i * 60, t + i * 0.15, 0.03, this.sfxBus, 0.08);
      }
    },
    rattle: (t) => { for (let i = 0; i < 16; i++) this.noise(t + i * 0.07 + Math.random() * 0.04, 0.04, 'bandpass', 2500 + Math.random() * 2500, 0.35, this.sfxBus, 8); },
    roll: (t) => { const n = this.noise(t, 0.7, 'bandpass', 600, 0.4, this.sfxBus, 2); n.f.frequency.linearRampToValueAtTime(1500, t + 0.7); },
    bounce: (t) => {
      const g = this.gain(this.sfxBus); this.env(g, t, 0.5, 0.004, 0.18);
      this.osc('sine', 320, t, t + 0.25, g).frequency.exponentialRampToValueAtTime(110, t + 0.15);
    },
    whoosh: (t) => { const n = this.noise(t, 0.6, 'bandpass', 400, 0.35, this.sfxBus, 1.5); n.f.frequency.exponentialRampToValueAtTime(3000, t + 0.5); },
    pop: (t) => {
      const g = this.gain(this.sfxBus); this.env(g, t, 0.5, 0.002, 0.15);
      this.osc('sine', 500, t, t + 0.2, g).frequency.exponentialRampToValueAtTime(1400, t + 0.08);
      this.noise(t, 0.1, 'highpass', 3000, 0.3, this.sfxBus);
    },
    tada: (t) => {
      ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => this.bell(freq(n), t + i * 0.09, 0.3, this.sfxBus, 0.35));
      ['C5', 'E5', 'G5', 'C6', 'E6'].forEach((n) => this.bell(freq(n), t + 0.45, 1.4, this.sfxBus, 0.2));
      for (let i = 0; i < 10; i++) this.noise(t + 0.45 + i * 0.05, 0.05, 'highpass', 8000, 0.15, this.sfxBus);
    },
    sparkle: (t) => { for (let i = 0; i < 8; i++) this.bell(freq('C6') * Math.pow(2, (i * 2) / 12), t + i * 0.05, 0.1, this.sfxBus, 0.12); },
    unlock: (t) => {
      this.noise(t, 0.12, 'bandpass', 1200, 0.8, this.sfxBus, 5);
      this.noise(t + 0.15, 0.2, 'bandpass', 800, 0.7, this.sfxBus, 4);
      ['G5', 'C6', 'E6', 'G6', 'C7'].forEach((n, i) => this.bell(freq(n), t + 0.35 + i * 0.08, 0.5, this.sfxBus, 0.25));
    },
    fanfare: (t) => {
      const seq: [string, number][] = [['G5', 0.18], ['G5', 0.18], ['G5', 0.18], ['C6', 0.7], ['B5', 0.2], ['C6', 0.2], ['E6', 1.2]];
      let tt = t;
      seq.forEach(([n, d]) => { this.bell(freq(n), tt, d, this.sfxBus, 0.32); this.bell(freq(n) / 2, tt, d, this.sfxBus, 0.15); tt += d; });
    },
    boom: (t) => {
      const g = this.gain(this.sfxBus); this.env(g, t, 0.6, 0.005, 0.5);
      this.osc('sine', 120, t, t + 0.6, g).frequency.exponentialRampToValueAtTime(40, t + 0.4);
      this.noise(t, 0.5, 'lowpass', 1200, 0.4, this.sfxBus);
      for (let i = 0; i < 8; i++) this.noise(t + 0.2 + Math.random() * 0.6, 0.03, 'highpass', 5000, 0.12, this.sfxBus);
    },
  };

  sfx(name: SfxName, delay = 0) {
    if (!this.ctx || getMuted()) return;
    try { this.SFX[name]?.(this.ctx.currentTime + 0.01 + delay); } catch { /* ignore */ }
  }
}

export type SfxName = 'click' | 'tick' | 'crank' | 'rattle' | 'roll' | 'bounce' | 'whoosh' | 'pop' | 'tada' | 'sparkle' | 'unlock' | 'fanfare' | 'boom';

export const Music = new MusicEngine();
