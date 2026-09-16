import { test, expect, type Page } from "@playwright/test";

/**
 * Elbow Room, the Reaver · Butcher's Ultimate, in the Ultimate lab.
 *
 * What the film has to prove: that it is the Butcher's and not Red Ledger's
 * (a lane, not a pit; nothing painted on anyone), that the close-up is a face
 * acting under a beam with the figure held still, that the real row stands
 * across the lane, that the quiet is the cat and nobody in the cast, that the
 * swing is drawn round the whole row on the held frame with the gouge torn
 * along the wall, that a boss is framed and not shrunk, that the return marks
 * every real target, and that it hands back clean. Read from the film's
 * attributes, the cast it placed and the paths its effects drew.
 */

test.describe.configure({ timeout: 90_000 });

const lab = (params: Record<string, string | number>) =>
  `/dev/ultimates.html?${new URLSearchParams({ hero: "reaver", evo: "rvr-butcher", ...params } as never)}`;

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(lab({ auto: 1, pause: 1, ...params }));
  await page.locator(".stage").waitFor({ timeout: 30_000 });
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 45_000 });
}

const film = (page: Page) => page.locator(".ult-cinematic");
const caster = (page: Page) => page.locator('.cine-actor[data-role="caster"]');
const targets = (page: Page) => page.locator('.cine-actor[data-role="targets"]:visible');

test("the Butcher plays Elbow Room against the real row, and hands back to the round", async ({ page }) => {
  await hold(page, { party: 4, shot: 2, at: 0.5 }, "shambles");
  await expect(film(page)).toHaveAttribute("data-cinematic", "elbow-room");
  // The hound and the bulwark stand in the front row together: both are in the lane.
  await expect(targets(page)).toHaveCount(2);
  await expect(page.locator(".elbow-lane").first()).toBeAttached();
  await page.getByRole("button", { name: "▶ Play" }).click();
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".stage.is-replaying")).toHaveCount(0, { timeout: 40_000 });
  expect(await page.locator("[class*='cine-'], [class*='elbow-']").count()).toBe(0);
});

test("cramped: a face acting under a beam, the brow lifted and lowered rather than knitted, the figure held still", async ({ page }) => {
  await hold(page, { shot: 1, at: 0.45 }, "cramped");
  for (const part of ["eyes", "mouth", "brow"]) {
    const transform = await caster(page).locator(`[data-part="${part}"]`).evaluate((el) => getComputedStyle(el).transform);
    expect(transform, part).not.toBe("none");
    expect(transform, part).not.toBe("matrix(1, 0, 0, 1, 0, 0)");
  }
  // A shelf of bone: never tilted more than about 5°.
  for (const at of [0.1, 0.3, 0.45, 0.9]) {
    await hold(page, { shot: 1, at }, "cramped");
    const tilt = await caster(page)
      .locator('[data-part="brow"]')
      .evaluate((el) => {
        const m = new DOMMatrix(getComputedStyle(el).transform);
        return Math.abs((Math.atan2(m.b, m.a) * 180) / Math.PI);
      });
    expect(tilt, `brow at ${at}`).toBeLessThan(5);
  }
  // Root off: only the parts move.
  expect(await caster(page).locator(".cine-rig").evaluate((el) => (el as HTMLElement).style.transform)).toBe("");
  // The beam is just over the head: its bottom edge is below the top of the mane.
  const beam = (await page.locator(".elbow-eaves").boundingBox())!;
  const hair = (await caster(page).locator('[data-part="hair"]').boundingBox())!;
  expect(beam.y).toBeLessThan(hair.y);
  await expect(targets(page)).toHaveCount(0);
});

test("the quiet is the lane cat in the dark, and nobody in the cast", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.5 }, "hush");
  await expect(page.locator(".fx-elbow-cat-wrap")).toHaveCount(1);
  await expect(page.locator(".elbow-cat-eyes")).toBeVisible();
  await expect(page.locator(".cine-actor:visible")).toHaveCount(0);
  expect(await page.locator(".cine-accent:visible, .elbow-sweep, .elbow-gouge").count()).toBe(0);
});

