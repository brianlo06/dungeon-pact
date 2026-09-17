import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Hammer Price's space: the saleroom after dark.
 *
 * A long, high auction room with its lamps out. The back wall is walnut
 * panelling to a heavy cornice, and over it a coffered ceiling with a dead
 * chandelier hanging in the middle of it; at the far right, against the wall,
 * the rostrum, a tall black lacquer pulpit with the house's sound block on its
 * desk. The floor is dark boards running away to the wall. The rows of empty
 * chairs and the paddles held up over them are not drawn here: they move, so
 * they are the effect `hammer-paddles`, laid out by `ROWS` below.
 *
 * Nothing in the room gives light but the paddles. The wall and floor are
 * drawn barely off black, so the room is only readable where a paddle is up.
 *
 * Drawn on the 3200×1800 box of the other backgrounds (world units: the stage
 * is 0…1600 × 0…900). The back wall meets the floor at world y 470; the rows
 * of chairs stand between y 480 and 760; the front of the room, where the lot
 * is shown and the Magnate stands, is bare boards from y 780 down.
 */

export const LACQUER = "#0b0709";
export const WALNUT = "#23150f";
export const CANE = "#6e5638";
export const IVORY = "#efe5cf";
export const TYRIAN = "#e05bd8";

const f1 = (x: number) => x.toFixed(1);

/** Where the back wall meets the floor. */
export const WALL_FOOT = 470;
/** The vanishing point the floorboards run to. */
const VP = { x: 800, y: 180 };

/**
 * One row of chairs: the seat line (world y), the size of a chair in it (1 is
 * the nearest row), and every chair's x with whether a paddle is up over it.
 */
export interface Row {
  y: number;
  s: number;
  /** `lift`: how far above the chair back the bidder holds the paddle, in chair units. */
  chairs: { x: number; paddle: boolean; tilt: number; lift: number }[];
}

/** The centre aisle, running from the front of the room to the rostrum. */
export const aisleAt = (y: number) => 800 + (575 - 800) * ((y - 180) / (760 - 180));

/** The rows, back to front. Shared by the background's floor and the paddles. */
export const ROWS: Row[] = (() => {
  const rand = seeded(2718);
  const rows: Row[] = [];
  const seats = [488, 522, 562, 612, 676, 752];
  const sizes = [0.36, 0.44, 0.54, 0.67, 0.83, 1.02];
  seats.forEach((y, r) => {
    const s = sizes[r];
    const gap = 60 * s;
    const aisle = aisleAt(y);
    const chairs: Row["chairs"] = [];
    // Staggered a half chair on alternate rows, so paddles do not stack.
    for (let x = -780 + (r % 2) * gap * 0.5; x < 2400; x += gap) {
      const cx = x + (rand() - 0.5) * gap * 0.12;
      const paddle = rand() < 0.8;
      const tilt = (rand() - 0.5) * 30;
      const lift = rand() ** 1.5 * 34 - 6;
      if (Math.abs(cx - aisle) < 46 * s) continue;
      chairs.push({ x: cx, paddle, tilt, lift });
    }
    rows.push({ y, s, chairs });
  });
  return rows;
})();

/** The floorboards: seams running to the far wall, and a few board ends. */
function boards() {
  const rand = seeded(99);
  let seams = "";
  for (let i = -30; i <= 30; i++) {
    const x = VP.x + i * 150;
    // From the foot of the wall, along the line to the vanishing point, to the front edge.
    const k0 = (WALL_FOOT - VP.y) / (1350 - VP.y);
    const xa = VP.x + (x - VP.x) * k0;
    seams += `M${f1(xa)} ${WALL_FOOT} L${f1(x)} 1350 `;
  }
  let ends = "";
  for (let i = 0; i < 90; i++) {
    const y = WALL_FOOT + 20 + rand() ** 1.6 * 860;
    const k = (y - VP.y) / (1350 - VP.y);
    const x = VP.x + (rand() - 0.5) * 3200 * k * 1.4;
    const w = 150 * k;
    ends += `M${f1(x)} ${f1(y)} l${f1(w * 0.12)} ${f1(-2 * k)} `;
  }
  return { seams, ends };
}

/** Panelling on the back wall: pilasters, raised panels, a dado and a cornice. */
function panelling() {
  let pilasters = "";
  let panels = "";
  for (let x = -760; x < 2400; x += 250) {
    pilasters += `M${x} 96 h34 V${WALL_FOOT} h-34 Z `;
    panels += `M${x + 64} 132 h156 v196 h-156 Z M${x + 64} 368 h156 v76 h-156 Z `;
  }
  return { pilasters, panels };
}

