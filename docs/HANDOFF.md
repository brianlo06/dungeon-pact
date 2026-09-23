# Handoff

Updated 2026-09-22 · `attack-choreography` at `5c6b7fd` · production Worker
version `201a2f59`, deployed 2026-09-18.

> **Everything is merged and live.** Ultimates (all 32), three floors and six
> bosses with cinematic intros, open training, damage on intent chips, and the
> Cistern and Archive creatures all landed through PRs #7–#12 and are deployed.
> There is no work-in-progress branch. Each feature is gated on a room flag —
> `ultimateVersion`, `bossVersion`, `trainingVersion`, `factionVersion` — so a
> room created before a deploy keeps the rules it started with, and **a change
> is only visible in a room created after it ships**.
>
> Read [ENEMY_DESIGN.md](ENEMY_DESIGN.md) before adding a creature,
> [ULTIMATES.md](ULTIMATES.md) before touching an Ultimate or a boss number
> (`BOSS_PRICING`), [BOSSES.md](BOSSES.md) for the six bosses and the
> difficulty tuning, and [BALANCE.md](BALANCE.md) for every measurement.
> [PHASE1_EXPANSION.md](PHASE1_EXPANSION.md) covers the equipment catalog,
> events, trading, provisions and team relics.

## Read this first: the playtest answers

The game has been played by the user and their friends, and the last round of
work answers what they said. Their words, and where each one went:

1. _"last turn when beating enemy, it doesnt show the animation of the enemy
   getting defeated"_ — fixed. The client used to unmount combat the instant
   the server said the chamber was won. See `battle/useCombatExit.ts`.
2. _"the gilded one is just plainly bad and theres no reason to pick that
   one"_ — fixed, and **measured for the first time**. Both simulation
   policies hard-coded the other pact, so the Gilded had never appeared in any
   number this project has printed. `--pact=` reaches it now.
3. _"we moved to the other lane so we wouldnt get hit... the monster hit us
   anyway"_ — fixed. Row attacks resolved against their target's _current_
   row. They now resolve against the row announced with the intention.
4. _"i dont like the auction system... rather... just name it a shop system"_ —
   done. `engine/shop.ts` replaced it; `engine/auction.ts` stays only for rooms
   that entered an auction before the change.
5. _"the character sprites could use a rework"_ — a first pass, in the
   direction they chose (_dark illustrated cutouts, sharper silhouettes, less
   chibi_). Proportions, necks and build; `ART_DIRECTION.md` has what was done
   and what was deliberately left. **This is the item most likely to want
   another round**, because it is the only one whose "done" is a matter of
   taste rather than a measurement.
6. _"the buffs/debuffs/barrier indicators in battle are not very clear"_ —
   Barrier is named and numbered, statuses summarise, and either opens a panel.
7. _"you automatically lock the same move as the previous turn, and every turn
   you have to press the back button"_ — fixed. The ability, target and fan
   mode were component state that outlived the round. Each round now starts at
   the ability list.
8. _"the evolutions are locked and tied to their specific character/class...
   for my teammates, they can train to increase their stats but not evolve"_ —
   done, and the premise is worth recording because it was half wrong. Paths
   were _already_ class-locked by identity: no Ranger could ever take the
   Vanguard's. What was wrong is that every mentor taught all eight classes, so
   everyone evolved at every mentor and a path felt like nobody's. A ground now
   draws one class from the party; everyone else drills for stats. This also
   moved duos from 75% to 84% — see item 2 below, which it half answers.

A second round of feedback followed, and `CHANGELOG.md` 0.14 has the detail:

9. _"the game was done after beating 1 boss, make it so we can go onto more
   floors"_ — two floors, the Collector then the Miser. `content/floors.ts`.
10. _"rework the map... it is a bit unclear and colliding"_ — links are measured
    off the rendered cards. `useRouteGeometry` in `RunScreens.tsx`.
