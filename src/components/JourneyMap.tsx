import { useLayoutEffect, useMemo, useRef } from 'react';

const W = 342;
const GAP = 88;
const PAD = 70;

interface Props {
  step: number;
  last: number;
  progress: number;
  color: string;
}

export function JourneyMap({ step, last, progress, color }: Props) {
  const n = last / step;
  const H = PAD * 2 + (n - 1) * GAP;
  const boxRef = useRef<HTMLDivElement>(null);

  const stops = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => ({
        value: (i + 1) * step,
        x: W / 2 + Math.sin(i * 1.15) * 100,
        y: H - PAD - i * GAP,
      })),
    [n, step, H],
  );

  const pathD = useMemo(() => {
    const pts = [{ x: W / 2, y: H - 4 }, ...stops];
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const mx = (pts[i - 1].x + pts[i].x) / 2;
      const my = (pts[i - 1].y + pts[i].y) / 2;
      d += ` Q${pts[i - 1].x} ${my} ${mx} ${my} T${pts[i].x} ${pts[i].y}`;
    }
    return d;
  }, [stops, H]);

  // Sıradaki durağı görünümün ortasına kaydır.
  const first = useRef(true);
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    if (first.current) {
      // Açılışta animasyonsuz, yolun başına (en alta) git.
      first.current = false;
      box.scrollTop = box.scrollHeight;
      return;
    }
    const target = stops.find((s) => s.value > progress) ?? stops[stops.length - 1];
    box.scrollTo({ top: Math.max(0, target.y - box.clientHeight * 0.6), behavior: 'smooth' });
  }, [progress, stops]);

  return (
    <div className="map" ref={boxRef}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block' }}
        role="img"
        aria-label={`Yolculuk haritası, ${progress} durağına ulaşıldı, hedef ${last}`}
      >
        <path d={pathD} fill="none" stroke="#1B1F4B" strokeWidth="30" strokeLinecap="round" />
        <path d={pathD} fill="none" stroke="#fff" strokeWidth="20" strokeLinecap="round" />

        {stops.map((s) => {
          const done = s.value <= progress;
          const next = s.value === progress + step;
          const isLast = s.value === last;
          return (
            <g key={s.value} transform={`translate(${s.x} ${s.y})`}>
              {done && s.value === progress && <Burst key={progress} />}
              <circle
                className={next ? 'stop next' : done ? 'stop done' : 'stop'}
                r={next ? 29 : 24}
                fill={done ? color : next ? '#5CC8F2' : '#fff'}
              />
              <text className="stop-label" textAnchor="middle" y={next ? 8 : 7} fontSize={next ? 24 : 20}>
                {s.value}
              </text>
              {isLast && (
                <g transform="translate(34 -4)">
                  <line x1="0" y1="26" x2="0" y2="-24" stroke="#1B1F4B" strokeWidth="4" strokeLinecap="round" />
                  <path d="M2 -24 L30 -15 L2 -6z" fill="#FF8A7A" stroke="#1B1F4B" strokeWidth="3" strokeLinejoin="round" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];
const COLORS = ['#FF8A7A', '#B79CFF', '#7BD88F', '#FFC93C'];

function Burst() {
  return (
    <g className="burst" aria-hidden="true">
      {RAYS.map((a, i) => (
        <line
          key={a}
          x1="0" y1="-32" x2="0" y2="-50"
          stroke={COLORS[i % COLORS.length]}
          strokeWidth="5"
          strokeLinecap="round"
          transform={`rotate(${a})`}
        />
      ))}
      {[-20, 8, 36, 60].map((deg, i) => (
        <circle key={deg} cx={Math.cos((deg * Math.PI) / 180) * 58} cy={Math.sin((deg * Math.PI) / 180) * 58} r="4" fill={COLORS[(i + 1) % COLORS.length]} />
      ))}
    </g>
  );
}
