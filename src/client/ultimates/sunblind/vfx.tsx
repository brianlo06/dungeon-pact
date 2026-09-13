import { useId, type CSSProperties, type ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import "./style.css";

/**
 * Sunblind's effects.
 *
 * The idea they serve: the Gloomstalker looses a volley out of the low sun,
 * where every enemy is squinting and nothing can be seen, and the only
 * warning the row gets is the arrows' own shadows racing across the white
 * roof to its feet.
 *
 *   sb-sun      the sun: a white bloom with long, hand-cut spokes of glare
 *   sb-cast     a cast member's own shadow, laid flat along the roof away from
 *               the sun: a copy of the real figure, filled with shade
 *   sb-shadows  the volley, seen only as its shadows: a comb of thin shadows
 *               sliding over the plaster to every enemy's feet
 *   sb-loosed   the arrows leaving the bow, straight up into the sky
 *   sb-flare    the sun flaring across the lens: the cut from the kid to the row
 *   sb-volley   the volley landed: arrows standing in every enemy and in the
 *               ends of their shadows, chips of plaster and chalk dust
 *   sb-heat     heat coming off the roof
 *   sb-board    on the real battlefield: every enemy in a hard pool of sun
 *               with its shadow thrown long behind it, and the struck row
 *               stuck round with arrows
 *
 * Every arrow drawn is the arrow the Ranger actually holds, copied from its
 * hand (so a worn weapon's projectile is what falls). Nothing animates by
 * itself and nothing here filters. Effects read the film's `--p` family;
 * those that depend on where the cast really stands are placed by frame
 * functions from the stage's own placements, and write only what changed.
 */

export const LEMON = "#ffe45c";
export const CAST = "#3a4478";

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;
const v = (vars: Record<string, string | number>) => vars as CSSProperties;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const span = (p: number, a: number, b: number) => clamp((p - a) / Math.max(0.0001, b - a));
const easeOut = (k: number) => 1 - (1 - k) * (1 - k);
const f1 = (n: number) => n.toFixed(1);
const f3 = (n: number) => n.toFixed(3);
const rad = (d: number) => (d * Math.PI) / 180;
const setVar = (el: Element | null | undefined, name: string, value: string) => {
  const s = (el as HTMLElement | null)?.style;
  if (s && s.getPropertyValue(name) !== value) s.setProperty(name, value);
};
const setAttr = (el: Element | null | undefined, name: string, value: string) => {
  if (el && el.getAttribute(name) !== value) el.setAttribute(name, value);
};
const show = (el: Element | null | undefined, on: boolean) => {
  const s = (el as HTMLElement | null)?.style;
  if (s && (s.display === "none") === on) s.display = on ? "" : "none";
};
/** A cue's params, written on the effect's first child so a frame can read them. */
const data = (params: VfxProps["cue"]["params"] = {}) =>
  Object.fromEntries(Object.entries(params).map(([k, x]) => [`data-${k.toLowerCase()}`, String(x)]));
const paramsOf = (el: HTMLElement) => (el.firstElementChild as HTMLElement | null)?.dataset ?? {};
const num = (d: DOMStringMap, k: string, fallback: number) =>
  d[k.toLowerCase()] === undefined ? fallback : Number(d[k.toLowerCase()]);
const rootOf = (el: HTMLElement) => el.closest<HTMLElement>(".ult-cinematic");

/* ── The arrow ─────────────────────────────────────────────────────────── */

/**
 * The Ranger's arrow, pointing along +x with its tip at 28: a stand-in drawn
 * like the one in `Ranger.tsx`, replaced on the first frame by the arrow the
 * Ranger is really holding (`adoptArrow`).
 */
function ArrowArt({ id }: { id: string }) {
  return (
    <g id={id} className="sb-arrow-art">
      <path d="M-4 0 H24" stroke="#161a2c" strokeWidth="3" strokeLinecap="round" />
      <path d="M-4 0 H24" stroke="#d9b27a" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M22 -2.6 L28 0 L22 2.6 Z" fill="#b9c0cc" stroke="#161a2c" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M-6 -2.4 L-1 0 L-6 2.4 L-4 0 Z" fill="#c4533f" stroke="#161a2c" strokeWidth="0.9" />
    </g>
  );
}

/** Replace the stand-in with the arrow in the Ranger's hand, once. */
function adoptArrow(el: HTMLElement) {
  const art = el.querySelector<SVGGElement>(".sb-arrow-art");
  if (!art || art.dataset.adopted) return;
  art.dataset.adopted = "1";
  const held = document.querySelector('.ult-cinematic .cine-actor[data-role="caster"] [data-part="arrow"] > g');
  if (!held) return;
  const copy = held.cloneNode(true) as SVGGElement;
  copy.removeAttribute("transform");
  art.replaceChildren(...copy.childNodes);
}

/** An arrow placed with its tip at (x, y), pointing `angle` degrees, `len` world units long. */
const arrowAt = (x: number, y: number, angle: number, len: number) =>
  `translate(${f1(x)} ${f1(y)}) rotate(${f1(angle)}) scale(${f3(len / 34)}) translate(-28 0)`;

/* ── The sun ───────────────────────────────────────────────────────────── */

/**
 * The sun, too bright to have an edge: a soft white bloom (gradients), a hot
 * core, and long uneven spokes of glare cut like woodcut rays, turning slowly.
 * `r` is the core's radius in world units; `core` how opaque the core is
 * (over the kid it is what hides it); `spokes` how many; `glow` the bloom.
 */
const Sun = ({ cue }: VfxProps) => {
  const q = cue.params ?? {};
  const r = Number(q.r ?? 80);
  const n = Number(q.spokes ?? 14);
  const rand = seeded(cue.seed ?? 7);
  const spokes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 360 + (rand() - 0.5) * 12;
    const len = r * (2.2 + rand() * 3.4);
    const w = r * (0.07 + rand() * 0.1);
    return { a, len, w };
  });
  const box = r * 8;
  return (
    <div className="sb-sun" style={v({ width: `${box * 2}px`, height: `${box * 2}px`, "--core": Number(q.core ?? 0.95), "--glow": Number(q.glow ?? 1) })}>
      <i className="sb-sun-bloom" />
      <svg viewBox={`${-box} ${-box} ${box * 2} ${box * 2}`} className="sb-sun-art">
        <g className="sb-sun-spokes">
          {spokes.map((s, i) => (
            <path key={i} d={`M${f1(-s.w)} ${f1(-r * 0.6)} L0 ${f1(-s.len)} L${f1(s.w)} ${f1(-r * 0.6)} Z`} transform={`rotate(${f1(s.a)})`} />
          ))}
        </g>
        <circle className="sb-sun-halo" r={r * 1.45} />
        <circle className="sb-sun-core" r={r} />
      </svg>
    </div>
  );
};

