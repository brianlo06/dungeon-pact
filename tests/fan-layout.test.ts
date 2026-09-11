import { describe, expect, it } from "vitest";
import {
  fanShapes,
  placeFan,
  type FanShape,
} from "../src/client/battle/fan-layout";
import type { Box } from "../src/client/battle/intent-layout";

const box = (left: number, top: number, w: number, h: number): Box => ({
  left,
  top,
  right: left + w,
  bottom: top + h,
});
const overlaps = (a: Box, b: Box) =>
  Math.min(a.right, b.right) > Math.max(a.left, b.left) &&
  Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top);
const placed = (p: { left: number; top: number; shape: FanShape }): Box =>
  box(p.left, p.top, p.shape.w, p.shape.h);

const frame = box(0, 0, 1200, 600);
const tall: FanShape = { cols: 1, commonCols: 2, w: 180, h: 240 };
const wide: FanShape = { cols: 3, commonCols: 4, w: 360, h: 100 };

describe("where the action fan opens", () => {
  it("opens beside its hero, clear of the hero's own figure", () => {
    const hero = box(500, 300, 120, 140);
    const p = placeFan([tall], hero, [], [hero], frame);
    expect(overlaps(placed(p), hero)).toBe(false);
    // Beside, with its foot level with the hero's feet.
    expect(p.left >= hero.right || p.left + tall.w <= hero.left).toBe(true);
    expect(p.top + tall.h).toBe(hero.bottom);
  });

  it("opens on the side that is clear", () => {
    const hero = box(500, 300, 120, 140);
    const ally = box(640, 300, 120, 140);
    const p = placeFan([tall], hero, [ally], [hero, ally], frame);
    expect(p.side).toBe("left");
    expect(overlaps(placed(p), ally)).toBe(false);
  });

  it("never settles nearer an ally than its own hero", () => {
    // Clear space exists only beside the ally; the fan must not read as theirs.
    const hero = box(500, 300, 120, 140);
    const ally = box(300, 300, 120, 140);
    const wall = box(620, 0, 580, 600);
    const p = placeFan([tall], hero, [ally], [hero, ally, wall], frame);
    const c = placed(p);
    const gapTo = (b: Box) =>
      Math.hypot(
        Math.max(0, b.left - c.right, c.left - b.right),
        Math.max(0, b.top - c.bottom, c.top - b.bottom),
      );
    expect(gapTo(hero)).toBeLessThanOrEqual(gapTo(ally));
  });

  it("goes wide and low when there is no height beside the hero", () => {
    // A back-row hero with a front-row ally standing up and to its right, the
    // ally's name plate hanging just above the space beside the hero.
    const hero = box(500, 440, 120, 130);
    const ally = box(640, 320, 110, 128);
    const plateAbove = box(630, 450, 400, 20);
    const leftWall = box(0, 0, 490, 600);
    const p = placeFan(
      [tall, wide],
      hero,
      [ally],
      [hero, ally, plateAbove, leftWall],
      frame,
    );
    expect(p.shape).toBe(wide);
    expect(overlaps(placed(p), plateAbove)).toBe(false);
    expect(overlaps(placed(p), hero)).toBe(false);
  });

  it("stays inside the frame", () => {
    const hero = box(1100, 300, 90, 140);
    const p = placeFan([tall], hero, [], [hero], frame);
    const c = placed(p);
    expect(c.left).toBeGreaterThanOrEqual(frame.left);
    expect(c.right).toBeLessThanOrEqual(frame.right);
  });
});

describe("the shapes a fan can take", () => {
  const slip = { w: 120, h: 31 };
  const common = { w: 80, h: 22 };

  it("prices every arrangement from the measured slips", () => {
    const shapes = fanShapes(
      [slip, slip, slip, slip],
      [common, common, common, common],
      9,
    );
    const one = shapes.find((s) => s.cols === 1 && s.commonCols === 2)!;
    const two = shapes.find((s) => s.cols === 2 && s.commonCols === 2)!;
    // Four stacked slips with their stair, then the 2×2 block below.
    expect(one.h).toBe(4 * 31 + 3 * 2 + 6 + 2 * 22 + 4);
    // As wide as its widest part: here the 2×2 block, not the stair.
    expect(one.w).toBe(Math.max(120 + 3 * 9, 80 + 4 + 80));
    // Two columns are half as tall and about twice as wide.
    expect(two.h).toBeLessThan(one.h);
    expect(two.w).toBeGreaterThan(one.w);
  });

  it("never offers more columns than there are slips", () => {
    const shapes = fanShapes([slip, slip], [common], 9);
    expect(Math.max(...shapes.map((s) => s.cols))).toBe(2);
  });
});