11. _"make the character's stamina more visible... health more easily"_ —
    figures in the health bar, resource pips under it.
12. _"brainstorm more ideas for different types of stages"_ and _"add a resting
    area"_ — the rest already existed (the camp) but a route could skip it;
    every floor now ends in a guaranteed rest before its boss. Four chambers
    were chosen from a brainstorm and built: toll gate, hazard chamber, shrine,
    workbench. `engine/chambers.ts`, and the workbench in `engine/shop.ts`.

`CHANGELOG.md` 0.13 and 0.14 have the detail of those rounds. Three rounds of
work have shipped since: the Ultimates, the three-floor build with six bosses
and their intros, and the enemy expansion's first wave. **None of that has been
played by the user and their friends yet** — the next playtest is the most
valuable thing anyone can do to this project.

**Read this first, then [BALANCE.md](BALANCE.md).** Inventory counts come from
`validateContent()`, not memory; balance numbers come from
`scripts/simulate.ts`, never from recollection.

## Where the work lives

**`attack-choreography` is the working line, not `main`.** It is what
production serves; `main` stopped at PR #4 and has not been updated since.
Start new work on a branch off `origin/attack-choreography` and land it through
a pull request into that branch. The repository is a private GitHub repo,
`brianlo06/dungeon-pact`.

What has landed there, newest first: #12 the Cistern and Archive creatures,
#11 damage on intent chips, #10 open training, #9 three floors and six bosses
with intros, #8 leaving a pact, #7 all 32 Ultimates, #6 lobby picks and chance
events, #5 attack choreography. Every branch is merged with a merge commit, so
each commit's reasoning survives.

**Deploying** is `npm run build` then `npx wrangler deploy` from a clean
worktree checked out at the merge commit (`/Users/brianlo/dungeon-pact-deploy`
is kept for this, with `node_modules` symlinked). The user decides when to
merge and when to deploy; do not do either without being asked.

Work is done in git worktrees beside the main checkout, never in the main
checkout itself, because other sessions are usually running there. Each browser
suite needs its own dev server: pass `PW_PORT` so two checkouts cannot point at
each other's server.

Codex is working in the same tree on presentation. Its boss preview harness
(`src/dev/`, `dev/bosses.html`, `docs/BOSS_PREVIEW.md`) is committed alongside
this work at the user's direction and has grown into the Battle Lab the browser
tests run against. The `BossObjective` component it added was removed when
combat moved onto one battlefield; the objective now sits in the combat strip.
`npm run build` excludes the preview from production.

## What the game is now

An 8-class cooperative roguelite over **three floors**, each a branching route
of six chambers ending in its own boss. Guest lobby → hero choice → starting
pact → floor → chambers → boss → the next floor down → results.

Chambers: combat, elite, shop, veiled counter, event, mentor, camp, toll,
hazard, shrine, workbench, boss. Clearing a fight opens a branch upgrade for
every hero; a training ground teaches every hero in a party of three or four
who has not yet taken a path.

Each floor draws its boss from a pool of two, and each boss fights for a stated
objective: the Collector seizes equipment into a breakable Strongbox, the
Assayer pours a crucible that cracks under enough damage, the Miser shields
itself with the treasury you never spent, the Salvor grows plates that harden
unless broken soft, the Notary presses wax seals on a countdown, the Bailiff
serves liens that come due. Every boss opens with a ~5.5s cinematic entrance
(skippable, with a reduced-motion still).

Every hero has an Ultimate on a charge meter, each with its own authored film.

Each region now fields its own creatures (`factionVersion`): the Foundry's
eight, the Cistern's four plus the elite Pressure Engine, and the Archive's
four. Enemies choose their intent from rules that read visible state, and the
chip says what they will do, to whom, for how much, and why.

