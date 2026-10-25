import { useState } from 'react';
import { STEPS } from '../lib/counter';
import { NODES, nodeRange, val } from '../lib/exercises';
import { lessonCount, type Profile } from '../lib/store';
import { COLORS, SUFFIX } from '../lib/theme';

interface Props {
  name: string;
  profile: Profile;
  step: number;
  onStep: (s: number) => void;
  onLesson: (s: number) => void;
  onNode: (s: number, r: number) => void;
  onJourney: (s: number) => void;
}

const OFFSETS = [0, 52, 0, -52, 0, 52, 0];
const ink = '#1B1F4B';
const ico = { width: 34, height: 34, viewBox: '0 0 24 24', fill: 'none', stroke: ink, strokeWidth: 2.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

const Book = () => <svg {...ico}><path d="M3 5.500C5.500 4.500 9 4.500 12 6.500c3-2 6.500-2 9-1v13c-2.500-1-6-1-9 1-3-2-6.500-2-9-1z" /><path d="M12 6.500v13" /></svg>;
const Lock = () => <svg {...ico}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
const Check = () => <svg {...ico}><path d="M5 12.500l4.500 4.500L19 7.500" /></svg>;
const Play = () => <svg {...ico} fill={ink}><path d="M8 5.500v13l11-6.500z" /></svg>;
const Mic = () => <svg {...ico}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.500 11.500a6.500 6.500 0 0 0 13 0M12 18v3" /></svg>;
const Flame = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#FFA94D" stroke={ink} strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M12 3c1 4 5 5.500 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" /></svg>
);

export function Learn({ name, profile, step, onStep, onLesson, onNode, onJourney }: Props) {
  const [hint, setHint] = useState('');
  const key = (r: number) => `${step}:${r}`;
  const stars = (r: number) => profile.nodes[key(r)] ?? 0;
  const lessonDone = (profile.mods[step]?.lesson ?? 0) >= lessonCount(step);
  const rs = Array.from({ length: NODES }, (_, k) => k + 1);
  const unlocked = (r: number) => r === 1 || stars(r - 1) > 0;
  const current = rs.find((r) => unlocked(r) && stars(r) === 0) ?? 0;
  const journeyOpen = stars(NODES) > 0;
  const color = COLORS[step];

  const lock = (msg: string) => setHint(msg);

  return (
    <main className="screen">
      <header className="head">
        <div className="stats">
          <span className="stat" aria-label={`${profile.streak.count} günlük seri`}><Flame />{profile.streak.count}</span>
          <span className="stat"><b>XP</b> {profile.xp}</span>
          <span className="stat" aria-label={`${profile.stars} yıldız`}>★ {profile.stars}</span>
        </div>
        <h1 className="title">Merhaba, {name}!</h1>
      </header>

      <div className="chip-scroll" role="tablist" aria-label="Sayma modülü">
        {STEPS.map((s) => (
          <button key={s} role="tab" aria-selected={s === step} className={`mod-chip ${s === step ? 'on' : ''}`} style={{ background: s === step ? COLORS[s] : '#fff' }} onClick={() => { onStep(s); setHint(''); }}>
            {SUFFIX[s]}
          </button>
        ))}
      </div>

      <section className="path" aria-label={`${SUFFIX[step]} sayma yolu`}>
        <PathNode offset={OFFSETS[0]} label="Ders" sub={`1–${val(step, lessonCount(step) - 1)}`} state={lessonDone ? 'done' : 'open'} color={color} onClick={() => onLesson(step)} icon={lessonDone ? <Check /> : <Book />} />
        {rs.map((r) => {
          const st = stars(r) > 0 ? 'done' : unlocked(r) ? (r === current ? 'current' : 'open') : 'locked';
          const { lo, hi } = nodeRange(step, r);
          return (
            <PathNode
              key={r}
              offset={OFFSETS[r]}
              label={`Seviye ${r}`}
              sub={`${val(step, lo)}–${val(step, hi)}`}
              state={st}
              stars={stars(r)}
              color={color}
              icon={st === 'done' ? <Check /> : st === 'locked' ? <Lock /> : <Play />}
              onClick={() => (st === 'locked' ? lock('Önce bir önceki seviyeyi bitir.') : onNode(step, r))}
            />
          );
        })}
        <PathNode offset={OFFSETS[6]} label="Sesli yolculuk" sub={`${SUFFIX[step]} 100'e`} state={journeyOpen ? 'current' : 'locked'} color={color} icon={journeyOpen ? <Mic /> : <Lock />} onClick={() => (journeyOpen ? onJourney(step) : lock('5 seviyeyi bitirince yolculuk açılır.'))} />
      </section>
      <p className="hint path-hint" role="status">{hint}</p>
    </main>
  );
}

interface NodeProps {
  offset: number; label: string; sub: string; color: string; icon: React.ReactNode;
  state: 'locked' | 'open' | 'current' | 'done'; stars?: number; onClick: () => void;
}
function PathNode({ offset, label, sub, color, icon, state, stars, onClick }: NodeProps) {
  return (
    <div className="path-row" style={{ transform: `translateX(${offset}px)` }}>
      <div className="node-wrap">
        {state === 'current' && <span className="start-bubble">BAŞLA</span>}
        <button className={`node ${state}`} style={{ background: state === 'locked' ? '#D9DCF2' : color }} aria-label={`${label}, ${sub}${state === 'locked' ? ', kilitli' : ''}`} onClick={onClick}>
          {icon}
        </button>
        <span className="node-label">{label}</span>
        <span className="node-sub">{sub}</span>
        {stars ? <span className="node-stars" aria-label={`${stars} yıldız`}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</span> : null}
      </div>
    </div>
  );
}
