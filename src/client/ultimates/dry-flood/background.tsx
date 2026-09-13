import type { ComponentType, ReactNode } from "react";
import { seeded } from "../../cinematic/vfx";
import { EDGE_PATH, FLOOR, FLOOR_START, FOOT, LIP, PIECES, RISER, RISES, TREAD, VP, edgeX } from "./weir";
import "./style.css";

/**
 * The dry spillway.
 *
 * The cistern's great stepped spillway, dry for years: a lip of dressed stone
 * with the black mouth of the culvert behind it, six steps down, and a basin
 * of cracked silt at the bottom. On the walls, above everything, the pale
 * tide-lines of every height the water ever stood at, one over another, and
 * under each one the faint drips it left. Dead weed hangs dried black off
 * every step's nose. Nothing in it is wet, and nothing in it glows: whatever
 * light there is, the fire brings.
 *
 *   dry-lip    the lip at a hand's scale: the stone's worn nose, the drop
 *              beyond it, the culvert's arch behind
 *   dry-weir   the whole spillway side-on (`weir.ts`), lip to basin
 *   dry-steps  the steps from the basin, looking up them to the lip
 *
 * The world is 1600×900; each is drawn on the 3200×1800 box around it. Flat
 * fills and stroke opacities only: the camera moves over these drawings in
 * every shot.
 */

const VAULT = "#0b0806";
const WALL = "#191109";
const JOINT = "#110b07";
const STONE = "#2a1e14";
const FACE = "#35271a";
const NOSE = "#6e573d";
const SILT = "#3b2d20";
const CRACK = "#1f160e";
const TIDE = "#cdbf9f";
const WEED = "#080504";

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      className="cine-bg-svg dry-bg"
      viewBox="-800 -450 3200 1800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Ashlar courses across a wall. */
function Courses({ x0, x1, y0, y1, h, w, stroke = JOINT }: { x0: number; x1: number; y0: number; y1: number; h: number; w: number; stroke?: string }) {
  const rows = Math.ceil((y1 - y0) / h);
  return (
    <g stroke={stroke} strokeWidth="4" fill="none">
      {Array.from({ length: rows }, (_, r) => {
        const y = y0 + r * h;
        const shift = r % 2 ? w / 2 : 0;
        const joints = Array.from({ length: Math.ceil((x1 - x0) / w) + 1 }, (_, i) => x0 + shift + i * w)
          .filter((x) => x < x1)
          .map((x) => `M${x} ${y} V${Math.min(y1, y + h)}`)
          .join(" ");
        return <path key={r} d={`M${x0} ${y} H${x1} ${joints}`} />;
      })}
    </g>
  );
}

/**
 * A tide-line: where the water stood long enough to leave its mark. A pale
 * band that wanders, thickens and thins and breaks off in places, with a
 * fainter stain above it and the odd drip run down from it.
 */
function Tide({ x0, x1, y, width, alpha, seed, drips = true, slope = 0 }: { x0: number; x1: number; y: number; width: number; alpha: number; seed: number; drips?: boolean; slope?: number }) {
  const rand = seeded(seed);
  const bands: ReactNode[] = [];
  let x = x0;
  let i = 0;
  while (x < x1) {
    const len = 80 + rand() * 260;
    const end = Math.min(x1, x + len);
    const w = width * (0.5 + rand() * 0.9);
    const a = alpha * (0.55 + rand() * 0.6);
    const yy = (at: number) => y + slope * (at - x0) + Math.sin(at * 0.011 + seed) * 5;
    const mid = (x + end) / 2;
    bands.push(
      <path
        key={i++}
        d={`M${x.toFixed(0)} ${yy(x).toFixed(1)} Q${mid.toFixed(0)} ${(yy(mid) + (rand() - 0.5) * 8).toFixed(1)} ${end.toFixed(0)} ${yy(end).toFixed(1)}`}
        fill="none"
        stroke={TIDE}
        strokeOpacity={a.toFixed(3)}
        strokeWidth={w.toFixed(1)}
        strokeLinecap="butt"
      />,
    );
    x = end + (rand() < 0.35 ? 20 + rand() * 90 : 0);
  }
  const streaks = drips
    ? Array.from({ length: Math.round((x1 - x0) / 170) }, () => {
        const sx = x0 + rand() * (x1 - x0);
        const sy = y + slope * (sx - x0);
        return `M${sx.toFixed(0)} ${(sy + width / 2).toFixed(0)} v${(8 + rand() * 38).toFixed(0)}`;
      }).join(" ")
    : "";
  return (
    <g>
      {bands}
      {drips && <path d={streaks} fill="none" stroke={TIDE} strokeOpacity={alpha * 0.3} strokeWidth={Math.max(2, width * 0.3)} strokeLinecap="round" />}
    </g>
  );
}

