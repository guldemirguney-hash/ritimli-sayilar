import { lastStop } from './counter';

export type ExType = 'choice' | 'gap' | 'order' | 'balloon' | 'beat' | 'say';
export const NODES = 5;

/** Bir modüldeki sayı adedi (100'e kadar): 3'er için 33, 10'ar için 10. */
export const count = (step: number) => lastStop(step) / step;
/** i. kat (0'dan başlar): step 3 için val(3,0)=3, val(3,1)=6. */
export const val = (step: number, i: number) => (i + 1) * step;

export interface Range { lo: number; hi: number }

/** Yol üzerindeki r. durağın (1..5) kapsadığı kat dizinleri. */
export function nodeRange(step: number, r: number): Range {
  const n = count(step);
  // Katları 5 durağa olabildiğince eşit böl (her durakta en az 2 kat kalır).
  return { lo: Math.floor(((r - 1) * n) / NODES), hi: Math.floor((r * n) / NODES) - 1 };
}

export interface BalloonItem { v: number; ok: boolean }
export interface Exercise {
  type: ExType;
  step: number;
  shown?: (number | null)[]; // choice, gap, say
  answer?: number;           // choice, gap, say
  options?: number[];        // choice, gap
  tiles?: number[];          // order (karışık)
  balloons?: BalloonItem[];  // balloon
  seq?: number[];            // beat
}

const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function optionsFor(answer: number, step: number): number[] {
  const pool = [answer + 1, answer - 1, answer + step, answer - step, answer + 2, answer - 2, answer + 10, answer - 10]
    .filter((v) => v > 0 && v !== answer);
  return shuffle([answer, ...shuffle([...new Set(pool)]).slice(0, 3)]);
}

/** 4 ardışık katlık pencerenin başlangıç dizini. */
function windowStart(step: number, range: Range): number {
  return clamp(rnd(range.lo, range.hi) - 1, 0, count(step) - 4);
}

export function makeExercise(type: ExType, step: number, range: Range): Exercise {
  const t = () => rnd(Math.max(1, range.lo), Math.max(1, range.hi));
  switch (type) {
    case 'choice': {
      const target = t();
      const shown: number[] = [];
      for (let i = Math.max(0, target - 3); i < target; i++) shown.push(val(step, i));
      const answer = val(step, target);
      return { type, step, shown, answer, options: optionsFor(answer, step) };
    }
    case 'gap': {
      const target = t();
      const a = clamp(target - 1, 0, count(step) - 4);
      const shown = [0, 1, 2, 3].map((k) => (a + k === target ? null : val(step, a + k)));
      const answer = val(step, target);
      return { type, step, shown, answer, options: optionsFor(answer, step) };
    }
    case 'order': {
      const s = windowStart(step, range);
      const sorted = [0, 1, 2, 3].map((k) => val(step, s + k));
      let tiles = shuffle(sorted);
      for (let tries = 0; tries < 5 && tiles.every((v, i) => v === sorted[i]); tries++) tiles = shuffle(sorted);
      return { type, step, tiles };
    }
    case 'balloon': {
      const s = windowStart(step, range);
      const mult = [0, 1, 2, 3].map((k) => val(step, s + k));
      const taken = new Set(mult);
      const dist: number[] = [];
      for (const v of shuffle(mult)) {
        const c = shuffle([v + 1, v - 1, v + 2, v - 2]).find((x) => x > 0 && x % step !== 0 && !taken.has(x));
        if (c !== undefined) { dist.push(c); taken.add(c); }
      }
      const balloons = shuffle<BalloonItem>([...mult.map((v) => ({ v, ok: true })), ...dist.map((v) => ({ v, ok: false }))]);
      return { type, step, balloons };
    }
    case 'beat': {
      const s = windowStart(step, range);
      return { type, step, seq: [0, 1, 2, 3].map((k) => val(step, s + k)) };
    }
    case 'say': {
      const target = t();
      const shown: number[] = [];
      for (let i = Math.max(0, target - 2); i < target; i++) shown.push(val(step, i));
      return { type, step, shown, answer: val(step, target) };
    }
  }
}

/** Duolingo tarzı yoldaki r. durak için alıştırma türü sırası (8 adet). */
export const NODE_PATTERNS: ExType[][] = [
  ['choice', 'choice', 'gap', 'order', 'choice', 'gap', 'balloon', 'choice'],
  ['choice', 'gap', 'beat', 'order', 'choice', 'balloon', 'gap', 'say'],
  ['gap', 'order', 'balloon', 'choice', 'beat', 'gap', 'say', 'choice'],
  ['choice', 'beat', 'gap', 'balloon', 'order', 'say', 'gap', 'choice'],
  ['order', 'beat', 'balloon', 'gap', 'say', 'choice', 'beat', 'gap'],
];
