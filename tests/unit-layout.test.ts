import { describe, expect, it } from "vitest";
import {
  arrangeUnits,
  sameShapes,
  type StageShapes,
  type UnitShape,
} from "../src/client/battle/unit-layout";
import type { Box } from "../src/client/battle/intent-layout";
import {
  CEILING,
  FLOOR,
  frameFor,
  planningFrame,
  type CameraPreset,
} from "../src/client/battle/camera";
import type { Placement } from "../src/client/battle/layout";

/**
 * Where units stand across their ranks, without a browser. The stage-ui and
 * combat-layout specs check real formations; these pin what the solver
 * promises.
 */

const box = (left: number, top: number, w: number, h: number): Box => ({
  left,
  top,
  right: left + w,
  bottom: top + h,
});

/** A combatant 100 wide: a figure standing on a plate at its feet. */
const unit = (
  id: string,
  rank: number,
  x: number,
  y: number,
  extra: Partial<UnitShape> = {},
): UnitShape => ({
  id,
  rank,
  x,
  y,
  figure: box(-40, -130, 80, 105),
  plate: box(-50, -20, 100, 20),
  ...extra,
});

const at = (u: UnitShape, dx: number, which: "figure" | "plate"): Box => {
  const b = u[which];
  return {
    left: b.left + u.x + dx,
    right: b.right + u.x + dx,
    top: b.top + u.y,
    bottom: b.bottom + u.y,
  };
};
const hits = (a: Box, b: Box) =>
  Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0 &&
  Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0;

/** Every nearer figure that lands on a plate in a rank behind it. */
function covered(units: UnitShape[], dx: Map<string, number>) {
  const out: string[] = [];
  for (const a of units)
    for (const b of units)
      if (
        a.rank > b.rank &&
        hits(at(a, dx.get(a.id)!, "figure"), at(b, dx.get(b.id)!, "plate"))
      )
        out.push(`${a.id} on ${b.id}`);
  return out;
}

const bounds = { left: 0, right: 1200 };

describe("arranging the ranks", () => {
  it("leaves a formation that is already clear exactly where it is", () => {
    const units = [unit("a", 0, 300, 200), unit("b", 1, 600, 300)];
    const dx = arrangeUnits(units, bounds);
    expect([...dx.values()]).toEqual([0, 0]);
  });

  it("slides a figure off the name plate of the rank behind it", () => {
    // b stands a little in front of a and rises over a's plate.
    const units = [unit("a", 0, 500, 300), unit("b", 1, 530, 400)];
    expect(
      covered(
        units,
        new Map([
          ["a", 0],
          ["b", 0],
        ]),
      ),
    ).toHaveLength(1);
    const dx = arrangeUnits(units, bounds);
    expect(covered(units, dx)).toEqual([]);
    // A short slide, not a trip across the stage.
    const travel = [...dx.values()].reduce((t, d) => t + Math.abs(d), 0);
    expect(travel).toBeLessThan(150);
  });

  it("clears every rank at once, not just the first pair", () => {
    const units = [
      unit("e1", 0, 560, 240),
      unit("e2", 1, 480, 360),
      unit("e3", 1, 700, 360),
      unit("h1", 2, 440, 480),
      unit("h2", 2, 640, 480),
      unit("h3", 3, 360, 590),
      unit("h4", 3, 560, 590),
    ];
    expect(covered(units, arrangeUnits(units, bounds))).toEqual([]);
  });

  it("moves the light unit rather than the heavy one", () => {
    const units = [
      unit("boss", 0, 500, 300, { weight: 3 }),
      unit("hero", 1, 530, 400),
    ];
    const dx = arrangeUnits(units, bounds);
    expect(covered(units, dx)).toEqual([]);
    expect(Math.abs(dx.get("hero")!)).toBeGreaterThan(
      Math.abs(dx.get("boss")!),
    );
  });

  it("keeps a rank in order, inside the bounds, and neighbours apart", () => {
    const units = [
      unit("a", 0, 520, 300),
      unit("b", 1, 470, 400),
      unit("c", 1, 590, 400),
    ];
    const narrow = { left: 300, right: 900 };
    const dx = arrangeUnits(units, narrow);
    expect(covered(units, dx)).toEqual([]);
    const b = at(units[1], dx.get("b")!, "plate");
    const c = at(units[2], dx.get("c")!, "plate");
    expect(b.right).toBeLessThanOrEqual(c.left);
    for (const u of units)
      for (const which of ["figure", "plate"] as const) {
        const placed = at(u, dx.get(u.id)!, which);
        expect(placed.left).toBeGreaterThanOrEqual(narrow.left);
        expect(placed.right).toBeLessThanOrEqual(narrow.right);
      }
  });

  it("gives the same answer every time it is asked", () => {
    const units = [
      unit("e1", 0, 560, 240),
      unit("e2", 1, 520, 360),
      unit("h1", 2, 500, 480),
      unit("h2", 3, 520, 590),
    ];
    const first = arrangeUnits(units, bounds);
    for (let i = 0; i < 3; i++)
      expect(arrangeUnits(units, bounds)).toEqual(first);
  });
});

