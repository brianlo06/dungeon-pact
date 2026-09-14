import type { CSSProperties, ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import { HIDE } from "./hide";
import "./style.css";

/**
 * A Good Hiding's effects.
 *
 * The idea they serve: the Ironhide lets the enemy's blow land flush, and the
 * blow does not burst off it but sinks in, like a mallet into leather; then
 * it comes back out through the cleaver.
 *
 * So there is one shape, **the dent**: a few heavy, lumpy ink contour lines
 * round the point a blow lands, closing *inward* until they vanish into it.
 * On the Ironhide the skin there sets into a patch of fine iron hatching (the
 * blow kept); on the target the rings are driven in hard and fast, and the
 * figure's own lime dust is knocked out of it. Nothing here bursts outward.
 *
 *   hiding-dust    pale lime dust knocked off a worked hide, in a fan
 *   hiding-dent    the dent: rings closing in, and (on the Ironhide) the iron set
 *   hiding-hides   hides hanging from poles in front of the lens: swinging,
 *                  settling, or all jumping at once
 *   hiding-slats   bars of louvre shadow laid across the picture
 *   hiding-wipe    a hanging hide swung across the lens, to hide a cut
 *   hiding-glare   the slat light blown out behind a blow, for the drawn frame
 *   hiding-board   on the board after: the iron hatch set over the Ironhide
 *                  (`kept`), a slack, sagging dent over the enemy (`spent`)
 *
 * Nothing is filtered and nothing re-renders React while it plays: rings
 * scale on `--p`, hides swing in a frame function.
 */

export const IRON = "#a9b7c1";
export const LIME = "#e6e0cf";
const INK = "#0b0705";

const v = (vars: Record<string, string | number>) => vars as CSSProperties;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

/** A lumpy closed ring of radius ~1, fixed for a seed: the edge of a dent in thick leather. */
function lump(seed: number, r = 1, wobble = 0.12, points = 9) {
  const rand = seeded(seed);
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2;
    const rr = r * (1 - wobble / 2 + rand() * wobble);
    // Flatter than round: a blow into a body, not a ripple in a pond.
    return [Math.cos(a) * rr, Math.sin(a) * rr * 0.78] as const;
  });
  // Closed Catmull-Rom through the points, as cubic Béziers.
  let d = "";
  for (let i = 0; i < points; i++) {
    const p0 = pts[(i - 1 + points) % points];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % points];
    const p3 = pts[(i + 2) % points];
    if (!i) d += `M${p1[0].toFixed(3)} ${p1[1].toFixed(3)}`;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(3)} ${c1[1].toFixed(3)} ${c2[0].toFixed(3)} ${c2[1].toFixed(3)} ${p2[0].toFixed(3)} ${p2[1].toFixed(3)}`;
  }
  return `${d} Z`;
}

/** Short strokes scattered over a patch, as leather is scored: the iron's grain. */
function grain(seed: number, n = 26) {
  const rand = seeded(seed);
  let d = "";
  for (let i = 0; i < n; i++) {
    const x = (rand() - 0.5) * 1.8;
    const y = (rand() - 0.5) * 1.5;
    const a = -0.9 + rand() * 0.5;
    const l = 0.12 + rand() * 0.2;
    d += `M${x.toFixed(2)} ${y.toFixed(2)} l${(Math.cos(a) * l).toFixed(2)} ${(Math.sin(a) * l).toFixed(2)} `;
  }
  return d.trim();
}

/* ── Dust ──────────────────────────────────────────────────────────────── */

const Dust = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 5);
  const p = cue.params ?? {};
  const n = Number(p.n ?? 16);
  const dir = Number(p.dir ?? -90);
  const spread = Number(p.spread ?? 120);
  const reach = Number(p.reach ?? 120);
  const size = Number(p.size ?? 10);
  return (
    <div className="hiding-dust" data-anchored={cue.anchor ? "" : undefined}>
      {Array.from({ length: n }, (_, i) => {
        const a = ((dir + (rand() - 0.5) * spread) * Math.PI) / 180;
        const r = reach * (0.35 + rand() * 0.65);
        return (
          <i
            key={i}
            style={v({
              "--dx": `${(Math.cos(a) * r).toFixed(1)}px`,
              "--dy": `${(Math.sin(a) * r).toFixed(1)}px`,
              "--sz": `${(size * (0.5 + rand())).toFixed(1)}px`,
              "--d": (rand() * 0.18).toFixed(3),
              "--fall": `${(reach * (0.15 + rand() * 0.25)).toFixed(1)}px`,
            })}
          />
        );
      })}
    </div>
  );
};

/* ── The dent ──────────────────────────────────────────────────────────── */

const RINGS = 3;

const Dent = ({ cue }: VfxProps) => {
  const p = cue.params ?? {};
  const mode = String(p.mode ?? "in");
  const seed = cue.seed ?? 3;
  const id = `hiding-set-${seed}-${mode}`;
  return (
    <svg className="hiding-dent" data-mode={mode} viewBox="-2 -2 4 4" aria-hidden="true" style={v({ "--size": `${Number(p.size ?? 160)}px` })}>
      {mode === "in" && (
        <>
          <clipPath id={id}>
            <path d={lump(seed + 40, 0.95, 0.3, 7)} />
          </clipPath>
          {/* The iron the skin sets into where the blow went in. */}
          <g className="hiding-set">
            <g clipPath={`url(#${id})`}>
              <rect x={-1} y={-1} width={2} height={2} fill="#6f7d87" opacity={0.42} />
              {/* Grain: short hard strokes laid every which way, as a hide is scored. */}
              <path d={grain(seed)} stroke="#e3eaee" strokeWidth={0.035} strokeLinecap="round" opacity={0.85} />
              <path d={grain(seed + 11)} stroke="#2c353c" strokeWidth={0.04} strokeLinecap="round" opacity={0.7} />
            </g>
            <path d={lump(seed + 40, 0.95, 0.3, 7)} fill="none" stroke={INK} strokeWidth={0.05} opacity={0.6} />
            <path className="hiding-glint" d="M-0.5 -0.46 Q0 -0.66 0.46 -0.44" stroke="#f1f5f7" strokeWidth={0.06} strokeLinecap="round" fill="none" />
          </g>
        </>
      )}
      {Array.from({ length: RINGS }, (_, i) => (
        <g key={i} className="hiding-ring" style={v({ "--i": i })}>
          <path d={lump(seed + i * 7, 1, 0.2)} fill="none" stroke={LIME} strokeWidth={0.1} opacity={0.7} />
          <path d={lump(seed + i * 7, 1, 0.2)} fill="none" stroke={INK} strokeWidth={0.045} />
        </g>
      ))}
      {mode === "drive" && (
        <g className="hiding-crush">
          {[-0.55, -0.2, 0.18, 0.5].map((y, i) => (
            <path key={i} d={`M${-1.9 + i * 0.1} ${y} L${-0.7 + (i % 2) * 0.12} ${y * 0.5}`} stroke={INK} strokeWidth={0.07} strokeLinecap="round" />
          ))}
        </g>
      )}
    </svg>
  );
};

