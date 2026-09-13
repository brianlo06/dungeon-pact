import type { CSSProperties, ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import "./style.css";

/**
 * False Footing's effects.
 *
 * The idea they serve: the Pathfinder reads the enemy's own tracks in fresh
 * snow until they say where its next foot will fall, and the snare is already
 * waiting under that exact spot when it does.
 *
 *   ff-print   one print dented in the snow; its rim lights as it is read
 *   ff-trail   from above: every enemy's trail read up to its feet, the next
 *              step foreseen, a snare under it, and the cords back to the hand
 *   ff-loop    a snare's noose lying open under the snow
 *   ff-hobble  the snare sprung: the cord whipped round the enemy's legs
 *   ff-cord    the snare's cord between two points: slack, taut, ripped up
 *   ff-burst   the snow thrown up when the snare bites (boils in three drawings)
 *   ff-breath  breath clouds in the cold, which stop when the breath is held
 *   ff-flakes  the last flakes still coming down; they hang in the quiet
 *   ff-drift   a drift's lip across the bottom of the frame
 *   ff-spray   powder thrown across the lens: the cut from the print to above
 *   ff-board   on the real battlefield: prints behind every enemy, and after,
 *              a snare cinched at every enemy's feet
 *
 * Nothing animates by itself and nothing here filters. Effects read the
 * film's `--p` family; those that depend on where the cast really stands
 * (the trail, the cord) are placed by frame functions from the stage's own
 * placements, and write only when something changed.
 */

export const AMBER = "#f2a93b";
const LIT = "#eef3fb";
const SHADOW = "#6f86b8";

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;
const v = (vars: Record<string, string | number>) => vars as CSSProperties;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const span = (p: number, a: number, b: number) => clamp((p - a) / Math.max(0.0001, b - a));
const f1 = (n: number) => n.toFixed(1);
const setAttr = (el: Element | null | undefined, name: string, value: string) => {
  if (el && el.getAttribute(name) !== value) el.setAttribute(name, value);
};
const setVar = (el: HTMLElement | SVGElement | null | undefined, name: string, value: string) => {
  if (el && el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
};
/** A cue's params, written on the effect's first child so a frame can read them. */
const data = (params: VfxProps["cue"]["params"] = {}) =>
  Object.fromEntries(Object.entries(params).map(([k, x]) => [`data-${k.toLowerCase()}`, String(x)]));
const paramsOf = (el: HTMLElement) => (el.firstElementChild as HTMLElement | null)?.dataset ?? {};
const num = (d: DOMStringMap, k: string, fallback: number) =>
  d[k.toLowerCase()] === undefined ? fallback : Number(d[k.toLowerCase()]);

/* ── The print ─────────────────────────────────────────────────────────── */

/**
 * A clawed pad pointing left (the way the enemy line walks), drawn on a
 * 100-unit box centred on its middle, as seen from straight above. Four
 * shapes: the heel pad, three toes; and the claw marks.
 */
const PAD = "M6 -19 C25 -27 42 -15 42 1 C42 17 25 27 6 19 C-5 13 -5 -13 6 -19 Z";
const TOES = [
  "M-14 -30 C-8 -36 4 -34 4 -26 C4 -18 -8 -16 -14 -20 C-19 -23 -19 -27 -14 -30 Z",
  "M-27 -8 C-21 -14 -9 -12 -9 -2 C-9 8 -21 10 -27 4 C-31 0 -31 -4 -27 -8 Z",
  "M-14 30 C-8 36 4 34 4 26 C4 18 -8 16 -14 20 C-19 23 -19 27 -14 30 Z",
];
const CLAWS = "M-20 -32 L-33 -40 M-33 -3 L-48 -4 M-20 32 L-33 40";
const SHAPES = [PAD, ...TOES];

/** One print, as the shapes in it, for any `<g>` that places and squashes it. */
function PrintArt({ ghost = false, hot = false }: { ghost?: boolean; hot?: boolean }) {
  if (ghost)
    return (
      <g className="ff-ghost">
        {SHAPES.map((d, i) => (
          <path key={i} d={d} className="ff-ghost-line" />
        ))}
        <path d={CLAWS} className="ff-ghost-line" />
      </g>
    );
  return (
    <g className="ff-dent" data-hot={hot || undefined}>
      {/* The lip of snow pushed up round it, lit on the far side. */}
      {SHAPES.map((d, i) => (
        <path key={`l${i}`} d={d} className="ff-dent-lip" transform="translate(0 -3.5) scale(1.12)" />
      ))}
      {SHAPES.map((d, i) => (
        <path key={`h${i}`} d={d} className="ff-dent-hollow" />
      ))}
      {SHAPES.map((d, i) => (
        <path key={`f${i}`} d={d} className="ff-dent-floor" transform="translate(1.5 3) scale(0.72)" />
      ))}
      {SHAPES.map((d, i) => (
        <path key={`w${i}`} d={d} className="ff-dent-warm" transform="translate(1.5 3) scale(0.72)" />
      ))}
      <path d={CLAWS} className="ff-dent-claw" />
      {/* Read: the rim fills with amber from the touch, both ways round. */}
      {SHAPES.map((d, i) => (
        <path key={`r${i}`} d={d} pathLength={1} className="ff-dent-read" />
      ))}
      <path d={CLAWS} pathLength={1} className="ff-dent-read ff-dent-read-claw" />
    </g>
  );
}

/**
 * One print at the size of the frame. `size` is its width in world units,
 * `squash` its height against its width (the angle it is seen at), `turn`
 * the way it points; `read` from `ra` to `rb` of the effect's life lights its
 * rim; `crumbs` tip snow into it. `ghost` draws the print not yet made:
 * the next step, as a dashed amber outline in untouched snow.
 */
const Print = ({ cue }: VfxProps) => {
  const q = cue.params ?? {};
  const size = Number(q.size ?? 300);
  const squash = Number(q.squash ?? 0.4);
  const rand = seeded(cue.seed ?? 11);
  return (
    <svg
      className="ff-print"
      viewBox="-70 -60 140 120"
      style={v({ width: `${size * 1.4}px`, height: `${size * 1.2}px`, "--ra": Number(q.ra ?? 0.2), "--rb": Number(q.rb ?? 0.7) })}
    >
      <g transform={`scale(1 ${squash}) rotate(${Number(q.turn ?? 0)})`}>
        <PrintArt ghost={!!q.ghost} />
      </g>
      {q.crumbs && (
        <g className="ff-crumbs">
          {Array.from({ length: 9 }, (_, i) => (
            <circle
              key={i}
              r={1.2 + rand() * 2.2}
              cx={-20 + rand() * 50}
              cy={-12 - rand() * 6}
              style={v({ "--dy": `${8 + rand() * 12}px`, "--d": (0.3 + rand() * 0.4).toFixed(2) })}
            />
          ))}
        </g>
      )}
    </svg>
  );
};

/* ── The trail, from above ─────────────────────────────────────────────── */

const TRAIL_STEPS = 7;
const MAX_TRAILS = 6;

/**
 * Every enemy's trail on the field, read up to its feet. Drawn once with room
 * for six enemies; `ff-trail`'s frame places each group on the enemy the
 * stage really put there, hides the rest, and sends each cord to the kid's
 * hand. Each print lights in turn from `--d`, the target's first.
 */
const Trail = ({ cue }: VfxProps) => (
  <svg className="ff-world ff-trail" viewBox="0 0 1600 900" {...data(cue.params)}>
    {Array.from({ length: MAX_TRAILS }, (_, t) => (
      <g key={t} className="ff-trail-one" data-trail={t} style={{ display: "none" }}>
        <path className="ff-cord-shadow" pathLength={1} />
        <path className="ff-cord-line" pathLength={1} />
        <path className="ff-cord-glint" pathLength={1} />
        {Array.from({ length: TRAIL_STEPS }, (_, i) => (
          <g key={i} className="ff-step" data-step={i}>
            <PrintArt />
          </g>
        ))}
        <g className="ff-next">
          <g className="ff-next-loop">
            <ellipse className="ff-loop-under" rx="46" ry="40" />
            <ellipse className="ff-loop-cord" rx="46" ry="40" />
            <path className="ff-loop-knot" d="M40 -6 l14 -4 l-3 12 Z" />
          </g>
          <PrintArt ghost />
        </g>
      </g>
    ))}
  </svg>
);

const trailFrame: Frame = (el, p, _age, ctx) => {
  const svg = el.querySelector<SVGSVGElement>(".ff-trail");
  if (!svg) return;
  const q = paramsOf(el);
  const caster = ctx.actor("caster");
  const hx = caster ? caster.x + caster.h * num(q, "hx", 0.2) : 0;
  const hy = caster ? caster.y - caster.h * num(q, "hy", 0.3) : 0;
  const squash = num(q, "squash", 0.62);
  // Where each enemy came from: back along this heading, which is up and away.
  const back = [num(q, "bx", 0.86), num(q, "by", -0.5)];
  // The art points left; turn it to point the way the enemy walked.
  const heading = (Math.atan2(-back[1], -back[0]) * 180) / Math.PI - 180;
  for (let t = 0; t < MAX_TRAILS; t++) {
    const g = svg.querySelector<SVGGElement>(`[data-trail="${t}"]`);
    const a = ctx.actor(`targets-${t}`);
    if (!g) continue;
    if (!a) {
      if (g.style.display !== "none") g.style.display = "none";
      continue;
    }
    const key = `${f1(a.x)},${f1(a.y)},${f1(a.h)},${f1(hx)},${f1(hy)}`;
    if (g.dataset.key !== key) {
      g.dataset.key = key;
      g.style.display = "";
      // A print about a sixth of the creature's drawn height, and a stride twice that.
      const size = Math.max(52, Math.min(140, a.h * 0.3));
      const stride = size * 1.3;
      const k = size / 100;
      const steps = g.querySelectorAll<SVGGElement>(".ff-step");
      steps.forEach((step, i) => {
        // Oldest first: step 0 is furthest back.
        const n = TRAIL_STEPS - i;
        const side = i % 2 ? 1 : -1;
        const x = a.x + back[0] * stride * n + side * size * 0.28 * back[1];
        const y = a.y + back[1] * stride * n * squash + side * size * 0.22;
        setAttr(step, "transform", `translate(${f1(x)} ${f1(y)}) scale(${(k * 0.9).toFixed(3)} ${(k * 0.9 * squash).toFixed(3)}) rotate(${f1(heading)})`);
        setVar(step, "--d", ((t === 0 ? 0 : 0.08 * t) + (i / TRAIL_STEPS) * 0.36).toFixed(3));
      });
      // The next step: ahead of its feet, towards the party.
      const nx = a.x - back[0] * stride * 0.9;
      const ny = a.y - back[1] * stride * 0.9 * squash + size * 0.12;
      const next = g.querySelector<SVGGElement>(".ff-next");
      setAttr(next, "transform", `translate(${f1(nx)} ${f1(ny)}) scale(${(k * 1.05).toFixed(3)} ${(k * 1.05 * squash).toFixed(3)}) rotate(${f1(heading)})`);
      setVar(next, "--d", (0.46 + 0.06 * t).toFixed(3));
      // The cord: out of the loop's knot, sagging across the snow to the hand.
      const kx = nx + 52 * k;
      const ky = ny;
      const mx = (kx + hx) / 2;
      const my = Math.max(ky, hy) + Math.abs(kx - hx) * 0.08 + 18 * t;
      const d = `M${f1(kx)} ${f1(ky)} Q${f1(mx)} ${f1(my)} ${f1(hx)} ${f1(hy)}`;
      for (const cls of [".ff-cord-shadow", ".ff-cord-line", ".ff-cord-glint"]) setAttr(g.querySelector(cls), "d", d);
      setAttr(g.querySelector(".ff-cord-shadow"), "transform", `translate(3 ${f1(6)})`);
      g.toggleAttribute("data-primary", t === 0);
      setVar(g, "--w", (Math.max(0.6, k) * 1).toFixed(2));
    }
  }
  setVar(svg, "--cord", span(p, 0.5, 0.85).toFixed(3));
};

/* ── The snare ─────────────────────────────────────────────────────────── */

/**
 * The noose. `hidden`: lying open under a skin of snow with one gleam of
 * cord; `cinch`: it snaps shut and up round a foot, the knot running down the
 * cord; `held`: shut. `squash` is the angle it is seen at.
 */
const Loop = ({ cue }: VfxProps) => {
  const q = cue.params ?? {};
  const rand = seeded(cue.seed ?? 5);
  const squash = Number(q.squash ?? 0.3);
  return (
    <svg className="ff-loop" data-mode={String(q.mode ?? "hidden")} viewBox="-160 -120 320 240" style={v({ "--sq": squash })}>
      <g className="ff-loop-body">
        <ellipse className="ff-loop-shadow" rx="120" ry={120 * squash} cy="6" />
        <ellipse className="ff-loop-rope" rx="120" ry={120 * squash} />
        <ellipse className="ff-loop-glow" rx="120" ry={120 * squash} pathLength={1} />
        <path className="ff-loop-tie" d={`M112 ${-6} l30 -8 l-6 22 Z`} />
      </g>
      {q.mode === "hidden" && (
        <g className="ff-loop-snow">
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2 + rand() * 0.4;
            return <ellipse key={i} cx={Math.cos(a) * 120} cy={Math.sin(a) * 120 * squash} rx={26 + rand() * 20} ry={7 + rand() * 4} />;
          })}
        </g>
      )}
    </svg>
  );
};