/** Dead weed dried black, hanging off an edge at (x, y). */
function weed(x: number, y: number, width: number, seed: number, reach = 1) {
  const rand = seeded(seed);
  return Array.from({ length: Math.round(width / 12) }, () => {
    const sx = x + rand() * width;
    const len = (14 + rand() * 40) * reach;
    const bend = (rand() - 0.5) * 18;
    return `M${sx.toFixed(0)} ${y} q${bend.toFixed(0)} ${(len * 0.5).toFixed(0)} ${(bend * 0.4).toFixed(0)} ${len.toFixed(0)}`;
  }).join(" ");
}

/** Silt, dried and cracked into plates. */
function cracks(x0: number, x1: number, y0: number, y1: number, seed: number) {
  const rand = seeded(seed);
  let d = "";
  for (let i = 0; i < ((x1 - x0) * (y1 - y0)) / 9000; i++) {
    let x = x0 + rand() * (x1 - x0);
    let y = y0 + rand() * (y1 - y0);
    d += `M${x.toFixed(0)} ${y.toFixed(0)}`;
    for (let s = 0; s < 3; s++) {
      x += (rand() - 0.5) * 120;
      y += (rand() - 0.5) * 40 * ((y - y0) / (y1 - y0) + 0.3);
      d += ` L${x.toFixed(0)} ${y.toFixed(0)}`;
    }
  }
  return d;
}

/* ── the whole spillway, side-on ─────────────────────────────────────── */

/** How high the water once stood: above it the wall is dry stone, below it stained. */
const HIGH_WATER = 336;

/**
 * Silt dried into plates: a jittered grid whose rows crowd together towards
 * the back of the basin, every crack a dark line with the lifted edge of its
 * plate caught in a paler one.
 */
function mudCracks(x0: number, x1: number, y0: number, y1: number, seed: number) {
  const rand = seeded(seed);
  const rows: number[] = [];
  for (let y = y0, j = 0; y < y1; j++) {
    rows.push(y);
    y += 16 + j * 8;
  }
  const grid = rows.map((y, j) => {
    const w = 46 + j * 20;
    return Array.from({ length: Math.ceil((x1 - x0) / w) + 2 }, (_, i) => [
      x0 + (i + (j % 2) * 0.5) * w + (rand() - 0.5) * w * 0.5,
      y + (rand() - 0.5) * (8 + j * 4),
    ]);
  });
  let dark = "";
  let lip = "";
  grid.forEach((row, j) => {
    row.forEach(([x, y], i) => {
      const right = row[i + 1];
      if (right) {
        const mx = (x + right[0]) / 2;
        const my = (y + right[1]) / 2 + (rand() - 0.5) * 6;
        dark += `M${x.toFixed(0)} ${y.toFixed(0)} L${mx.toFixed(0)} ${my.toFixed(0)} L${right[0].toFixed(0)} ${right[1].toFixed(0)} `;
        lip += `M${(x + 5).toFixed(0)} ${(y - 3).toFixed(0)} L${(right[0] - 5).toFixed(0)} ${(right[1] - 3).toFixed(0)} `;
      }
      const below = grid[j + 1];
      if (below) {
        const b = below.reduce((best, p) => (Math.abs(p[0] - x) < Math.abs(best[0] - x) ? p : best), below[0]);
        dark += `M${x.toFixed(0)} ${y.toFixed(0)} L${((x + b[0]) / 2 + (rand() - 0.5) * 10).toFixed(0)} ${((y + b[1]) / 2).toFixed(0)} L${b[0].toFixed(0)} ${b[1].toFixed(0)} `;
      }
    });
  });
  return { dark, lip };
}

