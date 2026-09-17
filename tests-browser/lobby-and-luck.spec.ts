import { test, expect } from "@playwright/test";

test("the table shows who picked which hero, in their seat colour", async ({
  page,
}) => {
  // Ada has locked in the Ranger, Bea is eyeing it, Cy locked the Arcanist.
  await page.goto("/dev/expedition.html?lobby");
  const ranger = page.locator(".hero-choice.hero-ranger");
  await expect(ranger).toHaveClass(/claimed/);
  await expect(ranger).toHaveClass(/locked/);
  await expect(ranger.locator(".pick-tag")).toHaveText([
    /P1\s*Ada\s*✓/,
    /P2\s*Bea/,
  ]);
  await expect(ranger.locator(".pick-tag.ready")).toHaveCount(1);
  await expect(page.locator(".hero-choice.hero-arcanist .pick-tag")).toHaveText(
    /P3\s*Cy/,
  );
  // Nobody picked the Vanguard, even though everyone joins holding it.
  await expect(
    page.locator(".hero-choice.hero-vanguard .pick-tag"),
  ).toHaveCount(0);
  // The seat colour is the border.
  const border = await ranger.evaluate(
    (el) => getComputedStyle(el).borderTopColor,
  );
  expect(border).toBe("rgb(217, 81, 60)");

  // The seats and the ready button stay on screen at the bottom of the grid's
  // scroll, wherever the player has scrolled to.
  const roster = page.locator(".lobby-roster");
  await page.locator(".hero-choice.hero-beguiler").scrollIntoViewIfNeeded();
  await expect(roster).toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(roster).toBeInViewport();
  await expect(roster.locator(".seat")).toHaveCount(4);
  await expect(roster.locator(".seat.open")).toHaveCount(1);

  // Picking a hero moves your tag there and takes back your ready.
  await page.getByLabel("Acting player").selectOption("a");
  await page.locator(".hero-choice.hero-warden").click();
  await expect(page.locator(".hero-choice.hero-warden .pick-tag")).toHaveText(
    /P1\s*Ada/,
  );
  await expect(ranger.locator(".pick-tag")).toHaveCount(1);
  await expect(ranger).not.toHaveClass(/locked/);
});

test("a chance event prints its odds, rolls, and holds on the result", async ({
  page,
}) => {
  await page.goto("/dev/expedition.html?event=automaton-duel");
  const favourite = page.locator(".choice", {
    hasText: "Back the Old Riveter",
  });
  await expect(favourite.locator(".odds li")).toHaveText([
    /70%\s*Riveter wins.*\+130 gold/,
    /30%\s*Upset.*lose the 60 gold stake/,
  ]);
  for (const id of ["a", "b"]) {
    await page.getByLabel("Acting player").selectOption(id);
    await favourite.click();
  }
  const result = page.locator(".chance-result");
  await expect(result).toHaveClass(/settled/, { timeout: 5000 });
  const roll = Number(await result.locator(".die strong").innerText());
  await expect(result.locator("h2")).toHaveText(
    roll <= 70 ? "Riveter wins" : "Upset",
  );
  await expect(page.getByRole("status").first()).toHaveText(
    `Treasury: ${roll <= 70 ? 420 - 60 + 130 : 420 - 60}`,
  );
  await page.getByRole("button", { name: "Continue →" }).click();
  await expect(result).toHaveCount(0);
});

test("a press-your-luck event asks again with the next odds", async ({
  page,
}) => {
  // A safe first search from this RNG state.
  await page.goto("/dev/expedition.html?event=buried-surveyor&rng=2654435769");
  for (const id of ["a", "b"]) {
    await page.getByLabel("Acting player").selectOption(id);
    await page.locator(".choice", { hasText: "Search the body" }).click();
  }
  await expect(page.locator(".chance-result")).toHaveClass(/settled good/, {
    timeout: 5000,
  });
  await expect(page.locator(".chance-result .found")).toContainText(
    "Found so far",
  );
  const again = page.locator(".choice", { hasText: "Search again" });
  await expect(again).toContainText("50% chance");
  await expect(again.locator(".ladder li")).toHaveText([/50%/, /75%/]);
  await expect(
    page.locator(".choice", { hasText: "Leave with what you found" }),
  ).toBeVisible();
});

test("every hero rolls for themselves at the dice table", async ({ page }) => {
  await page.goto("/dev/expedition.html?event=loaded-dice&size=4");
  for (const id of ["a", "b", "c", "d"]) {
    await page.getByLabel("Acting player").selectOption(id);
    const roll = page.locator(".choice", { hasText: "Everyone rolls" });
    if (!(await roll.count())) break;
    await roll.click();
  }
  await expect(page.locator(".hero-roll")).toHaveCount(4);
  await expect(page.locator(".hero-roll.settled")).toHaveCount(4, {
    timeout: 5000,
  });
});
