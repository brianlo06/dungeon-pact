import { useEffect } from "react";
import type { Snapshot } from "../../shared/model";
import { statuses } from "../../content/statuses";

/**
 * The chronicle, on demand. It used to be a permanent panel, which meant the
 * fight was explained in prose beside itself; the fight should be legible from
 * what happens on the stage. This keeps the full history for anyone who wants
 * to check a number, and overlays the stage rather than resizing it, so opening
 * it can never change the battlefield layout.
 */
export function HistoryDrawer({
  s,
  open,
  onClose,
}: {
  s: Snapshot;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="history-drawer" role="dialog" aria-label="Battle history">
      <div className="history-head">
        <strong>BATTLE HISTORY</strong>
        <button onClick={onClose} aria-label="Close history">
          Close ×
        </button>
      </div>
      <section className="battle-reference">
        {s.roundSummary && (
          <p>
            ROUND {s.roundSummary.round}: {s.roundSummary.damage} total damage ·{" "}
            {s.roundSummary.healing} healing · {s.roundSummary.blocked} Barrier
            reported · {s.roundSummary.triggers} equipment activations.{" "}
            {s.roundSummary.downs.length} combatants down.
          </p>
        )}
        <details>
          <summary>Combat guide and current statuses</summary>
          <p>
            Front row draws most attacks; Snipers prefer the back. Row attacks
            punish grouping. Row support rewards it. Interrupt a WINDUP to
            cancel the action; Weak reduces damage. Revivals become more
            expensive each time.
          </p>
          <p>
            Phase II: the Collector marks a debtor before enforcing the notice,
            and its seizure can be interrupted. The Miser’s audit strips Barrier
            before striking: interrupt it, apply Weak, or move out of the
            targeted row.
          </p>
          {s.enemies
            .filter((e) => e.elite)
            .map((e) => (
              <p key={e.id}>
                {e.name}:{" "}
                {e.elite === "armored"
                  ? "Armored — gains 8 Barrier each round; strip it or pierce Guard and burst through."
                  : e.elite === "sapping"
                    ? "Sapping — damaging hits drain 1 resource."
                    : e.elite === "greedy"
                      ? "Greedy — damaging hits steal 10 gold."
                      : "Vampiric — heals for half its HP damage."}
              </p>
            ))}
          {[...s.players, ...s.enemies]
            .filter((u) => u.statuses.length)
            .map((u) => (
              <div key={u.id}>
                <strong>{u.name}</strong>
                {u.statuses.map((st) => (
                  <p key={st.id}>
                    {statuses[st.id].name} · {st.stacks} stacks · {st.duration}{" "}
                    rounds. {statuses[st.id].description}
                  </p>
                ))}
              </div>
            ))}
        </details>
      </section>
      <ol className="history-list">
        {s.logs.map((l) => (
          <li className={`log-${l.kind}`} key={l.seq}>
            {l.text}
          </li>
        ))}
      </ol>
    </div>
  );
}
