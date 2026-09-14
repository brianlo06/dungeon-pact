import { useEffect, useRef, type ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ease } from "../../cinematic/timeline";
import "./style.css";

/**
 * Elegy for the Standing's effects.
 *
 * The idea they serve: the Dirgesinger sings an enemy's funeral while it is
 * still standing, and the enemy's own shadow believes the song — it lies down
 * in the grave dug for it, and on the last note the earth closes over it.
 *
 *   elegy-shadow    the target's shadow, copied off its figure in mourning black and
 *                   joined to its feet, laid down note by note along an open grave
 *                   (`lay`), or seen full length from the head of the grave (`quiet`);
 *                   buried under the heaped earth at `bury`
 *   elegy-clods     the earth thrown in: clods and sods flung up along the grave and falling
 *   elegy-negative  the impact frame: black, with every figure and the shadow in bone
 *   elegy-leaf      a leaf of the Herald's laurel coming loose and falling
 *   elegy-board     on the real battlefield: the target's shadow standing up out of the
 *                   floor behind it (`rise`); after, the fresh grave it lies in (`grave`)
 *                   and a laurel leaf settling on every ally (`laurel`)
 *
 * The song is never drawn. There are no lines of sound, no notes, no rings:
 * it is seen in what it does to the one it is for. And the shadow is not a
 * shadow cast by any light (nothing in the burying ground casts one): it is
 * the enemy's own shape in mourning black, edged in half-mourning lilac, with
 * a will of its own — it stands up, is laid down, and is buried.
 *
 * The engine gives a figure slot to one shared effect only, so the shadow is
 * the stage's own target node, copied (`cloneNode`) into this effect's box,
 * stripped of everything that names it (parts, ids, the actor classes) so
 * nothing that reads the cast can mistake it for the figure, and filled black
 * by class. It is removed with its shot. No filters and no keyframes: every
 * move is a transform or an attribute written from a frame function.
 */

export const INK = "#0d0b12";
export const BONE = "#efe9dc";
export const LILAC = "#c6b4e8";
const CLAY = "#5b4436";
const CLAY_LIT = "#7d6353";
const CLAY_DARK = "#2a1d17";
const LEAF = "#9fb05a";

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const span = (p: number, a: number, b: number) => clamp((p - a) / Math.max(0.0001, b - a));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const f1 = (n: number) => n.toFixed(1);
const f3 = (n: number) => n.toFixed(3);
const rootOf = (el: Element) => el.closest<HTMLElement>(".ult-cinematic");
type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

const setAttr = (el: Element | null | undefined, name: string, value: string) => {
  if (el && el.getAttribute(name) !== value) el.setAttribute(name, value);
};
const setTransform = (el: HTMLElement | SVGElement | null | undefined, value: string) => {
  if (el && el.style.transform !== value) el.style.transform = value;
};
const setOpacity = (el: HTMLElement | SVGElement | null | undefined, value: number) => {
  const o = value.toFixed(3);
  if (el && el.style.opacity !== o) el.style.opacity = o;
};

