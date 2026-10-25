let ctx: AudioContext | null = null;

/** Küçük bir "pop" sesi (dosya gerekmez). İlk kullanıcı dokunuşundan sonra çalışır. */
export function playPop(final = false) {
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime;
    const notes = final ? [523, 659, 784, 1046] : [660];
    notes.forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, t + i * 0.12);
      o.frequency.exponentialRampToValueAtTime(f * 1.6, t + i * 0.12 + 0.08);
      g.gain.setValueAtTime(0.0001, t + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.25, t + i * 0.12 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 0.18);
      o.connect(g).connect(ctx!.destination);
      o.start(t + i * 0.12);
      o.stop(t + i * 0.12 + 0.2);
    });
  } catch { /* ses yoksa sessiz geç */ }
}

/** Metronom tık sesi. */
export function playTick(strong = false) {
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = strong ? 880 : 620;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.1);
  } catch { /* ses yoksa sessiz geç */ }
}
