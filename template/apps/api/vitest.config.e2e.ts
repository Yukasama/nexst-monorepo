import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

if (existsSync(".env.development")) process.loadEnvFile(".env.development");

/**
 * E2E specs talk to a running API (`bun dev` locally, the rolled-out image in
 * CI) at `API_URL`, default http://localhost:3001.
 */
export default defineConfig({
  test: {
    globals: true,
    include: ["tests/**/*.e2e-spec.ts"],
    root: "./",
  },
});
