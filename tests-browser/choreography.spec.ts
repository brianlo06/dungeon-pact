import { test, expect, type Page } from "@playwright/test";

/**
 * Attack choreography, driven through the Battle Lab and read back from the
 * page: where each figure is drawn, what paints over what, what is in the
 * air, and the lab's trace of when every contact, arrival and consequence
 * was actually presented (see `src/client/battle/trace.ts`).
 *
 * Positions are sampled with the replay paused and the presentation clock
 * stepped to a named phase, so a slow machine changes how long a test takes
 * and never what it sees.
 *
 * Every consequence check reads the real DOM: a number counts as shown when
 * its element is inserted, health when the bar's figure changes, a reaction
 * when the target's rig reports `hurt`.
 */

test.describe.configure({ timeout: 90_000 });

type Json = Record<string, unknown>;
interface Rec {
  kind: string;
  t: number;
  at: number;
  due?: number;
  unit?: string;
  to?: string;
  name?: string;
  amount?: number;
  hp?: number;
  x?: number;
  y?: number;
  detail?: string;
}

const SMOKE = { encounter: "smoke-line", party: 4 };

const scene = (params: Json) =>
  `/dev/bosses.html?${new URLSearchParams({ viewport: "fit", stage: "objective", ...(params as never) })}`;

async function open(page: Page, params: Json) {
  await page.goto(scene(params));
  await page.locator(".stage").waitFor();
  if (await page.locator(".boss-intro").count()) {
    await page.keyboard.press("Escape");
    await page.locator(".boss-intro").waitFor({ state: "detached" });
  }
  await page.waitForFunction(
    () =>
      !!(window as never as { __lab?: { api: () => unknown } }).__lab?.api(),
  );
  // Tracing on, and a frame for its observer to attach.
  await page.evaluate(() => (window as never as Lab).__lab.clearTrace());
  await page.waitForTimeout(150);
}

interface Lab {
  __lab: {
    play: (r: Json) => void;
    playRound: (r: Json[]) => void;
    round: (p: Json[]) => void;
    clearTrace: () => void;
    trace: () => Rec[];
    api: () => {
      setPaused: (v: boolean) => void;
      setSpeed: (n: number) => void;
      skip: () => void;
      elapsed: () => number | null;
      timeline: () => {
        duration: number;
        moves: {
          start: number;
          timeline: {
            actor: string;
            archetype: string;
            phases: { name: string; start: number; end: number }[];
            segments: unknown[];
            projectiles: { to: string }[];
            debug: { attackPoint?: { x: number; y: number } };
          };
        }[];
        segments: { unit: string }[];
        projectiles: { from: string; to: string }[];
      } | null;
      loop: { clock: { step: (ms: number) => void; time: number } };
    };
  };
}

/** Unit ids by display name. */
const ids = (page: Page) =>
  page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll<HTMLElement>(".combatant")].map((c) => [
        c.querySelector(".combatant-name")!.textContent!,
        c.dataset.unit!,
      ]),
    ),
  );

/** Start synthesised moves paused, at the round's first frame. */
async function playPaused(page: Page, reqs: Json[], speed = 1) {
  await page.evaluate(
    ({ reqs, speed }) => {
      const lab = (window as never as Lab).__lab;
      lab.api().setSpeed(speed);
      lab.api().setPaused(true);
      lab.playRound(reqs);
    },
    { reqs, speed },
  );
  await page.waitForFunction(
    () => (window as never as Lab).__lab.api().elapsed() !== null,
  );
}

/** The time a move's phase starts, round-relative. */
const phaseAt = (page: Page, move: number, name: string, frac = 0) =>
  page.evaluate(
    ({ move, name, frac }) => {
      const tl = (window as never as Lab).__lab.api().timeline()!;
      const m = tl.moves[move];
      const p = m.timeline.phases.find((x) => x.name === name);
      if (!p)
        throw Error(
          `no ${name} phase in ${m.timeline.phases.map((x) => x.name)}`,
        );
      return m.start + p.start + (p.end - p.start) * frac;
    },
    { move, name, frac },
  );

