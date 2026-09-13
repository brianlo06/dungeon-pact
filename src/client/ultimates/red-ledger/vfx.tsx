import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ENTRY_STROKE } from "../../components/heroes/Reaver";
import "./style.css";

/**
 * Red Ledger's effects.
 *
 * The idea they serve: the Reaver pays first — one stroke of its own blood
 * wiped across its chest — and the cleaver collects with that stroke, cut
 * through the target and entered again on everyone in its row.
 *
 * So there is one drawing, and everything here is that drawing: **the
 * entry**, a single brush-stroke of flat crimson, heavy where it lands,
 * dry-brushed into three streaks where it leaves, a drip hanging off its
 * heaviest point. It is the same shape as the stroke on the Reaver's chest
 * (`Reaver.tsx`, the `entry` part), scaled, never redrawn: stroke for stroke.
 *
 *   ledger-pool     on the board: a hard pool of top light lands round the
 *                   Reaver, the pit's one light finding it
 *   ledger-drops    drops leaving the fist and falling; or one, hanging, then
 *                   falling (`single`)
 *   ledger-groove   the pit: the groove the dragged blade cuts in the sand,
 *                   spotted red, drawn up to wherever the blade is
 *   ledger-cut      the impact frame: the stroke at the size of the screen,
 *                   crimson on the black, and fading off the picture after
 *   ledger-entries  the stroke on each figure the blow reached — doubled on
 *                   the target, a copy on each of its row, landing one after
 *                   another, each figure knocked as its copy lands; and the
 *                   Reaver's own body driven through the chop
 *   ledger-mark     on the board after: the stroke on every real unit that
 *                   paid — the target doubled, its row, and the Reaver
 *
 * Nothing re-renders React while it plays and nothing is filtered: strokes
 * are revealed by moving a clip along their own axis, figures are knocked by
 * a transform on their `.cine-look` (which nothing else writes, and which is
 * put back when the shot ends).
 */

export const CRIMSON = "#ff4d5e";
export const BLOOD = "#b3172f";
/** The dark edge under every stroke. */
const INKED = "#2a0610";

const v = (vars: Record<string, string | number>) => vars as CSSProperties;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const easeOut = (k: number) => 1 - (1 - clamp(k)) ** 3;

/* ── The entry ─────────────────────────────────────────────────────────── */

/**
 * The stroke, in its own units: from x 0 (where the fist lands) to x 25, 6
 * across — the very shape on the Reaver's chest.
 */
const ENTRY = ENTRY_STROKE;
/** The impact frame's stroke is drawn as fat as the chest's. */
const ACROSS = 1.35;

let uid = 0;

/**
 * One stroke, drawn in a group the caller places (see `place`), its landing
 * point at the group's origin. Revealed by sliding the paint along the
 * stroke's axis under its own shape (see `reveal`).
 */
function Stroke({ id, grain = false }: { id: string; grain?: boolean }) {
  return (
    <g className="ledger-stroke">
      <clipPath id={id}>
        <path d={ENTRY} />
      </clipPath>
      {/* Its ink edge: the same stroke, dark, a little down and along, as the cutouts are outlined. */}
      <g transform="translate(0.45 0.55)" clipPath={`url(#${id})`}>
        <rect className="ledger-stroke-paint" x={-27} y={-4} width={27} height={11} fill={INKED} />
      </g>
      <g clipPath={`url(#${id})`}>
        <rect className="ledger-stroke-paint" x={-27} y={-4} width={27} height={11} fill={BLOOD} />
        {grain && (
          <path
            className="ledger-stroke-grain"
            d="M-27 -2.3 H-8 M-26 -1.6 H-15 M-27 -0.2 H-11 M-25 0.6 H-18 M-27 1.5 H-6 M-26 2.3 H-14"
            stroke="#7c0b1e"
            strokeWidth={0.22}
          />
        )}
        <path className="ledger-stroke-wet" d="M-27 -1.2 H-4 M-24 1.3 H-3" stroke={CRIMSON} strokeWidth={0.7} />
        <path className="ledger-stroke-lead" d="M-2.6 -4 C-1 -1 -1 3 -2.6 7 H0 V-4 Z" fill={CRIMSON} />
      </g>
    </g>
  );
}

