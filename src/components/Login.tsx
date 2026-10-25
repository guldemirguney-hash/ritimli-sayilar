import { useState } from 'react';
import { login } from '../lib/store';

const BEATS = [
  { n: 5, bg: '#5CC8F2' }, { n: 10, bg: '#FFC93C' }, { n: 15, bg: '#FF8A7A' }, { n: 20, bg: '#7BD88F' },
];

export function Login({ onLogin }: { onLogin: (name: string) => void }) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = login(name, pin);
    if (r.ok) onLogin(name.trim());
    else setError(r.error);
  };

  return (
    <main className="screen">
      <div className="brand">
        <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
          <path d="M8 24v16c0 5 9 9 20 9s20-4 20-9V24" fill="#FF8A7A" stroke="#1B1F4B" strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="28" cy="24" rx="20" ry="8" fill="#FFC93C" stroke="#1B1F4B" strokeWidth="3" />
          <path d="M15 32l5 13M41 32l-5 13M28 33v15" stroke="#1B1F4B" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M34 6l-8 11M46 10l-10 9" stroke="#1B1F4B" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
        <span>Ritimli Sayılar</span>
      </div>
      <h1 className="title">Ritimle say, hepsini bil!</h1>
      <div className="beats">
        {BEATS.map((b) => (
          <div key={b.n} className="beat">
            <div className="beat-n" style={{ background: b.bg }}>{b.n}</div>
            <div className="beat-dot" />
          </div>
        ))}
      </div>
      <form className="form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="takma">Takma adın</label>
          <input id="takma" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="Örnek: Zıpzıp" autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="pin">Gizli sayın (4 rakam)</label>
          <input id="pin" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }} placeholder="••••" />
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="cta wide">Hadi başlayalım</button>
        <p className="hint">İlk kez mi geldin? Takma adını ve gizli sayını yaz, hesabın kendiliğinden açılır.</p>
      </form>
      <p className="version">Sürüm 0.4</p>
    </main>
  );
}
