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

`--matrix` runs all 486 class combinations (36 duos, 120 trios, 330 quartets,
duplicates included) instead of one canonical party per size. This matters: the
old table varied party size and composition together, so nothing it said about
either was trustworthy.

```sh
npm run simulate -- 40                        # both policies, canonical parties
npm run simulate -- 25 --matrix               # every class combination
npm run simulate -- 25 --matrix --full        # ...printing all 486 rows
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

## Simulation evidence — class paths, 486 compositions, 25 seeds each

12,150 runs under the control-aware policy, with mentors on the route.

| Bracket   | win rate | mean final gold |
| --------- | -------: | --------------: |
| 2 players |      92% |             325 |
| 3 players |      93% |             284 |
| 4 players |      92% |             268 |

**Party size stopped mattering.** The previous pass ran 77/92/95 across two,
three and four players. A flat per-hero tuition drawn from one shared purse
turns out to be self-balancing: a duo can afford to evolve both heroes, a
quartet cannot afford four, so the smaller party converts its treasury into
kit at a far better rate. That was not designed, it fell out of pricing
training per hero rather than per party.

Mentors are also the largest gold sink yet added. Mean final treasury fell from
381–463 to 268–325 against roughly 1200 earned.

Class effect, parties containing that class versus parties without:

| Class    | with | without | delta |
| -------- | ---: | ------: | ----: |
| Warden   | 100% |     88% |   +12 |
| Vanguard |  97% |     90% |    +7 |
| Broker   |  93% |     92% |    +1 |
| Herald   |  92% |     92% |     0 |
| Beguiler |  92% |     92% |     0 |
| Arcanist |  89% |     94% |    -5 |
| Ranger   |  89% |     94% |    -5 |
| Reaver   |  86% |     95% |    -9 |

The spread widened from 14 points to 21. Two tunes aimed at the extremes —
softening Lifebinder, which was strictly the best path in the game, and
dropping the Butcher's Guard cost from the most fragile class — moved the
aggregates by less than a point each. That is the finding: **the class gap is
driven by base sustain, not by paths.** A Warden party wins because `mend`
exists, and one swapped ability per run does not change that. Closing it means
revisiting Warden's baseline healing against everyone else's, which is a larger
decision than a path tweak and is deliberately not made here.

The hardest cells are Reaver-heavy parties at 32–48%. The Reaver pays HP for
damage and has no sustain until the Cipher's Bloodbound path, which sits at the
deepest mentor and is often unreachable.

## Earlier evidence — eight classes without paths, 486 compositions

12,150 runs under the control-aware policy. `--matrix` prints aggregates and
the tails; `--full` prints all 486 rows.

| Bracket   | win rate | mean final gold |
| --------- | -------: | --------------: |
| 2 players |      77% |             463 |
| 3 players |      92% |             445 |
| 4 players |      95% |             381 |

Class effect, measured as parties containing that class versus parties without:

| Class    | with | without | delta |
| -------- | ---: | ------: | ----: |
| Warden   |  99% |     90% |    +9 |
| Vanguard |  97% |     91% |    +6 |
| Broker   |  95% |     92% |    +3 |
| Arcanist |  94% |     93% |    +1 |
| Ranger   |  93% |     93% |     0 |
| Beguiler |  93% |     93% |     0 |
| Herald   |  92% |     94% |    -2 |
| Reaver   |  90% |     95% |    -5 |

All eight classes sit inside a 14-point band, against the 41-point Vanguard gap
this development pass started from. The hardest cells are all sustainless duos
— Hrl+Hrl 8%, Rng+Rng 36%, Bgl+Bgl 36%, Rvr+Rvr 40% — which is a coherent
pattern rather than a class being broken: two heroes with no healing and no
protection have no spare action. Every loss in the tails happens at the boss.

The Herald shipped broken and the sweep caught it: at first it was the only
class that made a party _worse_ (84% with, 94% without), with Hrl+Hrl at 0%. A
buffer that spends one of two actions to add 30% to the other is straightforwardly
net-negative in a duo. Making Battle anthem empower the Herald as well as its
target fixed the shape of the ability rather than its numbers, and took
Hrl+Hrl+Hrl from 28% to 96%.

## Earlier evidence — four classes, 40 seeds per composition

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

1. **Difficulty ceiling.** 92–95% at three and four players says an optimal
   party is rarely punished. Equipment abundance from multi-lot exchanges made
   this worse, and the answer is threat-shaped, not another price change: boss
   objectives that change decisions rather than raise numbers. This is now the
   single most valuable open item.
2. **Leftover gold, mostly addressed.** Multi-lot exchanges, a 100% opening ask,
   priced camp training and escalating revivals took mean final treasury from
   660–790 down to 381–463. The Broker's parties end lowest at 336, which is the
   class working as designed. Consumables and healing alternatives would close
   the rest.
3. **Herald duos.** Hrl+Hrl at 8% is the worst cell left. Two pure supports
   with no healing is a defensible worst case, but it is a long way below the
   next-worst duo.
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
