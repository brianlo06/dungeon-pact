import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";

/**
 * The Bailiff's Court: the hall outside it, and its door.
 *
 * A long, plain, cold hall of dressed stone lined with doors, every door
 * posted with served notices — pale sheets nailed on, overlapping, a red
 * stripe of seal-tape across each. At the far end of the frame (centred on
 * x 1180) the court door itself: tall, iron-strapped, shut, with a line of
 * lamplight under it. A runner of worn carpet down the middle of the floor.
 *
 * Drawn on the 3200×1800 box, world units. The floor is at y 800. Static; the
 * door swinging open is an effect laid over this one.
 */
const FLOOR = 800;
const COURT_DOOR = { x: 1180, top: 180, width: 380 };

function Notices({ x, y, seed }: { x: number; y: number; seed: number }) {
  const rand = seeded(seed);
  return (
    <g>
      {Array.from({ length: 7 }, (_, i) => {
        const w = 70 + rand() * 30;
        const h = 90 + rand() * 30;
        const nx = x - 90 + rand() * 120;
        const ny = y + rand() * 240;
        const r = (rand() - 0.5) * 14;
        return (
          <g key={i} transform={`rotate(${r.toFixed(1)} ${nx + w / 2} ${ny})`}>
            <rect x={nx} y={ny} width={w} height={h} fill="#cfc6ae" stroke="#171420" strokeWidth={3} />
            {[0.25, 0.42, 0.59].map((k) => (
              <path key={k} d={`M${nx + 10} ${ny + h * k} H${nx + w - 12}`} stroke="#7a705a" strokeWidth={3} />
            ))}
            <path d={`M${nx - 4} ${ny + h * 0.8} L${nx + w + 4} ${ny + h * 0.7}`} stroke="#9a2e28" strokeWidth={8} />
            <circle cx={nx + w / 2} cy={ny + 6} r={4} fill="#3a3440" />
          </g>
        );
      })}
    </g>
  );
}

function Hall() {
  const doors = [-520, -20, 480, 1880, 2280];
  const { x, top, width } = COURT_DOOR;
  return (
    <svg className="cine-bg-svg bbi-hall" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="bbi-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0d12" />
          <stop offset="0.7" stopColor="#262a33" />
          <stop offset="1" stopColor="#30343c" />
        </linearGradient>
        <radialGradient id="bbi-lamp" cx="0.62" cy="0.5" r="0.55">
          <stop offset="0" stopColor="#e8c88a" stopOpacity={0.22} />
          <stop offset="1" stopColor="#e8c88a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-800} y={-450} width={3200} height={1800} fill="url(#bbi-stone)" />
      {Array.from({ length: 18 }, (_, r) => (
        <path key={r} d={`M-800 ${-420 + r * 70} H2400`} stroke="#12151b" strokeWidth={4} />
      ))}
      <rect x={-800} y={-450} width={3200} height={1800} fill="url(#bbi-lamp)" />
      {/* The side doors, each posted with served notices. */}
      {doors.map((dx, i) => (
        <g key={i}>
          <rect x={dx - 130} y={240} width={260} height={FLOOR - 240} fill="#2a2018" stroke="#0a0a0e" strokeWidth={10} />
          <path d={`M${dx - 130} 330 H${dx + 130} M${dx - 130} 690 H${dx + 130}`} stroke="#3a3440" strokeWidth={12} />
          <Notices x={dx - 10} y={300} seed={11 + i * 7} />
        </g>
      ))}
      {/* The court door: tall, strapped, shut, lamplight under it. */}
      <rect x={x - width / 2 - 40} y={top - 60} width={width + 80} height={FLOOR - top + 60} fill="#1c1c24" stroke="#0a0a0e" strokeWidth={12} />
      <path d={`M${x - width / 2 - 40} ${top - 60} Q${x} ${top - 190} ${x + width / 2 + 40} ${top - 60}`} fill="#1c1c24" stroke="#0a0a0e" strokeWidth={12} />
      <rect x={x - width / 2} y={top} width={width} height={FLOOR - top - 14} fill="#3a2a1e" stroke="#0a0a0e" strokeWidth={8} />
      <path d={`M${x} ${top} V${FLOOR - 14}`} stroke="#1e160f" strokeWidth={6} />
      {[top + 90, (top + FLOOR) / 2, FLOOR - 110].map((y, i) => (
        <path key={i} d={`M${x - width / 2} ${y} H${x + width / 2}`} stroke="#4a4652" strokeWidth={18} />
      ))}
      <path d={`M${x - width / 2} ${FLOOR - 14} H${x + width / 2}`} stroke="#ffd98a" strokeWidth={10} opacity={0.85} />
      {/* The floor and its runner. */}
      <path d={`M-800 ${FLOOR} H2400 V1350 H-800 Z`} fill="#22252c" />
      <path d={`M${x - 160} ${FLOOR} H${x + 160} L${x + 700} 1350 H${x - 700} Z`} fill="#4a1e22" opacity={0.8} />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M-800 ${FLOOR + i * i * 10} H2400`} stroke="#15171c" strokeWidth={4} />
      ))}
      <path d={`M${x - width / 2} ${FLOOR} L${x - width / 2 - 200} 1000 H${x + width / 2 + 200} L${x + width / 2} ${FLOOR} Z`} fill="#ffd98a" opacity={0.08} />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "bli-hall": () => <Hall />,
};
