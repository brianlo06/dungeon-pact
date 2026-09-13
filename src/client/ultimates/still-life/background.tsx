import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import { block, FLOOR, STONES } from "./stones";
import "./style.css";

/**
 * The held fall.
 *
 * A dungeon chamber at the instant its roof gave way, stopped. The vault's
 * blocks hang in the air at every height, each with the faint stepped
 * outlines above it of where it was a moment before, the way a still of a
 * falling thing shows it; a pillar on the left is toppling and does not
 * arrive; dust hangs as points. The floor is dark and clear, and across it
 * lies one pale band of light, the light a still is taken in.
 *
 * `still-fall` is the chamber with the roof hanging; `still-fallen` is the
 * same chamber once time has started again, its stones down on the far floor
 * (the impact's `still-fall` effect drops them from one to the other).
 *
 * The world is 1600×900; this is drawn on the 3200×1800 box around it. Flat
 * fills and stroke opacities only: the camera moves over this drawing in
 * every shot, and a group's opacity or a box-sized gradient would be an
 * offscreen raster every frame.
 */

const WALL = "#0c0b18";
const JOINT = "#1b1930";
const STONE = "#16142a";
const FACE = "#221f3b";
const EDGE = "#34304f";
const AMBER = "#ffb870";
const STILL = "#e6e1f6";

function Chamber({ fallen }: { fallen: boolean }) {
  const rand = seeded(311);
  const dust = Array.from({ length: 70 }, () => [
    -700 + rand() * 3000,
    -380 + rand() * 1000,
    1.5 + rand() * 3.5,
    0.12 + rand() * 0.3,
  ]);
  return (
    <svg
      className="cine-bg-svg still-bg"
      viewBox="-800 -450 3200 1800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect x="-800" y="-450" width="3200" height="1800" fill={WALL} />
      {/* the back wall's courses, and the broken edge of the vault above them */}
      <g stroke={JOINT} strokeWidth="5" fill="none">
        {Array.from({ length: 9 }, (_, row) => {
          const y = 600 - row * 95;
          const shift = row % 2 ? 90 : 0;
          const joints = Array.from({ length: 19 }, (_, i) => -800 + shift + i * 180)
            .map((x) => `M${x} ${y} V${y - 95}`)
            .join(" ");
          return <path key={row} d={`M-800 ${y} H2400 ${joints}`} />;
        })}
      </g>
      {/* the great arch in the back wall, and the dark through it */}
      <path d="M470 600 V260 C470 40 1130 40 1130 260 V600 Z" fill="#06050c" />
      <path d="M470 600 V260 C470 40 1130 40 1130 260 V600" fill="none" stroke={EDGE} strokeWidth="10" />
      <path d="M520 600 V270 C520 100 1080 100 1080 270 V600" fill="none" stroke={STILL} strokeOpacity="0.06" strokeWidth="4" />
      {/* where the roof broke: a ragged black opening across the top */}
      <path
        d="M-800 -450 H2400 V-250 L2200 -300 L2010 -205 L1800 -290 L1560 -180 L1330 -270 L1100 -150 L860 -250 L620 -160 L380 -265 L150 -175 L-80 -280 L-330 -190 L-560 -300 L-800 -230 Z"
        fill="#040309"
      />
      <path
        d="M2400 -250 L2200 -300 L2010 -205 L1800 -290 L1560 -180 L1330 -270 L1100 -150 L860 -250 L620 -160 L380 -265 L150 -175 L-80 -280 L-330 -190 L-560 -300 L-800 -230"
        fill="none"
        stroke={EDGE}
        strokeWidth="7"
      />

      {/* the floor */}
      <rect x="-800" y={FLOOR - 40} width="3200" height={1800} fill="#08070f" />
      <path d={`M-800 ${FLOOR - 40} H2400`} stroke={EDGE} strokeWidth="6" />
      {/* the still-light: one pale band laid across the floor */}
      <rect x="-800" y={FLOOR + 110} width="3200" height="150" fill={STILL} fillOpacity="0.045" />
      <rect x="-800" y={FLOOR + 150} width="3200" height="70" fill={STILL} fillOpacity="0.05" />
      <path d={`M-800 ${FLOOR + 185} H2400`} stroke={STILL} strokeOpacity="0.1" strokeWidth="3" />
      {/* flagstone joints running away */}
      <g stroke={JOINT} strokeWidth="4">
        {Array.from({ length: 16 }, (_, i) => {
          const x = -800 + i * 220;
          return <path key={i} d={`M${x} ${FLOOR - 40} L${800 + (x - 800) * 2.6} 1350`} />;
        })}
        {[FLOOR + 30, FLOOR + 120, FLOOR + 260, FLOOR + 480].map((y) => (
          <path key={y} d={`M-800 ${y} H2400`} />
        ))}
      </g>

      {/* the toppling pillar, on the left, stopped at a lean */}
      <g transform={`translate(-60 ${FLOOR - 30}) rotate(${fallen ? -74 : -19})`}>
        {!fallen &&
          [3, 2, 1].map((k) => (
            <path
              key={k}
              d="M-70 0 V-760 H70 V0"
              fill="none"
              stroke={AMBER}
              strokeOpacity={0.05 * (4 - k)}
              strokeWidth="4"
              transform={`rotate(${k * 3.2} 0 0)`}
            />
          ))}
        <rect x="-70" y="-760" width="140" height="760" fill={STONE} stroke={EDGE} strokeWidth="8" />
        <rect x="-86" y="-790" width="172" height="44" fill={FACE} stroke={EDGE} strokeWidth="8" />
        <path d="M-70 -520 H70 M-70 -270 H70" stroke={JOINT} strokeWidth="6" />
      </g>

      {/* the roof's stones: hanging, with where they were a moment before */}
      {STONES.map((s, i) => {
        const d = block(s, 40 + i);
        if (fallen)
          return (
            <g key={i} transform={`translate(${s.lx.toFixed(0)} ${s.ly.toFixed(0)}) rotate(${s.lr.toFixed(1)}) scale(0.8 0.7)`}>
              <path d={d} fill={STONE} stroke={EDGE} strokeWidth="6" />
            </g>
          );
        return (
          <g key={i} transform={`translate(${s.x.toFixed(0)} ${s.y.toFixed(0)})`}>
            {[3, 2, 1].map((k) => (
              <path
                key={k}
                d={d}
                transform={`translate(0 ${(-k * s.h * 0.34).toFixed(1)}) rotate(${(s.r - k * 4).toFixed(1)})`}
                fill="none"
                stroke={AMBER}
                strokeOpacity={(0.06 * (4 - k)).toFixed(2)}
                strokeWidth="3"
              />
            ))}
            <path d={d} transform={`rotate(${s.r.toFixed(1)})`} fill={STONE} stroke={EDGE} strokeWidth="6" />
            <path
              d={`M${(-s.w * 0.42).toFixed(1)} ${(-s.h * 0.32).toFixed(1)} H${(s.w * 0.38).toFixed(1)}`}
              transform={`rotate(${s.r.toFixed(1)})`}
              stroke={FACE}
              strokeWidth="7"
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {/* the dust, hanging */}
      {!fallen &&
        dust.map(([x, y, r, o], i) => (
          <circle key={i} cx={x.toFixed(0)} cy={y.toFixed(0)} r={r.toFixed(1)} fill={STILL} fillOpacity={o.toFixed(2)} />
        ))}
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "still-fall": () => <Chamber fallen={false} />,
  "still-fallen": () => <Chamber fallen />,
};
