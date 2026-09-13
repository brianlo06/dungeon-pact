import { useEffect, useRef, type ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ease } from "../../cinematic/timeline";
import { MERE, SHORE } from "./background";
import "./style.css";

/**
 * Mourning Water's effects.
 *
 * The idea they serve: the Hollow Druid weeps without opening its eyes — one
 * tear falls into the open hand that used to heal — and when that hand
 * closes, the black water the tear became closes over the one who took it.
 *
 *   mourn-tear      the tear: welling under the shut lid, down the cheek, off the beard (drawn in the head)
 *   mourn-palm      the tear landing in the open palm, the palm brimming with black water and spilling (drawn in the hand)
 *   mourn-lens      a drop on the glass and the rings it opens: the cut from the palm to the mere
 *   mourn-shallows  the mere in front of every figure's legs, and the water climbing the target
 *   mourn-rings     rings running across the whole mere from the Warden's spill to the target
 *   mourn-spill     strands of water off the Warden's hand into the mere, in a wide
 *   mourn-grasp     closes the Warden's hand (`--wdn-grasp`) and puts its lantern out (`--mourn-lamp`)
 *   mourn-fist      the mere closing over the target in the shape of a hand, then falling away
 *   mourn-cling     the water that stays on the target after, hanging off it and dragging: Wet, and Weak
 *   mourn-board     on the real battlefield: the pool under the Warden; after, the drowned and the soaked
 *
 * Two of them draw inside the Warden's own copy — the tear in its head, the
 * water in its palm — so they move with the face and the hand exactly (a
 * shudder, a hand sinking under the weight) and are drawn in the drawing's
 * units. The node they add is removed when their shot ends.
 *
 * Everything moves through the frame functions or `--p`: no keyframes, no
 * filters.
 */

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const span = (p: number, a: number, b: number) => clamp((p - a) / Math.max(0.0001, b - a));
const rootOf = (el: Element) => el.closest<HTMLElement>(".ult-cinematic");
type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;
const SVG = "http://www.w3.org/2000/svg";

