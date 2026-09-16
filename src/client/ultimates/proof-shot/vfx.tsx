import { useId, type CSSProperties, type ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { BLUE, PEWTER, PlateArt } from "./background";
import "./style.css";

/**
 * Proof Shot's effects.
 *
 * The idea they serve: from the far end of the proving range the
 * Sharpshooter puts one arrow through the plate hung in front of the target,
 * and the second through the hole the first one made.
 *
 *   ps-wind      grit blowing low across the frame, which can stop dead
 *   ps-grit      a pinch of cinder let go from the open hand, taken by the wind
 *   ps-streamer  the range flag: `fly` on its pole (rippling, then dropping
 *                still at `dropAt`), or `wipe` — its cloth across the lens,
 *                the cut hidden behind it
 *   ps-plate     the proof plate hung from its frame in front of the target:
 *                `hung` (swaying), or `proof` — holed at `hit`, knocked off
 *                its hook and down to the ground
 *   ps-arrows    the two arrows arriving along the range: the first stands
 *                in the target at `hit1`; at `hit2` the second splits it and
 *                stands in the same hole, which shines
 *   ps-board     on the real battlefield: `paces` (pace lines across the
 *                floor in front of the target) and `proved` (the plate lying
 *                holed at its feet, the arrows in it, the hole shining)
 *
 * Nothing animates by itself and nothing here filters. Effects read the
 * film's `--p` family; those placed from where the cast really stands (the
 * arrows) use frame functions and write only when something changed.
 */

const OXBLOOD = "#8a3b30";
type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;
const v = (vars: Record<string, string | number>) => vars as CSSProperties;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const f1 = (n: number) => n.toFixed(1);
const f3 = (n: number) => n.toFixed(3);
const rad = (d: number) => (d * Math.PI) / 180;
const setAttr = (el: Element | null | undefined, name: string, value: string) => {
  if (el && el.getAttribute(name) !== value) el.setAttribute(name, value);
};
const setVar = (el: HTMLElement | SVGElement | null | undefined, name: string, value: string) => {
  if (el && el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
};
const show = (el: Element | null | undefined, on: boolean) => {
  const node = el as HTMLElement | SVGElement | null | undefined;
  if (!node) return;
  const want = on ? "" : "none";
  if (node.style.display !== want) node.style.display = want;
};
/** A cue's params, written on the effect's first child so a frame can read them. */
const data = (params: VfxProps["cue"]["params"] = {}) =>
  Object.fromEntries(Object.entries(params).map(([k, x]) => [`data-${k.toLowerCase()}`, String(x)]));
const paramsOf = (el: HTMLElement) => (el.firstElementChild as HTMLElement | null)?.dataset ?? {};
const num = (d: DOMStringMap, k: string, fallback: number) =>
  d[k.toLowerCase()] === undefined ? fallback : Number(d[k.toLowerCase()]);

/* ── The arrow ─────────────────────────────────────────────────────────── */

/**
 * The arrow, drawn as the Ranger draws it (nock at −6, head at 28), and
 * replaced on the first frame with a copy of the one the kid is really
 * holding, gear included (`adoptArrow`).
 */
function ArrowArt({ id }: { id: string }) {
  return (
    <g id={id} className="ps-arrow-art">
      <path d="M-4 0 H24" stroke={PEWTER.ink} strokeWidth="3" strokeLinecap="round" />
      <path d="M-4 0 H24" stroke="#d9b27a" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M22 -2.6 L28 0 L22 2.6 Z" fill="#b9c0cc" stroke={PEWTER.ink} strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M-6 -2.4 L-1 0 L-6 2.4 L-4 0 Z" fill="#c4533f" stroke={PEWTER.ink} strokeWidth="0.9" />
    </g>
  );
}
function adoptArrow(el: HTMLElement) {
  const art = el.querySelector<SVGGElement>(".ps-arrow-art");
  if (!art || art.dataset.adopted) return;
  art.dataset.adopted = "1";
  const held = document.querySelector('.ult-cinematic .cine-actor[data-role="caster"] [data-part="arrow"] > g');
  if (!held) return;
  const copy = held.cloneNode(true) as SVGGElement;
  copy.removeAttribute("transform");
  art.replaceChildren(...copy.childNodes);
}
/** Place the arrow art with its head at (x, y), pointing `angle`, `len` long. */
const arrowAt = (x: number, y: number, angle: number, len: number) =>
  `translate(${f1(x)} ${f1(y)}) rotate(${f1(angle)}) scale(${f3(len / 34)}) translate(-28 0)`;

/* ── Wind ──────────────────────────────────────────────────────────────── */

/**
 * Grit blowing across the frame, low: short streaks moving with the wind
 * (to the right), which slow and stop dead at `stopAt` (a fraction of the
 * effect's life) — the quiet — or never move with `still`.
 */
const Wind = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 41);
  const count = Number(cue.params?.count ?? 26);
  return (
    <div className="ps-wind" data-stopat={String(cue.params?.stopAt ?? 2)} data-still={cue.params?.still ? "" : undefined} style={v({ "--o": Number(cue.params?.o ?? 0.55) })}>
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          data-x={rand().toFixed(3)}
          data-y={(0.45 + rand() * 0.6).toFixed(3)}
          data-speed={(0.55 + rand() * 0.9).toFixed(3)}
          style={v({ "--len": `${(2 + rand() * 5).toFixed(1)}vw`, "--s": (0.5 + rand() * 1).toFixed(2), "--o2": (0.3 + rand() * 0.7).toFixed(2) })}
        />
      ))}
    </div>
  );
};

