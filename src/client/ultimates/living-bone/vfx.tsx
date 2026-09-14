import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ease } from "../../cinematic/timeline";
import { ANTLER_SHED } from "../../components/heroes/Warden";
import { antlerPath, BONE, JUNIPER } from "./background";
import "./style.css";

/**
 * Living Bone's effects.
 *
 * The idea they serve: the Warden's antlers are the one bone that grows
 * back, so the Lifebinder breaks a tine off its own crown and grafts it to
 * the one it will not lose.
 *
 *   bone-crown    the Warden's own copy: the hand closing on the tine (`--wdn-grasp`), the tine
 *                 leaving the crown (`--wdn-tine`) and appearing in the fist, the bead at the
 *                 break (`--wdn-bead`), splinters at the snap
 *   bone-ground   the shedding ground in front of the figures' feet: bracken and a shed crown
 *   bone-thread   the graft: the bound ally lit and (if it was down) coming up, the light from the
 *                 hand into the figure, the bud taking on its chest, the numbers
 *   bone-board    on the real battlefield: at the call, who is lying down; after, the grafted tine
 *                 budding on the real bound ally, and the bead on the real Warden's crown
 *
 * The bound ally is not in the cast (`splitUltimates` keeps enemy targets
 * only), so the film finds it: a hero lying on the board when the call shot
 * mounts is the one being revived; otherwise the graft shot reveals `ward` as
 * it starts and the heal and Barrier pops that raises are matched to a board
 * unit by the place they share. Everything moves through frame functions or
 * `--p`: no keyframes, no filters.
 */

const VELVET = "#c4573f";

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
  return <i hidden data-lb="" {...data} />;
}

/** A cue's params, copied to its wrapper once, since a frame is handed only the wrapper. */
function params(el: HTMLElement): DOMStringMap {
  if (!el.dataset.lbParams) {
    el.dataset.lbParams = "1";
    const src = el.querySelector<HTMLElement>("[data-lb]");
    if (src) for (const [k, x] of Object.entries(src.dataset)) if (k !== "lb" && x !== undefined) el.dataset[k] = x;
  }
  return el.dataset;
}
const num = (d: DOMStringMap, k: string, fallback: number) => (d[k] === undefined ? fallback : Number(d[k]));

/* ── Reading the film and the board ─────────────────────────────────────── */

const casterNode = (el: HTMLElement) => rootOf(el)?.querySelector<HTMLElement>('.cine-actor[data-role="caster"]');
const allyNodes = (el: HTMLElement) => [...(rootOf(el)?.querySelectorAll<HTMLElement>('.cine-actor[data-role="allies"]') ?? [])];
const boardHeroes = () => [...document.querySelectorAll<HTMLElement>('.stage .combatant[data-side="hero"]')];

/** The hero id a drawing carries (`party-hero ph-<id>`). */
const heroOf = (node: Element | null | undefined) =>
  /\bph-([a-z]+)\b/.exec(node?.querySelector(".party-hero")?.getAttribute("class") ?? "")?.[1] ?? "";

/** The real Warden's unit id, by the name the film announces; the first Warden on the board failing that. */
function casterId(root: HTMLElement): string {
  if (root.dataset.boneCaster) return root.dataset.boneCaster;
  const name = /^(.*) calls /.exec(root.getAttribute("aria-label") ?? "")?.[1];
  const byName = name
    ? boardHeroes().find((u) => u.querySelector(".combatant-name")?.textContent?.trim() === name)
    : undefined;
  const id = (byName ?? boardHeroes().find((u) => u.dataset.rig === "warden"))?.dataset.unit ?? "";
  if (id) root.dataset.boneCaster = id;
  return id;
}

/**
 * Which ally copy a board unit is: the allies are the players in order
 * without the caster, and so are the board's heroes, so the k-th of one is
 * the k-th of the other — checked by drawing, in case the stage ever orders
 * them otherwise.
 */
function allyIndexOf(el: HTMLElement, unit: string): number {
  const root = rootOf(el);
  if (!root) return -1;
  const caster = casterId(root);
  const heroes = boardHeroes().filter((u) => u.dataset.unit !== caster);
  const k = heroes.findIndex((u) => u.dataset.unit === unit);
  if (k < 0) return -1;
  const copies = allyNodes(el);
  const want = heroes[k].dataset.rig;
  if (copies[k] && heroOf(copies[k]) === want) return k;
  const byDrawing = copies.findIndex((c) => heroOf(c) === want);
  return byDrawing >= 0 ? byDrawing : Math.min(k, copies.length - 1);
}

