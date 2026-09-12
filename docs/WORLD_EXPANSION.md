# Gear, reach, regions and score

Implemented September 12, 2026 for the two-player public playtest.

## Equipment

All 20 equipment additions now have exclusive SVG artwork in `src/client/equipment/expedition-art.tsx`. The original twelve retain their authored art. Item metadata selects the asset; there are no item-name branches in the renderer. Six new weapon assets also have unique bow limbs for Ranger. Existing animated anchors, seizure, passive pulses, previews and results rendering apply automatically. There are no new equipment balance changes or fallback visuals.

| Item              | Physical design                                           |
| ----------------- | --------------------------------------------------------- |
| Rivet Breaker     | Split-jaw demolition head, steel shaft and rivet grooves  |
| Debt Hook         | Forged collection hook, stamped notice and chain loop     |
| Survey Spike      | Graduated survey needle and inset sight lens              |
| Slag Cutter       | Serrated slab blade with molten cutting channel           |
| Quench Rod        | Brass-ended coolant cylinder and exposed liquid window    |
| Tithe Hammer      | Heavy stamped ingot head with gold retaining bands        |
| Lattice Shell     | Cross-braced metal cage over dark chest backing           |
| Suture Coat       | Split work coat with visible repaired seams               |
| Quench Mail       | Cooling tubes threaded through a steel vest               |
| Antidote Weave    | Woven protective vest with paired antidote cartridges     |
| Rebuke Plate      | Raised chevron breastplate with defensive side barbs      |
| Second Skin       | Articulated overlapping ribs and restorative central seam |
| Salvage Token     | Worn octagonal scrap-worker token                         |
| Mercy Ampoule     | Stoppered rose-glass restorative ampoule                  |
| Grounding Cell    | Banded electrical cell with grounding tail                |
| Safety Seal       | Wax shield seal with ribbon tails                         |
| Steady Heart      | Mechanical heart pendant with pulse trace                 |
| Surge Vial        | Angled energy vial with asymmetric glass body             |
| Victory Bell      | Brass handbell with visible glowing clapper               |
| Contract Splinter | Jagged contract crystal with fractured inscription        |

Weapons use `mainHand/weapon`, armor `torso/body`, relics `waist/front`. Existing per-rig anchors handle all eight heroes; no new hero overrides. The SVGs use a handful of paths, no filters, gradients, shared SVG IDs or frame-by-frame rebuilding. Energy details inherit the existing restrained pulse animation.

## Melee reach

New runs store optional `reachVersion: 1`. Existing runs without it retain their previous targeting. Ability metadata has `melee`, `reach` or `ranged`, independent of equipped artwork.

- Vanguard's Shieldbreaker/Foundry Slam and Reaver's Rend/Blood Price/Frenzy are melee.
- Standing enemy front-line fighters screen back-row targets from melee. Containers do not screen.
- Clearing the front opens the rear to melee from either allied row.
- A hero in the front can bypass screening for a **single Marked target**. Row attacks cannot bypass a whole formation using one mark.
- Reaver's grapple and Warden's thorn lash have long reach. Ranged and spell actions bypass screening.
- Class-path replacements inherit their original action's reach. The client disables illegal targets and explains reach beside the selected action; the server rechecks at submission and resolution. If conditions change, the action fizzles before spending its cost, as existing invalid actions do.
- Simulation policies use the same legality helper to redirect screened attacks. Enemy intention selection keeps its existing front/back preferences; this update does not add a new enemy targeting system.

## Regions

The existing seven-depth expedition stays the same length. New maps traverse Ember Foundry (depths 0–1), Drowned Cistern (depth 2), and Ledger Archive (depths 3–6). Some routes bypass the Cistern fight in favor of its event or mentor.

Cistern art uses flooded arches, pressure valves, exposed pipes and a dry fighting deck. Archive art uses book vaults, hanging contract banners and a stamped stone floor. Both have independent far/middle/ground/foreground layers and retain the clear actor area.

Four regional formations reuse the existing enemy roster: Sluice Sentries, Diving Bell Recovery Crew, Probate Guard and Hunters of the Unpaid. These change the mix of guards, snipers, healers and thieves; they do not add new enemy art or environmental damage. Map chamber names and region labels communicate the route. Saved maps without biome metadata keep original encounters and Foundry presentation. Boss mechanics are unchanged.

## Music

Seven original synthesized eight-bar themes: Foundry, Cistern, Archive, combat, boss, auction and victory. Bass, melody, sparse harmony and combat percussion are generated with Web Audio; there are no external samples, licensing dependencies or downloads. Defeat uses the quieter regional theme.

The Music slider is independent of effects and ambience. One 80 ms scheduler looks ahead 160 ms against audio time, independent of replay speed. Voices stop and the timer is removed when muted, music volume is zero, the tab is hidden, or the room is left. A scene change releases the previous voices. First click/key unlocks audio for reconnecting players too. This is a compact synthesized score, not a recorded orchestral soundtrack.

## Verification and playtest

Structural tests cover unique equipment assets/bow forms, map determinism, regional encounter pools, legacy fallback, screening, marked openings, cleared fronts, ranged bypass, score selection and audio lifecycle. Browser coverage checks all 20 new art assets, Ranger attachment/projectile integration, both region scenes, and target disabling at four viewport sizes, alongside existing equipment and cooperative-economy regressions.

Validation: 350 unit tests pass. The 20 world browser checks and 44 existing equipment/expedition checks pass at 1280×720, 1366×768, 1440×900 and 1920×1080. Browser audio analysis confirms nonzero, bounded music output and silence after stopping. Production build and Worker dry run pass. JavaScript is 727.48 KB / 213.36 KB gzip, about 4.65 KB gzip larger than the prior build; the pre-existing large-chunk advisory remains.

The 13 real WebSocket smoke checks also pass against an isolated local Worker, covering two-player joining/readiness, synchronized decisions, reconnection, combat and upgrade progression.

For the friend playtest, create a **new room** to receive reach rules and the regional map. Existing mid-run rooms preserve their old rules. Try Vanguard + Ranger for Marked openings, or Reaver + Warden for pulling and sustain. Confirm audio unlock, adjust Music in settings, inspect new gear at auctions, and test a reconnect between rooms.
