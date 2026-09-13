import type { CSSProperties, ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ease } from "../../cinematic/timeline";
import { poseToTransform, sampleTrack, type Clip } from "../../battle/animation";
import { poses } from "./poses";
import { block, STONES } from "./stones";
import "./style.css";

/**
 * Still Life's effects.
 *
 * The idea they serve: the Chronomancer's spark is a shutter. Each flicker
 * takes a still of whatever moves, and a still stays where it was taken while
 * the figure goes on. So a still here is never drawn from scratch: it is the
 * real figure, copied off the stage at the instant it is taken, pose and
 * equipment and all, and printed one way everywhere, a pale lavender wash with
 * its lines in amber.
 *
 *   still-plates  stills of the cast, taken at flickers: `lay` leaves each one
 *                 stepping out ahead of its figure (a moment laid out);
 *                 `stream` pulls them off and up the sleeve; `converge` throws
 *                 them all back into their figure at once
 *   still-flicker the spark's flicker: a hard point, a bar of light, a ring
 *   still-brim    the hat's brim crossing the lens, for the cut into the quiet
 *   still-eyes    the eye-lights coming up in the silhouette
 *   still-motes   dust hanging in front of the lens, perfectly still
 *   still-burst   the drawn impact: a burst printed with its own stills
 *   still-fall    the roof coming down when time starts again
 *   still-held    on the board: a still left hanging on every real enemy
 *   still-given   on the board: stills of light rising off every ally
 *
 * The engine gives a figure slot to one effect only (`reflection`), and it is
 * a still picture of the primary target. These stills need every member of
 * the cast at the instant each is taken, so the effect copies the stage's own
 * actor nodes (`cloneNode`) inside its wrapper, once per still, and moves only
 * the copy's wrapper afterwards. A copy is stripped of `data-part`, ids and
 * the actor classes, so nothing that reads the cast (the animator, tests,
 * probes) can mistake it for the figure. It is removed with its shot.
 *
 * No filters and no keyframes: a glow is a wide translucent stroke or a small
 * gradient, and everything moves on the stage's variables or here.
 */

export const AMBER = "#ffb870";
export const STILL = "#e6e1f6";
const HOT = "#fff4e2";

