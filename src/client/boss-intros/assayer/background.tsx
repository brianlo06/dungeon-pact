import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";

/**
 * The Assay Furnace: a low brick hall built around one great furnace mouth.
 *
 * Not the Collector's shaft (no chains, no grate, no height): a wide, hot room
 * — brick walls blackened in a band where the heat licks them, a hood over the
 * furnace mouth on the right with its door open and white-orange inside, racks
 * of long tongs on the wall, and a brick floor cut with gutters the melt runs
 * along, each one lit.
 *
 * Drawn on the 3200×1800 box, world units. The floor is at y 800; the furnace
 * mouth is centred at x 1500, y 560. Static and unfiltered.
 */
const FLOOR = 800;

function Furnace() {
  const rand = seeded(19);
  return (
    <svg className="cine-bg-svg abi-hall" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="abi-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0706" />
          <stop offset="0.6" stopColor="#2a1510" />
          <stop offset="1" stopColor="#3e1d10" />
        </linearGradient>
        <radialGradient id="abi-heat" cx="0.72" cy="0.55" r="0.6">
          <stop offset="0" stopColor="#ff9a3a" stopOpacity={0.5} />
          <stop offset="0.5" stopColor="#b8401a" stopOpacity={0.18} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="abi-mouth" cx="0.5" cy="0.6" r="0.6">
          <stop offset="0" stopColor="#fff4c8" />
          <stop offset="0.4" stopColor="#ffb040" />
          <stop offset="1" stopColor="#c8400e" />
        </radialGradient>
      </defs>
      <rect x={-800} y={-450} width={3200} height={1800} fill="url(#abi-wall)" />
      {/* Brick courses, offset every other row. */}
      {Array.from({ length: 20 }, (_, r) => (
        <g key={r} stroke="#170c09" strokeWidth={4} opacity={0.7}>
          <path d={`M-800 ${-440 + r * 62} H2400`} />
          {Array.from({ length: 26 }, (_, k) => (
            <path key={k} d={`M${-800 + k * 130 + (r % 2) * 65} ${-440 + r * 62} v62`} />
          ))}
        </g>
      ))}
      {/* Racks of tongs on the wall. */}
      {[-420, 120].map((x0, j) => (
        <g key={j}>
          <path d={`M${x0} 140 H${x0 + 420}`} stroke="#241816" strokeWidth={16} />
          {Array.from({ length: 7 }, (_, i) => {
            const x = x0 + 30 + i * 60;
            const len = 280 + rand() * 120;
            return <path key={i} d={`M${x} 140 L${x - 10} ${140 + len} M${x} 140 L${x + 12} ${140 + len}`} stroke="#3a2a26" strokeWidth={7} strokeLinecap="round" />;
          })}
        </g>
      ))}
      <rect x={-800} y={-450} width={3200} height={1800} fill="url(#abi-heat)" />
      {/* The furnace: a brick mass, its hood, and the open mouth. */}
      <path d="M1080 -450 H1920 L1860 180 H1140 Z" fill="#1c0f0c" stroke="#0a0504" strokeWidth={8} />
      <path d="M1100 180 H1900 V820 H1100 Z" fill="#2e1710" stroke="#0a0504" strokeWidth={8} />
      <path d="M1300 800 V520 Q1500 330 1700 520 V800 Z" fill="url(#abi-mouth)" />
      <path d="M1300 800 V520 Q1500 330 1700 520 V800" fill="none" stroke="#0a0504" strokeWidth={14} />
      {/* The floor, and its lit gutters. */}
      <path d={`M-800 ${FLOOR} H2400 V1350 H-800 Z`} fill="#1a0d09" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M-800 ${FLOOR + 20 + i * i * 7} H2400`} stroke="#0e0706" strokeWidth={4} />
      ))}
      {[FLOOR + 60, FLOOR + 190].map((y, i) => (
        <path key={i} d={`M-800 ${y} H1500`} stroke="#ff8a2e" strokeWidth={8 - i * 2} opacity={0.5 - i * 0.15} />
      ))}
      <path d={`M-800 ${FLOOR} H2400`} stroke="#5a2a1a" strokeWidth={5} />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "asi-furnace": () => <Furnace />,
};
