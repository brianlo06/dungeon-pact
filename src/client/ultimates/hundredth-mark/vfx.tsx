import type { CSSProperties, ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ease } from "../../cinematic/timeline";
import "./style.css";

/**
 * The Hundredth Mark's effects.
 *
 * The idea they serve: the Ranger sees every shot it could take — a hundred
 * possible lines, each leaving a quarry sign on the enemy it would hit — and
 * then lets ninety-nine of them go and looses the one.
 *
 *   hundredth-lineup   the rest of the real enemy line, as ink in the fog
 *   hundredth-lines    the hundred possibilities, and a sign on each enemy
 *   hundredth-sign     one quarry sign on the target: drawn, held, cashed in
 *   hundredth-arrow    the one arrow, in flight or buried, and its line
 *   hundredth-fog      ground fog in front of the cast; it parts, or wipes
 *   hundredth-reticle  the sign at the size of the screen, closing on the hit
 *   hundredth-board    on the real battlefield: a sign on every enemy
 *   hundredth-tag      nothing; it names the chosen target to the others
 *
 * A note on the enemy line. The engine's cast is the Ultimate's *damaged*
 * units, and this one damages only its target — Mark on the rest is a status,
 * which leaves no beat. So the cast holds one enemy. The rest of the line is
 * taken from where the stage has really put it: `hundredth-lineup` copies each
 * living enemy's drawing off the board once, and places it relative to the
 * target exactly as the board stands it, scaled to the target's size in the
 * shot. `hundredth-tag`, anchored on `targets`, is how these effects learn
 * which board unit the target is. Everything is read once and then only
 * moved, with no React render.
 */

export const LIME = "#c7f08a";
const HOT = "#f2ffd9";
const INK = "#0b0f0a";

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

/* ── Reading the board ─────────────────────────────────────────────────── */

interface Seen {
  id: string;
  rig: HTMLElement;
  rect: DOMRect;
}

const rootOf = (el: HTMLElement) => el.closest<HTMLElement>(".ult-cinematic");

/** Every living enemy the stage has placed, where it stands on screen. */
function boardEnemies(keep?: string): Seen[] {
  // The board already stands at the result, so the chosen target may be down
  // there; it is kept, since the film is of the moment before.
  return [...document.querySelectorAll<HTMLElement>('.stage .combatant[data-side="enemy"]')]
    .filter((u) => !u.hasAttribute("data-down") || u.dataset.unit === keep)
    .map((u) => {
      const rig = u.querySelector<HTMLElement>(".combatant-rig");
      // Measured by the body, which the animator never moves: a figure lying
      // down or mid-flinch keeps its standing size and place.
      const body = u.querySelector<HTMLElement>(".combatant-body") ?? rig;
      return rig && body ? { id: u.dataset.unit ?? "", rig, rect: body.getBoundingClientRect() } : null;
    })
    .filter((x): x is Seen => !!x && x.rect.height > 0);
}

/** The chosen target's board id, from any effect the engine anchored on it. */
function chosen(root: HTMLElement | null) {
  return root?.querySelector<HTMLElement>(".cine-anchored[data-anchor]")?.dataset.anchor;
}

/**
 * Where the rest of the line stands in this shot, in world units, shared by
 * the effects that draw the line and the ones that mark it. Written by
 * `hundredth-lineup` each frame; read by `hundredth-lines`.
 */
interface Placed {
  x: number;
  y: number;
  h: number;
  /** The order it is marked in, 0 first. */
  order: number;
}
const LINE = new WeakMap<HTMLElement, Placed[]>();

/** When the `n`th of `count` marks lands, as progress through the marking. */
export const markAt = (order: number, count: number) =>
  count <= 1 ? 0.78 : 0.3 + (0.48 * order) / (count - 1);

/* ── The quarry sign ───────────────────────────────────────────────────── */

/**
 * The quarry sign: a diamond with a notch cut at each point and a pip in the
 * middle — the mark the stage flashes on a target before a precision shot,
 * drawn here by hand. `k` (0…1) draws it; the halves are separate so it can
 * break.
 */