/**
 * The snare, sprung: the cord whipped round the enemy's legs in three tight
 * turns and knotted where the line comes in, sized from the figure's drawn
 * height (`--ah`), so a hound is hobbled across all four legs and the
 * Collector round its ankles. The turns wrap on in the first sixth of its
 * life.
 */
const Hobble = () => (
  <svg className="ff-hobble" viewBox="-100 -60 200 70" preserveAspectRatio="none">
    {[0, 1, 2].map((i) => {
      const y = -10 - i * 14;
      const d = `M${-78 + i * 6} ${y + 8} C${-40} ${y + 22} ${40} ${y + 16} ${78 - i * 6} ${y - 4}`;
      const back = `M${-78 + i * 6} ${y + 8} C${-40} ${y - 10} ${40} ${y - 16} ${78 - i * 6} ${y - 4}`;
      return (
        <g key={i} style={v({ "--i": i })}>
          <path d={back} pathLength={1} className="ff-hobble-back" />
          <path d={d} pathLength={1} className="ff-hobble-rope" />
          <path d={d} pathLength={1} className="ff-hobble-glint" />
        </g>
      );
    })}
    <path className="ff-hobble-knot" d="M-92 -18 l16 -8 l8 14 l-12 12 Z" />
    <path className="ff-hobble-tag" d="M-96 -2 l10 -2 l-2 12 l-10 2 Z" />
  </svg>
);

