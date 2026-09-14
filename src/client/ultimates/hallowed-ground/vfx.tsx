import type { ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ease } from "../../cinematic/timeline";
import "./style.css";

/**
 * Hallowed Ground's effects.
 *
 * The idea they serve: the Sanctifier draws the line itself — the shod foot
 * of its standard scores the foundry floor behind it as it walks the party's
 * front, and when the standard is grounded on the end of the score the whole
 * line burns white and the soot is blown off the stone on the party's side.
 *
 *   hallow-score   the line: a groove scored across the floor behind the ferrule
 *                  with sparks off the foot and an ember light in it (`score`);
 *                  its end close, the embers ticking out (`quiet`); the whole
 *                  length igniting white with a flare at the foot, light thrown
 *                  on the floor (`burn`)
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

const SPARKS = 11;
const FLARE = 14;

function ScoreRenderer({ cue }: VfxProps): ReactNode {
  const mode = String(cue.params?.mode ?? "score");
  const rand = seeded(cue.seed ?? 19);
  return (
    <div className="hallow-score" data-mode={mode} {...data(cue)}>
      <svg className="hallow-world" viewBox="0 0 1600 900" aria-hidden="true">
        {/* light thrown on the floor on the party's side, once the line burns */}
        <defs>
          <linearGradient id="hallow-throw-g" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={HALO} stopOpacity="0.55" />
            <stop offset="0.45" stopColor={HALO} stopOpacity="0.16" />
            <stop offset="1" stopColor={HALO} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hallow-halo-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={HALO} stopOpacity="0" />
            <stop offset="0.5" stopColor={WHITE} stopOpacity="0.9" />
            <stop offset="1" stopColor={HALO} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="hallow-throw" />
        {/* the chipped edge of the stone, the groove, and the light in it */}
        <path className="hallow-groove-edge" />
        <path className="hallow-groove" />
        <path className="hallow-core" />
        <path className="hallow-hot" />
        <rect className="hallow-halo" />
        <g className="hallow-embers">
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} className="hallow-ember" opacity={0} r={2.2 + rand() * 2.4} data-u={rand()} data-ph={rand()} />
          ))}
        </g>
        <g className="hallow-sparks">
          {Array.from({ length: SPARKS }, (_, i) => (
            <path key={i} className="hallow-spark" opacity={0} data-ph={rand()} data-a={-150 + rand() * 120} data-l={14 + rand() * 30} />
          ))}
        </g>
        <g className="hallow-flare" opacity={0}>
          {Array.from({ length: FLARE }, (_, i) => {
            const a = (i / FLARE) * Math.PI * 2 + (rand() - 0.5) * 0.3;
            const len = 60 + rand() * 90 + (i % 3 === 0 ? 70 : 0);
            const w = 4 + rand() * 4;
            const x = Math.cos(a);
            const y = Math.sin(a);
            return <path key={i} className="hallow-flare-spike" d={`M${f1(-y * w)} ${f1(x * w)} L${f1(x * len)} ${f1(y * len)} L${f1(y * w)} ${f1(-x * w)} Z`} />;
          })}
        </g>
      </svg>
    </div>
  );
}

