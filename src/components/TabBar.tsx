import type React from 'react';
export type Tab = 'learn' | 'play' | 'progress';

const svg = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: '#1B1F4B', strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'learn', label: 'Öğren', icon: <svg {...svg}><path d="M3 5.5C5.5 4.5 9 4.5 12 6.5c3-2 6.5-2 9-1v13c-2.5-1-6-1-9 1-3-2-6.5-2-9-1z" /><path d="M12 6.5v13" /></svg> },
    { id: 'play', label: 'Oyna', icon: <svg {...svg}><circle cx="12" cy="12" r="9" /><path d="M10 8.5l5.5 3.5-5.5 3.5z" /></svg> },
    { id: 'progress', label: 'İlerleme', icon: <svg {...svg}><path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8L3.6 9.6l5.8-.8z" /></svg> },
  ];
  return (
    <nav className="tabbar" aria-label="Ana menü">
      {items.map((it) => (
        <button key={it.id} className={`tab ${tab === it.id ? 'active' : ''}`} aria-current={tab === it.id ? 'page' : undefined} onClick={() => onTab(it.id)}>
          {it.icon}
          {it.label}
        </button>
      ))}
    </nav>
  );
}
