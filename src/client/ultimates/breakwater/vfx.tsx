import type { CSSProperties } from "react";
import { seeded, type VfxProps } from "../../cinematic/vfx";
import "./style.css";

/**
 * Breakwater's effects.
 *
 * Three drawings carry the film. The **tide**: the enemy's whole onslaught
 * as one wave of ink whose crest is made of blades. The **tally**: the dents
 * in the Aegis Knight's shield lighting one by one — every blow that ever
 * broke on it. And the **heater ripple**: the shield's own outline, repeated
 * outward, which is how the Aegis spreads over the party and how everything
 * it remembers goes back. The rest (the plume where the wave breaks, the
 * shard-burst on each enemy, the marks left on the board) are built from
 * those shapes, so the film has one shape language and it is the shield's.
 *
 * Like the shared vocabulary, everything moves on `--p`/`--pe`/`--pi`/`--pb`
 * written by the player each frame; nothing is random at runtime and nothing
 * is filtered.
 */

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

/** The Vanguard's heater shield, centred on its middle: 120 wide, 160 tall. */
export const HEATER = "M-60 -72 H60 V-14 C60 34 30 64 0 88 C-30 64 -60 34 -60 -14 Z";

/* ----------------------------------------------------------------- tide -- */

type P = [number, number];
type Seg = [P, P, P, P];

/**
 * The wave, clockwise from the far foot of its back. Local units: the origin
 * is where the lip will land, on the ground; the body runs off to the right,
 * the crest overhangs to the left and hooks back in on itself.
 */
const BACK: Seg[] = [
  [[1600, 60], [1600, -200], [1560, -380], [1440, -500]],
  [[1440, -500], [1180, -720], [700, -900], [260, -880]],
];
const CREST: Seg[] = [
  [[260, -880], [-20, -870], [-270, -770], [-310, -600]],
  [[-310, -600], [-340, -470], [-260, -390], [-170, -415]],
  [[-170, -415], [-100, -432], [-62, -492], [-104, -540]],
];
const BARREL: Seg[] = [
  [[-104, -540], [-30, -640], [100, -650], [170, -560]],
  [[170, -560], [240, -470], [255, -280], [195, -140]],
  [[195, -140], [140, -40], [40, 30], [-170, 60]],
];

const bez = ([a, b, c, d]: Seg, t: number): P => {
  const u = 1 - t;
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ];
};
const tangent = ([a, b, c, d]: Seg, t: number): P => {
  const u = 1 - t;
  return [
    3 * u * u * (b[0] - a[0]) + 6 * u * t * (c[0] - b[0]) + 3 * t * t * (d[0] - c[0]),
    3 * u * u * (b[1] - a[1]) + 6 * u * t * (c[1] - b[1]) + 3 * t * t * (d[1] - c[1]),
  ];
};
const segD = (segs: Seg[]) =>
  segs.map(([, b, c, d]) => `C${b[0]} ${b[1]} ${c[0]} ${c[1]} ${d[0]} ${d[1]}`).join(" ");

const OUTLINE = `M${BACK[0][0][0]} ${BACK[0][0][1]} ${segD(BACK)} ${segD(CREST)} ${segD(BARREL)} Z`;
/** The inside of the curl, lit: the hollow the silhouette stands against. */
const FACE = `M-104 -540 ${segD(BARREL)} L110 60 C220 -80 320 -330 300 -540 C270 -720 40 -740 -104 -540 Z`;
/** The crest line, as a stroke: foam made of light along the top and round the hook. */
const FOAM = `M1440 -500 ${segD(BACK.slice(1))} ${segD(CREST)}`;

