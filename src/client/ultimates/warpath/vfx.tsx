import type { CSSProperties } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import "./style.css";

/**
 * Warpath: the effects only this film has.
 *
 *   warpath-snow    snow driving across the frame on the wind (`drive`), or
 *                   sinking straight down once the wind has dropped (`settle`)
 *   warpath-breath  the warcry: a plume of breath out of the visor, torn back
 *   warpath-drift   the snow the file wades in: one deep channel of broken
 *                   snow along every figure's legs, heaved up ahead of the
 *                   Warlord's shield with clods thrown off it; a low drift
 *                   round the enemy's feet
 *   warpath-trail   the trail from above: a trench cut across the white
 *   warpath-gust    a sheet of blown snow across the lens (the film's wipe)
 *   warpath-cleave  the blow, drawn: the white split open along the blade
 *   warpath-throw   the snow at the enemy's feet ripped up and thrown
 *   warpath-board   on the real board: boot prints in snow into the front,
 *                   on from the Warlord to the enemy, trampled round its feet
 *
 * Hand-cut shapes with an ink edge, flat snow and blue shadow; no filters and
 * no keyframes. Everything moves on `--p` and friends or in a frame function
 * on the combat clock, and every scatter is seeded.
 */

type Pt = [number, number];
type At = { x: number; y: number; h: number };

