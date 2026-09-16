import type { CSSProperties, ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ease } from "../../cinematic/timeline";
import { BLIGHT, GOLD, LAMP, MOULD, SEED } from "./background";
import "./style.css";

/**
 * Every Head Bowed's effects.
 *
 * The idea they serve: everything that grows turns its face to the Warden's
 * lantern, so when the Blightcaller sets the lantern down in the dirt, every
 * head goes down after it and rots where it bows.
 *
 *   bowed-field   rows of sunflowers, drawn in world units, whose heads look at wherever the
 *                 caster's copy's lantern really is this frame (read off the rig), lit by their
 *                 distance from it, and which bow — neck hooked, head hung, black, mould on
 *                 it — at `bowAt`
 *   bowed-light   the lantern's pool of light, riding the real lantern; or, in the face
 *                 close-up, sliding down off the face as the lantern is lowered
 *   bowed-blight  on each target copy: its own drawing blackened from the shoulders, lesions
 *                 with a mould-white bloom, clipped to its silhouette
 *   bowed-seeds   black seed shaken out of the bowed heads onto the row
 *   bowed-board   on the real battlefield: at the call, the lantern's pool on the floor round
 *                 the real Warden; after, the blight on every real target's drawing, a dead
 *                 head drooping at its feet, and seed dropping
 *
 * Everything moves through frame functions or `--p`: no keyframes, and no
 * filter or blur on anything that moves or is large.
 */

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const span = (p: number, a: number, b: number) => clamp((p - a) / Math.max(0.0001, b - a));
const rootOf = (el: Element) => el.closest<HTMLElement>(".ult-cinematic");
type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;
const SVG = "http://www.w3.org/2000/svg";
const f1 = (n: number) => n.toFixed(1);
const f2 = (n: number) => n.toFixed(2);
const v = (vars: Record<string, string | number>) => vars as CSSProperties;

