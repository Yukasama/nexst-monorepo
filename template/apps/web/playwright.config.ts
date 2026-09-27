import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: process.env.CI ? [["github"], ["html"]] : [["html"]],
  retries: process.env.CI ? 2 : 0,
  testDir: "tests",
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },

  webServer: {
    command: "bun run start",
    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
      NEXT_PUBLIC_HOST_URL: process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000",
    },
    reuseExistingServer: !process.env.CI,
    stderr: "pipe",
    stdout: "ignore",
    url: "http://localhost:3000",
  },

  workers: process.env.CI ? 2 : 1,
});
