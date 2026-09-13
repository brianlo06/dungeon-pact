# Anthem of the Unpaid — Herald

**The idea, in one sentence:** the Herald's horn does not play the anthem, it
asks for it — one note goes out, every ally in the pact answers it in their own
voice, and the last note is all of them at once, which is what the Herald has
been telling them all along: they are worth more than anyone ever paid them.

Only the Herald could have it. Its kit is other people (Battle anthem: "you
and an ally"; Closing cadence: a whole row), its resource is Verse, its rally
is a horn blown at the lips, and its title is *You are worth more than you
think.* A standard-bearer's whole job is to be answered.

## Gameplay purpose (unchanged)

`ultimate-defs/herald.ts`, target self: the whole party is Empowered (30%
harder) this round and next, gains 8 Barrier, and sheds Weak and Vulnerable.
No enemy is touched, so the film has no enemy in it: the stakes are the real
party, each ally with its real drawing and equipment, and the result — Barrier
and Empowered on every one of them — is revealed on the impact frame and shown
again on the real board.

## Space, palette, sound

- **Space:** a high ridge above the dungeon at dusk — the one place in any film
  with an open sky — dead calm, with a long line of bare pike-staves planted
  along the far crest: the standards of every company that was never paid,
  their colours long gone. A low sun sits on the horizon, drawn like the sun
  sewn on the Herald's tabard. Not a hall, a forge, a storm, a wood, a
  causeway or a room of mirrors.
- **Palette:** dusk violet, rose (`#ffb3d1`, the Herald's accent), bone and
  brass gold; and one colour for each ally's voice (the Vanguard gold, the
  Arcanist sky, the Ranger lime, the Warden teal, the Broker copper, the Reaver
  crimson, the Beguiler violet).
- **Signature effect — voices as ribbons.** A voice is drawn as a twisting
  ribbon of cloth-light in its singer's colour: the Herald's one rose note goes
  out along the party, each ally's answer rises off them in their own colour,
  in the quiet every ribbon hangs dead still in the air, and on the last note
  they all snap taut together and braid into one banner over the whole party.
  The banner the Herald carries, made of the people it carries it for. It does
  not depend on the Herald's own flag, which a worn weapon replaces.
- **Motif (original):** a horn asks A3; the party answers E4, then F♯4; the
  last note is every voice at once on a D major chord with D5 on top. Blown,
  then sung, then both.
- **Signature sound:** the ribbons snapping taut — a flag cracking in a sudden
  wind — under the chord. The impact is layered: the cloth crack (transient),
  a sub drop, the brass-and-choir chord (body) and a long ringing air (tail).
- **The quiet:** the music ducks to almost nothing, the answers stop, and the
  only sound is the Herald's breath being drawn in.

## Rhythm

identity (the note, blown with the eyes shut) → stakes and escalation (the
real party hears it and answers, one after another; title) → **quiet** (the
ribbons hang still; the Herald's eyes shut, the breath comes in, the eyes
open) → **impact** (every voice at once; the two-tone frame; the ribbons snap
into one banner; Barrier and Empowered land on everyone) → release (the real
board: each hero's own voice wound round them, warded and Empowered).

The quietest shot sits directly before the loudest. The Herald turns its back
on the enemy to face the party for the call, and turns round with them for
the last note — the cut is hidden in the two-tone frame.

## Shots — FULL 4160ms, FAST 2580ms (62%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Herald `ult:anthem-lift` — the horn comes up to the lips, the chest fills | real battlefield dims to dusk violet, bars close | rose call aura; the air drawn in towards the horn (`anthem-breath`) | a drawn breath; music ducks | on board | — | break the round: someone is about to sing |
| 1 | Note · Dutch | 640 (400) | on the head, horn and bell, Dutch 9° → 6°, drifting after the note | `ult:anthem-call` — turned to face the party (mirrored), the horn blown with eyes shut and brows up; the eyes open at the end of the note | ridge at dusk, low exposure, rose rim | **the first ribbon** unfurls out of the horn's bell across the frame (`anthem-note`) | the horn's note (motif, first note) | no | black 130ms (hides the copy blending into the horn) | identity: the call |
| 2 | Answer · profile tracking | 1000 (520) | trucks left along the real party at chest height, following the note | every ally `ult:anthem-answer`, staggered one after another by the film | ridge, lit; the far line of bare standards | the rose ribbon runs along the row; as it reaches each ally a ribbon in **their own colour** rises off them (`anthem-voices`), each answer a beat after the last | the answers (motif, second and third notes), a hum under them | **the real party**, with their real gear, answering | whip 110ms, following the note | stakes and escalation: who it is for; title |
| 3 | Hush · face close-up | 580 (360) | dead still, level, tight on the eyes and mouth — the one camera that does not move | `ult:anthem-breathe` — horn down, eyes shut, chest filling; at 0.8 the eyes and mouth open | ridge near black (exposure 0.1), a faint rose rim | every ribbon hangs dead still across the frame (`anthem-voices` held) | music ducked to 3%; silence; the breath drawn in, sharp, at the end | no | cut (the sound cuts with it) | the quiet |
| 4 | Anthem · impact | 780 (560) | wide on the whole party, pulling back hard as the chord hits, Dutch −4° → −1° | Herald `ult:anthem-cry` (contact 0.024) turned back to the fight, horn thrown up; every ally `ult:anthem-roar`, all at once | exposure blown then settling; rose tint | **two-tone frame**; the ribbons snap taut and braid into one banner over the party (`anthem-banner`); a ring of the chord goes out; each figure's ribbon wraps it once and a gold lift runs up it (`anthem-ward`) | layered chord (crack, sub, brass and choir, air) + room boom; 150ms stop; heavy shake | **the real party**, every one at once | cut on a 70ms two-tone frame (FAST: invert) | impact: every voice at once; Barrier and Empowered revealed on the frame; "All of us — now!" |
| 5 | Carried · return | 760 (500) | battle camera | real Herald `ult:anthem-stand` | real battlefield; bars open | every real party member wound in its own voice's ribbon, a pennant tail streaming off it (`anthem-pennant`) | the chord ringing out, a hummed reprise of the motif, tail | on board | flash 80ms | release: what it did, on everyone |

## Framing

Nothing in this film is an enemy, so a boss changes nothing inside it: the
framing is chosen by the target, and a self-targeted Ultimate has none (the
director frames it `normal` whatever the room). The boss is simply on the real
board in the call and the return. The compositions that do change are party
size: every party shot is laid out so one ally (a duo) sits near the Herald and
three allies fill the row without leaving the frame.

## FAST

Keeps all six shots, shorter: the answer is kept (a support film without its
party is not this film) but trimmed to 520ms, and the quiet and the impact are
kept whole in shape.

## Voice

"Nobody's paying us for this. Sing anyway." · "All of us — now!" · "Hear that?
That's what you're worth."

## Notes from the lab

- Every camera and effect was placed from probed part positions
  (`scripts/probe-ultimate.ts`): the Herald's mouth, horn and bell in the
  note, the eyes and mouth in the hush, and each ally's head for where its
  answer rises (a figure's mouth is taken as 0.74 of its drawn height).
- The horn at the lips is the combat rig's rallying note turned less far
  (−86°) and lifted, so the bell points along the party at mouth height
  instead of into the flag. On the last note the horn goes straight up
  (−172°): at −150° the arm crossed the face and hid the shout.
- A rim-lit figure carries a rim glow the size of its box; at a face
  close-up that glow is the whole frame, so the hush keeps its rim faint to
  stay dark.
- The allies stand nearer the camera as they go down the line in the anthem:
  a row's figures are painted in slot order, so the later slot must be the
  nearer one or it paints over the ally in front of it.
- Sounds were rendered offline and measured: the formant voice loses most of
  its source in two narrow bands, so it makes up ×2.8; the answers now peak
  near the horn (0.13 against 0.18), and the chord's peak matches the other
  films' impacts (1.20).
- The two-tone frame is the film's darkest moment and its most graphic: the
  figures and the far standards go to ink, the sky and the ribbons to rose.

## What the engine could not do, and what was built instead

- **Staggered reactions in a row.** A row's `react` clips land on every ally
  at once, and there is no per-slot offset. The allies' clips start together,
  and `anthem-voices` staggers the answer on top: as the note reaches each
  ally it lifts that figure (its `.cine-look`, which nothing else writes) with
  an overshoot, and its ribbon starts; the effect puts every figure back when
  its shot unmounts. The engine would need `react[].stagger` (milliseconds per
  slot, or an order by x) on an `allies`/`targets` cue.
- **Allies on the board.** In a `battlefield` shot, an `allies` clip goes to
  nobody (`director.ts` sends it to no unit), so the real allies cannot move
  in the call or the return; only the Herald does. What the Ultimate did is
  drawn over them instead (`anthem-pennant`). The engine would need battlefield
  clips for `allies` to reach the standing party.
- **A result revealed on the frame.** A status (Empowered) and Barrier are
  revealed on the impact frame (`reveal: impact` and `ward`), but the board's
  status chips already read from the snapshot, so they are visible under the
  film from its first frame. The film shows the result on every figure itself
  (the coil and the gold lift) so the frame still carries it.
- **Framing by party size.** Positions are per cue, not per count, so every
  party composition is authored to hold with one, two or three allies rather
  than recentred for each.
- **Boss framing.** Nothing to do: a self-targeted Ultimate has no target, so
  the director frames it `normal` in any room. A boss is only on the real
  board, in the call and the return.
