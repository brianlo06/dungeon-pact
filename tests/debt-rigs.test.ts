import { expect, it } from "vitest";
import { DEBT_RIGS } from "../src/client/battle/rigs-debt";
import {
  sampleTrack,
  type Clip,
  type Pose,
} from "../src/client/battle/animation";
import { rigFor } from "../src/client/battle/rigs";

/**
 * The Miser, Rivet Sniper and Coin Leech rigs are authored in screen space in
 * the creature's own facing. Enemies face the party, which is to their left,
 * and the animator does not mirror anything for them — so for these rigs
 * forward is negative x. A strike that lands on +x is lunging away from the
 * people it is hitting.
 */

/** The sampled pose where the root is furthest from rest horizontally. */
function peak(track: Pose[]) {
  let best = sampleTrack(track, 0);
  for (let i = 0; i <= 200; i++) {
    const p = sampleTrack(track, i / 200);
    if (Math.abs(p.x) > Math.abs(best.x)) best = p;
  }
  return best;
}

it("registers every debt rig under its sprite set", () => {
  for (const id of ["miser", "sniper", "thief"])
    expect(rigFor(id)).toBe(DEBT_RIGS[id]);
});

it("strikes toward the party: melee attacks peak at negative x", () => {
  for (const id of ["miser", "thief"]) {
    const rig = DEBT_RIGS[id];
    expect(peak(rig.attack!.poses).x, id).toBeLessThan(0);
    if (rig.signature) expect(peak(rig.signature.poses).x, id).toBeLessThan(0);
  }
});

it("fires the rivet gun with a recoil away from the party, muzzle up", () => {
  // The one deliberate exception: a gunshot's impact pose is the kick, and a
  // kick goes away from what was shot. It must still never lurch forward.
  const attack = DEBT_RIGS.sniper.attack!;
  expect(peak(attack.poses).x).toBeGreaterThan(0);
  const gun = attack.parts!.gun;
  const kick = gun.reduce((a, b) =>
    Math.abs(b.rotate ?? 0) > Math.abs(a.rotate ?? 0) ? b : a,
  );
  expect(kick.rotate).toBeGreaterThan(0);
  expect(kick.x ?? 0).toBeGreaterThanOrEqual(0);
});

it("recoils away from the party when hurt", () => {
  for (const id of ["miser", "sniper", "thief"])
    expect(peak(DEBT_RIGS[id].hurt!.poses).x, id).toBeGreaterThan(0);
});

it("barely moves the boss when hit, and knocks the others about", () => {
  const shove = (id: string) => peak(DEBT_RIGS[id].hurt!.poses).x;
  expect(shove("miser")).toBeLessThan(0.05);
  expect(shove("sniper")).toBeGreaterThan(shove("miser") * 2.5);
  expect(shove("thief")).toBeGreaterThan(shove("miser") * 2.5);
});

it("carries every clip the director and the boss presentation ask for", () => {
  for (const id of ["miser", "sniper", "thief"]) {
    const rig = DEBT_RIGS[id];
    for (const clip of ["idle", "attack", "hurt", "defeat", "block"] as const)
      expect(rig[clip], `${id} ${clip}`).toBeDefined();
    expect(rig.idle!.loop && rig.idle!.interruptible, id).toBe(true);
    // A cutout rig moves in pieces, in every clip.
    for (const [name, clip] of Object.entries(rig))
      expect(
        Object.keys(clip!.parts ?? {}).length,
        `${id} ${name}`,
      ).toBeGreaterThan(0);
  }
  expect(DEBT_RIGS.miser.windup?.loop).toBe(true);
  expect(DEBT_RIGS.miser.signature).toBeDefined();
});

it("rakes the Miser's hand out past its held wind-up when the levy lands", () => {
  // Where the palm is, in view-box units, for a sampled hand pose and root.
  // The arm pivots at the shoulder (44, 50); the palm sits at (16, 65). Part
  // and root translations are fractions of the 100-unit box.
  type Sampled = ReturnType<typeof sampleTrack>;
  const palmX = (hand: Sampled, root: Sampled) => {
    const a = (hand.rotate * Math.PI) / 180;
    const [dx, dy] = [16 - 44, 65 - 50];
    return 44 + dx * Math.cos(a) - dy * Math.sin(a) + (hand.x + root.x) * 100;
  };
  const reach = (clip: Clip) => {
    let best = Infinity;
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const x = palmX(
        sampleTrack(clip.parts!.hand, t),
        sampleTrack(clip.poses, t),
      );
      best = Math.min(best, x);
    }
    return best;
  };
  const { windup, signature, hurt, block } = DEBT_RIGS.miser;
  // Forward is negative x: the impact reaches the party, not its own heap.
  expect(reach(signature!)).toBeLessThan(reach(windup!) - 15);
  // A flinch over a held wind-up leaves the raised hand where it is.
  expect(hurt!.parts!.hand).toBeUndefined();
  expect(block!.parts!.hand).toBeUndefined();
});

it("keeps flash on the root, the only place the animator applies it", () => {
  for (const [id, rig] of Object.entries(DEBT_RIGS))
    for (const [name, clip] of Object.entries(rig))
      for (const [part, track] of Object.entries(clip!.parts ?? {}))
        expect(
          track.some((p) => p.flash !== undefined),
          `${id} ${name} ${part}`,
        ).toBe(false);
});

it("never breathes in time with anything else on the field", () => {
  const periods = Object.values(DEBT_RIGS).map((r) => r.idle!.duration);
  expect(new Set(periods).size).toBe(periods.length);
});