/** The board unit under a heal or Barrier pop the reveal has just raised, and what the pops say. */
function popped(): { unit: string; heal: string; ward: string } | null {
  const pops = [...document.querySelectorAll<HTMLElement>(".vfx-pop.pop-heal, .vfx-pop.pop-block")];
  if (!pops.length) return null;
  const units = [...document.querySelectorAll<HTMLElement>(".stage .combatant")];
  for (const pop of pops) {
    const at = units.find((u) => u.style.left === pop.style.left);
    if (!at?.dataset.unit) continue;
    const mine = pops.filter((q) => q.style.left === pop.style.left);
    return {
      unit: at.dataset.unit,
      heal: mine.find((q) => q.classList.contains("pop-heal"))?.textContent ?? "",
      ward: mine.find((q) => q.classList.contains("pop-block"))?.textContent ?? "",
    };
  }
  return null;
}

/** The bound ally's unit id, once the film knows it. */
function bound(el: HTMLElement): string {
  const root = rootOf(el);
  if (!root) return "";
  if (root.dataset.boneBound) return root.dataset.boneBound;
  let unit = root.dataset.boneDowned ?? "";
  if (!unit) {
    const pop = popped();
    if (pop) {
      unit = pop.unit;
      root.dataset.boneHeal = pop.heal;
      root.dataset.boneWard = pop.ward;
    }
  }
  if (unit) root.dataset.boneBound = unit;
  return unit;
}

/** Screen point → world units, through the stage's own transform. */
function toWorld(root: HTMLElement, x: number, y: number): [number, number] {
  const world = root.querySelector<HTMLElement>(".cine-world");
  if (!world) return [x, y];
  const m = new DOMMatrix(getComputedStyle(world).transform).inverse();
  const r = root.getBoundingClientRect();
  const p = m.transformPoint(new DOMPoint(x - r.left, y - r.top));
  return [p.x, p.y];
}

/* ── Drawing inside the Warden's copy ─────────────────────────────────── */

const INSIDE = new WeakMap<Element, SVGGElement[]>();

/** An anchor that owns nodes drawn inside a figure, and removes them when the effect unmounts. */
function InsideAnchor({ cue, className }: { cue: VfxProps["cue"]; className: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const anchor = ref.current;
    return () => {
      if (!anchor) return;
      for (const g of INSIDE.get(anchor) ?? []) g.remove();
      INSIDE.delete(anchor);
    };
  }, []);
  return (
    <i ref={ref} className={`lb-inside ${className}`}>
      <Params cue={cue} />
    </i>
  );
}

/** Put `markup` inside `part` of the caster's copy once (before `before`, if given), and hand it back every frame. */
function inside(el: HTMLElement, selector: string, cls: string, markup: string, before?: (part: Element) => Element | null): SVGGElement | null {
  const anchor = el.querySelector(".lb-inside");
  if (!anchor) return null;
  const list = INSIDE.get(anchor) ?? [];
  const have = list.find((g) => g.classList.contains(cls));
  if (have?.isConnected) return have;
  const part = casterNode(el)?.querySelector<SVGGElement>(selector);
  if (!part) return null;
  const g = document.createElementNS(SVG, "g");
  g.setAttribute("class", cls);
  g.innerHTML = markup;
  const ref = before?.(part) ?? null;
  if (ref) part.insertBefore(g, ref);
  else part.appendChild(g);
  INSIDE.set(anchor, [...list.filter((x) => x !== have), g]);
  return g;
}

/* ── The crown: the grip, the snap, the tine in the fist ───────────────── */

/** Where the front antler breaks, in the head's drawing units. */
const BREAK = { x: 70.2, y: 14.5 };

/** Splinters of bone off the break, each with a direction and a spin. */
const SPLINTERS = (() => {
  const rand = seeded(17);
  return Array.from({ length: 7 }, (_, i) => ({
    a: -150 + i * 32 + (rand() - 0.5) * 20,
    d: 7 + rand() * 9,
    r: (rand() - 0.5) * 300,
    s: 0.5 + rand() * 0.7,
  }));
})();

const SPLINTER_MARKUP = SPLINTERS.map(
  (s, i) =>
    `<path class="lb-splinter" data-i="${i}" d="M0 -1.4 L1.3 0.3 L0.2 1.5 L-1.2 0.6 Z" transform="translate(${BREAK.x} ${BREAK.y}) scale(${f2(s.s)})"/>`,
).join("");

