import type { ExampleJob, ExampleJobResult } from "@nexst/queues";
import type { Job } from "bullmq";

/**
 * Handles one `EXAMPLE_QUEUE` job. Replace with real work — keep processors
 * pure functions of the job so they stay unit-testable without Redis.
 */
export function processExampleJob(job: Pick<Job<ExampleJob>, "data">): ExampleJobResult {
  return {
    processedAt: new Date().toISOString(),
    reversed: Array.from(new Intl.Segmenter().segment(job.data.message), (part) => part.segment)
      .toReversed()
      .join(""),
  };
}
