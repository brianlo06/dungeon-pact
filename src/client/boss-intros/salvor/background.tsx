import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";

/**
 * The Wreck Pool: a flooded cistern under the city, where whatever the water
 * took comes to rest.
 *
 * A row of brick vaults on squat pillars, their feet drowned; dark still water
 * across the whole floor from y 780, the pillars' reflections broken in it;
 * wreckage standing up out of the water — a mast, a cart wheel, a hull rib,
 * a crate — and a stone ledge along the left the party stands on.
 *
 * Drawn on the 3200×1800 box, world units. Static and unfiltered; the lamp
 * moving under the water is an effect.
 */
const WATER = 780;

function Pool() {
  const rand = seeded(61);
  const pillars = [-560, -80, 400, 880, 1360, 1840, 2320];
  return (
    <svg className="cine-bg-svg sbi-pool" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sbi-vault" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#081414" />
          <stop offset="1" stopColor="#1c3638" />
        </linearGradient>
        <linearGradient id="sbi-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e4a48" />
          <stop offset="0.3" stopColor="#10292a" />
          <stop offset="1" stopColor="#030808" />
        </linearGradient>
        <radialGradient id="sbi-shaft" cx="0.55" cy="0" r="0.8">
          <stop offset="0" stopColor="#7fc7c0" stopOpacity={0.32} />
          <stop offset="1" stopColor="#7fc7c0" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-800} y={-450} width={3200} height={1800} fill="url(#sbi-vault)" />
      {/* Vaults: arches springing from pillar to pillar. */}
      {pillars.slice(0, -1).map((x, i) => (
        <path key={i} d={`M${x + 60} ${WATER} V120 Q${x + 240} -160 ${x + 420} 120 V${WATER}`} fill="#132526" stroke="#050b0b" strokeWidth={10} />
      ))}
      {pillars.map((x, i) => (
        <g key={i}>
          <rect x={x - 60} y={-450} width={120} height={WATER + 450} fill="#2a403f" stroke="#050b0b" strokeWidth={8} />
          {Array.from({ length: 16 }, (_, k) => (
            <path key={k} d={`M${x - 60} ${-420 + k * 76} H${x + 60}`} stroke="#162626" strokeWidth={4} />
          ))}
          <path d={`M${x - 60} ${WATER - 160} H${x + 60} V${WATER} H${x - 60} Z`} fill="#2a3b30" opacity={0.6} />
        </g>
      ))}
      <rect x={-800} y={-450} width={3200} height={1800} fill="url(#sbi-shaft)" />
      {/* The water, the pillars' broken reflections, and the scum line. */}
      <path d={`M-800 ${WATER} H2400 V1350 H-800 Z`} fill="url(#sbi-water)" />
      {pillars.map((x, i) =>
        Array.from({ length: 6 }, (_, k) => (
          <rect key={`${i}-${k}`} x={x - 50 + (rand() - 0.5) * 30} y={WATER + 14 + k * 34} width={100 - k * 10} height={10} fill="#3a6462" opacity={0.6 - k * 0.09} />
        )),
      )}
      <path d={`M-800 ${WATER} H2400`} stroke="#6aa8a0" strokeWidth={3} opacity={0.35} />
      {/* Wreckage standing out of the water. */}
      <g fill="#2e3834" stroke="#050b0b" strokeWidth={8}>
        <path d={`M1560 ${WATER + 10} L1620 -60 L1640 -60 L1590 ${WATER + 10} Z`} />
        <path d="M1480 150 L1760 110" strokeWidth={16} stroke="#171a18" />
        <circle cx={260} cy={WATER - 20} r={120} fill="none" stroke="#3a4640" strokeWidth={22} />
        <path d={`M260 ${WATER - 140} V${WATER + 100} M140 ${WATER - 20} H380`} stroke="#3a4640" strokeWidth={12} />
        <path d={`M1900 ${WATER + 10} Q1960 520 2120 470`} fill="none" stroke="#3a4640" strokeWidth={28} />
        <path d={`M1980 ${WATER + 10} Q2040 580 2180 560`} fill="none" stroke="#3a4640" strokeWidth={22} />
        <rect x={1060} y={WATER - 70} width={150} height={110} transform={`rotate(-12 1135 ${WATER})`} fill="#4a3c28" />
      </g>
      {/* A rowboat gone down by the stern, and a shield rim beside it. */}
      <path d={`M620 ${WATER + 10} L700 ${WATER - 150} Q820 ${WATER - 190} 900 ${WATER - 60} L880 ${WATER + 10} Z`} fill="#4a3a2a" stroke="#050b0b" strokeWidth={8} />
      <path d={`M690 ${WATER - 120} Q800 ${WATER - 150} 880 ${WATER - 50}`} stroke="#6a5438" strokeWidth={6} fill="none" />
      <ellipse cx={2240} cy={WATER - 6} rx={70} ry={20} fill="none" stroke="#8a7a4a" strokeWidth={10} />
      {/* The ledge on the left. */}
      <path d={`M-800 ${WATER - 30} H520 L560 ${WATER + 40} H-800 Z`} fill="#243030" stroke="#050b0b" strokeWidth={8} />
      <path d={`M-800 ${WATER - 30} H520`} stroke="#4a6a66" strokeWidth={5} />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "svi-pool": () => <Pool />,
};
