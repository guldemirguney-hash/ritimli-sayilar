export const COLORS: Record<number, string> = {
  2: '#FF8A7A', 3: '#FFC93C', 4: '#7BD88F', 5: '#5CC8F2', 6: '#B79CFF', 7: '#FF9FD0', 10: '#FFA94D',
};
export const SUFFIX: Record<number, string> = {
  2: "2'şer", 3: "3'er", 4: "4'er", 5: "5'er", 6: "6'şar", 7: "7'şer", 10: "10'ar",
};

const PRAISE = ['Aferin!', 'İyi iş!', 'Süpersin!', 'Harika!', 'Bravo!', 'Çok güzel!'];
export function praise(): string {
  return PRAISE[Math.floor(Math.random() * PRAISE.length)];
}

export function isMuted(): boolean {
  try { return localStorage.getItem('rs.muted') === '1'; } catch { return false; }
}
export function setMuted(m: boolean) {
  try { localStorage.setItem('rs.muted', m ? '1' : '0'); } catch { /* yok say */ }
}

export type VoiceStyle = 'anime' | 'normal' | 'soft';
export const VOICE_STYLES: Record<VoiceStyle, { label: string; pitch: number; rate: number }> = {
  anime: { label: 'Neşeli', pitch: 1.75, rate: 1.0 },
  soft: { label: 'Yumuşak', pitch: 1.3, rate: 0.85 },
  normal: { label: 'Normal', pitch: 1, rate: 0.85 },
};
export function getVoiceStyle(): VoiceStyle {
  try {
    const v = localStorage.getItem('rs.voice');
    if (v === 'anime' || v === 'soft' || v === 'normal') return v;
  } catch { /* yok say */ }
  return 'anime';
}
export function setVoiceStyle(v: VoiceStyle) {
  try { localStorage.setItem('rs.voice', v); } catch { /* yok say */ }
}

/** Cihazdaki en doğal ve genç duyulan Türkçe sesi seçer (yoksa tarayıcının varsayılanı). */
function pickVoice(): SpeechSynthesisVoice | undefined {
  const all = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('tr'));
  const score = (v: SpeechSynthesisVoice) =>
    (/neural|natural|online|premium|enhanced/i.test(v.name) ? 3 : 0) +
    (/google/i.test(v.name) ? 2 : 0) +
    (/yelda|emel|filiz|seda|female|kad[ıi]n/i.test(v.name) ? 2 : 0) +
    (/tolga|male|erkek/i.test(v.name) ? -2 : 0);
  return all.sort((a, b) => score(b) - score(a))[0];
}

/** Türkçe sesli okuma (varsa). force: sessiz modda bile (kullanıcı "Dinle"ye bastığında). */
export function speak(text: string, force = false) {
  if (!force && isMuted()) return;
  try {
    const s = window.speechSynthesis;
    if (!s) return;
    s.cancel();
    const style = VOICE_STYLES[getVoiceStyle()];
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'tr-TR';
    const v = pickVoice();
    if (v) u.voice = v;
    u.pitch = style.pitch;
    u.rate = style.rate;
    s.speak(u);
  } catch { /* ses yoksa sessiz geç */ }
}
