import { describe, expect, it } from "vitest";
import { GENERIC, rigFor } from "../src/client/battle/rigs";
import { sample, type Clip } from "../src/client/battle/animation";
import { enemies } from "../src/content/enemies";

/**
 * Rigs are authored in screen space, in the creature's own facing. The
 * animator knows nothing about sides: it writes a pose's x straight onto the
 * combatant. Enemies stand on the right facing the party, so their strikes
 * must travel towards negative x and their recoils towards positive x.
 *
 * The first three authored creatures got this backwards — written as though
 * they faced right — and every one of them lunged away from the people it was
 * attacking. This holds every authored rig, present and future, to its side.
 */

/** The furthest the root travels horizontally over a clip, sign kept. */
function extremeX(clip: Clip) {
  let best = 0;
  for (let i = 0; i <= 100; i++) {
    const { x } = sample(clip, i / 100);
    if (Math.abs(x) > Math.abs(best)) best = x;
  }
  return best;
}

const authored = enemies.filter(
  (d) =>
    d.presentation?.spriteSet && rigFor(d.presentation.spriteSet) !== GENERIC,
);

/**
 * A gun is the one honest exception: its impact pose is the kick, which drives
 * it away from what it shoots. Listed by name so that any other exception has
 * to be argued for rather than slipped in.
 */
const RECOILS_ON_FIRE = new Set(["sniper"]);

describe("enemy rigs face the party", () => {
  it("covers the creatures already drawn", () => {
    const ids = authored.map((d) => d.id);
    for (const id of [
      "collector",
      "bulwark",
      "mender",
      "stoker",
      "acolyte",
      "bellows",
      "hound",
      "miser",
      "sniper",
      "thief",
    ])
      expect(ids).toContain(id);
  });

  for (const d of authored) {
    const rig = rigFor(d.presentation!.spriteSet);
    for (const name of ["attack", "signature"] as const) {
      const clip = rig[name];
      if (clip && RECOILS_ON_FIRE.has(d.id))
        it(`${d.id} ${name} kicks back as it fires`, () => {
          expect(extremeX(clip)).toBeGreaterThan(0);
        });
      else if (clip)
        it(`${d.id} ${name} travels towards the party`, () => {
          expect(extremeX(clip)).toBeLessThan(0);
        });
    }
    if (rig.hurt)
      it(`${d.id} recoils away from the party`, () => {
        expect(extremeX(rig.hurt!)).toBeGreaterThan(0);
      });
  }
});