/* ── The cord ──────────────────────────────────────────────────────────── */

/**
 * A cord between two points in world units, drawn by its frame. Each end is a
 * point (`ax`/`ay`), or an actor's ground point plus an offset in its drawn
 * height (`a: "caster"`, `afx`, `afy`). `sag` is its slack at the start and
 * `tautAt` the moment it comes straight; with `rip`, snow sprays off it along
 * its whole length as it comes up out of the ground.
 */
const Cord = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 21);
  return (
    <svg className="ff-world ff-cord" viewBox="0 0 1600 900" {...data(cue.params)}>
      <path className="ff-cord-shadow" />
      <path className="ff-cord-line" />
      <path className="ff-cord-glint" />
      {cue.params?.rip && (
        <g className="ff-rip">
          {Array.from({ length: 22 }, (_, i) => (
            <ellipse
              key={i}
              data-k={(i / 21).toFixed(3)}
              rx={7 + rand() * 12}
              ry={5 + rand() * 8}
              style={v({ "--dx": `${(rand() - 0.5) * 60}px`, "--dy": `${-30 - rand() * 90}px`, "--d": (i / 21) * 0.5 })}
            />
          ))}
        </g>
      )}
    </svg>
  );
};

function endpoint(q: DOMStringMap, which: "a" | "b", ctx: VfxContext): [number, number] {
  const who = q[which];
  if (who) {
    const actor = ctx.actor(who === "caster" ? "caster" : `targets-${who === "target" ? 0 : who}`);
    if (actor) return [actor.x + actor.h * num(q, `${which}fx`, 0), actor.y - actor.h * num(q, `${which}fy`, 0)];
  }
  return [num(q, `${which}x`, 0), num(q, `${which}y`, 0)];
}

