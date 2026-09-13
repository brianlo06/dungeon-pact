import type { CSSProperties, ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ease } from "../../cinematic/timeline";
import { FLOOR } from "./background";
import "./style.css";

/**
 * Green Reckoning's effects.
 *
 * The idea they serve: the Warden, eyes shut, lays its healing hand on the
 * ground and listens down one web of roots to every heart on the field — and
 * when it opens its eyes the same roots answer all of them at once: sap to the
 * party, rot to everything else.
 *
 *   green-soil    the ground in cross-section, drawn in front of every foot
 *   green-web     the roots: out of the palm, to every foot, and the surge back
 *   green-party   the party on the web: a heart-light each; the downed one lying, then lifted
 *   green-foes    the real enemy line, copied off the board: waiting, then rotting
 *   green-burst   what comes up through the floor: leaves under the party, briars under the rest
 *   green-eyes    opens the Warden's eyes (`--wdn-eyes` on its copy)
 *   green-earth   the earth rising over the lens: the cut into the ground
 *   green-board   on the real battlefield: roots and heartbeats as it listens; leaves and rot after
 *
 * Two things the engine does not hand an effect, and how they are found.
 *
 * The enemies. Poison is a status and leaves no beat, so no enemy is in the
 * film's cast. `green-foes` copies each living enemy's drawing off the board
 * once and lays the line out on the film's floor, sized against the Warden's
 * own board figure, so their sizes stay true to each other and a boss is
 * still a boss. Where they stand is shared with the roots and the bursts.
 *
 * The downed ally. Under a film the board already stands at the result, so a
 * hero the Ultimate revived is getting up the moment the round arrives. The
 * call shot's `green-board` looks once, as it mounts — before that first frame
 * — for a hero lying on the board, and writes who onto the film
 * (`data-green-downed`). The ally copies are matched to the board by drawing.
 */

export const SAP = "#9be38a";
const HOT = "#effbe0";
export const ROT = "#2a1626";
const SPORE = "#c8b25a";

const v = (vars: Record<string, string | number>) => vars as CSSProperties;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const rootOf = (el: Element) => el.closest<HTMLElement>(".ult-cinematic");
type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;
type Pt = { x: number; y: number; h: number };

