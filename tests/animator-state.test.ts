import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Animator,
  poseToTransform,
  sample,
  sampleTrack,
} from "../src/client/battle/animation";
import { rigFor } from "../src/client/battle/rigs";

/**
 * What the animator shows without being watched frame by frame: the still
 * poses of reduced motion, a hero lying down or getting up to match the
 * board, and the clip it reports to the page.
 */

/** A stand-in for a DOM node that counts what is written to it. */
function node() {
  const writes = { transform: 0, clip: 0 };
  let transform = "";
  let clip: string | undefined;
  const style = { filter: "", willChange: "" } as Record<string, string>;
  Object.defineProperty(style, "transform", {
    get: () => transform,
    set: (v: string) => {
      writes.transform++;
      transform = v;
    },
  });
  const dataset = {} as Record<string, string | undefined>;
  Object.defineProperty(dataset, "clip", {
    get: () => clip,
    set: (v: string) => {
      writes.clip++;
      clip = v;
    },
    configurable: true,
  });
  return { el: { style, dataset } as unknown as HTMLElement, writes };
}

let clock = 0;
beforeEach(() => {
  clock = 1000;
  vi.spyOn(performance, "now").mockImplementation(() => clock);
});
afterEach(() => vi.restoreAllMocks());
const run = (a: Animator, ms: number) => {
  for (let t = 0; t < ms; t += 16) {
    clock += 16;
    a.tick(clock);
  }
};

describe("reduced motion", () => {
  it("holds a windup as the raised pose, and writes it once", () => {
    const rig = rigFor("collector");
    const a = new Animator(rig, 0.37);
    const root = node();
    const key = node();
    a.attach(root.el);
    a.attachPart("key", key.el as unknown as SVGElement);
    a.setStill(true);
    a.setRest("windup");
    run(a, 2000);
    expect(a.current).toBe("windup");
    expect(root.el.dataset.clip).toBe("windup");
    // The windup's own first frame — the key lifted — whatever the phase.
    expect(key.el.style.transform).toBe(
      poseToTransform(sampleTrack(rig.windup!.parts!.key, 0)),
    );
    expect(key.el.style.transform).not.toBe(
      poseToTransform(sampleTrack(rig.idle!.parts!.key ?? [], 0)),
    );
    expect(root.writes.transform).toBe(1);
    expect(key.writes.transform).toBe(1);
    // No flash filter on a still figure.
    expect(root.el.style.filter).toBe("");
  });

  it("finishes a one-shot the moment it is asked for", () => {
    const a = new Animator(rigFor("vanguard"), 0);
    const root = node();
    a.attach(root.el);
    a.setStill(true);
    run(a, 32);
    a.play("hurt");
    run(a, 16);
    // A flinch is not shown at all: straight back to the rest pose.
    expect(a.current).toBe("idle");
    expect(root.el.style.transform).toBe(
      poseToTransform(sample(rigFor("vanguard").idle!, 0)),
    );
  });

  it("shows a fall where it ends, and a revival standing", () => {
    const rig = rigFor("reaver");
    const a = new Animator(rig, 0);
    const root = node();
    a.attach(root.el);
    a.setStill(true);
    run(a, 32);
    a.setDown(true);
    run(a, 16);
    expect(a.current).toBe("defeat");
    expect(root.el.style.transform).toBe(
      poseToTransform({ ...sample(rig.defeat!, 1), flash: 0 }),
    );
    a.setDown(false);
    run(a, 16);
    expect(a.current).toBe("idle");
    expect(root.el.style.transform).toBe(poseToTransform(sample(rig.idle!, 0)));
  });

  it("moves again when motion comes back", () => {
    const a = new Animator(rigFor("vanguard"), 0);
    const root = node();
    a.attach(root.el);
    a.setStill(true);
    run(a, 500);
    const still = root.writes.transform;
    a.setStill(false);
    run(a, 500);
    expect(root.writes.transform).toBeGreaterThan(still + 10);
  });
});

