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

/** Türkçe sesli okuma (varsa). force: sessiz modda bile (kullanıcı "Dinle"ye bastığında). */
export function speak(text: string, force = false) {
  if (!force && isMuted()) return;
  try {
    const s = window.speechSynthesis;
    if (!s) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'tr-TR';
    u.rate = 0.8;
    s.speak(u);
  } catch { /* ses yoksa sessiz geç */ }
}
