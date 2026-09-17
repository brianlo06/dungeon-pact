import { test, expect, type Page } from "@playwright/test";
import { REPLAY_CAP } from "../src/client/battle/pacing";

// Every test here plays at least one whole replay, and some play two or
// reload the page between them; thirty seconds did not fit that on a loaded
// machine. The layout suite gives its replay-heavy tests the same room.
test.describe.configure({ timeout: 60_000 });

/**
 * How long a round takes to watch, and what stands still when it should.
 *
 * A replay is held to a cap so a busy round does not drag; reduced motion
 * draws every combatant in one static pose, a held wind-up included; a downed
 * hero lies down and a revived one stands up whatever order the renders come
 * in; and the lab's capture tempo reaches the animators from the first frame.
 *
 * What a combatant is doing is read from `data-clip`, which its animator keeps
 * on the rig and writes only when the clip changes.
 */

const scene = (params: Record<string, string | number>) =>
  `/dev/bosses.html?${new URLSearchParams({ viewport: "fit", stage: "objective", ...(params as never) })}`;

async function open(page: Page, params: Record<string, string | number>) {
  await page.goto(scene(params));
  await page.locator(".stage").waitFor();
  // A boss's entrance plays once with motion on; get it out of the way.
  if (await page.locator(".boss-intro").count()) {
    await page.keyboard.press("Escape");
    await page.locator(".boss-intro").waitFor({ state: "detached" });
  }
}

const unit = (page: Page, name: string) =>
  page.locator(".combatant", {
    has: page.locator(`.combatant-name:text-is("${name}")`),
  });
const rig = (page: Page, name: string) =>
  unit(page, name).locator(".combatant-rig");
/** The rig's rotation, in degrees: a fallen figure is tipped far back. */
const rotation = (page: Page, name: string) =>
  rig(page, name).evaluate((el) =>
    Number(
      /rotate\((-?[\d.]+)deg\)/.exec((el as HTMLElement).style.transform)?.[1],
    ),
  );

