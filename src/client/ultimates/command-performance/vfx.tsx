import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import "./style.css";

/**
 * Command Performance: the effects only this film has.
 *
 *   perf-strings    the Puppeteer's strings, drawn every frame between the
 *                   real figures: from the control bar (measured off the
 *                   caster's drawing) or from the dark above the frame, to the
 *                   puppet's head and both hands. It also *works the puppet*:
 *                   the puppet's figure (and the rest of the line's) is moved
 *                   here, on its `.cine-look`, which nothing else moves, in
 *                   one of five acts: `cast` (the strings fly out and bite,
 *                   and it is jerked upright), `walk` (marionette steps into
 *                   its own line, the rest shying from it), `hoist` (held off
 *                   the boards), `swing` (swung like a weight on a line
 *                   through the rest, each struck as it arrives, with a sheaf
 *                   of string lines fanned along the arc) and `yank` (a body
 *                   too heavy to swing, pulled forward and down)
 *   perf-splinters  wood splinters and chips of paint off every body the swing
 *                   strikes, each burst where and when the strike landed; on
 *                   the board, off every enemy but the puppet
 *   perf-drop       strings from the top of the screen onto the real puppet on
 *                   the board: dropping onto it, or hanging slack and swaying
 *   perf-snip       the close-up's cut: a glint along the shard's edge and
 *                   three cut string ends springing up
 *   perf-rail       the bridge's rail and a post, in the foreground
 *   perf-lamp       the lamp's pool of light on the backcloth, above the
 *                   exposure, so a figure in front of it is a silhouette
 *   perf-curtain    the oxblood drop curtain with its gilt fringe: it falls
 *                   over the end of the swing and rises off the real board
 *                   (the film's wipe, straddling the cut)
 *
 * Why the figures are moved here: an actor cue places a whole row of targets
 * together, with one set of reactions and one facing, and the puppet must do
 * something none of the rest do. Each figure's `.cine-look` is put back when
 * the effect unmounts. Everything moves on the combat clock (`p`, `age`);
 * nothing is random at runtime and nothing uses a filter.
 */

type Pt = [number, number];
type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

const v = (vars: Record<string, string | number>) => vars as CSSProperties;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const easeOut = (k: number) => 1 - (1 - clamp(k)) ** 3;
const easeInOut = (k: number) => {
  const x = clamp(k);
  return x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;
};
const f1 = (n: number) => n.toFixed(1);
const DEG = 180 / Math.PI;

