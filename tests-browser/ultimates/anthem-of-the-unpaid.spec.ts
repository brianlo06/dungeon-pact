import { test, expect, type Page } from "@playwright/test";

/**
 * Anthem of the Unpaid, the Herald's Ultimate, in the Ultimate lab.
 *
 * A support Ultimate: nobody is struck, so what the film has to prove is that
 * the real party is in it — every ally, with its own drawing and gear, each
 * answering in turn — that the quiet is quiet, that the result lands on
 * everyone, and that it hands back clean. Read from the film's attributes and
 * the cast it placed, never from pixels.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "herald", party: 4, ...params } as never)}`;

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(lab({ auto: 1, pause: 1, ...params }));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}

const cinematic = (page: Page) => page.locator(".ult-cinematic");
const allies = (page: Page) => page.locator('.cine-actor[data-role="allies"]:visible');

test("the Herald plays the Anthem, with no enemy in it, and hands back to the round", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 4, at: 0.4 }, "anthem");
  await expect(cinematic(page)).toHaveAttribute("data-cinematic", "anthem-of-the-unpaid");
  // Self-targeted: no target, so a boss in the room frames nothing.
  await expect(cinematic(page)).toHaveAttribute("data-framing", "normal");
  await expect(page.locator('.cine-actor[data-role="targets"]')).toHaveCount(0);
  await page.getByRole("button", { name: "▶ Play" }).click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  expect(await page.locator("[class*='cine-'], [class*='anthem-']").count()).toBe(0);
});

for (const party of [2, 4]) {
  test(`every real ally answers, one after another (party of ${party})`, async ({ page }) => {
    // Early: the note has reached the ally nearest the Herald, not the farthest.
    await hold(page, { party, shot: 2, at: party === 4 ? 0.32 : 0.2 }, "answer");
    await expect(allies(page)).toHaveCount(party - 1);
    // Each is the real hero it is, not a stand-in.
    const heroes = await allies(page).locator("[data-hero]").evaluateAll((els) => els.map((e) => e.getAttribute("data-hero")));
    expect(new Set(heroes).size).toBe(party - 1);
    expect(heroes).not.toContain("herald");
    const lifted = () =>
      page
        .locator('.cine-actor[data-role="allies"] .cine-look')
        .evaluateAll((els) => els.map((e) => (e as HTMLElement).style.transform !== ""));
    if (party === 4) {
      const early = await lifted();
      // The rightmost (last slot) has answered; the leftmost has not yet.
      expect(early.at(-1)).toBe(true);
      expect(early[0]).toBe(false);
    }
    // Late: everyone has answered, and there is a voice for each.
    await hold(page, { party, shot: 2, at: 0.95 }, "answer");
    expect((await lifted()).every(Boolean)).toBe(true);
    const voices = await page
      .locator(".anthem-voices .anthem-ribbon-body")
      .evaluateAll((els) => els.filter((e) => (e.getAttribute("d") ?? "").length > 0).length);
    // The Herald's note, and one answer per ally.
    expect(voices).toBe(party);
  });
}

test("the quiet is a face, holding its breath, with nothing loud in it", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.95 }, "hush");
  const caster = page.locator('.cine-actor[data-role="caster"]');
  await expect(caster).toBeVisible();
  for (const part of ["eyes", "mouth", "brow"])
    expect(await caster.locator(`[data-part="${part}"]`).evaluate((el) => getComputedStyle(el).transform)).not.toBe("none");
  await expect(allies(page)).toHaveCount(0);
  expect(await page.locator(".fx-anthem-banner-wrap, .fx-anthem-chord-wrap, .cine-accent").count()).toBe(0);
  // The allies were put back when their shot ended.
  const looks = await page
    .locator('.cine-actor[data-role="allies"] .cine-look')
    .evaluateAll((els) => els.map((e) => (e as HTMLElement).style.transform));
  expect(looks.every((t) => t === "")).toBe(true);
});

test("every voice at once: the whole party, a coil of its own voice on each, and the result on the board", async ({
  page,
}) => {
  await hold(page, { gear: "kit", shot: 4, at: 0.5 }, "anthem");
  await expect(allies(page)).toHaveCount(3);
  // The Herald wears what it wears.
  await expect(page.locator('.cine-actor[data-role="caster"] [data-equipment="blood-price"]').first()).toBeAttached();
  // A coil round the Herald and each ally, front and back.
  await expect(page.locator('.anthem-ward[data-half="front"] .anthem-coil:not([style*="none"])')).toHaveCount(4);
  await expect(page.locator(".cine-text-voice")).toBeVisible();

  await hold(page, { shot: 5, at: 0.6 }, "carried");
  // One on every standing member of the real party of four.
  await expect(page.locator(".anthem-pennant")).toHaveCount(4);
  // Each pennant is its own hero's colour.
  const colours = await page
    .locator(".cine-anchored:has(.anthem-pennant)")
    .evaluateAll((els) => els.map((e) => (e as HTMLElement).style.getPropertyValue("--c")));
  expect(new Set(colours).size).toBe(colours.length);
  await page.locator(".cine-skip").click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("skipping from the quiet settles at once and leaves nothing behind", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.5 }, "hush");
  await page.locator(".cine-skip").click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .anthem-sky").count()).toBe(0);
});

test("FAST keeps the party, the quiet and every voice at once", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { shots: string[] };
    w.shots = [];
    new MutationObserver(() => {
      const shot = document.querySelector(".ult-cinematic")?.getAttribute("data-shot");
      if (shot && w.shots.at(-1) !== shot) w.shots.push(shot);
    }).observe(document, { subtree: true, attributes: true, childList: true });
  });
  await page.goto(lab({ auto: 1, mode: "fast" }));
  await expect(cinematic(page)).toHaveAttribute("data-mode", "fast", { timeout: 30_000 });
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  const shots = await page.evaluate(() => (window as unknown as { shots: string[] }).shots);
  for (const shot of ["answer", "hush", "anthem", "carried"]) expect(shots).toContain(shot);
});