/** The coffers overhead, in rows getting shallower towards the wall. */
function coffers() {
  let d = "";
  const rows = [
    [-420, -300, 300],
    [-270, -170, 250],
    [-140, -60, 210],
    [-40, 30, 180],
  ];
  for (const [top, bottom, w] of rows)
    for (let x = -800; x < 2400; x += w) d += `M${x + 18} ${top} h${w - 36} V${bottom} h${-(w - 36)} Z `;
  return d;
}

/** The chandelier, dead: a ring of arms and drops on a chain, lamps out. */
function chandelier() {
  const cx = 780;
  const top = -450;
  const ring = 150;
  let frame = `M${cx} ${top} V${ring - 40} `;
  let drops = "";
  let glints = "";
  frame += `M${cx - 120} ${ring} Q${cx} ${ring + 46} ${cx + 120} ${ring} Q${cx} ${ring - 30} ${cx - 120} ${ring} Z `;
  for (let i = 0; i < 9; i++) {
    const a = (i / 8) * Math.PI;
    const x = cx - Math.cos(a) * 120;
    const y = ring + Math.sin(a) * 18;
    frame += `M${cx} ${ring - 40} Q${f1((cx + x) / 2)} ${f1(ring - 30)} ${f1(x)} ${f1(y)} `;
    drops += `M${f1(x - 5)} ${f1(y + 6)} L${f1(x)} ${f1(y + 34)} L${f1(x + 5)} ${f1(y + 6)} Z `;
    // The candle cups, cold.
    drops += `M${f1(x - 9)} ${f1(y - 4)} h18 v-12 h-18 Z `;
    if (i % 2 === 0) glints += `M${f1(x - 1.5)} ${f1(y + 16)} h3 v6 h-3 Z `;
  }
  drops += `M${cx - 12} ${ring + 30} L${cx} ${ring + 90} L${cx + 12} ${ring + 30} Z`;
  return { frame, drops, glints };
}

const BOARDS = boards();
const PANELS = panelling();
const COFFERS = coffers();
const CHANDELIER = chandelier();

function Saleroom() {
  return (
    <svg className="cine-bg-svg hammer-saleroom" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="hammer-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060405" />
          <stop offset="0.55" stopColor="#120a0b" />
          <stop offset="1" stopColor="#1a0f0e" />
        </linearGradient>
        <linearGradient id="hammer-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d120e" />
          <stop offset="0.4" stopColor="#120b09" />
          <stop offset="1" stopColor="#070405" />
        </linearGradient>
        {/* Where the paddles have lit the room over the years: a pale haze low on the wall. */}
        <radialGradient id="hammer-haze" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={IVORY} stopOpacity="0.07" />
          <stop offset="1" stopColor={IVORY} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height="1800" fill={LACQUER} />
      {/* The ceiling's coffers, and the wall. */}
      <path className="hammer-coffer" d={COFFERS} />
      <rect x="-800" y="60" width="3200" height={WALL_FOOT - 60} fill="url(#hammer-wall)" />
      <path className="hammer-panel" d={PANELS.panels} />
      <path className="hammer-pilaster" d={PANELS.pilasters} />
      <rect className="hammer-cornice" x="-800" y="60" width="3200" height="40" />
      <rect className="hammer-dado" x="-800" y="352" width="3200" height="10" />
      <ellipse cx="800" cy="440" rx="1500" ry="220" fill="url(#hammer-haze)" />
      {/* The rostrum, against the wall at the far right: the house's pulpit. */}
      <g className="hammer-rostrum">
        <path className="hammer-rostrum-body" d="M1290 470 V318 L1300 292 H1490 L1500 318 V470 Z" />
        <path className="hammer-rostrum-desk" d="M1276 300 L1296 276 H1494 L1514 300 Z" />
        <path className="hammer-rostrum-panel" d="M1318 336 H1472 V448 H1318 Z" />
        <path className="hammer-rostrum-line" d="M1330 348 H1460 V436 H1330 Z" />
        {/* The house's sound block, and no hammer on it. */}
        <path className="hammer-rostrum-block" d="M1370 276 v-12 h44 v12 Z" />
        <path className="hammer-rostrum-steps" d="M1500 470 V430 H1540 V470 Z M1540 470 V450 H1580 V470 Z" />
      </g>
      {/* The floor. */}
      <rect x="-800" y={WALL_FOOT} width="3200" height={1350 - WALL_FOOT} fill="url(#hammer-floor)" />
      <path className="hammer-seams" d={BOARDS.seams} />
      <path className="hammer-ends" d={BOARDS.ends} />
      <rect className="hammer-skirting" x="-800" y={WALL_FOOT - 14} width="3200" height="14" />
      {/* The chandelier, dead. */}
      <path className="hammer-chandelier" d={CHANDELIER.frame} />
      <path className="hammer-chandelier-drops" d={CHANDELIER.drops} />
      <path className="hammer-chandelier-glint" d={CHANDELIER.glints} />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "hammer-saleroom": () => <Saleroom />,
};
