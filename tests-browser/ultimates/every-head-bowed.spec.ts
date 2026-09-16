import { test, expect, type Page } from "@playwright/test";

/** The Blightcaller's Every Head Bowed, through the Ultimate lab. */

test.describe.configure({ timeout: 90_000 });

async function hold(page: Page, params: Record<string, string | number>, shot: string) {
  await page.goto(
    `/dev/ultimates.html?${new URLSearchParams({ hero: "warden", evo: "war-blightcaller", party: 3, auto: 1, pause: 1, ...params } as never)}`,
  );
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-shot", shot, { timeout: 45_000 });
}

const caster = (page: Page) => page.locator('.cine-actor[data-role="caster"]');
/** Every band's painted path of one colour, joined: the field is drawn as a few paths, one per colour. */
const painted = (page: Page, name: string) =>
  page.locator(`.bowed-field [data-p="${name}"]`).evaluateAll((els) => els.map((e) => e.getAttribute("d") ?? "").join("|"));
const EMPTY = /^(M0 0\|?)+$/;

/** How far each target copy's drawing is pitched and hunched, and its head part dropped. */
const bows = (page: Page) =>
  page.locator('.cine-actor[data-role="targets"]').evaluateAll((els) =>
    els
      .filter((a) => (a as HTMLElement).style.display !== "none")
      .map((a) => {
        const look = a.querySelector<HTMLElement>(".cine-look")!;
        const t = look.style.transform;
        const head = a.querySelector<SVGGElement>('.cine-look > svg [data-part="head"], .cine-look > svg [data-part="visor"], .cine-look > svg [data-part="snout"]');
        return {
          pitch: Number(/rotate\((-?[\d.]+)deg\)/.exec(t)?.[1] ?? 0),
          squash: Number(/scale\([\d.]+, ([\d.]+)\)/.exec(t)?.[1] ?? 1),
          head: Number(/(-?[\d.]+)deg/.exec(head?.style.rotate ?? "")?.[1] ?? 0),
        };
      }),
  );

test("it is the Blightcaller's own film: the late field, the real row standing in it, and the heads following the real lantern", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 2, at: 0.3 }, "field");
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-cinematic", "every-head-bowed");
  await expect(page.locator(".bowed-late")).toBeAttached();
  // The sniper's row is the sniper and the mender behind the line.
  await expect(page.locator('.cine-actor[data-role="targets"]')).toHaveCount(2);
  const plants = await page
    .locator(".bowed-field-plants")
    .evaluateAll((els) => els.reduce((n, e) => n + JSON.parse((e as HTMLElement).dataset.plants ?? "[]").length, 0));
  expect(plants).toBeGreaterThan(40);
  const back = await painted(page, "petals");
  await hold(page, { enemy: "sniper", shot: 2, at: 0.66 }, "field");
  // The lantern was swung, and the heads turned with it.
  expect(await painted(page, "petals")).not.toBe(back);
  // Nothing has rotted yet, and nobody is bowed.
  expect(await painted(page, "black")).toMatch(EMPTY);
  for (const b of await bows(page)) expect(b.pitch).toBe(0);
});

test("the quiet close-up acts with the face, and the light goes down off it with nothing loud", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 3, at: 0.35 }, "hush");
  const brow = await caster(page).locator('[data-part="brow"]').evaluate((el) => getComputedStyle(el).transform);
  const mouth = await caster(page).locator('[data-part="mouth"]').evaluate((el) => getComputedStyle(el).transform);
  expect(brow).not.toBe("none");
  expect(mouth).not.toBe("none");
  const early = await page.locator(".cine-vfx > .bowed-light").evaluate((el) => (el as HTMLElement).style.transform);
  await hold(page, { enemy: "sniper", shot: 3, at: 0.9 }, "hush");
  const late = await page.locator(".cine-vfx > .bowed-light").evaluate((el) => (el as HTMLElement).style.transform);
  const y = (t: string) => Number(/translate3d\([-\d.]+px, ([-\d.]+)px/.exec(t)?.[1] ?? NaN);
  expect(y(late)).toBeGreaterThan(y(early) + 150);
  expect(await page.locator('.cine-accent[data-screen="two-tone"]').count()).toBe(0);
  expect(await page.locator(".bowed-rot-fig").count()).toBe(0);
});

