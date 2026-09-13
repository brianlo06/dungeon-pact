# Ultimates

Updated 2026-09-12 · branch `ultimates` (off `attack-choreography` at `a8fb81e`)

Every hero now has an Ultimate: a charged, extra action that resolves before
the round and plays as a short film. This document is the design, the schemas,
the architecture, the two benchmark storyboards and the measurements. The
benchmark is **the Vanguard's Lantern Wall** and **the Breaker's Gatebreaker**.
Both were approved, and the rest are being authored to that bar one film at a
time (`docs/ultimates/AUTHORING.md`); §4 says which are done.

---

## 1. What the repository already had, and what was reused

| System | Where | Used for Ultimates |
| --- | --- | --- |
| Effects pipeline | `engine/effects.ts` | All Ultimate effects. Two scope effects were added (`allies`, `enemies`); nothing else is Ultimate-specific. |
| Content validation | `content/validate.ts` | Ultimates validated at room boot, like abilities. |
| Class paths (24) | `content/evolutions.ts` | A path may author an Ultimate; `ultimateFor` prefers it. |
| Beats | `shared/model.ts` `Beat` | The Ultimate's result reaches the client as ordinary beats, plus a `ward` beat and `Beat.ultimate`. |
| Director + one clock | `battle/director.ts`, `battle/clock.ts` | Cinematics are played by the same director on the same `PresentationClock`: pause, 0.5×/1×/2×, frame step and hit-stop reach them unchanged. |
| Cutout rigs + animator | `battle/animation.ts`, `rigs-party.ts` | Presentation copies of real rigs; Ultimate poses added under `ult:` clip names. |
| Visual equipment | `equipment/Equipment.tsx`, `replay.ts` | The cinematic wraps each hero in `EquipmentProvider` with the equipment board *as it was when the Ultimate was called*. |
| Synth audio + mixer | `audio/engine.ts`, `audio.ts` | 16 new voices, stoppable channels, buffer prewarm, music ducking. |
| Reduced motion | `data-motion`, `reducedMotion` prop | Selects the still-card cut. |
| Reconnect safety | director's "first board is history" rule | A reconnect never replays an Ultimate already resolved. |
| Battle Lab | `dev/bosses.html`, `boss-fixture.ts` | The Ultimate lab (`dev/ultimates.html`) reuses the fixture and `Combat`'s lab hooks. |
| Simulation | `scripts/policy.ts`, `simulate.ts` | Policies call Ultimates; runner counts uses, charge and contribution. |

Nothing was rewritten. The only structural change to existing code is that the
director can now play a queue of cinematics before it plans a round.

---

## 2. Pact Charge

Player-facing name **Pact Charge**; internal `Player.ultimateCharge`, 0–100
(`ULTIMATE_MAX`). Class resources (Resolve, Mana, …) are untouched.

**Authoritative.** Charge is credited inside the effects pipeline
(`engine/charge.ts`, `charge(s, unit, source, amount)`), never by the client.
Each call names *what happened*; how much a class earns from it is content
(`HeroDef.chargeAffinity`). An Ultimate never fills its own caster's meter.

| Source | Per unit | Credited to |
| --- | --- | --- |
| action | 4 per resolved action | the actor (so a brace is not a lost round) |
| damage | 0.2 per HP removed from an enemy | the attacker |
| hurt | 0.3 per HP lost to an enemy | the hero hit |
| blocked | 0.2 per point of an enemy hit absorbed by Barrier | the hero hit |
| sacrifice | 0.25 per HP paid on purpose | the payer |
| heal | 0.22 per HP actually restored | the healer |
| shield | 0.16 per Barrier given to another hero (incl. Intercept) | the giver |
| intercept | 6 per hit taken through a guard link | the protector |
| interrupt | 8 | the interrupter |
| reaction | 5 per EXPLOIT or CHAIN SHOCK | the hero who set it off |
| control | 6 per enemy turned on its own side | whoever confused it |
| empower | 5 per ally Empowered | the Herald (or anyone) |
| cleanse | 2 per affliction stripped from an ally, or Barrier stripped from an enemy | the cleanser |
| trade | 0.4 per 10 gold moved by the hero's own action | the trader |
| setup | 2 per Mark/Wet/Vulnerable/Weak/Burn/Poison applied to an enemy | the applier |
| kill | 6 (not for opening a container) | the killer |
| revive | 8 | the reviver |

