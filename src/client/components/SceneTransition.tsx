import { useEffect, useRef, useState } from "react";
import type { Snapshot } from "../../shared/model";
import { transitionFor, type TransitionCard } from "../transitions";
import "../transitions.css";

/**
 * A title card laid over the change from one scene of the run to the next.
 *
 * Pure presentation, and never in the way: it takes no pointer events, so the
 * new screen underneath is live the moment it arrives, and nothing in the room
 * waits on it. It covers the cut, names where the party is going, and lifts.
 * With reduced motion it is a short fade with nothing moving.
 */
export function SceneTransition({
  s,
  reducedMotion,
}: {
  s: Snapshot;
  reducedMotion: boolean;
}) {
  const prev = useRef<Snapshot | null>(null);
  const [card, setCard] = useState<TransitionCard | null>(null);

  useEffect(() => {
    const next = transitionFor(prev.current, s);
    prev.current = s;
    if (next && next.key !== card?.key) setCard(next);
    // Only a change of scene can start a card; everything else in the
    // snapshot is ignored here.
  }, [s.phase, s.currentNode, s.floor, s.outcome]);

  useEffect(() => {
    if (!card) return;
    const done = setTimeout(
      () => setCard(null),
      reducedMotion ? 700 : card.tone === "boss" || card.tone === "descent" ? 1500 : 1100,
    );
    return () => clearTimeout(done);
  }, [card, reducedMotion]);

  if (!card) return null;
  return (
    <div
      className="scene-transition"
      data-tone={card.tone}
      data-motion={reducedMotion ? "reduced" : "full"}
      key={card.key}
      role="status"
      aria-live="polite"
    >
      <div className="scene-veil" />
      <div className="scene-card">
        <span className="scene-eyebrow">{card.eyebrow}</span>
        <strong className="scene-title">{card.title}</strong>
        {card.subtitle && <em className="scene-subtitle">{card.subtitle}</em>}
        <span className="scene-rule" aria-hidden="true" />
      </div>
    </div>
  );
}
