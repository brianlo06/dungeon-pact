import { test, expect } from "@playwright/test";
/**
 * Played at a quarter speed on purpose. The defeat pose only exists while the
 * round is replaying — once it settles, the hold releases and the stage is
 * gone — so at full speed this asserts against a window a few frames wide and
 * fails on a fast machine while passing on a loaded one.
 */
test("last blow and defeat replay before the upgrade screen", async ({
  page,
}) => {
  // A quarter speed costs about fifteen seconds of wall clock, which is the
  // default budget with nothing to spare on a machine running the whole suite.
  test.slow();
  await page.goto(
    "/dev/bosses.html?encounter=furnace-watch&party=2&stage=opening&finisher=1&motion=1&tempo=0.25",
  );
  await page
    .getByRole("option", { name: "Shieldbreaker Free", exact: true })
    .click();
  await page.getByRole("button", { name: /^Iron Bulwark,/ }).click();
  await page.getByRole("button", { name: /Lock action/ }).click();
  await expect(page.locator(".stage.is-replaying")).toBeVisible();
  await expect(page.getByText(/Encounter finished/)).toHaveCount(0);
  await expect(
    page.locator('.combatant[data-side="enemy"] [data-clip="defeat"]'),
  ).toBeAttached({ timeout: 20000 });
  await expect(page.getByText(/Encounter finished/)).toBeVisible({
    timeout: 20000,
  });
});
test("shop proposals assign gear cooperatively without bidding", async ({
  page,
}, info) => {
  await page.goto("/dev/expedition.html?shop=1");
  const gold = await page.getByRole("status").first().innerText();
  await page.getByLabel("Gear recipient").selectOption("b");
  await page
    .getByRole("button", { name: "Propose for Bea", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("region", { name: "Purchase approval" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Approve purchase", exact: true })
    .click();
  await expect(page.getByRole("status").first()).toHaveText(gold);
  await page.getByLabel("Acting player").selectOption("b");
  await page
    .getByRole("button", { name: "Approve purchase", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Purchased", exact: true }),
  ).toHaveCount(1);
  await expect(page.getByRole("status").first()).not.toHaveText(gold);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("party-shop.png"),
    fullPage: true,
  });
});
test("Barrier and status effects are readable and keyboard inspectable", async ({
  page,
}, info) => {
  await page.goto("/dev/bosses.html?boss=miser&party=4&stage=resolved");
  const badge = page.locator(".barrier-readout").first();
  await expect(badge).toContainText("Barrier");
  await badge.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toContainText("shield points");
  await expect(page.getByRole("dialog")).toContainText("round");
  await page.screenshot({ path: info.outputPath("status-details.png") });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(badge).toBeFocused();
});
/**
 * The head shrank to take the party off chibi proportions, which opened a gap
 * between jaw and shoulders. Both halves of that are structural: the scale
 * lives inside the animated head part, and the neck that fills the gap lives
 * in the body. Either one alone looks broken.
 */
test("illustrated heads and equipment stay inside animated rig parts", async ({
  page,
}, info) => {
  await page.goto("/dev/equipment.html?items=blood-price,bastion,bounty");
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
    await expect(
      actor.locator('[data-part="head"] [data-art="illustrated-head"]'),
    ).toBeVisible();
    await expect(
      actor.locator('[data-part="body"] [data-art="tailoring"]'),
    ).toBeAttached();
    // The throat belongs to the body, not the head: turning to look at
    // something must not take the neck along with it.
    await expect(
      actor.locator('[data-part="body"] [data-art="throat"]'),
    ).toBeAttached();
    await expect(
      actor.locator('[data-part="head"] [data-art="throat"]'),
    ).toHaveCount(0);
    await expect(actor.locator('[data-equipment="blood-price"]')).toBeVisible();
    if (hero === "vanguard" || hero === "ranger")
      await page.screenshot({
        path: info.outputPath(`illustrated-${hero}.png`),
        fullPage: true,
      });
  }
});

test("a new round starts at the ability list, not on last round's target", async ({
  page,
}) => {
  await page.goto("/dev/bosses.html?encounter=furnace-watch&party=2");
  await page.locator(".fan-slip:not([data-common]) > button").first().click();
  // Whichever enemy the chosen ability can actually reach: melee screening
  // means the nearest body on the field is not always a legal target.
  await page
    .locator(".combatant[data-side='enemy'] .combatant-body:not([disabled])")
    .first()
    .click();
  // Round one: a target is aimed at, so backing out is on offer.
  await expect(page.locator(".commit-back")).toBeVisible();
  await page.getByRole("button", { name: /Lock action/ }).click();
  await page.getByRole("button", { name: "Finish round" }).click();
  await expect(page.locator(".strip-chamber b")).toHaveText("ROUND 2");
  // Round two: nothing is aimed anywhere, so there is nothing to back out of
  // and nothing lined up to lock by accident.
  await expect(page.locator(".commit-back")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /Lock action/ }),
  ).toBeDisabled();
  await expect(page.locator(".commit-bar")).toHaveAttribute(
    "data-mode",
    "ability",
  );
});

/**
 * A training ground teaches one class. Everyone else is offered a drill: a
 * smaller, permanent gain that is not a path. The screen has to make which of
 * the two you are being offered unmistakable, because the fee differs and the
 * decision is spent from a purse the whole party shares.
 */
test("a training ground offers its class a path and everyone else a drill", async ({
  page,
}, info) => {
  await page.goto("/dev/expedition.html?mentor=1");
  const treasury = page.getByRole("status").first();
  const gold = Number((await treasury.innerText()).replace(/\D/g, ""));

  // Ada is a Vanguard; this ground raises Vanguards, so Ada is offered a path.
  await expect(
    page.getByRole("button", { name: /Take the .* path/ }),
  ).toBeVisible();
  await expect(page.getByText(/This ground raises Vanguards/)).toBeVisible();
  await page.screenshot({
    path: info.outputPath("mentor-path.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: /Take the .* path/ }).click();
  const spent = gold - Number((await treasury.innerText()).replace(/\D/g, ""));

  // Bea is a Warden. No path is on offer to her at any price.
  await page.getByLabel("Acting player").selectOption("b");
  await expect(
    page.getByRole("button", { name: /Take the .* path/ }),
  ).toHaveCount(0);
  const drill = page.getByRole("button", { name: /^Drill · \d+ gold$/ });
  await expect(drill).toBeVisible();
  const fee = Number((await drill.innerText()).replace(/\D/g, ""));
  expect(fee).toBeLessThan(spent);
  const before = Number((await treasury.innerText()).replace(/\D/g, ""));
  await drill.click();
  // Both heroes have now answered, so the ground closes and the purse is
  // exactly one drill lighter.
  await expect(
    page.getByRole("heading", { name: "The Whetstone" }),
  ).toHaveCount(0);
  expect(Number((await treasury.innerText()).replace(/\D/g, ""))).toBe(
    before - fee,
  );
});