/* ── Shadows of the cast ───────────────────────────────────────────────── */

/**
 * Every enemy's own shadow (or the caster's), laid flat along the roof away
 * from the sun. The stage draws each figure once; this copies the figure's
 * actor node the first time it is placed, strips everything that names it,
 * fills it with shade, and lays it down behind its feet: turned a quarter
 * round so its head points away from the light, stretched long, flattened
 * onto the floor. Its placement follows the live figure every frame (so a
 * shove carries its shadow); its pose is the one it was copied in.
 *
 * `who`: `targets` (default) or `caster`; `len` the stretch along the floor,
 * `flat` the squash across it, `o` its strength.
 */
const MAX_CAST = 6;
const Cast = ({ cue }: VfxProps) => (
  <div className="sb-world sb-cast" {...data(cue.params)} style={v({ "--o": Number(cue.params?.o ?? 0.7) })}>
    {Array.from({ length: MAX_CAST }, (_, i) => (
      <div key={i} className="sb-cast-one" data-slot={i} style={{ display: "none" }} />
    ))}
  </div>
);

function strip(copy: Element) {
  for (const inner of copy.querySelectorAll("[data-part], [id], [data-clip], .cine-anchor")) {
    if (inner.classList.contains("cine-anchor")) {
      inner.remove();
      continue;
    }
    inner.removeAttribute("data-part");
    inner.removeAttribute("id");
    inner.removeAttribute("data-clip");
  }
}