const setAttr = (el: Element | null | undefined, name: string, value: string) => {
  if (el && el.getAttribute(name) !== value) el.setAttribute(name, value);
};
const setStyle = (el: HTMLElement | SVGElement | null | undefined, name: string, value: string) => {
  if (el && el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
};
const f1 = (n: number) => n.toFixed(1);
const f2 = (n: number) => n.toFixed(2);

/** A cue's params, copied to its wrapper once, since a frame is handed only the wrapper. */
function params(el: HTMLElement): DOMStringMap {
  if (!el.dataset.mwParams) {
    el.dataset.mwParams = "1";
    const src = el.querySelector<HTMLElement>("[data-mw]");
    if (src) for (const [k, x] of Object.entries(src.dataset)) if (k !== "mw" && x !== undefined) el.dataset[k] = x;
  }
  return el.dataset;
}
const num = (d: DOMStringMap, k: string, fallback: number) => (d[k] === undefined ? fallback : Number(d[k]));

/** The param marker every renderer draws, so its frame can read the cue. */
function Params({ cue }: { cue: VfxProps["cue"] }) {
  const data: Record<string, string> = {};
  for (const [k, x] of Object.entries(cue.params ?? {})) data[`data-${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = String(x);
  return <i hidden data-mw="" {...data} />;
}

/* ── Drawing inside the Warden's copy ─────────────────────────────────── */

/** Nodes an effect has put inside a figure, by the effect's own anchor element. */
const INSIDE = new WeakMap<Element, SVGGElement>();

/**
 * An anchor that owns a node drawn inside a figure's part, and removes it when
 * the effect unmounts (its shot ends, or the film is skipped).
 */
function InsideAnchor({ cue, className }: { cue: VfxProps["cue"]; className: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const anchor = ref.current;
    return () => {
      if (anchor) INSIDE.get(anchor)?.remove();
    };
  }, []);
  return (
    <i ref={ref} className={`mourn-inside ${className}`}>
      <Params cue={cue} />
    </i>
  );
}

/** The caster's copy in this film. */
const casterNode = (el: HTMLElement) => rootOf(el)?.querySelector<HTMLElement>('.cine-actor[data-role="caster"]');

/** Put `markup` inside `part` of the caster's copy once, and hand the node back every frame. */
function inside(el: HTMLElement, selector: string, cls: string, markup: string): SVGGElement | null {
  const anchor = el.querySelector(".mourn-inside");
  if (!anchor) return null;
  const have = INSIDE.get(anchor);
  if (have?.isConnected) return have;
  const part = casterNode(el)?.querySelector<SVGGElement>(selector);
  if (!part) return null;
  const g = document.createElementNS(SVG, "g");
  g.setAttribute("class", cls);
  g.innerHTML = markup;
  part.appendChild(g);
  INSIDE.set(anchor, g);
  return g;
}

/** The rotation a rig part is posed at, degrees, read off the animator's transform. */
function partRotation(part: Element | null) {
  const m = /rotate\((-?[\d.]+)deg\)/.exec((part as HTMLElement | null)?.style?.transform ?? "");
  return m ? Number(m[1]) : 0;
}

/** A tear's outline: a drop pointing up, `r` its round half, centred on its round part. */
const DROP = (r: number) =>
  `M0 ${-r * 1.9} C${r * 0.45} ${-r * 0.9} ${r} ${-r * 0.3} ${r} ${r * 0.25} A${r} ${r} 0 0 1 ${-r} ${r * 0.25} C${-r} ${-r * 0.3} ${-r * 0.45} ${-r * 0.9} 0 ${-r * 1.9} Z`;

/** A point on a cubic, for a bead sliding down a track. */
function cubic(k: number, p: number[]) {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = p;
  const u = 1 - k;
  return [
    u * u * u * x0 + 3 * u * u * k * x1 + 3 * u * k * k * x2 + k * k * k * x3,
    u * u * u * y0 + 3 * u * u * k * y1 + 3 * u * k * k * y2 + k * k * k * y3,
  ];
}

/* ── The tear ──────────────────────────────────────────────────────────── */

/** Drawing units, in the Warden's head: from under the near eye's inner corner, down the cheek, into the beard. */
const TRACK = [54.9, 33.3, 54.8, 35.2, 54.1, 37, 54.3, 39.4];
const BEARD_TIP = [54.2, 60.2];

const TEAR_MARKUP = `
  <path class="mourn-tear-wet" d="M${TRACK[0]} ${TRACK[1]} C${TRACK[2]} ${TRACK[3]} ${TRACK[4]} ${TRACK[5]} ${TRACK[6]} ${TRACK[7]}" pathLength="1"/>
  <path class="mourn-tear-shine" d="M${TRACK[0] + 0.25} ${TRACK[1] + 0.4} C${TRACK[2] + 0.25} ${TRACK[3]} ${TRACK[4] + 0.25} ${TRACK[5]} ${TRACK[6] + 0.25} ${TRACK[7]}" pathLength="1"/>
  <g class="mourn-tear-bead"><path d="${DROP(1.05)}"/><circle class="mourn-tear-lit" cx="-0.35" cy="0.15" r="0.32"/></g>
  <g class="mourn-tear-drop"><path d="${DROP(1.15)}"/><circle class="mourn-tear-lit" cx="-0.38" cy="0.15" r="0.34"/></g>
`;

const Tear = ({ cue }: VfxProps): ReactNode => <InsideAnchor cue={cue} className="mourn-tear-anchor" />;

const tear: Frame = (el, p) => {
  const g = inside(el, '[data-part="head"] [data-art="illustrated-head"]', "mourn-tear", TEAR_MARKUP);
  if (!g) return;
  const bead = g.querySelector<SVGGElement>(".mourn-tear-bead");
  const drop = g.querySelector<SVGGElement>(".mourn-tear-drop");
  const wet = g.querySelector<SVGPathElement>(".mourn-tear-wet");
  const shine = g.querySelector<SVGPathElement>(".mourn-tear-shine");
  // Welling under the lid, running, then gone into the beard.
  const well = ease("out", span(p, 0.14, 0.38));
  const run = ease("inOut", span(p, 0.4, 0.66));
  const gone = span(p, 0.64, 0.72);
  const [bx, by] = cubic(run, TRACK);
  const bs = (0.25 + 0.75 * well) * (1 - 0.2 * run) * (1 - gone) * (well > 0 ? 1 : 0);
  // A bead stretches as it runs, and swells while it wells.
  const stretch = 1 + 0.35 * Math.sin(run * Math.PI);
  setAttr(bead, "transform", `translate(${f2(bx)} ${f2(by)}) scale(${f2(bs)} ${f2(bs * stretch)})`);
  setAttr(wet, "stroke-dashoffset", f2(1 - run));
  setAttr(shine, "stroke-dashoffset", f2(1 - run));
  // It comes out of the beard at the tip, hangs, and lets go.
  const hang = ease("out", span(p, 0.7, 0.86));
  const fall = span(p, 0.86, 1);
  const ds = hang * (1 + 0.25 * fall);
  const dy = BEARD_TIP[1] + hang * 1.2 + fall * fall * 26;
  setAttr(drop, "transform", `translate(${f2(BEARD_TIP[0])} ${f2(dy)}) scale(${f2(ds)} ${f2(ds * (1 + 0.5 * fall))})`);
};

/* ── The palm ──────────────────────────────────────────────────────────── */

/** Drawing units, in the Warden's hand: the palm's bowl, between the heel of the hand and the fingers. */
const PALM = { x: 74.6, y: 55.6 };

const PALM_MARKUP = (() => {
  const rand = seeded(61);
  const crown = Array.from({ length: 8 }, (_, i) => {
    const a = -Math.PI * (0.12 + (i / 7) * 0.76);
    const speed = 5 + rand() * 5;
    return `<circle class="mourn-crown" data-vx="${f2(Math.cos(a) * speed)}" data-vy="${f2(Math.sin(a) * speed)}" r="${f2(0.45 + rand() * 0.4)}"/>`;
  }).join("");
  const strands = [
    { x: 71.2, y: 57.2, len: 22, sway: -1.2 },
    { x: 77.8, y: 57.4, len: 30, sway: 1.4 },
    { x: 74.8, y: 60.2, len: 17, sway: 0.4 },
    { x: 72.8, y: 59.6, len: 26, sway: -0.6 },
  ]
    .map(
      (s, i) =>
        `<g class="mourn-strand" data-x="${s.x}" data-y="${s.y}" data-len="${s.len}" data-sway="${s.sway}" data-i="${i}"><path class="mourn-strand-body"/><path class="mourn-strand-lit"/><path class="mourn-strand-drop" d="${DROP(0.8)}"/></g>`,
    )
    .join("");
  return `
    <g class="mourn-palm-strands">${strands}</g>
    <path class="mourn-palm-pool"/>
    <path class="mourn-palm-lit"/>
    <ellipse class="mourn-palm-ring" cx="${PALM.x}" cy="${PALM.y}"/>
    <g class="mourn-palm-crown" transform="translate(${PALM.x} ${PALM.y})">${crown}</g>
    <g class="mourn-palm-fall"><path d="${DROP(1.25)}"/><circle class="mourn-tear-lit" cx="-0.42" cy="0.2" r="0.36"/></g>
  `;
})();

const Palm = ({ cue }: VfxProps): ReactNode => <InsideAnchor cue={cue} className="mourn-palm-anchor" />;

const palm: Frame = (el, p) => {
  const d = params(el);
  const land = num(d, "land", 0.36);
  const g = inside(el, '[data-part="hand"]', "mourn-palm", PALM_MARKUP);
  if (!g) return;
  // The tear, falling into the palm from above the frame.
  const fall = g.querySelector<SVGGElement>(".mourn-palm-fall");
  const k = span(p, 0, land);
  const fy = PALM.y - 44 + 44 * ease("in", k) - 1.2;
  const falling = p < land;
  setAttr(fall, "transform", falling ? `translate(${PALM.x} ${f2(fy)}) scale(1 ${f2(1 + 0.4 * k)})` : "scale(0)");
  // The crown it throws up.
  const c = span(p, land, land + 0.28);
  g.querySelectorAll<SVGCircleElement>(".mourn-crown").forEach((drop) => {
    const vx = Number(drop.dataset.vx);
    const vy = Number(drop.dataset.vy);
    const t = c * 1.6;
    setAttr(drop, "cx", f2(vx * t));
    setAttr(drop, "cy", f2(vy * t + 9 * t * t));
    setAttr(drop, "opacity", c > 0 && c < 1 ? f2(1 - c * c) : "0");
  });
  const ring = g.querySelector(".mourn-palm-ring");
  setAttr(ring, "rx", f2(1 + c * 6));
  setAttr(ring, "ry", f2(0.4 + c * 1.5));
  setAttr(ring, "opacity", c > 0 && c < 1 ? f2(0.9 * (1 - c)) : "0");
  // Far more water than a tear: it wells up in the palm and brims.
  const brim = ease("out", span(p, land + 0.02, land + 0.34));
  const h = brim * 2.1;
  const x0 = PALM.x - 3.6 - brim * 0.4;
  const x1 = PALM.x + 3.4 + brim * 0.4;
  const y = PALM.y + 1.5;
  const pool = `M${f2(x0)} ${f2(y)} C${f2(x0 - 0.4)} ${f2(y - h * 0.7)} ${f2(PALM.x - 2.2)} ${f2(y - h)} ${f2(PALM.x)} ${f2(y - h)} C${f2(PALM.x + 2.4)} ${f2(y - h)} ${f2(x1 + 0.4)} ${f2(y - h * 0.7)} ${f2(x1)} ${f2(y)} C${f2(PALM.x + 2)} ${f2(y + 1.4)} ${f2(PALM.x - 2)} ${f2(y + 1.4)} ${f2(x0)} ${f2(y)} Z`;
  setAttr(g.querySelector(".mourn-palm-pool"), "d", brim > 0.01 ? pool : "M0 0");
  // The green light in the palm goes out under it.
  setStyle(casterNode(el), "--mourn-mote", f2(1 - ease("out", span(p, land, land + 0.2))));
  setAttr(
    g.querySelector(".mourn-palm-lit"),
    "d",
    brim > 0.2 ? `M${f2(PALM.x - 2.6)} ${f2(y - h * 0.72)} Q${f2(PALM.x - 0.6)} ${f2(y - h * 1.02)} ${f2(PALM.x + 1.6)} ${f2(y - h * 0.86)}` : "M0 0",
  );
  // And spills off the edge of the hand and the fingers, straight down.
  const counter = -partRotation(g.parentElement);
  const strands = g.querySelector<SVGGElement>(".mourn-palm-strands");
  g.querySelectorAll<SVGGElement>(".mourn-strand").forEach((s) => {
    const i = Number(s.dataset.i);
    const sx = Number(s.dataset.x);
    const sy = Number(s.dataset.y);
    const len = Number(s.dataset.len);
    const sway = Number(s.dataset.sway);
    const grow = ease("in", span(p, land + 0.16 + i * 0.05, land + 0.62 + i * 0.04));
    const L = grow * len;
    const body = `M${f2(sx - 0.55)} ${f2(sy)} C${f2(sx - 0.3)} ${f2(sy + L * 0.4)} ${f2(sx + sway - 0.2)} ${f2(sy + L * 0.7)} ${f2(sx + sway)} ${f2(sy + L)} C${f2(sx + sway + 0.15)} ${f2(sy + L * 0.7)} ${f2(sx + 0.35)} ${f2(sy + L * 0.4)} ${f2(sx + 0.55)} ${f2(sy)} Z`;
    setAttr(s.querySelector(".mourn-strand-body"), "d", L > 0.3 ? body : "M0 0");
    setAttr(s.querySelector(".mourn-strand-lit"), "d", L > 2 ? `M${f2(sx + 0.3)} ${f2(sy + 0.6)} C${f2(sx + 0.3)} ${f2(sy + L * 0.35)} ${f2(sx + sway * 0.6)} ${f2(sy + L * 0.6)} ${f2(sx + sway * 0.9)} ${f2(sy + L * 0.8)}` : "M0 0");
    const drop = s.querySelector(".mourn-strand-drop");
    setAttr(drop, "transform", L > 3 ? `translate(${f2(sx + sway)} ${f2(sy + L + 1.4 + ((p * 60 + i * 7) % 6))}) scale(1 1.3)` : "scale(0)");
  });
  // Water falls down the frame, not along the hand.
  const pivot = `${PALM.x} ${PALM.y}`;
  setAttr(strands, "transform", `rotate(${f1(counter)} ${pivot})`);
};

/* ── The drop on the glass ────────────────────────────────────────────── */

const Lens = ({ cue }: VfxProps): ReactNode => {
  const hit = cue.params?.mode === "hit";
  return (
    <div className="mourn-lens" data-mode={hit ? "hit" : "open"}>
      <Params cue={cue} />
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <g className="mourn-lens-rings">
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={i} data-i={i} />
          ))}
        </g>
        {hit && (
          <g className="mourn-lens-drop">
            <path d={DROP(60)} />
            <ellipse className="mourn-lens-drop-lit" cx="-22" cy="4" rx="12" ry="18" />
          </g>
        )}
      </svg>
    </div>
  );
};

const lens: Frame = (el, p) => {
  const d = params(el);
  const cx = num(d, "cx", 0.5) * 1600;
  const cy = num(d, "cy", 0.5) * 900;
  const hit = d.mode === "hit";
  // "hit": a drop comes at the lens and bursts at `burst`; "open": its rings carry on out and go.
  const burst = num(d, "burst", 0.55);
  const drop = el.querySelector(".mourn-lens-drop");
  if (drop) {
    const k = span(p, 0, burst);
    const s = 0.2 + 1.3 * ease("in", k);
    setAttr(drop, "transform", p < burst ? `translate(${f1(cx)} ${f1(cy - 260 * (1 - ease("out", k)))}) scale(${f2(s)})` : "scale(0)");
  }
  const t = hit ? span(p, burst, 1) * 0.28 : 0.28 + p * 0.72;
  el.querySelectorAll<SVGEllipseElement>(".mourn-lens-rings ellipse").forEach((ring) => {
    const i = Number(ring.dataset.i);
    const k = clamp(t * 1.25 - i * 0.12);
    const r = 40 + ease("out", k) * (900 + i * 120);
    setAttr(ring, "cx", f1(cx));
    setAttr(ring, "cy", f1(cy));
    setAttr(ring, "rx", f1(r));
    setAttr(ring, "ry", f1(r * 0.92));
    setAttr(ring, "stroke-width", f1(26 * (1 - k) + 3));
    setAttr(ring, "opacity", k > 0 && k < 1 ? f2((1 - k) * (hit ? 0.8 : 0.65)) : "0");
  });
};

/* ── The mere, in front of the figures ────────────────────────────────── */

const WHO = ["caster", "targets-0", "targets-1", "targets-2", "targets-3", "targets-4"];

const Shallows = ({ cue }: VfxProps): ReactNode => (
  <svg className="mourn-world mourn-shallows" viewBox="-800 -450 3200 1800" aria-hidden="true">
    <Params cue={cue} />
    <defs>
      {/* The water's colour at the figures' feet, faded out at both sides so only the legs are covered. */}
      <linearGradient id={`mourn-sh-${cue.seed ?? 0}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={MERE[1]} stopOpacity="0" />
        <stop offset="0.28" stopColor={MERE[1]} stopOpacity="1" />
        <stop offset="0.72" stopColor={MERE[1]} stopOpacity="1" />
        <stop offset="1" stopColor={MERE[1]} stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`mourn-shd-${cue.seed ?? 0}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity="0" />
        <stop offset="0.28" stopColor="#000" stopOpacity="1" />
        <stop offset="0.72" stopColor="#000" stopOpacity="1" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </linearGradient>
    </defs>
    {WHO.map((id) => (
      <g key={id} className="mourn-sh" data-who={id}>
        <path className="mourn-sh-water" fill={`url(#mourn-sh-${cue.seed ?? 0})`} />
        <path className="mourn-sh-dim" fill={`url(#mourn-shd-${cue.seed ?? 0})`} />
        <path className="mourn-sh-edge" />
        <ellipse className="mourn-sh-ring" />
        <ellipse className="mourn-sh-ring b" />
      </g>
    ))}
  </svg>
);

