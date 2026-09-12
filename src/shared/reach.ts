import type { Ability, Enemy, Player, RunState } from "./model";

export const reachText = (a: Ability) =>
  a.reach === "melee"
    ? "Melee · Front enemies screen the back row. From the front, bypass them to strike a Marked target."
    : a.reach === "reach"
      ? "Long reach · Bypasses the enemy front line from either row."
      : "Ranged · Can target either enemy row.";

/** Shared legality only. The server rechecks it when each action resolves. */
export function reachError(
  s: Pick<RunState, "reachVersion" | "enemies">,
  p: Player,
  a: Ability,
  target: Enemy,
): string | undefined {
  if (!s.reachVersion || a.reach !== "melee" || target.row === "front") return;
  if (!s.enemies.some((e) => e.hp > 0 && e.row === "front" && !e.holding))
    return;
  // A row sweep cannot use one marked unit to bypass protection for its allies.
  if (
    a.target === "enemy" &&
    p.row === "front" &&
    target.statuses.some((st) => st.id === "marked" && st.stacks > 0)
  )
    return;
  return "Front enemies screen that row. Clear them, use a long-reach attack, or move forward and strike a Marked target.";
}