function shadowCopy(node: HTMLElement): HTMLElement {
  const copy = node.cloneNode(true) as HTMLElement;
  copy.className = "sb-cast-copy";
  for (const attr of ["data-role", "data-look", "data-root"]) copy.removeAttribute(attr);
  copy.style.display = "";
  copy.style.zIndex = "";
  strip(copy);
  copy.querySelector(".cine-rig")?.classList.replace("cine-rig", "sb-cast-rig");
  copy.querySelector(".cine-look")?.classList.replace("cine-look", "sb-cast-look");
  return copy;
}

const castFrame: Frame = (el, _p, _age, ctx) => {
  const box = el.querySelector<HTMLElement>(".sb-cast");
  const root = rootOf(el);
  if (!box || !root) return;
  const q = paramsOf(el);
  const caster = q.who === "caster";
  const len = num(q, "len", 1.7);
  const flat = num(q, "flat", 0.26);
  const nodes = root.querySelectorAll<HTMLElement>(`.cine-actor[data-role="${caster ? "caster" : "targets"}"]`);
  for (let i = 0; i < MAX_CAST; i++) {
    const slot = box.querySelector<HTMLElement>(`[data-slot="${i}"]`);
    const at = caster ? (i === 0 ? ctx.actor("caster") : undefined) : ctx.actor(`targets-${i}`);
    // The cast layer draws the targets in cast order, so the i-th is `targets-i`.
    const actor = nodes[i];
    if (!slot) continue;
    if (!at || !actor) {
      show(slot, false);
      continue;
    }
    if (!slot.firstElementChild) slot.appendChild(shadowCopy(actor));
    const copy = slot.firstElementChild as HTMLElement;
    if (copy.style.transform !== actor.style.transform) copy.style.transform = actor.style.transform;
    show(slot, true);
    const origin = `${f1(at.x)}px ${f1(at.y)}px`;
    if (slot.style.transformOrigin !== origin) slot.style.transformOrigin = origin;
    const tr = `scale(${f3(len)}, ${f3(flat)}) rotate(90deg)`;
    if (slot.style.transform !== tr) slot.style.transform = tr;
  }
};

/* ── The volley, as its shadows ────────────────────────────────────────── */

const COMB = 9;

/** One arrow's shadow lying on the floor, pointing +x, tip at 0: a shaft, a head, a fletch. */
const SHADOW_D = "M-106 -3.4 L-94 -1 L-10 -1.3 L-11 -3.2 L0 0 L-11 3.2 L-10 1.3 L-94 1 L-106 3.4 L-100 0 Z";
const ShadowArt = () => (
  <>
    {/* The soft edge a real shadow has, then the hard one. */}
    <path className="sb-shade-soft" d={SHADOW_D} transform="scale(1.02 2.6)" />
    <path className="sb-shade-shape" d={SHADOW_D} />
  </>
);

/**
 * The volley seen from the row: a comb of thin shadows sliding in over the
 * plaster from the sun's side towards every enemy's feet, fast and then
 * slowing, growing shorter and darker as the arrows that cast them come down.
 * `from` is how far back they start (world units), `gap` how far short of
 * the feet they stop at the end (in drawn heights).
 */
