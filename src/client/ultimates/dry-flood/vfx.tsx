import { useId, type ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ease } from "../../cinematic/timeline";
import { FIRE, FireDefs, Puff, Tongue, boil, fade, place } from "./fire";
import { FLOOR, FOOT, LENGTH, PIECES, RISER, RISES, TREAD, VP, edgeX } from "./weir";
import { POUR_TIP_MS } from "./poses";
import "./style.css";

/**
 * Dry Flood's effects.
 *
 * The idea they serve: the Pyromancer tips its spark over the lip of a dry
 * spillway and the fire goes down it the way the water used to, faster. So
 * the fire here is always *going somewhere*: poured off a glove, running down
 * steps, flooding a floor, and it is drawn one way everywhere (`fire.tsx`):
 * tongues in four flat layers with the spark's blue at the root, boiling
 * between three drawings.
 *
 *   dry-flame      the spark in the glove, turned to a flame, until it is poured
 *   dry-pour       a ribbon of fire falling from the glove, tongues licking up it
 *   dry-fire       the fire on the spillway (`weir.ts`): its front running down
 *                  the steps, a sheet of flame over each riser, then the basin
 *                  flooding; `band` splits the floor into the tongues behind the
 *                  row and the low ones in front of it
 *   dry-flare      a column of flame shooting up a struck figure
 *   dry-smoke      smoke rising off what burns
 *   dry-smoke-wipe smoke rolling across the lens, for the cut into the quiet
 *   dry-crest      the quiet: light along the top step, the fire just out of sight
 *   dry-draft      the quiet: the air drawn up the steps towards the fire
 *   dry-kindle     on the board: the flame catching in the real glove
 *   dry-burning    on the board: every real enemy in the row still burning
 *   dry-singe      on the board: the Pyromancer's own sleeve alight, beaten out
 *
 * Everything moves from a frame function or the stage's variables; no
 * filters, no keyframes, and a glow is a small flat gradient at most. Clip
 * timing is read in milliseconds (`age`), because a clip plays at one rate in
 * FULL and FAST while a shot's fractions do not.
 */

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const num = (value: unknown, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const fid = (raw: string) => `dry${raw.replace(/[^a-zA-Z0-9]/g, "")}`;

/* ── Where things are ─────────────────────────────────────────────────── */

/** A client rect's centre, in the world units of an effect's wrapper. */
function toWorld(el: HTMLElement, x: number, y: number) {
  const film = el.closest<HTMLElement>(".ult-cinematic");
  const world = film?.querySelector<HTMLElement>(".cine-world");
  if (!film || !world) return null;
  const root = film.getBoundingClientRect();
  const m = new DOMMatrix(world.style.transform || "none").inverse();
  const wrap = el.getBoundingClientRect();
  const origin = m.transformPoint(new DOMPoint(wrap.left - root.left, wrap.top - root.top));
  const at = m.transformPoint(new DOMPoint(x - root.left, y - root.top));
  return { x: at.x - origin.x, y: at.y - origin.y, zoom: 1 / Math.hypot(m.a, m.b) };
}

/**
 * The caster's flame, in world units: the spark while it is drawn, else the
 * glove (a worn weapon hides the spark, and a poured spark is gone).
 */
function flameAt(el: HTMLElement) {
  const film = el.closest<HTMLElement>(".ult-cinematic");
  const caster = film?.querySelector<HTMLElement>('.cine-actors > .cine-actor[data-role="caster"]');
  if (!caster) return null;
  const spark = caster.querySelector<SVGGraphicsElement>('[data-part="spark"] circle');
  const s = spark?.getBoundingClientRect();
  const glove = caster.querySelector<SVGGraphicsElement>('[data-part="hand"] path[fill="#d8c8ae"]');
  const g = glove?.getBoundingClientRect();
  if (s && s.width > 2) {
    // Held in the palm: between the spark's own place and the glove.
    const gx = g && g.width ? g.left + g.width * 0.7 : s.left + s.width / 2;
    const gy = g && g.width ? g.top + g.height * 0.35 : s.top + s.height / 2;
    const at = toWorld(el, lerp(s.left + s.width / 2, gx, 0.45), lerp(s.top + s.height / 2, gy, 0.45));
    return at && { ...at, size: s.width, spark: true };
  }
  if (!g || !g.width) return null;
  const at = toWorld(el, g.left + g.width * 0.75, g.top + g.height * 0.5);
  return at && { ...at, size: g.width, spark: false };
}

/* ── The spark, a flame ───────────────────────────────────────────────── */

const Flame = ({ cue }: VfxProps): ReactNode => {
  const id = fid(useId());
  return (
    <svg className="dry-world dry-fire-svg" viewBox="0 0 1600 900" data-k="0" data-tip={String(cue.params?.tip ?? POUR_TIP_MS)}>
      <FireDefs id={id} />
      <radialGradient id={`${id}-glow`}>
        <stop offset="0" stopColor={FIRE.gold} stopOpacity="0.55" />
        <stop offset="1" stopColor={FIRE.orange} stopOpacity="0" />
      </radialGradient>
      <g className="dry-flame">
        <circle className="dry-flame-glow" cy="-30" r="70" fill={`url(#${id}-glow)`} />
        <g transform="rotate(-8) scale(0.72)">
          <Tongue id={id} ph={0} />
        </g>
        <g transform="translate(-14 4) rotate(-22) scale(0.42)">
          <Tongue id={id} ph={1} />
        </g>
        <g transform="translate(15 3) rotate(18) scale(0.46)">
          <Tongue id={id} ph={2} />
        </g>
      </g>
    </svg>
  );
};

const flame: Frame = (el, _p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".dry-fire-svg");
  const g = svg?.querySelector(".dry-flame");
  if (!svg || !g) return;
  boil(svg, age, 60);
  const tip = num(svg.dataset.tip, POUR_TIP_MS);
  const at = age < tip ? flameAt(el) : null;
  if (!at) {
    fade(g, 0);
    return;
  }
  // The flame is the spark's size and a half again, and grows as it swells.
  const size = at.size * at.zoom;
  const k = clamp(size / 90, 0.25, 2);
  place(g, `translate(${at.x.toFixed(1)} ${(at.y + size * 0.3).toFixed(1)}) scale(${k.toFixed(3)})`);
  fade(g, 1);
};

