import { defineConfig } from "oxlint";

/**
 * Ignore patterns shared by every app, for both oxlint and oxfmt (see oxfmt.ts).
 * oxlint's `extends` merges `rules`, `plugins`, `jsPlugins`, `overrides` and
 * `options` from extended configs (last one wins on conflicting keys), but NOT
 * `ignorePatterns` — that field is fully replaced by whichever config sets it
 * last, so each app spreads this array into its own instead of relying on
 * `extends` for it.
 */
export const baseIgnorePatterns = [
  "public/**",
  "dist/**",
  "coverage/**",
  "node_modules/**",
  "tests/files/**",
];

export default defineConfig({
  jsPlugins: [
    "eslint-plugin-sonarjs",
    "eslint-plugin-perfectionist",
    "eslint-plugin-security",
    "eslint-plugin-regexp",
  ],
  options: {
    typeAware: true,
    typeCheck: true,
  },
  plugins: [
    "unicorn",
    "typescript",
    "oxc",
    "import",
    "promise",
    "jsdoc",
    "node",
    "vitest",
  ],
  rules: {
    "perfectionist/sort-array-includes": [
      "warn",
      { order: "asc", type: "natural" },
    ],
    "perfectionist/sort-classes": ["warn", { order: "asc", type: "natural" }],
    "perfectionist/sort-decorators": [
      "warn",
      { order: "asc", type: "natural" },
    ],
    "perfectionist/sort-enums": ["warn", { order: "asc", type: "natural" }],
    "perfectionist/sort-export-attributes": [
      "warn",
      { order: "asc", type: "natural" },
    ],
    "perfectionist/sort-exports": ["warn", { order: "asc", type: "natural" }],
    "perfectionist/sort-heritage-clauses": [
      "warn",
      { order: "asc", type: "natural" },
    ],
    "perfectionist/sort-import-attributes": [
      "warn",
      { order: "asc", type: "natural" },
    ],
    "perfectionist/sort-interfaces": [
      "warn",
      { order: "asc", type: "natural" },
    ],
    "perfectionist/sort-intersection-types": [
      "warn",
      { order: "asc", type: "natural" },
    ],
    "perfectionist/sort-jsx-props": ["warn", { order: "asc", type: "natural" }],
    "perfectionist/sort-maps": ["warn", { order: "asc", type: "natural" }],
    "perfectionist/sort-modules": ["warn", { order: "asc", type: "natural" }],
    "perfectionist/sort-named-exports": [
      "warn",
      { order: "asc", type: "natural" },
    ],
    "perfectionist/sort-named-imports": [
      "warn",
      { order: "asc", type: "natural" },
    ],
    "perfectionist/sort-object-types": [
      "warn",
      { order: "asc", type: "natural" },
    ],
    "perfectionist/sort-objects": ["warn", { order: "asc", type: "natural" }],
    "perfectionist/sort-sets": ["warn", { order: "asc", type: "natural" }],
    "perfectionist/sort-switch-case": [
      "warn",
      { order: "asc", type: "natural" },
    ],
    "perfectionist/sort-union-types": [
      "warn",
      { order: "asc", type: "natural" },
    ],
    "perfectionist/sort-variable-declarations": [
      "warn",
      { order: "asc", type: "natural" },
    ],

    "regexp/no-super-linear-backtracking": "warn",
    "regexp/no-unused-capturing-group": "warn",
    "regexp/prefer-regexp-test": "warn",

    "security/detect-bidi-characters": "error",
    "security/detect-child-process": "warn",
    "security/detect-eval-with-expression": "error",
    "security/detect-new-buffer": "error",
    "security/detect-non-literal-fs-filename": "warn",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "warn",

    "sonarjs/cognitive-complexity": "warn",
    "sonarjs/max-switch-cases": ["warn", 30],
    "sonarjs/no-all-duplicated-branches": "warn",
    "sonarjs/no-collapsible-if": "warn",
    "sonarjs/no-collection-size-mischeck": "warn",
    "sonarjs/no-duplicate-string": ["warn", { threshold: 5 }],
    "sonarjs/no-duplicated-branches": "warn",
    "sonarjs/no-element-overwrite": "warn",
    "sonarjs/no-empty-collection": "warn",
    "sonarjs/no-extra-arguments": "warn",
    "sonarjs/no-identical-conditions": "warn",
    "sonarjs/no-identical-expressions": "warn",
    "sonarjs/no-identical-functions": "warn",
    "sonarjs/no-redundant-boolean": "warn",
    "sonarjs/no-small-switch": "warn",
    "sonarjs/no-unused-collection": "warn",
    "sonarjs/no-use-of-empty-return-value": "warn",
    "sonarjs/no-useless-catch": "warn",
    "sonarjs/prefer-immediate-return": "warn",
    "sonarjs/prefer-read-only-props": "warn",
    "sonarjs/prefer-single-boolean-return": "warn",
  },
});
