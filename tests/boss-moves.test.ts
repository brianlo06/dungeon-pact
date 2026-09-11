import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  castClip,
  holdsWindup,
  isSignatureMove,
} from "../src/client/battle/hero-clips";
import { Animator } from "../src/client/battle/animation";
import { GENERIC, rigFor } from "../src/client/battle/rigs";
import { enemies, tacticalIntents } from "../src/content/enemies";
import { bossFixture, type FixtureOptions } from "../src/dev/boss-fixture";
import { snapshot } from "../src/engine/game";
import type { Beat, Enemy, RunState, Snapshot } from "../src/shared/model";

/**
 * The bosses' authored `windup` and `signature` clips, and what asks for them.
 *
 * Windup is a rest state rather than a move: an enemy with an interruptible
 * move announced holds it through planning. Signature is the move it wound up
 * for landing, or an objective strike. Both are decided from what an ability
 * does, never from which creature is using it.
 */

const base: FixtureOptions = {
  boss: "collector",
  size: 4,
  stage: "windup",
  gold: 700,
  legacy: false,
};
const view = (s: RunState): Snapshot =>
  snapshot(
    s,
    s.players[0].id,
    s.players.map((p) => p.id),
  );
const byName = (s: RunState, definition: string) =>
  s.enemies.find((e) => e.definition === definition)!;
const strike = (actor: Enemy, label: string, target: string): Beat => ({
  kind: "cast",
  actor: actor.id,
  target,
  label,
});

describe("which intent holds a windup", () => {
  it("holds for an announced wind-up on either boss", () => {
    for (const boss of ["collector", "miser"] as const) {
      const s = bossFixture({ ...base, boss });
      const e = byName(s, boss);
      expect(e.intent.ability.interruptible, boss).toBe(true);
      expect(holdsWindup(e), boss).toBe(true);
    }
  });

  it("does not hold for an ordinary strike or an objective strike", () => {
    for (const boss of ["collector", "miser"] as const)
      for (const stage of ["opening", "objective"] as const) {
        const e = byName(bossFixture({ ...base, boss, stage }), boss);
        expect(e.intent.ability.interruptible, `${boss} ${stage}`).toBeFalsy();
        expect(holdsWindup(e), `${boss} ${stage}`).toBe(false);
      }
  });

  it("stops holding once broken, or once the holder falls", () => {
    const e = byName(bossFixture(base), "collector");
    expect(
      holdsWindup({
        ...e,
        statuses: [{ id: "interrupted", stacks: 1, duration: 1 }],
      }),
    ).toBe(false);
    expect(holdsWindup({ ...e, hp: 0 })).toBe(false);
  });

  it("is read off the ability, so an ordinary enemy's wind-up counts too", () => {
    // The Mender's repair is a wind-up; whether it *looks* like one is the
    // rig's business, below.
    const s = bossFixture({ ...base, stage: "opening" });
    const mender = byName(s, "mender");
    expect(mender.intent.ability.name).toBe("Repair lattice");
    expect(holdsWindup(mender)).toBe(true);
  });
});

describe("which landed ability plays signature", () => {
  it("names the wound-up moves and the objective strikes, and nothing else", () => {
    const signature = (id: string) =>
      Object.entries(tacticalIntents)
        .filter(([, list]) => list.some((a) => a.id === id))
        .map(([, list]) => isSignatureMove(list.find((a) => a.id === id)!));
    // The Collector: Close the account is its wind-up, Repossess its seizure.
    expect(signature("account")).toEqual([true]);
    expect(signature("repossess")).toEqual([true]);
    expect(signature("appraise")).toEqual([false]);
    // The Miser: the levy is its wind-up (and its tax), Weight of wealth banks.
    expect(signature("levy")).toEqual([true]);
    expect(signature("hoard")).toEqual([true]);
  });

  it("plays signature for the Collector's wind-up and its Repossess", () => {
    const s = bossFixture(base);
    const snap = view(s);
    const boss = byName(s, "collector");
    const hero = s.players[0].id;
    expect(castClip(snap, strike(boss, "Close the account", hero))).toBe(
      "signature",
    );
    expect(
      castClip(snap, strike(boss, "Repossess — the collateral", hero)),
    ).toBe("signature");
    expect(castClip(snap, strike(boss, "Appraise the wealthy", hero))).toBe(
      "attack",
    );
  });

  it("plays signature for the Miser's levy and its banking strike", () => {
    const s = bossFixture({ ...base, boss: "miser" });
    const snap = view(s);
    const boss = byName(s, "miser");
    const hero = s.players[0].id;
    expect(castClip(snap, strike(boss, "Crushing levy", hero))).toBe(
      "signature",
    );
    expect(castClip(snap, strike(boss, "Weight of wealth", hero))).toBe(
      "signature",
    );
  });

  it("finds the ability by name, not off the intent the round arrived with", () => {
    // A resolved round's snapshot already carries next round's intent.
    const s = bossFixture({ ...base, stage: "opening" });
    const boss = byName(s, "collector");
    expect(boss.intent.ability.name).toBe("Appraise the wealthy");
    expect(
      castClip(view(s), strike(boss, "Close the account", s.players[0].id)),
    ).toBe("signature");
  });

  it("keeps a brace a brace and a repair a cast, wind-up or not", () => {
    const s = bossFixture({ ...base, stage: "opening" });
    const mender = byName(s, "mender");
    const bulwark = byName(s, "bulwark");
    expect(
      castClip(view(s), strike(mender, "Repair lattice", bulwark.id)),
    ).toBe("cast");
    expect(castClip(view(s), strike(bulwark, "Lock shields", bulwark.id))).toBe(
      "block",
    );
  });

  it("leaves legacy rooms, which have no objectives or wind-ups, on attack", () => {
    const s = bossFixture({ ...base, stage: "objective", legacy: true });
    const boss = byName(s, "collector");
    expect(
      castClip(view(s), strike(boss, "Repossess — front row", s.players[0].id)),
    ).toBe("attack");
  });
});

