import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { PixelIcon } from "./PixelIcon";
import { SEATS } from "./seats";
import type { Snapshot } from "../../shared/model";
import type { Intent } from "../../shared/protocol";
import type { EventDef, Outcome } from "../../content/events";
import {
  describeOutcome,
  eventDef,
  outcomeFor,
  pressOdds,
  shares,
} from "../../content/odds";

type Props = { s: Snapshot; send: (i: Intent) => void; disabled: boolean };
/** One band of a d100: where it starts and ends, and whether it is good news. */
type Band = { label: string; percent: number; tone: "good" | "bad" };

/**
 * An event chamber. A fixed event is a vote and nothing more; a chance event
 * prints its odds on every choice, then shows the party the roll: the number,
 * where it fell on the bands, and what that did.
 */
export function EventRoom(props: Props) {
  const { s, send, disabled } = props;
  const event = eventDef(s);
  const luck = s.luck;
  const pressing = !!luck && !!event.press && !luck.done;
  return (
    <section
      className={`center-screen event-room ${event.luck ? "chance" : ""}`}
    >
      <span className="large-symbol">
        <PixelIcon name={event.luck ? "dice" : "question"} />
      </span>
      <span className="eyebrow">
        {event.luck
          ? "A GAMBLE · THE ODDS ARE ON THE TABLE"
          : "A CHANCE ENCOUNTER"}
      </span>
      <h1>{event.name}</h1>
      <p className="lore">{event.text}</p>
      {luck && <Result s={s} event={event} />}
      {luck?.done ? (
        <div className="chance-continue">
          <button
            className="primary"
            disabled={disabled}
            onClick={() => send({ type: "continue" })}
          >
            {luck.fight ? "Fight! →" : "Continue →"}
          </button>
        </div>
      ) : pressing ? (
        <div className="choices">
          <PressAgain {...props} event={event} />
        </div>
      ) : (
        <div className="choices">
          {event.choices.map((c) => (
            <Vote
              {...props}
              key={c.id}
              id={c.id}
              title={c.name}
              text={c.description}
              cost={c.cost}
            >
              {c.roll && <Odds outcomes={c.roll} stake={c.cost} />}
              {c.each && <Odds outcomes={c.each} stake={c.cost} each />}
              {c.press && event.press && <Ladder event={event} step={0} />}
            </Vote>
          ))}
        </div>
      )}
    </section>
  );
}

function Vote({
  s,
  send,
  disabled,
  id,
  title,
  text,
  cost = 0,
  children,
}: Props & {
  id: string;
  title: string;
  text: string;
  cost?: number;
  children?: ReactNode;
}) {
  const mine = s.votes[s.you] === id;
  const votes = Object.values(s.votes).filter((v) => v === id).length;
  return (
    <button
      className={`choice ${mine ? "selected" : ""}`}
      disabled={disabled || !!s.votes[s.you] || cost > s.gold}
      onClick={() => send({ type: "vote", choice: id })}
    >
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
      <span>
        {votes} {votes === 1 ? "vote" : "votes"} ·{" "}
        {mine
          ? "Your vote is locked"
          : cost > s.gold
            ? "The treasury cannot cover it"
            : "Cast your vote →"}
      </span>
    </button>
  );
}

