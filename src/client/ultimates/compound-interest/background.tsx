import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Compound Interest's space: the sink.
 *
 * A limestone swallow-hole under the dungeon, where the Usurer's older loans
 * have gone on breeding. The room is a hole in the rock, and every inch of the
 * rock inside it is crusted with bitten coppers the way a hull is crusted with
 * barnacles: thin and dark up in the roof, banked thick where the shingle has
 * piled against the walls. In places the crust has run and set into drips that
 * hang from the roof. The floor is loose coin. Held in the crust on either
 * side are the shapes of earlier borrowers — a bowed shoulder, a horn, one
 * open hand — still paying.
 *
 * Drawn on the 3200×1800 box of the other backgrounds (world units: the stage
 * is 0…1600 × 0…900). The hole is an ellipse about (800, 470) that the film's
 * wide shot sits inside; the shingle floor starts at world y 820, so a figure
 * standing at y 860 stands on it, and the middle of the room is left bare so
 * the cast reads against the dark.
 */

export const SOOT = "#0e0a08";
export const TARNISH = "#5a3524";
export const CRUST = "#7a4a2c";
export const COPPER = "#e08a3c";
export const HOT = "#ffd9a0";

const f1 = (x: number) => x.toFixed(1);
const ell = (x: number, y: number, rx: number, ry: number) =>
  `M${f1(x - rx)} ${f1(y)} a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(rx * 2)} 0 a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-rx * 2)} 0 Z`;

/** The hole: an ellipse with the rock's roughness worked into its edge. */
const CX = 800;
const CY = 470;
const RX = 1560;
const RY = 760;
const FLOOR = 820;

const wobble = seeded(1717);
const BUMPS = Array.from({ length: 5 }, () => ({
  n: 2 + Math.floor(wobble() * 5),
  amp: 0.03 + wobble() * 0.05,
  phase: wobble() * Math.PI * 2,
}));

/** The radius of the hole at an angle, in x and y, with the rock's lumps. */
function edge(a: number) {
  let k = 1;
  for (const b of BUMPS) k += Math.sin(a * b.n + b.phase) * b.amp;
  return [CX + Math.cos(a) * RX * k, CY + Math.sin(a) * RY * k] as const;
}

const STEPS = 220;
const RIM = Array.from({ length: STEPS }, (_, i) => edge((i / STEPS) * Math.PI * 2));

/** Rock everywhere except the hole: one path, wound the other way. */
const ROCK =
  `M-820 -470 H2420 V1370 H-820 Z M${RIM.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(" L")} Z`;

/**
 * The crust: coins clinging to the inside of the hole in colonies, thickest
 * low down where the shingle banks against the rock, thin across the roof.
 */
function crust() {
  const rand = seeded(9317);
  let deep = "";
  let body = "";
  let lit = "";
  for (let c = 0; c < 190; c++) {
    const a = rand() * Math.PI * 2;
    const [ex, ey] = edge(a);
    // Down the sides and along the floor there is more of it, and it reaches
    // further in; overhead it is a scatter.
    const low = 0.35 + 0.65 * Math.max(0, Math.sin(a));
    const reach = 40 + rand() * 300 * low;
    const colony = 6 + Math.floor(rand() * 16 * low);
    const towards = Math.atan2(CY - ey, CX - ex);
    const cxp = ex + Math.cos(towards) * reach * rand();
    const cyp = ey + Math.sin(towards) * reach * rand();
    if (cyp > FLOOR + 40) continue;
    for (let i = 0; i < colony; i++) {
      const spread = 30 + rand() * 110;
      const x = cxp + (rand() - 0.5) * spread * 2;
      const y = cyp + (rand() - 0.5) * spread;
      // The middle of the room, where the cast stands, stays bare.
      if (Math.abs(x - 800) < 620 && y > 150 && y < FLOOR) continue;
      const r = 10 + rand() * 22 * (0.5 + low * 0.5);
      const d = ell(x, y, r, r * 0.84);
      if (rand() < 0.28) deep += d;
      else {
        body += d;
        if (rand() < 0.62) lit += ell(x - r * 0.22, y - r * 0.24, r * 0.58, r * 0.54);
      }
    }
  }
  return { deep, body, lit };
}

/** The shingle: loose coin on the floor, bigger and looser towards the lens. */
function shingle() {
  const rand = seeded(4242);
  let body = "";
  let lit = "";
  for (let i = 0; i < 620; i++) {
    const t = rand() ** 0.8;
    const y = FLOOR + t * 540;
    const x = -820 + rand() * 3240;
    const r = 9 + t * 34 + rand() * 9;
    body += ell(x, y, r, r * 0.66);
    if (rand() < 0.6) lit += ell(x - r * 0.24, y - r * 0.2, r * 0.54, r * 0.38);
  }
  return { body, lit };
}