const cordFrame: Frame = (el, p, _age, ctx) => {
  const svg = el.querySelector<SVGSVGElement>(".ff-cord");
  if (!svg) return;
  const q = paramsOf(el);
  const [ax, ay] = endpoint(q, "a", ctx);
  const [bx, by] = endpoint(q, "b", ctx);
  const tautAt = num(q, "tautat", 2);
  const k = span(p, tautAt - 0.05, tautAt);
  const tremor = num(q, "tremor", 0) * Math.sin(p * 90) * (1 - k);
  const sag = num(q, "sag", 40) * (1 - k) + tremor;
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2 + sag;
  const d = `M${f1(ax)} ${f1(ay)} Q${f1(mx)} ${f1(my)} ${f1(bx)} ${f1(by)}`;
  for (const cls of [".ff-cord-shadow", ".ff-cord-line", ".ff-cord-glint"]) setAttr(svg.querySelector(cls), "d", d);
  setVar(svg, "--taut", k.toFixed(3));
  setVar(svg, "--cw", String(num(q, "w", 1)));
  const rip = svg.querySelector<SVGGElement>(".ff-rip");
  if (rip) {
    setVar(rip, "--rp", span(p, tautAt - 0.05, tautAt + 0.45).toFixed(3));
    if (rip.dataset.key !== d) {
      rip.dataset.key = d;
      for (const e of rip.querySelectorAll<SVGEllipseElement>("ellipse")) {
        const t = Number(e.dataset.k);
        // Along the quadratic, from the target's end (b) back to the hand (a).
        const u = 1 - t;
        const x = u * u * bx + 2 * u * t * mx + t * t * ax;
        const y = u * u * by + 2 * u * t * my + t * t * ay;
        setAttr(e, "cx", f1(x));
        setAttr(e, "cy", f1(y));
      }
    }
  }
};

