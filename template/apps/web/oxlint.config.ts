import base, { baseIgnorePatterns } from "@nexst/lint/oxlint";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base],
  ignorePatterns: [...baseIgnorePatterns, ".next/**", "src/generated/**"],
  jsPlugins: ["eslint-plugin-storybook"],
  overrides: [
    {
      files: ["**/config/**"],
      rules: {
        "sonarjs/no-duplicate-string": "off",
      },
    },
    {
      files: ["*.stories.tsx"],
      rules: {
        "storybook/await-interactions": "error",
        "storybook/context-in-play-function": "error",
        "storybook/default-exports": "warn",
        "storybook/hierarchy-separator": "warn",
        "storybook/no-title-property-in-meta": "warn",
        "storybook/no-uninstalled-addons": "error",
        "storybook/prefer-pascal-case": "warn",
        "storybook/use-storybook-expect": "warn",
        "storybook/use-storybook-testing-library": "warn",
      },
    },
  ],
  plugins: ["react", "nextjs", "jsx-a11y", "react-perf"],
  rules: {
    "typescript/no-floating-promises": "off",
    "typescript/no-unnecessary-type-assertion": "warn",
    "typescript/switch-exhaustiveness-check": "warn",
  },
});