/** A cue's params as data attributes on the renderer's root element. */
function data(cue: VfxProps["cue"]) {
  const out: Record<string, string> = {};
  for (const [k, x] of Object.entries(cue.params ?? {})) out[`data-${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = String(x);
  return out;
}
const num = (d: DOMStringMap, k: string, fallback: number) => (d[k] === undefined || d[k] === "" ? fallback : Number(d[k]));
const list = (d: DOMStringMap, k: string, fallback: number[]) => (d[k] ? d[k]!.split(",").map(Number) : fallback);

/** A hand-cut lump: a closed polygon of `n` points, fixed for one seed. */
function lump(r: number, seed: number, n = 7, rough = 0.38) {
  const rand = seeded(seed);
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.5;
    const rr = r * (1 - rough / 2 + rand() * rough);
    d += `${i ? "L" : "M"}${f1(Math.cos(a) * rr)} ${f1(Math.sin(a) * rr * 0.78)} `;
  }
  return `${d}Z`;
}

/** A laurel leaf, the circlet's own shape, pointing along +x from its stalk. */
export const LEAF_PATH = "M0 0 Q2.2 -2 4.6 0 Q2.2 2 0 0 Z";

/* ── The shadow ────────────────────────────────────────────────────────── */

interface Shade {
  /** The stage's node the copy mirrors. */
  source: HTMLElement;
  wrap: HTMLDivElement;
  copy: HTMLElement;
  /** A second copy a shade larger, in half-mourning lilac: the shadow's edge. */
  halo: HTMLElement;
  /** The target as it stood when the shadow was last joined to it, world units. */
  foot: { x: number; y: number; h: number };
}

const SHADES = new WeakMap<HTMLElement, Shade | null>();

/** Copy a stage actor node as a shadow: no names, no glow, no animator. */
function shadowOf(node: HTMLElement): HTMLElement {
  const copy = node.cloneNode(true) as HTMLElement;
  copy.className = "elegy-shade-art";
  for (const attr of ["data-role", "data-look", "data-root", "style"]) copy.removeAttribute(attr);
  for (const inner of copy.querySelectorAll("[data-part], [id], [data-clip], .cine-anchor")) {
    if (inner.classList.contains("cine-anchor")) {
      inner.remove();
      continue;
    }
    inner.removeAttribute("data-part");
    inner.removeAttribute("id");
    inner.removeAttribute("data-clip");
  }
  copy.querySelector(".cine-rig")?.classList.replace("cine-rig", "elegy-shade-rig");
  copy.querySelector(".cine-look")?.classList.replace("cine-look", "elegy-shade-look");
  return copy;
}

function shade(el: HTMLElement): Shade | null {
  let s = SHADES.get(el);
  if (s !== undefined) return s;
  const root = rootOf(el);
  const source = root?.querySelector<HTMLElement>('.cine-actors > .cine-actor[data-role="targets"]');
  const slot = el.querySelector<HTMLElement>(".elegy-shadow-slot");
  if (!source || !slot || source.style.display === "none") return null;
  const wrap = document.createElement("div");
  wrap.className = "elegy-shade";
  const halo = shadowOf(source);
  halo.classList.add("elegy-shade-halo");
  const copy = shadowOf(source);
  wrap.appendChild(halo);
  wrap.appendChild(copy);
  slot.appendChild(wrap);
  s = { source, wrap, copy, halo, foot: { x: 0, y: 0, h: 100 } };
  SHADES.set(el, s);
  return s;
}

/** The angle the song has laid the shadow down to at `p`: one step per note. */
function laidAngle(p: number, notes: number[], stages: number[], fall: number) {
  let angle = 0;
  for (let i = 0; i < notes.length; i++) {
    const k = span(p, notes[i], notes[i] + fall);
    if (k <= 0) break;
    // Felled: slow to go, then down past where it rests, and a small settle.
    const e = k < 0.8 ? 1.06 * ease("in", k / 0.8) : 1.06 - 0.06 * ease("out", (k - 0.8) / 0.2);
    angle = lerp(i ? stages[i - 1] : 0, stages[i], e);
  }
  return angle;
}

const shadow: Frame = (el, p, _age, ctx) => {
  const box = el.querySelector<HTMLElement>(".elegy-shadow");
  const s = shade(el);
  const t = ctx.actor("targets-0");
  if (!box || !s || !t) return;
  const d = box.dataset;
  const mode = d.mode ?? "lay";
  const bury = num(d, "bury", 2);
  // Joined to the feet until the earth goes in; after that it stays in the grave.
  if (p < bury || !s.foot.h || s.foot.h === 100) {
    s.foot = { x: t.x, y: t.y, h: t.h };
    const rig = s.source.querySelector<HTMLElement>(".cine-rig");
    for (const own of [s.copy, s.halo]) {
      setTransform(own, s.source.style.transform);
      const node = own.querySelector<HTMLElement>(".elegy-shade-rig");
      if (rig && node && node.style.transform !== rig.style.transform) node.style.transform = rig.style.transform;
    }
  }
  const { x, y, h } = s.foot;
  s.wrap.style.transformOrigin = `${f1(x)}px ${f1(y)}px`;
  const rise = num(d, "rise", 0);
  const appear = rise > 0 ? ease("out", span(p, 0, rise)) : 1;

  if (mode === "quiet") {
    // From the head of the grave: the shadow laid full length towards the lens.
    const persp = num(d, "persp", 700);
    const tilt = num(d, "tilt", -62);
    const sx = num(d, "sx", 1.2);
    const sy = num(d, "sy", 2.6);
    setTransform(s.wrap, `perspective(${persp}px) rotateX(${tilt}deg) scale(${f3(sx)}, ${f3(-sy)})`);
    setOpacity(s.wrap, 0.94 * appear);
  } else {
    const notes = list(d, "notes", [0.2, 0.45, 0.7]);
    const stages = list(d, "stages", [-24, -58, -90]);
    const fall = num(d, "fall", 0.13);
    const laid = d.laid !== undefined ? -90 : laidAngle(p, notes, stages, fall);
    const k = Math.abs(laid) / 90;
    const reach = num(d, "reach", x - h * 1.3);
    const length = Math.max(h * 0.6, x - reach);
    const band = num(d, "band", 0.5);
    const stretch = lerp(1.05, length / Math.max(1, h), k);
    const flat = lerp(1, band, k ** 1.6);
    // Standing up out of the ground at the start, as the song begins.
    const up = appear;
    const sink = span(p, bury, bury + 0.2);
    setTransform(
      s.wrap,
      `translate(0px, ${f1(sink * 26)}px) scale(1, ${f3(flat * lerp(0.05, 1, up))}) rotate(${f1(laid)}deg) scale(1, ${f3(stretch)})`,
    );
    setOpacity(s.wrap, (0.2 + 0.72 * up) * (1 - ease("in", sink)));

    // The grave it lies in: dug from the feet to where the head will be.
    const grave = box.querySelector<SVGSVGElement>(".elegy-grave");
    if (grave) {
      const depth = num(d, "depth", Math.max(44, h * 0.3));
      const x0 = reach - depth * 0.6;
      const x1 = x - depth * 0.35;
      const lip = depth * 0.5;
      const key = `${f1(x0)},${f1(x1)},${f1(y)},${f1(depth)}`;
      if (grave.dataset.key !== key) {
        grave.dataset.key = key;
        const rand = seeded(29);
        let heap = `M${f1(x0 - depth * 0.8)} ${f1(y - lip)}`;
        for (let i = 1; i <= 9; i++) {
          const kk = i / 9;
          heap += ` L${f1(lerp(x0 - depth * 0.5, x1 + depth * 0.6, kk))} ${f1(y - lip - Math.sin(kk * Math.PI) * depth * (0.9 + rand() * 0.5))}`;
        }
        heap += ` L${f1(x1 + depth * 1.1)} ${f1(y - lip * 0.6)} Z`;
        setAttr(grave.querySelector(".elegy-grave-heap"), "d", heap);
        setAttr(grave.querySelector(".elegy-grave-pit"), "d", `M${f1(x0)} ${f1(y - lip)} L${f1(x1)} ${f1(y - lip)} L${f1(x1 + depth * 0.25)} ${f1(y + lip)} L${f1(x0 - depth * 0.25)} ${f1(y + lip)} Z`);
        setAttr(grave.querySelector(".elegy-grave-wall"), "d", `M${f1(x0)} ${f1(y - lip)} L${f1(x1)} ${f1(y - lip)} L${f1(x1 - depth * 0.05)} ${f1(y - lip * 0.2)} L${f1(x0 + depth * 0.05)} ${f1(y - lip * 0.2)} Z`);
        const near = box.querySelector(".elegy-grave-near");
        let lipPath = `M${f1(x0 - depth * 0.35)} ${f1(y + lip)}`;
        for (let i = 1; i <= 8; i++) {
          const kk = i / 8;
          lipPath += ` L${f1(lerp(x0 - depth * 0.3, x1 + depth * 0.3, kk))} ${f1(y + lip - depth * (0.08 + rand() * 0.14))}`;
        }
        lipPath += ` L${f1(x1 + depth * 0.4)} ${f1(y + lip + depth * 0.5)} L${f1(x0 - depth * 0.45)} ${f1(y + lip + depth * 0.5)} Z`;
        setAttr(near?.querySelector(".elegy-grave-lip") ?? null, "d", lipPath);
        // The grave filled: one long mound over where it was.
        let mound = `M${f1(x0 - depth * 0.5)} ${f1(y + lip * 0.9)}`;
        for (let i = 1; i <= 10; i++) {
          const kk = i / 10;
          mound += ` L${f1(lerp(x0 - depth * 0.4, x1 + depth * 0.4, kk))} ${f1(y - Math.sin(kk * Math.PI) ** 0.6 * depth * (0.75 + rand() * 0.35))}`;
        }
        mound += ` L${f1(x1 + depth * 0.5)} ${f1(y + lip * 0.9)} Z`;
        setAttr(near?.querySelector(".elegy-grave-mound") ?? null, "d", mound);
      }
      const fill = span(p, bury, bury + 0.3);
      const mound = box.querySelector<SVGPathElement>(".elegy-grave-mound");
      if (mound) {
        // Half of it lands on the frame the stop holds.
        const k2 = fill > 0 ? 0.45 + 0.55 * ease("out", fill) : 0;
        mound.style.transformOrigin = `${f1((x0 + x1) / 2)}px ${f1(y + lip)}px`;
        setTransform(mound, `scale(1, ${f3(k2)})`);
        setOpacity(mound, fill > 0 ? 1 : 0);
      }
    }
  }
  const leaf = box.querySelector<SVGGElement>(".elegy-shadow-leaf");
  if (leaf) setOpacity(leaf, span(p, 0, 0.05));
};

function ShadowRenderer({ cue }: VfxProps): ReactNode {
  const mode = String(cue.params?.mode ?? "lay");
  const lx = Number(cue.params?.leafX ?? 0);
  const ly = Number(cue.params?.leafY ?? 0);
  const ls = Number(cue.params?.leafScale ?? 1);
  return (
    <div className="elegy-shadow" {...data(cue)}>
      {mode !== "quiet" && (
        <svg className="elegy-grave" viewBox="0 0 1600 900" aria-hidden="true">
          <path className="elegy-grave-heap" />
          <path className="elegy-grave-pit" />
          <path className="elegy-grave-wall" />
        </svg>
      )}
      <div className="elegy-shadow-slot" />
      {mode !== "quiet" && (
        <svg className="elegy-grave elegy-grave-near" viewBox="0 0 1600 900" aria-hidden="true">
          <path className="elegy-grave-lip" />
          <path className="elegy-grave-mound" />
        </svg>
      )}
      {mode === "quiet" && (
        <svg className="elegy-grave" viewBox="0 0 1600 900" aria-hidden="true">
          <g className="elegy-shadow-leaf" transform={`translate(${lx} ${ly}) scale(${ls}) rotate(-28)`}>
            <path d={LEAF_PATH} transform="scale(9)" fill={LEAF} stroke={INK} strokeWidth={0.12} />
            <path d="M2 0 H38" stroke="#6f7d3a" strokeWidth={1.4} />
          </g>
        </svg>
      )}
    </div>
  );
}

/* ── The quiet's grave, from its head ─────────────────────────────────── */

/**
 * The open grave seen lengthwise from where the head goes: two walls of raw
 * clay closing to the far end where the enemy stands, the spoil heaped along
 * both sides, the near lip across the bottom of the frame, and a few grains
 * of earth running off it. Drawn in world units from `fx, fy` (the far end)
 * to the frame's bottom.
 */
function QuietGraveRenderer({ cue }: VfxProps): ReactNode {
  const fx = Number(cue.params?.fx ?? 800);
  const fy = Number(cue.params?.fy ?? 560);
  const fw = Number(cue.params?.fw ?? 70);
  const ny = Number(cue.params?.ny ?? 980);
  const nw = Number(cue.params?.nw ?? 900);
  const rand = seeded(88);
  const heapL = `M${f1(fx - fw * 0.6)} ${f1(fy)} Q${f1(fx - nw * 0.5)} ${f1(fy + (ny - fy) * 0.35)} ${f1(fx - nw * 0.95)} ${f1(ny - 120)} L${f1(fx - nw * 1.4)} ${ny + 80} L${f1(fx - nw * 0.62)} ${ny + 80} L${f1(fx - fw * 0.5)} ${f1(fy + 4)} Z`;
  const heapR = `M${f1(fx + fw * 0.6)} ${f1(fy)} Q${f1(fx + nw * 0.5)} ${f1(fy + (ny - fy) * 0.3)} ${f1(fx + nw * 0.9)} ${f1(ny - 150)} L${f1(fx + nw * 1.4)} ${ny + 80} L${f1(fx + nw * 0.62)} ${ny + 80} L${f1(fx + fw * 0.5)} ${f1(fy + 4)} Z`;
  const pit = `M${f1(fx - fw * 0.5)} ${f1(fy + 4)} L${f1(fx + fw * 0.5)} ${f1(fy + 4)} L${f1(fx + nw * 0.62)} ${ny + 80} L${f1(fx - nw * 0.62)} ${ny + 80} Z`;
  const grains = Array.from({ length: 9 }, (_, i) => ({
    x: fx - nw * 0.42 + rand() * 60 + (i % 3) * 14,
    y: ny - 40 - rand() * 50,
    r: 3 + rand() * 5,
    seed: 400 + i,
  }));
  return (
    <div className="elegy-quiet" {...data(cue)}>
      <svg className="elegy-grave" viewBox="0 0 1600 900" aria-hidden="true">
        <path className="elegy-quiet-pit" d={pit} />
        <path className="elegy-quiet-heap" d={heapL} />
        <path className="elegy-quiet-heap" d={heapR} />
        <g className="elegy-quiet-grains">
          {grains.map((g, i) => (
            <path key={i} className="elegy-quiet-grain" d={lump(g.r, g.seed, 5)} data-x={g.x} data-y={g.y} transform={`translate(${f1(g.x)} ${f1(g.y)})`} />
          ))}
        </g>
      </svg>
    </div>
  );
}

const quietGrave: Frame = (el, p) => {
  // Nothing moves in the quiet but a little earth running off the near lip.
  for (const [i, g] of el.querySelectorAll<SVGPathElement>(".elegy-quiet-grain").entries()) {
    const k = ((p * 1.6 + i * 0.13) % 1) ** 2;
    setAttr(g, "transform", `translate(${f1(Number(g.dataset.x) + i * 2 * k)} ${f1(Number(g.dataset.y) + k * 140)})`);
    setAttr(g, "opacity", f3(k < 0.9 ? 1 : (1 - k) * 10));
  }
};

/* ── The earth thrown in ──────────────────────────────────────────────── */

interface Clod {
  x: number;
  y: number;
  /** Peak height, lateral drift, spin, size. */
  h: number;
  dx: number;
  spin: number;
  r: number;
  delay: number;
  tone: number;
}

function ClodsRenderer({ cue }: VfxProps): ReactNode {
  const rand = seeded(cue.seed ?? 12);
  const n = Number(cue.params?.count ?? 46);
  const clods: Clod[] = Array.from({ length: n }, (_, i) => ({
    x: rand(),
    y: rand(),
    h: 0.45 + rand() * 0.75,
    dx: (rand() - 0.5) * 2,
    spin: (rand() - 0.5) * 540,
    // A handful of whole sods among the crumbs.
    r: 9 + rand() * rand() * 34 + (i < 7 ? 26 : 0),
    delay: rand() * 0.07,
    tone: Math.floor(rand() * 3),
  }));
  return (
    <div className="elegy-clods" {...data(cue)}>
      <svg className="elegy-grave" viewBox="0 0 1600 900" aria-hidden="true">
        <path className="elegy-clods-wall" data-side="-1" />
        <path className="elegy-clods-wall" data-side="1" />
        <path className="elegy-clods-heap" />
        {clods.map((c, i) => (
          <path
            key={i}
            className={`elegy-clod elegy-clod-${c.tone}`}
            d={lump(c.r, 700 + i)}
            data-x={c.x}
            data-y={c.y}
            data-h={c.h}
            data-dx={c.dx}
            data-spin={c.spin}
            data-delay={c.delay}
          />
        ))}
      </svg>
    </div>
  );
}

/**
 * Clods flung up from both sides of the grave along its whole length, from the
 * stake (`x0`) to the feet (`x1`, or the target's own feet). The first frame
 * already has them in the air: the stop holds the earth rising, not lying.
 */
const clods: Frame = (el, p, _age, ctx) => {
  const box = el.querySelector<HTMLElement>(".elegy-clods");
  if (!box) return;
  const d = box.dataset;
  const t = ctx.actor("targets-0");
  const x1 = num(d, "x1", t ? t.x - 20 : 1200);
  const x0 = num(d, "x0", x1 - 500);
  const y = num(d, "y", t ? t.y : 800);
  const rise = num(d, "rise", 260);
  const life = num(d, "life", 0.6);
  // The spoil heaped along both sides goes in first, as two slabs of clay
  // tipping over the grave and meeting above it.
  for (const wall of box.querySelectorAll<SVGPathElement>(".elegy-clods-wall")) {
    const side = Number(wall.dataset.side);
    const tall = rise * 0.5;
    const key = `${f1(x0)},${f1(x1)},${f1(y)},${side}`;
    if (wall.dataset.key !== key) {
      wall.dataset.key = key;
      const rand = seeded(side > 0 ? 91 : 17);
      let path = `M${f1(x0 - 30)} ${f1(y + side * 24)}`;
      for (let i = 1; i <= 12; i++) {
        const k = i / 12;
        path += ` L${f1(lerp(x0 - 30, x1 + 40, k))} ${f1(y + side * (24 + tall * (0.55 + rand() * 0.5) * Math.sin(k * Math.PI) ** 0.4))}`;
      }
      path += ` L${f1(x1 + 40)} ${f1(y + side * 24)} Z`;
      wall.setAttribute("d", path);
      wall.style.transformOrigin = `${f1((x0 + x1) / 2)}px ${f1(y)}px`;
    }
    const k = ease("out", clamp(0.42 + p / 0.34));
    setTransform(wall, `translate(0px, ${f1(-side * tall * 0.5 * (1 - k))}px) scale(1, ${f3(lerp(1.25, 0.3, k))})`);
    setOpacity(wall, clamp(p * 20));
  }
  // The heap that lands over the feet, so the enemy is dragged into the ground
  // and not simply lowered.
  const heap = box.querySelector<SVGPathElement>(".elegy-clods-heap");
  if (heap) {
    const w = num(d, "heap", 210);
    const key = `${f1(x1)},${f1(y)},${f1(w)}`;
    if (heap.dataset.key !== key) {
      heap.dataset.key = key;
      const rand = seeded(51);
      let path = `M${f1(x1 - w * 0.9)} ${f1(y + 26)}`;
      for (let i = 1; i <= 9; i++) {
        const k = i / 9;
        path += ` L${f1(lerp(x1 - w * 0.85, x1 + w * 0.5, k))} ${f1(y + 14 - Math.sin(k * Math.PI) ** 0.5 * w * (0.3 + rand() * 0.16))}`;
      }
      path += ` L${f1(x1 + w * 0.55)} ${f1(y + 26)} Z`;
      heap.setAttribute("d", path);
      heap.style.transformOrigin = `${f1(x1)}px ${f1(y + 26)}px`;
    }
    const k = ease("out", clamp(p / 0.3));
    setTransform(heap, `scale(1, ${f3(0.7 + 0.3 * k)})`);
    setOpacity(heap, clamp(p * 14));
  }
  for (const c of box.querySelectorAll<SVGPathElement>(".elegy-clod")) {
    const cd = c.dataset;
    const q = clamp(0.17 + (p - Number(cd.delay)) / life, 0, 1.2);
    const along = Number(cd.x);
    const side = Number(cd.y) < 0.5 ? -1 : 1;
    const hx = lerp(x0, x1, along) + Number(cd.dx) * 60 * q;
    const arc = 4 * Math.min(q, 1) * (1 - Math.min(q, 1));
    const hy = y + side * 18 - Number(cd.h) * rise * arc + (q > 1 ? (q - 1) * 80 : 0);
    setAttr(c, "transform", `translate(${f1(hx)} ${f1(hy)}) rotate(${f1(Number(cd.spin) * q)})`);
    setAttr(c, "opacity", f3(q < 1 ? 1 : clamp(1 - (q - 1) * 6)));
  }
};

/* ── The negative ─────────────────────────────────────────────────────── */

function NegativeRenderer({ cue }: VfxProps): ReactNode {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = ref.current;
    return () => {
      // Whatever ended it — the frame, the shot, a skip — the film is left in colour.
      const root = node ? rootOf(node) : null;
      root?.removeAttribute("data-elegy-negative");
    };
  }, []);
  return <i ref={ref} className="elegy-negative" {...data(cue)} />;
}

/** Black, with every figure and the shadow in bone, for `ms` of the shot's opening. */
const negative: Frame = (el, _p, age) => {
  const mark = el.querySelector<HTMLElement>(".elegy-negative");
  const root = rootOf(el);
  if (!mark || !root) return;
  const ms = num(mark.dataset, "ms", 60);
  root.toggleAttribute("data-elegy-negative", age < ms);
};

/* ── The laurel leaf ──────────────────────────────────────────────────── */

function LeafRenderer({ cue }: VfxProps): ReactNode {
  return (
    <div className="elegy-leaf" {...data(cue)}>
      <svg viewBox="-60 -60 120 120" aria-hidden="true">
        <g className="elegy-leaf-turn">
          <path d={LEAF_PATH} transform="translate(-23 0) scale(10)" fill={LEAF} stroke={INK} strokeWidth={0.11} />
          <path d="M-21 0 Q0 -1.5 20 0" stroke="#6f7d3a" strokeWidth={1.3} fill="none" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Held on the circlet until `from`, then loose: it slips, turns over and falls
 * with a slow side-to-side, the way a leaf does and a stone does not.
 */
const leaf: Frame = (el, p) => {
  const box = el.querySelector<HTMLElement>(".elegy-leaf");
  const turn = el.querySelector<SVGGElement>(".elegy-leaf-turn");
  if (!box || !turn) return;
  const d = box.dataset;
  const from = num(d, "from", 0.2);
  const k = span(p, from, 1);
  const fall = num(d, "fall", 420);
  const sway = num(d, "sway", 60);
  const y = fall * (k ** 1.35);
  const x = sway * Math.sin(k * Math.PI * 2.1) * (0.4 + k) - k * num(d, "drift", 40);
  const r = num(d, "rot", -30) + Math.sin(k * Math.PI * 2.1 + 0.6) * 38 + k * num(d, "spin", 80);
  // A leaf turning over shows its edge: narrow, then broad again.
  const face = 0.35 + 0.65 * Math.abs(Math.cos(k * Math.PI * 1.7));
  setTransform(box, `translate(-50%, -50%) translate(${f1(x)}px, ${f1(y)}px) scale(var(--s))`);
  setAttr(turn, "transform", `rotate(${f1(r)}) scale(1 ${f3(face)})`);
};

/* ── On the real battlefield ──────────────────────────────────────────── */

const BOARD = new WeakMap<HTMLElement, boolean>();

function BoardRenderer({ cue }: VfxProps): ReactNode {
  const mode = String(cue.params?.mode ?? "stretch");
  return (
    <div className="elegy-board" data-mode={mode} {...data(cue)}>
      {mode !== "laurel" && <div className="elegy-board-shade" />}
      {mode === "grave" && (
        <svg className="elegy-board-grave" viewBox="-100 -26 200 40" preserveAspectRatio="none" aria-hidden="true">
          {/* A long, low mound of turned clay, lumpy the way a spade leaves it. */}
          <path
            className="elegy-board-mound"
            d="M-100 12 L-90 4 L-76 -2 L-58 -7 L-40 -5 L-22 -11 L-2 -9 L18 -13 L38 -9 L58 -11 L76 -5 L90 1 L100 12 Z"
          />
          <path className="elegy-board-mound-lit" d="M-84 1 L-60 -5 L-40 -3 L-22 -9 L-2 -7 L18 -11 L40 -7 L60 -9 L78 -3 L56 -4 L34 -5 L12 -7 L-12 -5 L-40 -1 L-62 -1 Z" />
        </svg>
      )}
      {mode === "grave" && (
        /* The Herald's own laurel, laid on the grave as a wreath. */
        <svg className="elegy-board-sprig" viewBox="-40 -22 80 44" aria-hidden="true">
          <ellipse cx={0} cy={0} rx={28} ry={12} fill="none" stroke="#6f7d3a" strokeWidth={2.4} />
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const x = Math.cos(a) * 28;
            const y = Math.sin(a) * 12;
            return (
              <path
                key={i}
                d={LEAF_PATH}
                transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((a * 180) / Math.PI + 96).toFixed(0)}) scale(1.9)`}
                fill={LEAF}
                stroke={INK}
                strokeWidth={0.3}
              />
            );
          })}
          <path d="M-6 11 Q0 19 6 11" stroke={LILAC} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        </svg>
      )}
      {mode === "laurel" && (
        <svg className="elegy-board-leaf" viewBox="-30 -30 60 60" aria-hidden="true">
          <g className="elegy-board-leaf-turn">
            <path d={LEAF_PATH} transform="translate(-12 0) scale(5)" fill={LEAF} stroke={INK} strokeWidth={0.2} />
          </g>
        </svg>
      )}
    </div>
  );
}

