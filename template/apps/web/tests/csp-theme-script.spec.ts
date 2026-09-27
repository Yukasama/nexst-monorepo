import { expect, test } from "@playwright/test";

/**
 * Guards the hash allowlist in src/config/csp.ts: next-themes' theme-init
 * <script> (see src/features/shared/provider.tsx) gets no per-request nonce,
 * so it only runs if its exact rendered bytes match one of the checked-in
 * sha256 hashes. Turbopack renders it differently in dev vs. `next build`, so
 * a next-themes/Turbopack upgrade can silently drift the hash and get the
 * script CSP-blocked (theme flash, no thrown error) without this failing.
 */
test.describe("CSP: theme init script", () => {
  test("next-themes inline script runs without a CSP violation", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __cspViolations: string[] }).__cspViolations = [];
      window.addEventListener("securitypolicyviolation", (event) => {
        (window as unknown as { __cspViolations: string[] }).__cspViolations.push(
          `${event.violatedDirective}: ${event.blockedURI}`,
        );
      });
    });

    await page.goto("http://localhost:3000/en");
    await page.waitForLoadState("domcontentloaded");

    const appliedThemeClass = await page.evaluate(
      () =>
        document.documentElement.classList.contains("light") ||
        document.documentElement.classList.contains("dark"),
    );
    expect(appliedThemeClass, "next-themes should apply light/dark before hydration").toBe(true);

    const violations = await page.evaluate(
      () => (window as unknown as { __cspViolations: string[] }).__cspViolations,
    );
    expect(violations, "a hash in src/config/csp.ts is stale — see the comment there").toEqual([]);
  });
});