const v = (vars: Record<string, string | number>) => vars as CSSProperties;
const f2 = (n: number) => n.toFixed(2);
const f1 = (n: number) => n.toFixed(1);
const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const num = (el: Element, key: string, fallback: number) => {
  const raw = (el as HTMLElement).dataset[key];
  return raw === undefined ? fallback : Number(raw);
};
const setD = (el: Element | null, d: string) => {
  if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
};
/** A fixed value in −0.5…0.5 for an integer: noise that stays put in the world. */
const hash = (n: number, seed: number) => {
  const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x) - 0.5;
};
/** Smooth noise along a line: `hash` eased between integer steps. */
const wobble = (u: number, seed: number) => {
  const i = Math.floor(u);
  const k = u - i;
  const e = k * k * (3 - 2 * k);
  return hash(i, seed) * (1 - e) + hash(i + 1, seed) * e;
};
const line = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${f1(x)} ${f1(y)}`).join(" ");

/** A hand-cut blob: `n` points round an ellipse, each pushed in or out a little. */
function blob(cx: number, cy: number, rx: number, ry: number, n: number, rough: number, seed: number) {
  const rand = seeded(seed);
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (rand() - 0.5) * rough;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return `${line(pts)} Z`;
}

/* ------------------------------------------------------------------ snow -- */

/**
 * Flakes on the wind. Each flake has a place in a unit square and a speed;
 * the frame function carries it along the wind and wraps it round the frame.
 * Params: `mode` (`drive` | `settle`), `count`, `wind` and `fall` (frames per
 * second), `near` (a share of large close flakes), `fadeIn`, `fadeOut`.
 */
function Snow({ cue }: VfxProps) {
  const p = cue.params ?? {};
  const rand = seeded(cue.seed ?? 11);
  const count = Number(p.count ?? 70);
  const near = Number(p.near ?? 0.08);
  return (
    <div
      className="wp-snow"
      data-mode={String(p.mode ?? "drive")}
      data-wind={String(p.wind ?? -1.4)}
      data-fall={String(p.fall ?? 0.45)}
      style={v({ "--fin": Number(p.fadeIn ?? 0), "--fout": Number(p.fadeOut ?? 1) })}
    >
      {Array.from({ length: count }, (_, i) => {
        const big = rand() < near;
        const size = big ? 9 + rand() * 10 : 1.6 + rand() * 3.6;
        return (
          <i
            key={i}
            data-x={rand().toFixed(3)}
            data-y={rand().toFixed(3)}
            data-speed={(0.7 + rand() * 0.6 + (big ? 0.5 : 0)).toFixed(2)}
            data-big={big ? "" : undefined}
            style={v({ "--size": f2(size), "--o": f2(big ? 0.35 + rand() * 0.3 : 0.55 + rand() * 0.45) })}
          />
        );
      })}
    </div>
  );
}

const snowFrame = (el: HTMLElement, _p: number, age: number) => {
  const box = el.querySelector<HTMLElement>(".wp-snow");
  if (!box) return;
  const w = el.offsetWidth || box.offsetWidth;
  const h = el.offsetHeight || box.offsetHeight;
  const unit = w / 1280;
  const settle = box.dataset.mode === "settle";
  const wind = Number(box.dataset.wind);
  const fall = Number(box.dataset.fall);
  const t = age / 1000;
  // A streak's length is its speed across the frame: long in the wind, a dot when still.
  const angle = (Math.atan2(fall * h, wind * w) * 180) / Math.PI;
  const stretch = settle ? 1 : clamp(Math.hypot(wind * w, fall * h) / (h * 0.9), 1, 4.5);
  if (box.dataset.unit !== f2(unit)) {
    box.dataset.unit = f2(unit);
    box.style.setProperty("--unit", f2(unit));
  }
  for (const flake of box.children as HTMLCollectionOf<HTMLElement>) {
    const speed = Number(flake.dataset.speed);
    const sway = settle ? Math.sin(t * 2 + speed * 9) * 0.012 : 0;
    const x = ((((Number(flake.dataset.x) + t * wind * speed + sway) % 1) + 1) % 1) * 1.1 - 0.05;
    const y = ((((Number(flake.dataset.y) + t * fall * speed) % 1) + 1) % 1) * 1.1 - 0.05;
    flake.style.transform = `translate3d(${f1(x * w)}px, ${f1(y * h)}px, 0) rotate(${f1(angle)}deg) scaleX(${f2(stretch)})`;
  }
};

/* ---------------------------------------------------------------- breath -- */

/**
 * The warcry as breath. It leaves the visor slit as a jet, forward and fast,
 * slows and opens into cloud, and the wind tears it back over the helm in
 * long lobed streamers. Drawn from an origin at the slit, forward to the
 * right; `scale` sizes it to the helm. Params: `back` (how far the wind
 * carries it), `rise`.
 */
function Breath({ cue }: VfxProps) {
  const p = cue.params ?? {};
  const rand = seeded(cue.seed ?? 5);
  const back = Number(p.back ?? 1);
  const rise = Number(p.rise ?? 1);
  // The jet: born one after another over the first third, each thrown forward.
  const puffs = Array.from({ length: 18 }, (_, i) => {
    const k = i / 17;
    return {
      "--d": f2(k * 0.24),
      "--len": f2(0.7 + rand() * 0.25),
      "--vx": f1(190 + rand() * 90 - k * 50),
      "--vy": f1((-30 - rand() * 70) * rise),
      "--back": f1((230 + rand() * 150) * back),
      "--s0": f2(0.25 + rand() * 0.15),
      "--s1": f2(1.1 + rand() * 0.8 + k * 0.6),
      "--o": f2(0.7 + rand() * 0.3),
      "--y0": f1((rand() - 0.5) * 10),
    };
  });
  // Streamers: lobed tails of cloud, torn back over the crest.
  const streamers = Array.from({ length: 4 }, (_, i) => {
    const len = 150 + rand() * 90;
    const thick = 20 + rand() * 12;
    const lobes = 5;
    const xAt = (j: number) => -(j / lobes) * len;
    const wAt = (j: number) => thick * (1 - (j / lobes) * 0.75);
    // The top edge runs back from the slit in lobes, the bottom edge returns flatter.
    let d = `M0 ${f1(-wAt(0) * 0.6)}`;
    for (let j = 1; j <= lobes; j++) {
      const bump = (j % 2 ? 1 : 0.6) * wAt(j) * 0.9;
      d += ` Q${f1((xAt(j - 1) + xAt(j)) / 2)} ${f1(-wAt(j) - bump)} ${f1(xAt(j))} ${f1(-wAt(j) * 0.6)}`;
    }
    d += ` L${f1(-len - 10)} 0 L${f1(xAt(lobes))} ${f1(wAt(lobes) * 0.4)}`;
    for (let j = lobes; j >= 1; j--) {
      const bump = (j % 2 ? 0.5 : 0.9) * wAt(j) * 0.5;
      d += ` Q${f1((xAt(j - 1) + xAt(j)) / 2)} ${f1(wAt(j) * 0.7 + bump)} ${f1(xAt(j - 1))} ${f1(wAt(j - 1) * 0.4)}`;
    }
    return {
      d: `${d} Z`,
      vars: {
        "--d": f2(0.08 + i * 0.07),
        "--len": f2(0.85 - i * 0.05),
        "--vx": f1(150 + rand() * 60),
        "--vy": f1((-50 - i * 34) * rise),
        "--back": f1((300 + rand() * 120) * back),
        "--s0": "0.4",
        "--s1": f2(1.5 + rand() * 0.6),
        "--o": f2(0.85 - i * 0.1),
        "--y0": f1(-6 * i),
      },
    };
  });
  return (
    <div className="wp-breath">
      {streamers.map((s, i) => (
        <svg key={`s${i}`} className="wp-streamer" viewBox="-300 -80 320 160" style={v(s.vars)}>
          <path d={s.d} />
        </svg>
      ))}
      {puffs.map((vars, i) => (
        <i key={i} className="wp-puff" style={v(vars)} />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- drift -- */

/**
 * The snow the file wades in, in world units over the whole stage. One
 * channel of broken snow runs along the legs of every figure on the trail —
 * the Warlord and its allies, in order along it — deepest round each figure
 * and sagging between, from off the back of the file to the Warlord, where
 * (`heave`) it is pushed up in a bow ahead of the shield and clods are thrown
 * off it on every stride. The enemy stands in a low drift of its own. A crust
 * edge in ink, the snow's body, and its underside in blue shadow.
 * Params: `depth` (of a figure's height), `targetDepth`, `heave`, `stride`.
 */
function Drift({ cue }: VfxProps) {
  const p = cue.params ?? {};
  return (
    <svg
      className="wp-drift"
      viewBox="0 0 1600 900"
      aria-hidden="true"
      data-depth={String(p.depth ?? 0.25)}
      data-target-depth={String(p.targetDepth ?? 0.1)}
      data-heave={String(p.heave ?? 0)}
      data-stride={String(p.stride ?? 1000)}
      data-seed={String(cue.seed ?? 3)}
    >
      <path className="wp-snowbody" />
      <path className="wp-snowshade" />
      <path className="wp-crust" />
      <path className="wp-clod" />
    </svg>
  );
}

/** Along a line of waders: the crust, and the band beneath it down past their feet. */
function channel(waders: At[], depth: number, heave: number, seed: number, bob: number) {
  const pts: { x: number; top: number; foot: number; h: number }[] = [];
  const first = waders[0];
  const second = waders[1];
  // Off the back of the file: the trail runs on behind the last one.
  const dx = second ? first.x - second.x : -first.h;
  const dy = second ? first.y - second.y : 0;
  const reach = first.h * 1.8 / Math.max(1, Math.hypot(dx, dy));
  pts.push({ x: first.x + dx * reach, top: first.y + dy * reach - depth * first.h * 0.8, foot: first.y + dy * reach + first.h * 0.12, h: first.h });
  for (const w of waders) pts.push({ x: w.x, top: w.y - depth * w.h + bob, foot: w.y + w.h * 0.12, h: w.h });
  const lead = waders[waders.length - 1];
  // Ahead of the leader: the bow it pushes up, then the untouched snow sloping away.
  pts.push({ x: lead.x + lead.h * 0.28, top: lead.y - depth * lead.h * (1 + 0.22 * heave) + bob, foot: lead.y + lead.h * 0.12, h: lead.h });
  pts.push({ x: lead.x + lead.h * 0.52, top: lead.y - depth * lead.h * 0.35, foot: lead.y + lead.h * 0.1, h: lead.h });
  pts.push({ x: lead.x + lead.h * 0.7, top: lead.y + lead.h * 0.04, foot: lead.y + lead.h * 0.08, h: lead.h });
  // The crust, sampled finely, lumpy with noise fixed to the world.
  const crust: Pt[] = [];
  const under: Pt[] = [];
  const shadeTop: Pt[] = [];
  const sample = (x: number, top: number, foot: number, h: number) => {
    const y = top + wobble(x / (h * 0.09), seed) * h * 0.035;
    crust.push([x, y]);
    under.unshift([x, foot]);
    shadeTop.push([x, y + (foot - y) * 0.58 + wobble(x / (h * 0.14), seed + 5) * h * 0.02]);
  };
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const steps = Math.max(2, Math.ceil(Math.abs(b.x - a.x) / (a.h * 0.07)));
    for (let s = 0; s < steps; s++) {
      const k = s / steps;
      const e = k * k * (3 - 2 * k);
      const h = a.h + (b.h - a.h) * k;
      // Between two figures the channel's wall sags a little.
      const sag = i > 0 && i < pts.length - 4 ? Math.sin(k * Math.PI) * h * depth * 0.18 : 0;
      sample(a.x + (b.x - a.x) * k, a.top + (b.top - a.top) * e + sag, a.foot + (b.foot - a.foot) * k, h);
    }
  }
  const end = pts[pts.length - 1];
  sample(end.x, end.top, end.foot, end.h);
  const floor = line(under).replace("M", "L");
  return {
    body: `${line(crust)} ${floor} Z`,
    shade: `${line(shadeTop)} ${floor} Z`,
    crust: line(crust),
  };
}

/** A low drift round one figure's feet. */
function banked(at: At, depth: number, seed: number) {
  const w = at.h * 0.75;
  const crust: Pt[] = [];
  const n = 12;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const x = at.x - w + 2 * w * k;
    const arch = Math.sin(k * Math.PI) ** 0.7;
    crust.push([x, at.y + at.h * 0.05 - (at.h * depth + at.h * 0.05) * arch + wobble(x / (at.h * 0.09), seed) * at.h * 0.03 * arch]);
  }
  const under: Pt[] = [
    [at.x + w * 1.05, at.y + at.h * 0.1],
    [at.x - w * 1.05, at.y + at.h * 0.1],
  ];
  const shade: Pt[] = crust.map(([x, y]) => [x, y + (at.y + at.h * 0.1 - y) * 0.55]);
  return {
    body: `${line(crust)} ${line(under).replace("M", "L")} Z`,
    shade: `${line(shade)} ${line(under).replace("M", "L")} Z`,
    crust: line(crust),
  };
}

const driftFrame = (el: HTMLElement, _p: number, age: number, ctx: VfxContext) => {
  const svg = el.querySelector<SVGSVGElement>(".wp-drift");
  if (!svg) return;
  const depth = num(svg, "depth", 0.25);
  const targetDepth = num(svg, "targetDepth", 0.1);
  const heave = num(svg, "heave", 0);
  const stride = num(svg, "stride", 1000);
  const seed = num(svg, "seed", 3);
  const caster = ctx.actor("caster");
  const waders = [0, 1, 2]
    .map((i) => ctx.actor(`allies-${i}`))
    .filter((a): a is At => !!a)
    .sort((a, b) => a.x - b.x);
  let body = "";
  let shade = "";
  let crust = "";
  let clods = "";
  // The snow rises and falls a little with the stride.
  const bob = Math.sin(((age / stride) * 2) * Math.PI * 2) * (caster?.h ?? 0) * 0.006 * heave;
  if (caster) {
    const c = channel([...waders.filter((a) => a.x < caster.x), caster], depth, heave, seed, bob);
    body += c.body + " ";
    shade += c.shade + " ";
    crust += c.crust + " ";
    // Allies not behind the Warlord (none, as authored) stand in their own drift.
    for (const a of waders.filter((a) => a.x >= caster.x)) {
      const m = banked(a, depth, seed + 3);
      body += m.body + " ";
      shade += m.shade + " ";
      crust += m.crust + " ";
    }
    if (heave > 0) {
      // Clods thrown up off the shield's face and out ahead, on every stride.
      const rand = seeded(seed * 31);
      for (let i = 0; i < 10; i++) {
        const phase = (((age / (stride / 2) + i / 10) % 1) + 1) % 1;
        const vx = caster.h * (0.16 + rand() * 0.28);
        const vy = caster.h * (0.2 + rand() * 0.22);
        const size = caster.h * (0.01 + rand() * 0.016);
        if (phase > 0.78) continue;
        const x = caster.x + caster.h * 0.3 + vx * phase;
        const y = caster.y - caster.h * depth * 1.1 - vy * phase + caster.h * 0.85 * phase * phase;
        clods += blob(x, y, size * 1.3, size, 6, 0.8, seed + i * 3) + " ";
      }
    }
  }
  const target = ctx.actor("targets-0");
  if (target && targetDepth > 0) {
    const m = banked(target, targetDepth, seed + 9);
    body += m.body + " ";
    shade += m.shade + " ";
    crust += m.crust + " ";
  }
  setD(svg.querySelector(".wp-snowbody"), body.trim());
  setD(svg.querySelector(".wp-snowshade"), shade.trim());
  setD(svg.querySelector(".wp-crust"), crust.trim());
  setD(svg.querySelector(".wp-clod"), clods.trim());
};

/* ----------------------------------------------------------------- trail -- */

/**
 * The trail seen from above, in world units: from `x0, y0` (off the frame)
 * through every ally to the Warlord, a trench cut through the white. Its far
 * wall is lit, its near wall in blue shadow, both edges broken, and prints
 * are stamped down its floor, left, right. It stops where the Warlord stands.
 * `width` is the trench's width for a figure of height 100.
 */
function Trail({ cue }: VfxProps) {
  const p = cue.params ?? {};
  return (
    <svg
      className="wp-trail"
      viewBox="0 0 1600 900"
      aria-hidden="true"
      data-x0={String(p.x0 ?? -200)}
      data-y0={String(p.y0 ?? 900)}
      data-width={String(p.width ?? 22)}
      data-seed={String(cue.seed ?? 9)}
    >
      <path className="wp-trail-lip" />
      <path className="wp-trail-floor" />
      <path className="wp-trail-wall" />
      <path className="wp-trail-prints" />
    </svg>
  );
}

const trailFrame = (el: HTMLElement, _p: number, _age: number, ctx: VfxContext) => {
  const svg = el.querySelector<SVGSVGElement>(".wp-trail");
  if (!svg) return;
  const caster = ctx.actor("caster");
  if (!caster) return;
  const key = `${f1(caster.x)},${f1(caster.y)},${[0, 1, 2].map((i) => ctx.actor(`allies-${i}`)?.x.toFixed(0) ?? "").join(",")}`;
  if (svg.dataset.key === key) return;
  svg.dataset.key = key;
  const seed = num(svg, "seed", 9);
  const nodes: Pt[] = [[num(svg, "x0", -200), num(svg, "y0", 900)]];
  const allies = [0, 1, 2]
    .map((i) => ctx.actor(`allies-${i}`))
    .filter((a): a is At => !!a)
    .sort((a, b) => a.x - b.x);
  for (const a of allies) nodes.push([a.x, a.y]);
  nodes.push([caster.x + caster.h * 0.1, caster.y]);
  const width = num(svg, "width", 22) * (caster.h / 100);
  // The centre line, sampled along the nodes, wandering a little.
  const centre: Pt[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const [ax, ay] = nodes[i];
    const [bx, by] = nodes[i + 1];
    const steps = Math.max(2, Math.ceil(Math.hypot(bx - ax, by - ay) / (width * 0.6)));
    for (let s = 0; s < steps; s++) {
      const k = s / steps;
      centre.push([ax + (bx - ax) * k, ay + (by - ay) * k]);
    }
  }
  centre.push(nodes[nodes.length - 1]);
  const left: Pt[] = [];
  const right: Pt[] = [];
  const wall: Pt[] = [];
  const wallIn: Pt[] = [];
  const lipL: Pt[] = [];
  const lipR: Pt[] = [];
  let prints = "";
  let travelled = 0;
  centre.forEach(([x, y], i) => {
    const [nx, ny] = centre[Math.min(centre.length - 1, i + 1)];
    const [px, py] = centre[Math.max(0, i - 1)];
    const tx = nx - px;
    const ty = ny - py;
    const len = Math.hypot(tx, ty) || 1;
    const ox = -ty / len;
    const oy = tx / len;
    if (i) travelled += Math.hypot(x - px, y - py);
    // It narrows to nothing at the Warlord's feet.
    const taper = clamp((centre.length - 1 - i) / 3, 0.25, 1);
    const w = (width / 2) * taper;
    const a = 1 + wobble(i * 0.8, seed) * 0.5;
    const b = 1 + wobble(i * 0.8, seed + 3) * 0.5;
    left.push([x + ox * w * a, y + oy * w * a]);
    right.unshift([x - ox * w * b, y - oy * w * b]);
    // The thrown-up snow either side: a broken bright rim beyond each edge.
    const rim = w * (0.45 + wobble(i * 1.3, seed + 7) * 0.4);
    lipL.push([x + ox * (w * a + rim), y + oy * (w * a + rim)]);
    lipR.unshift([x - ox * (w * b + rim), y - oy * (w * b + rim)]);
    // The wall on the side away from the light, in shadow, a third of the way in.
    const up = oy < 0 ? 1 : -1;
    wall.push([x + ox * w * up * (up > 0 ? a : b), y + oy * w * up * (up > 0 ? a : b)]);
    wallIn.unshift([x + ox * w * up * 0.25, y + oy * w * up * 0.25]);
    // A print every stride, alternately either side of the line.
    const n = Math.floor(travelled / (width * 0.9));
    if (i && n !== Math.floor((travelled - Math.hypot(x - px, y - py)) / (width * 0.9))) {
      const side = n % 2 ? 1 : -1;
      prints += blob(x + ox * w * 0.28 * side, y + oy * w * 0.28 * side, width * 0.17, width * 0.11, 6, 0.5, seed + n) + " ";
    }
  });
  const trench = `${line(left)} ${line(right).replace("M", "L")} Z`;
  const lip = `${line(lipL)} ${line(lipR).replace("M", "L")} Z`;
  const shadow = `${line(wall)} ${line(wallIn).replace("M", "L")} Z`;
  setD(svg.querySelector(".wp-trail-lip"), lip);
  setD(svg.querySelector(".wp-trail-floor"), trench);
  setD(svg.querySelector(".wp-trail-wall"), shadow);
  setD(svg.querySelector(".wp-trail-prints"), prints.trim());
};

/* ------------------------------------------------------------------ gust -- */

/**
 * A sheet of snow blown across the lens, right to left, with the wind: `in`
 * brings it on until it covers the frame at the cue's end, `out` carries it
 * off from covering at the cue's start. The same seed on both sides of a cut
 * draws the same streaks.
 */
function Gust({ cue }: VfxProps) {
  const rand = seeded(cue.seed ?? 21);
  return (
    <div className="wp-gust" data-phase={String(cue.params?.phase ?? "in")}>
      <b className="wp-gust-sheet" />
      <b className="wp-gust-sheet wp-gust-core" />
      {Array.from({ length: 34 }, (_, i) => (
        <i
          key={i}
          style={v({
            "--y": `${f1(rand() * 100)}%`,
            "--x": f2(rand()),
            "--l": `${f1(40 + rand() * 180)}px`,
            "--h": `${f1(1.5 + rand() * 4)}px`,
            "--sp": f2(1.4 + rand() * 1.2),
            "--o": f2(0.45 + rand() * 0.55),
          })}
        />
      ))}
    </div>
  );
}

const gustFrame = (el: HTMLElement) => {
  const w = `${el.offsetWidth}px`;
  if (el.style.getPropertyValue("--gw") !== w) el.style.setProperty("--gw", w);
};

/* ----------------------------------------------------------------- blows -- */

/**
 * The blow, drawn where the blade bites: the white split open in a long
 * wedge along the blade's line, an ink edge round it and cut shards flung
 * from it. Three drawings, swapped on the frame counter: it boils. `rotate`
 * lays it along the blade; its origin is the bite, and it opens forward.
 */
function Cleave({ cue }: VfxProps) {
  const seed = cue.seed ?? 4;
  const drawing = (k: number) => {
    const rand = seeded(seed + k * 17);
    const len = 230 + rand() * 30;
    const wide = 30 + rand() * 10;
    const wedge = `M${f1(-len * 0.3)} ${f1(-2 - rand() * 4)} L${f1(len * 0.12)} ${f1(-wide)} L${f1(len)} ${f1(-4 + rand() * 8)} L${f1(len * 0.1)} ${f1(wide * 0.75)} Z`;
    const core = `M${f1(-len * 0.12)} 0 L${f1(len * 0.14)} ${f1(-wide * 0.36)} L${f1(len * 0.78)} ${f1(-1)} L${f1(len * 0.12)} ${f1(wide * 0.3)} Z`;
    let shards = "";
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI * 0.5 + (i / 7) * Math.PI + (rand() - 0.5) * 0.3;
      const r0 = 40 + rand() * 30;
      const r1 = r0 + 50 + rand() * 80;
      const s = 6 + rand() * 7;
      const ax = Math.cos(a);
      const ay = Math.sin(a);
      const cx = len * 0.2;
      shards += `M${f1(cx + ax * r0 - ay * s)} ${f1(ay * r0 + ax * s)} L${f1(cx + ax * r1)} ${f1(ay * r1)} L${f1(cx + ax * r0 + ay * s)} ${f1(ay * r0 - ax * s)} Z `;
    }
    return (
      <g key={k} className="wp-cleave-frame" data-k={k}>
        <path className="wp-cleave-ink" d={wedge} transform="scale(1.12)" />
        <path className="wp-cleave-white" d={wedge} />
        <path className="wp-cleave-shards" d={shards} />
        <path className="wp-cleave-core" d={core} />
      </g>
    );
  };
  return (
    <svg className="wp-cleave" viewBox="-320 -320 640 640">
      {[0, 1, 2].map(drawing)}
    </svg>
  );
}

const cleaveFrame = (el: HTMLElement, _p: number, age: number) => {
  const k = String(Math.floor(age / 45) % 3);
  if (el.dataset.k !== k) el.dataset.k = k;
};

/**
 * The snow at the enemy's feet ripped up by the blow and thrown back past it:
 * cut clods on ballistic arcs, turning, each with its shadowed side, and a
 * powder cloud opening behind them. `dir` is which way it is thrown; `scale`
 * sizes it to the enemy.
 */
function Throw({ cue }: VfxProps) {
  const rand = seeded(cue.seed ?? 8);
  const dir = Number(cue.params?.dir ?? 1);
  const clods = Array.from({ length: 30 }, (_, i) => {
    const a = (-0.1 - rand() * 0.85) * Math.PI * 0.5;
    const speed = 240 + rand() * 560;
    const size = 6 + rand() * 18;
    const seed = (cue.seed ?? 8) * 5 + i;
    return {
      path: blob(0, 0, 40, 26 + rand() * 10, 7, 0.7, seed),
      shade: blob(6, 8, 30, 16, 6, 0.6, seed + 1),
      vars: {
        "--vx": f1(Math.cos(a) * speed * dir),
        "--vy": f1(Math.sin(a) * speed),
        "--g": f1(460 + rand() * 220),
        "--r": `${f1((rand() - 0.5) * 540)}deg`,
        "--d": f2(rand() * 0.1),
        "--size": f1(size * 2),
      },
    };
  });
  const powder = Array.from({ length: 10 }, () => ({
    "--px": f1((40 + rand() * 300) * dir),
    "--py": f1(-30 - rand() * 200),
    "--pr": f1(80 + rand() * 120),
    "--po": f2(0.45 + rand() * 0.35),
  }));
  return (
    <div className="wp-throw">
      {powder.map((vars, i) => (
        <i key={`p${i}`} className="wp-powder" style={v(vars)} />
      ))}
      {clods.map((c, i) => (
        <svg key={i} className="wp-throw-clod" viewBox="-50 -50 100 100" style={v(c.vars)}>
          <path className="wp-clod-body" d={c.path} />
          <path className="wp-clod-shade" d={c.shade} />
        </svg>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- board -- */

/** One boot print pressed into snow: a sole and a heel, with the kicked-up rim. */
function Print({ vars, seed }: { vars: Record<string, string>; seed: number }) {
  return (
    <svg className="wp-print" viewBox="-30 -20 60 40" style={v(vars)}>
      <path className="wp-print-rim" d={blob(0, 0, 27, 15, 9, 0.35, seed)} />
      <path className="wp-print-sole" d="M-20 -2 C-20 -9 -8 -11 2 -10 C10 -9 13 -6 13 -2 C13 3 8 6 0 6 C-10 6 -20 5 -20 -2 Z" />
      <path className="wp-print-heel" d="M16 -6 C22 -7 25 -4 25 0 C25 4 22 6 17 5 C14 4 14 -5 16 -6 Z" />
    </svg>
  );
}

/**
 * On the real battlefield, riding a unit's feet (`anchor`). `prints` is a
 * short line of boot prints in snow coming in from behind to where a hero
 * now stands, in the front line. `lead` is the Warlord's own prints on from
 * its feet towards the enemy (the frame function finds the `end` on the board
 * and lays them along the way). `end` is the snow trampled round the enemy's
 * feet where the trail stops. Sized to the unit; laid down print by print.
 */
function Board({ cue }: VfxProps) {
  const mode = String(cue.params?.mode ?? "prints");
  const rand = seeded(cue.seed ?? 13);
  const n = mode === "lead" ? 9 : mode === "end" ? 8 : 4;
  const prints = Array.from({ length: n }, (_, i) => {
    const k = i / (n - 1);
    const side = i % 2 ? 1 : -1;
    if (mode === "end") {
      // Trampled: prints every way round the feet, where the Warlord stood and struck.
      const a = (i / n) * Math.PI * 2 + rand() * 0.6;
      const r = 0.5 + rand() * 0.55;
      return {
        "--x": f2(Math.cos(a) * r - 0.1),
        "--y": f2(Math.sin(a) * r * 0.3 + 0.02),
        "--r": `${f1((a * 180) / Math.PI + 90 + (rand() - 0.5) * 60)}deg`,
        "--i": f2(rand() * 0.6),
        "--k": f2(k),
      };
    }
    // `prints`: in from behind and a little up the board, towards the feet.
    const x = mode === "lead" ? 0.3 + k * 0.9 : -1.45 + k * 1.05;
    const y = mode === "lead" ? 0 : -0.3 + k * 0.26;
    return {
      "--x": f2(x),
      "--y": f2(y + side * 0.08),
      "--r": `${f1((mode === "lead" ? 0 : 12) + (rand() - 0.5) * 14)}deg`,
      "--i": f2(k),
      "--k": f2(k),
    };
  });
  return (
    <div className="wp-board" data-mode={mode}>
      {mode === "end" && (
        <svg className="wp-board-trample" viewBox="-130 -50 260 100">
          <path className="wp-trample-pit" d={blob(0, 2, 100, 26, 18, 0.45, (cue.seed ?? 13) + 2)} />
          {Array.from({ length: 9 }, (_, i) => {
            const a = rand() * Math.PI * 2;
            const r = 70 + rand() * 60;
            return <path key={i} className="wp-trample-lump" d={blob(Math.cos(a) * r, Math.sin(a) * r * 0.32, 8 + rand() * 8, 5 + rand() * 4, 6, 0.6, i + 40)} />;
          })}
        </svg>
      )}
      {prints.map((vars, i) => (
        <Print key={i} vars={vars} seed={(cue.seed ?? 13) * 3 + i} />
      ))}
    </div>
  );
}

/** The lead prints: turned and spaced along the way from the Warlord to the enemy. */
const boardFrame = (el: HTMLElement) => {
  const board = el.querySelector<HTMLElement>('.wp-board[data-mode="lead"]');
  if (!board) return;
  const end = el.parentElement?.querySelector<HTMLElement>('.cine-vfx:has(.wp-board[data-mode="end"])');
  if (!end || end.style.visibility === "hidden" || !end.style.left) return;
  const dx = parseFloat(end.style.left) - parseFloat(el.style.left);
  const dy = parseFloat(end.style.top) - parseFloat(el.style.top);
  const key = `${f1(dx)},${f1(dy)}`;
  if (board.dataset.key === key) return;
  board.dataset.key = key;
  const prints = board.querySelectorAll<SVGElement>(".wp-print");
  const len = Math.hypot(dx, dy) || 1;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  prints.forEach((print, i) => {
    const k = (i + 0.6) / (prints.length + 0.4);
    const side = i % 2 ? 1 : -1;
    const ox = (-dy / len) * side * 8;
    const oy = (dx / len) * side * 8;
    print.style.left = `${f1(dx * k * 0.86 + ox)}px`;
    print.style.top = `${f1(dy * k * 0.86 + oy)}px`;
    print.style.setProperty("--r", `${f1(angle)}deg`);
  });
};

export const renderers = {
  "warpath-snow": Snow,
  "warpath-breath": Breath,
  "warpath-drift": Drift,
  "warpath-trail": Trail,
  "warpath-gust": Gust,
  "warpath-cleave": Cleave,
  "warpath-throw": Throw,
  "warpath-board": Board,
};

export const frames = {
  "warpath-snow": snowFrame,
  "warpath-drift": driftFrame,
  "warpath-trail": trailFrame,
  "warpath-gust": gustFrame,
  "warpath-cleave": cleaveFrame,
  "warpath-board": boardFrame,
};
