import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Every Head Bowed's space: the late field.
 *
 * A cultivated field of ripe sunflowers after sundown, drilled in rows that
 * run away to a low horizon under a heavy, starless overcast, with one dull
 * rust band where the sun went down. The far field is a black mass of heads
 * against that band; the near rows are the film's own effect
 * (`bowed-field`), because they turn to follow the lantern. Nothing in the
 * background moves or glows: the lantern is the only light, and it is drawn
 * where the lantern really is.
 *
 * World y 700 is the ground the figures stand on in the wide; the furrows
 * converge on a vanishing point on the horizon (world 800, 430). Drawn on the
 * 3200×1800 box of the other backgrounds.
 */

export const HORIZON = 430;
export const VANISH = { x: 800, y: HORIZON };

/** The film's colours, shared with its effects. */
export const GOLD = "#e3ae34";
export const SEED = "#3b2412";
export const LAMP = "#ffc15a";
export const TARNISH = "#d9a13c";
export const BLIGHT = "#110d09";
export const MOULD = "#d9d4c3";
export const SOOT = "#1a1712";
export const RUST = "#5b3522";

const rand = seeded(4471);

/** The far field's heads along the horizon: small, dark, nodding every way. */
const FAR = Array.from({ length: 140 }, () => {
  const depth = rand();
  return {
    x: -800 + rand() * 3200,
    y: HORIZON + 8 + depth * 70,
    r: 4 + depth * 9,
    lean: (rand() - 0.5) * 0.8,
    h: 14 + depth * 36,
  };
}).sort((a, b) => a.y - b.y);

/** The furrows, from the near edge of the world to the vanishing point. */
const FURROWS = Array.from({ length: 29 }, (_, i) => -2600 + i * 220);

/** Low cloud: long lumpy bands, darker than the sky behind them. */
const CLOUDS = Array.from({ length: 9 }, (_, i) => ({
  y: -380 + i * 78 + rand() * 30,
  x: -800 + rand() * 400,
  lumps: Array.from({ length: 12 }, () => 20 + rand() * 50),
  o: 0.35 + rand() * 0.4,
}));

function Late() {
  const cloudPath = (c: (typeof CLOUDS)[number]) => {
    let d = `M${c.x} ${c.y}`;
    let x = c.x;
    for (const l of c.lumps) {
      x += 280;
      d += ` Q${x - 140} ${c.y - l} ${x} ${c.y}`;
    }
    return `${d} L${x} ${c.y + 40} L${c.x} ${c.y + 40} Z`;
  };
  return (
    <svg className="cine-bg-svg bowed-late" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="bowed-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d0c0a" />
          <stop offset="0.62" stopColor={SOOT} />
          <stop offset="0.8" stopColor="#2c2018" />
          <stop offset="0.9" stopColor={RUST} />
          <stop offset="1" stopColor="#6e4027" />
        </linearGradient>
        <linearGradient id="bowed-soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#15110c" />
          <stop offset="0.3" stopColor="#201810" />
          <stop offset="1" stopColor="#0c0907" />
        </linearGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height={HORIZON + 450 + 4} fill="url(#bowed-sky)" />
      <g className="bowed-clouds">
        {CLOUDS.map((c, i) => (
          <path key={i} d={cloudPath(c)} opacity={c.o.toFixed(2)} />
        ))}
      </g>
      {/* the soil, and the furrows running off to the horizon */}
      <rect x="-800" y={HORIZON} width="3200" height={1350 - HORIZON} fill="url(#bowed-soil)" />
      <g className="bowed-furrows">
        {FURROWS.map((x, i) => (
          <path key={i} d={`M${VANISH.x} ${VANISH.y} L${x} 1350`} strokeWidth={i % 2 ? 26 : 12} />
        ))}
      </g>
      {/* the far field: a black mass of heads against the rust band */}
      <path className="bowed-far-mass" d={`M-800 ${HORIZON + 6} Q800 ${HORIZON - 26} 2400 ${HORIZON + 6} L2400 ${HORIZON + 90} L-800 ${HORIZON + 90} Z`} />
      <g className="bowed-far">
        {FAR.map((f, i) => (
          <g key={i} transform={`translate(${f.x.toFixed(0)} ${f.y.toFixed(0)})`}>
            <path className="stalk" d={`M0 0 L${(f.lean * f.h * 0.4).toFixed(1)} ${(-f.h).toFixed(1)}`} strokeWidth={(1 + f.r * 0.25).toFixed(1)} />
            <ellipse className="head" cx={(f.lean * f.h * 0.4).toFixed(1)} cy={(-f.h - f.r * 0.6).toFixed(1)} rx={(f.r * 0.7).toFixed(1)} ry={f.r.toFixed(1)} transform={`rotate(${(f.lean * 40).toFixed(0)} ${(f.lean * f.h * 0.4).toFixed(1)} ${(-f.h - f.r * 0.6).toFixed(1)})`} />
          </g>
        ))}
      </g>
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "bowed-late": () => <Late />,
};
