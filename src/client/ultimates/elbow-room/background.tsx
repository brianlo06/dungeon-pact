import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Elbow Room's space: the Shambles, at dusk, after the market.
 *
 * A medieval butchers' lane. Timber-framed houses with their upper storeys
 * jettied out over the street, each storey further than the one under it,
 * until the eaves almost meet over the cobbles and leave a slit of cold
 * green sky. Lime plaster washed in the old colours, dusky pink and ochre,
 * gone dark with evening. The shop fronts are shut, their shutters folded
 * down on chains into the wide plank benches butchers sold from (the
 * shambles themselves); empty iron hooks hang in a row under each jetty
 * beam. Cobbles strewn with sawdust, a gutter down the middle. Nothing is on
 * the benches or the hooks: the day's work is done.
 *
 * Two drawings of the one lane, on the 3200×1800 box of the other
 * backgrounds (world units: the stage is 0…1600 × 0…900):
 *
 *   elbow-street   side-on, across the lane: the far houses' fronts, their
 *                  benches and hooks, and the cobbles in front of them. The
 *                  wall's foot is at world y 640, the bench tops at 560 and
 *                  the jetty beam at 300, so a figure standing at y 800–880
 *                  has its chest against plaster.
 *   elbow-lane     down the lane from a first-floor window: both rows of
 *                  houses leaning in to a slit of sky, the cobbles running
 *                  away to a vanishing point at (1000, 150).
 *
 * Nothing here moves.
 */

export const TIMBER = "#120c0d";
const PINK = "#7a524c";
const PINK_LIT = "#9b6d63";
const OCHRE = "#6f5732";
const OCHRE_LIT = "#8e7240";
const SLATE = "#24232b";
const COBBLE = "#34323b";
const SAWDUST = "#c9ab77";
const SKY_TOP = "#16302f";
const SKY = "#5c9c8e";
const HOOK = "#0a0708";

const f = (n: number) => n.toFixed(1);

/* ── Side-on: the far side of the lane ─────────────────────────────────── */

const FOOT = 640;
const BENCH = 560;
const BEAM = 300;
const JETTY1 = 60;
const JETTY2 = -170;

/** Bays along the far side: where each house front starts, its width and wash. */
const BAYS = (() => {
  const rand = seeded(4261);
  const out: { x: number; w: number; pink: boolean; lean: number; win: number }[] = [];
  let x = -860;
  let pink = rand() > 0.5;
  while (x < 2480) {
    const w = 330 + rand() * 170;
    out.push({ x, w, pink, lean: (rand() - 0.5) * 10, win: rand() });
    x += w;
    pink = !pink;
  }
  return out;
})();

const COBBLES = (() => {
  const rand = seeded(907);
  const out: { x: number; y: number; w: number; h: number; t: number }[] = [];
  for (let row = 0; row < 16; row++) {
    const y = FOOT + 24 + row * row * 3.2 + row * 26;
    const h = 10 + row * 2.6;
    let x = -840 + rand() * 40;
    while (x < 2440) {
      const w = 34 + row * 5 + rand() * 20;
      out.push({ x, y, w, h, t: rand() });
      x += w + 6 + rand() * 6;
    }
  }
  return out;
})();

const DUST = (() => {
  const rand = seeded(55);
  return Array.from({ length: 260 }, () => {
    const y = FOOT + 10 + Math.pow(rand(), 1.4) * 680;
    return { x: -800 + rand() * 3200, y, r: 2 + rand() * 3 + (y - FOOT) * 0.006, a: rand() * 180 };
  });
})();

