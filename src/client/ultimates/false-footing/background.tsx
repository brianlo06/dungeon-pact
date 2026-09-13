import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * False Footing's space: the snowfield in the blue hour.
 *
 * Fresh snow, just after it stopped falling, under a slate sky with no sun
 * and no moon: a long white field, low drifts, a far line of bare hills, and
 * the dry heads of last year's grass standing up through the crust. Nothing
 * in it but ground. It is drawn from the tracker's two heights:
 *
 *   ff-field  at eye level with the snow — the horizon high, the field
 *             running away from the lens;
 *   ff-high   from above — almost all ground, the far edge of the field and
 *             the hills a thin band at the top of the frame.
 *
 * Both are the 3200×1800 box of the other backgrounds (world units: the stage
 * is 0…1600 × 0…900). Nothing here moves: the snow that falls, the prints and
 * the snares are the film's effects, so the background rasterises once.
 */

/** Where the snow meets the hills, world y, in each view. */
export const HORIZON = 372;
export const HIGH_HORIZON = 64;

export const SNOW = {
  far: "#7d90bd",
  mid: "#b4c3e1",
  lit: "#e3ebf7",
  shadow: "#6f86b8",
  deep: "#4b5f91",
  ink: "#0e1426",
} as const;

/** A soft drift: a lit crest over a shadowed lee, as one closed shape. */
function drift(x: number, y: number, w: number, h: number) {
  return `M${x - w / 2} ${y} C${x - w * 0.25} ${y - h} ${x + w * 0.2} ${y - h * 1.1} ${x + w / 2} ${y} C${x + w * 0.15} ${y + h * 0.35} ${x - w * 0.2} ${y + h * 0.3} ${x - w / 2} ${y} Z`;
}

/** Dry grass through the snow: a tuft of bent stalks, some with a seed head. */
function Tuft({ x, y, s, seed, flat = false }: { x: number; y: number; s: number; seed: number; flat?: boolean }) {
  const rand = seeded(seed);
  const stalks = Array.from({ length: 7 }, () => {
    const a = flat ? rand() * Math.PI * 2 : -Math.PI / 2 + (rand() - 0.5) * 0.9;
    const len = (flat ? 26 + rand() * 30 : 50 + rand() * 70) * s;
    const bend = (rand() - 0.5) * 30 * s;
    const ex = Math.cos(a) * len;
    const ey = Math.sin(a) * len * (flat ? 0.7 : 1);
    return { d: `M0 0 Q${ex * 0.5 + bend} ${ey * 0.55} ${ex} ${ey}`, ex, ey, head: rand() < 0.45 };
  });
  return (
    <g transform={`translate(${x} ${y})`} className="ff-tuft">
      {flat && <ellipse rx={30 * s} ry={12 * s} fill={SNOW.shadow} opacity="0.45" />}
      {stalks.map((st, i) => (
        <g key={i}>
          <path d={st.d} stroke="#2a2733" strokeWidth={2.6 * s} fill="none" strokeLinecap="round" />
          {st.head && <ellipse cx={st.ex} cy={st.ey} rx={3.2 * s} ry={7 * s} fill="#5b4c3d" transform={`rotate(${(Math.atan2(st.ey, st.ex) * 180) / Math.PI + 90} ${st.ex} ${st.ey})`} />}
        </g>
      ))}
      {!flat && <ellipse cx="0" cy="2" rx={22 * s} ry={5 * s} fill={SNOW.lit} opacity="0.9" />}
    </g>
  );
}

const fieldRand = seeded(7331);