/** Paint a stroke `k` (0…1) of the way along. */
function reveal(g: Element | null | undefined, k: number) {
  if (!g) return;
  const t = `translate(${(clamp(k) * 27).toFixed(2)} 0)`;
  for (const node of g.querySelectorAll(".ledger-stroke-paint, .ledger-stroke-wet, .ledger-stroke-lead, .ledger-stroke-grain"))
    if (node.getAttribute("transform") !== t) node.setAttribute("transform", t);
}

const place = (g: Element | null | undefined, x: number, y: number, a: number, k: number, across = ACROSS) => {
  if (!g) return;
  const t = `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)}) scale(${k.toFixed(3)} ${(k * across).toFixed(3)})`;
  if (g.getAttribute("transform") !== t) g.setAttribute("transform", t);
};

/* ── Renderers ─────────────────────────────────────────────────────────── */

/** On the board: the pit's one light finds the Reaver. */
const Pool = () => (
  <div className="ledger-pool">
    <i className="ledger-pool-shaft" />
    <i className="ledger-pool-floor" />
    <i className="ledger-pool-edge" />
  </div>
);

/** Drops off the fist. */
const Drops = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 9);
  const single = !!cue.params?.single;
  const n = single ? 1 : Number(cue.params?.n ?? 5);
  const fall = Number(cue.params?.fall ?? 260);
  return (
    <div className="ledger-drops" data-single={single || undefined}>
      {Array.from({ length: n }, (_, i) => (
        <i
          key={i}
          style={v({
            "--x": `${single ? 0 : (rand() - 0.5) * 30}px`,
            "--d": single ? Number(cue.params?.hang ?? 0.55) : (i / n) * 0.7 + rand() * 0.1,
            "--fall": `${fall * (single ? 1 : 0.7 + rand() * 0.6)}px`,
            "--s": single ? 1.3 : 0.7 + rand() * 0.5,
          })}
        />
      ))}
    </div>
  );
};

/** The groove the blade drags in the sand, drawn up to the blade. */
const Groove = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 23);
  const p = cue.params ?? {};
  return (
    <svg
      className="ledger-world ledger-groove"
      viewBox="0 0 1600 900"
      aria-hidden="true"
      data-from={String(p.from ?? 1700)}
      data-tip={String(p.tip ?? 0.62)}
      data-lift={String(p.lift ?? 0.04)}
    >
      <path className="ledger-groove-shadow" />
      <path className="ledger-groove-cut" />
      <path className="ledger-groove-lip" />
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} className="ledger-groove-spot" data-k={((i + rand() * 0.6) / 12).toFixed(3)} rx={4 + rand() * 7} ry={2 + rand() * 2} fill={BLOOD} />
      ))}
    </svg>
  );
};

/** The impact frame: the stroke at the size of the screen. */
const Cut = ({ cue }: VfxProps) => {
  const id = useRef(`ledger-cut-${++uid}`).current;
  const p = cue.params ?? {};
  return (
    <svg
      className="ledger-cut"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      data-x={String(p.x ?? 120)}
      data-y={String(p.y ?? 300)}
      data-angle={String(p.angle ?? 16)}
      data-size={String(p.size ?? 58)}
    >
      <g className="ledger-cut-at">
        <Stroke id={id} grain />
      </g>
    </svg>
  );
};

const MAX = 6;

/** The stroke on every figure the blow reached. */
const Entries = ({ cue }: VfxProps) => {
  const ref = useRef<SVGSVGElement>(null);
  const base = useRef(`ledger-entry-${++uid}`).current;
  // Put every figure back where the stage left it when the shot ends.
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>(".ult-cinematic") ?? null;
    return () => {
      for (const look of root?.querySelectorAll<HTMLElement>(".cine-actor .cine-look") ?? []) look.style.transform = "";
    };
  }, []);
  const p = cue.params ?? {};
  return (
    <svg
      ref={ref}
      className="ledger-world ledger-entries"
      viewBox="0 0 1600 900"
      aria-hidden="true"
      data-angle={String(p.angle ?? 22)}
      data-gap={String(p.gap ?? 0.06)}
      data-chest={String(p.chest ?? 0.56)}
      data-lunge={String(p.lunge ?? 1)}
    >
      {Array.from({ length: MAX }, (_, i) => (
        <g key={i} className="ledger-entry" data-i={i} style={{ display: "none" }}>
          <g className="ledger-entry-a">
            <Stroke id={`${base}-${i}a`} />
          </g>
          {i === 0 && (
            <g className="ledger-entry-b">
              <Stroke id={`${base}-${i}b`} />
            </g>
          )}
        </g>
      ))}
    </svg>
  );
};

