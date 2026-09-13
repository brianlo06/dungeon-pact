import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Green Reckoning's space: the ground under the fight.
 *
 * The floor is a line — world y 430 — and the frame is cut through it. Above
 * the line, black air under the arches of roots too old to have a tree left on
 * them, with moss hanging off them. Below the line, the ground itself: loam,
 * which the film's own soil (`green-soil`, drawn in front of the figures so
 * their feet are in it) covers wherever a shot looks under the floor.
 *
 * Drawn on the 3200×1800 box of the other backgrounds. Nothing moves in it:
 * a moving part of a background this size re-rasterises all of it every
 * frame. The sap light is the film's lighting, not the backdrop's.
 */

export const FLOOR = 430;

const rand = seeded(4107);

/** The great roots overhead: thick arcs from off the top of the frame to the floor. */
const ARCHES = Array.from({ length: 7 }, (_, i) => {
  const x = -700 + i * 470 + rand() * 160;
  const span = 380 + rand() * 360;
  const top = -380 + rand() * 180;
  const w = 26 + rand() * 30;
  return { x, span, top, w, far: i % 2 === 1 };
});

/** Moss and root hairs hanging from the arches. */
const HANGING = Array.from({ length: 46 }, () => ({
  x: -780 + rand() * 3160,
  y: -300 + rand() * 260,
  len: 60 + rand() * 260,
  sway: (rand() - 0.5) * 40,
  w: 2 + rand() * 5,
}));

/** Spores hanging in the air: a still field of faint points. */
const SPORES = Array.from({ length: 70 }, () => ({
  x: -780 + rand() * 3160,
  y: -300 + rand() * (FLOOR + 260),
  r: 1.5 + rand() * 3.5,
  o: 0.12 + rand() * 0.35,
}));

function Undergrowth() {
  return (
    <svg className="cine-bg-svg gr-undergrowth" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="gr-air" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#030504" />
          <stop offset="0.35" stopColor="#07100b" />
          <stop offset="0.48" stopColor="#0f2016" />
          <stop offset="0.49" stopColor="#1b140d" />
          <stop offset="1" stopColor="#0b0806" />
        </linearGradient>
        <radialGradient id="gr-haze" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#4f8a4a" stopOpacity="0.32" />
          <stop offset="0.6" stopColor="#2c4f2d" stopOpacity="0.12" />
          <stop offset="1" stopColor="#2c4f2d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#gr-air)" />
      {/* A low green haze over the floor, where the life is. */}
      <ellipse cx="800" cy={FLOOR - 40} rx="1700" ry="260" fill="url(#gr-haze)" />
      {/* Far arches, fainter. */}
      {ARCHES.map((a, i) => (
        <path
          key={i}
          className={a.far ? "gr-arch far" : "gr-arch"}
          d={`M${a.x} ${FLOOR + 20} C${a.x + a.span * 0.1} ${a.top} ${a.x + a.span * 0.9} ${a.top} ${a.x + a.span} ${FLOOR + 20}`}
          strokeWidth={a.far ? a.w * 0.6 : a.w}
          fill="none"
        />
      ))}
      <g className="gr-hanging">
        {HANGING.map((h, i) => (
          <path
            key={i}
            d={`M${h.x.toFixed(0)} ${h.y.toFixed(0)} q${h.sway.toFixed(0)} ${(h.len * 0.5).toFixed(0)} ${(h.sway * 0.4).toFixed(0)} ${h.len.toFixed(0)}`}
            strokeWidth={h.w.toFixed(1)}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </g>
      <g className="gr-spores">
        {SPORES.map((s, i) => (
          <circle key={i} cx={s.x.toFixed(0)} cy={s.y.toFixed(0)} r={s.r.toFixed(1)} opacity={s.o.toFixed(2)} />
        ))}
      </g>
      {/* Old standing stones at the back of the floor, black against the haze. */}
      <g className="gr-stones">
        {[-520, -120, 260, 1380, 1760, 2150].map((x, i) => (
          <path key={x} d={`M${x} ${FLOOR + 10} L${x + 18} ${FLOOR - 120 - (i % 3) * 40} Q${x + 50} ${FLOOR - 150 - (i % 3) * 40} ${x + 84} ${FLOOR - 110 - (i % 2) * 30} L${x + 96} ${FLOOR + 10} Z`} />
        ))}
      </g>
      {/* The ground itself, where nothing covers it. */}
      <rect x="-800" y={FLOOR} width="3200" height={1350 - FLOOR} fill="#0d0907" />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "green-undergrowth": () => <Undergrowth />,
};
