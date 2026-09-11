import type { Beat } from "../../shared/model";

/**
 * How long each beat of a replayed round holds the stage.
 *
 * Every beat has a natural length, which is what a short round plays at, and
 * a floor, the least it can be given and still be read. A round whose natural
 * lengths add up to more than `REPLAY_CAP` is squeezed towards its floors, all
 * beats by the same share of their slack, until it fits. The floors are never
 * crossed: a round too busy to fit the cap at its floors runs at its floors,
 * longer than the cap, rather than playing faster than anyone can follow.
 *
 * The first version of the replay had a cap and the director that replaced it
 * did not, so a four-hero boss round ran for ten seconds.
 *
 * What makes each floor:
 *
 *  - **A move** names itself in a callout that is gone at the next beat, and
 *    the actor's strike has to land before its hit does. Authored strikes
 *    reach contact about halfway through: 260–460ms for the party's and the
 *    creatures' ordinary moves. The callout's slam takes 420ms to settle.
 *  - **A signature** is the round's headline and the longest strike on the
 *    field — the Collector's key lands about 600ms in — so it is barely
 *    squeezed at all, and its natural length waits for the landing.
 *  - **The first hit of a move** is the impact: the flinch, the number, the
 *    bar dropping. Anything after it in the same move — the second target of
 *    a row attack, thorns answering a strike — lands on a stage already
 *    looking at that move, and its number stays up long after its beat, so it
 *    only needs to be distinct. So does a beat that changed nothing, like a
 *    heal of zero.
 *  - **A banner** — SEIZED, INTERRUPTED, a hero going down — is one word or
 *    two that vanish at the next beat, and needs the time to read them.
 */

/** The longest a replay runs, at 1× with no capture tempo, when floors allow. */
export const REPLAY_CAP = 6000;

interface Span {
  natural: number;
  floor: number;
}

/** Hit-stop, by how hard the hit landed. Subtle on purpose. */
export const hitStop = (amount: number) =>
  amount >= 30 ? 120 : amount >= 18 ? 75 : amount > 0 ? 40 : 0;

const MOVE: Span = { natural: 520, floor: 400 };
const SIGNATURE: Span = { natural: 620, floor: 580 };
const BANNER: Record<"combo" | "defeat", Span> = {
  combo: { natural: 760, floor: 480 },
  defeat: { natural: 620, floor: 480 },
};
const NATURAL = { damage: 420, heal: 420, block: 340 } as const;
const IMPACT_FLOOR = 220;
const FOLLOW_FLOOR = 100;

export interface PaceOptions {
  /** Defaults to `REPLAY_CAP`. */
  cap?: number;
  /** Whether a cast beat is its actor's signature move. */
  signature?: (beat: Beat) => boolean;
}

/** Each beat's natural length and floor, in order. */
export function spans(beats: Beat[], opts: PaceOptions = {}): Span[] {
  let struck = false;
  return beats.map((beat) => {
    switch (beat.kind) {
      case "cast":
        struck = false;
        return opts.signature?.(beat) ? SIGNATURE : MOVE;
      case "combo":
      case "defeat":
        return BANNER[beat.kind];
      default: {
        const natural =
          NATURAL[beat.kind] +
          (beat.kind === "damage" ? hitStop(beat.amount ?? 0) : 0);
        const lands = !!beat.amount && !struck;
        if (beat.amount) struck = true;
        return { natural, floor: lands ? IMPACT_FLOOR : FOLLOW_FLOOR };
      }
    }
  });
}

/**
 * How long each beat holds, in unscaled milliseconds: the natural lengths if
 * they fit the cap, squeezed evenly towards the floors if they do not.
 */
export function paceRound(beats: Beat[], opts: PaceOptions = {}): number[] {
  const cap = opts.cap ?? REPLAY_CAP;
  const all = spans(beats, opts);
  const natural = all.reduce((n, s) => n + s.natural, 0);
  if (natural <= cap) return all.map((s) => s.natural);
  const floor = all.reduce((n, s) => n + s.floor, 0);
  if (floor >= cap) return all.map((s) => s.floor);
  const k = (cap - floor) / (natural - floor);
  return all.map((s) => s.floor + (s.natural - s.floor) * k);
}