/** Eye level: drifts receding to the horizon, thinner as they go. */
const FIELD_DRIFTS = Array.from({ length: 26 }, () => {
  const d = Math.pow(fieldRand(), 1.7);
  const y = HORIZON + 8 + d * 980;
  const k = 0.15 + d * 1.6;
  return { x: -800 + fieldRand() * 3200, y, w: (380 + fieldRand() * 700) * k, h: (8 + fieldRand() * 10) * k };
});
const FIELD_RIPPLES = Array.from({ length: 110 }, () => {
  const d = Math.pow(fieldRand(), 1.5);
  const y = HORIZON + 6 + d * 1000;
  const k = 0.15 + d * 1.5;
  return { x: -800 + fieldRand() * 3200, y, w: (24 + fieldRand() * 60) * k, lit: fieldRand() < 0.5 };
});
const FIELD_TUFTS = [
  { x: -260, y: 980, s: 2.2 },
  { x: 120, y: 1120, s: 2.8 },
  { x: 1840, y: 1060, s: 2.5 },
  { x: 2150, y: 900, s: 1.9 },
  { x: 420, y: 640, s: 0.9 },
  { x: 1450, y: 560, s: 0.6 },
  { x: -520, y: 520, s: 0.55 },
  { x: 2300, y: 470, s: 0.4 },
  { x: 980, y: 430, s: 0.3 },
];
const SPARKS = Array.from({ length: 70 }, () => {
  const d = fieldRand();
  return { x: -800 + fieldRand() * 3200, y: HORIZON + 20 + d * 960, r: 0.8 + d * 2.2, o: 0.35 + fieldRand() * 0.5 };
});
const HILLS = (base: number, seed: number, amp: number, n: number) => {
  const rand = seeded(seed);
  let d = `M-800 ${base}`;
  for (let i = 0; i <= n; i++) {
    const x = -800 + (i / n) * 3200;
    d += ` Q${x - 1600 / n} ${base - amp * (0.4 + rand())} ${x} ${base - amp * rand() * 0.5}`;
  }
  return `${d} L2400 ${base + 40} L-800 ${base + 40} Z`;
};

function Sky({ horizon }: { horizon: number }) {
  return (
    <>
      <rect x="-800" y="-450" width="3200" height={horizon + 450} fill="url(#ff-sky)" />
      <ellipse cx="800" cy={horizon} rx="1900" ry="120" fill="url(#ff-glow)" />
      <path d={HILLS(horizon + 2, 41, 90, 7)} fill="#3b4872" />
      <path d={HILLS(horizon + 6, 77, 46, 11)} fill="#2c375d" />
    </>
  );
}

function Defs() {
  return (
    <defs>
      <linearGradient id="ff-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0b1024" />
        <stop offset="0.55" stopColor="#1f2a4b" />
        <stop offset="1" stopColor="#4d5d88" />
      </linearGradient>
      <radialGradient id="ff-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#8b9ac2" stopOpacity="0.45" />
        <stop offset="1" stopColor="#8b9ac2" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="ff-snow" gradientUnits="userSpaceOnUse" x1="0" y1={HORIZON} x2="0" y2="1350">
        <stop offset="0" stopColor={SNOW.far} />
        <stop offset="0.35" stopColor={SNOW.mid} />
        <stop offset="0.75" stopColor="#a9b9da" />
        <stop offset="1" stopColor="#7f93bf" />
      </linearGradient>
      <linearGradient id="ff-ground" gradientUnits="userSpaceOnUse" x1="0" y1={HIGH_HORIZON} x2="0" y2="1350">
        <stop offset="0" stopColor={SNOW.far} />
        <stop offset="0.25" stopColor="#a5b5d8" />
        <stop offset="0.7" stopColor={SNOW.mid} />
        <stop offset="1" stopColor="#98abd1" />
      </linearGradient>
    </defs>
  );
}

function Field() {
  return (
    <svg className="cine-bg-svg ff-bg" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Defs />
      <Sky horizon={HORIZON} />
      <rect x="-800" y={HORIZON} width="3200" height={1350 - HORIZON} fill="url(#ff-snow)" />
      <path d={`M-800 ${HORIZON} H2400`} stroke="#c9d5ec" strokeWidth="2" opacity="0.5" />
      {FIELD_DRIFTS.map((f, i) => (
        <g key={i}>
          <path d={drift(f.x, f.y + f.h * 0.4, f.w, f.h)} fill={SNOW.shadow} opacity="0.32" />
          <path d={drift(f.x, f.y, f.w, f.h)} fill={SNOW.lit} opacity="0.55" />
        </g>
      ))}
      {FIELD_RIPPLES.map((r, i) => (
        <path
          key={i}
          d={`M${r.x} ${r.y} q${r.w / 2} ${-r.w * 0.06} ${r.w} 0`}
          stroke={r.lit ? SNOW.lit : SNOW.shadow}
          strokeWidth={1 + (r.y - HORIZON) / 260}
          fill="none"
          strokeLinecap="round"
          opacity={r.lit ? 0.7 : 0.45}
        />
      ))}
      {SPARKS.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#f4f8ff" opacity={p.o} />
      ))}
      {FIELD_TUFTS.map((t, i) => (
        <Tuft key={i} x={t.x} y={t.y} s={t.s} seed={90 + i} />
      ))}
    </svg>
  );
}

