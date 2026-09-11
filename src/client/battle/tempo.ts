/**
 * Global presentation tempo.
 *
 * One multiplier that every timed presentation reads: the beat director's
 * holds, the animation player's clips, and the boss entrance. It exists for
 * capture and inspection — a 720ms chain effect is impossible to photograph at
 * full speed — and it is read from the document so the Battle Lab can set it
 * from a query string without threading a prop through everything.
 *
 * It never reaches gameplay. Slowing presentation down does not slow the
 * engine, because the engine has already resolved the round.
 */
export function tempo(): number {
  if (typeof document === "undefined") return 1;
  const raw = Number(document.documentElement.dataset.tempo);
  return Number.isFinite(raw) && raw > 0 ? Math.min(4, Math.max(0.1, raw)) : 1;
}

/** Scale a duration by the current tempo. Lower tempo means longer. */
export const scaled = (ms: number) => ms / tempo();
