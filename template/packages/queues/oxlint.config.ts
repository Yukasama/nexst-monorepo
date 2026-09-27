import base, { baseIgnorePatterns } from "@nexst/lint/oxlint";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base],
  ignorePatterns: baseIgnorePatterns,
});
