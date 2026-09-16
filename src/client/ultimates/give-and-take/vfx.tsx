import type { CSSProperties, ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import "./style.css";

/**
 * Give and Take's effects.
 *
 * The idea they serve: the pact is sworn on the cleaver, so the blade runs
 * both ways — the Reaver's scarlet out along it into the enemy, the enemy's
 * garnet back up it into the hand that paid.
 *
 * So there is one drawing, **the run**: blood moving along a line as a liquid,
 * a glossy ribbon with a swollen, bright head and a hard highlight, thinning to
 * a tail. On the blade itself it is a part of the Reaver's drawing (`runOut`,
 * `runBack`); here it is drawn at the size of the screen and on the board.
 *
 *   give-split   over the impact's drawn frame: the scarlet run laid across
 *                the whole frame along the blade, on an ink cut
 *   give-glare   chalk light laid behind the figures for the drawn frame
 *   give-bead    the quiet: one bead of scarlet swelling on the edge, and not
 *                falling
 *   give-notch   the blow drawn: hard wedges thrown off the contact, the
 *                rhythm of the cleaver's notched edge, boiling
 *   give-wind    wind over the down: thin pale streaks and chalk grit
 *                crossing the frame low
 *   give-board   on the board after: a scarlet run down the enemy (`open`),
 *                a garnet run up into the Reaver (`home`)
 *
 * Nothing is filtered and nothing re-renders React while it plays: runs grow
 * on `--p`, the wind moves on `--p`, and the notch boils on `--f`.
 */

export const SCARLET = "#e8243c";
export const GARNET = "#7a1030";
export const ROSE = "#ff8fb0";
export const CHALK = "#d9d3c4";
const INK = "#07080b";

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

/**
 * A run in its own units: head at (0, 0) pointing along +x, the body trailing
 * back to x = −len, `w` wide at the head and thinning to the tail. The head is
 * swollen like a bead about to break.
 */
function runPath(len: number, w: number) {
  const h = w / 2;
  return [
    `M${-len} ${(-h * 0.15).toFixed(2)}`,
    `C${(-len * 0.6).toFixed(1)} ${(-h * 0.45).toFixed(2)} ${(-w * 2.2).toFixed(1)} ${(-h * 0.7).toFixed(2)} ${(-w * 0.9).toFixed(1)} ${(-h * 0.9).toFixed(2)}`,
    `C${(-w * 0.2).toFixed(1)} ${(-h * 1.5).toFixed(2)} ${(w * 0.75).toFixed(1)} ${(-h * 1.2).toFixed(2)} ${(w * 0.8).toFixed(1)} 0`,
    `C${(w * 0.75).toFixed(1)} ${(h * 1.3).toFixed(2)} ${(-w * 0.3).toFixed(1)} ${(h * 1.6).toFixed(2)} ${(-w * 1).toFixed(1)} ${(h * 0.95).toFixed(2)}`,
    `C${(-w * 2.4).toFixed(1)} ${(h * 0.7).toFixed(2)} ${(-len * 0.6).toFixed(1)} ${(h * 0.4).toFixed(2)} ${-len} ${(h * 0.15).toFixed(2)} Z`,
  ].join(" ");
}

/** One run, drawn: fill, a dark lip and the highlight along its top. */
function Run({ len, w, fill, lip, shine }: { len: number; w: number; fill: string; lip: string; shine: string }) {
  const h = w / 2;
  return (
    <g>
      <path d={runPath(len, w)} fill={fill} stroke={lip} strokeWidth={Math.max(1, w * 0.08)} strokeLinejoin="round" />
      <path
        d={`M${(-len * 0.9).toFixed(1)} ${(-h * 0.2).toFixed(2)} C${(-len * 0.5).toFixed(1)} ${(-h * 0.4).toFixed(2)} ${(-w * 1.6).toFixed(1)} ${(-h * 0.55).toFixed(2)} ${(-w * 0.5).toFixed(1)} ${(-h * 0.75).toFixed(2)}`}
        stroke={shine}
        strokeWidth={Math.max(1, w * 0.12)}
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx={(w * 0.12).toFixed(1)} cy={(-h * 0.45).toFixed(2)} rx={(w * 0.18).toFixed(2)} ry={(w * 0.11).toFixed(2)} fill="#fff4f2" opacity={0.85} />
    </g>
  );
}

/* ── The cut ─────────────────────────────────────────────────────────── */

/**
 * The impact's drawn frame is the engine's two-tone, first as it is (the
 * figures ink on the accent) and then held inverted (the accent figures on
 * ink): the same picture both ways. Over both, in colour, this: the scarlet
 * run laid across the whole frame along the blade, on an ink cut.
 * `params`: the line through two points, in fractions of the frame.
 */
const Split = ({ cue }: VfxProps) => {
  const p = cue.params ?? {};
  const x1 = Number(p.x1 ?? 0.3) * 1600;
  const y1 = Number(p.y1 ?? 0.2) * 900;
  const x2 = Number(p.x2 ?? 0.7) * 1600;
  const y2 = Number(p.y2 ?? 0.8) * 900;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <div className="give-split">
      <svg className="give-split-cut" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g transform={`translate(${x2.toFixed(0)} ${y2.toFixed(0)}) rotate(${angle.toFixed(2)})`}>
          <path d={`M${(-len - 900).toFixed(0)} 0 L300 0`} stroke={INK} strokeWidth={34} strokeLinecap="round" />
          <Run len={len + 900} w={24} fill={SCARLET} lip="#3a0610" shine="#ffb3bd" />
        </g>
      </svg>
    </div>
  );
};

