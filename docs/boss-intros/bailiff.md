# The Bailiff — boss intro

**The idea, in one sentence:** the Bailiff comes to collect, by the book —
three knocks, a hall of doors already served, boots that stop outside and a
summons slid under the door, the door opened on it, one rap of the tipstaff to
open the court, and a writ served on a hero that the hero tears off and serves
straight back.

Only the Bailiff could have it. Its drawing is a constable in a greatcoat and
bicorn with a sheaf of summons and an iron-bound tipstaff; its objective is the
lien — served on a hero, due in three rounds or the moment the Bailiff lands a
hit on the carrier, and answerable by serving it back. So the entrance is
procedure: it knocks, it is let in, it opens court, and it serves. The mechanic
beat shows the lien and its counter both.

It breaks nothing down (Gatebreaker is the ram through a gate) and nothing in
it is wax (the Notary's) or chain (the Collector's): paper, oak and an iron
foot on a floor.

## Rhythm

knocks (the board shaken three times, dust sifting down) → stakes (a hall of
doors papered with served notices, the party before the one still shut) →
**quiet** (under the door: lamplight, two boots arriving and stopping in it, a
summons slid through; music at 3%) → reveal (the door swings in on the Bailiff
in the lit court) → **loudest** (one rap of the tipstaff: flash, hit-stop, the
summons flung up, the title) → the mechanic (a writ flown onto a hero, tied to
the staff and counting three — torn off and thrown back into the Bailiff; "You
have been served.") → back as the door is pulled to.

## Shots — FULL 5710ms, FAST 3120ms (55%)

| # | Shot | ms (FAST) | Camera | Boss | Space / light | Effects | Sound | Purpose |
|---|---|---|---|---|---|---|---|---|
| 0 | Knocks · call | 600 (360) | battle camera | on the board | the board dims, bars close; three small shakes | `bli-dust` falls at each knock | `bli-knocks`; music ducked to 12% | someone is at the door |
| 1 | Hall · wide | 950 (—) | tracks along the served doors to the court door | — | `bli-hall`, cold stone, lamplight | the party in silhouette at the court door | `bli-hall` (boots), the motif at 0.42 | stakes: everyone here was served |
| 2 | Under · extreme close-up | 750 (420) | the gap under the door | — | dark but for the line of light | `bli-under`: boots stop by 0.35; summons through from 0.45 | two `bli-stop`, `bli-slide`; music to 3% | the quiet: it is outside |
| 3 | Enter · low angle | 800 (500) | on the doorway, rising | `intro:enter`: half step in, staff shouldered, head up | lit from behind | `bli-door` swings in on the lit court | `bli-door`, a step | the reveal |
| 4 | Rap · impact | 1000 (720) | wide, settling | `intro:rap` (contact 0.38) | exposure up, lien-red rim | shockwave and dust at the staff's foot; `bli-papers` from the fist; 60ms flash, 110ms stop, shake | `bli-rap`; music back to 55% | the loudest; the title card |
| 5 | Served · target | 1050 (720) | across from the party to the Bailiff | `intro:serve` (summons flourished, staff levelled), flinches at 0.86 | lamplight on the party, lien rim | `bli-writ`: served at 0.3, tether and three ticks, torn off at 0.66, back on the Bailiff at 0.86 | `bli-serve`, `bli-return`; the line | the lien and serving it back |
| 6 | Return | 560 (380) | battle camera | on the board | bars open | — | `bli-shut`; music back | back to the fight |

FAST drops the hall and keeps the knocks, the door gap, the entrance, the rap,
the serving and the return. Reduced motion plays the generic still card with
the Bailiff's accent and title, and no camera move, flash, shake or stop.

## Notes from the lab

- **The writ hung over the heroes' heads.** It is aimed with `tx`/`ty` params
  now and pins on the front hero's chest; the party is drawn larger there.
- **The rap didn't reach the floor.** The staff's contact rotation was a
  horizontal jab; it goes to −88° now, crown on the floor where the shockwave is.
- **The summons flew out of its hat.** They are thrown from the fist that holds
  them.
- **The quiet showed the hall through the light.** The spill under the door had
  no floor under it; it has one now.
- **Levels** (`scripts/intro-levels.ts bailiff`, peak / RMS over 3s): the rap
  1.29 / 0.089; the knocks 0.46; the writ back 0.36; the door 0.21; the motif
  0.12; the stopping boots 0.06, the quietest thing in it.