/** On the board after: the stroke on a real unit. */
const Mark = ({ cue }: VfxProps) => {
  const id = useRef(`ledger-mark-${++uid}`).current;
  return (
    <div className="ledger-mark" data-price={cue.params?.price ? "" : undefined}>
      <svg viewBox="-20 -20 40 40" aria-hidden="true">
        <g className="ledger-mark-a" transform="translate(-12 -5) rotate(22)">
          <Stroke id={`${id}a`} />
        </g>
        <g className="ledger-mark-b" transform="translate(-10 2) rotate(22) scale(0.85)">
          <Stroke id={`${id}b`} />
        </g>
      </svg>
      <i className="ledger-mark-drip" />
    </div>
  );
};

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "ledger-pool": Pool,
  "ledger-drops": Drops,
  "ledger-groove": Groove,
  "ledger-cut": Cut,
  "ledger-entries": Entries,
  "ledger-mark": Mark,
};

/* ── Frames ────────────────────────────────────────────────────────────── */

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;
type At = { x: number; y: number; h: number };

const rootOf = (el: HTMLElement) => el.closest<HTMLElement>(".ult-cinematic");
const lookOf = (root: HTMLElement | null, role: string, index = 0) =>
  root?.querySelectorAll<HTMLElement>(`.cine-actor[data-role="${role}"] .cine-look`)[index] ?? null;

/** Write a transform on a figure's look, pivoting at its feet. */
function knock(look: HTMLElement | null, t: string) {
  if (!look) return;
  if (look.style.transformOrigin !== "50px 97px") look.style.transformOrigin = "50px 97px";
  if (look.style.transform !== t) look.style.transform = t;
}

