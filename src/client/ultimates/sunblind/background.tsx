import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Sunblind's space: the white roofs, in the afternoon glare.
 *
 * The flat, whitewashed roofs of a hill town under a hard, low sun. At the
 * left a lone tower the kid has climbed, its roof high over the rest of the
 * town with the sun standing right over it; a drop to the street, deep in
 * shade; and at the right a lower terrace roof with a parapet, clay water
 * jars and a drain spout, where the enemy row stands. A ladder leans across
 * the drop from the terrace to the tower's roof. Beyond the parapet the town
 * steps away, domes and flat roofs, to a bleached sky, white-gold round the
 * sun and grey-blue away from it.
 *
 * Everything is lit hard from the left and throws its shadow to the right.
 * Shade on plaster is a cool blue-violet and a cast shadow a deep cobalt,
 * under a warm light. Nothing here is dark except shadow.
 *
 *   sb-roofs  the roofscape, for the wide, the quiet and the impact
 *   sb-sky    the glare sky over the kid's roof edge, for the close-ups
 *
 * Both are the 3200×1800 box of the other backgrounds (world units: the stage
 * is 0…1600 × 0…900). Nothing here moves, so it rasterises once.
 */

export const PLASTER = {
  lit: "#f6eedb",
  glare: "#fffbea",
  face: "#e6d8b8",
  seam: "#d6c7a4",
  shade: "#8a94c2",
  shadeDeep: "#6a75a8",
  cast: "#3a4478",
  street: "#2e3668",
  ink: "#161a2c",
  clay: "#c98a4e",
  clayShade: "#8a5a3c",
  wood: "#9b7449",
  skyHigh: "#aac6d2",
  skyMid: "#dfe2d4",
  skyLow: "#f4e9c9",
} as const;

/** Where the terrace floor meets the parapet, world y. */
export const FLOOR = 770;
/** The tower's roof, world y, and its span. */
export const KID_ROOF = 430;
const TOWER = [150, 540] as const;
/** Where the sun stands, world units: over the tower. */
export const SUN: [number, number] = [300, 330];
/** The terrace's left edge: the drop to the street is left of it. */
export const EDGE = 640;