/* ── Poured ───────────────────────────────────────────────────────────── */

const POUR_TONGUES = 16;

const Pour = ({ cue }: VfxProps): ReactNode => {
  const id = fid(useId());
  const rand = seeded(cue.seed ?? 5);
  return (
    <svg
      className="dry-world dry-fire-svg"
      viewBox="0 0 1600 900"
      data-k="0"
      data-tip={String(cue.params?.tip ?? POUR_TIP_MS)}
      data-land={String(cue.params?.land ?? 1150)}
    >
      <FireDefs id={id} />
      <g className="dry-pour" opacity="0">
        <path className="dry-pour-band" fill={FIRE.orange} />
        <path className="dry-pour-core" fill={FIRE.gold} />
        {Array.from({ length: POUR_TONGUES }, (_, i) => (
          <g key={i} className="dry-pour-t" data-off={(i / POUR_TONGUES + rand() * 0.03).toFixed(3)} data-sway={((rand() - 0.5) * 16).toFixed(1)}>
            <Tongue id={id} ph={i} />
          </g>
        ))}
        {/* where it lands: the step below catches all at once */}
        {Array.from({ length: 9 }, (_, i) => (
          <g key={`s${i}`} className="dry-pour-splash" data-x={((i - 4) * 38 + (rand() - 0.5) * 16).toFixed(0)} data-s={(1.3 - Math.abs(i - 4) * 0.2 + rand() * 0.2).toFixed(2)} data-r={((i - 4) * 7).toFixed(0)} opacity="0">
            <Tongue id={id} ph={i + 1} />
          </g>
        ))}
      </g>
    </svg>
  );
};

/** Where the pour left the glove, kept so it hangs from there as the hand moves on. */
const pourFrom = new WeakMap<HTMLElement, { x: number; y: number }>();

