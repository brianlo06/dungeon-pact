import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Mourning Water's space: the mere in the hollow.
 *
 * A drowned dell at night, full to the rim with water so still it is black.
 * The far bank is a low line of weeping willows, their fronds hanging all the
 * way down into the water; near fronds hang into the top of the frame. On the
 * water, the only green left of what it took: duckweed skinning the edges, a
 * few fallen leaves floating, and long faint glints lying flat. No sky to
 * speak of, no reflections, no mist.
 *
 * Drawn on the 3200×1800 box of the other backgrounds (world units: the stage
 * is 0…1600 × 0…900). The water starts at the far bank, world y `SHORE`, and a
 * figure stands in it wherever its feet are below that; the film draws the
 * water in front of each figure's legs (`mourn-shallows`) in the same colours
 * as here. Nothing moves: a moving part of a background this size
 * re-rasterises all of it every frame.
 */

export const SHORE = 452;
/** The mere's colours, top (at the shore) to bottom: shared with the shallows. */
export const MERE = ["#12211d", "#0a1512", "#050c0b"] as const;

const rand = seeded(9241);

/** The far bank's willows: domes of hanging fronds along the shore. */
const WILLOWS = Array.from({ length: 9 }, (_, i) => {
  const x = -820 + i * 400 + rand() * 180;
  const w = 300 + rand() * 260;
  const top = SHORE - 190 - rand() * 170;
  return { x, w, top, far: i % 2 === 0 };
});

/** Each willow's fronds: strands from the crown down to the water. */
const FRONDS = WILLOWS.flatMap((t) =>
  Array.from({ length: 16 }, (_, j) => {
    const k = j / 15;
    const x = t.x + (k - 0.5) * t.w * 0.96;
    const crown = t.top + Math.pow(Math.abs(k - 0.5) * 2, 2) * (SHORE - t.top) * 0.55;
    return { x, y: crown, end: SHORE + 2 + rand() * 8, sway: (rand() - 0.5) * 26, w: 3 + rand() * 4, far: t.far };
  }),
);

/** Near fronds hanging into the top of the frame, left and right. */
const NEAR = Array.from({ length: 30 }, (_, i) => {
  const left = i % 2 === 0;
  const x = left ? -760 + rand() * 820 : 1300 + rand() * 1060;
  return { x, len: 220 + rand() * 420, sway: (rand() - 0.5) * 50, w: 5 + rand() * 7, leaves: 4 + Math.floor(rand() * 5) };
});

/** Glints lying flat on the water, denser towards the far bank. */
const GLINTS = Array.from({ length: 70 }, () => {
  const d = Math.pow(rand(), 1.8);
  const y = SHORE + 10 + d * 880;
  return { x: -780 + rand() * 3160, y, w: 20 + rand() * 120 * (0.4 + d), o: 0.05 + (1 - d) * 0.14 };
});

/** Duckweed along the edges: clusters of tiny fronds. */
const WEED = Array.from({ length: 150 }, () => {
  const edge = rand() < 0.5;
  const y = edge ? SHORE + 4 + rand() * 40 : SHORE + 60 + rand() * 820;
  const x = edge ? -780 + rand() * 3160 : rand() < 0.5 ? -780 + rand() * 700 : 1700 + rand() * 680;
  const near = (y - SHORE) / 880;
  return { x, y, r: 2 + near * 7 + rand() * 3, o: 0.25 + rand() * 0.4 };
});

/** Fallen leaves floating. */
const LEAVES = Array.from({ length: 18 }, () => {
  const y = SHORE + 40 + rand() * 820;
  const near = (y - SHORE) / 880;
  return { x: -700 + rand() * 3000, y, s: 0.6 + near * 2.2, a: rand() * 180 };
});

const leaf = (r: number) => `M0 0 Q${r} ${-r * 0.7} ${2 * r} 0 Q${r} ${r * 0.7} 0 0 Z`;