const setAttr = (el: Element | null | undefined, name: string, value: string) => {
  if (el && el.getAttribute(name) !== value) el.setAttribute(name, value);
};
const setStyle = (el: HTMLElement | SVGElement | null | undefined, name: string, value: string) => {
  if (el && el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
};

/** The param marker every renderer draws, so its frame can read the cue. */
function Params({ cue }: { cue: VfxProps["cue"] }) {
  const data: Record<string, string> = {};
  for (const [k, x] of Object.entries(cue.params ?? {})) data[`data-${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = String(x);
  return <i hidden data-bowed="" {...data} />;
}

/** A cue's params, copied to its wrapper once, since a frame is handed only the wrapper. */
function params(el: HTMLElement): DOMStringMap {
  if (!el.dataset.bowedParams) {
    el.dataset.bowedParams = "1";
    const src = el.querySelector<HTMLElement>("[data-bowed]");
    if (src) for (const [k, x] of Object.entries(src.dataset)) if (k !== "bowed" && x !== undefined) el.dataset[k] = x;
  }
  return el.dataset;
}
const num = (d: DOMStringMap, k: string, fallback: number) => (d[k] === undefined || d[k] === "" ? fallback : Number(d[k]));
const pair = (d: DOMStringMap, k: string): [number, number] | null => {
  const s = d[k];
  if (!s) return null;
  const [a, b] = s.split(",").map(Number);
  return [a, b];
};

/* ── Reading the film ─────────────────────────────────────────────────── */

const casterNode = (el: HTMLElement) => rootOf(el)?.querySelector<HTMLElement>('.cine-actor[data-role="caster"]');

/** Screen point → world units, through the stage's own transform. */
function toWorld(root: HTMLElement, x: number, y: number): [number, number] {
  const world = root.querySelector<HTMLElement>(".cine-world");
  if (!world) return [x, y];
  const m = new DOMMatrix(getComputedStyle(world).transform).inverse();
  const r = root.getBoundingClientRect();
  const p = m.transformPoint(new DOMPoint(x - r.left, y - r.top));
  return [p.x, p.y];
}

/**
 * When the Warden wears a weapon, the weapon replaces the staff and the
 * lantern goes with it (`BaseWeapon`). This film is about that lantern, so it
 * hangs a copy of the Warden's own lantern drawing from the tip of whatever it
 * is holding, inside the staff arm, kept plumb as the arm turns. Only in the
 * film's copy; the round's Warden is untouched.
 */
function kitLantern(node: HTMLElement): SVGElement | null {
  const base = node.querySelector<SVGGElement>("[data-base-weapon]");
  if (!base || base.style.display !== "none") return null;
  const staff = node.querySelector<SVGGElement>('[data-part="staff"]');
  const mount = staff?.querySelector<SVGGElement>('[data-attachment="mainHand"]');
  const drawn = base.querySelector<SVGGElement>('[data-part="lantern"]');
  if (!staff || !mount || !drawn) return null;
  let lamp = staff.querySelector<SVGGElement>(":scope > .bowed-kit-lamp");
  if (!lamp) {
    // Hung from the weapon's highest point, in the arm's own units.
    const m = staff.getCTM()?.inverse().multiply(mount.getCTM() ?? new DOMMatrix());
    let tip: [number, number] = [22, 16];
    try {
      const b = mount.getBBox();
      if (m && b.width + b.height > 0) {
        let best = Infinity;
        for (const [px, py] of [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]]) {
          const q = new DOMPoint(px, py).matrixTransform(m);
          if (q.y < best) {
            best = q.y;
            tip = [q.x, q.y];
          }
        }
      }
    } catch {
      /* not rendered: the staff's crook */
    }
    lamp = document.createElementNS(SVG, "g") as SVGGElement;
    lamp.setAttribute("class", "bowed-kit-lamp");
    lamp.setAttribute("transform", `translate(${f1(tip[0] - 16.5)} ${f1(tip[1] - 19)})`);
    const swing = document.createElementNS(SVG, "g");
    swing.setAttribute("class", "bowed-kit-swing");
    const copy = drawn.cloneNode(true) as SVGGElement;
    copy.removeAttribute("data-part");
    copy.removeAttribute("style");
    swing.appendChild(copy);
    lamp.appendChild(swing);
    staff.appendChild(lamp);
  }
  // Plumb: turned back by as much as the arm is turned.
  const t = getComputedStyle(staff).transform;
  const mm = t && t !== "none" ? new DOMMatrix(t) : null;
  const deg = mm ? (Math.atan2(mm.b, mm.a) * 180) / Math.PI : 0;
  setAttr(lamp.firstElementChild, "transform", `rotate(${f1(-deg)} 16.5 19)`);
  return lamp.querySelector<SVGElement>("circle.ph-wdn-lamp:not(.ph-glow)");
}

/**
 * The lantern, read once a frame. Three effects ask for it, and each reads
 * layout; asked after another effect has written, that is a forced layout
 * every time. `document.timeline.currentTime` is the same all frame.
 */
const LAMP_AT = new WeakMap<HTMLElement, { t: number | null; at: [number, number] | null }>();

/** Where the lantern's flame is this frame, in world units: read off the caster's copy. */
function lanternAt(el: HTMLElement): [number, number] | null {
  const root = rootOf(el);
  if (!root) return null;
  const t = Number(document.timeline.currentTime ?? -1);
  const cached = LAMP_AT.get(root);
  if (cached && cached.t === t) return cached.at;
  const at = readLantern(root);
  LAMP_AT.set(root, { t, at });
  return at;
}

function readLantern(root: HTMLElement): [number, number] | null {
  const node = root.querySelector<HTMLElement>('.cine-actor[data-role="caster"]');
  if (!node || node.style.display === "none") return null;
  const flame = kitLantern(node) ?? node.querySelector<SVGElement>('[data-part="lantern"] circle.ph-wdn-lamp:not(.ph-glow)');
  const r = flame?.getBoundingClientRect();
  if (!r || (!r.width && !r.height)) return null;
  return toWorld(root, r.left + r.width / 2, r.top + r.height / 2);
}

/* ── The field ────────────────────────────────────────────────────────── */

/**
 * One sunflower: a ground point, the stalk's height and lean, the head's
 * radius (half its height), and how it differs from its neighbours.
 */
interface Plant {
  x: number;
  y: number;
  h: number;
  r: number;
  lean: number;
  /** Degrees added to where it looks, so a row is not a drill team. */
  off: number;
  /** How slowly it follows, ms. */
  tau: number;
  leaf: number;
  /** Which way its leaves hang. */
  flip: 1 | -1;
}

/**
 * Where the plants stand, in a frame's own fractions, so a set is laid out
 * against the camera that shoots it: `u` across, `v` the ground point down
 * (past 1 is below the frame), `h` the stalk and `r` the head, as fractions
 * of the frame's height.
 */
type Spec = { u: number; v: number; h: number; r: number };

function specs(set: string, band: string): Spec[] {
  const rand = seeded(set.length * 131 + (band === "front" ? 7 : 3));
  const out: Spec[] = [];
  const row = (n: number, u0: number, u1: number, v0: number, v1: number, h0: number, h1: number, r0: number, r1: number, skip?: (u: number) => boolean) => {
    for (let i = 0; i < n; i++) {
      const u = u0 + ((i + 0.5 + (rand() - 0.5) * 0.7) / n) * (u1 - u0);
      if (skip?.(u)) continue;
      const k = rand();
      out.push({ u, v: v0 + (v1 - v0) * k, h: h0 + (h1 - h0) * rand(), r: r0 + (r1 - r0) * (0.4 + 0.6 * k) });
    }
  };
  if (set === "lift") {
    // Looking up from among the stalks: a few heads huge and close, more behind them.
    if (band === "back") {
      row(9, -0.05, 1.05, 1.05, 1.25, 0.72, 0.95, 0.05, 0.07);
    } else {
      out.push({ u: 0.06, v: 1.45, h: 0.95, r: 0.15 });
      out.push({ u: 0.27, v: 1.6, h: 0.92, r: 0.12 });
      out.push({ u: 0.8, v: 1.55, h: 0.95, r: 0.13 });
      out.push({ u: 1.0, v: 1.4, h: 0.82, r: 0.16 });
    }
  } else if (set === "wide") {
    if (band === "back") {
      // Two far rows and a near one, behind the figures' feet.
      row(26, -0.04, 1.04, 0.6, 0.63, 0.2, 0.25, 0.017, 0.021);
      row(21, -0.04, 1.04, 0.66, 0.7, 0.28, 0.34, 0.024, 0.028);
      row(15, -0.04, 1.04, 0.74, 0.78, 0.37, 0.44, 0.032, 0.036, (u) => u > 0.12 && u < 0.3);
    } else {
      // The nearest row, in front of the figures, kept off them.
      row(9, -0.06, 1.06, 1.02, 1.1, 0.5, 0.6, 0.045, 0.052, (u) => (u > 0.1 && u < 0.36) || (u > 0.64 && u < 0.97));
    }
  } else if (set === "bow") {
    // Low at the soil down a drilled row: heads high over everyone, so when
    // they fall they hang over the row.
    if (band === "back") {
      row(13, 0.2, 1.08, 0.66, 0.7, 0.3, 0.36, 0.034, 0.04);
      row(10, 0.28, 1.08, 0.74, 0.79, 0.4, 0.46, 0.046, 0.052);
    } else {
      row(4, 0.34, 1.1, 1.08, 1.16, 0.7, 0.78, 0.062, 0.07, (u) => u > 0.46 && u < 0.92);
    }
  }
  return out;
}

function layout(set: string, band: string, frame: [number, number, number, number]): Plant[] {
  const [fx, fy, fw, fh] = frame;
  const rand = seeded(set.length * 17 + (band === "front" ? 11 : 5));
  return specs(set, band)
    .map((s) => ({
      x: fx + s.u * fw,
      y: fy + s.v * fh,
      h: s.h * fh,
      r: s.r * fh,
      lean: (rand() - 0.5) * 0.12,
      off: (rand() - 0.5) * 22,
      tau: 70 + rand() * 170,
      leaf: 0.38 + rand() * 0.25,
      flip: (rand() < 0.5 ? 1 : -1) as 1 | -1,
    }))
    .sort((a, b) => a.y - b.y);
}

/** A ring of petals round the head's squashed disc, in the head's own frame (facing +x). */
function petalRing(r: number) {
  const n = 22;
  const rx = r * 0.42;
  const ry = r * 0.86;
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const b = ((i + 0.5) / n) * Math.PI * 2;
    const c = ((i + 1) / n) * Math.PI * 2;
    const len = r * (0.32 + ((i * 7) % 5) * 0.03);
    const tip = [Math.cos(b) * (rx + len * 0.55), Math.sin(b) * (ry + len)];
    d += `M${f1(Math.cos(a) * rx)} ${f1(Math.sin(a) * ry)} Q${f1(tip[0] * 0.9)} ${f1(tip[1] * 0.9)} ${f1(tip[0])} ${f1(tip[1])} Q${f1(tip[0] * 0.9)} ${f1(tip[1] * 0.9)} ${f1(Math.cos(c) * rx)} ${f1(Math.sin(c) * ry)} Z`;
  }
  return d;
}

/** Mould on a rotted head: a broken white-grey bloom round the disc, and a few specks on it. */
function mouldSpecks(r: number, seed: number) {
  const rand = seeded(seed);
  let d = "";
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2;
    const k = 0.55 + rand() * 0.4;
    const x = Math.cos(a) * r * 0.36 * k;
    const y = Math.sin(a) * r * 0.72 * k;
    const s = r * (0.025 + rand() * 0.03);
    d += `M${f1(x - s)} ${f1(y)} a${f1(s)} ${f1(s * 0.8)} 0 1 0 ${f1(s * 2)} 0 a${f1(s)} ${f1(s * 0.8)} 0 1 0 ${f1(-s * 2)} 0 Z`;
  }
  return d;
}

/** An irregular blotch round (0, 0): rot does not grow in circles. */
function blob(rx: number, ry: number, seed: number, n = 9) {
  const rand = seeded(seed);
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 0.62 + rand() * 0.55;
    return [Math.cos(a) * rx * k, Math.sin(a) * ry * k];
  });
  let d = "";
  for (let i = 0; i < n; i++) {
    const [x, y] = pts[i];
    const [nx, ny] = pts[(i + 1) % n];
    const mx = (x + nx) / 2;
    const my = (y + ny) / 2;
    if (!i) {
      const [px, py] = pts[n - 1];
      d += `M${f1((px + x) / 2)} ${f1((py + y) / 2)}`;
    }
    d += ` Q${f1(x)} ${f1(y)} ${f1(mx)} ${f1(my)}`;
  }
  return `${d} Z`;
}

const FIELD_FRAME: [number, number, number, number] = [0, 0, 1600, 900];

const Field = ({ cue }: VfxProps): ReactNode => {
  const set = String(cue.params?.set ?? "wide");
  const band = String(cue.params?.band ?? "back");
  const frame = (String(cue.params?.frame ?? "").split(",").map(Number) as [number, number, number, number]).length === 4
    ? (String(cue.params?.frame).split(",").map(Number) as [number, number, number, number])
    : FIELD_FRAME;
  const plants = layout(set, band, frame);
  return (
    <div className="bowed-field" data-band={band}>
      <Params cue={cue} />
      <svg className="bowed-field-svg" viewBox="0 0 1600 900">
        {plants.map((pl, i) => {
          const w = Math.max(2, pl.r * 0.2);
          const leafY = pl.y - pl.h * pl.leaf;
          const leafX = pl.x + pl.lean * pl.h * pl.leaf;
          const L = pl.r * 2.1;
          return (
            <g
              key={i}
              className="bowed-plant"
              data-i={i}
              data-x={f1(pl.x)}
              data-y={f1(pl.y)}
              data-h={f1(pl.h)}
              data-r={f1(pl.r)}
              data-lean={pl.lean.toFixed(3)}
              data-off={f1(pl.off)}
              data-tau={f1(pl.tau)}
            >
              <path className="bowed-stalk-ink" strokeWidth={f1(w + 3)} />
              <path className="bowed-stalk" strokeWidth={f1(w)} />
              {[1, -1].map((side) => (
                <path
                  key={side}
                  className="bowed-leaf"
                  d={`M${f1(leafX)} ${f1(leafY + (side > 0 ? 0 : pl.h * 0.12))} q${f1(side * pl.flip * L * 0.5)} ${f1(-L * 0.28)} ${f1(side * pl.flip * L)} ${f1(L * 0.22)} q${f1(-side * pl.flip * L * 0.55)} ${f1(L * 0.12)} ${f1(-side * pl.flip * L)} ${f1(-L * 0.22)} Z`}
                  strokeWidth={f1(Math.max(1.5, pl.r * 0.05))}
                />
              ))}
              <g className="bowed-head">
                <ellipse className="bowed-calyx" cx={f1(-pl.r * 0.2)} rx={f1(pl.r * 0.36)} ry={f1(pl.r * 0.78)} strokeWidth={f1(Math.max(1.5, pl.r * 0.06))} />
                <path className="bowed-petals" d={petalRing(pl.r)} strokeWidth={f1(Math.max(1, pl.r * 0.035))} />
                <ellipse className="bowed-disc" rx={f1(pl.r * 0.42)} ry={f1(pl.r * 0.86)} strokeWidth={f1(Math.max(1.5, pl.r * 0.06))} />
                <ellipse className="bowed-whorl" rx={f1(pl.r * 0.28)} ry={f1(pl.r * 0.58)} strokeWidth={f1(Math.max(1, pl.r * 0.1))} strokeDasharray={`${f1(pl.r * 0.05)} ${f1(pl.r * 0.07)}`} />
                <ellipse className="bowed-shade" rx={f1(pl.r * 0.8)} ry={f1(pl.r * 1.2)} />
                <g className="bowed-rot">
                  <path className="bowed-dry" d={petalRing(pl.r * 0.78)} strokeWidth={f1(Math.max(1, pl.r * 0.035))} />
                  <path className="bowed-rot-black" d={blob(pl.r * 0.5, pl.r * 0.95, i * 7 + 3, 11)} strokeWidth={f1(Math.max(1.5, pl.r * 0.06))} />
                  <path className="bowed-rot-specks" d={mouldSpecks(pl.r, i * 13 + 5)} />
                </g>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/** Per-plant state, so a head follows the light with its own lag. */
const FOLLOW = new WeakMap<HTMLElement, { age: number; angle: Float32Array }>();

/** The shorter way from `a` to `b`, degrees. */
const turnTo = (a: number, b: number) => {
  let d = ((b - a) % 360 + 540) % 360 - 180;
  if (d === -180) d = 180;
  return d;
};

const field: Frame = (el, p, age) => {
  const d = params(el);
  const plants = [...el.querySelectorAll<SVGGElement>(".bowed-plant")];
  if (!plants.length) return;
  const lamp = lanternAt(el) ?? pair(d, "lamp") ?? [300, 300];
  const radius = num(d, "radius", 900);
  const bowAt = num(d, "bowAt", -1);
  // The fall: accelerating down onto the contact, fully hung on it, then a settle.
  const fall = bowAt >= 0 ? ease("in", span(p, bowAt - 0.045, bowAt)) : 0;
  const settle = bowAt >= 0 ? span(p, bowAt, bowAt + 0.35) : 0;
  const rot = bowAt >= 0 ? (p >= bowAt - 0.004 ? 1 : 0) : num(d, "rot", 0);
  const bloom = bowAt >= 0 ? ease("out", span(p, bowAt + 0.02, bowAt + 0.5)) : num(d, "rot", 0);
  // Already bowed (a shot after the fall): hung from the start.
  const bowed = num(d, "bowed", 0);

  let state = FOLLOW.get(el);
  const jump = !state || age < state.age || age - state.age > 250;
  if (!state || state.angle.length !== plants.length) {
    state = { age, angle: new Float32Array(plants.length) };
    FOLLOW.set(el, state);
  }
  const dt = jump ? 0 : age - state.age;
  state.age = age;

  plants.forEach((g, i) => {
    const pd = g.dataset;
    const x = Number(pd.x);
    const y = Number(pd.y);
    const h = Number(pd.h);
    const r = Number(pd.r);
    const lean = Number(pd.lean);
    const off = Number(pd.off);
    const nx = x + lean * h;
    const ny = y - h;
    // Where it wants to look: at the light.
    const want = (Math.atan2(lamp[1] - ny, lamp[0] - nx) * 180) / Math.PI + off;
    const cur = state!.angle[i];
    const next = jump ? want : cur + turnTo(cur, want) * (1 - Math.exp(-dt / Number(pd.tau)));
    state!.angle[i] = next;
    // Hung: straight down, a little towards where the light went.
    const side = lamp[0] < nx ? 1 : -1;
    const hung = 90 + side * (38 + (off % 9)) - side * 8 * ease("back", settle);
    const down = Math.max(fall, bowed);
    const angle = next + turnTo(next, hung) * down;
    const rad = (angle * Math.PI) / 180;
    // The neck arches over as it gives up, and the head hangs off the arch.
    const sx = Math.cos(rad) < 0 ? -1 : 1;
    const topX = nx + sx * r * 0.75 * down;
    const topY = ny - r * 0.5 * down;
    const reach = 0.42 + 0.4 * down;
    const cx = topX + Math.cos(rad) * r * reach;
    const cy = topY + Math.sin(rad) * r * reach;
    const stalk = `M${f1(x)} ${f1(y)} Q${f1(x + lean * h * 0.2)} ${f1(y - h * 0.62)} ${f1(nx)} ${f1(ny + r * 0.2)} Q${f1(nx + sx * r * 0.1 * down)} ${f1(topY - r * 0.45 * down)} ${f1(topX)} ${f1(topY)}`;
    const kids = g.children;
    setAttr(kids[0], "d", stalk);
    setAttr(kids[1], "d", stalk);
    const head = kids[kids.length - 1] as SVGGElement;
    // A hung head turns partly to the lens as it falls, so it reads as a face and not a cap.
    setAttr(head, "transform", `translate(${f1(cx)} ${f1(cy)}) rotate(${f1(angle)}) scale(${f2(1 + 0.55 * down)} 1)`);
    // Lit by how near the lantern is.
    const dist = Math.hypot(lamp[0] - cx, lamp[1] - cy);
    const lit = clamp(1 - dist / radius);
    const hc = head.children;
    setStyle(hc[4] as SVGElement, "opacity", f2(0.82 * Math.pow(1 - lit, 1.4)));
    const rotted = Math.max(rot, bowed);
    setStyle(hc[5] as SVGElement, "opacity", rotted ? "1" : "0");
    const bl = (hc[5] as SVGGElement).children;
    const b = Math.max(bloom, bowed);
    setStyle(bl[2] as SVGElement, "opacity", f2(b * (0.4 + 0.6 * lit)));
    // The petals go with the rot.
    setStyle(hc[1] as SVGElement, "opacity", rotted ? "0" : "1");
  });
};

/* ── The lantern's light ───────────────────────────────────────────────── */

const Light = ({ cue }: VfxProps): ReactNode => (
  <div className="bowed-light">
    <Params cue={cue} />
    <i className="bowed-light-pool" />
    <i className="bowed-light-core" />
  </div>
);

const light: Frame = (el, p) => {
  const d = params(el);
  const box = el.querySelector<HTMLElement>(".bowed-light");
  if (!box) return;
  const from = pair(d, "from");
  const to = pair(d, "to");
  let at: [number, number] | null;
  if (from && to) {
    // The face close-up: the light slides down off the face as the lantern is lowered.
    const k = ease("inOut", span(p, num(d, "slideA", 0.2), num(d, "slideB", 0.95)));
    at = [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k];
  } else at = lanternAt(el) ?? pair(d, "lamp");
  if (!at) {
    setStyle(box, "opacity", "0");
    return;
  }
  const size = num(d, "size", 900);
  const fade = num(d, "fadeA", -1);
  const gone = fade >= 0 ? 1 - span(p, fade, num(d, "fadeB", 1)) : 1;
  const flare = num(d, "flareAt", -1);
  const burst = flare >= 0 && p >= flare ? 1 + 0.9 * (1 - ease("out", span(p, flare, flare + 0.4))) : 1;
  setStyle(box, "transform", `translate3d(${f1(at[0])}px, ${f1(at[1])}px, 0) scale(${f2((size / 1000) * burst)})`);
  setStyle(box, "opacity", f2(num(d, "strength", 1) * gone));
};

/* ── The flare along the row ──────────────────────────────────────────── */

/**
 * When the lantern hits the dirt it flares, and its light rakes down the row
 * behind the enemy: so the drawn frame has a light to cut the bowed heads and
 * the bent row out of, and the held frame after it shows them against it.
 */
const Glare = ({ cue }: VfxProps): ReactNode => (
  <div className="bowed-glare">
    <Params cue={cue} />
    <i />
  </div>
);

const glare: Frame = (el, p) => {
  const d = params(el);
  const box = el.querySelector<HTMLElement>(".bowed-glare");
  if (!box) return;
  const at = num(d, "at", 0.1);
  const k = p < at - 0.012 ? 0 : p < at ? span(p, at - 0.012, at) : 1 - (1 - num(d, "hold", 0.35)) * ease("out", span(p, at, num(d, "until", 0.6)));
  setStyle(box, "opacity", f2(k));
  setStyle(box, "left", `${f1(num(d, "x", 1100))}px`);
  setStyle(box, "top", `${f1(num(d, "y", 620))}px`);
  setStyle(box, "width", `${f1(num(d, "w", 1400))}px`);
  setStyle(box, "height", `${f1(num(d, "h", 700))}px`);
};

/* ── Blight on a figure ────────────────────────────────────────────────── */

/** Lesions, as fractions of the painted box from its top-left: where the heads bowed onto it, high first. */
const LESIONS = (() => {
  const rand = seeded(733);
  return Array.from({ length: 16 }, (_, i) => ({
    u: 0.15 + rand() * 0.7,
    v: 0.04 + (i / 16) * 0.66 + rand() * 0.1,
    s: 0.05 + rand() * 0.06,
    a: rand() * 180,
    d: i / 16,
  }));
})();

let clipSerial = 0;

/**
 * An overlay for a figure's drawing: a copy of the drawing as a clip, and
 * inside it a black coat and lesions with a mould bloom, so the blight is on
 * the silhouette and nowhere else. `svg` is the figure's own drawing.
 */
function buildRot(svg: SVGSVGElement, host: Element, cls: string) {
  const over = document.createElementNS(SVG, "svg");
  over.setAttribute("class", cls);
  const vb = svg.getAttribute("viewBox");
  if (vb) over.setAttribute("viewBox", vb);
  const par = svg.getAttribute("preserveAspectRatio");
  if (par) over.setAttribute("preserveAspectRatio", par);
  over.setAttribute("overflow", "visible");
  const id = `bowed-clip-${++clipSerial}`;
  const clip = document.createElementNS(SVG, "clipPath");
  clip.setAttribute("id", id);
  // The painted box, in the drawing's own units.
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  // A clip may hold only shapes, so the drawing is flattened: every filled,
  // visible shape, with the transforms above it baked into one matrix.
  const base = svg.getScreenCTM();
  for (const shape of svg.querySelectorAll<SVGGeometryElement>("path, rect, circle, ellipse, polygon, polyline")) {
    if (shape.closest("defs, clipPath, mask, pattern, symbol, marker")) continue;
    if (!shape.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    if (getComputedStyle(shape).fill === "none") continue;
    const own = shape.getScreenCTM();
    if (!base || !own) continue;
    const m = base.inverse().multiply(own);
    const copy = shape.cloneNode(false) as SVGElement;
    for (const a of ["id", "class", "style", "filter", "mask", "opacity", "stroke", "fill", "clip-path", "transform"]) copy.removeAttribute(a);
    copy.setAttribute("transform", `matrix(${[m.a, m.b, m.c, m.d, m.e, m.f].map((n) => n.toFixed(3)).join(" ")})`);
    clip.appendChild(copy);
    try {
      const b = shape.getBBox();
      for (const [px, py] of [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]]) {
        const q = new DOMPoint(px, py).matrixTransform(m);
        x0 = Math.min(x0, q.x);
        y0 = Math.min(y0, q.y);
        x1 = Math.max(x1, q.x);
        y1 = Math.max(y1, q.y);
      }
    } catch {
      /* not rendered */
    }
  }
  if (!Number.isFinite(x0)) {
    const [a, b, c, e] = (vb ?? "0 0 100 100").split(/[\s,]+/).map(Number);
    [x0, y0, x1, y1] = [a, b, a + c, b + e];
  }
  const W = x1 - x0;
  const H = y1 - y0;
  const S = Math.max(W, H);
  let inner = `<rect class="bowed-coat" x="${f1(x0 - 4)}" y="${f1(y0 - 4)}" width="${f1(W + 8)}" height="${f1(H + 8)}"/>`;
  inner += `<rect class="bowed-coat-top" x="${f1(x0 - 4)}" y="${f1(y0 - 4)}" width="${f1(W + 8)}" height="${f1(H * 0.55)}"/>`;
  LESIONS.forEach((l, i) => {
    const cx = x0 + l.u * W;
    const cy = y0 + l.v * H;
    const rr = l.s * S;
    inner += `<g class="bowed-lesion" data-i="${i}" data-d="${l.d.toFixed(2)}" transform="translate(${f1(cx)} ${f1(cy)}) rotate(${f1(l.a)})">
      <path class="bowed-lesion-bloom" d="${blob(rr * 1.14, rr * 0.84, i * 31 + 7, 10)}"/>
      <path class="bowed-lesion-black" d="${blob(rr, rr * 0.72, i * 17 + 3, 9)}"/>
    </g>`;
  });
  const g = document.createElementNS(SVG, "g");
  g.setAttribute("clip-path", `url(#${id})`);
  g.innerHTML = inner;
  const defs = document.createElementNS(SVG, "defs");
  defs.appendChild(clip);
  over.appendChild(defs);
  over.appendChild(g);
  host.appendChild(over);
  return over;
}

/** How far the blight has taken a figure's overlay, 0 … 1. */
function drawRot(over: SVGSVGElement, k: number, coat: number) {
  setStyle(over.querySelector<SVGElement>(".bowed-coat"), "opacity", f2(coat * (0.4 + 0.2 * k)));
  setStyle(over.querySelector<SVGElement>(".bowed-coat-top"), "opacity", f2(coat * (0.3 + 0.3 * k)));
  over.querySelectorAll<SVGGElement>(".bowed-lesion").forEach((g) => {
    const dd = Number(g.dataset.d);
    const kk = ease("out", span(k, dd * 0.55, dd * 0.55 + 0.45));
    setStyle(g, "opacity", kk > 0 ? "1" : "0");
    const inner = g.children;
    const s = f2(0.25 + 0.75 * kk);
    for (const c of [...inner]) setStyle(c as SVGElement, "transform", `scale(${s})`);
    setStyle(inner[0] as SVGElement, "opacity", f2(span(kk, 0.3, 1)));
  });
}

const Blight = ({ cue }: VfxProps): ReactNode => (
  <i className="bowed-blight-anchor">
    <Params cue={cue} />
  </i>
);

/** Overlays this effect has put inside the target copies, so they go when it does. */
const ROTS = new WeakMap<HTMLElement, SVGSVGElement[]>();

const blight: Frame = (el, p) => {
  const d = params(el);
  const root = rootOf(el);
  if (!root) return;
  let rots = ROTS.get(el);
  if (!rots) {
    rots = [];
    for (const actor of root.querySelectorAll<HTMLElement>('.cine-actor[data-role="targets"]')) {
      const look = actor.querySelector(".cine-look");
      const svg = look?.querySelector<SVGSVGElement>("svg");
      if (!look || !svg || actor.style.display === "none") continue;
      look.querySelector(":scope > .bowed-rot-fig")?.remove();
      rots.push(buildRot(svg, look, "bowed-rot-fig"));
    }
    if (!rots.length) return;
    ROTS.set(el, rots);
    // Removed with the effect: the anchor leaves the DOM when its shot ends.
    const anchor = el.querySelector(".bowed-blight-anchor");
    const watch = new MutationObserver(() => {
      if (!anchor?.isConnected) {
        rots?.forEach((r) => r.remove());
        watch.disconnect();
      }
    });
    watch.observe(root, { childList: true, subtree: true });
  }
  const at = num(d, "at", 0.1);
  const k = span(p, at, num(d, "until", 0.7));
  const coat = p >= at ? 0.65 + 0.35 * ease("out", span(p, at, at + 0.2)) : 0;
  // A first bloom of it is on the figure the instant the heads come down.
  rots.forEach((r, i) => drawRot(r, p >= at ? 0.3 + 0.7 * span(k, i * 0.06, 1) : 0, coat));
};

/* ── Seed shaken out of the heads ─────────────────────────────────────── */

const SEEDS = (() => {
  const rand = seeded(97);
  return Array.from({ length: 22 }, () => ({
    u: (rand() - 0.5) * 1.5,
    v: -1.25 - rand() * 0.45,
    d: rand() * 0.5,
    fall: 0.9 + rand() * 0.5,
    spin: (rand() - 0.5) * 900,
    s: 0.6 + rand() * 0.7,
  }));
})();

const Seeds = ({ cue }: VfxProps): ReactNode => (
  <div className="bowed-seeds">
    <Params cue={cue} />
    <svg className="bowed-seeds-svg" viewBox="0 0 1600 900">
      {[0, 1, 2, 3].map((t) => (
        <g key={t} data-t={t}>
          {SEEDS.map((_, i) => (
            <g key={i} className="bowed-seed" data-i={i}>
              <path className="bowed-seed-body" d="M0 -6 C4 -3 4 3 0 7 C-4 3 -4 -3 0 -6 Z" />
              <path className="bowed-seed-stripe" d="M0 -4.5 L0 5.5" />
            </g>
          ))}
        </g>
      ))}
    </svg>
  </div>
);

const seeds: Frame = (el, p, _age, ctx) => {
  const d = params(el);
  const at = num(d, "at", 0.1);
  el.querySelectorAll<SVGGElement>(".bowed-seeds-svg > g").forEach((group) => {
    const t = Number(group.dataset.t);
    const who = ctx.actor(`targets-${t}`);
    setStyle(group, "opacity", who ? "1" : "0");
    if (!who) return;
    group.querySelectorAll<SVGGElement>(".bowed-seed").forEach((s) => {
      const sd = SEEDS[Number(s.dataset.i)];
      const k = span(p, at + sd.d * 0.5, 1);
      const on = p >= at + sd.d * 0.5 && k < 1;
      setStyle(s, "opacity", on ? f2(1 - span(k, 0.8, 1)) : "0");
      if (!on) return;
      const x = who.x + sd.u * who.h * 0.5;
      const y = who.y + sd.v * who.h * 0.55 + k * k * who.h * 1.6 * sd.fall;
      setAttr(s, "transform", `translate(${f1(x)} ${f1(Math.min(y, who.y))}) rotate(${f1(sd.spin * k)}) scale(${f2((sd.s * who.h) / 300)})`);
    });
  });
};

/* ── The real battlefield ───────────────────────────────────────────────── */

const Board = ({ cue }: VfxProps): ReactNode => {
  const mode = String(cue.params?.mode ?? "call");
  return (
    <div className="bowed-board" data-mode={mode}>
      <Params cue={cue} />
      {mode === "call" ? (
        <>
          <i className="bowed-board-pool" />
          <i className="bowed-board-halo" />
        </>
      ) : (
        <svg className="bowed-board-dead" viewBox="-70 -210 140 220" overflow="visible">
          <path className="bowed-dead-leaf" d="M2 -62 q26 2 34 34 q-24 -8 -34 -34 Z" />
          <path className="bowed-dead-leaf" d="M-2 -100 q-28 4 -32 36 q22 -10 32 -36 Z" />
          <path className="bowed-dead-stalk-ink" d="M0 0 C-5 -60 8 -120 2 -165 C-2 -192 -26 -196 -40 -176" />
          <path className="bowed-dead-stalk" d="M0 0 C-5 -60 8 -120 2 -165 C-2 -192 -26 -196 -40 -176" />
          <g transform="translate(-44 -150) rotate(96)">
            <path className="bowed-dead-dry" d={petalRing(30)} />
            <ellipse className="bowed-dead-calyx" cx="-8" rx="12" ry="26" />
            <path className="bowed-dead-head" d={blob(15, 30, 5, 11)} />
          </g>
          <g className="bowed-board-drops">
            {[0, 1, 2, 3, 4].map((i) => (
              <path key={i} className="bowed-seed-body" data-i={i} d="M0 -4 C2.6 -2 2.6 2 0 4.6 C-2.6 2 -2.6 -2 0 -4 Z" />
            ))}
          </g>
        </svg>
      )}
    </div>
  );
};

const BOARD_ROT = new WeakMap<HTMLElement, SVGSVGElement>();

const board: Frame = (el, p, age) => {
  const d = params(el);
  const box = el.querySelector<HTMLElement>(".bowed-board");
  const root = rootOf(el);
  if (!box || !root) return;
  const origin = el.getBoundingClientRect();
  if (box.dataset.mode === "call") {
    // The lantern's pool on the real floor round the real Warden, and a halo on the real lamp.
    const lamp = document.querySelector<SVGElement>(
      `.stage [data-unit="${CSS.escape(el.dataset.anchor ?? "")}"] [data-part="lantern"] circle.ph-wdn-lamp:not(.ph-glow)`,
    );
    const r = lamp?.getBoundingClientRect();
    const halo = el.querySelector<HTMLElement>(".bowed-board-halo");
    const k = ease("out", span(p, 0, 0.6));
    if (r && halo) {
      setStyle(halo, "left", `${f1(r.left + r.width / 2 - origin.left)}px`);
      setStyle(halo, "top", `${f1(r.top + r.height / 2 - origin.top)}px`);
      setStyle(halo, "opacity", f2(k));
    }
    setStyle(el.querySelector<HTMLElement>(".bowed-board-pool"), "opacity", f2(k * 0.9));
    return;
  }
  // After: the blight on the real target's drawing, a dead head at its feet, seed dropping.
  const unit = el.dataset.anchor ?? "";
  const rig = document.querySelector<HTMLElement>(`.stage [data-unit="${CSS.escape(unit)}"] .combatant-rig`);
  const svg = rig?.querySelector<SVGSVGElement>("svg");
  if (!rig || !svg) return;
  let over = BOARD_ROT.get(el);
  if (!over || !over.isConnected) {
    over = buildRot(svg, box, "bowed-board-rot");
    BOARD_ROT.set(el, over);
  }
  const measured = Number(box.dataset.measured ?? -1e9);
  if (age - measured > 200 || age < measured) {
    box.dataset.measured = String(age);
    const r = svg.getBoundingClientRect();
    setStyle(over, "left", `${f1(r.left - origin.left)}px`);
    setStyle(over, "top", `${f1(r.top - origin.top)}px`);
    setStyle(over, "width", `${f1(r.width)}px`);
    setStyle(over, "height", `${f1(r.height)}px`);
    const rb = rig.getBoundingClientRect();
    const dead = el.querySelector<SVGSVGElement>(".bowed-board-dead");
    const size = rb.height * 1.2;
    setStyle(dead, "width", `${f1(size * 0.64)}px`);
    setStyle(dead, "height", `${f1(size)}px`);
    setStyle(dead, "left", `${f1(rb.left - origin.left + rb.width * 0.08 - size * 0.3)}px`);
    setStyle(dead, "top", `${f1(rb.bottom - origin.top - size * 0.96)}px`);
  }
  const stagger = num(d, "stagger", 0);
  const k = span(p, stagger, stagger + 0.5);
  drawRot(over, ease("out", k), k > 0 ? 1 : 0);
  const dead = el.querySelector<SVGSVGElement>(".bowed-board-dead");
  setStyle(dead, "opacity", f2(ease("out", span(p, stagger, stagger + 0.2))));
  dead?.querySelectorAll<SVGPathElement>(".bowed-board-drops path").forEach((s) => {
    const i = Number(s.dataset.i);
    const t = (p * 1.4 + i * 0.21) % 1;
    setAttr(s, "transform", `translate(${f1(-44 + (i - 2) * 7)} ${f1(-120 + t * 120)})`);
    setStyle(s, "opacity", f2(span(p, stagger + 0.1, stagger + 0.2) * (1 - span(t, 0.85, 1))));
  });
};

/* ── Registered ────────────────────────────────────────────────────────── */

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "bowed-field": Field,
  "bowed-light": Light,
  "bowed-glare": Glare,
  "bowed-blight": Blight,
  "bowed-seeds": Seeds,
  "bowed-board": Board,
};

export const frames: Record<string, Frame> = {
  "bowed-field": field,
  "bowed-light": light,
  "bowed-glare": glare,
  "bowed-blight": blight,
  "bowed-seeds": seeds,
  "bowed-board": board,
};

void v;
void GOLD;
void LAMP;
void SEED;
void BLIGHT;
void MOULD;
