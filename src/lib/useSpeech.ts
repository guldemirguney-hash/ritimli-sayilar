import { useCallback, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySR = any;

function getSR(): AnySR | null {
  const w = window as unknown as Record<string, AnySR>;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type SpeechError = 'denied' | 'unsupported' | 'other' | null;

/** Sürekli dinleyen tr-TR konuşma tanıma. Her güncellemede oturumun tüm metnini onText'e verir. */
export function useSpeech(onText: (text: string) => void) {
  const supported = typeof window !== 'undefined' && getSR() !== null;
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [error, setError] = useState<SpeechError>(supported ? null : 'unsupported');
  const recRef = useRef<AnySR>(null);
  const wantRef = useRef(false);
  const cbRef = useRef(onText);
  cbRef.current = onText;

  const start = useCallback(() => {
    const SR = getSR();
    if (!SR) return;
    wantRef.current = true;
    setError(null);
    const rec = new SR();
    rec.lang = 'tr-TR';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onresult = (e: AnySR) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript + ' ';
      text = text.trim();
      setHeard(text);
      cbRef.current(text);
    };
    rec.onerror = (e: AnySR) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        wantRef.current = false;
        setError('denied');
      } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
        setError('other');
      }
    };
    rec.onend = () => {
      // Tarayıcı sessizlikte oturumu kapatır; istenmeye devam ediyorsa yeniden başlat.
      if (wantRef.current) setTimeout(() => { try { rec.start(); } catch { /* zaten çalışıyor */ } }, 150);
      else setListening(false);
    };
    recRef.current = rec;
    try { rec.start(); setListening(true); } catch { /* zaten çalışıyor */ }
  }, []);

  const stop = useCallback(() => {
    wantRef.current = false;
    recRef.current?.stop();
    setListening(false);
  }, []);

  useEffect(() => () => { wantRef.current = false; recRef.current?.abort?.(); }, []);

  return { supported, listening, heard, error, start, stop };
}
