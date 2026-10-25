import { STEPS } from '../lib/counter';
import { modPct, type Profile } from '../lib/store';
import { COLORS, SUFFIX } from '../lib/theme';

export function Learn({ name, profile, onPick }: { name: string; profile: Profile; onPick: (s: number) => void }) {
  return (
    <main className="screen">
      <h1 className="title">Merhaba, {name}!</h1>
      <p className="sub">Hangi sayıyla ritim tutalım?</p>
      <div className="grid">
        {STEPS.map((s) => (
          <button key={s} className="tile" style={{ background: COLORS[s], gridColumn: s === 10 ? 'span 2' : undefined }} onClick={() => onPick(s)}>
            <span className="tile-top">
              <span className="tile-n">{s}</span>
              <span>{SUFFIX[s]} say</span>
            </span>
            <span className="bar-track" role="img" aria-label={`Yüzde ${modPct(profile, s)}`}>
              <span className="bar-fill" style={{ width: `${modPct(profile, s)}%` }} />
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