/** The loose tine, gripped: the shed piece of the antler, turned so its hook stands up out of the fist. */
const TINE_IN_HAND = `
  <g class="lb-held" transform="translate(74.6 57.4) rotate(-58) translate(-78.5 -16.2)">
    <path class="lb-held-ink" d="${ANTLER_SHED}"/>
    <path class="lb-held-bone" d="${ANTLER_SHED}"/>
    <circle class="lb-held-bead" cx="70.6" cy="14.5" r="1.3"/>
  </g>`;

const Crown = ({ cue }: VfxProps): ReactNode => <InsideAnchor cue={cue} className="lb-crown-anchor" />;

const crown: Frame = (el, p) => {
  const d = params(el);
  const node = casterNode(el);
  if (!node) return;
  // The grip: three drawn stages of the hand, stepped by the variable.
  const g0 = num(d, "graspFrom", 1);
  const g1 = num(d, "graspTo", g0);
  const gk = span(p, num(d, "graspA", 0), num(d, "graspB", 1));
  setStyle(node, "--wdn-grasp", f2(g0 + (g1 - g0) * ease(g1 < g0 ? "out" : "in", gk)));
  setStyle(node, "--wdn-palm", "0");
  // The tine: on the crown until `tineAt`, in the fist after (or fixed by `tine`).
  const tineAt = num(d, "tineAt", -1);
  const tine = tineAt >= 0 ? (p >= tineAt ? 1 : 0) : num(d, "tine", 0);
  setStyle(node, "--wdn-tine", String(tine));
  const beadAt = num(d, "beadAt", -1);
  const bead = beadAt >= 0 ? span(p, beadAt, beadAt + 0.12) : num(d, "bead", 0);
  setStyle(node, "--wdn-bead", f2(bead));

  // The tine in the fist, drawn between the open hand and the fingers so the fist closes round it.
  const held = inside(el, '[data-part="hand"]', "lb-hand", TINE_IN_HAND, (part) => {
    const groups = [...part.children].filter((c) => c.tagName === "g");
    return groups.length >= 2 ? groups[groups.length - 2] : null;
  });
  const releaseAt = num(d, "releaseAt", -1);
  const inHand = tine === 1 && (releaseAt < 0 || p < releaseAt) ? 1 : 0;
  setStyle(held, "opacity", String(inHand));
  setStyle(held?.querySelector<SVGElement>(".lb-held-bead"), "opacity", f2(bead));

  // Splinters off the break, for a third of the shot after the snap.
  const chips = inside(el, '[data-part="head"]', "lb-chips", SPLINTER_MARKUP);
  if (chips) {
    const k = tineAt >= 0 ? span(p, tineAt, tineAt + 0.34) : 0;
    const on = tineAt >= 0 && p >= tineAt && k < 1;
    setStyle(chips, "opacity", on ? f2(1 - k * k) : "0");
    if (on)
      chips.querySelectorAll<SVGElement>(".lb-splinter").forEach((c) => {
        const s = SPLINTERS[Number(c.dataset.i)];
        const e = ease("out", k);
        const rad = (s.a * Math.PI) / 180;
        const x = BREAK.x + Math.cos(rad) * s.d * e;
        const y = BREAK.y + Math.sin(rad) * s.d * e + 9 * k * k;
        setAttr(c, "transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(s.r * k)}) scale(${f2(s.s)})`);
      });
  }
};

/* ── The shedding ground in front of the feet ──────────────────────────── */

const GROUND = (() => {
  const rand = seeded(311);
  const fronds = Array.from({ length: 34 }, () => ({
    x: rand() * 1600,
    y: 700 + rand() * 200,
    len: 40 + rand() * 70,
    lean: (rand() - 0.5) * 70,
    w: 3 + rand() * 3,
  }));
  return { fronds };
})();

const Ground = ({ cue }: VfxProps): ReactNode => (
  <svg className="lb-ground" viewBox="0 0 1600 900" style={v({ "--seed": cue.seed ?? 0 })}>
    <g className="lb-ground-fronds">
      {GROUND.fronds.map((f, i) => (
        <path key={i} d={`M${f1(f.x)} ${f1(f.y)} q${f1(f.lean * 0.4)} ${f1(-f.len * 0.55)} ${f1(f.lean)} ${f1(-f.len)}`} strokeWidth={f1(f.w)} />
      ))}
    </g>
    <g className="lb-ground-crown" transform="translate(560 842) rotate(-8)">
      <path className="ink" d={antlerPath(3, 260)} strokeWidth="19" />
      <path className="bone" d={antlerPath(3, 260)} strokeWidth="11" />
    </g>
    <g className="lb-ground-crown" transform="translate(1290 878) rotate(174)">
      <path className="ink" d={antlerPath(2, 210)} strokeWidth="17" />
      <path className="bone" d={antlerPath(2, 210)} strokeWidth="9" />
    </g>
  </svg>
);

/* ── The graft: the thread, the bud, the numbers ────────────────────────── */

const Thread = ({ cue }: VfxProps): ReactNode => (
  <div className="lb-thread">
    <Params cue={cue} />
    <svg className="lb-thread-svg" viewBox="0 0 1600 900">
      <defs>
        <radialGradient id="lb-velvet">
          <stop offset="0" stopColor="#dff5e6" stopOpacity="0.9" />
          <stop offset="0.35" stopColor={JUNIPER} stopOpacity="0.5" />
          <stop offset="1" stopColor={JUNIPER} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path className="lb-thread-glow" pathLength={1} />
      <path className="lb-thread-core" pathLength={1} />
      <g className="lb-thread-motes">
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} r={i % 2 ? 5 : 3.5} data-i={i} />
        ))}
      </g>
      <g className="lb-take">
        <circle className="lb-take-ring" r={1} />
        <circle className="lb-take-velvet" r={90} fill="url(#lb-velvet)" />
        <g className="lb-bud">
          <path className="lb-bud-ink" d={ANTLER_SHED} />
          <path className="lb-bud-bone" d={ANTLER_SHED} />
          <path className="lb-bud-leaf" d="M84 12 q4 -5 8 -6 q-1 5 -6 8 Z" />
        </g>
      </g>
    </svg>
    <div className="lb-chip">
      <b className="lb-chip-word" />
      <span className="lb-chip-nums" />
    </div>
  </div>
);

