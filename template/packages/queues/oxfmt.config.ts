import { baseOxfmtConfig } from "@nexst/lint/oxfmt";
import { baseIgnorePatterns } from "@nexst/lint/oxlint";
import { defineConfig } from "oxfmt";

export default defineConfig({
  ...baseOxfmtConfig,
  ignorePatterns: baseIgnorePatterns,
});