const v = (vars: Record<string, string | number>) => vars as CSSProperties;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const num = (value: unknown, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const list = (value: unknown, fallback: number[]) =>
  typeof value === "string" && value.trim() ? value.split(",").map(Number) : fallback;

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

const setTransform = (el: HTMLElement | SVGElement | null | undefined, value: string) => {
  if (el && el.style.transform !== value) el.style.transform = value;
};
const setOpacity = (el: HTMLElement | SVGElement | null | undefined, value: number) => {
  const o = value.toFixed(3);
  if (el && el.style.opacity !== o) el.style.opacity = o;
};

/* ── Taking a still ───────────────────────────────────────────────────── */

/** The actor nodes of a role on this film's stage, in cast order. */
function actorsOf(el: HTMLElement, role: "caster" | "targets") {
  const film = el.closest(".ult-cinematic");
  return film ? [...film.querySelectorAll<HTMLElement>(`.cine-actors > .cine-actor[data-role="${role}"]`)] : [];
}

/** Keep only `keep`'s subtree (and its ancestors) inside a copied drawing. */
function pruneTo(root: Element, keep: string) {
  const selector = `[data-part="${keep}"]`;
  const walk = (node: Element) => {
    for (const child of [...node.children]) {
      if (child.tagName.toLowerCase() === "defs" || child.matches(selector)) continue;
      if (child.querySelector(selector)) walk(child);
      else child.remove();
    }
  };
  const svg = root.querySelector("svg");
  if (svg) walk(svg);
}

/**
 * A still of an actor node, as it is this frame. The copy keeps its inline
 * transforms (where the stage placed it, how its rig and parts are posed)
 * and loses everything that names it.
 */
function still(node: HTMLElement, keep?: string, posed?: { clip: Clip; t: number }): HTMLElement {
  const copy = node.cloneNode(true) as HTMLElement;
  // Posed as the clip was when the still was due, not as it is on this frame:
  // a frame that lands late (a stall, the lab's seek) still takes the right
  // moment.
  if (posed)
    for (const part of copy.querySelectorAll<SVGElement>("[data-part]")) {
      const track = posed.clip.parts?.[part.dataset.part ?? ""];
      part.style.transform = poseToTransform(sampleTrack(track ?? [], posed.t));
    }
  copy.className = "still-plate";
  for (const attr of ["data-role", "data-look", "data-root"]) copy.removeAttribute(attr);
  copy.style.display = "";
  copy.style.zIndex = "";
  if (keep) pruneTo(copy, keep);
  for (const inner of copy.querySelectorAll("[data-part], [id], [data-clip], .cine-anchor")) {
    if (inner.classList.contains("cine-anchor")) {
      inner.remove();
      continue;
    }
    inner.removeAttribute("data-part");
    inner.removeAttribute("id");
    inner.removeAttribute("data-clip");
  }
  const rig = copy.querySelector(".cine-rig");
  rig?.classList.replace("cine-rig", "still-rig");
  copy.querySelector(".cine-look")?.classList.replace("cine-look", "still-look");
  return copy;
}

interface Taken {
  /** The positioned wrapper that moves; the copy inside never does. */
  wrap: HTMLDivElement;
  /** Which figure it is of (cast order) and which still of it. */
  source: number;
  k: number;
  /** The figure's ground point and drawn height when taken, world units. */
  at: { x: number; y: number; h: number };
}

const taken = new WeakMap<HTMLElement, Taken[]>();

/**
 * Stills of the cast.
 *
 * Params: `from` (`caster` | `targets`), `keep` (a part: keep only it, as in
 * the hand's stills), `takes` (comma list of shares of the effect's life at
 * which a still is taken; the same for every figure), `mode` (`lay` |
 * `stream` | `converge`), and per mode:
 *
 *  - lay: each still steps out by (`dx`, `dy`) × its number, in multiples of
 *    the figure's height, over `glide` of the effect;
 *  - stream: laid as above from the start, then from `go` (staggered by
 *    `every` a still) each flies to the caster's ground point plus (`tx`,
 *    `ty`) × the caster's height, growing to `grow`, and is gone on arrival;
 *  - converge: laid as above from the start, the primary's stills arrive in
 *    it at `hit` (every other figure's at `hit2`, a share apart), overprinted,
 *    and blow out through it (`through`) and away.
 */
const plates: Frame = (el, p, age, ctx) => {
  const box = el.querySelector<HTMLElement>(".still-plates");
  if (!box) return;
  const from = (box.dataset.from ?? "targets") as "caster" | "targets";
  const mode = box.dataset.mode ?? "lay";
  const takes = list(box.dataset.takes, [0]);
  const keep = box.dataset.keep || undefined;
  // `clip`: the caster's clip, started with the shot, to pose its stills by.
  const clip = box.dataset.clip ? (poses.arcanist as Record<string, Clip | undefined>)[box.dataset.clip] : undefined;
  const length = p > 0 ? age / p : 0;
  const dx = num(box.dataset.dx, -0.3);
  const dy = num(box.dataset.dy, 0);
  const shade = num(box.dataset.fade, 0.2);
  const alpha = num(box.dataset.alpha, 0.9);
  let stills = taken.get(el);
  if (!stills) taken.set(el, (stills = []));

  // Take whatever is due. A jump into the middle of the effect (the lab's
  // `at=`) takes every still due at once.
  const nodes = actorsOf(el, from);
  nodes.forEach((node, source) => {
    if (node.style.display === "none") return;
    const id = from === "caster" ? "caster" : `targets-${source}`;
    const at = ctx.actor(id);
    if (!at) return;
    takes.forEach((when, k) => {
      if (p < when || stills!.some((s) => s.source === source && s.k === k)) return;
      const wrap = document.createElement("div");
      wrap.className = "still-shift";
      wrap.style.transformOrigin = `${at.x.toFixed(1)}px ${(at.y - at.h * 0.45).toFixed(1)}px`;
      const posed = clip && length ? { clip, t: clamp((when * length) / clip.duration) } : undefined;
      wrap.appendChild(still(node, keep, posed));
      box.appendChild(wrap);
      stills!.push({ wrap, source, k, at: { ...at } });
    });
  });

  const caster = ctx.actor("caster");
  for (const s of stills) {
    const n = s.k + 1;
    const since = p - takes[s.k];
    let ox = dx * s.at.h * n;
    let oy = dy * s.at.h * n;
    let scale = 1;
    let o = alpha * (1 - shade * s.k);
    if (mode === "lay") {
      const glide = num(box.dataset.glide, 0.12);
      const k = ease("out", clamp(since / glide));
      ox *= k;
      oy *= k;
      o *= clamp(since / 0.04);
    } else if (mode === "stream" && caster) {
      const go = num(box.dataset.go, 0.3) + num(box.dataset.every, 0.06) * (s.k + s.source * 1.5);
      const k = ease("in", clamp((p - go) / num(box.dataset.fly, 0.3)));
      const tx = caster.x + num(box.dataset.tx, 0.3) * caster.h - s.at.x;
      const ty = caster.y - num(box.dataset.ty, 0.6) * caster.h - (s.at.y - s.at.h * 0.45);
      // A low arc: out, over and down into the sleeve.
      ox = lerp(ox, tx, k);
      oy = lerp(oy, ty, k) - Math.sin(k * Math.PI) * s.at.h * 0.35;
      scale = lerp(1, num(box.dataset.grow, 2), k * k);
      o *= k > 0.85 ? clamp((1 - k) / 0.15) : 1;
    } else if (mode === "converge") {
      const hit = s.source === 0 ? num(box.dataset.hit, 0.1) : num(box.dataset.hit2, 0.36) + (s.source - 1) * 0.05;
      const lead = num(box.dataset.lead, 0.1);
      const start = hit - lead * (1 + s.k * 0.25);
      const k = clamp((p - start) / (hit - start));
      const through = num(box.dataset.through, 0.2);
      const out = clamp((p - hit) / through);
      // Arriving: every still slides in along its line and lands on the figure.
      // They land a little out of register, each a hair further back along its
      // line, so the frame they land on is a multiple exposure of the figure.
      const arrive = ease("in", k);
      const blow = ease("out", out);
      ox = lerp(ox, ox * 0.12, arrive) - dx * s.at.h * n * blow * 1.1;
      oy = lerp(oy, oy * 0.12, arrive) - dy * s.at.h * n * blow * 1.1;
      scale = 1 + ease("out", out) * 0.12 * n;
      o *= out > 0 ? (1 - out) * (out < 0.08 ? 1.2 : 1) : p < start ? 0 : lerp(0.4, 1, k);
      const hot = out > 0 && out < 0.35;
      if (s.wrap.dataset.hot !== (hot ? "1" : "0")) s.wrap.dataset.hot = hot ? "1" : "0";
    }
    setTransform(s.wrap, `translate3d(${ox.toFixed(1)}px, ${oy.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`);
    setOpacity(s.wrap, clamp(o));
  }
};

const Plates = ({ cue }: VfxProps): ReactNode => {
  const q = cue.params ?? {};
  const data: Record<string, string> = {};
  for (const [key, value] of Object.entries(q)) data[`data-${key}`] = String(value);
  return <div className="still-plates" {...data} />;
};

/* ── The flicker ──────────────────────────────────────────────────────── */

/**
 * The spark's flicker: a hard white point, a bar of light across it, and a
 * thin stepped ring going out. Params: `at` (comma list of shares at which
 * it flickers; each flicker lasts `ms` of the effect).
 */
const Flicker = ({ cue, color }: VfxProps): ReactNode => (
  <svg
    className="still-flicker"
    viewBox="-120 -120 240 240"
    data-at={String(cue.params?.at ?? "0")}
    data-len={String(cue.params?.len ?? 0.12)}
    data-spark={cue.params?.spark ? "" : undefined}
  >
    <circle className="still-flicker-ring" r="60" fill="none" stroke={color} strokeWidth="3" />
    <circle className="still-flicker-ring b" r="44" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.6" />
    <path className="still-flicker-bar" d="M-116 0 L0 -5 L116 0 L0 5 Z" fill={HOT} />
    <path className="still-flicker-bar" d="M0 -40 L3 0 L0 40 L-3 0 Z" fill={HOT} opacity="0.8" />
    <circle className="still-flicker-core" r="11" fill={HOT} />
  </svg>
);

/**
 * Where a part of the caster's drawing is, in world units relative to an
 * effect's wrapper (a cinematic shot's world layer). Reads layout, so it is
 * asked only while an effect that needs it is showing.
 */
function partInWorld(el: HTMLElement, selector: string) {
  const film = el.closest<HTMLElement>(".ult-cinematic");
  const world = film?.querySelector<HTMLElement>(".cine-world");
  const part = film?.querySelector<SVGGraphicsElement>(`.cine-actors > .cine-actor[data-role="caster"] ${selector}`);
  if (!film || !world || !part) return null;
  const root = film.getBoundingClientRect();
  const m = new DOMMatrix(world.style.transform || "none").inverse();
  const wrap = el.getBoundingClientRect();
  const origin = m.transformPoint(new DOMPoint(wrap.left - root.left, wrap.top - root.top));
  const r = part.getBoundingClientRect();
  const c = m.transformPoint(new DOMPoint(r.left + r.width / 2 - root.left, r.top + r.height / 2 - root.top));
  return { x: c.x - origin.x, y: c.y - origin.y };
}

const flicker: Frame = (el, p) => {
  const svg = el.querySelector<SVGElement>(".still-flicker");
  if (!svg) return;
  const len = num(svg.dataset.len, 0.12);
  let k = 0;
  for (const at of list(svg.dataset.at, [0])) if (p >= at && p < at + len) k = (p - at) / len;
  const on = list(svg.dataset.at, [0]).some((at) => p >= at && p < at + len);
  svg.style.setProperty("--k", (on ? k : 1).toFixed(3));
  svg.style.visibility = on ? "" : "hidden";
  // `on-spark`: sit on the caster's spark wherever the hand has taken it.
  if (on && svg.dataset.spark !== undefined) {
    const at = partInWorld(el, '[data-part="spark"]');
    if (at) svg.style.translate = `${at.x.toFixed(1)}px ${at.y.toFixed(1)}px`;
  }
};

/* ── The brim across the lens ─────────────────────────────────────────── */

/**
 * The hat's brim crossing the lens, left to right: its black underside with
 * the band's gold edge, wide enough to cover the frame at the middle of its
 * pass. `half`: `out` covers the frame by the end of the effect, `in` starts
 * covered and uncovers, so two cues straddle a cut.
 */
const Brim = ({ cue }: VfxProps): ReactNode => (
  <div className="still-brim" data-half={String(cue.params?.half ?? "out")}>
    <svg viewBox="0 0 200 100" preserveAspectRatio="none">
      <path d="M-40 -10 C40 -14 150 8 250 -4 L250 110 L-40 110 Z" fill="#05040a" />
      <path d="M-40 -10 C40 -14 150 8 250 -4" fill="none" stroke="#e7b556" strokeWidth="2.5" strokeOpacity="0.8" vectorEffect="non-scaling-stroke" />
      <path d="M-40 2 C40 -2 150 20 250 8" fill="none" stroke="#2c2a4a" strokeWidth="6" vectorEffect="non-scaling-stroke" />
    </svg>
  </div>
);

const brim: Frame = (el, p) => {
  const node = el.querySelector<HTMLElement>(".still-brim");
  if (!node) return;
  const k = node.dataset.half === "in" ? 0.5 + ease("out", p) * 0.62 : ease("in", p) * 0.5;
  // 0: off the left edge; 0.5: covering; ~1.1: gone off the right.
  setTransform(node, `translate3d(${((k - 0.5) * 230).toFixed(2)}%, 0, 0) rotate(${((0.5 - k) * 6).toFixed(2)}deg)`);
};

/* ── The eye-lights ───────────────────────────────────────────────────── */

/**
 * The eye-lights coming up in a silhouette: a small halo round each of the
 * drawing's own two eyes (lit in the silhouette by this film's style), and
 * the drawing's eyes themselves brightening through `--still-eyes` on the
 * caster. Placed from the drawing's eyes each frame they move.
 */
const Eyes = ({ color }: VfxProps): ReactNode => (
  <div className="still-eyes" style={v({ "--c": color })}>
    <i />
    <i />
  </div>
);

const eyes: Frame = (el, p) => {
  const film = el.closest<HTMLElement>(".ult-cinematic");
  const caster = film?.querySelector<HTMLElement>('.cine-actors > .cine-actor[data-role="caster"]');
  const lights = caster?.querySelectorAll<SVGGraphicsElement>(".ph-glow-eyes ellipse");
  const world = film?.querySelector<HTMLElement>(".cine-world");
  const halos = el.querySelectorAll<HTMLElement>(".still-eyes > i");
  if (!film || !caster || !lights?.length || !world) return;
  const up = ease("inOut", clamp((p - 0.18) / 0.55));
  const level = (0.25 + up * 0.75).toFixed(2);
  if (caster.style.getPropertyValue("--still-eyes") !== level) caster.style.setProperty("--still-eyes", level);
  // Where the drawing's eyes are on screen, back into world units. The pose
  // is held in this shot, so this settles after the first frames.
  const root = film.getBoundingClientRect();
  const m = new DOMMatrix(world.style.transform || "none").inverse();
  const wrap = el.getBoundingClientRect();
  const origin = m.transformPoint(new DOMPoint(wrap.left - root.left, wrap.top - root.top));
  lights.forEach((light, i) => {
    const r = light.getBoundingClientRect();
    const c = m.transformPoint(new DOMPoint(r.left + r.width / 2 - root.left, r.top + r.height / 2 - root.top));
    const halo = halos[i];
    if (!halo) return;
    setTransform(halo, `translate3d(${(c.x - origin.x).toFixed(1)}px, ${(c.y - origin.y).toFixed(1)}px, 0) scale(${(0.6 + up * 0.7).toFixed(3)})`);
    setOpacity(halo, 0.2 + up * 0.8);
  });
};

/* ── Hanging dust, in front ───────────────────────────────────────────── */

const Motes = ({ cue, color }: VfxProps): ReactNode => {
  const rand = seeded(cue.seed ?? 5);
  return (
    <svg className="still-motes" viewBox="-800 -450 1600 900">
      {Array.from({ length: 26 }, (_, i) => {
        const x = (rand() - 0.5) * 1560;
        const y = (rand() - 0.5) * 860;
        const r = 2 + rand() * (i % 5 === 0 ? 14 : 5);
        return (
          <g key={i} transform={`translate(${x.toFixed(0)} ${y.toFixed(0)})`}>
            <circle r={(r * 2.4).toFixed(1)} fill={color} fillOpacity={0.05} />
            <circle r={r.toFixed(1)} fill={STILL} fillOpacity={(0.25 + rand() * 0.4).toFixed(2)} />
          </g>
        );
      })}
    </svg>
  );
};

/* ── The drawn impact ─────────────────────────────────────────────────── */

function burstPath(seed: number, spikes: number, inner: number, outer: number) {
  const rand = seeded(seed);
  let d = "";
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2 + (rand() - 0.5) * 0.12;
    const r = i % 2 ? inner * (0.8 + rand() * 0.4) : outer * (0.55 + rand() * 0.6);
    d += `${i ? "L" : "M"}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r * 0.82).toFixed(1)}`;
  }
  return `${d}Z`;
}