const shallows: Frame = (el, p, age, ctx) => {
  const d = params(el);
  const only = d.who;
  const depth = num(d, "depth", 0.12);
  // The target's water can climb it: from `depth` to `rise` between `ra` and `rb`.
  const rise = num(d, "rise", depth);
  const ra = num(d, "ra", 0);
  const rb = num(d, "rb", 1);
  el.querySelectorAll<SVGGElement>(".mourn-sh").forEach((g) => {
    const id = g.dataset.who!;
    const a = (!only || id.startsWith(only)) && ctx.actor(id);
    if (!a || a.y < SHORE + 4) {
      setAttr(g, "visibility", "hidden");
      return;
    }
    setAttr(g, "visibility", "visible");
    const target = id.startsWith("targets");
    const k = target ? ease("inOut", span(p, ra, rb)) : 0;
    const dep = depth + (rise - depth) * k;
    const w = a.h * (target ? 2.1 : 1.6);
    const y0 = a.y - a.h * dep;
    // The water climbing a figure heaps up round it first.
    const hump = target ? a.h * 0.07 * Math.sin(k * Math.PI) : 0;
    const x0 = a.x - w / 2;
    const x1 = a.x + w / 2;
    const water = `M${f1(x0)} ${f1(y0 + 2)} C${f1(a.x - w * 0.3)} ${f1(y0)} ${f1(a.x - w * 0.2)} ${f1(y0 - hump)} ${f1(a.x)} ${f1(y0 - hump)} C${f1(a.x + w * 0.2)} ${f1(y0 - hump)} ${f1(a.x + w * 0.3)} ${f1(y0)} ${f1(x1)} ${f1(y0 + 2)} L${f1(x1)} ${f1(a.y + a.h * 0.08)} C${f1(a.x + w * 0.2)} ${f1(a.y + a.h * 0.12)} ${f1(a.x - w * 0.2)} ${f1(a.y + a.h * 0.12)} ${f1(x0)} ${f1(a.y + a.h * 0.08)} Z`;
    setAttr(g.querySelector(".mourn-sh-water"), "d", water);
    setAttr(g.querySelector(".mourn-sh-dim"), "d", water);
    setAttr(
      g.querySelector(".mourn-sh-edge"),
      "d",
      `M${f1(a.x - w * 0.34)} ${f1(y0 + 1)} C${f1(a.x - w * 0.2)} ${f1(y0 - hump)} ${f1(a.x + w * 0.2)} ${f1(y0 - hump)} ${f1(a.x + w * 0.34)} ${f1(y0 + 1)}`,
    );
    setStyle(g, "--sw", f1(Math.max(2, a.h * 0.012)));
    // A ring round the legs, and a slow one going out from it.
    const r0 = g.querySelector(".mourn-sh-ring");
    setAttr(r0, "cx", f1(a.x));
    setAttr(r0, "cy", f1(y0 + 2));
    setAttr(r0, "rx", f1(w * 0.3));
    setAttr(r0, "ry", f1(w * 0.045));
    const cyc = ((age / 1400 + (id.length % 3) * 0.3) % 1 + 1) % 1;
    const r1 = g.querySelector(".mourn-sh-ring.b");
    setAttr(r1, "cx", f1(a.x));
    setAttr(r1, "cy", f1(y0 + 2));
    setAttr(r1, "rx", f1(w * (0.3 + cyc * 0.45)));
    setAttr(r1, "ry", f1(w * (0.045 + cyc * 0.06)));
    setAttr(r1, "opacity", f2(0.5 * (1 - cyc)));
  });
};

