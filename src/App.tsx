import { useEffect, useState } from 'react';
import { Journey } from './components/Journey';
import { Learn } from './components/Learn';
import { Lesson } from './components/Lesson';
import { Login } from './components/Login';
import { Play } from './components/Play';
import { Progress } from './components/Progress';
import { TabBar, type Tab } from './components/TabBar';
import { lastStop } from './lib/counter';
import { currentUser, getProfile, LESSON_STEPS, logout, saveProfile, type Profile } from './lib/store';

type View = { kind: 'tab'; tab: Tab } | { kind: 'lesson'; step: number } | { kind: 'journey'; step: number } | { kind: 'play'; step: number | null };

export default function App() {
  const [user, setUser] = useState<string | null>(() => currentUser());
  const [profile, setProfile] = useState<Profile>(() => (user ? getProfile(user) : { stars: 0, mods: {} }));
  const [view, setView] = useState<View>({ kind: 'tab', tab: 'learn' });

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

  const mod = (s: number) => profile.mods[s] ?? { lesson: 0, best: 0 };
  const patch = (s: number, fn: (m: { lesson: number; best: number }) => { lesson: number; best: number }, bonus: (before: { lesson: number; best: number }, after: { lesson: number; best: number }) => number) =>
    setProfile((p) => {
      const before = p.mods[s] ?? { lesson: 0, best: 0 };
      const after = fn(before);
      return { stars: p.stars + bonus(before, after), mods: { ...p.mods, [s]: after } };
    });

  if (!user) return <Login onLogin={enter} />;

  if (view.kind === 'lesson') {
    const s = view.step;
    return (
      <Lesson
        step={s}
        onBack={() => setView({ kind: 'tab', tab: 'learn' })}
        onProgress={(n) => patch(s, (m) => ({ ...m, lesson: Math.max(m.lesson, n) }), (b, a) => (b.lesson < LESSON_STEPS && a.lesson >= LESSON_STEPS ? 2 : 0))}
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
        onBest={(n) => patch(s, (m) => ({ ...m, best: Math.max(m.best, n) }), (b, a) => (b.best < lastStop(s) && a.best >= lastStop(s) ? 3 : 0))}
      />
    );
  }
  if (view.kind === 'play') {
    return (
      <Play
        fixedStep={view.step}
        onExit={() => setView({ kind: 'tab', tab: 'play' })}
        onFinish={(score) => setProfile((p) => ({ ...p, stars: p.stars + score }))}
      />
    );
  }

  const tab = view.tab;
  return (
    <div className="app">
      <div className="content">
        {tab === 'learn' && <Learn name={user} profile={profile} onPick={(s) => { mod(s); setView({ kind: 'lesson', step: s }); }} />}
        {tab === 'play' && (
          <main className="screen center">
            <h1 className="big">Hazır mısın?</h1>
            <p className="lead">10 soru, her doğru cevap bir yıldız.</p>
            <button className="cta wide" onClick={() => setView({ kind: 'play', step: null })}>Karışık oyna</button>
            <button className="ghost wide" onClick={() => setView({ kind: 'tab', tab: 'learn' })}>Bir sayı seçip çalış</button>
          </main>
        )}
        {tab === 'progress' && <Progress profile={profile} onLogout={leave} />}
      </div>
      <TabBar tab={tab} onTab={(t) => setView({ kind: 'tab', tab: t })} />
    </div>
  );
}
