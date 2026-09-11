import type { Effect } from "../../shared/model";
import { tacticalIntents } from "../../content/enemies";
import { treasuryBarrier } from "../combat-presentation";
import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-debt.css";

/**
 * The Miser.
 *
 * The Collector is a creditor who takes; this is a hoarder who keeps. It is
 * drawn as a hunched toad squatting in a heap of coins, counting — one long
 * arm always held out over the stacks in front of it, ending in a hand too big
 * for it, a jeweller's loupe screwed into one bulging eye, a wide lipless
 * mouth with one gold tooth, and across its back a shawl sewn with coins.
 *
 * It is deliberately a creature and not an old man. A gold-counting miser with
 * a hooked nose and a skullcap is an ugly caricature with a long history, and
 * the first sketch of this drifted towards it; the toad's head was the fix.
 * Everything since has pushed further from a person: olive, warted skin, a
 * throat sac, eyes on domes with a toad's flat pupil, a blunt snout with a
 * pinhole for a nostril, and four fingers ending in round pads.
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
 * spine, and a broad flat head juts forward with two eye domes on top. What
 * breaks the outline, the way the key breaks the Collector's, is the hand:
 * four long knuckled fingers splayed over the stacks with daylight between
 * them, each ending in a round bulb, on a thin arm held clear of the jaw.
 * Raised over its head in a wind-up it is the whole threat. No hood, no crown,
 * no key: none of the Collector's shapes.
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

/**
 * The hand's four fingers, knuckled, splayed and hanging, and the pads at
 * their tips. Hovering just over the tallest stack, never quite resting.
 */
