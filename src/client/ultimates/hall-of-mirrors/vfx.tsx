import { useId, type CSSProperties, type ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import "./style.css";

/**
 * Hall of Mirrors — the effects only this film has.
 *
 *   hom-crack    a hairline crack running across the lens, on the battlefield
 *   hom-eye      the green eye behind the mask, kindling
 *   hom-glitter  glass dust: four-pointed glints that twinkle, or hang still
 *   hom-panes    freestanding mirrors, each holding the Beguiler — the real
 *                drawing of the caster, as worn, in ink with the porcelain
 *                mask left white — or the target's own reflection
 *   hom-mask     the painted smile: projected over a figure, broken off it,
 *                or hanging small and askew over a real enemy afterwards
 *   hom-shatter  the lens breaking from a point: the impact
 *   hom-fall     the same broken lens falling away off the real board
 *   hom-burst    slivers of mirror bursting off whatever was struck
 *
 * Like the shared vocabulary, everything is placed once when its shot starts
 * and moved by the variables the stage writes (`--p`, `--pe`, `--pi`, `--pb`,
 * `--f`); nothing is random at runtime and nothing uses a filter.
 */

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

const INK = "#0a0710";
const PORCELAIN = "#f3eee6";
const PORCELAIN_SHADE = "#c9c0b3";
const EYE = "#c7f06a";
const SMILE = "#d23b4b";

/* ------------------------------------------------------------- the mask -- */

/**
 * The Beguiler's face, as a thing that can be put on someone else: a
 * porcelain half-mask, cracked, one eye hole with the green showing through,
 * and a painted smile a good deal too wide. Drawn in a 100×120 box centred on
 * the eye line, in two halves so it can break down the crack.
 */
function MaskArt({ broken = false }: { broken?: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const plate =
    "M-34 -48 C-10 -58 26 -56 40 -38 C50 -24 48 0 42 18 C36 40 18 56 -2 58 C-22 56 -38 40 -44 18 C-50 -4 -50 -34 -34 -48 Z";
  const art = (
    <>
      <path d={plate} fill={PORCELAIN} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M-40 10 C-36 34 -20 50 -2 54 C-18 44 -30 30 -34 8 Z" fill={PORCELAIN_SHADE} />
      {/* brows painted high, one arched */}
      <path d="M-30 -30 Q-18 -40 -6 -32" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M10 -34 Q24 -46 36 -30" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* the eye holes: one dark, one with the green in it */}
      <path d="M-30 -16 Q-18 -26 -6 -16 Q-18 -8 -30 -16 Z" fill={INK} />
      <path d="M10 -16 Q22 -26 34 -16 Q22 -8 10 -16 Z" fill={INK} />
      <circle className="hom-mask-eye" cx="22" cy="-16.5" r="4.2" fill={EYE} />
      {/* a tear painted under the dark eye */}
      <path d="M-18 -4 q-3 8 0 11 q3 -3 0 -11 Z" fill="#6f5a93" />
      {/* the smile: from cheek to cheek and then some */}
      <path d="M-40 16 Q-4 50 44 8" stroke={INK} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M-40 16 Q-4 50 44 8" stroke={SMILE} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M-40 16 l-4 -5 M44 8 l5 -4" stroke={SMILE} strokeWidth="3" strokeLinecap="round" />
    </>
  );
  // The crack both halves share.
  const crack = "M8 -56 L2 -36 L12 -24 L-2 -2 L8 16 L-4 36 L2 58";
  return (
    <svg className="hom-mask-art" viewBox="-60 -70 120 140" data-broken={broken || undefined}>
      <defs>
        <clipPath id={`${id}l`}>
          <path d={`M-70 -80 H8 L2 -36 L12 -24 L-2 -2 L8 16 L-4 36 L2 80 H-70 Z`} />
        </clipPath>
        <clipPath id={`${id}r`}>
          <path d={`M70 -80 H8 L2 -36 L12 -24 L-2 -2 L8 16 L-4 36 L2 80 H70 Z`} />
        </clipPath>
      </defs>
      <g className="hom-mask-half l" clipPath={`url(#${id}l)`}>
        {art}
      </g>
      <g className="hom-mask-half r" clipPath={`url(#${id}r)`}>
        {art}
      </g>
      <path className="hom-mask-crack" d={crack} stroke={INK} strokeWidth="2.6" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

const Mask = ({ cue }: VfxProps) => {
  const mode = cue.params?.small
    ? "small"
    : cue.params?.broken
      ? "broken"
      : cue.params?.held
        ? "held"
        : "cast";
  return (
    <div className="hom-mask" data-mode={mode}>
      <i className="hom-mask-halo" />
      <MaskArt broken={mode === "broken"} />
    </div>
  );
};

/* --------------------------------------------------------------- the lens -- */

/** A hairline crack across the glass of the screen, from the caster outward. */
const Crack = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 5);
  // Glass does not fork like a bolt: long straight runs, a sharp change of
  // heading at each, and short fractures ticking off the corners.
  let x = 0;
  let y = 0;
  let heading = -0.1;
  let d = "M0 0";
  const ticks: string[] = [];
  for (let i = 1; i <= 11; i++) {
    heading = Math.max(-0.42, Math.min(0.28, heading + (rand() - 0.5) * 0.5));
    const run = 110 + rand() * 70;
    x += Math.cos(heading) * run;
    y += Math.sin(heading) * run;
    d += ` L${x.toFixed(0)} ${y.toFixed(0)}`;
    const side = rand() < 0.5 ? -1 : 1;
    const len = 14 + rand() * 26;
    ticks.push(
      `M${x.toFixed(0)} ${y.toFixed(0)} l${(Math.cos(heading + side * 1.9) * len).toFixed(0)} ${(Math.sin(heading + side * 1.9) * len).toFixed(0)}`,
    );
  }
  // Where it started: a little star of fractures in the glass.
  const star = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 + rand() * 0.4;
    const r = 18 + rand() * 26;
    return `M0 0 L${(Math.cos(a) * r).toFixed(0)} ${(Math.sin(a) * r).toFixed(0)}`;
  }).join(" ");
  return (
    <div className="hom-crack">
      <svg viewBox="-40 -400 1800 800">
        <path className="hom-crack-glow" d={d} />
        <path className="hom-crack-line" d={d} />
        <path className="hom-crack-branch" d={ticks.join(" ")} />
        <path className="hom-crack-star" d={star} />
      </svg>
    </div>
  );
};