const pour: Frame = (el, _p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".dry-fire-svg");
  const g = svg?.querySelector(".dry-pour");
  if (!svg || !g) return;
  boil(svg, age, 55);
  const tip = num(svg.dataset.tip, POUR_TIP_MS);
  const land = num(svg.dataset.land, 1150);
  if (age < tip - 10) {
    fade(g, 0);
    return;
  }
  const at = flameAt(el);
  if (at) pourFrom.set(el, { x: at.x, y: at.y });
  const from = pourFrom.get(el);
  if (!from) return;
  fade(g, 1);
  // The ribbon runs out of the glove and down the drop to the step below in 130ms.
  const run = clamp((age - tip + 10) / 130);
  const L = Math.max(0, land - from.y) * run;
  // It bows away from the lip as it falls, and spreads as it goes.
  const bow = 46;
  const mid = (k: number) => bow * k * k;
  const half = (k: number) => 14 + 40 * k;
  const edge = (side: number, scale: number) =>
    [0, 0.2, 0.4, 0.6, 0.8, 1].map((k) => `${(mid(k) + side * half(k) * scale).toFixed(1)} ${(k * L).toFixed(1)}`);
  const shape = (scale: number) => `M${edge(-1, scale).join(" L")} L${edge(1, scale).reverse().join(" L")} Z`;
  const band = shape(1);
  const core = shape(0.42);
  const bandEl = g.querySelector(".dry-pour-band");
  const coreEl = g.querySelector(".dry-pour-core");
  if (bandEl?.getAttribute("d") !== band) bandEl?.setAttribute("d", band);
  if (coreEl?.getAttribute("d") !== core) coreEl?.setAttribute("d", core);
  place(g, `translate(${from.x.toFixed(1)} ${from.y.toFixed(1)})`);
  // Tongues ride down both edges of the ribbon as it falls, and every one of
  // them licks up and outwards: it is fire, not water, however it is poured.
  let i = 0;
  for (const t of g.querySelectorAll<SVGGElement>(".dry-pour-t")) {
    const side = i++ % 2 ? 1 : -1;
    const k = (num(t.dataset.off, 0) + age / 480) % 1;
    const y = k * L;
    const x = mid(k) + side * half(k) * 0.8;
    const s = (0.4 + k * 0.6) * (y < L ? 1 : 0);
    place(t, `translate(${x.toFixed(1)} ${(y + 8).toFixed(1)}) rotate(${(side * 34 + num(t.dataset.sway, 0)).toFixed(1)}) scale(${s.toFixed(3)})`);
  }
  // Landed: a burst of tongues on the step, settling to a burn.
  const since = age - tip - 120;
  for (const t of g.querySelectorAll<SVGGElement>(".dry-pour-splash")) {
    if (since < 0) {
      fade(t, 0);
      continue;
    }
    const up = since < 60 ? since / 60 : lerp(1, 0.7, clamp((since - 60) / 300));
    const s = num(t.dataset.s, 1) * up;
    place(t, `translate(${(bow + num(t.dataset.x, 0)).toFixed(1)} ${L.toFixed(1)}) rotate(${t.dataset.r}) scale(${(s * 0.95).toFixed(3)} ${s.toFixed(3)})`);
    fade(t, 1);
  }
};

/* ── The fire on the spillway ─────────────────────────────────────────── */

interface Spot {
  /** Distance along the steps where the fire reaches it. */
  d: number;
  x: number;
  y: number;
  size: number;
  ph: number;
  kind: "tread" | "riser" | "floor";
}

/**
 * Every place a tongue stands on the spillway: three on each tread, two up
 * each riser's face, and the floor in rows. The floor's back row stands
 * behind the actors, its front rows before their feet.
 */
function spots(band: string, seed: number): Spot[] {
  const rand = seeded(seed);
  const out: Spot[] = [];
  let ph = 0;
  if (band !== "front")
    for (const piece of PIECES) {
      if (piece.kind === "tread")
        for (const off of [16, 46, 76])
          out.push({ d: piece.d + off, x: piece.x0 + off + (rand() - 0.5) * 10, y: piece.y0 + 2, size: 0.7 + rand() * 0.4, ph: ph++, kind: "tread" });
      else
        for (const off of [26, 60])
          out.push({ d: piece.d + off, x: piece.x0 + 6, y: piece.y0 + off + 16, size: 0.42 + rand() * 0.2, ph: ph++, kind: "riser" });
    }
  const floorStart = FOOT + TREAD;
  const rows: [number, number, number][] =
    band === "back" ? [[FLOOR + 4, 34, 1]] : band === "front" ? [[FLOOR + 50, 46, 0.62], [FLOOR + 92, 52, 0.5]] : [[FLOOR + 4, 40, 1]];
  for (const [y, gap, size] of rows)
    for (let x = floorStart - 30; x < 2300; x += gap * (0.8 + rand() * 0.4))
      out.push({ d: LENGTH + (x - floorStart), x, y: y + (rand() - 0.5) * 8, size: size * (0.75 + rand() * 0.5), ph: ph++, kind: "floor" });
  return out;
}