Content, counted by `validateContent()` rather than memory: 8 heroes, 24 class
paths across 3 mentors, 48 ability branches, 32 Ultimates, 32 items and 6
supplies, 16 regular enemies (8 foundry, 4 cistern, 4 archive), 1 elite-only
creature, 6 bosses, 5 objects, 2 elite traits, 17 statuses, 15 events, 26
authored encounters (9 foundry, 9 cistern, 8 archive), 3 floors.

Every combatant is now drawn: all eight heroes and every enemy are authored
SVG cutout rigs with named moving parts. Only the auctioneer and the reward
chest still come from the generated atlas. `ART_DIRECTION.md` has the direction
for each figure and why the medium changed.

Verified at `5c6b7fd`: **675 unit tests across 70 files**, a production build,
and the browser suite — 1,732 checks across 48 spec files at four resolutions,
including the faction spec (8 checks) and the boss-intro spec (7). Two browser
failures are older than any of this work and still fail: see "known failures"
below. The run matrix was measured at 8 seeds over every second composition
(1,944 runs) per build compared.

All six boss fights and every authored encounter have been driven in the Battle
Lab, which stages any fight by URL (`dev/bosses.html?encounter=…` or
`?boss=…`). **Supplies have still never been driven in a browser** — buying one
happens at a shop, which the lab does not stage — only by simulation and unit
tests. **Nor has any of the faction work been played by a human**; see below.

## What is worth doing next

### 1. Play wave 1, then decide whether the enemies scale

The enemy expansion shipped one wave on purpose. Eight new creatures, one
elite and sixteen formations are live; the next ~16 creatures are designed but
deliberately unbuilt until a table says the new fights are better. The report
with captures is at
<https://claude.ai/artifact/HYPKoVjFTsJ2ToUije8SdP>; the questions to ask a
party are in [ENEMY_DESIGN.md](ENEMY_DESIGN.md) ("Content process", step 4).

Two things the simulation could not settle, both needing humans:

- **The Margin Stalker is the bot's first kill 99% of the time** and almost
  never survives to cash in the Mark it exists for. Ten Barrier on arrival and
  a back-row start moved it from 0.7 to 1.2 rounds alive and no further. A
  table's kill priority is less ruthless and less informed than the bot's.
- **The Pressure Engine appears 5 times in 1,944 runs.** Elite chambers are
  rare and the Cistern is one floor, so the elite creature is only verified in
  the Battle Lab (`?encounter=pressure-engine`), not in the matrix.

Also open from that wave: forced row changes snap rather than travel (the
choreography layer never moves a unit between rows); early Cistern and Archive
formations still borrow foundry support until each faction has a simple
attacker and tank of its own; no new creature has voices; and the art is a
first pass (the Eel reads shark-like up close, the Wax Sentence like a rosette,
the Stalker merges into the dark Archive backdrop).

### 2. The class spread is the live balance problem

Measured with all 32 Ultimates and the current bosses, with against without:
Warden **+23**, Vanguard +15, Reaver +9, Beguiler +9, Broker 0, Ranger −8,
Herald −15, **Arcanist −18**. The Reaver — the outlier the note below was
written about — was fixed and is now on the strong side; the Arcanist and the
Herald took its place, and nobody has looked at why. Overall win rate is 73%
(duos 69%), which is where it was aimed.

### 3. Still open from the 2026-09-12 playtest round

- **Known failures (still failing at `5c6b7fd`, all older than this work).**
  `boss-moves.spec.ts`, "the wind-up lands as the signature": the Collector's
  held wind-up drops to idle for a moment before its signature, at every
  resolution. `stage-ui.spec.ts`, "chips hold still": at 1280×720 and 1366×768
  an intent chip's layout offset shifts 12px when a reachable enemy is
  targeted. Both fail on the commit before this round. The second was hidden
  since melee screening landed, because the test clicked a screened enemy and
  timed out before ever reaching the assertion; fixing its selector revealed
  it. `motion.spec.ts`, "a revived hero stands", fails now and then under a
  full parallel run and passes alone. **Read the summary line of a browser run, not its tail** — the
  failure list prints above the pass count, and three runs were misreported as
  green by reading only the last lines.