interface Cell {
  d: string;
  cx: number;
  cy: number;
  /** 0 at the point of impact … 1 at the frame's edge. */
  dist: number;
  shade: number;
}

/**
 * One break, as geometry: jagged radials from the point of impact, joined by
 * rings, making the cells a pane of glass breaks into. The same seed and
 * centre give the same break, so the impact's crack and the pieces that fall
 * off the board afterwards are one pane.
 */
function glass(seed: number, cx: number, cy: number) {
  const rand = seeded(seed);
  const SPOKES = 11;
  const RINGS = [60, 200, 440, 800, 1600];
  const angles = Array.from({ length: SPOKES }, (_, i) => (i / SPOKES) * Math.PI * 2 + (rand() - 0.5) * 0.36);
  const pts = angles.map((a) =>
    RINGS.map((r, j) => {
      const bend = a + (rand() - 0.5) * 0.16 * (j + 1) * 0.5;
      const rr = r * (0.82 + rand() * 0.36);
      return [cx + Math.cos(bend) * rr, cy + Math.sin(bend) * rr] as const;
    }),
  );
  const P = (i: number, j: number) => (j < 0 ? ([cx, cy] as const) : pts[(i + SPOKES) % SPOKES][j]);
  const f = (p: readonly [number, number]) => `${p[0].toFixed(0)} ${p[1].toFixed(0)}`;
  const cells: Cell[] = [];
  for (let i = 0; i < SPOKES; i++)
    for (let j = -1; j < RINGS.length - 1; j++) {
      const a = P(i, j);
      const b = P(i + 1, j);
      const c = P(i + 1, j + 1);
      const e = P(i, j + 1);
      const d = j < 0 ? `M${f(a)} L${f(c)} L${f(e)} Z` : `M${f(a)} L${f(b)} L${f(c)} L${f(e)} Z`;
      const mx = (a[0] + b[0] + c[0] + e[0]) / 4;
      const my = (a[1] + b[1] + c[1] + e[1]) / 4;
      cells.push({ d, cx: mx, cy: my, dist: Math.min(1, (j + 1) / (RINGS.length - 1)), shade: rand() });
    }
  const radials = angles.map((_, i) => `M${f(P(i, -1))} ${RINGS.map((__, j) => `L${f(P(i, j))}`).join(" ")}`).join(" ");
  const rings = RINGS.slice(0, -1)
    .map((_, j) =>
      angles
        .map((__, i) => (rand() < 0.12 ? "" : `M${f(P(i, j))} L${f(P(i + 1, j))}`))
        .join(" "),
    )
    .join(" ");
  return { cells, radials, rings };
}

