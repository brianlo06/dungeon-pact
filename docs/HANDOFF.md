# Handoff

Updated 2026-09-11 · branch `boss-objectives`, 37 commits ahead of `main`

**Read this first, then `BALANCE.md`.** Everything below is current as of the
last commit. Counts come from `validateContent()`, not memory.

## Where the work lives

The route/upgrade/healing work is merged into `main`. Boss objectives,
supplies and the reliability pass sit on **`boss-objectives`**, not merged.
The repository is on GitHub as a private repo, `brianlo06/dungeon-pact`, with
`main`, `balance-and-upgrades` and `boss-objectives` pushed. `main` is the
default branch and does not yet have this work.

Codex is working in the same tree on presentation. Its boss preview harness
(`src/dev/`, `dev/bosses.html`, `docs/BOSS_PREVIEW.md`) and the `BossObjective`
component are committed alongside this work at the user's direction. `npm run
build` excludes the preview from production.

## What the game is now

An 8-class cooperative roguelite over a 7-depth branching route. Guest lobby →
hero choice → starting pact → route → chambers → boss → results.

Chambers: combat, elite, exchange, veiled lot, event, mentor, camp, boss. An
exchange runs two equipment lots and closes with a consumables tray. Clearing
a fight opens a branch upgrade for every hero. A mentor teaches one class path.

Both bosses fight for an objective and state it before the first round: the
Collector seizes equipment into a breakable Strongbox, the Miser shields itself
with treasury the party never spent.

Content: 8 heroes, 24 class paths across 3 mentors, 48 ability branches, 12
items and 5 supplies, 8 normal enemies, 2 bosses, 1 container, 2 elite traits,
12 statuses, 3 events.

Every combatant is now drawn: all eight heroes and every enemy are authored
SVG cutout rigs with named moving parts. Only the auctioneer and the reward
chest still come from the generated atlas. `ART_DIRECTION.md` has the direction
for each figure and why the medium changed.

Verified at the last commit: 233 unit tests across 21 files, 373 browser
checks across four resolutions (plus three informational frame-time checks
that run only at 1920×1080), and a production build. The 12 real-WebSocket
checks were last run before the art pass, which touched no server code. **Neither the boss
objectives nor the supplies have been driven in a browser by this session** —
reaching a boss by hand takes a full run. Codex's preview harness exists
precisely to make that cheap; use it.

## What is worth doing next

### 0. Presentation loose ends

The art pass is finished and its first round of fixes is in: the bosses hold
their wind-ups and land signatures, targeting marks legal targets instead of
fading everyone else, intent chips no longer cover name plates, the three
weakest enemies were redrawn, and five heroes got faces of their own. One real bug turned up on the way:
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
What is left, all presentation and none of it blocking:

- **The action fan covers heroes.** The ability slips that open from your hero
  sit over the hero and the ally below. The user saw it and asked for it to be
  left for now; it is the next thing they will want.
- **Bodies still cover name plates.** Chips are laid out, units are not: at
  three heroes Bram's hat covers the Collector's and the Stoker's plates, and
  the front-row Collector covers the Kiln Mender's. That is unit placement in
  `layout.ts`.
- **Back-row hero plates clip at the bottom of the stage** whenever the camera
  zooms in.
- **A replay runs about ten seconds**, not the four `ART_DIRECTION.md` claims.
  Either the step-duration cap is not doing its job or the claim is stale.
- **Chips can sit on their own creature's art.** Placement keeps chips clear of
  name plates and each other, not of bodies — the Collector's key crosses its
  own chip.
- **At 1280×720 three-line WINDUP chips on back-row enemies** drop 14–20px onto
  their own creature so they stay on screen at the tightest camera framing.
- **Reduced motion still animates held poses.** It turns off replay; idles and
  the held windup still loop.
- **The downed-hero fall still waits on a 60ms timer.** The same approach failed
  under load for the windup and was replaced there; the fall probably no longer
  needs it.
- **The Battle Lab applies tempo late**, after animators register, so slowed
  captures are sometimes at full speed. Capture only.
- **Two browser tests read clips through React's fiber internals**, which will
  break if React changes how it stores props.
- **Weakest figures now:** the Miser in flat black (better, not yet as iconic as
  the Collector's key) and the Acolyte, still the smallest thing on the field.

### 1. The Vanguard/Warden gap is now a ceiling problem

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

### 2. Two-hero parties still trail, and the container was not why

Duos sit at 67% against 89% at four. Pricing the Strongbox against party
actions rather than headcount — the fix the last handoff proposed — was worth
**one point**, measured on its own. It was the right shape and it was not the
cause. Whatever is hurting duos is somewhere else, and the next person should
measure before designing. Start by splitting duo losses by chamber type rather
than assuming the boss.

### 3. Economy

Supplies are the gold sink the notebook wanted, and mean final treasury fell
from 253 to 245 — barely. Parties still reach the boss with 50–95 gold in hand.
A party still has no way to spend gold down deliberately before the Counting
House, so the Miser's shield remains a penalty on hoarding rather than a
decision on the route. A supply seller somewhere other than an exchange would
fix both.

### 4. Reliability, continued

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

**Save compatibility is deliberate.** Rooms without `combatVersion: 2` keep
legacy skills, intentions, generation, flat revival prices and unbounded combat,
never see the upgrade or mentor phases, get bosses with no objectives, and are
never granted a supply action. Schema and content versions remain 1.

## How to check anything

```sh
npm run build
npm test
npm run simulate -- 25 --matrix                         # all 486 combinations
npm run simulate -- 25 --matrix --policy=tactical,hoard  # ...and the hoarder
npm run dev:server                                       # then npm run test:network
npm run test:browser                                     # PW_PORT=… to run two checkouts at once
```

The Battle Lab (`/dev/bosses.html`) stages any fight by URL: `boss=collector`
or `boss=miser`, or `encounter=<id>` for any ordinary encounter, with
`party=2|3|4`, `heroes=a,b,c,d`, `stage=` and `motion=1&tempo=0.25`.

To compare a change against a previous commit, put a worktree beside the repo,
symlink `node_modules`, and copy `scripts/policy.ts` across so both builds are
measured by the _same_ bot. A policy improvement otherwise reads as a balance
change — and this session changed the policy three times.

The runner counts plans the server rejected, and now records **why**. A non-zero
count means the policy proposed something illegal and braced instead, and every
number from that run is worthless. It also counts supplies bought and used.

### Four traps, recorded because each one cost real time

**An instrument that cannot reach a system reports that the system does
nothing.** This has now happened four times: the route branching hid evolutions;
the tactical bot arrives broke, so a treasury-scaled shield read as inert until
the `hoard` policy was written; the bot knew only the Warden's Unravel by name,
so the Broker's Liquidate did not count as counterplay; and supplies mixed into
the general lot pool were bought once a run and moved nothing until the tray and
the case made them reachable. Whenever a new system measures as doing nothing,
suspect the instrument first.

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