/** Step the paused clock to round time `ms` and let two frames draw it. */
async function seek(page: Page, ms: number) {
  await page.evaluate((ms) => {
    const api = (window as never as Lab).__lab.api();
    const now = api.elapsed() ?? 0;
    if (ms > now) api.loop.clock.step(ms - now);
  }, ms);
  await page.evaluate(
    () =>
      new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r(null))),
      ),
  );
}

const box = (page: Page, id: string) =>
  page
    .locator(`.combatant[data-unit="${id}"] svg.combatant-sprite`)
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    });

const travel = (page: Page, id: string) =>
  page
    .locator(`.combatant[data-unit="${id}"] .combatant-travel`)
    .evaluate((el) => (el as HTMLElement).style.transform);

const z = (page: Page, id: string) =>
  page
    .locator(`.combatant[data-unit="${id}"]`)
    .evaluate((el) => Number((el as HTMLElement).style.zIndex));

const trace = (page: Page) =>
  page.evaluate(() => (window as never as Lab).__lab.trace());

async function waitEnd(page: Page) {
  await page.waitForFunction(
    () => (window as never as Lab).__lab.trace().some((e) => e.kind === "end"),
    null,
    { timeout: 60_000 },
  );
}

/** Nothing the choreography writes is left anywhere on the stage. */
const leftovers = (page: Page) =>
  page.evaluate(() => ({
    offsets: [...document.querySelectorAll<HTMLElement>(".combatant-travel")]
      .map((el) => el.style.transform)
      .filter(Boolean),
    lifts: [...document.querySelectorAll<HTMLElement>(".combatant-lift")]
      .map((el) => el.style.transform)
      .filter(Boolean),
    projectiles: document.querySelectorAll(".projectile").length,
    marks: document.querySelectorAll(".stage-mark").length,
    phases: document.querySelectorAll(".combatant[data-choreo]").length,
  }));

const CLEAN = { offsets: [], lifts: [], projectiles: 0, marks: 0, phases: 0 };

/**
 * For every consequence a move presents — a hit or a heal on someone else —
 * the contact or arrival that caused it, and when the page first showed any
 * part of it. Returns the violations, and every row for the message.
 */
function ordering(rec: Rec[]) {
  const beats = rec.filter((e) => e.kind === "beat");
  const rows: string[] = [];
  const bad: string[] = [];
  for (const b of beats) {
    if (
      !["damage", "heal"].includes(b.name!) ||
      !b.amount ||
      !b.unit ||
      b.unit === b.to
    )
      continue;
    const mover = b.detail;
    const cast = beats
      .filter((c) => c.name === "cast" && c.unit === mover && c.t <= b.t)
      .at(-1);
    const after = (e: Rec) => e.t >= (cast?.t ?? 0);
    const own = mover === b.unit;
    // A move that sent something at this target is caused by its arrival,
    // never by the clip that loosed it; one that sent nothing, by its contact.
    const sent = rec.some(
      (e) =>
        e.kind === "spawn" &&
        e.unit === mover &&
        after(e) &&
        (!own || e.to === b.to),
    );
    const causes = rec.filter(
      (e) =>
        e.unit === mover &&
        after(e) &&
        (sent
          ? e.kind === "arrive" && (!own || e.to === b.to)
          : e.kind === "contact"),
    );
    const cause = causes.filter((e) => e.t <= b.t).at(-1) ?? causes[0];
    const prev = beats.filter((e) => e.to === b.to && e.t < b.t - 0.5).at(-1);
    const since = (e: Rec) =>
      e.unit === b.to && e.t > (prev?.t ?? cast?.t ?? 0);
    const sign = b.name === "heal" ? "+" : "−";
    const shown = [
      b.t,
      rec.find(
        (e) => e.kind === "pop" && since(e) && e.name === `${sign}${b.amount}`,
      )?.t,
      rec.find(
        (e) => e.kind === "hp" && since(e) && e.name?.startsWith(`${b.hp}/`),
      )?.t,
      b.name === "damage"
        ? rec.find((e) => e.kind === "clip" && since(e) && e.name === "hurt")?.t
        : undefined,
    ].filter((x): x is number => x !== undefined);
    const first = Math.min(...shown);
    const row = `${b.unit}→${b.to} ${b.name} ${b.amount}: ${cause ? `${cause.kind}@${cause.at.toFixed(0)}` : "no cause"}, shown@${(first - (b.t - b.at)).toFixed(0)}`;
    rows.push(row);
    if (!cause || cause.t > first + 1e-6) bad.push(row);
  }
  return { bad, rows };
}