test("make room: on the held frame the swing is drawn round the whole row, the wall gouged, and the kit worn", async ({ page }) => {
  // Inside the hit-stop, just after the two-tone frame.
  await hold(page, { party: 4, gear: "kit", shot: 5, at: 0.27 }, "sweep");
  await expect(targets(page)).toHaveCount(2);
  const near = page.locator(".elbow-sweep.half-near .elbow-sweep-body");
  const far = page.locator(".elbow-sweep.half-far .elbow-sweep-body");
  expect(await near.getAttribute("d")).toMatch(/L/);
  expect(await far.getAttribute("d")).toMatch(/L/);
  // Each half reaches from behind the Butcher to past the last of the row, and crosses every figure's body.
  const band = (await near.boundingBox())!;
  const reaver = (await caster(page).boundingBox())!;
  expect(band.x).toBeLessThan(reaver.x + reaver.width * 0.5);
  for (const box of await targets(page).evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()))) {
    expect(band.x).toBeLessThan(box.x);
    expect(band.x + band.width).toBeGreaterThan(box.x + box.width * 0.5);
    expect(band.y).toBeLessThan(box.y + box.height);
    expect(band.y + band.height).toBeGreaterThan(box.y);
  }
  expect(await page.locator(".elbow-gouge-cut").getAttribute("d")).toMatch(/L/);
  await expect(page.locator(".cine-text-impact")).toBeVisible();
  // The Butcher wears what it wears.
  await expect(caster(page).locator('[data-equipment="blood-price"]').first()).toBeAttached();
});

test("a boss is framed, not shrunk, and the swing still goes round it", async ({ page }) => {
  await hold(page, { enemy: "collector", shot: 5, at: 0.3 }, "sweep");
  await expect(film(page)).toHaveAttribute("data-framing", "boss");
  await expect(targets(page)).toHaveCount(1);
  const boss = (await targets(page).boundingBox())!;
  const frame = (await film(page).boundingBox())!;
  expect(boss.height).toBeGreaterThan(frame.height * 0.45);
  const band = (await page.locator(".elbow-sweep.half-near .elbow-sweep-body").boundingBox())!;
  expect(band.x + band.width).toBeGreaterThan(boss.x + boss.width * 0.5);
  expect(band.y).toBeGreaterThan(boss.y);
  expect(band.y).toBeLessThan(boss.y + boss.height);
});

test("the return marks every real target on the board and pushes the lane back out", async ({ page }) => {
  await hold(page, { party: 4, shot: 6, at: 0.6 }, "room");
  await expect(page.locator(".cine-text-voice")).toContainText("better");
  await expect(page.locator(".fx-elbow-board-wrap[data-anchor]")).toHaveCount(2);
  await expect(page.locator('.elbow-lane[data-phase="out"]')).toHaveCount(1);
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator("[data-clip^='ult:']").count()).toBe(0);
});

test("skipping from the quiet settles at once and leaves nothing behind", async ({ page }) => {
  await hold(page, { shot: 4, at: 0.5 }, "hush");
  await page.locator(".cine-skip").click();
  await expect(film(page)).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .elbow-street, .elbow-cat").count()).toBe(0);
});

test("FAST keeps every shot: the close-up, the quiet and the impact", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { shots: string[] };
    w.shots = [];
    new MutationObserver(() => {
      const shot = document.querySelector(".ult-cinematic")?.getAttribute("data-shot");
      if (shot && w.shots.at(-1) !== shot) w.shots.push(shot);
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-shot", "data-mode"] });
  });
  await page.goto(lab({ auto: 1, mode: "fast" }));
  // The lab builds the fight and resolves the round before the film mounts; on a loaded machine that alone can pass 30s.
  await expect(film(page)).toHaveAttribute("data-mode", "fast", { timeout: 60_000 });
  await expect(film(page)).toHaveCount(0, { timeout: 30_000 });
  const shots = await page.evaluate(() => (window as unknown as { shots: string[] }).shots);
  expect(shots).toEqual(["call", "cramped", "shambles", "wind", "hush", "sweep", "room"]);
});

test("reduced motion plays still cards with no flash", async ({ page }) => {
  await page.goto(lab({ auto: 1, motion: 0 }));
  await expect(film(page)).toHaveAttribute("data-reduced", "", { timeout: 30_000 });
  expect(await page.locator(".cine-accent:visible, .elbow-sweep, .elbow-cat").count()).toBe(0);
  await expect(film(page)).toHaveCount(0, { timeout: 20_000 });
});
