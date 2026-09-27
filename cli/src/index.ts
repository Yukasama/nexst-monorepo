#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import * as p from "@clack/prompts";
import { FEATURE_NAMES, FEATURES, type FeatureName } from "./features.js";
import { generate, NAME_PATTERN } from "./generate.js";

const HELP = `
Usage: create-nexst-monorepo [directory] [options]

Scaffolds a Next.js + NestJS monorepo (bun, turbo, oxlint, vitest, Playwright,
Prisma, Docker, kustomize, GitHub Actions).

Options:
  --auth / --no-auth       Better Auth: email + password, passkeys, Google (API and web)
  --r2 / --no-r2           Cloudflare R2 storage service
  --ui / --no-ui           Extra UI components (dialog, drawer, select, switch, tabs, …)
  --worker / --no-worker   BullMQ worker app + Redis
  --owner <name>           GitHub owner for ghcr.io images   (default: your-org)
  --domain <domain>        Production domain                  (default: example.com)
  --no-install             Skip bun install, formatting and prisma generate
  --no-git                 Skip git init and the initial commit
  -y, --yes                Accept defaults for everything not given as a flag
  -h, --help               Show this help
`;

function resolveTemplateDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // Published package: <pkg>/dist/index.js + <pkg>/template. Repo checkout: cli/src|dist + ../template.
  const candidates = [path.resolve(here, "../template"), path.resolve(here, "../../template")];
  const found = candidates.find((dir) => existsSync(path.join(dir, "turbo.json")));
  if (!found) throw new Error("Template directory not found next to the CLI");
  return found;
}

function run(command: string, args: string[], cwd: string): boolean {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  return result.status === 0;
}

function cancelled(): never {
  p.cancel("Cancelled.");
  process.exit(1);
}

async function main(): Promise<void> {
  const { positionals, values } = parseArgs({
    allowNegative: true,
    allowPositionals: true,
    options: {
      auth: { type: "boolean" },
      domain: { type: "string" },
      git: { default: true, type: "boolean" },
      help: { short: "h", type: "boolean" },
      install: { default: true, type: "boolean" },
      owner: { type: "string" },
      r2: { type: "boolean" },
      ui: { type: "boolean" },
      worker: { type: "boolean" },
      yes: { short: "y", type: "boolean" },
    },
  });

  if (values.help) {
    console.log(HELP);
    return;
  }

  const interactive = !values.yes && process.stdin.isTTY;
  p.intro("create-nexst-monorepo");

  let directory = positionals[0];
  if (!directory) {
    if (!interactive) throw new Error("Pass a project directory, e.g. `create-nexst-monorepo my-app`");
    const answer = await p.text({
      message: "Project name",
      placeholder: "my-app",
      validate: (value) =>
        value && NAME_PATTERN.test(value) ? undefined : "Lowercase letters, digits and dashes",
    });
    if (p.isCancel(answer)) cancelled();
    directory = answer;
  }

  const targetDir = path.resolve(directory);
  const name = path.basename(targetDir);
  if (!NAME_PATTERN.test(name)) {
    throw new Error(`"${name}" is not a valid name (lowercase letters, digits, dashes)`);
  }

  const features = {} as Record<FeatureName, boolean>;
  const unanswered = FEATURE_NAMES.filter((feature) => values[feature] === undefined);
  for (const feature of FEATURE_NAMES) features[feature] = values[feature] ?? true;

  if (interactive && unanswered.length > 0) {
    const picked = await p.multiselect({
      initialValues: [...unanswered],
      message: "Optional features (space to toggle)",
      options: unanswered.map((feature) => ({
        hint: FEATURES[feature].description,
        label: FEATURES[feature].label,
        value: feature,
      })),
      required: false,
    });
    if (p.isCancel(picked)) cancelled();
    for (const feature of unanswered) features[feature] = picked.includes(feature);
  }

  let owner = values.owner;
  if (!owner && interactive) {
    const answer = await p.text({
      initialValue: "your-org",
      message: "GitHub owner (images go to ghcr.io/<owner>/)",
    });
    if (p.isCancel(answer)) cancelled();
    owner = answer.toLowerCase();
  }

  let domain = values.domain;
  if (!domain && interactive) {
    const answer = await p.text({ initialValue: "example.com", message: "Production domain" });
    if (p.isCancel(answer)) cancelled();
    domain = answer;
  }

  const spinner = p.spinner();
  spinner.start(`Creating ${name}`);
  await generate({
    domain: domain ?? "example.com",
    features,
    name,
    owner: owner ?? "your-org",
    targetDir,
    templateDir: resolveTemplateDir(),
  });
  spinner.stop(`Created ${path.relative(process.cwd(), targetDir) || "."}`);

  if (values.install) {
    p.log.step("Installing dependencies");
    const ok =
      run("bun", ["install"], targetDir) &&
      run("bunx", ["--bun", "prisma", "generate"], path.join(targetDir, "apps/api")) &&
      run("bun", ["run", "fmt"], targetDir);
    if (!ok) p.log.warn("Setup did not finish; run `bun install` and `bun run fmt` yourself.");
  }

  if (values.git) {
    const ok =
      run("git", ["init", "-q", "-b", "main"], targetDir) &&
      run("git", ["add", "-A"], targetDir) &&
      run("git", ["commit", "-q", "-m", "chore: scaffold with create-nexst-monorepo"], targetDir);
    if (!ok) p.log.warn("Git setup skipped (git missing or no identity configured).");
  }

  const enabled = FEATURE_NAMES.filter((feature) => features[feature]).map(
    (feature) => FEATURES[feature].label,
  );
  p.note(
    [
      `cd ${path.relative(process.cwd(), targetDir) || "."}`,
      ...(values.install ? [] : ["bun install"]),
      "(cd apps/api && bunx --bun prisma migrate deploy)",
      "bun dev",
    ].join("\n"),
    `Features: ${enabled.length > 0 ? enabled.join(", ") : "none"}`,
  );
  p.outro("Done.");
}

main().catch((error: unknown) => {
  p.log.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
