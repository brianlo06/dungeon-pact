import type { CSSProperties, ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import "./style.css";

/**
 * The Open Mind: the effects only this film has.
 *
 *   mind-disc   a mind: a small round labyrinth over a figure's head, its
 *               walls in violet ink, the plan coiled amber at its centre; in
 *               the target's, doubt's dotted path winding the long way in;
 *               holed, after
 *   mind-maze   the same labyrinth at the size of a room: `bore`, the needle
 *               drawn straight through every wall; `heart`, the coil winding
 *               tighter with the needle's point a hair away
 *   mind-hole   a mind punched through: the hole, the rings flung out, the
 *               coil snapped; `echo` for the minds the thought passes on to
 *   mind-spike  the thought itself, from the Mindflayer's eye through the
 *               target's mind and on, placed from where both really stand
 *   mind-sight  the gaze arriving from off the left of frame, finding a mind
 *   mind-iris   the picture closing onto the target's mind, and opening
 *               again inside it
 *   mind-pin    the green eye's light gathering to a point
 *   mind-crack  the mask's own crack lit green along its length
 *
 * One seed, one labyrinth: the disc over the target in the wide shot, the
 * room-sized maze the needle bores through and the hole it leaves are the
 * same drawing. Everything moves on the stage's variables (`--p`, `--pe`,
 * `--pi`, `--pb`, `--f`) or in a frame function; nothing is random at
 * runtime, and nothing uses a filter.
 */

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

/** The walls' radii, centre outward; the outermost is the disc's edge. */
const RINGS = [22, 35, 48, 61, 74, 87, 100];
/** Where the needle comes in from: straight from the left, along −x. */
const NEEDLE = Math.PI;

const f1 = (n: number) => n.toFixed(1);
const polar = (r: number, a: number) => [r * Math.cos(a), r * Math.sin(a)] as const;
const norm = (a: number) => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

/** An arc of radius r from angle a to b, increasing. */
function arc(r: number, a: number, b: number) {
  const [x1, y1] = polar(r, a);
  const [x2, y2] = polar(r, b);
  return `M${f1(x1)} ${f1(y1)} A${r} ${r} 0 ${b - a > Math.PI ? 1 : 0} 1 ${f1(x2)} ${f1(y2)}`;
}

interface Maze {
  /** Every wall, one path per ring (its spokes included), centre outward. */
  rings: string[];
  /** Doubt's way in: points along it, with how far along each is (0…1). */
  doubt: { x: number; y: number; k: number }[];
  /** The plan: a tight spiral, three turns. */
  coil: string;
}

const mazes = new Map<number, Maze>();

/**
 * A labyrinth from a seed. Each ring has one door; consecutive doors are far
 * apart, and short radial walls block the short way between them, so the
 * only way in is the long way round every ring. No door faces the needle.
 */
function maze(seed: number): Maze {
  const hit = mazes.get(seed);
  if (hit) return hit;
  const rand = seeded(seed);
  const doors: number[] = [];
  for (let i = RINGS.length - 1; i >= 0; i--) {
    let a = 0;
    for (let tries = 0; tries < 40; tries++) {
      a = rand() * Math.PI * 2;
      const facing = Math.abs(norm(a - NEEDLE + Math.PI) - Math.PI) < 0.55;
      const prev = doors[0];
      const apart = prev === undefined || Math.abs(norm(a - prev + Math.PI) - Math.PI) > 1.3;
      if (!facing && apart) break;
    }
    doors.unshift(a);
  }
  const rings = RINGS.map((r, i) => {
    const w = 12 / r;
    let d = arc(r, doors[i] + w / 2, doors[i] + Math.PI * 2 - w / 2);
    // The corridor inside this ring (between it and the next ring in): a wall
    // or two across the short way from this door to the next one in.
    if (i > 0) {
      const inner = RINGS[i - 1];
      let delta = norm(doors[i - 1] - doors[i] + Math.PI) - Math.PI;
      const span = Math.abs(delta);
      const count = span > 1.6 ? 2 : 1;
      for (let s = 0; s < count; s++) {
        const a = doors[i] + delta * ((s + 1) / (count + 1));
        if (Math.abs(norm(a - NEEDLE + Math.PI) - Math.PI) < 0.2) continue;
        const [x1, y1] = polar(inner, a);
        const [x2, y2] = polar(r, a);
        d += ` M${f1(x1)} ${f1(y1)} L${f1(x2)} ${f1(y2)}`;
      }
      delta = 0;
    }
    return d;
  });
  // Doubt: in through each door, and the long way round to the next.
  const pts: [number, number][] = [];
  const outer = RINGS.length - 1;
  const push = (r: number, a: number) => pts.push([r * Math.cos(a), r * Math.sin(a)]);
  push(RINGS[outer] + 12, doors[outer]);
  for (let i = outer; i >= 0; i--) {
    const mid = i > 0 ? (RINGS[i] + RINGS[i - 1]) / 2 : 12;
    push(mid, doors[i]);
    if (i === 0) break;
    const short = norm(doors[i - 1] - doors[i] + Math.PI) - Math.PI;
    const long = short - Math.sign(short || 1) * Math.PI * 2;
    const steps = Math.ceil((Math.abs(long) * mid) / 5);
    for (let s = 1; s <= steps; s++) push(mid, doors[i] + (long * s) / steps);
  }
  // Even spacing along the way, so the dots walk at one pace.
  const doubt: Maze["doubt"] = [];
  let total = 0;
  const lens = pts.map((p, i) => (i ? (total += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1])) : 0));
  const every = 7.5;
  for (let at = 0, j = 1; at <= total && j < pts.length; at += every) {
    while (j < pts.length - 1 && lens[j] < at) j++;
    const k = (at - lens[j - 1]) / Math.max(0.001, lens[j] - lens[j - 1]);
    doubt.push({
      x: pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * k,
      y: pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * k,
      k: at / total,
    });
  }
  let coil = "";
  for (let t = 0; t <= Math.PI * 6; t += 0.28) {
    const r = 2 + t * 0.64;
    coil += `${coil ? "L" : "M"}${f1(r * Math.cos(t))} ${f1(r * Math.sin(t))} `;
  }
  const made = { rings, doubt, coil: coil.trim() };
  mazes.set(seed, made);
  return made;
}

