import type { ComponentType } from "react";

/**
 * The Sealing Room: a tall, narrow chamber of the Archive where everything
 * ever signed is kept.
 *
 * Its walls are pigeonholes from floor to dark, each with a rolled deed in it
 * and every deed closed with a red seal, so the walls are speckled with
 * thousands of small red points going up out of sight. A long clerk's desk
 * runs across the floor with candles standing on it; ash-grey flagstones.
 *
 * Drawn on the 3200×1800 box, world units. The floor is at y 800. Static.
 */
const FLOOR = 800;

function Room() {
  return (
    <svg className="cine-bg-svg nbi-room" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="nbi-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141118" />
          <stop offset="0.7" stopColor="#241f28" />
          <stop offset="1" stopColor="#2c2530" />
        </linearGradient>
        <pattern id="nbi-holes" x={-800} y={-450} width={146} height={104} patternUnits="userSpaceOnUse">
          {[
            [0, 0, true],
            [73, 0, true],
            [0, 52, true],
            [73, 52, false],
          ].map(([x, y, sealed], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <rect x={4} y={4} width={65} height={44} fill="#100d12" />
              <circle cx={36} cy={30} r={13} fill="#cfc2a0" opacity={0.35} />
              {sealed && <circle cx={36 + (i % 2 ? 2 : -2)} cy={30} r={7} fill="#c0473a" />}
            </g>
          ))}
        </pattern>
        <linearGradient id="nbi-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07060a" stopOpacity={0.5} />
          <stop offset="0.8" stopColor="#07060a" stopOpacity={0} />
        </linearGradient>
        <radialGradient id="nbi-candle" cx="0.5" cy="0.8" r="0.6">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity={0.35} />
          <stop offset="1" stopColor="#ffcf7a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-800} y={-450} width={3200} height={1800} fill="url(#nbi-wall)" />
      {/* Pigeonholes: a grid of dark cells, a deed end and its seal in each —
          a pattern, not a thousand elements, dimmed towards the top. */}
      <rect x={-800} y={-450} width={3200} height={1800} fill="url(#nbi-holes)" />
      <rect x={-800} y={-450} width={3200} height={1800} fill="url(#nbi-fade)" />
      <rect x={-800} y={-450} width={3200} height={1800} fill="url(#nbi-candle)" />
      {/* The desk across the room, and its candles. */}
      <path d={`M-800 ${FLOOR - 170} H2400 V${FLOOR - 140} H-800 Z`} fill="#3a2a22" stroke="#0a0708" strokeWidth={8} />
      <path d={`M-800 ${FLOOR - 140} H2400 V${FLOOR} H-800 Z`} fill="#241a16" />
      {[-400, 200, 1000, 1700, 2200].map((x, i) => (
        <g key={i}>
          <rect x={x - 12} y={FLOOR - 270} width={24} height={100} fill="#d8ccb0" stroke="#0a0708" strokeWidth={4} />
          <ellipse cx={x} cy={FLOOR - 288} rx={9} ry={18} fill="#ffcf7a" />
          <path d={`M${x - 12} ${FLOOR - 250} q-6 30 0 40`} stroke="#a8352a" strokeWidth={6} fill="none" />
        </g>
      ))}
      {/* Flagstones. */}
      <path d={`M-800 ${FLOOR} H2400 V1350 H-800 Z`} fill="#2e2a30" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M-800 ${FLOOR + i * i * 9} H2400`} stroke="#1a171c" strokeWidth={4} />
      ))}
      {Array.from({ length: 30 }, (_, i) => (
        <path key={`v${i}`} d={`M${-800 + i * 110} ${FLOOR} L${-800 + i * 110 + (i - 15) * 40} 1350`} stroke="#1a171c" strokeWidth={4} />
      ))}
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "nti-room": () => <Room />,
};
