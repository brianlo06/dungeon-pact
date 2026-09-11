import type { Effect } from "../../shared/model";
import { tacticalIntents } from "../../content/enemies";
import { treasuryBarrier } from "../combat-presentation";
import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-debt.css";

/**
 * The Miser.
 *
 * The Collector is a creditor who takes; this is a hoarder who keeps. It is
 * drawn as a hunched, toad-headed thing squatting in a heap of coins, counting
 * — one long arm always reaching down to the stacks in front of it, a
 * jeweller's loupe screwed into one eye, a wide lipless mouth with one gold
 * tooth, and across its back a shawl sewn with coins.
 *
 * It is deliberately a creature and not an old man. A gold-counting miser with
 * a hooked nose and a skullcap is an ugly caricature with a long history, and
 * the first sketch of this drifted towards it; the toad's head was the fix.
 *
 * The shawl is the objective. It shields itself with whatever gold the pact
 * still holds, so the coins on its back are the party's own treasury: the
 * richer the pact, the more settings are filled, the more coins stand on edge
 * along its spine, and the deeper the heap it sits in. A party that spent its
 * money faces a bare, moth-eaten thing with empty settings and a bony back; a
 * party that hoarded faces something armoured and crested in gold. The state
 * reads before anyone reads the barrier number.
 *
 * Silhouette: low, wide and back-heavy — the opposite of the Collector's tall
 * wedge. The mass is a hump high on the right with a crest of coins along its
 * spine; a wide flat head juts forward and low, the loupe breaking its
 * outline; a long thin arm reaches down-forward to the stacks, with real
 * negative space between arm, knee and body. No hood, no crown, no key: none
 * of the Collector's shapes.
 */
const PARTS = [
  "body",
  "shawl",
  "hoard",
  "stacks",
  "head",
  "jaw",
  "hand",
] as const;

/** What the Miser banks off the treasury, straight from its content. */
const BANK = (tacticalIntents.miser ?? [])
  .flatMap((a) => a.effects)
  .find((e): e is Extract<Effect, { kind: "bank" }> => e.kind === "bank") ?? {
  kind: "bank" as const,
  per: 12,
  free: 160,
};
/** Barrier at which the shawl is fully set. */
const FULL = 40;

/** Coin settings on the shawl, top row first so lower rows overlap upper. */
const SETTINGS: [number, number, number][] = [
  [58, 22, 3.4],
  [66, 20, 3.4],
  [74, 22, 3.4],
  [81, 27, 3.4],
  [52, 30, 3.8],
  [61, 28, 3.8],
  [70, 29, 3.8],
  [79, 32, 3.8],
  [86, 38, 3.6],
  [48, 40, 4],
  [57, 37, 4],
  [66, 37, 4],
  [75, 39, 4],
  [84, 44, 4],
  [90, 51, 3.8],
  [51, 50, 4.2],
  [61, 49, 4.2],
  [71, 50, 4.2],
  [81, 53, 4.2],
  [90, 59, 4],
];
/** The order settings fill in as the treasury grows: the middle first. */
const FILL = [
  11, 12, 10, 16, 17, 6, 13, 5, 15, 18, 7, 1, 9, 14, 2, 4, 19, 8, 0, 3,
];

/** Coins stood on edge along the spine: the crest a hoard grows. */
const CREST: [number, number, number, number][] = [
  [50, 24, -46, 6],
  [56, 19, -24, 7.5],
  [63, 16.5, -2, 6.5],
  [70, 16, 14, 8],
  [77, 18.4, 22, 6],
  [84, 23.6, 44, 7],
  [89.6, 31, 58, 5.5],
];

export type Hoard = "bare" | "lined" | "hoarding";

