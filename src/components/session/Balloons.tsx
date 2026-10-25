import { useEffect, useRef, useState } from 'react';
import { SUFFIX } from '../../lib/theme';
import { playPop } from '../../lib/pop';
import type { ExProps } from './types';

const TIME = 15;
const PALETTE = ['#FF8A7A', '#FFC93C', '#7BD88F', '#5CC8F2', '#B79CFF', '#FF9FD0', '#FFA94D', '#9BE7E0'];

export function Balloons({ ex, locked, onAnswer }: ExProps) {
  const balloons = ex.balloons!;
  const good = balloons.filter((b) => b.ok).map((b) => b.v).sort((a, b) => a - b);
  const [popped, setPopped] = useState<number[]>([]);
  const [wrongs, setWrongs] = useState(0);
  const [shake, setShake] = useState<number | null>(null);
  const [left, setLeft] = useState(TIME);
  const done = useRef(false);

  const finish = (ok: boolean) => {
    if (done.current) return;
    done.current = true;
    onAnswer({ ok, info: `Doğru sayılar: ${good.join(', ')}` });
  };

  useEffect(() => {
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 0.1)), 100);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (left <= 0) finish(false);
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  const pop = (v: number, ok: boolean) => {
    if (locked || done.current || popped.includes(v)) return;
    if (ok) {
      playPop();
      const next = [...popped, v];
      setPopped(next);
      if (next.length === good.length) finish(true);
    } else {
      const w = wrongs + 1;
      setWrongs(w);
      setShake(v);
      setTimeout(() => setShake(null), 400);
      if (w >= 2) finish(false);
    }
  };

  return (
    <>
      <section className="stage" style={{ background: '#BFE9F8' }}>
        <h2 className="q-title">{SUFFIX[ex.step]} sayarken söylediğin sayıları patlat!</h2>
        <div className="timer" role="img" aria-label={`Kalan süre ${Math.ceil(left)} saniye`}>
          <div style={{ width: `${(left / TIME) * 100}%` }} />
        </div>
        <p className="hint">Patlatman gereken: {good.length - popped.length} balon. Yanlış balon hakkın: {Math.max(0, 2 - wrongs)}</p>
      </section>
      <div className="balloons">
        {balloons.map((b, i) => (
          <button
            key={b.v}
            className={`balloon ${popped.includes(b.v) ? 'popped' : ''} ${shake === b.v ? 'shake' : ''}`}
            style={{ background: PALETTE[i % PALETTE.length], animationDelay: `${i * 0.25}s` }}
            disabled={locked || popped.includes(b.v)}
            aria-label={`Balon ${b.v}`}
            onClick={() => pop(b.v, b.ok)}
          >
            {b.v}
          </button>
        ))}
      </div>
    </>
  );
}