const at1440 = (name: string) => name !== "1440x900";

/* ------------------------------------------------------------------ melee -- */

test("a melee attacker leaves home, gets near its target, and returns home", async ({
  page,
}) => {
  await open(page, { ...SMOKE, motion: 1 });
  const u = await ids(page);
  const [ada, bulwark] = [u["Ada"], u["Iron Bulwark"]];
  const home = await box(page, ada);
  await playPaused(page, [{ actor: ada, target: bulwark, move: "ability" }]);

  await seek(page, await phaseAt(page, 0, "contact"));
  const struck = await box(page, ada);
  const target = await box(page, bulwark);
  expect(await travel(page, ada)).not.toBe("");
  // It has left home...
  expect(
    Math.hypot(struck.left - home.left, struck.bottom - home.bottom),
  ).toBeGreaterThan(40);
  // ...and stands beside the Bulwark: its figure reaches the Bulwark's
  // outline without standing in it.
  expect(struck.right).toBeGreaterThan(target.left);
  expect((struck.left + struck.right) / 2).toBeLessThan(
    (target.left + target.right) / 2,
  );

  await seek(
    page,
    (await page.evaluate(
      () => (window as never as Lab).__lab.api().timeline()!.duration,
    )) + 50,
  );
  await page.evaluate(() =>
    (window as never as Lab).__lab.api().setPaused(false),
  );
  await waitEnd(page);
  expect(await leftovers(page)).toEqual(CLEAN);
  const back = await box(page, ada);
  expect(Math.abs(back.left - home.left)).toBeLessThan(2);
  expect(Math.abs(back.bottom - home.bottom)).toBeLessThan(2);
});

test("a travelling attacker paints over the target it strikes", async ({
  page,
}) => {
  await open(page, { ...SMOKE, motion: 1 });
  const u = await ids(page);
  for (const [actor, target] of [
    [u["Ada"], u["Iron Bulwark"]],
    [u["Slag Hound"], u["Bram"]],
  ]) {
    await playPaused(page, [{ actor, target, move: "ability" }]);
    const before = await z(page, actor);
    await seek(page, await phaseAt(page, 0, "contact"));
    // Nearer the camera than what it hits at the moment of contact...
    expect(await z(page, actor), `${actor} over ${target}`).toBeGreaterThan(
      await z(page, target),
    );
    await page.evaluate(() => (window as never as Lab).__lab.api().skip());
    // ...and back in the layout's own order after.
    expect(await z(page, actor)).toBe(before);
  }
});

/* -------------------------------------------------------------------- bow -- */