const windFrame: Frame = (el, p, age) => {
  const box = el.querySelector<HTMLElement>(".ps-wind");
  if (!box) return;
  const w = box.offsetWidth;
  const h = box.offsetHeight;
  const stop = Number(box.dataset.stopat);
  const life = p > 0 ? age / p : 0;
  const stopMs = stop * life;
  // Past `stopAt` the grit decelerates over 150ms to a standstill.
  const t = box.dataset.still !== undefined ? 0 : age <= stopMs ? age : stopMs + Math.min(150, age - stopMs) * (1 - Math.min(150, age - stopMs) / 300);
  for (const f of box.querySelectorAll<HTMLElement>("i")) {
    const speed = Number(f.dataset.speed);
    const x = ((Number(f.dataset.x) + (t / 1000) * speed) % 1.15) * w * 1.15 - w * 0.15;
    const y = Number(f.dataset.y) * h + Math.sin(t / 130 + Number(f.dataset.x) * 20) * 6;
    const tr = `translate3d(${f1(x)}px, ${f1(y)}px, 0)`;
    if (f.style.transform !== tr) f.style.transform = tr;
  }
};

/** A pinch of cinder let go from the fingers: grains that fall and are taken sideways by the wind. */
const Grit = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 43);
  return (
    <div className="ps-grit">
      {Array.from({ length: 18 }, (_, i) => (
        <i
          key={i}
          style={v({
            "--dx": `${(rand() - 0.3) * 40}px`,
            "--dy": `${20 + rand() * 60}px`,
            "--d": (rand() * 0.35).toFixed(2),
            "--s": (0.6 + rand() * 1.1).toFixed(2),
            "--w": `${120 + rand() * 160}px`,
          })}
        />
      ))}
    </div>
  );
};

/* ── The streamer ──────────────────────────────────────────────────────── */

/**
 * The range flag. `fly`: a long, narrow cloth off the top of a pole at the
 * cue's point, rippling in the wind; from `dropAt` (a fraction of the
 * effect's life) the wind dies and the cloth sags and hangs still. `len` and
 * `w` are its length and width in world units. `wipe`: the cloth across the
 * lens (screen layer), `mode: in` coming over the frame from the left until
 * it covers it, `mode: out` leaving off the right.
 */
