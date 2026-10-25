// Geçici yerel kayıt (localStorage). Backend (FastAPI + MongoDB) bağlanınca bu dosya API çağrılarıyla değişecek.
import { lastStop } from './counter';

export interface ModProg { lesson: number; best: number }
export interface Profile { stars: number; mods: Record<number, ModProg> }

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
  return read<Profile>(PROF + name.toLocaleLowerCase('tr'), { stars: 0, mods: {} });
}
export function saveProfile(name: string, p: Profile) {
  write(PROF + name.toLocaleLowerCase('tr'), p);
}

/** Bir modüldeki ders adımı sayısı: 100'e kadar olan tüm katlar (3'er için 33, 10'ar için 10). */
export function lessonCount(step: number): number {
  return lastStop(step) / step;
}

/** Modül yüzdesi: ders adımları ve yolculukta ulaşılan en uzak durağın ortalaması. */
export function modPct(p: Profile, step: number): number {
  const m = p.mods[step];
  if (!m) return 0;
  return Math.round(((Math.min(m.lesson, lessonCount(step)) / lessonCount(step) + m.best / lastStop(step)) / 2) * 100);
}
