import { describe, expect, it, vi } from "vitest";
import { createGracefulShutdown } from "#src/lib/graceful-shutdown.js";

vi.mock("#src/lib/logger.js", () => ({
  logger: {
    info: vi.fn(),
  },
}));

describe("createGracefulShutdown", () => {
  it("shares one shutdown when multiple signals arrive", async () => {
    let finishWorkerClose!: () => void;
    const workerClose = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishWorkerClose = resolve;
        }),
    );
    const redisQuit = vi.fn().mockResolvedValue("OK");
    const shutdown = createGracefulShutdown({ close: workerClose }, { quit: redisQuit });

    const firstShutdown = shutdown("SIGINT");
    const secondShutdown = shutdown("SIGINT");

    expect(secondShutdown).toBe(firstShutdown);
    expect(workerClose).toHaveBeenCalledOnce();
    expect(redisQuit).not.toHaveBeenCalled();

    finishWorkerClose();
    await firstShutdown;

    expect(redisQuit).toHaveBeenCalledOnce();
  });
});
