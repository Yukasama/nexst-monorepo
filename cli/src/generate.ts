import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { cp, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { FEATURE_NAMES, FEATURES, type FeatureName } from "./features.js";
import { applyMarkers, type Features, hasMarkers } from "./markers.js";

export type GenerateOptions = {
  /** Registry owner for ghcr.io images, e.g. a GitHub user or org. */
  owner: string;
  /** Production domain; the web app runs on it, the API on `api.<domain>`. */
  domain: string;
  features: Record<FeatureName, boolean>;
  /** Package scope / slug, e.g. `my-app`. */
  name: string;
  targetDir: string;
  templateDir: string;
};

/** Paths never copied from the template (build output, caches, local state). */
const SKIP = new Set([
  ".env",
  ".env.development",
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "storybook-static",
  "test-results",
]);

const BINARY = /\.(?:png|jpe?g|gif|webp|ico|woff2?|ttf|pdf|zip)$/i;

export const NAME_PATTERN = /^[a-z][a-z0-9-]*[a-z0-9]$/;

export function toTitle(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Replaces the template's placeholder tokens: `nexst` (slug), `nexst_` (SQL-safe
 * slug), `Nexst` (display name), `your-org`, `example.com`.
 */
export function replaceTokens(text: string, options: Pick<GenerateOptions, "domain" | "name" | "owner">) {
  const snake = options.name.replaceAll("-", "_");
  return text
    .replaceAll("create-nexst-monorepo", "\u0000CLI\u0000")
    .replaceAll("nexst_", `${snake}_`)
    .replaceAll("Nexst", toTitle(options.name))
    .replaceAll("nexst", options.name)
    .replaceAll("your-org", options.owner)
    .replaceAll("example.com", options.domain)
    .replaceAll("\u0000CLI\u0000", "create-nexst-monorepo");
}

export async function generate(options: GenerateOptions): Promise<void> {
  if (!NAME_PATTERN.test(options.name)) {
    throw new Error(`Invalid project name "${options.name}" (lowercase letters, digits, dashes)`);
  }
  if (existsSync(options.targetDir) && (await readdir(options.targetDir)).length > 0) {
    throw new Error(`${options.targetDir} already exists and is not empty`);
  }

  await mkdir(options.targetDir, { recursive: true });
  await cp(options.templateDir, options.targetDir, {
    filter: (source) => !SKIP.has(path.basename(source)) && !source.endsWith(".tsbuildinfo"),
    recursive: true,
  });

  // npm strips .gitignore from published packages, so the packed template ships _gitignore.
  for (const file of await walk(options.targetDir)) {
    if (path.basename(file) === "_gitignore") {
      await rename(file, path.join(path.dirname(file), ".gitignore"));
    }
  }

  const disabled = FEATURE_NAMES.filter((feature) => !options.features[feature]);
  for (const feature of disabled) {
    await removeFeature(options.targetDir, feature);
  }

  const allOn: Features = Object.fromEntries(FEATURE_NAMES.map((feature) => [feature, true]));
  for (const file of await walk(options.targetDir)) {
    if (BINARY.test(file) || path.basename(file) === "bun.lock") {
      if (path.basename(file) === "bun.lock") {
        await writeFile(file, replaceTokens(await readFile(file, "utf8"), options));
      }
      continue;
    }
    const original = await readFile(file, "utf8");
    const resolved = hasMarkers(original)
      ? applyMarkers(original, options.features, allOn, path.relative(options.targetDir, file))
      : original;
    const replaced = replaceTokens(resolved, options);
    if (replaced !== original) await writeFile(file, replaced);
  }

  await writeEnvFiles(options);
}

async function removeFeature(root: string, feature: FeatureName): Promise<void> {
  const manifest = FEATURES[feature];

  for (const target of manifest.paths) {
    await rm(path.join(root, target), { force: true, recursive: true });
  }

  for (const [file, edits] of Object.entries(manifest.packages ?? {})) {
    const full = path.join(root, file);
    if (!existsSync(full)) continue;
    const pkg = JSON.parse(await readFile(full, "utf8")) as Record<string, Record<string, string>>;
    for (const [section, names] of Object.entries(edits) as [string, string[]][]) {
      for (const name of names) delete pkg[section]?.[name];
    }
    await writeFile(full, `${JSON.stringify(pkg, null, 2)}\n`);
  }

  for (const [file, keys] of Object.entries(manifest.jsonKeys ?? {})) {
    const full = path.join(root, file);
    if (!existsSync(full)) continue;
    const json = JSON.parse(await readFile(full, "utf8")) as Record<string, unknown>;
    for (const key of keys) deleteKey(json, key.split("."));
    await writeFile(full, `${JSON.stringify(json, null, 2)}\n`);
  }
}

function deleteKey(object: Record<string, unknown>, [head, ...rest]: string[]): void {
  if (rest.length === 0) {
    delete object[head];
    return;
  }
  const child = object[head];
  if (child && typeof child === "object") deleteKey(child as Record<string, unknown>, rest);
}

/** Turns every `.env.example` into the file bun loads in dev, with a fresh auth secret. */
async function writeEnvFiles(options: GenerateOptions): Promise<void> {
  const targets: Record<string, string> = {
    "apps/api": ".env.development",
    "apps/web": ".env",
    "apps/worker": ".env",
  };
  for (const [dir, envFile] of Object.entries(targets)) {
    const example = path.join(options.targetDir, dir, ".env.example");
    if (!existsSync(example)) continue;
    const content = (await readFile(example, "utf8")).replace(
      /^BETTER_AUTH_SECRET=.*$/m,
      `BETTER_AUTH_SECRET=${randomBytes(32).toString("base64")}`,
    );
    await writeFile(path.join(options.targetDir, dir, envFile), content);
  }
}

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : Promise.resolve([full]);
    }),
  );
  return files.flat();
}
