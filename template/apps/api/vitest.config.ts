import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // graphql ships a "development" export condition; without pinning one entry,
    // @nestjs/graphql and the app load two graphql instances ("Cannot use
    // GraphQLSchema from another module or realm").
    alias: [{ find: /^graphql$/, replacement: fileURLToPath(import.meta.resolve("graphql")) }],
  },
  test: {
    coverage: {
      exclude: ["src/generated/**", "**/*.spec.ts"],
      include: ["src/**/*.ts"],
      provider: "v8",
      reporter: ["text", "lcov"],
    },
    // Unit tests never reach real services; these only satisfy config validation.
    env: {
      // @if auth
      BETTER_AUTH_SECRET: "unit-test-secret-unit-test-secret-1234",
      BETTER_AUTH_URL: "http://localhost:3001",
      // @endif
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      // @if r2
      R2_ACCESS_KEY_ID: "unit-test",
      R2_BUCKET: "unit-test",
      R2_ENDPOINT: "https://unit-test.r2.cloudflarestorage.com",
      R2_SECRET_ACCESS_KEY: "unit-test",
      // @endif
    },
    globals: true,
    include: ["src/**/*.spec.ts"],
    isolate: false,
    root: "./",
    // @if worker
    server: { deps: { inline: ["@nestjs/bullmq"] } },
    // @endif
  },
});
