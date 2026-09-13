import type { ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { ease } from "../../cinematic/timeline";
import "./style.css";

/**
 * Foreclosure's effects.
 *
 * The idea they serve: the Broker weighs whatever the enemy is standing behind
 * against one coin of its own, finds it worth less, and repossesses it —
 * knocks it off the enemy with the ledger and pays it out, re-minted, as the
 * party's Barrier.
 *
 *   foreclosure-tag         a price tag on a red string: dropped, hung, torn
 *   foreclosure-balance     the vault's great balance, solved from the target
 *   foreclosure-collateral  what the target stands behind: held, then seized
 *   foreclosure-coin        the Broker's coin: flicked, across the lens,
 *                           dropped in the pan, spun down on the brass
 *   foreclosure-mill        the drawn impact: a coin's milled rim bursting
 *   foreclosure-proceeds    on the real board: coin from the target to the party
 *   foreclosure-ward        on the real board: a minted disc on each of them
 *
 * Everything reads where the cast really is (`ctx.actor`) each frame, and is
 * sized from the target's real drawn height, so a hound and a boss both fit
 * the same balance. Nothing filters; nothing is animated by CSS on its own.
 */

export const BRASS = "#f3d487";
const INK = "#07100b";

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const rootOf = (el: HTMLElement) => el.closest<HTMLElement>(".ult-cinematic");

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

/* ── Art ───────────────────────────────────────────────────────────────── */

/** The Broker's coin, face on, in a -50…50 box: milled rim, ring, its ◈ mark. */
const COIN_SVG = `<svg class="fc-coin-art" viewBox="-50 -50 100 100" aria-hidden="true"><circle r="49" fill="#5c4418"/><circle r="45.5" fill="#e6c26a"/><circle r="45.5" fill="none" stroke="#8d6a26" stroke-width="6" stroke-dasharray="2.2 2.6"/><circle r="35" fill="none" stroke="#a9812f" stroke-width="2.6"/><path d="M0 -21 L21 0 L0 21 L-21 0 Z" fill="none" stroke="#6f5217" stroke-width="5" stroke-linejoin="round"/><path d="M0 -8.5 L8.5 0 L0 8.5 L-8.5 0 Z" fill="#6f5217"/><path d="M-31 -24 A39 39 0 0 1 8 -39" stroke="#fff5cf" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.75"/></svg>`;

function CoinArt() {
  return <span className="fc-coin-holder" dangerouslySetInnerHTML={{ __html: COIN_SVG }} />;
}

/**
 * What an enemy stands behind, as the Broker sees it: a tarnished disc with a
 * lock in it. The ward it becomes is the same disc, bright, with the Broker's
 * mark where the lock was.
 */
function DiscArt({ minted }: { minted?: boolean }) {
  const rim = minted ? "#f3d487" : "#877a45";
  const mill = minted ? "#fff1c4" : "#3d3b22";
  const face = minted ? "#f3d487" : "#b5a86e";
  return (
    <svg className="fc-disc" viewBox="-100 -100 200 200" aria-hidden="true">
      <circle r="90" fill={face} fillOpacity={minted ? 0.2 : 0.26} />
      <circle r="90" fill="none" stroke={INK} strokeWidth="17" opacity={minted ? 0.5 : 0.8} />
      <circle r="90" fill="none" stroke={rim} strokeWidth="11" />
      <circle r="90" fill="none" stroke={mill} strokeWidth="11" strokeDasharray="3 5" opacity="0.75" />
      <circle r="70" fill="none" stroke={rim} strokeWidth="4" opacity="0.8" />
      {minted ? (
        <g className="fc-mark">
          <path d="M0 -40 L40 0 L0 40 L-40 0 Z" fill="none" stroke="#fff1c4" strokeWidth="9" strokeLinejoin="round" />
          <path d="M0 -15 L15 0 L0 15 L-15 0 Z" fill="#fff1c4" />
        </g>
      ) : (
        <g>
          <ellipse cx="-38" cy="28" rx="22" ry="12" fill="#4e6b47" opacity="0.4" />
          <ellipse cx="42" cy="-30" rx="14" ry="9" fill="#4e6b47" opacity="0.35" />
          <circle cy="-12" r="15" fill={INK} opacity="0.88" />
          <path d="M-9 -2 H9 L15 34 H-15 Z" fill={INK} opacity="0.88" />
        </g>
      )}
      <path d="M-66 -52 A86 86 0 0 1 -12 -84" stroke="#fff6d6" strokeWidth="7" fill="none" strokeLinecap="round" opacity={minted ? 0.8 : 0.35} />
    </svg>
  );
}

/* ── Renderers ─────────────────────────────────────────────────────────── */

const Tag = ({ cue }: VfxProps) => (
  <div
    className="fc-tag-box"
    data-fc=""
    data-mode={String(cue.params?.mode ?? "hang")}
    data-hit={String(cue.params?.hit ?? 0.1)}
    data-ox={String(cue.params?.ox ?? -0.05)}
    data-oy={String(cue.params?.oy ?? 0.72)}
    data-size={String(cue.params?.size ?? 1)}
  >
    <svg className="fc-tag" viewBox="-40 -300 80 400" aria-hidden="true">
      <path className="fc-tag-string" d="M0 -300 V0" />
      <g className="fc-tag-half a">
        <path d="M-26 0 H0 V78 H-26 L-26 12 Z" className="fc-tag-card" />
        <path d="M-18 30 H-4 M-18 44 H-6 M-18 58 H-8" className="fc-tag-ink" />
      </g>
      <g className="fc-tag-half b">
        <path d="M0 0 H26 V66 L13 78 L0 78 Z" className="fc-tag-card" />
        <path d="M4 30 H18 M6 44 H16" className="fc-tag-ink" />
        <path d="M2 60 L20 38" className="fc-tag-red" />
      </g>
      <circle cy="12" r="5.5" className="fc-tag-hole" />
    </svg>
  </div>
);

const Balance = ({ cue }: VfxProps) => (
  <svg
    className="fc-balance"
    viewBox="0 0 1600 900"
    data-fc=""
    data-part={String(cue.params?.part ?? "back")}
    data-px={String(cue.params?.px ?? 800)}
    data-rest={String(cue.params?.rest ?? 800)}
    data-floor={String(cue.params?.floor ?? 1100)}
    aria-hidden="true"
  >
    {cue.params?.part === "front" ? (
      <>
        <path className="fc-pan-bowl l" />
        <path className="fc-pan-bowl r" />
        <path className="fc-pan-lip l" />
        <path className="fc-pan-lip r" />
      </>
    ) : (
      <>
        <path className="fc-post" />
        <path className="fc-hang l" />
        <path className="fc-hang r" />
        <ellipse className="fc-pan-in l" />
        <ellipse className="fc-pan-in r" />
        <path className="fc-beam-ink" />
        <path className="fc-beam" />
        <path className="fc-tongue" />
        <circle className="fc-pivot" r="26" />
        <circle className="fc-pivot-in" r="10" />
        <circle className="fc-finial l" r="14" />
        <circle className="fc-finial r" r="14" />
      </>
    )}
  </svg>
);

const SHED = 12;

const Collateral = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 41);
  return (
    <div
      className="fc-collateral"
      data-fc=""
      data-mode={String(cue.params?.mode ?? "hold")}
      data-hit={String(cue.params?.hit ?? 0.1)}
      data-ox={String(cue.params?.ox ?? -0.2)}
      data-oy={String(cue.params?.oy ?? 0.46)}
      data-size={String(cue.params?.size ?? 1)}
      data-fly={String(cue.params?.fly ?? -1)}
    >
      <div className="fc-collateral-disc">
        <DiscArt />
      </div>
      {cue.params?.mode === "seize" &&
        Array.from({ length: SHED }, (_, i) => (
          <div
            key={i}
            className="fc-shed"
            data-vx={((rand() - 0.65) * 2.4).toFixed(3)}
            data-vy={(-0.8 - rand() * 1.6).toFixed(3)}
            data-spin={(8 + rand() * 18).toFixed(2)}
            data-s={(0.55 + rand() * 0.6).toFixed(2)}
          >
            <CoinArt />
          </div>
        ))}
    </div>
  );
};