export const frames: Record<string, Frame> = {
  "ledger-groove": (el, p, _age, ctx) => {
    const svg = el.querySelector<SVGSVGElement>(".ledger-groove");
    const at = ctx.actor("caster");
    if (!svg || !at) return;
    const d = svg.dataset;
    // The blade's point drags behind the Reaver, who is walking left.
    const tipX = at.x + at.h * Number(d.tip);
    const y = at.y + at.h * Number(d.lift);
    const from = Math.max(tipX, Number(d.from));
    const wob = (x: number) => y + Math.sin(x * 0.013) * 3;
    let line = "";
    for (let x = tipX; x <= from + 1; x += 40) line += `${line ? " L" : "M"}${x.toFixed(0)} ${wob(x).toFixed(1)}`;
    const set = (sel: string, dd: string) => {
      const n = svg.querySelector(sel);
      if (n && n.getAttribute("d") !== dd) n.setAttribute("d", dd);
    };
    set(".ledger-groove-shadow", line);
    set(".ledger-groove-cut", line);
    set(".ledger-groove-lip", line);
    svg.querySelectorAll<SVGEllipseElement>(".ledger-groove-spot").forEach((s, i) => {
      const k = Number(s.dataset.k);
      const x = tipX + (from - tipX) * k;
      const show = x > tipX + 30 && x < 1650;
      s.setAttribute("cx", x.toFixed(0));
      s.setAttribute("cy", (wob(x) + (i % 2 ? 7 : -5)).toFixed(1));
      s.style.opacity = show ? "0.9" : "0";
    });
    svg.style.setProperty("--k", p.toFixed(3));
  },

  "ledger-cut": (el, p, age) => {
    const svg = el.querySelector<SVGSVGElement>(".ledger-cut");
    if (!svg) return;
    const d = svg.dataset;
    const g = svg.querySelector(".ledger-cut-at");
    place(g, Number(d.x), Number(d.y), Number(d.angle), Number(d.size));
    // Painted across the screen in two frames, and gone a little after the picture comes back.
    reveal(svg.querySelector(".ledger-stroke"), age / 30);
    svg.style.opacity = String(clamp(1 - (p - 0.55) / 0.45));
  },

  "ledger-entries": (el, p, age, ctx) => {
    const svg = el.querySelector<SVGSVGElement>(".ledger-entries");
    if (!svg) return;
    const d = svg.dataset;
    const root = rootOf(el);
    const angle = Number(d.angle);
    const gap = Number(d.gap);
    const chest = Number(d.chest);
    const shotMs = age / Math.max(0.0001, p);
    const groups = svg.querySelectorAll<SVGGElement>(".ledger-entry");
    groups.forEach((g, i) => {
      const at: At | undefined = ctx.actor(`targets-${i}`);
      if (!at) {
        if (g.style.display !== "none") g.style.display = "none";
        return;
      }
      if (g.style.display) g.style.display = "";
      // The target's is entered on the blow; each copy a beat after the last.
      const lands = i === 0 ? 0 : gap * (i + 0.6);
      const since = p - lands;
      const k = since <= 0 ? 0 : clamp((since * (Number.isFinite(shotMs) ? shotMs : 800)) / 45);
      // The figure is knocked back as its entry lands, and comes back a little:
      // away from the Reaver (the row faces it, so away is +x), top first.
      const hit = since <= 0 ? 0 : easeOut(since / 0.05) * (1 - clamp((since - 0.08) / 0.5) * 0.55);
      const scale = at.h / 84;
      const push = (i === 0 ? 44 : 30) * hit;
      const tip = (i === 0 ? 10 : 7) * hit;
      knock(lookOf(root, "targets", i), hit ? `translateX(${(push / scale).toFixed(1)}px) rotate(${tip.toFixed(2)}deg)` : "");
      // Struck through, as a settled account is: right across the figure at
      // the chest, landing on the side the blow came from, and carried with
      // the figure as it goes over. The target's is doubled.
      const long = at.h * (i === 0 ? 1.0 : 0.9);
      const across = i === 0 ? 0.46 : 0.36;
      const size = long / 25;
      const r0 = (angle * Math.PI) / 180;
      const lift = at.h * chest;
      const t = (tip * Math.PI) / 180;
      const ox = at.x + push + Math.sin(t) * lift;
      const oy = at.y - Math.cos(t) * lift;
      const cx = ox - Math.cos(r0) * long * 0.5;
      const cy = oy - Math.sin(r0) * long * 0.5 - (i === 0 ? at.h * 0.07 : 0);
      place(g.querySelector(".ledger-entry-a"), cx, cy, angle + tip, size, across);
      reveal(g.querySelector(".ledger-entry-a .ledger-stroke"), k);
      if (i === 0) {
        const off = at.h * 0.15;
        const r = ((angle + tip) * Math.PI) / 180;
        place(g.querySelector(".ledger-entry-b"), cx - Math.sin(r) * off + at.h * 0.04, cy + Math.cos(r) * off, angle + tip, size * 0.86, across);
        reveal(g.querySelector(".ledger-entry-b .ledger-stroke"), (k - 0.35) / 0.65);
      }
    });
    // The Reaver's whole body goes after the blade, and too far: over the
    // front foot on the blow, sunk into it, then pulled half back.
    const caster = lookOf(root, "caster");
    const at = ctx.actor("caster");
    if (caster && at && Number(d.lunge)) {
      const scale = at.h / 84;
      const k = easeOut(p / 0.04);
      const back = clamp((p - 0.3) / 0.6);
      const lean = 17 * k - 6 * back;
      const reach = (34 * k - 10 * back) / scale;
      const sink = (10 * k - 4 * back) / scale;
      knock(
        caster,
        `translate(${reach.toFixed(1)}px, ${sink.toFixed(1)}px) rotate(${lean.toFixed(2)}deg) scale(${(1 + 0.06 * k - 0.03 * back).toFixed(3)}, ${(1 - 0.1 * k + 0.05 * back).toFixed(3)})`,
      );
    }
  },

  "ledger-mark": (el, p) => {
    // Which unit is this? The first mark on the targets is the target: doubled.
    const unit = el.dataset.anchor;
    const mark = el.querySelector<HTMLElement>(".ledger-mark");
    if (!mark || !unit) return;
    if (mark.dataset.role === undefined) {
      const price = mark.dataset.price !== undefined;
      const first = el.parentElement?.querySelector<HTMLElement>('.cine-anchored[data-vfx="ledger-mark"]:not(:has([data-price]))');
      mark.dataset.role = price ? "price" : first === el ? "target" : "row";
    }
    const k = clamp(p / 0.2);
    reveal(mark.querySelector(".ledger-mark-a .ledger-stroke"), k);
    reveal(mark.querySelector(".ledger-mark-b .ledger-stroke"), mark.dataset.role === "target" ? (k - 0.4) / 0.6 : 0);
  },
};
