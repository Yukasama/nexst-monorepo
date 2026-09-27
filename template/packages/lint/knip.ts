interface KnipConfigOverrides {
  entry?: string[];
  ignoreBinaries?: string[];
  ignoreDependencies?: string[];
  project?: string[];
  vitest?: true | { config: string[] };
}

const defaults = {
  ignoreBinaries: ["knip", "oxfmt", "oxlint", "tsc", "vitest"],
  ignoreDependencies: [
    "oxfmt",
    "oxlint",
    "vitest",
    "@vitest/coverage-v8",
    "pino-pretty",
  ],
  oxfmt: true as const,
  oxlint: true as const,
  project: ["src/**/*.{js,ts,tsx}", "tests/**/*.{js,ts,tsx}"],
  typescript: true as const,
  vitest: true as const,
};

export function createKnipConfig({
  entry = [],
  ignoreBinaries = [],
  ignoreDependencies = [],
  project = [],
  ...overrides
}: KnipConfigOverrides = {}) {
  return {
    ...defaults,
    ...overrides,
    ...(entry.length > 0 ? { entry } : {}),
    ignoreBinaries: [...defaults.ignoreBinaries, ...ignoreBinaries],
    ignoreDependencies: [...defaults.ignoreDependencies, ...ignoreDependencies],
    project: [...defaults.project, ...project],
  };
}
