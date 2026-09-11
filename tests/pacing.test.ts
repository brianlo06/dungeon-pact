import { describe, expect, it } from "vitest";
import { paceRound, REPLAY_CAP, spans } from "../src/client/battle/pacing";
import { castClip } from "../src/client/battle/hero-clips";
import {
  bossFixture,
  finishPreviewRound,
  type FixtureOptions,
} from "../src/dev/boss-fixture";
import { abilities } from "../src/content/heroes";
import { reduce, snapshot } from "../src/engine/game";
import type { Beat, RunState } from "../src/shared/model";

/**
 * A replayed round fits a cap without any beat becoming unreadable.
 *
 * The director once had no cap at all, and a four-hero boss round replayed for
 * ten seconds. These hold the pacing to the cap for every kind of round the
 * Battle Lab can stage, and hold every beat to its floor while doing it.
 */

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const cast = (label = "Strike"): Beat => ({ kind: "cast", actor: "a", label });
const hit = (amount: number, target = "b"): Beat => ({
  kind: "damage",
  actor: "a",
  target,
  amount,
});

describe("pacing a round", () => {
  it("plays a short round at its natural lengths", () => {
    const beats = [cast(), hit(12), cast(), hit(4)];
    const holds = paceRound(beats);
    expect(holds).toEqual(spans(beats).map((s) => s.natural));
    expect(sum(holds)).toBeLessThan(REPLAY_CAP);
  });

  it("squeezes a long round to the cap, and no beat below its floor", () => {
    const beats = Array.from({ length: 7 }, () => [
      cast(),
      hit(20),
      hit(6),
    ]).flat();
    const holds = paceRound(beats);
    const all = spans(beats);
    expect(sum(all.map((s) => s.natural))).toBeGreaterThan(REPLAY_CAP);
    expect(sum(all.map((s) => s.floor))).toBeLessThan(REPLAY_CAP);
    expect(sum(holds)).toBeCloseTo(REPLAY_CAP, 6);
    holds.forEach((h, i) => {
      expect(h).toBeGreaterThanOrEqual(all[i].floor);
      expect(h).toBeLessThanOrEqual(all[i].natural);
    });
  });

  it("runs a round too busy for the cap at its floors, never faster", () => {
    const beats = Array.from({ length: 20 }, () => [cast(), hit(20)]).flat();
    const holds = paceRound(beats);
    expect(holds).toEqual(spans(beats).map((s) => s.floor));
    expect(sum(holds)).toBeGreaterThan(REPLAY_CAP);
  });

  it("gives a move's first hit the impact and its later hits less", () => {
    const [move, first, second, zero] = spans([
      cast(),
      hit(18),
      hit(7, "c"),
      { kind: "heal", target: "a", amount: 0 },
    ]);
    expect(first.floor).toBeGreaterThan(second.floor);
    expect(zero.floor).toBe(second.floor);
    // The move's own callout outlasts any hit.
    expect(move.floor).toBeGreaterThan(first.floor);
    // A new move's first hit is an impact again.
    const [, again] = spans([cast(), hit(0), hit(9)]).slice(1);
    expect(again.floor).toBe(first.floor);
  });

  it("holds a signature long enough for the strike to land", () => {
    const sig = cast("Close the account");
    const [plain, headline] = spans([cast(), sig], {
      signature: (b) => b === sig,
    });
    expect(headline.floor).toBeGreaterThan(plain.floor);
    // The Collector's key lands about 600ms into its signature.
    expect(headline.natural).toBeGreaterThanOrEqual(600);
  });

  it("gives banners the time to read them", () => {
    const [combo, defeat] = spans([
      { kind: "combo", label: "SEIZED", target: "b" },
      { kind: "defeat", target: "b" },
    ]);
    expect(combo.floor).toBeGreaterThanOrEqual(450);
    expect(defeat.floor).toBeGreaterThanOrEqual(450);
  });
});

describe("every round the lab stages fits the cap", () => {
  const base: FixtureOptions = {
    boss: "collector",
    size: 4,
    stage: "objective",
    gold: 700,
    legacy: false,
  };
  /** Plan every standing hero's first plain strike at the first enemy. */
  const strikeAll = (s: RunState) => {
    for (const p of s.players) {
      const a = abilities(p.heroId, s.combatVersion, p.upgrades).find(
        (x) =>
          x.target === "enemy" &&
          x.cost === 0 &&
          x.effects.some((e) => e.kind === "damage"),
      )!;
      s = reduce(
        s,
        p.id,
        { type: "plan", ability: a.id, target: s.enemies[0].id },
        0,
      );
    }
    return s;
  };
  const interrupt = (s: RunState) =>
    reduce(
      s,
      s.players.find((p) => p.heroId === "arcanist")!.id,
      { type: "plan", ability: "counterspell", target: s.enemies[0].id },
      0,
    );
  /** The beats of one round, and the snapshot they arrive in. */
  const round = (
    opts: Partial<FixtureOptions>,
    plan?: (s: RunState) => RunState,
  ) => {
    let s = bossFixture({ ...base, ...opts });
    const before = s.logs.at(-1)?.seq ?? 0;
    const r = s.round;
    if (plan) s = plan(s);
    if (s.round === r) s = finishPreviewRound(s);
    const snap = snapshot(
      s,
      s.players[0].id,
      s.players.map((p) => p.id),
    );
    const beats = s.logs
      .filter((l) => l.seq > before && l.beat)
      .map((l) => l.beat!);
    return { beats, snap };
  };

  const rounds: [string, ReturnType<typeof round>][] = [];
  for (const size of [2, 3, 4] as const) {
    for (const fight of [
      { boss: "collector" as const },
      { boss: "miser" as const },
      { encounter: "smoke-line" },
      { encounter: "furnace-watch" },
    ]) {
      const name = fight.encounter ?? fight.boss;
      rounds.push([`${name}, ${size} bracing`, round({ size, ...fight })]);
      rounds.push([
        `${name}, ${size} striking`,
        round({ size, ...fight }, strikeAll),
      ]);
    }
  }
  rounds.push(["the Collector's signature", round({ stage: "windup" })]);
  rounds.push([
    "the Miser's signature",
    round({ stage: "windup", boss: "miser" }),
  ]);
  rounds.push(["an interrupt", round({ stage: "windup" }, interrupt)]);

  it.each(rounds)("%s", (_, { beats, snap }) => {
    expect(beats.length).toBeGreaterThan(3);
    const signature = (b: Beat) =>
      b.kind === "cast" && castClip(snap, b) === "signature";
    const holds = paceRound(beats, { signature });
    expect(sum(holds)).toBeLessThanOrEqual(REPLAY_CAP + 1e-6);
  });

  it("includes the rounds that used to run longest", () => {
    // Measured before the cap was restored: these replayed for 10–11s.
    const natural = (name: string) =>
      sum(
        spans(rounds.find(([n]) => n === name)![1].beats).map((s) => s.natural),
      );
    expect(natural("collector, 4 bracing")).toBeGreaterThan(9000);
    expect(natural("collector, 4 striking")).toBeGreaterThan(10000);
  });
});
