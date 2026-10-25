import { useEffect, useRef, useState } from 'react';
import { SUFFIX } from '../../lib/theme';
import { playPop, playTick } from '../../lib/pop';
import type { ExProps } from './types';

const INTERVAL = 800;   // ms, dakikada 75 vuruş
const COUNT_IN = 4;     // hazırlık vuruşu
const TOLERANCE = 320;  // ms

/** Metronom çalar; çocuk her vuruşta pede dokunur ve o vuruştaki sayıyı "söylemiş" olur. */
export function BeatTap({ ex, locked, onAnswer }: ExProps) {
  const seq = ex.seq!;
  const [phase, setPhase] = useState<'ready' | 'running'>('ready');
  const [tick, setTick] = useState(0);      // şu anki vuruş (0'dan)
  const [hits, setHits] = useState<boolean[]>([]);
  const start = useRef(0);
  const hitsRef = useRef<boolean[]>([]);
  const nextBeat = useRef(0);               // sıradaki yakalanmamış vuruşun dizini
  const timers = useRef<number[]>([]);
  const done = useRef(false);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const begin = () => {
    setPhase('running');
    start.current = performance.now();
    for (let k = 0; k < COUNT_IN + seq.length; k++) {
      timers.current.push(window.setTimeout(() => { setTick(k + 1); playTick(k >= COUNT_IN); }, k * INTERVAL));
    }
    timers.current.push(window.setTimeout(() => finish(), (COUNT_IN + seq.length - 1) * INTERVAL + TOLERANCE + 60));
  };

  const finish = () => {
    if (done.current) return;
    done.current = true;
    const n = hitsRef.current.filter(Boolean).length;
    onAnswer({ ok: n >= seq.length - 1, info: `${n} / ${seq.length} vuruşu yakaladın` });
  };

  const tap = () => {
    if (phase !== 'running' || locked || done.current) return;
    const now = performance.now() - start.current;
    // Dokunuşa en yakın, henüz yakalanmamış sayı vuruşu
    const k = Math.max(nextBeat.current, Math.round((now - COUNT_IN * INTERVAL) / INTERVAL));
    const target = (COUNT_IN + k) * INTERVAL;
    if (k < seq.length && Math.abs(now - target) <= TOLERANCE) {
      playPop();
      nextBeat.current = k + 1;
      hitsRef.current = Object.assign([...hitsRef.current], { [k]: true });
      setHits(hitsRef.current);
    }
  };

  const counting = phase === 'running' && tick <= COUNT_IN;
  return (
    <>
      <section className="stage" style={{ background: '#FFA94D' }}>
        <h2 className="q-title">{SUFFIX[ex.step]} sayıyoruz. Ritme uy, her vuruşta dokun!</h2>
        <div className="chips">
          {seq.map((v, i) => (
            <span key={v} className="circle" style={{ background: hits[i] ? '#7BD88F' : '#fff' }}>{hits[i] ? v : '·'}</span>
          ))}
        </div>
        <p className="hint" aria-live="polite">
          {phase === 'ready' ? 'Başla de, 4 vuruş hazırlanacağız.' : counting ? `Hazırlan... ${tick}` : 'Şimdi vur!'}
        </p>
      </section>
      {phase === 'ready' ? (
        <div className="ex-foot"><button className="cta wide" disabled={locked} onClick={begin}>Başla</button></div>
      ) : (
        <button className={`pad ${counting ? '' : 'live'}`} onPointerDown={tap} disabled={locked} aria-label="Vur">
          <span key={tick} className="pad-ring" />
          VUR!
        </button>
      )}
    </>
  );
}
