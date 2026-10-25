import { useState } from 'react';
import { SUFFIX, speak } from '../../lib/theme';
import type { ExProps } from './types';

/** "Sıradaki sayı" (choice) ve "Boşluğu doldur" (gap) aynı düzeni kullanır. */
export function Choice({ ex, locked, onAnswer }: ExProps) {
  const [sel, setSel] = useState<number | null>(null);
  const shown = ex.shown ?? [];
  const gap = ex.type === 'gap';
  return (
    <>
      <section className="stage" style={{ background: '#B79CFF' }}>
        <h2 className="q-title">
          {SUFFIX[ex.step]} sayıyoruz. {gap ? 'Eksik sayı hangisi?' : 'Sıradaki sayı hangisi?'}
        </h2>
        <div className="chips">
          {shown.map((v, i) => (
            <span key={i} className={`circle ${v === null ? 'dashed' : ''}`}>{v === null ? '?' : v}</span>
          ))}
          {!gap && <span className="circle dashed">?</span>}
        </div>
        <button className="ghost small" onClick={() => speak(shown.filter((v) => v !== null).join(', '), true)}>Ritmi dinle</button>
      </section>
      <div className="answers">
        {ex.options!.map((o) => (
          <button key={o} className={`answer ${sel === o ? 'sel' : ''}`} aria-pressed={sel === o} disabled={locked} onClick={() => setSel(o)}>{o}</button>
        ))}
      </div>
      <div className="ex-foot">
        <button className="cta wide green" disabled={sel === null || locked} onClick={() => onAnswer({ ok: sel === ex.answer, info: `Doğrusu ${ex.answer}` })}>Kontrol et</button>
      </div>
    </>
  );
}
