import type { ComponentType, ReactNode } from "react";
import { seeded } from "../../cinematic/vfx";
import { BEACH, HORIZON, HULL, NEAR, POSTS } from "./flats";
import "./style.css";

/**
 * The flats at the harbour mouth, before dawn.
 *
 * Ribbed wet sand running out from a shingle beach at the left to the sea at
 * the right, under a slate sky with no moon and no sun in it. Mooring posts
 * leaning in a line out across the sand with weed hanging off them; a hull
 * lying on its side where the tide left it, its anchor chain across the
 * sand; a wrack line of weed; lugworm casts; the last pools. On the horizon
 * at the far right, the harbour mole and its light, unlit. Nothing here is
 * the sea: the water is drawn by the effects, so it can leave and come back.
 *
 *   tide-edge    the water's edge at a hand's scale: sand, a footprint,
 *                shells, and the edge of the shingle
 *   tide-flats   the whole flat, shore to horizon (`flats.ts`)
 *
 * The world is 1600×900; each is drawn on the 3200×1800 box around it. Flat
 * fills and stroke opacities only: the camera moves over these drawings in
 * every shot.
 */

const SKY = ["#0b0f18", "#111724", "#171e2c", "#1e2636", "#27314a"];
const SAND = "#7d6b4d";
const RIB = "#5d4d34";
const CREST = "#a08c62";
const SHINE = "#b8a882";
const SHINGLE = "#4a4644";
const WEED = "#1c2418";
const WOOD = "#2a2420";
const WOOD_LIT = "#4a3f36";
const IRON = "#3b2f2a";

function Svg({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      className={`cine-bg-svg tide-bg ${className}`}
      viewBox="-800 -450 3200 1800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/**
 * The ripples the last water left in the sand: rows of short crescents,
 * staggered, broken, crowding towards the horizon. Never a line across the
 * whole width: that reads as planking.
 */
function ribs(x0: number, x1: number, y0: number, y1: number, seed: number, near = 40, far = 7, width = 1) {
  const rand = seeded(seed);
  const dark: string[] = [];
  const light: string[] = [];
  let y = y1;
  let j = 0;
  while (y > y0) {
    const depth = (y1 - y) / (y1 - y0);
    const gap = near + (far - near) * depth;
    const bow = gap * 0.45;
    let x = x0 + rand() * gap * 3;
    while (x < x1) {
      const len = (1.6 + rand() * 3.4) * gap;
      const yy = y + (rand() - 0.5) * gap * 0.5;
      const mid = x + len / 2;
      dark.push(`M${x.toFixed(0)} ${yy.toFixed(1)} Q${mid.toFixed(0)} ${(yy - bow).toFixed(1)} ${(x + len).toFixed(0)} ${yy.toFixed(1)}`);
      if (rand() < 0.7) light.push(`M${(x + len * 0.2).toFixed(0)} ${(yy - bow * 0.35).toFixed(1)} Q${mid.toFixed(0)} ${(yy - bow * 1.1).toFixed(1)} ${(x + len * 0.8).toFixed(0)} ${(yy - bow * 0.35).toFixed(1)}`);
      x += len + gap * (0.6 + rand() * 2.2);
    }
    y -= gap;
    j++;
  }
  return (
    <g fill="none" strokeLinecap="round">
      <path d={light.join(" ")} stroke={CREST} strokeOpacity="0.55" strokeWidth={2 * width} />
      <path d={dark.join(" ")} stroke={RIB} strokeOpacity="0.8" strokeWidth={2.6 * width} />
    </g>
  );
}

/** Shingle: pebbles crowded along the beach, sparser towards the sand. */
function pebbles(seed: number, count: number, x0: number, x1: number, y0: number, y1: number, size: number) {
  const rand = seeded(seed);
  const greys = ["#5a5652", "#6b6560", "#3f3c3a", "#777069", "#524d48"];
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const x = x0 + rand() * (x1 - x0);
        const y = y0 + rand() * (y1 - y0);
        const r = size * (0.5 + rand());
        return <ellipse key={i} cx={x.toFixed(0)} cy={y.toFixed(0)} rx={r.toFixed(1)} ry={(r * 0.62).toFixed(1)} fill={greys[i % greys.length]} transform={`rotate(${((rand() - 0.5) * 50).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})`} />;
      })}
    </g>
  );
}

