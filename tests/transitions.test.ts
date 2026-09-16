/**
 * Scene transitions: which changes of scene get a card, and what it says.
 * Presentation only; the card never gates anything (see SceneTransition).
 */
import { expect, it } from "vitest";
import { addPlayer, createRun } from "../src/engine/game";
import { generateMap } from "../src/engine/map";
import { transitionFor } from "../src/client/transitions";
import type { RunState } from "../src/shared/model";

function run(): RunState {
  const s = createRun("SCENES", "scenes");
  addPlayer(s, "a", "Ada");
  s.map = generateMap(s);
  return s;
}
const at = (s: RunState, patch: Partial<RunState>) => ({ ...s, ...patch });

it("names the chamber the party walks into, and whether it is a fight", () => {
  const s = run();
  const fight = s.map.find((n) => n.type === "combat")!;
  const card = transitionFor(
    at(s, { phase: "MAP", currentNode: null }),
    at(s, { phase: "COMBAT", currentNode: fight.id }),
  )!;
  expect(card.title).toBe(fight.name);
  expect(card.eyebrow).toBe("FLOOR 1 · BATTLE");
  expect(card.tone).toBe("fight");
  const rest = s.map.find((n) => n.type === "camp")!;
  expect(
    transitionFor(
      at(s, { phase: "MAP" }),
      at(s, { phase: "CAMP", currentNode: rest.id }),
    )!.tone,
  ).toBe("room");
});

it("leaves a boss chamber to its own entrance", () => {
  const s = run();
  const boss = s.map.find((n) => n.type === "boss")!;
  expect(
    transitionFor(at(s, { phase: "MAP" }), at(s, { phase: "COMBAT", currentNode: boss.id })),
  ).toBeNull();
});

it("marks a won fight, a descent, and the end of the run", () => {
  const s = run();
  const fight = s.map.find((n) => n.type === "combat")!;
  expect(
    transitionFor(
      at(s, { phase: "COMBAT", currentNode: fight.id }),
      at(s, { phase: "UPGRADE", currentNode: fight.id }),
    )!.title,
  ).toBe("Victory");
  const down = transitionFor(
    at(s, { phase: "REWARD", floor: 1 }),
    at(s, { phase: "MAP", floor: 2, currentNode: null }),
  )!;
  expect(down.eyebrow).toBe("DESCENDING · FLOOR 2");
  expect(down.title).toBe("The Drowned Cistern");
  expect(
    transitionFor(at(s, { phase: "COMBAT" }), at(s, { phase: "COMPLETE", outcome: "defeat" }))!.title,
  ).toBe("Defeat");
});

it("cuts plainly between the small steps", () => {
  const s = run();
  expect(transitionFor(at(s, { phase: "UPGRADE" }), at(s, { phase: "REWARD" }))).toBeNull();
  expect(transitionFor(at(s, { phase: "SHOP" }), at(s, { phase: "MAP" }))).toBeNull();
  expect(transitionFor(null, s)).toBeNull();
});