/* ── Hanging hides ─────────────────────────────────────────────────────── */

/** `params.at`: "x,y,scale;…" per hide, world units from the effect's position; the top edge hangs there. */
const Hides = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 17);
  const list = String(cue.params?.at ?? "0,0,1")
    .split(";")
    .map((s) => s.split(",").map(Number));
  return (
    <svg className="hiding-world hiding-hides" viewBox="0 0 1600 900" aria-hidden="true" data-mode={String(cue.params?.mode ?? "swing")} data-amp={String(cue.params?.amp ?? 8)}>
      {list.map(([x, y, s], i) => {
        const tone = rand();
        const phase = rand() * Math.PI * 2;
        return (
          <g key={i} className="hiding-hang" data-x={x} data-y={y} data-s={s} data-phase={phase.toFixed(2)} data-rate={(0.9 + rand() * 0.4).toFixed(2)}>
            <path d={`M-90 -4000 L-90 0 M90 -4000 L90 0`} stroke={INK} strokeWidth={10} opacity={0} />
            <rect x={-120} y={-18} width={240} height={20} rx={6} fill="#1a110b" stroke={INK} strokeWidth={4} />
            <path d={HIDE} transform="scale(2.2 2.4)" fill={tone > 0.5 ? "#4a3122" : "#3a261a"} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
            <path d="M-80 60 C-40 80 40 80 80 60 M-60 200 C-20 216 30 214 70 196" stroke="#1d130c" strokeWidth={6} fill="none" opacity={0.7} />
            <path d="M-96 10 C-100 120 -110 250 -120 330" stroke="#8a6644" strokeWidth={5} fill="none" opacity={0.5} />
          </g>
        );
      })}
    </svg>
  );
};

