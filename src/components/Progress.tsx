import { STEPS } from '../lib/counter';
import { modPct, type Profile } from '../lib/store';
import { COLORS, SUFFIX } from '../lib/theme';

export function Progress({ profile, onLogout }: { profile: Profile; onLogout: () => void }) {
  const goal = Math.floor(profile.stars / 10) * 10 + 10;
  return (
    <main className="screen">
      <h1 className="title">İlerlemem</h1>
      <section className="star-card">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="#fff" stroke="#1B1F4B" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2.8l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.1l-5.6 2.9 1.1-6.2L3 9.4l6.2-.9z" />
        </svg>
        <div>
          <div className="star-n">{profile.stars} yıldız</div>
          <div className="star-goal">Sıradaki hedef: {goal} yıldız</div>
        </div>
      </section>
      <div className="rows">
        {STEPS.map((s) => {
          const p = modPct(profile, s);
          return (
            <div key={s} className="row-item">
              <div className="badge" style={{ background: COLORS[s] }}>{s}</div>
              <div className="row-mid">
                <span className="row-label">{SUFFIX[s]} sayma</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${p}%`, background: COLORS[s] }} /></div>
              </div>
              <span className="row-pct">%{p}</span>
            </div>
          );
        })}
      </div>
      <p className="hint">Yüzde, dersi bitirmeni ve sesli yolculukta ilerlemeni birlikte sayar.</p>
      <button className="ghost wide" onClick={onLogout}>Çıkış yap</button>
    </main>
  );
}