test("a bow's arrow is seen in flight and reaches its target before the hit shows", async ({
  page,
}) => {
  await open(page, { ...SMOKE, motion: 1 });
  const u = await ids(page);
  const [cora, bellows] = [u["Cora"], u["Living Bellows"]];
  await playPaused(page, [{ actor: cora, target: bellows, move: "ability" }]);
  const release = await phaseAt(page, 0, "release");
  const contact = await phaseAt(page, 0, "contact");
  expect(contact - release).toBeGreaterThanOrEqual(170);

  // Mid-flight: one arrow, drawn, between the Ranger and the Bellows, and
  // the Bellows untouched.
  await seek(page, (release + contact) / 2);
  const flight = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".projectile")].map((p) => {
      const r = p.querySelector("svg")!.getBoundingClientRect();
      return {
        arrived: p.dataset.arrived,
        w: r.width,
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        rot: p.style.transform,
      };
    }),
  );
  expect(flight).toHaveLength(1);
  expect(flight[0].arrived).toBeUndefined();
  expect(flight[0].w).toBeGreaterThan(8);
  expect(flight[0].rot).toMatch(/rotate\(-?[\d.]+rad\)/);
  const shooter = await box(page, cora);
  const target = await box(page, bellows);
  expect(flight[0].x).toBeGreaterThan(shooter.left);
  expect(flight[0].x).toBeLessThan(target.right);
  expect(
    await page
      .locator(`.combatant[data-unit="${bellows}"] .combatant-bar u`)
      .textContent(),
  ).toMatch(/^69\//);

  await page.evaluate(() =>
    (window as never as Lab).__lab.api().setPaused(false),
  );
  await waitEnd(page);
  const rec = await trace(page);
  const spawn = rec.find((e) => e.kind === "spawn" && e.unit === cora)!;
  const arrive = rec.find((e) => e.kind === "arrive" && e.unit === cora)!;
  expect(spawn.detail).toBe("measured");
  // It lands on the Bellows' drawing...
  const stage = await page.locator(".layer-units").evaluate((el) => {
    const r = el.getBoundingClientRect();
    return {
      left: r.left,
      top: r.top,
      scale: r.width / (el as HTMLElement).offsetWidth,
    };
  });
  expect(arrive.x! * stage.scale + stage.left).toBeGreaterThan(
    target.left - 12,
  );
  expect(arrive.x! * stage.scale + stage.left).toBeLessThan(target.right + 12);
  // ...and nothing of the hit is shown before it does.
  const { bad, rows } = ordering(rec);
  expect(rows.length).toBeGreaterThan(0);
  expect(bad, rows.join("\n")).toEqual([]);
  // The draw, the loose and the lowering, in order.
  const clips = rec
    .filter((e) => e.kind === "clip" && e.unit === cora)
    .map((e) => e.name);
  expect(clips.join(" ")).toMatch(/aim.*release.*idle/);
});

/* ------------------------------------------------------------------- skip -- */

test("Skip mid-approach and mid-flight puts everyone home and clears the air", async ({
  page,
}) => {
  await open(page, { ...SMOKE, motion: 1 });
  const u = await ids(page);
  const homes = await Promise.all(
    [u["Ada"], u["Slag Hound"]].map((id) => box(page, id)),
  );
  await playPaused(page, [
    { actor: u["Cora"], target: u["Living Bellows"], move: "ability" },
    { actor: u["Ada"], target: u["Iron Bulwark"], move: "ability" },
    { actor: u["Slag Hound"], target: u["Bram"], move: "ability" },
  ]);
  const flying = (await phaseAt(page, 0, "release")) + 40;
  await seek(page, flying);
  expect(await page.locator(".projectile").count()).toBe(1);
  // Ada's charge overlaps the arrow's flight; step into it.
  const running = await phaseAt(page, 1, "approach", 0.5);
  await seek(page, Math.max(flying, running));
  await page.evaluate(() => (window as never as Lab).__lab.api().skip());
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0);
  expect(await leftovers(page)).toEqual(CLEAN);
  const after = await Promise.all(
    [u["Ada"], u["Slag Hound"]].map((id) => box(page, id)),
  );
  after.forEach((b, i) => {
    expect(Math.abs(b.left - homes[i].left)).toBeLessThan(2);
    expect(Math.abs(b.bottom - homes[i].bottom)).toBeLessThan(2);
  });
  expect((await trace(page)).some((e) => e.kind === "skip")).toBe(true);
});