const setD = (el: Element | null | undefined, d: string) => {
  if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
};
const setStyle = (el: HTMLElement | SVGElement, name: string, value: string) => {
  if (el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
};

/* ── The cast, as the stage drew it ────────────────────────────────────── */

const rootOf = (el: Element) => el.closest<HTMLElement>(".ult-cinematic");

/** The targets' figures in slot order (the cast is drawn in that order). */
const targetFigures = (root: HTMLElement | null) =>
  root ? [...root.querySelectorAll<HTMLElement>('.cine-actor[data-role="targets"]')] : [];

const lookOf = (fig: HTMLElement) => fig.querySelector<HTMLElement>(".cine-look");

function resetLooks(root: HTMLElement | null) {
  for (const fig of targetFigures(root)) {
    const look = lookOf(fig);
    if (look) {
      look.style.transform = "";
      look.style.transformOrigin = "";
    }
    delete fig.dataset.perfHit;
    delete fig.dataset.perfHx;
    delete fig.dataset.perfHy;
  }
}

/**
 * A figure's own drawing box is 100×100 with its feet at (50, 97), scaled by
 * the stage and mirrored when it faces against its drawing. `Body` moves a
 * figure in world units and degrees by writing its `.cine-look`, and says
 * where any point of its drawing then is in the world.
 */
interface Body {
  x: number;
  y: number;
  h: number;
  /** World units per drawing unit, with the sign of the mirror. */
  sx: number;
  sy: number;
}

function body(at: { x: number; y: number; h: number }, mirrored: boolean): Body {
  const s = at.h / 84;
  return { x: at.x, y: at.y, h: at.h, sx: mirrored ? -s : s, sy: s };
}

/** Where a drawing point lands, once the look is moved by (dx, dy) world and rotated `rot`° about `origin`. */
function worldOf(b: Body, [px, py]: Pt, move: Move): Pt {
  const [ox, oy] = move.origin;
  // Rotation in the drawing's own space, which a mirror reverses.
  const r = (move.rot * Math.sign(b.sx)) / DEG;
  const qx = ox + (px - ox) * Math.cos(r) - (py - oy) * Math.sin(r);
  const qy = oy + (px - ox) * Math.sin(r) + (py - oy) * Math.cos(r);
  return [b.x + (qx - 50) * b.sx + move.dx, b.y + (qy - 97) * b.sy + move.dy];
}

interface Move {
  dx: number;
  dy: number;
  rot: number;
  origin: Pt;
  /** Turn the figure round to face the other way. */
  flip?: boolean;
}

const STILL: Move = { dx: 0, dy: 0, rot: 0, origin: [50, 97] };

function writeLook(fig: HTMLElement, b: Body, m: Move) {
  const look = lookOf(fig);
  if (!look) return;
  const lx = m.dx / b.sx;
  const ly = m.dy / b.sy;
  const r = m.rot * Math.sign(b.sx);
  setStyle(look, "transform-origin", `${f1(m.origin[0])}px ${f1(m.origin[1])}px`);
  setStyle(
    look,
    "transform",
    `translate(${lx.toFixed(2)}px, ${ly.toFixed(2)}px) rotate(${r.toFixed(2)}deg)${m.flip ? " scaleX(-1)" : ""}`,
  );
}

/** Where the strings bite on any figure: the crown of the head, and a hand either side. */
const HEAD: Pt = [50, 16];
const HANDS: [Pt, Pt] = [
  [28, 52],
  [72, 52],
];

/** The ends of the control's crossbar and its middle, in the world, off the caster's drawing. */
function barPoints(root: HTMLElement, svg: SVGSVGElement): [Pt, Pt, Pt] | null {
  const bar = root.querySelector<SVGGraphicsElement>('.cine-actor[data-role="caster"] [data-part="control"]');
  const actor = bar?.closest<HTMLElement>(".cine-actor");
  if (!bar || !actor || actor.style.display === "none") return null;
  const m = bar.getScreenCTM();
  const s = svg.getScreenCTM();
  if (!m || !s) return null;
  const inv = s.inverse();
  const at = (x: number, y: number): Pt => {
    const q = new DOMPoint(x, y).matrixTransform(m).matrixTransform(inv);
    return [q.x, q.y];
  };
  return [at(64, 38), at(74, 37.5), at(84, 37)];
}

/* ── perf-strings ──────────────────────────────────────────────────────── */

const SHEAF = 12;

const Strings = ({ cue }: VfxProps) => {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const root = ref.current ? rootOf(ref.current) : null;
    return () => resetLooks(root);
  }, []);
  const p = cue.params ?? {};
  const data: Record<string, string> = {};
  for (const [k, val] of Object.entries(p)) data[`data-${k}`] = String(val);
  return (
    <svg ref={ref} className="perf-sky perf-strings" viewBox="0 0 1600 900" aria-hidden="true" {...data} style={v({ "--sw": String(p.width ?? 3) })}>
      <g className="perf-sheaf">
        {Array.from({ length: SHEAF }, (_, i) => (
          <path key={i} className="perf-sheaf-line" />
        ))}
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i} className="perf-string">
          <path className="perf-string-glow" />
          <path className="perf-string-edge" />
          <path className="perf-string-core" />
          <circle className="perf-hook" r="0" />
        </g>
      ))}
    </svg>
  );
};

/** Numbers off the effect's data attributes, with defaults. */
const num = (d: DOMStringMap, key: string, fallback: number) => (d[key] !== undefined ? Number(d[key]) : fallback);

/** A string from a to b with a sag (world units, down), drawn `to` of the way from a. */
function stringPath(a: Pt, b: Pt, sag: number, to = 1, tremble = 0): string {
  const k = clamp(to);
  const bx = lerp(a[0], b[0], k);
  const by = lerp(a[1], b[1], k);
  const mx = (a[0] + bx) / 2 + tremble;
  const my = (a[1] + by) / 2 + sag * k;
  return `M${f1(a[0])} ${f1(a[1])} Q${f1(mx)} ${f1(my)} ${f1(bx)} ${f1(by)}`;
}

/** A damped spring settling from 0 to 1, t in ms. */
const settle = (t: number, tau = 150, period = 230) =>
  t <= 0 ? 0 : 1 - Math.exp(-t / tau) * Math.cos((2 * Math.PI * t) / period);

