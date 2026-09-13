import { createRun, addPlayer, reduce } from "../src/engine/game";
import { heroes } from "../src/content/heroes";
import { items } from "../src/content/items";
import type { RunState } from "../src/shared/model";
import type { Intent } from "../src/shared/protocol";
import {
  policies,
  type Policy,
  setPact,
  setUltimates,
  ultimatesOn,
} from "./policy";
import { ultimate as ultimateDef } from "../src/content/ultimates";

export type Party = string[];
export type PolicyName = keyof typeof policies;

export interface RunResult {
  state: RunState;
  party: Party;
  policy: string;
  /** Plans the policy proposed that the server refused. Should always be zero. */
  invalid: number;
  /** Why they were refused. A count with no reason is a bug you cannot chase. */
  invalidReasons: string[];
  /** Depth reached when the run ended; the boss sits at depth 6. */
  depth: number;
  /**
   * Where a lost run ended, as `floor:chamber`, e.g. `2:boss`. Null for a win.
   * The handoff has asked for this for a while: every attempt to close the duo
   * gap was a guess about where duos die, and none of the guesses measured it.
   */
  lostAt: string | null;
  revives: number;
  campSpend: number;
  /** Gold spent on gear. The exchange is a shop now; the name outlived it. */
  auctionSpend: number;
  /** Supplies bought and spent. Counted by diffing packs: the chronicle is
   * capped at 100 entries and cannot be asked what happened in a long run. */
  suppliesBought: number;
  suppliesUsed: number;
  /** Ultimates resolved this run, by class; and in the boss fight alone. */
  ultimates: Record<string, number>;
  bossUltimates: number;
  /** Pact Charge earned this run, by class, summed over that class's heroes. */
  charge: Record<string, number>;
  /** Health an Ultimate removed from enemies, and restored or warded on heroes. */
  ultimateDamage: number;
  ultimateSupport: number;
}

const compositions = (
  count: number,
  pool = heroes.map((h) => h.id),
): Party[] =>
  count === 0
    ? [[]]
    : pool.flatMap((id, i) =>
        compositions(count - 1, pool.slice(i)).map((rest) => [id, ...rest]),
      );

export function partyList(size: number): Party[] {
  return compositions(size);
}

