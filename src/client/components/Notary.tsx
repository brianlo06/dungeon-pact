import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-archive.css";

/**
 * The Notary.
 *
 * The one who witnesses. Where the Collector is weighed down by what it has
 * taken, the Notary is drawn *up*: a tall, narrow clerk in an ash-grey robe
 * whose mitre is a folded deed sealed at the brow, with a single wax-red lens
 * for a face. Its weapon is the thing that makes a signature binding — a brass
 * seal-matrix the size of an anvil, held out on a long arm towards the party.
 * Behind it leans the stack of ledgers it has witnessed, and candles stand on
 * its shoulder dripping the wax it presses.
 *
 * Rigged as `robe`, `ledgers`, `candles`, `stamp`, `ribbons` and `head`. The
 * stamp carries every move: raised and trembling through the pressing, brought
 * down flat on the signature. The ledgers lag behind the body the way the
 * Collector's chains do.
 *
 * Silhouette test: a tall spike (the mitre) over a narrow body, a heavy block
 * held out at arm's length on the party's side, and a leaning stack behind on
 * the other. Filled black it is nothing else on the roster.
 *
 * Enemies face the party, to their left, so the stamp is on the left.
 */
const PARTS = ["robe", "ledgers", "candles", "stamp", "ribbons", "head"] as const;