/** The plan at a mind's centre: the coil and its warm light. */
function Coil({ coil }: { coil: string }) {
  return (
    <g className="mind-coil">
      {[21, 16, 11].map((r) => (
        <circle key={r} className="mind-coil-glow" r={r} />
      ))}
      <path className="mind-coil-ink" d={coil} />
      <path className="mind-coil-line" d={coil} />
    </g>
  );
}

/* ---------------------------------------------------------------- a mind -- */

/**
 * A mind over a figure's head. Params: `held` (already there when the shot
 * begins), `doubt` (the target's shows doubt's path winding in), `holed`
 * (after: a hole through the centre and no coil), `small` (on the board),
 * `skipFirst` (every mind but the target's).
 */
const Disc = ({ cue }: VfxProps) => {
  const m = maze(cue.seed ?? 11);
  const holed = !!cue.params?.holed;
  return (
    <div
      className="mind-disc"
      data-held={cue.params?.held ? "" : undefined}
      data-holed={holed || undefined}
      data-small={cue.params?.small ? "" : undefined}
      data-skip-first={cue.params?.skipFirst ? "" : undefined}
      style={v({ "--spin": `${Number(cue.params?.spin ?? 24)}deg`, "--turn0": `${((cue.seed ?? 11) * 47) % 360}deg` })}
    >
      <svg viewBox="-130 -130 260 260">
        <circle className="mind-disc-halo" r="124" />
        <circle className="mind-disc-back" r="108" />
        <g className="mind-disc-turn">
          {m.rings.map((d, i) => (
            <path key={`i${i}`} className="mind-wall-ink" d={d} />
          ))}
          {m.rings.map((d, i) => (
            <path key={`w${i}`} className="mind-wall" d={d} />
          ))}
          {cue.params?.doubt ? (
            <g className="mind-doubt">
              {m.doubt.map((p, i) => (
                <circle key={i} cx={f1(p.x)} cy={f1(p.y)} r="4.4" style={v({ "--k": p.k.toFixed(3) })} />
              ))}
            </g>
          ) : null}
        </g>
        {holed ? (
          <g className="mind-disc-hole">
            <circle className="mind-hole-rim" r="21" />
            <circle className="mind-hole-dark" r="17" />
          </g>
        ) : (
          <Coil coil={m.coil} />
        )}
      </svg>
    </div>
  );
};

