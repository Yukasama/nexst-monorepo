import { createKnipConfig } from "@nexst/lint/knip";
import type { KnipConfig } from "knip";

const config: KnipConfig = createKnipConfig({
  entry: [
    "prisma/schema.prisma",
    "src/main.ts",
    "scripts/auth.cli.ts", // @if auth
    // Template building blocks, kept until the first feature uses them.
    "src/auth/decorator/roles.decorator.ts", // @if auth
    "src/errors/app-parse-uuid.pipe.ts",
    "src/utils/pagination.input.ts",
  ],
  ignoreBinaries: [
    "better-auth", // @if auth
  ],
  ignoreDependencies: ["@prisma/client-runtime-utils", "@types/js-yaml"],
  project: ["prisma/**/*.prisma"],
  vitest: { config: ["vitest.config.ts", "vitest.config.e2e.ts"] },
});

export default config;