const Coin = ({ cue }: VfxProps) => {
  const mode = String(cue.params?.mode ?? "drop");
  return (
    <div
      className="fc-coin"
      data-fc=""
      data-mode={mode}
      data-size={String(cue.params?.size ?? 60)}
      data-land={String(cue.params?.land ?? 0.36)}
      data-flat={String(cue.params?.flat ?? 0.86)}
      data-rise={String(cue.params?.rise ?? 300)}
    >
      {mode === "spin" && <i className="fc-spin-plate" />}
      {mode === "spin" && <i className="fc-spin-shadow" />}
      {mode === "spin" && (
        <div className="fc-spin-rim">
          <CoinArt />
        </div>
      )}
      <div className="fc-coin-face">
        <CoinArt />
      </div>
    </div>
  );
};

const Mill = ({ cue }: VfxProps) => (
  <div className="fc-mill" data-fc="" data-ox={String(cue.params?.ox ?? -0.2)} data-oy={String(cue.params?.oy ?? 0.5)} data-size={String(cue.params?.size ?? 1)}>
    <svg viewBox="-120 -120 240 240" aria-hidden="true">
      <g className="fc-mill-wedges">
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2 + (i % 2) * 0.12;
          const r0 = 40;
          const r1 = i % 3 ? 112 : 120;
          const w = 0.07;
          const pt = (r: number, d: number) => `${(Math.cos(a + d) * r).toFixed(1)} ${(Math.sin(a + d) * r).toFixed(1)}`;
          return <path key={i} d={`M${pt(r0, -w)} L${pt(r1, 0)} L${pt(r0, w)} Z`} />;
        })}
      </g>
      <circle className="fc-mill-core" r="44" />
      <circle className="fc-mill-ring" r="78" />
      <circle className="fc-mill-ticks a" r="78" />
      <circle className="fc-mill-ticks b" r="78" />
    </svg>
  </div>
);