const Shatter = ({ cue }: VfxProps) => {
  const cx = 1600 * Number(cue.params?.cx ?? 0.6);
  const cy = 900 * Number(cue.params?.cy ?? 0.45);
  const { cells, radials, rings } = glass(cue.seed ?? 7, cx, cy);
  return (
    <div className="hom-shatter">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        {cells.map((c, i) => (
          <path
            key={i}
            className="hom-cell"
            d={c.d}
            data-shade={c.shade < 0.3 ? 2 : c.shade < 0.7 ? 1 : 0}
            style={v({
              "--dx": `${((c.cx - cx) / 60).toFixed(1)}px`,
              "--dy": `${((c.cy - cy) / 60).toFixed(1)}px`,
            })}
          />
        ))}
        <path className="hom-lines-glow" d={`${radials} ${rings}`} />
        {/* Ink under the light, so the break still reads on a white frame. */}
        <path className="hom-lines-ink" d={`${radials} ${rings}`} />
        <path className="hom-lines" d={`${radials} ${rings}`} />
        <g transform={`translate(${cx} ${cy})`}>
          <path
            className="hom-hole"
            d="M0 -58 L14 -20 L52 -30 L24 0 L60 22 L16 18 L6 60 L-10 20 L-50 34 L-22 2 L-56 -26 L-14 -16 Z"
          />
        </g>
      </svg>
    </div>
  );
};

const Fall = ({ cue }: VfxProps) => {
  const cx = 1600 * Number(cue.params?.cx ?? 0.6);
  const cy = 900 * Number(cue.params?.cy ?? 0.45);
  const { cells } = glass(cue.seed ?? 7, cx, cy);
  const rand = seeded((cue.seed ?? 7) + 100);
  return (
    <div className="hom-fall">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        {cells.map((c, i) => (
          <path
            key={i}
            className="hom-piece"
            d={c.d}
            data-shade={c.shade < 0.3 ? 2 : c.shade < 0.7 ? 1 : 0}
            style={v({
              // The middle goes first, the rim hangs on a moment.
              "--d": (c.dist * 0.3 + rand() * 0.08).toFixed(3),
              "--dx": `${((c.cx - cx) * (0.15 + rand() * 0.2)).toFixed(0)}px`,
              // The big rim pieces barely turn: a slab swung round its middle
              // would sweep back across the picture it is clearing.
              "--r": `${((rand() - 0.5) * 70 * (1 - c.dist * 0.85)).toFixed(0)}deg`,
            })}
          />
        ))}
      </svg>
    </div>
  );
};

