import type { CSSProperties } from "react";

interface Atlas {
  /** Public path to an equal-cell RGBA sheet. */
  file: string;
  /** Cells per side. A 4 means a 4×4 grid, row-major. */
  grid: number;
  cells: Record<string, number>;
}

const v1: Atlas = {
  file: "/art/characters-v1.png",
  grid: 4,
  cells: {
    vanguard: 0,
    arcanist: 1,
    ranger: 2,
    warden: 3,
    stoker: 4,
    bulwark: 5,
    acolyte: 6,
    mender: 7,
    hound: 8,
    sniper: 9,
    thief: 10,
    bellows: 11,
    collector: 12,
    miser: 13,
    auctioneer: 14,
    chest: 15,
  },
};

/**
 * Second sheet for classes added after v1. Set this to an Atlas once
 * `public/art/characters-v2.png` exists and the four ids below have their own
 * artwork; see ART_DIRECTION.md for the exact cell manifest to generate.
 * Until then those classes fall back to `derived` + a palette filter, which is
 * a placeholder, not a design.
 */
const v2: Atlas | null = null;

const derived: Record<string, string> = {
  reaver: "vanguard",
  herald: "warden",
  beguiler: "arcanist",
  broker: "ranger",
};

function locate(id: string): {
  atlas: Atlas;
  index: number;
  borrowed: boolean;
} {
  if (v2 && id in v2.cells)
    return { atlas: v2, index: v2.cells[id], borrowed: false };
  if (id in v1.cells)
    return { atlas: v1, index: v1.cells[id], borrowed: false };
  const base = derived[id];
  if (base && base in v1.cells)
    return { atlas: v1, index: v1.cells[base], borrowed: true };
  return { atlas: v1, index: v1.cells.chest, borrowed: false };
}

/** One coordinate contract across lobby, combat, hub and results. */
export function Sprite({
  id,
  className = "",
  label,
}: {
  id: string;
  className?: string;
  label?: string;
}) {
  const { atlas, index, borrowed } = locate(id);
  const span = 100 / (atlas.grid - 1);
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`sprite sprite-${id} ${borrowed ? "sprite-borrowed" : ""} ${className}`}
      style={
        {
          "--sprite-atlas": `url("${atlas.file}")`,
          "--sprite-size": `${atlas.grid * 100}% ${atlas.grid * 100}%`,
          "--sprite-x": `${(index % atlas.grid) * span}%`,
          "--sprite-y": `${Math.floor(index / atlas.grid) * span}%`,
        } as CSSProperties
      }
    />
  );
}