describe("the animator's rest loop", () => {
  let clock = 0;
  beforeEach(() => {
    clock = 1000;
    vi.spyOn(performance, "now").mockImplementation(() => clock);
  });
  afterEach(() => vi.restoreAllMocks());
  /** Advance the clock and let the animator see it, a frame at a time. */
  const run = (a: Animator, ms: number) => {
    for (let t = 0; t < ms; t += 16) {
      clock += 16;
      a.tick(clock);
    }
  };

  it("never gives an ordinary enemy a windup: it keeps its idle", () => {
    const plain = enemies.filter(
      (d) => !rigFor(d.presentation?.spriteSet).windup,
    );
    expect(plain.map((d) => d.id)).toContain("mender");
    for (const d of plain) {
      const a = new Animator(rigFor(d.presentation?.spriteSet), 0);
      a.setRest("windup");
      run(a, 100);
      expect(a.current, d.id).toBe("idle");
      // And a hit returns it to idle, not to a generic pulse.
      a.play("hurt");
      run(a, 2000);
      expect(a.current, d.id).toBe("idle");
    }
    expect(GENERIC.windup).toBeUndefined();
  });

  it("holds an authored windup, and a hit flinches back into it", () => {
    const a = new Animator(rigFor("collector"), 0);
    a.setRest("windup");
    expect(a.current).toBe("windup");
    a.play("hurt");
    expect(a.current).toBe("hurt");
    run(a, rigFor("collector").hurt!.duration + 50);
    expect(a.current).toBe("windup");
  });

  it("releases the windup into signature, then idles once it is spent", () => {
    const a = new Animator(rigFor("collector"), 0);
    a.setRest("windup");
    a.setRest("idle");
    a.play("signature");
    expect(a.current).toBe("signature");
    run(a, rigFor("collector").signature!.duration + 50);
    expect(a.current).toBe("idle");
  });

  it("lets a one-shot finish before handing over to a new rest", () => {
    const a = new Animator(rigFor("miser"), 0);
    a.play("hurt");
    a.setRest("windup");
    expect(a.current).toBe("hurt");
    run(a, rigFor("miser").hurt!.duration + 50);
    expect(a.current).toBe("windup");
  });

  it("does not stand the fallen back up into a windup", () => {
    const a = new Animator(rigFor("collector"), 0);
    a.setRest("windup");
    a.play("defeat", "defeat");
    run(a, rigFor("collector").defeat!.duration + 100);
    a.setRest("windup");
    run(a, 100);
    expect(a.current).toBe("defeat");
  });

  it("plays a creature's own attack when it has no signature", () => {
    const a = new Animator(rigFor("stoker"), 0);
    a.play("signature");
    expect(a.current).toBe("attack");
  });

  it("takes up a windup asked for before its rig arrived", () => {
    // A cutout rig registers its parts before the combatant names its rig.
    const a = new Animator(GENERIC, 0);
    a.setRest("windup");
    expect(a.current).toBe("idle");
    a.setRig(rigFor("collector"));
    expect(a.current).toBe("windup");
  });
});