Class affinities (multipliers): Vanguard intercept ×2, hurt ×1.4, blocked
×1.5, shield ×1.3 · Arcanist reaction ×2, interrupt ×1.5, setup ×1.5 · Ranger
reaction ×2, setup ×1.5 · Warden heal ×2.2, cleanse ×2, setup ×1.5 · Broker
trade ×2, cleanse ×2, shield ×1.3 · Herald empower ×2, shield ×1.4, cleanse
×1.5 · Reaver sacrifice ×2, hurt ×1.8 · Beguiler control ×2.5, setup ×2.

**Rules**

- **Readiness**: full when charge ≥ the Ultimate's cost (100 for all today).
- **Carry-over: yes.** Charge persists between chambers, so "use it now or save
  it for the boss" is a real decision.
- **Downed**: a downed hero keeps their charge and cannot call an Ultimate; on
  revival the meter is where it was.
- **Evolution**: charge is on one scale for everyone, so training preserves it
  exactly; a hero who trains with a full meter has the new Ultimate ready at once.
- **Consumption**: spent when the Ultimate *resolves*. One that fizzles (target
  gone, hero dropped) keeps its charge.
- **Save compatibility**: rooms without `ultimateVersion: 1` earn no charge,
  cannot queue an Ultimate and keep the old boss.

---

## 3. The Ultimate as an extra action

During planning a ready hero may queue an Ultimate (`{type:"ultimate", target}`,
cancellable with `cancelUltimate`) before or after locking their normal plan,
for as long as the round is open. The server validates charge, hero state and
target rule on queue **and again on resolution**.

**Resolution window.** When the round resolves, every queued Ultimate resolves
first, fastest first (`hero speed + Ultimate speed`), then the round proceeds
exactly as before — each hero's normal plan included. Ultimates ignore the
front line's screen and their interrupt is opportunistic.

**Hidden information.** The snapshot says *who* has an Ultimate queued
(`ultimateQueued`) — the party plans around it — but, like a plan, only the
owner sees the target (`myUltimate`).

**Future interrupt activation.** The model already separates *queuing* from
*resolving*: `RunState.ultimates` holds the queue and `resolveUltimates` is a
single call site. HSR-style mid-round activation would add a window to
`UltimatePlan` (e.g. `after: actorId`) and call `resolveUltimates(s, window)`
between queued actions in `resolveRound`; on the client, `splitUltimates`
would split at every Ultimate cast rather than only leading ones and the
director would interleave cinematics with round chunks. That was not built:
it is not trivial to make deterministic and fair for four players deciding
at once, and nothing about the current model blocks it.

---

## 4. Ultimate schema

`content/ultimates.ts`

```ts
interface UltimateDef {
  id: string;
  heroId: string;
  evolution?: string;        // a path's Ultimate replaces the base one
  name: string;              // a proper name
  epithet: string;           // the one-line promise
  description: string;
  target: Ability["target"]; // who is chosen
  effects: Effect[];         // applied once to the target; scopes reach the rest
  cost: number;              // Pact Charge spent (100)
  speed: number;             // order among Ultimates
  presentation: {
    cinematic?: string;      // key into content/cinematics; absent → generic
    theme?: VfxTheme;
    accent?: string;
    voice?: { activation?: string; impact?: string; after?: string };
  };
}
```

New effects (general, not Ultimate-only):
`{ kind: "allies", effects, self?, downed? }` and
`{ kind: "enemies", effects, row?, others? }`.