const setAttr = (el: Element | null | undefined, name: string, value: string) => {
  if (el && el.getAttribute(name) !== value) el.setAttribute(name, value);
};
const setStyle = (el: HTMLElement | SVGElement | null | undefined, name: string, value: string) => {
  if (el && el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
};

/* ── Reading the board ─────────────────────────────────────────────────── */

/** The heroes the stage has placed, in the board's order. */
const boardHeroes = () => [...document.querySelectorAll<HTMLElement>('.stage .combatant[data-side="hero"]')];

/** How far a board figure is rotated: a hero lying down is near −80°. */
function lean(unit: HTMLElement) {
  const t = unit.querySelector<HTMLElement>(".combatant-rig")?.style.transform ?? "";
  const m = /rotate\((-?[\d.]+)deg\)/.exec(t);
  return m ? Number(m[1]) : 0;
}

/**
 * Who was down when the round arrived. Called as the call shot mounts, before
 * the board's own revive has drawn a frame.
 */
function noteDowned(el: HTMLElement | null) {
  if (!el) return;
  const root = rootOf(el);
  if (!root || root.dataset.greenSeen) return;
  root.dataset.greenSeen = "1";
  const caster = el.closest<HTMLElement>("[data-anchor]")?.dataset.anchor ?? "";
  root.dataset.greenCaster = caster;
  root.dataset.greenDowned = boardHeroes()
    .filter((u) => u.dataset.unit !== caster && (u.hasAttribute("data-down") || lean(u) < -25))
    .map((u) => u.dataset.unit)
    .join(",");
}

const downedIds = (root: HTMLElement) => (root.dataset.greenDowned ?? "").split(",").filter(Boolean);

/**
 * The cast's ally copies that were down, by index. A copy is matched to its
 * board unit by drawing, in order, since both follow the party's seats.
 */
function downedAllies(root: HTMLElement): Set<number> {
  const out = new Set<number>();
  const down = downedIds(root);
  if (!down.length) return out;
  const caster = root.dataset.greenCaster;
  const board = boardHeroes().filter((u) => u.dataset.unit !== caster);
  const copies = [...root.querySelectorAll<HTMLElement>('.cine-actor[data-role="allies"]')];
  const used = new Set<number>();
  board.forEach((u) => {
    const i = copies.findIndex((c, n) => !used.has(n) && c.querySelector("svg[data-hero]")?.getAttribute("data-hero") === u.dataset.rig);
    if (i < 0) return;
    used.add(i);
    if (down.includes(u.dataset.unit ?? "")) out.add(i);
  });
  return out;
}

/** The ally copies placed in this shot, in cast order. */
function allies(ctx: VfxContext) {
  const out: (Pt & { i: number })[] = [];
  for (let i = 0; i < 6; i++) {
    const a = ctx.actor(`allies-${i}`);
    if (a) out.push({ ...a, i });
  }
  return out;
}

/* ── The enemy line ────────────────────────────────────────────────────── */

interface Foe {
  id: string;
  node: HTMLElement;
  rot: HTMLElement | null;
  /** Board centre x, relative to the first; board size. */
  w: number;
  h: number;
  back: boolean;
  /** How far the drawing reaches above its box, as a multiple of the box: a boss's crown. */
  over: number;
}
interface FoePlaced {
  x: number;
  y: number;
  w: number;
  h: number;
  order: number;
}
/** Where the copied line stands this frame, for the roots and the bursts. */
const LINE = new WeakMap<HTMLElement, FoePlaced[]>();
const FOES = new WeakMap<HTMLElement, { foes: Foe[]; base: number } | null>();

function copyArt(rig: Element, cls: string) {
  const art = rig.querySelector("svg");
  if (!art) return null;
  const copy = art.cloneNode(true) as SVGElement;
  copy.removeAttribute("class");
  copy.classList.add(cls);
  return copy;
}

function buildFoes(el: HTMLElement, box: HTMLElement, rot: boolean) {
  const root = rootOf(el);
  if (!root) return null;
  const caster = root.dataset.greenCaster || document.querySelector<HTMLElement>('.stage .combatant[data-rig="warden"]')?.dataset.unit;
  const casterBody = document.querySelector<HTMLElement>(`.stage [data-unit="${CSS.escape(caster ?? "")}"] .combatant-body`);
  const base = casterBody?.getBoundingClientRect().height ?? 0;
  if (!base) return null;
  const seen = [...document.querySelectorAll<HTMLElement>('.stage .combatant[data-side="enemy"]')]
    .filter((u) => !u.hasAttribute("data-down"))
    .map((u) => {
      const rig = u.querySelector<HTMLElement>(".combatant-rig");
      const body = u.querySelector<HTMLElement>(".combatant-body") ?? rig;
      return rig && body ? { u, rig, r: body.getBoundingClientRect() } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x && x.r.height > 0)
    // Nearest the party first.
    .sort((a, b) => a.r.left + a.r.width / 2 - (b.r.left + b.r.width / 2));
  const bottoms = seen.map((s) => s.r.bottom);
  const front = Math.max(...bottoms);
  const foes: Foe[] = seen.map((s) => {
    const node = document.createElement("div");
    node.className = "gr-foe";
    const art = copyArt(s.rig, "gr-foe-art");
    if (art) node.appendChild(art);
    let rotNode: HTMLElement | null = null;
    if (rot) {
      rotNode = document.createElement("div");
      rotNode.className = "gr-foe-rot";
      const r = copyArt(s.rig, "gr-foe-art");
      if (r) rotNode.appendChild(r);
      node.appendChild(rotNode);
    }
    box.appendChild(node);
    // A glow behind each figure, so a black line reads against black air.
    const haze = document.createElement("i");
    haze.className = "gr-foe-haze";
    node.prepend(haze);
    let over = 1;
    const svg = s.rig.querySelector<SVGSVGElement>("svg");
    try {
      const vb = svg?.viewBox.baseVal;
      const bb = svg?.getBBox();
      if (vb && bb && vb.height) over = Math.max(1, (vb.y + vb.height - bb.y) / vb.height);
    } catch {
      over = 1;
    }
    return { id: s.u.dataset.unit ?? "", node, rot: rotNode, w: s.r.width, h: s.r.height, back: front - s.r.bottom > s.r.height * 0.12, over };
  });
  return { foes, base };
}

/* ── Renderers ─────────────────────────────────────────────────────────── */

/** A pointed leaf in local space, the Warden's own. */
const leaf = (r: number) => `M0 0 Q${r} ${-r * 0.75} ${2 * r} 0 Q${r} ${r * 0.75} 0 0 Z`;

/** The ground in cross-section: moss crust, loam, stones, and the old dead. */
const Soil = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 41);
  const crust: string[] = [];
  let d = `M-800 ${FLOOR + 4}`;
  for (let x = -800; x <= 2400; x += 22) d += ` L${x} ${(FLOOR - 3 + rand() * 9).toFixed(1)}`;
  d += " L2400 1350 L-800 1350 Z";
  crust.push(d);
  const stones = Array.from({ length: 34 }, () => ({
    x: -780 + rand() * 3160,
    y: FLOOR + 60 + rand() * 820,
    rx: 14 + rand() * 46,
    ry: 8 + rand() * 20,
    a: (rand() - 0.5) * 40,
  }));
  const hairs = Array.from({ length: 60 }, () => {
    const x = -780 + rand() * 3160;
    const y = FLOOR + 10 + rand() * 60;
    return `M${x.toFixed(0)} ${y.toFixed(0)} q${((rand() - 0.5) * 60).toFixed(0)} ${(30 + rand() * 60).toFixed(0)} ${((rand() - 0.5) * 30).toFixed(0)} ${(60 + rand() * 120).toFixed(0)}`;
  });
  const tufts = Array.from({ length: 90 }, () => ({ x: -790 + rand() * 3180, r: 5 + rand() * 9, a: -150 + rand() * 120 }));
  // The dead of old fights: a skull, ribs, a long bone, a broken blade, a helm.
  const dead = [
    { x: 180, y: 640, k: "skull", s: 1.1, a: -14 },
    { x: 470, y: 760, k: "ribs", s: 1.2, a: 12 },
    { x: 1010, y: 610, k: "blade", s: 1.3, a: 8 },
    { x: 1330, y: 720, k: "skull", s: 0.95, a: 22 },
    { x: 1540, y: 600, k: "bone", s: 1.1, a: -30 },
    { x: -140, y: 720, k: "helm", s: 1.1, a: -8 },
    { x: 760, y: 830, k: "bone", s: 1.2, a: 64 },
    { x: 1840, y: 700, k: "ribs", s: 1, a: -20 },
    { x: 2150, y: 610, k: "helm", s: 0.9, a: 16 },
    { x: -520, y: 590, k: "blade", s: 1.1, a: -12 },
  ];
  return (
    <svg className="gr-soil" viewBox={`-800 ${FLOOR - 30} 3200 ${1350 - FLOOR + 30}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="gr-loam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2a17" />
          <stop offset="0.05" stopColor="#23180e" />
          <stop offset="0.3" stopColor="#170f09" />
          <stop offset="1" stopColor="#0a0604" />
        </linearGradient>
      </defs>
      <path d={crust[0]} fill="url(#gr-loam)" />
      {/* Strata. */}
      <path d={`M-800 ${FLOOR + 150} C0 ${FLOOR + 120} 900 ${FLOOR + 190} 2400 ${FLOOR + 140}`} className="gr-stratum" />
      <path d={`M-800 ${FLOOR + 380} C300 ${FLOOR + 420} 1100 ${FLOOR + 340} 2400 ${FLOOR + 400}`} className="gr-stratum" />
      {stones.map((s, i) => (
        <ellipse key={i} className="gr-stone" cx={s.x.toFixed(0)} cy={s.y.toFixed(0)} rx={s.rx.toFixed(0)} ry={s.ry.toFixed(0)} transform={`rotate(${s.a.toFixed(0)} ${s.x.toFixed(0)} ${s.y.toFixed(0)})`} />
      ))}
      <g className="gr-dead">
        {dead.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.a}) scale(${b.s})`}>
            {b.k === "skull" && (
              <>
                <path d="M-26 6 C-30 -22 -12 -34 4 -32 C24 -30 32 -12 26 8 L20 12 L18 22 L-18 22 L-20 12 Z" />
                <circle cx="-9" cy="-4" r="7" className="gr-hole" />
                <circle cx="11" cy="-4" r="7" className="gr-hole" />
                <path d="M-10 22 V14 M-2 22 V14 M6 22 V14 M14 22 V14" className="gr-crack" />
              </>
            )}
            {b.k === "ribs" && <path d="M-60 0 H60 M-44 0 C-50 30 -40 50 -30 56 M-20 0 C-26 34 -18 56 -8 62 M4 0 C0 34 8 56 18 62 M28 0 C26 30 34 50 44 54" className="gr-bone-line" />}
            {b.k === "bone" && <path d="M-60 -4 H60 M-66 -12 A8 8 0 1 0 -60 -4 A8 8 0 1 0 -66 4 M66 -12 A8 8 0 1 1 60 -4 A8 8 0 1 1 66 4" className="gr-bone-line" />}
            {b.k === "blade" && (
              <>
                <path d="M-80 -5 L50 -5 L66 0 L50 5 L-80 5 Z" className="gr-iron" />
                <path d="M-80 -18 V18 M-80 0 H-104" className="gr-iron-line" />
              </>
            )}
            {b.k === "helm" && <path d="M-34 14 C-36 -24 -16 -38 0 -38 C16 -38 36 -24 34 14 Z M-34 0 H34 M-4 0 V14" className="gr-iron-helm" />}
          </g>
        ))}
      </g>
      <g className="gr-hairs">
        {hairs.map((h, i) => (
          <path key={i} d={h} />
        ))}
      </g>
      {/* The moss on the cut edge. */}
      <g className="gr-tufts">
        {tufts.map((t, i) => (
          <path key={i} d={leaf(t.r)} transform={`translate(${t.x.toFixed(0)} ${FLOOR + 2}) rotate(${t.a.toFixed(0)})`} />
        ))}
      </g>
      <path d={`M-800 ${FLOOR + 1} H2400`} className="gr-edge" />
    </svg>
  );
};