/** Weed: dark strands hanging or lying, from (x, y). */
function weed(x: number, y: number, count: number, len: number, seed: number, hang = true) {
  const rand = seeded(seed);
  return Array.from({ length: count }, () => {
    const sx = x + (rand() - 0.5) * 24;
    const L = len * (0.5 + rand());
    const bend = (rand() - 0.5) * L * 0.8;
    return hang
      ? `M${sx.toFixed(0)} ${y} q${bend.toFixed(0)} ${(L * 0.5).toFixed(0)} ${(bend * 0.5).toFixed(0)} ${L.toFixed(0)}`
      : `M${sx.toFixed(0)} ${y} q${(L * 0.5).toFixed(0)} ${bend.toFixed(0)} ${L.toFixed(0)} ${(bend * 0.3).toFixed(0)}`;
  }).join(" ");
}

/** A lugworm cast: a little coil of sand. */
function cast(x: number, y: number, s: number) {
  return `M${x - 6 * s} ${y} c0 ${-4 * s} ${6 * s} ${-4 * s} ${6 * s} 0 c0 ${3 * s} ${-4 * s} ${3 * s} ${-4 * s} 0 c0 ${-2 * s} ${3 * s} ${-2 * s} ${3 * s} 0`;
}

/* ── the whole flat ──────────────────────────────────────────────────── */