/** The hand's centre, world units, read off the caster's copy. */
function handAt(el: HTMLElement): [number, number] | null {
  const root = rootOf(el);
  const hand = casterNode(el)?.querySelector<SVGGElement>('[data-part="hand"] [class*="lb-held"], [data-part="hand"]');
  if (!root || !hand) return null;
  const r = hand.getBoundingClientRect();
  return toWorld(root, r.left + r.width * 0.55, r.top + r.height * 0.45);
}

const thread: Frame = (el, p, _age, ctx) => {
  const d = params(el);
  const root = rootOf(el);
  if (!root) return;
  const unit = bound(el);
  const copies = allyNodes(el);
  const index = unit ? allyIndexOf(el, unit) : -1;
  const chosen = index >= 0 ? copies[index] : undefined;
  const press = num(d, "press", 0.5);
  const downed = !!unit && root.dataset.boneDowned === unit;

  // The bound one, lit; the rest ghosted by their cue. If it was down, it is
  // on its knees until the tine takes, then comes up.
  for (const [i, c] of copies.entries()) {
    const isBound = c === chosen;
    if ((c.dataset.boneBound === "") !== isBound) {
      if (isBound) c.dataset.boneBound = "";
      else delete c.dataset.boneBound;
    }
    const look = c.querySelector<HTMLElement>(".cine-look");
    if (!look) continue;
    if (isBound && downed) {
      const up = ease("out", span(p, press, press + 0.3));
      const sink = 1 - up;
      setStyle(look, "transform-origin", "50% 97%");
      setStyle(look, "transform", `translate(0px, ${f1(8 * sink)}px) rotate(${f1(-16 * sink)}deg) scale(${f2(1 - 0.08 * sink)})`);
    } else if (isBound) {
      setStyle(look, "transform-origin", "50% 97%");
      setStyle(look, "transform", `translate(${f1(-4 * ease("out", span(p, press, press + 0.2)))}px, 0px)`);
    } else if (look.style.transform) setStyle(look, "transform", "");
    void i;
  }

  const svg = el.querySelector<SVGSVGElement>(".lb-thread-svg");
  const chip = el.querySelector<HTMLElement>(".lb-chip");
  if (!svg || !chip) return;
  const target = index >= 0 ? ctx.actor(`allies-${index}`) : undefined;
  const hand = handAt(el);
  if (!target || !hand) {
    setStyle(svg, "opacity", "0");
    setStyle(chip, "opacity", "0");
    return;
  }
  setStyle(svg, "opacity", "1");
  const chest: [number, number] = [target.x, target.y - target.h * 0.6];
  const [hx, hy] = hand;
  // The thread: from the hand into the figure, drawn out over the press and held.
  const k = ease("out", span(p, press - 0.04, press + 0.16));
  const mid = [(hx + chest[0]) / 2, Math.min(hy, chest[1]) - 40];
  const path = `M${f1(hx)} ${f1(hy)} Q${f1(mid[0])} ${f1(mid[1])} ${f1(chest[0])} ${f1(chest[1])}`;
  for (const cls of ["lb-thread-glow", "lb-thread-core"]) {
    const line = svg.querySelector<SVGPathElement>(`.${cls}`);
    setAttr(line, "d", path);
    setStyle(line, "stroke-dashoffset", f2(1 - k));
    setStyle(line, "opacity", f2(k * (1 - 0.6 * span(p, 0.86, 1))));
  }
  // Motes ride the thread in after it.
  const core = svg.querySelector<SVGPathElement>(".lb-thread-core");
  const total = core?.getTotalLength() ?? 0;
  svg.querySelectorAll<SVGCircleElement>(".lb-thread-motes circle").forEach((c) => {
    const i = Number(c.dataset.i);
    const t = clamp(span(p, press - 0.02 + i * 0.05, press + 0.26 + i * 0.05));
    const on = total > 0 && t > 0 && t < 1;
    setStyle(c, "opacity", on ? f2(Math.sin(t * Math.PI)) : "0");
    if (on && core) {
      const pt = core.getPointAtLength(total * t);
      setAttr(c, "cx", f1(pt.x));
      setAttr(c, "cy", f1(pt.y));
    }
  });
  // The take: a ring out of the chest, the velvet glow, and the bud growing.
  const take = svg.querySelector<SVGGElement>(".lb-take");
  const tk = span(p, press + 0.04, 1);
  setAttr(take, "transform", `translate(${f1(chest[0])} ${f1(chest[1])})`);
  setStyle(take, "opacity", tk > 0 ? "1" : "0");
  const ring = svg.querySelector<SVGCircleElement>(".lb-take-ring");
  const rk = span(p, press + 0.04, press + 0.3);
  setAttr(ring, "r", f1(6 + ease("out", rk) * target.h * 0.55));
  setStyle(ring, "opacity", f2((1 - rk) * 0.9));
  setStyle(svg.querySelector<SVGElement>(".lb-take-velvet"), "opacity", f2(0.5 + 0.5 * Math.sin(tk * Math.PI * 3)));
  const bud = svg.querySelector<SVGGElement>(".lb-bud");
  const grow = ease("back", span(p, press + 0.05, press + 0.4));
  const size = (target.h / 84) * 1.35 * grow;
  setAttr(bud, "transform", `scale(${f2(size)}) rotate(-70) translate(-70.2 -14.5)`);
  setStyle(svg.querySelector<SVGElement>(".lb-bud-leaf"), "opacity", f2(span(p, press + 0.4, press + 0.5)));

  // The numbers, from the reveal's own pops.
  const word = chip.querySelector<HTMLElement>(".lb-chip-word");
  const nums = chip.querySelector<HTMLElement>(".lb-chip-nums");
  const heal = root.dataset.boneHeal ?? "";
  const ward = root.dataset.boneWard ?? "";
  const text = [heal, ward].filter(Boolean).join(" · ");
  if (word && word.textContent !== (downed ? "Revived" : "Bound")) word.textContent = downed ? "Revived" : "Bound";
  if (nums && nums.textContent !== text) nums.textContent = text;
  setStyle(chip, "left", `${f1(target.x)}px`);
  setStyle(chip, "top", `${f1(target.y - target.h - 26)}px`);
  const ck = ease("out", span(p, press + 0.18, press + 0.34));
  setStyle(chip, "opacity", f2(ck));
  setStyle(chip, "--k", f2(ck));
};