test("a reconnect mid-move rebuilds the stage from its layout", async ({
  page,
}, info) => {
  test.skip(at1440(info.project.name), "the same at every size");
  await open(page, { ...SMOKE, motion: 1 });
  const u = await ids(page);
  const placed = () =>
    page
      .locator(`.combatant[data-unit="${u["Ada"]}"]`)
      .evaluate(
        (el) =>
          `${(el as HTMLElement).style.left} ${(el as HTMLElement).style.top}`,
      );
  const home = await placed();
  await playPaused(page, [
    { actor: u["Ada"], target: u["Iron Bulwark"], move: "ability" },
    { actor: u["Cora"], target: u["Living Bellows"], move: "ability" },
  ]);
  await seek(page, await phaseAt(page, 0, "contact"));
  expect(await travel(page, u["Ada"])).not.toBe("");
  // Taking another seat remounts the whole fight, as a reconnect does: the
  // new stage is built from the board, and nothing of the move survives.
  await page
    .locator("label", { hasText: "Control" })
    .locator("select")
    .selectOption({ label: "Bram" });
  await page.waitForTimeout(400);
  expect(await leftovers(page)).toEqual(CLEAN);
  // Where the layout stands it, with no offset. (The camera now frames the
  // new seat, so the screen position is not the thing to compare.)
  expect(await placed()).toBe(home);
  expect(await travel(page, u["Ada"])).toBe("");
});

/* ---------------------------------------------------------------- timing -- */

test.describe("impact ordering holds at every playback speed, in real rounds", () => {
  for (const speed of [0.5, 2]) {
    test(`${speed}×`, async ({ page }, info) => {
      test.skip(
        at1440(info.project.name),
        "timing is the same at every size; played once",
      );
      await open(page, { ...SMOKE, motion: 1 });
      await page.evaluate(
        (speed) => (window as never as Lab).__lab.api().setSpeed(speed),
        speed,
      );
      await page.evaluate(() =>
        (window as never as Lab).__lab.round([
          { actor: "Ada", ability: "Shieldbreaker", target: "Iron Bulwark" },
          { actor: "Bram", ability: "Arcane spark", target: "Ash Acolyte" },
          { actor: "Cora", ability: "True shot", target: "Living Bellows" },
          { actor: "Dain", ability: "Thorn lash", target: "Slag Hound" },
        ]),
      );
      await waitEnd(page);
      const rec = await trace(page);
      const { bad, rows } = ordering(rec);
      // Melee, bow and projectile moves from both sides of a real round.
      expect(rec.some((e) => e.kind === "contact")).toBe(true);
      expect(
        rec.filter((e) => e.kind === "arrive").length,
      ).toBeGreaterThanOrEqual(3);
      expect(rows.length).toBeGreaterThanOrEqual(8);
      expect(bad, rows.join("\n")).toEqual([]);
      // A primary hit lands in the frame its blow or its shot does: never a
      // frame early, and not left trailing a frame behind either.
      const frame = (1000 / 30) * speed + 1;
      for (const e of rec.filter((e) => e.kind === "arrive")) {
        const hit = rec.find(
          (b) =>
            b.kind === "beat" &&
            b.name === "damage" &&
            b.unit === e.unit &&
            b.to === e.to &&
            b.t >= e.t,
        );
        if (hit)
          expect(hit.t - e.t, `${e.unit}→${e.to}`).toBeLessThanOrEqual(frame);
      }
    });
  }
});

/* ---------------------------------------------------------- reduced motion -- */

test("reduced motion moves nothing and leaves nothing behind", async ({
  page,
}) => {
  await open(page, { ...SMOKE });
  const u = await ids(page);
  const before = await box(page, u["Ada"]);
  await page.evaluate(
    ({ ada, bulwark, cora, bellows }) =>
      (window as never as Lab).__lab.playRound([
        { actor: ada, target: bulwark, move: "ability" },
        { actor: cora, target: bellows, move: "ability" },
      ]),
    {
      ada: u["Ada"],
      bulwark: u["Iron Bulwark"],
      cora: u["Cora"],
      bellows: u["Living Bellows"],
    },
  );
  for (let i = 0; i < 6; i++) {
    const now = await leftovers(page);
    expect(now.offsets).toEqual([]);
    expect(now.lifts).toEqual([]);
    expect(now.projectiles).toBe(0);
    expect(await box(page, u["Ada"])).toEqual(before);
    await page.waitForTimeout(150);
  }
  // The simplified cue: a ring and a line, in place, then gone.
  await expect(page.locator(".stage-mark")).toHaveCount(0, { timeout: 5000 });
  expect(await leftovers(page)).toEqual(CLEAN);
});

