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
 * for it, a jeweller's loupe screwed into its bulging eye, a wide lipless
 * mouth with one gold tooth, and across its back a shawl sewn with coins.
 *
 * It is deliberately a creature and not an old man. A gold-counting miser with
 * a hooked nose and a skullcap is an ugly caricature with a long history, and
 * the first sketch of this drifted towards it; the toad's head was the fix.
 * Everything since has pushed further from a person: olive, warted skin, a
 * throat sac, an eye bulging out of the top of the skull with a toad's flat
 * pupil, a blunt snout with a pinhole for a nostril, a mouth the whole length
 * of the head, and four fingers ending in round pads.
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
 * spine. The head is one clean shape, not a cluster: a long flat wedge
 * pointed at the party with a single half-round bulge of eye near the front
 * and a flat crown behind it — the toad's profile, readable filled black.
 * (Two eye domes, a loupe sticking out and a hanging throat made the earlier
 * head a lumpy knot; a whole round dome on its own read as a rat's ear.) What
 * breaks the outline, the way the key breaks the Collector's, is the hand:
 * four long knuckled fingers splayed over the stacks with daylight between
 * them, each ending in a round bulb, on a thin arm held clear of the jaw. The
 * stacks stop short of the pads, however rich the pact, so the hand never
 * merges with its money. Raised over its head in a wind-up, clear of the eye
 * and the crest, it is the whole threat. No hood, no crown, no key: none of
 * the Collector's shapes.
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
  // Capped so the tallest stops well short of the fingertips: pads resting on
  // the coins merged the hand and the stacks into one shape.
  const stacks = [
    1 + Math.round(level * 4),
    1 + Math.round(level * 3),
    Math.round(level * 3),
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

      {/* ---- head: a toad's, drawn as one clean shape — a long flat wedge
          pointed at the party with a single round eye dome on top. The loupe
          is screwed into the dome, inside its outline, so nothing else
          breaks the head's edge ---- */}
      <g
        ref={hold("head")}
        data-part="head"
        style={{ transformOrigin: "40px 42px" }}
      >
        {/* Everything is authored 3 units low and lifted as one, so there is
            daylight between the throat and the arm held out under it */}
        <g transform="translate(0 -3)">
          {/* A short thick neck: toads have next to none */}
          <path
            d="M34 34 L47 36 L47 57 L36 55 Z"
            fill="#4c4a2c"
            stroke="#171420"
            strokeWidth="1.4"
          />
          {/* The inside of the mouth, seen only when the jaw drops */}
          <path d="M4.6 41.2 L38.6 44.2 L35.6 50 L10 47.4 Z" fill="#2b1419" />
          {/* The jaw: hinged at the corner of the mouth. Its underside is a
              straight line from the chin back to a smooth swell of throat,
              so the head reads as a wedge, not a bag */}
          <g
            ref={hold("jaw")}
            data-part="jaw"
            className="msr-jaw"
            style={{ transformOrigin: "39px 44px" }}
          >
            <path
              d="M3.6 41 C3.4 43.2 5 44.6 8 45.6 L23 50.4 C30.4 52 37.4 50 40.4 46.6 C41.2 45.6 40.8 44.6 39.4 44.2 Z"
              fill="url(#msr-skin)"
              stroke="#171420"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M13 47.2 L23.4 50 C29.8 51.2 35.4 49.4 37.8 46.8 C29.4 46.2 20.6 46.2 13 47.2 Z"
              fill="url(#msr-throat)"
            />
            <path
              d="M18.4 48.4 C22.4 49.4 27.4 49.6 32.2 48.6"
              stroke="#9a8646"
              strokeWidth="0.8"
              fill="none"
            />
          </g>
          {/* The skull, eye and all, as one outline: a blunt snout pushed at
              the party, a straight run up to a single half-round bulge of
              eye, and a flat crown behind it down to the neck. A whole round
              dome drawn on its own read as an ear in silhouette — a rat, not
              a toad — and a big brow swept back read as a dog's. */}
          <path
            d="M3.6 41 C1.2 40.2 0.6 37.4 2.4 35.8 L13.6 30.8 C13.6 26.4 16.6 23.2 20.4 23 C24.2 22.8 27.2 25.8 27.4 29.6 L37 29.2 C40.6 29.4 43.4 30.8 44.6 33 C46.6 35.4 46.4 39.6 44 42.4 C42.8 43.8 41.2 44.4 39.4 44.2 Z"
            fill="url(#msr-skin)"
            stroke="#171420"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
          {/* A lit ridge along the top of the snout */}
          <path
            d="M3.6 35.8 L14 31.2"
            stroke="#cdc486"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* The poison gland behind the eye, and warts */}
          <ellipse
            cx="35.6"
            cy="34"
            rx="5.4"
            ry="2.8"
            transform="rotate(10 35.6 34)"
            fill="#8c864c"
            stroke="#171420"
            strokeWidth="1"
          />
          {[
            [33.4, 33.4],
            [35.8, 34.2],
            [38.2, 34.8],
          ].map(([x, y]) => (
            <circle key={`${x}`} cx={x} cy={y} r="0.6" fill="#3b3a26" />
          ))}
          {[
            [8.4, 36.4, 0.8],
            [13.6, 38.2, 1.1],
            [20, 39.6, 1],
            [26.4, 38.4, 1.2],
            [31.4, 40.8, 0.9],
            [31.6, 32.6, 0.8],
            [43, 39, 0.7],
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
          {/* The wide, grim mouth, the whole length of the head, turned down
              at the corner; one gold tooth */}
          <path
            d="M3.6 41 L39.4 44.2 L42 47.4"
            stroke="#171420"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="11"
            y="41.2"
            width="2.4"
            height="3.2"
            rx="0.4"
            fill="url(#msr-gold)"
            stroke="#3e2810"
            strokeWidth="0.6"
          />
          {/* A nostril: a pinhole on the snout, nothing more */}
          <ellipse cx="4.6" cy="36.6" rx="0.9" ry="0.6" fill="#171420" />
          {/* The lit crest of the eye */}
          <path
            d="M15 27 C15.6 24.6 17.8 23.6 20.4 23.6 C22.6 23.6 24.6 24.6 25.8 26.4"
            stroke="#cdc486"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* The loupe, screwed into the eye: a brass ring round a lens, the
              gold eye swimming huge behind it with a toad's flat bar of a
              pupil, and a heavy lid pressed down on top */}
          <ellipse
            className="msr-lens-glow ph-glow"
            cx="20.4"
            cy="29.6"
            rx="7.4"
            ry="7.4"
          />
          <ellipse
            cx="20.6"
            cy="29.6"
            rx="5.4"
            ry="5.2"
            fill="url(#msr-brass)"
            stroke="#171420"
            strokeWidth="1.3"
          />
          <ellipse className="msr-lens" cx="20.4" cy="29.6" rx="3.9" ry="3.7" />
          <ellipse
            cx="20.4"
            cy="30"
            rx="3.2"
            ry="2.8"
            fill="url(#msr-iris)"
            stroke="#171420"
            strokeWidth="0.7"
          />
          <rect
            x="16.9"
            y="29.5"
            width="7"
            height="1.2"
            rx="0.6"
            fill="#171420"
          />
          <path
            d="M17.8 27.4 C18.8 26.4 20.2 26 21.6 26.2"
            stroke="#fbf6dc"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M14.4 28.2 C15.6 22.8 25.6 22.2 27 27.8 C22.4 26.2 18.6 26.4 14.4 28.2 Z"
            fill="url(#msr-skin)"
            stroke="#171420"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
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
          d="M42 47 C47.4 50 48 55 44.4 58.6 L38 62 L36 59.6 L33.6 61.6 L31.6 57.4 L37 51.6 Z"
          fill="url(#msr-coat)"
          stroke="#171420"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* The forearm and hand are authored 4 units low and lifted as one:
            the palm sits at (16, 61), high enough that the pads hover with
            daylight over even the tallest stack */}
        <g transform="translate(0 -4)">
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
      </g>
    </svg>
  );
}