const ROOTS = 7;
const TWIGS = 3;

/**
 * The web. Every root is a path of length 1, so growth is a dash offset; the
 * shapes are placed from where the cast actually stands on the first frame.
 */
const Web = ({ cue }: VfxProps) => {
  const mode = String(cue.params?.mode ?? "web");
  const count = mode === "hand" ? 12 : ROOTS;
  return (
    <svg
      className="gr-web"
      viewBox="-800 -450 3200 1800"
      aria-hidden="true"
      data-gr=""
      data-mode={mode}
      data-seed={String(cue.seed ?? 3)}
      data-ox={String(cue.params?.ox ?? 0.07)}
      data-oy={String(cue.params?.oy ?? -0.01)}
      data-depth={String(cue.params?.depth ?? 150)}
    >
      {Array.from({ length: count }, (_, i) => (
        <g key={i} className="gr-root" data-i={i} style={{ display: "none" }}>
          <path className="gr-root-glow" pathLength={1} />
          <path className="gr-root-line" pathLength={1} />
          <path className="gr-root-rot" pathLength={1} />
          {Array.from({ length: TWIGS }, (_, t) => (
            <path key={t} className="gr-twig" pathLength={1} />
          ))}
          <circle className="gr-bead" r="9" />
          <circle className="gr-bead core" r="4" />
        </g>
      ))}
    </svg>
  );
};

const Party = ({ cue }: VfxProps) => <div className="gr-party" data-gr="" data-mode={String(cue.params?.mode ?? "web")} />;

const Foes = ({ cue }: VfxProps) => (
  <div
    className="gr-foes"
    data-gr=""
    data-mode={String(cue.params?.mode ?? "web")}
    data-x0={String(cue.params?.x0 ?? 900)}
    data-x1={String(cue.params?.x1 ?? 1500)}
    data-maxh={String(cue.params?.maxH ?? 320)}
    data-scale={String(cue.params?.scale ?? 1)}
  />
);

