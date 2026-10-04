import type { FeatureName } from "./features.js";

/**
 * Values the CLI requires at init. Secrets only go into the generated, git-ignored
 * `.env` files; the R2 account ID also fills the (public) R2 endpoint URL.
 */
export type CredentialSpec = {
  /** Only asked for when this feature is enabled. */
  feature?: FeatureName;
  flag: string;
  /** Shown when the value does not match `pattern`. */
  hint: string;
  label: string;
  /** Masked prompt input. */
  masked?: boolean;
  name: string;
  pattern: RegExp;
};

// Safe to write unquoted into .env files (no spaces, quotes, `$` or `#`).
const TOKEN = { hint: "Letters, digits, '.', '-' and '_' only", pattern: /^[\w.-]+$/ };

/** In prompt order. */
export const CREDENTIALS = [
  {
    flag: "db-password",
    // Written single-quoted into .env, URL-encoded into DATABASE_URL.
    hint: "No spaces or single quotes",
    label: "Postgres password (local dev database)",
    masked: true,
    name: "dbPassword",
    pattern: /^[^\s']+$/,
  },
  {
    feature: "auth",
    flag: "google-client-id",
    hint: "Expected <id>.apps.googleusercontent.com",
    label: "Google OAuth client ID",
    name: "googleClientId",
    pattern: /^[\w.-]+\.apps\.googleusercontent\.com$/,
  },
  {
    feature: "auth",
    flag: "google-client-secret",
    label: "Google OAuth client secret",
    masked: true,
    name: "googleClientSecret",
    ...TOKEN,
  },
  {
    feature: "r2",
    flag: "r2-account-id",
    hint: "Expected the 32-character hex Cloudflare account ID",
    label: "Cloudflare account ID",
    name: "r2AccountId",
    pattern: /^[\da-f]{32}$/i,
  },
  {
    feature: "r2",
    flag: "r2-access-key-id",
    label: "R2 access key ID",
    name: "r2AccessKeyId",
    ...TOKEN,
  },
  {
    feature: "r2",
    flag: "r2-secret-access-key",
    label: "R2 secret access key",
    masked: true,
    name: "r2SecretAccessKey",
    ...TOKEN,
  },
] as const satisfies readonly CredentialSpec[];

export type Credentials = Partial<Record<(typeof CREDENTIALS)[number]["name"], string>>;

export function validateCredential(
  spec: CredentialSpec,
  value: string | undefined,
): string | undefined {
  if (!value) return "Required";
  return spec.pattern.test(value) ? undefined : spec.hint;
}
