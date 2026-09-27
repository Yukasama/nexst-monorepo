import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  runtimeEnv: process.env,
  server: {
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
    REDIS_HOST: z.string().min(1).default("redis"),
    REDIS_PORT: z.coerce.number().min(1).max(65_535).default(6379),
    REDIS_RETRY_LIMIT: z.coerce.number().min(1).default(5),
    WORKER_CONCURRENCY: z.coerce.number().int().min(1).optional(),
  },
});