export function run(
  seed: string,
  party: Party | number,
  policyName: PolicyName = "attack",
): RunResult {
  const roster =
    typeof party === "number"
      ? heroes.slice(0, party).map((h) => h.id)
      : [...party];
  const policy: Policy = policies[policyName];
  let s = createRun("SIMULATE", seed);
  // With Ultimates off the room is one made before they existed — no charge
  // and the boss's old price — so "off" measures the build before them.
  if (!ultimatesOn) delete s.ultimateVersion;
  let steps = 0;
  let invalid = 0;
  const invalidReasons: string[] = [];
  let campSpend = 0;
  let auctionSpend = 0;
  let suppliesBought = 0;
  let suppliesUsed = 0;
  let auctionEntry: number | null = null;
  const supplyIds = new Set(
    items.filter((i) => i.slot === "supply").map((i) => i.id),
  );
  const packed = () =>
    s.players.reduce(
      (n, p) => n + p.items.filter((id) => supplyIds.has(id)).length,
      0,
    );
  const ultimates: Record<string, number> = {};
  const charge: Record<string, number> = {};
  let bossUltimates = 0;
  let ultimateDamage = 0;
  let ultimateSupport = 0;
  const send = (id: string, intent: Intent) => {
    const before = packed();
    const meters = new Map(s.players.map((p) => [p.id, p.ultimateCharge ?? 0]));
    const seen = s.eventSeq;
    s = reduce(s, id, intent, steps * 1000);
    const change = packed() - before;
    if (change > 0) suppliesBought += change;
    else suppliesUsed -= change;
    // Charge earned, counted as it rises, so a spent meter is not a loss.
    for (const p of s.players) {
      const gained = (p.ultimateCharge ?? 0) - (meters.get(p.id) ?? 0);
      if (gained > 0) charge[p.heroId] = (charge[p.heroId] ?? 0) + gained;
    }
    // Ultimates, read from this command's own beats — never from the capped
    // chronicle as a whole, which cannot say what happened earlier in a run.
    let caster: string | null = null;
    for (const l of s.logs.filter((l) => l.seq > seen && l.beat)) {
      const b = l.beat!;
      if (b.kind === "cast") {
        caster = b.ultimate ? (b.actor ?? null) : null;
        if (b.ultimate) {
          const hero = ultimateDef(b.ultimate)!.heroId;
          ultimates[hero] = (ultimates[hero] ?? 0) + 1;
          if (s.map.find((n) => n.id === s.currentNode)?.type === "boss")
            bossUltimates++;
        }
        continue;
      }
      if (!caster || b.actor !== caster) continue;
      if (b.kind === "damage" && b.target !== caster)
        ultimateDamage += b.amount ?? 0;
      if (b.kind === "heal" || b.kind === "ward")
        ultimateSupport += b.amount ?? 0;
    }
  };
  roster.forEach((_, i) => addPlayer(s, `p${i}`, `Hero ${i}`));
  roster.forEach((heroId, i) => {
    send(`p${i}`, { type: "hero", hero: heroId });
    send(`p${i}`, { type: "ready", ready: true });
  });
  send("p0", { type: "start" });
  while (s.phase !== "COMPLETE" && steps++ < 900) {
    const shopping = s.phase === "AUCTION" || s.phase === "SHOP";
    if (shopping && auctionEntry === null) auctionEntry = s.spent;
    if (!shopping && auctionEntry !== null) {
      auctionSpend += s.spent - auctionEntry;
      auctionEntry = null;
    }
    if (["PACT", "MAP", "EVENT", "CAMP", "TOLL"].includes(s.phase)) {
      const p = s.players.find((p) => !s.votes[p.id])!;
      const before = s.gold;
      const wasCamp = s.phase === "CAMP";
      send(p.id, { type: "vote", choice: policy.vote(s, p) });
      if (wasCamp && s.gold < before) campSpend += before - s.gold;
    } else if (s.phase === "COMBAT") {
      const p = s.players.find((p) => p.hp > 0 && !p.fallen && !s.plans[p.id])!;
      const aim = policy.ultimate?.(s, p);
      if (aim)
        try {
          send(p.id, { type: "ultimate", target: aim });
        } catch (error) {
          invalid++;
          invalidReasons.push(
            `${p.heroId} ultimate→${aim}: ${(error as Error).message}`,
          );
        }
      const choice = policy.plan(s, p);
      try {
        send(p.id, { type: "plan", ...choice });
      } catch (error) {
        invalid++;
        invalidReasons.push(
          `${p.heroId} ${choice.ability}→${choice.target}: ${(error as Error).message}`,
        );
        const fallback = { ability: "brace", target: p.id };
        send(p.id, { type: "plan", ...fallback });
      }
    } else if (s.phase === "MENTOR") {
      const p = s.players.find((p) => !(s.trained ?? []).includes(p.id))!;
      send(p.id, { type: "train", accept: policy.train(s, p) });
    } else if (s.phase === "UPGRADE") {
      const p = s.players.find((p) => !s.votes[p.id])!;
      send(p.id, { type: "upgrade", choice: policy.upgrade(s, p) });
    } else if (s.phase === "SHRINE") {
      const p = s.players.find((p) => !s.shrine!.answered.includes(p.id))!;
      send(p.id, { type: "shrine", offering: policy.shrine(s, p) });
    } else if (s.phase === "SHOP") {
      const shop = s.shop!;
      if (shop.proposal) {
        const voter = s.players.find((p) => !(p.id in shop.proposal!.votes))!;
        send(voter.id, {
          type: "shopApprove",
          approve: policy.approve(s, voter),
        });
      } else {
        const buy = policy.shop(s);
        if (buy)
          send(s.players[0].id, {
            type: "shopOffer",
            item: buy.item,
            recipient: buy.recipient,
          });
        else
          send(s.players.find((p) => !shop.leaving.includes(p.id))!.id, {
            type: "continue",
          });
      }
    } else if (s.phase === "AUCTION") {
      const a = s.auction!;
      if (a.stage === "interest") {
        if (policy.reveal(s)) {
          send(s.players[0].id, { type: "reveal" });
          continue;
        }
        const p = s.players.find((p) => !a.acted.includes(p.id))!;
        send(p.id, { type: "interest", interested: policy.interest(s, p) });
      } else if (a.stage === "bidding") {
        const p = s.players.find(
          (p) => a.active.includes(p.id) && !a.acted.includes(p.id),
        )!;
        send(p.id, { type: "bid", stay: policy.bid(s, p) });
      } else if (a.stage === "approval") {
        const p = s.players.find((p) => !(p.id in a.approvals))!;
        send(p.id, { type: "approve", approve: policy.approve(s, p) });
      } else send("p0", { type: "continue" });
    } else if (s.phase === "REWARD") send("p0", { type: "continue" });
    else throw Error(`Simulation stalled in ${s.phase}`);
    if (s.gold < 0 || s.players.some((p) => p.hp < 0 || p.hp > p.maxHp))
      throw Error(`Invariant failed on ${seed}`);
  }
  if (auctionEntry !== null) auctionSpend += s.spent - auctionEntry;
  if (s.phase !== "COMPLETE")
    throw Error(`Simulation exceeded action budget: ${seed}`);
  return {
    state: s,
    party: roster,
    policy: policy.name,
    invalid,
    invalidReasons,
    depth: s.map.find((n) => n.id === s.currentNode)?.depth ?? 0,
    lostAt:
      s.outcome === "victory"
        ? null
        : `${s.floor ?? 1}:${s.map.find((n) => n.id === s.currentNode)?.type ?? "?"}`,
    revives: s.players.reduce((n, p) => n + p.revives, 0),
    campSpend,
    auctionSpend,
    suppliesBought,
    suppliesUsed,
    ultimates,
    bossUltimates,
    charge,
    ultimateDamage,
    ultimateSupport,
  };
}

