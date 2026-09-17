import type { ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ease } from "../../cinematic/timeline";
import "./style.css";

/**
 * Hallowed Ground's effects.
 *
 * The idea they serve: the Sanctifier draws the line itself — the foot of its
 * standard scores the foundry floor behind it as it walks the party's front,
 * and when it closes the score with one hard stroke the whole line burns
 * white and the soot is blown off the stone on the party's side.
 *
 *   hallow-score   the line: a groove scored across the floor behind the foot,
 *                  sparks thrown back off it and an ember light in it (`score`);
 *                  seen along its length from the near end, a wedge to the
 *                  foot, the embers going out (`quiet`); the whole length white
 *                  at once on the stroke, a burst of streaks thrown forward off
 *                  the foot, light thrown on the floor (`burn`)
 *   hallow-soot    ash drifting down the cold air (`drift`), hanging still (`hang`);
 *                  the soot blown off the party's side of the line in a wave, the
 *                  pale flagstones showing where it was (`blow`)
 *   hallow-board   on the real battlefield: a scratch of light under the Sanctifier
 *                  (`knock`); after, a lit seam along the party's front (`line`)
 *                  and a clean flagstone under each of them (`stone`)
 *
 * Nothing here is a wall, a dome, a ward over anyone or a note in the air:
 * consecration is a mark on the ground and what it does to the floor. No
 * filters and no keyframes: every move is a transform or an attribute written
 * from a frame function, and the board's marks read `--p` from the player.
 */

export const WHITE = "#f4fbff";
export const HALO = "#cdf5ff";
const STONE = "#c9c4b6";
const STONE_JOINT = "#8f8a7d";
const SOOT = ["#0e0c0b", "#1d1916", "#2a2523"];
const ASH = "#8a8f96";

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const span = (p: number, a: number, b: number) => clamp((p - a) / Math.max(0.0001, b - a));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const f1 = (n: number) => n.toFixed(1);
const f3 = (n: number) => n.toFixed(3);
type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

const setAttr = (el: Element | null | undefined, name: string, value: string) => {
  if (el && el.getAttribute(name) !== value) el.setAttribute(name, value);
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

/** A hand-cut chip: a closed polygon of `n` points, fixed for one seed. */
function chip(r: number, seed: number, n = 6, rough = 0.5) {
  const rand = seeded(seed);
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.6;
    const rr = r * (1 - rough / 2 + rand() * rough);
    d += `${i ? "L" : "M"}${f1(Math.cos(a) * rr)} ${f1(Math.sin(a) * rr * 0.6)} `;
  }
  return `${d}Z`;
}

/* ── The line ─────────────────────────────────────────────────────────── */

const SPARKS = 24;
const BURST = 30;

