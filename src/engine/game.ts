import type { RunState, Player, Snapshot } from "../shared/model";
import type { Intent } from "../shared/protocol";
import { hero } from "../content/heroes";
import { items } from "../content/items";
import { events } from "../content/events";
import { services } from "../content/services";
import { hashSeed, pick } from "./rng";
import { generateMap, availableNodes, nodeMentorTier, FLOORS } from "./map";
import { log, spend, gain, applyStatus } from "./effects";
import {
  enterCombat,
  enterUpgrade,
  validatePlan,
  validateUltimate,
  resolveRound,
  standing,
} from "./combat";
import { upgradeOffer } from "../content/upgrades";
import { drillFor, mentors, pathFor, resourceCap } from "../content/evolutions";
// The auction remains only for rooms that entered one before the shop replaced it.
import { nextLot, nominate, purchase } from "./auction";
import {
  enterShop,
  enterForge,
  proposePurchase,
  approvePurchase,
} from "./shop";
import {
  answerShrine,
  enterHazard,
  enterShrine,
  enterToll,
  resolveToll,
} from "./chambers";
import {
  VITALITY_MAX_HP,
  WEALTH_MAX_HP,
  WEALTH_PER_HERO,
} from "../content/pacts";
export function createRun(room: string, seed: string): RunState {
  return {
    expeditionVersion: 1,
    floor: 1,
    reachVersion: 1,
    encounterVersion: 2,
    combatVersion: 2,
    ultimateVersion: 1,
    revivals: 0,
    schemaVersion: 1,
    contentVersion: 1,
    room,
    phase: "LOBBY",
    revision: 0,
    seed,
    rng: hashSeed(seed),
    players: [],
    gold: 420,
    earned: 420,
    spent: 0,
    map: [],
    currentNode: null,
    votes: {},
    tieCursor: 0,
    enemies: [],
    plans: {},
    round: 0,
    auction: null,
    eventId: null,
    logs: [],
    eventSeq: 0,
    startedAt: null,
    endedAt: null,
    outcome: null,
    approvalThreshold: 0.3,
    reward: 0,
    pact: null,
  };
}
export function addPlayer(s: RunState, id: string, name: string) {
  if (s.phase !== "LOBBY" || s.players.length >= 4)
    throw Error("Room is full or already running");
  const h = hero("vanguard");
  s.players.push({
    id,
    name,
    heroId: h.id,
    ready: false,
    upgrades: [],
    evolution: undefined,
    hp: h.hp,
    maxHp: h.hp,
    power: h.power,
    guard: h.guard,
    speed: h.speed,
    row: "front",
    statuses: [],
    resource: h.maxResource,
    ...(s.ultimateVersion === 1 ? { ultimateCharge: 0 } : {}),
    items: [],
    cooldowns: {},
    downedRounds: 0,
    fallen: false,
    spent: 0,
    damage: 0,
    healing: 0,
    revives: 0,
  });
  s.revision++;
  log(s, `${name} joins the pact.`);
}
/**
 * Camp is one shared decision. Training used to be free, which made it the
 * obvious pick whenever nobody was dying; paying for it puts recovery and
 * power in direct competition for the same treasury.
 */
export const campCosts: Record<string, number> = { restore: 120, train: 100 };
function voteResult(s: RunState): string | undefined {
  const counts = new Map<string, number>();
  for (const c of Object.values(s.votes))
    counts.set(c, (counts.get(c) ?? 0) + 1);
  const majority = [...counts].find(([, n]) => n > s.players.length / 2);
  if (majority) return majority[0];
  if (Object.keys(s.votes).length < s.players.length) return;
  const max = Math.max(...counts.values());
  const tied = [...counts].filter(([, n]) => n === max).map(([c]) => c);
  for (let i = 0; i < s.players.length; i++) {
    const index = (s.tieCursor + i) % s.players.length;
    const choice = s.votes[s.players[index].id];
    if (tied.includes(choice)) {
      s.tieCursor = (index + 1) % s.players.length;
      return choice;
    }
  }
}
/**
 * Which class a training ground will evolve.
 *
 * Drawn from the party, not from the world, so a mentor chamber is never a
 * dead room: somebody always has a path on offer. Heroes who have already
 * taken one are passed over first, because a ground that offers its only path
 * to the one hero who cannot use it teaches nobody. The draw uses the run's
 * RNG, so the same route from the same seed always teaches the same class.
 */
