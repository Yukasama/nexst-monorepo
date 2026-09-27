/** Payload apps/api enqueues on `EXAMPLE_QUEUE`. */
export type ExampleJob = {
  message: string;
  requestedAt: string;
};

/** What apps/worker returns once an `ExampleJob` is processed. */
export type ExampleJobResult = {
  processedAt: string;
  reversed: string;
};