/* ---------------------------------------------------------------- layout -- */

test("attacks never make the document overflow", async ({ page }) => {
  await open(page, { ...SMOKE, motion: 1 });
  const u = await ids(page);
  const overflow = () =>
    page.evaluate(() => ({
      x: document.documentElement.scrollWidth - window.innerWidth,
      y: document.documentElement.scrollHeight - window.innerHeight,
    }));
  await playPaused(page, [
    { actor: u["Ada"], target: u["Living Bellows"], move: "melee" },
    { actor: u["Slag Hound"], target: u["Cora"], move: "ability" },
    { actor: u["Cora"], target: u["Ash Acolyte"], move: "ability" },
  ]);
  const tl = await page.evaluate(
    () => (window as never as Lab).__lab.api().timeline()!.duration,
  );
  for (let t = 0; t < tl; t += 120) {
    await seek(page, t);
    expect(await overflow(), `at ${t}ms`).toEqual({ x: 0, y: 0 });
  }
});

test("a large boss gets a safe attack point: beside it, not in it, and on the stage", async ({
  page,
}) => {
  await open(page, { boss: "collector", party: 4, motion: 1 });
  const u = await ids(page);
  const [ada, collector] = [u["Ada"], u["The Collector"]];
  await playPaused(page, [{ actor: ada, target: collector, move: "melee" }]);
  await seek(page, await phaseAt(page, 0, "contact"));
  const a = await box(page, ada);
  const boss = await box(page, collector);
  const stage = await page.locator(".stage").evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
  });
  // Its weapon side reaches the boss's outline...
  expect(a.right).toBeGreaterThan(boss.left);
  // ...but it does not stand inside the boss: most of it is clear of it.
  const overlap = Math.max(
    0,
    Math.min(a.right, boss.right) - Math.max(a.left, boss.left),
  );
  expect(overlap / (a.right - a.left)).toBeLessThan(0.5);
  // Actor and target both on screen.
  for (const r of [a, boss]) {
    expect(r.left).toBeGreaterThanOrEqual(stage.left - 1);
    expect(r.right).toBeLessThanOrEqual(stage.right + 1);
    expect(r.top).toBeGreaterThanOrEqual(stage.top - 1);
    expect(r.bottom).toBeLessThanOrEqual(stage.bottom + 1);
  }
});

/* ------------------------------------------------------ interrupts, falls -- */

test("an interrupted wind-up launches nothing and moves nobody", async ({
  page,
}, info) => {
  test.skip(
    at1440(info.project.name),
    "a whole real round; the same at every size",
  );
  await open(page, { boss: "collector", party: 4, stage: "windup", motion: 1 });
  const u = await ids(page);
  const collector = u["The Collector"];
  await page.evaluate(() =>
    (window as never as Lab).__lab.round([
      { actor: "Bram", ability: "Break focus", target: "The Collector" },
    ]),
  );
  await page.waitForFunction(
    () => !!(window as never as Lab).__lab.api().timeline(),
  );
  const tl = await page.evaluate(() => {
    const t = (window as never as Lab).__lab.api().timeline()!;
    return {
      actors: t.moves.map((m) => m.timeline.actor),
      segments: t.segments.map((s) => s.unit),
      projectiles: t.projectiles.map((p) => p.from),
    };
  });
  // The interrupter's move is there; the interrupted one never is.
  expect(tl.actors).toContain(u["Bram"]);
  expect(tl.actors).not.toContain(collector);
  expect(tl.segments).not.toContain(collector);
  expect(tl.projectiles).not.toContain(collector);
  await waitEnd(page);
  const rec = await trace(page);
  expect(
    rec.some(
      (e) => e.kind === "beat" && e.name === "combo" && e.to === collector,
    ),
  ).toBe(true);
  expect(
    rec.filter(
      (e) =>
        e.unit === collector && ["phase", "spawn", "contact"].includes(e.kind),
    ),
  ).toEqual([]);
});