/**
 * The burst, printed with its own stills: three drawings that boil (one a
 * frame), each with two stepped copies behind it towards where the stills
 * came from, amber, fading. At the centre a hard white core.
 */
const Burst = ({ cue, color }: VfxProps): ReactNode => {
  const seed = cue.seed ?? 5;
  return (
    <svg className="still-burst" viewBox="-300 -260 600 520" data-k="0">
      {[0, 1, 2].map((k) => (
        <g key={k} className="still-burst-frame" data-k={k}>
          {[2, 1].map((step) => (
            <path
              key={step}
              d={burstPath(seed + k * 7, 12, 34, 230)}
              transform={`translate(${-step * 46} ${step * 4}) scale(${1 - step * 0.08})`}
              fill="none"
              stroke={color}
              strokeWidth={6 - step * 1.5}
              strokeOpacity={0.55 - step * 0.18}
              strokeLinejoin="round"
            />
          ))}
          <path d={burstPath(seed + k * 7, 12, 34, 230)} fill={color} fillOpacity="0.85" stroke="#140f1c" strokeWidth="6" strokeLinejoin="round" />
          <path d={burstPath(seed + k * 13 + 3, 9, 22, 130)} fill={HOT} />
          <path d={burstPath(seed + k * 5 + 9, 6, 10, 46)} fill="#140f1c" transform="rotate(14)" />
        </g>
      ))}
    </svg>
  );
};