function SignPaths() {
  return (
    <>
      <path className="hm-sign-glow" d="M0 -50 L50 0 L0 50 L-50 0 Z" />
      <g className="hm-sign-half a">
        <path className="hm-sign-ink" d="M0 -50 L50 0 L0 50" />
        <path className="hm-sign-line" d="M0 -50 L50 0 L0 50" pathLength={1} />
      </g>
      <g className="hm-sign-half b">
        <path className="hm-sign-ink" d="M0 50 L-50 0 L0 -50" />
        <path className="hm-sign-line" d="M0 50 L-50 0 L0 -50" pathLength={1} />
      </g>
      <path className="hm-sign-ticks" d="M0 -64 V-40 M64 0 H40 M0 64 V40 M-64 0 H-40" />
      <circle className="hm-sign-pip" r="8" />
    </>
  );
}

function SignArt() {
  return (
    <svg className="hm-sign" viewBox="-70 -70 140 140" aria-hidden="true">
      <SignPaths />
    </svg>
  );
}

const SIGN_HTML = (() => {
  const edge = "M0 -50 L50 0 L0 50 L-50 0 Z";
  return `<svg class="hm-sign" viewBox="-70 -70 140 140" aria-hidden="true"><path class="hm-sign-glow" d="${edge}"/><g class="hm-sign-half a"><path class="hm-sign-ink" d="M0 -50 L50 0 L0 50"/><path class="hm-sign-line" d="M0 -50 L50 0 L0 50" pathLength="1"/></g><g class="hm-sign-half b"><path class="hm-sign-ink" d="M0 50 L-50 0 L0 -50"/><path class="hm-sign-line" d="M0 50 L-50 0 L0 -50" pathLength="1"/></g><path class="hm-sign-ticks" d="M0 -64 V-40 M64 0 H40 M0 64 V40 M-64 0 H-40"/><circle class="hm-sign-pip" r="8"/></svg>`;
})();

/* ── Renderers ─────────────────────────────────────────────────────────── */

const Lineup = ({ cue }: VfxProps) => (
  <div className="hm-lineup" data-hm="" data-rows={String(cue.params?.rows ?? "all")} data-span={String(cue.params?.span ?? 420)} data-depth={String(cue.params?.depth ?? 0.45)} />
);

const RAYS = 100;
const SIGNS = 8;