describe("comparing measurements", () => {
  const shapes = (nudge = 0): StageShapes => ({
    width: 1280,
    height: 600,
    units: {
      a: {
        figure: box(-40 + nudge, -130, 80, 105),
        plate: box(-50, -20, 100, 20),
      },
    },
  });

  it("ignores the pixel a browser snaps text to, and nothing more", () => {
    expect(sameShapes(shapes(), shapes(1))).toBe(true);
    expect(sameShapes(shapes(), shapes(3))).toBe(false);
    expect(sameShapes(null, shapes())).toBe(false);
    expect(sameShapes(shapes(), { ...shapes(), width: 1366 })).toBe(false);
  });
});

describe("the camera keeps the floor on screen", () => {
  const W = 1280;
  const H = 606;
  const place = (x: number, y: number): Placement => ({
    id: `${x},${y}`,
    side: y > 0.7 ? "hero" : "enemy",
    row: "front",
    x,
    y,
    depth: 0,
    scale: 1,
    z: 0,
    shadow: 1,
  });
  const spots = [0.3, 0.5, 0.8].flatMap((x) =>
    [0.415, 0.61, 0.8, FLOOR].map((y) => place(x, y)),
  );

  it("under every preset, whoever the subjects are", () => {
    for (const preset of [
      "neutral",
      "hero",
      "target",
      "action",
      "boss",
    ] as CameraPreset[])
      for (const a of spots)
        for (const b of spots) {
          const f = frameFor(W, H, { preset, at: a, and: b });
          expect(f.bottom, `${preset} ${a.id} ${b.id}`).toBeGreaterThanOrEqual(
            FLOOR * H,
          );
        }
  });

  it("and, while a decision is made, the ceiling too", () => {
    for (const preset of ["neutral", "hero", "target"] as CameraPreset[])
      for (const a of spots)
        for (const b of spots) {
          const f = frameFor(W, H, { preset, at: a, and: b });
          expect(f.top, `${preset} ${a.id} ${b.id}`).toBeLessThanOrEqual(
            CEILING * H + 1e-6,
          );
        }
  });

  it("still leans toward a hero standing on the floor", () => {
    // The space below the back row's feet is where its actions open.
    const hero = place(0.4, FLOOR);
    const choosing = frameFor(W, H, { preset: "hero", at: hero });
    const idle = frameFor(W, H, { preset: "neutral" });
    expect(choosing.bottom).toBeGreaterThan(idle.bottom);
  });

  it("and the planning frame, which chips keep inside, is the board", () => {
    const f = planningFrame(W, H);
    expect(f.bottom).toBeGreaterThanOrEqual(FLOOR * H);
    expect(f.top).toBeLessThanOrEqual(CEILING * H + 1e-6);
    expect(f.top).toBeGreaterThan(0);
  });
});
