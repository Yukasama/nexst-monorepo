import { createKnipConfig } from "@nexst/lint/knip";
import type { KnipConfig } from "knip";

const config: KnipConfig = createKnipConfig({
  // API clients are template infrastructure: keep them until the first query uses them.
  entry: ["src/lib/graphql-client.ts", "src/lib/graphql-server.ts"],
  project: ["src/**/*.{css,mdx}"],
});

export default config;
