import { readFileSync } from "node:fs";
import path from "node:path";
import { load } from "js-yaml";
import { z } from "zod";

const YamlSchema = z.object({
  app: z.object({
    description: z.string().min(1),
    title: z.string().min(1),
    version: z.string().default("0.1.0"),
  }),
  // @if auth
  mail: z.object({
    from: z.string().min(1).default("Nexst <no-reply@example.com>"),
    smtp: z
      .object({
        host: z.string().min(1).default("localhost"),
        port: z.coerce.number().int().min(1).max(65_535).default(1025),
      })
      .prefault({}),
  }),
  // @endif
  // @if r2
  r2: z.object({
    maxAttempts: z.coerce.number().int().positive().default(3),
    presignExpiresInSeconds: z.coerce.number().int().positive().default(3600),
    region: z.string().default("auto"),
  }),
  // @endif
  security: z.object({
    allowedHeaders: z.array(z.string()).default([]),
    allowedMethods: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]).array(),
    allowedOrigins: z.array(z.url()).default([]),
    credentials: z.coerce.boolean().default(true),
  }),
  swagger: z.object({
    path: z.string().default("api"),
    tags: z.array(z.string()).default([]),
  }),
});

const EnvironmentSchema = z.object({
  // @if auth
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters (Better Auth recommendation)"),
  BETTER_AUTH_URL: z.url("BETTER_AUTH_URL is required"),
  // @endif
  DATABASE_URL: z.url("DATABASE_URL is required"),
  // @if auth
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  MAIL_SMTP_HOST: z.string().min(1).optional(),
  // @endif
  // @if r2
  R2_ACCESS_KEY_ID: z.string().min(1, "R2_ACCESS_KEY_ID is required"),
  R2_BUCKET: z.string().min(1, "R2_BUCKET is required"),
  R2_ENDPOINT: z.url("R2_ENDPOINT is required"),
  R2_PUBLIC_URL: z.url().optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1, "R2_SECRET_ACCESS_KEY is required"),
  // @endif
  // @if worker
  REDIS_HOST: z.string().default("redis"),
  REDIS_PORT: z.coerce.number().min(1).max(65_535).default(6379),
  REDIS_RETRY_LIMIT: z.coerce.number().min(1).default(5),
  // @endif
  // @if auth
  RESEND_API_KEY: z.string().min(1).optional(),
  // @endif
});

const configFile = path.resolve(import.meta.dirname, "resources", "app.yaml");

export type AppConfig = ReturnType<typeof loadConfig>;

/**
 * Loads the static defaults from `resources/app.yaml` and the secrets and
 * per-environment values from `process.env`, validating both. Fails fast on
 * startup instead of at the first request that needs a missing value.
 */
export function loadConfig() {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const yaml = YamlSchema.parse(load(readFileSync(configFile, "utf8")));
  const env = EnvironmentSchema.parse(process.env);

  return {
    ...yaml,
    // @if auth
    auth: {
      baseUrl: env.BETTER_AUTH_URL,
      secret: env.BETTER_AUTH_SECRET,
    },
    // @endif
    db: {
      url: env.DATABASE_URL,
    },
    // @if auth
    mail: {
      from: yaml.mail.from,
      resendApiKey: env.RESEND_API_KEY,
      smtp: { ...yaml.mail.smtp, host: env.MAIL_SMTP_HOST ?? yaml.mail.smtp.host },
    },
    // @endif
    // @if r2
    r2: {
      ...yaml.r2,
      accessKeyId: env.R2_ACCESS_KEY_ID,
      bucket: env.R2_BUCKET,
      endpoint: env.R2_ENDPOINT,
      publicUrl: env.R2_PUBLIC_URL,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
    // @endif
    // @if worker
    redis: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      retryLimit: env.REDIS_RETRY_LIMIT,
    },
    // @endif
  };
}
