import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import { HIDE } from "./hide";
import "./style.css";

/**
 * A Good Hiding's space: the tannery's drying loft.
 *
 * A long timber loft under a pitched roof, seen down its aisle. Cured hides
 * hang over crossbeams in ranks on both sides of the aisle, receding into the
 * dark; the left wall is slatted louvres, and bars of pale daylight come
 * through the slats and lie across the boards. Nothing in it is red, nothing
 * burns, and there is no light from above: the only light is the slats'.
 *
 * Drawn on the 3200×1800 box of the other backgrounds (world units: the stage
 * is 0…1600 × 0…900). The aisle's vanishing point is at (800, 430) and the far
 * wall's foot at world y 520, so a figure standing on the boards anywhere
 * below that is on the floor. Nothing here moves: the swinging hides are
 * effects (`hiding-hides`).
 */

const VX = 800;
const VY = 430;
const FAR = { l: 560, r: 1040, top: 250, foot: 520 };

/** A point at depth `k` (0 at the near edge … 1 at the far wall) along a line from a near point to the vanishing point. */
const toward = (x: number, y: number, k: number): [number, number] => [x + (VX - x) * k, y + (VY - y) * k];

/** Ranks of crossbeams, near to far: depth fraction toward the far wall. */
const RANKS = [0.18, 0.42, 0.6, 0.73, 0.83, 0.9];

/** The hides hung on each rank: an offset from the aisle's edge, a width, a length and a lean. */
const HIDES = (() => {
  const rand = seeded(2111);
  return RANKS.map(() =>
    [-1, 1].flatMap((side) =>
      Array.from({ length: 3 }, (_, i) => ({
        side,
        off: 0.1 + i * 0.28 + rand() * 0.05,
        w: 0.8 + rand() * 0.35,
        len: 0.9 + rand() * 0.3,
        lean: (rand() - 0.5) * 6,
        tone: rand(),
      })),
    ),
  );
})();

/** Scuffs, knots and nail heads along the boards. */
const KNOTS = (() => {
  const rand = seeded(733);
  return Array.from({ length: 40 }, () => ({ u: rand(), k: Math.pow(rand(), 1.6) * 0.85, w: 10 + rand() * 30 }));
})();