/* ── Rings across the mere ────────────────────────────────────────────── */

const Rings = ({ cue }: VfxProps): ReactNode => (
  <svg className="mourn-world mourn-rings" viewBox="-800 -450 3200 1800" aria-hidden="true">
    <Params cue={cue} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <g key={i} data-i={i}>
        <ellipse className="mourn-ring-dark" />
        <ellipse className="mourn-ring" />
      </g>
    ))}
  </svg>
);

const rings: Frame = (el, p, _age, ctx) => {
  const d = params(el);
  // From the Warden's spill (an offset from its feet, in its heights) to past the target.
  const c = ctx.actor("caster");
  const t = ctx.actor("targets-0");
  const ox = c ? c.x + c.h * num(d, "ox", 0.3) : num(d, "x", 400);
  const oy = c ? c.y + c.h * num(d, "oy", 0.02) : num(d, "y", 740);
  const reach = t ? Math.abs(t.x - ox) * num(d, "past", 1.25) : 900;
  const flat = num(d, "flat", 0.11);
  el.querySelectorAll<SVGGElement>("g[data-i]").forEach((g) => {
    const i = Number(g.dataset.i);
    const k = span(p, i * 0.1, i * 0.1 + 0.62);
    const r = 20 + ease("out", k) * reach * (1 - i * 0.07);
    const o = k > 0 && k < 1 ? (1 - k) * (i === 0 ? 0.95 : 0.7) : 0;
    for (const e of g.querySelectorAll("ellipse")) {
      setAttr(e, "cx", f1(ox));
      setAttr(e, "cy", f1(oy));
      setAttr(e, "rx", f1(r));
      setAttr(e, "ry", f1(r * flat));
      setAttr(e, "opacity", f2(o));
    }
  });
  // When the first ring reaches the target, say so, for its water to climb.
  if (t) el.dataset.reached = String(Math.min(1, (Math.abs(t.x - ox) + 1) / reach));
};