const Shadows = ({ cue }: VfxProps) => (
  <svg className="sb-world sb-shadows" viewBox="0 0 1600 900" {...data(cue.params)}>
    {Array.from({ length: MAX_CAST }, (_, t) => (
      <g key={t} data-t={t} style={{ display: "none" }}>
        {Array.from({ length: COMB }, (_, i) => (
          <g key={i} className="sb-shade" data-i={i}>
            <ShadowArt />
          </g>
        ))}
      </g>
    ))}
  </svg>
);

const shadowsFrame: Frame = (el, p, _age, ctx) => {
  const svg = el.querySelector<SVGSVGElement>(".sb-shadows");
  if (!svg) return;
  const q = paramsOf(el);
  const from = num(q, "from", 900);
  const gap = num(q, "gap", 0.12);
  const rand = seeded(Number(q.seed ?? 31));
  const jit = Array.from({ length: MAX_CAST * COMB * 4 }, () => rand());
  for (let t = 0; t < MAX_CAST; t++) {
    const g = svg.querySelector(`[data-t="${t}"]`);
    const a = ctx.actor(`targets-${t}`);
    show(g, !!a);
    if (!a || !g) continue;
    g.querySelectorAll<SVGGElement>(".sb-shade").forEach((s, i) => {
      const r = (n: number) => jit[(t * COMB + i) * 4 + n];
      // Where this arrow will land: spread along the figure and a little either side.
      const endX = a.x - a.h * (gap + 0.45 * r(0)) + a.h * 0.5 * (i / COMB);
      // Spread in depth across the floor, nearer ones lower in the frame.
      const endY = a.y - 40 + (i / (COMB - 1)) * 90 + (r(1) - 0.5) * 14;
      const lag = r(2) * 0.12;
      const u = clamp((p - lag) / (1 - lag));
      // Fast from off the frame, then slowing to a creep at the feet.
      const kk = 1 - (1 - u) ** 3;
      const x = endX - from * (1 - kk) - r(3) * 160 * (1 - kk);
      const len = Math.max(70, a.h * 0.75) * (1 + 1.2 * (1 - kk));
      const scale = len / 106;
      setAttr(s, "transform", `translate(${f1(x)} ${f1(endY)}) scale(${f3(scale)} ${f3(Math.max(0.9, a.h / 220))})`);
      setVar(s, "--o", f3(0.3 + 0.55 * kk));
    });
  }
};

/* ── The loose ─────────────────────────────────────────────────────────── */

/**
 * The arrows leaving the bow in the low angle. At each loose (`at`, a list of
 * milliseconds into the shot, the clip's own times) an arrow leaves from
 * where the drawn arrow is on that frame, measured off the caster's `arrow`
 * part, and climbs out of the frame along `angle`, smaller as it goes.
 */
const LOOSED = 4;
const Loosed = ({ cue }: VfxProps) => {
  const id = `sb-la-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg className="sb-world sb-loosed" viewBox="0 0 1600 900" {...data(cue.params)}>
      <defs>
        <ArrowArt id={id} />
      </defs>
      {Array.from({ length: LOOSED }, (_, i) => (
        <g key={i} className="sb-loosed-one" data-i={i} style={{ display: "none" }}>
          <path className="sb-loosed-trail" />
          <use href={`#${id}`} />
        </g>
      ))}
    </svg>
  );
};

/** Screen point → world point, through the stage's camera. */
function toWorld(root: HTMLElement, x: number, y: number) {
  const world = root.querySelector<HTMLElement>(".cine-world");
  if (!world) return null;
  const r = root.getBoundingClientRect();
  const m = new DOMMatrix(getComputedStyle(world).transform).inverse();
  const pt = m.transformPoint(new DOMPoint(x - r.left, y - r.top));
  return [pt.x, pt.y] as const;
}

