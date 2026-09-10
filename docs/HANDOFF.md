# Handoff

Updated 2026-09-10 · branch `balance-and-upgrades`, 9 commits ahead of `main`

**Read this first, then `BALANCE.md`.** Everything below is current as of the
last commit. Counts come from `validateContent()`, not memory.

## Where the work lives

All of this session's work is on **`balance-and-upgrades`, not merged**. `main`
still points at the 0.2 art-and-tactical-combat commit. Nothing is pushed to a
remote. Merge or rebase when you are happy with it; the branch is linear and
each commit is self-contained.

## What the game is now

An 8-class cooperative roguelite over a 7-depth branching route. Guest lobby →
hero choice → starting pact → route → chambers → boss → results.

Chambers: combat, elite, exchange (three lots each), veiled lot, event, mentor,
camp, boss. Clearing a fight opens a branch upgrade for every hero. A mentor
teaches one class path per hero, paid from the shared treasury.

Content: 8 heroes, 24 class paths across 3 mentors, 48 ability branches, 12
items, 8 normal enemies, 2 bosses, 2 elite traits, 12 statuses, 3 events.

Verified at the last commit: production build, 66 automated tests across 8
files, 12 real-WebSocket checks. The route map, mentor screen, upgrade screen
and round playback were each checked in a browser against a live room.

## What is worth doing next

### 1. Boss objectives that change decisions

This is the clearest remaining ceiling on difficulty and has been the top
open item for three passes. Both bosses still only hit harder as they lose
health. Every loss in the balance tails happens at the boss, so the boss is
already where runs are decided — it just decides them with numbers.

The engine can support real objectives without new primitives. Enemies can
target their own side, apply statuses, gain Barrier that scales off state, and
`confused` already flips an action onto an enemy's own allies. A boss that
seizes equipment into a destructible strongbox, or one whose shields scale off
the treasury so hoarding becomes dangerous, both fall out of what exists.

Prefer this over raising any enemy's health. An optimal bot wins 91% at four
players; a bigger health pool moves that number without making the fight more
interesting.

### 2. Decide what Vanguard and Warden are for

Both sit near +15 (parties containing them win ~98%, parties without ~84%).
That is the tank-and-healer pattern, not a bug, and parties without either are
clearly viable. But it will not move by tuning, and this session proved that
the hard way: nerfing the healer raised the healer's value, because scarce
healing makes the only supplier of it more important.

This is a design decision, not a balance one. Either accept that the two
survivability classes are the strongest picks, or change what they do — for
instance by moving some protection into equipment or consumables so a party can
buy what a Vanguard provides. Do not attempt it as a numbers pass.

### 3. The Reaver is the weakest class and the weakest tails

Reaver-heavy parties are the bottom of the matrix. It pays HP for damage and
has no sustain until the Cipher's Bloodbound path, which sits at the deepest
mentor and is often unreachable. Either give it a reliable sustain line earlier
or accept it as the high-risk pick and say so in its description.

### 4. Economy, if you want the treasury tighter still

Parties finish holding 242–268 gold against roughly 1200 earned, down from
660–790 earlier in the session. Multi-lot exchanges, mentor tuition, priced
camp training and escalating revivals did most of that. Consumables and healing
alternatives are the remaining Economy-gate content; they would also give
non-Warden parties something to buy instead of a class.

### 5. Reliability, before anyone outside your group plays it

Unchanged and still real: strict room-revision validation makes simultaneous
commands produce stale rejections — migrate to phase/round epochs. No heartbeat
timeout, AFK handling, room expiry, creation limits or retention policy. These
should land before any public access.

## Things that are true but easy to misread

**`scripts/generate-sprites.ts` has never been run end to end.** The API key
works but the account has no prepay credits, which blocks text and image models
alike. Its request shape is confirmed by a billing rejection, not by an
inspected image. The class art in `characters-v2.png` came through the browser
instead. Treat the first real run as a review step.

**Class art is generated, not commissioned.** `ASSET_LICENSES.md` records the
provenance of both atlases. Do not describe either as hand-painted.

**Multi-frame animation is still not implemented.** Round playback knows when a
unit acts, is hit, heals or falls, so an idle/attack/hurt sheet has somewhere
to plug in, but no such sheet exists and the sprites are single-cell.

**Save compatibility is deliberate.** Rooms without `combatVersion: 2` keep
legacy skills, intentions, generation, flat revival prices and unbounded
combat, and never see the upgrade or mentor phases. Schema and content versions
remain 1; every field added this session is optional. Start a new pact to see
current rules.

## How to check anything

```sh
npm run build
npm test
npm run simulate -- 25 --matrix        # all 486 class combinations
npm run simulate -- 25 --matrix --full # ...with every row
npm run dev:server                     # then npm run test:network
```

`--matrix` prints aggregates and tails; `--policy=attack` reproduces the older,
deliberately naive bot for comparison. The runner counts plans the server
rejected and the tests assert that count is zero — a non-zero count means the
policy is proposing illegal actions and every balance number from that run is
worthless.

**One trap, recorded because it cost real time.** Branching the route hid
evolutions from the matrix: mentors need steering toward several chambers
ahead, the greedy policy stopped reaching them, and the aggregates reverted to
their pre-evolution values, looking exactly like a regression from an unrelated
change. If you change route shape, node types or phase flow, confirm the policy
can still reach what you are measuring. An instrument that cannot reach a
system reports that the system does nothing.