Combat never checks an Ultimate id. `ultimateFor(player)` picks the path's
Ultimate if authored, else the class's.

### The authored Ultimates

| Hero / path | Ultimate | Gameplay | Cinematic |
| --- | --- | --- | --- |
| Vanguard | **Lantern Wall** | Every ally +12 Barrier and guarded by the Vanguard this round (Vanguard gains Barrier per ally); Vanguard +8 Barrier; charge the target for 20, break its WINDUP, Vulnerable; +2 Resolve | **authored** |
| Vanguard · Breaker | **Gatebreaker** | Enemy row: strip Barrier, 24 through armour, break WINDUPs, Vulnerable, dragged into the front line; Breaker Vulnerable 1 round; +3 Resolve | **authored** |
| Vanguard · Aegis Knight | **Breakwater** | Takes every ally's next direct hit this round, 14 Barrier +10 per ally; every enemy Weak and takes 6; the target 14 more through armour, Vulnerable | **authored** |
| Arcanist | **Debt of Thunder** | All enemies Wet; 26 lightning on the target (sets off Chain Shock, the rest stay Wet for the party) | **authored** |
| Ranger | **The Hundredth Mark** | Mark every enemy; 24 precision through armour on the target (cashes its Mark; the others stay Marked) | **authored** |
| Warden | Green Reckoning | Every ally incl. the downed: heal 18, Regen, clear Burn/Poison/Weak; every enemy Poisoned 4/round | generic |
| Broker | Foreclosure | Strip the target's Barrier, 26, Vulnerable; +30 gold; every ally +8 Barrier | generic |
| Herald | Anthem of the Unpaid | The whole party Empowered this round and next, +8 Barrier, clear Weak/Vulnerable | generic |
| Reaver | Red Ledger | Pay 14 HP; 40 through armour on the target; 12 to the rest of its row | generic |
| Beguiler | **Hall of Mirrors** | Every enemy is cut by the glass and strikes its own side this round; 10 more arcane on the target | **authored** |

The other 22 paths keep their class's Ultimate until authored (their `ultimate-defs/` files are `null` stubs). Every one of
these was designed against the kit it belongs to and interacts with the
existing reaction system (Wet → Chain Shock, Mark → Exploit, Vulnerable,
guard links), so an Ultimate is a team play, not a solo mini-game.

---

## 5. Cinematic timeline schema

`shared/cinematic.ts` — full comments there. In short:

```ts
interface Cinematic { id; heroId; motif?; shots: Shot[] }
interface Shot {
  id; kind: ShotKind; purpose: string;      // storyboard in the data
  space: "cinematic" | "battlefield";       // isolated stage, or over the real board
  ms: number; fastMs?: number;              // FULL length; FAST length (0 = dropped)
  transition?: { kind: "cut"|"blend"|"whip"|"flash"|"black"|"occlusion"|"iris"; ms?; dir?; object? };
  camera?: { from: CameraKey; to?: CameraKey; ease? };   // world point, zoom, Dutch angle
  background: "battlefield"|"void"|"lantern-vault"|"breach-forge"|"pact-sigil";
  lighting?, toLighting?: { exposure; tint; under; back; rim; vignette; letterbox };
  actors?: ActorCue[];   // role, ground point → to, size, face, clip, look, react[], shove, tilt
  vfx?: VfxCue[];        // kind, window (at…until), position | follow actor | anchor units
  screen?: ScreenCue[];  // flash, black, two-tone, invert, chromatic, radial — in ms
  shake?, stop?, sound?, duck?, text?, reveal?, markers?;
  framing?: { large?: ShotOverride; boss?: ShotOverride };   // re-framing by target size
}
```

Cue times are fractions of the shot, so FAST shortens a shot without
re-authoring it; accents that must stay short (a 70ms two-tone frame, a
hit-stop) are in milliseconds. `reveal` says when the server's result is
shown: `impact` (hits, breaks, falls), `ward` (Barrier, healing) or `all`;
anything unrevealed when a film ends is revealed then, so a skip can never
lose a result.