const Fire = ({ cue }: VfxProps): ReactNode => {
  const id = fid(useId());
  const band = String(cue.params?.band ?? "all");
  const list = spots(band, cue.seed ?? 11);
  const smoke = !!cue.params?.smoke;
  return (
    <svg
      className="dry-world dry-fire-svg"
      viewBox="0 0 1600 900"
      data-k="0"
      data-from={String(cue.params?.from ?? 0)}
      data-to={String(cue.params?.to ?? LENGTH)}
      data-go={String(cue.params?.go ?? 0)}
      data-end={String(cue.params?.end ?? 1)}
      data-ease={String(cue.params?.ease ?? "linear")}
      data-surge={String(cue.params?.surge ?? 1.5)}
      data-floor-surge={String(cue.params?.floorSurge ?? 2.3)}
      data-s={String(cue.scale ?? 1)}
      data-reach={String(cue.params?.reach ?? 2400)}
    >
      <FireDefs id={id} />
      {band !== "front" &&
        PIECES.filter((p) => p.kind === "riser").map((p, i) => (
          <rect key={`sheet-${i}`} className="dry-sheet" data-d={p.d} x={p.x0 - 2} y={p.y0} width="16" height={RISER} fill={FIRE.orange} opacity="0" />
        ))}
      {smoke &&
        PIECES.filter((p) => p.kind === "tread").map((p, i) => (
          <g key={`puff-${i}`} className="dry-rise" data-d={p.d + 45} data-x={p.x0 + 45} data-y={p.y0 - 30} opacity="0">
            <Puff />
          </g>
        ))}
      {list.map((s, i) => (
        <g key={i} className="dry-spot" data-d={s.d.toFixed(0)} data-x={s.x.toFixed(1)} data-y={s.y.toFixed(1)} data-size={s.size.toFixed(2)} data-kind={s.kind} opacity="0">
          <Tongue id={id} ph={s.ph} />
        </g>
      ))}
    </svg>
  );
};

/** How tall a tongue stands `a` units behind the front: a surge, then settling. */
function height(a: number, surge: number) {
  if (a < 0) return 0;
  if (a < 36) return (a / 36) * surge;
  if (a < 220) return lerp(surge, 0.9, (a - 36) / 184);
  return 0.9;
}

const fire: Frame = (el, p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".dry-fire-svg");
  if (!svg) return;
  boil(svg, age, 55);
  const d = svg.dataset;
  const go = num(d.go, 0);
  const end = num(d.end, 1);
  const k = ease((d.ease ?? "linear") as never, (p - go) / Math.max(0.001, end - go));
  const front = lerp(num(d.from, 0), num(d.to, LENGTH), k);
  const S = num(d.s, 1);
  const surge = num(d.surge, 1.5);
  const floorSurge = num(d.floorSurge, 2.3);
  const reach = num(d.reach, 2400);
  const t = age / 1000;
  for (const spot of svg.querySelectorAll<SVGGElement>(".dry-spot")) {
    const sd = spot.dataset;
    const x = num(sd.x, 0);
    const a = front - num(sd.d, 0);
    if (a < 0 || x > reach) {
      fade(spot, 0);
      continue;
    }
    const floor = sd.kind === "floor";
    const h = height(a, floor ? floorSurge : surge) * num(sd.size, 1) * S;
    const flick = 1 + 0.09 * Math.sin(t * 9 + x * 0.05);
    // Near the front every tongue leans the way the fire runs.
    const lean = a < 260 ? lerp(22, 6, a / 260) : 6;
    place(spot, `translate(${x.toFixed(1)} ${num(sd.y, 0).toFixed(1)}) rotate(${lean.toFixed(1)}) scale(${(h * 0.9).toFixed(3)} ${(h * flick).toFixed(3)})`);
    fade(spot, 1);
  }
  for (const sheet of svg.querySelectorAll<SVGRectElement>(".dry-sheet")) {
    const a = front - num(sheet.dataset.d, 0);
    fade(sheet, a < 0 ? 0 : clamp(a / 40) * 0.9);
  }
  for (const puff of svg.querySelectorAll<SVGGElement>(".dry-rise")) {
    const a = front - num(puff.dataset.d, 0) - 90;
    if (a < 0) {
      fade(puff, 0);
      continue;
    }
    const rise = a * 0.55;
    const s = (0.35 + Math.min(1.1, a / 300)) * S;
    place(puff, `translate(${(num(puff.dataset.x, 0) + rise * 0.3).toFixed(1)} ${(num(puff.dataset.y, 0) - rise).toFixed(1)}) scale(${s.toFixed(3)})`);
    fade(puff, clamp(a / 60) * (1 - clamp((a - 260) / 260)) * 0.85);
  }
};

/* ── A column of flame up a struck figure ─────────────────────────────── */

