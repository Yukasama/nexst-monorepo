import path from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname = import.meta.dirname;

export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(dirname, "src"),
      "~sb": path.join(dirname, ".storybook"),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          include: ["src/**/*.test.ts"],
          name: "unit",
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, ".storybook") })],
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium", viewport: { height: 900, width: 1440 } }],
            provider: playwright({}),
          },
          name: "storybook",
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
