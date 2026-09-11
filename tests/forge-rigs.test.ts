import { describe, expect, it } from "vitest";
import { FORGE_RIGS } from "../src/client/battle/rigs-forge";
import { rigFor } from "../src/client/battle/rigs";
import { sample, sampleTrack } from "../src/client/battle/animation";
import { enemies } from "../src/content/enemies";

/**
 * The foundry creatures' rigs. Enemies face the party, which is to their left,
 * so a strike has to travel towards negative x and a recoil towards positive
 * x — the opposite way round from a hero. Getting that backwards makes an
 * attack lunge away from its target.
 */
const IDS = ["stoker", "acolyte", "bellows", "hound"] as const;

/** The furthest the root travels horizontally over a clip, sign kept. */
function extremeX(id: string, clip: "attack" | "hurt") {
  const c = FORGE_RIGS[id][clip]!;
  let best = 0;
  for (let i = 0; i <= 100; i++) {
    const { x } = sample(c, i / 100);
    if (Math.abs(x) > Math.abs(best)) best = x;
  }
  return best;
}

describe("foundry rigs", () => {
  for (const id of IDS) {
    it(`${id} is registered, and its content points at it`, () => {
      expect(rigFor(id)).toBe(FORGE_RIGS[id]);
      const def = enemies.find((e) => e.id === id);
      expect(def?.presentation?.spriteSet).toBe(id);
    });

    it(`${id} has the clips the director plays, moving in pieces`, () => {
      const rig = FORGE_RIGS[id];
      expect(rig.idle?.loop).toBe(true);
      expect(rig.idle?.interruptible).toBe(true);
      for (const clip of ["idle", "attack", "hurt", "defeat"] as const) {
        const parts = Object.keys(rig[clip]?.parts ?? {});
        expect(parts.length, `${id} ${clip}`).toBeGreaterThanOrEqual(2);
      }
    });

    it(`${id} strikes towards the party and recoils away from it`, () => {
      expect(extremeX(id, "attack")).toBeLessThan(0);
      expect(extremeX(id, "hurt")).toBeGreaterThan(0);
    });
  }

  it("idle never passes through a moment where every part is at rest", () => {
    // A cutout rig whose pieces all return to rest at once reads, for that
    // instant, as a single rigid sprite — and it makes "are the parts moving
    // independently?" a coin toss for whichever random phase a unit got.
    const rest = sampleTrack([], 0);
    for (const id of IDS) {
      const tracks = Object.values(FORGE_RIGS[id].idle!.parts!);
      for (let i = 0; i < 200; i++) {
        const moving = tracks.some((track) => {
          const p = sampleTrack(track, i / 200);
          return (Object.keys(rest) as (keyof typeof rest)[]).some(
            (k) => Math.abs(p[k] - rest[k]) > 1e-3,
          );
        });
        expect(moving, `${id} at ${i / 200}`).toBe(true);
      }
    }
  });

  it("never breathe in time with one another", () => {
    const periods = IDS.map((id) => FORGE_RIGS[id].idle!.duration);
    expect(new Set(periods).size).toBe(periods.length);
  });

  it("the Hound is the quickest to act and the Bellows the slowest", () => {
    const attack = (id: string) => FORGE_RIGS[id].attack!.duration;
    const idle = (id: string) => FORGE_RIGS[id].idle!.duration;
    for (const id of IDS) {
      expect(idle("hound")).toBeLessThanOrEqual(idle(id));
      expect(idle("bellows")).toBeGreaterThanOrEqual(idle(id));
      expect(attack("hound")).toBeLessThanOrEqual(attack(id));
      expect(attack("bellows")).toBeGreaterThanOrEqual(attack(id));
    }
  });
});