const Flare = ({ cue }: VfxProps): ReactNode => {
  const id = fid(useId());
  return (
    <svg className="dry-flare" viewBox="-300 -600 600 640" data-k="0" data-hit={String(cue.params?.hit ?? 0)}>
      <FireDefs id={id} />
      {[
        [-70, 1.9, -16, 1],
        [60, 2.1, 14, 2],
        [-10, 3.2, -2, 0],
        [-140, 1.2, -26, 1],
        [130, 1.3, 26, 2],
      ].map(([x, s, r, ph], i) => (
        <g key={i} className="dry-flare-t" data-x={x} data-s={s} data-r={r} opacity="0">
          <Tongue id={id} ph={ph} />
        </g>
      ))}
    </svg>
  );
};

const flare: Frame = (el, p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".dry-flare");
  if (!svg) return;
  boil(svg, age, 45);
  const hit = num(svg.dataset.hit, 0);
  // From just before the hit: up hard in a few frames, then falling back to a burn.
  for (const t of svg.querySelectorAll<SVGGElement>(".dry-flare-t")) {
    if (p < hit) {
      fade(t, 0);
      continue;
    }
    const up = p < hit + 0.03 ? (p - hit) / 0.03 : lerp(1, 0.45, clamp((p - hit - 0.03) / 0.55));
    const s = num(t.dataset.s, 1) * up;
    place(t, `translate(${t.dataset.x} 0) rotate(${t.dataset.r}) scale(${(s * 0.95).toFixed(3)} ${s.toFixed(3)})`);
    fade(t, 1);
  }
};

/* ── Smoke ────────────────────────────────────────────────────────────── */

const Smoke = ({ cue }: VfxProps): ReactNode => {
  const rand = seeded(cue.seed ?? 3);
  const at = String(cue.params?.at ?? "800,700");
  const points = at.split(";").map((xy) => xy.split(",").map(Number));
  return (
    <svg className="dry-world" viewBox="0 0 1600 900">
      {points.map(([x, y], i) => (
        <g key={i} className="dry-smoke-puff" data-x={x} data-y={y} data-drift={((rand() - 0.3) * 60).toFixed(0)} data-delay={(i * 0.08 + rand() * 0.05).toFixed(3)} opacity="0">
          <Puff />
        </g>
      ))}
    </svg>
  );
};

const smoke: Frame = (el, p) => {
  const s = num(el.style.getPropertyValue("--s"), 1);
  for (const puff of el.querySelectorAll<SVGGElement>(".dry-smoke-puff")) {
    const k = clamp((p - num(puff.dataset.delay, 0)) / 0.9);
    const y = num(puff.dataset.y, 0) - k * 260 * s;
    const x = num(puff.dataset.x, 0) + k * num(puff.dataset.drift, 0);
    place(puff, `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${((0.8 + k * 0.6) * s).toFixed(3)} ${((0.6 + k * 1.1) * s).toFixed(3)})`);
    fade(puff, clamp(k / 0.15) * (1 - clamp((k - 0.55) / 0.45)) * 0.7);
  }
};

/* ── Smoke across the lens ────────────────────────────────────────────── */

