import { test, expect, type Page } from "@playwright/test";

/**
 * Red Ledger, the Reaver's Ultimate, in the Ultimate lab.
 *
 * What the film has to prove: the price is paid on screen (the bandage soaks
 * and the stroke is painted on the Reaver's own chest), the quiet is a face
 * acting in the dark, the impact reveals the result on a drawn black frame,
 * the real target and the rest of its real row are each struck through — the
 * target doubled, the row after it — and the real board keeps the mark on
 * everyone who paid, the Reaver included. Read from the film's attributes and
 * the cast it placed, never from pixels.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "reaver", party: 4, enemy: "sniper", ...params } as never)}`;

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(lab({ auto: 1, pause: 1, ...params }));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 30_000 });
}

const cinematic = (page: Page) => page.locator(".ult-cinematic");
const caster = (page: Page) => page.locator('.cine-actor[data-role="caster"]');
const transformOf = (page: Page, part: string) =>
  caster(page).locator(`[data-part="${part}"]`).evaluate((el) => getComputedStyle(el).transform);
/** How far each figure's stroke is painted, 0…27, target first. */
const painted = (page: Page) =>
  page.locator(".ledger-entries .ledger-entry").evaluateAll((groups) =>
    groups
      .filter((g) => (g as SVGGElement).style.display !== "none")
      .map((g) => {
        const t = g.querySelector(".ledger-entry-a .ledger-stroke-paint")?.getAttribute("transform") ?? "";
        return Number(/translate\(([-\d.]+)/.exec(t)?.[1] ?? 0);
      }),
  );

test("the Reaver plays Red Ledger on the real row and hands back to the round", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.6 }, "collect");
  await expect(cinematic(page)).toHaveAttribute("data-cinematic", "red-ledger");
  await expect(cinematic(page)).toHaveAttribute("data-framing", "normal");
  // The target and the rest of its row: the sniper, the mender and the bellows.
  await expect(page.locator('.cine-actor[data-role="targets"]:visible')).toHaveCount(3);
  await page.getByRole("button", { name: "▶ Play" }).click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  expect(await page.locator("[class*='cine-'], [class*='ledger-']").count()).toBe(0);
});

test("the price is paid on screen: the bandage soaks and the stroke is painted on the chest", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.05 }, "price");
  // Not yet: both are held outside their clips at rest.
  expect(await transformOf(page, "entry")).toBe("matrix(1, 0, 0, 1, 0, 0)");
  await hold(page, { shot: 1, at: 0.97 }, "price");
  expect(await transformOf(page, "stain")).not.toBe("matrix(1, 0, 0, 1, 0, 0)");
  expect(await transformOf(page, "entry")).not.toBe("matrix(1, 0, 0, 1, 0, 0)");
  await expect(page.locator(".cine-text-voice")).toBeVisible();
  // And the stroke stays paid in the shots after it.
  await hold(page, { shot: 2, at: 0.5 }, "pit");
  expect(await transformOf(page, "entry")).not.toBe("matrix(1, 0, 0, 1, 0, 0)");
});

test("the quiet is a face in the dark, with nothing loud in it, and the eyes open at its end", async ({ page }) => {
  await hold(page, { shot: 3, at: 0.2 }, "hush");
  await expect(page.locator('.cine-actor[data-role="targets"]:visible')).toHaveCount(0);
  expect(await page.locator(".fx-ledger-cut-wrap, .fx-ledger-entries-wrap, .cine-accent").count()).toBe(0);
  const shut = await transformOf(page, "eyes");
  for (const part of ["eyes", "mouth", "brow"]) expect(await transformOf(page, part)).not.toBe("none");
  // Every figure the impact knocked last time was put back.
  const looks = await page.locator(".cine-actor .cine-look").evaluateAll((els) => els.map((e) => (e as HTMLElement).style.transform));
  expect(looks.every((t) => t === "")).toBe(true);
  await hold(page, { shot: 3, at: 0.95 }, "hush");
  expect(await transformOf(page, "eyes")).not.toBe(shut);
});

test("the impact is a black frame with the stroke and the number, then the row struck through in turn", async ({ page }) => {
  await hold(page, { gear: "kit", shot: 4, at: 0.04 }, "collect");
  await expect(page.locator('.cine-accent[data-screen="black"]')).toHaveCount(1);
  await expect(page.locator(".fx-ledger-cut-wrap")).toBeVisible();
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  // The Reaver wears what it wears.
  await expect(caster(page).locator('[data-equipment="blood-price"]').first()).toBeAttached();

  // Just after the blow: the target's is entered, the row's copies are not yet.
  await hold(page, { shot: 4, at: 0.1 }, "collect");
  const early = await painted(page);
  expect(early).toHaveLength(3);
  expect(early[0]).toBeGreaterThan(20);
  expect(early[2]).toBe(0);
  // Later: every one of them, and the target's doubled.
  await hold(page, { shot: 4, at: 0.6 }, "collect");
  expect((await painted(page)).every((k) => k > 20)).toBe(true);
  await expect(page.locator(".ledger-entry[data-i='0'] .ledger-entry-b")).toHaveCount(1);
  await expect(page.locator(".cine-text-voice")).toBeVisible();
});

test("on the board the mark stays on the target, its row and the Reaver, and skipping leaves nothing", async ({ page }) => {
  await hold(page, { shot: 5, at: 0.6 }, "settle");
  const row = await page.locator(".cine-anchored:has(.ledger-mark:not([data-price]))").count();
  expect(row).toBe(3);
  await expect(page.locator(".ledger-mark[data-price]")).toHaveCount(1);
  await expect(page.locator('.ledger-mark[data-role="target"]')).toHaveCount(1);
  await page.locator(".cine-skip").click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .ledger-mark").count()).toBe(0);
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("a lone enemy is struck alone, and a boss is framed as a boss", async ({ page }) => {
  await hold(page, { enemy: "hound", party: 3, shot: 4, at: 0.6 }, "collect");
  await expect(page.locator('.cine-actor[data-role="targets"]:visible')).toHaveCount(1);
  expect(await painted(page)).toHaveLength(1);

  await hold(page, { enemy: "collector", party: 3, shot: 4, at: 0.5 }, "collect");
  await expect(cinematic(page)).toHaveAttribute("data-framing", "boss");
  const box = await page.locator('.cine-actor[data-role="targets"] .cine-sprite').first().boundingBox();
  const frame = await cinematic(page).boundingBox();
  // Framed whole: the boss's head is inside the picture, and so is the Reaver.
  expect(box!.y).toBeGreaterThan(frame!.y - box!.height * 0.1);
  const reaver = await caster(page).locator(".cine-sprite").boundingBox();
  expect(reaver!.x).toBeGreaterThan(frame!.x);
  await page.locator(".cine-skip").click();
  await expect(cinematic(page)).toHaveCount(0, { timeout: 2000 });
});

test("FAST keeps the price, the quiet and the impact", async ({ page }) => {
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
  for (const shot of ["price", "hush", "collect", "settle"]) expect(shots).toContain(shot);
});
