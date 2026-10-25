import { useState } from 'react';
import { LESSON_STEPS } from '../lib/store';
import { COLORS, SUFFIX, speak } from '../lib/theme';

interface Props {
  step: number;
  onBack: () => void;
  onProgress: (stepsDone: number) => void;
  onJourney: () => void;
}

export function Lesson({ step, onBack, onProgress, onJourney }: Props) {
  const [i, setI] = useState(0);
  const [finished, setFinished] = useState(false);
  const values = Array.from({ length: LESSON_STEPS }, (_, k) => (k + 1) * step);
  const current = values[i];
  const said = values.slice(Math.max(0, i - 2), i + 1);
  const total = step * LESSON_STEPS;

  const next = () => {
    onProgress(i + 1);
    if (i + 1 >= LESSON_STEPS) setFinished(true);
    else setI(i + 1);
  };

  if (finished) {
    return (
      <main className="screen center">
        <h1 className="big">Ders bitti!</h1>
        <p className="lead">{SUFFIX[step]} sayma dersini tamamladın: {values.join(', ')}.</p>
        <button className="cta wide" onClick={onJourney}>Sesli yolculuğa çık</button>
        <button className="ghost wide" onClick={onBack}>Menüye dön</button>
      </main>
    );
  }

  return (
    <main className="screen">
      <header className="bar">
        <button className="round" aria-label="Geri" onClick={onBack}>‹</button>
        <h1 className="bar-title">{SUFFIX[step]} sayma</h1>
        <span className="chip white">Adım {i + 1} / {LESSON_STEPS}</span>
      </header>

      <section className="stage" style={{ background: COLORS[5] }}>
        <span className="stage-label">Şimdi birlikte söylüyoruz</span>
        <span className="stage-n" aria-live="polite">{current}</span>
        <div className="chips">
          {said.map((n) => (
            <span key={n} className="num-chip" style={{ background: n === current ? COLORS[3] : '#fff' }}>{n}</span>
          ))}
        </div>
      </section>

      <section className="beads-card">
        <div className="beads" role="img" aria-label={`${total} boncuk, her ${step}. boncuk işaretli`}>
          {Array.from({ length: total }, (_, k) => {
            const n = k + 1;
            const hit = n % step === 0;
            if (!hit) return <div key={n} className="bead-cell"><span className="dot" /></div>;
            const cls = n < current ? 'bead done' : n === current ? 'bead now' : 'bead';
            return <div key={n} className="bead-cell"><span className={cls}>{n}</span></div>;
          })}
        </div>
        <p className="hint">Her {step}. boncukta bir ritim vuruşu var.</p>
      </section>

      <div className="dots" role="img" aria-label={`${LESSON_STEPS} adımın ${i + 1}. adımındasın`}>
        {values.map((v, k) => (
          <span key={v} className="pdot" style={{ background: k < i ? '#1B1F4B' : k === i ? '#FFC93C' : '#fff', width: k === i ? 44 : 28 }} />
        ))}
      </div>

      <div className="actions">
        <button className="ghost" onClick={() => speak(values.slice(0, i + 1).join(', '))}>Dinle</button>
        <button className="cta" onClick={next}>{i + 1 >= LESSON_STEPS ? 'Bitir' : `Sıradaki: ${values[i + 1]}`}</button>
      </div>
    </main>
  );
}
