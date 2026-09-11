import { useEffect } from "react";
import type { Snapshot } from "../../shared/model";

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
