import { planningFrame } from "./camera";

/**
 * Where each enemy's intent chip sits.
 *
 * A chip is a speech panel above its creature, and most of the time that is
 * exactly where it stays. But a front-rank chip rises to the height of the rank
 * behind, and in a crowded line it lands on somebody else's name plate. No
 * anchoring rule per band survives every formation at every party size, so the
 * chips are laid out once against what is actually on the stage.
 *
 * The pass is deliberately not an animation. It measures in untransformed
 * stage pixels, so the camera and the rigs — both of which move every frame —
 * never enter into it, and the same stage always produces the same answer.
 * It reruns only when something changes size: a new round, a resize, a font.
 * It runs after the units themselves have been placed (`unit-layout.ts`).
 */

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface ChipSpec {
  id: string;
  /** Where the chip sits unmoved, above its creature. */
  box: Box;
  /** The creature it speaks for. A chip may slide, but never leave it. */
  owner: Box;
  /**
   * What that creature actually paints, if it is known. A chip never covers
   * it: a raised key through its own speech panel reads as a rendering fault.
   * The empty corners of the owner's square are free to use.
   */
  figure?: Box;
}

export interface Offset {
  x: number;
  y: number;
}

/** Clear space kept between a chip and whatever it steps around. */
const GAP = 3;
/** How far an idle loop carries a figure past the outline it rests in. */
const SWAY = 5;
/** Anything below this, in square pixels, is rounding, not overlap. */
const TOUCH = 1;
/**
 * What covering a figure costs, per pixel of chip width over it, against a
 * pixel of sliding. Above one, so a chip steps off a creature's body when a
 * short slide will do it; low enough that it will not travel far to avoid one.
 */
const COVER = 1.5;

const area = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

/** Lexicographic: is `a` strictly better than `b`? */
const before = (a: number[], b: number[]) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i];
  return false;
};

const moved = (b: Box, o: Offset): Box => ({
  left: b.left + o.x,
  right: b.right + o.x,
  top: b.top + o.y,
  bottom: b.bottom + o.y,
});

const grown = (b: Box, by: number): Box => ({
  left: b.left - by,
  right: b.right + by,
  top: b.top - by,
  bottom: b.bottom + by,
});

/**
 * Place every chip. Hard rules: inside the frame, clear of every name plate and
 * of every chip already placed. Then clear of its own creature's painted
 * figure. Soft: stay attached to the creature, stay near home, prefer sliding
 * sideways or rising to sinking, and avoid covering other figures.
 *
 * Chips are placed in the order given; the stage passes them back rank first,
 * so the rank nearest the top edge — which has least room to move — keeps its
 * natural spots and the ranks below make way.
 */
export function placeChips(
  chips: ChipSpec[],
  plates: Box[],
  frame: Box,
  figures: Box[] = [],
): Map<string, Offset> {
  const out = new Map<string, Offset>();
  const placed: Box[] = [];
  for (const chip of chips) {
    const b = chip.box;
    const h = b.bottom - b.top;
    const blockers = [...plates, ...placed];
    // Kept clear by a little more than touching, so an idle sway never
    // brings the drawing back across it.
    const own = chip.figure ? grown(chip.figure, SWAY) : null;
    const others = figures.filter((f) => f !== chip.figure);

    // Candidate moves: stay, meet the frame, or step just clear of a blocker
    // on any side. Every combination of a horizontal and a vertical step is
    // tried, so clearing two blockers at once is covered.
    const xs = new Set([0, frame.left - b.left, frame.right - b.right]);
    const ys = new Set([0, frame.top - b.top, frame.bottom - b.bottom]);
    for (const o of [...blockers, ...figures]) {
      xs.add(o.left - GAP - b.right);
      xs.add(o.right + GAP - b.left);
      ys.add(o.top - GAP - b.bottom);
      ys.add(o.bottom + GAP - b.top);
    }
    if (own) {
      xs.add(own.left - b.right);
      xs.add(own.right - b.left);
      ys.add(own.top - b.bottom);
    }

    const ownerMid = (chip.owner.left + chip.owner.right) / 2;
    const ownerW = chip.owner.right - chip.owner.left;
    const ownerH = chip.owner.bottom - chip.owner.top;
    let best: { o: Offset; key: number[] } | null = null;
    for (const x of xs)
      for (const y of ys) {
        const o = { x: Math.round(x), y: Math.round(y) };
        const c = moved(b, o);
        if (
          c.left < frame.left - 0.5 ||
          c.right > frame.right + 0.5 ||
          c.top < frame.top - 0.5 ||
          c.bottom > frame.bottom + 0.5
        )
          continue;
        let hit = 0;
        for (const k of blockers) {
          const a = area(c, k);
          if (a > TOUCH) hit += a;
        }
        const sits = own ? area(c, own) : 0;
        // Still visibly this creature's: over the middle of it, and not sunk
        // below its shoulders.
        const reach = ownerW * 0.2;
        const detach =
          Math.max(0, ownerMid - reach - c.right) +
          Math.max(0, c.left - (ownerMid + reach)) +
          Math.max(0, c.bottom - (chip.owner.top + ownerH * 0.45));
        let cost = Math.abs(o.x) + (o.y < 0 ? -o.y * 1.4 : o.y * 3);
        for (const f of others) cost += (area(c, f) / h) * COVER;
        // Overlap is the thing being fixed, so it outranks everything; then
        // the chip's own creature; then staying attached; then staying close.
        const key = [hit, sits > TOUCH ? sits : 0, detach, cost];
        if (!best || before(key, best.key)) best = { o, key };
      }
    const o = best?.o ?? { x: 0, y: 0 };
    out.set(chip.id, o);
    placed.push(moved(b, o));
  }
  return out;
}

