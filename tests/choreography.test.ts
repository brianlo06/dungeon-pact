import { describe, expect, it } from "vitest";
import { PresentationClock, FrameLoop } from "../src/client/battle/clock";
import { attackPoint, lanePath, pathPoint } from "../src/client/battle/attack-point";
import { flightPoint, flightTime } from "../src/client/battle/trajectory";
import {
  choreograph,
  layRound,
  scheduleRound,
  travelTime,
  type Cue,
  type Move,
  type MoveTimeline,
  type ProjectilePlan,
} from "../src/client/battle/choreography";
import { GENERIC, type Rig } from "../src/client/battle/animation";
import type { MoveMeta } from "../src/client/battle/choreo-meta";
import type { Beat } from "../src/shared/model";
import type { StageGeom, UnitGeom } from "../src/client/battle/stage-geometry";

const box = { left: -25, right: 25, top: -100, bottom: 0 };
const unit = (id: string, gx: number, side: "hero" | "enemy"): UnitGeom => ({
  id,
  side,
  gx,
  gy: 500,
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

describe("one presentation clock", () => {
  it("scales the whole scene once, pauses, steps, and holds hit-stop", () => {
    const clock = new PresentationClock();
    clock.speed = 2;
    expect(clock.advance(50).dt).toBe(100);
    clock.paused = true;
    expect(clock.advance(50).dt).toBe(0);
    clock.step(120);
    expect(clock.advance(0).dt).toBe(120);
    clock.paused = false;
    clock.hold(60);
    expect(clock.advance(50)).toEqual({ dt: 40, free: 100 });
    expect(clock.time).toBe(260);
  });

  it("runs director, movement, rigs, projectiles and camera deterministically", () => {
    const loop = new FrameLoop();
    const order: string[] = [];
    for (const [name, n] of [["camera", 50], ["rig", 30], ["director", 10], ["projectile", 40], ["travel", 20]] as const)
      loop.add(n, () => order.push(name));
    loop.frame(16);
    loop.stop();
    expect(order).toEqual(["director", "travel", "rig", "projectile", "camera"]);
  });
});

describe("physical paths", () => {
  it("places a melee actor outside the target and keeps both figures on stage", () => {
    const actor = unit("hero", 180, "hero");
    const target = unit("enemy", 760, "enemy");
    const point = attackPoint(stage([actor, target]), actor, target, { reach: 44, lunge: 0.2 });
    expect(point.face).toBe(1);
    expect(point.feet.x).toBeGreaterThan(actor.gx);
    expect(point.feet.x).toBeLessThan(target.gx);
    expect(point.weapon.x).toBeCloseTo(target.gx + target.figure.left + 3, 0);
    expect(point.clamped).toBe(false);
  });

  it("routes around a blocking combatant while reaching the same attack point", () => {
    const actor = unit("hero", 180, "hero");
    const blocker = unit("blocker", 470, "hero");
    const target = unit("enemy", 760, "enemy");
    const s = stage([actor, blocker, target]);
    const path = lanePath(s, actor, { x: actor.gx, y: 500 }, { x: 680, y: 500 }, new Set([target.id]));
    expect(path.to).toEqual({ x: 680, y: 500 });
    expect(path.via.y).not.toBe(500);
    expect(pathPoint(path, 1)).toEqual(path.to);
  });

  it("lands every projectile exactly at its target with readable flight time", () => {
    for (const trajectory of ["linear", "arc", "homing", "fromAbove", "ground", "beam"] as const) {
      const flight = { trajectory, start: { x: 0.2, y: 0.6 }, end: { x: 0.8, y: 0.45 }, arc: 0.2 };
      expect(flightPoint(flight, 0).reach).toBe(0);
      const landed = flightPoint(flight, 1);
      expect(landed.x).toBeCloseTo(flight.end.x, 10);
      expect(landed.y).toBeCloseTo(flight.end.y, 10);
      expect(landed.reach).toBe(1);
      expect(flightTime(flight, 1.7)).toBeGreaterThanOrEqual(160);
      expect(flightTime(flight, 1.7)).toBeLessThanOrEqual(900);
    }
  });
});

describe("round scheduling", () => {
  const cast = (actor: string, target: string): Beat => ({ kind: "cast", actor, target, label: "Strike" });
  const hit = (actor: string, target: string): Beat => ({ kind: "damage", actor, target, amount: 10 });
  const timeline = (actor: string): MoveTimeline => ({
    actor,
    archetype: "melee",
    duration: 1000,
    release: 500,
    firstContact: 400,
    phases: [],
    segments: [{ unit: actor, start: 0, end: 1000, path: { from: {x:0,y:0}, via:{x:.5,y:0}, to:{x:1,y:0} }, ease:"linear", face:1 }],
    cues: [],
    projectiles: [],
    debug: { actor, home: {x:0,y:0} },
  });

  it("overlaps recovery with the next actor but never overlaps one actor with itself", () => {
    const beats = [cast("a", "x"), hit("a", "x"), cast("b", "x"), hit("b", "x"), cast("a", "x"), hit("a", "x")];
    const result = scheduleRound({ beats, cap: 9000, alive: () => true, choreograph: (move) => timeline(move.cast.actor!) });
    expect(result.moves[1].start).toBe(500);
    expect(result.moves[2].start).toBeGreaterThanOrEqual(1000);
    expect(result.duration).toBeLessThan(3000);
  });
});

/* ------------------------------------------------ verified in the Battle Lab -- */

const meta = (o: Partial<MoveMeta> = {}): MoveMeta => ({
  archetype: "melee",
  locomotion: "run",
  speed: 1.35,
  charge: "normal",
  timing: {},
  projectile: { visual: "bolt", trajectory: "linear", speed: 1.7 },
  strike: "attack",
  turnToReturn: false,
  overshoot: 0,
  unit: {},
  source: "ability",
  strikes: 1,
  ...o,
});
const hitBeat = (actor: string, target: string, amount = 10): Beat => ({
  kind: "damage",
  actor,
  target,
  amount,
  hp: 50,
});
const moveOf = (actor: string, target: string, beats: Beat[]): Move => ({
  cast: { kind: "cast", actor, target, label: "Strike" },
  beats,
  pre: [],
});
/** An enemy's bite: it lunges towards negative x, contact at 0.42 of 600ms. */
const BITER: Rig = {
  ...GENERIC,
  attack: {
    duration: 600,
    poses: [
      { at: 0, x: 0 },
      { at: 0.42, x: -0.36 },
      { at: 1, x: 0 },
    ],
  },
};

describe("choreography, as verified on the stage", () => {
  const hero = unit("hero", 200, "hero");
  const foe = unit("foe", 700, "enemy");
  const other = unit("other", 820, "enemy");
  const s = stage([hero, foe, other]);
  const alive = () => true;

  it("shifts a projectile's own spawn and arrival with its move, not just its cue", () => {
    const plan: ProjectilePlan = {
      id: "p",
      from: "b",
      to: "x",
      look: {},
      spawn: 300,
      arrive: 600,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    };
    const shot = (actor: string): MoveTimeline => ({
      actor,
      archetype: "projectile",
      duration: 800,
      release: 700,
      firstContact: 600,
      phases: [],
      segments: [],
      cues: [{ t: 300, kind: "projectile", plan }],
      projectiles: [plan],
      debug: { actor, home: { x: 0, y: 0 } },
    });
    const beats = [
      { kind: "cast", actor: "a", target: "x", label: "Shot" },
      { kind: "cast", actor: "b", target: "x", label: "Shot" },
    ] as Beat[];
    const round = layRound(
      { beats, alive, choreograph: (m) => shot(m.cast.actor!) },
      1,
    );
    const second = round.moves[1].start;
    expect(second).toBeGreaterThan(0);
    const cue = round.cues.filter((c) => c.kind === "projectile")[1] as Extract<
      Cue,
      { kind: "projectile" }
    >;
    expect(cue.t).toBe(second + 300);
    expect(cue.plan.spawn).toBe(second + 300);
    expect(cue.plan.arrive).toBe(second + 600);
    expect(round.projectiles[1]).toBe(cue.plan);
  });

  it("holds the anticipation and spends a held pose only when the strike is delivered", () => {
    const tl = choreograph({
      move: moveOf("hero", "foe", [hitBeat("hero", "foe")]),
      meta: meta(),
      stage: s,
      rig: GENERIC,
      alive,
    });
    const clips = tl.cues.filter((c) => c.kind === "clip") as Extract<
      Cue,
      { kind: "clip" }
    >[];
    expect(clips[0]).toMatchObject({ clip: "anticipate", then: "anticipate" });
    const strike = clips.find((c) => c.clip === "attack")!;
    const spend = tl.cues.find((c) => c.kind === "spend")!;
    expect(strike.t).toBeGreaterThan(0);
    expect(spend.t).toBe(strike.t);
  });

  it("never restarts a repeated strike before the blow it replays has landed", () => {
    const tl = choreograph({
      move: moveOf("foe", "hero", [
        hitBeat("foe", "hero", 5),
        hitBeat("foe", "hero", 5),
      ]),
      meta: meta({ strikes: 2 }),
      stage: s,
      rig: BITER,
      alive,
    });
    const strikes = tl.cues.filter(
      (c) => c.kind === "clip" && c.clip === "attack",
    );
    const hits = tl.cues.filter(
      (c) => c.kind === "beat" && c.beat.kind === "damage",
    );
    expect(strikes).toHaveLength(2);
    expect(hits).toHaveLength(2);
    expect(strikes[1].t).toBeGreaterThanOrEqual(hits[0].t + 80);
    // Each hit is on its own blow's contact.
    expect(hits[1].t - strikes[1].t).toBeCloseTo(0.42 * 600, 5);
  });

  it("gives a gait its own floor, so a sprint and a charge differ over a short gap", () => {
    expect(travelTime(0.02, 2.6, 1)).toBeLessThan(120);
    expect(travelTime(0.02, 1.1, 1)).toBeGreaterThan(200);
  });

  it("carries an enemy's overshoot on past its target, not back towards home", () => {
    const tl = choreograph({
      move: moveOf("foe", "hero", [hitBeat("foe", "hero")]),
      meta: meta({ overshoot: 30, turnToReturn: true, speed: 2.6 }),
      stage: s,
      rig: BITER,
      alive,
    });
    const recovery = tl.phases.find((p) => p.name === "recovery")!;
    const run = tl.segments.find((g) => g.start === recovery.start)!;
    // The enemy faces left: past its target is further left.
    expect(run.path.to.x).toBeLessThan(run.path.from.x);
    // It runs on from where the bite carried it, which is further forward
    // than where it stood to bite, never behind it.
    expect(run.path.from.x).toBeLessThan(tl.debug.attackPoint!.x);
  });

  it("lands everything one release sends at the same moment", () => {
    const tl = choreograph({
      move: moveOf("hero", "foe", [
        hitBeat("hero", "foe"),
        hitBeat("hero", "other"),
      ]),
      meta: meta({ archetype: "area", delivery: "shockwave" }),
      stage: s,
      rig: GENERIC,
      alive,
    });
    expect(tl.projectiles).toHaveLength(2);
    expect(new Set(tl.projectiles.map((p) => p.arrive)).size).toBe(1);
    const hits = tl.cues.filter(
      (c) => c.kind === "beat" && c.beat.kind === "damage",
    );
    for (const h of hits)
      expect(Math.round(h.t)).toBe(Math.round(tl.projectiles[0].arrive));
    expect(tl.projectiles[0].look.visual).toBe("wave");
  });

  it("does not cross the floor or shoot at a unit that has already fallen", () => {
    const standing = (id: string) => id !== "foe";
    const melee = choreograph({
      move: moveOf("hero", "foe", []),
      meta: meta(),
      stage: s,
      rig: GENERIC,
      alive: standing,
    });
    expect(melee.archetype).toBe("self");
    expect(melee.segments).toEqual([]);
    const shot = choreograph({
      move: moveOf("hero", "foe", []),
      meta: meta({ archetype: "projectile" }),
      stage: s,
      rig: GENERIC,
      alive: standing,
    });
    expect(shot.projectiles).toEqual([]);
    // Aimed at the fallen but resolved on someone standing: it goes for them.
    const retarget = choreograph({
      move: moveOf("hero", "foe", [hitBeat("hero", "other")]),
      meta: meta(),
      stage: s,
      rig: GENERIC,
      alive: standing,
    });
    expect(retarget.debug.target).toBe("other");
    expect(retarget.segments.length).toBeGreaterThan(0);
  });
});
