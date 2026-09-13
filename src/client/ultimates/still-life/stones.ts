import { seeded } from "../../cinematic/vfx";

/**
 * The held fall's roof: every block that has come loose, where it hangs, and
 * where it lands when time starts again. Shared by the background (hanging)
 * and by `still-fall` (falling), so the stones that fall at the impact are
 * exactly the ones that hung in every shot before it.
 *
 * World units, on the 1600×900 stage and the 3200×1800 box around it.
 */
export interface Stone {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Degrees, hanging. */
  r: number;
  /** Where it lands, and how it lies there. */
  lx: number;
  ly: number;
  lr: number;
  /** 0…1: when in the fall it lets go, so the roof does not drop as one sheet. */
  late: number;
}

/** The far floor, where fallen stones lie: behind the figures, never on them. */
export const FLOOR = 640;

function build(): Stone[] {
  const rand = seeded(907);
  const out: Stone[] = [];
  // Rows of the broken vault, high to low; wider at the top, where it broke.
  const rows: [number, number, number][] = [
    [-330, 11, 1.25],
    [-170, 10, 1.05],
    [-20, 8, 0.9],
    [130, 7, 0.75],
    [290, 5, 0.6],
  ];
  for (const [y, count, size] of rows)
    for (let i = 0; i < count; i++) {
      const x = -700 + ((i + 0.5 + (rand() - 0.5) * 0.7) / count) * 3000;
      // Keep the middle of the frame clear low down, where figures stand tall.
      if (y > 100 && x > 350 && x < 1350) continue;
      const w = (70 + rand() * 120) * size;
      const h = w * (0.45 + rand() * 0.3);
      out.push({
        x,
        y: y + (rand() - 0.5) * 90,
        w,
        h,
        r: (rand() - 0.5) * 50,
        lx: x + (rand() - 0.5) * 160,
        ly: FLOOR + rand() * 90,
        lr: (rand() - 0.5) * 30,
        late: rand() * 0.35,
      });
    }
  return out;
}

export const STONES = build();

/** A stone's outline, a slightly irregular block, about its own centre. */
export function block(s: Pick<Stone, "w" | "h">, seed: number) {
  const rand = seeded(seed);
  const hw = s.w / 2;
  const hh = s.h / 2;
  const j = () => (rand() - 0.5) * Math.min(hw, hh) * 0.22;
  return `M${(-hw + j()).toFixed(1)} ${(-hh + j()).toFixed(1)} L${(hw + j()).toFixed(1)} ${(-hh + j()).toFixed(1)} L${(hw + j()).toFixed(1)} ${(hh + j()).toFixed(1)} L${(-hw * 0.2 + j()).toFixed(1)} ${(hh + j() * 1.6).toFixed(1)} L${(-hw + j()).toFixed(1)} ${(hh + j()).toFixed(1)} Z`;
}