function teachableClass(s: RunState, mentorId: string) {
  const canTake = (p: RunState["players"][number]) =>
    !!pathFor(mentorId, p.heroId);
  const fresh = s.players.filter((p) => !p.evolution && canTake(p));
  const pool = fresh.length ? fresh : s.players.filter(canTake);
  return pool.length ? pick(s, pool).heroId : null;
}

/**
 * Down to the next floor. The route is rebuilt for it and the party stands at
 * its entrance, with nothing visited. Health, gear, upgrades, paths and the
 * treasury all come with them — a floor is further into one run, not a new
 * one — so the rest before each boss is what a party recovers with.
 */
/** What the stairs between floors restore: a raised hero's share, and everyone's. */
export const DESCENT_RAISE = 0.5;
export const DESCENT_HEAL = 0.3;
function descend(s: RunState) {
  s.floor = (s.floor ?? 1) + 1;
  s.map = generateMap(s);
  s.currentNode = null;
  s.votes = {};
  // The stairs down are a breather, not a camp. Fallen heroes get up and
  // everyone recovers some ground, because a party that only just beat a boss
  // would otherwise start the next floor half-dead. It is deliberately partial:
  // a full heal here made three- and four-hero parties *more* likely to win two
  // floors than they had been to win one, and barely helped duos at all.
  for (const p of s.players) {
    if (p.fallen || p.hp <= 0) p.hp = Math.round(p.maxHp * DESCENT_RAISE);
    else p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * DESCENT_HEAL));
    p.fallen = false;
    p.downedRounds = 0;
    p.statuses = [];
  }
  log(
    s,
    `The party descends to floor ${s.floor} of ${FLOORS}, and catches its breath on the stairs.`,
  );
}

