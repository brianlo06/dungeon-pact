import type { CSSProperties } from "react";
const cells: Record<string, number> = {
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
};
/**
 * Classes added after the atlas was generated have no cell of their own. They
 * borrow the closest silhouette and are separated by palette, which is how a
 * pixel artist derives a variant — see ART_DIRECTION.md. Giving them real cells
 * needs only an atlas regeneration and four entries in `cells`.
 */
const derived: Record<string, string> = {
  reaver: "vanguard",
  herald: "warden",
  beguiler: "arcanist",
  broker: "ranger",
};
/** One atlas and one coordinate contract across lobby, combat, hub and results. */
export function Sprite({
  id,
  className = "",
  label,
}: {
  id: string;
  className?: string;
  label?: string;
}) {
  const index = cells[id] ?? cells[derived[id]] ?? 15;
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`sprite sprite-${id} ${className}`}
      style={
        {
          "--sprite-x": `${((index % 4) * 100) / 3}%`,
          "--sprite-y": `${(Math.floor(index / 4) * 100) / 3}%`,
        } as CSSProperties
      }
    />
  );
}