const stringsFrame: Frame = (el, p, age, ctx) => {
  const svg = el.querySelector<SVGSVGElement>(".perf-strings");
  const root = rootOf(el);
  if (!svg || !root) return;
  const d = svg.dataset;
  const mode = d.mode ?? "cast";
  const figs = targetFigures(root);
  const puppetAt = ctx.actor("targets-0");
  const strings = svg.querySelectorAll<SVGGElement>(".perf-string");
  const sheaf = svg.querySelectorAll<SVGPathElement>(".perf-sheaf-line");
  if (!puppetAt || !figs[0]) {
    strings.forEach((g) => g.querySelectorAll("path").forEach((path) => setD(path, "")));
    return;
  }
  // Enemies are drawn facing left; `face` is what the shot asked for.
  const mirrored = num(d, "face", -1) === 1;
  const puppet = body(puppetAt, mirrored);
  const others = figs
    .slice(1)
    .map((fig, i) => ({ fig, at: ctx.actor(`targets-${i + 1}`) }))
    .filter((o): o is { fig: HTMLElement; at: { x: number; y: number; h: number } } => !!o.at)
    .map((o) => ({ fig: o.fig, b: body(o.at, mirrored) }));
  // The shot's length, from the window and the age: cues are fractions of it.
  const [wa, wb] = (el.dataset.window ?? "0,1").split(",").map(Number);
  const len = p > 0.001 ? age / (p * (wb - wa)) : num(d, "len", 800);
  const u = wa + p * (wb - wa);
  const t = u * len;

  let move: Move = { ...STILL, origin: HEAD };
  const otherMoves: Move[] = others.map(() => ({ ...STILL }));
  let sag = num(d, "sag", 0.05) * puppet.h;
  let tremble = 0;
  let flyTo = 1;
  const sheafLines: { a: Pt; b: Pt; o: number }[] = [];

  if (mode === "cast") {
    // The strings fly out from the bar and bite at `hook`; the puppet is jerked upright.
    const hook = num(d, "hook", 0.34);
    const leave = num(d, "leave", 0.18);
    flyTo = easeOut((u - leave) / Math.max(0.01, hook - leave));
    const since = t - hook * len;
    const up = settle(since, 160, 240);
    move = {
      dx: 0,
      dy: -puppet.h * (0.05 * up + (since > 0 ? 0.03 * Math.exp(-since / 90) : 0)),
      rot: since > 0 ? 7 * Math.exp(-since / 220) * Math.sin((2 * Math.PI * since) / 300) : 0,
      origin: HEAD,
    };
    sag = lerp(0.3, 0.04, clamp(since / 80)) * puppet.h;
  } else if (mode === "walk") {
    // Marionette steps: lifted, carried forward, set down, knees going.
    const steps = num(d, "steps", 3);
    const dir = others[0] ? Math.sign(others[0].b.x - puppet.x) || 1 : num(d, "dir", 1);
    const dist = num(d, "walk", 0.7) * puppet.h;
    const s = clamp(u) * steps;
    const k = Math.min(steps - 1, Math.floor(s));
    const fr = s - k;
    const forward = ((k + easeInOut(fr)) / steps) * dist;
    const lift = Math.sin(Math.PI * clamp(fr)) * 0.08 * puppet.h;
    move = {
      dx: dir * forward,
      dy: -lift - 0.03 * puppet.h,
      rot: dir * (4 + (k % 2 ? 1 : -1) * 9 * Math.sin(Math.PI * clamp(fr))),
      origin: HEAD,
    };
    const px = puppet.x + move.dx;
    others.forEach((o, i) => {
      const gap = Math.abs(o.b.x - px);
      const near = clamp(1 - (gap - 0.45 * o.b.h) / (0.7 * o.b.h));
      const away = Math.sign(o.b.x - px) || 1;
      otherMoves[i] = {
        dx: away * 0.14 * o.b.h * easeOut(near),
        dy: 0,
        rot: away * 7 * easeOut(near),
        origin: [50, 97],
        flip: d.flip === "true",
      };
    });
    sag = 0.02 * puppet.h;
  } else if (mode === "hoist") {
    // Held off the boards. Nothing moves but one string.
    move = { dx: 0, dy: -num(d, "lift", 0.22) * puppet.h, rot: num(d, "tilt", -3), origin: HEAD };
    tremble = Math.sin(age / 26) * 0.012 * puppet.h * (0.6 + 0.4 * Math.sin(age / 190));
    sag = 0;
  } else if (mode === "swing" || mode === "yank") {
    const pivot: Pt = [num(d, "px", 500), num(d, "py", -900)];
    const contact = num(d, "contact", 0.04);
    const head0 = worldOf(puppet, HEAD, STILL);
    const L = Math.hypot(head0[0] - pivot[0], head0[1] - pivot[1]);
    const thPlaced = Math.atan2(head0[0] - pivot[0], head0[1] - pivot[1]);
    // On the drawn frame it is already into the first of the rest: the cut hid the fall.
    const first = mode === "swing" ? others[0]?.b : undefined;
    const thC = first
      ? Math.asin(clamp((first.x - num(d, "into", 0.42) * first.h - pivot[0]) / L, -0.99, 0.99))
      : thPlaced;
    const span = num(d, "span", 0.42);
    if (mode === "swing" && others.length) {
      // Far enough to go through the last of them, then back a little, hanging.
      const last = others[others.length - 1].b;
      // Never past `reach`: in a long line the far end is struck by the line itself going over.
      const reachX = Math.min(last.x + 0.25 * last.h, num(d, "reach", 1240)) - pivot[0];
      const thEnd = Math.asin(clamp(reachX / L, -0.99, 0.99));
      const go = num(d, "go", 0.46);
      const k = (u - contact) / (go - contact);
      let th: number;
      if (u < contact) th = lerp(thPlaced - span * 0.3, thC, u / contact);
      else if (k <= 1) th = lerp(thC, thEnd, easeOut(k));
      else {
        const since = (u - go) * len;
        th = lerp(thEnd, lerp(thC, thEnd, 0.72), settle(since, 180, 420));
      }
      const hx = pivot[0] + L * Math.sin(th);
      const hy = pivot[1] + L * Math.cos(th);
      const vel = k > 0 && k <= 1 ? 1 - k : 0;
      move = {
        dx: hx - head0[0],
        dy: hy - head0[1],
        rot: -(th - thPlaced) * DEG - 16 * vel,
        origin: HEAD,
      };
      // Each of the rest is struck as the swing arrives at it.
      const front = hx + 0.3 * puppet.h;
      others.forEach((o, i) => {
        const fig = o.fig;
        const edge = o.b.x - 0.22 * o.b.h;
        if (!fig.dataset.perfHit && (front >= edge || u >= go)) {
          fig.dataset.perfHit = String(Math.round(Math.max(t, contact * len)));
          fig.dataset.perfHx = f1(edge);
          fig.dataset.perfHy = f1(o.b.y - 0.55 * o.b.h);
        }
        const hit = fig.dataset.perfHit ? t - Number(fig.dataset.perfHit) : -1;
        const k2 = hit < 0 ? 0 : easeOut(hit / 260);
        otherMoves[i] = {
          dx: 0.34 * o.b.h * k2,
          dy: -0.04 * o.b.h * Math.sin(Math.PI * clamp(hit / 260)),
          rot: 14 * k2 - 4 * clamp((hit - 260) / 400),
          origin: [50, 97],
        };
      });
      // The arc it came along: a sheaf of string lines, fading behind it.
      for (let i = 0; i < SHEAF; i++) {
        const q = i / (SHEAF - 1);
        const a = lerp(thC - span, th, q);
        const fade = clamp(1 - (u - contact) / 0.4);
        sheafLines.push({
          a: pivot,
          b: [pivot[0] + L * Math.sin(a), pivot[1] + L * Math.cos(a)],
          o: fade * q * q * 0.9,
        });
      }
    } else {
      // Too heavy to swing (or nothing beside it): hauled forward and down.
      const dir = num(d, "dir", 1);
      const k = u < contact ? -1 + u / contact : easeOut((u - contact) / 0.12);
      const hold = u < contact ? 0 : k;
      move = {
        dx: dir * 0.1 * puppet.h * hold - (u < contact ? dir * 0.04 * puppet.h : 0),
        dy: 0.03 * puppet.h * hold,
        rot: dir * (hold * 16 - (u < contact ? 6 : 0)) - dir * 5 * clamp((u - 0.3) / 0.5) * hold,
        origin: [50, 97],
      };
      others.forEach((o, i) => {
        const fig = o.fig;
        if (!fig.dataset.perfHit && u >= contact) {
          fig.dataset.perfHit = String(Math.round(contact * len + (i + 1) * 70));
          fig.dataset.perfHx = f1(o.b.x);
          fig.dataset.perfHy = f1(o.b.y - 0.55 * o.b.h);
        }
        const hit = fig.dataset.perfHit ? t - Number(fig.dataset.perfHit) : -1;
        const k2 = hit < 0 ? 0 : easeOut(hit / 260);
        otherMoves[i] = { dx: 0.22 * o.b.h * k2, dy: 0, rot: 10 * k2, origin: [50, 97] };
      });
      for (let i = 0; i < SHEAF; i++) {
        const q = i / (SHEAF - 1);
        const a = thC - span * (1 - q);
        const fade = clamp(1 - (u - contact) / 0.35);
        sheafLines.push({
          a: pivot,
          b: [pivot[0] + L * Math.sin(a), pivot[1] + L * Math.cos(a)],
          o: fade * q * q * 0.8,
        });
      }
    }
    sag = 0;
    // The puppet's own burst lands on the drawn frame, where it meets whatever it was swung into.
    const pf = figs[0];
    if (!pf.dataset.perfHit && u >= contact) {
      const [hx, hy] = worldOf(puppet, [50, 55], move);
      pf.dataset.perfHit = String(Math.round(contact * len));
      pf.dataset.perfHx = f1(hx + (mode === "swing" && others.length ? 0.28 * puppet.h : 0));
      pf.dataset.perfHy = f1(mode === "swing" && others.length ? hy : puppet.y - 0.04 * puppet.h);
    }
  }

  writeLook(figs[0], puppet, move);
  // The puppet is drawn over the line it is worked into (the stage paints the line in slot order).
  if (figs[0].style.zIndex !== "39") figs[0].style.zIndex = "39";
  others.forEach((o, i) => writeLook(o.fig, o.b, otherMoves[i]));

  // Where the strings come from: the bar, if the caster is in the shot and asked for; else the dark above.
  const bar = d.from === "bar" ? barPoints(root, svg) : null;
  const above: Pt = [num(d, "fx", puppet.x - 200), num(d, "fy", -200)];
  const spread = num(d, "fs", 60);
  const sources: [Pt, Pt, Pt] = bar ?? [
    [above[0] - spread, above[1]],
    [above[0], above[1]],
    [above[0] + spread, above[1]],
  ];
  const ends: [Pt, Pt, Pt] = [worldOf(puppet, HANDS[0], move), worldOf(puppet, HEAD, move), worldOf(puppet, HANDS[1], move)];
  if (mirrored) [ends[0], ends[2]] = [ends[2], ends[0]];
  strings.forEach((g, i) => {
    const a = sources[i];
    const b = ends[i];
    // While flying the string arcs up over its line, like a cast line.
    const arc = mode === "cast" && flyTo < 1 ? -Math.sin(Math.PI * flyTo) * 0.3 * Math.hypot(b[0] - a[0], b[1] - a[1]) : 0;
    const path = stringPath(a, b, sag + arc, flyTo, i === 1 ? tremble : 0);
    g.querySelectorAll("path").forEach((node) => setD(node, path));
    const hook = g.querySelector("circle");
    if (hook) {
      const on = flyTo >= 1;
      hook.setAttribute("cx", f1(b[0]));
      hook.setAttribute("cy", f1(b[1]));
      hook.setAttribute("r", on ? f1(Math.max(2.5, puppet.h * 0.012)) : "0");
    }
  });
  sheaf.forEach((line, i) => {
    const s = sheafLines[i];
    setD(line, s ? `M${f1(s.a[0])} ${f1(s.a[1])} L${f1(s.b[0])} ${f1(s.b[1])}` : "");
    if (s) setStyle(line, "opacity", s.o.toFixed(3));
  });
};