const burst: Frame = (el, _p, age) => {
  const svg = el.querySelector<SVGElement>(".still-burst");
  const k = String(Math.floor(age / 40) % 3);
  if (svg && svg.dataset.k !== k) svg.dataset.k = k;
};

/* ── The roof comes down ──────────────────────────────────────────────── */

/**
 * Every stone the background hangs, hanging exactly where it did, until the
 * effect's `drop` share; then each lets go (a little later or earlier than
 * its neighbours), falls under gravity and lands on the far floor.
 */
const Fall = ({ cue, color }: VfxProps): ReactNode => (
  <svg className="still-fall" viewBox="-800 -450 3200 1800" data-drop={String(cue.params?.drop ?? 0.12)}>
    {STONES.map((s, i) => {
      const d = block(s, 40 + i);
      return (
        <g key={i}>
          {/* where it was a moment ago, twice: the fall printed as it goes */}
          {[2, 1].map((k) => (
            <path key={k} className="still-stone-echo" data-k={k} d={d} fill="none" stroke={color} strokeWidth="4" strokeOpacity={0.14 * (3 - k)} />
          ))}
          <g className="still-stone">
            <path d={d} fill="#15132a" stroke="#34304f" strokeWidth="6" />
            <path d={d} fill="none" stroke={color} strokeOpacity="0.3" strokeWidth="3" transform="translate(0 -3)" />
            <path d={`M${(-s.w * 0.42).toFixed(1)} ${(-s.h * 0.32).toFixed(1)} H${(s.w * 0.38).toFixed(1)}`} stroke="#221f3b" strokeWidth="7" strokeLinecap="round" />
          </g>
        </g>
      );
    })}
  </svg>
);