const Wipe = ({ cue }: VfxProps): ReactNode => {
  const rand = seeded(41);
  return (
    <div className="dry-wipe" data-half={String(cue.params?.half ?? "out")}>
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
        <rect x="150" y="-40" width="400" height="280" fill={FIRE.smoke} />
        {Array.from({ length: 16 }, (_, i) => {
          const y = -30 + (i / 15) * 260;
          const x = 150 - 20 - rand() * 60;
          const r = 34 + rand() * 30;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill={FIRE.smoke} />
              <path d={`M${x - r * 0.8} ${y + r * 0.5} A${r} ${r} 0 0 0 ${x + r * 0.6} ${y + r * 0.8}`} fill="none" stroke={FIRE.orange} strokeOpacity="0.35" strokeWidth="4" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const wipe: Frame = (el, p) => {
  const node = el.querySelector<HTMLElement>(".dry-wipe");
  if (!node) return;
  // One roll across the lens split over the cut: out covers, in uncovers.
  const k = node.dataset.half === "in" ? 0.5 + p * 0.7 : p * 0.5;
  const value = `translate3d(${((k - 0.5) * 240).toFixed(2)}%, ${(Math.sin(k * Math.PI) * -4).toFixed(2)}%, 0)`;
  if (node.style.transform !== value) node.style.transform = value;
};

/* ── The quiet: the top step catching light, and the air drawn up ────── */

/**
 * The fire just beyond the top step, seen from the basin: a crowd of tongue
 * tips over the lip, their bases hidden behind the top riser, a glow over
 * them, and the noses of the top steps catching its light one by one.
 */
const Crest = ({ cue }: VfxProps): ReactNode => {
  const id = fid(useId());
  const rand = seeded(cue.seed ?? 29);
  const top = RISES[RISES.length - 1];
  const under = RISES[RISES.length - 2];
  const left = edgeX(-1, top);
  const right = edgeX(1, top);
  return (
    <svg className="dry-world dry-fire-svg" viewBox="0 0 1600 900" data-k="0">
      <FireDefs id={id} />
      <radialGradient id={`${id}-crest`} cx="0.5" cy="1" r="0.75">
        <stop offset="0" stopColor={FIRE.gold} stopOpacity="0.5" />
        <stop offset="0.45" stopColor={FIRE.orange} stopOpacity="0.28" />
        <stop offset="1" stopColor={FIRE.deep} stopOpacity="0" />
      </radialGradient>
      <ellipse className="dry-crest-glow" cx={VP.x} cy={top} rx={(right - left) * 0.9} ry="260" fill={`url(#${id}-crest)`} />
      {Array.from({ length: 13 }, (_, i) => (
        <g key={i} className="dry-crest-t" data-x={(lerp(left + 20, right - 20, i / 12) + (rand() - 0.5) * 34).toFixed(0)} data-y={top + 22} data-s={(i % 4 === 1 ? 1.35 + rand() * 0.4 : 0.35 + rand() * 0.6).toFixed(2)} data-r={((rand() - 0.5) * 30).toFixed(1)}>
          <Tongue id={id} ph={i} />
        </g>
      ))}
      {/* the top riser, in front of the fire's feet */}
      <path d={`M${left} ${top} L${right} ${top} L${edgeX(1, under)} ${under} L${edgeX(-1, under)} ${under} Z`} fill="#241911" />
      {RISES.slice(-4).map((y, i) => (
        <path key={y} className="dry-crest-nose" data-i={3 - i} d={`M${edgeX(-1, y)} ${y} L${edgeX(1, y)} ${y}`} stroke={FIRE.gold} strokeWidth={6 + i * 2} strokeLinecap="round" opacity="0" />
      ))}
    </svg>
  );
};

const crest: Frame = (el, p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".dry-fire-svg");
  if (!svg) return;
  boil(svg, age, 70);
  const up = ease("in", p);
  fade(svg.querySelector(".dry-crest-glow"), 0.45 + up * 0.55);
  for (const t of svg.querySelectorAll<SVGGElement>(".dry-crest-t")) {
    // Only the tips show over the edge, rising as the fire comes.
    const s = num(t.dataset.s, 0.6) * (0.5 + up * 0.75) * (1 + 0.08 * Math.sin(age / 90 + num(t.dataset.x, 0)));
    place(t, `translate(${t.dataset.x} ${t.dataset.y}) rotate(${t.dataset.r}) scale(${(s * 0.85).toFixed(3)} ${s.toFixed(3)})`);
  }
  // The top nose is lit from the start; the ones below catch the light in turn.
  for (const nose of svg.querySelectorAll<SVGPathElement>(".dry-crest-nose")) {
    const i = num(nose.dataset.i, 0);
    fade(nose, clamp((0.25 + p * 0.9 - i * 0.28) * 1.6) * (0.75 - i * 0.15));
  }
};

const Draft = ({ cue }: VfxProps): ReactNode => {
  const rand = seeded(cue.seed ?? 9);
  return (
    <svg className="dry-world" viewBox="0 0 1600 900">
      <g stroke="#cdbf9f" strokeLinecap="round">
        {Array.from({ length: 18 }, (_, i) => (
          <path
            key={i}
            className="dry-draft-line"
            data-side={(rand() - 0.5).toFixed(3)}
            data-off={rand().toFixed(3)}
            data-speed={(0.5 + rand() * 0.5).toFixed(2)}
            strokeWidth={(2 + rand() * 3).toFixed(1)}
            opacity="0"
          />
        ))}
      </g>
      <path className="dry-leaf" d="M-14 0 C-8 -9 8 -9 14 0 C8 6 -8 6 -14 0 Z M-14 0 L-20 3" fill="#2b1f15" stroke="#6b5640" strokeWidth="2" />
    </svg>
  );
};

const draft: Frame = (el, p, age) => {
  const vp = VP;
  for (const line of el.querySelectorAll<SVGPathElement>(".dry-draft-line")) {
    // Each streak runs from the basin up the steps towards the lip, shrinking
    // into the distance, and comes round again.
    const k = (num(line.dataset.off, 0) + (age / 1000) * num(line.dataset.speed, 0.6) * 0.55) % 1;
    const y0 = lerp(980, 380, k);
    const depth = (y0 - vp.y) / (900 - vp.y);
    const x0 = vp.x + num(line.dataset.side, 0) * 1300 * depth;
    const len = 60 * depth;
    const x1 = vp.x + (x0 - vp.x) * ((y0 - len - vp.y) / (y0 - vp.y));
    const d = `M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${(y0 - len).toFixed(1)}`;
    if (line.getAttribute("d") !== d) line.setAttribute("d", d);
    fade(line, Math.sin(k * Math.PI) * 0.22);
  }
  // One dry leaf lifts off a step and is drawn up after them.
  const leaf = el.querySelector(".dry-leaf");
  const k = ease("in", clamp((p - 0.15) / 0.85));
  place(leaf, `translate(${lerp(980, 900, k).toFixed(1)} ${lerp(700, 470, k).toFixed(1)}) rotate(${(k * 200 - 20).toFixed(1)}) scale(${lerp(1.6, 0.9, k).toFixed(3)})`);
};

/* ── On the board ─────────────────────────────────────────────────────── */

/** The flame catching in the real Arcanist's glove. */
const Kindle = (): ReactNode => {
  const id = fid(useId());
  return (
    <div className="dry-kindle">
      <svg viewBox="-60 -120 120 130" data-k="0">
        <FireDefs id={id} />
        <g className="dry-kindle-g">
          <g transform="rotate(-6)">
            <Tongue id={id} ph={0} />
          </g>
          <g transform="translate(-16 4) rotate(-24) scale(0.55)">
            <Tongue id={id} ph={1} />
          </g>
          <g transform="translate(16 4) rotate(20) scale(0.6)">
            <Tongue id={id} ph={2} />
          </g>
        </g>
      </svg>
    </div>
  );
};

const kindle: Frame = (el, p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".dry-kindle svg");
  if (!svg) return;
  boil(svg, age, 60);
  // It catches at the clip's catch: small, then all at once.
  const k = age < 220 ? 0.25 : Math.min(1, 0.25 + ((age - 220) / 70) * 0.75);
  place(svg.querySelector(".dry-kindle-g"), `scale(${(k * (1 + 0.06 * Math.sin(age / 50))).toFixed(3)})`);
  svg.style.opacity = String(p > 0.98 ? 0 : 1);
  followBoardPart(el, svg.parentElement!, '[data-part="spark"] circle', 0.5, 0.75);
};

/**
 * Put `node` on a part of this effect's real unit on the board: a point of
 * the part's box (fractions across and down). Anchored effects sit at the
 * unit's feet; this moves the drawing onto the part wherever the clip has it.
 */
function followBoardPart(el: HTMLElement, node: HTMLElement, selector: string, fx: number, fy: number) {
  const unit = el.dataset.anchor;
  if (!unit) return;
  const part = document.querySelector<SVGGraphicsElement>(`.stage [data-unit="${CSS.escape(unit)}"] .combatant-rig ${selector}`);
  const r = part?.getBoundingClientRect();
  const home = el.getBoundingClientRect();
  if (!r || (!r.width && !r.height)) return;
  const x = r.left + r.width * fx - home.left;
  const y = r.top + r.height * fy - home.top;
  const value = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  if (node.style.transform !== value) node.style.transform = value;
}

/** A real enemy of the row, still burning: flames at its feet and up it, smoke over it. */
const Burning = ({ cue }: VfxProps): ReactNode => {
  const id = fid(useId());
  const rand = seeded(cue.seed ?? 13);
  return (
    <div className="dry-burning">
      <svg viewBox="-100 -200 200 220" data-k="0" preserveAspectRatio="xMidYMax meet">
        <FireDefs id={id} />
        <ellipse className="dry-scorch" cx="0" cy="2" rx="86" ry="15" fill="#120a06" />
        <path
          className="dry-scorch-edge"
          d={Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const r = 86 + rand() * 18;
            return `${i ? "L" : "M"}${(Math.cos(a) * r).toFixed(1)} ${(2 + Math.sin(a) * r * 0.18).toFixed(1)}`;
          }).join(" ") + "Z"}
          fill="#1d110a"
          opacity="0.6"
        />
        {Array.from({ length: 7 }, (_, i) => {
          const x = -66 + i * 22 + (rand() - 0.5) * 8;
          const s = 0.34 + (1 - Math.abs(i - 3) / 3) * 0.3 + rand() * 0.08;
          return (
            <g key={i} className="dry-burn-t" data-x={x.toFixed(1)} data-y="4" data-s={s.toFixed(2)} data-delay={(rand() * 0.2).toFixed(3)} opacity="0">
              <Tongue id={id} ph={i} />
            </g>
          );
        })}
        {[
          [-20, -62, 0.24],
          [24, -40, 0.2],
          [4, -96, 0.18],
        ].map(([x, y, s], i) => (
          <g key={`up-${i}`} className="dry-burn-t" data-x={x} data-y={y} data-s={s} data-delay={(0.12 + i * 0.08).toFixed(2)} opacity="0">
            <Tongue id={id} ph={i + 1} />
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <g key={`smoke-${i}`} className="dry-burn-puff" data-i={i} opacity="0">
            <Puff />
          </g>
        ))}
      </svg>
    </div>
  );
};

const burning: Frame = (el, p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".dry-burning svg");
  if (!svg) return;
  boil(svg, age, 60);
  const t = age / 1000;
  fade(svg.querySelector(".dry-scorch"), clamp(p / 0.2) * 0.7);
  for (const tongue of svg.querySelectorAll<SVGGElement>(".dry-burn-t")) {
    const k = clamp((p - num(tongue.dataset.delay, 0)) / 0.2);
    const s = num(tongue.dataset.s, 0.4) * ease("out", k) * (1 + 0.1 * Math.sin(t * 8 + num(tongue.dataset.x, 0)));
    place(tongue, `translate(${tongue.dataset.x} ${tongue.dataset.y}) scale(${s.toFixed(3)})`);
    fade(tongue, k > 0 ? 1 : 0);
  }
  for (const puff of svg.querySelectorAll<SVGGElement>(".dry-burn-puff")) {
    const i = num(puff.dataset.i, 0);
    const k = ((t * 0.9 + i / 3) % 1) * clamp(p / 0.15);
    place(puff, `translate(${(Math.sin(i * 2 + t) * 14).toFixed(1)} ${(-110 - k * 120).toFixed(1)}) scale(${(0.22 + k * 0.3).toFixed(3)})`);
    fade(puff, Math.sin(k * Math.PI) * 0.7);
  }
};

