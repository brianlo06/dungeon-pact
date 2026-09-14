import type { UltimateDef } from "../ultimates";

/**
 * Herald · Sanctifier — "Hold the line by holding the people on it."
 *
 * The Herald's three other Ultimates give the party something: courage to
 * swing with (Anthem of the Unpaid, Into the Din), an enemy opened for them
 * (Into the Din, Elegy for the Standing), the dungeon's afflictions taken off
 * them (all three). The Sanctifier traded Closing cadence for Sanctuary — a
 * row's ground made safe, 24 Barrier and lasting Regeneration — and its
 * Ultimate gives the party nothing to swing with, clears nothing and touches
 * no enemy. It makes the ground the whole party stands on hold, and it puts
 * the Sanctifier on the line in front of them:
 *
 *  - the Sanctifier **steps onto the front line** (moved to the front row).
 *    Every enemy but a sniper and the Collector prefers the front row when
 *    it picks whom to hit, so from the next round the blows come to the
 *    Sanctifier — 101 HP, +16 from the path — and away from the back row;
 *  - **every ally, the Sanctifier included: 16 Barrier and Regeneration 4,
 *    both for four rounds.** Lasting, not lapsing: the Small Print's cover
 *    ends with its round, the Anthem's 8 and the Lantern Wall's 12 a round
 *    later; this is there until it is spent, with 4 HP a round under it;
 *  - the Sanctifier holds **12 more Barrier** for standing in front;
 *  - **+3 Verse**, so Sanctuary (3 Verse) is affordable again next round on
 *    whichever row needs it.
 *
 * Team play: a Vanguard behind the line earns charge on every point its
 * Barrier blocks and every hit it intercepts on it; a Warden's Regeneration
 * stacks under it; a party that has to cross a vent chamber or sit through
 * a boss's windup keeps its footing. The cost is the front row's: the vents
 * scald it, and a row attack on the front finds the Sanctifier there.
 *
 * Speed 14: a ward, so it resolves after the strikes queued the same round
 * (Into the Din 16, Lantern Wall 20) and before the Small Print (12).
 */
export const ultimate: UltimateDef = {
  id: "hallowed-ground",
  heroId: "herald",
  evolution: "hrl-sanctifier",
  name: "Hallowed Ground",
  epithet: "Stand here. Nothing moves you.",
  description:
    "Step onto the front line and consecrate the ground under the whole party: every ally, you included, gains 16 Barrier and Regeneration 4, both lasting four rounds. You hold 12 more Barrier for standing in front, and gain 3 Verse.",
  target: "self",
  effects: [
    // Onto the line first: the Sanctifier's place is in front of the people it holds.
    {
      kind: "move",
      row: "front",
    },
    {
      kind: "allies",
      self: true,
      effects: [
        {
          kind: "status",
          status: "barrier",
          stacks: 16,
          duration: 4,
        },
        {
          kind: "status",
          status: "regen",
          stacks: 4,
          duration: 4,
        },
      ],
    },
    {
      kind: "status",
      status: "barrier",
      stacks: 12,
      duration: 4,
      self: true,
    },
    {
      kind: "resource",
      amount: 3,
    },
  ],
  cost: 100,
  speed: 14,
  presentation: {
    cinematic: "hallowed-ground",
    theme: "resonance",
    accent: "#cdf5ff",
    voice: {
      activation: "Stay where you are. I'll see to the ground.",
      impact: "Holy ground. Hold it.",
      after: "It holds as long as you do. So hold.",
    },
  },
};