/** Where a stone is `k` of the way through its fall (gravity: the drop is k²). */
function stoneAt(i: number, k: number) {
  const s = STONES[i];
  const landed = k >= 1;
  return `translate(${lerp(s.x, s.lx, k).toFixed(0)}px, ${lerp(s.y, s.ly, k * k).toFixed(0)}px) rotate(${lerp(s.r, s.lr, k).toFixed(1)}deg)${landed ? " scale(0.8, 0.7)" : ""}`;
}

const fall: Frame = (el, p) => {
  const svg = el.querySelector<SVGElement>(".still-fall");
  if (!svg) return;
  const drop = num(svg.dataset.drop, 0.12);
  svg.querySelectorAll<SVGGElement>(":scope > g").forEach((g, i) => {
    const s = STONES[i];
    const k = clamp((p - drop - s.late * 0.4) / 0.42);
    setTransform(g.querySelector<SVGGElement>(".still-stone"), stoneAt(i, k));
    g.querySelectorAll<SVGPathElement>(".still-stone-echo").forEach((echo) => {
      const back = Number(echo.dataset.k) * 0.09;
      const falling = k > 0 && k < 1;
      setTransform(echo, stoneAt(i, clamp(k - back)));
      const on = falling ? "" : "hidden";
      if (echo.style.visibility !== on) echo.style.visibility = on;
    });
  });
};