---

## 6. Architecture

```
server: resolveRound ─► resolveUltimates (charge spent, effects, beats with .ultimate)
                    └─► the round as before
client: director (useDirector)
        ├─ splitUltimates(beats) ─► segments[] + rest
        ├─ for each segment: CinematicRun(timeline = layout(cinematic, FULL|FAST, framing))
        │     frame task (ORDER.director): fire instants — clips, sounds, shake,
        │     hit-stop (clock.hold), duck, reveal (board hp, pops, falls)
        │     <UltimateCinematic> frame task (ORDER.camera+1): camera, actors,
        │     lighting, VFX progress, screen accents, transitions → DOM, no React
        └─ then planRound(rest) exactly as before
```

- **One engine, one clock.** No second animation system: the cinematic is a
  new *kind of timeline* on the existing `FrameLoop`, and its rigs are ordinary
  `Animator`s registered under `cine:<run>:<role>` and released after.
- **Presentation copies.** The film draws its own copies of the caster, the
  targets and the allies, placed per shot; the board never moves. The target is
  the real enemy — its drawing, its footprint scale, its state.
- **React renders at cuts only.** The cast layer is memoised for the whole
  run; each shot mounts its effects and text; everything between is CSS
  variables and transforms written from the frame loop.
- **Framing**: `framingFor(footprint)` → normal / large / boss, and each shot
  may override camera, actors and effects per framing.
- **FULL / FAST / first-view**: player setting (`Settings.cinematics`:
  `full`, `fast`, `first` = full the first time each film is seen on this
  browser, fast after). Never automatic.
- **Reduced motion**: `reducedCinematic(def)` — three still cards (portrait
  and name; target and number; the board), no camera move, no flash, no shake,
  no stop. The board has already settled underneath.
- **Skip**: the film's own Skip (or Escape) reveals everything left, silences
  the Ultimate's audio channel, releases the presentation rigs, settles the
  caster and targets, and continues to the round. The replay's Skip still skips
  the lot. Neither touches the server.
- **Speed**: Ultimates honour 0.5×/1×/2× like the rest of the replay, by
  design. The strike clip and its reveal are scheduled on one clock;
  `tests/cinematics.test.ts` holds contact and reveal within 40ms in FULL and
  FAST, and the browser test holds 2× to under 0.75 of 1× wall time.
- **Reconnect**: charge is state; a reconnecting client's first board is never
  replayed, so a resolved Ultimate is not shown twice.
- **Replay cap**: the round cap (9s) is unchanged and does not include
  cinematics.
- **Preloading**: all cinematic code and art is in the combat bundle (no lazy
  fetch). When any hero reaches 70% charge the Ultimate voices are rendered
  once into a muted graph so their noise buffers exist before the first impact.

### Audio

Original runtime synthesis, like the rest of the game (`audio/engine.ts`
`ULTIMATE_VOICES`): call bell, shield plant (clank + sub + long ring), rise,
**Vanguard motif** (fifth-and-octave horn), hum, visor tick, whoosh, layered
impact (click, sub drop, metal body, crack), room boom, ward chord, tail,
ready cue; for the Breaker a forge roar, grind, **Breaker motif** (four
closing anvil blows) and shatter. Each film plays through a `mixer.channel()`
a skip can silence, and ducks the music under itself. Voice lines are subtitle
hooks (`presentation.voice`); a recorded line would play in the same slot.

### UI

- A Pact Charge ring replaces the fan's seal at the hero's hand; it brightens
  near full and pulses when ready (with a one-time ready cue).
- A thin charge line in every party HUD entry, striped when queued.
- A low lantern glow at a ready hero's feet (a gradient, not a filter).
- When ready, an **ULTIMATE** slip tops the action fan: "Extra action · your
  plan still happens". Clicking it enters Ultimate targeting (every living
  enemy is legal); the commit bar becomes **Queue Ultimate ✦**. Queued, the slip
  reads "Queued → target · resolves first" with Cancel, and the normal fan is
  still open beneath it.