function ScoreRenderer({ cue }: VfxProps): ReactNode {
  const mode = String(cue.params?.mode ?? "score");
  const rand = seeded(cue.seed ?? 19);
  return (
    <div className="hallow-score" data-mode={mode} {...data(cue)}>
      <svg className="hallow-world" viewBox="0 0 1600 900" aria-hidden="true">
        <defs>
          {/* light thrown on the floor on the party's side, once the line burns */}
          <linearGradient id="hallow-throw-g" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={HALO} stopOpacity="0.6" />
            <stop offset="0.45" stopColor={HALO} stopOpacity="0.18" />
            <stop offset="1" stopColor={HALO} stopOpacity="0" />
          </linearGradient>
          <radialGradient id="hallow-glow-g">
            <stop offset="0" stopColor="#ffd9a8" stopOpacity="0.7" />
            <stop offset="0.45" stopColor="#ff9a4a" stopOpacity="0.2" />
            <stop offset="1" stopColor="#ff9a4a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hallow-halo-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={HALO} stopOpacity="0" />
            <stop offset="0.5" stopColor={WHITE} stopOpacity="0.95" />
            <stop offset="1" stopColor={HALO} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="hallow-throw" />
        <ellipse className="hallow-glow" rx={150} ry={46} />
        {/* the chipped lip of the stone, the groove, and the light in it */}
        <path className="hallow-groove-edge" />
        <path className="hallow-groove" />
        <path className="hallow-core" />
        <path className="hallow-hot" />
        <rect className="hallow-halo" />
        <path className="hallow-bead" />
        <g className="hallow-embers">
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} className="hallow-ember" opacity={0} d={chip(2.6 + rand() * 3.2, 900 + i, 5, 0.6)} data-u={rand()} data-ph={rand()} />
          ))}
        </g>
        {/* a rooster tail of sparks thrown back off the dragged foot */}
        <g className="hallow-sparks">
          {Array.from({ length: SPARKS }, (_, i) => (
            <path key={i} className={i % 3 ? "hallow-spark" : "hallow-spark hallow-spark-warm"} opacity={0} data-ph={rand()} data-a={rand()} data-l={rand()} data-v={rand()} />
          ))}
        </g>
        {/* the stroke's burst: streaks thrown forward off the foot along the sweep */}
        <g className="hallow-burst">
          {Array.from({ length: BURST }, (_, i) => (
            <path key={i} className={i % 4 ? "hallow-streak" : "hallow-streak hallow-spark-warm"} opacity={0} data-a={rand()} data-l={rand()} data-v={rand()} data-w={rand()} />
          ))}
        </g>
      </svg>
    </div>
  );
}

/** A tapered streak from (x, y) back along the direction (ux, uy), `len` long and `w` wide at its head. */
function streak(x: number, y: number, ux: number, uy: number, len: number, w: number) {
  const bx = x - ux * len;
  const by = y - uy * len;
  const nx = -uy * w;
  const ny = ux * w;
  return `M${f1(x + nx)} ${f1(y + ny)} Q${f1(x + ux * w * 1.6)} ${f1(y + uy * w * 1.6)} ${f1(x - nx)} ${f1(y - ny)} L${f1(bx)} ${f1(by)} Z`;
}