/* ── The glare ─────────────────────────────────────────────────────────── */

/**
 * A field of chalk light laid behind the figures on the blow. The split frame
 * is two tones, and a night picture goes all to ink: with this behind them the
 * figures stay ink on chalk on one side of the cut and chalk on ink on the
 * other. It sinks back to the night within a few frames.
 */
const Glare = ({ cue }: VfxProps) => {
  const p = cue.params ?? {};
  return (
    <svg className="give-glare" viewBox="-900 -600 1800 1200" aria-hidden="true" style={v({ left: `${Number(p.x ?? 800)}px`, top: `${Number(p.y ?? 500)}px` })}>
      <defs>
        <radialGradient id="give-glare-fade" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={CHALK} stopOpacity="1" />
          <stop offset="0.65" stopColor={CHALK} stopOpacity="0.8" />
          <stop offset="1" stopColor={CHALK} stopOpacity="0" />
        </radialGradient>
      </defs>
      {p.flat ? <rect x={-900} y={-600} width={1800} height={1200} fill={CHALK} /> : <ellipse rx={880} ry={580} fill="url(#give-glare-fade)" />}
    </svg>
  );
};

/* ── The bead ──────────────────────────────────────────────────────────── */

const Bead = ({ cue }: VfxProps) => {
  const size = Number(cue.params?.size ?? 40);
  return (
    <svg className="give-bead" viewBox="-50 -20 100 120" aria-hidden="true" style={v({ "--size": `${size}px` })}>
      {/* Hung from the edge at the origin: a neck, and the bead swelling under it. */}
      <g className="give-bead-drop">
        <path d="M-7 0 C-6 10 -12 22 -20 34 C-30 50 -26 76 0 78 C26 76 30 50 20 34 C12 22 6 10 7 0 Z" fill={SCARLET} stroke="#3a0610" strokeWidth={3} strokeLinejoin="round" />
        <path d="M-12 44 C-16 52 -14 62 -8 68" stroke="#ffb3bd" strokeWidth={4} strokeLinecap="round" fill="none" />
        <ellipse cx={8} cy={46} rx={5} ry={3.5} fill="#fff4f2" />
      </g>
    </svg>
  );
};

/* ── The notch: the blow drawn ─────────────────────────────────────────── */

/** Three drawings of hard wedges thrown off a point, for boiling between. */
function wedges(seed: number, n = 11) {
  const rand = seeded(seed);
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.35;
    const r0 = 0.18 + rand() * 0.12;
    const r1 = 0.75 + rand() * 0.45;
    const w = 0.07 + rand() * 0.06;
    // A wedge with a notch bitten out of one side, like the cleaver's edge.
    const p = (r: number, off: number) => [Math.cos(a + off) * r, Math.sin(a + off) * r];
    const pts = [p(r0, -w), p(r1 * 0.55, -w * 0.6), p(r1 * 0.62, -w * 0.05), p(r1 * 0.7, -w * 0.55), p(r1, 0), p(r0, w)];
    d += `M${pts.map(([x, y]) => `${x.toFixed(3)} ${y.toFixed(3)}`).join(" L")} Z `;
  }
  return d.trim();
}