const board: Frame = (el, p, age) => {
  const box = el.querySelector<HTMLElement>(".elegy-board");
  if (!box) return;
  const mode = box.dataset.mode;
  const unit = el.dataset.anchor;
  if (mode !== "laurel" && !BOARD.get(el) && unit) {
    const art = document.querySelector<HTMLElement>(`.stage [data-unit="${CSS.escape(unit)}"] .combatant-rig svg`);
    const slot = box.querySelector<HTMLElement>(".elegy-board-shade");
    if (art && slot) {
      const copy = art.cloneNode(true) as SVGElement;
      copy.removeAttribute("class");
      copy.removeAttribute("style");
      for (const inner of copy.querySelectorAll("[id], [data-part]")) {
        inner.removeAttribute("id");
        inner.removeAttribute("data-part");
      }
      copy.classList.add("elegy-board-art");
      slot.appendChild(copy);
      BOARD.set(el, true);
    }
  }
  const shadeEl = box.querySelector<HTMLElement>(".elegy-board-shade");
  if (mode === "rise") {
    // Not a shadow cast by any light: it stands up out of the floor behind
    // the enemy, its own height, and by the end of the call has begun to lean
    // away from it, the way the song will lay it down.
    const up = ease("out", span(p, 0, 0.7));
    const lean = ease("in", span(p, 0.55, 1)) * 16;
    setTransform(shadeEl, `translate(${f1(-6 - up * 10)}%, 0) rotate(${f1(-lean)}deg) scale(0.96, ${f3(0.04 + up * 0.96)})`);
    setOpacity(shadeEl, 0.82 * span(p, 0, 0.15));
  } else if (mode === "grave") {
    setTransform(shadeEl, `translateY(3px) scale(1, 0.12) rotate(-90deg) scale(1, 0.78)`);
    setOpacity(shadeEl, 0.5 * span(p, 0, 0.25));
    const up = ease("out", span(p, 0, 0.3));
    box.style.setProperty("--up", f3(up));
    box.style.setProperty("--sprig", f3(ease("back", span(p, 0.25, 0.55))));
  } else if (mode === "laurel") {
    const k = span(p, 0, 0.7);
    const y = lerp(-1.25, -0.62, k ** 1.3);
    const x = Math.sin(k * Math.PI * 2) * 0.12 * (1 - k);
    box.style.setProperty("--ly", f3(y));
    box.style.setProperty("--lx", f3(x));
    box.style.setProperty("--lr", f1(-30 + Math.sin(k * 6.3) * 40 + k * 60));
    box.style.setProperty("--lo", f3(span(p, 0, 0.12) * (1 - span(age, 0, 1) * 0)));
  }
};

/* ── Registered ────────────────────────────────────────────────────────── */

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "elegy-shadow": ShadowRenderer,
  "elegy-quiet": QuietGraveRenderer,
  "elegy-clods": ClodsRenderer,
  "elegy-negative": NegativeRenderer,
  "elegy-leaf": LeafRenderer,
  "elegy-board": BoardRenderer,
};

export const frames: Record<string, Frame> = {
  "elegy-shadow": shadow,
  "elegy-quiet": quietGrave,
  "elegy-clods": clods,
  "elegy-negative": negative,
  "elegy-leaf": leaf,
  "elegy-board": board,
};
