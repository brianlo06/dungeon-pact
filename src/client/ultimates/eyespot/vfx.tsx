import { useId, type CSSProperties, type ReactNode } from "react";
import { seeded, type VfxContext, type VfxProps } from "../../cinematic/vfx";
import "./style.css";

/**
 * Eyespot: the effects only this film has.
 *
 *   spot-moths  moths on the wing, in one of seven flights: `rise` off the
 *               hem on the board, `drift` across the moon, `swarm` across the
 *               lens (the film's wipe), `stream` away over the line,
 *               `blind` (a knot of them over an enemy's eyes, on the board),
 *               `veil` (circling the Beguiler, its Barrier)
 *   spot-coat   moths settled all over a figure's robe, opening their wings
 *               one after another: a hundred green eyes
 *   spot-robe   the robe the enemy lunges at: the Beguiler's shape in dark
 *               cloth and moths, which bursts into wings around nothing
 *   spot-cut    the Beguiler's cut: a crescent, a sliver of moon, cream over
 *               an ink edge; `scar` for what it leaves on the board
 *   spot-moon   the moon, drawn: a disc, its seas, its halo
 *
 * The moth is drawn once per effect as a symbol and placed with `<use>`:
 * dusty lilac wings with a darker band, an ink body, and on each forewing an
 * eyespot, an ink ring round a green iris with a cream catchlight. A moth's
 * wings flap on the frame counter (`--f`), so they hold through a hit-stop.
 * Everything moves on `--p` and friends; nothing is random at runtime and
 * nothing uses a filter.
 */

const v = (vars: Record<string, string | number>) => vars as CSSProperties;
const f2 = (n: number) => n.toFixed(2);
const f3 = (n: number) => n.toFixed(3);

/** The moth's drawing: one side's wings (drawn right, mirrored for the left), and its body. */
function MothSymbols({ id }: { id: string }) {
  return (
    <svg className="spot-defs" width="0" height="0" aria-hidden="true">
      <defs>
        <symbol id={`${id}-wing`} viewBox="-24 -20 48 40" overflow="visible">
          <path
            className="spot-wing"
            d="M1.4 -5.6 C7 -12.5 16.5 -13 20.6 -8.6 C22.4 -3.6 18 3 11.6 4.2 C7.4 4.9 4 2.6 1.4 0.4 Z M1.4 0.4 C6.6 1.2 12.2 4.4 12.2 9.2 C11.2 13.6 6.2 13.2 3.2 9.4 C1.6 6.6 1 3.2 1.4 0.4 Z"
          />
          <path className="spot-band" d="M4.6 -1.8 C8.8 -3 13.4 -5.4 17.8 -8.8" />
          <circle className="spot-eye-halo" cx="11.6" cy="-4.2" r="7.6" />
          <circle className="spot-eye-ring" cx="11.6" cy="-4.2" r="5" />
          <circle className="spot-eye-pupil" cx="11.9" cy="-4" r="1.9" />
          <circle className="spot-eye-glint" cx="10.1" cy="-5.9" r="1" />
        </symbol>
        <symbol id={`${id}-body`} viewBox="-24 -20 48 40" overflow="visible">
          <path className="spot-feelers" d="M-0.6 -8.4 C-2.6 -12.2 -4.8 -14 -7.4 -14.4 M0.6 -8.4 C2.6 -12.2 4.8 -14 7.4 -14.4" />
          <path className="spot-body" d="M0 -9.4 C1.6 -9.4 2.2 -7.6 2.1 -5.8 C3 -2 2.8 6 0 11.6 C-2.8 6 -3 -2 -2.1 -5.8 C-2.2 -7.6 -1.6 -9.4 0 -9.4 Z" />
        </symbol>
      </defs>
    </svg>
  );
}