/* ── On the board ─────────────────────────────────────────────────────── */

/**
 * A still left hanging ahead of a real enemy: a copy of its figure on the
 * board, taken when the return starts, stepped out towards the party and
 * holding there, slowly going pale. Its moment, held.
 */
/** A still of a figure on the board, as its rig is this frame, placed on its feet. */
function boardStill(box: HTMLElement, unit: string, className: string) {
  const rig = document.querySelector<HTMLElement>(`.stage [data-unit="${CSS.escape(unit)}"] .combatant-rig`);
  if (!rig) return false;
  const r = rig.getBoundingClientRect();
  const copy = rig.cloneNode(true) as HTMLElement;
  copy.className = className;
  for (const inner of copy.querySelectorAll("[data-part], [id], [data-clip]")) {
    inner.removeAttribute("data-part");
    inner.removeAttribute("id");
    inner.removeAttribute("data-clip");
  }
  copy.style.width = `${r.width.toFixed(1)}px`;
  copy.style.height = `${r.height.toFixed(1)}px`;
  copy.style.marginLeft = `${(-r.width / 2).toFixed(1)}px`;
  copy.style.marginTop = `${(-r.height).toFixed(1)}px`;
  box.dataset.w = r.width.toFixed(1);
  box.dataset.h = r.height.toFixed(1);
  box.appendChild(copy);
  return true;
}

