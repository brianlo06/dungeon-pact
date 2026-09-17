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
      if (!anchor) return;
      const g = INSIDE.get(anchor);
      // Anything the effect moved elsewhere in the part goes with it.
      g?.parentElement?.querySelectorAll(":scope > .mourn-extra").forEach((n) => n.remove());
      g?.remove();
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

/**
 * Drawing units, in the Warden's hand: the hollow of the cupped palm that the
 * close-up draws (`--wdn-palm`), between the raised thumb and the fingers.
 */
const PALM = { x: 77, y: 57.2 };
/** The green light held in the palm, as the drawing places it. */
const LIGHT = { x: 75.5, y: 49.5 };

const PALM_MARKUP = (() => {
  const rand = seeded(61);
  const crown = Array.from({ length: 9 }, (_, i) => {
    const a = -Math.PI * (0.1 + (i / 8) * 0.8);
    const speed = 6 + rand() * 6;
    return `<circle class="mourn-crown" data-vx="${f2(Math.cos(a) * speed)}" data-vy="${f2(Math.sin(a) * speed)}" r="${f2(0.4 + rand() * 0.35)}"/>`;
  }).join("");
  // Off the heel of the hand, off the fingertips, and through the fingers underneath.
  const strands = [
    { x: 70.2, y: 59.2, len: 14, sway: -0.8 },
    { x: 86.4, y: 55.6, len: 17, sway: 1 },
    { x: 80, y: 61, len: 10, sway: 0.3 },
    { x: 74, y: 61.2, len: 15, sway: -0.5 },
  ]
    .map(
      (st, i) =>
        `<g class="mourn-strand" data-x="${st.x}" data-y="${st.y}" data-len="${st.len}" data-sway="${st.sway}" data-i="${i}"><path class="mourn-strand-body"/><path class="mourn-strand-drop" d="${DROP(0.7)}"/></g>`,
    )
    .join("");
  return `
    <g class="mourn-extra mourn-palm-light-host"><defs><radialGradient id="mourn-palm-light"><stop offset="0" stop-color="#d8ffb8" stop-opacity="0.7"/><stop offset="0.35" stop-color="#8fd46a" stop-opacity="0.28"/><stop offset="1" stop-color="#5f9f4a" stop-opacity="0"/></radialGradient></defs><circle class="mourn-palm-light" cx="${LIGHT.x}" cy="${LIGHT.y + 3}" r="26" fill="url(#mourn-palm-light)"/></g>
    <g class="mourn-palm-strands">${strands}</g>
    <path class="mourn-palm-pool"/>
    <path class="mourn-palm-lit"/>
    <ellipse class="mourn-palm-ring" cx="${PALM.x}" cy="${PALM.y - 0.6}"/>
    <g class="mourn-palm-crown" transform="translate(${PALM.x} ${PALM.y - 0.6})">${crown}</g>
    <path class="mourn-palm-wisp"/>
    <g class="mourn-palm-drop">
      <path class="mourn-palm-trail"/>
      <g class="mourn-palm-fall"><path d="${DROP(1.5)}"/><circle class="mourn-tear-lit" cx="-0.5" cy="0.25" r="0.42"/></g>
    </g>
  `;
})();

const Palm = ({ cue }: VfxProps): ReactNode => <InsideAnchor cue={cue} className="mourn-palm-anchor" />;