/* ── Strands off the hand, in a wide ──────────────────────────────────── */

const Spill = ({ cue }: VfxProps): ReactNode => (
  <svg className="mourn-world mourn-spill" viewBox="-800 -450 3200 1800" aria-hidden="true">
    <Params cue={cue} />
    {[0, 1, 2].map((i) => (
      <g key={i} data-i={i}>
        <path className="mourn-spill-body" />
        <path className="mourn-spill-lit" />
      </g>
    ))}
  </svg>
);

const spill: Frame = (el, p, age, ctx) => {
  const d = params(el);
  const c = ctx.actor("caster");
  if (!c) return;
  // The palm, found from the figure: its offset in the figure's heights.
  const hx = c.x + c.h * num(d, "hx", 0.3);
  const hy = c.y - c.h * num(d, "hy", 0.52);
  const wy = c.y - c.h * num(d, "wy", 0.1);
  const grow = ease("out", span(p, 0, 0.35));
  el.querySelectorAll<SVGGElement>("g[data-i]").forEach((g) => {
    const i = Number(g.dataset.i);
    const x = hx + (i - 1) * c.h * 0.025;
    const L = (wy - hy) * grow;
    const sway = Math.sin(age / 260 + i * 2) * c.h * 0.006;
    const w = c.h * (0.012 - i * 0.002);
    setAttr(
      g.querySelector(".mourn-spill-body"),
      "d",
      `M${f1(x - w)} ${f1(hy)} C${f1(x - w * 0.6)} ${f1(hy + L * 0.4)} ${f1(x + sway)} ${f1(hy + L * 0.7)} ${f1(x + sway)} ${f1(hy + L)} C${f1(x + sway + w * 0.3)} ${f1(hy + L * 0.7)} ${f1(x + w * 0.6)} ${f1(hy + L * 0.4)} ${f1(x + w)} ${f1(hy)} Z`,
    );
    setAttr(g.querySelector(".mourn-spill-lit"), "d", `M${f1(x + w * 0.3)} ${f1(hy + 2)} C${f1(x + w * 0.3)} ${f1(hy + L * 0.4)} ${f1(x + sway)} ${f1(hy + L * 0.7)} ${f1(x + sway)} ${f1(hy + L * 0.9)}`);
  });
};

/* ── The hand closing, the lantern going out ──────────────────────────── */

const Grasp = ({ cue }: VfxProps): ReactNode => (
  <i hidden>
    <Params cue={cue} />
  </i>
);

const grasp: Frame = (el, p) => {
  const d = params(el);
  const node = casterNode(el);
  if (!node) return;
  const k = span(p, num(d, "a", 0), num(d, "b", 1));
  const from = num(d, "from", 0);
  const to = num(d, "to", 1);
  setStyle(node, "--wdn-grasp", f2(from + (to - from) * ease("in", k)));
  setStyle(node, "--mourn-mote", f2(num(d, "mote", 1)));
  const lf = num(d, "lampFrom", 1);
  const lt = num(d, "lampTo", 1);
  // A flame going out gutters first.
  const lk = span(p, num(d, "la", 0), num(d, "lb", 1));
  const gutter = lk > 0 && lk < 1 ? [1, 0.55, 0.9, 0.3, 0.6, 0.15][Math.floor(lk * 6)] : 1;
  setStyle(node, "--mourn-lamp", f2((lf + (lt - lf) * lk) * (lk > 0 && lk < 1 ? gutter : 1)));
};

/* ── The mere closing over the target ─────────────────────────────────── */

/** The fist, in the target's heights ×100: ground at 0, the figure's top at −100. */
const FINGERS = [-57, -19, 19, 57];
const KNUCKLE = -168;
const TIP = -78;

const finger = (cx: number, lean: number) => {
  const w = 18;
  return `M${cx - w + lean} ${KNUCKLE + 18} C${cx - w + lean} ${KNUCKLE - 6} ${cx + w + lean} ${KNUCKLE - 6} ${cx + w + lean} ${KNUCKLE + 18} L${cx + w - 1} ${TIP} C${cx + w - 2} ${TIP + 20} ${cx - w + 2} ${TIP + 20} ${cx - w + 1} ${TIP} Z`;
};

const BACK_HAND =
  "M-70 8 C-78 -40 -104 -84 -100 -130 C-96 -168 -66 -190 -24 -192 C18 -194 70 -186 94 -160 C112 -138 110 -98 100 -70 C90 -40 76 -12 72 8 Z";
const THUMB = "M104 -118 C92 -84 58 -58 6 -60 C-18 -60 -26 -40 -8 -32 C36 -22 88 -40 116 -86 Z";