/** Slivers of mirror bursting off a blow. */
const Burst = ({ cue }: VfxProps) => {
  const rand = seeded(cue.seed ?? 3);
  const shards = Array.from({ length: 18 }, () => {
    const a = -Math.PI * (0.02 + rand() * 0.96) + (rand() < 0.25 ? Math.PI : 0);
    const dist = 140 + rand() * 300;
    const len = 26 + rand() * 46;
    const w = 7 + rand() * 12;
    return {
      pts: `0 ${(-len / 2).toFixed(0)} ${(w / 2).toFixed(0)} ${(len * 0.2).toFixed(0)} 0 ${(len / 2).toFixed(0)} ${(-w / 2).toFixed(0)} ${(-len * 0.1).toFixed(0)}`,
      dx: Math.cos(a) * dist,
      dy: Math.sin(a) * dist,
      r: (rand() - 0.5) * 720,
      light: rand() < 0.5,
    };
  });
  return (
    <svg className="hom-burst" viewBox="-400 -400 800 800">
      <path
        className="hom-burst-hole"
        d="M0 -120 L26 -34 L110 -52 L44 6 L120 60 L30 40 L10 130 L-22 42 L-104 76 L-44 4 L-118 -52 L-30 -30 Z"
      />
      {shards.map((s, i) => (
        <g
          key={i}
          className="hom-sliver"
          style={v({ "--dx": `${s.dx.toFixed(0)}px`, "--dy": `${s.dy.toFixed(0)}px`, "--r": `${s.r.toFixed(0)}deg` })}
        >
          <polygon points={s.pts} fill={s.light ? "#f6f1ff" : "#b79ae6"} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        </g>
      ))}
    </svg>
  );
};

/**
 * The light of the break, behind everyone: a white field that swallows the
 * hall for the impact's first frames, so the drawn frame is ink figures on
 * light, and then goes out.
 */
const Glare = ({ color }: VfxProps) => (
  <div className="hom-glare" style={v({ "--c": color })}>
    <i />
  </div>
);

/* ----------------------------------------------------------- the glass -- */

const Eye = ({ color }: VfxProps) => (
  <div className="hom-eye" style={v({ "--c": color })}>
    <i className="hom-eye-glow" />
    <i className="hom-eye-flare" />
    <i className="hom-eye-flare v" />
    <i className="hom-eye-core" />
  </div>
);

const Glitter = ({ cue, color }: VfxProps) => {
  const rand = seeded(cue.seed ?? 13);
  const w = Number(cue.params?.w ?? 700);
  const h = Number(cue.params?.h ?? 420);
  return (
    <div className="hom-glitter" data-still={cue.params?.still ? "" : undefined} style={v({ "--c": color })}>
      {Array.from({ length: 30 }, (_, i) => (
        <i
          key={i}
          style={v({
            "--x": `${((rand() - 0.5) * w).toFixed(0)}px`,
            "--y": `${((rand() - 0.5) * h).toFixed(0)}px`,
            "--rise": `${(-30 - rand() * 90).toFixed(0)}px`,
            "--z": (0.4 + rand() * 1.1).toFixed(2),
            "--ph": rand().toFixed(2),
            "--rate": (1.5 + rand() * 3).toFixed(2),
          })}
        />
      ))}
    </div>
  );
};

