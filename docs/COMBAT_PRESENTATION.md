# Combat presentation

Updated 2026-09-10. How the battle screen is composed and why. The rules here
exist to stop combat drifting back into a dashboard; `ART_DIRECTION.md` covers
the wider visual identity.

## The one non-negotiable rule

**Combat owns exactly one viewport and never scrolls.**

The screen is three grid rows and only the middle one grows:

```
--strip      44px   context: round, chamber, boss objective, treasury, history
minmax(0,1fr)       the stage — everything left over
--controls   ≤186px party HUD and your actions
```

`minmax(0, 1fr)` rather than `1fr` is load-bearing: it lets the stage shrink
instead of pushing the controls off the bottom. Any new section has to take its
height from the strip or the controls, never from the document.

While `s.phase === "COMBAT"` the shell carries `data-combat`, which makes it
`100dvh`, hides the topbar and the run footer, and sets `overflow: hidden` on
`html` and `body`. Every other phase is unaffected.

Two layers of test, deliberately. `tests/battle-layout.test.ts` locks the CSS
rules that make it true; `tests-browser/combat-layout.spec.ts` runs Playwright
at all four resolutions and asserts the result — no overflow in any state a
fight reaches, the page unscrollable even when something tries, and the stage,
treasury, party HUD, every intention and every combatant inside the viewport.
The contract tests catch a rule being deleted; the browser tests catch a rule
being satisfied and the layout still being wrong. No pixel diffing.

Breakpoints key off **height**, not width, because height is the constraint that
was actually being violated.

## The stage

Four depth bands, not four rows of cells:

| Band        | Depth | Reads as                                   |
| ----------- | ----- | ------------------------------------------ |
| enemy back  | 0.0   | furthest into the scene, smallest, coolest |
| enemy front | 0.3   | the fight's centre                         |
| hero front  | 0.72  | nearer the camera                          |
| hero back   | 1.0   | nearest the camera, largest                |

Depth is a number the stage supplies and the combatant consumes. It drives size
(`0.74 + depth × 0.36`) and saturation, so front and back are legible without a
label reading FRONT. Bands lean away from each other (`--lean`, ±7% and ±14%) so
the fight reads as a confrontation across a space rather than two stacked lists.

Combatant size comes from **container query units against the stage**
(`clamp(52px, 19cqh, 138px)`), not viewport units. The stage is the box a
fighter should be sized against, and this is also what makes the preview lab
honest: it renders the battle at an explicit resolution inside a larger window.

`footprint()` in `BattleStage.tsx` gives creatures different scale — a boss is
1.5, a container 1.05, a swarm-ish enemy 0.9. Scale is threat. These live in
presentation for now; they move to content presentation metadata when that
schema lands.

## Enemy intentions

Attached to the creature, never a detached card elsewhere on screen. A windup
gets a pulsing bordered chip and the word WINDUP, because interrupting it is a
real decision. Below 680px of height the back-row chips collapse to hover, since
the front row is where the pressure is.

## What is no longer permanently on screen

- The chronicle. It is now an opt-in drawer that **overlays** the stage and can
  never change the battlefield layout. `☰` in the strip, Escape to close.
- Full stat blocks. A combatant shows name, health, barrier, statuses and any
  seized equipment; everything else is a tooltip.
- The standing explanation of the rules.

## Presentation space and the camera

`battle/layout.ts` derives everything visual from side and row: x, y (the
unit's _ground point_), depth, scale, paint order and shadow width, as
fractions of the stage. None of it is ever written back into run state.
`bulk()` gives creatures different footprints — a boss is 1.62, a container
1.15 — keyed off flags the content already carries rather than off names.

`battle/camera.ts` exposes presets, not transforms: neutral, hero, target,
action, boss. One animation frame loop smooths it and decays shake. The world
is drawn 12% larger than the stage and travel is clamped to ±5%, so panning can
never expose an edge. Nothing in the engine reads it, and a camera that failed
to move would still leave a playable, fully framed board.

## Beats

`resolveRound` emits `Beat { kind, actor, target, label, amount, hp }` and
`battle/director.ts` turns the round into choreography: one timeline on one
animation frame loop that moves the camera, spawns effects, throws numbers and
interpolates health. It decides nothing — if it never ran, the board would
still be correct.

One loop rather than scattered `setTimeout`s is what makes speed control,
pausing, stepping and hit-stop possible at all; each is a different way of
advancing the same clock. Hit-stop is 40/75/120ms by how hard the hit landed.
The strip carries pause, step and 0.5×/1×/2× while a round replays.

Effects come from a small reusable vocabulary in `BattleVfx.tsx` — impact,
slash, cast, projectile, heal, barrier, interrupt, seize, reclaim — combined
per beat rather than authored per ability. Current mapping:

| Beat   | Presentation                                       |
| ------ | -------------------------------------------------- |
| cast   | ability name slams in over the stage; actor lunges |
| damage | recoil, floating number, health interpolates       |
| heal   | green rim light, floating number                   |
| block  | blue rim light, ⬡ number                           |
| combo  | full-stage banner (EXPLOIT, CHAIN SHOCK…)          |
| defeat | banner, unit desaturates                           |

## Beat labels are the presentation vocabulary

The director keys the seizure chain off the `SEIZED` beat label, the reclaim
burst off `RECLAIMED`, and the break off `INTERRUPTED`. This is **not** the same
as knowing a boss by name: any content that produces a seizure gets the
choreography, and the engine already speaks these labels. Presentation may read
beat labels; it may never branch on an enemy or ability id.

## The Collector, as the quality bar

The objective has to be legible with the chronicle closed. Repossess lands, a
`SEIZED` banner slams, a chain travels from the robbed hero to the Strongbox,
and the Strongbox — spawned into the back row, larger than an ordinary enemy —
shows `⚿ N held` with the item names on hover. Breaking it plays a reclaim
burst and the tag disappears. Its intent chip reads "Opened", never "Defeated",
because it was never an enemy that had to die.

## Still to build

Phases C–I of the overhaul are not done. In rough priority:

- **C** real 2.5D — parallax scenery, atmospheric particles, foreground
  occlusion, camera translation and zoom.
- **F** presentation metadata on content (`animationKey`, `vfxKey`,
  `cameraPreset`), so an ability picks its own effect instead of the director
  inferring one from the beat kind. The schema must be optional and default
  cleanly. Creature footprints move there too.
- **G** boss entrances, boss HUD, phase transitions.
- **Sprite animation.** Every combatant is still a single cell that breathes
  via transform. Idle/attack/cast/hurt/downed sheets have somewhere to plug in
  and do not exist.
- **H** creature art direction.
- **I** timing, shake control, audio balance.

## Rules any of that must keep

- Presentation never computes a result. No damage, RNG, gold or enemy decision
  moves into the client.
- No content is known by name in combat code. Presentation may key animations
  and effects off metadata the content supplies; it may not branch on
  `enemy.name === "The Collector"`.
- Presentation metadata is optional and defaults cleanly, so old runs render.
- Reduced motion keeps every piece of tactical information.
