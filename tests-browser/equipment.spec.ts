import { test, expect } from "@playwright/test";
test("Vanguard vertical slice: stable wrist, three slots, down/revive, seizure and return", async ({
  page,
}, info) => {
  await page.goto("/dev/equipment.html");
  const actor = page.locator(".workshop-actor");
  await page.getByLabel("weapon", { exact: true }).selectOption("blood-price");
  await expect(
    actor.locator('[data-part="blade"] [data-equipment="blood-price"]'),
  ).toBeVisible();
  await expect(actor.locator("[data-base-weapon]")).toBeHidden();
  await page.getByLabel("armor", { exact: true }).selectOption("bastion");
  await page.getByLabel("relic", { exact: true }).selectOption("bounty");
  await expect(
    actor.locator('[data-attachment="torso"] [data-equipment="bastion"]'),
  ).toBeVisible();
  await expect(actor.locator('[data-equipment="bounty"]')).toBeVisible();
  for (const clip of ["idle", "attack", "hurt", "defeat", "revive"]) {
    await page.getByRole("button", { name: clip, exact: true }).click();
    await expect(
      actor.locator('[data-part="blade"] [data-equipment="blood-price"]'),
    ).toBeAttached();
  }
  await page
    .getByRole("button", { name: "Trigger armor", exact: true })
    .click();
  await expect(
    actor.locator('[data-equipment="bastion"] .gear-trigger'),
  ).toHaveCount(2);
  await page.getByRole("button", { name: "Collector seizes weapon" }).click();
  await expect(actor.locator('[data-equipment="blood-price"]')).toHaveCount(0);
  await expect(actor.locator("[data-base-weapon]")).toBeVisible();
  await expect(page.locator('[data-held-item="blood-price"]')).toBeVisible();
  await page.getByRole("button", { name: "Break Strongbox / return" }).click();
  await expect(actor.locator('[data-equipment="blood-price"]')).toBeVisible();
  await page.screenshot({ path: info.outputPath("vertical-slice.png") });
  await page.getByLabel("weapon", { exact: true }).selectOption("");
  await expect(actor.locator("[data-base-weapon]")).toBeVisible();
});

test("all eight rigs mount equipment on animated parents; Ranger replaces bow and arrow", async ({
  page,
}) => {
  await page.goto("/dev/equipment.html?items=stormglass,bastion,reservoir");
  await page.evaluate(() => (document.documentElement.dataset.tempo = "0.2"));
  for (const hero of [
    "vanguard",
    "arcanist",
    "ranger",
    "warden",
    "broker",
    "herald",
    "reaver",
    "beguiler",
  ]) {
    await page.getByLabel("Hero", { exact: true }).selectOption(hero);
    const actor = page.locator(".workshop-actor");
    await expect(actor.locator('[data-equipment="stormglass"]')).toBeVisible();
    expect(
      await actor
        .locator('[data-attachment="mainHand"]')
        .evaluate((el) => !!el.closest("[data-part]")),
    ).toBe(true);
    await expect(actor.locator("[data-base-weapon]")).toBeHidden();
    await page.getByRole("button", { name: "attack", exact: true }).click();
    await expect(actor).toHaveAttribute("data-clip", "attack");
    if (hero === "ranger") {
      await expect(
        actor.locator('[data-part="bow"] [data-weapon-form="bow"]'),
      ).toBeVisible();
      await expect(
        actor.locator(
          '[data-part="arrow"] [data-gear-projectile="stormglass"]',
        ),
      ).toBeAttached();
    }
  }
});

test("preview is local and disappears; swaps leave no old layers", async ({
  page,
}) => {
  await page.goto("/dev/equipment.html?items=blood-price,bastion,bounty");
  const actor = page.locator(".workshop-actor");
  await page
    .getByLabel("Auction preview", { exact: true })
    .selectOption("stormglass");
  await expect(actor.locator('[data-equipment="stormglass"]')).toHaveAttribute(
    "data-preview",
    "true",
  );
  await expect(page.getByLabel("weapon", { exact: true })).toHaveValue(
    "blood-price",
  );
  await page.getByLabel("Auction preview", { exact: true }).selectOption("");
  await expect(actor.locator('[data-equipment="stormglass"]')).toHaveCount(0);
  await expect(actor.locator('[data-equipment="blood-price"]')).toBeVisible();
  await page.getByLabel("weapon", { exact: true }).selectOption("venom");
  await expect(actor.locator('[data-equipment="blood-price"]')).toHaveCount(0);
  await expect(actor.locator('[data-equipment="venom"]')).toBeVisible();
});