/** What comes up through the crust: a pool of bursts, placed each frame. */
const Burst = () => (
  <div className="gr-bursts">
    {Array.from({ length: 4 }, (_, i) => (
      <div key={`a${i}`} className="gr-bloom" style={{ display: "none" }}>
        <svg viewBox="-160 -260 320 300" aria-hidden="true">
          <ellipse className="gr-bloom-pool" cx="0" cy="0" rx="150" ry="26" />
          {[-70, -38, -10, 18, 46, 76].map((x, n) => (
            <g key={n} transform={`translate(${x} 0)`}>
              <g className="gr-shoot" style={v({ "--n": n })}>
                <path d={`M0 0 C${n % 2 ? 10 : -10} -40 ${n % 2 ? -8 : 8} -80 ${n % 2 ? 6 : -6} -${110 + (n % 3) * 34}`} className="gr-stem" />
                <path d={leaf(14)} transform={`translate(0 -${50 + n * 6}) rotate(${n % 2 ? -40 : -140})`} className="gr-leaf" />
                <path d={leaf(11)} transform={`translate(${n % 2 ? 4 : -4} -${86 + n * 5}) rotate(${n % 2 ? -150 : -30})`} className="gr-leaf" />
              </g>
            </g>
          ))}
          <g transform="translate(-10 -150)">
            <g className="gr-flower">
              {[0, 72, 144, 216, 288].map((a) => (
                <path key={a} d={leaf(16)} transform={`rotate(${a})`} className="gr-petal" />
              ))}
              <circle r="7" className="gr-flower-core" />
            </g>
          </g>
        </svg>
        <span className="gr-chip heal">Regen · Cleansed</span>
      </div>
    ))}
    {Array.from({ length: 6 }, (_, i) => (
      <div key={`f${i}`} className="gr-briar" style={{ display: "none" }}>
        <svg viewBox="-160 -260 320 300" aria-hidden="true">
          <ellipse className="gr-briar-pool" cx="0" cy="0" rx="150" ry="24" />
          {[-84, -46, -12, 24, 60, 92].map((x, n) => (
            <g key={n} transform={`translate(${x} 0) rotate(${(n - 2.5) * 9})`}>
              <g className="gr-thorn" style={v({ "--n": n })}>
                <path d={`M-9 0 C-6 -50 ${n % 2 ? 14 : -14} -90 0 -${120 + (n % 3) * 40} C${n % 2 ? 4 : -4} -80 8 -40 9 0 Z`} className="gr-spine" />
                <path d={`M0 -46 l${n % 2 ? 20 : -20} -12 M0 -84 l${n % 2 ? -18 : 18} -10`} className="gr-barb" />
              </g>
            </g>
          ))}
          {[-110, -60, 40, 100].map((x, n) => (
            <g key={`c${n}`} transform={`translate(${x} 0)`}>
              <g className="gr-cap" style={v({ "--n": n })}>
                <path d="M-4 0 V-26 M-22 -24 C-20 -46 20 -46 22 -24 Z" className="gr-cap-art" />
              </g>
            </g>
          ))}
        </svg>
        <span className="gr-chip rot">Poison 4</span>
      </div>
    ))}
  </div>
);

const Eyes = ({ cue }: VfxProps) => <i className="gr-eyes" data-gr="" data-from={String(cue.params?.from ?? 0)} data-to={String(cue.params?.to ?? 1)} data-a={String(cue.params?.a ?? 0)} data-b={String(cue.params?.b ?? 1)} />;

