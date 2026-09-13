import { describe, expect, it } from "vitest";
import {
  choreograph,
  landingCues,
  splitRound,
  type Cue,
} from "../src/client/battle/choreography";
import { moveMeta } from "../src/client/battle/choreo-meta";
import { planRound } from "../src/client/battle/round-plan";
import { rigFor } from "../src/client/battle/rigs";
import type { StageGeom, UnitGeom } from "../src/client/battle/stage-geometry";
import { bossFixture, finishPreviewRound } from "../src/dev/boss-fixture";
import { reduce, snapshot } from "../src/engine/game";
import { IMPACT } from "../src/shared/presentation";
import type { Beat, Snapshot } from "../src/shared/model";

/**
 * The tuned roster — Arcanist, Iron Bulwark, Kiln Mender, Rivet Sniper and
 * Living Bellows — on the choreographer's pure surface: what their
 * annotations make it schedule, and that nothing it schedules lands before
 * the thing that carries it has arrived.
 */

const box = { left: -25, right: 25, top: -100, bottom: 0 };
const unit = (id: string, gx: number, gy: number, side: "hero" | "enemy"): UnitGeom => ({
  id,
  side,
  gx,
  gy,
  depth: 1,
  z: 1,
  figure: box,
  body: box,
  view: { x: 0, y: 0, width: 100, height: 100 },
  alive: true,
  facing: side === "hero" ? 1 : -1,
  bulk: 1,
});
const stage = (units: UnitGeom[]): StageGeom => ({
  width: 1000,
  height: 600,
  units: new Map(units.map((u) => [u.id, u])),
});

/** A snapshot just deep enough for `moveMeta` to find each actor's kit. */
const snap = (players: [string, string][], enemies: [string, string][]) =>
  ({
    combatVersion: 2,
    players: players.map(([id, heroId]) => ({ id, heroId, items: [], upgrades: [] })),
    enemies: enemies.map(([id, definition]) => ({ id, definition })),
  }) as unknown as Snapshot;

const S = snap(
  [
    ["arc", "arcanist"],
    ["van", "vanguard"],
  ],
  [
    ["blw", "bulwark"],
    ["mnd", "mender"],
    ["snp", "sniper"],
    ["bel", "bellows"],
  ],
);
const G = stage([
  unit("van", 300, 420, "hero"),
  unit("arc", 200, 520, "hero"),
  unit("blw", 640, 420, "enemy"),
  unit("mnd", 780, 330, "enemy"),
  unit("snp", 860, 330, "enemy"),
  unit("bel", 720, 330, "enemy"),
]);

function play(beats: Beat[]) {
  const move = splitRound(beats).moves[0];
  const meta = moveMeta(S, move.cast);
  return {
    meta,
    tl: choreograph({
      move,
      meta,
      stage: G,
      rig: rigFor(S.enemies.find((e) => e.id === move.cast.actor)?.definition ?? S.players.find((p) => p.id === move.cast.actor)?.heroId),
      alive: () => true,
    }),
  };
}
const beatAt = (cues: Cue[], kind: Beat["kind"], target?: string) =>
  cues.find(
    (c): c is Extract<Cue, { kind: "beat" }> =>
      c.kind === "beat" && c.beat.kind === kind && (!target || c.beat.target === target),
  )?.t;

describe("landing cues", () => {
  const meta = (weight?: "light" | "heavy" | "signature") =>
    ({ ...moveMeta(S, { kind: "cast", actor: "blw", target: "van", label: "Shield ram" }), weight });
  const hit: Beat = { kind: "damage", actor: "blw", target: "van", amount: 12 };

  it("holds a heavy blow longer and shakes harder than its number would", () => {
    const cues = landingCues(100, meta("heavy"), [hit]);
    const impact = cues.find((c) => c.kind === "impact") as Extract<Cue, { kind: "impact" }>;
    expect(impact.stopMs).toBeGreaterThanOrEqual(IMPACT.heavy.stopMs);
    expect(impact.shake).toBe(IMPACT.heavy.shake);
  });

  it("adds nothing to a light blow, or to a move that hurt nobody", () => {
    expect(landingCues(0, meta("light"), [hit]).some((c) => c.kind === "impact")).toBe(false);
    expect(landingCues(0, meta("heavy"), [{ ...hit, amount: 0 }]).some((c) => c.kind === "impact")).toBe(false);
    expect(landingCues(0, meta("heavy"), []).length).toBe(0);
  });
});

describe("the Arcanist", () => {
  it("gathers the orb in the hand until the frame it throws it, and it lands before the damage", () => {
    const { tl } = play([
      { kind: "cast", actor: "arc", target: "blw", label: "Arcane spark" },
      { kind: "damage", actor: "arc", target: "blw", amount: 15 },
    ]);
    const orb = tl.projectiles[0];
    expect(orb.look.visual).toBe("orb");
    const charge = tl.cues.find((c) => c.kind === "mark" && c.style === "charge") as Extract<Cue, { kind: "mark" }>;
    expect(charge.anchor?.part).toBe("hand");
    expect(charge.until).toBeCloseTo(orb.spawn, 5);
    // The clip performs the build-up: it starts at once.
    expect(tl.cues.find((c) => c.kind === "clip")!.t).toBe(0);
    expect(beatAt(tl.cues, "damage", "blw")).toBeGreaterThanOrEqual(orb.arrive);
  });

  it("brings Storm needle out of the sky and Cinder bloom up out of the ground", () => {
    const storm = play([
      { kind: "cast", actor: "arc", target: "blw", label: "Storm needle" },
      { kind: "damage", actor: "arc", target: "blw", amount: 25 },
    ]).tl;
    expect(storm.projectiles[0].look.trajectory).toBe("fromAbove");
    const fire = play([
      { kind: "cast", actor: "arc", target: "blw", label: "Cinder bloom" },
      { kind: "damage", actor: "arc", target: "blw", amount: 12 },
      { kind: "damage", actor: "arc", target: "mnd", amount: 12 },
    ]).tl;
    expect(fire.projectiles).toHaveLength(0);
    expect(fire.cues.filter((c) => c.kind === "mark" && c.style === "telegraph")).toHaveLength(2);
  });
});