test("equipped combat scene stays inside stage and exposes an inspection link", async ({
  page,
}) => {
  await page.goto("/dev/bosses.html?party=4&stage=opening&motion=1");
  await expect(
    page.locator('.stage [data-equipment="stormglass"]'),
  ).toHaveCount(4);
  const report = await page.evaluate(() => {
    const stage = document.querySelector(".stage")!.getBoundingClientRect();
    return [...document.querySelectorAll(".stage [data-equipment]")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.left < stage.left - 2 ||
          r.right > stage.right + 2 ||
          r.top < stage.top - 2 ||
          r.bottom > stage.bottom + 2
        );
      })
      .map((el) => el.getAttribute("data-equipment"));
  });
  expect(report).toEqual([]);
  await page.locator(".equipment-inspector summary").first().click();
  const item = page.locator(".equipment-inspector[open] button").first();
  await item.hover();
  await expect(
    page.locator('.stage [data-equipment="stormglass"][data-highlight]'),
  ).toHaveCount(1);
});

test("auction hover/focus preview restores ownership and results rebuild the final party", async ({
  page,
}) => {
  await page.goto("/dev/equipment.html?screen=auction");
  const preview = page.getByRole("button", { name: /Try on/ });
  await preview.focus();
  await expect(
    page.locator('[data-equipment="stormglass"][data-preview]'),
  ).toBeVisible();
  await expect(page.locator('[data-equipment="blood-price"]')).toBeAttached();
  await page.getByRole("heading", { name: "Going once. Going broke." }).click();
  await expect(
    page.locator('[data-equipment="stormglass"][data-preview]'),
  ).toHaveCount(0);
  await expect(page.locator('[data-equipment="blood-price"]')).toBeVisible();
  await page.goto("/dev/equipment.html?screen=results");
  await expect(page.locator('[data-equipment="blood-price"]')).toBeVisible();
  await expect(page.locator('[data-equipment="lens"]')).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-equipment="blood-price"]')).toBeVisible();
});

test("gear keeps the same relative transform through motion and down/revive", async ({
  page,
}) => {
  for (const hero of ["vanguard", "ranger"]) {
    await page.goto(
      `/dev/equipment.html?hero=${hero}&items=blood-price,bastion,bounty`,
    );
    await page.evaluate(() => (document.documentElement.dataset.tempo = "0.3"));
    const gear = page.locator('.workshop-actor [data-attachment="mainHand"]');
    const matrix = () =>
      gear.evaluate((el) => {
        const g = el as SVGGraphicsElement;
        const p = g.closest("[data-part]") as SVGGraphicsElement;
        const relative = p.getCTM()!.inverse().multiply(g.getCTM()!);
        return [
          relative.a,
          relative.b,
          relative.c,
          relative.d,
          relative.e,
          relative.f,
        ].map((n) => Math.round(n * 1000) / 1000 || 0);
      });
    const before = await matrix();
    await gear.evaluate((el) => el.setAttribute("data-stable", "original"));
    await page.getByRole("button", { name: "attack", exact: true }).click();
    await page.waitForTimeout(180);
    expect(await matrix()).toEqual(before);
    await expect(gear).toHaveAttribute("data-stable", "original");
    await page.getByRole("button", { name: "defeat", exact: true }).click();
    await page.waitForTimeout(2800);
    await expect(
      page.locator('.workshop-actor [data-equipment="blood-price"]'),
    ).toBeVisible();
    await page.getByRole("button", { name: "revive", exact: true }).click();
    await page.waitForTimeout(2300);
    await expect(
      page.locator('.workshop-actor [data-equipment="blood-price"]'),
    ).toBeVisible();
    await page.getByRole("button", { name: "Front / back row" }).click();
    await expect(gear).toHaveAttribute("data-stable", "original");
  }
});

test("authoritative combat seizure removes gear, and reconnect keeps it removed", async ({
  page,
}) => {
  await page.goto("/dev/bosses.html?party=2&stage=opening&motion=0");
  await expect(
    page.locator('.stage [data-equipment="stormglass"]'),
  ).toHaveCount(2);
  await page.goto("/dev/bosses.html?party=2&stage=resolved&motion=0");
  await expect(
    page.locator('.vault [data-held-item="stormglass"]'),
  ).toHaveCount(2);
  await expect(
    page.locator('.combatant[data-side="hero"] [data-equipment="stormglass"]'),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.locator('.combatant[data-side="hero"] [data-equipment="stormglass"]'),
  ).toHaveCount(0);
  await page.goto("/dev/bosses.html?party=2&stage=released&motion=0");
  await expect(
    page.locator('.stage [data-equipment="stormglass"]'),
  ).toHaveCount(2);
});