const Earth = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 9);
  let edge = "M0 40";
  for (let x = 0; x <= 100; x += 4) edge += ` L${x} ${(10 + rand() * 30).toFixed(1)}`;
  edge += " L100 400 L0 400 Z";
  return (
    <div className="gr-earth" data-dir={String(cue.params?.dir ?? "in")}>
      <svg viewBox="0 0 100 400" preserveAspectRatio="none" aria-hidden="true">
        <path d={edge} className="gr-earth-body" />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${(5 + i * 11 + rand() * 5).toFixed(1)} ${(30 + rand() * 20).toFixed(1)} q${((rand() - 0.5) * 8).toFixed(1)} 40 ${((rand() - 0.5) * 6).toFixed(1)} ${(80 + rand() * 120).toFixed(1)}`} className="gr-earth-root" />
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <ellipse key={`s${i}`} cx={(rand() * 100).toFixed(1)} cy={(70 + rand() * 320).toFixed(1)} rx={(1.5 + rand() * 4).toFixed(1)} ry={(4 + rand() * 10).toFixed(1)} className="gr-earth-stone" />
        ))}
      </svg>
    </div>
  );
};

const Board = ({ cue }: VfxProps) => {
  const mode = String(cue.params?.mode ?? "listen");
  return <div className="gr-board" data-mode={mode} ref={mode === "listen" ? noteDowned : undefined} />;
};

/* ── Frames ────────────────────────────────────────────────────────────── */

/** A point on a cubic. */
function bez(p0: number[], p1: number[], p2: number[], p3: number[], t: number) {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

interface Root {
  kind: "ally" | "foe" | "hand";
  pts: number[][];
  /** When it starts growing and how long it takes, as progress. */
  at: number;
  len: number;
  /** For a heart: how faint, and how late its beat comes. */
  faint?: boolean;
}

/** When the web reaches its `n`th of `count` ends, as progress through the shot. */
const arrive = (n: number, count: number) => 0.12 + (0.46 * n) / Math.max(1, count - 1) + 0.16;

function rootShapes(el: HTMLElement, ctx: VfxContext): Root[] {
  const mode = el.dataset.mode ?? "web";
  const root = rootOf(el);
  const caster = ctx.actor("caster");
  const rand = seeded(Number(el.dataset.seed ?? 3));
  const ox = Number(el.dataset.ox ?? 0.07);
  const oy = Number(el.dataset.oy ?? -0.01);
  if (!caster) return [];
  // The palm, on the ground.
  const O = [caster.x + ox * (caster.h / 0.84), Math.max(FLOOR + 6, caster.y + oy * (caster.h / 0.84))];
  if (mode === "hand") {
    return Array.from({ length: 12 }, (_, i) => {
      const a = ((i / 11) * 150 + 15 + (rand() - 0.5) * 12) * (Math.PI / 180);
      const r = 110 + rand() * 190;
      const end = [O[0] + Math.cos(a) * r * 1.2, O[1] + Math.sin(a) * r];
      const p1 = [O[0] + (rand() - 0.5) * 30, O[1] + 40 + rand() * 40];
      const p2 = [end[0] + (rand() - 0.5) * 80, end[1] - 40 - rand() * 60];
      return { kind: "hand" as const, pts: [O, p1, p2, end], at: rand() * 0.25, len: 0.5 + rand() * 0.25 };
    });
  }
  const ends: { x: number; kind: "ally" | "foe"; faint?: boolean }[] = [];
  const down = root ? downedAllies(root) : new Set<number>();
  for (const a of allies(ctx)) ends.push({ x: a.x, kind: "ally", faint: down.has(a.i) });
  for (const f of root ? (LINE.get(root) ?? []) : []) ends.push({ x: f.x, kind: "foe" });
  // Reached nearest first.
  const order = [...ends].sort((a, b) => Math.abs(a.x - O[0]) - Math.abs(b.x - O[0]));
  return order.slice(0, ROOTS).map((e, n) => {
    const T = [e.x, FLOOR + 6];
    const dist = Math.abs(T[0] - O[0]);
    const depth = Math.min(Number(el.dataset.depth ?? 150), 34 + dist * 0.12 + rand() * 26);
    const dir = Math.sign(T[0] - O[0]) || 1;
    const p1 = [O[0] + dir * (30 + rand() * 40), O[1] + depth * 1.15];
    const p2 = [T[0] - dir * (50 + rand() * 60), T[1] + depth * 0.95];
    const start = arrive(n, order.length) - 0.3;
    return { kind: e.kind, pts: [O, p1, p2, T], at: Math.max(0, start), len: 0.3, faint: e.faint };
  });
}

const d3 = (pts: number[][]) =>
  `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} C${pts[1][0].toFixed(1)} ${pts[1][1].toFixed(1)} ${pts[2][0].toFixed(1)} ${pts[2][1].toFixed(1)} ${pts[3][0].toFixed(1)} ${pts[3][1].toFixed(1)}`;

/** The beat, as a pulse 0…1, `period` ms apart, late by `late`. */
function beat(age: number, period: number, late = 0) {
  const t = ((age - late) % period + period) % period;
  const lub = Math.exp(-(((t - 0) / 55) ** 2));
  const dub = 0.7 * Math.exp(-(((t - 190) / 60) ** 2));
  return Math.max(lub, dub);
}

const BUILT = new WeakMap<HTMLElement, Root[]>();

const web: Frame = (el, p, age, ctx) => {
  const svg = el.querySelector<SVGSVGElement>(".gr-web");
  if (!svg) return;
  const mode = el.dataset.mode ?? "web";
  let roots = BUILT.get(el);
  // Built once the line has been laid out (its first frame), then held.
  if (!roots || (mode === "web" && roots.length === 0) || (!roots.some((r) => r.kind === "foe") && age < 120)) {
    roots = rootShapes(el, ctx);
    BUILT.set(el, roots);
  }
  const groups = svg.querySelectorAll<SVGGElement>(".gr-root");
  groups.forEach((g, i) => {
    const r = roots![i];
    if (!r) {
      if (g.style.display !== "none") g.style.display = "none";
      return;
    }
    if (g.style.display) g.style.display = "";
    const d = d3(r.pts);
    const paths = g.querySelectorAll<SVGPathElement>("path");
    setAttr(paths[0], "d", d);
    setAttr(paths[1], "d", d);
    setAttr(paths[2], "d", d);
    g.dataset.kind = r.kind;
    g.toggleAttribute("data-faint", !!r.faint);
    // Growth: the whole web in the web and hand shots; already grown for the surge.
    const k = mode === "surge" ? 1 : clamp((p - r.at) / r.len);
    const grown = ease("out", k);
    setStyle(paths[0], "stroke-dashoffset", (1 - grown).toFixed(3));
    setStyle(paths[1], "stroke-dashoffset", (1 - grown).toFixed(3));
    // Rot takes the last part of a root that reaches an enemy.
    if (r.kind === "foe") setStyle(paths[2], "stroke-dasharray", `0 0.55 ${Math.max(0, grown - 0.55).toFixed(3)} 2`);
    else setStyle(paths[2], "stroke-dasharray", "0 2");
    // Twigs off the main root, each as the root passes it.
    for (let t = 0; t < TWIGS; t++) {
      const tw = paths[3 + t];
      const at = 0.3 + t * 0.22;
      const [x, y] = bez(r.pts[0], r.pts[1], r.pts[2], r.pts[3], at);
      const s = (i * 7 + t * 3) % 5;
      setAttr(tw, "d", `M${x.toFixed(1)} ${y.toFixed(1)} q${(s % 2 ? 24 : -24) + s * 4} ${18 + s * 6} ${(s % 2 ? 10 : -10) + s * 3} ${46 + s * 10}`);
      setStyle(tw, "stroke-dashoffset", (1 - clamp((grown - at) / 0.3)).toFixed(3));
    }
    const beads = g.querySelectorAll<SVGCircleElement>(".gr-bead");
    let bt = -1;
    let glow = 0;
    if (mode === "web" && r.kind === "ally" && k >= 1) {
      // The heartbeat travels up the root to the palm, once a beat.
      const period = r.faint ? 820 : 520;
      const span = p > 0.001 ? age / p : 1000;
      const since = age - (r.at + r.len) * span;
      const t = ((since + (r.faint ? 260 : 0)) % period) / period;
      bt = since > 0 ? 1 - t : -1;
      glow = r.faint ? 0.35 : 1;
    } else if (mode === "surge") {
      // Everything flows out of the palm at once.
      bt = clamp((p - 0.03) / 0.3);
      glow = bt < 1 ? 1 : 0;
    } else if (mode === "hand") {
      bt = grown;
      glow = k > 0 && k < 1 ? 0.8 : 0;
    }
    beads.forEach((b) => {
      if (bt < 0 || !glow) {
        setAttr(b, "opacity", "0");
        return;
      }
      const [x, y] = bez(r.pts[0], r.pts[1], r.pts[2], r.pts[3], bt);
      setAttr(b, "cx", x.toFixed(1));
      setAttr(b, "cy", y.toFixed(1));
      setAttr(b, "opacity", glow.toFixed(2));
    });
  });
  svg.style.setProperty("--surge", mode === "surge" ? (1 - clamp((p - 0.3) / 0.7) * 0.6).toFixed(3) : "0");
};

/** Where the stage put the downed copy, and how it is lying or getting up. */
const party: Frame = (el, p, age, ctx) => {
  const box = el.querySelector<HTMLElement>(".gr-party");
  const root = rootOf(el);
  if (!box || !root) return;
  const mode = el.dataset.mode ?? "web";
  const down = downedAllies(root);
  const copies = [...root.querySelectorAll<HTMLElement>('.cine-actor[data-role="allies"]')];
  copies.forEach((node, i) => {
    const look = node.querySelector<HTMLElement>(".cine-look");
    if (!look) return;
    let k = 1;
    if (!down.has(i)) k = 0;
    else if (mode === "rise") k = 1 - ease("inOut", clamp((p - 0.07) / 0.5));
    // Everyone is lifted by the burst: up onto the toes, then settling taller.
    // (Written here rather than as a root clip: a copy's root is not animated.)
    let lift = 0;
    if (mode === "rise") {
      const u = clamp((p - 0.035) / 0.5);
      lift = u <= 0 ? 0 : Math.sin(Math.min(1, u / 0.25) * (Math.PI / 2)) * (1 - ease("inOut", clamp((u - 0.25) / 0.75)) * 0.6);
    }
    const t =
      k <= 0.001 && lift <= 0.001
        ? ""
        : `translate(${(10 * k).toFixed(2)}%, ${(-10 * k - 7 * lift).toFixed(2)}%) rotate(${(-80 * k - 2 * lift).toFixed(2)}deg) scale(${(1 - 0.05 * lift).toFixed(3)}, ${(1 + 0.07 * lift).toFixed(3)})`;
    if (look.style.transform !== t) look.style.transform = t;
  });
  // A heart-light in every chest on the web, beating; the downed one's barely.
  const list = allies(ctx);
  while (box.children.length < list.length) {
    const h = document.createElement("i");
    h.className = "gr-heart";
    box.appendChild(h);
  }
  [...box.children].forEach((h, n) => {
    const a = list[n];
    const node = h as HTMLElement;
    if (!a || mode !== "web") {
      setStyle(node, "opacity", "0");
      return;
    }
    const faint = down.has(a.i);
    const size = a.h / 0.84;
    const lying = faint;
    const x = lying ? a.x - size * 0.35 : a.x + size * 0.03;
    const y = lying ? a.y - size * 0.12 : a.y - a.h * 0.58;
    const pulse = faint ? 0.25 * beat(age, 900, 300) : beat(age, 620, n * 90);
    node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${((size / 220) * (0.7 + pulse * 0.6)).toFixed(3)})`;
    setStyle(node, "opacity", (faint ? 0.25 + pulse : 0.45 + pulse * 0.55).toFixed(2));
  });
};

