import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Hallowed Ground's space: the cold casting floor of the Ember Foundry.
 *
 * The great floor the foundry poured on, with its fires out. Sooted
 * flagstones in perspective, their joints running away to a far wall; a
 * casting trench along the right; iron columns; ladles and a crucible
 * hanging dead on their chains from the dark overhead; slag heaped at the
 * walls; the furnace mouth far off, an arch with nothing burning in it. It is
 * lit by nothing — a faint blue-grey from nowhere so the shapes read — until
 * the line lights it. Not the Breaker's breach forge (a forge wall in heat,
 * red, embers): this one is cold, blue-black and silent.
 *
 * Drawn on the 3200×1800 box of the other backgrounds (world units: the stage
 * is 0…1600 × 0…900). The floor's vanishing point is at world (800, 440), so
 * a figure standing at world y 850 is on the near flags and the far wall is
 * behind the party's heads.
 */

export const VX = 800;
export const VY = 440;

const f1 = (n: number) => n.toFixed(1);

/** Where a floor point at depth `k` (0 near, 1 at the horizon) and lateral `u` (-1…1) lands. */
function floor(u: number, k: number): [number, number] {
  // Perspective: rows bunch towards the horizon.
  const y = VY + (1 - k) ** 2.1 * 1000;
  const x = VX + u * (2000 * (1 - k) ** 2.1 + 40);
  return [x, y];
}

/** The flagstone joints: rows across, and the radial joints running to the vanishing point. */
const JOINTS = (() => {
  const rand = seeded(1201);
  let rows = "";
  for (let i = 0; i < 26; i++) {
    const k = (i / 26) ** 0.85;
    const [xa, y] = floor(-1.5, k);
    const [xb] = floor(1.5, k);
    rows += `M${f1(xa)} ${f1(y)} L${f1(xb)} ${f1(y + (rand() - 0.5) * 2)} `;
  }
  let rays = "";
  for (let i = -9; i <= 9; i++) {
    const u = i / 6 + (rand() - 0.5) * 0.05;
    const [xa, ya] = floor(u, 0.05);
    const [xb, yb] = floor(u, 0.98);
    rays += `M${f1(xa)} ${f1(ya)} L${f1(xb)} ${f1(yb)} `;
  }
  return { rows, rays };
})();

/** Soot: the floor is not uniformly black; it is smeared where feet and ladles went. */
const SMEARS = (() => {
  const rand = seeded(77);
  let d = "";
  for (let i = 0; i < 70; i++) {
    const k = rand() * 0.9;
    const u = (rand() - 0.5) * 2.4;
    const [x, y] = floor(u, k);
    const w = (30 + rand() * 120) * (1 - k) + 6;
    const h = w * (0.12 + rand() * 0.1);
    d += `M${f1(x - w)} ${f1(y)} q${f1(w * 0.5)} ${f1(-h)} ${f1(w * 1.1)} ${f1(-h * 0.2)} q${f1(w * 0.5)} ${f1(h * 0.8)} ${f1(w * 0.9)} ${f1(h * 0.3)} L${f1(x + w)} ${f1(y + h)} Z `;
  }
  return d;
})();

/** A ladle hanging dead on its chain: the chain, the bail, the bowl. */
function Ladle({ x, top, len, r, tilt }: { x: number; top: number; len: number; r: number; tilt: number }) {
  const links = Math.floor(len / 22);
  return (
    <g transform={`translate(${x} ${top}) rotate(${tilt})`}>
      {Array.from({ length: links }, (_, i) => (
        <ellipse key={i} className="hallow-chain" cx={0} cy={i * 22 + 11} rx={i % 2 ? 4.5 : 7} ry={11} />
      ))}
      <path className="hallow-iron" d={`M${-r * 0.9} ${len} Q0 ${len - r * 0.7} ${r * 0.9} ${len}`} strokeWidth={5} fill="none" />
      <path className="hallow-iron-fill" d={`M${-r} ${len} L${r} ${len} L${r * 0.8} ${len + r * 0.9} Q0 ${len + r * 1.25} ${-r * 0.8} ${len + r * 0.9} Z`} />
      <path className="hallow-iron-rim" d={`M${-r} ${len} L${r} ${len}`} strokeWidth={4} />
    </g>
  );
}