const loosedFrame: Frame = (el, _p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".sb-loosed");
  const root = rootOf(el);
  if (!svg || !root) return;
  adoptArrow(el);
  const q = paramsOf(el);
  const times = String(q.at ?? "90").split(",").map(Number);
  const angle = num(q, "angle", -48);
  const len = num(q, "len", 140);
  const speed = num(q, "speed", 5);
  svg.querySelectorAll<SVGGElement>(".sb-loosed-one").forEach((g, i) => {
    const t0 = times[i];
    if (t0 === undefined || age < t0) {
      show(g, false);
      delete g.dataset.x;
      return;
    }
    // Where the drawn arrow was at the loose: measured once.
    if (g.dataset.x === undefined) {
      const part = root.querySelector('.cine-actor[data-role="caster"] [data-part="arrow"]');
      const box = part?.getBoundingClientRect();
      const w = box ? toWorld(root, box.left + box.width / 2, box.top + box.height / 2) : null;
      if (!w) return;
      g.dataset.x = f1(w[0]);
      g.dataset.y = f1(w[1]);
    }
    const dt = age - t0;
    const d = dt * speed;
    const x = Number(g.dataset.x) + Math.cos(rad(angle)) * (d + len * 0.6);
    const y = Number(g.dataset.y) + Math.sin(rad(angle)) * (d + len * 0.6);
    const shrink = Math.max(0.35, 1 - dt / 400);
    show(g, dt < 420);
    setAttr(g.querySelector("use"), "transform", arrowAt(x, y, angle, len * shrink));
    const tail = Math.min(d, 520);
    setAttr(g.querySelector(".sb-loosed-trail"), "d", `M${f1(x)} ${f1(y)} L${f1(x - Math.cos(rad(angle)) * tail)} ${f1(y - Math.sin(rad(angle)) * tail)}`);
    setVar(g, "--o", f3(clamp(1 - dt / 380)));
  });
};

/* ── The flare ─────────────────────────────────────────────────────────── */

/**
 * The sun flaring across the lens: a broad band of glare, white at its heart,
 * with hard spokes and a lemon fringe, sweeping across the frame at a slant.
 * `in`: it comes over from the left and whites the frame out by the end;
 * `out`: the frame starts white and the band leaves off the right. The cut
 * between the two is behind it.
 */
const Flare = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 41);
  return (
    <div className="sb-flare" data-mode={String(cue.params?.mode ?? "in")}>
      <i className="sb-flare-band" />
      <i className="sb-flare-core" />
      {Array.from({ length: 7 }, (_, i) => (
        <b key={i} style={v({ "--y": `${(i / 6) * 100 + (rand() - 0.5) * 10}%`, "--w": `${30 + rand() * 50}vw`, "--h": `${2 + rand() * 5}px`, "--d": (rand() * 0.2).toFixed(2) })} />
      ))}
    </div>
  );
};

/* ── The volley, landed ────────────────────────────────────────────────── */

const PER = 7;
const BODY_HITS = 3;

/**
 * The arrows standing in the row. For every enemy the stage placed: arrows in
 * its body and in the floor round its feet, each flying in along its line out
 * of the sun and biting in turn (the row staggered from the first target
 * outwards), with a streak back up towards the sun, a shadow laid on the floor
 * from the base of every arrow in the plaster, a spit of chips and a puff of
 * chalk dust where it bites, and a white spark where one goes into a body.
 * `land` is when the first bites (fraction of the shot); `angle` the line
 * they come down along; `size` scales the arrows against the figures.
 */