function Flats() {
  const rand = seeded(311);
  const casts = Array.from({ length: 26 }, () => {
    const y = 560 + rand() * 700;
    const x = 380 + rand() * 1900;
    const s = 0.5 + ((y - 560) / 700) * 1.6;
    return cast(x, y, s);
  }).join(" ");
  const wrack = Array.from({ length: 70 }, () => {
    const x = 360 + rand() * 2040;
    const y = 880 + (rand() - 0.5) * 40 + (x - 360) * -0.06;
    return `M${x.toFixed(0)} ${y.toFixed(0)} q${(6 + rand() * 20).toFixed(0)} ${((rand() - 0.5) * 10).toFixed(0)} ${(14 + rand() * 30).toFixed(0)} ${((rand() - 0.5) * 6).toFixed(0)}`;
  }).join(" ");
  const clouds = Array.from({ length: 7 }, (_, i) => ({
    x: -700 + rand() * 2900,
    y: -380 + i * 95 + rand() * 40,
    w: 260 + rand() * 700,
    h: 5 + rand() * 9,
  }));
  return (
    <Svg>
      {/* the sky, in flat bands paling towards the horizon */}
      <rect x="-800" y="-450" width="3200" height={HORIZON + 450} fill={SKY[0]} />
      <rect x="-800" y="60" width="3200" height={HORIZON - 60} fill={SKY[1]} />
      <rect x="-800" y="250" width="3200" height={HORIZON - 250} fill={SKY[2]} />
      <rect x="-800" y={HORIZON - 90} width="3200" height="90" fill={SKY[3]} />
      <rect x="-800" y={HORIZON - 26} width="3200" height="26" fill={SKY[4]} />
      {clouds.map((c, i) => (
        <ellipse key={i} cx={c.x.toFixed(0)} cy={c.y.toFixed(0)} rx={c.w.toFixed(0)} ry={c.h.toFixed(0)} fill="#070a11" fillOpacity="0.7" />
      ))}
      {/* the harbour mole on the horizon, and its light, unlit */}
      <path d={`M1900 ${HORIZON} h500 v-14 h-330 l-30 -10 h-140 Z`} fill="#0a0d14" />
      <path d={`M2210 ${HORIZON - 24} v-70 l6 -4 v-16 h14 v16 l6 4 v70 Z`} fill="#0a0d14" />
      <rect x="2213" y={HORIZON - 96} width="20" height="8" fill="#1b2130" />

      {/* the seabed: wet sand ribbed by the water that left it */}
      <rect x="-800" y={HORIZON} width="3200" height={NEAR - HORIZON} fill={SAND} />
      <rect x="-800" y={HORIZON} width="3200" height="40" fill="#6b5a3e" fillOpacity="0.5" />
      {ribs(-800, 2400, HORIZON + 6, NEAR, 71)}
      {/* the last pools, lying flat and shining */}
      {[
        [1180, 1080, 190, 0.34],
        [1700, 960, 150, 0.3],
        [2120, 820, 120, 0.26],
        [760, 1180, 110, 0.3],
        [1420, 640, 90, 0.22],
      ].map(([x, y, r, a], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.16} fill={SHINE} fillOpacity={a} />
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.16} fill="none" stroke={RIB} strokeOpacity="0.5" strokeWidth="3" />
        </g>
      ))}
      <path d={casts} fill="none" stroke={CREST} strokeWidth="3" strokeLinecap="round" strokeOpacity="0.8" />
      {/* the wrack line: what the last high water left along the sand */}
      <path d={wrack} fill="none" stroke={WEED} strokeWidth="5" strokeLinecap="round" />

      {/* the anchor and its chain, lying where the hull dragged it */}
      <path d={`M${HULL.x - 20} ${HULL.y + 60} C${HULL.x - 120} ${HULL.y + 90} ${HULL.x - 200} ${HULL.y + 40} 1330 790`} fill="none" stroke={IRON} strokeWidth="7" strokeDasharray="10 8" strokeLinecap="round" />
      <g transform="translate(1310 786) rotate(-20)">
        <path d="M0 -40 V30 M-34 8 Q0 44 34 8 M-34 8 l-8 -12 M34 8 l8 -12 M-14 -30 h28" fill="none" stroke={IRON} strokeWidth="8" strokeLinecap="round" />
      </g>

      {/* the hull on its side: planks, a keel, a hole with the ribs showing */}
      <g transform={`translate(${HULL.x} ${HULL.y})`}>
        <path d={`M-${HULL.w / 2} 40 C-${HULL.w / 2 + 30} -20 -${HULL.w / 2 - 60} -${HULL.h} 0 -${HULL.h} C${HULL.w / 2 - 40} -${HULL.h} ${HULL.w / 2 + 20} -30 ${HULL.w / 2} 30 L${HULL.w / 2 - 20} 60 H-${HULL.w / 2 - 20} Z`} fill={WOOD} />
        {[-100, -70, -42, -16].map((y, i) => (
          <path key={y} d={`M-${HULL.w / 2 - 10 - i * 14} ${y + 60} C-${HULL.w / 2 - 60} ${y + 20} ${HULL.w / 2 - 80} ${y + 10} ${HULL.w / 2 - 20 - i * 6} ${y + 70}`} fill="none" stroke={WOOD_LIT} strokeOpacity="0.6" strokeWidth="6" />
        ))}
        <path d={`M-${HULL.w / 2 - 20} 60 H${HULL.w / 2 - 20}`} stroke="#5a4c40" strokeWidth="10" />
        {/* the hole, and the ribs inside it */}
        <path d="M-40 -110 C-10 -125 40 -118 60 -95 C70 -70 40 -50 0 -52 C-30 -54 -55 -80 -40 -110 Z" fill="#0d0b0a" />
        <path d="M-20 -108 v50 M8 -114 v56 M36 -108 v46" stroke={WOOD_LIT} strokeWidth="5" />
        {/* the broken mast, and its stump */}
        <path d={`M-30 -${HULL.h - 6} l-60 -26`} stroke={WOOD} strokeWidth="14" strokeLinecap="round" />
        <path d="M-320 -20 L-100 60" stroke={WOOD} strokeWidth="12" strokeLinecap="round" />
        <path d={weed(-150, 0, 6, 60, 12)} fill="none" stroke={WEED} strokeWidth="5" strokeLinecap="round" />
        <path d={weed(120, 30, 8, 50, 13)} fill="none" stroke={WEED} strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* the mooring posts, leaning out along the flats, weed hanging off them */}
      {POSTS.map((p, i) => {
        const w = p.h * 0.18;
        return (
          <g key={i} transform={`rotate(${p.lean} ${p.x} ${p.y})`}>
            <rect x={p.x - w / 2} y={p.y - p.h} width={w} height={p.h} fill={WOOD} />
            <rect x={p.x - w / 2} y={p.y - p.h} width={w * 0.35} height={p.h} fill={WOOD_LIT} fillOpacity="0.5" />
            <rect x={p.x - w / 2 - 3} y={p.y - p.h * 0.82} width={w + 6} height={w * 0.5} fill={IRON} />
            <path d={weed(p.x, p.y - p.h * 0.55, 5 + i, p.h * 0.5, 40 + i)} fill="none" stroke={WEED} strokeWidth={Math.max(2, w * 0.2)} strokeLinecap="round" />
          </g>
        );
      })}

      {/* the shingle beach at the left, with the wrack along its edge */}
      <path d={`M-800 ${HORIZON} H${BEACH - 400} C${BEACH - 200} 700 ${BEACH + 20} 1000 ${BEACH + 160} ${NEAR} H-800 Z`} fill={SHINGLE} />
      {pebbles(19, 260, -800, BEACH + 120, HORIZON + 40, NEAR, 9)}
      {pebbles(23, 120, -100, BEACH + 200, 760, NEAR, 6)}
      <path d={weed(BEACH + 40, 900, 14, 40, 51, false)} fill="none" stroke={WEED} strokeWidth="6" strokeLinecap="round" />
      <path d={weed(BEACH + 110, 1120, 12, 44, 52, false)} fill="none" stroke={WEED} strokeWidth="6" strokeLinecap="round" />
    </Svg>
  );
}

