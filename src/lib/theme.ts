export const COLORS: Record<number, string> = {
  2: '#FF8A7A', 3: '#FFC93C', 4: '#7BD88F', 5: '#5CC8F2', 6: '#B79CFF', 7: '#FF9FD0', 10: '#FFA94D',
};
export const SUFFIX: Record<number, string> = {
  2: "2'şer", 3: "3'er", 4: "4'er", 5: "5'er", 6: "6'şar", 7: "7'şer", 10: "10'ar",
};

/** Türkçe sesli okuma (varsa). Sayıları sırayla söyler. */
export function speak(text: string) {
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
