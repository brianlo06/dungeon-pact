import type { Beat } from "../../shared/model";

/**
 * How long a replayed round takes.
 *
 * A round used to be a list of beats, each held for a fixed time. It is now
 * choreography: actors cross the floor to strike, arrows fly, and every hit
 * is shown when the blow that caused it lands (see `choreography.ts`). What
 * pacing decides is how much of that a round may take.
 *
 * Every phase of every move has a natural length, which is what a short round
 * plays at, and a floor, the least it can be given and still be read: an
 * anticipation 150ms, an arrival 30ms, a fall's wait 170ms, a banner 480ms, a
 * run 68% of its natural time. A strike clip is never squeezed — it is the
 * art, and its contact is where the hit lands. A round whose natural length
 * is over `REPLAY_CAP` is squeezed, every phase by the same share of its
 * slack, until it fits; one too busy to fit at its floors runs at its floors,
 * longer than the cap, rather than faster than anyone can follow.
 *
 * Rounds stay tight by overlapping: an actor's return home overlaps the next
 * actor's wind-up (never its own next move), a shot's flight overlaps the
 * next wind-up, and braces start one after another's contact. Nobody is hit
 * while it is still on its way home.
 */

/**
 * The longest a replay runs, at 1× with no capture tempo, when floors allow.
 *
 * Measured, not chosen: see `docs/CHOREOGRAPHY.md`, "Pacing". Six seconds
 * held beats that played in place; crossing the floor to strike and
 * returning costs real time, and a four-hero boss round with everyone
 * striking runs about nine seconds at its floors.
 */
export const REPLAY_CAP = 9000;

/** Hit-stop, by how hard the hit landed. Subtle on purpose. */
export const hitStop = (amount: number) =>
  amount >= 30 ? 120 : amount >= 18 ? 75 : amount > 0 ? 40 : 0;

/**
 * Legacy beat spans remain exported for the pacing contract tests and for
 * consumers that only need a quick estimate. The live replay is scheduled by
 * `scheduleRound`; these values do not drive choreography.
 */
export interface Span {
  natural: number;
  floor: number;
}

export interface PaceOptions {
  cap?: number;
  signature?: (beat: Beat) => boolean;
}

const MOVE: Span = { natural: 520, floor: 400 };
const SIGNATURE: Span = { natural: 620, floor: 580 };
const BANNER: Record<"combo" | "defeat", Span> = {
  combo: { natural: 760, floor: 480 },
  defeat: { natural: 620, floor: 480 },
};
const NATURAL = { damage: 420, heal: 420, block: 340, ward: 340 } as const;

export function spans(beats: Beat[], opts: PaceOptions = {}): Span[] {
  let struck = false;
  return beats.map((beat) => {
    switch (beat.kind) {
      case "equipment":
        return { natural: 0, floor: 0 };
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
        return { natural, floor: lands ? 220 : 100 };
      }
    }
  });
}

export function paceRound(beats: Beat[], opts: PaceOptions = {}): number[] {
  const all = spans(beats, opts);
  const cap = opts.cap ?? REPLAY_CAP;
  const natural = all.reduce((n, span) => n + span.natural, 0);
  if (natural <= cap) return all.map((span) => span.natural);
  const floor = all.reduce((n, span) => n + span.floor, 0);
  if (floor >= cap) return all.map((span) => span.floor);
  const pace = (cap - floor) / (natural - floor);
  return all.map(
    (span) => span.floor + (span.natural - span.floor) * pace,
  );
}
