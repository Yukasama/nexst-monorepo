# worker (BullMQ)

Plain bun process (no NestJS) that consumes the queues apps/api enqueues. Queue names,
payload types and Redis connection options live in `packages/queues` — change them
there so producer and consumer stay in sync.

- Processors in `src/processors/` are pure functions of the job; unit-test them
  without Redis (`bun run test:unit`).
- `src/worker/worker.ts` wires processors to BullMQ; shutdown closes the worker before
  quitting Redis (`src/lib/graceful-shutdown.ts`).
- Deploy the worker before an API change that enqueues a new job shape.
