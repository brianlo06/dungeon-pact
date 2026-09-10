/** Versioned xorshift32. No clock/random access in the rules engine. */
export function hashSeed(seed: string): number {
  let n = 2166136261;
  for (const c of seed) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
  return n >>> 0 || 1;
}
export function random(state: { rng: number }): number {
  let x = state.rng;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  state.rng = x >>> 0;
  return state.rng / 4294967296;
}
export function pick<T>(state: { rng: number }, values: readonly T[]): T {
  if (!values.length) throw Error("Empty random pool");
  return values[Math.floor(random(state) * values.length)];
}
