import { test, expect } from "@playwright/test";
test("trade acceptance preserves both equipment pieces", async ({ page }) => {
  await page.goto("/dev/expedition.html");
  await page
    .getByText("Provisions and trading · expedition guide", { exact: true })
    .click();
  await page.getByLabel("Offer", { exact: true }).selectOption("stormglass");
  await page.getByLabel("To", { exact: true }).selectOption("b");
  await page.getByRole("button", { name: "Offer trade", exact: true }).click();
  await expect(page.getByTestId("gear-a")).toContainText("stormglass");
  await page.getByLabel("Acting player").selectOption("b");
  await page.getByRole("button", { name: "Accept exchange" }).click();
  await expect(page.getByTestId("gear-a")).toContainText("blood-price");
  await expect(page.getByTestId("gear-b")).toContainText("stormglass");
});
test("provision approval visibly charges the shared purse once", async ({
  page,
}) => {
  await page.goto("/dev/expedition.html");
  await page
    .getByText("Provisions and trading · expedition guide", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "Propose · 100 gold", exact: true })
    .click();
  await page.getByRole("button", { name: "Approve provisions" }).click();
  await expect(page.getByRole("status").first()).toContainText("420");
  await page.getByLabel("Acting player").selectOption("b");
  await page.getByRole("button", { name: "Approve provisions" }).click();
  await expect(page.getByRole("status").first()).toContainText("320");
  await expect(page.getByTestId("gear-a")).toContainText("field-dressing");
  await expect(page.getByTestId("gear-b")).toContainText("field-dressing");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `/private/tmp/expedition-provisions-${page.viewportSize()!.width}.png`,
    fullPage: true,
  });
});
test("descending auction asks wait for both players", async ({ page }) => {
  await page.goto("/dev/expedition.html?auction=1");
  const price = page.locator(".price > strong");
  const opening = parseInt((await price.innerText()).trim());
  await page.getByRole("button", { name: "Wait for a lower ask" }).click();
  await expect(price).toContainText(String(opening));
  await page.getByLabel("Acting player").selectOption("b");
  await page.getByRole("button", { name: "Wait for a lower ask" }).click();
  await expect(price).not.toContainText(String(opening));
});
test("onboarding advances and remembers completion", async ({ page }) => {
  await page.goto("/dev/expedition.html?tutorial=1");
  await expect(page.getByRole("dialog")).toContainText(
    "Choose the next chamber",
  );
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Provision before you travel",
  );
  await page.getByRole("button", { name: "Got it", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
