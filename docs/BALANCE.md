# Balance notebook

Updated 2026-09-10 · experimental values, not a release balance claim

## How these numbers are produced

`npm run simulate` drives the real reducer through complete runs. Two policies
live in `scripts/policy.ts`:

- **attack** — the original bot, preserved unchanged so older readings stay
  comparable. It never protects, interrupts, weakens, repositions or bids, and
  it hands every lot to the first player.
- **tactical** — reads enemy intentions, predicts the round's incoming damage,
  interrupts windups, intercepts lethal hits, strips barriers, weakens the
  biggest attacker, focus-fires without overkill, buys for the hero who fits the
  item and keeps a recovery reserve.

`--matrix` runs all 65 class combinations (10 duos, 20 trios, 35 quartets,
duplicates included) instead of one canonical party per size. This matters: the
old table varied party size and composition together, so nothing it said about
either was trustworthy.

```sh
npm run simulate -- 40                        # both policies, canonical parties
npm run simulate -- 40 --matrix               # every class combination
npm run simulate -- 40 --matrix --policy=tactical
npm run simulate -- 40 --party=ranger,ranger  # one composition
```

The runner counts plans the server rejected. A rejection means the policy asked
for something illegal and silently braced instead, which invalidates the run, so
`tests/simulation.test.ts` asserts the count is zero across every composition.
That check immediately caught a real bug: once an upgrade put a self-heal on the
Arcanist's Spark, the bot classified an enemy-targeted attack as a heal and
aimed it at a wounded ally, so the whole party braced for the rest of the run.

## Current baseline

Treasury 420; Gilded pact +160 gold/−12 max HP, Unbroken +10 max HP. Rewards:
combat 110, elite 180, boss 240. Information 35, camp medicine 120, camp
training 100. Battlefield revival costs 90 and rises 60 per revival already
bought this run. Free camp rest restores 18 standing HP or revives at 15. Item
base values 100–220; asking price is 65% rounded down to tens. Bids rise by 30.
Approval threshold 30%, strict majority, ties reject.

Enemy HP scales with party size (normal 0.75 + players×0.14; boss 0.45 +
players×0.40). Normal enemy count equals player count capped at four. Elite HP
×1.3 with Greedy or Vampiric. Bosses gain a Kiln Mender at three players and a
second support, the Iron Bulwark, at four. Boss half-health phase adds seven
base damage; the Miser additionally adds floor(gold/70). From round 7 every
enemy damage effect grows by 3 per further round. Mark + Precision pays 20;
Weak cuts a direct attack to 65% before Guard.

## Simulation evidence — 40 seeds per composition, 2600 runs per policy

| Bracket          | tactical policy | attack policy |
| ---------------- | --------------: | ------------: |
| 2 players        |             73% |           72% |
| 3 players        |             96% |           60% |
| 4 players        |             94% |           43% |
| with Warden      |             94% |           77% |
| without Warden   |             88% |           26% |
| with Vanguard    |             98% |           64% |
| without Vanguard |             85% |           41% |

Composition spread within each bracket, tactical policy: duos 23–100%, trios
80–100%, quartets 55–100%. Best duo Van+War at 100%; worst Rng+Rng at 23%.
Mean final treasury 661–785 gold.

These are optimal-play ceilings for a bot with perfect information, no
misclicks and no panic. They are not human win rates. Their value is the
_spread_: which party sizes and which classes are treated unfairly.

## What this pass established, and what it overturned

The previous note concluded that healer parties dominate and that parties
without a Warden were the balance problem. That conclusion was an artefact of
the measuring instrument. It holds for the naive bot — without a Warden it wins
26% — but that bot never uses a defensive action at all. Give the same
compositions a policy that protects and interrupts and the Warden gap collapses
to 6 points.

The real outlier was the **Vanguard**, at a 41-point gap, because Intercept was
the party's only answer to a spike and only one class had it. Branching
upgrades, a stronger Weak and a real Exploit payoff brought that to 13 points
without weakening the Vanguard itself: every class can now buy its own sustain
or mitigation, and it costs them damage to do it.

A second finding was a genuine defect rather than a balance number: combat could
fail to terminate. Two Wardens against a fortifying Iron Bulwark traded heals
and shields forever, because nothing in an encounter escalated. Round-7 pressure
fixed it, and the regression test now asserts every composition terminates under
both policies.

## Open concerns

1. **Leftover gold.** Parties still finish holding 660–790 gold against roughly
   1200 earned. Pricing camp training and escalating revivals helped; the deeper
   cause is that a run offers two or three lots and nothing else to buy. This is
   an Economy-gate content problem — consumables, healing alternatives, team
   relics — not a number to nudge, so it is deliberately left open.
2. **Ranger duos.** Rng+Rng at 23% is the worst cell in the matrix. Mono-class
   duos are meant to be hard, but this one is an outlier against Van+Van 53% and
   War+War 72%.
3. **Optimal play is too safe.** 94–96% at three and four players says a party
   that always makes the right call is rarely punished. Closing that needs more
   threat variety and real boss objectives, not larger enemy health pools.
4. **Bot blind spots.** The tactical policy still never repositions, never
   buys information, and bids conservatively because of its flat reserve. Auction
   pressure is therefore under-measured.

## Playtest priorities

1. Two humans experience a useful combo, a branch choice and an auction within
   ten minutes.
2. Check decisions with 2, 3 and 4 people, all class pairs, duplicated classes,
   no Warden and no Vanguard.
3. Confirm the branch choice reads as a real decision rather than an obvious
   pick, and that people can explain their build afterwards.
4. Record planning time and stale-action retries; exact-revision rejection may
   frustrate simultaneous lock-ins.
5. Monitor all-down defeats, whether the rising revival price changes behaviour,
   and time spent as a spirit.
6. Test whether the camp's three priced options genuinely compete.
7. Compare both bosses and elite combinations over at least 20 human runs before
   tuning aggressively.

No telemetry leaves the local environment.
