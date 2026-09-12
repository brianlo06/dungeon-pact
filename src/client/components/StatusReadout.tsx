import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Unit } from "../../shared/model";
import { statuses } from "../../content/statuses";
const beneficial = new Set(["barrier", "regen", "empowered", "guarded"]);
export function StatusReadout({
  unit,
  replaying = false,
}: {
  unit: Unit;
  replaying?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  /** The badge that opened the panel, so closing hands the keyboard back. */
  const trigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    // Null until a badge has been used, so the first render steals nothing.
    else trigger.current?.focus();
  }, [open]);
  const barrier = unit.statuses.find((s) => s.id === "barrier");
  const other = unit.statuses.filter((s) => s.id !== "barrier");
  if (!unit.statuses.length && !open) return null;
  return (
    <>
      <span className="status-readout">
        {barrier && (
          <button
            className="barrier-readout"
            onClick={(e) => {
              trigger.current = e.currentTarget;
              setOpen(true);
            }}
            aria-label={`${unit.name}: Barrier ${barrier.stacks}, ${barrier.duration} rounds. Inspect statuses`}
          >
            ⛨ Barrier <b>{barrier.stacks}</b>
          </button>
        )}
        {other.length > 0 && (
          <button
            className={`status-summary ${beneficial.has(other[0].id) ? "status-buff" : "status-debuff"}`}
            onClick={(e) => {
              trigger.current = e.currentTarget;
              setOpen(true);
            }}
            aria-label={`Inspect ${unit.name}'s ${other.length} statuses`}
          >
            {statuses[other[0].id].name}{" "}
            {other[0].stacks > 1 ? other[0].stacks : ""} · {other[0].duration}r{" "}
            {other.length > 1 ? `+${other.length - 1}` : ""}
          </button>
        )}
      </span>
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            className="status-dialog"
            onCancel={() => setOpen(false)}
            onClose={() => setOpen(false)}
            aria-label={`${unit.name}'s status effects`}
          >
            <header>
              <h2>{unit.name} · Status effects</h2>
              <button
                autoFocus
                onClick={() => {
                  dialog.current?.close();
                  setOpen(false);
                }}
              >
                Close statuses
              </button>
            </header>
            <p>
              {unit.hp}/{unit.maxHp} HP · {barrier?.stacks ?? 0} Barrier absorbs
              damage before HP.
              {replaying
                ? " These are the resolved round’s statuses; combat is still replaying."
                : ""}
            </p>
            {unit.statuses.length ? (
              unit.statuses.map((s) => (
                <article
                  key={s.id}
                  className={
                    beneficial.has(s.id) ? "status-buff" : "status-debuff"
                  }
                >
                  <h3>
                    {statuses[s.id].name}{" "}
                    <span>
                      {s.stacks}{" "}
                      {s.id === "barrier"
                        ? "shield points"
                        : s.id === "regen"
                          ? "healing / round"
                          : "stack" + (s.stacks === 1 ? "" : "s")}
                    </span>
                  </h3>
                  <strong>
                    {s.duration} round{s.duration === 1 ? "" : "s"} remaining
                  </strong>
                  <p>{statuses[s.id].description}</p>
                </article>
              ))
            ) : (
              <p>No active status effects.</p>
            )}
          </dialog>,
          document.body,
        )}
    </>
  );
}
