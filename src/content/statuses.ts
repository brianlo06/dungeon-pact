import type { StatusId } from "../shared/model";
export const statuses: Record<
  StatusId,
  { name: string; icon: string; description: string; max: number }
> = {
  weak: {
    name: "Weak",
    icon: "↓",
    description:
      "Direct attack power is reduced by 35% before Guard. Expires at round end.",
    max: 1,
  },
  empowered: {
    name: "Empowered",
    icon: "↑",
    description: "Direct attack power is increased by 30% before Guard.",
    max: 1,
  },
  confused: {
    name: "Confused",
    icon: "↻",
    description:
      "This enemy's next action strikes its own side. Expires at round end.",
    max: 1,
  },
  guarded: {
    name: "Guarded",
    icon: "⛨",
    description:
      "A standing protector takes your next direct enemy hit this round. One hit only.",
    max: 1,
  },
  interrupted: {
    name: "Interrupted",
    icon: "×",
    description:
      "This enemy loses its current windup action. Expires at round end.",
    max: 1,
  },
  burn: {
    name: "Burn",
    icon: "♨",
    description: "Lose stacks HP at round end. Stacks add; duration refreshes.",
    max: 30,
  },
  poison: {
    name: "Poison",
    icon: "☠",
    description: "Lose stacks HP at round end; ignores Guard. Stacks add.",
    max: 30,
  },
  wet: {
    name: "Wet",
    icon: "≈",
    description:
      "The next Lightning hit consumes Wet and chains 12 damage to other enemies.",
    max: 1,
  },
  marked: {
    name: "Marked",
    icon: "◎",
    description:
      "The next Precision hit consumes Marked for 20 bonus damage: Exploit.",
    max: 1,
  },
  barrier: {
    name: "Barrier",
    icon: "⬡",
    description: "Absorbs damage before HP. Stacks add up to 100.",
    max: 100,
  },
  regen: {
    name: "Regeneration",
    icon: "✚",
    description: "Restore stacks HP at round end while standing.",
    max: 20,
  },
  heat: {
    name: "Heat",
    icon: "♦",
    description:
      "A crucible heating. At full heat the pour is announced; enough damage before it acts cracks it.",
    max: 3,
  },
  encrusted: {
    name: "Encrusted",
    icon: "▦",
    description:
      "Hardened plates. Every hit this unit makes deals 3 more per stack.",
    max: 6,
  },
  vulnerable: {
    name: "Vulnerable",
    icon: "◇",
    description: "Incoming direct damage increases by 25%.",
    max: 1,
  },
};