const Proceeds = () => <div className="fc-proceeds" data-fc="" />;

/**
 * The lamp's pool thrown up behind the target at the blow, so the drawn
 * brass-and-ink frame has brass behind the target to cut its silhouette on.
 */
const Glow = () => <i className="fc-glow" />;

const Ward = () => (
  <div className="fc-ward">
    <i className="fc-ward-ring" />
    <div className="fc-ward-disc">
      <DiscArt minted />
    </div>
  </div>
);

/* ── Frames ────────────────────────────────────────────────────────────── */

const num = (el: HTMLElement, key: string, fallback = 0) => {
  const x = Number(el.dataset[key]);
  return Number.isFinite(x) ? x : fallback;
};

const setD = (el: Element | null | undefined, d: string) => {
  if (el && el.getAttribute("d") !== d) el.setAttribute("d", d);
};
const setStyle = (el: HTMLElement | SVGElement | null | undefined, name: string, value: string) => {
  if (el && el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
};
const setTransform = (el: HTMLElement | SVGElement | null | undefined, value: string) => {
  if (el && el.style.transform !== value) el.style.transform = value;
};

/**
 * The height a figure-sized effect is measured by: the actor it follows in a
 * cinematic shot, or the unit it is anchored on over the battlefield.
 */
function heightOf(el: HTMLElement, ctx: VfxContext) {
  if (el.dataset.follow) {
    const id = el.dataset.follow === "caster" ? "caster" : `targets-${el.dataset.followIndex ?? 0}`;
    return ctx.actor(id)?.h ?? 0;
  }
  return parseFloat(el.style.getPropertyValue("--ah")) || 0;
}

/** Where the left pan is this frame, for the coin that drops into it. */
const PAN = new WeakMap<HTMLElement, { x: number; y: number; r: number }>();

const balance: Frame = (el, _p, _age, ctx) => {
  const svg = el.querySelector<SVGSVGElement>(".fc-balance");
  const root = rootOf(el);
  const t = ctx.actor("targets-0");
  if (!svg || !root || !t) return;
  const px = num(el, "px", 800);
  const rest = num(el, "rest", 800);
  const floor = num(el, "floor", 1100);
  // Sized by the target: a pan it can stand in, hangers that clear its head.
  const rp = Math.max(90, t.h * 0.62);
  const ry = rp * 0.22;
  const H = t.h * 1.28 + 70;
  const R = [t.x, t.y - H];
  const P = [px, rest - H];
  const L = [2 * P[0] - R[0], 2 * P[1] - R[1]];
  const left = { x: L[0], y: L[1] + H, r: rp };
  PAN.set(root, left);
  const pans = [
    { side: "l", x: left.x, y: left.y },
    { side: "r", x: t.x, y: t.y },
  ];
  const f = (x: number) => x.toFixed(1);
  if (el.dataset.part === "front") {
    for (const pan of pans) {
      setD(
        svg.querySelector(`.fc-pan-bowl.${pan.side}`),
        `M${f(pan.x - rp)} ${f(pan.y)} Q${f(pan.x - rp * 0.7)} ${f(pan.y + ry * 2.2)} ${f(pan.x)} ${f(pan.y + ry * 2.2)} Q${f(pan.x + rp * 0.7)} ${f(pan.y + ry * 2.2)} ${f(pan.x + rp)} ${f(pan.y)} A${f(rp)} ${f(ry)} 0 0 1 ${f(pan.x - rp)} ${f(pan.y)} Z`,
      );
      setD(svg.querySelector(`.fc-pan-lip.${pan.side}`), `M${f(pan.x - rp)} ${f(pan.y)} A${f(rp)} ${f(ry)} 0 0 0 ${f(pan.x + rp)} ${f(pan.y)}`);
    }
    return;
  }
  const dx = R[0] - L[0];
  const dy = R[1] - L[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const at = (pt: number[], w: number) => `${f(pt[0] + nx * w)} ${f(pt[1] + ny * w)}`;
  const beam = `M${at(L, 10)} L${at(P, 24)} L${at(R, 10)} L${at(R, -10)} L${at(P, -24)} L${at(L, -10)} Z`;
  setD(svg.querySelector(".fc-beam"), beam);
  setD(svg.querySelector(".fc-beam-ink"), beam);
  setD(svg.querySelector(".fc-tongue"), `M${f(P[0])} ${f(P[1])} L${f(P[0] - nx * 170)} ${f(P[1] - ny * 170)}`);
  setD(
    svg.querySelector(".fc-post"),
    `M${f(px - 16)} ${f(P[1])} H${f(px + 16)} L${f(px + 22)} ${f(floor - 40)} L${f(px + 90)} ${f(floor)} H${f(px - 90)} L${f(px - 22)} ${f(floor - 40)} Z`,
  );
  const hang = (end: number[], pan: { x: number; y: number }) =>
    `M${f(end[0])} ${f(end[1])} L${f(pan.x - rp * 0.94)} ${f(pan.y - 2)} M${f(end[0])} ${f(end[1])} L${f(pan.x + rp * 0.94)} ${f(pan.y - 2)} M${f(end[0])} ${f(end[1])} L${f(pan.x + rp * 0.1)} ${f(pan.y - ry)}`;
  setD(svg.querySelector(".fc-hang.l"), hang(L, pans[0]));
  setD(svg.querySelector(".fc-hang.r"), hang(R, pans[1]));
  for (const pan of pans) {
    const e = svg.querySelector<SVGEllipseElement>(`.fc-pan-in.${pan.side}`);
    if (e) {
      e.setAttribute("cx", f(pan.x));
      e.setAttribute("cy", f(pan.y));
      e.setAttribute("rx", f(rp));
      e.setAttribute("ry", f(ry));
    }
  }
  const put = (sel: string, pt: number[]) => {
    const c = svg.querySelector(sel);
    if (c) {
      c.setAttribute("cx", f(pt[0]));
      c.setAttribute("cy", f(pt[1]));
    }
  };
  put(".fc-pivot", P);
  put(".fc-pivot-in", P);
  put(".fc-finial.l", L);
  put(".fc-finial.r", R);
};

const tag: Frame = (el, p, age, ctx) => {
  const box = el.querySelector<HTMLElement>(".fc-tag-box");
  const h = heightOf(el, ctx);
  if (!box || !h) return;
  const mode = el.dataset.mode;
  const size = num(el, "size", 1);
  // The tag is 80 units wide; drawn at a quarter of the figure's height.
  // On the board a tag is a tag, whoever wears it: a boss's is not a banner.
  const s = Math.min((h * 0.24 * size) / 80, el.dataset.follow ? Infinity : 0.62);
  const ox = num(el, "ox", -0.05) * h;
  const oy = -num(el, "oy", 0.72) * h;
  let drop = 0;
  let swing = Math.sin(age / 190) * 3;
  if (mode === "drop") {
    const k = clamp(p / 0.45);
    drop = (1 - ease("back", k)) * -h * 0.9;
    swing = Math.sin(age / 90) * 14 * Math.exp(-age / 260) + Math.sin(age / 210) * 2;
  }
  let tear = 0;
  if (mode === "tear") {
    const hit = num(el, "hit", 0.1);
    tear = p < hit ? 0 : clamp((p - hit) / (1 - hit));
    if (p < hit) swing = Math.sin(age / 120) * 6;
    else swing = Math.sin(age / 70) * 9 * (1 - tear) + 4;
  }
  if (mode === "left") {
    tear = 1;
    swing = Math.sin(age / 110) * 8 * Math.exp(-age / 500) + 3;
  }
  setTransform(box, `translate3d(${(ox - 40 * s).toFixed(1)}px, ${(oy + drop - 300 * s).toFixed(1)}px, 0) scale(${s.toFixed(4)})`);
  setStyle(box, "--sw", `${swing.toFixed(2)}deg`);
  if (mode === "tear" || mode === "left") {
    const a = box.querySelector<SVGGElement>(".fc-tag-half.a");
    const b = box.querySelector<SVGGElement>(".fc-tag-half.b");
    // The left half goes; the right half is left hanging, torn.
    const fall = mode === "left" ? 1 : ease("in", tear);
    setTransform(a, `translate(${(-30 * tear - 10 * fall).toFixed(1)}px, ${(260 * fall).toFixed(1)}px) rotate(${(-70 * tear).toFixed(1)}deg)`);
    setStyle(a, "opacity", mode === "left" ? "0" : (1 - clamp((tear - 0.7) / 0.3)).toFixed(2));
    setTransform(b, `rotate(${(24 * Math.min(1, tear * 3)).toFixed(1)}deg)`);
  }
};

const collateral: Frame = (el, p, age, ctx) => {
  const box = el.querySelector<HTMLElement>(".fc-collateral");
  const t = ctx.actor("targets-0");
  if (!box || !t) return;
  const h = t.h;
  const size = num(el, "size", 1);
  const d = h * 1.0 * size;
  const cx = num(el, "ox", -0.2) * h;
  const cy = -num(el, "oy", 0.46) * h;
  const disc = box.querySelector<HTMLElement>(".fc-collateral-disc");
  if (!disc) return;
  setStyle(disc, "width", `${d.toFixed(1)}px`);
  setStyle(disc, "height", `${d.toFixed(1)}px`);
  if (el.dataset.mode !== "seize") {
    const k = ease("out", clamp(p / 0.2));
    setTransform(disc, `translate3d(${(cx - d / 2).toFixed(1)}px, ${(cy - d / 2).toFixed(1)}px, 0) scale(${(0.8 + 0.2 * k).toFixed(3)})`);
    setStyle(disc, "opacity", k.toFixed(3));
    return;
  }
  const hit = num(el, "hit", 0.1);
  const k = p < hit ? 0 : clamp((p - hit) / (1 - hit));
  const fly = num(el, "fly", -1);
  // Knocked off and flung back past the Broker, turning over like a coin.
  const ko = ease("out", k);
  const x = cx + fly * h * 2.8 * ko;
  const y = cy - h * 1.1 * Math.sin(Math.min(1, k * 1.3) * Math.PI * 0.75) + h * 0.9 * k * k;
  const sx = p < hit ? 1 + Math.sin(age / 18) * 0.03 : Math.cos(k * Math.PI * 6.5);
  const sc = 1 + ko * 0.55;
  setTransform(
    disc,
    `translate3d(${(x - d / 2).toFixed(1)}px, ${(y - d / 2).toFixed(1)}px, 0) rotate(${(fly * 38 * ko).toFixed(1)}deg) scale(${(sc * (Math.abs(sx) < 0.06 ? 0.06 * Math.sign(sx || 1) : sx)).toFixed(3)}, ${sc.toFixed(3)})`,
  );
  setStyle(disc, "opacity", (1 - clamp((k - 0.75) / 0.25)).toFixed(3));
  // Coin shed as it goes.
  const coin = h * 0.13;
  for (const shed of box.querySelectorAll<HTMLElement>(".fc-shed")) {
    const vx = Number(shed.dataset.vx);
    const vy = Number(shed.dataset.vy);
    const sp = Number(shed.dataset.spin);
    const s = Number(shed.dataset.s);
    const kk = ease("out", k);
    const sxx = cx + vx * h * 1.2 * kk;
    const syy = cy + vy * h * 0.9 * kk + h * 1.6 * k * k;
    const turn = Math.cos(age / 1000 * sp);
    setStyle(shed, "width", `${(coin * s).toFixed(1)}px`);
    setStyle(shed, "height", `${(coin * s).toFixed(1)}px`);
    setTransform(shed, `translate3d(${(sxx - (coin * s) / 2).toFixed(1)}px, ${(syy - (coin * s) / 2).toFixed(1)}px, 0) scale(${turn.toFixed(3)}, 1)`);
    setStyle(shed, "opacity", k > 0 ? (1 - clamp((k - 0.8) / 0.2)).toFixed(2) : "0");
  }
};

const coin: Frame = (el, p, age, ctx) => {
  const box = el.querySelector<HTMLElement>(".fc-coin");
  if (!box) return;
  const mode = el.dataset.mode;
  const size = num(el, "size", 60);
  const faceEl = box.querySelector<HTMLElement>(".fc-coin-face");
  if (!faceEl) return;
  const flip = Math.cos(age / 1000 * Math.PI * 2 * 5.5);
  const edge = (x: number) => (Math.abs(x) < 0.07 ? 0.07 * Math.sign(x || 1) : x);

  if (mode === "flick") {
    // Off the pan, up and at the lens, turning over.
    const k = ease("out", p);
    const grow = 1 + ease("in", p) * 7;
    const x = -size * 1.5 * k;
    const y = -num(el, "rise", 300) * k;
    setStyle(faceEl, "width", `${size}px`);
    setStyle(faceEl, "height", `${size}px`);
    setTransform(faceEl, `translate3d(${(x - size / 2).toFixed(1)}px, ${(y - size / 2).toFixed(1)}px, 0) scale(${(grow * 0.95).toFixed(3)}, ${(grow * edge(flip)).toFixed(3)})`);
    return;
  }

  if (mode === "cover" || mode === "reveal") {
    // Screen space: the coin fills the lens, or leaves it.
    const W = el.offsetWidth || 1;
    const H = el.offsetHeight || 1;
    const big = Math.hypot(W, H) * 1.15;
    const k = mode === "cover" ? ease("in", p) : 1 - ease("out", p);
    const d = big * (0.05 + 0.95 * k);
    const cx = W * (mode === "cover" ? 0.46 + 0.04 * k : 0.5 - 0.22 * (1 - k));
    const cy = H * (mode === "cover" ? 0.36 + 0.14 * k : 0.5 - 0.46 * (1 - k));
    setStyle(faceEl, "width", `${d.toFixed(0)}px`);
    setStyle(faceEl, "height", `${d.toFixed(0)}px`);
    const turn = mode === "cover" ? Math.cos((1 - k) * Math.PI * 2.5) : Math.cos((1 - k) * Math.PI * 3);
    setTransform(faceEl, `translate3d(${(cx - d / 2).toFixed(0)}px, ${(cy - d / 2).toFixed(0)}px, 0) scale(1, ${edge(turn).toFixed(3)})`);
    setStyle(faceEl, "opacity", mode === "reveal" ? clamp(k * 3).toFixed(2) : "1");
    return;
  }

  if (mode === "drop") {
    const root = rootOf(el);
    const pan = root ? PAN.get(root) : undefined;
    if (!pan) return;
    const land = num(el, "land", 0.36);
    // The coin comes to rest on the pan's floor, left of centre.
    const restX = pan.x - pan.r * 0.1;
    const restY = pan.y - size * 0.18;
    let x = restX;
    let y = restY;
    let sy = 0.36;
    if (p < land) {
      const k = ease("in", p / land);
      y = restY - 900 * (1 - k);
      x = restX + 60 * (1 - k);
      sy = edge(flip);
    } else {
      const k = (p - land) / 0.09;
      if (k < 1) {
        y -= Math.sin(k * Math.PI) * size * 0.9;
        sy = 0.36 + 0.5 * Math.abs(Math.sin(k * Math.PI * 2));
      }
    }
    // Written in world units on the front layer: its wrapper sits at 0,0.
    setStyle(faceEl, "width", `${size}px`);
    setStyle(faceEl, "height", `${size}px`);
    setTransform(faceEl, `translate3d(${(x - size / 2).toFixed(1)}px, ${(y - size / 2).toFixed(1)}px, 0) scale(1, ${sy.toFixed(3)})`);
    return;
  }

  if (mode === "spin") {
    // A coin spun on brass, wobbling down: the tilt falls, the turn speeds up.
    const flat = num(el, "flat", 0.86);
    const q = Math.min(p, flat);
    const s = 0.94 * (1 - (q / flat) ** 2.4);
    const phase = 9 * (1 / Math.sqrt(flat + 0.035 - q) - 1 / Math.sqrt(flat + 0.035));
    const sx = (1 - s) + s * Math.cos(phase);
    const sy = (1 - s) * 0.26 + s;
    const wobble = s * (1 - s) * 60 * Math.sin(phase * 0.5);
    let rattle = 0;
    if (p > flat) {
      const k = (p - flat) / 0.05;
      if (k < 1) rattle = Math.sin(k * Math.PI * 5) * (1 - k) * size * 0.03;
    }
    const tr = `translate3d(${(-size / 2).toFixed(1)}px, ${(-size / 2 - (size / 2) * sy + rattle).toFixed(1)}px, 0) rotate(${wobble.toFixed(2)}deg)`;
    setStyle(faceEl, "width", `${size}px`);
    setStyle(faceEl, "height", `${size}px`);
    setTransform(faceEl, `${tr} scale(${edge(sx).toFixed(3)}, ${sy.toFixed(3)})`);
    const rim = box.querySelector<HTMLElement>(".fc-spin-rim");
    if (rim) {
      setStyle(rim, "width", `${size}px`);
      setStyle(rim, "height", `${size}px`);
      // The coin's edge, showing as it turns edge-on and as it lies down.
      const t = Math.max(0.08, (1 - Math.abs(sx)) * 0.12 + (1 - s) * 0.05);
      setTransform(rim, `${tr} translate3d(0, ${(size * t * 0.5).toFixed(1)}px, 0) scale(${(Math.max(Math.abs(sx), 0.12) * 1.02).toFixed(3)}, ${sy.toFixed(3)})`);
    }
    const plate = box.querySelector<HTMLElement>(".fc-spin-plate");
    if (plate) {
      setStyle(plate, "width", `${(size * 6).toFixed(1)}px`);
      setStyle(plate, "height", `${(size * 1.3).toFixed(1)}px`);
      setTransform(plate, `translate3d(${(-size * 3).toFixed(1)}px, ${(-size * 0.28).toFixed(1)}px, 0)`);
    }
    const shadow = box.querySelector<HTMLElement>(".fc-spin-shadow");
    if (shadow) {
      setStyle(shadow, "width", `${(size * 1.2).toFixed(1)}px`);
      setStyle(shadow, "height", `${(size * 0.18).toFixed(1)}px`);
    }
    if (shadow) setTransform(shadow, `translate3d(${(-size * 0.6).toFixed(1)}px, ${(-size * 0.08).toFixed(1)}px, 0) scale(${(0.5 + 0.5 * (1 - s)).toFixed(3)}, 1)`);
  }
};

const mill: Frame = (el, p, age, ctx) => {
  const box = el.querySelector<HTMLElement>(".fc-mill");
  const t = ctx.actor("targets-0");
  if (!box || !t) return;
  const h = t.h * num(el, "size", 1);
  const d = h * (0.3 + 0.85 * ease("out", clamp(p / 0.55)));
  const x = num(el, "ox", -0.2) * t.h;
  const y = -num(el, "oy", 0.5) * t.h;
  setStyle(box, "width", `${d.toFixed(1)}px`);
  setStyle(box, "height", `${d.toFixed(1)}px`);
  setTransform(box, `translate3d(${(x - d / 2).toFixed(1)}px, ${(y - d / 2).toFixed(1)}px, 0) rotate(${(p * 40).toFixed(1)}deg)`);
  box.dataset.k = String(Math.floor(age / 45) % 3);
};

interface Flight {
  node: HTMLElement;
  to: HTMLElement | null;
  treasury: boolean;
  arrive: number;
  lift: number;
  size: number;
  /** Where it lands, relative to the effect, last measured. */
  tx?: number;
  ty?: number;
}
const flights = new WeakMap<HTMLElement, Flight[]>();

const proceeds: Frame = (el, p, age) => {
  const box = el.querySelector<HTMLElement>(".fc-proceeds");
  const root = rootOf(el);
  if (!box || !root) return;
  let list = flights.get(el);
  if (!list) {
    list = [];
    const wards = [...root.querySelectorAll<HTMLElement>(".fx-foreclosure-ward-wrap[data-anchor]")];
    const ah = parseFloat(el.style.getPropertyValue("--ah")) || 120;
    const rand = seeded(77);
    const add = (to: HTMLElement | null, arrive: number, treasury: boolean, n: number) => {
      for (let i = 0; i < n; i++) {
        const node = document.createElement("div");
        node.className = "fc-flying";
        node.innerHTML = COIN_SVG;
        box.appendChild(node);
        list!.push({ node, to, treasury, arrive: arrive - i * 0.035, lift: 0.8 + rand() * 0.6, size: ah * (0.34 - i * 0.05) });
      }
    };
    for (const w of wards) add(w, Number(w.dataset.window?.split(",")[0] ?? 0.3), false, 3);
    const last = Math.max(0.3, ...list.map((f) => f.arrive));
    add(null, last + 0.1, true, 4);
    flights.set(el, list);
  }
  const ox = parseFloat(el.style.left) || 0;
  const oy = parseFloat(el.style.top) || 0;
  const ah = parseFloat(el.style.getPropertyValue("--ah")) || 120;
  const from = [0, -ah * 0.55];
  // Where each coin is going, read off the board before anything is written,
  // and only now and then: the board does not move under a film. A ward not
  // yet in its window has not been placed by the engine, so it is measured
  // the way the engine will place it.
  const last = Number(box.dataset.measured ?? -1e9);
  if (age - last > 200 || age < last || !list.some((f) => f.tx !== undefined)) {
    box.dataset.measured = String(age);
    const rootBox = root.getBoundingClientRect();
    const treasury = document.querySelector<HTMLElement>(".strip-treasury")?.getBoundingClientRect();
    for (const f of list) {
      const unit = f.to?.dataset.anchor;
      const r = unit
        ? document.querySelector<HTMLElement>(`.stage [data-unit="${CSS.escape(unit)}"] .combatant-rig`)?.getBoundingClientRect()
        : treasury;
      if (!r || !r.width) {
        f.tx = undefined;
        continue;
      }
      f.tx = unit ? r.left + r.width * 0.5 - rootBox.left - ox : r.left + r.width * 0.2 - rootBox.left - ox;
      f.ty = unit ? r.bottom - r.height * 0.45 - rootBox.top - oy : r.top + r.height / 2 - rootBox.top - oy;
    }
  }
  for (const f of list) {
    if (f.tx === undefined || f.ty === undefined) {
      setStyle(f.node, "opacity", "0");
      continue;
    }
    const tx = f.tx;
    const ty = f.ty;
    const flight = 0.26;
    const k = (p - (f.arrive - flight)) / flight;
    if (k < 0 || k > 1.02) {
      setStyle(f.node, "opacity", "0");
      continue;
    }
    const kk = ease("inOut", clamp(k));
    const apex = Math.min(from[1], ty) - ah * f.lift;
    const x = from[0] + (tx - from[0]) * kk;
    const y = (1 - kk) * (1 - kk) * from[1] + 2 * (1 - kk) * kk * apex + kk * kk * ty;
    const turn = Math.cos(age / 1000 * 30 + f.lift * 9);
    setStyle(f.node, "opacity", "1");
    setStyle(f.node, "width", `${f.size.toFixed(1)}px`);
    setStyle(f.node, "height", `${f.size.toFixed(1)}px`);
    setTransform(f.node, `translate3d(${(x - f.size / 2).toFixed(1)}px, ${(y - f.size / 2).toFixed(1)}px, 0) scale(${turn.toFixed(3)}, 1)`);
  }
};

const glow: Frame = (el, p, _age, ctx) => {
  const node = el.querySelector<HTMLElement>(".fc-glow");
  const t = ctx.actor("targets-0");
  if (!node || !t) return;
  const d = t.h * 2.3;
  setStyle(node, "width", `${d.toFixed(1)}px`);
  setStyle(node, "height", `${d.toFixed(1)}px`);
  setTransform(node, `translate3d(${(-d / 2 - t.h * 0.2).toFixed(1)}px, ${(-d / 2 - t.h * 0.5).toFixed(1)}px, 0)`);
  setStyle(node, "opacity", (1 - 0.75 * ease("out", clamp(p / 0.6))).toFixed(3));
};

/* ── Registered ────────────────────────────────────────────────────────── */

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "foreclosure-tag": Tag,
  "foreclosure-balance": Balance,
  "foreclosure-collateral": Collateral,
  "foreclosure-coin": Coin,
  "foreclosure-mill": Mill,
  "foreclosure-proceeds": Proceeds,
  "foreclosure-glow": Glow,
  "foreclosure-ward": Ward,
};

/** Copies a renderer's `data-` parameters onto the wrapper a frame is handed, once. */
const withParams =
  (frame: Frame): Frame =>
  (el, p, age, ctx) => {
    if (!el.dataset.fcParams) {
      el.dataset.fcParams = "1";
      const src = el.querySelector<HTMLElement | SVGElement>("[data-fc]");
      if (src) for (const [k, x] of Object.entries(src.dataset)) if (k !== "fc" && x !== undefined && !(k in el.dataset)) el.dataset[k] = x;
    }
    frame(el, p, age, ctx);
  };

/** The minted disc lands: it grows out of the coin that brought it, and the floor rings. */
const ward: Frame = (el, p) => {
  setStyle(el, "--k", ease("back", clamp(p / 0.2)).toFixed(3));
  setStyle(el, "--r", ease("out", clamp(p / 0.5)).toFixed(3));
};

export const frames: Record<string, Frame> = {
  "foreclosure-ward": ward,
  "foreclosure-tag": withParams(tag),
  "foreclosure-balance": withParams(balance),
  "foreclosure-collateral": withParams(collateral),
  "foreclosure-coin": withParams(coin),
  "foreclosure-mill": withParams(mill),
  "foreclosure-proceeds": withParams(proceeds),
  "foreclosure-glow": glow,
};