- Settings: **Ultimate cinematics** — Full / Full the first time, then fast / Fast.

---

## 7. Storyboards

### Lantern Wall (Vanguard) — 4.66s FULL, 2.46s FAST

Purpose: for one round, the party cannot be reached; and the thing that was
going to reach them is broken open. Fantasy: the guild's lantern, planted —
every lantern the guild ever hung lights behind the party.
Rhythm: identity → identity/stakes → anticipation (silence) → target → impact → release.

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 420 (240) | battle camera leans in on the caster | real Vanguard braces | real battlefield dims, letterbox closes | lantern pillar + ring on the real unit | guild bell; music ducks | on board | — | break the round's rhythm |
| 1 | Plant · extreme close-up | 640 (420) | rim and floor, Dutch −7°, push in | `ult:plant` — up on the toes, down onto the rim | lantern vault unlit; gold under-light grows from the cracks | glint, floor cracks drawn out from the tip, dust, sparks, motes | shield plant (clank/sub/ring); 70ms hit-stop | no | white flash 70ms | the one gesture that *is* the Vanguard |
| 2 | Wall · low-angle wide hero | 940 (—) | wide, rising push-in | `ult:stand` — sword to the ceiling, cape billowing | lanterns light rank by rank; back light; party as silhouettes behind | the target reflected in the shield; motes | power rise; Vanguard motif | reflected | cut | the people it stands for, and the threat it stands against; title |
| 3 | Breath · face close-up | 560 (340) | tight on the helm, slow linear drift | `ult:ready` — helm drops onto them, sword draws back | void, near-black, gold rim | motes frozen; visor lights; glint at the end | music ducked to 8%; one held hum; a tick | no | cape crosses the lens (occlusion) | anticipation by subtraction |
| 4 | Charge · profile tracking | 700 (440) | pans right, accelerating, can't keep up | `ult:charge` loop | lantern vault, lit | speed lines, shield trail, kicked dust | footfalls, whoosh | **yes — braces** (`anticipate` → `block`) | cut | the real target sees it coming |
| 5 | Impact | 640 (500) | close on contact, Dutch −9° easing out | `ult:strike`; target `hurt`, shoved back and tilted | exposure blows out then falls | drawn starburst (boils between three drawings), shockwave, debris, sparks | layered impact + room boom + metal; **150ms stop**, heavy shake | **yes** | cut on a **70ms two-tone frame** | impact; damage number; "Not one step further!" |
| 6 | Ward · return | 760 (520) | battle camera back to neutral | real Vanguard `ult:guard` | real battlefield; bars open | lantern-lattice wards rise over every real party member, staggered | ward chord, tail | on board | white flash 90ms | release: what it did, where it matters |

Boss framing: the charge pulls back to show a boss's height with the Vanguard
smaller; the impact frames up at the boss with a larger star and shockwave and
a small shove, so a boss is struck, not shrunk. Large framing sits between.

### Gatebreaker (Breaker) — 4.24s FULL, 2.32s FAST