- ~~**The Reaver is the new class outlier.**~~ Answered: the Reaver was
  rebalanced during the three-floor work and now sits at +9. The spread moved
  to the Arcanist and the Herald — see §2.
- ~~**Two floors are not harder than one was for larger parties.**~~
  Superseded: there are three floors now, enemies hit ×1.3–1.4 in them
  (`ENEMY_HIT`), and the matrix sits at 73% overall with trios at 74% and
  quartets at 73%. `FLOOR_SCALE` is still the knob for making a floor deeper,
  and still widens the duo gap.
- **The four new chambers have not been driven by humans.** They are tested,
  simulated and rendered in the lab; nobody has played a toll gate for real.
  The bot walks into all four, so none of them measures as inert, but their
  numbers (toll prices, scald, shrine terms, reforge ×1.5) are first guesses.

- **The hero art is one pass, not a finished direction.** Proportions, necks
  and build are done and shared; faces, palette and per-hero silhouette are
  not. The Reaver's head is the weakest — a great deal of authored detail that
  turns to noise once the head is scaled to 0.62. Ask the user whether the
  roster is now what they wanted before spending another day on it.
- **The enemies are still on the old build**, so the monsters are chunkier
  than the party. Deliberate for now; see `ART_DIRECTION.md`.
- **Two chamber types now enter the same shop.** `auction` and `mystery` nodes
  both open the fixed-price shop, and only their names differ. The veiled lot's
  fiction went with the auction, so the names were changed to counters and
  stalls rather than veils. If the route wants two kinds of shop, that is a
  design decision nobody has made yet — a salvage stall that discounts a
  shorter shelf is the obvious shape.
- **The auction is unreachable but still tested.** `engine/auction.ts`, its
  screen, its four intents and the tests around them are all still here, for
  rooms that entered an auction before the change and for the save-compatibility
  rule this project keeps. Nothing on the route enters one any more. When the
  last of those rooms has expired — they are deleted 24 hours after they are
  touched — the whole subsystem can go, and roughly a third of what
  `tests-browser/expedition.spec.ts` covers goes with it.
- **An exchange can now sell five things, where the auction sold three.** The
  shop's shelves are one weapon, one armour, one relic and two supplies, and a
  rich party can clear all of them. Win rates did not move alarmingly, but the
  gold sink and the equipment ceiling both changed in the same release as the
  pact, and nothing has separated the two.

### 4. Presentation loose ends

The art pass is finished and its first round of fixes is in: the bosses hold
their wind-ups and land signatures, targeting marks legal targets instead of
fading everyone else, intent chips no longer cover name plates, the three
weakest enemies were redrawn, and five heroes got faces of their own. The
action fan no longer covers anyone: it is placed by measurement beside its
hero and chooses its own shape (see `battle/fan-layout.ts`). One real bug turned up on the way:
the stage was a scroll container, so keyboard focus near its edge could slide
the whole battlefield out of view. It now uses `overflow: clip`.