const FINGERS = [
  "M12 65 L4.6 69.6 L1.8 77.6",
  "M13.8 68.4 L8.6 74 L7.6 81.4",
  "M17.6 69.4 L16.2 76 L16.8 83",
  "M21.6 68 L25.4 73.4 L27.6 80",
];
const PADS: [number, number][] = [
  [1.8, 77.6],
  [7.6, 81.4],
  [16.8, 83],
  [27.6, 80],
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
          <stop offset="0" stopColor="#aaa162" />
          <stop offset="0.55" stopColor="#737042" />
          <stop offset="1" stopColor="#3e3d27" />
        </linearGradient>
        <linearGradient id="msr-finger" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a8450" />
          <stop offset="1" stopColor="#5e5b36" />
        </linearGradient>
        <linearGradient id="msr-throat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2cf88" />
          <stop offset="1" stopColor="#b49a52" />
        </linearGradient>
        <radialGradient id="msr-iris" cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#ffe89a" />
          <stop offset="1" stopColor="#c7861f" />
        </radialGradient>
        <linearGradient id="msr-brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9b066" />
          <stop offset="1" stopColor="#7c5722" />
        </linearGradient>
        <radialGradient id="msr-lens-glow">
          <stop offset="0" stopColor="#e6f6b4" stopOpacity="0.7" />
          <stop offset="1" stopColor="#c9e27a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="msr-lens-hot">
          <stop offset="0" stopColor="#ffb07a" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ff6a2e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="msr-halo">
          <stop offset="0.45" stopColor="#ffd36a" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffb24a" stopOpacity="0" />
        </radialGradient>
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
        {/* The glow of banked Barrier: soft shapes behind the set coins, one
            group so the whole shawl pulses as one layer, never a filter */}
        <g className="msr-halos ph-glow">
          {SETTINGS.map(([x, y, r], i) =>
            set.has(i) ? (
              <circle key={i} cx={x} cy={y} r={r + 2.6} fill="url(#msr-halo)" />
            ) : null,
          )}
        </g>
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

      {/* ---- head: a toad's — broad, flat, bulge-eyed, a loupe in one eye ---- */}
      <g
        ref={hold("head")}
        data-part="head"
        style={{ transformOrigin: "40px 42px" }}
      >
        {/* A short thick neck: toads have next to none */}
        <path
          d="M33 33 L46 37 L46 53 L34 51 Z"
          fill="#4c4a2c"
          stroke="#171420"
          strokeWidth="1.4"
        />
        {/* Everything above the neck sits high, so there is daylight
            between the jaw and the hand below it */}
        <g transform="translate(-1 -5)">
          {/* The far eye, bulging up behind the skull: gold, a toad's flat bar
            of a pupil, a heavy lid half down over it */}
          <circle
            cx="36"
            cy="22.6"
            r="6.2"
            fill="url(#msr-skin)"
            stroke="#171420"
            strokeWidth="1.8"
          />
          <ellipse
            cx="35.2"
            cy="23"
            rx="3.9"
            ry="3.4"
            fill="url(#msr-iris)"
            stroke="#171420"
            strokeWidth="0.8"
          />
          <rect
            x="32.2"
            y="22.6"
            width="6"
            height="1.2"
            rx="0.6"
            fill="#171420"
          />
          <path
            d="M30.2 21.4 C31.4 16.4 40.4 15.8 41.8 21 C38.4 19.4 33.8 19.4 30.2 21.4 Z"
            fill="url(#msr-skin)"
            stroke="#171420"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* The inside of the mouth, seen only when the jaw drops */}
          <path d="M8 41.5 L38 45.6 L35 52 L13 50 Z" fill="#2b1419" />
          {/* The jaw: hinged, heavy, a pale throat sac sagging under it */}
          <g
            ref={hold("jaw")}
            data-part="jaw"
            className="msr-jaw"
            style={{ transformOrigin: "36px 45px" }}
          >
            <path
              d="M7.4 41.6 C5.8 44 6.8 47 10 48.4 C14 50.4 17 55.4 24 57 C31 58 37 54.6 38.8 49.4 C39.4 47.6 39 46.2 37.6 45.6 C28 44.6 17 43 7.4 41.6 Z"
              fill="url(#msr-skin)"
              stroke="#171420"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M12.6 48.6 C17 53.6 21.6 56.2 26.6 56.2 C31.6 56 35.6 53 37.4 48.8 C29.4 49.8 20 49.8 12.6 48.6 Z"
              fill="url(#msr-throat)"
            />
            <g stroke="#9a8646" strokeWidth="0.8" fill="none">
              <path d="M17 51.6 C21 53.4 26 53.8 31 53" />
              <path d="M21 54.6 C24 55.4 28 55.4 31.4 54.6" />
            </g>
          </g>
          {/* The skull: broad and flat, a blunt rounded snout */}
          <path
            d="M7.4 41.6 C4.6 40.6 4 37 6 34.4 C9 30.4 14 27.4 20 26.4 C27 25.4 34 25.4 39 28 C43 30 45 35 44 40 C43.4 43.4 41 45.4 37.6 45.6 C28 44.6 17 43 7.4 41.6 Z"
            fill="url(#msr-skin)"
            stroke="#171420"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
          {/* A lit ridge along the top of the snout */}
          <path
            d="M8 33.4 C11 30.4 15 28.6 19 27.8"
            stroke="#cdc486"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* The poison gland behind the eye, and warts */}
          <ellipse
            cx="37.4"
            cy="34.4"
            rx="5.4"
            ry="3.2"
            transform="rotate(18 37.4 34.4)"
            fill="#8c864c"
            stroke="#171420"
            strokeWidth="1"
          />
          {[
            [34.6, 33.6],
            [37.4, 35],
            [40, 34.2],
          ].map(([x, y]) => (
            <circle key={`${x}`} cx={x} cy={y} r="0.6" fill="#3b3a26" />
          ))}
          {[
            [14, 34.4, 1.1],
            [19.6, 37.8, 1],
            [25.8, 35.8, 1.2],
            [30.4, 39.6, 0.9],
            [29, 30.6, 0.9],
            [10.4, 38.4, 0.7],
            [22.6, 31.4, 0.8],
          ].map(([x, y, r]) => (
            <g key={`${x}`}>
              <circle cx={x} cy={y} r={r} fill="#4c4a2c" />
              <circle
                cx={x - r * 0.3}
                cy={y - r * 0.3}
                r={r * 0.38}
                fill="#d6cd90"
              />
            </g>
          ))}
          {/* The wide, grim mouth, turned down at the corner; one gold tooth */}
          <path
            d="M7.4 41.6 C17 43 28 44.6 37.6 45.6 L40.4 48.8"
            stroke="#171420"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
          />
          <rect
            x="15.2"
            y="42.2"
            width="2.4"
            height="3.2"
            rx="0.4"
            fill="url(#msr-gold)"
            stroke="#3e2810"
            strokeWidth="0.6"
          />
          {/* A nostril: a pinhole on the snout, nothing more */}
          <ellipse cx="8.6" cy="35.2" rx="0.9" ry="0.6" fill="#171420" />
          {/* The near eye, a bulge on top of the head with the loupe screwed
            into it, tipped down at whatever it is counting */}
          <circle
            cx="21"
            cy="25.4"
            r="7"
            fill="url(#msr-skin)"
            stroke="#171420"
            strokeWidth="1.9"
          />
          <path
            d="M15.6 21.6 C18 18.8 23 18.4 26 20.6"
            stroke="#cdc486"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* The loupe: a short brass cup screwed into the eye, the lens
              at its end tipped down at the coins */}
          <g transform="rotate(-12 21 25.4)">
            <ellipse
              className="msr-lens-glow ph-glow"
              cx="11"
              cy="25.4"
              rx="5.4"
              ry="7.6"
            />
            <path
              d="M21 20.2 L13.6 21.4 L13.6 29.4 L21 30.6 Z"
              fill="url(#msr-brass)"
              stroke="#171420"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path d="M14.6 22.4 L20 21.4" stroke="#f0d08a" strokeWidth="0.8" />
            <ellipse
              cx="13"
              cy="25.4"
              rx="2"
              ry="4.6"
              fill="#d7ad5d"
              stroke="#171420"
              strokeWidth="1.1"
            />
            <ellipse
              className="msr-lens"
              cx="12.6"
              cy="25.4"
              rx="1.2"
              ry="3.3"
            />
          </g>
        </g>
      </g>

      {/* ---- hand: the long arm, and a hand too big for it, always reaching
          for the stacks. Four long knuckled fingers with round toad pads:
          the one shape that tells this silhouette from any other ---- */}
      <g
        ref={hold("hand")}
        data-part="hand"
        style={{ transformOrigin: "44px 50px" }}
      >
        {/* Sleeve, frayed at the elbow */}
        <path
          d="M41 45 C47 48.6 48 56 44 61 L38 66 L36 63.6 L33.6 65.6 L31.4 61 L36 53 Z"
          fill="url(#msr-coat)"
          stroke="#171420"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Bony forearm, held out level */}
        <path
          d="M33 62.6 L20 62"
          stroke="#171420"
          strokeWidth="5.6"
          strokeLinecap="round"
        />
        <path
          d="M33 62.6 L20 62"
          stroke="#7a7646"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        {/* The fingers, splayed and hanging over the coins like a spider */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <g stroke="#171420" strokeWidth="5">
            {FINGERS.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
          <g stroke="url(#msr-finger)" strokeWidth="3">
            {FINGERS.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </g>
        {/* The palm, over the roots of the fingers */}
        <path
          d="M21.4 58.4 C16.4 57.4 11 59.4 10 64 C9.4 67.4 11.6 70 15.4 70.4 C19.8 70.8 24.2 69 24.8 65 C25.2 62 23.8 59.4 21.4 58.4 Z"
          fill="url(#msr-skin)"
          stroke="#171420"
          strokeWidth="1.6"
        />
        <path
          d="M12.4 62 C14.6 60 17.8 59.4 20.6 60"
          stroke="#cdc486"
          strokeWidth="0.9"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Round toad pads on the fingertips: in silhouette, the four bulbs
            are what make it a toad's hand and not a man's */}
        {PADS.map(([x, y]) => (
          <circle
            key={`${x}`}
            cx={x}
            cy={y}
            r="2.8"
            fill="#b3aa6a"
            stroke="#171420"
            strokeWidth="1.2"
          />
        ))}
        {/* Rings, on the fingers it could get them onto */}
        <path
          d="M8.8 71 L12.2 73.4 M14.8 74 L18.6 74.6"
          stroke="#f0c860"
          strokeWidth="1.7"
        />
      </g>
    </svg>
  );
}