test("a fallen target gets its impact and its fall, and nothing after", async ({
  page,
}) => {
  await open(page, { ...SMOKE, motion: 1 });
  const u = await ids(page);
  const [bellows, bulwark] = [u["Living Bellows"], u["Iron Bulwark"]];
  await page.evaluate(
    (r) => (window as never as Lab).__lab.playRound(r),
    [
      // The arrow kills it...
      { actor: u["Cora"], target: bellows, move: "ability", amount: 999 },
      // ...so a second move at it fizzles, as the engine has it do...
      { actor: u["Ada"], target: bellows, move: "melee" },
      // ...and a row attack that takes one of two still hits the other.
      { actor: u["Bram"], target: bulwark, move: "area", amount: 60 },
    ],
  );
  await page.waitForFunction(
    () => !!(window as never as Lab).__lab.api().timeline(),
  );
  const tl = await page.evaluate(() => {
    const t = (window as never as Lab).__lab.api().timeline()!;
    return {
      actors: t.moves.map((m) => m.timeline.actor),
      projectiles: t.projectiles.map((p) => p.to),
    };
  });
  expect(tl.actors).not.toContain(u["Ada"]);
  await waitEnd(page);
  const rec = await trace(page);
  const fell = rec.find(
    (e) => e.kind === "beat" && e.name === "defeat" && e.to === bellows,
  )!;
  // (The lab changes no health, so its board springs back when the replay
  // ends; only what happens during the replay counts.)
  const end = rec.find((e) => e.kind === "end")!;
  const hit = rec.find(
    (e) => e.kind === "beat" && e.name === "damage" && e.to === bellows,
  )!;
  expect(fell.t).toBeGreaterThanOrEqual(hit.t);
  // Nothing reaches for it or reacts on it after it has fallen.
  expect(
    rec.filter(
      (e) =>
        e.t > fell.t &&
        e.t < end.t &&
        (e.to === bellows || e.unit === bellows) &&
        e.kind !== "clip",
    ),
  ).toEqual([]);
  const clips = rec
    .filter((e) => e.kind === "clip" && e.unit === bellows && e.t >= fell.t)
    .map((e) => e.name);
  expect(clips[0]).toBe("defeat");
  expect(clips).not.toContain("hurt");
  // The row attack's other targets reacted in the same frame as each other.
  const rowHits = rec.filter(
    (e) => e.kind === "beat" && e.name === "damage" && e.unit === u["Bram"],
  );
  expect(rowHits.length).toBeGreaterThanOrEqual(1);
  expect(new Set(rowHits.map((e) => e.t)).size).toBe(1);
});

/* ------------------------------------------------ the three reference fighters -- */