function Hollow() {
  return (
    <svg className="cine-bg-svg mourn-hollow" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="mourn-air" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#020403" />
          <stop offset="0.36" stopColor="#07100e" />
          <stop offset="0.5" stopColor="#15241f" />
        </linearGradient>
        <linearGradient id="mourn-mere" gradientUnits="userSpaceOnUse" x1="0" y1={SHORE} x2="0" y2="1350">
          <stop offset="0" stopColor={MERE[0]} />
          <stop offset="0.3" stopColor={MERE[1]} />
          <stop offset="1" stopColor={MERE[2]} />
        </linearGradient>
        <radialGradient id="mourn-pale" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#3d544c" stopOpacity="0.55" />
          <stop offset="1" stopColor="#3d544c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#mourn-air)" />
      {/* the last of the light, low over the far bank */}
      <ellipse cx="800" cy={SHORE - 70} rx="1500" ry="210" fill="url(#mourn-pale)" />

      {/* the far bank: willows, the far ones fainter */}
      <g className="mourn-willows">
        {WILLOWS.map((t, i) => (
          <path
            key={i}
            d={`M${t.x - t.w / 2} ${SHORE} C${t.x - t.w / 2} ${t.top + 60} ${t.x - t.w * 0.2} ${t.top} ${t.x} ${t.top} C${t.x + t.w * 0.2} ${t.top} ${t.x + t.w / 2} ${t.top + 60} ${t.x + t.w / 2} ${SHORE} Z`}
            fill={t.far ? "#0b1512" : "#070d0b"}
          />
        ))}
        {FRONDS.map((f, i) => (
          <path
            key={i}
            d={`M${f.x} ${f.y} C${f.x + f.sway} ${(f.y + f.end) / 2} ${f.x - f.sway * 0.5} ${f.end - 30} ${f.x + f.sway * 0.3} ${f.end}`}
            stroke={f.far ? "#1a2b22" : "#22372b"}
            strokeWidth={f.w}
            strokeLinecap="round"
            fill="none"
            opacity={f.far ? 0.7 : 0.9}
          />
        ))}
      </g>

      {/* the mere */}
      <rect x="-800" y={SHORE} width="3200" height={1350 - SHORE} fill="url(#mourn-mere)" />
      <path d={`M-800 ${SHORE} H2400`} stroke="#324a40" strokeWidth="3" opacity="0.6" />
      <g className="mourn-glints">
        {GLINTS.map((g, i) => (
          <path key={i} d={`M${g.x} ${g.y} h${g.w}`} stroke="#b9d2c6" strokeWidth={1.5 + (g.y - SHORE) / 300} strokeLinecap="round" opacity={g.o} />
        ))}
      </g>
      <g className="mourn-weed">
        {WEED.map((w, i) => (
          <ellipse key={i} cx={w.x} cy={w.y} rx={w.r} ry={w.r * 0.42} fill={i % 3 ? "#56692f" : "#7d9443"} opacity={w.o} />
        ))}
      </g>
      <g className="mourn-leaves">
        {LEAVES.map((l, i) => (
          <path
            key={i}
            d={leaf(9)}
            transform={`translate(${l.x} ${l.y}) scale(${l.s} ${l.s * 0.45}) rotate(${l.a})`}
            fill={i % 2 ? "#5d6d33" : "#7a6a33"}
            stroke="#0b0f0a"
            strokeWidth="2"
            opacity="0.75"
          />
        ))}
      </g>

      {/* near fronds, hanging into the top of the frame */}
      <g className="mourn-near">
        {NEAR.map((f, i) => {
          const d = `M${f.x} -460 C${f.x + f.sway} ${-460 + f.len * 0.4} ${f.x - f.sway * 0.4} ${-460 + f.len * 0.75} ${f.x + f.sway * 0.2} ${-460 + f.len}`;
          return (
            <g key={i}>
              <path d={d} stroke="#050907" strokeWidth={f.w + 4} strokeLinecap="round" fill="none" />
              <path d={d} stroke="#1c2d22" strokeWidth={f.w} strokeLinecap="round" fill="none" />
              {Array.from({ length: f.leaves }, (_, n) => {
                const k = (n + 1) / (f.leaves + 1);
                const y = -460 + f.len * k;
                return (
                  <path
                    key={n}
                    d={leaf(11)}
                    transform={`translate(${f.x + f.sway * 0.3 * Math.sin(k * 3)} ${y}) rotate(${n % 2 ? 70 : 110})`}
                    fill="#23392a"
                    stroke="#050907"
                    strokeWidth="2.5"
                  />
                );
              })}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "mourn-hollow": Hollow,
};