describe("lying down and getting up", () => {
  const rig = rigFor("warden");
  const rotation = (el: HTMLElement) =>
    Number(/rotate\((-?[\d.]+)deg\)/.exec(el.style.transform)?.[1]);

  it("shows a unit first seen down already lying, not falling", () => {
    const a = new Animator(rig, 0);
    const root = node();
    a.attach(root.el);
    a.setDown(true);
    run(a, 16);
    expect(a.lying).toBe(true);
    expect(rotation(root.el)).toBeCloseTo(sample(rig.defeat!, 1).rotate, 1);
  });

  it("falls in front of you once it has been seen standing", () => {
    const a = new Animator(rig, 0);
    const root = node();
    a.attach(root.el);
    run(a, 100);
    a.setDown(true);
    run(a, 16);
    expect(a.current).toBe("defeat");
    expect(rotation(root.el)).toBeGreaterThan(-20);
    run(a, rig.defeat!.duration);
    expect(rotation(root.el)).toBeCloseTo(sample(rig.defeat!, 1).rotate, 1);
  });

  it("is idempotent: asking again changes nothing", () => {
    const a = new Animator(rig, 0);
    const root = node();
    a.attach(root.el);
    run(a, 100);
    // Standing, and told to stand: no revival from nowhere.
    a.setDown(false);
    expect(a.current).toBe("idle");
    a.setDown(true);
    run(a, rig.defeat!.duration / 2);
    const midway = root.el.style.transform;
    // The board says down again mid-fall — the fall is not restarted.
    a.setDown(true);
    run(a, 16);
    expect(rotation(root.el)).toBeLessThanOrEqual(
      Number(/rotate\((-?[\d.]+)deg\)/.exec(midway)?.[1]),
    );
    run(a, rig.defeat!.duration);
    a.setDown(true);
    run(a, 100);
    expect(a.current).toBe("defeat");
  });

  it("does not fall twice when the replay already knocked it down", () => {
    const a = new Animator(rig, 0);
    a.attach(node().el);
    run(a, 100);
    a.play("defeat", "defeat"); // the director's defeat beat
    run(a, 200);
    expect(a.lying).toBe(true);
    const clip = a.current;
    a.setDown(true); // the settled board, afterwards
    expect(a.current).toBe(clip);
    run(a, rig.defeat!.duration);
    expect(a.lying).toBe(true);
  });

  it("gets up when revived, and returns to its rest", () => {
    const a = new Animator(rig, 0);
    a.attach(node().el);
    a.setDown(true);
    run(a, 100);
    a.setDown(false);
    expect(a.current).toBe("revive");
    expect(a.lying).toBe(false);
    run(a, rig.revive?.duration ?? 700);
    run(a, 100);
    expect(a.current).toBe("idle");
  });
});

describe("the clip reported to the page", () => {
  it("follows every change of clip, and is written only then", () => {
    const rig = rigFor("collector");
    const a = new Animator(rig, 0);
    const root = node();
    a.attach(root.el);
    run(a, 16);
    expect(root.el.dataset.clip).toBe("idle");
    run(a, 3000);
    expect(root.writes.clip).toBe(1);
    a.setRest("windup");
    run(a, 16);
    expect(root.el.dataset.clip).toBe("windup");
    a.play("hurt");
    run(a, 16);
    expect(root.el.dataset.clip).toBe("hurt");
    run(a, rig.hurt!.duration + 50);
    // Back into the held pose by itself, and the page is told.
    expect(root.el.dataset.clip).toBe("windup");
    run(a, 3000);
    expect(root.writes.clip).toBe(4);
  });

  it("reports what is drawn, not what was briefly asked for", () => {
    // The director spends a held windup and releases it as the signature in
    // one go; no frame ever shows idle in between, so neither does the page.
    const a = new Animator(rigFor("collector"), 0);
    const root = node();
    a.attach(root.el);
    a.setRest("windup");
    run(a, 32);
    a.setRest("idle");
    a.play("signature");
    run(a, 16);
    expect(root.el.dataset.clip).toBe("signature");
    expect(root.writes.clip).toBe(2);
  });

  it("is written to a node attached after the clip began", () => {
    const a = new Animator(rigFor("miser"), 0);
    a.setRest("windup");
    const root = node();
    a.attach(root.el);
    run(a, 16);
    expect(root.el.dataset.clip).toBe("windup");
  });
});
