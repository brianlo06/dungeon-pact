import { useCallback, useState } from "react";
import type { Snapshot } from "../../shared/model";

/** Hold only presentation. Authoritative snapshots and other players keep advancing. */
export function useCombatExit(live: Snapshot | null) {
  const [previous, setPrevious] = useState(live);
  const [ending, setEnding] = useState<Snapshot | null>(null);
  if (previous !== live) {
    setPrevious(live);
    if (!live || previous?.room !== live.room) setEnding(null);
    else if (
      !ending &&
      previous?.phase === "COMBAT" &&
      live.phase !== "COMBAT" &&
      previous.currentNode === live.currentNode &&
      live.logs.some((l) => l.seq > (previous.logs.at(-1)?.seq ?? 0) && l.beat)
    ) {
      setEnding({ ...live, phase: "COMBAT" });
    }
  }
  const finish = useCallback(() => setEnding(null), []);
  return { state: ending ?? live, ending: !!ending, finish };
}