/** Crust that has run off the roof and set: drips, hanging into the room. */
function drips() {
  const rand = seeded(515);
  let stem = "";
  let coins = "";
  for (const [x, len, w] of [
    [-230, 520, 86],
    [180, 300, 52],
    [560, 190, 38],
    [1160, 250, 44],
    [1460, 470, 78],
    [1960, 620, 96],
  ] as [number, number, number][]) {
    // Hung from the roof of the hole, wherever that is above this x.
    const t = Math.max(0, 1 - ((x - CX) / (RX * 0.95)) ** 2);
    const top = CY - RY * Math.sqrt(t) + 40;
    stem += `M${x - w / 2} ${top} C${x - w * 0.4} ${top + len * 0.62} ${x - w * 0.14} ${top + len * 0.82} ${x} ${top + len} C${x + w * 0.16} ${top + len * 0.82} ${x + w * 0.42} ${top + len * 0.62} ${x + w / 2} ${top} Z`;
    for (let i = 0; i < 26; i++) {
      const k = rand();
      const r = 7 + rand() * 13 * (1 - k * 0.65);
      coins += ell(x + (rand() - 0.5) * w * (1 - k * 0.8), top + k * len, r, r * 0.84);
    }
  }
  return { stem, coins };
}

/** Somebody who borrowed before, held in the crust and still paying. */
function borrower(path: string, x: number, y: number, scale: number, seed: number, flip = false) {
  const rand = seeded(seed);
  let coins = "";
  for (let i = 0; i < 90; i++) {
    const r = 7 + rand() * 13;
    coins += ell(-150 + rand() * 300, -150 + rand() * 300, r, r * 0.84);
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <path className="usury-sink-borrower" d={path} />
      <g clipPath="url(#usury-borrower-clip)">
        <path className="usury-sink-crust-body" d={coins} />
        <path className="usury-sink-crust-lit" d={coins} transform="translate(-4 -5) scale(0.6)" />
      </g>
    </g>
  );
}

/** A bowed shoulder and head, a horn, an open hand. */
const SHOULDER =
  "M-150 150 C-150 30 -96 -34 -30 -54 C-36 -104 -6 -140 36 -140 C84 -140 114 -102 108 -56 C160 -34 186 22 186 150 Z";
const HORN = "M-70 150 C-80 40 -50 -60 30 -130 C10 -40 30 40 70 150 Z";
const HAND =
  "M-60 150 L-60 20 C-60 -6 -30 -6 -30 20 L-30 -40 C-30 -70 0 -70 0 -40 L0 -56 C0 -86 30 -86 30 -56 L30 -20 C30 -50 58 -50 58 -20 L58 60 C58 120 30 150 0 150 Z";

const CRUSTS = crust();
const SHINGLE = shingle();
const DRIPS = drips();

function Sink() {
  return (
    <svg className="cine-bg-svg usury-sink" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="usury-deep" cx="0.5" cy="0.56" r="0.58">
          <stop offset="0" stopColor="#2c1a12" />
          <stop offset="0.5" stopColor="#170e0a" />
          <stop offset="1" stopColor={SOOT} />
        </radialGradient>
        <linearGradient id="usury-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2116" />
          <stop offset="1" stopColor="#120a07" />
        </linearGradient>
        <radialGradient id="usury-pool" cx="0.5" cy="0.62" r="0.4">
          <stop offset="0" stopColor={COPPER} stopOpacity="0.26" />
          <stop offset="1" stopColor={COPPER} stopOpacity="0" />
        </radialGradient>
        <clipPath id="usury-borrower-clip">
          <rect x="-190" y="-190" width="380" height="350" />
        </clipPath>
      </defs>
      {/* The dark inside the hole, and the low pool of copper light in it. */}
      <rect x="-800" y="-450" width="3200" height="1800" fill="url(#usury-deep)" />
      <rect x="-800" y="60" width="3200" height="1100" fill="url(#usury-pool)" />
      {/* Crust that has run off the roof and set. */}
      <path className="usury-sink-drip" d={DRIPS.stem} />
      <path className="usury-sink-crust-body" d={DRIPS.coins} />
      {/* Borrowers, held in the crust to either side. */}
      {borrower(SHOULDER, -120, 700, 1.7, 71)}
      {borrower(HORN, 1980, 760, 1.5, 33, true)}
      {borrower(HAND, 1840, 330, 0.9, 12)}
      {/* The crust on the rock. */}
      <path className="usury-sink-crust-deep" d={CRUSTS.deep} />
      <path className="usury-sink-crust-body" d={CRUSTS.body} />
      <path className="usury-sink-crust-lit" d={CRUSTS.lit} />
      {/* The rock the hole is in, over the crust that hangs off its edge. */}
      <path className="usury-sink-rock" d={ROCK} fillRule="evenodd" />
      {/* The shingle floor. */}
      <rect x="-800" y={FLOOR - 6} width="3200" height="560" fill="url(#usury-floor)" />
      <path className="usury-sink-shingle" d={SHINGLE.body} />
      <path className="usury-sink-shingle-lit" d={SHINGLE.lit} />
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "usury-sink": () => <Sink />,
};