/* ── perf-splinters ────────────────────────────────────────────────────── */

const WOOD = ["#e2bf86", "#c99a5c", "#8a5f36", "#f3dcb0"];
const CHIPS = ["#ff5aa5", "#1a100b", "#58706c", "#fff1d6"];
const BURSTS = 4;

/** A burst of splinters and chips. Params: `count`, `size` (world px), `anchored`. */
const Splinters = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 13);
  const count = Number(cue.params?.count ?? 16);
  const bursts = cue.params?.anchored ? 1 : BURSTS;
  return (
    <div className="perf-splinters" style={v({ "--u": `${Number(cue.params?.size ?? 260)}px` })}>
      {Array.from({ length: bursts }, (_, b) => (
        <div key={b} className="perf-burst" data-burst={b}>
          <b className="perf-burst-flash" />
          {Array.from({ length: count }, (_, i) => {
            const a = rand() * Math.PI * 2;
            const r = 0.35 + rand() * 0.75;
            const chip = i % 3 === 2;
            return (
              <i
                key={i}
                data-chip={chip || undefined}
                style={v({
                  "--dx": (Math.cos(a) * r).toFixed(3),
                  "--dy": (Math.sin(a) * r * 0.8 - 0.25).toFixed(3),
                  "--spin": `${Math.round((rand() - 0.5) * 900)}deg`,
                  "--r0": `${Math.round(rand() * 180)}deg`,
                  "--w": (chip ? 0.045 + rand() * 0.03 : 0.02 + rand() * 0.012).toFixed(3),
                  "--l": (chip ? 0.05 + rand() * 0.03 : 0.1 + rand() * 0.12).toFixed(3),
                  "--c": chip ? CHIPS[Math.floor(rand() * CHIPS.length)] : WOOD[Math.floor(rand() * WOOD.length)],
                })}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

const splintersFrame: Frame = (el, p, age) => {
  const box = el.querySelector<HTMLElement>(".perf-splinters");
  if (!box) return;
  if (el.dataset.anchor) {
    // On the board: every enemy but the puppet, which is on its strings instead.
    if (!el.dataset.placed) {
      const first = el.parentElement?.querySelector(".fx-perf-splinters-wrap.cine-anchored");
      if (first === el) el.style.display = "none";
      el.dataset.placed = "1";
    }
    const burst = box.querySelector<HTMLElement>(".perf-burst");
    if (burst) {
      setStyle(burst, "--q", clamp(p / 0.8).toFixed(3));
      setStyle(burst, "left", "0px");
      setStyle(burst, "top", "calc(var(--ah, 100px) * -0.5)");
    }
    return;
  }
  const root = rootOf(el);
  const [wa, wb] = (el.dataset.window ?? "0,1").split(",").map(Number);
  const len = p > 0.001 ? age / (p * (wb - wa)) : 800;
  const t = (wa + p * (wb - wa)) * len;
  const figs = targetFigures(root).filter((f) => f.style.display !== "none");
  box.querySelectorAll<HTMLElement>(".perf-burst").forEach((burst, i) => {
    const fig = figs[i];
    const hit = fig?.dataset.perfHit;
    if (!fig || hit === undefined) {
      setStyle(burst, "--q", "0");
      setStyle(burst, "visibility", "hidden");
      return;
    }
    setStyle(burst, "visibility", "visible");
    setStyle(burst, "left", `${fig.dataset.perfHx}px`);
    setStyle(burst, "top", `${fig.dataset.perfHy}px`);
    setStyle(burst, "--q", clamp((t - Number(hit)) / 520).toFixed(3));
  });
};

/* ── perf-drop ─────────────────────────────────────────────────────────── */

/** Strings from the top of the screen onto a unit on the board. Params: `mode` (`drop` | `hang`). */
const Drop = ({ cue }: VfxProps) => (
  <div className="perf-drop" data-mode={String(cue.params?.mode ?? "drop")}>
    {[0, 1, 2].map((i) => (
      <i key={i} className="perf-drop-string" data-k={i}>
        <b />
      </i>
    ))}
  </div>
);

const dropFrame: Frame = (el, p, age) => {
  if (!el.dataset.placed) {
    const first = el.parentElement?.querySelector(".fx-perf-drop-wrap.cine-anchored");
    if (first !== el) el.style.display = "none";
    el.dataset.placed = "1";
  }
  const box = el.querySelector<HTMLElement>(".perf-drop");
  if (!box) return;
  const top = parseFloat(el.style.top || "0");
  setStyle(box, "--top", `${top.toFixed(1)}px`);
  const hang = box.dataset.mode === "hang";
  // Drop: fall in fast and snap taut; hang: slack, swaying a little.
  const q = hang ? 1 : easeOut(p / 0.45);
  const snap = hang ? 0 : Math.exp(-Math.max(0, age - 180) / 90) * (p > 0.4 ? 1 : 0);
  setStyle(box, "--q", q.toFixed(3));
  setStyle(box, "--snap", snap.toFixed(3));
  setStyle(box, "--sway", hang ? `${(Math.sin(age / 260) * 1.6).toFixed(2)}deg` : "0deg");
};

/* ── perf-snip ─────────────────────────────────────────────────────────── */

/** The cut in the close-up: a glint running along the shard's edge, and three cut ends springing up. */
const Snip = () => (
  <div className="perf-snip">
    <svg viewBox="-60 -60 120 120" overflow="visible">
      <path className="perf-snip-edge" d="M-46 18 L40 -22" />
      <g className="perf-snip-star">
        <path d="M0 -26 L4 -4 L26 0 L4 4 L0 26 L-4 4 L-26 0 L-4 -4 Z" />
      </g>
      {[-16, 0, 16].map((x, i) => (
        <g key={i} className="perf-snip-end" style={v({ "--k": i })} transform={`translate(${x} 6)`}>
          <path className="perf-snip-end-edge" d="M0 0 C-2 -14 6 -24 2 -40" />
          <path className="perf-snip-end-core" d="M0 0 C-2 -14 6 -24 2 -40" />
        </g>
      ))}
    </svg>
  </div>
);

/* ── perf-rail ─────────────────────────────────────────────────────────── */

/** The bridge rail in the foreground: a beam, a post, a tied-off line. Params: `w` (world px), `post` (x of the post along it). */
const Rail = ({ cue }: VfxProps) => {
  const w = Number(cue.params?.w ?? 900);
  const post = Number(cue.params?.post ?? 0.7);
  const thick = Number(cue.params?.thick ?? 46);
  return (
    <div className="perf-rail" style={v({ "--w": `${w}px` })}>
      <svg viewBox={`0 0 ${w} 400`} overflow="visible">
        <path className="perf-rail-line" d={`M${w * post + 14} -900 V${thick + 40}`} />
        <rect className="perf-rail-post" x={w * post - thick * 0.45} y={thick * 0.5} width={thick * 0.9} height={400} />
        <rect className="perf-rail-beam" x={-40} y={0} width={w + 40} height={thick} rx={6} />
        <path className="perf-rail-lit" d={`M-40 ${thick * 0.18} H${w - 6}`} />
        <path className="perf-rail-coil" d={`M${w * post - 24} ${thick + 60} q24 22 48 0 q-24 22 -48 0 m6 30 q18 14 36 0`} />
      </svg>
    </div>
  );
};

/* ── perf-lamp ─────────────────────────────────────────────────────────── */

/** The lamp's pool of light on the backcloth. Params: `rx`, `ry` (world px). */
const Lamp = ({ cue }: VfxProps) => (
  <div
    className="perf-lamp"
    data-hot={cue.params?.hot ? "" : undefined}
    style={v({ "--rx": `${Number(cue.params?.rx ?? 520)}px`, "--ry": `${Number(cue.params?.ry ?? 380)}px` })}
  >
    <i />
  </div>
);

/* ── perf-curtain ──────────────────────────────────────────────────────── */

/** The drop curtain across the screen. Params: `phase` (`in`: falls to cover; `out`: rises off). */
const Curtain = ({ cue }: VfxProps) => (
  <div className="perf-curtain" data-phase={String(cue.params?.phase ?? "in")}>
    <div className="perf-curtain-drop">
      <div className="perf-curtain-cloth" />
      <div className="perf-curtain-fringe" />
    </div>
  </div>
);

const curtainFrame: Frame = (el, p) => {
  const box = el.querySelector<HTMLElement>(".perf-curtain");
  if (!box) return;
  // In: it falls, gathering speed, and lands; out: it is hauled up.
  const drop = box.dataset.phase === "out" ? 1 - easeInOut(p) : p * p;
  setStyle(box, "--drop", drop.toFixed(3));
};

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "perf-strings": Strings,
  "perf-splinters": Splinters,
  "perf-drop": Drop,
  "perf-snip": Snip,
  "perf-rail": Rail,
  "perf-lamp": Lamp,
  "perf-curtain": Curtain,
};

export const frames: Record<string, Frame> = {
  "perf-strings": stringsFrame,
  "perf-splinters": splintersFrame,
  "perf-drop": dropFrame,
  "perf-curtain": curtainFrame,
};
