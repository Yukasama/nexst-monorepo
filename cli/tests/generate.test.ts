import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { generate, replaceTokens } from "../src/generate.js";

const templateDir = path.resolve(import.meta.dirname, "../../template");
let root: string | undefined;

afterEach(async () => {
  if (root) await rm(root, { force: true, recursive: true });
  root = undefined;
});

async function scaffold(features: { auth: boolean; r2: boolean; ui: boolean; worker: boolean }) {
  root = await mkdtemp(path.join(os.tmpdir(), "nexst-test-"));
  const targetDir = path.join(root, "my-app");
  await generate({
    domain: "my.dev",
    features,
    name: "my-app",
    owner: "acme",
    targetDir,
    templateDir,
  });
  return targetDir;
}

describe("replaceTokens", () => {
  it("replaces slug, SQL-safe slug, title, owner and domain", () => {
    const options = { domain: "my.dev", name: "my-app", owner: "acme" };
    expect(
      replaceTokens("@nexst/api nexst_user Nexst ghcr.io/your-org api.example.com", options),
    ).toBe("@my-app/api my_app_user My App ghcr.io/acme api.my.dev");
  });

  it("keeps the CLI's own name", () => {
    expect(replaceTokens("create-nexst-monorepo", { domain: "d", name: "x", owner: "o" })).toBe(
      "create-nexst-monorepo",
    );
  });
});

describe("generate", () => {
  it("removes every disabled feature's files, deps and messages", async () => {
    const dir = await scaffold({ auth: false, r2: false, ui: false, worker: false });

    expect(existsSync(path.join(dir, "apps/worker"))).toBe(false);
    expect(existsSync(path.join(dir, "packages/queues"))).toBe(false);
    expect(existsSync(path.join(dir, "apps/api/src/auth"))).toBe(false);
    expect(existsSync(path.join(dir, "apps/api/src/r2"))).toBe(false);
    expect(existsSync(path.join(dir, "apps/web/src/features/auth"))).toBe(false);
    expect(existsSync(path.join(dir, "apps/web/src/components/dialog"))).toBe(false);
    expect(existsSync(path.join(dir, "apps/web/src/components/button"))).toBe(true);

    const apiPkg = JSON.parse(await readFile(path.join(dir, "apps/api/package.json"), "utf8"));
    expect(apiPkg.name).toBe("@my-app/api");
    expect(apiPkg.dependencies["better-auth"]).toBeUndefined();
    expect(apiPkg.dependencies.bullmq).toBeUndefined();
    expect(apiPkg.dependencies["@aws-sdk/client-s3"]).toBeUndefined();

    const webPkg = JSON.parse(await readFile(path.join(dir, "apps/web/package.json"), "utf8"));
    expect(webPkg.dependencies["@radix-ui/react-dialog"]).toBeUndefined();
    expect(webPkg.dependencies.vaul).toBeUndefined();

    const messages = JSON.parse(
      await readFile(path.join(dir, "apps/web/messages/en.json"), "utf8"),
    );
    expect(messages.Auth).toBeUndefined();
    expect(messages.Home.cta).toBeUndefined();
    expect(messages.Common.cancel).toBeUndefined();
    expect(messages.Common.a11y.close).toBeUndefined();
    expect(messages.Common.a11y.showPassword).toBeDefined();

    const compose = await readFile(path.join(dir, "compose.yaml"), "utf8");
    expect(compose).not.toMatch(/redis|mailhog|@if/);
    expect(compose).toContain("my_app_user");
  });

  it("keeps enabled features and writes dev env files", async () => {
    const dir = await scaffold({ auth: true, r2: true, ui: true, worker: true });

    expect(existsSync(path.join(dir, "apps/worker/src/main.ts"))).toBe(true);
    const appModule = await readFile(path.join(dir, "apps/api/src/app.module.ts"), "utf8");
    expect(appModule).toContain("AuthModule.forRootAsync");
    expect(appModule).not.toContain("@if");
    expect(existsSync(path.join(dir, "apps/web/src/components/dialog/dialog.tsx"))).toBe(true);
    expect(existsSync(path.join(dir, "apps/web/src/features/auth/google-auth-button.tsx"))).toBe(
      true,
    );

    const env = await readFile(path.join(dir, "apps/api/.env.development"), "utf8");
    expect(env).toMatch(/^BETTER_AUTH_SECRET=(?!change-me).{40,}$/m);
  });
});