const Fist = ({ cue }: VfxProps): ReactNode => {
  const front = cue.params?.part === "front";
  const rand = seeded(cue.seed ?? 5);
  return (
    <div className="mourn-fist" data-part={front ? "front" : "back"}>
      <Params cue={cue} />
      <svg viewBox="-160 -260 320 300" overflow="visible">
        <defs>
          <linearGradient id={`mourn-fist-${front ? "f" : "b"}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2c4a42" />
            <stop offset="0.35" stopColor="#0d1d19" />
            <stop offset="1" stopColor="#040a08" />
          </linearGradient>
        </defs>
        <g className="mourn-fist-hand">
          {front ? (
            <>
              {FINGERS.map((x, i) => (
                <g key={i} className="mourn-finger" data-i={i}>
                  <path className="mourn-fist-body" d={finger(x, 0)} fill={`url(#mourn-fist-f)`} />
                  <path className="mourn-fist-lit" d={`M${x - 11} ${KNUCKLE + 4} C${x - 6} ${KNUCKLE - 4} ${x + 6} ${KNUCKLE - 4} ${x + 11} ${KNUCKLE + 4}`} />
                  <path className="mourn-fist-crease" d={`M${x - 13} ${-128} Q${x} ${-121} ${x + 13} ${-128}`} />
                  <path className="mourn-fist-run" d={`M${x + 9} ${KNUCKLE + 14} C${x + 11} ${-140} ${x + 10} ${-110} ${x + 9} ${TIP + 4}`} />
                </g>
              ))}
              <g className="mourn-thumb">
                <path className="mourn-fist-body" d={THUMB} fill={`url(#mourn-fist-f)`} />
                <path className="mourn-fist-lit" d="M98 -106 C84 -80 52 -64 8 -62" />
              </g>
            </>
          ) : (
            <>
              <path className="mourn-fist-body back" d={BACK_HAND} fill={`url(#mourn-fist-b)`} />
              <path className="mourn-fist-lit" d="M-86 -128 C-80 -170 -40 -184 -4 -184" />
            </>
          )}
        </g>
        {!front && (
          <g className="mourn-fist-wrist">
            <ellipse className="mourn-fist-foot" cx="0" cy="6" rx="120" ry="16" />
          </g>
        )}
        {front && (
          <g className="mourn-fist-spray">
            {Array.from({ length: 22 }, (_, i) => {
              const a = -Math.PI * (0.06 + rand() * 0.88);
              const sp = 90 + rand() * 170;
              return (
                <path
                  key={i}
                  d={DROP(2.4 + rand() * 3.4)}
                  data-vx={f1(Math.cos(a) * sp)}
                  data-vy={f1(Math.sin(a) * sp)}
                  data-x={f1(-80 + rand() * 160)}
                  data-y={f1(KNUCKLE + rand() * 30)}
                />
              );
            })}
          </g>
        )}
        <g className="mourn-fist-sheets">
          {front &&
            [-86, -60, -30, -4, 22, 50, 78].map((x, i) => <path key={i} data-x={x} data-i={i} />)}
        </g>
        {!front && (
          <g className="mourn-fist-splash">
            <ellipse className="mourn-fist-ring" cx="0" cy="4" />
            <ellipse className="mourn-fist-ring b" cx="0" cy="4" />
          </g>
        )}
      </svg>
    </div>
  );
};

const fist: Frame = (el, p) => {
  const d = params(el);
  const close = num(d, "close", 0.03);
  const fall = num(d, "fall", 0.3);
  const gone = num(d, "gone", 0.56);
  const front = d.part === "front";
  const hand = el.querySelector<SVGGElement>(".mourn-fist-hand");
  // Closing: the fingers come over the last of the way; then it squeezes;
  // then it lets go and falls back into the mere.
  const shut = ease("out", span(p, 0, close));
  const squeeze = Math.sin(span(p, close, fall) * Math.PI) * 0.06;
  const drop = ease("in", span(p, fall, gone));
  const sx = 1 + squeeze * 0.5 - drop * 0.1;
  const sy = (0.82 + 0.18 * shut) * (1 - squeeze) * (1 - drop * 0.55);
  setAttr(hand, "transform", `translate(0 ${f1(drop * 60)}) scale(${f2(sx)} ${f2(sy)})`);
  setAttr(hand, "opacity", f2(1 - span(p, fall + 0.1, gone)));
  if (front) {
    el.querySelectorAll<SVGGElement>(".mourn-finger").forEach((g) => {
      const i = Number(g.dataset.i);
      // The fingers are still curling in over the top as it closes.
      const curl = (1 - shut) * (30 + i * 4);
      const sag = drop * (40 + ((i * 17) % 30));
      setAttr(g, "transform", `translate(0 ${f1(-curl + sag)})`);
    });
    const t = span(p, close, gone) * 0.9;
    el.querySelectorAll<SVGPathElement>(".mourn-fist-spray path").forEach((s) => {
      const x = Number(s.dataset.x) + Number(s.dataset.vx) * t;
      const y = Number(s.dataset.y) + Number(s.dataset.vy) * t + 420 * t * t;
      setAttr(s, "transform", p > close * 0.6 ? `translate(${f1(x)} ${f1(y)})` : "scale(0)");
      setAttr(s, "opacity", f2(p > close * 0.6 ? 1 - span(p, gone - 0.1, gone + 0.2) : 0));
    });
    // Sheets of water falling away as it lets go.
    const sh = span(p, fall, gone + 0.16);
    el.querySelectorAll<SVGPathElement>(".mourn-fist-sheets path").forEach((s) => {
      const i = Number(s.dataset.i);
      const x = Number(s.dataset.x);
      const k = clamp(sh * 1.3 - i * 0.05);
      const top = KNUCKLE + 30 + k * 170;
      const len = 30 + Math.sin(k * Math.PI) * 110;
      const sw = 5 + (i % 3) * 2;
      setAttr(s, "d", k > 0 && k < 1 ? `M${x - sw} ${f1(top)} C${x - sw - 3} ${f1(top + len * 0.35)} ${x + 4} ${f1(top + len * 0.6)} ${x} ${f1(top + len)} C${x + 7} ${f1(top + len * 0.6)} ${x + sw + 2} ${f1(top + len * 0.35)} ${x + sw} ${f1(top)} Z` : "M0 0");
      setAttr(s, "opacity", f2(0.9 * (1 - k)));
    });
  } else {
    const k = span(p, 0, gone + 0.3);
    el.querySelectorAll<SVGEllipseElement>(".mourn-fist-ring").forEach((r, i) => {
      const kk = clamp(k * 1.2 - i * 0.2);
      setAttr(r, "rx", f1(110 + kk * 260));
      setAttr(r, "ry", f1(14 + kk * 34));
      setAttr(r, "opacity", f2(kk > 0 && kk < 1 ? 0.9 * (1 - kk) : 0));
    });
    setAttr(el.querySelector(".mourn-fist-foot"), "opacity", f2(1 - drop));
  }
};

