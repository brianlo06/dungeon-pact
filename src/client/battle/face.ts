import type { Pose } from "./animation";

/**
 * Faces, for Ultimate close-ups.
 *
 * Five heroes show a face — the Ranger, Warden, Broker, Herald and Reaver —
 * and each face now has three parts a close-up can move: `brow`, `eyes` and
 * `mouth`. They are grouped from the drawing that was already there, pivot on
 * the feature's own centre, and register with the animator only inside an
 * Ultimate's copy of the figure (`CloseUpContext`), so a round never pays for
 * them.
 *
 * The drawing is cut out, not rebuilt, so an expression is made from how the
 * features move, not new art: brows lift or knit and tilt, eyes widen or
 * narrow (a lid closing is the eyes squashed, not redrawn), a mouth opens or
 * sets. These build the part tracks for a clip; mix them per shot.
 *
 * Values are in the rig's usual units: `y` in hundredths of the drawing (a
 * brow lifted 1.5 units reads at a full-screen close-up and not at all on the
 * battlefield), rotations in degrees, and sizes as scale.
 */

/** Width and height as the animator's `scale` and `squash` (x = s·q, y = s/q). */
function sized(w: number, h: number) {
  const scale = Math.sqrt(w * h);
  return { scale, squash: Math.sqrt(w / h) };
}

export interface Expression {
  /** Brow lift in drawing units; negative raises. */
  brow?: number;
  /** Brow tilt, degrees; positive drops the inner end (anger), negative lifts it (worry). */
  knit?: number;
  /** Eye opening: 1 as drawn, 0.2 nearly shut, 1.3 wide. */
  open?: number;
  /** Mouth height: 1 as drawn, 2 a shout. */
  mouth?: number;
  /** Mouth width: 1 as drawn. */
  wide?: number;
}

/** One face at one moment. */
export function expression(at: number, e: Expression) {
  const open = e.open ?? 1;
  // Eyes widen a little as they open, but close by height alone: a lid.
  const eyes = sized(open > 1 ? 1 + (open - 1) * 0.3 : 1, open);
  const mouth = sized(e.wide ?? 1, e.mouth ?? 1);
  return {
    brow: { at, y: (e.brow ?? 0) / 100, rotate: e.knit ?? 0 } as Pose,
    eyes: { at, ...eyes } as Pose,
    mouth: { at, ...mouth } as Pose,
  };
}

/**
 * Part tracks for a sequence of expressions, ready to spread into a clip's
 * `parts`: `parts: { ...face([0, calm], [0.4, fury]), head: [...] }`.
 */
export function face(...keys: [number, Expression][]) {
  const brow: Pose[] = [];
  const eyes: Pose[] = [];
  const mouth: Pose[] = [];
  for (const [at, e] of keys) {
    const x = expression(at, e);
    brow.push(x.brow);
    eyes.push(x.eyes);
    mouth.push(x.mouth);
  }
  return { brow, eyes, mouth };
}

/** A few faces worth starting from. Combine and exaggerate per character. */
export const FACES = {
  rest: {} as Expression,
  resolve: { brow: 0.6, knit: 4, open: 0.8, mouth: 0.8 } as Expression,
  fury: { brow: 1.4, knit: 12, open: 0.6, mouth: 1.9, wide: 1.1 } as Expression,
  shout: { brow: -1.2, knit: 3, open: 1.2, mouth: 2.4, wide: 1.05 } as Expression,
  shock: { brow: -2, knit: -6, open: 1.35, mouth: 1.6, wide: 0.85 } as Expression,
  focus: { brow: 0.8, knit: 6, open: 0.45, mouth: 0.9 } as Expression,
  calm: { brow: -0.4, open: 0.35, mouth: 1 } as Expression,
  grin: { brow: -0.6, knit: -2, open: 0.7, mouth: 1.3, wide: 1.25 } as Expression,
} as const;