/* ------------------------------------------------------- the labyrinth -- */

/**
 * The target's mind at the size of a room. Params: `mode` (`bore` or
 * `heart`), `radius` (world units to the outer wall), `from`/`to` (the
 * needle's head, in maze units along x, over the effect's life).
 */
const Labyrinth = ({ cue }: VfxProps) => {
  const m = maze(cue.seed ?? 11);
  const mode = String(cue.params?.mode ?? "bore");
  const radius = Number(cue.params?.radius ?? 1000);
  const from = Number(cue.params?.from ?? -128);
  const to = Number(cue.params?.to ?? -19);
  const rand = seeded((cue.seed ?? 11) + 5);
  // Where the needle meets each wall, and when, as a share of its travel.
  const punches = RINGS.map((r) => ({ x: -r, k: (-r - from) / (to - from) })).filter((p) => p.k > 0 && p.k <= 1);
  return (
    <div
      className="mind-maze"
      data-mode={mode}
      style={v({ "--size": `${(radius * 2.6).toFixed(0)}px`, "--from": from, "--to": to })}
    >
      <svg viewBox="-130 -130 260 260">
        <circle className="mind-maze-floor" r="128" />
        <g className="mind-maze-walls">
          {m.rings.map((d, i) => (
            <path key={`i${i}`} className="mind-wall-ink" d={d} />
          ))}
          {m.rings.map((d, i) => (
            <path key={`w${i}`} className="mind-wall" d={d} />
          ))}
        </g>
        {mode === "bore" ? (
          <g className="mind-doubt">
            {m.doubt.map((p, i) => (
              <circle key={i} cx={f1(p.x)} cy={f1(p.y)} r="1.5" style={v({ "--k": p.k.toFixed(3) })} />
            ))}
          </g>
        ) : null}
        <Coil coil={m.coil} />
        {punches.map((p, i) => (
          <g key={i} className="mind-punch" style={v({ "--k": p.k.toFixed(3) })} transform={`translate(${p.x} 0)`}>
            <ellipse className="mind-punch-hole" rx="3.2" ry="4.6" />
            {Array.from({ length: 5 }, (_, j) => {
              const a = -Math.PI * 0.5 + (rand() - 0.5) * Math.PI * 1.1 + (j % 2 ? Math.PI : 0);
              const d = 7 + rand() * 9;
              return (
                <path
                  key={j}
                  className="mind-chip"
                  d="M-2.8 -1.6 L3.2 -2 L1.2 2.8 Z"
                  style={v({ "--dx": `${f1(Math.cos(a) * d)}px`, "--dy": `${f1(Math.sin(a) * d)}px`, "--r": `${Math.round(rand() * 400)}deg` })}
                />
              );
            })}
          </g>
        ))}
        <g className="mind-needle">
          <line className="mind-needle-glow" x1="-240" y1="0" x2="0" y2="0" />
          <line className="mind-needle-core" x1="-240" y1="0" x2="0" y2="0" />
          <circle className="mind-needle-tip-glow" r="5" />
          <circle className="mind-needle-tip" r="1.5" />
        </g>
      </svg>
    </div>
  );
};

/* ------------------------------------------------------------- the hole -- */

/**
 * A mind punched through. Params: `echo` (a mind the thought passes on to),
 * `holeAt` (when in the effect's life it goes through; whole until then),
 * `angle` (the needle's, degrees).
 */