/** An ellipse as a sub-path. */
const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M${f(cx - rx)} ${f(cy)} a${f(rx)} ${f(ry)} 0 1 0 ${f(rx * 2)} 0 a${f(rx)} ${f(ry)} 0 1 0 ${f(-rx * 2)} 0 Z`;
const COBBLE_PATHS = [0, 1].map((k) =>
  COBBLES.filter((c) => (c.t > 0.5 ? 1 : 0) === k)
    .map((c) => ell(c.x + c.w / 2, c.y, c.w / 2, c.h / 2))
    .join(" "),
);
/** A fleck of sawdust as a turned quad. */
const DUST_PATH = DUST.map((d) => {
  const a = (d.a * Math.PI) / 180;
  const w = d.r * 1.8;
  const h = d.r * 0.8;
  const [cx, sx] = [Math.cos(a), Math.sin(a)];
  const pts: [number, number][] = [
    [0, 0],
    [w * cx, w * sx],
    [w * cx - h * sx, w * sx + h * cx],
    [-h * sx, h * cx],
  ];
  return `M${pts.map(([x, y]) => `${f(d.x + x)} ${f(d.y + y)}`).join(" L")} Z`;
}).join(" ");

function Front({ x, w, pink, lean, win }: (typeof BAYS)[number]) {
  const wash = pink ? PINK : OCHRE;
  const lit = pink ? PINK_LIT : OCHRE_LIT;
  const posts = [x, x + w * 0.5, x + w];
  const hooks = Array.from({ length: Math.floor(w / 56) }, (_, i) => x + 30 + i * 56);
  return (
    <g>
      {/* The second storey, jettied out furthest. */}
      <rect x={x - 6} y={JETTY2 - 260} width={w + 12} height={260 + (JETTY1 - JETTY2)} fill={wash} />
      <path d={`M${x} ${JETTY2 - 240} L${x + w} ${JETTY2 - 240} M${x + w * 0.33} ${JETTY2 - 240} L${x + w * 0.33} ${JETTY1} M${x + w * 0.66} ${JETTY2 - 240} L${x + w * 0.66} ${JETTY1}`} stroke={TIMBER} strokeWidth={16} />
      <path d={`M${x + w * 0.33} ${JETTY2 - 40} L${x + w * 0.5} ${JETTY2 - 200} L${x + w * 0.66} ${JETTY2 - 40}`} stroke={TIMBER} strokeWidth={12} fill="none" />
      {/* The first storey, and its leaded window, unlit. */}
      <rect x={x} y={JETTY1} width={w} height={BEAM - JETTY1} fill={wash} />
      <rect x={x + w * (0.24 + win * 0.2)} y={JETTY1 + 60} width={w * 0.3} height={120} fill="#141417" stroke={TIMBER} strokeWidth={10} />
      <path d={`M${f(x + w * (0.24 + win * 0.2) + w * 0.15)} ${JETTY1 + 60} V${JETTY1 + 180} M${f(x + w * (0.24 + win * 0.2))} ${JETTY1 + 120} H${f(x + w * (0.54 + win * 0.2))}`} stroke={TIMBER} strokeWidth={5} />
      <path d={`M${x} ${JETTY1} V${BEAM} M${x + w} ${JETTY1} V${BEAM} M${x + 20} ${BEAM - 10} L${x + w * 0.22} ${JETTY1 + 30} M${x + w - 20} ${BEAM - 10} L${x + w * 0.78} ${JETTY1 + 30}`} stroke={TIMBER} strokeWidth={14} />
      {/* The jetty's underside: shadow thrown down the wall under it. */}
      <rect x={x - 6} y={JETTY1 - 14} width={w + 12} height={26} fill={TIMBER} />
      {/* The ground storey: plaster panels between posts, a little lit from the lane. */}
      <rect x={x} y={BEAM} width={w} height={FOOT - BEAM} fill={wash} />
      <rect x={x} y={BEAM + 150} width={w} height={BENCH - BEAM - 150} fill={lit} opacity={0.35} />
      <rect x={x} y={BEAM + 14} width={w} height={70} fill="#000" opacity={0.28} />
      {posts.map((px, i) => (
        <rect key={i} x={px - 11} y={BEAM} width={22} height={FOOT - BEAM} fill={TIMBER} transform={`rotate(${(lean * (i - 1) * 0.1).toFixed(2)} ${px} ${FOOT})`} />
      ))}
      <path d={`M${x + 20} ${BEAM + 120} L${x + w * 0.5 - 20} ${BEAM + 40} M${x + w * 0.5 + 20} ${BEAM + 40} L${x + w - 20} ${BEAM + 120}`} stroke={TIMBER} strokeWidth={10} opacity={0.9} />
      {/* The jetty beam, and the empty hooks under it. */}
      <rect x={x - 6} y={BEAM - 16} width={w + 12} height={30} fill={TIMBER} />
      <path d={hooks.map((hx, i) => `M${hx} ${BEAM + 14} V${BEAM + 58 + (i % 3) * 6} q0 22 -14 22 q-12 0 -12 -12`).join(" ")} stroke={HOOK} strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* The shutter, folded down on its chains into the bench. */}
      <path d={`M${x + 26} ${BENCH} L${x + w - 26} ${BENCH} L${x + w - 18} ${BENCH + 24} L${x + 18} ${BENCH + 24} Z`} fill="#3a2a22" stroke={TIMBER} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M${x + 34} ${BENCH + 4} H${x + w - 34}`} stroke="#6b5140" strokeWidth={3} opacity={0.7} />
      <path d={`M${x + 30} ${BENCH + 24} L${x + 36} ${FOOT} M${x + w - 30} ${BENCH + 24} L${x + w - 36} ${FOOT}`} stroke={TIMBER} strokeWidth={10} />
      <path d={`M${x + 30} ${BENCH} L${x + 44} ${BEAM + 150} M${x + w - 30} ${BENCH} L${x + w - 44} ${BEAM + 150}`} stroke={HOOK} strokeWidth={3} strokeDasharray="6 4" />
      {/* The shop's dark opening above the bench. */}
      <rect x={x + 60} y={BEAM + 170} width={w - 120} height={BENCH - BEAM - 180} fill="#0d0a0b" opacity={0.75} />
    </g>
  );
}