/** The Pyromancer's own sleeve alight, beaten out, and the wisp left. */
const Singe = (): ReactNode => {
  const id = fid(useId());
  return (
    <div className="dry-singe">
      <svg viewBox="-60 -140 120 150" data-k="0">
        <FireDefs id={id} />
        <g className="dry-singe-g">
          <g transform="rotate(-10) scale(0.8)">
            <Tongue id={id} ph={2} />
          </g>
          <g transform="translate(14 2) rotate(16) scale(0.5)">
            <Tongue id={id} ph={0} />
          </g>
        </g>
        <path className="dry-wisp" d="M0 0 C-10 -24 12 -40 -2 -66 C-12 -84 6 -100 -4 -120" fill="none" stroke="#5a4a44" strokeWidth="5" strokeLinecap="round" opacity="0" />
      </svg>
    </div>
  );
};

const singe: Frame = (el, p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".dry-singe svg");
  if (!svg) return;
  boil(svg, age, 50);
  // Alight until the flapping beats it out, halfway through the swat.
  const out = clamp((age - 180) / 260);
  place(svg.querySelector(".dry-singe-g"), `scale(${(1 - out).toFixed(3)})`);
  const wisp = svg.querySelector(".dry-wisp");
  const w = clamp((age - 400) / 400);
  fade(wisp, Math.sin(w * Math.PI) * 0.8);
  place(wisp, `translate(0 ${(-w * 30).toFixed(1)}) scale(${(0.5 + w * 0.6).toFixed(3)})`);
  followBoardPart(el, svg.parentElement!, '[data-part="hand"] path[fill="#d8c8ae"]', 0.2, 0.7);
  svg.style.opacity = p > 0.98 ? "0" : "1";
};

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "dry-flame": Flame,
  "dry-pour": Pour,
  "dry-fire": Fire,
  "dry-flare": Flare,
  "dry-smoke": Smoke,
  "dry-smoke-wipe": Wipe,
  "dry-crest": Crest,
  "dry-draft": Draft,
  "dry-kindle": Kindle,
  "dry-burning": Burning,
  "dry-singe": Singe,
};

export const frames: Record<string, Frame> = {
  "dry-flame": flame,
  "dry-pour": pour,
  "dry-fire": fire,
  "dry-flare": flare,
  "dry-smoke": smoke,
  "dry-smoke-wipe": wipe,
  "dry-crest": crest,
  "dry-draft": draft,
  "dry-kindle": kindle,
  "dry-burning": burning,
  "dry-singe": singe,
};
