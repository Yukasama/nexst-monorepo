import { expect, test } from "@playwright/test";

test.describe("auth", () => {
  test("sends anonymous visitors of a protected page to sign-in", async ({ page }) => {
    await page.goto("/en/dashboard");

    await expect(page).toHaveURL(/\/en\/sign-in\?returnTo=%2Fdashboard$/);
  });

  test("validates the sign-in form before calling the API", async ({ page }) => {
    await page.goto("/en/sign-in");

    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  });
});