/** Keep chips this far inside the frame, so their borders never kiss an edge. */
const MARGIN = 4;
/** How far a target's plate brackets reach past it (see stage-ui.css). */
const PLATE_REACH = 8;

/**
 * Measure the stage and move its chips. Offsets are written straight onto the
 * chip wrappers; React never renders a style there, so nothing fights it.
 *
 * `painted` is what each combatant paints, in the layer's untransformed
 * pixels (see `unit-layout.ts`); a combatant missing from it counts as its
 * whole square.
 */
export function layoutIntents(
  layer: HTMLElement,
  painted: Map<HTMLElement, Box> = new Map(),
) {
  const units = [...layer.querySelectorAll<HTMLElement>(".combatant")];
  const wrappers = units
    .map((u) => u.querySelector<HTMLElement>(":scope > .combatant-intent"))
    .filter((w): w is HTMLElement => !!w);
  // Measure from home, not from wherever the last pass left them.
  for (const w of wrappers) w.style.transform = "";

  const origin = layer.getBoundingClientRect();
  if (!layer.offsetWidth || !origin.width) return;
  // The camera scales and pans the world; undo it so every number is in the
  // stage's own pixels and nothing depends on where the camera is this frame.
  const scale = origin.width / layer.offsetWidth;
  const local = (el: Element): Box => {
    const r = el.getBoundingClientRect();
    return {
      left: (r.left - origin.left) / scale,
      right: (r.right - origin.left) / scale,
      top: (r.top - origin.top) / scale,
      bottom: (r.bottom - origin.top) / scale,
    };
  };

  const plates: Box[] = [];
  const figures: Box[] = [];
  const chips: (ChipSpec & { el: HTMLElement })[] = [];
  units.forEach((u, i) => {
    const plate = u.querySelector(":scope > .combatant-plate");
    const body = u.querySelector(":scope > .combatant-body");
    if (plate) {
      // Plates are held wider than they measure: a marked target hangs
      // brackets off each end, and marking must never move a chip.
      const p = local(plate);
      plates.push({
        ...p,
        left: p.left - PLATE_REACH,
        right: p.right + PLATE_REACH,
      });
    }
    if (!body) return;
    const owner = local(body);
    const figure = painted.get(u) ?? owner;
    figures.push(figure);
    const wrapper = u.querySelector<HTMLElement>(":scope > .combatant-intent");
    const chip = wrapper?.querySelector(".intent-chip") ?? wrapper;
    if (!wrapper || !chip) return;
    const box = local(chip);
    // Collapsed at small heights, where chips only show on hover.
    if (box.right - box.left < 1) return;
    chips.push({ id: String(i), box, owner, figure, el: wrapper });
  });

  const f = planningFrame(layer.offsetWidth, layer.offsetHeight);
  const frame = {
    left: f.left + MARGIN,
    right: f.right - MARGIN,
    top: f.top + MARGIN,
    bottom: f.bottom - MARGIN,
  };
  // Rank nearest the top edge first: it has the least room to give way.
  const order = [...chips].sort((a, b) => a.box.top - b.box.top);
  const offsets = placeChips(order, plates, frame, figures);
  for (const c of chips) {
    const o = offsets.get(c.id);
    if (o && (o.x || o.y))
      c.el.style.transform = `translate(${o.x}px, ${o.y}px)`;
  }
}