/* ── The real battlefield ───────────────────────────────────────────────── */

/** At the call, before the board's revive has drawn a frame: who is lying down. */
function noteDowned(node: HTMLDivElement | null) {
  const root = node && rootOf(node);
  if (!root) return;
  const caster = casterId(root);
  const down = boardHeroes().find((u) => u.dataset.unit !== caster && (u.hasAttribute("data-down") || /rotate\(-(?:[3-9]\d|1\d\d)/.test(u.querySelector<HTMLElement>(".combatant-rig")?.style.transform ?? "")));
  if (down?.dataset.unit) root.dataset.boneDowned = down.dataset.unit;
}

const Board = ({ cue }: VfxProps): ReactNode => {
  const mode = String(cue.params?.mode ?? "call");
  return (
    <div className="lb-board" data-mode={mode} ref={mode === "call" ? noteDowned : undefined}>
      <Params cue={cue} />
      {mode === "after" && (
        <>
          <svg className="lb-board-graft" viewBox="-60 -60 120 120">
            <defs>
              <radialGradient id="lb-velvet-board">
                <stop offset="0" stopColor="#dff5e6" stopOpacity="0.85" />
                <stop offset="0.4" stopColor={JUNIPER} stopOpacity="0.4" />
                <stop offset="1" stopColor={JUNIPER} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle className="lb-board-velvet" r={44} fill="url(#lb-velvet-board)" />
            <g className="lb-board-bud" transform="scale(1.1) rotate(-70) translate(-70.2 -14.5)">
              <path className="lb-bud-ink" d={ANTLER_SHED} />
              <path className="lb-bud-bone" d={ANTLER_SHED} />
              <path className="lb-bud-leaf" d="M84 12 q4 -5 8 -6 q-1 5 -6 8 Z" />
            </g>
            <g className="lb-board-motes">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <circle key={i} r={i % 2 ? 2.4 : 1.6} data-i={i} />
              ))}
            </g>
          </svg>
          <svg className="lb-board-bead" viewBox="-10 -10 20 20">
            <circle r={3} fill={VELVET} stroke="#171420" strokeWidth={0.8} />
          </svg>
        </>
      )}
    </div>
  );
};