const Notch = ({ cue }: VfxProps) => {
  const seed = cue.seed ?? 7;
  const size = Number(cue.params?.size ?? 420);
  return (
    <svg className="give-notch" viewBox="-1.3 -1.3 2.6 2.6" aria-hidden="true" style={v({ "--size": `${size}px`, "--rot": `${cue.rotate ?? 0}deg` })}>
      {[0, 1, 2].map((i) => (
        <g key={i} className="give-notch-frame" data-f={i}>
          <path d={wedges(seed + i * 13)} fill={CHALK} stroke={INK} strokeWidth={0.035} strokeLinejoin="round" />
          <path d={wedges(seed + i * 13 + 5, 7)} fill={SCARLET} stroke={INK} strokeWidth={0.03} strokeLinejoin="round" transform="scale(0.62) rotate(14)" />
        </g>
      ))}
    </svg>
  );
};

/* ── Wind over the down ────────────────────────────────────────────────── */

const Wind = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 3);
  const n = Number(cue.params?.n ?? 16);
  const grit = Number(cue.params?.grit ?? 18);
  return (
    <div className="give-wind">
      {Array.from({ length: n }, (_, i) => (
        <i
          key={`s${i}`}
          className="give-streak"
          style={v({
            "--y": `${(40 + rand() * 58).toFixed(1)}%`,
            "--x0": `${(-30 + rand() * 100).toFixed(1)}%`,
            "--len": `${(8 + rand() * 18).toFixed(1)}%`,
            "--speed": (0.8 + rand() * 0.8).toFixed(2),
            "--a": (0.08 + rand() * 0.14).toFixed(2),
          })}
        />
      ))}
      {Array.from({ length: grit }, (_, i) => (
        <b
          key={`g${i}`}
          className="give-grit"
          style={v({
            "--y": `${(55 + rand() * 42).toFixed(1)}%`,
            "--x0": `${(-10 + rand() * 100).toFixed(1)}%`,
            "--speed": (1 + rand() * 1.2).toFixed(2),
            "--sz": `${(2 + rand() * 3).toFixed(1)}px`,
            "--bob": `${(rand() * 12).toFixed(1)}px`,
          })}
        />
      ))}
    </div>
  );
};

/* ── On the board ──────────────────────────────────────────────────────── */

const Board = ({ cue }: VfxProps) => {
  const mode = String(cue.params?.mode ?? "open");
  const home = mode === "home";
  return (
    <div className="give-board" data-mode={mode}>
      <svg viewBox="-20 -200 40 220" aria-hidden="true">
        {/* A run standing on the figure: down it from the chest (open), or up it into the chest (home). */}
        <g className="give-board-run" transform={home ? "translate(0 -150) rotate(-90)" : "translate(0 -10) rotate(90)"}>
          <Run len={150} w={14} fill={home ? GARNET : SCARLET} lip={home ? "#2a0510" : "#3a0610"} shine={home ? ROSE : "#ffb3bd"} />
        </g>
      </svg>
    </div>
  );
};

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "give-split": Split,
  "give-glare": Glare,
  "give-bead": Bead,
  "give-notch": Notch,
  "give-wind": Wind,
  "give-board": Board,
};

/* ── Frames ────────────────────────────────────────────────────────────── */

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

export const frames: Record<string, Frame> = {
  // The bead trembles on the combat clock, as a thing held under strain does.
  "give-bead": (el, p, age) => {
    const g = el.querySelector<SVGGElement>(".give-bead-drop");
    if (!g) return;
    const swell = 0.35 + 0.65 * Math.min(1, p * 1.25);
    const tremble = Math.sin(age / 23) * 0.012 + Math.sin(age / 41) * 0.008;
    const t = `scale(${(swell * (1 - tremble)).toFixed(3)} ${(swell * (1 + tremble * 1.4)).toFixed(3)})`;
    if (g.getAttribute("transform") !== t) g.setAttribute("transform", t);
  },
};
