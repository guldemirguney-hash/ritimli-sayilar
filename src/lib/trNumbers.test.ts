import { describe, expect, it } from 'vitest';
import { parseTurkishNumbers } from './trNumbers';
import { advance, lastStop } from './counter';

describe('parseTurkishNumbers', () => {
  it('yazıyla sayıları çevirir', () => {
    expect(parseTurkishNumbers('üç altı dokuz')).toEqual([3, 6, 9]);
    expect(parseTurkishNumbers('Yirmi Yedi otuz')).toEqual([27, 30]);
    expect(parseTurkishNumbers('kırk beş elli altmış yetmiş sekiz')).toEqual([45, 50, 60, 78]);
    expect(parseTurkishNumbers('doksan dokuz yüz')).toEqual([99, 100]);
  });
  it('rakamları ve karışık metni çevirir', () => {
    expect(parseTurkishNumbers('3 6 9 12')).toEqual([3, 6, 9, 12]);
    expect(parseTurkishNumbers('3 altı 9')).toEqual([3, 6, 9]);
  });
  it('ASCII yazımını da anlar', () => {
    expect(parseTurkishNumbers('uc alti dort bes')).toEqual([3, 6, 4, 5]);
  });
  it('bilinmeyen kelimeleri atlar', () => {
    expect(parseTurkishNumbers('hadi sayalım üç')).toEqual([3]);
  });
});

describe('advance', () => {
  it('sıradaki sayıyla ilerler', () => {
    expect(advance(0, 3, [3, 6, 9], 99)).toBe(9);
  });
  it('yanlış ve tekrar eden sayıları yok sayar', () => {
    expect(advance(0, 3, [3, 3, 7, 6, 6], 99)).toBe(6);
  });
  it('idempotent: aynı metin tekrar işlenince değişmez', () => {
    const once = advance(0, 5, [5, 10], 100);
    expect(advance(once, 5, [5, 10], 100)).toBe(10);
  });
  it('sınırı aşmaz', () => {
    expect(advance(96, 3, [99, 102], 99)).toBe(99);
    expect(lastStop(3)).toBe(99);
    expect(lastStop(10)).toBe(100);
  });
});
