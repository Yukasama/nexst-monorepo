import base, { baseIgnorePatterns } from "@nexst/lint/oxlint";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base],
  ignorePatterns: [...baseIgnorePatterns, "migrations/**/*", "src/generated/prisma/**"],
  overrides: [
    {
      files: ["**/*.spec.ts", "**/*.e2e-spec.ts", "tests/**"],
      rules: {
        "no-console": "off",
        "no-restricted-imports": "off",
        "security/detect-non-literal-fs-filename": "off",
        "sonarjs/no-duplicate-string": "off",
        "typescript/no-misused-spread": "off",
        "typescript/no-non-null-assertion": "off",
        "typescript/unbound-method": "off",
      },
    },
    {
      files: ["scripts/**"],
      rules: {
        "no-console": "off",
        "security/detect-non-literal-fs-filename": "off",
        "security/detect-unsafe-regex": "off",
        "sonarjs/cognitive-complexity": "off",
      },
    },
    {
      files: ["prisma/**"],
      rules: {
        "no-console": "off",
      },
    },
    {
      files: ["**/*-exception.filter.ts", "**/*-exception.filter.spec.ts"],
      rules: {
        "promise/valid-params": "off",
      },
    },
  ],
  rules: {
    eqeqeq: ["error", "always", { null: "ignore" }],
    "import/no-cycle": "error",
    "import/no-duplicates": "error",
    "import/no-self-import": "error",

    "no-console": "error",
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            message: "Prisma-Client immer aus #src/generated/prisma/client importieren.",
            name: "@prisma/client",
          },
          {
            importNames: [
              "BadRequestException",
              "ConflictException",
              "ForbiddenException",
              "InternalServerErrorException",
              "NotFoundException",
              "ServiceUnavailableException",
              "UnauthorizedException",
              "UnprocessableEntityException",
            ],
            message:
              "Codes-only API: throw `new AppException(ErrorCode.X, HttpStatus.Y, params?)` (see src/errors/app.exception.ts) instead of a free-text HttpException.",
            name: "@nestjs/common",
          },
        ],
      },
    ],

    "oxc/no-accumulating-spread": "warn",
    "oxc/no-map-spread": "warn",

    "typescript/await-thenable": "error",
    "typescript/no-base-to-string": "error",
    "typescript/no-confusing-void-expression": ["warn", { ignoreArrowShorthand: true }],
    "typescript/no-explicit-any": "warn",
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
    "typescript/no-non-null-assertion": "warn",
    "typescript/no-unnecessary-type-assertion": "warn",
    "typescript/prefer-nullish-coalescing": "warn",
    "typescript/prefer-optional-chain": "warn",
    "typescript/require-await": "warn",
    "typescript/restrict-plus-operands": "error",
    "typescript/return-await": ["error", "error-handling-correctness-only"],
    "typescript/switch-exhaustiveness-check": "warn",

    "unicorn/error-message": "error",
    "unicorn/prefer-node-protocol": "error",
    "unicorn/prefer-structured-clone": "warn",
    "unicorn/throw-new-error": "error",

    "vitest/expect-expect": "warn",
    "vitest/no-disabled-tests": "warn",
    "vitest/no-focused-tests": "error",
    "vitest/no-identical-title": "error",
    "vitest/require-mock-type-parameters": "off",
    "vitest/require-to-throw-message": "off",
    "vitest/valid-expect": "error",
  },
});
