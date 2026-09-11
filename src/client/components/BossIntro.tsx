import { useEffect, useState } from "react";
import { mixer } from "../audio/engine";
import { scaled } from "../battle/tempo";

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

export function BossIntro({
  name,
  epithet,
  onDone,
  reduced,
}: {
  name: string;
  epithet?: string;
  onDone: () => void;
  reduced: boolean;
}) {
  const [beat, setBeat] = useState<Beat>(reduced ? "done" : "dark");

  useEffect(() => {
    if (reduced) {
      onDone();
      return;
    }
    mixer.unlock();
    const timers = [
      setTimeout(() => {
        setBeat("reveal");
        mixer.play("boss-groan");
      }, scaled(420)),
      setTimeout(() => {
        setBeat("title");
        mixer.play("boss-stamp");
      }, scaled(1500)),
      setTimeout(() => setBeat("done"), scaled(3300)),
      setTimeout(onDone, scaled(3600)),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduced, onDone]);

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
    <div className="boss-intro" data-beat={beat} role="presentation">
      <div className="intro-veil" />
      <div className="intro-plate">
        {/* A stamped contract rather than a title card: the creditor's seal
            comes down on the party the way it comes down on a debt. */}
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
        <strong className="intro-name">{name}</strong>
        {epithet && <em className="intro-epithet">{epithet}</em>}
      </div>
      <span className="intro-hint">press anything to skip</span>
    </div>
  );
}