/** One moth. `vars` places it; the side groups flap. */
function Moth({ id, vars, className = "" }: { id: string; vars: Record<string, string | number>; className?: string }) {
  return (
    <i className={`spot-moth ${className}`} style={v(vars)}>
      <svg viewBox="-24 -20 48 40" overflow="visible">
        <g className="spot-side spot-right">
          <use href={`#${id}-wing`} />
        </g>
        <g className="spot-side spot-left">
          <use href={`#${id}-wing`} />
        </g>
        <use href={`#${id}-body`} />
      </svg>
    </i>
  );
}

const useSymbolId = () => `spot${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

/* ------------------------------------------------------------ in flight -- */

/**
 * Moths in flight. Each moth runs from (x0, y0) to (x1, y1) in multiples of
 * `--u` over its own window (`--d` start, `--len` length) with a wobble.
 * `blind` and `veil` orbit instead: round (cx, cy), radii (rx, ry).
 *
 * Params: `mode`, `count`, `size` (world px for `--u`, when not riding a
 * figure), and for `stream` and `burst` an `x`/`y` origin in `--u`.
 */
const Moths = ({ cue }: VfxProps) => {
  const id = useSymbolId();
  const mode = String(cue.params?.mode ?? "drift");
  const rand = seeded(cue.seed ?? 3);
  const count = Number(cue.params?.count ?? 12);
  const size = cue.params?.size !== undefined ? `${Number(cue.params.size)}px` : undefined;
  const ox = Number(cue.params?.ox ?? 0);
  const oy = Number(cue.params?.oy ?? 0);
  const moths: Record<string, string | number>[] = [];
  for (let i = 0; i < count; i++) {
    const k = i / Math.max(1, count - 1);
    const g = Math.floor(rand() * 4);
    const ph = rand() * 6.28;
    switch (mode) {
      case "rise": {
        // Off the hem, spiralling up round the figure, and away.
        const side = i % 2 ? 1 : -1;
        moths.push({
          "--x0": f3(side * (0.08 + rand() * 0.2)),
          "--y0": f3(-0.04 - rand() * 0.12),
          "--x1": f3(side * (0.25 + rand() * 0.45)),
          "--y1": f3(-0.9 - rand() * 0.7),
          "--d": f3(k * 0.45),
          "--len": f3(0.5 + rand() * 0.25),
          "--wob": f3(0.08 + rand() * 0.08),
          "--fq": f2(7 + rand() * 6),
          "--ms": f3(0.24 + rand() * 0.1),
          "--tilt": `${Math.round(side * (10 + rand() * 30))}deg`,
          "--g": g,
          "--ph": f2(ph),
        });
        break;
      }
      case "drift": {
        const y = (rand() - 0.5) * 0.6;
        moths.push({
          "--x0": f3(-0.7 - rand() * 0.3 + k * 0.2),
          "--y0": f3(y),
          "--x1": f3(0.7 + rand() * 0.3),
          "--y1": f3(y - 0.2 - rand() * 0.2),
          "--d": f3(k * 0.3),
          "--len": f3(0.7 + rand() * 0.3),
          "--wob": f3(0.04 + rand() * 0.04),
          "--fq": f2(5 + rand() * 4),
          "--ms": f3(0.09 + rand() * 0.05),
          "--tilt": `${Math.round(60 + rand() * 40)}deg`,
          "--g": g,
          "--ph": f2(ph),
        });
        break;
      }
      case "swarm": {
        // Across the lens, left to right, densest as the cut passes behind.
        const row = (i % 6) / 5;
        moths.push({
          "--x0": f3(-0.35 - rand() * 0.5),
          "--y0": f3(-0.1 + row * 1.2 + (rand() - 0.5) * 0.18),
          "--x1": f3(1.35 + rand() * 0.5),
          "--y1": f3(-0.1 + row * 1.2 + (rand() - 0.5) * 0.3),
          "--d": f3(rand() * 0.28),
          "--len": f3(0.6 + rand() * 0.14),
          "--wob": f3(0.03 + rand() * 0.05),
          "--fq": f2(4 + rand() * 4),
          "--ms": f3(0.2 + rand() * 0.16),
          "--tilt": `${Math.round(80 + (rand() - 0.5) * 40)}deg`,
          "--g": g,
          "--ph": f2(ph),
        });
        break;
      }
      case "stream": {
        // From the burst, over the target's head, and on to the rest of the line.
        moths.push({
          "--x0": f3(ox + (rand() - 0.5) * 0.4),
          "--y0": f3(oy + (rand() - 0.5) * 0.4),
          "--x1": f3(ox + 3.4 + rand() * 1.4),
          "--y1": f3(oy - 0.9 - rand() * 0.8),
          "--d": f3(k * 0.4),
          "--len": f3(0.45 + rand() * 0.2),
          "--wob": f3(0.1 + rand() * 0.1),
          "--fq": f2(6 + rand() * 5),
          "--ms": f3(0.2 + rand() * 0.08),
          "--tilt": `${Math.round(70 + rand() * 40)}deg`,
          "--g": g,
          "--ph": f2(ph),
        });
        break;
      }
      case "blind": {
        // A knot of them at the eyes: small, close orbits, never settling.
        moths.push({
          "--cx": f3(-0.06 + (rand() - 0.5) * 0.1),
          "--cy": f3(-0.78 + (rand() - 0.5) * 0.1),
          "--rx": f3(0.14 + rand() * 0.1),
          "--ry": f3(0.05 + rand() * 0.05),
          "--turns": f2((i % 2 ? 1 : -1) * (0.9 + rand() * 0.5)),
          "--a0": `${Math.round((360 * i) / count)}deg`,
          "--d": f3(k * 0.2),
          "--ms": f3(0.34 + rand() * 0.08),
          "--g": g,
          "--ph": f2(ph),
        });
        break;
      }
      case "veil": {
        moths.push({
          "--cx": "0",
          "--cy": f3(-0.42 - rand() * 0.2),
          "--rx": f3(0.42 + rand() * 0.14),
          "--ry": f3(0.1 + rand() * 0.06),
          "--turns": f2(0.45 + rand() * 0.2),
          "--a0": `${Math.round((360 * i) / count)}deg`,
          "--d": f3(k * 0.15),
          "--ms": f3(0.3 + rand() * 0.06),
          "--g": g,
          "--ph": f2(ph),
        });
        break;
      }
    }
  }
  return (
    <div
      className="spot-moths"
      data-mode={mode}
      data-phase={mode === "swarm" ? String(cue.params?.phase ?? "in") : undefined}
      style={size ? v({ "--u": size }) : undefined}
    >
      <MothSymbols id={id} />
      {mode === "swarm" ? <b className="spot-dust" /> : null}
      {moths.map((m, i) => (
        <Moth key={i} id={id} vars={m} />
      ))}
    </div>
  );
};

/* ------------------------------------------------------- on the robe -- */

/**
 * Where moths sit on the Beguiler's drawing, in its own units (0…100, feet
 * at y 97): over the robe from the collar to the hem, and down the hood
 * behind the mask. Never on the mask, the arms or the doll.
 */
const ROBE: [number, number][] = [
  [42, 50], [54, 51],
  [36, 59], [48, 60], [60, 60],
  [32, 69], [44, 69], [56, 70], [67, 71],
  [27, 79], [39, 79], [51, 79], [63, 80], [73, 84],
  [24, 87], [35, 87], [47, 86], [59, 88], [69, 88],
  [37, 21], [35, 32], [41, 42],
];

/** Moth sizes per spot: bigger low on the robe, where there is room. */
const sizeAt = (y: number, rand: () => number) => 10.5 + (y > 60 ? 2.5 : 0) + rand() * 2.5;

/**
 * Moths settled on a figure's robe. Params: `held` (all open from the first
 * frame), `openAt` and `openSpan` (when, in the effect's life, they open,
 * from the hem up), `land` (they fly in from off the hem first), `breathe`
 * (all close once, slowly, and open again).
 */
const Coat = ({ cue }: VfxProps) => {
  const id = useSymbolId();
  const rand = seeded(cue.seed ?? 5);
  const held = !!cue.params?.held;
  const openAt = Number(cue.params?.openAt ?? 0.25);
  const span = Number(cue.params?.openSpan ?? 0.45);
  const land = !!cue.params?.land;
  const order = ROBE.map((p, i) => ({ p, i, key: -p[1] + rand() * 14 })).sort((a, b) => b.key - a.key);
  const rank = new Map(order.map((o, n) => [o.i, n / ROBE.length]));
  return (
    <div className="spot-coat" data-held={held || undefined} data-land={land || undefined} data-breathe={cue.params?.breathe ? "" : undefined}>
      <MothSymbols id={id} />
      <div className="spot-coat-box">
        {ROBE.map(([x, y], i) => {
          const r = rank.get(i)!;
          return (
            <Moth
              key={i}
              id={id}
              vars={{
                "--fx": f2(x),
                "--fy": f2(y),
                "--fs": f2(sizeAt(y, rand)),
                "--rr": `${Math.round((rand() - 0.5) * 70)}deg`,
                "--o": f3(openAt + r * span),
                "--l": f3(r * 0.2),
                "--lx": f2((rand() - 0.5) * 60),
                "--g": Math.floor(rand() * 4),
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------ the robe -- */

/** The Beguiler's shape, from `Beguiler.tsx`: the robe, the hood and its two horns, in one outline. */
const ROBE_PATH =
  "M36 45 Q48 41 60 45 L65 62 C68 72 72 80 77 86 C73 87 70 85 68 82 C68 87 66 90 62 91 C63 87 62 84 60 82 L56 90 L52 83 L47 91 L43 83 L38 90 C38 86 37 84 35 83 C33 87 30 89 26 89 C29 86 30 83 30 80 C27 83 23 84 19 83 C24 78 28 72 31 62 Z";
const HOOD_PATH =
  "M48 12 C58 12 66 18 66 28 C66 36 62 42 58 45.5 L35 45.5 C31.5 40 30.5 34 31.5 27 C33 17.5 39 12 48 12 Z";
const HORNS_PATH =
  "M40 17 C35 12 28 10.5 22 12 C20 12.5 19 14 19.5 16 C24 15 29 16 33 20 Z M35 26 C28 25 22 27 18 32 C17 33.5 17.5 35 19 35.5 C22 32.5 27 31.5 33 33 Z";

/**
 * The robe the enemy lunges at: the Beguiler's outline in dark cloth, moths
 * all over it, and in the hood the eye it was watching, which is one more
 * moth. At `burstAt` the cloth is gone and every moth flies outward from the
 * middle of where a body should have been. Params: `burstAt`, `size` (world
 * px, the figure's drawn height).
 */
const Robe = ({ cue }: VfxProps) => {
  const id = useSymbolId();
  const rand = seeded(cue.seed ?? 9);
  const size = Number(cue.params?.size ?? 300);
  const burst = Number(cue.params?.burstAt ?? 0);
  const spots: [number, number, number][] = [...ROBE.map(([x, y]) => [x, y, sizeAt(y, rand)] as [number, number, number]), [54.5, 30, 16]];
  return (
    <div className="spot-robe" style={v({ "--u": `${size}px`, "--b0": burst })}>
      <MothSymbols id={id} />
      <div className="spot-coat-box">
        <svg className="spot-robe-cloth" viewBox="0 0 100 100">
          <path d={HORNS_PATH} />
          <path d={ROBE_PATH} />
          <path d={HOOD_PATH} />
          <path className="spot-robe-hollow" d="M47 21 C54 20 62 22 63.5 29 C64.5 35 62 41 56 43.5 C52 43 49 40.5 48 36 C47 31 46 26 47 21 Z" />
        </svg>
        {spots.map(([x, y, s], i) => {
          const a = Math.atan2(y - 58, x - 48) + (rand() - 0.5) * 0.7;
          const d = 40 + rand() * 90;
          return (
            <Moth
              key={i}
              id={id}
              className={i === spots.length - 1 ? "spot-false-eye" : ""}
              vars={{
                "--fx": f2(x),
                "--fy": f2(y),
                "--fs": f2(s),
                "--rr": `${Math.round((rand() - 0.5) * 70)}deg`,
                "--bx": f2(Math.cos(a) * d),
                "--by": f2(Math.sin(a) * d - 20 - rand() * 30),
                "--br": `${Math.round((rand() - 0.5) * 540)}deg`,
                "--g": Math.floor(rand() * 4),
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------- the cut -- */

/**
 * The cut: a crescent across the figure, drawn on from its upper end in a
 * few frames, bright, then cooling to a thin line. Params: `scar` (on the
 * board: already drawn, small, held), `angle`.
 */
const Cut = ({ cue }: VfxProps) => (
  <div
    className="spot-cut"
    data-scar={cue.params?.scar ? "" : undefined}
    style={v({ "--ang": `${Number(cue.params?.angle ?? -28)}deg` })}
  >
    <svg viewBox="-60 -40 120 80" overflow="visible">
      <path className="spot-cut-ink" d="M-52 30 Q-2 -44 54 -30 Q2 -20 -52 30 Z" />
      <path className="spot-cut-light" d="M-52 30 Q-2 -44 54 -30 Q2 -20 -52 30 Z" />
      <path className="spot-cut-core" d="M-46 25 Q-2 -38 48 -29" />
      <g className="spot-cut-star" transform="translate(54 -30)">
        <path className="spot-cut-star-ink" d="M0 -17 L3 -3 L17 0 L3 3 L0 17 L-3 3 L-17 0 L-3 -3 Z" />
        <path className="spot-cut-star-light" d="M0 -14 L2 -2 L14 0 L2 2 L0 14 L-2 2 L-14 0 L-2 -2 Z" />
      </g>
    </svg>
  </div>
);

/* ------------------------------------------------------------ the moon -- */

/** The moon, drawn: a cream disc with its seas, and two flat rings of halo. Params: `size` (world px). */
const Moon = ({ cue }: VfxProps) => (
  <div className="spot-moon" style={v({ "--u": `${Number(cue.params?.size ?? 300)}px` })}>
    <svg viewBox="-100 -100 200 200" overflow="visible">
      <circle className="spot-moon-halo" r="150" />
      <circle className="spot-moon-halo" r="118" />
      <circle className="spot-moon-disc" r="80" />
      <path
        className="spot-moon-sea"
        d="M-44 -30 C-30 -46 -8 -40 -6 -24 C-4 -10 -22 -4 -36 -8 C-50 -12 -54 -20 -44 -30 Z M12 10 C26 2 46 8 48 24 C50 38 34 50 20 44 C8 38 2 18 12 10 Z M-20 30 C-12 26 -4 32 -6 40 C-8 48 -20 50 -26 44 C-30 38 -26 32 -20 30 Z M22 -48 C30 -52 40 -46 38 -38 C36 -30 26 -30 22 -36 C20 -40 18 -46 22 -48 Z"
      />
      <path className="spot-moon-edge" d="M56 -57 A80 80 0 0 1 56 57" />
    </svg>
  </div>
);

type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

export const renderers: Record<string, (p: VfxProps) => ReactNode> = {
  "spot-moths": Moths,
  "spot-coat": Coat,
  "spot-robe": Robe,
  "spot-cut": Cut,
  "spot-moon": Moon,
};

export const frames: Record<string, Frame> = {
  /** On the board the scar belongs to the one enemy that was cut: the first anchored copy. */
  "spot-cut": (el) => {
    if (el.dataset.placed || !el.dataset.anchor) return;
    const first = el.parentElement?.querySelector(".fx-spot-cut-wrap.cine-anchored");
    if (first !== el) el.style.display = "none";
    el.dataset.placed = "1";
  },
};
