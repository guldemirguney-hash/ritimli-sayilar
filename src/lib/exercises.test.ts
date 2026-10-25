import { describe, expect, it } from 'vitest';
import { STEPS } from './counter';
import { count, makeExercise, nodeRange, NODES, val, type ExType } from './exercises';
import { bumpStreak, todayStr } from './store';

const TYPES: ExType[] = ['choice', 'gap', 'order', 'balloon', 'beat', 'say'];

describe('nodeRange', () => {
  it('5 durak tüm katları kapsar, aralıklar çakışmaz', () => {
    for (const s of STEPS) {
      const n = count(s);
      let next = 0;
      for (let r = 1; r <= NODES; r++) {
        const { lo, hi } = nodeRange(s, r);
        expect(lo).toBe(next);
        expect(hi).toBeGreaterThanOrEqual(lo);
        expect(hi).toBeLessThanOrEqual(n - 1);
        next = hi + 1;
      }
      expect(next).toBe(n);
    }
  });
});

describe('makeExercise', () => {
  it('her modül, durak ve tür için tutarlı alıştırma üretir', () => {
    for (const s of STEPS) {
      for (let r = 1; r <= NODES; r++) {
        for (const type of TYPES) {
          for (let k = 0; k < 20; k++) {
            const ex = makeExercise(type, s, nodeRange(s, r));
            const n = count(s);
            if (ex.options) {
              expect(ex.options).toContain(ex.answer);
              expect(new Set(ex.options).size).toBe(ex.options.length);
              expect(ex.options.every((v) => v > 0)).toBe(true);
              expect(ex.options.length).toBe(4);
            }
            if (ex.answer !== undefined) {
              expect(ex.answer % s).toBe(0);
              expect(ex.answer).toBeLessThanOrEqual(val(s, n - 1));
            }
            if (type === 'gap') expect(ex.shown!.filter((v) => v === null).length).toBe(1);
            if (type === 'order') {
              expect(ex.tiles!.length).toBe(4);
              expect([...ex.tiles!].sort((a, b) => a - b)).not.toEqual(ex.tiles);
            }
            if (type === 'balloon') {
              const ok = ex.balloons!.filter((b) => b.ok);
              expect(ok.length).toBe(4);
              expect(ex.balloons!.filter((b) => !b.ok).every((b) => b.v % s !== 0)).toBe(true);
              expect(new Set(ex.balloons!.map((b) => b.v)).size).toBe(ex.balloons!.length);
            }
            if (type === 'beat') expect(ex.seq!.length).toBe(4);
          }
        }
      }
    }
  });
});

describe('bumpStreak', () => {
  it('ilk gün 1, ertesi gün artar, aynı gün değişmez, ara verilirse sıfırlanır', () => {
    expect(bumpStreak({ last: '', count: 0 }, '2026-10-25')).toEqual({ last: '2026-10-25', count: 1 });
    expect(bumpStreak({ last: '2026-10-25', count: 3 }, '2026-10-26')).toEqual({ last: '2026-10-26', count: 4 });
    expect(bumpStreak({ last: '2026-10-26', count: 4 }, '2026-10-26')).toEqual({ last: '2026-10-26', count: 4 });
    expect(bumpStreak({ last: '2026-10-20', count: 9 }, '2026-10-26')).toEqual({ last: '2026-10-26', count: 1 });
    expect(bumpStreak({ last: '2026-02-28', count: 2 }, '2026-03-01')).toEqual({ last: '2026-03-01', count: 3 });
  });
  it('todayStr YYYY-AA-GG biçiminde', () => {
    expect(todayStr(new Date(2026, 9, 5))).toBe('2026-10-05');
  });
});