/** Mix two hex colours, `k` of the way to the second. */
function mix(a: string, b: string, k: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((c, i) => Math.round(c + (pb[i] - c) * k).toString(16).padStart(2, "0")).join("")}`;
}

function Defs() {
  return (
    <defs>
      <linearGradient id="sb-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={PLASTER.skyHigh} />
        <stop offset="0.5" stopColor={PLASTER.skyMid} />
        <stop offset="0.72" stopColor={PLASTER.skyLow} />
        <stop offset="1" stopColor={PLASTER.skyLow} />
      </linearGradient>
      <radialGradient id="sb-glare" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fffef6" stopOpacity="1" />
        <stop offset="0.18" stopColor="#fff9e0" stopOpacity="0.95" />
        <stop offset="0.45" stopColor="#fbefc4" stopOpacity="0.55" />
        <stop offset="1" stopColor="#fbefc4" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="sb-floor" gradientUnits="userSpaceOnUse" x1="0" y1={FLOOR} x2="0" y2="1350">
        <stop offset="0" stopColor="#ece0c3" />
        <stop offset="0.25" stopColor="#f7efdb" />
        <stop offset="1" stopColor="#e9dcbd" />
      </linearGradient>
      <linearGradient id="sb-wall" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fbf4e3" />
        <stop offset="1" stopColor="#e4d6b6" />
      </linearGradient>
      <linearGradient id="sb-street" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3d4677" />
        <stop offset="1" stopColor="#252c58" />
      </linearGradient>
    </defs>
  );
}

interface HouseProps {
  x: number;
  y: number;
  w: number;
  h: number;
  side: number;
  haze: number;
  win?: [number, number, number, number];
  dome?: boolean;
}

/** A far flat-roofed house: a lit front, a shaded side, a cast shadow to its right, a dark window. */
function House({ x, y, w, h, side, haze, win, dome }: HouseProps) {
  const lit = mix(PLASTER.lit, PLASTER.skyLow, haze);
  const shade = mix(PLASTER.shade, PLASTER.skyMid, haze);
  const cast = mix(PLASTER.shadeDeep, PLASTER.skyMid, haze);
  const dark = mix("#4d5687", PLASTER.skyMid, haze);
  return (
    <g>
      {dome && (
        <>
          <path d={`M${x + w * 0.15} ${y} A${w * 0.35} ${w * 0.35} 0 0 1 ${x + w * 0.85} ${y} Z`} fill={lit} />
          <path d={`M${x + w * 0.5} ${y - w * 0.35} A${w * 0.35} ${w * 0.35} 0 0 1 ${x + w * 0.85} ${y} L${x + w * 0.5} ${y} Z`} fill={shade} />
        </>
      )}
      <rect x={x} y={y} width={w} height={h} fill={lit} />
      <path d={`M${x + w} ${y} l${side} ${-side * 0.3} V${y + h} H${x + w} Z`} fill={shade} />
      <path d={`M${x + w + side} ${y + h * 0.35} l${w * 0.5} ${h * 0.12} V${y + h} H${x + w + side} Z`} fill={cast} opacity="0.5" />
      <rect x={x - 3} y={y - 6} width={w + 6} height={7} fill={mix(PLASTER.glare, PLASTER.skyLow, haze * 0.6)} />
      {win && <rect x={x + win[0]} y={y + win[1]} width={win[2]} height={win[3]} fill={dark} rx={win[2] * 0.45} />}
    </g>
  );
}

const farRand = seeded(4211);
/** The town stepping away behind the terrace: two bands, the nearer larger and less hazed. */
const FAR: HouseProps[] = [0, 1].flatMap((band) => {
  const out: HouseProps[] = [];
  let x = -780 + band * 90;
  const base = band === 0 ? 640 : 700;
  while (x < 2500) {
    const w = (band === 0 ? 80 : 120) + farRand() * (band === 0 ? 120 : 160);
    const h = (band === 0 ? 40 : 60) + farRand() * (band === 0 ? 80 : 110);
    const win: [number, number, number, number] | undefined = farRand() < 0.65 ? [w * (0.2 + farRand() * 0.5), h * 0.3, 12 + band * 7, 20 + band * 12] : undefined;
    const dome = farRand() < 0.14;
    out.push({ x, y: base - h, w, h: h + 80, side: 12 + band * 10, win, haze: band === 0 ? 0.6 : 0.36, dome });
    x += w + 20 + farRand() * 70;
  }
  return out;
});

/** A clay water jar standing on the roof, lit from the left, with its shadow laid long to the right. */
function Jar({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M6 -2 C60 -8 150 -10 230 -6 L232 10 C150 16 60 16 8 12 Z" fill={PLASTER.cast} opacity="0.6" />
      <path d="M-22 0 C-34 -30 -34 -62 -16 -84 L-12 -96 H12 L16 -84 C34 -62 34 -30 22 0 Z" fill={PLASTER.clay} stroke={PLASTER.ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M4 -86 C24 -62 26 -30 16 -2 L22 0 C34 -30 34 -62 16 -84 Z" fill={PLASTER.clayShade} />
      <path d="M-16 -80 C-26 -60 -26 -30 -16 -8" stroke="#f3cf9c" strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="-15" y="-102" width="30" height="8" rx="3" fill={PLASTER.clay} stroke={PLASTER.ink} strokeWidth="3" />
    </g>
  );
}

const seamRand = seeded(90210);
/** Hairline cracks in the terrace's plaster, and a scatter of grit. */
const CRACKS = Array.from({ length: 10 }, () => {
  const x = 700 + seamRand() * 1700;
  const y = FLOOR + 40 + seamRand() * 520;
  let d = `M${x.toFixed(0)} ${y.toFixed(0)}`;
  let cx = x;
  let cy = y;
  for (let i = 0; i < 4; i++) {
    cx += 20 + seamRand() * 50;
    cy += (seamRand() - 0.5) * 16;
    d += ` L${cx.toFixed(0)} ${cy.toFixed(0)}`;
  }
  return d;
});
const GRIT = Array.from({ length: 26 }, () => ({
  x: 680 + seamRand() * 1720,
  y: FLOOR + 30 + seamRand() * 540,
  r: 2 + seamRand() * 5,
}));

function Roofs() {
  const [sx, sy] = SUN;
  const [t0, t1] = TOWER;
  return (
    <svg className="cine-bg-svg sb-bg" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Defs />
      <rect x="-800" y="-450" width="3200" height="1300" fill="url(#sb-sky)" />
      <circle cx={sx} cy={sy} r="1150" fill="url(#sb-glare)" />
      {/* The town stepping away. */}
      {FAR.map((h, i) => (
        <House key={i} {...h} />
      ))}
      <rect x="-800" y="610" width="3200" height="40" fill="#fffbea" opacity="0.35" />

      {/* The tower the kid has climbed, over everything. */}
      <rect x={t0} y={KID_ROOF} width={t1 - t0} height={1350 - KID_ROOF} fill="url(#sb-wall)" />
      <path d={`M${t1} ${KID_ROOF} l44 -12 V1350 H${t1} Z`} fill={PLASTER.shade} />
      <rect x={t0 - 8} y={KID_ROOF - 16} width={t1 - t0 + 16} height="18" fill={PLASTER.glare} />
      <path d={`M${t1 + 8} ${KID_ROOF - 16} l40 -10 v16 l-40 12 Z`} fill={PLASTER.shadeDeep} />
      <rect x={t0} y={KID_ROOF + 2} width={t1 - t0} height="10" fill={PLASTER.shade} opacity="0.6" />
      <g fill="#434c80">
        <rect x={t0 + 70} y={KID_ROOF + 110} width="54" height="92" rx="26" />
        <rect x={t0 + 250} y={KID_ROOF + 110} width="54" height="92" rx="26" />
        <rect x={t0 + 160} y={KID_ROOF + 320} width="54" height="92" rx="26" />
      </g>
      <g fill={PLASTER.shade} opacity="0.7">
        <rect x={t0 + 64} y={KID_ROOF + 202} width="66" height="9" />
        <rect x={t0 + 244} y={KID_ROOF + 202} width="66" height="9" />
      </g>

      {/* The drop to the street, deep in the tower's shadow. */}
      <rect x={t1 + 44} y={KID_ROOF - 30} width={EDGE - t1 - 44} height={1380 - KID_ROOF} fill="url(#sb-street)" />

      {/* The terrace: its parapet, and the floor the row stands on. */}
      <rect x={EDGE} y={FLOOR - 82} width={2400 - EDGE} height="84" fill="url(#sb-wall)" />
      <rect x={EDGE - 6} y={FLOOR - 96} width={2406 - EDGE} height="16" fill={PLASTER.glare} />
      <rect x={EDGE - 6} y={FLOOR - 80} width={2406 - EDGE} height="8" fill={PLASTER.shade} opacity="0.7" />
      <path d={`M1720 ${FLOOR - 44} h64 v16 h-64 Z`} fill={PLASTER.clayShade} />
      <path d={`M1726 ${FLOOR - 28} q10 22 4 28 h28 q-6 -6 4 -28 Z`} fill={PLASTER.seam} opacity="0.8" />
      <rect x={EDGE} y={FLOOR} width={2400 - EDGE} height={1350 - FLOOR} fill="url(#sb-floor)" />
      <rect x={EDGE} y={FLOOR} width={2400 - EDGE} height="14" fill={PLASTER.shade} opacity="0.55" />
      <g stroke={PLASTER.seam} strokeWidth="3" opacity="0.85">
        {Array.from({ length: 12 }, (_, i) => {
          const x = EDGE + 120 + i * 150;
          return <path key={i} d={`M${x} ${FLOOR + 14} L${x + (x - 1200) * 0.55} 1350`} />;
        })}
        {[860, 1010, 1210].map((y) => (
          <path key={y} d={`M${EDGE} ${y} H2400`} />
        ))}
      </g>
      <g stroke="#c4b38b" strokeWidth="2" fill="none" opacity="0.75">
        {CRACKS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g>
        {GRIT.map((g, i) => (
          <g key={i}>
            <ellipse cx={g.x + g.r * 2.4} cy={g.y + 1} rx={g.r * 2.6} ry={g.r * 0.5} fill={PLASTER.cast} opacity="0.35" />
            <circle cx={g.x} cy={g.y} r={g.r} fill={PLASTER.face} />
          </g>
        ))}
      </g>
      {/* The tower's shadow, across the drop and onto the terrace's near corner. */}
      <path d={`M${EDGE} ${FLOOR - 96} L${EDGE + 70} ${FLOOR - 96} L${EDGE + 70} ${FLOOR} L${EDGE + 190} 1350 L${EDGE} 1350 Z`} fill={PLASTER.cast} opacity="0.55" />
      {/* The terrace's left end, over the drop. */}
      <path d={`M${EDGE} ${FLOOR - 96} V1350 H${EDGE - 24} V${FLOOR - 84} Z`} fill={PLASTER.shadeDeep} />
      <rect x={EDGE - 30} y={FLOOR - 102} width="36" height="20" fill={PLASTER.glare} />
      {/* Jars against the parapet at the far end, and one by the drop. */}
      <Jar x={2050} y={FLOOR + 6} s={0.9} />
      <Jar x={2140} y={FLOOR + 16} s={0.72} />
      <Jar x={730} y={FLOOR + 70} s={1.05} />
      {/* The ladder across the drop, from the terrace to the tower's roof. */}
      <g strokeLinecap="round">
        {[0, 46].map((o) => (
          <path key={o} d={`M${EDGE + 70 + o} 1350 L${t1 - 18 + o * 0.5} ${KID_ROOF - 26}`} stroke={PLASTER.wood} strokeWidth="13" />
        ))}
        {[0, 46].map((o) => (
          <path key={`s${o}`} d={`M${EDGE + 70 + o} 1350 L${t1 - 18 + o * 0.5} ${KID_ROOF - 26}`} stroke="#6b4c2c" strokeWidth="4" transform="translate(5 2)" />
        ))}
        {Array.from({ length: 12 }, (_, i) => {
          const k = (i + 0.5) / 12;
          const ax = EDGE + 70 + (t1 - 18 - EDGE - 70) * k;
          const ay = 1350 + (KID_ROOF - 26 - 1350) * k;
          return <path key={i} d={`M${ax.toFixed(0)} ${ay.toFixed(0)} h${(46 - 23 * k).toFixed(0)}`} stroke={PLASTER.wood} strokeWidth="9" />;
        })}
      </g>
    </svg>
  );
}

function Sky() {
  return (
    <svg className="cine-bg-svg sb-bg" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Defs />
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#sb-sky)" />
      <circle cx="600" cy="380" r="1400" fill="url(#sb-glare)" />
      {/* The town far below, faint in the glare, and the kid's own roof edge. */}
      {FAR.slice(0, 20).map((h, i) => (
        <House key={i} {...h} x={h.x * 1.2} y={h.y + 180} w={h.w * 1.3} h={h.h * 1.3} side={h.side * 1.3} haze={0.72} />
      ))}
      <rect x="-800" y="820" width="3200" height="530" fill="url(#sb-wall)" />
      <rect x="-800" y="804" width="3200" height="22" fill={PLASTER.glare} />
      <rect x="-800" y="826" width="3200" height="14" fill={PLASTER.shade} opacity="0.6" />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "sb-roofs": Roofs,
  "sb-sky": Sky,
};
