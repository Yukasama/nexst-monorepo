import base, { baseIgnorePatterns } from "@nexst/lint/oxlint";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base],
  ignorePatterns: baseIgnorePatterns,
  rules: {
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
    "typescript/no-unnecessary-type-assertion": "warn",
    "typescript/switch-exhaustiveness-check": "warn",

    "vitest/require-mock-type-parameters": "off",
  },
});
