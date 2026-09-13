const shapes: Record<string, string> = {
  sword: "M11 1h4v4h-2v2h-2v2H9v2H7V9H5V7h2V5h2V3h2zM3 9h2v2h2v2H5v2H1v-4h2z",
  coin: "M5 1h6v2h2v2h2v6h-2v2h-2v2H5v-2H3v-2H1V5h2V3h2zM7 4v8h2V4z",
  fire: "M7 1h2v4h2V3h2v4h2v6h-2v2H3v-2H1V9h2V7h2V3h2zM7 9v4h4v-2H9V9z",
  skull: "M3 1h10v2h2v8h-2v4H9v-2H7v2H3v-4H1V3h2zM3 5v4h4V5zM9 5v4h4V5z",
  shield: "M1 1h14v10h-2v2h-2v2H5v-2H3v-2H1zM4 4v6h2v2h4v-2h2V4z",
  gem: "M5 1h6v2h2v2h2v6h-2v2h-2v2H5v-2H3v-2H1V5h2V3h2zM7 3v8h2V3z",
  crown: "M1 3h2v2h2V3h2V1h2v2h2v2h2V3h2v10H1zM3 15h10v-2H3z",
  question: "M3 1h8v2h2v6H9v2H7V7h4V3H5v2H3zM7 13h2v2H7z",
  gavel: "M7 1h6v2h2v4h-2v2H7V7H5V3h2zM5 7h2v4H5v2H3v2H1v-4h2V9h2z",
  leaf: "M9 1h6v6h-2v4H9v2H5v2H1v-2h2V9h2V5h4zM5 9h2V7h2V5h2v2H9v2H7v2H5z",
  // Training: a book, so a mentor node cannot be mistaken for a fight.
  book: "M1 2h6v1h2V2h6v11h-6v1H7v-1H1zM3 4v7h4V4zM9 4v7h4V4z",
  // The party's position on the route.
  pin: "M5 1h6v2h2v6h-2v2H9v4H7v-4H5V9H3V3h2zM7 4v4h2V4z",
  // A stoppered flask, so a consumable lot never reads as another relic.
  potion: "M6 1h4v2h2v2h1v9H3V5h1V3h2zM6 6v6h4V6z",
  // A hazard: a warning triangle, so a room that fights back is never read as
  // an ordinary fight.
  warn: "M7 1h2v2h2v4h2v4h2v4H1v-4h2V7h2V3h2zM7 6v4h2V6zM7 11v2h2v-2z",
  // A shrine: an altar with a flame standing on it.
  altar: "M7 1h2v2h2v4H5V3h2zM3 8h10v2h-2v4h2v2H3v-2h2v-4H3z",
  // A workbench: an anvil.
  anvil: "M1 3h12v2h2v2h-4v2H9v3h3v3H4v-3h3V9H5V7H3V5H1z",
};
export function PixelIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      className={`pixel-icon ${className}`}
      viewBox="0 0 16 16"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path fillRule="evenodd" d={shapes[name] ?? shapes.gem} />
    </svg>
  );
}