describe("the Iron Bulwark", () => {
  it("trudges far slower than it rams, and lands with a heavy impact", () => {
    const { tl, meta } = play([
      { kind: "cast", actor: "blw", target: "van", label: "Shield ram" },
      { kind: "damage", actor: "blw", target: "van", amount: 22 },
    ]);
    expect(meta.speed).toBeLessThan(0.5);
    const out = tl.segments.find((s) => s.path.from.x !== s.path.to.x)!;
    expect(out.path.to.x).toBeLessThan(out.path.from.x);
    const contact = beatAt(tl.cues, "damage", "van")!;
    expect(tl.cues.some((c) => c.kind === "impact" && Math.abs(c.t - contact) < 1)).toBe(true);
    expect(tl.cues.filter((c) => c.kind === "sound" && c.name === "footstep-heavy").length).toBeGreaterThan(0);
  });

  it("locks shields where it stands", () => {
    const { tl } = play([
      { kind: "cast", actor: "blw", target: "blw", label: "Lock shields" },
    ]);
    expect(tl.archetype).toBe("self");
    expect(tl.segments.filter((s) => s.path.from.x !== s.path.to.x)).toHaveLength(0);
  });
});

describe("the Kiln Mender", () => {
  it("throws the weld from its clamp, and the repair blooms and heals on arrival", () => {
    const { tl } = play([
      { kind: "cast", actor: "mnd", target: "blw", label: "Repair lattice" },
      { kind: "heal", actor: "mnd", target: "blw", amount: 18 },
    ]);
    const weld = tl.projectiles[0];
    expect(weld.look.visual).toBe("weld");
    expect(weld.startAnchor?.part).toBe("armB");
    expect(beatAt(tl.cues, "heal", "blw")).toBeGreaterThanOrEqual(weld.arrive);
    const bloom = tl.cues.find((c) => c.kind === "mark" && c.style === "bloom")!;
    expect(Math.abs(bloom.t - weld.arrive)).toBeLessThan(60);
  });
});

describe("the Rivet Sniper", () => {
  it("fires a rivet from the barrel with a flash, and nothing lands before it does", () => {
    const { tl } = play([
      { kind: "cast", actor: "snp", target: "arc", label: "Kill shot" },
      { kind: "damage", actor: "snp", target: "arc", amount: 34 },
    ]);
    const rivet = tl.projectiles[0];
    expect(rivet.look.visual).toBe("rivet");
    expect(rivet.startAnchor?.part).toBe("gun");
    expect(tl.cues.some((c) => c.kind === "mark" && c.style === "flash" && c.t === rivet.spawn)).toBe(true);
    expect(beatAt(tl.cues, "damage", "arc")).toBeGreaterThanOrEqual(rivet.arrive);
  });

  it("fires nothing at all when its Kill shot is interrupted", () => {
    let s = bossFixture({
      encounter: "hunting-pack",
      size: 2,
      stage: "windup",
      gold: 700,
      boss: "collector",
      legacy: false,
    });
    const sniper = s.enemies.find((e) => e.definition === "sniper")!;
    expect(sniper.intent.ability.id).toBe("killshot");
    const before = s.logs.at(-1)?.seq ?? 0;
    const arcanist = s.players.find((p) => p.heroId === "arcanist")!;
    s = reduce(s, arcanist.id, { type: "plan", ability: "counterspell", target: sniper.id }, 0);
    s = finishPreviewRound(s);
    const beats = s.logs.filter((l) => l.seq > before && l.beat).map((l) => l.beat!);
    expect(beats.some((b) => b.kind === "combo" && b.label === "INTERRUPTED" && b.target === sniper.id)).toBe(true);
    expect(beats.some((b) => b.kind === "cast" && b.actor === sniper.id)).toBe(false);
    const view = snapshot(s, s.players[0].id, s.players.map((p) => p.id));
    const ids = [...view.players, ...view.enemies].map((u) => u.id);
    const geom = stage(ids.map((id, i) => unit(id, 150 + i * 130, 420, view.players.some((p) => p.id === id) ? "hero" : "enemy")));
    const plan = planRound(view, beats, geom);
    expect(plan.projectiles.some((p) => p.from === sniper.id)).toBe(false);
    expect(plan.cues.some((c) => c.kind === "mark" && c.style === "flash" && c.unit === sniper.id)).toBe(false);
  });
});

describe("the Living Bellows", () => {
  it("breathes one cone across the whole row, and every target is hit at the same moment", () => {
    const { tl } = play([
      { kind: "cast", actor: "bel", target: "van", label: "Furnace blast" },
      { kind: "damage", actor: "bel", target: "van", amount: 24 },
      { kind: "damage", actor: "bel", target: "arc", amount: 24 },
    ]);
    expect(tl.projectiles).toHaveLength(1);
    const cone = tl.projectiles[0];
    expect(cone.look.visual).toBe("cone");
    expect(cone.spread).toBeGreaterThan(0);
    const van = beatAt(tl.cues, "damage", "van")!;
    const arc = beatAt(tl.cues, "damage", "arc")!;
    expect(van).toBeGreaterThanOrEqual(cone.arrive);
    expect(Math.abs(van - arc)).toBeLessThan(1);
  });
});