const Volley = ({ cue }: VfxProps) => {
  const id = `sb-va-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const rand = seeded(cue.seed ?? 17);
  return (
    <svg className="sb-world sb-volley" viewBox="0 0 1600 900" {...data(cue.params)}>
      <defs>
        <ArrowArt id={id} />
      </defs>
      {Array.from({ length: MAX_CAST }, (_, t) => (
        <g key={t} data-t={t} style={{ display: "none" }}>
          {Array.from({ length: PER }, (_, i) => (
            <g key={i} className="sb-hit" data-i={i}>
              <path className="sb-hit-streak" />
              <path className="sb-hit-shadow" />
              <g className="sb-hit-dust">
                {[0, 1, 2].map((k) => (
                  <g key={k} className="sb-hit-puff" data-k={k}>
                    {Array.from({ length: 4 }, (_, j) => (
                      <ellipse key={j} cx={(rand() - 0.5) * 60} cy={-8 - rand() * 26} rx={10 + rand() * 16} ry={7 + rand() * 9} />
                    ))}
                  </g>
                ))}
              </g>
              <g className="sb-hit-chips">
                {Array.from({ length: 5 }, (_, j) => (
                  <path key={j} d="M-4 -3 L5 -2 L3 4 L-5 3 Z" style={v({ "--dx": `${(rand() - 0.55) * 90}px`, "--dy": `${-30 - rand() * 60}px`, "--r": `${(rand() - 0.5) * 300}deg` })} />
                ))}
              </g>
              <path className="sb-hit-spark" d="M0 -18 L4 -4 L18 0 L4 4 L0 18 L-4 4 L-18 0 L-4 -4 Z" />
              <g className="sb-hit-arrow">
                <use href={`#${id}`} />
              </g>
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
};

const volleyFrame: Frame = (el, p, age, ctx) => {
  const svg = el.querySelector<SVGSVGElement>(".sb-volley");
  if (!svg) return;
  adoptArrow(el);
  const q = paramsOf(el);
  const land = num(q, "land", 0.02);
  const step = num(q, "step", 0.035);
  const angle = num(q, "angle", 56);
  const size = num(q, "size", 1);
  const life = p > 0 ? age / p : 760;
  const rand = seeded(Number(q.seed ?? 17) + 5);
  const jit = Array.from({ length: MAX_CAST * PER * 5 }, () => rand());
  for (let t = 0; t < MAX_CAST; t++) {
    const g = svg.querySelector(`[data-t="${t}"]`);
    const a = ctx.actor(`targets-${t}`);
    show(g, !!a);
    if (!a || !g) continue;
    const len = Math.max(96, a.h * 0.62) * size;
    g.querySelectorAll<SVGGElement>(".sb-hit").forEach((hit, i) => {
      const r = (n: number) => jit[(t * PER + i) * 5 + n];
      // Three in the body, the rest in the floor round the feet.
      const body = i < BODY_HITS;
      const x = body
        ? a.x + a.h * (-0.22 + 0.2 * i + 0.08 * (r(0) - 0.5))
        : a.x + a.h * (-0.66 + 1.2 * ((i - BODY_HITS) / (PER - BODY_HITS - 1)) + 0.1 * (r(0) - 0.5));
      const y = body ? a.y - a.h * (0.34 + 0.2 * r(1)) : a.y - 6 + r(1) * 30;
      const ang = angle + (r(2) - 0.5) * 12;
      const bite = land + t * step + i * 0.012;
      const k = (p - bite) * life;
      if (k < -40) {
        show(hit, false);
        return;
      }
      show(hit, true);
      // In flight for the last 40ms, along its line.
      const back = k < 0 ? (-k / 40) * 300 : 0;
      const dx = -Math.cos(rad(ang)) * back;
      const dy = -Math.sin(rad(ang)) * back;
      // Bitten in: the tip goes a fifth of the way under the surface.
      const sink = k >= 0 ? len * (body ? 0.18 : 0.06) : 0;
      const tx = x + dx + Math.cos(rad(ang)) * sink;
      const ty = y + dy + Math.sin(rad(ang)) * sink;
      const wob = k >= 0 ? Math.sin(k / 18) * Math.max(0, 1 - k / 360) * 5 : 0;
      const arrow = hit.querySelector(".sb-hit-arrow");
      setAttr(arrow, "transform", `rotate(${f1(wob)} ${f1(x)} ${f1(y)})`);
      setAttr(arrow?.firstElementChild, "transform", arrowAt(tx, ty, ang, len));
      const stuck = k >= 0;
      hit.toggleAttribute("data-stuck", stuck);
      hit.toggleAttribute("data-body", body);
      // The streak back towards the sun, long in flight and drawn in after.
      const streak = stuck ? Math.max(0, 1 - k / 260) * 520 : 520;
      setAttr(hit.querySelector(".sb-hit-streak"), "d", `M${f1(tx)} ${f1(ty)} L${f1(tx - Math.cos(rad(ang)) * streak)} ${f1(ty - Math.sin(rad(ang)) * streak)}`);
      // Its shadow, laid from the base away from the sun.
      if (!body) setAttr(hit.querySelector(".sb-hit-shadow"), "d", `M${f1(x)} ${f1(y + 1)} L${f1(x + len * 0.95)} ${f1(y + 3)} L${f1(x + len * 0.95)} ${f1(y + 6)} L${f1(x)} ${f1(y + 4)} Z`);
      const kk = stuck ? clamp(k / 420) : 0;
      setVar(hit, "--k", f3(kk));
      setAttr(hit.querySelector(".sb-hit-dust"), "transform", `translate(${f1(x)} ${f1(y)}) scale(${f3(Math.max(0.5, a.h / 280))})`);
      setAttr(hit.querySelector(".sb-hit-chips"), "transform", `translate(${f1(x)} ${f1(y)}) scale(${f3(Math.max(0.5, a.h / 280))})`);
      setAttr(hit.querySelector(".sb-hit-spark"), "transform", `translate(${f1(x)} ${f1(y)}) scale(${f3((1 - kk) * Math.max(0.6, a.h / 250))})`);
      const frame = String(Math.floor(Math.max(0, k) / 50) % 3);
      if (hit.dataset.k !== frame) hit.dataset.k = frame;
    });
  }
};

