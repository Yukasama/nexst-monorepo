import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * `bun run codegen` — introspects the running API (or `CODEGEN_SCHEMA`) and
 * generates typed `graphql()` documents into src/generated/gql.
 */
const config: CodegenConfig = {
  documents: ["src/**/*.{ts,tsx}", "!src/generated/**"],
  generates: {
    "./src/generated/gql/": {
      config: {
        enumValues: "./schema-types",
        scalars: { DateTime: "string" },
      },
      preset: "client",
    },
    "./src/generated/gql/schema-types.ts": {
      config: {
        scalars: { DateTime: "string" },
      },
      plugins: ["typescript"],
    },
  },
  ignoreNoDocuments: true,
  schema:
    process.env.CODEGEN_SCHEMA ??
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/graphql`,
};

export default config;
