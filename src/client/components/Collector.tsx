import { useRigParts, type CreatureProps } from "../battle/useRigParts";

/**
 * The Collector.
 *
 * A creditor, not a wizard. The design brief it is drawn to: a large
 * asymmetric armoured figure, one side dragged down by what it has taken —
 * a ledger chained to the forearm, seals hanging off the pauldron, an
 * oversized key that doubles as a weapon. Ornate wealth bolted onto industrial
 * brutality.
 *
 * It is built as a **cutout rig**: named parts the animator drives
 * independently, which is what lets the key-arm swing through a strike and the
 * chains lag behind the body. That is the documented approach for bosses, and
 * this is the first thing to actually use it.
 *
 * Silhouette test: the whole figure is deliberately lopsided — key-arm high on
 * one side, ledger and chains low on the other, a hooded wedge above. Filled
 * with flat black it should still be identifiable.
 */
const PARTS = ["key", "ledger", "chains", "seals", "head", "mantle"] as const;

export function Collector({
  unitId,
  animators,
  className = "",
}: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);

  return (
    <svg
      className={`collector ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="The Collector"
    >
      <defs>
        <linearGradient id="col-iron" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#4a4152" />
          <stop offset="0.5" stopColor="#332c3e" />
          <stop offset="1" stopColor="#1e1a27" />
        </linearGradient>
        <linearGradient id="col-robe" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#7a3128" />
          <stop offset="0.55" stopColor="#52201d" />
          <stop offset="1" stopColor="#2e1315" />
        </linearGradient>
        <linearGradient id="col-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6c377" />
          <stop offset="0.5" stopColor="#b28840" />
          <stop offset="1" stopColor="#6f5122" />
        </linearGradient>
      </defs>

      {/* ---- mantle: a narrow-shouldered wedge flaring to a torn hem ---- */}
      <g ref={hold("mantle")} style={{ transformOrigin: "50px 46px" }}>
        <path
          d="M50 28 C58 28 63 34 64 42 L66 56 L78 92 H22 L34 56 L36 42 C37 34 42 28 50 28 Z"
          fill="url(#col-robe)"
          stroke="#150d10"
          strokeWidth="2"
        />
        <path
          d="M22 92 L28 84 L34 92 L40 83 L46 92 L52 83 L58 92 L64 84 L70 92 L76 85 L78 92 Z"
          fill="#150d10"
        />
        {/* Ledger-plate across the chest: this thing keeps accounts. */}
        <rect
          x="42"
          y="46"
          width="17"
          height="22"
          rx="1.5"
          fill="url(#col-iron)"
          stroke="#140f1a"
          strokeWidth="1.5"
        />
        {[50, 54, 58, 62].map((y) => (
          <rect key={y} x="45" y={y} width="11" height="1.3" fill="#6d6478" />
        ))}
      </g>

      {/* ---- chains slung across the body ---- */}
      <g
        ref={hold("chains")}
        style={{ transformOrigin: "50px 52px" }}
        stroke="#7b7186"
        strokeWidth="1.8"
        fill="none"
      >
        <path d="M37 42 Q50 52 63 42" opacity="0.85" />
        <path d="M34 46 Q50 58 66 46" opacity="0.5" />
      </g>

      {/* ---- the key: tall, outboard, and it breaks the outline ---- */}
      <g ref={hold("key")} style={{ transformOrigin: "20px 48px" }}>
        <g stroke="#140f1a" strokeWidth="2" fill="url(#col-gold)">
          <rect x="16" y="16" width="8" height="76" rx="2.5" />
          {/* A bow big enough to read as a key at thumbnail size */}
          <circle cx="20" cy="10" r="11" />
          <circle cx="20" cy="10" r="4.8" fill="#241012" />
          <rect x="9" y="8" width="22" height="3.4" rx="1.5" />
          {/* Wards, clearly stepped so the end is not a plain bar */}
          <rect x="24" y="70" width="11" height="6" rx="1" />
          <rect x="24" y="82" width="16" height="6" rx="1" />
        </g>
        {/* The arm that holds it, bridging back to the body. */}
        <path
          d="M24 44 Q32 40 38 44 L38 52 Q31 50 24 53 Z"
          fill="url(#col-iron)"
          stroke="#140f1a"
          strokeWidth="2"
        />
      </g>

      {/* ---- seals hanging clear of the hem on the other side ---- */}
      <g ref={hold("seals")} style={{ transformOrigin: "70px 40px" }}>
        <path
          d="M62 36 Q72 28 82 38 L79 50 H65 Z"
          fill="url(#col-iron)"
          stroke="#140f1a"
          strokeWidth="2"
        />
        {[
          [84, 62, 6.5],
          [76, 72, 5.5],
          [88, 76, 4.8],
        ].map(([x, y, r], i) => (
          <g key={i}>
            <path
              d={`M${x - 4} 48 Q${x} ${(48 + y) / 2} ${x} ${y - r}`}
              stroke="#6d6478"
              strokeWidth="1.2"
              fill="none"
            />
            <circle
              cx={x}
              cy={y}
              r={r}
              fill="#7c2f2a"
              stroke="#3a1512"
              strokeWidth="1"
            />
            <circle cx={x} cy={y} r={r * 0.42} fill="#d9b36a" />
          </g>
        ))}
      </g>

      {/* ---- the ledger, chained and swinging outside the hem ---- */}
      <g ref={hold("ledger")} style={{ transformOrigin: "66px 52px" }}>
        <path
          d="M66 52 Q72 62 70 70"
          stroke="#8d8299"
          strokeWidth="1.6"
          fill="none"
        />
        <g transform="translate(70 80) rotate(-8)">
          <rect
            x="-9"
            y="-9"
            width="18"
            height="19"
            rx="1"
            fill="#4a2a22"
            stroke="#1c0f0d"
            strokeWidth="1.5"
          />
          <rect
            x="-6.5"
            y="-6.5"
            width="13"
            height="14"
            fill="#c9b48a"
            opacity="0.9"
          />
          {[-3, 0, 3].map((y) => (
            <rect key={y} x="-5" y={y} width="10" height="1.1" fill="#6b5a41" />
          ))}
        </g>
      </g>

      {/* ---- head: a hooded wedge with a beak that juts clear ---- */}
      <g ref={hold("head")} style={{ transformOrigin: "50px 22px" }}>
        {/* A visible neck gap separates the head from the shoulders. */}
        <path
          d="M50 4 C58 4 63 11 63 19 L61 30 H39 L37 19 C37 11 42 4 50 4 Z"
          fill="url(#col-robe)"
          stroke="#150d10"
          strokeWidth="2"
        />
        {/* The beak breaks the outline forward and down. */}
        <path
          d="M42 20 L27 32 L45 28 Z"
          fill="url(#col-iron)"
          stroke="#140f1a"
          strokeWidth="1.5"
        />
        <circle className="col-eye" cx="46" cy="17" r="2.2" />
        <circle className="col-eye" cx="56" cy="17" r="2.2" />
        {/* A crown of keys, spiking above the hood. */}
        <g fill="url(#col-gold)" stroke="#140f1a" strokeWidth="1">
          <rect x="42" y="-5" width="3.4" height="11" />
          <rect x="48.3" y="-9" width="3.4" height="15" />
          <rect x="54.6" y="-5" width="3.4" height="11" />
        </g>
      </g>
    </svg>
  );
}