function Street() {
  return (
    <svg className="cine-bg-svg elbow-street" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="elbow-street-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={SKY_TOP} />
          <stop offset="1" stopColor={SKY} />
        </linearGradient>
        <linearGradient id="elbow-street-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b1a20" />
          <stop offset="0.25" stopColor={SLATE} />
          <stop offset="1" stopColor="#141318" />
        </linearGradient>
        <linearGradient id="elbow-street-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0a0d" stopOpacity="0.85" />
          <stop offset="0.35" stopColor="#0b0a0d" stopOpacity="0.2" />
          <stop offset="1" stopColor="#0b0a0d" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#elbow-street-sky)" />
      {BAYS.map((b, i) => (
        <Front key={i} {...b} />
      ))}
      {/* The upper storeys sink into the dusk. */}
      <rect x="-800" y="-450" width="3200" height={BEAM + 450} fill="url(#elbow-street-dusk)" />
      {/* The cobbles, the gutter, and the sawdust. */}
      <rect x="-800" y={FOOT} width="3200" height={1350 - FOOT} fill="url(#elbow-street-ground)" />
      <path d={`M-800 ${FOOT} H2400`} stroke={TIMBER} strokeWidth={8} />
      {/* Two paths, not a thousand ellipses: the lighter stones and the darker. */}
      <path d={COBBLE_PATHS[0]} fill={COBBLE} opacity={0.62} />
      <path d={COBBLE_PATHS[1]} fill={COBBLE} opacity={0.95} />
      <path d={`M-800 ${FOOT + 150} C0 ${FOOT + 158} 1600 ${FOOT + 142} 2400 ${FOOT + 150}`} stroke="#0e0d11" strokeWidth={26} fill="none" />
      <path d={`M-800 ${FOOT + 140} C0 ${FOOT + 148} 1600 ${FOOT + 132} 2400 ${FOOT + 140}`} stroke="#5c7e78" strokeWidth={3} fill="none" opacity={0.35} />
      <path d={DUST_PATH} fill={SAWDUST} opacity={0.75} />
    </svg>
  );
}

/* ── Down the lane ─────────────────────────────────────────────────────── */

/**
 * A pinhole down the lane: lateral `x` (the lane runs from −0.7 to 0.7),
 * height `y` above the cobbles, depth `z`. The camera stands 1.6 up.
 */
const VX = 1000;
const VY = 150;
const F = 1150;
const EYE = 1.6;
const P = (x: number, y: number, z: number): [number, number] => [VX + (x * F) / z, VY + ((EYE - y) * F) / z];
const pt = ([x, y]: [number, number]) => `${f(x)} ${f(y)}`;
const quad = (a: [number, number], b: [number, number], c: [number, number], d: [number, number]) => `M${pt(a)} L${pt(b)} L${pt(c)} L${pt(d)} Z`;

/** A storey's face on one side: from depth z0 to z1, at lateral x, heights y0…y1. */
const face = (x: number, y0: number, y1: number, z0: number, z1: number) => quad(P(x, y0, z0), P(x, y0, z1), P(x, y1, z1), P(x, y1, z0));

const DEPTHS = (() => {
  const rand = seeded(88);
  const out: { z0: number; z1: number; pink: boolean }[] = [];
  let z = 1.0;
  let pink = true;
  while (z < 26) {
    const len = 0.9 + rand() * 0.8;
    out.push({ z0: z, z1: z + len, pink });
    z += len;
    pink = rand() > 0.45 ? !pink : pink;
  }
  return out;
})();

