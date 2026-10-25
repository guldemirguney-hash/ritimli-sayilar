import { useEffect, useState } from 'react';
import { lessonCount } from '../lib/store';
import { COLORS, SUFFIX, praise, speak } from '../lib/theme';

interface Props {
  step: number;
  onBack: () => void;
  onProgress: (stepsDone: number) => void;
  onJourney: () => void;
}

export function Lesson({ step, onBack, onProgress, onJourney }: Props) {
  const n = lessonCount(step);
  const values = Array.from({ length: n }, (_, k) => (k + 1) * step);
  const last = values[n - 1];
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(false);
  const [finished, setFinished] = useState(false);
  const current = values[i];
  const said = values.slice(Math.max(0, i - 2), i + 1);

  const go = () => {
    onProgress(i + 1);
    if (i + 1 >= n) {
      setAuto(false);
      setFinished(true);
      speak(praise());
    } else {
      setI(i + 1);
    }
  };

  // Otomatik mod: her sayıyı söyler, bir sonrakine geçer.
  useEffect(() => {
    if (!auto || finished) return;
    speak(String(current), true);
    const t = setTimeout(go, 1500);
    return () => clearTimeout(t);
  }, [auto, i, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch { /* yok say */ } }, []);

  if (finished) {
    return (
      <main className="screen center">
        <h1 className="big">Ders bitti!</h1>
        <p className="lead">{SUFFIX[step]} sayarak {last} sayısına kadar geldin.</p>
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
        <span className="chip white">{i + 1} / {n}</span>
      </header>

      <section className="stage" style={{ background: COLORS[5] }}>
        <span className="stage-label">Şimdi birlikte söylüyoruz</span>
        <span className="stage-n" aria-live="polite">{current}</span>
        <div className="chips">
          {said.map((v) => (
            <span key={v} className="num-chip" style={{ background: v === current ? COLORS[3] : '#fff' }}>{v}</span>
          ))}
        </div>
      </section>

      <section className="beads-card">
        <div className="beads" role="img" aria-label={`1 den 100 e sayı tablosu, her ${step}. sayı işaretli`}>
          {Array.from({ length: 100 }, (_, k) => {
            const v = k + 1;
            if (v % step !== 0 || v > last) return <div key={v} className="bead-cell"><span className="dot" /></div>;
            const cls = v < current ? 'bead done' : v === current ? 'bead now' : 'bead';
            return <div key={v} className="bead-cell"><span className={cls}>{v}</span></div>;
          })}
        </div>
        <p className="hint">Sayı tablosu 100'e kadar gider. Her {step}. sayıda bir ritim vuruşu var.</p>
      </section>

      <div className="actions sticky">
        <button className="ghost" onClick={() => setAuto((a) => !a)} aria-pressed={auto}>{auto ? 'Durdur' : 'Otomatik'}</button>
        <button className="cta" disabled={auto} onClick={go}>{i + 1 >= n ? 'Bitir' : `Sıradaki: ${values[i + 1]}`}</button>
      </div>
    </main>
  );
}