/* ── the water's edge, at a hand's scale ─────────────────────────────── */

function Edge() {
  const rand = seeded(97);
  const holes = Array.from({ length: 40 }, () => [400 + rand() * 1900, 300 + rand() * 900, 2 + rand() * 4]);
  return (
    <Svg className="tide-bg-edge">
      <rect x="-800" y="-450" width="3200" height="1800" fill={SAND} />
      {/* the sand's ripples, big at this scale */}
      {ribs(-800, 2400, -450, NEAR, 73, 120, 70, 3)}
      {/* lugworm holes, and a few casts */}
      <g fill="#5a4a33">
        {holes.map(([x, y, r], i) => (
          <circle key={i} cx={x.toFixed(0)} cy={y.toFixed(0)} r={r.toFixed(1)} />
        ))}
      </g>
      <path d={[cast(700, 820, 4), cast(1500, 1000, 5), cast(1900, 560, 3.5)].join(" ")} fill="none" stroke={CREST} strokeWidth="8" strokeLinecap="round" strokeOpacity="0.8" />
      {/* the Tidecaller's own footprint, filling from below */}
      <ellipse cx="560" cy="960" rx="120" ry="52" fill="#6b5a3e" transform="rotate(-12 560 960)" />
      <ellipse cx="560" cy="960" rx="100" ry="38" fill={SHINE} fillOpacity="0.35" transform="rotate(-12 560 960)" />
      {/* shells, a starfish, a strand of weed */}
      {[
        [1240, 760, 34, 0],
        [1720, 1080, 26, 40],
        [980, 1180, 30, -20],
      ].map(([x, y, r, a], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
          <path d={`M-${r} 0 A${r} ${r} 0 0 1 ${r} 0 Z`} fill="#d8c8ae" stroke="#7a6a52" strokeWidth="3" />
          <path d={`M0 0 L-${r * 0.7} -${r * 0.7} M0 0 L0 -${r} M0 0 L${r * 0.7} -${r * 0.7} M0 0 L-${r * 0.95} -${r * 0.3} M0 0 L${r * 0.95} -${r * 0.3}`} stroke="#7a6a52" strokeWidth="2.5" />
        </g>
      ))}
      <g transform="translate(1560 560) rotate(18)">
        <path d="M0 -50 L14 -14 L52 -12 L22 12 L32 50 L0 28 L-32 50 L-22 12 L-52 -12 L-14 -14 Z" fill="#6a4a3a" stroke="#4a3228" strokeWidth="3" strokeLinejoin="round" />
      </g>
      <path d={weed(1100, 1000, 9, 120, 61, false)} fill="none" stroke={WEED} strokeWidth="9" strokeLinecap="round" />
      {/* the corner of the shingle */}
      <path d={`M-800 700 C-400 800 -100 1000 60 ${NEAR} H-800 Z`} fill={SHINGLE} />
      {pebbles(29, 90, -800, 60, 700, NEAR, 22)}
    </Svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "tide-flats": Flats,
  "tide-edge": Edge,
};
