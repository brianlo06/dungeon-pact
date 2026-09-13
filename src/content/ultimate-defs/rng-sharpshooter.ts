import type { UltimateDef } from "../ultimates";

/**
 * Ranger · Sharpshooter — "Armour is just a slower target."
 *
 * Not authored yet: until it is, this path keeps the Ranger's base
 * Ultimate. Authoring it replaces `null` with the path's own Ultimate
 * (`evolution: "rng-sharpshooter"`), whose gameplay exaggerates what the path trades
 * for — it replaces arrow with Piercing shot — and whose film is
 * in `src/content/cinematics/` with its presentation in
 * `src/client/ultimates/<id>/`. See `docs/ultimates/AUTHORING.md`.
 */
export const ultimate: UltimateDef | null = null;