/* ── Louvre shadow ─────────────────────────────────────────────────────── */

const Slats = ({ cue }: VfxProps) => {
  const p = cue.params ?? {};
  return (
    <div
      className="hiding-slats"
      style={v({
        "--angle": `${Number(p.angle ?? 112)}deg`,
        "--gap": `${Number(p.gap ?? 16)}%`,
        "--bar": `${Number(p.bar ?? 5)}%`,
        "--dark": Number(p.dark ?? 0.6),
        "--shift": `${Number(p.shift ?? 0)}%`,
      })}
    />
  );
};

/* ── The wipe ──────────────────────────────────────────────────────────── */

const Wipe = ({ cue }: VfxProps) => (
  <div className="hiding-wipe" data-phase={String(cue.params?.phase ?? "out")}>
    <svg viewBox="-150 -40 300 420" preserveAspectRatio="xMidYMin meet" aria-hidden="true">
      <rect x={-150} y={-40} width={300} height={34} fill="#140d08" />
      <path d={HIDE} transform="translate(0 -6) scale(2.05 2.3)" fill="#3b271a" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M-100 60 C-40 90 50 88 110 58 M-80 220 C-20 240 40 236 90 214" stroke="#22160e" strokeWidth={8} fill="none" />
      <path d="M-104 20 C-110 140 -118 260 -126 330" stroke="#8a6644" strokeWidth={6} fill="none" opacity={0.55} />
    </svg>
  </div>
);

/* ── The glare ─────────────────────────────────────────────────────────── */

/**
 * The slat light blown out behind the blow: a field of pale bars laid behind
 * the figures. On the two-tone frame it is what turns iron while the figures
 * go to ink; after it, it sinks back to the loft's own light.
 */
