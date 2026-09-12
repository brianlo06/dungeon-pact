import { describe, expect, it } from "vitest";
import { PresentationClock, FrameLoop } from "../src/client/battle/clock";
import { attackPoint, lanePath, pathPoint } from "../src/client/battle/attack-point";
import { flightPoint, flightTime } from "../src/client/battle/trajectory";
import { scheduleRound, type MoveTimeline } from "../src/client/battle/choreography";
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