/** A freestanding mirror's frame, drawn over its glass. */
function PaneFrame() {
  return (
    <svg className="hom-pane-frame" viewBox="0 0 100 240" preserveAspectRatio="none">
      <path
        d="M4 238 V60 Q4 10 50 3 Q96 10 96 60 V238 Z"
        fill="none"
        stroke={INK}
        strokeWidth="9"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M4 238 V60 Q4 10 50 3 Q96 10 96 60 V238 Z"
        fill="none"
        stroke="#6e5a8c"
        strokeWidth="4"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * Freestanding mirrors in a row, centred on the cue's point, standing on it.
 * Params: `count`, `gap`, `w`, `h` (a pane, world units), `fig` (the figure
 * in it), `who` (`caster`, or `target` for the target's own reflection),
 * `masked` (paint the smile onto a target's reflection), `broken` (the glass
 * is gone: it has just been struck), `stagger` (panes lighting in turn).
 */
const Panes = ({ cue }: VfxProps) => {
  const count = Number(cue.params?.count ?? 5);
  const gap = Number(cue.params?.gap ?? 300);
  const w = Number(cue.params?.w ?? 210);
  const h = Number(cue.params?.h ?? 520);
  const fig = Number(cue.params?.fig ?? 420);
  const who = String(cue.params?.who ?? "caster");
  const stagger = Number(cue.params?.stagger ?? 0.12);
  const rand = seeded(cue.seed ?? 29);
  return (
    <div
      className="hom-panes"
      data-who={who}
      data-broken={cue.params?.broken ? "" : undefined}
      style={v({
        "--pw": `${w}px`,
        "--ph": `${h}px`,
        "--fig": `${fig}px`,
        // Where the smile lands on a target's reflection, and when.
        "--mx": `${Number(cue.params?.mx ?? 0)}px`,
        "--my": `${Number(cue.params?.my ?? 30)}%`,
        "--ma": Number(cue.params?.maskAt ?? 0.3),
      })}
    >
      {Array.from({ length: count }, (_, i) => {
        const x = (i - (count - 1) / 2) * gap;
        // The Beguiler in a mirror looks inward, towards the middle of the room.
        const face = count === 1 ? Number(cue.params?.face ?? -1) : x > 0 ? -1 : 1;
        return (
          <div
            key={i}
            className="hom-pane"
            style={v({
              left: `${x - w / 2}px`,
              "--i": i,
              // A held pane was already there when the shot began.
              "--k0": cue.params?.held ? -1 : (i * stagger).toFixed(3),
              "--face": face,
              "--lean": `${((rand() - 0.5) * 5).toFixed(1)}deg`,
              "--fx": `${((rand() - 0.5) * w * 0.2).toFixed(0)}px`,
              "--tilt": `${((rand() - 0.5) * 10).toFixed(1)}deg`,
            })}
          >
            <div className="hom-pane-glass">
              <div className="hom-pane-fig" data-slot="" />
              {who === "target" && cue.params?.masked ? (
                <div className="hom-pane-mask">
                  <MaskArt />
                </div>
              ) : null}
              <i className="hom-pane-sheen" />
            </div>
            <PaneFrame />
            <i className="hom-pane-foot" />
          </div>
        );
      })}
    </div>
  );
};

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "hom-crack": Crack,
  "hom-eye": Eye,
  "hom-glitter": Glitter,
  "hom-panes": Panes,
  "hom-mask": Mask,
  "hom-shatter": Shatter,
  "hom-fall": Fall,
  "hom-burst": Burst,
  "hom-glare": Glare,
};

export const frames: Record<string, Frame> = {
  /**
   * Put the real drawing in every mirror, once. What is in the glass is a
   * copy of the presentation figure as it stands — the equipment worn, the
   * pose it last held — so the reflection is the Beguiler and not a picture
   * of one. The copy is plain DOM inside the effect and goes when it does.
   */
  "hom-panes": (el) => {
    if (el.dataset.filled) return;
    const film = el.closest(".ult-cinematic");
    const panes = el.querySelector<HTMLElement>(".hom-panes");
    if (!film || !panes) return;
    const role = panes.dataset.who === "target" ? "targets" : "caster";
    const source = film.querySelector(`.cine-actor[data-role="${role}"] .cine-look`);
    if (!source) return;
    for (const slot of el.querySelectorAll<HTMLElement>(".hom-pane-fig")) {
      const copy = source.cloneNode(true) as HTMLElement;
      for (const node of copy.querySelectorAll("[id]")) node.removeAttribute("id");
      slot.replaceChildren(copy);
    }
    el.dataset.filled = "1";
  },
};
