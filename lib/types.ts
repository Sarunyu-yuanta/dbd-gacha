export type Participant = {
  id: string;
  name: string;
  avatar: string;
  color: string;
};

export type DrawResult = {
  drawer: string; // participant id who pressed the gacha
  owner: string; // participant id whose gift came out
  at: number;
};

export type GameState = {
  participants: Participant[];
  eventDate: string; // ISO
  results: DrawResult[];
  currentDrawer: string | null;
  needWheel: boolean;
};

export type NextDrawer = { id: string; chained: boolean } | null;

export type Phase = 'empty' | 'setup' | 'playing' | 'done';
