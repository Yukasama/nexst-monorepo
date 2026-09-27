import { vi } from "vitest";
import type { ContextLogger } from "#src/logging/context-logger.js";
import { ExampleQueueService } from "#src/queue/example-queue.service.js";

describe("exampleQueueService", () => {
  it("adds a retrying job with the message and returns its id", async () => {
    const add = vi.fn().mockResolvedValue({ id: "42" });
    const service = new ExampleQueueService(
      { add } as never,
      { debug: vi.fn() } as unknown as ContextLogger,
    );

    await expect(service.enqueue("hello")).resolves.toBe("42");

    expect(add).toHaveBeenCalledWith(
      "example",
      expect.objectContaining({ message: "hello" }),
      expect.objectContaining({ attempts: 3 }),
    );
  });
});
