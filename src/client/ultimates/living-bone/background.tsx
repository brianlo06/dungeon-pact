import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Living Bone's space: the shedding ground.
 *
 * A clearing at the end of winter under a flat white sky. A bare hedgerow
 * runs black along the far edge; the ground is dead bracken, copper and
 * rust; and lying about in it, bone-white, are old shed antlers — every
 * crown the Warden ever dropped, some with a leaf already coming off them.
 * Nothing in it moves: a moving part of a background this size re-rasterises
 * all of it every frame. The juniper light is the film's lighting.
 *
 * The ground line is world y 640; the figures stand on it and a little below
 * it, nearer the lens. Drawn on the 3200×1800 box of the other backgrounds.
 */

export const FLOOR = 640;

/** Bone, bracken, the sky and the hedge. */
export const BONE = "#ece3cf";
export const JUNIPER = "#7fc4a4";
export const BRACKEN = "#6b4a2a";
export const SKY = "#d9e4dc";
const HEDGE = "#17241d";

const rand = seeded(2211);

/** One shed antler lying on the ground: a beam and a few tines, in local units. */
export const antlerPath = (tines: number, len: number) => {
  let d = `M0 0 C${(len * 0.3).toFixed(1)} ${(-len * 0.12).toFixed(1)} ${(len * 0.7).toFixed(1)} ${(-len * 0.08).toFixed(1)} ${len.toFixed(1)} ${(len * 0.1).toFixed(1)}`;
  for (let i = 1; i <= tines; i++) {
    const x = (len * i) / (tines + 1);
    const y = -len * 0.1 * (1 - Math.abs(i / (tines + 1) - 0.5));
    d += ` M${x.toFixed(1)} ${y.toFixed(1)} L${(x + len * 0.08).toFixed(1)} ${(y - len * 0.28).toFixed(1)}`;
  }
  return d;
};

/** The crowns in the bracken: nearer ones lower and larger. */
const CROWNS = Array.from({ length: 14 }, (_, i) => {
  const depth = rand();
  return {
    x: -700 + rand() * 3000,
    y: FLOOR + 30 + depth * 330,
    len: 90 + depth * 150,
    tines: 2 + Math.floor(rand() * 3),
    rot: (rand() - 0.5) * 40 + (i % 2 ? 180 : 0),
    leaf: rand() < 0.4,
    w: 5 + depth * 6,
  };
});

/** Bracken fronds: short copper strokes leaning every way. */
const FRONDS = Array.from({ length: 150 }, () => {
  const depth = rand();
  return {
    x: -800 + rand() * 3200,
    y: FLOOR + 10 + depth * 360,
    len: 30 + depth * 90,
    lean: (rand() - 0.5) * 60,
    w: 2 + depth * 3.5,
    light: rand() < 0.35,
  };
});

/** The hedgerow: a lumpy black band along the far edge, and bare twigs off it. */
const HEDGE_TOPS = Array.from({ length: 24 }, (_, i) => ({
  x: -800 + i * 140,
  h: 70 + rand() * 110,
}));
const TWIGS = Array.from({ length: 40 }, () => ({
  x: -780 + rand() * 3160,
  y: FLOOR - 60 - rand() * 90,
  len: 40 + rand() * 120,
  lean: (rand() - 0.5) * 80,
}));

function Shedding() {
  const hedge = HEDGE_TOPS.map((h, i) => `${i ? "L" : "M"}${h.x} ${FLOOR - h.h}`).join(" ");
  return (
    <svg className="cine-bg-svg lb-shedding" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="lb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9efe9" />
          <stop offset="0.5" stopColor={SKY} />
          <stop offset="0.6" stopColor="#c9d6cc" />
        </linearGradient>
        <linearGradient id="lb-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4d3520" />
          <stop offset="0.35" stopColor={BRACKEN} />
          <stop offset="1" stopColor="#3d2916" />
        </linearGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height={FLOOR + 450} fill="url(#lb-sky)" />
      {/* the hedgerow, and bare twigs over it */}
      <g className="lb-twigs">
        {TWIGS.map((t, i) => (
          <path key={i} d={`M${t.x} ${t.y} q${t.lean * 0.3} ${-t.len * 0.5} ${t.lean} ${-t.len}`} />
        ))}
      </g>
      <path d={`${hedge} L2400 ${FLOOR - 90} L2400 ${FLOOR + 30} L-800 ${FLOOR + 30} Z`} fill={HEDGE} />
      {/* the ground */}
      <rect x="-800" y={FLOOR} width="3200" height={1350 - FLOOR} fill="url(#lb-ground)" />
      <g className="lb-fronds">
        {FRONDS.map((f, i) => (
          <path
            key={i}
            className={f.light ? "light" : undefined}
            d={`M${f.x.toFixed(0)} ${f.y.toFixed(0)} q${(f.lean * 0.4).toFixed(0)} ${(-f.len * 0.55).toFixed(0)} ${f.lean.toFixed(0)} ${(-f.len).toFixed(0)}`}
            strokeWidth={f.w.toFixed(1)}
          />
        ))}
      </g>
      {/* every crown it ever shed */}
      <g className="lb-crowns">
        {CROWNS.map((c, i) => (
          <g key={i} transform={`translate(${c.x.toFixed(0)} ${c.y.toFixed(0)}) rotate(${c.rot.toFixed(0)})`}>
            <path className="ink" d={antlerPath(c.tines, c.len)} strokeWidth={(c.w + 4).toFixed(1)} />
            <path className="bone" d={antlerPath(c.tines, c.len)} strokeWidth={c.w.toFixed(1)} />
            {c.leaf && (
              <path
                className="leaf"
                d={`M${(c.len * 0.5).toFixed(1)} ${(-c.len * 0.1).toFixed(1)} q${(c.w * 2).toFixed(1)} ${(-c.w * 3).toFixed(1)} ${(c.w * 4).toFixed(1)} ${(-c.w * 5).toFixed(1)} q${(-c.w * 0.5).toFixed(1)} ${(c.w * 3).toFixed(1)} ${(-c.w * 4).toFixed(1)} ${(c.w * 5).toFixed(1)} Z`}
              />
            )}
          </g>
        ))}
      </g>
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "bone-shedding": () => <Shedding />,
};
