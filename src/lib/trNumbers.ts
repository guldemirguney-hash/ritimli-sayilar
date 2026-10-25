// Türkçe konuşma tanıma çıktısındaki sayıları (rakam ya da yazıyla) sıralı bir sayı listesine çevirir.

const ONES: Record<string, number> = {
  sifir: 0, bir: 1, iki: 2, uc: 3, dort: 4, bes: 5, alti: 6, yedi: 7, sekiz: 8, dokuz: 9,
};
const TENS: Record<string, number> = {
  on: 10, yirmi: 20, otuz: 30, kirk: 40, elli: 50, altmis: 60, yetmis: 70, seksen: 80, doksan: 90,
};

export function fold(s: string): string {
  return s
    .toLocaleLowerCase('tr')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
    .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');
}

export function parseTurkishNumbers(text: string): number[] {
  const tokens = fold(text).split(/[^a-z0-9]+/).filter(Boolean);
  const out: number[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (/^\d+$/.test(t)) {
      out.push(parseInt(t, 10));
    } else if (t in TENS) {
      let v = TENS[t];
      const next = tokens[i + 1];
      if (next && next in ONES && ONES[next] > 0) {
        v += ONES[next];
        i++;
      }
      out.push(v);
    } else if (t in ONES) {
      out.push(ONES[t]);
    } else if (t === 'yuz') {
      out.push(100);
    }
  }
  return out;
}
