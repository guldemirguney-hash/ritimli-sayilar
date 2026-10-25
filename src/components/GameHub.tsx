import { useState } from 'react';
import { STEPS } from '../lib/counter';
import type { ExType } from '../lib/exercises';
import type { Profile } from '../lib/store';
import { COLORS, SUFFIX } from '../lib/theme';
import type { SessionCfg } from './session/Session';

const ink = '#1B1F4B';
const I = { width: 38, height: 38, viewBox: '0 0 24 24', fill: 'none', stroke: ink, strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

interface Game { type: ExType; title: string; desc: string; bg: string; icon: React.ReactNode }
const GAMES: Game[] = [
  { type: 'balloon', title: 'Balon patlat', desc: 'Doğru sayıları patlat', bg: '#BFE9F8', icon: <svg {...I}><ellipse cx="12" cy="9.500" rx="6" ry="7" /><path d="M12 16.500l-1.500 3h3zM12 19.500c0 1 1 1.500 1 3" /></svg> },
  { type: 'beat', title: 'Ritim vur', desc: 'Vuruşa uyup dokun', bg: '#FFA94D', icon: <svg {...I}><path d="M4 18l8-13 8 13z" /><path d="M12 15l4-6" /></svg> },
  { type: 'order', title: 'Sırala', desc: 'Küçükten büyüğe', bg: '#5CC8F2', icon: <svg {...I}><path d="M4 18h4v-4H4zM10 18h4v-8h-4zM16 18h4V6h-4z" /></svg> },
  { type: 'gap', title: 'Boşluğu doldur', desc: 'Eksik sayıyı bul', bg: '#B79CFF', icon: <svg {...I}><path d="M4 8h4M16 8h4M4 16h4M16 16h4" /><rect x="9.500" y="5" width="5" height="14" rx="1.500" strokeDasharray="2 2.500" /></svg> },
  { type: 'choice', title: 'Sıradaki sayı', desc: 'Dizi devam etsin', bg: '#7BD88F', icon: <svg {...I}><path d="M4 12h12M12 7l5 5-5 5" /></svg> },
  { type: 'say', title: 'Söyle', desc: 'Sayıyı yüksek sesle söyle', bg: '#FF9FD0', icon: <svg {...I}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.500 11.500a6.500 6.500 0 0 0 13 0M12 18v3" /></svg> },
];

const speechOk = () => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

interface Props { profile: Profile; onStart: (cfg: SessionCfg) => void }

export function GameHub({ profile, onStart }: Props) {
  const [step, setStep] = useState<number | null>(null);
  const voice = speechOk();
  return (
    <main className="screen">
      <header className="head">
        <h1 className="title">Oyun alanı</h1>
        <p className="sub">Bir oyun seç, 5 tur oyna. Kalp kaybetmezsin.</p>
      </header>

      <div className="chip-scroll" role="tablist" aria-label="Oyun modülü">
        <button role="tab" aria-selected={step === null} className={`mod-chip ${step === null ? 'on' : ''}`} style={{ background: step === null ? '#fff' : '#fff', borderColor: ink }} onClick={() => setStep(null)}>★ Karışık</button>
        {STEPS.map((s) => (
          <button key={s} role="tab" aria-selected={s === step} className={`mod-chip ${s === step ? 'on' : ''}`} style={{ background: s === step ? COLORS[s] : '#fff' }} onClick={() => setStep(s)}>{SUFFIX[s]}</button>
        ))}
      </div>

      <div className="grid games">
        {GAMES.map((g) => {
          const off = g.type === 'say' && !voice;
          const best = profile.best[g.type];
          return (
            <button key={g.type} className="tile game" style={{ background: g.bg }} disabled={off} onClick={() => onStart({ title: g.title, step, types: [g.type], count: 5, hearts: null })}>
              {g.icon}
              <span className="game-title">{g.title}</span>
              <span className="tile-sub">{off ? 'Bu tarayıcıda mikrofon yok' : g.desc}</span>
              <span className="game-best">{best !== undefined ? `En iyi: ${best} / 5` : 'Henüz oynamadın'}</span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