const score: Frame = (el, p, age, ctx) => {
  const box = el.querySelector<HTMLElement>(".hallow-score");
  if (!box) return;
  const d = box.dataset;
  const mode = d.mode ?? "score";
  const core = box.querySelector<SVGPathElement>(".hallow-core");
  const hot = box.querySelector<SVGPathElement>(".hallow-hot");
  const halo = box.querySelector<SVGRectElement>(".hallow-halo");
  const throw_ = box.querySelector<SVGPathElement>(".hallow-throw");
  const glow = box.querySelector<SVGEllipseElement>(".hallow-glow");
  const bead = box.querySelector<SVGPathElement>(".hallow-bead");
  const edge = box.querySelector(".hallow-groove-edge");
  const groove = box.querySelector(".hallow-groove");
  const embers = box.querySelectorAll<SVGPathElement>(".hallow-ember");
  const sparks = box.querySelectorAll<SVGPathElement>(".hallow-spark");
  const burst = box.querySelectorAll<SVGPathElement>(".hallow-streak");

  if (mode === "quiet") {
    // Along the groove: a wedge from the near end (wide, at the lens) to the
    // far end, where the foot of the standard rests. The embers cool from the
    // near end, which was cut first, to the foot, which is still warm.
    const nx = num(d, "nx", 300);
    const ny = num(d, "ny", 1100);
    const fx = num(d, "fx", 800);
    const fy = num(d, "fy", 800);
    const nw = num(d, "nw", 60);
    const fw = num(d, "fw", 10);
    const len = Math.hypot(fx - nx, fy - ny) || 1;
    const ux = (fx - nx) / len;
    const uy = (fy - ny) / len;
    const wedge = (k: number) =>
      `M${f1(nx - uy * nw * k)} ${f1(ny + ux * nw * k)} L${f1(fx - uy * fw * k)} ${f1(fy + ux * fw * k)} L${f1(fx + uy * fw * k)} ${f1(fy - ux * fw * k)} L${f1(nx + uy * nw * k)} ${f1(ny - ux * nw * k)} Z`;
    setAttr(edge, "d", wedge(1));
    setAttr(groove, "d", wedge(0.72));
    setAttr(core, "d", wedge(0.22));
    const cool = ease("out", p);
    setOpacity(core, lerp(0.55, 0.18, cool));
    // The warm stretch just behind the foot.
    const hk = 0.72;
    setAttr(hot, "d", `M${f1(lerp(nx, fx, hk))} ${f1(lerp(ny, fy, hk))} L${f1(fx)} ${f1(fy)}`);
    setOpacity(hot, lerp(0.85, 0.3, cool) * (0.9 + 0.1 * Math.sin(age / 60)));
    setAttr(glow, "cx", f1(fx));
    setAttr(glow, "cy", f1(fy));
    setAttr(glow, "rx", f1(num(d, "glow", 160)));
    setAttr(glow, "ry", f1(num(d, "glow", 160) * 0.34));
    setOpacity(glow, lerp(0.95, 0.35, cool) * (0.88 + 0.12 * Math.sin(age / 90)));
    setOpacity(halo, 0);
    setOpacity(throw_, 0);
    setOpacity(bead, 0);
    for (const [i, e] of embers.entries()) {
      const u = Number(e.dataset.u);
      const ph = Number(e.dataset.ph);
      // Each ember goes out when the cooling reaches it: the near ones first.
      const out = clamp((p * 1.4 - (u * 0.9)) * 3);
      const flicker = 0.55 + 0.45 * Math.sin(age / 50 + ph * 40 + i);
      const k = 0.1 + u * 0.88;
      const w = lerp(nw, fw, k) * 0.5 * (ph - 0.5);
      setAttr(e, "transform", `translate(${f1(lerp(nx, fx, k) - uy * w)} ${f1(lerp(ny, fy, k) + ux * w)}) scale(${f3(lerp(2.4, 0.9, k))})`);
      setAttr(e, "opacity", f3(flicker * (1 - out)));
    }
    for (const s of sparks) setAttr(s, "opacity", "0");
    for (const s of burst) setAttr(s, "opacity", "0");
    return;
  }

  const x0 = num(d, "x0", 200);
  const x1 = num(d, "x1", 1400);
  const y = num(d, "y", 850);
  const trail = num(d, "trail", 34);
  const caster = ctx.actor("caster");
  // The head of the score: where the foot is, trailing the walking figure.
  const head = mode === "score" ? clamp(caster ? caster.x - trail : x0, x0, x1) : num(d, "head", x1);
  const line = `M${f1(x0)} ${f1(y)} L${f1(head)} ${f1(y)}`;
  setAttr(edge, "d", line);
  setAttr(groove, "d", line);
  setAttr(core, "d", line);
  setOpacity(glow, 0);

  if (mode === "score") {
    // A dull ember light along what has been cut, hot just behind the foot.
    setOpacity(core, 0.7);
    setAttr(hot, "d", `M${f1(Math.max(x0, head - 220))} ${f1(y)} L${f1(head)} ${f1(y)}`);
    setOpacity(hot, 0.95);
    setOpacity(halo, 0);
    setOpacity(throw_, 0);
    setOpacity(bead, 0);
    for (const [i, e] of embers.entries()) {
      const u = Number(e.dataset.u);
      const ph = Number(e.dataset.ph);
      const ex = head - 30 - u * 520;
      if (ex < x0) {
        setAttr(e, "opacity", "0");
        continue;
      }
      const flicker = 0.5 + 0.5 * Math.sin(age / 55 + ph * 40 + i);
      setAttr(e, "transform", `translate(${f1(ex)} ${f1(y + (ph - 0.5) * 5)})`);
      setAttr(e, "opacity", f3((0.35 + 0.65 * flicker) * (1 - u * 0.7)));
    }
    // Sparks thrown back and up off the foot, falling: each lives a short
    // while, then is thrown again from wherever the foot is now.
    const on = head > x0 + 4 && head < x1 - 2;
    // The foot has moved on since a spark was thrown: world units a millisecond.
    const walk = num(d, "walk", 0.9);
    for (const s of sparks) {
      if (!on) {
        setAttr(s, "opacity", "0");
        continue;
      }
      const sd = s.dataset;
      const life = 150 + Number(sd.v) * 110;
      const t = age + Number(sd.ph) * life;
      const k = (t % life) / life;
      const cycle = Math.floor(t / life);
      const jitter = ((cycle * 37 + Number(sd.a) * 100) % 100) / 100;
      const a = ((196 + jitter * 44) * Math.PI) / 180; // back and up
      const speed = 0.9 + Number(sd.v) * 1.4;
      const dist = speed * life * k;
      const sx = head - walk * life * k + Math.cos(a) * dist;
      const sy = y - 4 + Math.sin(a) * dist + 260 * k * k;
      const vx = Math.cos(a) * speed;
      const vy = Math.sin(a) * speed + (520 * k) / life;
      const vl = Math.hypot(vx, vy) || 1;
      const len = (18 + Number(sd.l) * 46) * (1 - k * 0.6);
      setAttr(s, "d", streak(sx, sy, vx / vl, vy / vl, len, 1.8 + Number(sd.l) * 1.2));
      setAttr(s, "opacity", f3(1 - k * k));
    }
    for (const s of burst) setAttr(s, "opacity", "0");
    return;
  }

  // Burn: the whole length white at once on contact, then breathing.
  const ignite = num(d, "ignite", 0.05);
  const shotMs = num(d, "shotMs", 860);
  const settled = d.settle !== undefined;
  const lit = settled || p >= ignite ? 1 : 0;
  const since = settled ? 10000 : (p - ignite) * shotMs;
  const breathe = 0.86 + 0.14 * (0.5 + 0.5 * Math.sin(age / 260));
  setOpacity(core, lit ? breathe : 0.2);
  setAttr(hot, "d", line);
  setOpacity(hot, lit ? 0.55 + 0.45 * Math.max(0, 1 - since / 600) : 0);
  const h = num(d, "haloH", 90) * (1 + 0.6 * Math.max(0, 1 - since / 260));
  setAttr(halo, "x", f1(x0 - 30));
  setAttr(halo, "width", f1(head - x0 + 60));
  setAttr(halo, "y", f1(y - h / 2));
  setAttr(halo, "height", f1(h));
  setOpacity(halo, lit * (0.6 + 0.25 * breathe));
  // Light thrown on the party's side of the line, full on contact.
  const depth = num(d, "depth", 240);
  const taper = num(d, "taper", 90);
  setAttr(throw_, "d", `M${f1(x0 - 60)} ${f1(y + 6)} L${f1(x1 + 60)} ${f1(y + 6)} L${f1(x1 - taper + 60)} ${f1(y - depth)} L${f1(x0 + taper - 60)} ${f1(y - depth)} Z`);
  setOpacity(throw_, lit * (0.75 + 0.25 * breathe));
  // A bead of white running back along the line from the foot, after the stop.
  const run = clamp((since - 20) / 260);
  if (lit && run > 0 && run < 1) {
    const bx = lerp(head, x0, ease("out", run));
    setAttr(bead, "d", `M${f1(bx)} ${f1(y)} L${f1(Math.min(head, bx + 160))} ${f1(y)}`);
    setOpacity(bead, 1 - run);
  } else setOpacity(bead, 0);
  for (const e of embers) setAttr(e, "opacity", "0");
  for (const s of sparks) setAttr(s, "opacity", "0");

  // The burst off the foot: streaks thrown forward and up along the sweep,
  // already out on the contact frame, falling and gone in 420ms.
  const dir = num(d, "dir", 1);
  for (const s of burst) {
    if (!lit || settled || since > 420) {
      setAttr(s, "opacity", "0");
      continue;
    }
    const sd = s.dataset;
    const k = clamp((since + 40) / 460);
    const a = ((-4 - Number(sd.a) * 48) * Math.PI) / 180; // forward, from along the floor to steep
    const speed = 380 + Number(sd.v) * 520;
    const dist = speed * ease("out", k) * 0.9;
    const ux = Math.cos(a) * dir;
    const uy = Math.sin(a);
    const sx = head + ux * dist;
    const sy = y - 6 + uy * dist + 180 * k * k;
    const len = (40 + Number(sd.l) * 150) * (1 - k * 0.7);
    setAttr(s, "d", streak(sx, sy, ux, uy + 0.35 * k, len, 2.4 + Number(sd.w) * 3.6));
    setAttr(s, "opacity", f3(1 - k * k));
  }
};

