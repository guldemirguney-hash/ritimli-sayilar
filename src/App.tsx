import { useEffect, useState } from 'react';
import { GameHub } from './components/GameHub';
import { Journey } from './components/Journey';
import { Learn } from './components/Learn';
import { Lesson } from './components/Lesson';
import { Login } from './components/Login';
import { Progress } from './components/Progress';
import { Session, type SessionCfg, type SessionResult } from './components/session/Session';
import { TabBar, type Tab } from './components/TabBar';
import { lastStop, STEPS } from './lib/counter';
import { NODE_PATTERNS } from './lib/exercises';
import { bumpStreak, currentUser, emptyProfile, getProfile, lessonCount, logout, saveProfile, todayStr, type Profile } from './lib/store';
import { SUFFIX } from './lib/theme';

type View =
  | { kind: 'tab'; tab: Tab }
  | { kind: 'lesson'; step: number }
  | { kind: 'journey'; step: number }
  | { kind: 'session'; cfg: SessionCfg };

export default function App() {
  const [user, setUser] = useState<string | null>(() => currentUser());
  const [profile, setProfile] = useState<Profile>(() => (user ? getProfile(user) : emptyProfile()));
  const [view, setView] = useState<View>({ kind: 'tab', tab: 'learn' });
  const [pathStep, setPathStep] = useState<number>(STEPS[0]);

  useEffect(() => {
    if (user) saveProfile(user, profile);
  }, [user, profile]);

  const enter = (name: string) => {
    setProfile(getProfile(name));
    setUser(name);
    setView({ kind: 'tab', tab: 'learn' });
  };
  const leave = () => {
    logout();
    setUser(null);
  };

  const patchMod = (s: number, fn: (m: { lesson: number; best: number }) => { lesson: number; best: number }, bonus: (b: { lesson: number; best: number }, a: { lesson: number; best: number }) => number) =>
    setProfile((p) => {
      const before = p.mods[s] ?? { lesson: 0, best: 0 };
      const after = fn(before);
      return { ...p, stars: p.stars + bonus(before, after), mods: { ...p.mods, [s]: after } };
    });

  const finishSession = (cfg: SessionCfg, r: SessionResult) =>
    setProfile((p) => {
      const next: Profile = { ...p, xp: p.xp + r.xp, nodes: { ...p.nodes }, best: { ...p.best } };
      if (r.correct > 0) next.streak = bumpStreak(p.streak, todayStr());
      if (cfg.node && cfg.step && r.passed) {
        const key = `${cfg.step}:${cfg.node}`;
        const stars = r.mistakes === 0 ? 3 : r.mistakes <= 1 ? 2 : 1;
        const prev = p.nodes[key] ?? 0;
        if (stars > prev) {
          next.nodes[key] = stars;
          next.stars = p.stars + (stars - prev);
        }
      } else if (!cfg.node && cfg.types.length === 1) {
        const t = cfg.types[0];
        next.best[t] = Math.max(p.best[t] ?? 0, r.correct);
      }
      return next;
    });

  if (!user) return <Login onLogin={enter} />;

  if (view.kind === 'lesson') {
    const s = view.step;
    return (
      <Lesson
        step={s}
        onBack={() => setView({ kind: 'tab', tab: 'learn' })}
        onProgress={(n) => patchMod(s, (m) => ({ ...m, lesson: Math.max(m.lesson, n) }), (b, a) => (b.lesson < lessonCount(s) && a.lesson >= lessonCount(s) ? 2 : 0))}
        onJourney={() => setView({ kind: 'journey', step: s })}
      />
    );
  }
  if (view.kind === 'journey') {
    const s = view.step;
    return (
      <Journey
        step={s}
        onExit={() => setView({ kind: 'tab', tab: 'learn' })}
        onBest={(n) => patchMod(s, (m) => ({ ...m, best: Math.max(m.best, n) }), (b, a) => (b.best < lastStop(s) && a.best >= lastStop(s) ? 3 : 0))}
      />
    );
  }
  if (view.kind === 'session') {
    const cfg = view.cfg;
    return (
      <Session
        cfg={cfg}
        onFinish={(r) => finishSession(cfg, r)}
        onExit={() => setView({ kind: 'tab', tab: cfg.node ? 'learn' : 'play' })}
      />
    );
  }

  const tab = view.tab;
  return (
    <div className="app">
      <div className="content">
        {tab === 'learn' && (
          <Learn
            name={user}
            profile={profile}
            step={pathStep}
            onStep={setPathStep}
            onLesson={(s) => setView({ kind: 'lesson', step: s })}
            onJourney={(s) => setView({ kind: 'journey', step: s })}
            onNode={(s, r) => setView({ kind: 'session', cfg: { title: `${SUFFIX[s]} seviye ${r}`, step: s, node: r, types: NODE_PATTERNS[r - 1], count: 8, hearts: 3 } })}
          />
        )}
        {tab === 'play' && <GameHub profile={profile} onStart={(cfg) => setView({ kind: 'session', cfg })} />}
        {tab === 'progress' && <Progress profile={profile} onLogout={leave} />}
      </div>
      <TabBar tab={tab} onTab={(t) => setView({ kind: 'tab', tab: t })} />
    </div>
  );
}
