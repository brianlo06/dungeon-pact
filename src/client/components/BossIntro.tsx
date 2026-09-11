import { useEffect, useState } from "react";
import { mixer } from "../audio/engine";
import { scaled } from "../battle/tempo";
import type { SfxName } from "../../shared/presentation";

/**
 * The Collector's entrance.
 *
 * Short on purpose. A boss deserves a moment, and a player who has seen it
 * four times deserves to skip it — so it runs about three and a half seconds,
 * any key or click ends it immediately, and it plays once per encounter rather
 * than once per round.
 *
 * It is pure presentation: the fight is already set up behind it and the
 * planning phase is live the instant it clears. Nothing waits on this.
 */
type Beat = "dark" | "reveal" | "title" | "done";

/** A boss's own entrance voice: what it sounds like, then what comes down. */
const VOICES: Record<string, [SfxName, SfxName]> = {
  miser: ["miser-croak", "miser-coin"],
};

export function BossIntro({
  name,
  epithet,
  onDone,
  reduced,
  boss,
}: {
  name: string;
  epithet?: string;
  onDone: () => void;
  reduced: boolean;
  /** Which boss, so it can arrive with its own mark and voice. */
  boss?: string;
}) {
  const [beat, setBeat] = useState<Beat>(reduced ? "done" : "dark");
  const [groan, stamp] = VOICES[boss ?? ""] ?? ["boss-groan", "boss-stamp"];

  useEffect(() => {
    if (reduced) {
      onDone();
      return;
    }
    mixer.unlock();
    const timers = [
      setTimeout(() => {
        setBeat("reveal");
        mixer.play(groan);
      }, scaled(420)),
      setTimeout(() => {
        setBeat("title");
        mixer.play(stamp);
      }, scaled(1500)),
      setTimeout(() => setBeat("done"), scaled(3300)),
      setTimeout(onDone, scaled(3600)),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduced, onDone, groan, stamp]);

  useEffect(() => {
    // Any input ends it. Nobody should be made to watch this twice.
    const skip = () => onDone();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [onDone]);

  if (reduced) return null;
  return (
    <div
      className="boss-intro"
      data-beat={beat}
      data-boss={boss}
      role="presentation"
    >
      <div className="intro-veil" />
      <div className="intro-plate">
        {boss === "miser" ? (
          <MiserMark />
        ) : (
          /* A stamped contract rather than a title card: the creditor's seal
            comes down on the party the way it comes down on a debt. */
          <svg className="intro-seal" viewBox="0 0 120 120" aria-hidden="true">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="#7d2f28"
              stroke="#3c1512"
              strokeWidth="4"
            />
            <circle
              cx="60"
              cy="60"
              r="42"
              fill="none"
              stroke="#d9b36a"
              strokeWidth="2"
              opacity="0.7"
            />
            <path d="M42 52 L60 36 L78 52 L70 80 H50 Z" fill="#e2c07a" />
            <path d="M54 58 H66 M52 66 H68" stroke="#7d2f28" strokeWidth="3" />
          </svg>
        )}
        <strong className="intro-name">{name}</strong>
        {epithet && <em className="intro-epithet">{epithet}</em>}
      </div>
      <span className="intro-hint">press anything to skip</span>
    </div>
  );
}

/**
 * The Miser's mark. Not a seal, because it does not issue contracts: a coin
 * slapped down on the counter, struck with a tally. It counts what you kept.
 */
function MiserMark() {
  return (
    <svg
      className="intro-seal intro-coin"
      viewBox="0 0 120 120"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="intro-coin-gold" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#f8dc8e" />
          <stop offset="0.55" stopColor="#d8a543" />
          <stop offset="1" stopColor="#8c5f21" />
        </linearGradient>
      </defs>
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="url(#intro-coin-gold)"
        stroke="#3a2610"
        strokeWidth="4"
      />
      {/* A milled edge */}
      {Array.from({ length: 40 }, (_, i) => {
        const a = (i / 40) * Math.PI * 2;
        return (
          <path
            key={i}
            d={`M${60 + Math.cos(a) * 45} ${60 + Math.sin(a) * 45} L${60 + Math.cos(a) * 50} ${60 + Math.sin(a) * 50}`}
            stroke="#8c5f21"
            strokeWidth="2"
          />
        );
      })}
      <circle
        cx="60"
        cy="60"
        r="40"
        fill="none"
        stroke="#8c5f21"
        strokeWidth="2.5"
      />
      {/* Struck with a tally: four, and the fifth across them */}
      <g stroke="#6a4516" strokeWidth="6" strokeLinecap="round">
        <path d="M42 40 V80 M54 40 V80 M66 40 V80 M78 40 V80" />
        <path d="M34 74 L86 46" />
      </g>
      <g stroke="#fbe6a8" strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
        <path d="M40.6 42 V78 M52.6 42 V78 M64.6 42 V78 M76.6 42 V78" />
      </g>
    </svg>
  );
}