function Lane() {
  const W0 = 0.7;
  const W1 = 0.58;
  const W2 = 0.46;
  const side = (s: 1 | -1) =>
    DEPTHS.map((d, i) => {
      const pinkish = s > 0 ? d.pink : !d.pink;
      const wash = pinkish ? PINK : OCHRE;
      const lit = pinkish ? PINK_LIT : OCHRE_LIT;
      const mid = (d.z0 + d.z1) / 2;
      const hooks = [0.2, 0.4, 0.6, 0.8].map((k) => d.z0 + (d.z1 - d.z0) * k);
      return (
        <g key={`${s}${i}`}>
          <path d={face(s * W2, 1.8, 2.7, d.z0, d.z1)} fill={wash} />
          <path d={face(s * W1, 0.95, 1.8, d.z0, d.z1)} fill={wash} />
          <path d={face(s * W0, 0, 0.95, d.z0, d.z1)} fill={lit} />
          {/* Jetty undersides. */}
          <path d={quad(P(s * W0, 0.95, d.z0), P(s * W0, 0.95, d.z1), P(s * W1, 0.95, d.z1), P(s * W1, 0.95, d.z0))} fill={TIMBER} />
          <path d={quad(P(s * W1, 1.8, d.z0), P(s * W1, 1.8, d.z1), P(s * W2, 1.8, d.z1), P(s * W2, 1.8, d.z0))} fill={TIMBER} />
          {/* Posts at each house's ends, and the brace on the upper storey. */}
          <path d={`M${pt(P(s * W0, 0, d.z0))} L${pt(P(s * W0, 0.95, d.z0))} M${pt(P(s * W1, 0.95, d.z0))} L${pt(P(s * W1, 1.8, d.z0))} M${pt(P(s * W2, 1.8, d.z0))} L${pt(P(s * W2, 2.7, d.z0))} M${pt(P(s * W1, 1.0, d.z0))} L${pt(P(s * W1, 1.75, mid))}`} stroke={TIMBER} strokeWidth={f(Math.max(3, 40 / d.z0))} />
          {/* The bench, folded down. */}
          <path d={quad(P(s * W0, 0.42, d.z0 + 0.1), P(s * W0, 0.42, d.z1 - 0.1), P(s * (W0 - 0.1), 0.4, d.z1 - 0.1), P(s * (W0 - 0.1), 0.4, d.z0 + 0.1))} fill="#3a2a22" stroke={TIMBER} strokeWidth={f(Math.max(1, 12 / d.z0))} />
          <path d={face(s * W0, 0.48, 0.86, d.z0 + 0.14, d.z1 - 0.14)} fill="#0d0a0b" opacity={0.7} />
          {/* Hooks under the jetty. */}
          <path
            d={hooks
              .map((hz) => {
                const [hx, hy] = P(s * (W0 - 0.02), 0.94, hz);
                const len = 0.16 * (F / hz);
                return `M${f(hx)} ${f(hy)} v${f(len)} q0 ${f(len * 0.35)} ${f(-s * len * 0.22)} ${f(len * 0.35)}`;
              })
              .join(" ")}
            stroke={HOOK}
            strokeWidth={f(Math.max(1, 10 / d.z0))}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    });
  const cobbles = (() => {
    const rand = seeded(412);
    const out: string[] = [];
    for (let z = 1.2; z < 20; z *= 1.07)
      for (let x = -0.66; x < 0.66; x += 0.09 + rand() * 0.04) {
        const [cx, cy] = P(x + rand() * 0.03, 0, z);
        const rx = (0.04 * F) / z;
        out.push(`M${f(cx - rx)} ${f(cy)} a${f(rx)} ${f(rx * 0.3)} 0 1 0 ${f(rx * 2)} 0 a${f(rx)} ${f(rx * 0.3)} 0 1 0 ${f(-rx * 2)} 0 Z`);
      }
    return out.join(" ");
  })();
  const dust = (() => {
    const rand = seeded(5150);
    const out: string[] = [];
    for (let i = 0; i < 420; i++) {
      const z = 1.1 + Math.pow(rand(), 1.8) * 14;
      const x = (rand() - 0.5) * 1.34;
      const [cx, cy] = P(x, 0, z);
      const r = (0.014 * F) / z;
      out.push(`M${f(cx - r)} ${f(cy)} h${f(r * 2)} v${f(r * 0.6)} h${f(-r * 2)} Z`);
    }
    return out.join(" ");
  })();
  return (
    <svg className="cine-bg-svg elbow-lane" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="elbow-lane-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={SKY_TOP} />
          <stop offset="1" stopColor={SKY} />
        </linearGradient>
        <radialGradient id="elbow-lane-far" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#0b0a0d" stopOpacity="0" />
          <stop offset="0.6" stopColor="#0b0a0d" stopOpacity="0" />
          <stop offset="1" stopColor="#0b0a0d" stopOpacity="0.7" />
        </radialGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#elbow-lane-sky)" />
      {/* The cobbles, down to the far end. */}
      <path d={quad(P(-0.7, 0, 1), P(0.7, 0, 1), P(0.7, 0, 30), P(-0.7, 0, 30))} fill={SLATE} />
      <path d={cobbles} fill={COBBLE} />
      <path d={`M${pt(P(0, 0, 1))} L${pt(P(0, 0, 30))}`} stroke="#0e0d11" strokeWidth={40} />
      <path d={dust} fill={SAWDUST} opacity={0.75} />
      {/* Far to near, so the near houses overlap the far. */}
      {side(-1).reverse()}
      {side(1).reverse()}
      {/* The far end of the lane: a dark turn. */}
      <path d={quad(P(-0.7, 0, 26), P(0.7, 0, 26), P(0.7, 2.7, 26), P(-0.7, 2.7, 26))} fill="#100d10" />
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#elbow-lane-far)" />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "elbow-street": () => <Street />,
  "elbow-lane": () => <Lane />,
};
