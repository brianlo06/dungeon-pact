import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * The Small Print's space: the policy itself.
 *
 * The film stands the party on the page. A cream sheet runs away from the lens
 * to a straight far edge, with the umber dark of the ink bottle beyond it and a
 * few more sheets' edges under it, because a policy is never one page. On it:
 * ruled lines receding in perspective, two columns of clauses in script too
 * small to read, a carbon-blue margin rule, the crease of an old fold, and
 * along the near edge the small print itself — a band of script finer still.
 * In the dark above, very faint, the engraved rosette of a certificate border.
 *
 * Drawn on the 3200×1800 box of the other backgrounds (world units: the stage
 * is 0…1600 × 0…900). The page is a plane with its vanishing point at world
 * (800, 380); its far edge is at world y 516, and a figure standing at y 800
 * is about halfway down it.
 */

export const PAPER = "#efe3c6";
export const INK = "#1d160f";
export const UMBER = "#120d09";
export const CARBON = "#8b95ff";

const VX = 800;
const HZ = 380;
const BOTTOM = 1350;
/** Depth of the page's far edge, as a fraction of the way from horizon to the lens. */
const FAR = 0.14;
const yAt = (d: number) => HZ + d * (BOTTOM - HZ);
/** A point on the page: `u` is its lateral place measured at the lens. */
const pt = (u: number, d: number) => `${(VX + u * d).toFixed(1)} ${yAt(d).toFixed(1)}`;

/** Ruled lines, closing up towards the far edge. */
const RULES = (() => {
  let d = "";
  for (let i = 0; i < 44; i++) {
    const t = FAR + (1 - FAR) * (i / 43) ** 1.6;
    d += `M${pt(-3400, t)} L${pt(3400, t)} `;
  }
  return d;
})();

/** The clauses: short strokes of script in the bands between the rules, in two columns. */
const SCRIPT = (() => {
  const rand = seeded(4141);
  let d = "";
  for (let i = 0; i < 43; i++) {
    const t0 = FAR + (1 - FAR) * (i / 43) ** 1.6;
    const t1 = FAR + (1 - FAR) * ((i + 1) / 43) ** 1.6;
    const t = t0 + (t1 - t0) * 0.62;
    for (const [from, to] of [
      [-2900, -300],
      [260, 2900],
    ]) {
      // A clause number in the margin now and then, and a short last line.
      let u = from + rand() * 60;
      const end = rand() < 0.14 ? from + (to - from) * (0.3 + rand() * 0.4) : to;
      while (u < end) {
        const len = 30 + rand() * 150;
        const lift = (t1 - t0) * (0.12 + rand() * 0.2);
        d += `M${pt(u, t)} L${pt(Math.min(end, u + len), t - lift * 0.2)} `;
        u += len + 24 + rand() * 30;
      }
    }
  }
  return d;
})();

/** The small print: the same, much finer, along the near edge of the page. */
const SMALL = (() => {
  const rand = seeded(777);
  let d = "";
  for (let row = 0; row < 16; row++) {
    const y = 1180 + row * 10;
    let x = -760 + rand() * 20;
    while (x < 2380) {
      const len = 6 + rand() * 34;
      d += `M${x.toFixed(0)} ${y} h${len.toFixed(0)} `;
      x += len + 5 + rand() * 6;
    }
  }
  return d;
})();

/** The certificate's engraved rosette, faint in the dark: a guilloche. */
export function guilloche(cx: number, cy: number, r: number, loops = 18, lines = 5, squash = 1) {
  let d = "";
  for (let k = 0; k < lines; k++) {
    const phase = (k / lines) * Math.PI * 2;
    const amp = r * (0.16 - k * 0.012);
    for (let i = 0; i <= 360; i++) {
      const a = (i / 360) * Math.PI * 2;
      const rr = r - k * r * 0.05 + amp * Math.sin(a * loops + phase);
      d += `${i ? "L" : "M"}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr * squash).toFixed(1)} `;
    }
  }
  return d;
}

const ROSETTE = guilloche(800, 120, 900, 26, 6, 0.42);

function Page() {
  const farL = pt(-3400, FAR);
  const farR = pt(3400, FAR);
  return (
    <svg className="cine-bg-svg print-page" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="print-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060403" />
          <stop offset="0.45" stopColor={UMBER} />
          <stop offset="0.53" stopColor="#23180f" />
        </linearGradient>
        <linearGradient id="print-sheet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8e7f62" />
          <stop offset="0.2" stopColor="#cdbd98" />
          <stop offset="0.6" stopColor={PAPER} />
          <stop offset="1" stopColor="#f6ecd5" />
        </linearGradient>
        <radialGradient id="print-pool" cx="0.5" cy="0.62" r="0.55">
          <stop offset="0" stopColor="#fff8e6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff8e6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#print-dark)" />
      <path className="print-page-rosette" d={ROSETTE} stroke={CARBON} />
      {/* The sheets under this one: a policy is never one page. */}
      {[26, 16, 8].map((dy, i) => (
        <path key={dy} d={`M${farL} L${farR} L2400 ${1350 + dy} L-800 ${1350 + dy} Z`} transform={`translate(${(i - 1) * 14} ${dy})`} fill={i === 2 ? "#b9a887" : "#9a8b6c"} opacity={0.9} />
      ))}
      <path d={`M${farL} L${farR} L${pt(3400, 1.4)} L${pt(-3400, 1.4)} Z`} fill="url(#print-sheet)" />
      <rect x="-800" y="380" width="3200" height="970" fill="url(#print-pool)" />
      <path className="print-page-rules" d={RULES} stroke="#8fa0c8" />
      <path className="print-page-script" d={SCRIPT} stroke={INK} />
      {/* The margin rule, in carbon, and a second, fainter, for the clause numbers. */}
      <path d={`M${pt(-3050, FAR)} L${pt(-3050, 1.4)}`} stroke={CARBON} strokeWidth="5" opacity="0.7" />
      <path d={`M${pt(-3120, FAR)} L${pt(-3120, 1.4)}`} stroke={CARBON} strokeWidth="2" opacity="0.4" />
      {/* An old fold across the sheet: a valley, lit on one side. */}
      <path d={`M${pt(-3400, 0.2)} L${pt(3400, 0.62)}`} stroke="#fffaf0" strokeWidth="7" opacity="0.5" />
      <path d={`M${pt(-3400, 0.2)} L${pt(3400, 0.62)}`} transform="translate(0 6)" stroke="#9c8a66" strokeWidth="5" opacity="0.45" />
      {/* The far edge, catching the light. */}
      <path d={`M${farL} L${farR}`} stroke="#fff6de" strokeWidth="4" opacity="0.8" />
      <path className="print-page-small" d={SMALL} stroke={INK} />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "print-page": () => <Page />,
};