/** An iron column, sooted, with its base plate. */
function Column({ x, base, h, w }: { x: number; base: number; h: number; w: number }) {
  return (
    <g>
      <rect className="hallow-column" x={x - w / 2} y={base - h} width={w} height={h} />
      <rect className="hallow-column-lit" x={x - w / 2 + w * 0.12} y={base - h} width={w * 0.16} height={h} />
      <rect className="hallow-column-cap" x={x - w * 0.75} y={base - 8} width={w * 1.5} height={12} />
      <rect className="hallow-column-cap" x={x - w * 0.6} y={base - h - 6} width={w * 1.2} height={10} />
    </g>
  );
}

function HallowFoundry() {
  const near = floor(0, 0);
  return (
    <svg className="cine-bg-svg hallow-foundry" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="hallow-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07080b" />
          <stop offset="0.7" stopColor="#101319" />
          <stop offset="1" stopColor="#1a1d24" />
        </linearGradient>
        <linearGradient id="hallow-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1b1f" />
          <stop offset="0.25" stopColor="#141312" />
          <stop offset="1" stopColor="#0b0a09" />
        </linearGradient>
        <radialGradient id="hallow-furnace" cx="0.5" cy="1" r="0.7">
          <stop offset="0" stopColor="#020204" />
          <stop offset="1" stopColor="#0d1015" />
        </radialGradient>
      </defs>
      {/* the far wall, and the dark above it */}
      <rect x="-800" y="-450" width="3200" height={VY + 450} fill="url(#hallow-wall)" />
      {/* the furnace mouth, far off, nothing burning in it */}
      <path d={`M${VX - 150} ${VY + 4} V${VY - 90} Q${VX} ${VY - 190} ${VX + 150} ${VY - 90} V${VY + 4} Z`} fill="url(#hallow-furnace)" stroke="#23262c" strokeWidth={6} />
      <path d={`M${VX - 176} ${VY + 8} V${VY - 100} Q${VX} ${VY - 220} ${VX + 176} ${VY - 100} V${VY + 8}`} fill="none" stroke="#1c1f25" strokeWidth={14} />
      {/* the floor */}
      <path d={`M-800 ${VY} H2400 V1350 H-800 Z`} fill="url(#hallow-floor)" />
      <path className="hallow-joint" d={JOINTS.rows} />
      <path className="hallow-joint hallow-joint-ray" d={JOINTS.rays} />
      <path className="hallow-smear" d={SMEARS} />
      {/* the casting trench, running away on the right */}
      <path className="hallow-trench" d={`M${f1(floor(0.42, 0)[0])} ${f1(near[1] + 30)} L${f1(floor(0.42, 0.93)[0])} ${f1(floor(0, 0.93)[1])} L${f1(floor(0.5, 0.93)[0])} ${f1(floor(0, 0.93)[1])} L${f1(floor(0.62, 0)[0])} ${f1(near[1] + 30)} Z`} />
      <path className="hallow-trench-lip" d={`M${f1(floor(0.42, 0)[0])} ${f1(near[1] + 30)} L${f1(floor(0.42, 0.93)[0])} ${f1(floor(0, 0.93)[1])}`} />
      {/* slag heaped at the walls */}
      <path className="hallow-slag" d={`M-800 ${VY + 60} Q-560 ${VY - 40} -300 ${VY + 30} Q-120 ${VY + 90} -40 ${VY + 140} L-40 ${VY + 200} L-800 ${VY + 240} Z`} />
      <path className="hallow-slag" d={`M2400 ${VY + 40} Q2120 ${VY - 30} 1880 ${VY + 40} Q1740 ${VY + 100} 1680 ${VY + 160} L1700 ${VY + 220} L2400 ${VY + 230} Z`} />
      {/* iron columns */}
      <Column x={-380} base={VY + 260} h={900} w={70} />
      <Column x={220} base={VY + 120} h={720} w={46} />
      <Column x={1380} base={VY + 120} h={720} w={46} />
      <Column x={1980} base={VY + 260} h={900} w={70} />
      {/* ladles and a crucible hanging dead from the dark */}
      <Ladle x={330} top={-450} len={560} r={62} tilt={-3} />
      <Ladle x={1240} top={-450} len={460} r={48} tilt={4} />
      <Ladle x={-120} top={-450} len={700} r={96} tilt={-6} />
      <Ladle x={1720} top={-450} len={640} r={80} tilt={5} />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "hallow-foundry": HallowFoundry,
};
