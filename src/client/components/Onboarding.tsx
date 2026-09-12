import { useEffect, useRef, useState } from "react";
import type { Phase } from "../../shared/model";
const lessons: Partial<Record<Phase, [string, string][]>> = {
  LOBBY: [
    [
      "Bring a second hero",
      "Expeditions require two to four players. Copy the invite link for a friend. Everyone must ready up before Begin expedition becomes available.",
    ],
    [
      "One shared purse",
      "The party shares all gold. Buying equipment, learning a class path, and reviving an ally compete for the same treasury.",
    ],
  ],
  MAP: [
    [
      "Choose the next chamber",
      "Votes decide the route. Combat earns gold and upgrades; events, camps and mentors offer other ways to improve your build.",
    ],
    [
      "Provision before you travel",
      "Open Provisions and trading below the map. Buy healing, supplies or a shared relic by party vote, or offer equipment to a friend. Finish provisioning before locking your route vote.",
    ],
  ],
  COMBAT: [
    [
      "Read their intentions",
      "Enemy chips show who they will attack. WINDUP means the action can be interrupted. Most enemies prefer the front; Snipers threaten the back.",
    ],
    [
      "Choose, target, lock",
      "Choose an ability beside your hero, then a legal target. Row actions affect everyone in that row. The round resolves when every standing hero locks an action.",
    ],
    [
      "Stay involved when downed",
      "A downed hero can grant one spirit ward or resource boost each round. Allies can revive you with gold. Open Battle history for a round recap and status explanations.",
    ],
    [
      "Open the back line",
      "Melee strikes cannot pass standing front-row defenders. Clear the front, pull an enemy forward, or use ranged attacks. A front-row hero can also strike a Marked target behind its defenders; row sweeps still need the front cleared.",
    ],
  ],
  AUCTION: [
    [
      "Try it on",
      "Preview equipment before buying to see it on your hero. Winning equipment replaces and surrenders the old item in that slot.",
    ],
    [
      "Read the auction terms",
      "The first lot uses rising bids. The second uses falling asks: if everyone passes, the price drops. Simultaneous claims use a draw. Expensive purchases still require party approval.",
    ],
  ],
};
export function Onboarding({ phase }: { phase: Phase }) {
  const [step, setStep] = useState(0);
  const [visible, show] = useState(false);
  const next = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setStep(0);
    show(
      !!lessons[phase] &&
        localStorage.getItem(`pact.tutorial.1.${phase}`) !== "done",
    );
  }, [phase]);
  const close = () => {
    localStorage.setItem(`pact.tutorial.1.${phase}`, "done");
    show(false);
  };
  useEffect(() => {
    if (visible) next.current?.focus();
  }, [visible, step]);
  const cards = lessons[phase];
  if (!visible || !cards) return null;
  return (
    <div
      className="modal-backdrop tutorial"
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
        if (e.key === "Tab") {
          const buttons = e.currentTarget.querySelectorAll("button");
          const first = buttons[0],
            last = buttons[buttons.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Expedition tutorial"
        className="modal"
      >
        <small>
          EXPEDITION GUIDE · {step + 1}/{cards.length}
        </small>
        <h2>{cards[step][0]}</h2>
        <p>{cards[step][1]}</p>
        <button
          ref={next}
          className="primary"
          onClick={() =>
            step + 1 === cards.length ? close() : setStep(step + 1)
          }
        >
          {step + 1 === cards.length ? "Got it" : "Next"}
        </button>
        <button onClick={close}>Skip this guide</button>
      </section>
    </div>
  );
}
