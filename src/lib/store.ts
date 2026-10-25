// Geçici yerel kayıt (localStorage). Backend (FastAPI + MongoDB) bağlanınca bu dosya API çağrılarıyla değişecek.
import { lastStop } from './counter';

export interface ModProg { lesson: number; best: number }
export interface Streak { last: string; count: number }
export interface Profile {
  stars: number;
  xp: number;
  streak: Streak;
  mods: Record<number, ModProg>;
  nodes: Record<string, number>; // "3:2" -> 1..3 yıldız
  best: Record<string, number>;  // oyun türü -> en iyi doğru sayısı
}
export const emptyProfile = (): Profile => ({ stars: 0, xp: 0, streak: { last: '', count: 0 }, mods: {}, nodes: {}, best: {} });

/** Yerel saate göre YYYY-AA-GG. */
export function todayStr(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
/** Günlük seri: aynı gün değişmez, ertesi gün artar, ara verilirse 1'e döner. */
export function bumpStreak(s: Streak, today: string): Streak {
  if (s.last === today) return s;
  const [y, m, d] = today.split('-').map(Number);
  const yesterday = todayStr(new Date(y, m - 1, d - 1));
  return { last: today, count: s.last === yesterday ? s.count + 1 : 1 };
}

const USERS = 'rs.users';
const CUR = 'rs.current';
const PROF = 'rs.profile.';

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* kayıt yoksa sessiz geç */ }
}

export type LoginResult = { ok: true } | { ok: false; error: string };

/** Ad yoksa hesap açar, varsa gizli sayıyı doğrular. */
export function login(name: string, pin: string): LoginResult {
  const n = name.trim();
  if (n.length < 2) return { ok: false, error: 'Takma adın en az 2 harf olsun.' };
  if (!/^\d{4}$/.test(pin)) return { ok: false, error: 'Gizli sayın 4 rakam olsun.' };
  const users = read<Record<string, string>>(USERS, {});
  const key = n.toLocaleLowerCase('tr');
  if (key in users && users[key] !== pin) return { ok: false, error: 'Gizli sayı yanlış, tekrar dene.' };
  users[key] = pin;
  write(USERS, users);
  write(CUR, n);
  return { ok: true };
}

export function currentUser(): string | null {
  return read<string | null>(CUR, null);
}
export function logout() {
  try { localStorage.removeItem(CUR); } catch { /* yok say */ }
}

export function getProfile(name: string): Profile {
  return { ...emptyProfile(), ...read<Partial<Profile>>(PROF + name.toLocaleLowerCase('tr'), {}) };
}
export function saveProfile(name: string, p: Profile) {
  write(PROF + name.toLocaleLowerCase('tr'), p);
}

/** Bir modüldeki ders adımı sayısı: 100'e kadar olan tüm katlar (3'er için 33, 10'ar için 10). */
export function lessonCount(step: number): number {
  return lastStop(step) / step;
}

/** Modül yüzdesi: ders, yolculuk ve yol düğümlerinin (5) ortalaması. */
export function modPct(p: Profile, step: number): number {
  const m = p.mods[step] ?? { lesson: 0, best: 0 };
  const done = [1, 2, 3, 4, 5].filter((r) => (p.nodes[`${step}:${r}`] ?? 0) > 0).length;
  const parts = [Math.min(m.lesson, lessonCount(step)) / lessonCount(step), m.best / lastStop(step), done / 5];
  return Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100);
}