const Streamer = ({ cue }: VfxProps) => {
  const q = cue.params ?? {};
  if (q.wipe) {
    const rand = seeded(cue.seed ?? 47);
    return (
      <div className="ps-wipe" data-mode={String(q.mode ?? "in")}>
        <svg className="ps-wipe-cloth" viewBox="0 0 300 100" preserveAspectRatio="none">
          <path
            d={`M0 -5 L0 105 L292 105 ${Array.from({ length: 9 }, (_, i) => `L${(292 + (i % 2 ? 8 : -6) + rand() * 4).toFixed(1)} ${(105 - ((i + 1) / 9) * 110).toFixed(1)}`).join(" ")} L292 -5 Z`}
            fill={OXBLOOD}
          />
          <path d="M20 -5 L20 105 M60 -5 L60 105 M110 -5 L110 105 M170 -5 L170 105 M230 -5 L230 105" stroke="#6e2c24" strokeWidth="6" />
          <path d="M40 -5 L40 105 M130 -5 L130 105 M200 -5 L200 105 M260 -5 L260 105" stroke="#a04a3c" strokeWidth="3" opacity="0.7" />
        </svg>
      </div>
    );
  }
  return (
    <svg className="ps-world ps-streamer" viewBox="0 0 1600 900" {...data(q)}>
      <path className="ps-streamer-shadow" />
      <path className="ps-streamer-cloth" />
      <path className="ps-streamer-fold" />
    </svg>
  );
};

const streamerFrame: Frame = (el, p, age) => {
  const svg = el.querySelector<SVGSVGElement>(".ps-streamer");
  if (!svg) return;
  const q = paramsOf(el);
  const x0 = num(q, "x", 800);
  const y0 = num(q, "y", 300);
  const L = num(q, "len", 260);
  const W = num(q, "w", 34);
  const drop = num(q, "dropAt", 2);
  const frame = Math.floor(age / 40);
  if (svg.dataset.frame === String(frame)) return;
  svg.dataset.frame = String(frame);
  const t = age / 1000;
  // The wind: full until `dropAt`, then gone over a third of the life; the cloth sags as it goes.
  const gone = clamp((p - drop) / 0.3);
  const amp = 1 - gone;
  const sag = clamp((p - drop) / 0.42);
  const n = 16;
  const top: string[] = [];
  const bottom: string[] = [];
  const fold: string[] = [];
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    // Flying: streams out level, rippling more towards the tip. Dropped: hangs.
    const reach = L * (1 - sag * 0.88) * k;
    const ripple = Math.sin(k * 7.5 - t * 13) * W * (0.25 + k * 0.7) * amp;
    const hang = sag * Math.pow(k, 1.25) * L * 0.92;
    const x = x0 + reach + (sag > 0 ? Math.sin(k * 4 + 1) * 6 * sag : 0);
    const y = y0 + ripple + hang;
    const half = (W / 2) * (1 - k * 0.55);
    top.push(`${f1(x)} ${f1(y - half)}`);
    bottom.push(`${f1(x)} ${f1(y + half)}`);
    if (i % 4 === 2) fold.push(`M${f1(x)} ${f1(y - half * 0.7)} L${f1(x + 3)} ${f1(y + half * 0.7)}`);
  }
  const d = `M${top.join(" L")} L${bottom.reverse().join(" L")} Z`;
  setAttr(svg.querySelector(".ps-streamer-cloth"), "d", d);
  setAttr(svg.querySelector(".ps-streamer-shadow"), "d", d);
  setAttr(svg.querySelector(".ps-streamer-fold"), "d", fold.join(" "));
};

/* ── The plate ─────────────────────────────────────────────────────────── */

/**
 * The proof plate hung from its iron frame, standing in front of the target
 * (the effect follows the target; its size comes from the figure's drawn
 * height, `--ah`). `hung`: swaying a little in the wind, still after
 * `stillAt`. `proof`: at `hit` the arrow punches a proof mark through it,
 * the plate is knocked off its hook, and it falls, turning, to the ground.
 */
