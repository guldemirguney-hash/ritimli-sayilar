import { useCallback, useRef } from 'react';
import { parseTurkishNumbers } from '../../lib/trNumbers';
import { useSpeech } from '../../lib/useSpeech';
import { SUFFIX, speak } from '../../lib/theme';
import type { ExProps } from './types';

/** Çocuk bir sonraki sayıyı yüksek sesle söyler. Mikrofon çalışmazsa alıştırma atlanır (ceza yok). */
export function SayIt({ ex, locked, onAnswer }: ExProps) {
  const done = useRef(false);
  const onText = useCallback((text: string) => {
    if (done.current) return;
    if (parseTurkishNumbers(text).includes(ex.answer!)) {
      done.current = true;
      speech.stop();
      onAnswer({ ok: true });
    }
  }, [ex.answer]); // eslint-disable-line react-hooks/exhaustive-deps
  const speech = useSpeech(onText);
  const shown = ex.shown ?? [];

  return (
    <>
      <section className="stage" style={{ background: '#FF9FD0' }}>
        <h2 className="q-title">{SUFFIX[ex.step]} sayıyoruz. Sıradaki sayıyı yüksek sesle söyle!</h2>
        <div className="chips">
          {shown.map((v, i) => <span key={i} className="circle">{v}</span>)}
          <span className="circle dashed">?</span>
        </div>
        <button className="ghost small" onClick={() => speak(shown.join(', '), true)}>Ritmi dinle</button>
      </section>
      <section className="panel" aria-live="polite">
        <button
          className={`mic ${speech.listening ? 'on' : ''}`}
          aria-label={speech.listening ? 'Mikrofon açık, durdurmak için dokun' : 'Mikrofonu aç ve söyle'}
          disabled={locked || !speech.supported}
          onClick={() => (speech.listening ? speech.stop() : speech.start())}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1B1F4B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="3" width="6" height="11" rx="3" fill="#fff" />
            <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
          </svg>
        </button>
        <div className="info">
          <span className="state">
            {speech.error === 'denied' ? 'Mikrofon izni verilmedi' : speech.listening ? 'Dinliyorum' : 'Mikrofona dokun ve söyle'}
          </span>
          <span className="heard">{speech.heard ? `“${speech.heard.split(' ').slice(-3).join(' ')}”` : ' '}</span>
        </div>
      </section>
      <div className="ex-foot">
        <button className="ghost wide" disabled={locked} onClick={() => { speech.stop(); onAnswer({ ok: false, skip: true }); }}>
          Atla (mikrofon yok)
        </button>
      </div>
    </>
  );
}
