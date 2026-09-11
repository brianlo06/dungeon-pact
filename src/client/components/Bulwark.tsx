import { useEffect, useRef } from "react";
import type { Animators } from "../battle/useAnimators";

/**
 * The Iron Bulwark.
 *
 * Its job is to stand in front of things, and the anatomy has to say so before
 * the intent chip does: the entire forebody is one angled plate, the centre of
 * gravity is on the floor, and almost nothing soft is exposed. A visor slot is
 * the only opening.
 *
 * Silhouette: a low wedge, wider at the base than the top, with a ram boss
 * jutting from the plate and two exhaust stacks raked back off the shoulders.
 * That reads differently from the Strongbox — which is a rectangle on a plinth
 * — because this one has legs, a lean, and things sticking out of it.
 */
const PARTS = ["shield", "ram", "legs", "stacks", "visor"] as const;

export function Bulwark({
  unitId,
  animators,
  className = "",
}: {
  unitId: string;
  animators?: Animators;
  className?: string;
}) {
  const refs = useRef<Record<string, SVGGElement | null>>({});
  useEffect(() => {
    if (!animators) return;
    for (const part of PARTS)
      animators.attachPart(unitId, part, refs.current[part]);
    return () => {
      for (const part of PARTS) animators.attachPart(unitId, part, null);
    };
  }, [animators, unitId]);
  const hold = (name: string) => (el: SVGGElement | null) => {
    refs.current[name] = el;
  };

  return (
    <svg
      className={`bulwark ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Iron Bulwark"
    >
      <defs>
        <linearGradient id="blw-plate" x1="0.1" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#8b8794" />
          <stop offset="0.42" stopColor="#585264" />
          <stop offset="1" stopColor="#2f2a3a" />
        </linearGradient>
        <linearGradient id="blw-hot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb35e" />
          <stop offset="1" stopColor="#a8441f" />
        </linearGradient>
      </defs>

      {/* ---- stacks: raked back, venting. They break the top outline. ---- */}
      <g ref={hold("stacks")} style={{ transformOrigin: "62px 42px" }}>
        <g stroke="#171420" strokeWidth="2" fill="#3a3442">
          <path d="M60 44 L68 20 L75 22 L68 46 Z" />
          <path d="M70 46 L79 28 L85 31 L77 48 Z" />
        </g>
        <ellipse className="blw-vent" cx="71.5" cy="19" rx="5" ry="3" />
        <ellipse
          className="blw-vent blw-vent-b"
          cx="82"
          cy="28"
          rx="4"
          ry="2.4"
        />
      </g>

      {/* ---- legs: short, splayed, planted ---- */}
      <g ref={hold("legs")} style={{ transformOrigin: "50px 78px" }}>
        <g fill="#2e2936" stroke="#171420" strokeWidth="2">
          <path d="M28 72 L24 92 L38 92 L38 74 Z" />
          <path d="M62 74 L62 92 L76 92 L72 72 Z" />
          {/* Splayed feet, so it reads as braced rather than standing */}
          <rect x="18" y="90" width="26" height="7" rx="2" />
          <rect x="58" y="90" width="26" height="7" rx="2" />
        </g>
        {/* Pistons at the knee */}
        <g stroke="#7c7488" strokeWidth="2.4">
          <path d="M31 76 V86" />
          <path d="M69 76 V86" />
        </g>
      </g>

      {/* ---- visor: the only opening in the whole machine ---- */}
      <g ref={hold("visor")} style={{ transformOrigin: "50px 34px" }}>
        <path
          d="M38 26 H66 L70 40 H36 Z"
          fill="#3a3442"
          stroke="#171420"
          strokeWidth="2"
        />
        <rect
          className="blw-slot"
          x="42"
          y="31"
          width="20"
          height="4"
          rx="1.5"
        />
      </g>

      {/* ---- the plate: one wall, wider at the base, angled to shed blows ---- */}
      <g ref={hold("shield")} style={{ transformOrigin: "44px 66px" }}>
        <path
          d="M22 38 L64 34 L72 86 L14 90 Z"
          fill="url(#blw-plate)"
          stroke="#171420"
          strokeWidth="3"
        />
        {/* A lit leading edge, so the plate reads as angled rather than flat. */}
        <path
          d="M22 38 L14 90"
          stroke="#a9a3b4"
          strokeWidth="2.5"
          fill="none"
          opacity="0.75"
        />
        {/* Riveted banding across the face */}
        <g fill="#2b2734" opacity="0.85">
          <path d="M20 52 L66 49 L67 55 L20 58 Z" />
          <path d="M20 70 L69 67 L70 73 L20 76 Z" />
        </g>
        {[26, 36, 46, 56].map((x) => (
          <circle
            key={x}
            cx={x}
            cy={44 - (x - 26) * 0.09}
            r="1.6"
            fill="#8a8296"
          />
        ))}
        {/* A crest, scorched, so it does not read as blank metal */}
        <path
          d="M38 60 L46 56 L54 60 L50 74 H42 Z"
          fill="#b8863a"
          opacity="0.9"
        />
      </g>

      {/* ---- ram boss: the thing it hits with, jutting off the plate ---- */}
      <g ref={hold("ram")} style={{ transformOrigin: "28px 64px" }}>
        <path
          d="M20 56 L2 62 L20 72 Z"
          fill="url(#blw-hot)"
          stroke="#171420"
          strokeWidth="2"
        />
        <rect
          x="16"
          y="56"
          width="8"
          height="16"
          rx="2"
          fill="#4b4652"
          stroke="#171420"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}
