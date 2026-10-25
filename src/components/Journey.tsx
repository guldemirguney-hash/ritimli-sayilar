import { useCallback, useEffect, useRef, useState } from 'react';
import { JourneyMap } from './JourneyMap';
import { advance, lastStop } from '../lib/counter';
import { parseTurkishNumbers } from '../lib/trNumbers';
import { playPop } from '../lib/pop';
import { useSpeech } from '../lib/useSpeech';
import { COLORS, SUFFIX, praise, speak } from '../lib/theme';

interface Props { step: number; onExit: () => void; onBest: (n: number) => void }

export function Journey({ step, onExit, onBest }: Props) {
  const last = lastStop(step);
  const [progress, setProgress] = useState(0);
  const [typed, setTyped] = useState('');
  const [run, setRun] = useState(0);

  const onText = useCallback((text: string) => {
    setProgress((p) => advance(p, step, parseTurkishNumbers(text), last));
  }, [step, last]);
  const speech = useSpeech(onText);

  const prev = useRef(0);
  useEffect(() => {
    if (progress > prev.current) {
      playPop(progress === last);
      onBest(progress);
      if (progress === last) speak('Harika! Başardın!');
      else if ((progress / step) % 5 === 0) speak(praise());
    }
    prev.current = progress;
  }, [progress, last]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (progress === last) speech.stop();
  }, [progress, last]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => speech.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const done = progress === last;
  const next = Math.min(progress + step, last);
  const replay = () => { prev.current = 0; setProgress(0); setRun((r) => r + 1); };

  return (
    <main className="screen journey">
      <header className="bar">
        <button className="round" aria-label="Yolculuktan çık" onClick={() => { speech.stop(); onExit(); }}>✕</button>
        <h1 className="bar-title">{SUFFIX[step]} sayma yolculuğu</h1>
        <span className="chip" style={{ background: COLORS[step] }}>{progress} / {last}</span>
      </header>

      <JourneyMap key={run} step={step} last={last} progress={progress} color={COLORS[step]} />

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
                : speech.listening ? 'Dinliyorum' : 'Mikrofona dokun ve saymaya başla'}
          </span>
          <span className="heard">{speech.heard ? `“${speech.heard.split(' ').slice(-3).join(' ')}”` : ' '}</span>
          {!done && <span className="next">Sıradaki: <b>{next}</b></span>}
        </div>
      </section>

      {!done && (
        <form className="typed" onSubmit={(e) => { e.preventDefault(); const v = typed.trim(); if (v) onText(v); setTyped(''); }}>
          <label htmlFor="typed">Sesli test yerine yaz (örnek: “üç altı dokuz”)</label>
          <div className="typed-row">
            <input id="typed" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
            <button type="submit">Söyle</button>
          </div>
        </form>
      )}
      {!done && <button className="tap" onClick={() => setProgress((p) => Math.min(p + step, last))}>Dokunarak ilerle ({next})</button>}

      {done && (
        <div className="win" role="dialog" aria-label="Tebrikler">
          <h2>Başardın!</h2>
          <p>{last} sayısına kadar {SUFFIX[step]} saydın.</p>
          <div className="row">
            <button className="cta" onClick={replay}>Tekrar oyna</button>
            <button className="ghost" onClick={onExit}>Menüye dön</button>
          </div>
        </div>
      )}
    </main>
  );
}