export function simulate(
  seed: string,
  party: Party | number,
  policyName: PolicyName = "attack",
): RunState {
  return run(seed, party, policyName).state;
}

export interface Summary {
  label: string;
  players: number;
  runs: number;
  wins: number;
  winRate: number;
  averageFinalGold: number;
  averageAuctionSpend: number;
  averageCampSpend: number;
  averageRevives: number;
  averageDefeatDepth: number | null;
  invalidPlans: number;
  /** Where each lost run ended, as `floor:chamber`. */
  lossesAt: string[];
}

export function summarise(
  label: string,
  party: Party,
  seeds: number,
  policyName: PolicyName,
  prefix = "balance",
): Summary {
  let wins = 0,
    gold = 0,
    auction = 0,
    camp = 0,
    revives = 0,
    invalid = 0,
    losses = 0,
    lossDepth = 0;
  const lossesAt: string[] = [];
  for (let i = 0; i < seeds; i++) {
    const r = run(`${prefix}-${i}`, party, policyName);
    if (r.state.outcome === "victory") wins++;
    else {
      losses++;
      lossDepth += r.depth;
      if (r.lostAt) lossesAt.push(r.lostAt);
    }
    gold += r.state.gold;
    auction += r.auctionSpend;
    camp += r.campSpend;
    revives += r.revives;
    invalid += r.invalid;
  }
  const mean = (n: number) => Math.round(n / seeds);
  return {
    label,
    players: party.length,
    runs: seeds,
    wins,
    winRate: Number((wins / seeds).toFixed(2)),
    averageFinalGold: mean(gold),
    averageAuctionSpend: mean(auction),
    averageCampSpend: mean(camp),
    averageRevives: Number((revives / seeds).toFixed(2)),
    averageDefeatDepth: losses ? Number((lossDepth / losses).toFixed(1)) : null,
    invalidPlans: invalid,
    lossesAt,
  };
}

const short: Record<string, string> = {
  vanguard: "Van",
  arcanist: "Arc",
  ranger: "Rng",
  warden: "War",
  broker: "Brk",
  herald: "Hrl",
  reaver: "Rvr",
  beguiler: "Bgl",
};
const name = (party: Party) => party.map((h) => short[h] ?? h).join("+");

