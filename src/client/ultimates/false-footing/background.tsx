import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * False Footing's space: the hound run, at dusk.
 *
 * The Ember Foundry keeps hunting packs, and they are run on a strip of
 * waste ground behind the works: dark peat mud churned by a hundred paws,
 * the old posts of a run fence leaning out of it, a few tussocks of dead
 * grass, and beyond it the spoil heaps and cold chimneys of the foundry
 * under a sky the colour of old smoke. Nothing burns here. The ground is
 * nothing but prints, most of them old — which is the point: anyone can see
 * that hounds were here, and only a tracker can find the one trail that
 * matters in them.
 *
 * Drawn from the tracker's two heights:
 *
 *   ff-field  at eye level with the mud — the horizon high, the ground
 *             running away from the lens;
 *   ff-high   from above — almost all ground, the heaps and the chimneys a
 *             thin band at the top of the frame.
 *
 * Both are the 3200×1800 box of the other backgrounds (world units: the stage
 * is 0…1600 × 0…900). Nothing here moves, so it rasterises once. The mud is
 * never wet enough to shine: it gleams only on the lips squeezed up round a
 * print, so it never reads as water.
 */

/** Where the ground meets the heaps, world y, in each view. */
export const HORIZON = 372;
export const HIGH_HORIZON = 64;

export const MUD = {
  far: "#5b4d3b",
  mid: "#45372a",
  near: "#2d231a",
  clod: "#6f5d47",
  lip: "#8a775b",
  hollow: "#1d150f",
  ink: "#0f0c09",
  straw: "#7a6d45",
} as const;

/** Dead grass through the mud: a tuft of bent stalks, some with a seed head. */
function Tuft({ x, y, s, seed }: { x: number; y: number; s: number; seed: number }) {
  const rand = seeded(seed);
  const stalks = Array.from({ length: 8 }, () => {
    const a = -Math.PI / 2 + (rand() - 0.5) * 1.1;
    const len = (46 + rand() * 70) * s;
    const bend = (rand() - 0.5) * 34 * s;
    const ex = Math.cos(a) * len;
    const ey = Math.sin(a) * len;
    return { d: `M0 0 Q${ex * 0.5 + bend} ${ey * 0.55} ${ex} ${ey}`, ex, ey, head: rand() < 0.4 };
  });
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="3" rx={26 * s} ry={7 * s} fill={MUD.hollow} opacity="0.7" />
      {stalks.map((st, i) => (
        <g key={i}>
          <path d={st.d} stroke={i % 3 ? MUD.straw : "#4d4630"} strokeWidth={3 * s} fill="none" strokeLinecap="round" />
          {st.head && <ellipse cx={st.ex} cy={st.ey} rx={3 * s} ry={7 * s} fill="#8d7c4e" transform={`rotate(${(Math.atan2(st.ey, st.ex) * 180) / Math.PI + 90} ${st.ex} ${st.ey})`} />}
        </g>
      ))}
    </g>
  );
}

