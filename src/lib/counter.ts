export const STEPS = [2, 3, 4, 5, 6, 7, 10] as const;

/** Verilen adım için ulaşılabilecek son durak (3'er için 99, 10'ar için 100). */
export function lastStop(step: number, max = 100): number {
  return Math.floor(max / step) * step;
}

/**
 * Duyulan sayı dizisini mevcut ilerlemeye uygular.
 * Yalnızca sıradaki beklenen sayı (progress + step) kabul edilir; tekrarlar ve
 * yanlış sayılar yok sayılır, bu yüzden aynı metin birden çok kez işlense de sonuç değişmez.
 */
export function advance(progress: number, step: number, heard: number[], limit: number): number {
  let p = progress;
  for (const n of heard) {
    if (p + step <= limit && n === p + step) p = n;
  }
  return p;
}