const Hole = ({ cue }: VfxProps) => {
  const m = maze(cue.seed ?? 11);
  const rand = seeded((cue.seed ?? 11) + 3);
  const echo = !!cue.params?.echo;
  return (
    <div className="mind-disc mind-hole" data-echo={echo || undefined} style={v({ "--h0": Number(cue.params?.holeAt ?? 0) })}>
      <svg viewBox="-130 -130 260 260">
        <circle className="mind-disc-halo" r="124" />
        <g className="mind-hole-needle" transform={`rotate(${Number(cue.params?.angle ?? 0)})`}>
          <line className="mind-needle-glow" x1="-230" y1="0" x2="230" y2="0" />
          <line className="mind-needle-core" x1="-230" y1="0" x2="230" y2="0" />
        </g>
        <circle className="mind-disc-back" r="108" />
        <g className="mind-disc-turn">
          {m.rings.map((d, i) => (
            <g key={i} className="mind-hole-ring" style={v({ "--i": i, "--spin": `${Math.round((rand() - 0.5) * 50)}deg` })}>
              <path className="mind-wall-ink" d={d} />
              <path className="mind-wall" d={d} />
            </g>
          ))}
        </g>
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2 + rand() * 0.6;
          const d = 40 + rand() * 70;
          return (
            <path
              key={i}
              className="mind-coil-bit"
              d={`M0 0 q${f1(4 + rand() * 4)} ${f1(-3 - rand() * 4)} ${f1(9 + rand() * 5)} 0`}
              style={v({ "--dx": `${f1(Math.cos(a) * d)}px`, "--dy": `${f1(Math.sin(a) * d)}px`, "--r": `${Math.round((rand() - 0.5) * 540)}deg` })}
            />
          );
        })}
        <Coil coil={m.coil} />
        <g className="mind-disc-hole">
          <circle className="mind-hole-rim" r="21" />
          <circle className="mind-hole-dark" r="17" />
        </g>
      </svg>
    </div>
  );
};

/* ----------------------------------------------------------- the gaze -- */

/** A line of light, placed each frame between two points in world units. */
const Beam = ({ cue }: VfxProps) => (
  <svg className="mind-beam" data-kind={cue.kind} viewBox="0 0 1600 900" width="1600" height="900">
    <line className="mind-beam-glow" />
    <line className="mind-beam-ink" />
    <line className="mind-beam-core" />
    <circle className="mind-beam-flare" r="26" />
  </svg>
);

/** The light of the thought going in, behind everyone: the drawn frame's pale field. */
const Glare = ({ color }: VfxProps) => (
  <div className="mind-glare" style={v({ "--c": color })}>
    <i />
  </div>
);

const Iris = ({ cue }: VfxProps) => (
  <div className="mind-iris" data-mode={String(cue.params?.mode ?? "close")}>
    <i />
  </div>
);

const Pin = ({ color }: VfxProps) => (
  <div className="mind-pin" style={v({ "--c": color })}>
    <i className="mind-pin-glow" />
    <i className="mind-pin-ring" style={v({ "--d": 0 })} />
    <i className="mind-pin-ring" style={v({ "--d": 0.16 })} />
    <i className="mind-pin-ring" style={v({ "--d": 0.32 })} />
    <i className="mind-pin-point" />
  </div>
);

/** The crack in the porcelain, in the mask's own shape, lit from behind. */
const Crack = () => (
  <svg className="mind-crack" viewBox="-10 -12 20 24">
    <path className="mind-crack-glow" d="M0.5 -9.5 L-2.5 -2.5 L2.5 1.5 L-1.5 9.5" />
    <path className="mind-crack-core" d="M0.5 -9.5 L-2.5 -2.5 L2.5 1.5 L-1.5 9.5" />
  </svg>
);

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "mind-disc": Disc,
  "mind-maze": Labyrinth,
  "mind-hole": Hole,
  "mind-spike": Beam,
  "mind-sight": Beam,
  "mind-iris": Iris,
  "mind-glare": Glare,
  "mind-pin": Pin,
  "mind-crack": Crack,
};

