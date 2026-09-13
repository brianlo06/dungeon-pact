import { heroes } from "../src/content/heroes";
import { partyList, run, type Party, type PolicyName } from "./simulate";
import { setPact, setUltimates } from "./policy";

/**
 * What Ultimates do to a run, measured by the same bot with them off and on.
 *
 *   npx tsx scripts/ultimate-report.ts 10                 # every composition, 10 seeds
 *   npx tsx scripts/ultimate-report.ts 10 --sample=4      # every 4th composition
 *   npx tsx scripts/ultimate-report.ts 10 --policy=hoard
 *
 * Off, charge still fills and is never spent, so "off" is the build before
 * Ultimates as far as any result can tell. Every number is per hero of a
 * class, not per party, so a class that turns up twice in a quartet counts
 * twice.
 */

const args = process.argv.slice(2);
const flag = (k: string) =>
  args.find((a) => a.startsWith(`--${k}=`))?.split("=")[1];
const seeds = Number(args.find((a) => /^\d+$/.test(a)) ?? 10);
const sample = Number(flag("sample") ?? 1);
const policy = (flag("policy") ?? "tactical") as PolicyName;
const pact = flag("pact");
if (pact === "wealth" || pact === "vitality") setPact(pact);

const parties: Party[] = [2, 3, 4]
  .flatMap((n) => partyList(n))
  .filter((_, i) => i % sample === 0);

interface Tally {
  runs: number;
  wins: number;
  bySize: Record<number, { runs: number; wins: number }>;
  heroes: Record<string, number>;
  uses: Record<string, number>;
  charge: Record<string, number>;
  bossRuns: number;
  bossUses: number;
  bossFightsWithUltimate: number;
  damage: number;
  support: number;
  totalDamage: number;
  invalid: number;
  reasons: string[];
}

const only = flag("only")?.split(",");
function measure(on: boolean): Tally {
  setUltimates(on, only);
  const t: Tally = {
    runs: 0,
    wins: 0,
    bySize: {},
    heroes: {},
    uses: {},
    charge: {},
    bossRuns: 0,
    bossUses: 0,
    bossFightsWithUltimate: 0,
    damage: 0,
    support: 0,
    totalDamage: 0,
    invalid: 0,
    reasons: [],
  };
  for (const party of parties)
    for (let i = 0; i < seeds; i++) {
      const r = run(`ultimate-${i}`, party, policy);
      t.runs++;
      const won = r.state.outcome === "victory";
      if (won) t.wins++;
      const size = (t.bySize[party.length] ??= { runs: 0, wins: 0 });
      size.runs++;
      if (won) size.wins++;
      for (const h of party) t.heroes[h] = (t.heroes[h] ?? 0) + 1;
      for (const [h, n] of Object.entries(r.ultimates))
        t.uses[h] = (t.uses[h] ?? 0) + n;
      for (const [h, n] of Object.entries(r.charge))
        t.charge[h] = (t.charge[h] ?? 0) + n;
      if (r.depth >= 6) {
        t.bossRuns++;
        t.bossUses += r.bossUltimates;
        if (r.bossUltimates) t.bossFightsWithUltimate++;
      }
      t.damage += r.ultimateDamage;
      t.support += r.ultimateSupport;
      t.totalDamage += r.state.players.reduce((n, p) => n + p.damage, 0);
      t.invalid += r.invalid;
      t.reasons.push(...r.invalidReasons.slice(0, 2));
    }
  return t;
}

const pct = (a: number, b: number) =>
  b ? `${Math.round((a / b) * 100)}%` : "-";
const off = args.includes("--on-only") ? measure(true) : measure(false);
const on = measure(true);

console.log(
  `policy=${policy} seeds=${seeds} compositions=${parties.length} runs=${on.runs}`,
);
console.log("\nwin rate          off     on");
for (const n of [2, 3, 4])
  console.log(
    `${n} players`.padEnd(16),
    pct(off.bySize[n]?.wins ?? 0, off.bySize[n]?.runs ?? 0).padStart(5),
    pct(on.bySize[n]?.wins ?? 0, on.bySize[n]?.runs ?? 0).padStart(6),
  );
console.log(
  "all".padEnd(16),
  pct(off.wins, off.runs).padStart(5),
  pct(on.wins, on.runs).padStart(6),
);

console.log("\nper hero, per run   uses   charge earned");
for (const h of heroes) {
  const n = on.heroes[h.id] ?? 0;
  if (!n) continue;
  console.log(
    h.name.padEnd(18),
    ((on.uses[h.id] ?? 0) / n).toFixed(2).padStart(5),
    Math.round((on.charge[h.id] ?? 0) / n)
      .toString()
      .padStart(8),
  );
}
console.log(
  `\nboss fights reached: ${on.bossRuns}; with at least one Ultimate: ${pct(on.bossFightsWithUltimate, on.bossRuns)}; Ultimates per boss fight: ${(on.bossUses / Math.max(1, on.bossRuns)).toFixed(2)}`,
);
console.log(
  `Ultimate share of all hero damage: ${pct(on.damage, on.totalDamage)}; healing and Barrier from Ultimates per run: ${Math.round(on.support / on.runs)}`,
);
if (on.invalid || off.invalid)
  console.log(`REJECTED: ${on.invalid + off.invalid}`, on.reasons.slice(0, 6));
