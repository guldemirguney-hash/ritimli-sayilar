import { STEPS } from '../lib/counter';
import { modPct, type Profile } from '../lib/store';
import { COLORS, SUFFIX } from '../lib/theme';

interface Props { name: string; profile: Profile; onPick: (s: number) => void; onMix: () => void }

export function Learn({ name, profile, onPick, onMix }: Props) {
  return (
    <main className="screen">
      <header className="head">
        <h1 className="title">Merhaba, {name}!</h1>
        <p className="sub">Hangi sayıyla ritim tutalım?</p>
      </header>
      <div className="grid">
        {STEPS.map((s) => (
          <button key={s} className="tile" style={{ background: COLORS[s] }} onClick={() => onPick(s)}>
            <span className="tile-top">
              <span className="tile-n">{s}</span>
              <span className="tile-label">{SUFFIX[s]} say</span>
            </span>
            <span className="bar-track" role="img" aria-label={`Yüzde ${modPct(profile, s)}`}>
              <span className="bar-fill" style={{ width: `${modPct(profile, s)}%` }} />
            </span>
          </button>
        ))}
        <button className="tile mix" onClick={onMix}>
          <span className="tile-top">
            <span className="tile-n">★</span>
            <span className="tile-label">Karışık oyna</span>
          </span>
          <span className="tile-sub">10 soru</span>
        </button>
      </div>
    </main>
  );
}
