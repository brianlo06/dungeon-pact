import { describe, expect, it } from "vitest";
import { placeChips, type Box } from "../src/client/battle/intent-layout";
import { planningFrame } from "../src/client/battle/camera";

/**
 * The chip solver, without a browser. The stage-ui browser spec checks the
 * result on real formations; these pin the rules the solver itself promises.
 */

const box = (left: number, top: number, w: number, h: number): Box => ({
  left,
  top,
  right: left + w,
  bottom: top + h,
});
const hits = (a: Box, b: Box) =>
  Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 &&
  Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
const shifted = (b: Box, o: { x: number; y: number }) =>
  box(b.left + o.x, b.top + o.y, b.right - b.left, b.bottom - b.top);

const frame = box(0, 0, 1000, 600);

describe("placing intent chips", () => {
  it("leaves a chip that is already clear exactly where it is", () => {
    const out = placeChips(
      [
        {
          id: "a",
          box: box(400, 100, 100, 30),
          owner: box(400, 132, 100, 100),
        },
      ],
      [box(700, 100, 80, 20)],
      frame,
    );
    expect(out.get("a")).toEqual({ x: 0, y: 0 });
  });

  it("steps a chip off another combatant's name plate", () => {
    const chip = box(400, 200, 110, 30);
    const plate = box(490, 210, 80, 20);
    const out = placeChips(
      [{ id: "a", box: chip, owner: box(405, 232, 100, 100) }],
      [plate],
      frame,
    );
    const moved = shifted(chip, out.get("a")!);
    expect(hits(moved, plate)).toBe(false);
    // A short slide is enough; it should not have gone far.
    expect(Math.abs(out.get("a")!.x) + Math.abs(out.get("a")!.y)).toBeLessThan(
      60,
    );
  });

  it("never lets two chips land on each other", () => {
    const chips = [
      { id: "a", box: box(400, 200, 110, 30), owner: box(405, 232, 100, 100) },
      { id: "b", box: box(450, 205, 110, 30), owner: box(455, 237, 100, 100) },
    ];
    const out = placeChips(chips, [], frame);
    const [a, b] = chips.map((c) => shifted(c.box, out.get(c.id)!));
    expect(hits(a, b)).toBe(false);
  });

  it("keeps every chip inside the frame", () => {
    const chip = box(-30, -10, 110, 30);
    const out = placeChips(
      [{ id: "a", box: chip, owner: box(-20, 22, 100, 100) }],
      [],
      frame,
    );
    const moved = shifted(chip, out.get("a")!);
    expect(moved.left).toBeGreaterThanOrEqual(frame.left);
    expect(moved.top).toBeGreaterThanOrEqual(frame.top);
  });

  it("steps a chip off its own creature's painted figure", () => {
    // A key raised past the top of the creature's square, into the chip.
    const chip = box(400, 100, 110, 30);
    const figure = box(410, 120, 90, 110);
    const out = placeChips(
      [{ id: "a", box: chip, owner: box(405, 132, 100, 100), figure }],
      [],
      frame,
      [figure],
    );
    const moved = shifted(chip, out.get("a")!);
    expect(hits(moved, figure)).toBe(false);
    // Above it, still over its creature, rather than off to one side.
    expect(moved.bottom).toBeLessThanOrEqual(figure.top);
    expect(moved.right).toBeGreaterThan(figure.left);
    expect(moved.left).toBeLessThan(figure.right);
  });

  it("uses the empty top of the square rather than leave the frame", () => {
    // No room above the square: the chip may sink into its bare corners,
    // but not onto the drawing.
    const top = box(0, 40, 1000, 560);
    const chip = box(400, 20, 110, 30);
    const figure = box(420, 85, 70, 100);
    const out = placeChips(
      [{ id: "a", box: chip, owner: box(405, 52, 100, 100), figure }],
      [],
      top,
      [figure],
    );
    const moved = shifted(chip, out.get("a")!);
    expect(moved.top).toBeGreaterThanOrEqual(top.top);
    expect(hits(moved, figure)).toBe(false);
  });

  it("never trades a name plate for its own creature", () => {
    const chip = box(400, 100, 110, 30);
    const figure = box(410, 120, 90, 110);
    const plate = box(300, 60, 320, 40);
    const out = placeChips(
      [{ id: "a", box: chip, owner: box(405, 132, 100, 100), figure }],
      [plate],
      frame,
      [figure],
    );
    expect(hits(shifted(chip, out.get("a")!), plate)).toBe(false);
  });

  it("gives the same answer every time it is asked", () => {
    const chips = [
      { id: "a", box: box(400, 200, 110, 30), owner: box(405, 232, 100, 100) },
      { id: "b", box: box(450, 205, 110, 30), owner: box(455, 237, 100, 100) },
    ];
    const plates = [box(490, 210, 80, 20), box(300, 190, 80, 20)];
    const first = placeChips(chips, plates, frame);
    for (let i = 0; i < 5; i++)
      expect(placeChips(chips, plates, frame)).toEqual(first);
  });
});

describe("the planning frame", () => {
  it("is a box inside the stage, inset by the camera's zoom and reach", () => {
    const f = planningFrame(1280, 540);
    expect(f.left).toBeGreaterThan(0);
    expect(f.top).toBeGreaterThan(0);
    expect(f.right).toBeLessThan(1280);
    expect(f.bottom).toBeLessThan(540);
    // Horizontally symmetric: the camera scales about the stage's centre line.
    expect(f.left).toBeCloseTo(1280 - f.right, 6);
  });
});
