import { test, expect, type Page } from "@playwright/test";

/**
 * The Small Print, the Broker · Assurer's Ultimate, in the Ultimate lab.
 *
 * A support Ultimate: nobody is struck, so what the film has to prove is that
 * the real party is in it — every ally, with its own drawing and gear — that
 * the policy reaches every one of them, that the quiet is a face reading, that
 * the cover stands in front of everyone on the drawn frame itself, and that it
 * hands back clean. Read from the film's attributes, the cast it placed and the
 * paths its effects drew, never from pixels.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "broker", evo: "brk-assurer", party: 4, ...params } as never)}`;

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(lab({ auto: 1, pause: 1, ...params }));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}

const film = (page: Page) => page.locator(".ult-cinematic");
const allies = (page: Page) => page.locator('.cine-actor[data-role="allies"]:visible');
/** How many closed shapes a path draws. */
const shapes = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => ((el.getAttribute("d") ?? "").match(/Z/g) ?? []).length);

test("the Assurer plays The Small Print, with no enemy in it, and hands back to the round", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 4, at: 0.3 }, "covered");
  await expect(film(page)).toHaveAttribute("data-cinematic", "small-print");
  // Self-targeted: a boss in the room frames nothing, and no enemy is cast.
  await expect(film(page)).toHaveAttribute("data-framing", "normal");
  await expect(page.locator('.cine-actor[data-role="targets"]')).toHaveCount(0);
  await page.getByRole("button", { name: "▶ Play" }).click();
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  expect(await page.locator("[class*='cine-'], [class*='print-']").count()).toBe(0);
});

for (const party of [2, 4]) {
  test(`the policy opens behind the whole real party (party of ${party})`, async ({ page }) => {
    await hold(page, { party, shot: 2, at: 0.9 }, "policy");
    await expect(allies(page)).toHaveCount(party - 1);
    const heroes = await allies(page).locator("[data-hero]").evaluateAll((els) => els.map((e) => e.getAttribute("data-hero")));
    expect(new Set(heroes).size).toBe(party - 1);
    expect(heroes).not.toContain("broker");
    // Opened out past the last of them: more folds than there are allies, and
    // the last fold beyond the last ally.
    const folds = (await shapes(page, ".print-policy .print-leaf-lit")) + (await shapes(page, ".print-policy .print-leaf-shade"));
    expect(folds).toBeGreaterThan(party);
    const last = await page.locator(".print-policy .print-leaf-crease").evaluate((el) => {
      const xs = [...(el.getAttribute("d") ?? "").matchAll(/M(-?[\d.]+)/g)].map((m) => Number(m[1]));
      return Math.max(...xs);
    });
    const lastAlly = await page.locator('.cine-actor[data-role="allies"]').evaluateAll((els) =>
      Math.max(...els.map((e) => new DOMMatrix(getComputedStyle(e).transform).m41)),
    );
    expect(last).toBeGreaterThan(lastAlly);
    // Signed.
    expect((await page.locator(".print-signature").getAttribute("d"))?.length ?? 0).toBeGreaterThan(20);
  });
}

test("the quiet is a face reading the small print, with nothing loud in it", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.8 }, "small-print");
  const caster = page.locator('.cine-actor[data-role="caster"]');
  await expect(caster).toBeVisible();
  for (const part of ["eyes", "mouth", "brow"]) {
    const transform = await caster.locator(`[data-part="${part}"]`).evaluate((el) => getComputedStyle(el).transform);
    expect(transform, part).not.toBe("none");
    expect(transform, part).not.toBe("matrix(1, 0, 0, 1, 0, 0)");
  }
  // Root off: the figure itself holds perfectly still.
  expect(await caster.locator(".cine-rig").evaluate((el) => (el as HTMLElement).style.transform)).toBe("");
  await expect(page.locator(".print-lens-lines")).toHaveCount(2);
  await expect(allies(page)).toHaveCount(0);
  expect(await page.locator(".fx-print-screens-wrap, .fx-print-crack-wrap, .cine-accent").count()).toBe(0);
});

test("covered: a screen stands in front of every figure on the drawn frame, the kit is worn, and the result is on the board", async ({
  page,
}) => {
  // Just after the two-tone frame, inside the hit-stop.
  await hold(page, { gear: "kit", shot: 4, at: 0.16 }, "covered");
  await expect(allies(page)).toHaveCount(3);
  // Three leaves to a screen, two of them lit: one screen for each of the four.
  expect(await shapes(page, ".print-screens .print-leaf-lit")).toBe(8);
  expect((await page.locator(".print-taut").getAttribute("d"))?.length ?? 0).toBeGreaterThan(20);
  // The Broker wears what it wears.
  await expect(page.locator('.cine-actor[data-role="caster"] [data-equipment="blood-price"]').first()).toBeAttached();

  await hold(page, { shot: 5, at: 0.7 }, "cover");
  // The catch is said, not hidden.
  await expect(page.locator(".cine-text-voice")).toContainText("small print");
  const party = await page.locator('.stage .combatant[data-side="hero"]:not([data-down])').count();
  expect(party).toBe(4);
  await expect(page.locator(".fx-print-cover-wrap")).toHaveCount(party);
  await expect(page.locator(".print-bill")).toBeAttached();
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("skipping from the quiet settles at once and leaves nothing behind", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.5 }, "small-print");
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .print-page").count()).toBe(0);
});

test("FAST keeps every shot, the quiet and the snap", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { shots: string[] };
    w.shots = [];
    new MutationObserver(() => {
      const shot = document.querySelector(".ult-cinematic")?.getAttribute("data-shot");
      if (shot && w.shots.at(-1) !== shot) w.shots.push(shot);
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-shot", "data-mode"] });
  });
  await page.goto(lab({ auto: 1, mode: "fast" }));
  await expect(film(page)).toHaveAttribute("data-mode", "fast", { timeout: 30_000 });
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  const shots = await page.evaluate(() => (window as unknown as { shots: string[] }).shots);
  expect(shots).toEqual(["call", "riffle", "policy", "small-print", "covered", "cover"]);
});

test("reduced motion plays still cards with no flash", async ({ page }) => {
  await page.goto(lab({ auto: 1, motion: 0 }));
  await expect(film(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  expect(await page.locator(".cine-accent, .print-crack").count()).toBe(0);
  await expect(film(page)).toHaveCount(0, { timeout: 20_000 });
});