/** Milliseconds from clicking a button to the end of the replay it starts. */
async function timeReplay(page: Page, button: string) {
  await page.evaluate(() => {
    const w = window as unknown as { replayMs?: number };
    w.replayMs = undefined;
    let start = 0;
    let seen = false;
    document.addEventListener("click", () => (start = performance.now()), {
      capture: true,
      once: true,
    });
    const step = () => {
      const playing = !!document.querySelector(".stage.is-replaying");
      if (start && playing) seen = true;
      if (seen && !playing) {
        w.replayMs = performance.now() - start;
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  await page.getByRole("button", { name: button }).click();
  await page.waitForFunction(
    () => (window as unknown as { replayMs?: number }).replayMs !== undefined,
    null,
    { timeout: 30_000 },
  );
  return page.evaluate(
    () => (window as unknown as { replayMs: number }).replayMs,
  );
}

/**
 * Every transform and filter the animators have written, on every rig and
 * every part of one, plus the clip each rig reports.
 */
const drawn = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".combatant-rig")].map((r) => ({
      name: r.closest(".combatant")!.querySelector(".combatant-name")!
        .textContent,
      clip: r.dataset.clip,
      rig: `${r.style.transform} ${r.style.filter}`,
      // Every part the animator owns: it promotes each one it registers.
      parts: [...r.querySelectorAll<SVGElement>("svg *")]
        .filter((p) => p.style.willChange)
        .map((p) => p.style.transform)
        .join("|"),
    })),
  );

test.describe("a replay fits its cap", () => {
  // Rounds that replayed for ten seconds and more before the cap came back.
  // This guards that the cap is applied in the running game at all; whether
  // each round's pacing fits the cap exactly is checked, round by round, in
  // tests/pacing.test.ts. Wall time here also carries the click, the renders
  // either side of the replay and whatever the machine is doing: on a quiet
  // machine these rounds take 6.1–6.3s, but under a full parallel suite with
  // tracing they ran 7–8s. Two and a half seconds absorbs that and is still
  // well short of what an uncapped replay takes.
  const SLACK = 2500;

  test("a four-hero boss round", async ({ page }) => {
    await open(page, { boss: "collector", party: 4, motion: 1 });
    const ms = await timeReplay(page, "Finish round");
    expect(ms).toBeLessThan(REPLAY_CAP + SLACK);
  });

  test("a boss's signature round", async ({ page }) => {
    await open(page, {
      boss: "miser",
      party: 4,
      stage: "windup",
      motion: 1,
    });
    const ms = await timeReplay(page, "Finish round");
    expect(ms).toBeLessThan(REPLAY_CAP + SLACK);
  });

  test("an ordinary encounter with the whole party striking", async ({
    page,
  }) => {
    await open(page, { encounter: "smoke-line", party: 4, motion: 1 });
    const control = page
      .locator("label", { hasText: "Control" })
      .locator("select");
    const heroes = ["Ada", "Bram", "Cora", "Dain"];
    for (const [i, hero] of heroes.entries()) {
      await control.selectOption({ label: hero });
      await page
        .locator(".fan-slip:not([data-common]) > button:not([disabled])")
        .first()
        .click();
      await unit(page, "Iron Bulwark").locator(".combatant-body").click();
      // The last plan resolves the round.
      if (i < heroes.length - 1)
        await page.getByRole("button", { name: "Lock action" }).click();
    }
    const ms = await timeReplay(page, "Lock action");
    expect(ms).toBeLessThan(REPLAY_CAP + SLACK);
  });
});

test.describe("reduced motion", () => {
  test("leaves no rig or part moving, and holds the wind-up as a pose", async ({
    page,
  }) => {
    // The lab's default: round animation off, which is the app's reduced
    // motion setting.
    await open(page, {
      boss: "collector",
      party: 4,
      stage: "windup",
      downed: 1,
    });
    expect(
      await page.evaluate(() => document.documentElement.dataset.motion),
    ).toBe("reduced");
    await expect(rig(page, "The Collector")).toHaveAttribute(
      "data-clip",
      "windup",
    );
    await expect(rig(page, "Dain")).toHaveAttribute("data-clip", "defeat");
    const before = await drawn(page);
    await page.waitForTimeout(1200);
    const after = await drawn(page);
    expect(after).toEqual(before);
    // Drawn, not left blank: every rig and its parts have a pose...
    for (const r of after) {
      expect(r.rig.trim(), r.name!).not.toBe("");
      expect(r.parts.split("|").every(Boolean), r.name!).toBe(true);
    }
    // ...the Collector's is the raised key, not its idle: the key is lifted
    // twelve degrees, where nothing in the idle turns more than two.
    const turned = await page.evaluate(() =>
      Math.max(
        ...[...document.querySelectorAll<SVGElement>(".collector g")]
          .filter((g) => g.style.willChange)
          .map((g) =>
            Math.abs(
              Number(/rotate\((-?[\d.]+)deg\)/.exec(g.style.transform)?.[1]),
            ),
          ),
      ),
    );
    expect(turned).toBeGreaterThan(10);
    // ...and the downed hero is lying.
    expect(await rotation(page, "Dain")).toBeLessThan(-60);

    // No keyframe animation runs anywhere on the page: every creature's
    // glow, vent and flicker respects the setting.
    expect(
      await page.evaluate(() =>
        document
          .getAnimations()
          .map(
            (a) =>
              `${(a as CSSAnimation).animationName} on ${(a.effect as KeyframeEffect).target?.getAttribute("class")}`,
          ),
      ),
    ).toEqual([]);

    // A round played with motion off moves nothing either: the board simply
    // changes, and each figure takes its new pose.
    await page.getByRole("button", { name: "Finish round" }).click();
    await expect(rig(page, "The Collector")).toHaveAttribute(
      "data-clip",
      /idle|windup/,
    );
    await page.waitForTimeout(300);
    const settled = await drawn(page);
    await page.waitForTimeout(1200);
    expect(await drawn(page)).toEqual(settled);
  });
});

test.describe("downed heroes", () => {
  const downed = { boss: "collector", party: 4, downed: 1, motion: 1 };

  /** Record every clip one hero's rig reports, in order. */
  const trace = (page: Page, name: string) =>
    rig(page, name).evaluate((el) => {
      const w = window as unknown as { trace: string[] };
      w.trace = [(el as HTMLElement).dataset.clip ?? "none"];
      const push = (c: string) => {
        if (w.trace.at(-1) !== c) w.trace.push(c);
      };
      new MutationObserver((records) => {
        records.slice(1).forEach((r) => push(r.oldValue ?? "none"));
        push((el as HTMLElement).dataset.clip ?? "none");
      }).observe(el, {
        attributes: true,
        attributeFilter: ["data-clip"],
        attributeOldValue: true,
      });
    });
  const traced = (page: Page) =>
    page.evaluate(() => (window as unknown as { trace: string[] }).trace);

  /** Remount the fight with the same state: a fresh load of this board. */
  async function remount(page: Page) {
    const control = page
      .locator("label", { hasText: "Control" })
      .locator("select");
    await control.selectOption({ label: "Bram" });
    await page.locator(".stage").waitFor();
  }

  test("a downed hero is lying on a fresh load, not falling", async ({
    page,
  }) => {
    await page.goto(scene(downed));
    // The first pose the animator writes is already the fallen one.
    const first = await page.waitForFunction(() => {
      const r = [...document.querySelectorAll<HTMLElement>(".combatant")]
        .find((c) => c.querySelector(".combatant-name")?.textContent === "Dain")
        ?.querySelector<HTMLElement>(".combatant-rig");
      return r?.style.transform || false;
    });
    const deg = Number(
      /rotate\((-?[\d.]+)deg\)/.exec(String(await first.jsonValue()))?.[1],
    );
    expect(deg).toBeLessThan(-60);
    await expect(rig(page, "Dain")).toHaveAttribute("data-clip", "defeat");
  });

  test("stays down through a replay and after it, and on a fresh load", async ({
    page,
  }) => {
    await open(page, downed);
    await expect(rig(page, "Dain")).toHaveAttribute("data-clip", "defeat");
    await trace(page, "Dain");
    await timeReplay(page, "Finish round");
    // Never stood up only to be knocked back over.
    expect(await traced(page)).toEqual(["defeat"]);
    expect(await rotation(page, "Dain")).toBeLessThan(-60);
    await remount(page);
    await expect(rig(page, "Dain")).toHaveAttribute("data-clip", "defeat");
    expect(await rotation(page, "Dain")).toBeLessThan(-60);
  });

  test("a revived hero stands after the replay, and on a fresh load", async ({
    page,
  }) => {
    await open(page, downed);
    // Revival in a room with boss pools is a found Writ of Reprieve.
    await page.getByRole("option", { name: "Writ of Reprieve" }).click();
    await unit(page, "Dain").locator(".combatant-body").click();
    await page.getByRole("button", { name: "Lock action" }).click();
    await trace(page, "Dain");
    // Slow the machine down, which is when a timer-driven pose went wrong:
    // the render that starts the replay comes late, and the settled board —
    // Dain already standing — is on screen for longer than any timer.
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
    await timeReplay(page, "Finish round");
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    await expect(unit(page, "Dain")).not.toHaveAttribute("data-down", "");
    // Lying until the revival lands in the replay, up once, and not back
    // down: one revive, and no fall after it.
    const seen = await traced(page);
    expect(seen[0], seen.join(" → ")).toBe("defeat");
    expect(
      seen.filter((c) => c === "revive"),
      seen.join(" → "),
    ).toHaveLength(1);
    expect(seen.slice(seen.indexOf("revive")), seen.join(" → ")).not.toContain(
      "defeat",
    );
    await expect(rig(page, "Dain")).toHaveAttribute("data-clip", "idle");
    await expect.poll(() => rotation(page, "Dain")).toBeGreaterThan(-15);
    await remount(page);
    await expect(rig(page, "Dain")).toHaveAttribute("data-clip", "idle");
    expect(await rotation(page, "Dain")).toBeGreaterThan(-15);
  });
});

test("a slowed capture plays its clips slowed from the first frame", async ({
  page,
}) => {
  // Cora braces first. Her `block` clip lasts 600ms at full speed; at a
  // quarter tempo it has to last four times that.
  await open(page, { boss: "collector", party: 4, motion: 1, tempo: 0.25 });
  await rig(page, "Cora").evaluate((el) => {
    const w = window as unknown as { block: number[] };
    w.block = [];
    new MutationObserver(() => {
      const clip = (el as HTMLElement).dataset.clip;
      if (clip === "block" && !w.block.length) w.block.push(performance.now());
      else if (clip !== "block" && w.block.length === 1)
        w.block.push(performance.now());
    }).observe(el, { attributes: true, attributeFilter: ["data-clip"] });
  });
  await page.getByRole("button", { name: "Finish round" }).click();
  const [start, end] = await page
    .waitForFunction(
      () => {
        const b = (window as unknown as { block: number[] }).block;
        return b.length === 2 && b;
      },
      null,
      { timeout: 20_000 },
    )
    .then((h) => h.jsonValue() as Promise<number[]>);
  expect(end - start).toBeGreaterThan(600 / 0.25 - 400);
});
