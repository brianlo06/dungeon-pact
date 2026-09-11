import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-debt.css";

/**
 * The Coin Leech.
 *
 * It does not fight so much as feed: it latches on, and the pact's gold goes
 * down it. So it is a leech — a glossy, ringed body rearing up out of its own
 * coil, a round sucker for a mouth ringed with teeth, and a translucent belly
 * where everything it has swallowed shows through as coins.
 *
 * Silhouette: an S-curve column standing on a coil, flaring at the top into a
 * disc mouth that faces the party, with the tail tip flicked up behind. Nothing
 * else in the game is serpentine, and nothing else stands on a spiral.
 *
 * It is quick, and it moves like it: its idle is a cobra's sway that travels
 * up the body a joint at a time.
 */
const PARTS = ["tail", "lower", "belly", "upper", "head"] as const;

export function Leech({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);

  return (
    <svg
      className={`leech ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Coin Leech"
    >
      <defs>
        <linearGradient id="lch-hide" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#a4507a" />
          <stop offset="0.5" stopColor="#6c2c56" />
          <stop offset="1" stopColor="#371738" />
        </linearGradient>
        <linearGradient id="lch-belly" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d9a0a6" stopOpacity="0.9" />
          <stop offset="1" stopColor="#8a4a62" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="lch-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d888" />
          <stop offset="1" stopColor="#a8762c" />
        </linearGradient>
      </defs>

      {/* ---- tail: the coil it stands on, tip flicked up behind ---- */}
      <g
        ref={hold("tail")}
        data-part="tail"
        style={{ transformOrigin: "62px 88px" }}
      >
        <path
          d="M40 90 C40 80 56 76 70 78 C84 80 90 86 86 91 C82 96 60 97 48 95 C42 94 40 92 40 90 Z"
          fill="url(#lch-hide)"
          stroke="#171420"
          strokeWidth="2.4"
        />
        {/* The tail tip leaves the coil and flicks up */}
        <path
          d="M84 88 C92 86 96 80 95 72 C95 70 97 70 98 72 C100 82 96 90 86 93 Z"
          fill="url(#lch-hide)"
          stroke="#171420"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path className="lch-sheen" d="M50 82 C58 78.6 70 78.4 80 82" />
        <g stroke="#26112a" strokeWidth="1.2" fill="none">
          <path d="M50 84 C48 88 48 92 50 95" />
          <path d="M60 80 C58 85 58 91 60 96" />
          <path d="M72 79 C70 84 70 91 72 96" />
        </g>
      </g>

      {/* ---- lower body: rising out of the coil ---- */}
      <g
        ref={hold("lower")}
        data-part="lower"
        style={{ transformOrigin: "62px 84px" }}
      >
        <path
          d="M50 86 C48 74 52 62 58 54 C62 50 70 48 74 52 C78 58 76 70 74 86 Z"
          fill="url(#lch-hide)"
          stroke="#171420"
          strokeWidth="2.4"
        />
        <path className="lch-sheen" d="M71 54 C75 60 74.6 72 72.6 82" />
        {/* Rings */}
        <g stroke="#26112a" strokeWidth="1.3" fill="none">
          <path d="M53 62 Q63 64 75 60" />
          <path d="M51 70 Q63 73 76 68" />
          <path d="M50 78 Q62 81 75 77" />
        </g>
        {/* Gold spotting along the back, in rows the way a leech is marked */}
        {[
          [70, 56],
          [73, 64],
          [73, 72],
          [72, 80],
        ].map(([x, y]) => (
          <ellipse key={y} cx={x} cy={y} rx="1.3" ry="2" fill="#d9a746" />
        ))}
      </g>

      {/* ---- belly: translucent, full of what it has swallowed ---- */}
      <g
        ref={hold("belly")}
        data-part="belly"
        style={{ transformOrigin: "56px 72px" }}
      >
        <path
          d="M56 56 C48 60 44 70 46 80 C47 84 50 86 54 86 C57 78 58 66 60 58 Z"
          fill="url(#lch-belly)"
          stroke="#171420"
          strokeWidth="1.8"
        />
        {[
          [52, 66, -20],
          [50, 74, 10],
          [53, 80, -6],
          [55, 61, 24],
        ].map(([x, y, a]) => (
          <ellipse
            key={y}
            className="lch-coin"
            cx={x}
            cy={y}
            rx="2.8"
            ry="1.4"
            transform={`rotate(${a} ${x} ${y})`}
          />
        ))}
      </g>

      {/* ---- upper body: the neck, curving forward ---- */}
      <g
        ref={hold("upper")}
        data-part="upper"
        style={{ transformOrigin: "64px 54px" }}
      >
        <path
          d="M58 56 C54 48 50 40 44 34 C40 30 42 24 48 24 C54 26 60 32 66 40 C70 46 72 50 72 54 Z"
          fill="url(#lch-hide)"
          stroke="#171420"
          strokeWidth="2.2"
        />
        <path className="lch-sheen" d="M50 27 C56 30 62 36 67 43" />
        <g stroke="#26112a" strokeWidth="1.2" fill="none">
          <path d="M52 42 Q58 40 62 34" />
          <path d="M56 50 Q63 48 68 42" />
        </g>
        {[
          [60, 30],
          [66, 38],
        ].map(([x, y]) => (
          <ellipse key={y} cx={x} cy={y} rx="1.2" ry="1.8" fill="#d9a746" />
        ))}
        {/* A pale stripe down the front of the neck */}
        <path
          d="M47 32 C51 38 54 45 57 53"
          stroke="#a8667a"
          strokeWidth="2"
          fill="none"
          opacity="0.8"
        />
      </g>

      {/* ---- head: a round sucker, ringed with teeth, facing the party ---- */}
      <g
        ref={hold("head")}
        data-part="head"
        style={{ transformOrigin: "46px 28px" }}
      >
        {/* The hood flaring round the mouth */}
        <path
          d="M52 18 C44 14 32 16 26 22 C20 28 20 38 26 44 C30 46 36 44 40 40 C46 34 52 28 52 18 Z"
          fill="url(#lch-hide)"
          stroke="#171420"
          strokeWidth="2.2"
        />
        {/* The sucker: a fleshy lip ring turned toward the party */}
        <g transform="rotate(14 28.4 31)">
          <ellipse
            cx="28.4"
            cy="31"
            rx="6.4"
            ry="11.2"
            fill="#c98592"
            stroke="#171420"
            strokeWidth="1.8"
          />
          <ellipse cx="28.4" cy="31" rx="4.4" ry="8.6" fill="#2b0f1c" />
          {/* Small gold-capped hooks all round the rim, pointing in */}
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const at = (r: number, q: number) =>
              `${(28.4 + Math.cos(a) * r).toFixed(2)} ${(31 + Math.sin(a) * q).toFixed(2)}`;
            return (
              <path
                key={i}
                d={`M${at(4.4, 8.6)} L${at(2.9, 6.2)}`}
                stroke="#f0cd78"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            );
          })}
          <ellipse className="lch-throat" cx="28.4" cy="31" rx="1.6" ry="3.6" />
        </g>
        {/* A cluster of small eyes on the crown */}
        {[
          [40, 20],
          [44, 22],
          [37, 23.4],
          [42, 25.4],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} className="lch-eye" cx={x} cy={y} r="1.2" />
        ))}
      </g>
    </svg>
  );
}