const Glare = ({ cue }: VfxProps) => {
  const p = cue.params ?? {};
  const k = Number(p.scale ?? 1);
  const hold = p.hold !== undefined;
  const seed = cue.seed ?? 51;
  return (
    <svg
      className="hiding-glare"
      data-hold={hold ? "" : undefined}
      viewBox="-900 -600 1800 1200"
      aria-hidden="true"
      style={v({ left: `${Number(p.x ?? 800)}px`, top: `${Number(p.y ?? 500)}px`, "--gk": k, "--go": Number(p.hold ?? 1) })}
    >
      <defs>
        <radialGradient id={`hiding-glare-fade-${seed}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={LIME} stopOpacity="0.95" />
          <stop offset="0.6" stopColor={LIME} stopOpacity="0.55" />
          <stop offset="1" stopColor={LIME} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse rx={880} ry={580} fill={`url(#hiding-glare-fade-${seed})`} />
      {!hold && (
        /* The dent at the size of the room: lumpy rings round the blow, pressed in. */
        <g className="hiding-glare-rings">
          {[0, 1].map((i) => (
            <path key={i} d={lump(seed + i * 3, 1, 0.16)} transform={`scale(${300 + i * 260})`} fill="none" stroke={INK} strokeWidth={(0.03 - i * 0.008).toFixed(3)} opacity={0.8 - i * 0.2} />
          ))}
        </g>
      )}
    </svg>
  );
};

/* ── On the board ──────────────────────────────────────────────────────── */

const Board = ({ cue }: VfxProps) => {
  const mode = String(cue.params?.mode ?? "kept");
  const seed = cue.seed ?? 9;
  const id = `hiding-board-${seed}-${mode}`;
  if (mode === "kept")
    return (
      <div className="hiding-board" data-mode="kept">
        <svg viewBox="-1.2 -1.2 2.4 2.4" aria-hidden="true">
          <clipPath id={id}>
            <path d={lump(seed, 0.8, 0.22, 8)} />
          </clipPath>
          <g className="hiding-board-set">
            <g clipPath={`url(#${id})`}>
              <rect x={-1.2} y={-1.2} width={2.4} height={2.4} fill={IRON} opacity={0.16} />
              <path d={Array.from({ length: 12 }, (_, i) => `M${(-1.4 + i * 0.24).toFixed(2)} -1.2 l-0.7 2.4`).join(" ")} stroke={IRON} strokeWidth={0.035} opacity={0.6} />
            </g>
            <path d={lump(seed, 0.8, 0.22, 8)} fill="none" stroke={IRON} strokeWidth={0.06} />
            <path className="hiding-board-glint" d="M-0.46 -0.46 Q0 -0.64 0.44 -0.44" stroke="#f4f7f9" strokeWidth={0.07} strokeLinecap="round" fill="none" />
          </g>
          {[0, 1, 2].map((i) => (
            <g key={i} className="hiding-board-ring" style={v({ "--i": i })}>
              <path d={lump(seed + i * 5, 1.1, 0.2)} fill="none" stroke={IRON} strokeWidth={0.05} />
            </g>
          ))}
        </svg>
      </div>
    );
  return (
    <div className="hiding-board" data-mode="spent">
      <svg viewBox="-1.2 -1.2 2.4 2.4" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <g key={i} className="hiding-board-sag" style={v({ "--i": i })}>
            <path d={lump(seed + i * 5, 0.9 - i * 0.24, 0.24)} fill="none" stroke={IRON} strokeWidth={0.07 - i * 0.012} strokeLinecap="round" />
          </g>
        ))}
      </svg>
      <Dust cue={{ ...cue, seed: seed + 3, params: { n: 7, dir: 90, spread: 50, reach: 26, size: 4 } }} color={LIME} />
    </div>
  );
};

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "hiding-dust": Dust,
  "hiding-dent": Dent,
  "hiding-hides": Hides,
  "hiding-slats": Slats,
  "hiding-wipe": Wipe,
  "hiding-board": Board,
  "hiding-glare": Glare,
};

/* ── Frames ────────────────────────────────────────────────────────────── */

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

export const frames: Record<string, Frame> = {
  "hiding-hides": (el, p, age) => {
    const svg = el.querySelector<SVGSVGElement>(".hiding-hides");
    if (!svg) return;
    const mode = svg.dataset.mode;
    const amp = Number(svg.dataset.amp);
    const t = age / 1000;
    svg.querySelectorAll<SVGGElement>(".hiding-hang").forEach((g) => {
      const d = g.dataset;
      const phase = Number(d.phase);
      const rate = Number(d.rate);
      let a = 0;
      let lift = 0;
      if (mode === "swing") a = amp * Math.sin(t * 5.2 * rate + phase) * (0.75 + 0.25 * Math.cos(t * 1.3));
      // Settling: what swing is left dies away to nothing by the end.
      if (mode === "settle") a = amp * (1 - clamp(p / 0.85)) ** 2 * Math.sin(t * 4.4 * rate + phase);
      // Jumping: all at once on the blow, a hard kick up and away, then swinging.
      if (mode === "jump") {
        const k = clamp((p - 0.04) / 0.05);
        const since = Math.max(0, t - 0.04 * (age / Math.max(p, 0.0001)) / 1000);
        a = p < 0.04 ? 0 : amp * Math.exp(-since * 2.2) * Math.sin(since * 9 * rate + 0.6) * k + amp * 0.6 * k * Math.exp(-since * 5);
        lift = p < 0.04 ? 0 : -18 * Math.exp(-since * 9);
      }
      const t2 = `translate(${d.x} ${(Number(d.y) + lift).toFixed(1)}) rotate(${a.toFixed(2)}) scale(${d.s})`;
      if (g.getAttribute("transform") !== t2) g.setAttribute("transform", t2);
    });
  },
};
