import type { Snapshot } from "../shared/model";
import { floorDef } from "../content/floors";
import { events } from "../content/events";

/**
 * The card shown between two scenes of a run: where the party is going, in a
 * line or two, while one screen gives way to the next.
 *
 * Only the changes that move the story get one — walking into a chamber,
 * winning or losing a fight, going down the stairs, the end of the run.
 * Everything else (a lot sold, a vote cast, the reward after the upgrade) cuts
 * as it always has, so the cards stay an event rather than a toll on every
 * click. Pure: `tests/transitions.test.ts` reads it without a DOM.
 */
export interface TransitionCard {
  /** Changes whenever a new card should play. */
  key: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** How the card is dressed: an ordinary room, a fight, a boss, a victory. */
  tone: "room" | "fight" | "boss" | "victory" | "defeat" | "descent";
}

type Scene = Pick<
  Snapshot,
  "phase" | "currentNode" | "floor" | "map" | "outcome" | "eventId" | "bossVersion"
>;

const ROOM: Record<string, string> = {
  combat: "BATTLE",
  elite: "ELITE BATTLE",
  hazard: "HAZARD",
  boss: "BOSS",
  auction: "GEAR SHOP",
  mystery: "SALVAGE SHOP",
  forge: "WORKBENCH",
  event: "ENCOUNTER",
  camp: "REST",
  mentor: "TRAINING",
  toll: "TOLL GATE",
  shrine: "SHRINE",
};

/** The card for the change from `prev` to `next`, or null for a plain cut. */
export function transitionFor(
  prev: Scene | null,
  next: Scene,
): TransitionCard | null {
  if (!prev) return null;
  const node = next.map.find((n) => n.id === next.currentNode);
  const floor = next.floor
    ? `FLOOR ${next.floor}`
    : "THE EXPEDITION";
  const key = `${next.phase}:${next.floor ?? 0}:${next.currentNode ?? ""}`;

  // The run's end.
  if (next.phase === "COMPLETE" && prev.phase !== "COMPLETE")
    return next.outcome === "victory"
      ? { key, eyebrow: "THE PACT HOLDS", title: "Victory", subtitle: "Every debt below is settled.", tone: "victory" }
      : { key, eyebrow: "THE PACT IS BROKEN", title: "Defeat", subtitle: "The dungeon keeps its price.", tone: "defeat" };

  // Down the stairs: a new floor, a new region.
  if (
    next.phase === "MAP" &&
    prev.floor !== undefined &&
    next.floor !== undefined &&
    next.floor > prev.floor
  ) {
    const region = next.bossVersion === 1 ? floorDef(next) : undefined;
    return {
      key,
      eyebrow: `DESCENDING · ${floor}`,
      title: region ? capitalise(region.title) : "Further down",
      subtitle: region?.heading,
      tone: "descent",
    };
  }

  // Setting out from the pact onto the first floor.
  if (next.phase === "MAP" && prev.phase === "PACT") {
    const region = next.floor ? floorDef(next) : undefined;
    return {
      key,
      eyebrow: `THE PACT IS SEALED · ${floor}`,
      title: region ? capitalise(region.title) : "Into the Foundry",
      subtitle: region?.heading,
      tone: "descent",
    };
  }

  // A fight won: the round's last blow has already played out.
  if (prev.phase === "COMBAT" && (next.phase === "UPGRADE" || next.phase === "REWARD"))
    return {
      key,
      eyebrow: node?.type === "boss" ? "THE VAULT FALLS SILENT" : "THE CHAMBER FALLS SILENT",
      title: node?.type === "boss" ? "Boss defeated" : "Victory",
      subtitle: node?.name,
      tone: "victory",
    };

  // Into a chamber from the route. A boss chamber has its own entrance
  // (`BossIntro`), which a card laid over it would only fight.
  if (prev.phase === "MAP" && next.phase !== "MAP" && node && node.type !== "boss") {
    const type = node.type;
    const event =
      next.phase === "EVENT"
        ? events.find((e) => e.id === next.eventId)?.name
        : undefined;
    return {
      key,
      eyebrow: `${floor} · ${ROOM[type] ?? type.toUpperCase()}`,
      title: event ?? node.name,
      tone: next.phase === "COMBAT" ? "fight" : "room",
    };
  }
  return null;
}

function capitalise(title: string) {
  return title
    .toLowerCase()
    .replace(/(^|\s)(\S)/g, (_, space: string, c: string) => space + c.toUpperCase());
}