test("the bow is drawn: every head down and rotted on the contact, the row blighted on its own silhouette, the damage revealed", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 4, at: 0.3 }, "bow");
  await expect(page.locator('.cine-accent[data-screen="two-tone"]')).toBeAttached();
  // Every head in the field has gone over: no petals left, all of them black.
  expect(await painted(page, "petals")).toMatch(EMPTY);
  expect(await painted(page, "black")).not.toMatch(EMPTY);
  // And the row bowed with it: each target pitched forward, hunched, its head dropped.
  const held = await bows(page);
  expect(held.length).toBe(2);
  for (const b of held) {
    expect(b.pitch).toBeLessThan(-10);
    expect(b.squash).toBeLessThan(0.93);
    expect(b.head).toBeLessThan(-15);
  }
  // The blight is inside each target copy, clipped to a flattened copy of its drawing.
  await expect(page.locator('.cine-actor[data-role="targets"] .bowed-rot-fig')).toHaveCount(2);
  expect(await page.locator(".bowed-rot-fig clipPath > g").count()).toBe(0);
  expect(await page.locator(".bowed-rot-fig clipPath > *").count()).toBeGreaterThan(4);
  await expect(page.locator(".bowed-rot-fig .bowed-coat").first()).not.toHaveCSS("opacity", "0");
  // On the board, the row has been bitten.
  const bars = await page.locator('.stage .combatant[data-side="enemy"] .combatant-bar').evaluateAll((els) => els.map((e) => e.getAttribute("title") ?? ""));
  expect(bars.some((t) => {
    const [hp, max] = t.split("/").map((x) => Number(x.trim().replace(/\D.*$/, "")));
    return hp < max;
  })).toBe(true);
});

test("the row is still bowed on the late frame, and a boss bows less but visibly", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 4, at: 0.65 }, "bow");
  for (const b of await bows(page)) {
    expect(b.pitch).toBeLessThan(-10);
    expect(b.head).toBeLessThan(-15);
  }
  await hold(page, { enemy: "collector", shot: 4, at: 0.3 }, "bow");
  const [boss] = await bows(page);
  expect(boss.pitch).toBeLessThan(-7);
  expect(boss.pitch).toBeGreaterThan(-15);
  expect(boss.head).toBeLessThan(-10);
});

test("the return marks every real target, a boss is framed, FAST keeps the quiet and the bow, and skipping leaves nothing", async ({ page }) => {
  await hold(page, { enemy: "sniper", shot: 5, at: 0.7 }, "bowed");
  const marks = page.locator(".bowed-board-rot");
  await expect(marks).toHaveCount(2);
  const anchored = await page.locator(".cine-anchored:has(.bowed-board)").evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.anchor));
  for (const unit of anchored) {
    const body = (await page.locator(`.stage [data-unit="${unit}"] .combatant-rig`).boundingBox())!;
    const mark = (await page.locator(`.cine-anchored[data-anchor="${unit}"] .bowed-board-rot`).boundingBox())!;
    const cx = mark.x + mark.width / 2;
    expect(cx).toBeGreaterThan(body.x);
    expect(cx).toBeLessThan(body.x + body.width);
  }
  await hold(page, { enemy: "collector", shot: 4, at: 0.5 }, "bow");
  await expect(page.locator(".ult-cinematic")).toHaveAttribute("data-framing", "boss");
  await expect(page.locator('.cine-actor[data-role="targets"]')).toHaveCount(1);
  await expect(page.locator(".bowed-glare")).toBeAttached();
  await hold(page, { enemy: "sniper", mode: "fast", shot: 3, at: 0.5 }, "hush");
  await hold(page, { enemy: "sniper", mode: "fast", shot: 4, at: 0.3 }, "bow");
  await page.locator(".cine-skip").click();
  await expect(page.locator(".ult-cinematic")).toHaveCount(0, { timeout: 2000 });
  expect(await page.locator(".cine-vfx, .cine-actor, .bowed-board, .bowed-rot-fig, .bowed-field").count()).toBe(0);
});
