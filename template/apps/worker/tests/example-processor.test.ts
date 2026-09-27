import { describe, expect, it } from "vitest";
import { processExampleJob } from "#src/processors/example-processor.js";

describe("processExampleJob", () => {
  it("reverses the message and stamps the processing time", () => {
    const result = processExampleJob({
      data: { message: "hello", requestedAt: new Date(0).toISOString() },
    });

    expect(result.reversed).toBe("olleh");
    expect(Number.isNaN(Date.parse(result.processedAt))).toBe(false);
  });
});