/* ── Heat ──────────────────────────────────────────────────────────────── */

/** Heat coming off the white roof: a few long wavering strokes drifting up, faint. */
const Heat = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 23);
  const n = Number(cue.params?.count ?? 9);
  return (
    <div className="sb-heat">
      {Array.from({ length: n }, (_, i) => (
        <i key={i} style={v({ "--x": `${rand() * 100}%`, "--y": `${55 + rand() * 40}%`, "--w": `${10 + rand() * 18}%`, "--d": (rand() * 1).toFixed(2), "--o": (0.2 + rand() * 0.3).toFixed(2) })} />
      ))}
    </div>
  );
};

/* ── On the real battlefield ───────────────────────────────────────────── */

interface Seen {
  id: string;
  rig: HTMLElement;
  rect: DOMRect;
}

function boardEnemies(): Seen[] {
  return [...document.querySelectorAll<HTMLElement>('.stage .combatant[data-side="enemy"]')]
    .filter((u) => !u.hasAttribute("data-down"))
    .map((u) => {
      const rig = u.querySelector<HTMLElement>(".combatant-rig");
      const body = u.querySelector<HTMLElement>(".combatant-body") ?? rig;
      return rig && body ? { id: u.dataset.unit ?? "", rig, rect: body.getBoundingClientRect() } : null;
    })
    .filter((x): x is Seen => !!x && x.rect.height > 0);
}

/**
 * `field` (anchored on the caster, drawn for every enemy on the board): a
 * hard pool of sun lands under each and its own shadow, a copy of its board
 * figure filled with shade, swings out from under its feet to lie long
 * behind it. `struck` (anchored on each target): arrows standing in the floor
 * round its feet, each with its shadow, as they fell.
 */