export function Miser({
  unitId,
  animators,
  className = "",
  treasury = 0,
  barrier = 0,
}: CreatureProps & {
  /** The pact's gold. What the Miser is armoured in. */
  treasury?: number;
  /** Barrier it is holding right now, from gold it has already banked. */
  barrier?: number;
}) {
  const hold = useRigParts(unitId, animators, PARTS);
  const shield = treasuryBarrier(treasury, BANK);
  const level = Math.min(1, shield / FULL);
  const set = new Set(FILL.slice(0, Math.ceil(level * SETTINGS.length)));
  // The crest only grows once the shawl is half full: it is the flourish.
  const crest = Math.max(0, Math.round(((level - 0.35) / 0.65) * CREST.length));
  const hoard: Hoard =
    shield <= 0 ? "bare" : shield < 20 ? "lined" : "hoarding";
  // The heap it sits in and the stacks it counts grow with the treasury too.
  const heap = 0.4 + 0.6 * level;
  const stacks = [
    1 + Math.round(level * 6),
    1 + Math.round(level * 3),
    Math.round(level * 2),
  ];

  return (
    <svg
      className={`miser ${className}`}
      viewBox="0 0 100 100"
      role="img"
      data-hoard={hoard}
      data-shield={shield}
      data-banked={barrier > 0 ? "" : undefined}
      aria-label={`The Miser, ${hoard}: ${shield} Barrier from ${treasury} gold`}
    >
      <defs>
        <linearGradient id="msr-coat" x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#5f554c" />
          <stop offset="0.5" stopColor="#3c342e" />
          <stop offset="1" stopColor="#201b19" />
        </linearGradient>
        <linearGradient id="msr-cloth" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#62395a" />
          <stop offset="1" stopColor="#2a1729" />
        </linearGradient>
        <linearGradient id="msr-skin" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#c9b7a2" />
          <stop offset="0.6" stopColor="#937e76" />
          <stop offset="1" stopColor="#56444a" />
        </linearGradient>
        <linearGradient id="msr-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8dc8e" />
          <stop offset="0.55" stopColor="#d8a543" />
          <stop offset="1" stopColor="#8c5f21" />
        </linearGradient>
        <linearGradient id="msr-heap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d7a746" />
          <stop offset="1" stopColor="#6a4619" />
        </linearGradient>
      </defs>

      {/* ---- body: a hunched coat, a drawn-up knee, a long-toed foot ---- */}
      <g
        ref={hold("body")}
        data-part="body"
        style={{ transformOrigin: "66px 90px" }}
      >
        <path
          d="M42 46 C43 30 52 17 64 16 C80 15 90 26 92 40 C93.4 50 90 58 91 66 C92 74 98 80 100 91 L52 90 C49 82 47 74 46 66 C44 58 41 52 42 46 Z"
          fill="url(#msr-coat)"
          stroke="#171420"
          strokeWidth="2.4"
        />
        {/* The drawn-up knee and a bony shin, squatting */}
        <path
          d="M66 70 C58 64 50 62 45 65 C42 67 42 71 44 73 L46 88 L52 88 L52 74 C58 76 64 77 68 76 Z"
          fill="url(#msr-coat)"
          stroke="#171420"
          strokeWidth="1.8"
        />
        <path
          d="M45 74 L46 88 L51 88 L51 76 Z"
          fill="url(#msr-skin)"
          stroke="#171420"
          strokeWidth="1.2"
        />
        {/* The foot: long-toed, gripping the coins */}
        <path
          d="M52 86 C52 90 51 92 49 94 L37 95 C35 93 37 91 41 91 L45 90 C45 88 46 86 46 85 Z"
          fill="url(#msr-skin)"
          stroke="#171420"
          strokeWidth="1.5"
        />
        <path
          d="M40 95 v-2.4 M44 95 v-2.8"
          stroke="#171420"
          strokeWidth="0.8"
        />
        {/* A darned patch: the coat is kept, not cared for */}
        <path
          d="M79 71 L89 70 L90 79 L80 80 Z"
          fill="#4b4138"
          stroke="#8a7b6a"
          strokeWidth="0.7"
          strokeDasharray="1.4 1"
        />
      </g>

      {/* ---- shawl: the pact's gold, sewn into armour, crested on the spine ---- */}
      <g
        ref={hold("shawl")}
        data-part="shawl"
        style={{ transformOrigin: "64px 24px" }}
      >
        {CREST.map(([x, y, a, h], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
            {i < crest ? (
              // A coin wedged on edge: narrow, round-ended, a bright rim.
              <g className="msr-crest" data-lit="">
                <rect
                  x="-2.1"
                  y={-h}
                  width="4.2"
                  height={h + 2}
                  rx="1.8"
                  fill="url(#msr-gold)"
                  stroke="#171420"
                  strokeWidth="1"
                />
                <path
                  d={`M-0.6 ${1.4 - h} V0.4`}
                  stroke="#fbe6a8"
                  strokeWidth="0.7"
                />
              </g>
            ) : (
              // No coin there: a knuckle of spine showing through the rag.
              <ellipse
                className="msr-crest"
                cx="0"
                cy="-0.6"
                rx="2.2"
                ry="1.8"
                fill="#a39597"
                stroke="#171420"
                strokeWidth="1"
              />
            )}
          </g>
        ))}
        <path
          d="M42 48 C43 31 52 18 64 17 C79 16 89 27 91.6 40 C93 48 93 56 93.6 62 L89.6 64 L85 61 L80 63 L75 59 L70 61 L65 57 L60 59 L55 55 L50 57 L45 53 Z"
          fill="url(#msr-cloth)"
          stroke="#171420"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* A lit edge along the top, so the hump separates from the room */}
        <path
          d="M46 34 C50 24 56 19 64 19 C75 18 84 25 88 34"
          stroke="#8f5f84"
          strokeWidth="1.3"
          fill="none"
          opacity="0.8"
        />
        {SETTINGS.map(([x, y, r], i) => (
          <g
            key={i}
            className="msr-coin"
            data-lit={set.has(i) ? "" : undefined}
            transform={`translate(${x} ${y})`}
          >
            <circle className="msr-coin-face" r={r} />
            <circle className="msr-coin-rim" r={r * 0.58} />
          </g>
        ))}
      </g>

      {/* ---- hoard: the heap it sits in, deeper the richer the pact ---- */}
      <g
        ref={hold("hoard")}
        data-part="hoard"
        style={{ transformOrigin: "60px 97px" }}
      >
        <g
          transform={`translate(0 ${(97 * (1 - heap)).toFixed(2)}) scale(1 ${heap.toFixed(3)})`}
        >
          <path
            d="M24 97 C27 88 36 83 48 81 C58 78 70 77 82 79 C92 81 98 88 100 97 Z"
            fill="url(#msr-heap)"
            stroke="#171420"
            strokeWidth="2"
          />
          {[
            [34, 88],
            [42, 85],
            [51, 83],
            [60, 81],
            [69, 80],
            [78, 81],
            [87, 84],
            [94, 89],
            [39, 93],
            [49, 90],
            [60, 88],
            [71, 86],
            [82, 89],
            [91, 94],
            [55, 94],
            [74, 93],
          ].map(([x, y], i) => (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx="3.4"
              ry="1.3"
              fill={i % 3 ? "#e5bb5c" : "#f6d98c"}
              stroke="#5a3a14"
              strokeWidth="0.6"
            />
          ))}
        </g>
      </g>

      {/* ---- stacks: what it is counting, in front of it ---- */}
      <g
        ref={hold("stacks")}
        data-part="stacks"
        style={{ transformOrigin: "14px 97px" }}
      >
        {stacks.map((n, s) =>
          Array.from({ length: n }, (_, i) => (
            <rect
              key={`${s}-${i}`}
              x={3 + s * 8}
              y={94.4 - i * 2.3}
              width="7.4"
              height="2.6"
              rx="1"
              fill={i % 2 ? "#d9a948" : "#f2cf7a"}
              stroke="#3e2810"
              strokeWidth="0.7"
            />
          )),
        )}
      </g>

      {/* ---- head: wide, flat and toad-like, a loupe for an eye ---- */}
      <g
        ref={hold("head")}
        data-part="head"
        style={{ transformOrigin: "40px 46px" }}
      >
        {/* Neck, thin and craned forward out of the collar */}
        <path
          d="M36 41 L46 45 L45 52 L34 49 Z"
          fill="#7a666a"
          stroke="#171420"
          strokeWidth="1.4"
        />
        {/* The inside of the mouth, seen only when the jaw drops */}
        <path d="M12.6 43.8 L36 46 L33 52 L16 50.4 Z" fill="#2b1419" />
        {/* The jaw: hinged, heavy, a throat sac sagging under it */}
        <g
          ref={hold("jaw")}
          data-part="jaw"
          className="msr-jaw"
          style={{ transformOrigin: "35px 46px" }}
        >
          <path
            d="M12.6 43.8 C11.4 46 12 48.4 15 49.6 C19 51.6 23 54.6 28.4 54.6 C33 54.4 36.4 51.6 36.4 46 Z"
            fill="url(#msr-skin)"
            stroke="#171420"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <g stroke="#6e5a5e" strokeWidth="0.8" fill="none">
            <path d="M17 50 C20 51.6 23 52.4 27 52.4" />
          </g>
          <path
            d="M13.6 45 C20 45.8 28 46.6 35 47"
            stroke="#d9c9b4"
            strokeWidth="0.6"
            fill="none"
            opacity="0.7"
          />
        </g>
        <path
          d="M41 40 C41 35 39 31 36 30 C35 27 32 26 30 27.6 C28 28.6 27 28.6 26 27.4 C24 24.6 19 24.4 17 27.4 C15 29.6 13 32 11.6 35.6 C10.6 38 10 40.4 10.6 42.4 C11 43.4 12 43.8 13 43.8 C21 44.4 29 45 36 46 C39 45.4 41 43 41 40 Z"
          fill="url(#msr-skin)"
          stroke="#171420"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Wrinkled brow round the socket, a far eye squinting */}
        <g stroke="#6e5a5e" strokeWidth="0.8" fill="none">
          <path d="M15.4 33.4 C18 31.6 22 31.4 25.4 32.6" />
          <path d="M27 30.4 C28 31.6 28.4 33 28 34.4" />
        </g>
        <path
          d="M31 29.6 C32.4 28.8 34 29 35 30"
          stroke="#171420"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="33" cy="30.4" r="0.6" fill="#e6f6b4" />
        {/* The wide, grim mouth, turned down at the corner; one gold tooth */}
        <path
          d="M12.8 43.8 C21 44.4 29 45 34.6 45.8 L37 48.4"
          stroke="#171420"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="18" y="44" width="1.9" height="2.1" fill="#f2cf72" />
        {/* Slit nostril, an ear-drum, warts */}
        <path d="M11.2 37.8 l1.8 -0.7" stroke="#171420" strokeWidth="0.9" />
        <circle
          cx="36"
          cy="37.6"
          r="2.1"
          fill="#8a7470"
          stroke="#5a4a4e"
          strokeWidth="0.8"
        />
        {[
          [25.6, 36.4, 1],
          [30.4, 40.4, 0.8],
          [39, 33.8, 0.8],
          [16.6, 38.8, 0.7],
          [22, 41, 0.7],
          [33.6, 34, 0.6],
        ].map(([x, y, r]) => (
          <g key={`${x}`}>
            <circle cx={x} cy={y} r={r} fill="#6a565a" />
            <circle
              cx={x - r * 0.3}
              cy={y - r * 0.3}
              r={r * 0.35}
              fill="#d7c6b2"
            />
          </g>
        ))}
        {/* A second lens, flipped up on its hinge: a jeweller's headband */}
        <path
          d="M25 27 L19.4 17.4"
          stroke="#171420"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M25 27 L19.4 17.4"
          stroke="#c9a45a"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle
          cx="18.4"
          cy="15.4"
          r="3.6"
          fill="#3a3040"
          stroke="#171420"
          strokeWidth="1.2"
        />
        <circle
          cx="18.4"
          cy="15.4"
          r="2.6"
          fill="none"
          stroke="#d7ad5d"
          strokeWidth="1.1"
        />
        <path d="M17 14 l1.4 -0.8" stroke="#e6f6b4" strokeWidth="0.8" />
        {/* The loupe, screwed into the near eye */}
        <g transform="translate(19.6 29.4) rotate(-6)">
          <rect
            x="-9.4"
            y="-3.4"
            width="10"
            height="6.8"
            fill="#a57f3e"
            stroke="#171420"
            strokeWidth="1.2"
          />
          <path d="M-8.4 -2.6 H-0.6" stroke="#e1bb6c" strokeWidth="0.8" />
          <rect
            x="-11.2"
            y="-4.2"
            width="2.3"
            height="8.4"
            fill="#d7ad5d"
            stroke="#171420"
            strokeWidth="0.9"
          />
          <ellipse className="msr-lens" cx="-11.2" cy="0" rx="1.4" ry="3.2" />
        </g>
      </g>

      {/* ---- hand: the long arm, always reaching for the stacks ---- */}
      <g
        ref={hold("hand")}
        data-part="hand"
        style={{ transformOrigin: "44px 50px" }}
      >
        {/* Sleeve, frayed at the elbow */}
        <path
          d="M42 46 C47 50 47 57 43 61 L36 66 L34 64 L32 66 L29 61 L36 54 Z"
          fill="url(#msr-coat)"
          stroke="#171420"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Bony forearm */}
        <path
          d="M32 64 L21 71"
          stroke="#171420"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M32 64 L21 71"
          stroke="#95888a"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        {/* The hand, too big, knuckled, rings on its fingers */}
        <path
          d="M24 67 C19 67 14 69 12 73 L5 82 L7.4 83.4 L12 77 L10.4 86 L13.2 86.4 L15.4 78 L16.4 86.6 L19.2 86.4 L19.4 77.6 L22.4 83 L24.8 82 L23.6 75 C25.6 73 26 70 24 67 Z"
          fill="url(#msr-skin)"
          stroke="#171420"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <rect
          x="11.1"
          y="80.4"
          width="3.2"
          height="1.5"
          fill="#f0c860"
          stroke="#3e2810"
          strokeWidth="0.4"
        />
        <rect
          x="16"
          y="80.8"
          width="3.2"
          height="1.5"
          fill="#f0c860"
          stroke="#3e2810"
          strokeWidth="0.4"
        />
      </g>
    </svg>
  );
}
