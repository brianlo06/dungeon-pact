import type { RunState, Player, Snapshot } from "../shared/model";
import type { Intent } from "../shared/protocol";
import { hero } from "../content/heroes";
import { items } from "../content/items";
import { events } from "../content/events";
import { hashSeed, pick } from "./rng";
import { generateMap, availableNodes } from "./map";
import { log, spend, gain } from "./effects";
import {
  enterCombat,
  enterUpgrade,
  validatePlan,
  resolveRound,
  standing,
} from "./combat";
import { upgradeOffer } from "../content/upgrades";
import { enterAuction, nextLot, nominate, purchase } from "./auction";
export function createRun(room: string, seed: string): RunState {
  return {
    encounterVersion: 2,
    combatVersion: 2,
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
    hp: h.hp,
    maxHp: h.hp,
    power: h.power,
    guard: h.guard,
    speed: h.speed,
    row: "front",
    statuses: [],
    resource: h.maxResource,
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
function finishVote(s: RunState, result: string) {
  s.votes = {};
  if (s.phase === "PACT") {
    s.pact = result;
    if (result === "wealth") {
      gain(s, 160);
      for (const p of s.players) {
        p.maxHp -= 12;
        p.hp = p.maxHp;
      }
    } else
      for (const p of s.players) {
        p.maxHp += 10;
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
    else if (n.type === "auction" || n.type === "mystery")
      enterAuction(s, n.type === "mystery");
    else if (n.type === "event") {
      s.eventId = pick(s, events).id;
      s.phase = "EVENT";
    } else s.phase = "CAMP";
    return;
  }
  if (s.phase === "EVENT") {
    const c = events
      .find((e) => e.id === s.eventId)!
      .choices.find((c) => c.id === result)!;
    spend(s, c.cost);
    if (c.gold) gain(s, c.gold);
    for (const p of s.players)
      if (p.hp > 0) p.hp = Math.max(1, Math.min(p.maxHp, p.hp + c.heal));
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
      requirePhase("PACT", "MAP", "EVENT", "CAMP");
      if (s.votes[p.id]) throw Error("Your vote is already locked");
      const choices =
        s.phase === "PACT"
          ? ["wealth", "vitality"]
          : s.phase === "MAP"
            ? availableNodes(s).map((n) => n.id)
            : s.phase === "CAMP"
              ? ["rest", "restore", "train"]
              : events
                  .find((e) => e.id === s.eventId)!
                  .choices.map((c) => c.id);
      if (!choices.includes(intent.choice)) throw Error("Invalid choice");
      const cost =
        s.phase === "CAMP"
          ? (campCosts[intent.choice] ?? 0)
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
    case "continue":
      requirePhase("REWARD", "AUCTION");
      if (s.phase === "AUCTION") {
        if (s.auction?.stage !== "sold") throw Error("Auction is not complete");
        // An exchange runs several lots; only the last one returns to the map.
        if (nextLot(s)) break;
      }
      s.phase = "MAP";
      s.auction = null;
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
    case "ping":
      log(s, `${p.name}: ${intent.message}`);
      break;
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
    ...publicState
  } = structuredClone(s);
  return {
    ...publicState,
    you,
    connected,
    locked: Object.keys(plans),
    myPlan: plans[you],
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
