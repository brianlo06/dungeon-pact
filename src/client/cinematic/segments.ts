import type { Beat } from "../../shared/model";
import { ultimate, type UltimateDef } from "../../content/ultimates";

/**
 * A round's Ultimates, cut out of its beats.
 *
 * The engine resolves every queued Ultimate before any other action, so a
 * round that had any begins with them: each an Ultimate `cast` and everything
 * logged until the next cast. What follows is the round as the choreographer
 * already knows it, and it is played exactly as it would have been.
 */
/**
 * What a film is credited to: the name and epithet it shows, its accent, and
 * its lines. An Ultimate's definition is one; a boss intro builds its own.
 */
export interface FilmCredit {
  id: string;
  name: string;
  epithet: string;
  presentation: {
    accent?: string;
    cinematic?: string;
    voice?: { activation?: string; impact?: string; after?: string };
  };
  /** Where it happens, for a title card's heading: a boss's chamber. */
  place?: string;
}

/**
 * Everything a film plays: who calls it, what it caused, and whom it reached.
 * A boss intro is a segment with no caster, no beats, and the boss first.
 */
export interface FilmSegment {
  cast: Beat;
  def: FilmCredit;
  beats: Beat[];
  targets: string[];
}

export interface UltimateSegment extends FilmSegment {
  def: UltimateDef;
  /** Everything the Ultimate caused, in the order the engine logged it. */
  beats: Beat[];
  /** The enemies it reached, the chosen target first. */
  targets: string[];
}

export function splitUltimates(beats: Beat[]): {
  segments: UltimateSegment[];
  rest: Beat[];
} {
  const segments: UltimateSegment[] = [];
  let i = 0;
  // Anything logged before the first cast (nothing, today) stays with the round.
  const lead: Beat[] = [];
  while (i < beats.length && beats[i].kind !== "cast") lead.push(beats[i++]);
  while (i < beats.length && beats[i].kind === "cast" && beats[i].ultimate) {
    const cast = beats[i++];
    const def = ultimate(cast.ultimate);
    const own: Beat[] = [];
    while (i < beats.length && beats[i].kind !== "cast") own.push(beats[i++]);
    if (!def) continue;
    const targets: string[] = [];
    const add = (id?: string) => {
      if (id && id !== cast.actor && !targets.includes(id)) targets.push(id);
    };
    if (cast.target?.startsWith("enemy")) add(cast.target);
    for (const b of own)
      if (
        (b.kind === "damage" || b.kind === "combo" || b.kind === "defeat") &&
        b.target?.startsWith("enemy")
      )
        add(b.target);
    segments.push({ cast, def, beats: own, targets });
  }
  return { segments, rest: [...lead, ...beats.slice(i)] };
}

/** Which of a segment's beats a reveal shows. */
export function revealed(
  beats: Beat[],
  reveal: "impact" | "ward" | "all",
): Beat[] {
  if (reveal === "all") return beats;
  const ward = (b: Beat) => b.kind === "ward" || b.kind === "heal";
  return beats.filter((b) => (reveal === "ward" ? ward(b) : !ward(b)));
}

/** The damage an Ultimate did to its chosen target, for `$damage`. */
export function damageTo(seg: FilmSegment) {
  const primary = seg.targets[0];
  const total = seg.beats
    .filter((b) => b.kind === "damage" && b.actor === seg.cast.actor)
    .filter((b) => (primary ? b.target === primary : b.target !== seg.cast.actor))
    .reduce((n, b) => n + (b.amount ?? 0), 0);
  return total;
}
