import { useMemo, useState } from 'react';
import { STEPS } from '../lib/counter';
import { SUFFIX, speak } from '../lib/theme';

const COUNT = 10;

interface Q { step: number; seq: number[]; answer: number; options: number[] }

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function makeQ(fixed: number | null): Q {
  const step = fixed ?? STEPS[Math.floor(Math.random() * STEPS.length)];
  const s = Math.floor(Math.random() * 4);
  const seq = [1, 2, 3].map((k) => (s + k) * step);
  const answer = (s + 4) * step;
  const pool = [answer + 1, answer - 1, answer + step, answer - step, answer + 2, answer - 2].filter((v) => v > 0 && v !== answer);
  const options = shuffle([answer, ...shuffle([...new Set(pool)]).slice(0, 3)]);
  return { step, seq, answer, options };
}

interface Props { fixedStep: number | null; onExit: () => void; onFinish: (score: number) => void }

export function Play({ fixedStep, onExit, onFinish }: Props) {
  const [round, setRound] = useState(0);
  const qs = useMemo(() => Array.from({ length: COUNT }, () => makeQ(fixedStep)), [fixedStep, round]);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const q = qs[idx];

  const check = () => {
    if (sel === null) return;
    setChecked(true);
    if (sel === q.answer) setScore((s) => s + 1);
  };
  const next = () => {
    if (idx + 1 >= COUNT) {
      setOver(true);
      onFinish(score);
    } else {
      setIdx(idx + 1);
      setSel(null);
      setChecked(false);
    }
  };
  const again = () => {
    setRound((r) => r + 1);
    setIdx(0); setSel(null); setChecked(false); setScore(0); setOver(false);
  };

  if (over) {
    return (
      <main className="screen center">
        <h1 className="big">{score} / {COUNT} doğru</h1>
        <p className="lead">{score >= 8 ? 'Harikasın!' : score >= 5 ? 'İyi gidiyorsun, bir tur daha?' : 'Birlikte tekrar edelim, olacak.'} Kazandığın yıldız: {score}</p>
        <button className="cta wide" onClick={again}>Tekrar oyna</button>
        <button className="ghost wide" onClick={onExit}>Menüye dön</button>
      </main>
    );
  }

  const correct = checked && sel === q.answer;
  return (
    <main className="screen">
      <header className="bar">
        <button className="round" aria-label="Oyundan çık" onClick={onExit}>✕</button>
        <div className="progress-bar" role="img" aria-label={`${COUNT} sorunun ${idx + 1}'indeyiz`}>
          <div style={{ width: `${((idx + (checked ? 1 : 0)) / COUNT) * 100}%` }} />
        </div>
        <span className="chip yellow">★ {score}</span>
      </header>

      <section className="stage" style={{ background: '#B79CFF' }}>
        <h1 className="q-title">{SUFFIX[q.step]} sayıyoruz. Sıradaki sayı hangisi?</h1>
        <div className="chips">
          {q.seq.map((n) => <span key={n} className="circle">{n}</span>)}
          <span className="circle dashed">{checked ? q.answer : '?'}</span>
        </div>
        <button className="ghost small" onClick={() => speak(q.seq.join(', '))}>Ritmi dinle</button>
      </section>

      <div className="answers">
        {q.options.map((o) => {
          const isSel = sel === o;
          const isRight = checked && o === q.answer;
          const isWrong = checked && isSel && o !== q.answer;
          return (
            <button key={o} className={`answer ${isSel ? 'sel' : ''} ${isRight ? 'right' : ''} ${isWrong ? 'wrong' : ''}`} aria-pressed={isSel} disabled={checked} onClick={() => setSel(o)}>
              {isRight ? '✓ ' : isWrong ? '✗ ' : ''}{o}
            </button>
          );
        })}
      </div>

      <div className="bottom">
        {checked && <p className="feedback" role="status">{correct ? 'Doğru, aferin!' : `Olmadı, doğrusu ${q.answer}.`}</p>}
        {checked
          ? <button className="cta wide" onClick={next}>{idx + 1 >= COUNT ? 'Bitir' : 'Devam'}</button>
          : <button className="cta wide green" disabled={sel === null} onClick={check}>Kontrol et</button>}
      </div>
    </main>
  );
}
