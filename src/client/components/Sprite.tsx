import { EquipmentProvider } from "../equipment/Equipment";
import type { CSSProperties } from "react";
import { PARTY, PORTRAITS } from "./heroes";

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

/** Second sheet, for the classes added after v1 was generated. */
const v2: Atlas = {
  file: "/art/characters-v2.png",
  grid: 2,
  cells: { broker: 0, herald: 1, reaver: 2, beguiler: 3 },
};

function locate(id: string): { atlas: Atlas; index: number } {
  if (id in v2.cells) return { atlas: v2, index: v2.cells[id] };
  if (id in v1.cells) return { atlas: v1, index: v1.cells[id] };
  return { atlas: v1, index: v1.cells.chest };
}

/** One coordinate contract across lobby, combat, hub and results. */
export function Sprite({
  id,
  className = "",
  label,
  crop,
  equipment = [],
  preview,
}: {
  id: string;
  equipment?: readonly string[];
  preview?: string;
  className?: string;
  label?: string;
  /** Head and shoulders, for a portrait too small for a whole figure. */
  crop?: "portrait";
}) {
  // The party is drawn, not cut from the atlas. Outside combat it stands at
  // rest in the same box an atlas cell would, so every screen that sizes a
  // `.sprite` sizes a hero without knowing the difference.
  const Drawn = PARTY[id];
  if (Drawn)
    return (
      <span
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        className={`sprite sprite-${id} sprite-drawn ${className}`}
      >
        <EquipmentProvider items={equipment} preview={preview}>
          <Drawn
            unitId={`still-${id}`}
            viewBox={crop === "portrait" ? PORTRAITS[id] : undefined}
          />
        </EquipmentProvider>
      </span>
    );
  const { atlas, index } = locate(id);
  const span = 100 / (atlas.grid - 1);
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`sprite sprite-${id} ${className}`}
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
