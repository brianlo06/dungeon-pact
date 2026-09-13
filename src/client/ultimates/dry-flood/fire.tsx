import type { ReactNode } from "react";

/**
 * How Dry Flood draws fire, the same everywhere in the film.
 *
 * A tongue of flame (for the small fires: the flame in the glove, a burning
 * figure, the fingers along the pour) is four flat layers, deep red, orange,
 * gold and a pale core, scaled down into one another from the same base so
 * the heat sits low. Each tongue has three drawings (its tip leaning
 * one way, standing up, leaning the other, each with a lick off one side)
 * and boils between them on its own beat, the way a drawn flame does, so it
 * never needs a blur to look alive. A tongue is 100 units tall and stands on
 * its base at (0, 0); whatever places it scales and leans it.
 *
 * The three drawings live once per effect in `<defs>` and every tongue is
 * three `<use>`s, only one shown (`style.css`, by the effect's `data-k` and
 * the tongue's `data-ph`). No filters, no gradients over large areas.
 */

export const FIRE = {
  deep: "#b8321c",
  orange: "#ff8a2a",
  gold: "#ffc63d",
  core: "#fff1c8",
  smoke: "#1d1418",
  smokeEdge: "#3b2b2c",
};

const SHAPES = [
  // The tip leaning left, a lick off the right.
  "M-24 0 C-35 -20 -24 -40 -13 -55 C-5 -67 -15 -82 -9 -100 C4 -88 14 -76 14 -62 C19 -69 23 -73 25 -81 C34 -60 33 -30 24 0 Z",
  // Standing up, the tip curling over right.
  "M-24 0 C-31 -24 -27 -46 -17 -62 C-11 -72 -9 -79 -15 -89 C-3 -85 4 -77 6 -71 C10 -83 8 -93 15 -105 C25 -85 31 -61 30 -40 C30 -24 28 -10 24 0 Z",
  // The tip leaning right, a lick off the left.
  "M-24 0 C-33 -28 -31 -52 -23 -72 C-20 -64 -16 -60 -12 -58 C-8 -75 3 -89 11 -100 C13 -84 25 -70 27 -50 C29 -34 31 -16 24 0 Z",
];

/** The three drawings of a tongue, once, for every `<Tongue>` in the same effect. */
export function FireDefs({ id }: { id: string }): ReactNode {
  return (
    <defs>
      {SHAPES.map((d, k) => (
        <g key={k} id={`${id}-v${k}`}>
          <path d={d} fill={FIRE.deep} />
          <path d={d} fill={FIRE.orange} transform="scale(0.8 0.83)" />
          <path d={d} fill={FIRE.gold} transform="scale(0.58 0.6)" />
          <path d={d} fill={FIRE.core} transform="translate(0 -4) scale(0.32 0.34)" />
        </g>
      ))}
    </defs>
  );
}

/** One tongue: its three drawings, one shown at a time. `ph` offsets its beat. */
export function Tongue({ id, ph, className = "" }: { id: string; ph: number; className?: string }): ReactNode {
  return (
    <g className={`dry-t ${className}`} data-ph={ph % 3}>
      <use href={`#${id}-v0`} className="v0" />
      <use href={`#${id}-v1`} className="v1" />
      <use href={`#${id}-v2`} className="v2" />
    </g>
  );
}

/**
 * Smoke, drawn the way the film draws everything: three curling strokes
 * going up, thick at the bottom and thinning, dark plum with a warm edge
 * where the fire under them lights them.
 */
export function Puff({ className = "" }: { className?: string }): ReactNode {
  return (
    <g className={`dry-puff ${className}`} fill="none" strokeLinecap="round">
      <path d="M-18 0 C-40 -30 10 -52 -8 -86 C-22 -112 12 -132 0 -160" stroke={FIRE.smokeEdge} strokeWidth="22" />
      <path d="M16 -8 C34 -34 2 -60 22 -92 C36 -116 14 -134 24 -150" stroke={FIRE.smoke} strokeWidth="16" />
      <path d="M-4 -20 C10 -44 -18 -66 -4 -96" stroke={FIRE.smoke} strokeWidth="12" />
      <path d="M-18 0 C-30 -16 -26 -24 -20 -34" stroke={FIRE.orange} strokeWidth="6" strokeOpacity="0.35" />
    </g>
  );
}

/** Advance a fire's boil: a new drawing every `every` ms. */
export function boil(el: Element | null, age: number, every = 55) {
  if (!el) return;
  const k = String(Math.floor(age / every) % 3);
  if ((el as HTMLElement).dataset.k !== k) (el as HTMLElement).dataset.k = k;
}

/** Set an SVG transform attribute only when it changes. */
export function place(el: Element | null | undefined, value: string) {
  if (el && el.getAttribute("transform") !== value) el.setAttribute("transform", value);
}

export function fade(el: Element | null | undefined, value: number) {
  if (!el) return;
  const o = Math.max(0, Math.min(1, value)).toFixed(3);
  if (el.getAttribute("opacity") !== o) el.setAttribute("opacity", o);
}
