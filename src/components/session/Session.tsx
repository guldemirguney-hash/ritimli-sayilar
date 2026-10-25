import { useEffect, useMemo, useRef, useState } from 'react';
import { makeExercise, nodeRange, NODE_PATTERNS, count, type ExType } from '../../lib/exercises';
import { STEPS } from '../../lib/counter';
import { praise, speak } from '../../lib/theme';
import { Balloons } from './Balloons';
import { BeatTap } from './BeatTap';
import { Choice } from './Choice';
import { Order } from './Order';
import { SayIt } from './SayIt';
import type { Result } from './types';

export interface SessionCfg {
  title: string;
  step: number | null;   // null: karışık (her alıştırmada rastgele modül)
  node?: number;         // yol durağı (1..5); yoksa serbest oyun
  types: ExType[];
  count: number;
  hearts: number | null; // null: sınırsız
}
export interface SessionResult { passed: boolean; correct: number; total: number; mistakes: number; xp: number }

const XP_PER_CORRECT = 10;
const speechOk = () => typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

function HeartIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="#FF8A7A" stroke="#1B1F4B" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20.5C5 15.5 3 12 3 9a4.5 4.5 0 0 1 9-1.2A4.5 4.5 0 0 1 21 9c0 3-2 6.500-9 11.500z" />
    </svg>
  );
}

interface Props { cfg: SessionCfg; onFinish: (r: SessionResult) => void; onExit: () => void }

export function Session({ cfg, onFinish, onExit }: Props) {
  const [run, setRun] = useState(0);
  const exercises = useMemo(() => {
    const voice = speechOk();
    return Array.from({ length: cfg.count }, (_, i) => {
      let type = cfg.types[i % cfg.types.length];
      if (type === 'say' && !voice && cfg.types.length > 1) type = 'choice';
      const step = cfg.step ?? STEPS[Math.floor(Math.random() * STEPS.length)];
      const n = count(step);
      let range = { lo: 0, hi: n - 1 };
      if (cfg.node) {
        const r = nodeRange(step, cfg.node);
        range = Math.random() < 0.3 ? { lo: 0, hi: r.hi } : r; // %30 önceki konulardan tekrar
      }
      return makeExercise(type, step, range);
    });
  }, [cfg, run]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = exercises.length;
  const [i, setI] = useState(0);
  const [hearts, setHearts] = useState(cfg.hearts);
  const [correct, setCorrect] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [fb, setFb] = useState<{ ok: boolean; info?: string } | null>(null);
  const [over, setOver] = useState<'win' | 'lose' | null>(null);
  const reported = useRef(false);
  const xp = correct * XP_PER_CORRECT;

  useEffect(() => {
    if (!over || reported.current) return;
    reported.current = true;
    onFinish({ passed: over === 'win', correct, total, mistakes, xp });
    speak(over === 'win' ? praise() : 'Bir daha deneriz.');
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (r: Result) => {
    if (fb) return;
    if (r.skip) { advance(); return; }
    setFb({ ok: r.ok, info: r.info });
    if (r.ok) {
      setCorrect((c) => c + 1);
      speak(praise());
    } else {
      setMistakes((m) => m + 1);
      if (hearts !== null) setHearts(hearts - 1);
    }
  };
  function advance() {
    setFb(null);
    if (i + 1 >= total) setOver('win');
    else setI(i + 1);
  }
  const next = () => {
    if (fb && !fb.ok && hearts !== null && hearts <= 0) setOver('lose');
    else advance();
  };
  const replay = () => {
    reported.current = false;
    setRun((r) => r + 1);
    setI(0); setHearts(cfg.hearts); setCorrect(0); setMistakes(0); setFb(null); setOver(null);
  };

  if (over) {
    const win = over === 'win';
    const stars = mistakes === 0 ? 3 : mistakes <= 1 ? 2 : 1;
    return (
      <main className="screen center">
        <h1 className="big">{win ? 'Harikasın!' : 'Kalpler bitti'}</h1>
        <p className="lead">
          {win ? `${cfg.title} tamam.` : 'Sorun değil, birlikte tekrar edelim.'} {correct} / {total} doğru, +{xp} XP
        </p>
        {win && cfg.node && <p className="stars-line" aria-label={`${stars} yıldız`}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>}
        <button className="cta wide" onClick={win ? onExit : replay}>{win ? 'Devam' : 'Tekrar dene'}</button>
        {win ? <button className="ghost wide" onClick={replay}>Bir kez daha</button> : <button className="ghost wide" onClick={onExit}>Çık</button>}
      </main>
    );
  }

  const ex = exercises[i];
  const locked = fb !== null;
  const props = { ex, locked, onAnswer: answer };
  return (
    <main className="screen session">
      <header className="bar">
        <button className="round" aria-label="Dersten çık" onClick={onExit}>✕</button>
        <div className="progress-bar" role="img" aria-label={`${total} alıştırmanın ${i + 1}'indeyiz`}>
          <div style={{ width: `${((i + (fb?.ok ? 1 : 0)) / total) * 100}%` }} />
        </div>
        {hearts !== null && <span className="hearts" aria-label={`${Math.max(0, hearts)} kalp`}><HeartIcon />{Math.max(0, hearts)}</span>}
      </header>

      <div key={`${run}-${i}`} className="ex">
        {(ex.type === 'choice' || ex.type === 'gap') && <Choice {...props} />}
        {ex.type === 'order' && <Order {...props} />}
        {ex.type === 'balloon' && <Balloons {...props} />}
        {ex.type === 'beat' && <BeatTap {...props} />}
        {ex.type === 'say' && <SayIt {...props} />}
      </div>

      {fb && (
        <div className={`fb ${fb.ok ? 'ok' : 'bad'}`} role="status">
          <div className="fb-in">
            <div className="fb-text">
              <strong>{fb.ok ? 'Doğru!' : 'Olmadı'}</strong>
              <span>{fb.ok ? `+${XP_PER_CORRECT} XP` : fb.info}</span>
            </div>
            <button className="cta" onClick={next}>Devam</button>
          </div>
        </div>
      )}
    </main>
  );
}