function finishVote(s: RunState, result: string) {
  s.votes = {};
  if (s.phase === "PACT") {
    s.pact = result;
    if (result === "wealth") {
      // Per hero, not per party: a flat purse against a per-hero health price
      // was a duo's bargain and a quartet's mistake. See `content/pacts.ts`.
      gain(s, WEALTH_PER_HERO * s.players.length);
      for (const p of s.players) {
        p.maxHp -= WEALTH_MAX_HP;
        p.hp = p.maxHp;
      }
    } else
      for (const p of s.players) {
        p.maxHp += VITALITY_MAX_HP;
        p.hp = p.maxHp;
      }
    s.map = generateMap(s);
    s.phase = "MAP";
    return;
  }
  if (s.phase === "MAP") {
    const n = s.map.find((n) => n.id === result)!;
    s.currentNode = n.id;
    n.visited = true;
    log(s, `Entered ${n.name}.`);
    if (n.type === "combat" || n.type === "elite" || n.type === "boss")
      enterCombat(s, n.type === "boss", n.type === "elite");
    else if (n.type === "hazard") enterHazard(s);
    else if (n.type === "toll") enterToll(s);
    else if (n.type === "shrine") enterShrine(s);
    else if (n.type === "forge") enterForge(s);
    else if (n.type === "auction" || n.type === "mystery") enterShop(s);
    else if (n.type === "event") {
      s.eventId = pick(s, events).id;
      s.phase = "EVENT";
    } else if (n.type === "mentor") {
      const teaching = mentors[nodeMentorTier(s, n) - 1];
      s.mentorId = teaching.id;
      s.mentorClass = teachableClass(s, teaching.id);
      s.trained = [];
      s.phase = "MENTOR";
    } else if (n.type === "camp") s.phase = "CAMP";
    else throw Error(`No chamber is built for ${n.type}`);
    return;
  }
  if (s.phase === "TOLL") {
    resolveToll(s, result as "pay" | "fight");
    return;
  }
  if (s.phase === "EVENT") {
    const c = events
      .find((e) => e.id === s.eventId)!
      .choices.find((c) => c.id === result)!;
    spend(s, c.cost);
    if (c.gold) gain(s, c.gold);
    for (const p of s.players) {
      if (p.hp > 0) p.hp = Math.max(1, Math.min(p.maxHp, p.hp + c.heal));
      if (c.cleanse) p.statuses = [];
      if (c.supply) p.items.push(c.supply);
    }
    log(s, `The party chose ${c.name}.`);
    s.phase = "MAP";
    return;
  }
  if (s.phase === "CAMP") {
    if (campCosts[result]) spend(s, campCosts[result]);
    if (result === "restore") {
      for (const p of s.players) {
        p.fallen = false;
        p.downedRounds = 0;
        p.hp = Math.min(p.maxHp, p.hp + 45);
        p.statuses = [];
      }
    }
    if (result === "rest")
      for (const p of s.players) {
        if (p.hp > 0) p.hp = Math.min(p.maxHp, p.hp + 18);
        else {
          p.hp = 15;
          p.fallen = false;
          p.downedRounds = 0;
        }
        p.statuses = [];
      }
    if (result === "train") for (const p of s.players) p.power += 3;
    log(s, `Camp choice: ${result}.`);
    s.phase = "MAP";
  }
}
/** Atomic reducer: invalid intents never mutate caller state. Clock is supplied by transport. */
export function reduce(
  state: RunState,
  playerId: string,
  intent: Intent,
  now: number,
): RunState {
  const s = structuredClone(state);
  const p = s.players.find((p) => p.id === playerId);
  if (!p) throw Error("Player not found");
  const requirePhase = (...phases: RunState["phase"][]) => {
    if (!phases.includes(s.phase))
      throw Error("Action is not available in this phase");
  };
  switch (intent.type) {
    case "hero": {
      requirePhase("LOBBY");
      const h = hero(intent.hero);
      Object.assign(p, {
        heroId: h.id,
        hp: h.hp,
        maxHp: h.hp,
        power: h.power,
        guard: h.guard,
        speed: h.speed,
        resource: h.maxResource,
        row: h.id === "vanguard" ? "front" : "back",
        ready: false,
        upgrades: [],
        evolution: undefined,
      });
      break;
    }
    case "ready":
      requirePhase("LOBBY");
      p.ready = intent.ready;
      break;
    case "start":
      requirePhase("LOBBY");
      if (s.players.length < 2 || !s.players.every((p) => p.ready))
        throw Error("Two to four ready heroes are required");
      s.phase = "PACT";
      s.startedAt = now;
      log(s, "One treasury. One fate. Choose your starting pact.");
      break;
    case "vote": {
      requirePhase("PACT", "MAP", "EVENT", "CAMP", "TOLL");
      if (s.serviceVote) throw Error("Finish the provision vote first");
      if (s.votes[p.id]) throw Error("Your vote is already locked");
      const choices =
        s.phase === "PACT"
          ? ["wealth", "vitality"]
          : s.phase === "MAP"
            ? availableNodes(s).map((n) => n.id)
            : s.phase === "CAMP"
              ? ["rest", "restore", "train"]
              : s.phase === "TOLL"
                ? ["pay", "fight"]
                : events
                    .find((e) => e.id === s.eventId)!
                    .choices.map((c) => c.id);
      if (!choices.includes(intent.choice)) throw Error("Invalid choice");
      const cost =
        s.phase === "CAMP"
          ? (campCosts[intent.choice] ?? 0)
          : s.phase === "TOLL"
            ? intent.choice === "pay"
              ? (s.toll ?? 0)
              : 0
            : s.phase === "EVENT"
              ? events
                  .find((e) => e.id === s.eventId)!
                  .choices.find((c) => c.id === intent.choice)!.cost
              : 0;
      if (s.gold < cost) throw Error("The treasury cannot cover that choice");
      s.votes[p.id] = intent.choice;
      const result = voteResult(s);
      if (result) finishVote(s, result);
      break;
    }
    case "plan":
      requirePhase("COMBAT");
      if (s.plans[p.id]) throw Error("Unlock before changing your plan");
      validatePlan(s, p, intent.ability, intent.target);
      s.plans[p.id] = { ability: intent.ability, target: intent.target };
      if (standing(s).every((p) => s.plans[p.id])) resolveRound(s);
      break;
    case "unlock":
      requirePhase("COMBAT");
      delete s.plans[p.id];
      break;
    case "ultimate": {
      // An extra action, queued beside the plan. It may be queued before or
      // after the plan is locked, for as long as the round is still open.
      requirePhase("COMBAT");
      validateUltimate(s, p, intent.target);
      s.ultimates = { ...s.ultimates, [p.id]: { target: intent.target } };
      break;
    }
    case "cancelUltimate":
      requirePhase("COMBAT");
      if (!s.ultimates?.[p.id]) throw Error("No Ultimate is queued");
      delete s.ultimates[p.id];
      break;
    case "spirit": {
      requirePhase("COMBAT");
      if (p.hp > 0 || p.spiritRound === s.round)
        throw Error("Spirit support is available once per round while downed");
      const ally = s.players.find(
        (x) => x.id === intent.target && x.hp > 0 && !x.fallen,
      );
      if (!ally) throw Error("Choose a standing ally");
      p.spiritRound = s.round;
      if (intent.aid === "ward") applyStatus(ally, "barrier", 4, 1);
      else ally.resource = Math.min(resourceCap(ally), ally.resource + 1);
      log(
        s,
        `${p.name}'s spirit ${intent.aid === "ward" ? "wards" : "inspires"} ${ally.name}.`,
        "info",
        {
          kind: intent.aid === "ward" ? "block" : "combo",
          actor: p.id,
          target: ally.id,
          label: "SPIRIT AID",
          amount: intent.aid === "ward" ? 4 : undefined,
        },
      );
      break;
    }
    case "offerTrade": {
      requirePhase("MAP", "CAMP", "REWARD", "MENTOR", "UPGRADE");
      if (!p.items.includes(intent.item))
        throw Error("You do not own this item");
      if (
        intent.target === p.id ||
        !s.players.some((x) => x.id === intent.target)
      )
        throw Error("Choose another hero");
      const slot = items.find((i) => i.id === intent.item)!.slot;
      const returnItem =
        slot === "supply"
          ? undefined
          : s.players
              .find((x) => x.id === intent.target)!
              .items.find(
                (id) => items.find((i) => i.id === id)?.slot === slot,
              );
      s.trades = [
        ...(s.trades ?? []).filter((t) => t.from !== p.id),
        {
          from: p.id,
          to: intent.target,
          item: intent.item,
          returnItem,
          node: s.currentNode,
        },
      ];
      break;
    }
    case "proposeService": {
      requirePhase("MAP");
      if (s.serviceVote || Object.keys(s.votes).length)
        throw Error("Finish the current party decision first");
      const service = services.find((x) => x.id === intent.service);
      if (!service || service.price > s.gold)
        throw Error("Provision unavailable or unaffordable");
      if ("relic" in service && s.teamRelics?.includes(service.relic))
        throw Error("The pact already owns this relic");
      s.serviceVote = { id: service.id, votes: {} };
      log(s, `${p.name} proposes ${service.name} for ${service.price} gold.`);
      break;
    }
    case "serviceVote": {
      requirePhase("MAP");
      const proposal = s.serviceVote;
      if (!proposal || p.id in proposal.votes)
        throw Error("No unanswered provision vote");
      proposal.votes[p.id] = intent.approve;
      const yes = Object.values(proposal.votes).filter(Boolean).length;
      const no = Object.values(proposal.votes).filter((v) => !v).length;
      if (yes > s.players.length / 2) {
        const service = services.find((x) => x.id === proposal.id)!;
        spend(s, service.price);
        if ("supply" in service)
          for (const hero of s.players) hero.items.push(service.supply);
        if ("heal" in service)
          for (const hero of s.players)
            if (hero.hp > 0)
              hero.hp = Math.min(hero.maxHp, hero.hp + service.heal);
        if ("relic" in service)
          s.teamRelics = [...(s.teamRelics ?? []), service.relic];
        log(s, `The pact buys ${service.name}.`);
        delete s.serviceVote;
      } else if (no >= Math.ceil(s.players.length / 2)) {
        log(s, "The pact declines the provisions.");
        delete s.serviceVote;
      }
      break;
    }
    case "answerTrade": {
      requirePhase("MAP", "CAMP", "REWARD", "MENTOR", "UPGRADE");
      const offer = s.trades?.find(
        (t) =>
          t.from === intent.from &&
          t.item === intent.item &&
          t.to === p.id &&
          t.node === s.currentNode,
      );
      if (!offer) throw Error("This offer has expired");
      s.trades = s.trades!.filter((t) => t !== offer);
      if (!intent.accept) break;
      const owner = s.players.find((x) => x.id === offer.from)!;
      const item = items.find((i) => i.id === offer.item)!;
      if (!owner.items.includes(item.id))
        throw Error("The offered item is no longer available");
      // Exchange the recipient's occupied slot back to the sender. Nobody
      // loses a piece silently, and supplies transfer one copy at a time.
      const replaced =
        item.slot === "supply"
          ? undefined
          : p.items.find(
              (id) => items.find((i) => i.id === id)?.slot === item.slot,
            );
      if (replaced !== offer.returnItem)
        throw Error("Equipment changed. Ask for a new trade offer");
      owner.items.splice(owner.items.indexOf(item.id), 1);
      if (replaced) {
        p.items.splice(p.items.indexOf(replaced), 1);
        owner.items.push(replaced);
      }
      p.items.push(item.id);
      log(
        s,
        `${owner.name} trades ${item.name} to ${p.name}${replaced ? " in exchange for their equipped " + item.slot : ""}.`,
      );
      break;
    }
    case "upgrade": {
      requirePhase("UPGRADE");
      if (s.votes[p.id]) throw Error("Your upgrade is already chosen");
      if (!upgradeOffer(p).some((u) => u.id === intent.choice))
        throw Error("That branch is not on offer");
      s.votes[p.id] = intent.choice;
      if (s.players.every((x) => s.votes[x.id])) {
        for (const x of s.players) {
          const choice = s.votes[x.id];
          if (choice !== "none") x.upgrades = [...(x.upgrades ?? []), choice];
        }
        s.votes = {};
        s.phase = "REWARD";
        log(s, "New instincts settle in. The route waits.");
      }
      break;
    }
    case "train": {
      requirePhase("MENTOR");
      if ((s.trained ?? []).includes(p.id))
        throw Error("You have already answered the mentor");
      const teaching = mentors.find((m) => m.id === s.mentorId)!;
      // A ground teaches one class. Rooms that entered a mentor before that
      // rule existed have no class recorded, and keep the old open teaching.
      const mine = s.mentorClass === undefined || s.mentorClass === p.heroId;
      const path =
        mine && !p.evolution ? pathFor(teaching.id, p.heroId) : undefined;
      const drill = drillFor(teaching.tier);
      if (intent.accept) {
        if (path) {
          // Tuition leaves the shared purse the moment a hero commits, so the
          // party watches it drain and argues over who goes next.
          spend(s, teaching.tuition);
          p.evolution = path.id;
          p.maxHp += path.stats.hp ?? 0;
          p.hp = Math.max(1, Math.min(p.maxHp, p.hp + (path.stats.hp ?? 0)));
          p.power = Math.max(0, p.power + (path.stats.power ?? 0));
          p.guard = Math.max(0, p.guard + (path.stats.guard ?? 0));
          p.speed = Math.max(0, p.speed + (path.stats.speed ?? 0));
          p.resource = Math.min(p.resource, resourceCap(p));
          log(s, `${p.name} walks out a ${path.name}. ${path.title}`);
        } else {
          // Everyone this ground cannot evolve may still drill, so a mentor
          // chamber is worth entering for a party it has no path for.
          spend(s, drill.fee);
          p.maxHp += drill.hp;
          p.hp += drill.hp;
          p.power += drill.power;
          log(
            s,
            `${p.name} drills at ${teaching.name}: +${drill.power} Power, +${drill.hp} maximum HP.`,
          );
        }
      } else log(s, `${p.name} declines the ${teaching.name}.`);
      s.trained = [...(s.trained ?? []), p.id];
      if (s.players.every((x) => (s.trained ?? []).includes(x.id))) {
        s.mentorId = null;
        s.mentorClass = null;
        s.trained = [];
        s.phase = "MAP";
      }
      break;
    }
    case "continue":
      requirePhase("REWARD", "AUCTION", "SHOP");
      if (s.phase === "SHOP") {
        if (s.shop!.proposal)
          throw Error("Finish the purchase decision before leaving");
        if (s.shop!.leaving.includes(p.id))
          throw Error("Already ready to leave");
        s.shop!.leaving.push(p.id);
        if (s.shop!.leaving.length < s.players.length) break;
        delete s.shop;
      }
      if (s.phase === "AUCTION") {
        if (s.auction?.stage !== "sold") throw Error("Auction is not complete");
        // An exchange runs several lots; only the last one returns to the map.
        if (nextLot(s)) break;
      }
      // Leaving the reward for a floor's boss is the way down: a new route, a
      // new floor, and the party standing at its entrance.
      if (
        s.phase === "REWARD" &&
        s.floor !== undefined &&
        s.floor < FLOORS &&
        s.map.find((n) => n.id === s.currentNode)?.type === "boss"
      )
        descend(s);
      s.phase = "MAP";
      s.auction = null;
      break;
    case "shrine":
      requirePhase("SHRINE");
      answerShrine(s, p, intent.offering);
      break;
    case "shopOffer":
      requirePhase("SHOP");
      proposePurchase(s, intent.item, intent.recipient);
      break;
    case "shopApprove":
      requirePhase("SHOP");
      approvePurchase(s, p.id, intent.approve);
      break;
    case "interest": {
      requirePhase("AUCTION");
      const a = s.auction!;
      if (a.stage !== "interest" || a.acted.includes(p.id))
        throw Error("Interest is already locked");
      a.acted.push(p.id);
      if (intent.interested) a.active.push(p.id);
      if (a.acted.length === s.players.length) nominate(s);
      break;
    }
    case "bid": {
      requirePhase("AUCTION");
      const a = s.auction!;
      if (
        a.stage !== "bidding" ||
        !a.active.includes(p.id) ||
        a.acted.includes(p.id)
      )
        throw Error("Cannot bid now");
      a.acted.push(p.id);
      if (!intent.stay) a.active = a.active.filter((id) => id !== p.id);
      if (a.active.length <= 1) nominate(s);
      else if (a.active.every((id) => a.acted.includes(id))) {
        if (a.price + 30 > s.gold) {
          a.stage = "sold";
          a.owner = undefined;
          log(s, "The next bid exceeds the treasury. Lot withdrawn.");
        } else {
          a.price += 30;
          a.round++;
          a.acted = [];
          log(s, `Bidding rises to ${a.price} gold.`);
        }
      }
      break;
    }
    case "approve": {
      requirePhase("AUCTION");
      const a = s.auction!;
      if (a.stage !== "approval" || p.id in a.approvals)
        throw Error("Cannot vote again");
      a.approvals[p.id] = intent.approve;
      const yes = Object.values(a.approvals).filter(Boolean).length;
      const no = Object.values(a.approvals).filter((v) => !v).length;
      if (yes > s.players.length / 2) purchase(s);
      else if (no >= Math.ceil(s.players.length / 2)) {
        a.stage = "sold";
        a.owner = undefined;
        log(s, "The pact rejects this purchase.");
      }
      break;
    }
    case "reveal": {
      requirePhase("AUCTION");
      const a = s.auction!;
      if (a.revealed || a.stage !== "interest")
        throw Error("Information is unavailable");
      spend(s, 35);
      a.revealed = true;
      log(s, "The veil lifts. Information cost 35 gold.");
      break;
    }
    case "ping": {
      const target = intent.target
        ? [...s.players, ...s.enemies].find((u) => u.id === intent.target)
        : undefined;
      if (intent.target && !target) throw Error("Unknown ping target");
      log(
        s,
        `${p.name}: ${intent.message}${target ? " → " + target.name : ""}`,
      );
      break;
    }
  }
  s.revision++;
  if (s.phase === "COMPLETE" && !s.endedAt) s.endedAt = now;
  return s;
}
export function snapshot(
  s: RunState,
  you: string,
  connected: string[],
): Snapshot {
  const {
    rng: _rng,
    seed,
    auction,
    plans,
    ultimates,
    ...publicState
  } = structuredClone(s);
  return {
    ...publicState,
    you,
    connected,
    locked: Object.keys(plans),
    myPlan: plans[you],
    // Whether a hero has an Ultimate queued is shared — the party plans
    // around it — but, like a plan, where it is aimed is not.
    ...(ultimates
      ? {
          ultimateQueued: Object.keys(ultimates),
          ...(ultimates[you] ? { myUltimate: ultimates[you] } : {}),
        }
      : {}),
    ...(s.phase === "COMPLETE" ? { seed } : {}),
    auction: auction
      ? (() => {
          // itemId and offered both name concealed lots; neither leaves the server.
          const { itemId, offered: _offered, ...a } = auction;
          const item = items.find((i) => i.id === itemId)!;
          return {
            ...a,
            item: a.revealed
              ? item
              : {
                  rarity: item.rarity,
                  slot: item.slot,
                  tags: item.tags.filter((t) => t !== "Cursed"),
                  clue: item.clue,
                },
          };
        })()
      : null,
  };
}
