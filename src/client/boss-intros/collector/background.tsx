import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";

/**
 * The Collector's Hoard: a foundry shaft full of what it has taken.
 *
 * Not a shelved vault (that is the Broker's counting house): a tall iron shaft
 * under the foundry floor, girders crossing it high up, and from every girder
 * chains hanging down into the dark, each ending in a lock. Far below, a
 * furnace glow comes up through a floor grate, so the hoard is lit from
 * underneath and the dark gathers overhead.
 *
 * Drawn on the 3200×1800 box of the other backgrounds, world units. The grate
 * floor is at y 780; the girders sit between y −300 and 120. Static: nothing
 * here moves while a shot plays (the swaying hoard is an effect), and nothing
 * is filtered.
 */

const FLOOR = 780;
const IRON = "#1b1618";
const IRON_EDGE = "#3a2d2a";
const EMBER = "#ff7a2e";

function Girder({ y, tilt }: { y: number; tilt: number }) {
  return (
    <g transform={`rotate(${tilt} 800 ${y})`}>
      <rect x={-800} y={y - 26} width={3200} height={52} fill={IRON} />
      <rect x={-800} y={y - 26} width={3200} height={8} fill={IRON_EDGE} />
      <rect x={-800} y={y + 18} width={3200} height={8} fill={IRON_EDGE} opacity={0.6} />
      {Array.from({ length: 40 }, (_, i) => (
        <g key={i}>
          <path d={`M${-800 + i * 82} ${y - 18} L${-759 + i * 82} ${y + 18} M${-759 + i * 82} ${y - 18} L${-718 + i * 82} ${y + 18}`} stroke={IRON_EDGE} strokeWidth={5} opacity={0.5} />
          <circle cx={-800 + i * 82} cy={y - 22} r={3} fill="#5a463c" />
        </g>
      ))}
    </g>
  );
}

function Hoard() {
  const rand = seeded(77);
  // Far chains: thin, dark, many, each with a small lock at its end.
  const far = Array.from({ length: 46 }, () => ({
    x: -760 + rand() * 3120,
    top: -460,
    len: 380 + rand() * 520,
    w: 3 + rand() * 3,
  }));
  return (
    <svg
      className="cine-bg-svg col-hoard"
      viewBox="-800 -450 3200 1800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="col-shaft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#040304" />
          <stop offset="0.55" stopColor="#140d0d" />
          <stop offset="1" stopColor="#3a1a10" />
        </linearGradient>
        <radialGradient id="col-furnace" cx="0.5" cy="1" r="0.75">
          <stop offset="0" stopColor={EMBER} stopOpacity={0.55} />
          <stop offset="0.4" stopColor="#b3401a" stopOpacity={0.22} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="col-grate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1c18" />
          <stop offset="1" stopColor="#0c0808" />
        </linearGradient>
      </defs>
      <rect x={-800} y={-450} width={3200} height={1800} fill="url(#col-shaft)" />

      {/* The shaft's ribs: tall iron arches receding into the dark. */}
      {[-520, -120, 280, 720, 1160, 1560, 1960].map((x, i) => (
        <path
          key={i}
          d={`M${x} ${FLOOR} V-200 Q${x + 200} -380 ${x + 400} -200 V${FLOOR}`}
          fill="none"
          stroke="#140e0e"
          strokeWidth={38}
          opacity={0.9}
        />
      ))}

      {/* Girders high across the shaft, and the far chains hanging from them. */}
      <Girder y={-300} tilt={-1.5} />
      {far.map((c, i) => (
        <g key={i} opacity={0.55}>
          <path d={`M${c.x} ${c.top} V${c.top + c.len}`} stroke="#241a18" strokeWidth={c.w} strokeDasharray="10 5" />
          <rect x={c.x - 9} y={c.top + c.len} width={18} height={16} rx={3} fill="#2d2220" />
          <path d={`M${c.x - 6} ${c.top + c.len} a6 7 0 0 1 12 0`} stroke="#2d2220" strokeWidth={3} fill="none" />
        </g>
      ))}
      <Girder y={60} tilt={1} />

      {/* The furnace glow coming up from below, and the grate floor it lights. */}
      <rect x={-800} y={-450} width={3200} height={1800} fill="url(#col-furnace)" />
      <path d={`M-800 ${FLOOR} H2400 V1350 H-800 Z`} fill="url(#col-grate)" />
      {Array.from({ length: 34 }, (_, i) => (
        <path key={i} d={`M${-800 + i * 100} ${FLOOR} L${-800 + i * 100 + (i - 16) * 22} 1350`} stroke="#0a0606" strokeWidth={10} />
      ))}
      {[FLOOR + 40, FLOOR + 110, FLOOR + 210, FLOOR + 360].map((y, i) => (
        <path key={i} d={`M-800 ${y} H2400`} stroke={EMBER} strokeWidth={3 - i * 0.5} opacity={0.35 - i * 0.07} />
      ))}
      <path d={`M-800 ${FLOOR} H2400`} stroke="#5a3a2a" strokeWidth={4} />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "col-hoard": () => <Hoard />,
};