const Board = ({ cue }: VfxProps) => {
  const mode = String(cue.params?.mode ?? "field");
  const id = `sb-ba-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  if (mode === "field") return <div className="sb-board" data-mode="field" {...data(cue.params)} />;
  return (
    <div className="sb-board" data-mode="struck">
      <svg viewBox="-150 -120 300 150" className="sb-board-struck">
        <defs>
          <ArrowArt id={id} />
        </defs>
        {[
          [-70, 6, 52],
          [-30, 14, 60],
          [8, 4, 55],
          [44, 16, 62],
          [80, 8, 50],
        ].map(([x, y, ang], i) => (
          <g key={i} className="sb-board-arrow" style={v({ "--d": (i * 0.06).toFixed(2) })}>
            <path className="sb-board-shadow" d={`M${x} ${y + 1} L${x + 60} ${y + 3} L${x + 60} ${y + 5} L${x} ${y + 3} Z`} />
            <use href={`#${id}`} transform={arrowAt(x + Math.cos(rad(ang)) * 12, y + Math.sin(rad(ang)) * 12, ang, 64)} />
            <ellipse className="sb-board-chip" cx={x} cy={y + 2} rx="9" ry="3" />
          </g>
        ))}
      </svg>
    </div>
  );
};

const boardFrame: Frame = (el, p) => {
  const box = el.querySelector<HTMLElement>(".sb-board");
  if (!box) return;
  if (box.dataset.mode === "struck") {
    adoptArrow(el);
    return;
  }
  const hold = box.dataset.hold !== undefined;
  const origin = el.getBoundingClientRect();
  if (!box.dataset.built) {
    const enemies = boardEnemies();
    if (!enemies.length) return;
    box.dataset.built = "1";
    for (const e of enemies) {
      const one = document.createElement("div");
      one.className = "sb-board-one";
      one.dataset.unit = e.id;
      const pool = document.createElement("i");
      pool.className = "sb-board-pool";
      const shade = document.createElement("div");
      shade.className = "sb-board-shade";
      // Held in a box that stands it on the origin, since the rig's own
      // inline transform (whatever pose it was caught in) is dropped.
      const stand = document.createElement("div");
      stand.className = "sb-board-stand";
      stand.style.width = `${e.rect.width.toFixed(1)}px`;
      stand.style.height = `${e.rect.height.toFixed(1)}px`;
      const copy = e.rig.cloneNode(true) as HTMLElement;
      copy.className = "sb-board-copy";
      copy.style.transform = "";
      strip(copy);
      stand.appendChild(copy);
      shade.appendChild(stand);
      one.appendChild(pool);
      one.appendChild(shade);
      box.appendChild(one);
    }
  }
  // Every unit's place, relative to this effect, which rides the caster.
  for (const one of box.querySelectorAll<HTMLElement>(".sb-board-one")) {
    const rig = document.querySelector<HTMLElement>(`.stage [data-unit="${CSS.escape(one.dataset.unit ?? "")}"] .combatant-body, .stage [data-unit="${CSS.escape(one.dataset.unit ?? "")}"] .combatant-rig`);
    const r = rig?.getBoundingClientRect();
    if (!r) continue;
    const x = r.left + r.width / 2 - origin.left;
    const y = r.bottom - origin.top;
    const tr = `translate(${f1(x)}px, ${f1(y)}px)`;
    if (one.style.transform !== tr) one.style.transform = tr;
    setVar(one, "--w", `${f1(r.width)}px`);
    setVar(one, "--h", `${f1(r.height)}px`);
  }
  // The shadows swing out from under the feet (or stay out).
  setVar(box, "--swing", f3(hold ? 1 : easeOut(span(p, 0.05, 0.75))));
};

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "sb-sun": Sun,
  "sb-cast": Cast,
  "sb-shadows": Shadows,
  "sb-loosed": Loosed,
  "sb-flare": Flare,
  "sb-volley": Volley,
  "sb-heat": Heat,
  "sb-board": Board,
};

export const frames: Record<string, Frame> = {
  "sb-cast": castFrame,
  "sb-shadows": shadowsFrame,
  "sb-loosed": loosedFrame,
  "sb-volley": volleyFrame,
  "sb-board": boardFrame,
};
