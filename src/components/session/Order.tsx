import { useRef, useState } from 'react';
import { SUFFIX } from '../../lib/theme';
import { playPop } from '../../lib/pop';
import type { ExProps } from './types';

export function Order({ ex, locked, onAnswer }: ExProps) {
  const tiles = ex.tiles!;
  const sorted = [...tiles].sort((a, b) => a - b);
  const [placed, setPlaced] = useState<number[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const mistakes = useRef(0);

  const tap = (v: number) => {
    if (locked || placed.includes(v)) return;
    if (v === sorted[placed.length]) {
      playPop();
      const next = [...placed, v];
      setPlaced(next);
      if (next.length === sorted.length) {
        setTimeout(() => onAnswer({ ok: mistakes.current <= 1, info: `Doğrusu ${sorted.join(', ')}` }), 350);
      }
    } else {
      mistakes.current += 1;
      setShake(v);
      setTimeout(() => setShake(null), 400);
    }
  };

  return (
    <>
      <section className="stage" style={{ background: '#5CC8F2' }}>
        <h2 className="q-title">{SUFFIX[ex.step]} sayarken sırayla dokun: küçükten büyüğe!</h2>
        <div className="chips" aria-label="Sıra kutuları">
          {sorted.map((_, i) => (
            <span key={i} className={`circle ${placed[i] === undefined ? 'dashed' : ''}`}>{placed[i] ?? ''}</span>
          ))}
        </div>
      </section>
      <div className="answers">
        {tiles.map((v) => (
          <button key={v} className={`answer ${shake === v ? 'shake' : ''} ${placed.includes(v) ? 'used' : ''}`} disabled={locked || placed.includes(v)} onClick={() => tap(v)}>{v}</button>
        ))}
      </div>
    </>
  );
}