/** A blade, pointing up its own −y, broken or whole. */
function bladePath(len: number, w: number, broken: boolean, rand: () => number) {
  const tip = broken
    ? `L${(w * 0.5).toFixed(1)} ${(-len * (0.82 + rand() * 0.1)).toFixed(1)} L${(w * 0.1).toFixed(1)} ${(-len * 0.9).toFixed(1)} L${(-w * 0.2).toFixed(1)} ${(-len * 0.78).toFixed(1)} L${(-w * 0.5).toFixed(1)} ${(-len * 0.86).toFixed(1)}`
    : `L0 ${(-len).toFixed(1)}`;
  return `M${(-w / 2).toFixed(1)} 0 L${(w / 2).toFixed(1)} 0 ${tip} Z`;
}

function crestBlades(seed: number) {
  const rand = seeded(seed);
  const out: { x: number; y: number; r: number; d: string; far: boolean }[] = [];
  const along = [
    [BACK[1], 9],
    [CREST[0], 10],
    [CREST[1], 4],
  ] as const;
  for (const [seg, n] of along)
    for (let i = 0; i < n; i++) {
      const t = (i + 0.3 + rand() * 0.4) / n;
      const [x, y] = bez(seg, t);
      const [dx, dy] = tangent(seg, t);
      // Outward, for a clockwise outline in screen space, is (−dy, dx); a
      // blade drawn up its −y turned by r points along (sin r, −cos r).
      const angle = (Math.atan2(-dy, -dx) * 180) / Math.PI + (rand() - 0.5) * 50;
      const len = 70 + rand() * 110;
      out.push({ x, y, r: angle, d: bladePath(len, 14 + rand() * 12, rand() < 0.45, rand), far: rand() < 0.3 });
    }
  return out;
}

