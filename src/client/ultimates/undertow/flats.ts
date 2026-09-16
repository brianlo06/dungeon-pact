/**
 * The flats at the harbour mouth, in world units: the one geometry the
 * drawing (`background.tsx`) and the water that leaves it and comes back
 * (`vfx.tsx`) share.
 *
 * A three-quarter view. The shingle beach is at the left, the flats run out
 * to the right and away towards a horizon high in the picture, and the sea
 * is at the right. The sea's near edge is a line across the sand from the
 * near right to the far left; as the tide goes out that line slides right
 * and away, until the sea is a band on the horizon.
 */

/** Where the sky meets the sea. */
export const HORIZON = 440;
/** The near edge of the drawn box. */
export const NEAR = 1350;
/** Where the shingle gives way to sand. */
export const BEACH = 300;
/** Ground level for a figure standing on the flats. */
export const FLOOR = 800;

/**
 * The sea's edge at height `y`, when the ebb is `k` (0: the water round the
 * row's feet, 1: gone to the horizon). The edge runs away to the right as it
 * recedes into the picture.
 */
export function edgeX(y: number, k: number) {
  const depth = (NEAR - y) / (NEAR - HORIZON);
  const near = 690 + k * 2100;
  const far = 980 + k * 1500;
  return near + (far - near) * depth;
}

/** The sea's outline (the near edge, then the horizon) for an ebb of `k`. */
export function seaPath(k: number, wobble: (y: number) => number = () => 0) {
  const pts: string[] = [];
  for (let y = NEAR; y >= HORIZON; y -= 24) pts.push(`${edgeX(y, k) + wobble(y)} ${y}`);
  return `M${pts.join(" L")} L2400 ${HORIZON} L2400 ${NEAR} Z`;
}

/** The mooring posts, near to far: where each stands, how it leans, how tall. */
export const POSTS: { x: number; y: number; lean: number; h: number }[] = [
  { x: 560, y: 1010, lean: -7, h: 150 },
  { x: 900, y: 905, lean: 5, h: 120 },
  { x: 1240, y: 830, lean: -4, h: 100 },
  { x: 1560, y: 760, lean: 8, h: 84 },
  { x: 1860, y: 700, lean: -6, h: 70 },
  { x: 2120, y: 650, lean: 3, h: 56 },
];

/** The hull, lying on its side where the tide left it. */
export const HULL = { x: 1640, y: 740, w: 420, h: 140 };