const foes: Frame = (el, p, age, ctx) => {
  const box = el.querySelector<HTMLElement>(".gr-foes");
  const root = rootOf(el);
  if (!box || !root) return;
  const mode = el.dataset.mode ?? "web";
  let state = FOES.get(el);
  if (state === undefined) {
    state = buildFoes(el, box, mode === "rot");
    FOES.set(el, state);
  }
  if (!state || !state.foes.length) {
    LINE.set(root, []);
    return;
  }
  // Every board pixel, in world units, measured against the Warden's figure.
  const casterBox = Number(el.dataset.casterBox ?? 0);
  const k0 = (casterBox || 240) / state.base;
  // Clear of the party, however many stand on the web.
  const standing = allies(ctx);
  const x0 = Math.max(Number(el.dataset.x0 ?? 900), ...standing.map((a) => a.x + a.h * 0.75));
  const span = Math.max(200, Number(el.dataset.x1 ?? 1500) - x0);
  const maxH = Number(el.dataset.maxh ?? 320);
  const scale = Number(el.dataset.scale ?? 1);
  const widths = state.foes.map((f) => f.w * k0 * 0.62);
  const total = widths.reduce((a, b) => a + b, 0) + 30 * (state.foes.length - 1);
  const tallest = Math.max(...state.foes.map((f) => f.h * k0 * 0.97 * f.over));
  const squeeze = Math.min(1, span / total, maxH / tallest) * scale;
  let x = x0;
  const placed: FoePlaced[] = [];
  state.foes.forEach((f, i) => {
    const w = f.w * k0 * squeeze;
    const h = f.h * k0 * squeeze;
    const cx = x + (widths[i] * squeeze) / 2;
    x += widths[i] * squeeze + 30 * squeeze;
    const y = FLOOR + (f.back ? -10 : 4);
    let dx = 0;
    let tilt = 0;
    let sq = 1;
    if (mode === "web") {
      // A flinch as the root arrives under it.
      const since = p - (arrive(i + 1, state!.foes.length + 3) + 0.02);
      const jolt = since > 0 && since < 0.1 ? Math.sin((since / 0.1) * Math.PI) : 0;
      dx = jolt * 6;
      sq = 1 - jolt * 0.05;
    } else {
      // Thrown back as the briars burst, then sagging as the rot climbs.
      const hit = clamp((p - 0.04) / 0.1);
      const back = ease("out", hit) * (1 - clamp((p - 0.3) / 0.7) * 0.5);
      dx = back * w * 0.12;
      tilt = back * 7 + clamp((p - 0.3) / 0.7) * 2;
      sq = 1 + ease("out", hit) * 0.04 * (1 - p);
      const climb = ease("out", clamp((p - 0.05) / 0.55));
      if (f.rot) setStyle(f.rot, "clip-path", `inset(${(100 - climb * 62).toFixed(1)}% -20% -5% -20%)`);
    }
    const move = `translate3d(${(cx - w / 2 + dx).toFixed(1)}px, ${(y - h * 0.97).toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg) scale(${sq.toFixed(3)}, ${(2 - sq).toFixed(3)})`;
    if (f.node.style.transform !== move) f.node.style.transform = move;
    const size = `${w.toFixed(1)}px`;
    if (f.node.style.width !== size) {
      f.node.style.width = size;
      f.node.style.height = `${h.toFixed(1)}px`;
    }
    f.node.toggleAttribute("data-back", f.back);
    placed.push({ x: cx, y, w, h: h * 0.84, order: i });
  });
  void age;
  LINE.set(root, placed);
};