/* ── The light off the water behind it, so the drawn frame reads ─────── */

const Glare = ({ cue }: VfxProps): ReactNode => (
  <div className="mourn-glare">
    <Params cue={cue} />
    <svg viewBox="-100 -100 200 200">
      <defs>
        <radialGradient id="mourn-glare-g">
          <stop offset="0" stopColor="#f4fbf7" />
          <stop offset="0.45" stopColor="#cfe4db" stopOpacity="0.9" />
          <stop offset="1" stopColor="#6f8f84" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="0" rx="100" ry="100" fill="url(#mourn-glare-g)" />
    </svg>
  </div>
);

const glare: Frame = (el, p) => {
  el.style.setProperty("--glare", f2(1 - ease("in", span(p, 0.2, 1))));
};

/* ── What stays on it ─────────────────────────────────────────────────── */

/** Where water keeps running off it: along the body, in its heights ×100. */
const CLING = [
  { x: -58, y: -52, len: 4, w: 3 },
  { x: -40, y: -66, len: 5, w: 3.6 },
  { x: -22, y: -74, len: 6, w: 4 },
  { x: -4, y: -70, len: 5, w: 3.4 },
  { x: 14, y: -66, len: 6, w: 3.8 },
  { x: 32, y: -58, len: 5, w: 3.2 },
  { x: 50, y: -48, len: 4, w: 3 },
  { x: -30, y: -44, len: 4, w: 2.6 },
  { x: 22, y: -40, len: 4, w: 2.6 },
];

const Cling = ({ cue }: VfxProps): ReactNode => {
  const rand = seeded(cue.seed ?? 3);
  return (
    <div className="mourn-cling">
      <Params cue={cue} />
      <svg viewBox="-100 -130 200 150" overflow="visible">
        <ellipse className="mourn-cling-pool" cx="0" cy="2" rx="86" ry="11" />
        {CLING.map((s, i) => (
          <g key={i} className="mourn-cling-strand" data-i={i} data-x={s.x} data-y={s.y} data-len={s.len} data-w={s.w}>
            <path className="mourn-cling-body" />
            <path className="mourn-cling-lit" />
            <path className="mourn-cling-drop" d={DROP(2.6)} />
          </g>
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse
            key={i}
            className="mourn-cling-weed"
            cx={f1(-44 + rand() * 88)}
            cy={f1(-90 + rand() * 70)}
            rx={f1(2.2 + rand() * 2)}
            ry={f1(1.2 + rand())}
          />
        ))}
        <ellipse className="mourn-cling-ring" cx="0" cy="2" />
        <ellipse className="mourn-cling-ring b" cx="0" cy="2" />
      </svg>
    </div>
  );
};

const cling: Frame = (el, p, age) => {
  // Soaked through and heavy with it: the water keeps running off every edge
  // of the figure, a bead swelling and letting go, over and over, into a
  // black pool that rings under it.
  const d = params(el);
  const grow = ease("out", span(p, 0, num(d, "grow", 0.3)));
  el.style.setProperty("--grow", f2(grow));
  el.querySelectorAll<SVGGElement>(".mourn-cling-strand").forEach((g) => {
    const i = Number(g.dataset.i);
    const x = Number(g.dataset.x);
    const y = Number(g.dataset.y);
    const w = Number(g.dataset.w);
    // Heavy: they hang, stretch towards the water, and let a drop go now and then.
    const L = Number(g.dataset.len) * grow * (0.9 + 0.1 * Math.sin(age / 500 + i));
    const sway = Math.sin(age / 700 + i * 1.7) * 1.5;
    // A strand of water is not a bar: it narrows, swells into a bead, narrows again.
    const left: string[] = [];
    const right: string[] = [];
    for (let n = 0; n <= 8; n++) {
      const t = n / 8;
      const bulge = 0.55 + 0.45 * Math.abs(Math.sin(t * Math.PI * 2.5 + i));
      const hw = w * (1 - t * 0.75) * bulge;
      const cx = x + sway * t + Math.sin(t * 5 + i) * 1.4;
      left.push(`${f1(cx - hw)} ${f1(y + L * t)}`);
      right.unshift(`${f1(cx + hw)} ${f1(y + L * t)}`);
    }
    setAttr(g.querySelector(".mourn-cling-body"), "d", L > 1 ? `M${left.join(" L")} L${right.join(" L")} Z` : "M0 0");
    void left;
    setAttr(g.querySelector(".mourn-cling-lit"), "d", `M${f1(x + w * 0.35)} ${f1(y + 2)} C${f1(x + w * 0.35)} ${f1(y + L * 0.4)} ${f1(x + sway)} ${f1(y + L * 0.7)} ${f1(x + sway)} ${f1(y + L * 0.85)}`);
    const cyc = ((age / (620 + i * 90) + i * 0.37) % 1 + 1) % 1;
    // Each bead swells where it hangs for the first half of its cycle, then falls.
    const swellK = Math.min(1, cyc * 2);
    const fallK = Math.max(0, cyc * 2 - 1);
    const dy = y + L + fallK * fallK * Math.max(8, -y - L + 2);
    const ds = grow * (0.4 + 0.6 * swellK) * (w / 3.2);
    setAttr(g.querySelector(".mourn-cling-drop"), "transform", grow > 0.05 ? `translate(${f1(x + sway)} ${f1(dy)}) scale(${f2(ds)} ${f2(ds * (1 + fallK * 0.6))})` : "scale(0)");
  });
  el.querySelectorAll<SVGEllipseElement>(".mourn-cling-ring").forEach((r, i) => {
    const cyc = ((age / 1100 + i * 0.5) % 1 + 1) % 1;
    setAttr(r, "rx", f1(50 + cyc * 90));
    setAttr(r, "ry", f1(7 + cyc * 12));
    setAttr(r, "opacity", f2(grow * 0.6 * (1 - cyc)));
  });
};

/* ── On the real battlefield ──────────────────────────────────────────── */

