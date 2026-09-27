import os from "node:os";
import { EXAMPLE_QUEUE } from "@nexst/queues";
import type { ExampleJob, ExampleJobResult } from "@nexst/queues";
import type { Job } from "bullmq";
import { Worker } from "bullmq";
import type { Redis } from "ioredis";
import { env } from "#src/env.js";
import { logger } from "#src/lib/logger.js";
import { processExampleJob } from "#src/processors/example-processor.js";

const workerConcurrency = env.WORKER_CONCURRENCY ?? Math.max(4, os.cpus().length * 2);

export function createWorker(connection: Redis): Worker<ExampleJob, ExampleJobResult> {
  const worker = new Worker<ExampleJob, ExampleJobResult>(
    EXAMPLE_QUEUE,
    async (job: Job<ExampleJob>) => processExampleJob(job),
    {
      concurrency: workerConcurrency,
      connection,
      removeOnComplete: { age: 24 * 3600, count: 100 },
      removeOnFail: { count: 500 },
      stalledInterval: 30_000,
    },
  );

  worker.on("completed", (job: Job<ExampleJob>, result: ExampleJobResult) => {
    logger.info({ jobId: job.id, result }, "Job completed");
  });

  worker.on("failed", (job: Job<ExampleJob> | undefined, error: unknown) => {
    logger.error({ error: String(error), jobId: job?.id }, "Job failed");
  });

  logger.info({ concurrency: workerConcurrency, queue: EXAMPLE_QUEUE }, "Worker started");

  return worker;
}