const palm: Frame = (el, p, age) => {
  const d = params(el);
  const land = num(d, "land", 0.36);
  const node = casterNode(el);
  const g = inside(el, '[data-part="hand"]', "mourn-palm", PALM_MARKUP);
  if (!g || !node) return;
  setStyle(node, "--wdn-palm", "1");
  // The light the palm holds is cast on the hand, so it goes behind the drawing, not over its ink.
  const host = g.querySelector(".mourn-palm-light-host");
  if (host && g.parentElement) g.parentElement.insertBefore(host, g.parentElement.firstChild);
  // Gravity is the frame's, not the hand's: falling things are counter-rotated.
  const counter = -partRotation(g.parentElement);
  const upright = `rotate(${f1(counter)} ${PALM.x} ${PALM.y})`;

  // The tear, seen the whole way down: in from the top of the frame, through
  // the light, into the palm, with a streak behind it.
  const k = span(p, 0, land);
  const drop = g.querySelector<SVGGElement>(".mourn-palm-drop");
  setAttr(drop, "transform", upright);
  const fall = g.querySelector<SVGGElement>(".mourn-palm-fall");
  const H0 = 13;
  const fy = PALM.y - 1.2 - H0 * (1 - k * k);
  const falling = p < land;
  setAttr(fall, "transform", falling ? `translate(${PALM.x} ${f2(fy)}) scale(1 ${f2(1 + 0.35 * k)})` : "scale(0)");
  const trail = Math.min(9, 2 + k * 10);
  setAttr(
    g.querySelector(".mourn-palm-trail"),
    "d",
    falling && k > 0.05 ? `M${PALM.x} ${f2(fy - 2.4 - trail)} L${PALM.x} ${f2(fy - 2.4)}` : "M0 0",
  );

  // The light: it swells as the tear comes through it, then gutters and goes out.
  const flare = span(p, land - 0.1, land);
  const out = span(p, land, land + 0.2);
  const gutter = out > 0 && out < 1 ? [1, 0.35, 0.85, 0.2, 0.5, 0.08, 0.2, 0][Math.floor(out * 8)] : out >= 1 ? 0 : 1;
  const light = p < land ? 1 : gutter;
  setStyle(node, "--mourn-mote", f2(light));
  setStyle(node, "--mourn-mote-s", f2(1 + 0.45 * flare * (p < land ? 1 : 0)));
  const glow = g.parentElement?.querySelector(":scope > .mourn-palm-light-host .mourn-palm-light") ?? null;
  setAttr(glow, "opacity", f2(light * (0.8 + 0.5 * flare * (p < land ? 1 : 0))));
  setAttr(glow, "r", f2(26 + 8 * flare * (p < land ? 1 : 0)));
  // What is left of it: a thread of smoke, rising and gone.
  const wisp = span(p, land + 0.14, land + 0.5);
  const wy = LIGHT.y - wisp * 7;
  setAttr(
    g.querySelector(".mourn-palm-wisp"),
    "d",
    wisp > 0 && wisp < 1
      ? `M${LIGHT.x} ${f2(LIGHT.y + 1)} C${f2(LIGHT.x - 1.2)} ${f2(LIGHT.y - 1.5)} ${f2(LIGHT.x + 1.4)} ${f2(wy + 2.5)} ${f2(LIGHT.x + Math.sin(age / 90) * 0.6)} ${f2(wy)}`
      : "M0 0",
  );
  setAttr(g.querySelector(".mourn-palm-wisp"), "opacity", f2(0.5 * Math.sin(wisp * Math.PI)));
  setAttr(g.querySelector(".mourn-palm-wisp"), "transform", `rotate(${f1(counter)} ${LIGHT.x} ${LIGHT.y})`);

  // The crown it throws up.
  const c = span(p, land, land + 0.26);
  g.querySelectorAll<SVGCircleElement>(".mourn-crown").forEach((dr) => {
    const vx = Number(dr.dataset.vx);
    const vy = Number(dr.dataset.vy);
    const t = c * 1.6;
    setAttr(dr, "cx", f2(vx * t));
    setAttr(dr, "cy", f2(vy * t + 10 * t * t));
    setAttr(dr, "opacity", c > 0 && c < 1 ? f2(1 - c * c) : "0");
  });
  const ring = g.querySelector(".mourn-palm-ring");
  setAttr(ring, "rx", f2(1 + c * 7));
  setAttr(ring, "ry", f2(0.4 + c * 1.3));
  setAttr(ring, "opacity", c > 0 && c < 1 ? f2(0.9 * (1 - c)) : "0");

  // Far more water than a tear: black, it fills the hollow of the hand and brims.
  const brim = ease("out", span(p, land + 0.02, land + 0.34));
  const top = PALM.y - 0.4 - brim * 1.6;
  const x0 = 72 - brim * 0.8;
  const x1 = 83 + brim * 1.2;
  const pool = `M${f2(x0)} ${f2(top + 0.6)} C${f2(x0 + 2)} ${f2(top - 0.3)} ${f2(x1 - 3)} ${f2(top - 0.5)} ${f2(x1)} ${f2(top - 0.4)} C${f2(x1 - 1.4)} ${f2(PALM.y + 0.4)} ${f2(PALM.x + 2)} ${f2(PALM.y + 1.2)} ${f2(PALM.x - 1)} ${f2(PALM.y + 1)} C${f2(x0 + 1.4)} ${f2(PALM.y + 0.8)} ${f2(x0 + 0.2)} ${f2(top + 1.4)} ${f2(x0)} ${f2(top + 0.6)} Z`;
  setAttr(g.querySelector(".mourn-palm-pool"), "d", brim > 0.01 ? pool : "M0 0");
  setAttr(
    g.querySelector(".mourn-palm-lit"),
    "d",
    brim > 0.2 ? `M${f2(x0 + 1.6)} ${f2(top + 0.2)} Q${f2(PALM.x)} ${f2(top - 0.5)} ${f2(x1 - 2.4)} ${f2(top - 0.3)}` : "M0 0",
  );

  // And spills off the heel, the fingertips and through the fingers, straight down.
  g.querySelectorAll<SVGGElement>(".mourn-strand").forEach((st) => {
    const i = Number(st.dataset.i);
    const sx = Number(st.dataset.x);
    const sy = Number(st.dataset.y);
    const len = Number(st.dataset.len);
    const sway = Number(st.dataset.sway);
    const grow = ease("in", span(p, land + 0.16 + i * 0.05, land + 0.62 + i * 0.04));
    const L = grow * len;
    const edgeL: string[] = [];
    const edgeR: string[] = [];
    for (let n = 0; n <= 10; n++) {
      const t = n / 10;
      const hw = 0.42 * (1 - t * 0.8) * (0.55 + 0.45 * Math.abs(Math.sin(t * 9 + i * 1.3 + p * 20)));
      const cx = sx + sway * t * t + Math.sin(t * 6 + i + p * 14) * 0.3;
      edgeL.push(`${f2(cx - hw)} ${f2(sy + L * t)}`);
      edgeR.unshift(`${f2(cx + hw)} ${f2(sy + L * t)}`);
    }
    setAttr(st.querySelector(".mourn-strand-body"), "d", L > 0.3 ? `M${edgeL.join(" L")} L${edgeR.join(" L")} Z` : "M0 0");
    setAttr(
      st.querySelector(".mourn-strand-drop"),
      "transform",
      L > 3 ? `translate(${f2(sx + sway)} ${f2(sy + L + 1.4 + ((p * 60 + i * 7) % 6))}) scale(1 1.3)` : "scale(0)",
    );
    setAttr(st, "transform", `rotate(${f1(counter)} ${sx} ${sy})`);
  });
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
  // Only the palm shot draws the cupped hand; every other shot keeps the drawing's own.
  setStyle(node, "--wdn-palm", "0");
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
                  {/* Light along the finger's edge, so even the flat two-tone frame shows four fingers. */}
                  <path className="mourn-fist-edge" d={`M${x - 15} ${KNUCKLE + 16} L${x - 14} ${TIP + 2}`} />
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
  setAttr(hand, "opacity", f2(1 - ease("out", span(p, fall + 0.02, gone - 0.08))));
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

const Board = ({ cue }: VfxProps): ReactNode => {
  const mode = String(cue.params?.mode ?? "call");
  return (
    <div className="mourn-board" data-mode={mode}>
      <Params cue={cue} />
      {mode === "call" ? (
        <svg viewBox="-120 -40 240 80" overflow="visible">
          <ellipse className="mourn-board-pool" cx="0" cy="0" />
          <ellipse className="mourn-board-ring" cx="0" cy="0" />
          <ellipse className="mourn-board-ring b" cx="0" cy="0" />
        </svg>
      ) : null}
    </div>
  );
};

/**
 * Water on a figure on the real board, drawn against the figure itself: its
 * measured box (`W` wide, `H` tall, origin at its feet) sizes every stroke, so
 * a hound and the Collector both carry it at their own size, and a copy of
 * its own drawing, taken once, is laid over it as a dark wet coat with a pale
 * wet edge, so the water is on the silhouette and not beside it.
 *
 * "drowned", the one the mere closed over: the coat heavy, water pouring off
 * both its sides and running down it in streams, weed stuck to it, big drops,
 * a black pool wider than it with rings going out. "soaked", every other
 * enemy: the coat lighter, a couple of runs, drips, a pool at its feet.
 */
interface WaterMark {
  node: HTMLElement;
  W: number;
  H: number;
  drowned: boolean;
  /** Where the drawing is actually painted, px from the feet: left, right, top (negative). */
  x0: number;
  x1: number;
  top: number;
}

/** A copy of a board figure's drawing, without ids (they would shadow the original's gradients) or filters. */
function copyDrawing(unit: string, cls: string) {
  const svg = document.querySelector<SVGSVGElement>(`.stage [data-unit="${CSS.escape(unit)}"] .combatant-rig svg`);
  if (!svg) return null;
  const copy = svg.cloneNode(true) as SVGSVGElement;
  for (const n of [copy, ...copy.querySelectorAll<SVGElement>("*")]) {
    n.removeAttribute("id");
    n.removeAttribute("filter");
    n.removeAttribute("class");
    n.style?.removeProperty("filter");
    n.style?.removeProperty("animation");
  }
  copy.querySelectorAll("defs, text").forEach((n) => n.remove());
  const wrap = document.createElement("div");
  wrap.className = cls;
  wrap.appendChild(copy);
  return wrap;
}

function buildWater(host: HTMLElement, unit: string, drowned: boolean, seed: number) {
  const rand = seeded(seed);
  const streams = drowned ? 5 : 3;
  const drops = drowned ? 12 : 6;
  let inner = `<ellipse class="mw-pool"/>`;
  for (let i = 0; i < (drowned ? 3 : 2); i++) inner += `<ellipse class="mw-ring" data-i="${i}"/>`;
  let over = "";
  if (drowned) for (let i = 0; i < 2; i++) over += `<g class="mw-pour" data-side="${i ? 1 : -1}"><path class="mw-body"/><path class="mw-edge"/><path class="mw-glint"/></g>`;
  for (let i = 0; i < streams; i++) {
    // Runs, not bars: short, at uneven places and heights, each ending in a bead.
    const x = (i / (streams - 1) - 0.5) * 0.62 + (rand() - 0.5) * 0.14;
    const top = 0.22 + rand() * 0.3;
    const len = (drowned ? 0.28 : 0.2) + rand() * 0.16;
    over += `<g class="mw-stream" data-x="${x.toFixed(3)}" data-top="${top.toFixed(3)}" data-len="${len.toFixed(3)}" data-i="${i}"><path class="mw-body"/><path class="mw-edge"/><path class="mw-glint"/></g>`;
  }
  for (let i = 0; i < drops; i++)
    over += `<path class="mw-drop" d="${DROP(10)}" data-x="${((rand() - 0.5) * (drowned ? 1.05 : 0.8)).toFixed(3)}" data-y="${(0.2 + rand() * 0.4).toFixed(3)}" data-o="${rand().toFixed(3)}"/>`;
  if (drowned)
    for (let i = 0; i < 9; i++)
      over += `<ellipse class="mw-weed" data-x="${((rand() - 0.5) * 0.6).toFixed(3)}" data-y="${(0.3 + rand() * 0.5).toFixed(3)}"/>`;
  const mark = document.createElement("div");
  mark.className = "mourn-water";
  mark.dataset.kind = drowned ? "drowned" : "soaked";
  mark.dataset.unit = unit;
  mark.innerHTML = `<svg class="mw-under" width="1" height="1" viewBox="0 0 1 1" overflow="visible">${inner}</svg>`;
  const coat = copyDrawing(unit, "mw-coat");
  const edge = copyDrawing(unit, "mw-wet-edge");
  if (coat) mark.appendChild(coat);
  if (edge) mark.appendChild(edge);
  const top = document.createElementNS(SVG, "svg");
  top.setAttribute("class", "mw-over");
  top.setAttribute("width", "1");
  top.setAttribute("height", "1");
  top.setAttribute("viewBox", "0 0 1 1");
  top.setAttribute("overflow", "visible");
  top.innerHTML = over;
  mark.appendChild(top);
  host.appendChild(mark);
  return mark;
}

/** A thread of water from (x, y0) down to (x + drift, y1), `w` wide: it wavers and pinches as it falls. */
function thread(x: number, y0: number, y1: number, w: number, drift: number, phase: number) {
  const left: string[] = [];
  const right: string[] = [];
  for (let n = 0; n <= 8; n++) {
    const t = n / 8;
    const hw = (w / 2) * (0.45 + 0.55 * t) * (0.7 + 0.3 * Math.abs(Math.sin(t * 7 + phase)));
    const cx = x + drift * t * t + Math.sin(t * 5 + phase) * w * 0.2;
    const y = y0 + (y1 - y0) * t;
    left.push(`${f1(cx - hw)} ${f1(y)}`);
    right.unshift(`${f1(cx + hw)} ${f1(y)}`);
  }
  return `M${left.join(" L")} L${right.join(" L")} Z`;
}

/** A glint running down a length of water: one short bright dash, travelling. */
function glint(el: Element | null, H: number, age: number, speed: number, phase: number) {
  setAttr(el, "stroke-dasharray", `${f1(H * 0.09)} ${f1(H * 1.2)}`);
  setAttr(el, "stroke-dashoffset", f1(-(((age / 1000) * speed + phase) % 1) * H * 1.29));
}

function drawWater(m: WaterMark, k: number, age: number) {
  const { node, W, H, drowned } = m;
  // Positions follow the painted drawing; sizes follow the figure's height.
  const AW = m.x1 - m.x0;
  const AC = (m.x0 + m.x1) / 2;
  const AH = -m.top;
  node.style.opacity = f2(k);
  const all = (sel: string) => node.querySelectorAll<SVGElement>(sel);
  const rx = drowned ? Math.max(AW * 0.95, H * 0.7) : Math.max(AW * 0.62, H * 0.42);
  const ry = rx * 0.12;
  const line = Math.max(1.5, H * (drowned ? 0.014 : 0.01));
  const pool = node.querySelector(".mw-pool");
  setAttr(pool, "cx", f1(AC));
  node.querySelectorAll(".mw-ring").forEach((r) => setAttr(r, "cx", f1(AC)));
  setAttr(pool, "rx", f1(rx * (0.6 + 0.4 * k)));
  setAttr(pool, "ry", f1(ry * (0.6 + 0.4 * k)));
  setAttr(pool, "stroke-width", f1(line));
  all(".mw-ring").forEach((r) => {
    const i = Number(r.dataset.i);
    const n = drowned ? 3 : 2;
    const cyc = ((age / (drowned ? 900 : 1200) + i / n) % 1 + 1) % 1;
    setAttr(r, "rx", f1(rx * (1 + cyc * 0.55)));
    setAttr(r, "ry", f1(ry * (1 + cyc * 0.55)));
    setAttr(r, "stroke-width", f1(line * (1.1 - cyc * 0.6)));
    setAttr(r, "opacity", f2(0.8 * (1 - cyc)));
  });
  for (const cls of [".mw-coat", ".mw-wet-edge"]) {
    const c = node.querySelector<HTMLElement>(cls);
    if (!c) continue;
    const size = `translate3d(${f1(-W / 2)}px, ${f1(-H)}px, 0)`;
    if (c.style.transform !== size) {
      c.style.transform = size;
      c.style.width = `${f1(W)}px`;
      c.style.height = `${f1(H)}px`;
    }
  }
  all(".mw-stream").forEach((g) => {
    const i = Number(g.dataset.i);
    const x = AC + Number(g.dataset.x) * AW;
    const y0 = m.top + Number(g.dataset.top) * AH;
    // The run lengthens and shortens a little as water feeds it.
    const y1 = Math.min(-H * 0.02, y0 + Number(g.dataset.len) * AH * (0.92 + 0.08 * Math.sin(age / 300 + i)));
    const w = H * (drowned ? 0.045 : 0.03);
    const drift = w * (i % 2 ? 0.4 : -0.4);
    setAttr(g.querySelector(".mw-body"), "d", `${thread(x, y0, y1, w, drift, i * 1.7 + age / 500)} M${f1(x + drift - w * 0.55)} ${f1(y1)} a${f1(w * 0.55)} ${f1(w * 0.62)} 0 1 0 ${f1(w * 1.1)} 0 a${f1(w * 0.55)} ${f1(w * 0.62)} 0 1 0 ${f1(-w * 1.1)} 0 Z`);
    const edge = `M${f1(x + w * 0.12)} ${f1(y0 + w * 0.6)} Q${f1(x + w * 0.2)} ${f1((y0 + y1) / 2)} ${f1(x + drift + w * 0.15)} ${f1(y1 - w * 0.2)}`;
    setAttr(g.querySelector(".mw-edge"), "d", edge);
    setAttr(g.querySelector(".mw-edge"), "stroke-width", f1(Math.max(0.8, w * 0.16)));
    const gl = g.querySelector(".mw-glint");
    setAttr(gl, "d", edge);
    setAttr(gl, "stroke-width", f1(Math.max(1.2, w * 0.3)));
    glint(gl, H, age, drowned ? 1.6 : 1.1, i * 0.37);
  });
  all(".mw-pour").forEach((g) => {
    const side = Number(g.dataset.side);
    // Sheeting off the drawing's own edge and falling straight down beside it.
    const edgeX = side > 0 ? m.x1 : m.x0;
    const x0 = edgeX - side * AW * 0.14;
    const y0 = m.top + AH * 0.3;
    const x1 = edgeX + side * H * 0.05;
    const w = H * 0.07;
    const wob = Math.sin(age / 180 + side) * w * 0.12;
    const mid = y0 + (0 - y0) * 0.25;
    const d = `M${f1(x0 - w * 0.5 * side)} ${f1(y0)} C${f1(x1 + wob)} ${f1(y0)} ${f1(x1 + wob)} ${f1(mid)} ${f1(x1 + wob)} ${f1(-H * 0.01)} L${f1(x1 - side * w * 0.6 + wob)} ${f1(-H * 0.01)} C${f1(x1 - side * w * 0.6)} ${f1(mid + H * 0.04)} ${f1(x1 - side * w * 0.8)} ${f1(y0 + w)} ${f1(x0 - w * 0.5 * side)} ${f1(y0 + w * 0.7)} Z`;
    setAttr(g.querySelector(".mw-body"), "d", d);
    const edge = `M${f1(x0)} ${f1(y0 + w * 0.2)} C${f1(x1 - side * w * 0.1 + wob)} ${f1(y0 + w * 0.1)} ${f1(x1 - side * w * 0.15 + wob)} ${f1(mid)} ${f1(x1 - side * w * 0.15 + wob)} ${f1(-H * 0.03)}`;
    setAttr(g.querySelector(".mw-edge"), "d", edge);
    setAttr(g.querySelector(".mw-edge"), "stroke-width", f1(Math.max(1, w * 0.12)));
    const gl = g.querySelector(".mw-glint");
    setAttr(gl, "d", edge);
    setAttr(gl, "stroke-width", f1(Math.max(1.4, w * 0.26)));
    glint(gl, H, age, 1.8, side > 0 ? 0.5 : 0);
  });
  all(".mw-drop").forEach((path, i) => {
    const x = AC + Number(path.dataset.x) * AW;
    const y0 = -Number(path.dataset.y) * AH;
    const cyc = ((age / (drowned ? 520 : 720) + Number(path.dataset.o) + i * 0.13) % 1 + 1) % 1;
    const y = y0 + cyc * cyc * -y0;
    const size = (H * (drowned ? 0.026 : 0.024)) / 10;
    setAttr(path, "transform", `translate(${f1(x)} ${f1(y)}) scale(${f2(size)} ${f2(size * (1 + cyc * 0.5))})`);
    setAttr(path, "stroke-width", f1(1 / size));
    setAttr(path, "opacity", f2(1 - cyc * 0.4));
  });
  all(".mw-weed").forEach((e) => {
    setAttr(e, "cx", f1(AC + Number(e.dataset.x) * AW));
    setAttr(e, "cy", f1(-Number(e.dataset.y) * AH));
    setAttr(e, "rx", f1(H * 0.024));
    setAttr(e, "ry", f1(H * 0.013));
  });
}

const MARKS = new WeakMap<HTMLElement, WaterMark[]>();

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
  const drowned = mode === "drowned";
  // "drowned" rides its own anchor, the target; "soaked" finds every other living enemy.
  if (!box.dataset.built) {
    box.dataset.built = "1";
    const marks: WaterMark[] = [];
    if (drowned) {
      marks.push({ node: buildWater(box, el.dataset.anchor ?? "", true, 31), W: 0, H: 0, drowned: true, x0: 0, x1: 0, top: 0 });
    } else {
      const taken = [...root.querySelectorAll<HTMLElement>(".cine-anchored[data-anchor]")]
        .filter((w) => w.querySelector('.mourn-board[data-mode="drowned"]'))
        .map((w) => w.dataset.anchor);
      [...document.querySelectorAll<HTMLElement>('.stage .combatant[data-side="enemy"]')]
        .filter((u) => !u.hasAttribute("data-down") && !taken.includes(u.dataset.unit))
        .forEach((u, i) => marks.push({ node: buildWater(box, u.dataset.unit ?? "", false, 50 + i * 7), W: 0, H: 0, drowned: false, x0: 0, x1: 0, top: 0 }));
    }
    MARKS.set(el, marks);
  }
  const marks = MARKS.get(el) ?? [];
  // The board does not move under a film: measure now and then, not every frame.
  const measure = Number(box.dataset.measured ?? -1e9);
  if (age - measure > 200 || age < measure) {
    box.dataset.measured = String(age);
    const origin = root.getBoundingClientRect();
    const left = parseFloat(el.style.left) || 0;
    const top = parseFloat(el.style.top) || 0;
    for (const m of marks) {
      const r = document
        .querySelector<HTMLElement>(`.stage [data-unit="${CSS.escape(m.node.dataset.unit ?? "")}"] .combatant-rig`)
        ?.getBoundingClientRect();
      if (!r) continue;
      m.W = r.width;
      m.H = r.height;
      // The painted drawing, which rarely fills its box (a hound is low and long).
      const svg = document.querySelector<SVGSVGElement>(`.stage [data-unit="${CSS.escape(m.node.dataset.unit ?? "")}"] .combatant-rig svg`);
      let ax0 = Infinity;
      let ax1 = -Infinity;
      let at = Infinity;
      for (const child of svg ? [...svg.children] : []) {
        if (child.tagName === "defs") continue;
        const b = child.getBoundingClientRect();
        if (!b.width || !b.height) continue;
        ax0 = Math.min(ax0, b.left);
        ax1 = Math.max(ax1, b.right);
        at = Math.min(at, b.top);
      }
      const cx = r.left + r.width / 2;
      m.x0 = Number.isFinite(ax0) ? Math.max(-r.width * 0.7, ax0 - cx) : -r.width * 0.4;
      m.x1 = Number.isFinite(ax1) ? Math.min(r.width * 0.7, ax1 - cx) : r.width * 0.4;
      m.top = Number.isFinite(at) ? Math.max(-r.height * 1.1, Math.min(-r.height * 0.3, at - r.bottom)) : -r.height * 0.8;
      m.node.style.transform = `translate3d(${f1(r.left + r.width / 2 - origin.left - left)}px, ${f1(r.bottom - origin.top - top)}px, 0)`;
    }
  }
  const stagger = num(d, "stagger", 0.1);
  marks.forEach((m, i) => {
    if (!m.H) return;
    const k = drowned ? ease("out", span(p, 0, 0.18)) : ease("out", span(p, 0.06 + i * stagger, 0.34 + i * stagger));
    drawWater(m, k, age);
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