const Held = (): ReactNode => <div className="still-held" />;

const held: Frame = (el, p) => {
  const box = el.querySelector<HTMLElement>(".still-held");
  const unit = el.dataset.anchor;
  if (!box || !unit) return;
  if (!box.firstChild && !boardStill(box, unit, "still-board-rig")) return;
  const w = num(box.dataset.w, 100);
  const out = ease("out", clamp(p / 0.35));
  setTransform(box, `translate3d(${(-w * 0.42 * out).toFixed(1)}px, 0, 0)`);
  setOpacity(box, lerp(0.95, 0.55, clamp((p - 0.3) / 0.7)) * clamp(p / 0.06));
};

/**
 * A moment given: a still of a real ally, lifted off it in amber light and
 * rising, going pale as it goes, while a second follows it a beat behind.
 */
const Given = (): ReactNode => (
  <div className="still-given">
    <div className="still-given-a" />
    <div className="still-given-b" />
  </div>
);

const given: Frame = (el, p) => {
  const unit = el.dataset.anchor;
  const a = el.querySelector<HTMLElement>(".still-given-a");
  const b = el.querySelector<HTMLElement>(".still-given-b");
  if (!unit || !a || !b) return;
  if (!a.firstChild && !boardStill(a, unit, "still-board-rig")) return;
  if (!b.firstChild) boardStill(b, unit, "still-board-rig");
  const h = num(a.dataset.h, 100);
  for (const [node, delay] of [
    [a, 0],
    [b, 0.22],
  ] as const) {
    const k = clamp((p - delay) / 0.75);
    setTransform(node, `translate3d(0, ${(-h * 0.32 * ease("out", k)).toFixed(1)}px, 0) scale(${(1 + k * 0.06).toFixed(3)})`);
    setOpacity(node, k <= 0 ? 0 : Math.min(1, k * 8) * (1 - ease("in", k)) * (delay ? 0.6 : 0.9));
  }
};

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "still-plates": Plates,
  "still-flicker": Flicker,
  "still-brim": Brim,
  "still-eyes": Eyes,
  "still-motes": Motes,
  "still-burst": Burst,
  "still-fall": Fall,
  "still-held": Held,
  "still-given": Given,
};

export const frames: Record<string, Frame> = {
  "still-plates": plates,
  "still-flicker": flicker,
  "still-brim": brim,
  "still-eyes": eyes,
  "still-burst": burst,
  "still-fall": fall,
  "still-held": held,
  "still-given": given,
};
