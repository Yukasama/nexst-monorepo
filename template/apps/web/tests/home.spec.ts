import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("renders the hero without accessibility violations", async ({ page }) => {
    await page.goto("/en");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("redirects the bare root to the default locale", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/en$/);
  });

  test("serves the German locale", async ({ page }) => {
    await page.goto("/de");

    await expect(page.locator("html")).toHaveAttribute("lang", "de");
  });
});