const burst: Frame = (el, p, _age, ctx) => {
  const root = rootOf(el);
  if (!root) return;
  const blooms = el.querySelectorAll<HTMLElement>(".gr-bloom");
  const briars = el.querySelectorAll<HTMLElement>(".gr-briar");
  const list = allies(ctx);
  const caster = ctx.actor("caster");
  // The Warden stands in its own bloom, and so does every ally.
  const targets = [...(caster ? [{ ...caster, i: -1 }] : []), ...list];
  const down = downedAllies(root);
  blooms.forEach((b, n) => {
    const a = targets[n];
    if (!a) {
      if (b.style.display !== "none") b.style.display = "none";
      return;
    }
    if (b.style.display) b.style.display = "";
    const size = a.h / 0.84;
    const big = down.has(a.i) ? 1.35 : a.i < 0 ? 1.15 : 1;
    const bs = (size / 330) * big;
    b.style.transform = `translate3d(${a.x.toFixed(1)}px, ${(FLOOR + 6).toFixed(1)}px, 0) scale(${bs.toFixed(3)})`;
    setStyle(b, "--bs", bs.toFixed(3));
    setStyle(b, "--chip-y", `${((-size * 1.02) / bs).toFixed(1)}px`);
    b.toggleAttribute("data-caster", a.i < 0);
    // One chip says what the party got; the one who was down says so instead.
    const chip = b.querySelector<HTMLElement>(".gr-chip");
    const revived = down.has(a.i);
    const anyDown = targets.some((t) => down.has(t.i));
    const says = revived ? "Revived · Healed · Regen" : n === 1 && !anyDown ? "Healed · Regen · Cleansed" : "";
    if (chip && chip.textContent !== says) chip.textContent = says;
    b.toggleAttribute("data-chip", !!says);
    setStyle(b, "--k", clamp((p - 0.035 - n * 0.015) / 0.3).toFixed(3));
  });
  const line = LINE.get(root) ?? [];
  briars.forEach((b, n) => {
    const f = line[n];
    if (!f) {
      if (b.style.display !== "none") b.style.display = "none";
      return;
    }
    if (b.style.display) b.style.display = "";
    const bs = Math.max(0.55, Math.min(1.3, f.w / 460));
    b.style.transform = `translate3d(${f.x.toFixed(1)}px, ${(FLOOR + 6).toFixed(1)}px, 0) scale(${bs.toFixed(3)})`;
    setStyle(b, "--bs", bs.toFixed(3));
    setStyle(b, "--k", clamp((p - 0.04 - n * 0.02) / 0.28).toFixed(3));
    setStyle(b, "--chip-y", `${((-f.h * 1.02) / bs - (n % 2) * 40).toFixed(1)}px`);
  });
  el.style.setProperty("--chip", clamp((p - 0.08) / 0.12).toFixed(3));
};

const eyes: Frame = (el, p) => {
  const root = rootOf(el);
  const node = root?.querySelector<HTMLElement>('.cine-actor[data-role="caster"]');
  if (!node) return;
  const a = Number(el.dataset.a ?? 0);
  const b = Number(el.dataset.b ?? 1);
  const k = clamp((p - a) / Math.max(0.001, b - a));
  const from = Number(el.dataset.from ?? 0);
  const to = Number(el.dataset.to ?? 1);
  setStyle(node, "--wdn-eyes", (from + (to - from) * ease("in", k)).toFixed(3));
};

const earth: Frame = (el, p) => {
  el.style.setProperty("--pp", p.toFixed(3));
};