const Board = ({ cue, color }: VfxProps): ReactNode => {
  const mode = String(cue.params?.mode ?? "call");
  return (
    <div className="mourn-board" data-mode={mode}>
      <Params cue={cue} />
      {mode === "drowned" ? (
        <Cling cue={{ ...cue, params: {} }} color={color} />
      ) : mode === "call" ? (
        <svg viewBox="-120 -40 240 80" overflow="visible">
          <ellipse className="mourn-board-pool" cx="0" cy="0" />
          <ellipse className="mourn-board-ring" cx="0" cy="0" />
          <ellipse className="mourn-board-ring b" cx="0" cy="0" />
        </svg>
      ) : null}
    </div>
  );
};

const WET_MARK = `<svg viewBox="-100 -130 200 150" overflow="visible"><ellipse class="mourn-wet-pool" cx="0" cy="2" rx="70" ry="9"/><ellipse class="mourn-wet-ring" cx="0" cy="2"/><ellipse class="mourn-wet-ring b" cx="0" cy="2"/><path class="mourn-wet-drip" d="${DROP(2.4)}"/><path class="mourn-wet-drip b" d="${DROP(2)}"/><path class="mourn-wet-sheen" d="M-30 -86 C-34 -60 -32 -30 -28 -8 M22 -80 C26 -54 24 -28 20 -6"/></svg>`;

const board: Frame = (el, p, age) => {
  const d = params(el);
  const box = el.querySelector<HTMLElement>(".mourn-board");
  const root = rootOf(el);
  if (!box || !root) return;
  const mode = box.dataset.mode;
  el.style.setProperty("--pp", f2(p));
  if (mode === "call") {
    const k = ease("out", span(p, 0, 0.7));
    setAttr(el.querySelector(".mourn-board-pool"), "rx", f1(16 + k * 56));
    setAttr(el.querySelector(".mourn-board-pool"), "ry", f1(3 + k * 10));
    el.querySelectorAll(".mourn-board-ring").forEach((r, i) => {
      const kk = span(p, 0.25 + i * 0.25, 0.9 + i * 0.25);
      setAttr(r, "rx", f1(30 + kk * 90));
      setAttr(r, "ry", f1(6 + kk * 16));
      setAttr(r, "opacity", f2(kk > 0 && kk < 1 ? 0.8 * (1 - kk) : 0));
    });
    return;
  }
  if (mode === "drowned") {
    cling(el, clamp(p * 1.4 + 0.3), age, { actor: () => undefined });
    return;
  }
  // "soaked": every other enemy on the board, its water laid and dripping, one after another.
  if (!box.dataset.built) {
    box.dataset.built = "1";
    const drowned = [...root.querySelectorAll<HTMLElement>('.mourn-board-wrap[data-anchor], .fx-mourn-board-wrap[data-anchor]')]
      .filter((w) => w.querySelector('.mourn-board[data-mode="drowned"]'))
      .map((w) => w.dataset.anchor);
    const units = [...document.querySelectorAll<HTMLElement>('.stage .combatant[data-side="enemy"]')].filter(
      (u) => !u.hasAttribute("data-down") && !drowned.includes(u.dataset.unit),
    );
    units.forEach((u, i) => {
      const mark = document.createElement("div");
      mark.className = "mourn-wet";
      mark.dataset.unit = u.dataset.unit ?? "";
      mark.style.setProperty("--i", String(i));
      mark.innerHTML = WET_MARK;
      box.appendChild(mark);
    });
  }
  const measure = Number(box.dataset.measured ?? -1e9);
  if (age - measure > 200 || age < measure) {
    box.dataset.measured = String(age);
    const origin = root.getBoundingClientRect();
    const left = parseFloat(el.style.left) || 0;
    const top = parseFloat(el.style.top) || 0;
    box.querySelectorAll<HTMLElement>(".mourn-wet").forEach((m) => {
      const r = document.querySelector<HTMLElement>(`.stage [data-unit="${CSS.escape(m.dataset.unit ?? "")}"] .combatant-rig`)?.getBoundingClientRect();
      if (!r) return;
      m.style.transform = `translate3d(${f1(r.left + r.width / 2 - origin.left - left)}px, ${f1(r.bottom - origin.top - top)}px, 0)`;
      m.style.setProperty("--u", `${f1(Math.max(50, r.height))}px`);
    });
  }
  const stagger = num(d, "stagger", 0.12);
  box.querySelectorAll<HTMLElement>(".mourn-wet").forEach((m, i) => {
    const k = ease("out", span(p, 0.05 + i * stagger, 0.45 + i * stagger));
    m.style.setProperty("--k", f2(k));
    m.querySelectorAll(".mourn-wet-ring").forEach((r, n) => {
      const cyc = ((age / 1200 + n * 0.5 + i * 0.2) % 1 + 1) % 1;
      setAttr(r, "rx", f1(40 + cyc * 70));
      setAttr(r, "ry", f1(6 + cyc * 9));
      setAttr(r, "opacity", f2(k * 0.7 * (1 - cyc)));
    });
    m.querySelectorAll(".mourn-wet-drip").forEach((drip, n) => {
      const cyc = ((age / (700 + n * 130) + i * 0.3 + n * 0.5) % 1 + 1) % 1;
      setAttr(drip, "transform", `translate(${n ? 18 : -24} ${f1(-70 + cyc * cyc * 70)})`);
      setAttr(drip, "opacity", f2(k * (1 - cyc * 0.6)));
    });
  });
};

/* ── Registered ────────────────────────────────────────────────────────── */

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "mourn-tear": Tear,
  "mourn-palm": Palm,
  "mourn-lens": Lens,
  "mourn-shallows": Shallows,
  "mourn-rings": Rings,
  "mourn-spill": Spill,
  "mourn-grasp": Grasp,
  "mourn-fist": Fist,
  "mourn-cling": Cling,
  "mourn-glare": Glare,
  "mourn-board": Board,
};

const withParams =
  (frame: Frame): Frame =>
  (el, p, age, ctx) => {
    params(el);
    frame(el, p, age, ctx);
  };

export const frames: Record<string, Frame> = {
  "mourn-tear": withParams(tear),
  "mourn-palm": withParams(palm),
  "mourn-lens": withParams(lens),
  "mourn-shallows": withParams(shallows),
  "mourn-rings": withParams(rings),
  "mourn-spill": withParams(spill),
  "mourn-grasp": withParams(grasp),
  "mourn-fist": withParams(fist),
  "mourn-cling": withParams(cling),
  "mourn-glare": glare,
  "mourn-board": withParams(board),
};

