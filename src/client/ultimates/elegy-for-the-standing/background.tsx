import type { ComponentType } from "react";
import { seeded } from "../../cinematic/vfx";
import "./style.css";

/**
 * Elegy for the Standing's space: the burying ground, dug the night before.
 *
 * A slope of raw clay under a flat white sky with no sun in it, so nothing
 * here casts a shadow. Rows of graves are dug and waiting, open pits with
 * their spoil heaped on the uphill side, pegged out with string, no stones and
 * no names yet; a line of black cypresses along the crest; a spade left
 * standing in a heap. It is the one film in a graveyard, and the one lit by
 * nothing: a grey, even light from everywhere, brightest at the horizon.
 *
 * Mourning's three grades are the palette — the black is the shadow's (the
 * film's own effect), the grey is this sky, the lilac is the Herald's flag —
 * and the rest is earth.
 *
 * Drawn on the 3200×1800 box of the other backgrounds (world units: the stage
 * is 0…1600 × 0…900). The horizon is at world y 470, so a standing figure in
 * a wide shot is cut against the pale sky from the waist up.
 */

export const HORIZON = 470;

/** A cypress: one tall flame of dark foliage, a little ragged at the edge. */
function cypress(x: number, base: number, h: number, w: number, seed: number) {
  const rand = seeded(seed);
  const steps = 9;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const k = i / steps;
    // Widest a third of the way up, closing to a point.
    const half = w * 0.5 * Math.sin(Math.min(1, k * 1.5 + 0.08) * Math.PI * 0.5) * (1 - k) ** 0.55;
    const y = base - k * h;
    left.push(`${(x - half - rand() * w * 0.1).toFixed(1)} ${y.toFixed(1)}`);
    right.unshift(`${(x + half + rand() * w * 0.1).toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${left.join(" L")} L${right.join(" L")} Z`;
}

const CYPRESSES = (() => {
  const rand = seeded(4211);
  const out: string[] = [];
  let x = -760;
  while (x < 2380) {
    const h = 150 + rand() * 210;
    out.push(cypress(x, HORIZON + 8 + rand() * 10, h, 34 + rand() * 26, Math.floor(rand() * 9000)));
    // In clumps: two or three close, then a gap.
    x += rand() < 0.62 ? 26 + rand() * 30 : 150 + rand() * 260;
  }
  return out.join(" ");
})();

interface Grave {
  x: number;
  y: number;
  /** Perspective scale: 1 at world y 900. */
  s: number;
  /** A spade stood in the heap. */
  spade: boolean;
}

/**
 * The graves, in rows running away up the slope. The middle of the stage is
 * kept clear, where the film puts the one grave that matters.
 */
const GRAVES = (() => {
  const rand = seeded(907);
  const out: Grave[] = [];
  const rows = 9;
  for (let r = 0; r < rows; r++) {
    const k = r / (rows - 1);
    // Far rows first; the nearest rows are bigger and fewer.
    const y = HORIZON + 26 + k * k * 880;
    const s = 0.14 + k * k * 1.05;
    const gap = 300 * s + 90;
    let x = -760 + rand() * gap;
    while (x < 2400) {
      const clear = y > 640 && y < 1040 && x > 180 && x < 1500;
      if (!clear && rand() < 0.8) out.push({ x, y, s, spade: rand() < 0.07 });
      x += gap * (0.9 + rand() * 0.35);
    }
  }
  return out;
})();

/** One open grave and its spoil heap, in the drawing's own perspective. */
function Pit({ g, i }: { g: Grave; i: number }) {
  const rand = seeded(1000 + i);
  const w = 210 * g.s;
  const d = 34 * g.s;
  const heap = 30 * g.s;
  const x = g.x;
  const y = g.y;
  // The heap: a lumpy ridge of clay along the far lip.
  let ridge = `M${(x - w * 0.62).toFixed(1)} ${(y - d * 0.55).toFixed(1)}`;
  for (let j = 1; j <= 6; j++) {
    const k = j / 6;
    ridge += ` L${(x - w * 0.62 + k * w * 1.24).toFixed(1)} ${(y - d * 0.55 - Math.sin(k * Math.PI) * heap * (0.75 + rand() * 0.5)).toFixed(1)}`;
  }
  ridge += ` L${(x + w * 0.66).toFixed(1)} ${(y - d * 0.4).toFixed(1)} Z`;
  const pit = `M${(x - w / 2).toFixed(1)} ${(y - d / 2).toFixed(1)} L${(x + w / 2).toFixed(1)} ${(y - d / 2).toFixed(1)} L${(x + w / 2 + d * 0.3).toFixed(1)} ${(y + d / 2).toFixed(1)} L${(x - w / 2 - d * 0.3).toFixed(1)} ${(y + d / 2).toFixed(1)} Z`;
  const wall = `M${(x - w / 2).toFixed(1)} ${(y - d / 2).toFixed(1)} L${(x + w / 2).toFixed(1)} ${(y - d / 2).toFixed(1)} L${(x + w / 2 - d * 0.1).toFixed(1)} ${(y + d * 0.1).toFixed(1)} L${(x - w / 2 + d * 0.1).toFixed(1)} ${(y + d * 0.1).toFixed(1)} Z`;
  return (
    <g>
      <path className="elegy-ground-heap" d={ridge} />
      <path className="elegy-ground-pit" d={pit} />
      <path className="elegy-ground-wall" d={wall} />
      {/* the pegs and string it was marked out with */}
      <path
        className="elegy-ground-string"
        d={`M${(x - w / 2 - d * 0.5).toFixed(1)} ${(y + d * 0.62).toFixed(1)} L${(x + w / 2 + d * 0.5).toFixed(1)} ${(y + d * 0.62).toFixed(1)}`}
        strokeWidth={Math.max(0.6, 1.6 * g.s)}
      />
      <path
        className="elegy-ground-peg"
        d={`M${(x - w / 2 - d * 0.5).toFixed(1)} ${(y + d * 0.62).toFixed(1)} v${(-12 * g.s).toFixed(1)} M${(x + w / 2 + d * 0.5).toFixed(1)} ${(y + d * 0.62).toFixed(1)} v${(-12 * g.s).toFixed(1)}`}
        strokeWidth={Math.max(1, 3.4 * g.s)}
      />
      {g.spade && (
        <g transform={`translate(${(x + w * 0.35).toFixed(1)} ${(y - d * 0.55 - heap * 0.7).toFixed(1)}) scale(${g.s.toFixed(3)}) rotate(9)`}>
          <path className="elegy-ground-haft" d="M0 -150 V10" strokeWidth={7} />
          <path className="elegy-ground-haft" d="M-14 -150 H14" strokeWidth={7} />
          <path className="elegy-ground-blade" d="M-17 6 H17 L14 52 Q0 62 -14 52 Z" />
        </g>
      )}
    </g>
  );
}

/** Clods and stones scattered on the clay, thicker nearer. */
const CLODS = (() => {
  const rand = seeded(3301);
  let d = "";
  for (let i = 0; i < 260; i++) {
    const k = rand();
    const y = HORIZON + 30 + k * k * 1300;
    const x = -800 + rand() * 3200;
    const r = 2 + k * k * 16 * (0.4 + rand());
    d += `M${(x - r).toFixed(1)} ${y.toFixed(1)} l${(r * 0.6).toFixed(1)} ${(-r * 0.7).toFixed(1)} l${(r * 1.1).toFixed(1)} ${(r * 0.1).toFixed(1)} l${(r * 0.4).toFixed(1)} ${(r * 0.6).toFixed(1)} Z `;
  }
  return d;
})();

function ElegyGround() {
  return (
    <svg className="cine-bg-svg elegy-ground" viewBox="-800 -450 3200 1800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="elegy-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5e636c" />
          <stop offset="0.45" stopColor="#9fa29f" />
          <stop offset="0.86" stopColor="#dcdcd4" />
          <stop offset="1" stopColor="#ecebe3" />
        </linearGradient>
        <radialGradient id="elegy-pale" cx="0.5" cy="1" r="0.6">
          <stop offset="0" stopColor="#f6f4ec" stopOpacity="0.8" />
          <stop offset="1" stopColor="#f6f4ec" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="elegy-clay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6f6258" />
          <stop offset="0.08" stopColor="#56463b" />
          <stop offset="0.4" stopColor="#35271f" />
          <stop offset="1" stopColor="#140e0b" />
        </linearGradient>
      </defs>
      <rect x="-800" y="-450" width="3200" height={HORIZON + 470} fill="url(#elegy-sky)" />
      <ellipse cx="1150" cy={HORIZON} rx="1500" ry="420" fill="url(#elegy-pale)" />
      {/* the crest: a long low slope, lighter with distance */}
      <path
        className="elegy-ground-crest"
        d={`M-800 ${HORIZON + 30} Q-200 ${HORIZON - 26} 500 ${HORIZON - 6} T1700 ${HORIZON - 14} T2400 ${HORIZON + 4} V1350 H-800 Z`}
      />
      <path className="elegy-ground-cypress" d={CYPRESSES} />
      <path
        d={`M-800 ${HORIZON + 30} Q-200 ${HORIZON + 4} 500 ${HORIZON + 22} T1700 ${HORIZON + 14} T2400 ${HORIZON + 30} V1350 H-800 Z`}
        fill="url(#elegy-clay)"
      />
      <path className="elegy-ground-clods" d={CLODS} />
      {GRAVES.map((g, i) => (
        <Pit key={i} g={g} i={i} />
      ))}
    </svg>
  );
}

export const backgrounds: Record<string, ComponentType> = {
  "elegy-ground": ElegyGround,
};
