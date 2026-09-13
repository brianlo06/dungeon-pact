import type { Player, RunState } from "../shared/model";
import { pick } from "./rng";
import { log, spend, scald } from "./effects";
import { enterCombat, standing } from "./combat";

/**
 * The four chambers added after the playtest asked for "more spice" than a
 * route of fights and shops.
 *
 * Each one is built on a system the game already had rather than a new one,
 * because a new system is a new thing for four friends to learn at once:
 *
 * - the **toll gate** is the shared purse against the party's health;
 * - the **hazard chamber** is the row system, made the point of a fight;
 * - the **shrine** is the starting pact, offered again to one hero mid-run;
 * - the **workbench** is the shop, selling improvements to what you carry.
 *
 * The workbench lives with the shop in `shop.ts`, since it is one.
 */

// ---------------------------------------------------------------- toll gate

/**
 * What the keepers ask. Priced against what the fight it skips would pay out,
 * so paying is never obviously right: a party that pays keeps its health and
 * forgoes the reward and the branch upgrade a victory earns. A floor down, the
 * keepers know you can afford more.
 */
export function tollPrice(s: Pick<RunState, "floor">) {
  return 110 + 50 * ((s.floor ?? 1) - 1);
}

export function enterToll(s: RunState) {
  s.toll = tollPrice(s);
  s.votes = {};
  s.phase = "TOLL";
  log(s, `Keepers bar the gate. They want ${s.toll} gold to let you through.`);
}

/** The party paid or refused. Refusing is a fight at the gate. */
export function resolveToll(s: RunState, choice: "pay" | "fight") {
  const price = s.toll ?? tollPrice(s);
  delete s.toll;
  if (choice === "pay") {
    spend(s, price);
    log(s, "The keepers step aside. Nobody bleeds for it.", "gold");
    s.phase = "MAP";
    return;
  }
  log(s, "The party will not pay. The keepers draw.");
  enterCombat(s);
}

// ----------------------------------------------------------- hazard chamber

/**
 * A fight where the room acts on its own schedule, so standing still is a
 * decision with a cost. Both hazards read rows, which the party can change
 * every round — that is the whole idea.
 *
 * - **Vents** scald whoever holds the front as each round begins, from the
 *   second round: the first is the party's chance to see the rule and move.
 *   The front is where most enemies aim, so the room pushes back against the
 *   formation the enemies want you in.
 * - **Collapse**: the catwalk gives out at the start of round three, and
 *   everyone standing at the back drops to the front whether they meant to or
 *   not. A party gets two rounds of warning to decide who is back there.
 */
export { COLLAPSE_ROUND, VENT_SCALD } from "../content/hazards";
import { COLLAPSE_ROUND, VENT_SCALD } from "../content/hazards";

export function enterHazard(s: RunState) {
  // The fight starts before the hazard is set, so round one is never struck:
  // nobody should be scalded for a rule they have not yet been shown.
  enterCombat(s);
  s.hazard = pick(s, ["vents", "collapse"] as const);
  log(
    s,
    s.hazard === "vents"
      ? `Steam vents line the floor. From the second round, the front row is scalded for ${VENT_SCALD} as each round begins.`
      : `The back catwalk groans. On round ${COLLAPSE_ROUND} it will give way.`,
  );
}

/** Called at the start of each round of a hazard chamber's fight. */
export function applyHazard(s: RunState) {
  if (!s.hazard) return;
  if (s.hazard === "vents") {
    for (const p of standing(s).filter((p) => p.row === "front"))
      scald(s, p, VENT_SCALD);
    return;
  }
  if (s.hazard === "collapse" && s.round === COLLAPSE_ROUND) {
    const dropped = standing(s).filter((p) => p.row === "back");
    for (const p of dropped) p.row = "front";
    log(
      s,
      dropped.length
        ? `The catwalk gives way. ${dropped.map((p) => p.name).join(", ")} ${dropped.length > 1 ? "drop" : "drops"} to the front.`
        : "The catwalk gives way over an empty back row.",
    );
  }
}

// ------------------------------------------------------------------- shrine

/**
 * A permanent bargain, and only one hero may strike it.
 *
 * The starting pact is a decision the whole party makes once, blind. The altar
 * is the same shape of decision made mid-run by one person with everything
 * they now know about the fight ahead — and the conversation about *who* is
 * most of what it is for.
 */
export { OFFERINGS, type Offering } from "../content/shrines";
import { OFFERINGS, type Offering } from "../content/shrines";

export function enterShrine(s: RunState) {
  s.shrine = { taken: null, answered: [] };
  s.phase = "SHRINE";
  log(s, "An altar, still warm. It will answer one of you.");
}

export function answerShrine(s: RunState, p: Player, offering: Offering) {
  const shrine = s.shrine!;
  if (shrine.answered.includes(p.id))
    throw Error("You have already answered the altar");
  if (offering !== "leave") {
    if (shrine.taken) throw Error("The altar has already answered someone");
    if (p.fallen) throw Error("A fallen hero has nothing left to offer");
    const terms = OFFERINGS[offering];
    if (terms.maxHp && p.maxHp + terms.maxHp < 1)
      throw Error("You cannot offer more health than you have");
    if (terms.gold) spend(s, terms.gold);
    p.power += terms.power;
    p.maxHp += terms.maxHp;
    p.hp = Math.max(1, Math.min(p.hp, p.maxHp));
    shrine.taken = p.id;
    log(
      s,
      offering === "blood"
        ? `${p.name} bleeds on the altar: +${terms.power} Power, ${terms.maxHp} maximum HP.`
        : `${p.name} pays the altar ${terms.gold} of the party's gold: +${terms.power} Power.`,
    );
  }
  shrine.answered.push(p.id);
  // The altar goes dark once it has answered someone, or everyone has walked
  // past it; either way nobody is left to wait for.
  if (shrine.taken || shrine.answered.length === s.players.length) {
    delete s.shrine;
    s.phase = "MAP";
  }
}