/* ── The bite ──────────────────────────────────────────────────────────── */

/** Snow thrown up from the ground: uneven clumps, some torn loose, in three drawings. */
function crown(seed: number) {
  const rand = seeded(seed);
  const clumps: { d: string; shade: string }[] = [];
  const blob = (cx: number, cy: number, r: number) => {
    let d = "";
    const n = 7;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (0.7 + rand() * 0.5);
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr * 0.8;
      d += i ? ` S${f1(x + Math.cos(a + 1.2) * r * 0.3)} ${f1(y + Math.sin(a + 1.2) * r * 0.3)} ${f1(x)} ${f1(y)}` : `M${f1(x)} ${f1(y)}`;
    }
    return `${d} Z`;
  };
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (1.08 + (i / (n - 1)) * 0.84) + (rand() - 0.5) * 0.35;
    const len = 50 + rand() * 140;
    const w = 16 + rand() * 36;
    const ex = Math.cos(a) * len;
    const ey = Math.sin(a) * len;
    const nx = -Math.sin(a) * w;
    const ny = Math.cos(a) * w;
    const d = `M${f1(nx * 0.4)} ${f1(ny * 0.4)} C${f1(ex * 0.4 + nx)} ${f1(ey * 0.4 + ny)} ${f1(ex + nx * 0.5)} ${f1(ey + ny * 0.5)} ${f1(ex)} ${f1(ey)} C${f1(ex - nx * 1.1)} ${f1(ey - ny * 1.1)} ${f1(ex * 0.3 - nx)} ${f1(ey * 0.3 - ny)} ${f1(-nx * 0.4)} ${f1(-ny * 0.4)} Z`;
    clumps.push({ d, shade: [LIT, "#c9d6ee", SHADOW][Math.floor(rand() * 3)] });
  }
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (1.05 + rand() * 0.9);
    const r = 110 + rand() * 130;
    clumps.push({ d: blob(Math.cos(a) * r, Math.sin(a) * r * 0.9, 10 + rand() * 22), shade: rand() < 0.7 ? LIT : "#c9d6ee" });
  }
  return clumps;
}

