# Handoff

Updated 2026-09-10 · branch `boss-objectives`, 1 commit ahead of `main`

**Read this first, then `BALANCE.md`.** Everything below is current as of the
last commit. Counts come from `validateContent()`, not memory.

## Where the work lives

The previous session's ten commits are **merged into `main`** (fast-forward, no
merge commit). This session's boss-objective work sits on **`boss-objectives`**,
not merged. Nothing is pushed: the repository still has no remote at all.

## What the game is now

An 8-class cooperative roguelite over a 7-depth branching route. Guest lobby →
hero choice → starting pact → route → chambers → boss → results.

Chambers: combat, elite, exchange (three lots each), veiled lot, event, mentor,
camp, boss. Clearing a fight opens a branch upgrade for every hero. A mentor
teaches one class path per hero, paid from the shared treasury.

Both bosses now fight for an objective and state it before the first round. The
Collector seizes equipment into a Strongbox the party may choose to break open;
the Miser shields itself with whatever gold the treasury is still sitting on.
`GAME_DESIGN.md` has the rules, `BALANCE.md` the evidence.

Content: 8 heroes, 24 class paths across 3 mentors, 48 ability branches, 12
items, 8 normal enemies, 2 bosses, 1 container, 2 elite traits, 12 statuses,
3 events.

Verified at the last commit: production build, 75 automated tests across 9
files. The boss objectives were measured across 486 compositions on two builds
and two policies, but **were not driven in a browser** — reaching a boss by hand
takes a full run, and no shortcut for it exists. That is the first thing to do
if the presentation matters to you.

## What is worth doing next

### 1. Decide what Vanguard and Warden are for

Unchanged as a design question, but the evidence is now much stronger. Both sat
near +15 before this pass; after it they sit at +17 and +21. Making the game
harder made them better, which is what should have been expected: any increase
in difficulty raises the value of not dying. That closes off the whole direction
— the gap will not move by tuning, and it will not move by adding threat either.

It is a design decision. Either accept that the two survivability classes are
the strongest picks, or move some of what they provide into equipment or
consumables so a party can buy what a Vanguard gives. **Do not attempt it as a
numbers pass, and do not attempt it by making the dungeon harder.**

### 2. Two-hero parties took the largest share of the difficulty drop

72% → 63%, against 91% → 86% at four. That is the wrong way round: duos were
already the hardest bracket. The Strongbox scales its health with party size,
but a duo still spends half a round opening it where a quartet spends a
quarter. Containers should be priced against a party's actions, not its
headcount. This is the cleanest small win left.

### 3. The Reaver

Worth re-checking before acting. The last handoff called it the weakest class;
it now reads +3 to +5 in the matrix and appears in the easiest compositions.
Either the healing pass or the objectives moved it. Measure before designing.

### 4. Economy, and consumables

Parties reach the boss with about 50–95 gold in hand — far less than the
results screen suggests, because mean final treasury is counted after the 240
boss reward lands. Consumables would give non-Warden parties something to buy,
and would give a party a way to spend gold down deliberately before the Counting
House, which is currently impossible: see the note on the Miser below.

### 5. Reliability, before anyone outside your group plays it

Unchanged and still real: strict room-revision validation makes simultaneous
commands produce stale rejections — migrate to phase/round epochs. No heartbeat
timeout, AFK handling, room expiry, creation limits or retention policy.

## Things that are true but easy to misread

**"Leftover gold" figures include the boss reward.** The 242–268 recorded in
earlier passes is mostly the 240 prize for winning. This matters more than it
sounds: it is why a treasury-scaled boss shield had to be given an allowance,
and why a first attempt keyed to raw gold would have measured as doing nothing.

**The Miser's shield is currently a penalty, not a decision.** Nothing in the
game lets a party spend gold down on purpose before the boss, so the shield can
only punish hoarding after the fact. It becomes a real route-level decision the
moment consumables exist.

**The `hoard` policy is deliberately a bad bot.** It buys nothing, trains
nobody and never pays for medicine, so its absolute win rates are low and mean
nothing on their own. It exists only to be compared against itself across two
builds. Read it that way or it will look like a regression.

**`scripts/generate-sprites.ts` has never been run end to end.** The API key
works but the account has no prepay credits, which blocks text and image models
alike. Its request shape is confirmed by a billing rejection, not by an
inspected image. Treat the first real run as a review step.

**Class art is generated, not commissioned.** `ASSET_LICENSES.md` records the
provenance of both atlases. Do not describe either as hand-painted. The
Strongbox has no art of its own and falls back to the chest cell.

**Multi-frame animation is still not implemented.** Round playback knows when a
unit acts, is hit, heals or falls, but no such sheet exists.

**Save compatibility is deliberate.** Rooms without `combatVersion: 2` keep
legacy skills, intentions, generation, flat revival prices and unbounded
combat, never see the upgrade or mentor phases, and get bosses with **no
objectives at all**. Schema and content versions remain 1; every field added
this session is optional. Start a new pact to see current rules.

## How to check anything

```sh
npm run build
npm test
npm run simulate -- 25 --matrix                        # all 486 combinations
npm run simulate -- 25 --matrix --policy=tactical,hoard # ...and the hoarder
npm run dev:server                                      # then npm run test:network
```

`--matrix` prints aggregates and tails; `--policy=attack` reproduces the older,
deliberately naive bot for comparison. The runner counts plans the server
rejected and the tests assert that count is zero — a non-zero count means the
policy is proposing illegal actions and every balance number from that run is
worthless.

To compare a change against `main`, put a worktree beside it, symlink
`node_modules`, and copy `scripts/policy.ts` across so both builds are measured
by the _same_ bot. A policy improvement otherwise reads as a balance change.

### Three traps, recorded because each one cost real time

**An instrument that cannot reach a system reports that the system does
nothing.** Branching the route once hid evolutions from the matrix. It happened
twice more this pass: the tactical bot spends down to nearly nothing by the last
chamber, so a treasury-scaled boss shield measured as inert until the `hoard`
policy was written to reach it; and the bot only knew the Warden's Unravel by
name, so the Broker's Liquidate did not count as Barrier counterplay until the
rule was rewritten to select by effect. Both would have read as "the mechanic
does nothing."

**Never read a fight's history out of `s.logs`.** The log is capped at the last
100 entries, so anything that asks "did this happen in this run" silently gets
the answer "not in a long fight". A first attribution pass built on log greps
gave results that were confidently wrong in both directions. Read the end state
instead.

**A rotation slot that deals no damage is a free round.** Giving each boss a
new intention for its objective softened both of them measurably, because they
now spent a third or a quarter of the fight not attacking. Both objectives were
rebuilt to ride an attack the boss already had. If you add an intention to an
enemy, check what you removed from it.