/* ── The soot ─────────────────────────────────────────────────────────── */

const FLAKES = 140;

function SootRenderer({ cue }: VfxProps): ReactNode {
  const mode = String(cue.params?.mode ?? "blow");
  const rand = seeded(cue.seed ?? 23);
  const n = mode === "blow" ? Number(cue.params?.count ?? FLAKES) : Number(cue.params?.count ?? 36);
  const flakes = Array.from({ length: n }, (_, i) => {
    const ash = mode !== "blow" || rand() < 0.3;
    return {
      u: rand(),
      v: rand(),
      r: mode === "blow" ? 4 + rand() * rand() * 22 + (i < 10 ? 12 : 0) : 3 + rand() * 6,
      h: 0.5 + rand(),
      dx: (rand() - 0.5) * 2,
      spin: (rand() - 0.5) * 720,
      ph: rand(),
      tone: ash ? -1 : Math.floor(rand() * 3),
      seed: 500 + i,
    };
  });
  return (
    <div className="hallow-soot" data-mode={mode} {...data(cue)}>
      <svg className="hallow-world" viewBox="0 0 1600 900" aria-hidden="true">
        {mode === "blow" && (
          <>
            <defs>
              <clipPath id="hallow-stone-clip">
                <rect className="hallow-stone-clip-rect" x="0" y="0" width="1600" height="0" />
              </clipPath>
              <linearGradient id="hallow-stone-g" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#d3cec0" />
                <stop offset="0.55" stopColor="#b9b4a6" />
                <stop offset="1" stopColor="#8f8b80" />
              </linearGradient>
            </defs>
            <g className="hallow-stone-g" clipPath="url(#hallow-stone-clip)">
              <path className="hallow-stone" />
              <path className="hallow-stone-joints" />
            </g>
          </>
        )}
        <g className="hallow-flakes">
          {flakes.map((f, i) => (
            <path
              key={i}
              className={f.tone < 0 ? "hallow-flake hallow-ash" : `hallow-flake hallow-soot-${f.tone}`}
              opacity={0}
              d={chip(f.r, f.seed)}
              data-u={f.u}
              data-v={f.v}
              data-h={f.h}
              data-dx={f.dx}
              data-spin={f.spin}
              data-ph={f.ph}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

const soot: Frame = (el, p, age) => {
  const box = el.querySelector<HTMLElement>(".hallow-soot");
  if (!box) return;
  const d = box.dataset;
  const mode = d.mode ?? "blow";
  const flakes = box.querySelectorAll<SVGPathElement>(".hallow-flake");

  if (mode !== "blow") {
    // Ash in the cold air of the foundry: drifting down (drift), or hanging (hang).
    const cx = num(d, "cx", 800);
    const cy = num(d, "cy", 450);
    const w = num(d, "w", 1000);
    const h = num(d, "h", 600);
    const fall = mode === "drift" ? num(d, "fall", 70) : num(d, "fall", 3);
    const sway = mode === "drift" ? 26 : 2;
    for (const [i, f] of flakes.entries()) {
      const u = Number(f.dataset.u);
      const v = Number(f.dataset.v);
      const ph = Number(f.dataset.ph);
      const t = age / 1000;
      const y = cy - h / 2 + (((v * h + t * fall * (0.6 + ph * 0.8)) % h) + h) % h;
      const x = cx - w / 2 + u * w + Math.sin(t * 1.4 + ph * 6.3) * sway;
      setAttr(f, "transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(ph * 360 + t * 30)})`);
      setAttr(f, "opacity", f3(0.35 + 0.4 * ((i * 7) % 5) / 5));
    }
    return;
  }

  // Blow: the soot lifted off the party's side of the line all at once, and
  // the pale stone under it. On the contact frame (the stop holds it) most of
  // the stone already shows and every flake has just jumped off it.
  const x0 = num(d, "x0", 200);
  const x1 = num(d, "x1", 1400);
  const y = num(d, "y", 850);
  const depth = num(d, "depth", 240);
  const taper = num(d, "taper", 90);
  const at = num(d, "at", 0.06);
  const rise = num(d, "rise", 260);
  const settled = d.settle !== undefined;
  const front = settled ? 1 : p < at ? 0 : 0.7 + 0.3 * ease("out", span(p, at, at + 0.22));

  const stone = box.querySelector<SVGPathElement>(".hallow-stone");
  const joints = box.querySelector<SVGPathElement>(".hallow-stone-joints");
  const clip = box.querySelector<SVGRectElement>(".hallow-stone-clip-rect");
  if (stone && joints && clip) {
    const key = `${f1(x0)},${f1(x1)},${f1(y)},${f1(depth)},${f1(taper)}`;
    if (stone.dataset.key !== key) {
      stone.dataset.key = key;
      setAttr(stone, "d", `M${f1(x0)} ${f1(y + 10)} L${f1(x1)} ${f1(y + 10)} L${f1(x1 - taper)} ${f1(y - depth)} L${f1(x0 + taper)} ${f1(y - depth)} Z`);
      // The flagstone joints under the soot: rows and radials in the same perspective.
      let j = "";
      for (let r = 1; r <= 4; r++) {
        const k = r / 4.6;
        const yy = y + 10 - (depth + 10) * k;
        const inset = taper * k;
        j += `M${f1(x0 + inset)} ${f1(yy)} L${f1(x1 - inset)} ${f1(yy)} `;
      }
      for (let c = 1; c <= 7; c++) {
        const u = c / 8;
        j += `M${f1(lerp(x0, x1, u))} ${f1(y + 10)} L${f1(lerp(x0 + taper, x1 - taper, u))} ${f1(y - depth)} `;
      }
      setAttr(joints, "d", j);
    }
    // The clip grows away from the line, so the clean stone spreads with the wave.
    const top = y + 10 - (depth + 10) * front;
    setAttr(clip, "x", f1(x0 - 10));
    setAttr(clip, "width", f1(x1 - x0 + 20));
    setAttr(clip, "y", f1(top));
    setAttr(clip, "height", f1(Math.max(0, y + 12 - top)));
    setOpacity(stone, front > 0 ? 1 : 0);
  }

  const life = num(d, "life", 0.55);
  for (const f of flakes) {
    const fd = f.dataset;
    const u = Number(fd.u);
    const v = Number(fd.v);
    // A flake at depth v goes a breath after the ones at the line; every one
    // is already off the stone on the contact frame.
    const start = at + v * 0.05;
    const q = settled ? 1.2 : p < at ? -1 : clamp((p - start) / life + 0.06 * (1 - v), 0.02, 1.2);
    if (q < 0 || q >= 1.2) {
      setAttr(f, "opacity", "0");
      continue;
    }
    const h = Number(fd.h);
    const inset = taper * v;
    const fx0 = lerp(x0 + inset, x1 - inset, u);
    const fy0 = y + 4 - (depth + 4) * v;
    const lift = ease("out", Math.min(q, 1));
    const x = fx0 + Number(fd.dx) * 110 * lift;
    const yy = fy0 - rise * h * lift - (1 - v) * 40 * lift + (q > 1 ? (q - 1) * 90 : 0);
    setAttr(f, "transform", `translate(${f1(x)} ${f1(yy)}) rotate(${f1(Number(fd.spin) * q)}) scale(${f3((1 - v * 0.45) * (1 - 0.3 * lift))})`);
    setAttr(f, "opacity", f3(q < 0.8 ? 1 : clamp(1 - (q - 0.8) * 2.5)));
  }
};

/* ── On the real battlefield ──────────────────────────────────────────── */

function BoardRenderer({ cue }: VfxProps): ReactNode {
  const mode = String(cue.params?.mode ?? "stone");
  const rand = seeded(cue.seed ?? 31);
  return (
    <div className="hallow-board" data-mode={mode} {...data(cue)}>
      {mode === "knock" && (
        <svg className="hallow-board-knock" viewBox="-60 -20 120 40" aria-hidden="true">
          <path className="hallow-board-scratch" d="M-44 6 L40 -2" />
          <path className="hallow-board-scratch-hot" d="M-44 6 L40 -2" />
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} className="hallow-board-spark" d={`M${f1(30 + rand() * 12)} ${f1(-2 + rand() * 4)} l${f1(4 + rand() * 9)} ${f1(-4 - rand() * 8)}`} style={{ "--d": rand() } as never} />
          ))}
        </svg>
      )}
      {mode === "line" && (
        <svg className="hallow-board-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line className="hallow-board-seam-halo" x1="0" y1="50" x2="100" y2="50" />
          <line className="hallow-board-seam" x1="0" y1="50" x2="100" y2="50" />
          <line className="hallow-board-seam-core" x1="0" y1="50" x2="100" y2="50" />
        </svg>
      )}
      {mode === "stone" && (
        <>
          <svg className="hallow-board-stone" viewBox="-70 -18 140 36" aria-hidden="true">
            <path className="hallow-board-flag" d="M-62 12 L-50 -12 L50 -12 L62 12 Z" />
            <path className="hallow-board-flag-joint" d="M-56 0 H56 M-10 -12 L-14 12 M24 -12 L22 12" />
          </svg>
          <div className="hallow-board-lift">
            {Array.from({ length: 7 }, (_, i) => (
              <i key={i} style={{ "--fx": (rand() - 0.5) * 1.1, "--fd": rand() * 0.5, "--fr": rand() * 360, "--fs": 0.5 + rand() } as never} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** The seam along the party's front: measured from where the stage has put the party. */
const board: Frame = (el, p) => {
  const box = el.querySelector<HTMLElement>(".hallow-board");
  if (!box || box.dataset.mode !== "line") return;
  const svg = box.querySelector<SVGSVGElement>(".hallow-board-line");
  if (!svg) return;
  const units = [...document.querySelectorAll<HTMLElement>(".stage [data-unit] .combatant-rig")].filter((n) => {
    const id = n.closest<HTMLElement>("[data-unit]")?.dataset.unit ?? "";
    return id && !id.startsWith("enemy");
  });
  if (!units.length) return;
  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  let unitH = 0;
  for (const u of units) {
    const b = u.getBoundingClientRect();
    left = Math.min(left, b.left);
    right = Math.max(right, b.right);
    top = Math.min(top, b.bottom);
    unitH = Math.max(unitH, b.height);
  }
  // Between the party's front row and the enemy: just beyond the nearest feet.
  const origin = el.getBoundingClientRect();
  const y = top - unitH * 0.2 - origin.top;
  const x = left - unitH * 0.2 - origin.left;
  const w = right - left + unitH * 0.6;
  svg.style.left = `${x.toFixed(1)}px`;
  svg.style.top = `${(y - 10).toFixed(1)}px`;
  svg.style.width = `${w.toFixed(1)}px`;
  // Lit from the Sanctifier's end outward, then breathing.
  box.style.setProperty("--seam", f3(ease("out", span(p, 0, 0.3))));
  box.style.setProperty("--breathe", f3(0.85 + 0.15 * Math.sin(p * 9)));
};

/* ── Registered ────────────────────────────────────────────────────────── */

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "hallow-score": ScoreRenderer,
  "hallow-soot": SootRenderer,
  "hallow-board": BoardRenderer,
};

export const frames: Record<string, Frame> = {
  "hallow-score": score,
  "hallow-soot": soot,
  "hallow-board": board,
};
