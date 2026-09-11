import { test, expect, type Page } from "@playwright/test";

/**
 * The bosses' held windup and signature strike, driven by the real stage.
 *
 * An enemy with an interruptible move announced holds its authored `windup`
 * through planning — the threat is the held pose — and plays `signature` when
 * the wound-up move or its objective lands. Anything without the clip keeps
 * its idle: an ordinary enemy must never start pulsing on a wind-up.
 *
 * The animator draws straight to the DOM and never re-renders React. It
 * reports the clip it is playing as `data-clip` on the combatant's rig,
 * written only when the clip changes, and that is what these read.
 */

const scene = (params: Record<string, string | number> = {}) =>
  `/dev/bosses.html?${new URLSearchParams({ viewport: "fit", ...(params as never) })}`;

type Probe = Window & {
  /** Every clip one combatant has passed through, in order. */
  __trace?: string[];
};

async function open(page: Page, params: Record<string, string | number>) {
  await page.goto(scene(params));
  await page.locator(".battle").waitFor();
  await page.locator(".stage").waitFor();
}

const rig = (page: Page, name: string) =>
  page
    .locator(".combatant", {
      has: page.locator(`.combatant-name:text-is("${name}")`),
    })
    .locator(".combatant-rig");

const clipOf = (page: Page, name: string) =>
  rig(page, name).getAttribute("data-clip");

/**
 * Record every clip a combatant passes through. The attribute changes only
 * when the clip does, so an observer sees every change, however brief.
 */
const trace = (page: Page, name: string) =>
  rig(page, name).evaluate((el) => {
    const w = window as Probe;
    w.__trace = [(el as HTMLElement).dataset.clip ?? "none"];
    const push = (clip: string) => {
      if (w.__trace!.at(-1) !== clip) w.__trace!.push(clip);
    };
    // Each record carries the value it replaced, so a clip that came and
    // went between two callbacks is still seen: every value but the last is
    // the old value of the record after it.
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
  page.evaluate(() => (window as Probe).__trace ?? []);

const chip = (page: Page, name: string) =>
  page
    .locator(".combatant", {
      has: page.locator(`.combatant-name:text-is("${name}")`),
    })
    .locator(".intent-chip");

test.describe("the bosses hold their wind-ups and land their signatures", () => {
  for (const [boss, name] of [
    ["collector", "The Collector"],
    ["miser", "The Miser"],
  ] as const)
    test(`${name} holds its windup while the wind-up is announced`, async ({
      page,
    }) => {
      await open(page, { boss, party: 4, stage: "windup" });
      await expect(chip(page, name)).toHaveClass(/intent-windup/);
      await expect.poll(() => clipOf(page, name)).toBe("windup");
      // Held, not played once: it is still there a moment later.
      await page.waitForTimeout(600);
      expect(await clipOf(page, name)).toBe("windup");
      // The supports have no wind-up announced and no reason to pose.
      for (const other of ["Kiln Mender", "Iron Bulwark"])
        expect(await clipOf(page, other), other).toBe("idle");
    });

  test("an ordinary enemy with a wind-up announced keeps its idle", async ({
    page,
  }) => {
    // Round one: the Mender announces Repair lattice, a wind-up, and has no
    // windup clip. The generic one would pulse; it must not be reached for.
    await open(page, { boss: "collector", party: 4, stage: "opening" });
    await expect(chip(page, "Kiln Mender")).toHaveClass(/intent-windup/);
    await page.waitForTimeout(300);
    expect(await clipOf(page, "Kiln Mender")).toBe("idle");
    await expect.poll(() => clipOf(page, "The Collector")).toBe("idle");
  });

  test("the wind-up lands as the signature, then the pose is spent", async ({
    page,
  }) => {
    await open(page, {
      boss: "collector",
      party: 4,
      stage: "windup",
      motion: 1,
    });
    await expect.poll(() => clipOf(page, "The Collector")).toBe("windup");
    await trace(page, "The Collector");
    await page.getByRole("button", { name: "Finish round" }).click();
    await page.getByRole("button", { name: "2×" }).click();
    await expect
      .poll(() => traced(page), { timeout: 20_000 })
      .toContain("signature");
    await expect(page.locator(".stage.is-replaying")).toHaveCount(0, {
      timeout: 20_000,
    });
    // Every hero braces first. The board already shows next round's intent,
    // Repossess, but the round being replayed is the wind-up one: the pose is
    // held until it is released as the signature on Close the account, and
    // only then is it spent.
    const seen = await traced(page);
    expect(seen[0]).toBe("windup");
    const release = seen.indexOf("signature");
    expect(seen.slice(0, release), seen.join(" → ")).not.toContain("idle");
    expect(seen.slice(release + 1), seen.join(" → ")).not.toContain("windup");
    await expect.poll(() => clipOf(page, "The Collector")).toBe("idle");
  });

  test("with round animation off, the pose follows the board at once", async ({
    page,
  }) => {
    await open(page, { boss: "miser", party: 4, stage: "objective" });
    await expect.poll(() => clipOf(page, "The Miser")).toBe("idle");
    await page.getByRole("button", { name: "Finish round" }).click();
    // Weight of wealth resolves unseen; the levy, a wind-up, is announced.
    await expect(chip(page, "The Miser")).toHaveClass(/intent-windup/);
    await expect.poll(() => clipOf(page, "The Miser")).toBe("windup");
  });
});