function Weir() {
  const rings: [number, number, number][] = [
    [HIGH_WATER, 16, 0.6],
    [520, 6, 0.24],
    [676, 8, 0.3],
  ];
  const mud = mudCracks(FLOOR_START - 20, 2400, FLOOR + 10, 1350, 17);
  const rand = seeded(91);
  return (
    <Svg>
      <rect x="-800" y="-450" width="3200" height="1800" fill={VAULT} />
      {/* the far wall: dry stone above the highest water, stained below it */}
      <rect x="-800" y="-160" width="3200" height={HIGH_WATER + 160} fill="#3a2d21" />
      <path d="M-800 -160 H2400" stroke="#4a3a2a" strokeWidth="12" />
      <g stroke="#302419" strokeWidth="5">
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M${-640 + i * 430} -160 V${HIGH_WATER}`} />
        ))}
      </g>
      {/* below it, stained dark from years under water, and ringed where the water sat */}
      <rect x="-800" y={HIGH_WATER} width="3200" height={FLOOR - HIGH_WATER} fill="#1e1811" />
      <rect x="-800" y={HIGH_WATER} width="3200" height="90" fill="#2a2117" />
      {rings.map(([y, w, a], i) => (
        <Tide key={`ring-${y}`} x0={-800} x1={2400} y={y} width={w} alpha={a} seed={200 + i} drips={i === 0} />
      ))}
      {/* the long stains running down from the high-water line */}
      <path
        d={Array.from({ length: 34 }, () => {
          const x = -800 + rand() * 3200;
          return `M${x.toFixed(0)} ${HIGH_WATER + 6} v${(40 + rand() * 150).toFixed(0)}`;
        }).join(" ")}
        stroke={TIDE}
        strokeOpacity="0.12"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* a depth gauge painted on the wall, its numbers long worn off */}
      <g>
        <rect x="1622" y="200" width="36" height={FLOOR - 200} fill={TIDE} fillOpacity="0.14" />
        <path
          d={Array.from({ length: Math.floor((FLOOR - 206) / 30) }, (_, i) => `M1622 ${206 + i * 30} h${i % 5 === 0 ? 36 : 16}`).join(" ")}
          stroke={TIDE}
          strokeOpacity="0.5"
          strokeWidth="5"
        />
        <rect x="1614" y="190" width="52" height="12" fill="#2a2018" />
      </g>

      {/* the culvert the water came out of, behind the lip, its grate still in it */}
      <path d={`M130 ${LIP.y} V230 C130 120 470 120 470 230 V${LIP.y} Z`} fill="#060403" />
      <path d={`M112 ${LIP.y} V230 C112 100 488 100 488 230 V${LIP.y}`} fill="none" stroke="#4a3a2a" strokeWidth="20" />
      <g stroke="#2b2622" strokeWidth="11">
        {[170, 214, 258, 302, 346, 390, 434].map((x) => (
          <path key={x} d={`M${x} ${x < 200 || x > 400 ? 200 : 148} V${LIP.y - 4}`} />
        ))}
        <path d={`M130 250 H470 M130 ${LIP.y - 60} H470`} />
      </g>
      <path d={weed(150, LIP.y - 60, 300, 280, 1.2)} stroke={WEED} strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* the spillway: one mass of poured stone, its steps worn round at the nose */}
      <path d={`${EDGE_PATH} V1350 H-800 Z`} fill="#34291e" />
      {PIECES.filter((p) => p.kind === "riser").map((p, i) => (
        <g key={i}>
          <rect x={p.x0} y={p.y0} width={TREAD} height={RISER} fill="#4a3a29" />
          {/* where the water ran thinnest it left a dark skin of dead growth */}
          <path d={`M${p.x0} ${p.y0 + RISER * 0.3} Q${p.x0 + TREAD * 0.5} ${p.y0 + RISER * 0.42} ${p.x0 + TREAD} ${p.y0 + RISER * 0.34} V${p.y1} H${p.x0} Z`} fill="#1d1b0f" fillOpacity="0.75" />
          <path d={`M${p.x0 - 3} ${p.y0 + 3} H${p.x0 + TREAD}`} stroke="#9c7f58" strokeWidth="7" strokeLinecap="round" />
          <path d={weed(p.x0 - 4, p.y0 + 5, 40, 300 + i, 1.1)} stroke={WEED} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d={weed(p.x0 + 50, p.y0 + 5, 30, 320 + i, 0.8)} stroke={WEED} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      ))}
      <path d={`M-800 ${LIP.y + 3} H${LIP.x}`} stroke="#806749" strokeWidth="8" />
      <path d={weed(LIP.x - 40, LIP.y + 6, 44, 290, 1.5)} stroke={WEED} strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* the basin floor: silt dried and cracked into plates */}
      <rect x={FOOT} y={FLOOR} width={2400 - FOOT} height={1350 - FLOOR} fill="#54412d" />
      <rect x={FOOT} y={FLOOR} width={2400 - FOOT} height="8" fill="#6b5640" />
      <path d={mud.lip} stroke="#6f5a43" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d={mud.dark} stroke="#2a1d12" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* the rings of the last puddles */}
      {[
        [1990, FLOOR + 70, 150],
        [1380, FLOOR + 200, 220],
      ].map(([x, y, r]) => (
        <ellipse key={x} cx={x} cy={y} rx={r} ry={r * 0.14} fill="none" stroke={TIDE} strokeOpacity="0.3" strokeWidth="6" />
      ))}
      {/* the basin's drain, grated */}
      <g transform={`translate(1840 ${FLOOR + 58})`}>
        <path d="M-90 -18 L90 -18 L110 18 L-110 18 Z" fill="#0d0906" stroke="#4a3a2a" strokeWidth="6" />
        <path d="M-60 -18 L-70 18 M-30 -18 L-35 18 M0 -18 V18 M30 -18 L35 18 M60 -18 L70 18" stroke="#3a2e24" strokeWidth="7" />
      </g>
      {/* and something that was living in the water when it went */}
      <g transform={`translate(1560 ${FLOOR + 118}) rotate(-6)`} stroke={TIDE} strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M-46 0 H34" />
        <path d="M-30 0 l-6 -12 M-30 0 l-6 12 M-14 0 l-6 -14 M-14 0 l-6 14 M2 0 l-6 -14 M2 0 l-6 14 M18 0 l-5 -11 M18 0 l-5 11" />
        <path d="M34 -12 L56 0 L34 12 Z" />
        <path d="M-46 0 l-14 -12 M-46 0 l-14 12" />
      </g>
    </Svg>
  );
}

/* ── the lip, at a hand's scale ──────────────────────────────────────── */

/** The lip's top, where the Arcanist stands, and its worn nose over the drop. */
const TOP = 760;
const NOSE_X = 1010;

function Lip() {
  return (
    <Svg>
      <rect x="-800" y="-450" width="3200" height="1800" fill={VAULT} />
      {/* beyond the drop: the far wall, far off, with the water's lines on it */}
      <rect x={NOSE_X - 40} y="-450" width={2400 - NOSE_X} height="1800" fill="#140d08" />
      {[
        [330, 5, 0.14],
        [470, 7, 0.2],
        [640, 8, 0.26],
        [880, 9, 0.3],
        [1040, 7, 0.24],
      ].map(([y, w, a], i) => (
        <Tide key={y} x0={NOSE_X - 40} x1={2400} y={y} width={w} alpha={a} seed={400 + i} slope={-0.02} />
      ))}
      {/* the steps, far below, where the fire will land */}
      <path d="M1010 1150 H1300 V1230 H1590 V1310 H1880 V1390 H2400 V1400 H1010 Z" fill="#241910" />
      <path d="M1010 1150 H1300 M1300 1230 H1590 M1590 1310 H1880" stroke="#5a442d" strokeWidth="10" />
      <path d={weed(1250, 1152, 50, 460, 1.5)} stroke={WEED} strokeWidth="6" fill="none" strokeLinecap="round" />

      {/* behind the Arcanist: the culvert's great arch, black inside */}
      <rect x="-800" y="-450" width={NOSE_X + 760} height={TOP + 450} fill={WALL} />
      <path d={`M120 ${TOP} V180 C120 -140 880 -140 880 180 V${TOP} Z`} fill="#040302" />
      <path d={`M90 ${TOP} V180 C90 -190 910 -190 910 180 V${TOP}`} fill="none" stroke="#3a2a1c" strokeWidth="34" />
      <g stroke="#140d08" strokeWidth="8">
        {[-64, -40, -16, 16, 40, 64].map((a) => {
          const r = (a * Math.PI) / 180;
          return <path key={a} d={`M${500 + Math.sin(r) * 395} ${70 - Math.cos(r) * 225} l${Math.sin(r) * 46} ${-Math.cos(r) * 46}`} />;
        })}
      </g>
      <Tide x0={-800} x1={100} y={420} width={7} alpha={0.2} seed={420} />
      <Tide x0={-800} x1={100} y={540} width={9} alpha={0.3} seed={421} />
      <Tide x0={900} x1={NOSE_X - 40} y={540} width={9} alpha={0.3} seed={422} drips={false} />
      {/* the stain the last water left, running out of the culvert and over the lip */}
      <path d={`M380 ${TOP} C420 ${TOP - 60} 760 ${TOP - 50} ${NOSE_X} ${TOP - 6} L${NOSE_X} ${TOP} Z`} fill={TIDE} fillOpacity="0.08" />

      {/* the lip: dressed stone, its nose worn round, the drop face below it */}
      <path d={`M-800 ${TOP} H${NOSE_X - 30} Q${NOSE_X + 8} ${TOP} ${NOSE_X + 10} ${TOP + 40} V1350 H-800 Z`} fill={STONE} />
      <path d={`M-800 ${TOP} H${NOSE_X - 30} Q${NOSE_X + 8} ${TOP} ${NOSE_X + 10} ${TOP + 40} V${TOP + 70} H-800 Z`} fill="#4d3c2a" />
      <path d={`M-800 ${TOP} H${NOSE_X - 30} Q${NOSE_X + 8} ${TOP} ${NOSE_X + 10} ${TOP + 40}`} fill="none" stroke="#9a7a52" strokeWidth="14" />
      <Courses x0={-800} x1={NOSE_X} y0={TOP + 70} y1={1350} h={140} w={420} stroke="#1c140d" />
      <path d={weed(NOSE_X - 60, TOP + 30, 90, 440, 3)} stroke={WEED} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d={`M${NOSE_X - 20} ${TOP + 80} v120 M${NOSE_X - 44} ${TOP + 70} v70`} stroke={TIDE} strokeOpacity="0.18" strokeWidth="8" strokeLinecap="round" />
    </Svg>
  );
}

/* ── the steps, from the basin, looking up ───────────────────────────── */

function Steps() {
  const rand = seeded(77);
  const sideTides = [300, 380, 450, 520, 590];
  return (
    <Svg>
      <rect x="-800" y="-450" width="3200" height="1800" fill={VAULT} />
      {/* the side walls, running away up the spillway */}
      {([-1, 1] as const).map((side) => {
        const far = RISES[RISES.length - 1];
        const nearX = side < 0 ? -800 : 2400;
        return (
          <g key={side}>
            <path d={`M${nearX} -450 L${edgeX(side, far)} -450 L${edgeX(side, far)} ${far} L${edgeX(side, 1350)} 1350 L${nearX} 1350 Z`} fill={WALL} />
            {sideTides.map((y, i) => {
              // A level line on a wall parallel to the view runs to the vanishing point.
              const x0 = nearX;
              const y0 = VP.y + (y - VP.y) * (Math.abs(x0 - VP.x) / (700 * (900 - VP.y) / (900 - VP.y)));
              const x1 = edgeX(side, far);
              const y1 = VP.y + (y - VP.y) * (Math.abs(x1 - VP.x) / 700);
              return (
                <path
                  key={y}
                  d={`M${x0} ${Math.min(1350, y0).toFixed(0)} L${x1.toFixed(0)} ${y1.toFixed(0)}`}
                  stroke={TIDE}
                  strokeOpacity={0.1 + i * 0.05}
                  strokeWidth={4 + i * 2}
                />
              );
            })}
          </g>
        );
      })}
      {/* up at the top: the lip, and the culvert's mouth above it */}
      <rect x={edgeX(-1, RISES[7])} y="-450" width={edgeX(1, RISES[7]) - edgeX(-1, RISES[7])} height={RISES[7] + 450} fill="#140d09" />
      <path d={`M${VP.x - 170} ${RISES[7]} V190 C${VP.x - 170} 90 ${VP.x + 170} 90 ${VP.x + 170} 190 V${RISES[7]} Z`} fill="#040302" />
      <path d={`M${VP.x - 186} ${RISES[7]} V190 C${VP.x - 186} 74 ${VP.x + 186} 74 ${VP.x + 186} 190 V${RISES[7]}`} fill="none" stroke="#2c2016" strokeWidth="12" />
      {/* the risers, and their noses; weed off every nose */}
      {RISES.slice(0, -1).map((bottom, i) => {
        const top = RISES[i + 1];
        const l0 = edgeX(-1, bottom);
        const r0 = edgeX(1, bottom);
        const l1 = edgeX(-1, top);
        const r1 = edgeX(1, top);
        return (
          <g key={i}>
            <path d={`M${l0} ${bottom} L${l1} ${top} L${r1} ${top} L${r0} ${bottom} Z`} fill={i % 2 ? "#3a2a1c" : "#45331f"} />
            <path d={`M${l1} ${top} L${r1} ${top}`} stroke="#8a6c48" strokeWidth={Math.max(3, 10 - i)} />
            <path d={`M${l1} ${top + 4} L${r1} ${top + 4} L${edgeX(1, top + (bottom - top) * 0.4)} ${top + (bottom - top) * 0.4} L${edgeX(-1, top + (bottom - top) * 0.4)} ${top + (bottom - top) * 0.4} Z`} fill="#000" fillOpacity="0.16" />
            <path d={weed(l1 + 20, top + 2, r1 - l1 - 40, 500 + i, 1 - i * 0.1)} stroke={WEED} strokeWidth={Math.max(2, 5 - i * 0.5)} fill="none" strokeLinecap="round" />
            <path
              d={Array.from({ length: 6 }, () => `M${(l1 + rand() * (r1 - l1)).toFixed(0)} ${top + 6} v${(8 + rand() * (bottom - top) * 0.5).toFixed(0)}`).join(" ")}
              stroke={TIDE}
              strokeOpacity="0.1"
              strokeWidth={Math.max(2, 5 - i * 0.5)}
              strokeLinecap="round"
            />
          </g>
        );
      })}
      {/* the basin floor at the camera's feet */}
      <rect x="-800" y="890" width="3200" height="460" fill={SILT} />
      <path d={cracks(-800, 2400, 900, 1340, 23)} stroke={CRACK} strokeWidth="6" fill="none" />
    </Svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "dry-lip": Lip,
  "dry-weir": Weir,
  "dry-steps": Steps,
};