Purpose: open the enemy formation — armour, Barrier, windups and ranks — at the
price of the Breaker's own guard. Fantasy: "the wall learns to move forward";
not a hall of light but a forge and a door. **Shares no shot with the Lantern
Wall**: it never looks up at the hero, it rides behind the shield, its palette
is forge red, and its anticipation is a spring loading rather than a breath.

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera on the caster | real Breaker `ult:heat` | battlefield dims, bars | red pillar, embers on the real unit | bell, stamp | on board | — | break rhythm |
| 1 | Heat · hand/weapon detail | 600 (380) | along the shield rim, Dutch 12° | `ult:heat` — shield turned edge-on, grip locks | breach forge, red under-light, molten rim | molten seam opens along the rim, sparks, embers | forge roar, grind | no | black 60ms | identity: a forge, not a lantern |
| 2 | Gate · over-the-shoulder | 860 (—) | past the Breaker's helm at the row | `ult:crouch` begins | forge + a great vault gate behind the row; red back light | embers | Breaker motif (four closing anvil blows) | **the whole row**, lit from below, bracing | cut | target and stakes; title |
| 3 | Load · Dutch low angle | 460 (320) | Dutch −13° → −15°, pushing in | `ult:crouch` held | exposure to near-black | embers and light contract onto the shield; floor cracks drawn *inward* | music ducked; rising grind | no | cut | anticipation: the spring loading |
| 4 | Ram · projectile follow | 560 (380) | bolted beside the shield, rushing right | `ult:ram` loop | forge; gate rushing up | dense speed lines, trail, debris past the lens | whoosh, footfalls | **row**, bracing | whip 120ms | motion |
| 5 | Breach · wide impact | 700 (540) | wide on the row, easing out | `ult:breach`; each target `hurt`, shoved, tilted | exposure spike, molten tint | gate bursts into plates, jagged star, horizontal shock line, debris, sparks, ember burst | impact + shatter + boom; 130ms stop; heavy shake | **row** | black 45ms, then flash + two-tone | impact across a line; BREACH |
| 6 | Open · aftermath | 660 (460) | battle camera to neutral | real Breaker `ult:open` — guard dropped | battlefield; bars open | red cracks under every real target (now in the front row) | tail | on board | flash 80ms | release, and the cost shown |

---

## 8. The Ultimate lab

`npm run dev`, then `/dev/ultimates.html`. Real reducer, real combat screen.

Controls: hero, evolution, enemy (normal/large/boss: Slag Hound, Rivet Sniper,
Iron Bulwark, the Collector, the Miser), target, framing override, gear (base,
weapon, armour, relic, full kit, **weapon seized by the Collector**), party
size, charge slider, FULL/FAST, motion on/off, **Trigger Ultimate**, reset;
transport: play/pause, frame step, 0.25× (capture tempo), 0.5×, 1×, 2×, skip;
debug: VFX, lighting, shake (disable), camera bounds, anchors, stage label
(shot number/kind/id), timing markers. The side panel shows time, shot, the
last marker, a timeline strip with shot segments, marker and reveal ticks
(click a segment to jump), and every shot's storyboard purpose.

Everything is also a URL parameter, so any frame can be linked and captured:
`?hero=vanguard&evo=van-breaker&enemy=collector&gear=kit&mode=full&speed=1&auto=1&shot=4&at=0.5&pause=1`.

Tools: `scripts/capture-ultimate.ts` (frames and contact sheets),
`scripts/probe-ultimate.ts` (where a rig part is in world units at a paused
frame — how every camera and effect position in the two films was set),
`scripts/profile-ultimate.ts` (frame times; `GPU=1` for the real GPU).

---

## 9. Balance

Same bot, same seeds, every class combination (486 × 10 seeds per pact,
`npx tsx scripts/ultimate-report.ts 10 [--pact=wealth]`). **Off** is a room
made before Ultimates — no charge and the old boss — so it is the build before
this branch as far as any result can tell. **On** is the bot calling Ultimates
(`scripts/policy.ts` `tacticalUltimate`, which reads what an Ultimate *does*,
never its name: heals for a party in trouble, wards for a dangerous round,
force when there is enough enemy left to spend it on, anything at a boss or
elite).

| Win rate | Unbroken off | Unbroken on | Gilded off | Gilded on |
| --- | ---: | ---: | ---: | ---: |
| 2 players | 76% | 82% | 85% | 84% |
| 3 players | 91% | 92% | 92% | 90% |
| 4 players | 90% | 92% | 90% | 91% |
| all | 90% | 91% | 90% | 90% |