const Burst = ({ cue }: VfxProps) => {
  const seed = cue.seed ?? 3;
  const rand = seeded(seed + 40);
  return (
    <div className="ff-burst">
      <svg viewBox="-280 -300 560 340" className="ff-burst-art">
        <ellipse className="ff-burst-ground" rx="250" ry="34" cy="0" />
        {[0, 1, 2].map((k) => (
          <g key={k} className="ff-burst-frame" data-k={k}>
            {crown(seed + k * 13).map((c, i) => (
              <path key={i} d={c.d} fill={c.shade} className="ff-burst-clump" />
            ))}
          </g>
        ))}
      </svg>
      <div className="ff-chunks">
        {Array.from({ length: 16 }, (_, i) => {
          const a = -Math.PI * (0.08 + rand() * 0.84);
          const dist = 180 + rand() * 280;
          const s = 10 + rand() * 22;
          return (
            <i
              key={i}
              style={v({
                "--dx": `${Math.cos(a) * dist}px`,
                "--dy": `${Math.sin(a) * dist}px`,
                "--w": `${s}px`,
                "--h": `${s * (0.6 + rand() * 0.4)}px`,
                "--r": `${(rand() - 0.5) * 400}deg`,
              })}
            />
          );
        })}
      </div>
    </div>
  );
};

const burstFrame: Frame = (el, _p, age) => {
  const k = String(Math.floor(age / 50) % 3);
  const art = el.querySelector<SVGSVGElement>(".ff-burst-art");
  if (art && art.dataset.k !== k) art.dataset.k = k;
};

/* ── The cold ──────────────────────────────────────────────────────────── */

/**
 * Breath in the cold: clouds out of the mouth at `a`, `b` (fractions of the
 * effect's life), drifting forward and up and thinning; after `hold` no more
 * come.
 */
const Breath = ({ cue }: VfxProps) => {
  const q = cue.params ?? {};
  const puffs = String(q.puffs ?? "0,0.3").split(",").map(Number);
  return (
    <div className="ff-breath">
      {puffs.map((at, i) => (
        <i key={i} style={v({ "--at": at })}>
          <b />
          <b />
          <b />
        </i>
      ))}
    </div>
  );
};

/** The last flakes. Drifting, or (`still`) hung in the air. */
const Flakes = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 51);
  const count = Number(cue.params?.count ?? 40);
  return (
    <div className="ff-flakes" data-still={cue.params?.still ? "" : undefined}>
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          data-x={rand().toFixed(3)}
          data-y={rand().toFixed(3)}
          data-speed={(0.05 + rand() * 0.1).toFixed(3)}
          style={v({ "--s": (0.4 + rand() * 1.1).toFixed(2), "--o": (0.35 + rand() * 0.6).toFixed(2) })}
        />
      ))}
    </div>
  );
};

const flakesFrame: Frame = (el, _p, age) => {
  const box = el.querySelector<HTMLElement>(".ff-flakes");
  if (!box) return;
  const w = box.offsetWidth;
  const h = box.offsetHeight;
  const still = box.dataset.still !== undefined;
  const t = still ? 0 : age / 1000;
  for (const f of box.querySelectorAll<HTMLElement>("i")) {
    const sp = Number(f.dataset.speed);
    const y = ((Number(f.dataset.y) + t * sp) % 1) * h;
    const x = Number(f.dataset.x) * w + Math.sin(t * 2 + Number(f.dataset.y) * 9) * 8;
    const tr = `translate3d(${f1(x)}px, ${f1(y)}px, 0)`;
    if (f.style.transform !== tr) f.style.transform = tr;
  }
};

/** A drift's lip, the snow the kid is hidden behind, across the bottom of the frame. */
const Drift = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 71);
  const w = Number(cue.params?.w ?? 1600);
  const h = Number(cue.params?.h ?? 260);
  let top = `M0 ${h}`;
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * w;
    const y = 40 + rand() * 60;
    top += ` S${f1(x - w / n / 2)} ${f1(y - 30)} ${f1(x)} ${f1(y)}`;
  }
  return (
    <svg className="ff-drift" viewBox={`0 0 ${w} ${h}`} style={{ width: `${w}px`, height: `${h}px` }}>
      <path d={`${top} L${w} ${h} Z`} fill={SHADOW} transform="translate(0 16)" />
      <path d={`${top} L${w} ${h} Z`} fill="#c8d5ec" />
      <path d={top.replace(`M0 ${h}`, "M0 80")} fill="none" stroke={LIT} strokeWidth="9" strokeLinecap="round" opacity="0.9" />
      {Array.from({ length: 30 }, (_, i) => (
        <circle key={i} cx={rand() * w} cy={90 + rand() * (h - 100)} r={1.5 + rand() * 3} fill="#fff" opacity={0.4 + rand() * 0.5} />
      ))}
    </svg>
  );
};

