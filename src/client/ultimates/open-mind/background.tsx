import type { ComponentType } from "react";
import "./style.css";

/**
 * The floor of the thinking.
 *
 * A black plain paved to the horizon with one vast labyrinth, seen low and
 * from the side, so its rings run out as long flat ellipses under whoever
 * stands on it. Each wall is a pale violet line with a dark face under it,
 * the way a wall cut into paper has a shadow. A black sky, a low green haze
 * along the horizon where the Mindflayer's gaze is coming from, and a few
 * half-formed thoughts hanging over the floor: little unfinished spirals.
 * Nothing is lit but the walls. It is the inside of a head, and there is no
 * glass in it.
 *
 * The world is 1600×900; this is drawn on the 3200×1800 box around it. The
 * labyrinth's centre lies under the enemy line's usual ground (x 980, y 790),
 * so the figures stand in its inner rings.
 */

const CX = 980;
const CY = 790;
/** Perspective squash of the floor. */
const SQ = 0.2;
const RADII = [120, 230, 360, 510, 690, 900, 1150, 1440, 1780];

/** Door angles per ring, fixed. Radians, 0 is towards the viewer's right. */
const DOORS = [1.1, 4.2, 2.3, 5.6, 0.4, 3.3, 5.0, 1.9, 4.6];

function ring(r: number, door: number, w: number) {
  const a = door + w / 2;
  const b = door + Math.PI * 2 - w / 2;
  const p = (t: number) => `${(CX + r * Math.cos(t)).toFixed(0)} ${(CY + r * SQ * Math.sin(t)).toFixed(0)}`;
  return `M${p(a)} A${r} ${(r * SQ).toFixed(1)} 0 1 1 ${p(b)}`;
}

function spokes(i: number) {
  const inner = RADII[i - 1];
  const outer = RADII[i];
  return [0.7, 2.6, 4.4]
    .map((t, j) => t + i * 0.9 + j * 0.3)
    .map((t) => {
      const a = `${(CX + inner * Math.cos(t)).toFixed(0)} ${(CY + inner * SQ * Math.sin(t)).toFixed(0)}`;
      const b = `${(CX + outer * Math.cos(t)).toFixed(0)} ${(CY + outer * SQ * Math.sin(t)).toFixed(0)}`;
      return `M${a} L${b}`;
    })
    .join(" ");
}

/** Half-formed thoughts: short open spirals, drifting up off the floor. */
const THOUGHTS = [
  [240, 420, 0.9],
  [520, 300, 0.6],
  [760, 470, 0.7],
  [1320, 330, 0.8],
  [1560, 450, 0.5],
  [1880, 280, 0.9],
  [-80, 300, 0.7],
  [1080, 180, 0.5],
] as const;
function spiral(s: number) {
  let d = "";
  for (let t = 0; t <= Math.PI * 3.2; t += 0.35) {
    const r = (2 + t * 3.2) * s;
    d += `${d ? "L" : "M"}${(r * Math.cos(t)).toFixed(1)} ${(r * Math.sin(t)).toFixed(1)} `;
  }
  return d;
}

function FloorOfTheThinking() {
  return (
    <svg
      className="cine-bg-svg mind-bg"
      viewBox="-800 -450 3200 1800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="mind-haze" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#c7f06a" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#8fb04a" stopOpacity="0.07" />
          <stop offset="1" stopColor="#8fb04a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mind-pool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#b7a9cf" stopOpacity="0.12" />
          <stop offset="1" stopColor="#b7a9cf" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/*
        Flat fills, not gradients across the whole box: the camera zooms over
        this drawing in two shots, and a gradient the size of the box is
        re-rasterised with it every frame. The shot's own vignette darkens
        the edges instead.
      */}
      <rect x="-800" y="-450" width="3200" height="1800" fill="#040308" />
      <rect x="-800" y="350" width="3200" height="1000" fill="#0a0812" />
      {/* the haze where the gaze comes from, low on the horizon, left of centre */}
      <ellipse cx="200" cy="360" rx="1500" ry="240" fill="url(#mind-haze)" />

      {/* the labyrinth: a dark face under each wall, then the wall's edge */}
      <g className="mind-bg-floor">
        <ellipse cx={CX} cy={CY} rx="900" ry="200" fill="url(#mind-pool)" />
        {RADII.map((r, i) => {
          const w = Math.min(0.5, 60 / r);
          const d = ring(r, DOORS[i], w) + (i ? ` ${spokes(i)}` : "");
          const far = (i / RADII.length) ** 0.8;
          // Opacity on the strokes, never on a group: a group's opacity is
          // an offscreen layer the size of the whole floor, every raster.
          return (
            <g key={r}>
              <path d={d} fill="none" stroke="#030206" strokeOpacity={(1 - far * 0.55).toFixed(2)} strokeWidth={14 - far * 8} transform={`translate(0 ${(9 - far * 6).toFixed(1)})`} strokeLinecap="round" />
              <path d={d} fill="none" stroke="#b7a9cf" strokeOpacity={((0.5 - far * 0.3) * (1 - far * 0.75)).toFixed(2)} strokeWidth={4.5 - far * 2.5} strokeLinecap="round" />
            </g>
          );
        })}
      </g>
      <path d="M-800 350 H2400" stroke="#c7f06a" strokeOpacity="0.08" strokeWidth="3" />

      {/* Held still: anything moving inside this drawing re-rasterises all of it. */}
      {THOUGHTS.map(([x, y, s], i) => (
        <path
          key={i}
          d={spiral(s * 2.2)}
          transform={`translate(${x} ${y})`}
          fill="none"
          stroke="#b7a9cf"
          strokeOpacity={0.12 + (i % 3) * 0.05}
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "mind-floor": FloorOfTheThinking,
};
