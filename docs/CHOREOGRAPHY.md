# Combat choreography

Combat presentation is planned from resolved combat beats. It never predicts damage, targets, interrupts, or item effects. The server result remains authoritative; this layer only decides how the known result crosses the stage.

## Architecture

`PresentationClock` is the single time source for unit clips, movement, projectiles, VFX, audio cues, camera motion, hit stop, pause, speed, and frame stepping. `FrameLoop` applies clock tasks in a stable order. A round becomes a `RoundPlan`; `Stagehand` evaluates the plan without changing the permanent formation layout.

Each action resolves through these presentation phases:

1. anticipation or aim
2. approach to a measured attack point when the archetype moves
3. strike or projectile release
4. authoritative impact at physical contact or projectile arrival
5. recovery
6. return to the actor's home position

Movement uses a transform on the combatant's stable stage node. Animation remains inside that node, camera transforms remain outside it, and projectiles live in the stage projectile layer. The formation grid therefore stays authoritative throughout travel.

## Content metadata

Creature annotations live in `src/content/choreography/<creature>.ts`. `src/content/choreography/kit.ts` provides the reusable melee, lunge, bow, projectile, spell, area, self, and support presets. Content may specify locomotion, reach, speed, rig anchors, delivery style, charge, projectile appearance, and presentation weight. It cannot specify results.

The registry contains all eight heroes, every current regular enemy, the Strongbox, and both bosses. Missing fields use safe generic defaults. Missing clips resolve through `Animator.resolve`, so an incomplete rig still travels and attacks.

A move's annotation can also give:

- `sounds` — the sound of each moment (`charge`, `release`, `travel`, `swing`, `impact`, `step`), layered over the sounds the beats themselves carry; `null` silences a moment. A move annotated with a `charge` sound shows its build-up even when its archetype would not.
- `weight` — `heavy` and `signature` blows hold the scene and shake the camera by `IMPACT`'s numbers when they land, if those are more than the hit's number alone would earn. Only a contact that hurt someone does.
- `timing.anticipation` on a ranged move — the build-up before its clip. `0` when the clip performs the build-up itself, as the Arcanist's, Mender's, Sniper's and Bellows' do: the charge glows at the muzzle anchor, riding its rig part, until the frame the shot leaves.
- `projectile.muzzleFlash` — a report at the muzzle as the shot leaves.
- `delivery: "cone"` — one breath from the muzzle across every target the contact hit, opened wide enough to cover them, arriving on all of them at once.

## The tuned roster

Beyond the reference set, these fighters are tuned by hand:

- Arcanist: the gloved hand comes up, the spark in it swells into an orb and holds, and is thrown. Arcane spark is an orb that crosses the stage; Storm needle is lightning out of the sky; Cloudburst is rain on its target; Cinder bloom erupts under every target it burned; Break focus is a sigil. The muzzle rides the `hand`, because a worn weapon hides the spark.
- Iron Bulwark: rears back, trudges at a third of the Vanguard's speed with every footfall heard and the plate leading, rams with a heavy hold and shake, rocks back and backs home. Lock shields is performed in place.
- Kiln Mender: the clamps reach in and weld in three bursts while the weld gathers at the lower clamp, which throws it across; the repair blooms, and heals, on arrival. Wrench is a short lunge.
- Rivet Sniper: dead still on the sight while the rivet heats at the muzzle, then a flash, the crack and a rivet from the barrel; the kick comes after the shot has left. Kill shot holds longer and kicks harder. An interrupted Kill shot produces no `cast`, so nothing is aimed or fired.
- Living Bellows: a long intake, then one cone of flame out of the horn across the row.

`tests/choreo-roster.test.ts` holds their plans; `tests-browser/choreo-roster.spec.ts` checks, from drawn frames, that every shot arrives before what it carries is shown.

## Geometry and timing

`attackPoint` derives contact from the rendered actor and target rectangles, the attacker's facing direction, its authored reach, and the strike clip's own lunge. `lanePath` bends around occupied stage rectangles and returns a deterministic route. Projectile duration is derived from distance and authored projectile speed, with a readability floor.

Actions by different actors may overlap where the beat dependencies allow it. Actions by the same actor remain ordered. Damage and status beats remain attached to the action's contact or arrival time. The replay ceiling is 9 seconds; this replaces the former 6-second ceiling so full approach, contact, recovery, and return choreography is not truncated. The scheduler still compresses excess plans deterministically to the ceiling.

## Battle Lab

The choreography lab exposes Vanguard, Ranger, and Slag Hound scenes as the first visual reference set:

- Vanguard: shield-first charge, measured sword contact, guarded retreat
- Ranger: aim, draw hold, release, arrow flight, impact
- Slag Hound: low sprint, overshoot, turn, return

The debug overlay shows home, route, attack point, weapon or muzzle anchor, target anchor, phase, clip, and presentation time. Lab controls cover pause, resume, speed, single-frame stepping, and replay.

## Validation

Unit tests cover clock controls and hit stop, stable frame-task order, contact geometry, obstacle avoidance, projectile arrival, and round dependency scheduling. Existing pacing tests retain their legacy `paceRound` surface while the live battle uses `scheduleRound`.