test.describe("the reference fighters follow their phases", () => {
  const order = (rec: Rec[], unit: string) =>
    rec
      .filter((e) => e.kind === "phase" && e.unit === unit)
      .map((e) => e.name)
      .join(" ");
  const clips = (rec: Rec[], unit: string) =>
    rec
      .filter((e) => e.kind === "clip" && e.unit === unit)
      .map((e) => e.name)
      .join(" ");

  test("the Vanguard: plant, charge, strike on contact, back off guarding", async ({
    page,
  }, info) => {
    test.skip(at1440(info.project.name), "phases do not depend on the size");
    await open(page, { ...SMOKE, motion: 1 });
    const u = await ids(page);
    await page.evaluate((r) => (window as never as Lab).__lab.play(r), {
      actor: u["Ada"],
      target: u["Iron Bulwark"],
      move: "ability",
    });
    await waitEnd(page);
    const rec = await trace(page);
    expect(order(rec, u["Ada"])).toBe(
      "anticipation approach arrival strike contact followThrough recovery return home",
    );
    expect(clips(rec, u["Ada"])).toMatch(
      /^anticipate approach attack .*retreat idle$/,
    );
    const contact = rec.find(
      (e) => e.kind === "contact" && e.unit === u["Ada"],
    )!;
    const hit = rec.find((e) => e.kind === "beat" && e.name === "damage")!;
    expect(hit.t).toBe(contact.t);
    // Heavy footfalls ride the charge.
    expect(rec.some((e) => e.kind === "phase" && e.name === "approach")).toBe(
      true,
    );
  });

  test("the Ranger: raise, draw, hold, loose, and only then the hit", async ({
    page,
  }, info) => {
    test.skip(at1440(info.project.name), "phases do not depend on the size");
    await open(page, { ...SMOKE, motion: 1 });
    const u = await ids(page);
    await page.evaluate((r) => (window as never as Lab).__lab.play(r), {
      actor: u["Cora"],
      target: u["Iron Bulwark"],
      move: "ability",
    });
    await waitEnd(page);
    const rec = await trace(page);
    expect(order(rec, u["Cora"])).toBe(
      "anticipation strike release recovery contact home",
    );
    expect(clips(rec, u["Cora"])).toMatch(/^aim release idle$/);
    const release = rec.find(
      (e) => e.kind === "release" && e.unit === u["Cora"],
    )!;
    const spawn = rec.find((e) => e.kind === "spawn" && e.unit === u["Cora"])!;
    const arrive = rec.find(
      (e) => e.kind === "arrive" && e.unit === u["Cora"],
    )!;
    const hit = rec.find((e) => e.kind === "beat" && e.name === "damage")!;
    expect(spawn.t).toBeLessThanOrEqual(release.t + 1);
    expect(arrive.t - spawn.t).toBeGreaterThanOrEqual(150);
    expect(hit.t).toBeGreaterThanOrEqual(arrive.t);
  });

  test("the Hound: crouch, sprint, bite, run on past, turn, run home", async ({
    page,
  }, info) => {
    test.skip(at1440(info.project.name), "phases do not depend on the size");
    await open(page, { ...SMOKE, motion: 1 });
    const u = await ids(page);
    const [hound, bram] = [u["Slag Hound"], u["Bram"]];
    // Played through once for the order of what it does...
    await page.evaluate((r) => (window as never as Lab).__lab.play(r), {
      actor: hound,
      target: bram,
      move: "ability",
    });
    await waitEnd(page);
    const rec = await trace(page);
    expect(order(rec, hound)).toMatch(
      /^anticipation approach (arrival )?strike contact followThrough recovery return home$/,
    );
    expect(clips(rec, hound)).toMatch(
      /^anticipate approach attack approach idle$/,
    );
    // ...and once, stepped, for where it is.
    await page.evaluate(() => (window as never as Lab).__lab.clearTrace());
    await playPaused(page, [{ actor: hound, target: bram, move: "ability" }]);
    const phases = await page.evaluate(
      () =>
        (window as never as Lab).__lab.api().timeline()!.moves[0].timeline
          .phases,
    );
    const span = (n: string) => phases.find((p) => p.name === n)!;
    // A sprint, not a march: the approach is over far quicker than the
    // Vanguard's charge across the same stage.
    expect(span("approach").end - span("approach").start).toBeLessThan(150);

    await seek(page, await phaseAt(page, 0, "contact"));
    const bite = await box(page, hound);
    await seek(page, await phaseAt(page, 0, "recovery", 0.99));
    const past = await box(page, hound);
    // Carried on past where it bit, towards and beyond the hero it bit.
    expect(past.left).toBeLessThan(bite.left);
    await seek(page, await phaseAt(page, 0, "return", 0.5));
    // Turned round to run home: mirrored.
    expect(
      await page
        .locator(`.combatant[data-unit="${hound}"] .combatant-lift`)
        .evaluate((el) => (el as HTMLElement).style.transform),
    ).toContain("scaleX(-1)");
    await page.evaluate(() =>
      (window as never as Lab).__lab.api().setPaused(false),
    );
    await waitEnd(page);
    expect(await leftovers(page)).toEqual(CLEAN);
  });
});
