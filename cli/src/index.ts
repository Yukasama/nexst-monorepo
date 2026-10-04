#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, styleText } from "node:util";
import * as p from "@clack/prompts";
import {
  CREDENTIALS,
  type CredentialSpec,
  type Credentials,
  validateCredential,
} from "./credentials.js";
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

Credentials (asked for when missing; required with -y). Secrets only go into
the git-ignored .env files:
  --db-password <password>        Postgres password (local dev database)
  --google-client-id <id>         Google OAuth client ID       (with --auth)
  --google-client-secret <secret> Google OAuth client secret   (with --auth)
  --r2-account-id <id>            Cloudflare account ID        (with --r2)
  --r2-access-key-id <id>         R2 access key ID             (with --r2)
  --r2-secret-access-key <key>    R2 secret access key         (with --r2)
`;

function resolveTemplateDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // Published package: <pkg>/dist/index.js + <pkg>/template. Repo checkout: cli/src|dist + ../template.
  const candidates = [path.resolve(here, "../template"), path.resolve(here, "../../template")];
  const found = candidates.find((dir) => existsSync(path.join(dir, "turbo.json")));
  if (!found) throw new Error("Template directory not found next to the CLI");
  return found;
}

const BANNER = [
  "                      _   ",
  " _ __   _____  _____| |_ ",
  "| '_ \\ / _ \\ \\/ / __| __|",
  "| | | |  __/>  <\\__ \\ |_ ",
  "|_| |_|\\___/_/\\_\\___/\\__|",
];
const BANNER_COLORS = ["cyan", "cyan", "blue", "blue", "magenta"] as const;

function printBanner(version: string): void {
  const lines = BANNER.map((line, index) => styleText(["bold", BANNER_COLORS[index]], line));
  console.log(`\n${lines.join("\n")}\n`);
  console.log(styleText("dim", `  Next.js + NestJS monorepo · v${version}\n`));
}

function readVersion(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const pkg = JSON.parse(readFileSync(path.resolve(here, "../package.json"), "utf8")) as {
    version: string;
  };
  return pkg.version;
}

type Command = [command: string, args: string[], cwd: string];

// Runs asynchronously (so the spinner keeps animating) and captures output for failures.
function run([command, args, cwd]: Command): Promise<{ ok: boolean; output: string }> {
  return new Promise((resolve) => {
    let output = "";
    const child = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    child.stdout.on("data", (chunk: Buffer) => (output += chunk.toString()));
    child.stderr.on("data", (chunk: Buffer) => (output += chunk.toString()));
    child.on("error", (error) => resolve({ ok: false, output: error.message }));
    child.on("close", (code) => resolve({ ok: code === 0, output }));
  });
}

function elapsed(start: number): string {
  return styleText("dim", `(${((performance.now() - start) / 1000).toFixed(1)}s)`);
}

async function step(title: string, done: string, commands: Command[]): Promise<boolean> {
  const spinner = p.spinner();
  const start = performance.now();
  spinner.start(title);
  for (const command of commands) {
    const { ok, output } = await run(command);
    if (!ok) {
      spinner.error(`${title} failed: ${command[0]} ${command[1].join(" ")}`);
      const tail = output.trim().split("\n").slice(-20).join("\n");
      if (tail) p.log.message(styleText("dim", tail));
      return false;
    }
  }
  spinner.stop(`${done} ${elapsed(start)}`);
  return true;
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
      "db-password": { type: "string" },
      domain: { type: "string" },
      git: { default: true, type: "boolean" },
      "google-client-id": { type: "string" },
      "google-client-secret": { type: "string" },
      help: { short: "h", type: "boolean" },
      install: { default: true, type: "boolean" },
      owner: { type: "string" },
      r2: { type: "boolean" },
      "r2-access-key-id": { type: "string" },
      "r2-account-id": { type: "string" },
      "r2-secret-access-key": { type: "string" },
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
  printBanner(readVersion());
  p.intro(styleText(["bgCyan", "black"], " create-nexst-monorepo "));

  let directory = positionals[0];
  if (!directory) {
    if (!interactive)
      throw new Error("Pass a project directory, e.g. `create-nexst-monorepo my-app`");
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

  const credentials: Credentials = {};
  const missing: string[] = [];
  const needed = CREDENTIALS.filter(
    (spec: CredentialSpec) => !spec.feature || features[spec.feature],
  );
  if (interactive && needed.some((spec) => values[spec.flag] === undefined)) {
    p.log.info("Secrets are only written to the git-ignored .env files.");
  }
  for (const spec of needed) {
    let value = values[spec.flag];
    if (value === undefined && interactive) {
      const options = {
        message: spec.label,
        validate: (input?: string) => validateCredential(spec, input),
      };
      const answer = "masked" in spec ? await p.password(options) : await p.text(options);
      if (p.isCancel(answer)) cancelled();
      value = answer;
    }
    if (value === undefined) {
      missing.push(`--${spec.flag}`);
      continue;
    }
    const error = validateCredential(spec, value);
    if (error) throw new Error(`--${spec.flag}: ${error}`);
    credentials[spec.name] = value;
  }
  if (missing.length > 0) {
    throw new Error(`Missing ${missing.join(", ")} (pass them as flags or run without -y)`);
  }

  const relativeDir = path.relative(process.cwd(), targetDir) || ".";
  const spinner = p.spinner();
  const start = performance.now();
  spinner.start(`Creating ${name}`);
  await generate({
    credentials,
    domain: domain ?? "example.com",
    features,
    name,
    owner: owner ?? "your-org",
    targetDir,
    templateDir: resolveTemplateDir(),
  });
  spinner.stop(`Created ${relativeDir} ${elapsed(start)}`);

  let installed = false;
  if (values.install) {
    installed =
      (await step("Installing dependencies", "Installed dependencies", [
        ["bun", ["install"], targetDir],
      ])) &&
      (await step("Generating Prisma client", "Generated Prisma client", [
        ["bunx", ["--bun", "prisma", "generate"], path.join(targetDir, "apps/api")],
      ])) &&
      (await step("Formatting", "Formatted", [["bun", ["run", "fmt"], targetDir]]));
    if (!installed)
      p.log.warn("Setup did not finish; run `bun install` and `bun run fmt` yourself.");
  }

  if (values.git) {
    const ok = await step("Initializing git repository", "Initialized git repository", [
      ["git", ["init", "-q", "-b", "main"], targetDir],
      ["git", ["add", "-A"], targetDir],
      ["git", ["commit", "-q", "-m", "chore: scaffold with create-nexst-monorepo"], targetDir],
    ]);
    if (!ok) p.log.warn("Git setup skipped (git missing or no identity configured).");
  }

  const featureLines = FEATURE_NAMES.map((feature) =>
    features[feature]
      ? `${styleText("green", "✔")} ${FEATURES[feature].label}`
      : styleText("dim", `✖ ${FEATURES[feature].label}`),
  );
  p.note(featureLines.join("\n"), "Features");
  p.note(
    [
      `cd ${relativeDir}`,
      ...(installed ? [] : ["bun install"]),
      "(cd apps/api && bunx --bun prisma migrate deploy)",
      "bun dev",
    ]
      .map((line) => styleText("cyan", line))
      .join("\n"),
    "Next steps",
  );
  p.outro(`${styleText(["bold", "magenta"], "Happy building!")} 🚀`);
}

main().catch((error: unknown) => {
  p.log.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
