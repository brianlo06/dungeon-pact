/**
 * The dry spillway, side-on, in world units: the one geometry the drawing
 * (`background.tsx`) and the fire that runs down it (`vfx.tsx`) share.
 *
 * A lip at the top, six steps down, and the basin floor. The fire's path is
 * measured along the steps' edge: down a riser, along a tread, down the
 * next, then out across the floor, so a distance along it is a place on the
 * stone.
 */

export const LIP = { x: 540, y: 426 };
export const TREAD = 96;
export const RISER = 64;
export const STEPS = 6;
/** The basin floor, where the row stands. */
export const FLOOR = LIP.y + STEPS * RISER;
/** Where the last tread begins. */
export const FOOT = LIP.x + (STEPS - 1) * TREAD;
/** Where the last tread meets the floor. */
export const FLOOR_START = FOOT + TREAD;
/** The whole length of the steps' edge. */
export const LENGTH = STEPS * (RISER + TREAD);

export interface Piece {
  kind: "riser" | "tread";
  /** Distance along the path where this piece starts. */
  d: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export const PIECES: Piece[] = Array.from({ length: STEPS }, (_, i) => {
  const x = LIP.x + i * TREAD;
  const y = LIP.y + i * RISER;
  const d = i * (RISER + TREAD);
  return [
    { kind: "riser" as const, d, x0: x, y0: y, x1: x, y1: y + RISER },
    { kind: "tread" as const, d: d + RISER, x0: x, y0: y + RISER, x1: x + TREAD, y1: y + RISER },
  ];
}).flat();

export interface EdgePoint {
  x: number;
  y: number;
  kind: "platform" | "riser" | "tread" | "floor";
  /** How far through its piece, 0…1. */
  k: number;
}

/** A point on the steps' edge, `d` units from the lip: the platform before it, the floor after. */
export function edgeAt(d: number): EdgePoint {
  if (d < 0) return { x: LIP.x + d, y: LIP.y, kind: "platform", k: 0 };
  if (d >= LENGTH) return { x: FLOOR_START + (d - LENGTH), y: FLOOR, kind: "floor", k: 0 };
  const i = Math.floor(d / (RISER + TREAD));
  const r = d - i * (RISER + TREAD);
  const x = LIP.x + i * TREAD;
  const y = LIP.y + i * RISER;
  if (r < RISER) return { x, y: y + r, kind: "riser", k: r / RISER };
  return { x: x + (r - RISER), y: y + RISER, kind: "tread", k: (r - RISER) / TREAD };
}

/** The distance along the path of a point on the floor. */
export const floorD = (x: number) => LENGTH + (x - FLOOR_START);

/** The steps' edge as a path, from the lip platform to the floor's far end. */
export const EDGE_PATH =
  `M-800 ${LIP.y} H${LIP.x} ` +
  PIECES.map((p) => (p.kind === "riser" ? `V${p.y1}` : `H${p.x1}`)).join(" ") +
  ` H2400`;

/* The same steps from the basin, looking up them (`dry-steps`). */

/** Where the steps' lines run to. */
export const VP = { x: 800, y: 60 };
/** The risers' bottoms, from the basin up to the lip. */
export const RISES = [900, 752, 640, 552, 482, 426, 380, 344];
/** The steps' left (−1) or right (+1) side at a height: 1400 wide at y 900, narrowing to the vanishing point. */
export const edgeX = (side: -1 | 1, y: number) => VP.x + side * 700 * ((y - VP.y) / (900 - VP.y));