/** On the real battlefield: roots and heartbeats while it listens; leaves and rot after. */
const board: Frame = (el, p, age) => {
  const box = el.querySelector<HTMLElement>(".gr-board");
  const root = rootOf(el);
  if (!box || !root) return;
  const mode = box.dataset.mode;
  const caster = el.dataset.anchor ?? "";
  if (!box.dataset.built) {
    box.dataset.built = "1";
    const units = [...document.querySelectorAll<HTMLElement>(".stage .combatant")].filter((u) => !u.hasAttribute("data-down") || downedIds(root).includes(u.dataset.unit ?? ""));
    const down = downedIds(root);
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.classList.add("gr-board-roots");
    box.appendChild(svg);
    units.forEach((u, i) => {
      const id = u.dataset.unit ?? "";
      const hero = u.dataset.side === "hero";
      if (mode === "listen" && id !== caster) {
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("pathLength", "1");
        path.dataset.unit = id;
        path.dataset.side = hero ? "hero" : "enemy";
        path.style.setProperty("--i", String(i));
        svg.appendChild(path);
      }
      const mark = document.createElement("div");
      mark.className = "gr-mark";
      mark.dataset.unit = id;
      mark.dataset.side = hero ? "hero" : "enemy";
      if (down.includes(id)) mark.dataset.revived = "";
      if (id === caster) mark.dataset.caster = "";
      mark.style.setProperty("--i", String(i));
      mark.innerHTML =
        mode === "listen"
          ? '<i class="gr-ring"></i><i class="gr-ring late"></i>'
          : hero
            ? `<svg viewBox="-60 -70 120 80"><g class="gr-sprout">${[-40, -22, -6, 10, 26, 42].map((x, n) => `<path d="${leaf(9 + (n % 2) * 3)}" transform="translate(${x} 0) rotate(${-150 + n * 24})"/>`).join("")}<path class="gr-sprout-stem" d="M0 0 C-4 -20 6 -34 0 -52"/><path d="${leaf(10)}" transform="translate(0 -50) rotate(-60)"/></g></svg><i class="gr-rise"></i><i class="gr-rise b"></i><i class="gr-rise c"></i>`
            : `<svg viewBox="-60 -70 120 80"><g class="gr-coil">${[-36, -14, 8, 30].map((x, n) => `<path d="M${x - 5} 0 C${x - 3} -24 ${x + (n % 2 ? 10 : -10)} -40 ${x} -${48 + (n % 2) * 14} C${x + 2} -34 ${x + 4} -18 ${x + 5} 0 Z"/>`).join("")}</g></svg><i class="gr-drip"></i><i class="gr-drip b"></i>`;
      box.appendChild(mark);
    });
  }
  // The board does not move under a film: measure now and then, not every frame.
  const measure = Number(box.dataset.measured ?? -1e9);
  if (age - measure > 200 || age < measure) {
    box.dataset.measured = String(age);
    const origin = root.getBoundingClientRect();
    const left = parseFloat(el.style.left) || 0;
    const top = parseFloat(el.style.top) || 0;
    const svg = box.querySelector<SVGSVGElement>(".gr-board-roots");
    if (svg) {
      svg.style.left = `${-left}px`;
      svg.style.top = `${-top}px`;
      svg.setAttribute("width", String(origin.width));
      svg.setAttribute("height", String(origin.height));
      svg.setAttribute("viewBox", `0 0 ${origin.width.toFixed(0)} ${origin.height.toFixed(0)}`);
    }
    const foot = (id: string) => {
      const r = document.querySelector<HTMLElement>(`.stage [data-unit="${CSS.escape(id)}"] .combatant-body`)?.getBoundingClientRect();
      return r ? { x: r.left + r.width / 2 - origin.left, y: r.bottom - origin.top - r.height * 0.04, h: r.height } : null;
    };
    const from = foot(caster);
    box.querySelectorAll<HTMLElement>(".gr-mark").forEach((m) => {
      const f = foot(m.dataset.unit ?? "");
      if (!f) return;
      m.style.transform = `translate3d(${(f.x - left).toFixed(1)}px, ${(f.y - top).toFixed(1)}px, 0)`;
      m.style.setProperty("--u", `${Math.max(40, f.h * 0.9).toFixed(1)}px`);
    });
    if (from && svg)
      svg.querySelectorAll<SVGPathElement>("path").forEach((path, n) => {
        const f = foot(path.dataset.unit ?? "");
        if (!f) return;
        const mx = (from.x + f.x) / 2 + (n % 2 ? 20 : -20);
        const my = Math.max(from.y, f.y) + 26 + n * 6;
        path.setAttribute("d", `M${from.x.toFixed(1)} ${from.y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${f.x.toFixed(1)} ${f.y.toFixed(1)}`);
      });
  }
  box.style.setProperty("--beat", beat(age, 520, 60).toFixed(3));
  box.style.setProperty("--pp", p.toFixed(3));
};

/* ── Registered ────────────────────────────────────────────────────────── */

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "green-soil": Soil,
  "green-web": Web,
  "green-party": Party,
  "green-foes": Foes,
  "green-burst": Burst,
  "green-eyes": Eyes,
  "green-earth": Earth,
  "green-board": Board,
};

/**
 * Frame functions read their cue's parameters from `data-` attributes; the
 * engine hands a frame only the wrapper, so they are copied onto it once.
 */
const withParams =
  (frame: Frame, params: (el: HTMLElement) => Record<string, string | undefined> = () => ({})): Frame =>
  (el, p, age, ctx) => {
    if (!el.dataset.grParams) {
      el.dataset.grParams = "1";
      const src = el.querySelector<HTMLElement>("[data-gr]");
      if (src) for (const [k, x] of Object.entries(src.dataset)) if (k !== "gr" && x !== undefined) el.dataset[k] = x;
      for (const [k, x] of Object.entries(params(el))) if (x !== undefined) el.dataset[k] = x;
    }
    frame(el, p, age, ctx);
  };

export const frames: Record<string, Frame> = {
  "green-web": withParams(web),
  "green-party": withParams(party),
  "green-foes": withParams((el, p, age, ctx) => {
    const c = ctx.actor("caster");
    if (c) el.dataset.casterBox = String(c.h / 0.84);
    foes(el, p, age, ctx);
  }),
  "green-burst": burst,
  "green-eyes": withParams(eyes),
  "green-earth": earth,
  "green-board": board,
};

export { HOT, SPORE };