function table(rows: Summary[]) {
  const head = [
    "party",
    "n",
    "win%",
    "gold",
    "auction",
    "camp",
    "rev",
    "loss@",
  ];
  const body = rows.map((r) => [
    r.label,
    String(r.runs),
    String(Math.round(r.winRate * 100)),
    String(r.averageFinalGold),
    String(r.averageAuctionSpend),
    String(r.averageCampSpend),
    String(r.averageRevives),
    r.averageDefeatDepth === null ? "-" : String(r.averageDefeatDepth),
  ]);
  const widths = head.map((h, i) =>
    Math.max(h.length, ...body.map((row) => row[i].length)),
  );
  const line = (cells: string[]) =>
    cells.map((c, i) => c.padEnd(widths[i])).join("  ");
  console.log(line(head));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of body) console.log(line(row));
}

if (process.argv[1]?.endsWith("simulate.ts")) {
  const args = process.argv.slice(2);
  const flag = (key: string) =>
    args.find((a) => a.startsWith(`--${key}=`))?.split("=")[1];
  const seeds = Number(
    args.find((a) => /^\d+$/.test(a)) ?? flag("seeds") ?? 30,
  );
  const chosen = (flag("policy") ?? "both").split(",");
  const names = (chosen[0] === "both" ? ["attack", "tactical"] : chosen).filter(
    (n): n is PolicyName => n in policies,
  );
  // Accept either full ids or the short labels the tables print.
  const byShort = Object.fromEntries(
    Object.entries(short).map(([id, label]) => [label.toLowerCase(), id]),
  );
  const only = flag("party")
    ?.split(",")
    .map((n) => byShort[n.toLowerCase()] ?? n);
  const ult = flag("ultimates");
  if (ult === "off") setUltimates(false);
  else if (ult && ult !== "on") throw Error(`Unknown --ultimates=${ult}`);
  const pact = flag("pact");
  if (pact === "wealth" || pact === "vitality") setPact(pact);
  else if (pact) throw Error(`Unknown pact ${pact}`);
  const matrix = args.includes("--matrix");
  const full = args.includes("--full");
  for (const policyName of names) {
    console.log(`\npolicy=${policyName}  seeds=${seeds}`);
    const parties: Party[] = only
      ? [only]
      : matrix
        ? [2, 3, 4].flatMap((n) => partyList(n))
        : [2, 3, 4].map((n) => heroes.slice(0, n).map((h) => h.id));
    const rows = parties.map((party) =>
      summarise(name(party), party, seeds, policyName),
    );
    if (!matrix || full) table(rows);
    if (matrix) {
      // A full sweep is hundreds of rows; the useful signal is the aggregates
      // and the tails, so print those and keep the table behind --full.
      const bucket = (keep: (p: Party) => boolean, label: string) => {
        const set = rows.filter((_, i) => keep(parties[i]));
        if (!set.length) return;
        const wins = set.reduce((n, r) => n + r.wins, 0);
        const runs = set.reduce((n, r) => n + r.runs, 0);
        const gold =
          set.reduce((n, r) => n + r.averageFinalGold, 0) / set.length;
        console.log(
          `${label.padEnd(22)} ${String(Math.round((wins / runs) * 100)).padStart(3)}%  ${wins}/${runs}  gold ${Math.round(gold)}`,
        );
      };
      console.log(`\n${rows.length} compositions`);
      // Where each party size loses, so a gap can be traced to a chamber
      // rather than argued about.
      for (const n of [2, 3, 4]) {
        const losses = rows
          .filter((_, i) => parties[i].length === n)
          .flatMap((r) => r.lossesAt);
        const tally = new Map<string, number>();
        for (const at of losses) tally.set(at, (tally.get(at) ?? 0) + 1);
        const top = [...tally.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([at, k]) => `${at} ${Math.round((k / losses.length) * 100)}%`)
          .join("  ");
        console.log(`  ${n}p losses (${losses.length}): ${top}`);
      }
      for (const n of [2, 3, 4]) bucket((p) => p.length === n, `${n} players`);
      console.log("");
      for (const h of heroes) {
        bucket((p) => p.includes(h.id), `with ${short[h.id]}`);
        bucket((p) => !p.includes(h.id), `  without ${short[h.id]}`);
      }
      const ranked = [...rows].sort((a, b) => a.winRate - b.winRate);
      console.log("\nhardest compositions");
      table(ranked.slice(0, 10));
      console.log("\neasiest compositions");
      table(ranked.slice(-6));
    }
    const invalid = rows.reduce((n, r) => n + r.invalidPlans, 0);
    if (invalid) console.log(`REJECTED PLANS: ${invalid} — policy bug`);
  }
}
