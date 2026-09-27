import { createKnipConfig } from "@nexst/lint/knip";
import type { KnipConfig } from "knip";

const config: KnipConfig = createKnipConfig({
  entry: [
    // API clients are template infrastructure: keep them until the first query uses them.
    "src/lib/graphql-client.ts",
    "src/lib/graphql-server.ts",
    // The UI kit is a library: components stay exported until the app uses them.
    "src/components/**/*.tsx", // @if ui
  ],
  project: ["src/**/*.{css,mdx}"],
});

export default config;
