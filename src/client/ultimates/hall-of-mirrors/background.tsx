import type { ComponentType, CSSProperties } from "react";
import "./style.css";

/**
 * The Beguiler's hall: a room made of surfaces that lie.
 *
 * A far wall of tall, narrow funhouse mirrors in tarnished frames, some of
 * them cracked, each holding a warped column of violet light; a black glass
 * floor that gives the whole wall back upside down; and a sickly green glow
 * along the floor's edge, the only warm thing in it, the colour of the
 * Beguiler's trim. Nothing here is a lantern, a forge or a sky.
 *
 * The world is 1600×900; this is drawn on the 3200×1800 box around it so a
 * rolled or pulled-back camera finds no edge. The wall stands behind the
 * actors' ground (y 700), so a figure placed at y 740–840 is on the floor in
 * front of it. The warp in each pane drifts on `--bgt`, film seconds.
 */

const FLOOR = 700;
const TOP = -60;
const PANE_W = 210;
const PANE_GAP = 46;
/** Pane centres along the far wall. */
const PANES = Array.from({ length: 13 }, (_, i) => -740 + i * (PANE_W + PANE_GAP));

/** A pane's outline: straight sides, a pointed arch like a mirror's crest. */
function paneOutline(cx: number, top: number, bottom: number, w: number) {
  const l = cx - w / 2;
  const r = cx + w / 2;
  const shoulder = top + w * 0.55;
  return `M${l} ${bottom} V${shoulder} Q${l} ${top + w * 0.12} ${cx} ${top} Q${r} ${top + w * 0.12} ${r} ${shoulder} V${bottom} Z`;
}

/** Hairline cracks in a few panes, fixed. */
const CRACKED: Record<number, string> = {
  2: "M-40 120 L-8 180 L-30 240 L10 300 M-8 180 L40 196",
  5: "M30 360 L0 420 L22 470 L-18 540 M0 420 L-50 430",
  9: "M-30 60 L6 130 L-10 200 M6 130 L50 150 L70 120",
  11: "M20 300 L-10 360 L14 420",
};

function HallOfMirrors() {
  return (
    <svg
      className="cine-bg-svg hom-bg"
      viewBox="-800 -450 3200 1800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hom-air" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#030205" />
          <stop offset="0.3" stopColor="#0d0916" />
          <stop offset="0.6" stopColor="#1a1229" />
          <stop offset="0.6" stopColor="#07050b" />
          <stop offset="1" stopColor="#020103" />
        </linearGradient>
        <linearGradient id="hom-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2b2243" />
          <stop offset="0.45" stopColor="#1a1430" />
          <stop offset="0.55" stopColor="#3a2f58" />
          <stop offset="0.62" stopColor="#1a1430" />
          <stop offset="1" stopColor="#0f0b1b" />
        </linearGradient>
        <radialGradient id="hom-warp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#b99be8" stopOpacity="0.42" />
          <stop offset="0.6" stopColor="#7a5cb0" stopOpacity="0.12" />
          <stop offset="1" stopColor="#7a5cb0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hom-reflect" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2243" stopOpacity="0.55" />
          <stop offset="1" stopColor="#2b2243" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hom-foot" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#c7f06a" stopOpacity="0.28" />
          <stop offset="1" stopColor="#c7f06a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hom-dark" cx="0.5" cy="0.62" r="0.62">
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.85" />
        </radialGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#hom-air)" />

      {/* The floor gives the wall back, upside down and fading. */}
      <g transform={`translate(0 ${FLOOR * 2}) scale(1 -1)`} opacity="0.55">
        {PANES.map((x) => (
          <path key={x} d={paneOutline(x, TOP + 260, FLOOR, PANE_W)} fill="url(#hom-reflect)" />
        ))}
      </g>

      {/* The wall: pilasters, then the panes in their frames. */}
      {PANES.map((x, i) => (
        <g key={x}>
          <rect x={x + PANE_W / 2 + 4} y={TOP - 120} width={PANE_GAP - 8} height={FLOOR - TOP + 120} fill="#0a0710" />
          <path d={paneOutline(x, TOP, FLOOR, PANE_W + 26)} fill="#1c1526" stroke="#08060c" strokeWidth="6" />
          <path d={paneOutline(x, TOP + 12, FLOOR - 6, PANE_W)} fill="url(#hom-glass)" stroke="#4a3b60" strokeWidth="4" />
          <g className="hom-bg-warp" style={{ "--i": i } as CSSProperties}>
            <ellipse cx={x} cy={FLOOR - 300 - (i % 3) * 40} rx={PANE_W * 0.34} ry={260 + (i % 2) * 70} fill="url(#hom-warp)" />
          </g>
          {CRACKED[i] && (
            <path
              d={CRACKED[i]}
              transform={`translate(${x} ${TOP})`}
              stroke="#d9c8f5"
              strokeOpacity="0.45"
              strokeWidth="2.5"
              fill="none"
            />
          )}
          {/* A finial on each frame. */}
          <path d={`M${x} ${TOP - 34} l10 16 l-10 16 l-10 -16 Z`} fill="#3a2d4d" stroke="#08060c" strokeWidth="3" />
        </g>
      ))}

      {/* The skirting, and the green footlight catching the floor's edge. */}
      <rect x="-800" y={FLOOR - 6} width="3200" height="20" fill="#120c1b" />
      <path d={`M-800 ${FLOOR + 14} H2400`} stroke="#c7f06a" strokeOpacity="0.22" strokeWidth="3" />
      <ellipse cx="800" cy={FLOOR + 40} rx="1500" ry="140" fill="url(#hom-foot)" />
      {/* The glass floor: a few long glints running to the viewer. */}
      {[-500, -120, 260, 640, 1020, 1400, 1780, 2160].map((x, i) => (
        <path
          key={x}
          d={`M${x} ${FLOOR + 20} L${800 + (x - 800) * 1.9} 1350`}
          stroke="#6f5a93"
          strokeOpacity={0.08 + (i % 2) * 0.05}
          strokeWidth="3"
        />
      ))}
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#hom-dark)" />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "hall-of-mirrors": HallOfMirrors,
};