Per hero, per run (Unbroken): Vanguard 1.20 Ultimates / 158 charge earned ·
Arcanist 1.24 / 167 · Ranger 1.29 / 170 · Warden 0.87 / 139 · Broker 1.11 /
152 · Herald 1.25 / 170 · Reaver 1.07 / 141 · Beguiler 1.04 / 141. Every run
that reached the boss used Ultimates there: 3.6 per boss fight. Ultimates did
13% of all hero damage, and 76 healing and Barrier a run.

**How it got there — the numbers worth remembering:**

- The first cut took the matrix from **89% to 99%**. Measured one class at a
  time, no single Ultimate was the problem: each moved the win rate one to
  four points. Together they compounded, because each removes a share of the
  losses the others leave, and the bot arrives at the boss with every meter
  full — which carry-over exists to allow.
- Cutting every Ultimate by about a third moved it only to 98%. Boss HP ×1.35
  alone only to 94% (while the no-Ultimate game fell to 65%): what Ultimates
  buy at a boss is mostly *survival*, so more HP does not answer them.
- So the boss is priced for Ultimates (`BOSS_PRICING`: HP ×1.2, and +2 damage
  per hero on every boss damage effect), in rooms that have them. That is what
  holds the boss's difficulty; Ultimates stay strong enough to be felt.
- Duos gain the most (+6 under Unbroken), which narrows the duo gap
  `HANDOFF.md` still lists, rather than widening anything.
- Uses sit at the low end of the 1–3 target, on purpose while the boss is
  priced this way. The Warden is lowest (0.87): its Ultimate heals, and the bot
  holds a heal for a party that needs one. Charge rate is the lever if players
  find Ultimates too rare; each point of rate needs the boss price rechecked.
- The attack and hoard policies call Ultimates too; `tests/simulation.test.ts`
  still proves zero rejected plans across every composition.

---

## 10. Performance

Measured on the MacBook Air M2 this project already targets, in headless
Chromium on the real GPU (`GPU=1 scripts/profile-ultimate.ts`), dev build.

- **Figures carry no filters.** The first build lit figures with
  `drop-shadow`/`brightness`; in software raster that doubled the film's frame
  time, and on the GPU it still re-filtered a screen-sized layer every frame.
  Rims are now a glow *behind* the figure, silhouettes are an ink fill set
  once per shot, every `blur()` was replaced by a soft gradient, and the
  chromatic split is edge fringes instead of two filtered copies. Only the
  70ms two-tone frame and a 50ms invert filter the film, while hit-stop holds
  the picture still.
- **React renders at cuts only**: the cast is memoised per run. Before that,
  each cut re-rendered four hero drawings (30–45ms each cut).
- Peak DOM inside the film: ~760 nodes (≈660 of them SVG, mostly the four
  rigs), 3–6 live effects, 0–2 filtered elements.
- Frame times, 1920×1080, film vs the round replay straight after it, same page:
  uncapped run p50 16.7ms / p95 33ms for both, 3–5 frames over 34ms in a film
  (all at its first frames). Later runs on the same machine were capped to
  30Hz by the OS for *both* film and round (p50 = p95 = 33.3ms, 1–2 frames
  over 34ms in the film). 1280×720: the same.
- **Known cost**: the round that carries an Ultimate starts with one 360–570ms
  main-thread task in the dev build — the snapshot re-render of the whole
  combat screen plus mounting the film. It lands on the frame the round
  arrives, before the call shot; production React is several times faster, but
  it has not been measured there. It is the first thing to cut if the start
  feels hitched (pre-mounting the cast while an Ultimate is queued is the
  obvious shape).
- Headless software raster (the default Playwright shell) is not
  representative: there the 1080p film ran p50 50ms against a 16.7ms round.

---

## 11. Tests