const Tide = ({ cue, color }: VfxProps) => {
  const blades = crestBlades(cue.seed ?? 12);
  const rand = seeded((cue.seed ?? 12) + 5);
  const mode = String(cue.params?.mode ?? "rise");
  const shards = Array.from({ length: 22 }, () => ({
    x: -330 + rand() * 520,
    y: -900 + rand() * 520,
    r: rand() * 360,
    s: 0.8 + rand() * 1.6,
    dx: (rand() - 0.5) * 30,
    dy: -10 - rand() * 30,
  }));
  const streaks = Array.from({ length: 9 }, (_, i) => {
    const [x, y] = bez(BACK[1], 0.08 + i * 0.1);
    const bend = -70 - rand() * 60;
    const drop = 260 + rand() * 360;
    return `M${x.toFixed(0)} ${(y + 50).toFixed(0)} q${bend.toFixed(0)} ${(drop * 0.45).toFixed(0)} ${(bend * 0.4).toFixed(0)} ${drop.toFixed(0)}`;
  });
  return (
    <svg className="bw-tide" viewBox="-400 -1000 2100 1100" data-mode={mode} style={v({ "--c": color })}>
      <defs>
        <linearGradient id="bw-tide-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c3b42" />
          <stop offset="0.3" stopColor="#141c22" />
          <stop offset="1" stopColor="#05070a" />
        </linearGradient>
        <radialGradient id="bw-tide-face" cx="0.2" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#f4fbf8" />
          <stop offset="0.3" stopColor="#bfe7da" />
          <stop offset="0.7" stopColor={color} stopOpacity="0.55" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="bw-tide-blades bw-tide-far">
        {blades
          .filter((b) => b.far)
          .map((b, i) => (
            <path key={i} d={b.d} transform={`translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) rotate(${b.r.toFixed(1)}) scale(1.3)`} />
          ))}
      </g>
      <path className="bw-tide-body" d={OUTLINE} fill="url(#bw-tide-body)" />
      <path className="bw-tide-face" d={FACE} fill="url(#bw-tide-face)" />
      <g className="bw-tide-streaks">
        {streaks.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <path className="bw-tide-foam-glow" d={FOAM} stroke={color} />
      <path className="bw-tide-foam" d={FOAM} />
      <g className="bw-tide-blades">
        {blades
          .filter((b) => !b.far)
          .map((b, i) => (
            <path key={i} d={b.d} transform={`translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) rotate(${b.r.toFixed(1)})`} />
          ))}
      </g>
      <g className="bw-tide-shards">
        {shards.map((s, i) => (
          <path
            key={i}
            d="M0 -16 L7 9 L-6 6 Z"
            style={v({
              "--x": `${s.x.toFixed(0)}px`,
              "--y": `${s.y.toFixed(0)}px`,
              "--r": `${s.r.toFixed(0)}deg`,
              "--sc": s.s.toFixed(2),
              "--dx": `${s.dx.toFixed(0)}px`,
              "--dy": `${s.dy.toFixed(0)}px`,
            })}
          />
        ))}
      </g>
      <path className="bw-tide-ground" d="M-170 60 C-60 30 60 40 190 18 C420 -12 900 30 1600 40 L1600 90 L-170 90 Z" />
    </svg>
  );
};

/* ---------------------------------------------------------------- tally -- */

/** Where the dents are, as fractions of the shield face (0,0 top-left). */
const DENTS: [number, number, number][] = [
  [0.3, 0.2, 1.1],
  [0.74, 0.16, 0.8],
  [0.18, 0.46, 0.9],
  [0.62, 0.36, 1.2],
  [0.82, 0.42, 0.7],
  [0.38, 0.62, 1],
  [0.7, 0.6, 0.85],
  [0.5, 0.8, 0.9],
  [0.28, 0.33, 0.6],
];

const Tally = ({ cue, color }: VfxProps) => {
  const rand = seeded(cue.seed ?? 3);
  return (
    <div className="bw-tally" style={v({ "--c": color })}>
      {DENTS.map(([x, y, s], i) => {
        const cracks = Array.from({ length: 5 }, (_, k) => {
          const a = (k / 5) * Math.PI * 2 + rand() * 0.8;
          const l = 10 + rand() * 12;
          const m = l * 0.55;
          const bend = (rand() - 0.5) * 0.7;
          return `M${(Math.cos(a) * 5).toFixed(1)} ${(Math.sin(a) * 5).toFixed(1)} L${(Math.cos(a + bend) * m).toFixed(1)} ${(Math.sin(a + bend) * m).toFixed(1)} L${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l).toFixed(1)}`;
        }).join(" ");
        return (
          <svg
            key={i}
            className="bw-dent"
            viewBox="-30 -30 60 60"
            style={v({ left: `${x * 100}%`, top: `${y * 100}%`, "--d": ((i / DENTS.length) * 0.62 + 0.04).toFixed(3), "--ds": s })}
          >
            <circle className="bw-dent-glow" r="24" fill={color} />
            <path className="bw-dent-crack" d={cracks} stroke={color} />
            <ellipse className="bw-dent-pit" rx="6.5" ry="5" fill="#1d1016" />
            <path className="bw-dent-rim" d="M-6 3 A7 5.5 0 0 0 6 3" stroke="#fff4ea" />
            <circle className="bw-dent-ring" r="12" fill="none" stroke="#f2fff9" />
          </svg>
        );
      })}
    </div>
  );
};

/* ---------------------------------------------------------------- rings -- */

/** The shield's outline, rippling outward from it. */
const Rings = ({ cue, color }: VfxProps) => {
  const count = Number(cue.params?.count ?? 3);
  return (
    <svg className="bw-rings" viewBox="-200 -200 400 400" style={v({ "--c": color })}>
      {Array.from({ length: count }, (_, i) => (
        <path
          key={i}
          className="bw-ring"
          d={HEATER}
          stroke={i === 0 ? "#f2fff9" : color}
          style={v({ "--k": (i / count) * 0.5 })}
        />
      ))}
    </svg>
  );
};

/* ---------------------------------------------------------------- break -- */

/**
 * The wave meeting the shield. Not a star and not a ring: the blades in the
 * wave shatter. A white seam down the shield's face where it hit, a fan of
 * steel splinters thrown straight up and back off it, and behind them the
 * ink of the wave climbing the shield and falling away.
 */
const Break = ({ cue, color }: VfxProps) => {
  const rand = seeded(cue.seed ?? 7);
  const shards = Array.from({ length: 34 }, (_, i) => {
    // A fan from straight up to back over the enemy side, a few spilling left.
    const deg = i % 9 === 0 ? -118 + rand() * 18 : -96 + rand() * 70;
    const a = (deg * Math.PI) / 180;
    const dist = 240 + rand() * 560;
    const w = 7 + rand() * (i % 4 === 0 ? 26 : 12);
    return {
      x: (rand() - 0.5) * 40,
      y: -rand() * 260,
      dx: Math.cos(a) * dist,
      dy: Math.sin(a) * dist,
      r: deg + 90 + (rand() - 0.5) * 40,
      spin: (rand() - 0.5) * 420,
      w,
      l: w * (2.2 + rand() * 3),
      dark: rand() < 0.3,
    };
  });
  // A crown of spray: tapering jets fanned up off the contact, each ending in
  // a drop, drawn as one ink shape edged in white.
  const jets = Array.from({ length: 11 }, (_, i) => {
    const deg = -150 + (i / 10) * 125 + (rand() - 0.5) * 8;
    const a = (deg * Math.PI) / 180;
    const len = (i > 3 && i < 9 ? 420 : 250) + rand() * 220;
    const base = 22 + rand() * 14;
    const nx = -Math.sin(a);
    const ny = Math.cos(a);
    const bend = (rand() - 0.5) * 60;
    const tx = Math.cos(a) * len;
    const ty = Math.sin(a) * len;
    const mx = Math.cos(a) * len * 0.55 + nx * bend;
    const my = Math.sin(a) * len * 0.55 + ny * bend;
    const d =
      `M${(nx * base).toFixed(0)} ${(ny * base).toFixed(0)} ` +
      `Q${(mx + nx * base * 0.5).toFixed(0)} ${(my + ny * base * 0.5).toFixed(0)} ${tx.toFixed(0)} ${ty.toFixed(0)} ` +
      `Q${(mx - nx * base * 0.5).toFixed(0)} ${(my - ny * base * 0.5).toFixed(0)} ${(-nx * base).toFixed(0)} ${(-ny * base).toFixed(0)} Z`;
    const drop = { x: Math.cos(a) * (len + 40 + rand() * 50), y: Math.sin(a) * (len + 40 + rand() * 50), r: 9 + rand() * 12 };
    return { d, drop };
  });
  return (
    <div className="bw-break" style={v({ "--c": color })}>
      <svg className="bw-splash" viewBox="-300 -760 600 780">
        {jets.map((j, i) => (
          <path key={i} d={j.d} />
        ))}
        {jets.map((j, i) => (
          <circle key={`d${i}`} className="bw-splash-drop" cx={j.drop.x.toFixed(0)} cy={j.drop.y.toFixed(0)} r={j.drop.r.toFixed(0)} />
        ))}
      </svg>
      <b className="bw-flare" />
      {shards.map((s, i) => (
        <i
          key={i}
          className={s.dark ? "dark" : undefined}
          style={v({
            left: `${s.x.toFixed(0)}px`,
            top: `${s.y.toFixed(0)}px`,
            "--dx": `${s.dx.toFixed(0)}px`,
            "--dy": `${s.dy.toFixed(0)}px`,
            "--r": `${s.r.toFixed(0)}deg`,
            "--spin": `${s.spin.toFixed(0)}deg`,
            "--w": `${s.w.toFixed(1)}px`,
            "--l": `${s.l.toFixed(1)}px`,
          })}
        />
      ))}
      <b className="bw-seam" />
    </div>
  );
};

/* --------------------------------------------------------------- return -- */

/**
 * Everything the shield remembers, going back: heater ripples rolling across
 * the enemy line, and ahead of them the blows themselves, as lights.
 */
const Return = ({ cue, color }: VfxProps) => {
  const rand = seeded(cue.seed ?? 19);
  const blows = Array.from({ length: 9 }, (_, i) => ({
    y: -300 + rand() * 320,
    speed: 0.75 + rand() * 0.45,
    l: 90 + rand() * 140,
    d: (i / 9) * 0.25,
  }));
  return (
    <div className="bw-return" style={v({ "--c": color })}>
      {[0, 1, 2].map((i) => (
        <svg key={`r${i}`} className="bw-return-ring" viewBox="-80 -100 160 200" style={v({ "--k": i * 0.12 })}>
          <path d={HEATER} stroke={i ? color : "#f2fff9"} />
        </svg>
      ))}
      {blows.map((b, i) => (
        <i
          key={i}
          style={v({ "--y": `${b.y.toFixed(0)}px`, "--sp": b.speed.toFixed(2), "--l": `${b.l.toFixed(0)}px`, "--d": b.d.toFixed(2) })}
        />
      ))}
    </div>
  );
};

/** A blow landing on one enemy: splinters of a broken blade, and a ring. */
const Chip = ({ cue, color }: VfxProps) => {
  const rand = seeded(cue.seed ?? 23);
  return (
    <div className="bw-chip" style={v({ "--c": color })}>
      <b className="bw-chip-ring" />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (-70 + rand() * 120) * (Math.PI / 180);
        const dist = 90 + rand() * 170;
        return (
          <i
            key={i}
            style={v({
              "--dx": `${(Math.cos(a) * dist).toFixed(0)}px`,
              "--dy": `${(Math.sin(a) * dist).toFixed(0)}px`,
              "--r": `${((rand() - 0.5) * 600).toFixed(0)}deg`,
              "--w": `${(5 + rand() * 7).toFixed(1)}px`,
              "--l": `${(18 + rand() * 30).toFixed(1)}px`,
            })}
          />
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------ the board -- */

/** Over an ally: the Knight's mark. Its next blow belongs to the Aegis. */
const Link = ({ color }: VfxProps) => (
  <div className="bw-link" style={v({ "--c": color })}>
    <i className="bw-link-beam" />
    <svg className="bw-link-mark" viewBox="-80 -100 160 200">
      <path className="bw-link-outer" d={HEATER} stroke={color} />
      <path className="bw-link-inner" d={HEATER} transform="scale(0.55)" fill={color} />
      <path d="M0 -30 V40 M-22 -2 H22" stroke="#0c1a16" strokeWidth="10" strokeLinecap="round" transform="scale(0.55)" />
    </svg>
    <i className="bw-link-floor" />
  </div>
);

/** Over an enemy: a blade snapped in two. Its blows are Weak this round. */
const Snapped = ({ color }: VfxProps) => (
  <div className="bw-snapped" style={v({ "--c": color })}>
    <svg viewBox="-60 -90 120 180">
      <circle className="bw-snapped-badge" cy="-8" r="62" />
      <g className="bw-snapped-top">
        <path d="M-7 -80 L0 -90 L7 -80 L7 -12 L2 -4 L-3 -14 L-7 -8 Z" fill="#dfe6ea" stroke="#10151a" strokeWidth="4" strokeLinejoin="round" />
      </g>
      <g className="bw-snapped-bottom">
        <path d="M-7 4 L-2 -4 L3 6 L7 0 L7 40 L-7 40 Z" fill="#dfe6ea" stroke="#10151a" strokeWidth="4" strokeLinejoin="round" />
        <rect x="-22" y="40" width="44" height="9" rx="3" fill="#6d7a82" stroke="#10151a" strokeWidth="4" />
        <rect x="-5" y="49" width="10" height="24" fill="#4b3a2e" stroke="#10151a" strokeWidth="4" />
      </g>
      <path className="bw-snapped-spark" d="M-26 -6 L26 2" stroke={color} strokeWidth="5" strokeLinecap="round" />
    </svg>
  </div>
);

export const renderers = {
  "breakwater-tide": Tide,
  "breakwater-tally": Tally,
  "breakwater-rings": Rings,
  "breakwater-break": Break,
  "breakwater-return": Return,
  "breakwater-chip": Chip,
  "breakwater-link": Link,
  "breakwater-snapped": Snapped,
};