const Plate = ({ cue }: VfxProps) => {
  const q = cue.params ?? {};
  const mode = String(q.mode ?? "hung");
  return (
    <div className="ps-plate" data-mode={mode} {...data(q)}>
      <svg className="ps-plate-svg" viewBox="-110 -300 220 320">
        <ellipse cx="0" cy="8" rx="70" ry="11" fill={PEWTER.ink} opacity="0.4" />
        <path d="M-56 0 L-16 -268 L16 -268 L56 0" fill="none" stroke={PEWTER.iron} strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M-18 -268 H18" stroke={PEWTER.iron} strokeWidth="11" strokeLinecap="round" />
        <path className="ps-plate-chain" d="M0 -264 V-214" stroke={PEWTER.iron} strokeWidth="5" strokeDasharray="7 5" />
        <g className="ps-plate-swing">
          <g className="ps-plate-body" transform="translate(0 -160) scale(1.45)">
            <PlateArt holes={[[-13, 12, 4]]} />
            <g className="ps-plate-mark">
              <circle className="ps-plate-shine" r="18" fill={BLUE} />
              <path d="M-9 -1 L-3 -9 L6 -7 L10 2 L4 9 L-6 7 Z" fill={PEWTER.skyLow} stroke="#eaf2ff" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M-11 -3 L-15 -7 M8 -9 L12 -13 M11 5 L16 7 M-6 10 L-9 14" stroke="#eaf2ff" strokeWidth="2" strokeLinecap="round" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

const plateFrame: Frame = (el, p, age) => {
  const box = el.querySelector<HTMLElement>(".ps-plate");
  if (!box) return;
  const q = box.dataset;
  const swing = box.querySelector<SVGGElement>(".ps-plate-swing");
  if (q.mode !== "proof") {
    const still = num(q, "stillAt", 2);
    const life = p > 0 ? age / p : 0;
    const t = Math.min(age, still * life) / 1000;
    const calm = clamp((age / 1000 - t) / 0.25);
    const a = Math.sin(t * 5.5) * 2.4 * (1 - calm);
    setAttr(swing, "transform", `rotate(${f1(a)} 0 -264)`);
    return;
  }
  const hit = num(q, "hit", 0);
  const k = clamp((p - hit) / 0.42);
  const struck = p >= hit;
  box.toggleAttribute("data-struck", struck);
  if (!struck) {
    setAttr(swing, "transform", "rotate(0 0 -264)");
    show(box.querySelector(".ps-plate-chain"), true);
    return;
  }
  // Knocked off the hook: it turns as it drops, bounces once on the cinder and lies.
  const fall = k < 0.72 ? Math.pow(k / 0.72, 1.8) : 1 - Math.sin(((k - 0.72) / 0.28) * Math.PI) * 0.07;
  const dx = 30 * k + 26 * Math.min(1, k * 2);
  const dy = 232 * fall;
  const rot = 12 * Math.min(1, k * 6) + 74 * clamp((k - 0.12) / 0.7);
  setAttr(swing, "transform", `translate(${f1(dx)} ${f1(dy)}) rotate(${f1(rot)} 0 -160)`);
  show(box.querySelector(".ps-plate-chain"), k < 0.06);
  setVar(box, "--k", f3(k));
};

/* ── The arrows ────────────────────────────────────────────────────────── */

/**
 * The two arrows arriving along the range into the target (placed from the
 * stage's own placement of it, `targets-0`): the first flies in over its
 * last 45ms and stands at `hit1` at the entry point (`ex`, `ey`, fractions
 * of the figure's drawn height from its ground point); at `hit2` the second
 * arrives on the same line, splits the first's shaft — the halves fly off —
 * and stands in the same hole, which shines.
 */
const Arrows = ({ cue }: VfxProps) => {
  const id = `ps-aa-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const rand = seeded(cue.seed ?? 53);
  return (
    <svg className="ps-world ps-arrows" viewBox="0 0 1600 900" {...data(cue.params)}>
      <defs>
        <ArrowArt id={id} />
      </defs>
      <g className="ps-hole">
        <circle className="ps-hole-glow" r="16" fill={BLUE} />
        <path className="ps-hole-mark" d="M-9 -2 L-3 -10 L6 -8 L11 1 L5 9 L-6 8 Z" fill="#101318" stroke={BLUE} strokeWidth="2.5" strokeLinejoin="round" />
        <path className="ps-hole-rays" d="M-12 -5 L-19 -9 M8 -11 L13 -17 M13 4 L20 6 M-7 11 L-11 16" stroke="#dbe8ff" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      {[0, 1].map((i) => (
        <g key={i} className="ps-arrow" data-i={i} style={{ display: "none" }}>
          <path className="ps-arrow-streak" />
          <g className="ps-arrow-shaft">
            <use href={`#${id}`} />
          </g>
          <path className="ps-arrow-spark" d="M0 -16 L4 -4 L16 0 L4 4 L0 16 L-4 4 L-16 0 L-4 -4 Z" />
        </g>
      ))}
      <g className="ps-halves" style={{ display: "none" }}>
        {[0, 1, 2, 3].map((i) => (
          <g key={i} className="ps-half" data-i={i} style={v({ "--dx": (-40 - rand() * 90).toFixed(1), "--dy": ((i % 2 ? 1 : -1) * (30 + rand() * 50)).toFixed(1), "--r": ((rand() - 0.5) * 300).toFixed(0) })}>
            <path className="ps-half-shaft" d={`M0 0 H${(14 + rand() * 12).toFixed(0)}`} />
            {i === 0 && <path className="ps-half-fletch" d="M-6 -2.6 L-1 0 L-6 2.6 L-4 0 Z" />}
          </g>
        ))}
      </g>
    </svg>
  );
};