const score: Frame = (el, p, age, ctx) => {
  const box = el.querySelector<HTMLElement>(".hallow-score");
  if (!box) return;
  const d = box.dataset;
  const mode = d.mode ?? "score";
  const x0 = num(d, "x0", 200);
  const x1 = num(d, "x1", 1400);
  const y = num(d, "y", 850);
  const trail = num(d, "trail", 34);
  const caster = ctx.actor("caster");
  // The head of the score: where the ferrule is, trailing the walking figure.
  const head = mode === "score" ? clamp(caster ? caster.x - trail : x0, x0, x1) : num(d, "head", x1);
  const ignite = num(d, "ignite", 0.05);
  const settled = d.settle !== undefined;
  const lit = mode === "burn" ? (settled ? 1 : span(p, ignite, ignite + 0.05)) : 0;

  const groove = `M${f1(x0)} ${f1(y)} L${f1(head)} ${f1(y)}`;
  setAttr(box.querySelector(".hallow-groove-edge"), "d", groove);
  setAttr(box.querySelector(".hallow-groove"), "d", groove);
  setAttr(box.querySelector(".hallow-core"), "d", groove);

  const core = box.querySelector<SVGPathElement>(".hallow-core");
  const hot = box.querySelector<SVGPathElement>(".hallow-hot");
  const halo = box.querySelector<SVGRectElement>(".hallow-halo");
  const throw_ = box.querySelector<SVGPathElement>(".hallow-throw");
  if (mode === "score") {
    // A dull ember light along what has been cut, hotter just behind the foot.
    setOpacity(core, 0.32);
    setAttr(hot, "d", `M${f1(Math.max(x0, head - 150))} ${f1(y)} L${f1(head)} ${f1(y)}`);
    setOpacity(hot, 0.9);
    setOpacity(halo, 0);
    setOpacity(throw_, 0);
  } else if (mode === "quiet") {
    // The embers going out: the core dims over the shot.
    setOpacity(core, lerp(0.3, 0.08, ease("out", p)));
    setAttr(hot, "d", `M${f1(Math.max(x0, head - 90))} ${f1(y)} L${f1(head)} ${f1(y)}`);
    setOpacity(hot, lerp(0.7, 0.12, ease("out", p)));
    setOpacity(halo, 0);
    setOpacity(throw_, 0);
  } else {
    // Burn: the whole length at once, then breathing.
    const breathe = 0.86 + 0.14 * (0.5 + 0.5 * Math.sin(age / 260));
    setOpacity(core, lit > 0 ? lerp(0.25, breathe, lit) : 0.14);
    setAttr(hot, "d", groove);
    setOpacity(hot, lit > 0 ? lit * (0.55 + 0.45 * Math.max(0, 1 - (age - ignite * num(d, "shotMs", 780)) / 700)) : 0);
    const h = num(d, "haloH", 64);
    setAttr(halo, "x", f1(x0 - 20));
    setAttr(halo, "width", f1(x1 - x0 + 40));
    setAttr(halo, "y", f1(y - h / 2));
    setAttr(halo, "height", f1(h));
    setOpacity(halo, lit * (0.55 + 0.25 * breathe));
    // Light thrown on the party's side of the line.
    const depth = num(d, "depth", 240);
    const taper = num(d, "taper", 90);
    setAttr(throw_, "d", `M${f1(x0 - 60)} ${f1(y + 6)} L${f1(x1 + 60)} ${f1(y + 6)} L${f1(x1 - taper + 60)} ${f1(y - depth)} L${f1(x0 + taper - 60)} ${f1(y - depth)} Z`);
    setOpacity(throw_, (settled ? 1 : ease("out", span(p, ignite, ignite + 0.3))) * (0.7 + 0.3 * breathe));
  }

  // Embers: a few points along the last stretch, flickering; only while cutting or cooling.
  const embersOn = mode !== "burn";
  for (const [i, e] of box.querySelectorAll<SVGCircleElement>(".hallow-ember").entries()) {
    if (!embersOn) {
      setAttr(e, "opacity", "0");
      continue;
    }
    const u = Number(e.dataset.u);
    const ph = Number(e.dataset.ph);
    const ex = head - 20 - u * (mode === "quiet" ? 260 : 400);
    if (ex < x0) {
      setAttr(e, "opacity", "0");
      continue;
    }
    const flicker = 0.5 + 0.5 * Math.sin(age / 55 + ph * 40 + i);
    const cool = mode === "quiet" ? 1 - ease("in", p) * 0.9 : 1;
    setAttr(e, "cx", f1(ex));
    setAttr(e, "cy", f1(y + (ph - 0.5) * 3));
    setAttr(e, "opacity", f3((0.35 + 0.65 * flicker) * cool * (1 - u * 0.6)));
  }

  // Sparks off the foot while it cuts: each lives 110ms, then is thrown again.
  const sparksOn = mode === "score" && head > x0 + 4;
  for (const s of box.querySelectorAll<SVGPathElement>(".hallow-spark")) {
    if (!sparksOn) {
      setAttr(s, "opacity", "0");
      continue;
    }
    const ph = Number(s.dataset.ph);
    const life = 110;
    const k = ((age + ph * life) % life) / life;
    const cycle = Math.floor((age + ph * life) / life);
    const a = ((Number(s.dataset.a) + ((cycle * 37) % 50) - 25) * Math.PI) / 180;
    const len = Number(s.dataset.l) * (0.6 + ((cycle * 13) % 7) / 10);
    const travel = 30 + ((cycle * 7) % 40);
    const sx = head + Math.cos(a) * travel * k;
    const sy = y + Math.sin(a) * travel * k + 90 * k * k;
    setAttr(s, "d", `M${f1(sx)} ${f1(sy)} l${f1(-Math.cos(a) * len * (1 - k) - 6)} ${f1(-Math.sin(a) * len * (1 - k) + 3)}`);
    setAttr(s, "opacity", f3(1 - k * k));
  }

  // The flare at the foot on ignition: a hand-cut star, out and gone in 300ms.
  const flare = box.querySelector<SVGGElement>(".hallow-flare");
  if (flare) {
    const since = mode === "burn" && !settled ? age - ignite * num(d, "shotMs", 780) : -1;
    if (since < 0 || since > 320) setAttr(flare, "opacity", "0");
    else {
      const k = since / 320;
      const grow = k < 0.35 ? ease("out", k / 0.35) : 1;
      setAttr(flare, "transform", `translate(${f1(head)} ${f1(y)}) scale(${f3(0.3 + grow * 1.3)}, ${f3(0.2 + grow * 0.7)}) rotate(${f1(k * 14)})`);
      setAttr(flare, "opacity", f3(k < 0.5 ? 1 : 1 - (k - 0.5) * 2));
    }
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

  // Blow: the soot lifted off the party's side of the line in a wave from it,
  // and the pale stone showing where it was.
  const x0 = num(d, "x0", 200);
  const x1 = num(d, "x1", 1400);
  const y = num(d, "y", 850);
  const depth = num(d, "depth", 240);
  const taper = num(d, "taper", 90);
  const at = num(d, "at", 0.06);
  const rise = num(d, "rise", 200);
  const settled = d.settle !== undefined;
  const front = settled ? 1 : ease("out", span(p, at, at + 0.5));

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

  const life = num(d, "life", 0.5);
  for (const f of flakes) {
    const fd = f.dataset;
    const u = Number(fd.u);
    const v = Number(fd.v);
    // A flake at depth v is lifted when the wave reaches it.
    const start = at + v * 0.36;
    const q = settled ? 1.2 : clamp((p - start) / life, 0, 1.2);
    if (q <= 0 || q >= 1.2) {
      setAttr(f, "opacity", "0");
      continue;
    }
    const inset = taper * v;
    const fx0 = lerp(x0 + inset, x1 - inset, u);
    const fy0 = y + 8 - (depth + 8) * v;
    const arc = 4 * Math.min(q, 1) * (1 - Math.min(q, 1));
    const away = q * (60 + v * 40) * Number(fd.h);
    const x = fx0 + Number(fd.dx) * 90 * q;
    const yy = fy0 - away - Number(fd.h) * rise * arc * 0.5 + (q > 1 ? (q - 1) * 120 : 0);
    setAttr(f, "transform", `translate(${f1(x)} ${f1(yy)}) rotate(${f1(Number(fd.spin) * q)}) scale(${f3(1 - v * 0.45)})`);
    setAttr(f, "opacity", f3(q < 0.85 ? 1 : clamp(1 - (q - 0.85) * 3)));
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