const Lines = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 100);
  return (
    <svg
      className="hm-lines"
      viewBox="0 0 1600 900"
      data-hm=""
      data-let={cue.params?.let ? "" : undefined}
      data-ghost={cue.params?.ghost ? "" : undefined}
      data-one={cue.params?.one ? "" : undefined}
      data-ox={String(cue.params?.ox ?? 0.4)}
      data-oy={String(cue.params?.oy ?? 0.6)}
      data-angle={String(cue.params?.angle ?? 0)}
      data-spread={String(cue.params?.spread ?? 34)}
      data-seed={String(cue.seed ?? 100)}
      data-fx={cue.params?.fx !== undefined ? String(cue.params.fx) : undefined}
      data-fy={cue.params?.fy !== undefined ? String(cue.params.fy) : undefined}
    >
      <g className="hm-rays">
        {Array.from({ length: RAYS }, (_, i) => (
          <path
            key={i}
            className="hm-ray"
            pathLength={1}
            data-i={i}
            style={v({
              "--d": (rand() * 0.42).toFixed(3),
              "--out": (0.12 + rand() * 0.5).toFixed(3),
              "--o": (0.25 + rand() * 0.5).toFixed(2),
            })}
          />
        ))}
        <path className="hm-ray hm-true" pathLength={1} />
      </g>
      <g className="hm-signs">
        {Array.from({ length: SIGNS }, (_, i) => (
          <g key={i} className="hm-slot" data-slot={i} style={{ display: "none" }}>
            <g className="hm-sign">
              <SignPaths />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
};

const Sign = ({ cue }: VfxProps) => (
  <div
    className="hm-sign-box"
    data-mode={String(cue.params?.mode ?? "draw")}
    style={v({ "--lift": Number(cue.params?.lift ?? 0.55), "--size": Number(cue.params?.size ?? 0.42) })}
  >
    <SignArt />
    <i className="hm-sign-burst" />
    {Array.from({ length: 6 }, (_, i) => (
      <b key={i} className="hm-shard" style={v({ "--a": `${i * 60 + 20}deg`, "--r": `${(i % 2 ? 1 : -1) * (160 + i * 40)}deg` })} />
    ))}
  </div>
);

const Arrow = ({ cue }: VfxProps) => (
  <div
    className="hm-arrow"
    data-hm=""
    data-stuck={cue.params?.stuck ? "" : undefined}
    data-x1={String(cue.params?.x1 ?? 0)}
    data-y1={String(cue.params?.y1 ?? 0)}
    data-x2={String(cue.params?.x2 ?? 1000)}
    data-y2={String(cue.params?.y2 ?? 0)}
    data-ease={String(cue.params?.ease ?? "in")}
    data-aim={cue.params?.aim ? "" : undefined}
    data-short={String(cue.params?.short ?? 0)}
    style={v({ "--len": `${Number(cue.params?.len ?? 170)}px` })}
  >
    <i className="hm-arrow-line" />
    <i className="hm-arrow-line core" />
    <svg className="hm-arrow-art" viewBox="-8 -8 40 16">
      {/* Replaced on its first frame by the arrow the Ranger actually holds. */}
      <g className="hm-arrow-own">
        <path d="M-4 0 H24" stroke={INK} strokeWidth={3} strokeLinecap="round" />
        <path d="M22 -2.6 L28 0 L22 2.6 Z" fill="#9aa4ad" stroke={INK} strokeWidth={1} />
        <path d="M-6 -2.4 L-1 0 L-6 2.4 L-4 0 Z" fill="#c4533f" stroke={INK} strokeWidth={0.9} />
      </g>
    </svg>
    <i className="hm-arrow-head" />
  </div>
);

const Fog = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 71);
  const wipe = cue.params?.wipe;
  return (
    <div className="hm-fog" data-wipe={wipe ? String(wipe) : undefined} data-part={cue.params?.part ? "" : undefined}>
      {Array.from({ length: wipe ? 9 : 12 }, (_, i) => (
        <i
          key={i}
          data-speed={(0.02 + rand() * 0.05).toFixed(3)}
          data-offset={rand().toFixed(3)}
          style={v({
            "--y": `${(wipe ? -10 + rand() * 120 : 8 + rand() * 90).toFixed(1)}%`,
            "--w": `${(wipe ? 70 + rand() * 60 : 30 + rand() * 50).toFixed(1)}%`,
            "--h": `${(wipe ? 30 + rand() * 40 : 6 + rand() * 12).toFixed(1)}%`,
            "--o": (wipe ? 0.8 + rand() * 0.2 : 0.18 + rand() * 0.3).toFixed(2),
            "--side": rand() < 0.5 ? -1 : 1,
            "--lag": (rand() * 0.25).toFixed(3),
          })}
        />
      ))}
    </div>
  );
};

const Reticle = ({ cue }: VfxProps) => (
  <div
    className="hm-reticle"
    data-pierce={cue.params?.pierce ? "" : undefined}
    style={v({ "--px": `${Number(cue.params?.px ?? 0.5) * 100}%`, "--py": `${Number(cue.params?.py ?? 0.5) * 100}%` })}
  >
    <i className="hm-reticle-cut" />
    <svg className="hm-reticle-art" viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid meet">
      <path className="hm-reticle-diamond" d="M0 -80 L80 0 L0 80 L-80 0 Z" />
      <path className="hm-reticle-cross" d="M0 -100 V-30 M100 0 H30 M0 100 V30 M-100 0 H-30" />
    </svg>
  </div>
);

const Board = ({ cue }: VfxProps) => <div className="hm-board" data-mode={String(cue.params?.mode ?? "left")} />;

/* ── Frames ────────────────────────────────────────────────────────────── */

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

const setD = (el: Element | null | undefined, d: string) => {
  if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
};

interface Clone {
  node: HTMLElement;
  dx: number;
  dy: number;
  w: number;
  h: number;
}

/** Built once per effect: which board figures, and how they stand to the target. */
const built = new WeakMap<HTMLElement, { clones: Clone[]; base: number; order: number[] } | null>();

const lineup: Frame = (el, p, _age, ctx) => {
  const box = el.querySelector<HTMLElement>(".hm-lineup");
  const root = rootOf(el);
  if (!box || !root) return;
  let state = built.get(el);
  if (state === undefined) {
    const id = chosen(root);
    const seen = boardEnemies(id);
    const primary = seen.find((s) => s.id === id);
    if (!primary) {
      built.set(el, null);
      return;
    }
    const rows = String(el.dataset.rows ?? "all");
    const px = primary.rect.left + primary.rect.width / 2;
    const clones: Clone[] = [];
    for (const s of seen) {
      if (s === primary) continue;
      const dx = s.rect.left + s.rect.width / 2 - px;
      const dy = s.rect.bottom - primary.rect.bottom;
      if (rows === "behind" && dy >= 0) continue;
      if (rows === "before" && dy < 0) continue;
      const art = s.rig.querySelector("svg");
      if (!art) continue;
      const node = document.createElement("div");
      node.className = "hm-clone";
      const copy = art.cloneNode(true) as SVGElement;
      copy.removeAttribute("class");
      copy.classList.add("hm-clone-art");
      node.appendChild(copy);
      box.appendChild(node);
      clones.push({ node, dx, dy, w: s.rect.width, h: s.rect.height });
    }
    // Marked from the far end of the line towards the target, which is last.
    const all = seen.filter((s) => s !== primary).sort((a, b) => b.rect.left - a.rect.left);
    state = {
      clones,
      base: primary.rect.height,
      order: clones.map((c) => all.findIndex((s) => Math.abs(s.rect.left + s.rect.width / 2 - px - c.dx) < 0.5)),
    };
    built.set(el, state);
    (root as HTMLElement & { hmCount?: number }).hmCount = all.length + 1;
  }
  if (!state) return;
  const t = ctx.actor("targets-0");
  if (!t) return;
  // One board pixel, in world units at the target's size in this shot.
  const k = t.h / 0.84 / state.base;
  const span = Number(el.dataset.span ?? 420);
  const depth = Number(el.dataset.depth ?? 0.45);
  const widest = Math.max(1, ...state.clones.map((c) => Math.abs(c.dx * k)));
  const squeeze = Math.min(1, span / widest);
  const count = state.clones.length + 1;
  const placed: Placed[] = [];
  state.clones.forEach((c, i) => {
    const w = c.w * k;
    const h = c.h * k;
    const x = t.x + c.dx * k * squeeze;
    const y = t.y + c.dy * k * depth;
    const order = state!.order[i];
    // A flinch as its sign lands.
    const since = p - markAt(order, count);
    const jolt = since > 0 && since < 0.12 ? Math.sin((since / 0.12) * Math.PI) : 0;
    const move = `translate3d(${(x - w / 2 + jolt * 5).toFixed(1)}px, ${(y - h * 0.97).toFixed(1)}px, 0) scale(${(1 - jolt * 0.04).toFixed(3)}, ${(1 + jolt * 0.03).toFixed(3)})`;
    if (c.node.style.transform !== move) c.node.style.transform = move;
    if (c.node.style.width !== `${w.toFixed(1)}px`) {
      c.node.style.width = `${w.toFixed(1)}px`;
      c.node.style.height = `${h.toFixed(1)}px`;
      // Further into the fog, paler.
      c.node.style.opacity = String(Math.max(0.5, 1 - Math.abs(c.dy * k) / 700).toFixed(2));
    }
    placed.push({ x, y, h: h * 0.84, order });
  });
  const prior = LINE.get(root) ?? [];
  // Two lineup cues (behind and before the target) share one list.
  LINE.set(root, [...prior.filter((q) => !placed.some((n) => n.order === q.order)), ...placed]);
};

/** The hundred possibilities, and the signs they leave. */
const lines: Frame = (el, p, _age, ctx) => {
  const svg = el.querySelector<SVGSVGElement>(".hm-lines");
  const root = rootOf(el);
  const caster = ctx.actor("caster");
  if (!svg || !root) return;
  const ox = Number(el.dataset.ox ?? 0.4);
  const oy = Number(el.dataset.oy ?? 0.6);
  // From the arrow in the Ranger's hands, or from a fixed point in a shot
  // the Ranger is not in.
  const O = el.dataset.fx
    ? ([Number(el.dataset.fx), Number(el.dataset.fy)] as const)
    : caster
      ? ([caster.x + ox * caster.h, caster.y - oy * caster.h] as const)
      : null;
  if (!O) return;
  const target = ctx.actor("targets-0");
  const others = LINE.get(root) ?? [];
  const count = (root as HTMLElement & { hmCount?: number }).hmCount ?? others.length + 1;
  const chest = (a: { x: number; y: number; h: number }) => [a.x, a.y - a.h * 0.56] as const;
  const aims: { at: readonly [number, number]; order: number; h: number }[] = others.map((o) => ({
    at: chest(o),
    order: o.order,
    h: o.h,
  }));
  if (target) aims.push({ at: chest(target), order: count - 1, h: target.h });
  const angle = Number(el.dataset.angle ?? 0);
  const trueEnd = target
    ? chest(target)
    : ([O[0] + Math.cos((angle * Math.PI) / 180) * 2400, O[1] + Math.sin((angle * Math.PI) / 180) * 2400] as const);
  const rand = seeded(Number(el.dataset.seed ?? 100));
  const rays = svg.querySelectorAll<SVGPathElement>(".hm-ray:not(.hm-true)");
  const base = Math.atan2(trueEnd[1] - O[1], trueEnd[0] - O[0]);
  rays.forEach((ray, i) => {
    let end: readonly [number, number];
    const r1 = rand();
    const r2 = rand();
    const r3 = rand();
    if (aims.length && i < aims.length * 7) {
      // Seven of the possibilities would have hit each enemy, somewhere.
      const a = aims[i % aims.length];
      const hit = [a.at[0] + (r1 - 0.5) * a.h * 0.5, a.at[1] + (r2 - 0.5) * a.h * 0.7] as const;
      const len = Math.hypot(hit[0] - O[0], hit[1] - O[1]);
      const k = (len + 200 + r3 * 900) / len;
      end = [O[0] + (hit[0] - O[0]) * k, O[1] + (hit[1] - O[1]) * k];
    } else {
      const spread = Number(el.dataset.spread ?? 34);
      const a = base + ((r1 - 0.5) * 2 * spread * Math.PI) / 180;
      const len = 900 + r2 * 1600;
      end = [O[0] + Math.cos(a) * len, O[1] + Math.sin(a) * len];
    }
    setD(ray, `M${O[0].toFixed(1)} ${O[1].toFixed(1)} L${end[0].toFixed(1)} ${end[1].toFixed(1)}`);
  });
  setD(svg.querySelector(".hm-true"), `M${O[0].toFixed(1)} ${O[1].toFixed(1)} L${trueEnd[0].toFixed(1)} ${trueEnd[1].toFixed(1)}`);
  // A sign on every enemy, as the lines find it.
  const slots = svg.querySelectorAll<SVGGElement>(".hm-slot");
  slots.forEach((slot, i) => {
    const a = aims[i];
    // Only the marking itself signs anyone; the other modes are lines alone.
    if (!a || el.dataset.let !== undefined || el.dataset.one !== undefined || el.dataset.ghost !== undefined) {
      if (slot.style.display !== "none") slot.style.display = "none";
      return;
    }
    if (slot.style.display) slot.style.display = "";
    const s = Math.max(0.35, (a.h * 0.46) / 120);
    const primary = a.order === count - 1;
    slot.setAttribute("transform", `translate(${a.at[0].toFixed(1)} ${a.at[1].toFixed(1)}) scale(${(s * (primary ? 1.18 : 1)).toFixed(3)})`);
    const k = Math.max(0, Math.min(1, (p - markAt(a.order, count)) / 0.1));
    slot.style.setProperty("--k", k.toFixed(3));
    slot.toggleAttribute("data-primary", primary);
  });
};

const sign: Frame = (el, p) => {
  const box = el.querySelector<HTMLElement>(".hm-sign-box");
  if (box) box.style.setProperty("--k", Math.min(1, p / 0.35).toFixed(3));
};

/** The real arrow, taken from the Ranger's hand the first time it is drawn. */
function adoptArrow(el: HTMLElement) {
  const own = el.querySelector<SVGGElement>(".hm-arrow-own");
  if (!own || own.dataset.adopted) return;
  own.dataset.adopted = "1";
  const held = rootOf(el)?.querySelector('.cine-actor[data-role="caster"] [data-part="arrow"] > g');
  if (!held) return;
  const copy = held.cloneNode(true) as SVGGElement;
  copy.removeAttribute("transform");
  own.replaceChildren(...copy.childNodes);
}

const arrow: Frame = (el, p, _age, ctx) => {
  adoptArrow(el);
  const box = el.querySelector<HTMLElement>(".hm-arrow");
  if (!box) return;
  if (box.dataset.stuck !== undefined) {
    // Buried: it shivers, less and less.
    const wob = Math.sin(p * 46) * (1 - p) * 4;
    box.style.setProperty("--wob", `${wob.toFixed(2)}deg`);
    return;
  }
  let x1 = Number(el.dataset.x1 ?? 0);
  let y1 = Number(el.dataset.y1 ?? 0);
  let x2 = Number(el.dataset.x2 ?? 1000);
  let y2 = Number(el.dataset.y2 ?? 0);
  // Aimed: level with the target's sign, however big the target is.
  const t = el.dataset.aim !== undefined ? ctx.actor("targets-0") : undefined;
  if (t) {
    y1 = y2 = t.y - t.h * 0.56;
    x2 = t.x - t.h * Number(el.dataset.short ?? 0);
  }
  const k = ease((el.dataset.ease as "in") ?? "in", p);
  const x = x1 + (x2 - x1) * k;
  const y = y1 + (y2 - y1) * k;
  el.style.left = `${x.toFixed(1)}px`;
  el.style.top = `${y.toFixed(1)}px`;
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  box.style.setProperty("--angle", `${angle.toFixed(2)}deg`);
  box.style.setProperty("--run", `${Math.hypot(x - x1, y - y1).toFixed(1)}px`);
};

const fog: Frame = (el, p, age) => {
  const w = 1600;
  const wipe = !!el.querySelector("[data-wipe]");
  for (const strip of wipe ? [] : el.querySelectorAll<HTMLElement>(".hm-fog > i")) {
    const speed = Number(strip.dataset.speed);
    const offset = Number(strip.dataset.offset);
    const x = ((offset + (age / 1000) * speed) % 1.6) - 0.6;
    strip.style.setProperty("--x", `${(x * w).toFixed(1)}px`);
  }
  el.style.setProperty("--pp", p.toFixed(3));
};

/** The reticle closes on wherever the target's sign really is on screen. */
const reticle: Frame = (el) => {
  const box = el.querySelector<HTMLElement>(".hm-reticle");
  const root = rootOf(el);
  const sign = root?.querySelector<HTMLElement>(".fx-hundredth-sign-wrap .hm-sign");
  if (!box || !root || !sign) return;
  const r = sign.getBoundingClientRect();
  const o = root.getBoundingClientRect();
  if (!r.width || !o.width) return;
  box.style.setProperty("--px", `${(((r.left + r.width / 2 - o.left) / o.width) * 100).toFixed(2)}%`);
  box.style.setProperty("--py", `${(((r.top + r.height / 2 - o.top) / o.height) * 100).toFixed(2)}%`);
};

const board: Frame = (el, p, age) => {
  const box = el.querySelector<HTMLElement>(".hm-board");
  const root = rootOf(el);
  if (!box || !root) return;
  const mode = box.dataset.mode;
  const primary = el.dataset.anchor;
  if (!box.dataset.built) {
    box.dataset.built = "1";
    boardEnemies(primary)
      .sort((a, b) => b.rect.left - a.rect.left)
      .forEach((s, i) => {
        const node = document.createElement("div");
        node.className = "hm-board-sign";
        node.dataset.unit = s.id;
        if (s.id === primary) node.dataset.primary = "";
        node.style.setProperty("--i", String(i));
        node.innerHTML = SIGN_HTML + (s.id === primary ? '<i class="hm-board-shards"><b></b><b></b><b></b><b></b></i>' : "");
        box.appendChild(node);
      });
  }
  // The board does not move under a film; measure it now and then, not
  // every frame, so the frame never forces a layout for it.
  const measure = Number(box.dataset.measured ?? -1e9);
  const remeasure = age - measure > 200 || age < measure;
  if (remeasure) box.dataset.measured = String(age);
  const origin = remeasure ? root.getBoundingClientRect() : null;
  const left = parseFloat(el.style.left) || 0;
  const top = parseFloat(el.style.top) || 0;
  const signs = box.querySelectorAll<HTMLElement>(".hm-board-sign");
  signs.forEach((node) => {
    if (origin) {
      const body = document.querySelector<HTMLElement>(`.stage [data-unit="${CSS.escape(node.dataset.unit ?? "")}"] .combatant-body`);
      const r = body?.getBoundingClientRect();
      if (r) {
        const x = r.left + r.width / 2 - origin.left - left;
        const y = r.top + r.height * 0.42 - origin.top - top;
        node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        node.style.setProperty("--u", `${Math.max(34, r.height * 0.5).toFixed(1)}px`);
      }
    }
    const i = Number(node.style.getPropertyValue("--i"));
    const n = signs.length;
    const k =
      mode === "spot"
        ? Math.max(0, Math.min(1, (p - (0.15 + (0.5 * i) / Math.max(1, n))) / 0.2))
        : Math.max(0, Math.min(1, (p - 0.04 * i) / 0.25));
    node.style.setProperty("--k", k.toFixed(3));
  });
  box.style.setProperty("--flick", String(Math.floor(age / 50) % 2));
};

/* ── Registered ────────────────────────────────────────────────────────── */

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "hundredth-lineup": Lineup,
  "hundredth-lines": Lines,
  "hundredth-sign": Sign,
  "hundredth-arrow": Arrow,
  "hundredth-fog": Fog,
  "hundredth-reticle": Reticle,
  "hundredth-board": Board,
  "hundredth-tag": () => null,
};

/**
 * Frame functions read their cue's parameters from `data-` attributes the
 * renderer leaves on the effect's first child; this copies them onto the
 * wrapper the engine hands the frame, once.
 */
const withParams =
  (frame: Frame): Frame =>
  (el, p, age, ctx) => {
    if (!el.dataset.hmParams) {
      el.dataset.hmParams = "1";
      const src = el.querySelector<HTMLElement>("[data-hm]");
      if (src) for (const [k, x] of Object.entries(src.dataset)) if (k !== "hm") el.dataset[k] = x;
    }
    frame(el, p, age, ctx);
  };

export const frames: Record<string, Frame> = {
  "hundredth-lineup": withParams(lineup),
  "hundredth-lines": withParams(lines),
  "hundredth-sign": sign,
  "hundredth-arrow": withParams(arrow),
  "hundredth-fog": fog,
  "hundredth-reticle": reticle,
  "hundredth-board": board,
};
