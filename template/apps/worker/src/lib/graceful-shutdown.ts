import type { Worker } from "bullmq";
import type { Redis } from "ioredis";
import { logger } from "#src/lib/logger.js";

type ClosableWorker = Pick<Worker, "close">;
type QuitableRedis = Pick<Redis, "quit">;

export function createGracefulShutdown(worker: ClosableWorker, redis: QuitableRedis) {
  let shutdownPromise: Promise<void> | undefined;

  return (signal: string): Promise<void> => {
    if (shutdownPromise) {
      return shutdownPromise;
    }

    logger.info(`Received ${signal}, closing server...`);
    shutdownPromise = (async () => {
      try {
        await worker.close();
      } finally {
        await redis.quit();
      }
    })();

    return shutdownPromise;
  };
}
