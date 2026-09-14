import type { UltimateDef } from "../ultimates";

/**
 * Warden · Lifebinder — "Nothing living is beyond hope. Nothing."
 *
 * Green Reckoning is the Warden's kit as a sweep: everyone healed a little,
 * cleansed and lifted, the enemy poisoned. The Lifebinder traded Mending
 * roots for Lifebind — one ally healed hard, regenerating, and warded — and
 * its Ultimate is that bond taken to its end: one life bound, not everyone
 * touched, and a price the Warden pays out of its own body.
 *
 * Living Bone is aimed at one ally, the downed included, so it is a revive
 * when it has to be. The bound one is healed 40, regenerates 6 a round for
 * three rounds, is warded for 12, and comes back Empowered for two rounds —
 * an antler grows back bigger every year. Then the Warden breaks a tine off
 * its own crown: it pays 12 HP flat, steps to the front line and intercepts
 * the bound ally's next direct hit this round (a guard link, the Vanguard's
 * reaction on a healer). +2 Growth.
 *
 * The gift comes before the price, so a Warden low enough to drop itself
 * still binds the life it meant to; the price comes before the guard, so the
 * Warden's own new Barrier cannot pay it. It cannot be aimed at the Warden
 * itself: a bond needs two.
 */
export const ultimate: UltimateDef = {
  id: "living-bone",
  heroId: "warden",
  evolution: "war-lifebinder",
  name: "Living Bone",
  epithet: "Bone grows back. So will you.",
  description:
    "Bind one ally, even a downed one: healed 40, Regeneration 6 for 3 rounds, Barrier 12, Empowered for 2 rounds. The Warden pays 12 HP, steps forward and intercepts that ally's next direct hit this round. +2 Growth.",
  target: "ally",
  effects: [
    { kind: "heal", amount: 40 },
    { kind: "status", status: "regen", stacks: 6, duration: 3 },
    { kind: "status", status: "barrier", stacks: 12, duration: 2 },
    { kind: "status", status: "empowered", stacks: 1, duration: 2 },
    // The tine: paid flat, after the gift and before the guard.
    { kind: "damage", amount: 12, self: true },
    { kind: "protect", barrier: 8 },
    { kind: "resource", amount: 2 },
  ],
  cost: 100,
  speed: 11,
  presentation: {
    cinematic: "living-bone",
    theme: "growth",
    accent: "#7fc4a4",
    voice: {
      activation: "Stay. I've something to give you.",
      impact: "There. It's yours now — grow.",
      after: "It'll ache in the spring. That's how you know it took.",
    },
  },
};
