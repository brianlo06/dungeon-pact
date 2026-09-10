import { createRun, addPlayer, reduce } from "../src/engine/game";
import { heroes } from "../src/content/heroes";
import type { RunState } from "../src/shared/model";
import type { Intent } from "../src/shared/protocol";
import { policies, type Policy } from "./policy";

export type Party = string[];
export type PolicyName = keyof typeof policies;

export interface RunResult {
  state: RunState;
  party: Party;
  policy: string;
  /** Plans the policy proposed that the server refused. Should always be zero. */
  invalid: number;
  /** Depth reached when the run ended; the boss sits at depth 6. */
  depth: number;
  revives: number;
  campSpend: number;
  auctionSpend: number;
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
  let steps = 0;
  let invalid = 0;
  let campSpend = 0;
  let auctionSpend = 0;
  let auctionEntry: number | null = null;
  const send = (id: string, intent: Intent) => {
    s = reduce(s, id, intent, steps * 1000);
  };
  roster.forEach((_, i) => addPlayer(s, `p${i}`, `Hero ${i}`));
  roster.forEach((heroId, i) => {
    send(`p${i}`, { type: "hero", hero: heroId });
    send(`p${i}`, { type: "ready", ready: true });
  });
  send("p0", { type: "start" });
  while (s.phase !== "COMPLETE" && steps++ < 900) {
    if (s.phase === "AUCTION" && auctionEntry === null) auctionEntry = s.spent;
    if (s.phase !== "AUCTION" && auctionEntry !== null) {
      auctionSpend += s.spent - auctionEntry;
      auctionEntry = null;
    }
    if (["PACT", "MAP", "EVENT", "CAMP"].includes(s.phase)) {
      const p = s.players.find((p) => !s.votes[p.id])!;
      const before = s.gold;
      const wasCamp = s.phase === "CAMP";
      send(p.id, { type: "vote", choice: policy.vote(s, p) });
      if (wasCamp && s.gold < before) campSpend += before - s.gold;
    } else if (s.phase === "COMBAT") {
      const p = s.players.find((p) => p.hp > 0 && !p.fallen && !s.plans[p.id])!;
      const choice = policy.plan(s, p);
      try {
        send(p.id, { type: "plan", ...choice });
      } catch {
        invalid++;
        const fallback = { ability: "brace", target: p.id };
        send(p.id, { type: "plan", ...fallback });
      }
    } else if (s.phase === "UPGRADE") {
      const p = s.players.find((p) => !s.votes[p.id])!;
      send(p.id, { type: "upgrade", choice: policy.upgrade(s, p) });
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
    depth: s.map.find((n) => n.id === s.currentNode)?.depth ?? 0,
    revives: s.players.reduce((n, p) => n + p.revives, 0),
    campSpend,
    auctionSpend,
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
  for (let i = 0; i < seeds; i++) {
    const r = run(`${prefix}-${i}`, party, policyName);
    if (r.state.outcome === "victory") wins++;
    else {
      losses++;
      lossDepth += r.depth;
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
  };
}

const short: Record<string, string> = {
  vanguard: "Van",
  arcanist: "Arc",
  ranger: "Rng",
  warden: "War",
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
  const only = flag("party")?.split(",");
  const matrix = args.includes("--matrix");
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
    table(rows);
    if (matrix) {
      const bucket = (keep: (p: Party) => boolean, label: string) => {
        const set = rows.filter((r, i) => keep(parties[i]));
        if (!set.length) return;
        const wins = set.reduce((n, r) => n + r.wins, 0);
        const runs = set.reduce((n, r) => n + r.runs, 0);
        const gold =
          set.reduce((n, r) => n + r.averageFinalGold, 0) / set.length;
        console.log(
          `${label}: ${wins}/${runs} wins (${Math.round((wins / runs) * 100)}%), mean final gold ${Math.round(gold)}`,
        );
      };
      console.log("");
      for (const n of [2, 3, 4])
        bucket((p) => p.length === n, `${n} players            `);
      bucket((p) => p.includes("warden"), "with Warden          ");
      bucket((p) => !p.includes("warden"), "without Warden       ");
      bucket((p) => p.includes("vanguard"), "with Vanguard        ");
      bucket((p) => !p.includes("vanguard"), "without Vanguard     ");
    }
    const invalid = rows.reduce((n, r) => n + r.invalidPlans, 0);
    if (invalid) console.log(`REJECTED PLANS: ${invalid} — policy bug`);
  }
}
