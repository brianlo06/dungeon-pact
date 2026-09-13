# Combat choreography

Combat presentation is planned from resolved combat beats. It never predicts
damage, targets, interrupts or item effects. The server result is
authoritative; this layer only decides how a result that is already known
crosses the stage. If every choreography value were wrong, the fight would
resolve identically and only look worse. Choreographic movement is temporary
and is never a row change: "Take the front" and "Fall back" are engine moves,
shown by the settled board, and are choreographed in place (`self`).

## Architecture

### One clock, one loop

`PresentationClock` (`battle/clock.ts`) is the only time source for a replay:
unit clips, travel, projectiles, marks, the camera, hit-stop, sounds, pause,
speed and frame stepping. Its time is presentation milliseconds: a 620ms clip
lasts 620 of them at any speed. The speed control, the capture tempo and the
pause button change only how fast that time passes, so a strike and the hit it
causes cannot drift apart at 0.5× or 2×. Hit-stop holds presentation time while
the camera's own motion goes on.

`FrameLoop` runs every task once per animation frame in a fixed order:

| order | task | writes |
| ---: | --- | --- |
| 10 | director (`director.ts`) | plays every cue that is due: beats, clip requests, sounds, stagehand cues |
| 20 | stagehand units (`stagehand.ts`) | each travelling figure's offset, scale, lift, facing and paint order |
| 30 | animators (`useAnimators.ts`, `animation.ts`) | each rig's pose and its parts |
| 40 | stagehand effects | projectiles and marks |
| 50 | camera (`camera.ts`) | the world transform |

A clip asked for this frame is drawn this frame, and a projectile is measured
off the pose the rig drew last frame (the arrow still on the string).

### From beats to a timeline

1. The engine resolves a round and logs beats (`cast`, `damage`, `heal`,
   `block`, `combo`, `defeat`, `equipment`).
