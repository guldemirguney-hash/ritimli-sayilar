import { useCallback, useEffect, useRef, useState } from 'react';
import { JourneyMap } from './components/JourneyMap';
import { advance, lastStop, STEPS } from './lib/counter';
import { parseTurkishNumbers } from './lib/trNumbers';
import { playPop } from './lib/pop';
import { useSpeech } from './lib/useSpeech';

const COLORS: Record<number, string> = {
  2: '#FF8A7A', 3: '#FFC93C', 4: '#7BD88F', 5: '#5CC8F2', 6: '#B79CFF', 7: '#FF9FD0', 10: '#FFA94D',
};
const SUFFIX: Record<number, string> = {
  2: "2'şer", 3: "3'er", 4: "4'er", 5: "5'er", 6: "6'şar", 7: "7'şer", 10: "10'ar",
};

export default function App() {
  const [step, setStep] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [typed, setTyped] = useState('');
  const stepRef = useRef(3);
  const last = step ? lastStop(step) : 0;
  const lastRef = useRef(0);
  lastRef.current = last;

  const onText = useCallback((text: string) => {
    const nums = parseTurkishNumbers(text);
    setProgress((p) => advance(p, stepRef.current, nums, lastRef.current));
  }, []);
  const speech = useSpeech(onText);

  // Her ilerlemede pop sesi; bitişte melodi.
  const prev = useRef(0);
  useEffect(() => {
    if (progress > prev.current) playPop(progress === last && last > 0);
    prev.current = progress;
  }, [progress, last]);

  // Bitince mikrofonu kapat.
  useEffect(() => {
    if (last > 0 && progress === last) speech.stop();
  }, [progress, last]); // eslint-disable-line react-hooks/exhaustive-deps

  const begin = (s: number) => {
    stepRef.current = s;
    prev.current = 0;
    setProgress(0);
    setStep(s);
  };
  const exit = () => {
    speech.stop();
    setStep(null);
  };

  if (step === null) {
    return (
      <main className="screen">
        <h1 className="title">Ritimle say, hepsini bil!</h1>
        <p className="sub">Hangi sayıyla yolculuğa çıkalım?</p>
        <div className="grid">
          {STEPS.map((s) => (
            <button
              key={s}
              className="tile"
              style={{ background: COLORS[s], gridColumn: s === 10 ? 'span 2' : undefined }}
              onClick={() => begin(s)}
            >
              <span className="tile-n">{s}</span>
              <span>{SUFFIX[s]} say</span>
            </button>
          ))}
        </div>
      </main>
    );
  }

  const done = progress === last;
  const next = Math.min(progress + step, last);

  return (
    <main className="screen journey">
      <header className="bar">
        <button className="round" aria-label="Yolculuktan çık" onClick={exit}>✕</button>
        <h1 className="bar-title">{SUFFIX[step]} sayma yolculuğu</h1>
        <span className="chip" style={{ background: COLORS[step] }}>{progress} / {last}</span>
      </header>

      <JourneyMap step={step} last={last} progress={progress} color={COLORS[step]} />

      <section className="panel" aria-live="polite">
        <button
          className={`mic ${speech.listening ? 'on' : ''}`}
          aria-label={speech.listening ? 'Mikrofon açık, durdurmak için dokun' : 'Mikrofonu aç ve saymaya başla'}
          onClick={() => (speech.listening ? speech.stop() : speech.start())}
          disabled={!speech.supported || done}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1B1F4B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="3" width="6" height="11" rx="3" fill="#fff" />
            <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
          </svg>
        </button>
        <div className="info">
          <span className="state">
            {speech.error === 'denied'
              ? 'Mikrofon izni verilmedi'
              : !speech.supported
                ? 'Bu tarayıcı sesi anlayamıyor, dokunarak devam et'
                : speech.listening
                  ? 'Dinliyorum'
                  : 'Mikrofona dokun ve saymaya başla'}
          </span>
          <span className="heard">{speech.heard ? `“${speech.heard.split(' ').slice(-3).join(' ')}”` : ' '}</span>
          {!done && <span className="next">Sıradaki: <b>{next}</b></span>}
        </div>
      </section>

      {!done && (
        <form
          className="typed"
          onSubmit={(e) => {
            e.preventDefault();
            const v = typed.trim();
            if (v) onText(v);
            setTyped('');
          }}
        >
          <label htmlFor="typed">Sesli test yerine yaz (örnek: “üç altı dokuz”)</label>
          <div className="typed-row">
            <input id="typed" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
            <button type="submit">Söyle</button>
          </div>
        </form>
      )}

      {!done && (
        <button className="tap" onClick={() => setProgress((p) => Math.min(p + step, last))}>
          Dokunarak ilerle ({next})
        </button>
      )}

      {done && (
        <div className="win" role="dialog" aria-label="Tebrikler">
          <h2>Başardın!</h2>
          <p>{last} sayısına kadar {SUFFIX[step]} saydın.</p>
          <div className="row">
            <button className="cta" onClick={() => begin(step)}>Tekrar oyna</button>
            <button className="ghost" onClick={exit}>Başka sayı</button>
          </div>
        </div>
      )}
    </main>
  );
}