- `tests/ultimates.test.ts` (21): charge from damage, from tanking and
  intercepting at affinity, from healing (not overhealing), cap, action share,
  carry-over; readiness refused server-side; target validation; downed keeps
  charge and cannot call; extra action (plan still resolves, after); consumption
  and no self-charge; Lantern Wall wards every ally; cancel and phase rule;
  snapshot hides targets; reconnect snapshot carries charge; evolution replaces
  the Ultimate; charge preserved through training and ready at once;
  Gatebreaker hits and drags the whole row; content names; opportunistic interrupt.
- `tests/cinematics.test.ts` (12): every Ultimate has a film; authored films in
  3–5s and FAST under 72%; only real effects/backgrounds/sounds; only rig clips
  that exist; every film reveals a result; reduced cut has no flash/shake/stop/
  camera move; timeline layout and FAST dropping; every instant fires once
  under irregular frames; boss re-framing; **strike contact and reveal within
  40ms in FULL and FAST**; segment splitting leaves the round intact.
- `tests-browser/ultimate.spec.ts` (9 × 4 resolutions = 36): meter → slip →
  targeting → queue → cancel; film then round then settle with nothing left;
  skip settles at once, no presentation rigs left, result on the board; the
  Breaker's film is different and shows the whole row; boss framing; worn
  weapon present and seized weapon absent in the film; reduced motion; FAST
  drops the wide shot and keeps anticipation and impact; 2× < 0.75 of 1×; no
  overflow.
- Simulation test: zero rejected plans across every composition with the bots
  calling Ultimates.

Full unit suite: 395 passing. The existing browser suites at 1280×720 show 13
failures in `combat-layout` and `stage-ui`; **the same 13 fail on a clean
checkout of `a8fb81e`**, so they predate this branch (the other session has
uncommitted edits to those spec files).

---

## 12. Placeholders and known gaps

- **6 of 32 films are authored** (Lantern Wall, Gatebreaker, Breakwater, Debt
  of Thunder, Hall of Mirrors, The Hundredth Mark). The Warden, Broker, Herald
  and Reaver play the generic film (call → hero with name → blow → return,
  accent-coloured, combat clips) over their designed gameplay; 22 paths use
  their class's Ultimate until authored.
- Engine limits the authors worked around, each noted in its storyboard: an
  enemy that only takes a status (no damage) is not in the cast; only the
  `reflection` effect gets a figure slot; a line of enemies shares one facing;
  the occlusion object is always a cape; a row's reactions land together; a
  ranged contact-vs-reveal check needs a marker on the follow-through pose.
- No recorded voice; subtitles only. Motifs and all sounds are synthesis.
- Faces: the Vanguard's helm hides a face, so "facial performance" is helm
  angle, crest/cape lag and the visor lighting. The five visible-face heroes
  have `brow`/`eyes`/`mouth` parts, registered only in close-ups
  (`battle/face.ts`).
- Presentation copies are drawn at rest state (statuses, seized items, HP) as
  of the start of the round; a status aura on the target is not shown in film.
- Balance compensation is on the boss only; elites were not separately priced.
- The bots play Ultimates well; humans may hold them longer or shorter, which
  moves the boss number — measure with players before tuning further.
- `iris` transition kind is in the schema but neither film uses it (not rendered yet).
- The mount stall above.

## 13. Propagating to the other heroes

Per authored Ultimate, from what the two benchmarks actually took:

| Work | Estimate |
| --- | --- |
| Storyboard against the kit and path | 0.5 day |
| 5–8 `ult:` rig poses (the Vanguard took 11) | 0.5–1 day |
| Shots, framing variants, probing and tuning in the lab | 1–1.5 days |
| One background (or reuse) + 1–3 new effects | 0.5–1 day |
| Sounds and motif | 0.25 day |
| Captures, performance pass, tests | 0.25 day |

About **3–4 days each** for a benchmark-quality film; **~1 day** for a
"good generic plus" (authored poses and one signature shot on the generic
structure). 30 remaining: roughly 90–120 days at benchmark quality, or a
7-base-films-first plan (~25 days) with paths on upgraded generics after.
Faces add ~1 day per visible-face hero once, shared by its three paths.
