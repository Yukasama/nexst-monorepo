import { createGracefulShutdown } from "#src/lib/graceful-shutdown.js";
import { logger } from "#src/lib/logger.js";
import { redis } from "#src/worker/redis.js";
import { createWorker } from "#src/worker/worker.js";

const worker = createWorker(redis);
const gracefulShutdown = createGracefulShutdown(worker, redis);

const handleShutdown = (signal: string) => {
  void gracefulShutdown(signal).catch((error: unknown) => {
    logger.error({ error }, "Error during shutdown");
  });
};

process.once("SIGINT", () => handleShutdown("SIGINT"));

process.once("SIGTERM", () => handleShutdown("SIGTERM"));
