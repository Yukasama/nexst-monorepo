import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { EXAMPLE_QUEUE } from "@nexst/queues";
import type { ExampleJob, ExampleJobResult } from "@nexst/queues";
import { Queue } from "bullmq";
import { ContextLogger } from "#src/logging/context-logger.js";

/**
 * Enqueues jobs for apps/worker. Replace the example payload with real work.
 */
@Injectable()
export class ExampleQueueService {
  constructor(
    @InjectQueue(EXAMPLE_QUEUE) private readonly queue: Queue<ExampleJob, ExampleJobResult>,
    private readonly logger: ContextLogger,
  ) {}

  /**
   * Adds one job and returns its id.
   *
   * @param message - Text the worker processes
   */
  async enqueue(message: string): Promise<string> {
    const job = await this.queue.add(
      "example",
      { message, requestedAt: new Date().toISOString() },
      { attempts: 3, backoff: { delay: 1000, type: "exponential" }, removeOnComplete: 100 },
    );
    this.logger.debug({ jobId: job.id }, "Example job enqueued");
    return job.id ?? "";
  }
}
