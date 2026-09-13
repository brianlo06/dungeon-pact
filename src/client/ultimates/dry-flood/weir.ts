/**
 * The dry spillway, side-on, in world units: the one geometry the drawing
 * (`background.tsx`) and the fire that runs down it (`vfx.tsx`) share.
 *
 * A lip at the top, six steps down, and the basin floor. The fire's path is
 * measured along the steps' edge: down a riser, along a tread, down the
 * next, so a distance along it is a place on the stone.
 */

export const LIP = { x: 560, y: 330 };
export const TREAD = 90;
export const RISER = 80;
export const STEPS = 6;
/** The basin floor, where the row stands. */
export const FLOOR = LIP.y + STEPS * RISER;
/** Where the last tread meets the floor. */
export const FOOT = LIP.x + (STEPS - 1) * TREAD;
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

/** A point on the steps' edge, `d` units from the lip. Past the end, along the floor. */
export function along(d: number) {
  if (d <= 0) return { x: LIP.x, y: LIP.y };
  if (d >= LENGTH) return { x: FOOT + TREAD + (d - LENGTH), y: FLOOR };
  const piece = PIECES.find((p) => {
    const len = p.kind === "riser" ? RISER : TREAD;
    return d >= p.d && d <= p.d + len;
  })!;
  const len = piece.kind === "riser" ? RISER : TREAD;
  const k = (d - piece.d) / len;
  return { x: piece.x0 + (piece.x1 - piece.x0) * k, y: piece.y0 + (piece.y1 - piece.y0) * k };
}

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