/** A choice's outcomes as a bar of d100 bands, with what each one does. */
function Odds({
  outcomes,
  each,
  stake,
}: {
  outcomes: Outcome[];
  each?: boolean;
  stake: number;
}) {
  const bands = shares(outcomes);
  return (
    <div className="odds">
      {each && <small className="odds-each">Each hero rolls separately</small>}
      <Gauge
        bands={bands.map(({ outcome, percent }) => ({
          label: outcome.label,
          percent,
          tone: outcome.tone,
        }))}
      />
      <ul>
        {bands.map(({ outcome, percent }) => (
          <li key={outcome.id} className={outcome.tone}>
            <b>{percent}%</b> {outcome.label}
            <em>
              {describeOutcome(outcome) ||
                (stake ? `lose the ${stake} gold stake` : "nothing happens")}
            </em>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** How the odds of a press-your-luck event move, try by try. */
function Ladder({ event, step }: { event: EventDef; step: number }) {
  const press = event.press!;
  const tries = Array.from(
    { length: press.kind === "search" ? 3 : 4 },
    (_, i) => pressOdds(event, step + i),
  ).slice(0, press.kind === "search" ? press.loot!.length - step : undefined);
  return (
    <div className="odds ladder">
      <small className="odds-each">
        {press.kind === "search"
          ? `Each search: one of ${press.loot!.map((o) => o.label.toLowerCase()).join(", ")}`
          : `Find it: ${describeOutcome(press.prize!)}. Each try burns every hero:`}
      </small>
      <ol>
        {tries.map((t, i) => (
          <li
            key={i}
            className={press.kind === "search" ? "bad" : "good"}
            aria-current={i === 0 ? "step" : undefined}
          >
            <b>{t.chance}%</b>
            <span>{press.kind === "search" ? "ambush" : `−${t.hurt} HP`}</span>
          </li>
        ))}
        {press.kind === "dig" && <li className="more">…climbing</li>}
      </ol>
      {press.kind === "search" && (
        <em className="ladder-bust">
          Ambush: {describeOutcome(press.bust!)}. You keep what you found.
        </em>
      )}
    </div>
  );
}

/** The vote after a try: go again, with the next odds, or walk away. */
function PressAgain(props: Props & { event: EventDef }) {
  const { s, event } = props;
  const press = event.press!;
  const luck = s.luck!;
  const next = pressOdds(event, luck.step);
  const found = (luck.found ?? [])
    .map((id) => outcomeFor(event, luck.choice, id)!)
    .map((o) => o.label.toLowerCase());
  return (
    <>
      <Vote
        {...props}
        id="press"
        title={press.kind === "search" ? "Search again" : "Reach in again"}
        text={
          press.kind === "search"
            ? `Find one more thing. ${next.chance}% chance the thing that buried him comes back.`
            : `Every standing hero loses ${next.hurt} HP. ${next.chance}% chance to find it.`
        }
      >
        <Ladder event={event} step={luck.step} />
      </Vote>
      <Vote
        {...props}
        id="leave"
        title={
          press.kind === "search" ? "Leave with what you found" : "Give up"
        }
        text={
          press.kind === "search"
            ? `Keep ${found.join(" and ")}, and go.`
            : "Keep the HP you have left."
        }
      />
    </>
  );
}

/** The roll the party is looking at. */
function Result({ s, event }: { s: Snapshot; event: EventDef }) {
  const luck = s.luck!;
  const key = `${luck.choice}.${luck.step}`;
  if (luck.heroes) {
    const choice = event.choices.find((c) => c.id === luck.choice)!;
    return (
      <div className="chance-result each" key={key}>
        <h2>{choice.name}</h2>
        <ul className="hero-rolls">
          {s.players.map((p, i) => {
            const r = luck.heroes![p.id];
            if (!r) return null;
            const o = outcomeFor(event, luck.choice, r.outcome)!;
            return (
              <HeroRoll
                key={p.id}
                name={p.name}
                seat={SEATS[i].color}
                roll={r.roll}
                outcome={o}
                bands={shares(choice.each!).map(({ outcome, percent }) => ({
                  label: outcome.label,
                  percent,
                  tone: outcome.tone,
                }))}
              />
            );
          })}
        </ul>
      </div>
    );
  }
  const { bands, outcome, miss } = describeRoll(event, luck);
  return (
    <Rolled
      key={key}
      roll={luck.roll!}
      bands={bands}
      outcome={outcome}
      miss={miss}
      found={(luck.found ?? []).map((id) =>
        outcomeFor(event, luck.choice, id)!,
      )}
    />
  );
}

/** Which bands the last roll was read against, and what it landed on. */
function describeRoll(event: EventDef, luck: NonNullable<Snapshot["luck"]>) {
  const choice = event.choices.find((c) => c.id === luck.choice)!;
  const outcome = outcomeFor(event, luck.choice, luck.outcome);
  if (choice.roll)
    return {
      outcome,
      bands: shares(choice.roll).map(({ outcome, percent }) => ({
        label: outcome.label,
        percent,
        tone: outcome.tone,
      })) as Band[],
    };
  const press = event.press!;
  const { chance, hurt } = pressOdds(event, luck.step - 1);
  if (press.kind === "search")
    return {
      outcome,
      bands: [
        { label: "Ambush", percent: chance, tone: "bad" },
        { label: "Safe", percent: 100 - chance, tone: "good" },
      ] as Band[],
    };
  return {
    outcome,
    miss: outcome ? undefined : `Only slag. Everyone is burned for ${hurt}.`,
    bands: [
      { label: "Found it", percent: chance, tone: "good" },
      { label: "Nothing", percent: 100 - chance, tone: "bad" },
    ] as Band[],
  };
}

/** A number that tumbles before it lands, unless the player asked for stillness. */
function useTumble(roll: number) {
  const still =
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [shown, show] = useState(still ? roll : 1);
  const [settled, settle] = useState(still);
  useEffect(() => {
    if (still) return;
    const started = performance.now();
    const tick = setInterval(() => {
      if (performance.now() - started > 900) {
        clearInterval(tick);
        show(roll);
        settle(true);
      } else show(1 + Math.floor(Math.random() * 100));
    }, 60);
    return () => clearInterval(tick);
  }, [roll, still]);
  return { shown, settled };
}

function Rolled({
  roll,
  bands,
  outcome,
  miss,
  found,
}: {
  roll: number;
  bands: Band[];
  outcome?: Outcome;
  miss?: string;
  found: Outcome[];
}) {
  const { shown, settled } = useTumble(roll);
  const tone = outcome?.tone ?? "bad";
  return (
    <div
      className={`chance-result ${settled ? `settled ${tone}` : "rolling"}`}
      aria-live="polite"
    >
      <div className="die" aria-label={settled ? `Rolled ${roll}` : "Rolling"}>
        <small>d100</small>
        <strong>{shown}</strong>
      </div>
      <div className="chance-read">
        <Gauge bands={bands} marker={settled ? roll : shown} />
        {settled && (
          <>
            <h2>{outcome?.label ?? "Nothing yet"}</h2>
            <p>{outcome?.text ?? miss}</p>
            {outcome && describeOutcome(outcome) && (
              <em>{describeOutcome(outcome)}</em>
            )}
          </>
        )}
        {found.length > 0 && (
          <p className="found">
            Found so far: {found.map((o) => o.label).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}

function HeroRoll({
  name,
  seat,
  roll,
  outcome,
  bands,
}: {
  name: string;
  seat: string;
  roll: number;
  outcome: Outcome;
  bands: Band[];
}) {
  const { shown, settled } = useTumble(roll);
  return (
    <li
      className={`hero-roll ${settled ? `settled ${outcome.tone}` : "rolling"}`}
      style={{ "--seat": seat } as CSSProperties}
    >
      <strong className="hero-roll-name">{name}</strong>
      <span className="die small">
        <strong>{shown}</strong>
      </span>
      <Gauge bands={bands} marker={settled ? roll : shown} />
      <span className="hero-roll-result">
        {settled ? (
          <>
            <b>{outcome.label}</b> {describeOutcome(outcome)}
          </>
        ) : (
          "Rolling…"
        )}
      </span>
    </li>
  );
}

/** A 1–100 strip split into its bands, with a pin where the roll fell. */
function Gauge({ bands, marker }: { bands: Band[]; marker?: number }) {
  return (
    <div
      className="gauge"
      role="img"
      aria-label={bands.map((b) => `${b.percent}% ${b.label}`).join(", ")}
    >
      {bands.map((b, i) => (
        <span
          key={i}
          className={`gauge-band ${b.tone}`}
          style={{ flexBasis: `${b.percent}%` }}
          title={`${b.percent}% ${b.label}`}
        />
      ))}
      {marker !== undefined && (
        <span
          className="gauge-pin"
          style={{ left: `${marker - 0.5}%` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