function Loft() {
  // The near edge of the loft, well past the stage so a rolled camera finds no edge.
  const nearL = -900;
  const nearR = 2500;
  const floorY = 1400;
  const roofY = -700;
  const boards = Array.from({ length: 23 }, (_, i) => nearL + ((nearR - nearL) * i) / 22);
  return (
    <svg className="cine-bg-svg hiding-loft" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="hiding-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d130c" />
          <stop offset="0.5" stopColor="#3a2718" />
          <stop offset="1" stopColor="#2a1c12" />
        </linearGradient>
        <radialGradient id="hiding-far" cx="0.5" cy="0.6" r="0.7">
          <stop offset="0" stopColor="#3b2a1d" />
          <stop offset="1" stopColor="#0e0906" />
        </radialGradient>
        <linearGradient id="hiding-bar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#efe8d4" stopOpacity="0.5" />
          <stop offset="0.6" stopColor="#efe8d4" stopOpacity="0.16" />
          <stop offset="1" stopColor="#efe8d4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hiding-shaft" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#f3ecd9" stopOpacity="0.2" />
          <stop offset="1" stopColor="#f3ecd9" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hiding-depth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c0806" stopOpacity="0.9" />
          <stop offset="0.45" stopColor="#0c0806" stopOpacity="0.2" />
          <stop offset="1" stopColor="#0c0806" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="#0e0906" />

      {/* The roof: pitched, with rafters running back to the far gable. */}
      <path d={`M${nearL} ${roofY} L${VX} ${-620} L${nearR} ${roofY} L${FAR.r} ${FAR.top} L${VX} ${FAR.top - 90} L${FAR.l} ${FAR.top} Z`} fill="#150e09" />
      <g stroke="#2a1d13" strokeWidth={16} strokeLinecap="round">
        {Array.from({ length: 9 }, (_, i) => {
          const x = nearL + ((nearR - nearL) * i) / 8;
          const y = roofY + Math.abs(x - VX) * -0.05 + 60;
          const [fx, fy] = toward(x, y, 0.72);
          return <path key={i} d={`M${x} ${y} L${fx.toFixed(0)} ${fy.toFixed(0)}`} />;
        })}
      </g>

      {/* The far gable wall, and a small shuttered door in it. */}
      <path d={`M${FAR.l} ${FAR.top} L${VX} ${FAR.top - 90} L${FAR.r} ${FAR.top} L${FAR.r} ${FAR.foot} L${FAR.l} ${FAR.foot} Z`} fill="url(#hiding-far)" stroke="#070504" strokeWidth={6} />
      <rect x={VX - 46} y={FAR.foot - 150} width={92} height={150} fill="#0a0705" stroke="#2c2016" strokeWidth={5} />
      <path d={`M${VX - 40} ${FAR.foot - 142} h80 M${VX - 40} ${FAR.foot - 112} h80 M${VX - 40} ${FAR.foot - 82} h80 M${VX - 40} ${FAR.foot - 52} h80`} stroke="#b9ad92" strokeWidth={3} opacity={0.35} />

      {/* The right wall: plain boards, in shadow. */}
      <path d={`M${nearR} ${roofY} L${FAR.r} ${FAR.top} L${FAR.r} ${FAR.foot} L${nearR} ${floorY} Z`} fill="#1a110b" />
      {/* The left wall: the louvres. */}
      <path d={`M${nearL} ${roofY} L${FAR.l} ${FAR.top} L${FAR.l} ${FAR.foot} L${nearL} ${floorY} Z`} fill="#1c130c" />
      <g>
        {Array.from({ length: 11 }, (_, i) => {
          const k0 = 0.06 + i * 0.075;
          const k1 = k0 + 0.022;
          const [ax, ay] = toward(nearL, roofY + 380, k0);
          const [bx, by] = toward(nearL, floorY - 560, k0);
          const [cx, cy] = toward(nearL, floorY - 560, k1);
          const [dx, dy] = toward(nearL, roofY + 380, k1);
          return (
            <path
              key={i}
              d={`M${ax.toFixed(0)} ${ay.toFixed(0)} L${bx.toFixed(0)} ${by.toFixed(0)} L${cx.toFixed(0)} ${cy.toFixed(0)} L${dx.toFixed(0)} ${dy.toFixed(0)} Z`}
              fill="#efe8d4"
              opacity={0.9 - i * 0.05}
            />
          );
        })}
      </g>

      {/* The boards, running away to the far wall. */}
      <path d={`M${nearL} ${floorY} L${FAR.l} ${FAR.foot} L${FAR.r} ${FAR.foot} L${nearR} ${floorY} Z`} fill="url(#hiding-floor)" />
      <g stroke="#140d08" strokeWidth={5}>
        {boards.map((x, i) => {
          const [fx, fy] = toward(x, floorY, 0.99);
          return <path key={i} d={`M${x.toFixed(0)} ${floorY} L${fx.toFixed(0)} ${Math.max(FAR.foot, fy).toFixed(0)}`} />;
        })}
      </g>
      <g fill="#140d08" opacity={0.6}>
        {KNOTS.map((n, i) => {
          const x0 = nearL + (nearR - nearL) * n.u;
          const [x, y] = toward(x0, floorY, n.k);
          const s = 1 - n.k;
          return <ellipse key={i} cx={x.toFixed(0)} cy={y.toFixed(0)} rx={(n.w * s).toFixed(1)} ry={(n.w * s * 0.3).toFixed(1)} />;
        })}
      </g>

      {/* Bars of daylight from the louvres, laid across the boards toward the right. */}
      <g>
        {Array.from({ length: 9 }, (_, i) => {
          const k0 = 0.1 + i * 0.085;
          const k1 = k0 + 0.03;
          const [ax, ay] = toward(nearL, floorY, k0);
          const [dx, dy] = toward(nearL, floorY, k1);
          const reach = 1700 * (1 - k0);
          return (
            <path
              key={i}
              d={`M${ax.toFixed(0)} ${ay.toFixed(0)} L${(ax + reach).toFixed(0)} ${(ay + 40 * (1 - k0)).toFixed(0)} L${(dx + reach).toFixed(0)} ${(dy + 40 * (1 - k1)).toFixed(0)} L${dx.toFixed(0)} ${dy.toFixed(0)} Z`}
              fill="url(#hiding-bar)"
            />
          );
        })}
      </g>
      {/* The daylight hanging in the air on its way in. */}
      <path d={`M${nearL} ${roofY + 380} L${FAR.l} ${FAR.top + 60} L${VX + 260} ${FAR.foot + 40} L${nearL + 1900} ${floorY - 100} Z`} fill="url(#hiding-shaft)" />

      {/* Ranks of hides, far to near, hung over crossbeams on both sides of the aisle. */}
      {[...RANKS.keys()].reverse().map((r) => {
        const k = RANKS[r];
        const s = 1 - k;
        const [, beamY] = toward(VX, roofY + 760, k);
        const aisle = 260 * s;
        const span = 1500 * s;
        const dim = 0.25 + 0.75 * s;
        return (
          <g key={r}>
            <path d={`M${(VX - aisle - span).toFixed(0)} ${beamY.toFixed(0)} H${(VX + aisle + span).toFixed(0)}`} stroke="#0b0705" strokeWidth={(26 * s + 4).toFixed(1)} />
            {HIDES[r].map((h, i) => {
              const x = VX + h.side * (aisle + span * h.off * 0.9 + 200 * s);
              const scale = 2.7 * s * h.w;
              const light = Math.round(60 + 110 * h.tone * dim);
              const fill = `rgb(${light + 40}, ${Math.round(light * 0.72 + 20)}, ${Math.round(light * 0.45 + 10)})`;
              return (
                <g key={i} transform={`translate(${x.toFixed(0)} ${beamY.toFixed(0)}) rotate(${h.lean.toFixed(1)}) scale(${scale.toFixed(3)} ${(scale * h.len).toFixed(3)})`}>
                  <path d={HIDE} fill={fill} stroke="#0b0705" strokeWidth={3 / scale} strokeLinejoin="round" opacity={dim.toFixed(2)} />
                  {/* The edge the louvres light, on the left of every hide. */}
                  <path d="M-54 26 C-60 30 -70 34 -74 44 M-55 58 L-52 118" stroke="#e6d2b0" strokeWidth={2.4 / scale} fill="none" opacity={(0.55 * dim).toFixed(2)} strokeLinecap="round" />
                  <path d="M-40 18 C-20 26 20 26 40 18" stroke="#0b0705" strokeWidth={2 / scale} fill="none" opacity={0.5 * dim} />
                </g>
              );
            })}
          </g>
        );
      })}
      <rect x="-800" y="-450" width="3200" height="900" fill="url(#hiding-depth)" />

      {/* A scraping beam and a mallet against the right wall, near. */}
      <g transform="translate(1720 1080)">
        <path d="M-260 0 L120 -170 L150 -140 L-230 40 Z" fill="#2e2016" stroke="#0b0705" strokeWidth={6} />
        <path d="M-200 30 L-200 180 M80 -130 L80 120" stroke="#0b0705" strokeWidth={22} />
        <path d="M-60 -60 L-10 90" stroke="#3a2a1c" strokeWidth={14} strokeLinecap="round" />
        <rect x={-100} y={-110} width={90} height={56} rx={10} fill="#3d2c1e" stroke="#0b0705" strokeWidth={6} transform="rotate(20 -55 -82)" />
      </g>
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "hiding-loft": () => <Loft />,
};