export function Notary({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  return (
    <svg
      className={`notary ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="The Notary"
    >
      <defs>
        <linearGradient id="nty-robe" x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#4a4652" />
          <stop offset="0.55" stopColor="#2e2b35" />
          <stop offset="1" stopColor="#18161d" />
        </linearGradient>
        <linearGradient id="nty-brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2c27c" />
          <stop offset="0.5" stopColor="#b08a42" />
          <stop offset="1" stopColor="#6a4f22" />
        </linearGradient>
        <linearGradient id="nty-wax" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#c4503a" />
          <stop offset="0.6" stopColor="#8f2a22" />
          <stop offset="1" stopColor="#551813" />
        </linearGradient>
        <linearGradient id="nty-page" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3d6b2" />
          <stop offset="1" stopColor="#a8976f" />
        </linearGradient>
      </defs>

      {/* ---- ledgers: a leaning stack behind the far shoulder ---- */}
      <g ref={hold("ledgers")} style={{ transformOrigin: "66px 62px" }}>
        {[
          [60, 50, 24, 11, -4, "#4b2a24"],
          [62, 39, 22, 11, 3, "#2f3a3c"],
          [59, 28, 23, 11, -6, "#5a3a22"],
          [63, 17, 20, 11, 5, "#3a2830"],
          [61, 7, 18, 10, -3, "#4b2a24"],
        ].map(([x, y, w, h, r, fill], i) => (
          <g key={i} transform={`rotate(${r} ${Number(x) + Number(w) / 2} ${Number(y) + Number(h) / 2})`}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx="1.2"
              fill={String(fill)}
              stroke="#171420"
              strokeWidth="1.6"
            />
            <rect
              x={Number(x) + 1.6}
              y={Number(y) + Number(h) - 3.2}
              width={Number(w) - 3.2}
              height="2"
              fill="url(#nty-page)"
            />
            <rect
              x={Number(x) + Number(w) * 0.62}
              y={y}
              width="2.4"
              height={h}
              fill="#8f2a22"
            />
          </g>
        ))}
      </g>

      {/* ---- robe: narrow, tall, flaring to a hem stained with wax ---- */}
      <g ref={hold("robe")} style={{ transformOrigin: "47px 60px" }}>
        <path
          d="M47 25 C55 25 60 31 61 39 L63 60 L72 94 H23 L31 60 L33 39 C34 31 39 25 47 25 Z"
          fill="url(#nty-robe)"
          stroke="#171420"
          strokeWidth="2"
        />
        <path
          d="M23 94 L29 87 L35 94 L41 86 L47 94 L53 86 L59 94 L65 87 L72 94 Z"
          fill="#171420"
        />
        {/* The stole: a strip of deed hanging to the hem, sealed down its length. */}
        <path
          d="M43 31 H51 L52 90 H42 Z"
          fill="url(#nty-page)"
          stroke="#171420"
          strokeWidth="1.4"
        />
        {[44, 58, 72].map((y) => (
          <g key={y}>
            <circle cx="47" cy={y} r="3.3" fill="url(#nty-wax)" stroke="#3a0f0c" strokeWidth="0.9" />
            <circle cx="47" cy={y} r="1.2" fill="#e0a07a" opacity="0.75" />
          </g>
        ))}
        {[50, 52.5, 64, 66.5, 78, 80.5].map((y) => (
          <rect key={y} x="44" y={y} width="6" height="0.9" fill="#6b5a41" />
        ))}
      </g>

      {/* ---- candles standing on the far shoulder, dripping ---- */}
      <g ref={hold("candles")} style={{ transformOrigin: "59px 32px" }}>
        {[
          [56, 22, 3.2, 9],
          [60.5, 19, 3, 12],
          [64.5, 24, 2.8, 7],
        ].map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill="#e7dcc0" stroke="#171420" strokeWidth="1" />
            <path
              d={`M${x} ${Number(y) + 1} q${Number(w) / 2} 3 ${w} 0 v2.4 q-0.6 1.6 -1.1 0 q-0.5 2.6 -1.1 0.2 z`}
              fill="#c4503a"
            />
            <ellipse className="nty-flame" cx={Number(x) + Number(w) / 2} cy={Number(y) - 2.2} rx="1.3" ry="2.4" />
          </g>
        ))}
      </g>

      {/* ---- ribbons: seal-tails hanging from the belt on the far side ---- */}
      <g ref={hold("ribbons")} style={{ transformOrigin: "58px 58px" }}>
        <path d="M57 58 Q61 70 58 82 L61 80 L62 84 Q65 70 60 58 Z" fill="#8f2a22" stroke="#171420" strokeWidth="1" />
        <path d="M60 58 Q66 66 66 76 L68 73 L70 76 Q69 64 62 57 Z" fill="#6b1f19" stroke="#171420" strokeWidth="1" />
        <circle cx="59.5" cy="58" r="3.4" fill="url(#nty-wax)" stroke="#3a0f0c" strokeWidth="1" />
      </g>

      {/* ---- the stamp: a seal-matrix held out towards the party ---- */}
      <g ref={hold("stamp")} style={{ transformOrigin: "37px 35px" }}>
        {/* Long sleeve from the near shoulder down to the fist. */}
        <path
          d="M38 32 Q27 36 20 46 L26 50 Q31 43 40 41 Z"
          fill="url(#nty-robe)"
          stroke="#171420"
          strokeWidth="1.8"
        />
        {/* The handle, gripped. */}
        <rect x="16" y="33" width="6" height="18" rx="2" fill="url(#nty-brass)" stroke="#171420" strokeWidth="1.5" />
        <circle cx="19" cy="31" r="4.4" fill="url(#nty-brass)" stroke="#171420" strokeWidth="1.5" />
        <path d="M15.5 44 Q19 41 23.5 44 L23 48 Q19 46 16 48 Z" fill="#d9ccaa" stroke="#171420" strokeWidth="1" />
        {/* The matrix: a heavy block, wax-red where it bites. */}
        <path
          d="M6 51 H32 L30 60 H8 Z"
          fill="url(#nty-brass)"
          stroke="#171420"
          strokeWidth="2"
        />
        <rect x="7" y="59.5" width="24" height="3.8" rx="0.8" fill="url(#nty-wax)" stroke="#171420" strokeWidth="1.3" />
        {/* The device cut into its side: a quill crossed over a closed book. */}
        <path d="M13 57 L25 53 M14 53.5 H22 V57.5 H14 Z" stroke="#5d4418" strokeWidth="1" fill="none" />
      </g>

      {/* ---- head: a mitre folded from a deed, and a single wax lens ---- */}
      <g ref={hold("head")} style={{ transformOrigin: "47px 24px" }}>
        {/* A stiff ruff separates the head from the shoulders. */}
        <ellipse cx="47" cy="27" rx="10" ry="3.4" fill="url(#nty-page)" stroke="#171420" strokeWidth="1.5" />
        <path
          d="M40 12 Q47 8 54 12 L53 23.5 Q47 27 41 23.5 Z"
          fill="#d6c9a6"
          stroke="#171420"
          strokeWidth="1.8"
        />
        {/* The mitre: a tall fold of document, its edges ruled. */}
        <path
          d="M38 13 L41 -6 L47 -14 L53 -6 L56 13 Q47 9 38 13 Z"
          fill="#2e2b35"
          stroke="#171420"
          strokeWidth="2"
        />
        <path d="M41.5 -3 L47 -10 L52.5 -3 L54 10 Q47 7 40 10 Z" fill="url(#nty-page)" opacity="0.85" />
        {[-1, 2.5, 6].map((y) => (
          <path key={y} d={`M${42 - y * 0.1} ${y} H${52 + y * 0.1}`} stroke="#6b5a41" strokeWidth="0.8" />
        ))}
        <circle cx="47" cy="4" r="3.6" fill="url(#nty-wax)" stroke="#3a0f0c" strokeWidth="1" />
        {/* The lens, on the side that faces the party. */}
        <circle cx="43.5" cy="17.5" r="3.4" fill="#171420" stroke="url(#nty-brass)" strokeWidth="1.4" />
        <circle className="nty-eye" cx="43.5" cy="17.5" r="1.9" />
        <path d="M46.9 18 Q50 20 51 24" stroke="url(#nty-brass)" strokeWidth="0.8" fill="none" />
        <path d="M49 20 H52" stroke="#6b5a41" strokeWidth="0.9" />
      </g>
    </svg>
  );
}