Frame rate was profiled rather than guessed at, and the cause was not the glow
filters everyone suspected. Headless, the compositor was saturated by three
things: a screen-blend lighting layer that was never lit but forced the whole
stage offscreen every frame, a depth filter on every combatant, and health bars
easing their `width`, which re-laid out the grid on every hit. All three are
gone (the depth tone now sits on each shape, baked into its part's layer).
Boss replays at 1920×1080 went from about 7% dropped frames to 0–0.3%
headless. On a MacBook Air M2 with real GPU rendering there were no dropped
frames before or after — the gain there is about a fifth less GPU and raster
work — at a cost of 10–25ms/s more main-thread time. Safari, which does not
layer SVG parts the same way, has not been measured. `tests/perf-css.test.ts`
and `tests-browser/perf.spec.ts` hold the rules that made the difference.
The last round of loose ends is also done: units are placed by measuring what
they paint, so no figure covers a name plate and back-row plates stay on
screen; chips keep off their own creature; replays are capped (at six seconds,
not the four the art direction used to claim — see there for why); reduced
motion stills every combatant; the downed-hero fall no longer races a timer;
the Battle Lab applies tempo from the first frame; tests read what each rig is
playing from a `data-clip` attribute instead of React's internals; and the
Miser and the Acolyte were redrawn to read in flat black.

What is left, all small:

- **The held wind-up costs frames.** A boss holding a wind-up pulses a faint
  glow over its whole figure, which is a filter on animating SVG for the whole
  planning phase. The frame-rate rules allow it; nobody has measured it.
- **The operating system's reduced-motion setting** stops CSS animation but
  does not switch the game's own reduced-motion mode, which is what stills the
  rigs and skips replay.
- **At 2× replay speed hits can land before strikes.** The speed control
  halves beat lengths but not the animation clips.
- **Beats play strictly one after another,** so four heroes bracing take about
  two seconds of a replay.
- **The camera leans up and down far less than it did,** because it must keep
  the whole board on screen while the player decides. Sideways lean and zoom
  are unchanged. If the camera feels flat, that is why.
- **Small leftovers:** a fallen hero's lying figure overlaps its own plate a
  little; dead enemies are measured standing; the unit layout takes 5–11ms per
  stage change; in the widest action fans an inner slip's hover detail covers
  the fan's own outer slips.
- **Weakest figures:** the Miser's head is a clean toad now, but alone it could
  be any frog — the hand and the coin crest are what make it the Miser. The
  Acolyte's dark mantle sinks into the dark back wall in colour.

## Older analysis, kept for the reasoning

The four sections below were written when the game was one or two floors, two
bosses and no Ultimates. The measurements in them are superseded by
[BALANCE.md](BALANCE.md) — read them for how a question was answered, not for
what is true now. The Reaver outlier they chase was fixed; see §2.

### 5. The Vanguard/Warden gap is a ceiling problem

Supplies took the Vanguard gap from +17 to +11 and the Warden's from +21 to
+17, and every point came from lifting parties that field neither: parties with
one did not move at all. That is the mechanism working. It stops there for a
reason worth understanding before touching it again — Warden parties sit at
**98%**, so nothing that lifts a floor can close the gap further. Closing it
means making Warden parties lose more, and the healing pass already established
what happens then.

If it is worth another pass, the lever is the ceiling, not the floor, and the
lever is not healing. Consider whether the boss layer should have an objective
that a healer specifically cannot answer, the way the Strongbox is one that a
tank cannot.

### 6. Two-hero parties still trail, and the container was not why

**Answered, 2026-09-12, by measuring it.** The runner now records where every
lost run ended (`lostAt`, printed per party size under `--matrix`). At every
size essentially every loss was at a boss, and duos died to the first boss at
eight times a quartet's rate: the boss formula gave a duo more boss per head
than a quartet. An even per-head weight (`BOSS_BASE`, `BOSS_PER_HERO`) took
duos from 69% to 80% over two floors without moving quartets at all. The gap
that remains is eleven points, down from twenty-two.

**Earlier the same day, half-answered by accident.** Class-locked training grounds
moved duos from 75% to 84% against 92% at four, because two heroes used to pay
two tuitions at one mentor and now pay one tuition and one drill. Nobody
designed that; the change was made because a path should belong to a class. It
is more evidence for the paragraph below: the cause was never the container,
and it was never the boss. It was the purse. What remains of the gap is worth
splitting by chamber type before anything else is tried.

The measurements below predate the shop, the per-hero Gilded purse and the
training-ground change, and none of them are directly comparable any more.

Duos sit at 67% against 89% at four. Pricing the Strongbox against party
actions rather than headcount — the fix the last handoff proposed — was worth
**one point**, measured on its own. It was the right shape and it was not the
cause. Whatever is hurting duos is somewhere else, and the next person should
measure before designing. Start by splitting duo losses by chamber type rather
than assuming the boss.

### 7. Economy

Supplies are the gold sink the notebook wanted, and mean final treasury fell
from 253 to 245 — barely. Parties still reach the boss with 50–95 gold in hand.
A party still has no way to spend gold down deliberately before the Counting
House, so the Miser's shield remains a penalty on hoarding rather than a
decision on the route. A supply seller somewhere other than an exchange would
fix both.

### 8. Reliability, continued

The concurrency model, room expiry, idle disconnection and creation limits are
done and documented in `NETWORK_PROTOCOL.md`. What is left before strangers
play: four physical devices, Worker restart smoke, network-interruption
behaviour, a long session soak, schema fuzzing — and watching the retention
alarms actually fire, which none of the tests do because every timer is
measured in hours.

There is still no AFK _handling_ in the game sense. A player who stops
answering blocks a phase indefinitely; only their socket times out, not their
turn. That is a design decision — auto-pass, or a party vote to proceed — and
it is the last thing between this and a public room.

## Things that are true but easy to misread

**Supplies narrow the survivability gap; they do not close it.** One action
bought is not one action every round. A Warden heals seven or eight times in a
boss fight; a party carries two or three Field Dressings. This was always going
to be a narrowing.

**"Leftover gold" figures include the boss reward.** Mean final treasury is
counted after the 240 prize lands, so most of what looks like leftover is the
prize. Gold actually in hand at the boss is 50–95.

**The Miser's shield is a penalty, not yet a decision.** See economy above.

**The `hoard` policy is deliberately a bad bot.** It buys nothing and trains
nobody, so its absolute win rates are low and mean nothing alone. It exists to
be compared against itself across two builds.

**`scripts/generate-sprites.ts` has never been run end to end**, and now only
matters for the auctioneer and the chest. The API key
works but the account has no prepay credits. Its request shape is confirmed by a
billing rejection, not an inspected image.

**Character art is drawn in source, not commissioned.** Every combatant is SVG
written by Claude sessions; the remaining atlas cells were generated. Do not
describe either as hand-painted or commissioned.

**Rig motion is in screen space, in the creature's own facing.** The animator
knows nothing about sides, so an enemy's strike travels towards negative x.
The first three creatures got this backwards and lunged away from the party;
a test now holds every rig to its side.

**Save compatibility is deliberate, and there are now six flags.** Rooms
without `combatVersion: 2` keep legacy skills, intentions, generation, flat
revival prices and unbounded combat, never see the upgrade or mentor phases,
get bosses with no objectives, and are never granted a supply action. On top of
that: no `ultimateVersion` means no charge meter and the old boss price; no
`bossVersion` means two floors with fixed bosses, the old enemy damage and
purchased revival; no `trainingVersion` means one class per training ground; no
`factionVersion` means the Cistern and the Archive draw the foundry's
encounters and no creature uses a `behavior`. A golden test pins the legacy
path's dice. Schema and content versions remain 1.

**Enemies choose by rules, and the engine names no creature.** A creature's
`behavior` is content (`EnemyDef.behavior`, evaluated by
`src/engine/intents.ts`); a test fails if any engine, shared or server file
mentions a faction creature by id. Anything that needs "this creature is
special" belongs in a field on the definition, as `prefers`, `targets`,
`hoard`, `clock`, `broken`, `busy`, `starts` and `tethered` already are.

**Telemetry is a measurement probe, not a game system.** `engine/telemetry.ts`
reports what happened to whoever attaches a sink (only `scripts/simulate.ts`
does, behind `--telemetry`). Nothing it reports changes state, logs or beats,
so a replay is identical with it on.

## How to check anything

```sh
npm run build
npm test
npm run simulate -- 25 --matrix                          # all 486 combinations
npm run simulate -- 8 --matrix --sample=2 --policy=tactical --telemetry
npm run simulate -- 20 --matrix --sample=1 --size=2 --policy=tactical
npm run dev:server                                       # then npm run test:network
npm run test:browser                                     # PW_PORT=… to run two checkouts at once
```

The three simulate lines are the ones this project actually uses: the full
matrix when a change could touch anything, every second composition at 8 seeds
(1,944 runs, about two minutes) for a balance comparison, and duos alone at 20
seeds (720 runs) whenever a duo number looks like it moved — at 144 runs a
seven-point duo swing is noise, and has been mistaken for a regression.

Flags worth knowing: `--telemetry` prints what every creature and encounter
did; `--factions=off`, `--bosses=legacy` and `--ultimates=off` play the builds
from before each of those waves, which is how "on against off" is measured;
`--hit=`, `--pool=`, `--pact=` and `--policy=hoard` reach the rest.

Run `npm test` on its own. Its simulation tests are CPU-bound and time out
when the browser suite is running beside them; that is starvation, not a
regression, and a rerun on a quiet machine settles it.

The Battle Lab (`/dev/bosses.html`) stages any fight by URL: `boss=` any of
the six, or `encounter=<id>` for any of the 26 authored encounters, with
`party=2|3|4`, `heroes=a,b,c,d`, `stage=`, `intro=1` for a boss entrance, and
`motion=1&tempo=0.25`. The Ultimate lab (`/dev/ultimates.html`) stages any of
the 32 films, and `film=intro` stages a boss's entrance there.

Captures: `scripts/capture-encounter.ts <out> <port> <encounter>[:size][:stage]`
for formations, `scripts/capture-ultimate.ts` for films (`SHEET=` tiles a
contact sheet), `scripts/intro-levels.ts <boss>` measures an intro's sound
levels, and `scripts/profile-ultimate.ts` its frame times.

To compare a change against a previous commit, put a worktree beside the repo,
symlink `node_modules`, and copy `scripts/policy.ts` across so both builds are
measured by the _same_ bot. A policy improvement otherwise reads as a balance
change — and this session changed the policy three times.

The runner counts plans the server rejected, and now records **why**. A non-zero
count means the policy proposed something illegal and braced instead, and every
number from that run is worthless. It also counts supplies bought and used.

### Five traps, recorded because each one cost real time

**An instrument that cannot reach a system reports that the system does
nothing.** This has now happened six times: the route branching hid evolutions;
the tactical bot arrives broke, so a treasury-scaled shield read as inert until
the `hoard` policy was written; the bot knew only the Warden's Unravel by name,
so the Broker's Liquidate did not count as counterplay; and supplies mixed into
the general lot pool were bought once a run and moved nothing until the tray and
the case made them reachable; and both policies hard-coded the Unbroken pact,
so the Gilded pact was never once measured and stayed strictly worse for as
long as it existed; and the enemy telemetry read a debt's writer off the status
_after_ the status was lifted, so every debt that came due was credited to
nobody and the mechanic measured as dead across 1,944 runs. Whenever a new system measures as doing nothing, check three things in
order — does the bot understand it, does the encounter create the situation,
does the probe count it — and suspect the instrument first — and when a system has never been measured _at all_,
that is the same failure wearing a better disguise.

**Never read a fight's history out of `s.logs`.** The chronicle is capped at 100
entries, so any question of the form "did this happen in this run" silently gets
"not in a long fight". This produced confidently wrong answers twice in one
session — once attributing boss difficulty to the wrong boss, once reporting
supply usage as near zero. Read the end state, or count it in the runner.

**A rotation slot that deals no damage is a free round.** Giving each boss a new
intention for its objective softened both. Both were rebuilt to ride an attack
the boss already had.

**Difficulty and the survivability gap move together.** Every honest attempt to
make the game harder widened the Vanguard/Warden gap; trimming supply potency to
claw difficulty back bought one point and cost three points of gap. Decide which
one you are buying before you touch a number, because you cannot have both from
the same lever.