/** An old, unread print: a dark pad and three toe dents, squeezed rims catching the sky. */
function OldPrint({ x, y, s, squash, turn }: { x: number; y: number; s: number; squash: number; turn: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s} ${s * squash}) rotate(${turn})`}>
      <ellipse cx="14" cy="-2" rx="22" ry="18" fill={MUD.lip} opacity="0.35" />
      <ellipse cx="14" cy="0" rx="20" ry="17" fill={MUD.hollow} opacity="0.75" />
      {[
        [-12, -24],
        [-20, 0],
        [-12, 24],
      ].map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="8" ry="7" fill={MUD.hollow} opacity="0.75" />
      ))}
    </g>
  );
}

const fieldRand = seeded(7331);

/** Eye level: clods and ridges of churned mud receding to the heaps. */
const FIELD_CLODS = Array.from({ length: 70 }, () => {
  const d = Math.pow(fieldRand(), 1.6);
  const y = HORIZON + 10 + d * 980;
  const k = 0.15 + d * 1.7;
  return { x: -800 + fieldRand() * 3200, y, w: (40 + fieldRand() * 90) * k, h: (8 + fieldRand() * 10) * k };
});
const FIELD_PRINTS = Array.from({ length: 60 }, () => {
  const d = Math.pow(fieldRand(), 1.4);
  const y = HORIZON + 16 + d * 960;
  return { x: -800 + fieldRand() * 3200, y, s: 0.2 + d * 1.6, turn: (fieldRand() - 0.5) * 120 };
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
/** The run's old fence: leaning posts, nearer ones bigger, one still with a rail. */
const FIELD_POSTS = [
  { x: -560, y: 760, h: 380, lean: -6 },
  { x: -120, y: 520, h: 150, lean: 4 },
  { x: 260, y: 430, h: 62, lean: -3 },
  { x: 1320, y: 440, h: 70, lean: 5 },
  { x: 1780, y: 560, h: 170, lean: -7 },
  { x: 2240, y: 820, h: 420, lean: 8 },
];

/** The skyline: spoil heaps, and the foundry's cold stacks. */
const heaps = (base: number, seed: number, amp: number, n: number) => {
  const rand = seeded(seed);
  let d = `M-800 ${base}`;
  for (let i = 0; i <= n; i++) {
    const x = -800 + (i / n) * 3200;
    d += ` Q${x - 1600 / n} ${base - amp * (0.5 + rand())} ${x} ${base - amp * rand() * 0.3}`;
  }
  return `${d} L2400 ${base + 40} L-800 ${base + 40} Z`;
};

function Sky({ horizon }: { horizon: number }) {
  return (
    <>
      <rect x="-800" y="-450" width="3200" height={horizon + 450} fill="url(#ff-sky)" />
      <ellipse cx="800" cy={horizon} rx="1900" ry="140" fill="url(#ff-haze)" />
      {/* The foundry's stacks, cold, and the works' roofline, far off. */}
      <g fill="#1f1d18">
        <rect x={-180} y={horizon - 260} width="34" height="260" />
        <rect x={-120} y={horizon - 200} width="26" height="200" />
        <rect x={1900} y={horizon - 300} width="40" height="300" />
        <path d={`M-420 ${horizon} V${horizon - 70} L-300 ${horizon - 110} L-180 ${horizon - 70} V${horizon} Z`} />
        <path d={`M1700 ${horizon} V${horizon - 90} H2080 V${horizon} Z`} />
      </g>
      <path d={heaps(horizon + 4, 41, 80, 6)} fill="#2e2a22" />
      <path d={heaps(horizon + 8, 77, 40, 10)} fill="#3a3329" />
    </>
  );
}

function Defs() {
  return (
    <defs>
      <linearGradient id="ff-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#141310" />
        <stop offset="0.55" stopColor="#35332a" />
        <stop offset="1" stopColor="#6a644c" />
      </linearGradient>
      <radialGradient id="ff-haze" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#8a8160" stopOpacity="0.4" />
        <stop offset="1" stopColor="#8a8160" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="ff-ground-eye" gradientUnits="userSpaceOnUse" x1="0" y1={HORIZON} x2="0" y2="1350">
        <stop offset="0" stopColor={MUD.far} />
        <stop offset="0.3" stopColor={MUD.mid} />
        <stop offset="1" stopColor={MUD.near} />
      </linearGradient>
      <linearGradient id="ff-ground-high" gradientUnits="userSpaceOnUse" x1="0" y1={HIGH_HORIZON} x2="0" y2="1350">
        <stop offset="0" stopColor={MUD.far} />
        <stop offset="0.35" stopColor="#4e4031" />
        <stop offset="1" stopColor="#3a2e22" />
      </linearGradient>
    </defs>
  );
}

function Post({ x, y, h, lean }: { x: number; y: number; h: number; lean: number }) {
  const w = h * 0.09;
  return (
    <g transform={`translate(${x} ${y}) rotate(${lean})`}>
      <ellipse cx="0" cy="2" rx={w * 1.6} ry={w * 0.4} fill={MUD.hollow} opacity="0.8" />
      <path d={`M${-w / 2} 0 L${-w * 0.45} ${-h} L${w * 0.1} ${-h - w * 0.5} L${w / 2} ${-h * 0.96} L${w / 2} 0 Z`} fill="#3b3024" stroke={MUD.ink} strokeWidth={Math.max(2, w * 0.18)} />
      <path d={`M${-w * 0.2} ${-h * 0.9} V${-h * 0.2}`} stroke="#5b4b38" strokeWidth={w * 0.16} />
    </g>
  );
}

function Field() {
  return (
    <svg className="cine-bg-svg ff-bg" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Defs />
      <Sky horizon={HORIZON} />
      <rect x="-800" y={HORIZON} width="3200" height={1350 - HORIZON} fill="url(#ff-ground-eye)" />
      {FIELD_PRINTS.map((p, i) => (
        <OldPrint key={i} x={p.x} y={p.y} s={p.s} squash={0.32} turn={p.turn} />
      ))}
      {FIELD_CLODS.map((c, i) => (
        <g key={i}>
          <ellipse cx={c.x} cy={c.y + c.h * 0.5} rx={c.w * 0.55} ry={c.h * 0.6} fill={MUD.hollow} opacity="0.55" />
          <ellipse cx={c.x} cy={c.y} rx={c.w * 0.5} ry={c.h * 0.55} fill={MUD.mid} />
          <path d={`M${c.x - c.w * 0.4} ${c.y - c.h * 0.2} Q${c.x} ${c.y - c.h * 0.75} ${c.x + c.w * 0.35} ${c.y - c.h * 0.25}`} stroke={MUD.clod} strokeWidth={1 + (c.y - HORIZON) / 300} fill="none" strokeLinecap="round" />
        </g>
      ))}
      {FIELD_POSTS.map((p, i) => (
        <Post key={i} {...p} />
      ))}
      {FIELD_TUFTS.map((t, i) => (
        <Tuft key={i} x={t.x} y={t.y} s={t.s} seed={90 + i} />
      ))}
    </svg>
  );
}

const highRand = seeded(5519);
const HIGH_PRINTS = Array.from({ length: 90 }, () => {
  const y = HIGH_HORIZON + 30 + highRand() * 1260;
  const k = 0.5 + (y - HIGH_HORIZON) / 1100;
  return { x: -800 + highRand() * 3200, y, s: 0.9 * k, turn: 150 + (highRand() - 0.5) * 110 };
});
const HIGH_CLODS = Array.from({ length: 50 }, () => {
  const y = HIGH_HORIZON + 30 + highRand() * 1260;
  const k = 0.5 + (y - HIGH_HORIZON) / 1100;
  return { x: -800 + highRand() * 3200, y, r: (8 + highRand() * 18) * k };
});
const HIGH_TUFTS = Array.from({ length: 12 }, (_, i) => {
  const y = HIGH_HORIZON + 80 + highRand() * 1150;
  const x = -760 + highRand() * 3120;
  return { x, y, s: (0.6 + (y - HIGH_HORIZON) / 900) * 0.5, seed: 300 + i };
});
const HIGH_POSTS = Array.from({ length: 5 }, (_, i) => {
  const y = HIGH_HORIZON + 160 + i * 250 + highRand() * 60;
  return { x: -700 + (i % 2) * 2900 + highRand() * 200, y, h: 60 + (y - HIGH_HORIZON) * 0.14, lean: (highRand() - 0.5) * 16 };
});

function High() {
  return (
    <svg className="cine-bg-svg ff-bg" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Defs />
      <Sky horizon={HIGH_HORIZON} />
      <rect x="-800" y={HIGH_HORIZON} width="3200" height={1350 - HIGH_HORIZON} fill="url(#ff-ground-high)" />
      {HIGH_PRINTS.map((p, i) => (
        <OldPrint key={i} x={p.x} y={p.y} s={p.s} squash={0.72} turn={p.turn} />
      ))}
      {HIGH_CLODS.map((c, i) => (
        <g key={i}>
          <ellipse cx={c.x + c.r * 0.2} cy={c.y + c.r * 0.3} rx={c.r * 1.1} ry={c.r * 0.7} fill={MUD.hollow} opacity="0.5" />
          <ellipse cx={c.x} cy={c.y} rx={c.r} ry={c.r * 0.65} fill={MUD.clod} opacity="0.8" />
        </g>
      ))}
      {HIGH_POSTS.map((p, i) => (
        <Post key={i} {...p} />
      ))}
      {HIGH_TUFTS.map((t, i) => (
        <Tuft key={i} x={t.x} y={t.y} s={t.s} seed={t.seed} />
      ))}
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "ff-field": Field,
  "ff-high": High,
};
