import type { StatusId } from "../shared/model";
export const statuses: Record<
  StatusId,
  { name: string; icon: string; description: string; max: number }
> = {
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
      "The next Precision hit consumes Marked for 14 bonus damage: Exploit.",
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
  vulnerable: {
    name: "Vulnerable",
    icon: "◇",
    description: "Incoming direct damage increases by 25%.",
    max: 1,
  },
};
