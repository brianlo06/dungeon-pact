import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Anthem of the Unpaid's space: the ridge above the dungeon, at dusk.
 *
 * The one place in any film with an open sky. Dead calm: long bars of cloud
 * that do not move, a low sun sitting on the horizon drawn like the sun sewn on
 * the Herald's tabard (a disc and eight rays), and along the far crest a line
 * of bare pike-staves planted in the turf — the standards of every company
 * that went down into the dungeon and was never paid, their colours long gone,
 * a rag left on one or two. Nothing here moves: the wind is the film's, and it
 * arrives with the last note.
 *
 * Drawn on the 3200×1800 box of the other backgrounds (world units: the stage
 * is 0…1600 × 0…900). The horizon sits at world y 610, a standing figure's
 * shoulder in a wide shot, so a figure is always cut against the brightest
 * band of sky. The near turf's edge is at y 790.
 */

const HORIZON = 610;
const SUN = { x: 1180, y: HORIZON + 14, r: 120 };

/** A ridge line from x −800 to 2400, deterministic. */
function ridge(seed: number, base: number, amp: number, steps: number) {
  const rand = seeded(seed);
  let d = `M-820 ${base + 900}`;
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const x = -820 + (3240 * i) / steps;
    const y = base + Math.sin(i * 0.7 + seed) * amp * 0.6 + (rand() - 0.5) * amp;
    pts.push([x, y]);
  }
  d += pts.map(([x, y]) => ` L${x.toFixed(0)} ${y.toFixed(0)}`).join("");
  d += ` L2420 ${base + 900} Z`;
  return { d, pts };
}

const FAR = ridge(7, HORIZON + 18, 26, 40);
const MID = ridge(19, 700, 34, 22);
const NEAR = ridge(31, 790, 22, 30);

/** The standards of the unpaid, along the far crest. */
const STAVES = (() => {
  const rand = seeded(1301);
  const out: { x: number; y: number; h: number; lean: number; rag: number; head: number }[] = [];
  for (let i = 0; i < 64; i++) {
    const x = -760 + (i + rand() * 0.7) * 50;
    // Stand on the far ridge where it is.
    const seg = Math.max(0, Math.min(FAR.pts.length - 2, Math.floor(((x + 820) / 3240) * 40)));
    const [ax, ay] = FAR.pts[seg];
    const [bx, by] = FAR.pts[seg + 1];
    const y = ay + ((x - ax) / (bx - ax)) * (by - ay) + 4;
    out.push({
      x,
      y,
      h: 46 + rand() * 50,
      lean: (rand() - 0.5) * 9,
      rag: rand() < 0.12 ? 1 : 0,
      head: Math.floor(rand() * 3),
    });
  }
  return out;
})();

const CLOUDS = (() => {
  const rand = seeded(88);
  return Array.from({ length: 11 }, (_, i) => ({
    x: -700 + rand() * 3000,
    y: -300 + i * 72 + rand() * 30,
    w: 500 + rand() * 1100,
    h: 10 + rand() * 18,
    o: 0.35 + rand() * 0.4,
  }));
})();

/** Tall grass heads at the turf's edge, black against the sky's last light. */
const GRASS = (() => {
  const rand = seeded(404);
  let d = "";
  for (let i = 0; i < 150; i++) {
    const x = -800 + i * 21.5 + rand() * 12;
    const h = 20 + rand() * 46;
    const lean = (rand() - 0.5) * 14;
    const base = 790 + Math.sin(i * 0.37) * 8 + 10;
    d += `M${x.toFixed(0)} ${base} Q${(x + lean * 0.3).toFixed(0)} ${(base - h * 0.6).toFixed(0)} ${(x + lean).toFixed(0)} ${(base - h).toFixed(0)} Q${(x + 3 + lean * 0.2).toFixed(0)} ${(base - h * 0.5).toFixed(0)} ${(x + 6).toFixed(0)} ${base} Z `;
  }
  return d;
})();

function Ridge() {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const w = 0.07;
    const r0 = SUN.r * 1.3;
    const r1 = SUN.r * 5.4;
    return `M${SUN.x + Math.cos(a - w) * r0} ${SUN.y + Math.sin(a - w) * r0} L${SUN.x + c * r1} ${SUN.y + s * r1} L${SUN.x + Math.cos(a + w) * r0} ${SUN.y + Math.sin(a + w) * r0} Z`;
  }).join(" ");
  return (
    <svg className="cine-bg-svg anthem-ridge" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="anthem-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#120a22" />
          <stop offset="0.24" stopColor="#2a1640" />
          <stop offset="0.42" stopColor="#5a2a5a" />
          <stop offset="0.53" stopColor="#b25a7e" />
          <stop offset="0.585" stopColor="#f2a39a" />
          <stop offset="0.6" stopColor="#ffd9ae" />
          <stop offset="0.65" stopColor="#7a3a5c" />
          <stop offset="1" stopColor="#12081a" />
        </linearGradient>
        <radialGradient id="anthem-sun-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff1cf" stopOpacity="0.95" />
          <stop offset="0.25" stopColor="#ffc6a0" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#ff9fb8" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ff9fb8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="anthem-turf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24122a" />
          <stop offset="0.3" stopColor="#140a18" />
          <stop offset="1" stopColor="#07040a" />
        </linearGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#anthem-sky)" />
      <ellipse cx={SUN.x} cy={SUN.y} rx={SUN.r * 7} ry={SUN.r * 3.2} fill="url(#anthem-sun-glow)" />
      <path d={rays} fill="#ffe2b8" opacity="0.13" />
      <g fill="#3a1b44">
        {CLOUDS.map((c, i) => (
          <g key={i} opacity={c.o}>
            <ellipse cx={c.x} cy={c.y} rx={c.w / 2} ry={c.h} />
            <ellipse cx={c.x + c.w * 0.08} cy={c.y + c.h * 0.7} rx={c.w * 0.42} ry={c.h * 0.35} fill="#e58aa2" opacity={Math.min(1, (c.y + 300) / 700) * 0.7} />
          </g>
        ))}
      </g>
      <circle cx={SUN.x} cy={SUN.y} r={SUN.r} fill="#ffe6bd" />
      <circle cx={SUN.x} cy={SUN.y} r={SUN.r * 0.82} fill="#fff3da" />
      <path d={FAR.d} fill="#4b2548" />
      <g stroke="#2c1330" strokeLinecap="round" fill="#2c1330">
        {STAVES.map((s, i) => (
          <g key={i} transform={`translate(${s.x.toFixed(0)} ${s.y.toFixed(0)}) rotate(${s.lean.toFixed(1)})`}>
            <path d={`M0 0 V${-s.h}`} strokeWidth={3.2} />
            {s.head === 0 && <path d={`M-6 ${-s.h} H6`} strokeWidth={2.6} />}
            {s.head === 1 && <path d={`M0 ${-s.h - 9} L3.5 ${-s.h} H-3.5 Z`} strokeWidth={1} />}
            {s.rag ? <path d={`M1 ${-s.h + 4} L14 ${-s.h + 8} L9 ${-s.h + 14} L13 ${-s.h + 22} L1 ${-s.h + 18} Z`} strokeWidth={0.6} /> : null}
          </g>
        ))}
      </g>
      <path d={MID.d} fill="#2a1430" />
      <path d={NEAR.d} fill="url(#anthem-turf)" />
      <path d={GRASS} fill="#07040a" />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "anthem-ridge": () => <Ridge />,
};
