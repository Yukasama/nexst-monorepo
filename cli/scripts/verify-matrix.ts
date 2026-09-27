/**
 * Generates every feature combination into a temp dir and runs the generated
 * project's own checks (install, prisma generate, typecheck, lint, format,
 * knip, unit tests). Slow; run before releasing a template change.
 *
 *   bun scripts/verify-matrix.ts            # all 8 combinations
 *   bun scripts/verify-matrix.ts auth,r2    # just one (comma list of enabled features)
 */
import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { FEATURE_NAMES, type FeatureName } from "../src/features.js";
import { generate } from "../src/generate.js";

const templateDir = path.resolve(import.meta.dirname, "../../template");

function combinations(): Record<FeatureName, boolean>[] {
  const only = process.argv[2];
  if (only !== undefined) {
    const on = new Set(only.split(",").filter(Boolean));
    return [Object.fromEntries(FEATURE_NAMES.map((f) => [f, on.has(f)])) as Record<FeatureName, boolean>];
  }
  return Array.from({ length: 2 ** FEATURE_NAMES.length }, (_, mask) =>
    Object.fromEntries(FEATURE_NAMES.map((f, i) => [f, Boolean(mask & (1 << i))])) as Record<FeatureName, boolean>,
  );
}

function step(cwd: string, command: string): boolean {
  const result = spawnSync("sh", ["-c", command], { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    console.error(`    ✗ ${command}\n${result.stdout}\n${result.stderr}`.slice(0, 8000));
    return false;
  }
  console.log(`    ✓ ${command}`);
  return true;
}

const failures: string[] = [];
for (const features of combinations()) {
  const label = FEATURE_NAMES.filter((f) => features[f]).join("+") || "none";
  console.log(`\n▶ ${label}`);
  const root = await mkdtemp(path.join(os.tmpdir(), "nexst-matrix-"));
  const targetDir = path.join(root, "matrix-app");
  await generate({ domain: "matrix.dev", features, name: "matrix-app", owner: "acme", targetDir, templateDir });

  const ok = [
    "bun install",
    "cd apps/api && bunx --bun prisma generate",
    "bun run fmt",
    "bunx turbo run lint:ts --continue",
    "bunx turbo run lint fmt:check --continue",
    "bunx turbo run unused --continue",
    "cd apps/api && bun run test:unit && bun run lint:error-codes",
    "cd apps/web && bunx vitest run --project unit",
    ...(features.worker ? ["cd apps/worker && bun run test:unit"] : []),
    "! grep -rIn --exclude-dir=node_modules --exclude=bun.lock -E '@(if|endif)\\b|nexst' . | grep -v create-nexst-monorepo",
  ].every((command) => step(targetDir, command));

  if (ok) await rm(root, { force: true, recursive: true });
  else failures.push(`${label} (kept at ${targetDir})`);
}

if (failures.length > 0) {
  console.error(`\nFailed:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log("\nAll combinations passed.");