/**
 * Powder thrown across the lens. `in`: it comes over the frame from the left
 * and covers it; `out`: it leaves off the right. The cut between the two is
 * behind it.
 */
const Spray = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 61);
  return (
    <div className="ff-spray" data-mode={String(cue.params?.mode ?? "in")}>
      <i className="ff-spray-sheet" />
      {Array.from({ length: 34 }, (_, i) => (
        <b
          key={i}
          style={v({
            "--y": `${-8 + (i / 33) * 116 + (rand() - 0.5) * 6}%`,
            "--x": `${(rand() - 0.5) * 22}vw`,
            "--s": (0.7 + rand() * 1.1).toFixed(2),
            "--o": (0.7 + rand() * 0.3).toFixed(2),
          })}
        />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <u
          key={i}
          style={v({
            "--y": `${rand() * 100}%`,
            "--x": `${8 + rand() * 30}vw`,
            "--s": (0.3 + rand() * 0.6).toFixed(2),
          })}
        />
      ))}
    </div>
  );
};

/* ── On the real battlefield ───────────────────────────────────────────── */

/**
 * `call`: four prints dent the floor behind the enemy (it came from the
 * right) and light one after another up to its feet. `snared`: a noose
 * cinched round its feet with a puff of snow, the cord staked off along the
 * floor behind it; the Ultimate's own target (the first on the board) is
 * knotted twice and carries an amber tag.
 */
const Board = ({ cue }: VfxProps) => {
  const mode = String(cue.params?.mode ?? "call");
  return (
    <div className="ff-board" data-mode={mode}>
      <svg viewBox="-200 -120 400 160" className="ff-board-art">
        {mode === "call" ? (
          [0, 1, 2, 3].map((i) => (
            <g key={i} className="ff-board-step" style={v({ "--d": ((3 - i) * 0.16).toFixed(2) })} transform={`translate(${46 + i * 56} ${-4 - i * 6 + (i % 2) * 12}) scale(0.46 0.18)`}>
              <PrintArt />
            </g>
          ))
        ) : (
          <>
            <ellipse className="ff-board-puff" cx="0" cy="-4" rx="70" ry="18" />
            <path className="ff-board-stake-cord" pathLength={1} d="M36 -2 Q110 10 170 -4" />
            <path className="ff-board-stake" d="M166 -4 l6 -26 l6 0 l-2 28 Z" />
            <g className="ff-board-noose">
              <path className="ff-board-loop-back" d="M-52 -8 Q0 -26 52 -8" />
              <path className="ff-board-loop-ink" d="M-52 -8 Q0 14 52 -8" />
              <path className="ff-board-loop" d="M-52 -8 Q0 14 52 -8" />
              <path className="ff-board-loop-ink b" d="M-48 -24 Q0 -4 48 -24" />
              <path className="ff-board-loop b" d="M-48 -24 Q0 -4 48 -24" />
              <path className="ff-board-knot" d="M36 -14 l14 4 l-6 12 l-12 -6 Z" />
              <path className="ff-board-tag" d="M48 -6 l18 -2 l-4 16 l-16 2 Z" />
            </g>
          </>
        )}
      </svg>
    </div>
  );
};

const boardFrame: Frame = (el) => {
  // The first `ff-board` anchored in a shot is on the Ultimate's own target.
  if (el.dataset.ffPrimary === undefined) {
    const first = el.parentElement?.querySelector(".cine-anchored[data-vfx='ff-board']");
    el.dataset.ffPrimary = first === el ? "1" : "0";
    el.querySelector(".ff-board")?.toggleAttribute("data-primary", first === el);
  }
};

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "ff-print": Print,
  "ff-trail": Trail,
  "ff-loop": Loop,
  "ff-hobble": Hobble,
  "ff-cord": Cord,
  "ff-burst": Burst,
  "ff-breath": Breath,
  "ff-flakes": Flakes,
  "ff-drift": Drift,
  "ff-spray": Spray,
  "ff-board": Board,
};

export const frames: Record<string, Frame> = {
  "ff-trail": trailFrame,
  "ff-cord": cordFrame,
  "ff-burst": burstFrame,
  "ff-flakes": flakesFrame,
  "ff-board": boardFrame,
};