const board: Frame = (el, p) => {
  const d = params(el);
  if (d.mode !== "after") return;
  const root = rootOf(el);
  const unit = bound(el);
  if (!root) return;
  const origin = el.getBoundingClientRect();
  const graft = el.querySelector<SVGSVGElement>(".lb-board-graft");
  const body = unit ? document.querySelector<HTMLElement>(`.stage [data-unit="${CSS.escape(unit)}"] .combatant-body`) : null;
  const r = body?.getBoundingClientRect();
  if (graft && r) {
    const size = r.height * 0.5;
    setStyle(graft, "width", `${f1(size)}px`);
    setStyle(graft, "height", `${f1(size)}px`);
    setStyle(graft, "left", `${f1(r.left + r.width * 0.5 - origin.left - size / 2)}px`);
    setStyle(graft, "top", `${f1(r.top + r.height * 0.44 - origin.top - size / 2)}px`);
    const grow = ease("back", span(p, 0.05, 0.4));
    setStyle(graft, "opacity", f2(span(p, 0.02, 0.1)));
    setStyle(graft, "--g", f2(grow));
    setStyle(graft.querySelector<SVGElement>(".lb-board-velvet"), "opacity", f2(0.55 + 0.45 * Math.sin(p * Math.PI * 2.5)));
    graft.querySelectorAll<SVGCircleElement>(".lb-board-motes circle").forEach((c) => {
      const i = Number(c.dataset.i);
      const t = (p * 1.6 + i * 0.17) % 1;
      setAttr(c, "cx", f1(Math.sin(i * 2.1 + t * 4) * 14));
      setAttr(c, "cy", f1(20 - t * 70));
      setStyle(c, "opacity", f2(Math.sin(t * Math.PI) * 0.9 * span(p, 0.1, 0.3)));
    });
  } else setStyle(graft, "opacity", "0");
  // The bead on the real Warden's crown.
  const bead = el.querySelector<SVGSVGElement>(".lb-board-bead");
  const caster = document.querySelector<HTMLElement>(`.stage [data-unit="${CSS.escape(casterId(root))}"] .combatant-body`);
  const cr = caster?.getBoundingClientRect();
  if (bead && cr) {
    const size = cr.height * 0.16;
    setStyle(bead, "width", `${f1(size)}px`);
    setStyle(bead, "height", `${f1(size)}px`);
    setStyle(bead, "left", `${f1(cr.left + cr.width * 0.74 - origin.left - size / 2)}px`);
    setStyle(bead, "top", `${f1(cr.top + cr.height * 0.12 - origin.top - size / 2)}px`);
    setStyle(bead, "opacity", f2(span(p, 0, 0.1)));
  }
};

export const renderers = {
  "bone-crown": Crown,
  "bone-ground": Ground,
  "bone-thread": Thread,
  "bone-board": Board,
};

export const frames: Record<string, Frame> = {
  "bone-crown": crown,
  "bone-thread": thread,
  "bone-board": board,
};