2. `splitRound` cuts them into moves — a `cast` and everything to the next
   one — plus a preamble and an epilogue (ticks at the round's end).
3. For each move, `moveMeta` (`choreo-meta.ts`) decides how it looks from the
   content annotations, the creature's defaults and the generic rules.
4. `groupConsequences` groups the move's beats into contacts: each hit is part
   of the current contact until it lands on a target that contact already hit.
   A row attack is one contact; a double bite is two. Hits past the number of
   blows the ability deals (`strikesOf`) are follow-ups (an item's lightning),
   never an invented extra swing.
5. `choreograph` (`choreography.ts`) turns one move into a `MoveTimeline`:
   phases, movement segments, projectile plans and cues, all relative to the
   move's start. It is a pure function and reads no clock and no DOM.
6. `layRound` lays the moves end to end with overlaps, and `scheduleRound`
   squeezes the round towards its floors until it fits the ceiling
   (`planRound` in `round-plan.ts` wires the content, rigs and geometry in).
7. The director plays the timeline on the clock; the stagehand moves figures
   and flies projectiles; the animators pose the rigs.

An interrupted wind-up never produces a `cast`, so it is never choreographed:
no movement, no projectile, nothing queued from an intent.

A move's annotation can also give:

- `sounds` — the sound of each moment (`charge`, `release`, `travel`, `swing`, `impact`, `step`), layered over the sounds the beats themselves carry; `null` silences a moment. A move annotated with a `charge` sound shows its build-up even when its archetype would not.
- `weight` — `heavy` and `signature` blows hold the scene and shake the camera by `IMPACT`'s numbers when they land, if those are more than the hit's number alone would earn. Only a contact that hurt someone does.
- `timing.anticipation` on a ranged move — the build-up before its clip. `0` when the clip performs the build-up itself, as the Arcanist's, Mender's, Sniper's and Bellows' do: the charge glows at the muzzle anchor, riding its rig part, until the frame the shot leaves.
- `projectile.muzzleFlash` — a report at the muzzle as the shot leaves.
- `delivery: "cone"` — one breath from the muzzle across every target the contact hit, opened wide enough to cover them, arriving on all of them at once.


### Layer order on the stage

```
.world                          camera transform (camera.ts)
  .layer-units
    .combatant                  left/top/z-index: the stage layout's placement (never touched by choreography)
      .combatant-intent, .combatant-plate      stay home: chips and name plates never travel
      .combatant-body
        .combatant-travel       choreography offset: translate + depth scale (stagehand)
          .combatant-shadow     on the floor; shrinks and fades under a leap
          .combatant-lift       leap height and mirror to face the other way (stagehand)
            .combatant-rig      the rig's root pose (animator), reports data-clip
              svg [data-part]   the rig's parts (animator)
        .combatant-pop          the number
  .layer-projectiles            projectiles and marks, interleaved with units by z-index
  .layer-vfx                    impact effects and world-space numbers
  .layer-choreo-debug           the debug overlay
.layer-screen                   banners, replay controls
```

`final position = layout placement + choreography offset + rig pose + camera`.
Each layer has one owner. Nothing choreographic is persisted: the end of a
replay, a skip, an unmount (a reconnect) or a fresh load resets every offset,
lift, paint order, projectile, mark and `data-choreo`, and the board is rebuilt
from the layout.

## The schema

Annotations live in `src/content/choreography/<creature>.ts`, one file per
hero id or enemy definition id, registered in `index.ts`. `common.ts` holds the
actions every hero shares. The types are in `src/shared/presentation.ts`.

```ts
// src/content/choreography/hound.ts
import { creature, melee } from "./kit";

export default creature({
  // How the creature performs, whatever the move.
  unit: {
    locomotion: "dash", // gait: run, dash, heavyWalk, charge, hop, leap, …
    speed: 2.6, // stage widths per second
    basic: "melee", // archetype of an unannotated hostile move
    reach: undefined, // weapon reach past its centre, drawing units (absent: its outline)
    turnToReturn: true, // turns round to go home (a knight backs away instead)
    overshoot: 30, // runs this far past its target, drawing units
    strikeInset: undefined, // where it is struck, inside its outline
    anchors: {
      hit: { at: [52, 55] }, // where blows and projectiles land on it
      muzzle: { at: [8, 55], part: "jaw" }, // where its shots leave; rides a rig part
      weapon: undefined, // striking point, for the debug overlay
    },
  },
  // Per ability id (upgrades and class paths keep the id).
  abilities: {
    bite: melee({ charge: "short" }),
    pounce: melee({ locomotion: "leap", charge: "normal" }),
  },
  // Per ability name, for a class path whose move looks different.
  named: {},
});
```

An `AbilityPresentation` can set `archetype` (`melee`, `lunge`, `bow`,
`projectile`, `spell`, `beam`, `area`, `self`, `support`), `delivery` (`bolt`,
`fromAbove`, `beam`, `eruption`, `shockwave`, `sigil`, `bloom`, `mote`),
`projectile` (visual, trajectory, speed or duration, arc, rotation, trail,
what happens on arrival), `charge` (`short`, `normal`, `long`, `marked`),
`locomotion`, `clip` and `timing` hints (anticipation, hold, travel multiplier,
linger). `kit.ts` has the presets (`melee`, `lunge`, `bow`, `projectile`,
`spell`, `area`, `self`, `support`) and the stock looks (`ARROW`, `BOLT`,
`MOTE`).

Resolution, in `moveMeta`: the creature's `named` entry, then its `abilities`
entry, then `common` (heroes), merged over any inline `presentation` on the
ability. With no annotated archetype: a move aimed at itself is `self`, at an
ally `support`, else the unit's `basic`, else the generic rule — a strike clip
that lunges at least 0.15 figure widths is `melee` (`lunge` for a boss-sized
footprint), a row move is `area`, anything else `projectile`. `fallbackReport()`
lists what each ability resolves to and from where.

Clips a move asks for, and what a rig without them plays (`resolveClip`):

| clip | used for | fallback |
| --- | --- | --- |
| `anticipate` | melee anticipation, held at its last pose | generic crouch |
| `approach` | travel towards the target (loop) | generic bob |
| `retreat` | travel home (loop) | the rig's own `approach`, else generic bob |
| `attack` / `signature` / `cast` / `block` | the strike | `signature` → the rig's `attack` |
| `aim` | a bow's raise and draw, held at full draw | the rig's `anticipate`, else generic |
| `release` | the loose and recovery; `markers.release` is when the shot leaves | generic |

A clip's `markers.contact` (one or several fractions) and `markers.release`
time the fight. Without them, contact is derived: the peak of the forward
lunge, else the brightest flash, else the middle.

## Movement

Positions are stage fractions of a unit's feet; geometry comes from
`stageGeometry` — the placements plus what the layout pass measured of each
drawing (`figure`, the painted outline; `body`, the drawing's square).

### The attack point (`attack-point.ts`)

There is no pixel offset. For an attacker striking a target:

- It faces the target (by ground x), and stands on the target's feet line plus
  `IN_FRONT` (1.2% of the stage height), so it paints over what it hits.
- `k = scaleAt(actor, y)`: its size there relative to home, from the depth of
  that ground line.
- Reach in pixels: `reach × drawingScale(k)` if authored, else the front of its
  own outline × `k`; plus the strike clip's own lunge at contact × its body
  width.
- The struck surface: the target outline's near edge, moved in by
  `strikeInset × target drawing scale + 6% of the target's width`.
- `x = surface − face × reach`, then stood back if its own painted front at
  contact (outline × `k` + the clip's lunge) would bite into the target's
  outline by more than 6% of the target's width — a heavy figure whose ram
  reaches past its authored reach stops body-beside, not body-through —
  then limited so its centre never passes the
  near 35% of the target, clamped so its whole figure stays 2% inside the stage
  (`clamped` reports it), and snapped back to home if it would retreat by less
  than a quarter body width.

A boss's outline is wide, so attackers stand further off; a strongbox is square
and low, and they stand closer. `lunge` moves only a third of the way, at most a
tenth of the stage.

### The path (`lanePath`)

A quadratic from home to the attack point. The straight line is tried first,
then its control point bowed by ±0.05, ±0.1, ±0.15, ±0.2 of the stage height
(×2). Each candidate is costed by sampling 24 points and summing the overlap of
the traveller's outline with every standing unit whose feet are within 5% of the
stage height in depth (units further apart in depth are separated by paint
order, not collision). Straightness costs 40 per unit of bow and passing behind
costs 6, so the cheapest clear path wins and ties go in front of the camera.
The return path is costed the same way.

### Time, gait and depth

- `travelTime = clamp(distance / speed, floor, 900ms) × (0.68 + 0.32 × pace)`,
  where the floor belongs to the gait: `170ms × clamp(1.35 / speed, 0.6, 1.8)`.
  A Hound (2.6 w/s) closes a short gap in about 100ms; the Vanguard's charge
  (1.1 w/s) takes about 210ms; a heavy walk (0.75 w/s) about 300ms.
- Easing: `inOut` for runs, `out` for a dash, `linear` for a leap (with
  `lift = 0.16 × 4u(1−u)` of the stage height).
- Depth: the traveller is scaled by `scaleAt` — depth scale at the ground line
  it stands on over its depth scale at home — about its feet
  (`transform-origin` at the feet inside the drawing's square).
- Shadow: stays on the floor; under a leap it shrinks by up to 45% and fades by
  up to 55%.
- Facing: turning is instant and held; the lift is mirrored with `scaleX(-1)`
  so the drawing and its rig's motion turn round together. At home the neutral
  facing is restored by a pivot segment.
- Overshoot: a creature with `overshoot` runs on straight out of its bite,
  from where the strike clip carried it, `overshoot` drawing units past and
  3% of the stage height nearer the camera, then pivots (`turnToReturn`) and
  runs home.

### Paint order

The layout's z comes from each unit's ground point, which sits a different
distance under the feet of each kind of figure. A traveller's z is therefore
`paintZ(feet)`: one more than the z of the nearest unit whose feet are at or
behind its own. At home it keeps the layout's own z. Projectiles interpolate
the ground line from shooter to target and take `paintZ + 1`, so an arrow is in
front of each end of its flight. A ground mark paints just under the unit
standing on it.

## Projectiles

A `ProjectilePlan` is `{ from, to, look, spawn, arrive, start, end,
startAnchor, endAnchor }`, times relative to the round once laid in.

- Release: a bow's release is the `release` clip's marker after the draw and
  hold; a thrown or cast move's is the strike clip's release marker, else its
  contact. A second arrow in the same move is nocked and drawn again at 1.6×.
- Start: estimated from the muzzle anchor at rest when planned, then measured
  live at spawn by placing a probe inside the anchor's rig part — the arrow part,
  at the frame before release — so a shot leaves where the drawing has it. The
  trace reports `measured` or `estimated`.
- Path: `flightPoint(u)` for `linear`, `arc` (parabola, `arc` × length),
  `homing` (bends in and arrives head-on), `fromAbove` (falls from above the
  stage), `ground` (along the floor) and `beam` (stretches from the caster).
  Every trajectory reaches `end` exactly at `u = 1`, which is what lets the hit
  be scheduled on arrival without knowing how the flight is drawn. Rotation is
  the path's tangent (`rotate: "tangent"`), a spin, or none.
- Duration: `flightTime = clamp(length / speed, 220ms, 900ms)`, or an authored
  `duration`; beams take the floor. It is never squeezed below 80% of natural.
- One contact is one impact: every projectile of one release has its arrival
  set to the latest of them, so a volley or a shockwave lands on a whole row at
  once and nothing arrives early and vanishes before its target reacts.
- The target may still be settling when a shot leaves; the flight aims at where
  it will be.
- Arrival: `stick` (an arrow stays 420ms, moving with its target), `burst`
  (180ms) or `vanish`.
- Deliveries that cross nothing: `eruption` telegraphs the target's ground from
  the move's start and bursts 320ms after the release; `sigil` and `bloom`
  light the target at the release and burst 320ms and 190ms after it. `shockwave` sends a flat ring along the floor from the
  actor's feet.
- Camera: at release the camera frames the actor, the targets and every
  projectile in flight, and keeps re-framing until the next camera cue.

## Timing guarantees

- **Every consequence waits for its cause.** A melee hit is scheduled at its
  strike clip's contact; a shot's hit at its arrival; follow-ups (thorns, item
  triggers, falls) after the contact they follow. Beat, number, health change,
  flinch, impact effect, hit-stop, shake and impact sound are presented in the
  same director call.
- **Clips start on schedule, not on the frame that noticed them.** The director
  passes each clip its scheduled start (`PlayOptions.at`), so a strike's contact
  pose falls exactly where its hit was scheduled, on the same clock.
- **Every hit is drawn on a frame that shows its blow landing.** If a slow frame
  reaches both a unit's hit and its next clip, the next clip waits one frame.
- **A flinch never cuts a unit's own blow.** A unit hit back mid-strike (thorns)
  finishes the strike; the hit still shows its number, effect and sound.
- **A repeated strike never restarts before the blow it replays has landed**
  (at least 80ms after the previous contact).
- **A held pose is spent on delivery.** A boss's announced wind-up carries
  through its anticipation and approach and is spent (`spend` cue) on the clip
  that delivers the move; an anticipation longer than its clip holds the clip's
  last pose.
- **Nothing is aimed at the fallen.** A move whose named target fell earlier in
  the round goes for someone it actually hit, or strikes in place; a shot with
  nothing resolved at a fallen unit sends nothing.
- **A replay's time zero is its first frame**, so the slow frame that commits a
  new round cannot jump its first 200ms.
- **One actor never overlaps itself; nobody is hit on the way home.** A move
  starts no earlier than its actor is home, and no earlier than 40ms after
  anyone it lands on is home. Different actors overlap: the next wind-up may
  start at the previous move's `release` (a melee actor's return, a shot's
  flight, a brace's contact).

### Pacing and the ceiling

Every squeezable span has a natural length and a floor (`TIMING` in
`choreography.ts`): anticipation 260/150ms, arrival 70/30, follow-up 180/110,
fall 260/170, banner 640/480, bow hold 220/140, build 260/160, telegraph
320/200, travel at 68% of natural. Strike clips are never squeezed. A round
whose natural length exceeds `REPLAY_CAP − its hit-stops` is squeezed, every
span by the same share (`pace`), by bisection; one that does not fit at its
floors plays at its floors.

Measured in the Battle Lab at 1440×900 (planned presentation length; wall time
adds the hit-stops and about half a second of commit and frame overhead):

| round | natural | floors | at 9s | wall at 9s | `main` (6s cap) wall |
| --- | ---: | ---: | ---: | ---: | ---: |
| party 2, ordinary, all strike | 4.9s | 3.7s | 4.9s (pace 1) | 5.5s | 5.1s |
| party 3, ordinary, all strike | 7.2s | 5.5s | 7.2s (1) | 7.8s | 6.2s |
| party 4, ordinary, all strike | 9.0s | 6.8s | 8.7s (0.87) | 9.5s | 6.4s |
| party 4, hunting pack, all strike | 9.2s | 6.7s | 8.7s (0.82) | 9.5s | 6.3s |
| Collector, party 4, heroes brace | 5.8s | 4.6s | 5.8s (1) | 6.2s | 6.4s |
| Miser, party 4, heroes brace | 5.1s | 4.4s | 5.1s (1) | 5.6s | 6.4s |
| Collector, party 4, all strike | 7.3s | 5.4s | 7.3s (1) | 8.0s | 6.3s |
| Collector wind-up lands (signature) | 6.6s | 5.2s | 6.6s (1) | 7.2s | 6.4s |
| Miser wind-up lands (signature) | 6.9s | 5.3s | 6.9s (1) | 7.6s | 6.4s |
| Break focus interrupts the Collector | 5.4s | 4.1s | 5.4s (1) | 6.0s | 6.4s |

At 8s the two busiest rounds would play at pace 0.41–0.43; at 7.5s at
0.18–0.22, close to their floors.

### How the guarantees are tested

- `tests/choreography.test.ts` (pure): the clock's speed, pause, step and
  hit-stop; frame-task order; attack points outside the target and on the
  stage; path avoidance; every trajectory arriving exactly; dependency
  scheduling; projectile plans shifted with their moves; the held anticipation
  and the spend on delivery; repeated strikes never cut before contact; gait
  floors; overshoot direction; one release landing together; nothing aimed at
  the fallen.
- `tests-browser/choreography.spec.ts` (the Battle Lab, paused and stepped to
  named phases): a melee attacker leaves home, reaches its target and returns
  to the same pixel; it paints over its target at contact; a bow's arrow is
  drawn and oriented mid-flight, lands on its target's drawing, and nothing of
  the hit shows first; Skip mid-charge and mid-flight clears everything; a
  remount mid-move rebuilds from the layout; real rounds at 0.5× and 2× present
  no consequence before its contact or arrival; reduced motion moves nothing;
  no document overflow at any frame; a safe attack point on a boss; an
  interrupted wind-up schedules nothing; a fallen target gets nothing after its
  fall; and the Vanguard, Ranger and Hound run their phases and clips in order.
- `tests-browser/boss-moves.spec.ts`: a held wind-up is never dropped to idle
  before its signature.

The ordering check reads the DOM, not the schedule: a number counts as shown
when its node is inserted, health when the bar's figure changes, a reaction
when the target's rig reports `hurt`. For each consequence it finds the move's
cause — the arrival if the move sent anything at that target, else the actor's
contact marker — and requires the cause's frame to be at or before the first
frame any part of the consequence appeared. Measured in real rounds (Smoke
Line with the whole party attacking; the Rivet Hunting Party; the Collector's
signature round) and in synthetic bow, projectile, beam, AoE and multi-hit
moves, at 0.5×, 1× and 2×: 0 violations in 138 consequence checks, and every
primary hit presented in the same frame as its contact or arrival.

## The trace

`battle/trace.ts`. Development only: the Battle Lab installs a tracer when a
test or script calls `__lab.clearTrace()`, and nothing else ever does; with no
tracer every emitter is a single `if`. Events carry the presentation-clock time
of the frame they happened in and, where different, the time they were
scheduled for:

- `round`, `end`, `skip`;
- `phase` (actor, phase name);
- `contact` and `release`, reported by the animator the frame a delivering clip
  (`attack`, `signature`, `cast`, `block`, `release`) passes the marker;
- `spawn` (with the measured start) and `arrive` (with the drawn position);
- `beat` (kind, actor, target, amount, resulting health, and the actor whose
  move presents it);
- `sound` for choreographed sounds (draw, release, whoosh, footfalls; impact
  sounds ride their beats).

The lab adds what the page itself showed: `pop` (a number's node inserted),
`hp` (a health bar's figure changed), `clip` (a rig's `data-clip` changed).

## The Battle Lab and the debug overlay

`/dev/bosses.html?viewport=fit&stage=objective&encounter=<id>` (or
`boss=collector|miser`) `&party=2|3|4&heroes=a,b,c,d&you=N&motion=1&choreo=1&debug=1`.
`tempo=0.25` slows everything for inspection.

The choreography panel (`choreo=1`, `src/dev/choreo-lab.tsx`) picks an actor,
a target and an ability, and plays its own move or a forced melee, bow,
projectile, beam, AoE, multi-hit or interrupt. It controls speed (0.25×–2×),
pause, single-frame step, beat step and skip, and toggles the overlay. Synthetic
moves change no health; the board springs back when the replay ends. `window.__lab`
exposes `play`, `playRound` (several moves as one round, sharing health so a
move on the fallen fizzles), `round` (real plans resolved by the engine),
`api()` (the stage's clock, stagehand, animators, timeline and controls),
`clearTrace`/`trace`, `setDebug` and `setCap`.

The overlay (`debug=1`) draws, for the move in progress: home, the approach and
return paths, the attack point, the weapon's striking point, the target anchor,
each shot's path as flown from its measured release point, and the archetype
and current phase.

## Reduced motion, skip and reconnect

- Reduced motion: the board settles at once; no traversal is scheduled or
  written. Each move is pointed out in place, one after another: a ring on the
  actor, a line to what it hit and a mark on the target, then nothing remains.
- Skip: the director finishes the round; the stagehand resets every offset,
  lift, paint order, projectile, mark and phase; rigs settle to rest.
- Reconnect or remount: the stagehand is disposed and reset with the stage, and
  the first board a director sees is shown as it stands.
- The action menu: hidden for the whole of a replay and shown again once the
  round has settled, so nothing of the interface sits over a fighter crossing
  the stage. The move being performed names itself in the stage callout.

## Annotating a new creature

1. Draw the rig with named parts; give its strike clip a `markers.contact`
   where the weapon meets the target (and `markers.release` for a shot).
2. Add `approach` (a travel loop) and, if it backs away, `retreat`; add
   `anticipate` if its generic crouch does not read; add `aim` and `release`
   for a draw-and-hold. Author motion in the creature's own facing: an enemy's
   strike travels towards negative x.
3. Create `src/content/choreography/<id>.ts` with its `unit`: locomotion and
   speed, `basic`, `reach` measured in its drawing units at contact,
   `anchors.hit` and, for a shooter, `anchors.muzzle` riding the part that
   holds the shot. Register it in `index.ts`.
4. Annotate each ability that should not use the unit's defaults, with the
   `kit.ts` presets.
5. In the lab with `debug=1`, play each move at `tempo=0.25` and step it: the
   attack point beside the target, the weapon reaching the target's anchor at
   contact, a shot leaving the drawn muzzle.
6. Run `fallbackReport()` to see what is still generic, and the choreography
   specs.

## Still generic

Rig clips that fall back to the generic set (anticipate, approach, retreat, aim,
release) for every creature except the Vanguard (own approach and retreat), the
Ranger (own aim and release) and the Slag Hound (own anticipate and approach).

Abilities decided by the generic rules rather than an annotation: Vanguard *Iron
oath* (support), Herald *Counterpoint* and *Dirge* (support), Iron Bulwark *Lock
shields* (self), Rivet Sniper *Take aim* (self), Living Bellows *Draw breath*
(self). Decided by the creature's defaults: Arcanist *Break focus* and
*Stillness*, Warden *Unravel*, Beguiler *Beguile* and *Puppetry* (spell);
Broker *Liquidate*, Rivet Sniper *Kill shot* (projectile); Reaver *Drag them
down*, Cinder Stoker *Heavy hammer*, the Collector's *Close the account*, the
Miser's *Crushing levy* (melee); Ash Acolyte *Cinder eruption* (spell); Living
Bellows *Furnace blast* (area).

## The tuned roster

Beyond the reference set, these fighters are tuned by hand:

- Arcanist: the gloved hand comes up, the spark in it swells into an orb and holds, and is thrown. Arcane spark is an orb that crosses the stage; Storm needle is lightning out of the sky; Cloudburst is rain on its target; Cinder bloom erupts under every target it burned; Break focus is a sigil. The muzzle rides the `hand`, because a worn weapon hides the spark.
- Iron Bulwark: rears back, trudges at a third of the Vanguard's speed with every footfall heard and the plate leading, rams with a heavy hold and shake, rocks back and backs home. Lock shields is performed in place.
- Kiln Mender: the clamps reach in and weld in three bursts while the weld gathers at the lower clamp, which throws it across; the repair blooms, and heals, on arrival. Wrench is a short lunge.
- Rivet Sniper: dead still on the sight while the rivet heats at the muzzle, then a flash, the crack and a rivet from the barrel; the kick comes after the shot has left. Kill shot holds longer and kicks harder. An interrupted Kill shot produces no `cast`, so nothing is aimed or fired.
- Living Bellows: a long intake, then one cone of flame out of the horn across the row.

`tests/choreo-roster.test.ts` holds their plans; `tests-browser/choreo-roster.spec.ts` checks, from drawn frames, that every shot arrives before what it carries is shown.
