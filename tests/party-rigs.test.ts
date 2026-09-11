import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PARTY_RIGS } from "../src/client/battle/rigs-party";
import { rigFor } from "../src/client/battle/rigs";
import { sample } from "../src/client/battle/animation";
import { castClip } from "../src/client/battle/hero-clips";
import { heroes } from "../src/content/heroes";
import type { Beat, Snapshot } from "../src/shared/model";

/**
 * The party's rigs.
 *
 * The animator has no idea which side a unit is on: it writes a pose's x and
 * rotation straight onto the combatant. Heroes stand on the left facing
 * right, so a strike has to travel +x and a recoil −x. The Vanguard's first
 * rig got the recoil backwards and lurched at whatever had just hit it; these
 * hold every hero to the direction they face.
 */

const CLIPS = [
  "idle",
  "attack",
  "signature",
  "cast",
  "block",
  "hurt",
  "down",
  "revive",
  "defeat",
] as const;

/** The root pose at the moment of largest horizontal displacement. */
function peakX(rig: (typeof PARTY_RIGS)[string], clip: keyof typeof rig) {
  const c = rig[clip]!;
  let best = 0;
  for (let i = 0; i <= 400; i++) {
    const x = sample(c, i / 400).x;
    if (Math.abs(x) > Math.abs(best)) best = x;
  }
  return best;
}

const source = (id: string) =>
  readFileSync(
    new URL(
      `../src/client/components/heroes/${id[0].toUpperCase()}${id.slice(1)}.tsx`,
      import.meta.url,
    ),
    "utf8",
  );

describe("every hero is rigged", () => {
  it("covers the whole party, and the game reaches the rigs by spriteSet", () => {
    for (const h of heroes) {
      expect(h.presentation?.spriteSet, h.id).toBe(h.id);
      expect(PARTY_RIGS[h.id], h.id).toBeDefined();
      expect(rigFor(h.id), h.id).toBe(PARTY_RIGS[h.id]);
    }
  });

  for (const [id, rig] of Object.entries(PARTY_RIGS)) {
    describe(id, () => {
      it("has every clip the director and the combatant ask a hero for", () => {
        for (const clip of CLIPS) expect(rig[clip], clip).toBeDefined();
        expect(rig.idle!.loop).toBe(true);
        expect(rig.idle!.interruptible).toBe(true);
        // A hero is downed, not destroyed: the director's fall is the same.
        expect(rig.defeat).toBe(rig.down);
      });

      it("strikes towards the enemy and recoils away from it", () => {
        expect(peakX(rig, "attack"), "attack").toBeGreaterThan(0);
        expect(peakX(rig, "signature"), "signature").toBeGreaterThan(0);
        expect(peakX(rig, "hurt"), "hurt").toBeLessThan(0);
        // ...and the recoil is visible: heroes are not bosses.
        expect(Math.abs(peakX(rig, "hurt"))).toBeGreaterThanOrEqual(0.08);
      });

      it("falls backwards, away from the enemy line", () => {
        const end = sample(rig.down!, 1);
        expect(end.rotate).toBeLessThan(-45);
      });

      it("drives parts the art actually has, in every clip", () => {
        const drawn = new Set(
          [...source(id).matchAll(/data-part="(\w+)"/g)].map((m) => m[1]),
        );
        expect(drawn.size).toBeGreaterThanOrEqual(4);
        for (const [clip, c] of Object.entries(rig))
          for (const part of Object.keys(c!.parts ?? {}))
            expect(drawn.has(part), `${clip} → ${part}`).toBe(true);
        // Several parts move even when it is only standing there.
        expect(
          Object.keys(rig.idle!.parts ?? {}).length,
        ).toBeGreaterThanOrEqual(4);
      });

      it("never relies on flash inside a part, which only the root can show", () => {
        for (const [clip, c] of Object.entries(rig))
          for (const [part, track] of Object.entries(c!.parts ?? {}))
            for (const pose of track)
              expect(pose.flash, `${clip} → ${part}`).toBeUndefined();
      });

      it("loops its idle without a seam", () => {
        const idle = rig.idle!;
        for (const track of [idle.poses, ...Object.values(idle.parts ?? {})]) {
          const first = track[0];
          const last = track[track.length - 1];
          expect(first.at).toBe(0);
          expect(last.at).toBe(1);
          for (const key of ["x", "y", "rotate", "scale", "squash"] as const)
            expect(last[key] ?? 0, key).toBeCloseTo(first[key] ?? 0, 5);
        }
      });
    });
  }

  it("never breathes in step: every hero's idle has its own period", () => {
    const periods = Object.values(PARTY_RIGS).map((r) => r.idle!.duration);
    expect(new Set(periods).size).toBe(periods.length);
  });
});

describe("a hero's action picks its clip from the ability's shape", () => {
  const snap = (heroId: string) =>
    ({
      combatVersion: 2,
      players: [
        { id: "p0", heroId, items: [], upgrades: [] },
        { id: "p1", heroId: "vanguard", items: [], upgrades: [] },
      ],
      enemies: [{ id: "e0" }],
    }) as unknown as Snapshot;
  const cast = (heroId: string, label: string, target: string): Beat => ({
    kind: "cast",
    actor: "p0",
    target,
    label,
  });

  it("strikes, signatures, casts and braces", () => {
    expect(
      castClip(snap("vanguard"), cast("vanguard", "Shieldbreaker", "e0")),
    ).toBe("attack");
    expect(
      castClip(snap("vanguard"), cast("vanguard", "Foundry slam", "e0")),
    ).toBe("signature");
    expect(
      castClip(snap("warden"), cast("warden", "Mending roots", "p1")),
    ).toBe("cast");
    expect(
      castClip(snap("arcanist"), cast("arcanist", "Cloudburst", "e0")),
    ).toBe("cast");
    expect(castClip(snap("reaver"), cast("reaver", "Blood price", "e0"))).toBe(
      "signature",
    );
    expect(castClip(snap("ranger"), cast("ranger", "Brace", "p0"))).toBe(
      "block",
    );
  });

  it("leaves enemies and anything unidentified on attack", () => {
    const s = snap("warden");
    expect(
      castClip(s, { kind: "cast", actor: "e0", target: "p0", label: "Bite" }),
    ).toBe("attack");
    expect(castClip(null, cast("warden", "Thorn lash", "e0"))).toBe("attack");
    // A spent supply is gone from the list; its target still tells the side.
    expect(castClip(s, cast("warden", "Field dressing", "p1"))).toBe("cast");
  });
});