const arrowsFrame: Frame = (el, p, age, ctx) => {
  const svg = el.querySelector<SVGSVGElement>(".ps-arrows");
  if (!svg) return;
  adoptArrow(el);
  const q = paramsOf(el);
  const a = ctx.actor("targets-0");
  if (!a) return;
  const life = p > 0 ? age / p : 760;
  const ex = a.x + a.h * num(q, "ex", -0.26);
  const ey = a.y - a.h * num(q, "ey", 0.55);
  const len = Math.max(90, a.h * num(q, "len", 0.58));
  const hits = [num(q, "hit1", 0.02), num(q, "hit2", 0.32)];
  const k2 = (p - hits[1]) * life;
  for (let i = 0; i < 2; i++) {
    const g = svg.querySelector<SVGGElement>(`.ps-arrow[data-i="${i}"]`);
    if (!g) continue;
    const k = (p - hits[i]) * life;
    if (k < -45) {
      show(g, false);
      continue;
    }
    show(g, true);
    const ang = -3 + i * 2;
    // In flight over its last 45ms, along the range from the left.
    const back = k < 0 ? (-k / 45) * 700 : 0;
    const sink = k >= 0 ? len * 0.16 : 0;
    const x = ex - back + Math.cos(rad(ang)) * sink;
    const y = ey - Math.sin(rad(-ang)) * back * 0 + Math.sin(rad(ang)) * sink;
    const wob = k >= 0 ? Math.sin(k / 16) * Math.max(0, 1 - k / 320) * 6 : 0;
    const shaft = g.querySelector(".ps-arrow-shaft");
    // The first arrow's shaft is gone once the second has split it.
    const split = i === 0 && k2 >= 0;
    show(shaft, !split);
    setAttr(shaft, "transform", `rotate(${f1(wob)} ${f1(x)} ${f1(y)})`);
    setAttr(shaft?.firstElementChild, "transform", arrowAt(x, y, ang, len));
    const streakLen = k < 0 ? 520 : Math.max(0, 1 - k / 200) * 520;
    setAttr(g.querySelector(".ps-arrow-streak"), "d", `M${f1(x - len * 0.9)} ${f1(y)} L${f1(x - len * 0.9 - streakLen)} ${f1(y + 2)}`);
    const sparkK = k >= 0 ? clamp(k / 160) : 0;
    setAttr(g.querySelector(".ps-arrow-spark"), "transform", `translate(${f1(ex)} ${f1(ey)}) scale(${f3((1 - sparkK) * Math.max(0.6, a.h / 300) * (k >= 0 ? 1 : 0))})`);
    g.toggleAttribute("data-stuck", k >= 0);
  }
  // The halves of the first shaft, flung off the line at the second hit.
  const halves = svg.querySelector<SVGGElement>(".ps-halves");
  show(halves, k2 >= 0);
  if (halves && k2 >= 0) {
    const kk = clamp(k2 / 420);
    setVar(halves, "--k", f3(kk));
    setAttr(halves, "transform", `translate(${f1(ex - len * 0.5)} ${f1(ey)}) scale(${f3(len / 34)})`);
  }
  const hole = svg.querySelector<SVGGElement>(".ps-hole");
  const holeK = p >= hits[0] ? (k2 >= 0 ? 1 : 0.35) : 0;
  show(hole, holeK > 0);
  if (hole) {
    setAttr(hole, "transform", `translate(${f1(ex)} ${f1(ey)}) scale(${f3(Math.max(0.6, a.h / 300))})`);
    setVar(hole, "--k", f3(holeK));
    setVar(hole, "--f2", f3(k2 >= 0 ? clamp(k2 / 300) : 0));
  }
};

