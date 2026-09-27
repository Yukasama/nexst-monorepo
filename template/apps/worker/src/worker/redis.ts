import { createRedisConnectionOptions } from "@nexst/queues";
import { Redis } from "ioredis";
import { env } from "#src/env.js";
import { logger } from "#src/lib/logger.js";

export const redis = new Redis(
  createRedisConnectionOptions({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    retryLimit: env.REDIS_RETRY_LIMIT,
  }),
);

redis.on("connect", () => {
  logger.info("Connected to Redis");
});
redis.on("error", (error) => {
  logger.error({ error }, "Redis connection error");
});