/** Where a figure's mind hangs: over its head, by its real height (see style.css). */
const MIND_Y = 1.22;

function setLine(line: Element | null, x1: number, y1: number, x2: number, y2: number) {
  if (!line) return;
  line.setAttribute("x1", f1(x1));
  line.setAttribute("y1", f1(y1));
  line.setAttribute("x2", f1(x2));
  line.setAttribute("y2", f1(y2));
}

/** A line from `a` to `b`, drawn on from `a` over `grow` of its life, carried on past `b` by `past`. */
function beam(el: HTMLElement, p: number, a: [number, number], b: [number, number], grow: number, past: number) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const k = Math.min(1, p / Math.max(0.001, grow));
  const reach = (len + past) * k;
  const end: [number, number] = [a[0] + (dx / len) * reach, a[1] + (dy / len) * reach];
  const svg = el.querySelector("svg");
  if (!svg) return;
  for (const l of svg.querySelectorAll("line")) setLine(l, a[0], a[1], end[0], end[1]);
  const flare = svg.querySelector(".mind-beam-flare");
  // The flare rides the head until it arrives, then sits where it went in.
  const at = k < 1 ? end : b;
  flare?.setAttribute("cx", f1(at[0]));
  flare?.setAttribute("cy", f1(at[1]));
}

/** A small stable number from a unit id, so identical minds on the board turn differently. */
const hash = (s: string) => [...s].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7);

export const frames: Record<string, Frame> = {
  "mind-spike": (el, p, _age, ctx) => {
    const caster = ctx.actor("caster");
    const target = ctx.actor("targets-0");
    if (!caster || !target) return;
    const eye: [number, number] = [caster.x + caster.h * 0.08, caster.y - caster.h * 0.71];
    const mind: [number, number] = [target.x, target.y - target.h * MIND_Y];
    beam(el, p, eye, mind, 0.05, 1600);
  },
  "mind-sight": (el, p, _age, ctx) => {
    const target = ctx.actor("targets-0");
    if (!target) return;
    const mind: [number, number] = [target.x, target.y - target.h * MIND_Y];
    const r = (target.h * 0.55 + 40) * 0.5 * 0.86;
    const from: [number, number] = [mind[0] - 1500, mind[1] + 260];
    const d = Math.hypot(mind[0] - from[0], mind[1] - from[1]);
    const rim: [number, number] = [mind[0] - ((mind[0] - from[0]) / d) * r, mind[1] - ((mind[1] - from[1]) / d) * r];
    beam(el, p, from, rim, 0.55, 0);
  },
  /** The iris closes on wherever the target's mind really is on screen. */
  "mind-iris": (el) => {
    const iris = el.querySelector<HTMLElement>(".mind-iris");
    const film = el.closest<HTMLElement>(".ult-cinematic");
    if (!iris || !film || iris.dataset.mode !== "close") return;
    const disc = film.querySelector('.fx-mind-disc-wrap[data-follow-index="0"] .mind-disc svg');
    if (!disc) return;
    const box = disc.getBoundingClientRect();
    const root = film.getBoundingClientRect();
    iris.style.setProperty("--cx", `${f1(box.left + box.width / 2 - root.left)}px`);
    iris.style.setProperty("--cy", `${f1(box.top + box.height / 2 - root.top)}px`);
    iris.style.setProperty("--r", `${f1(box.width * 0.42)}px`);
  },
  /** On the board every mind is the same drawing: turn each its own way, and ring the target's. */
  "mind-disc": (el) => {
    if (el.dataset.placed || !el.dataset.anchor) return;
    const disc = el.querySelector<HTMLElement>(".mind-disc");
    if (!disc) return;
    disc.style.setProperty("--turn0", `${hash(el.dataset.anchor) % 360}deg`);
    const first = el.parentElement?.querySelector(".fx-mind-disc-wrap.cine-anchored");
    if (first === el) disc.dataset.primary = "";
    el.dataset.placed = "1";
  },
};