const highRand = seeded(5519);
/** From above, the drifts are long diagonal swells with a shadowed lee. */
const HIGH_SWELLS = Array.from({ length: 16 }, (_, i) => {
  const y = HIGH_HORIZON + 40 + i * 82 + highRand() * 40;
  const k = 0.5 + (y - HIGH_HORIZON) / 900;
  return { x: -900 + highRand() * 3000, y, w: (900 + highRand() * 900) * k, h: (26 + highRand() * 22) * k, tilt: -8 + highRand() * 6 };
});
const HIGH_RIPPLES = Array.from({ length: 90 }, () => {
  const y = HIGH_HORIZON + 20 + highRand() * 1250;
  const k = 0.4 + (y - HIGH_HORIZON) / 1000;
  return { x: -800 + highRand() * 3200, y, w: (30 + highRand() * 50) * k, lit: highRand() < 0.5 };
});
const HIGH_TUFTS = Array.from({ length: 14 }, (_, i) => {
  const y = HIGH_HORIZON + 80 + highRand() * 1150;
  const x = -760 + highRand() * 3120;
  return { x, y, s: 0.6 + (y - HIGH_HORIZON) / 900, seed: 300 + i };
});
const STONES = Array.from({ length: 6 }, () => {
  const y = HIGH_HORIZON + 120 + highRand() * 1100;
  return { x: -700 + highRand() * 3000, y, r: (14 + highRand() * 22) * (0.5 + (y - HIGH_HORIZON) / 900) };
});

function High() {
  return (
    <svg className="cine-bg-svg ff-bg" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Defs />
      <Sky horizon={HIGH_HORIZON} />
      <rect x="-800" y={HIGH_HORIZON} width="3200" height={1350 - HIGH_HORIZON} fill="url(#ff-ground)" />
      {HIGH_SWELLS.map((f, i) => (
        <g key={i} transform={`rotate(${f.tilt} ${f.x} ${f.y})`}>
          <path d={drift(f.x, f.y + f.h * 0.5, f.w, f.h)} fill={SNOW.shadow} opacity="0.3" />
          <path d={drift(f.x, f.y, f.w, f.h * 0.8)} fill={SNOW.lit} opacity="0.5" />
        </g>
      ))}
      {HIGH_RIPPLES.map((r, i) => (
        <path
          key={i}
          d={`M${r.x} ${r.y} q${r.w / 2} ${-r.w * 0.16} ${r.w} 0`}
          stroke={r.lit ? SNOW.lit : SNOW.shadow}
          strokeWidth={1.2 + (r.y - HIGH_HORIZON) / 500}
          fill="none"
          strokeLinecap="round"
          opacity={r.lit ? 0.65 : 0.4}
        />
      ))}
      {STONES.map((s, i) => (
        <g key={i}>
          <ellipse cx={s.x + s.r * 0.25} cy={s.y + s.r * 0.35} rx={s.r * 1.3} ry={s.r * 0.6} fill={SNOW.shadow} opacity="0.5" />
          <ellipse cx={s.x} cy={s.y} rx={s.r} ry={s.r * 0.62} fill="#2c2f3f" />
          <path d={`M${s.x - s.r * 0.9} ${s.y - s.r * 0.1} Q${s.x} ${s.y - s.r * 0.9} ${s.x + s.r * 0.85} ${s.y - s.r * 0.15} Q${s.x} ${s.y - s.r * 0.35} ${s.x - s.r * 0.9} ${s.y - s.r * 0.1} Z`} fill={SNOW.lit} />
        </g>
      ))}
      {HIGH_TUFTS.map((t, i) => (
        <Tuft key={i} x={t.x} y={t.y} s={t.s * 0.45} seed={t.seed} />
      ))}
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "ff-field": Field,
  "ff-high": High,
};