/**
 * A pale light behind the target, sized from the figure, so the two-tone
 * frame has something light for it to be black against: cinder and a dark
 * creature alone go to one black.
 */
const Glare = () => <div className="ps-glare" />;

/* ── On the real battlefield ───────────────────────────────────────────── */

/**
 * `paces`: three pace lines across the real floor in front of the target,
 * towards the party, lighting one after another away from it: the range,
 * measured. `proved`: the plate lying holed at the target's feet, the two
 * arrows standing in it (the first split), and the hole shining.
 */
const Board = ({ cue }: VfxProps) => {
  const mode = String(cue.params?.mode ?? "paces");
  const id = `ps-ba-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  if (mode === "paces")
    return (
      <div className="ps-board" data-mode="paces">
        <svg viewBox="-400 -60 440 80" className="ps-board-paces">
          {[0, 1, 2].map((i) => (
            <g key={i} className="ps-board-pace" style={v({ "--d": (i * 0.18).toFixed(2) })}>
              <path d={`M${-104 - i * 105} 4 L${-46 - i * 105} -8`} stroke={BLUE} strokeWidth={12 - i * 2} strokeLinecap="round" opacity="0.35" />
              <path d={`M${-104 - i * 105} 4 L${-46 - i * 105} -8`} stroke={PEWTER.line} strokeWidth={5 - i} strokeLinecap="round" opacity={0.9 - i * 0.15} />
            </g>
          ))}
        </svg>
      </div>
    );
  return (
    <div className="ps-board" data-mode="proved">
      <svg viewBox="-150 -160 300 180" className="ps-board-proved">
        <defs>
          <ArrowArt id={id} />
        </defs>
        <g className="ps-board-plate" transform="translate(-58 -6) rotate(-78) scale(0.62)">
          <PlateArt holes={[[-13, 10, 4]]} />
          <path d="M-9 -1 L-3 -9 L6 -7 L10 2 L4 9 L-6 7 Z" fill={PEWTER.skyLow} stroke="#eaf2ff" strokeWidth="2.5" strokeLinejoin="round" />
        </g>
        <g className="ps-board-hole">
          <circle r="16" fill={BLUE} className="ps-board-glow" />
          <path d="M-6 -1 L-2 -7 L4 -5 L7 1 L3 6 L-4 5 Z" fill="#101318" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" />
        </g>
        <g className="ps-board-arrow" style={v({ "--d": 0 })}>
          <use href={`#${id}`} />
        </g>
        <path className="ps-board-half" d="M0 0 H16" style={v({ "--d": 0.1 })} />
      </svg>
    </div>
  );
};

const boardFrame: Frame = (el) => {
  const box = el.querySelector<HTMLElement>(".ps-board");
  if (!box || box.dataset.mode !== "proved") return;
  adoptArrow(el);
  if (box.dataset.placed) return;
  box.dataset.placed = "1";
  // The hole and the arrow sit on the figure's chest, whatever its height.
  const unitH = parseFloat(getComputedStyle(el).getPropertyValue("--unit-h")) || 150;
  const unitW = parseFloat(getComputedStyle(el).getPropertyValue("--unit-w")) || 120;
  const chest = -(unitH / unitW) * 150 * 0.55;
  const front = -0.32 * 150;
  setAttr(box.querySelector(".ps-board-hole"), "transform", `translate(${f1(front)} ${f1(chest)})`);
  setAttr(box.querySelector(".ps-board-arrow use"), "transform", arrowAt(front + 8, chest, -6, 78));
  setAttr(box.querySelector(".ps-board-half"), "transform", `translate(${f1(front - 40)} ${f1(chest + 22)}) rotate(28) scale(2.1)`);
};

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "ps-wind": Wind,
  "ps-grit": Grit,
  "ps-streamer": Streamer,
  "ps-plate": Plate,
  "ps-arrows": Arrows,
  "ps-glare": Glare,
  "ps-board": Board,
};

export const frames: Record<string, Frame> = {
  "ps-wind": windFrame,
  "ps-streamer": streamerFrame,
  "ps-plate": plateFrame,
  "ps-arrows": arrowsFrame,
  "ps-board": boardFrame,
};
