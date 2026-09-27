import { handleError } from "#src/utils/error-handler.util.js";

describe("handleError", () => {
  it("should return error message for Error instances", () => {
    const error = new Error("Test error");

    expect(handleError(error)).toBe("Test error");
  });

  it("should convert non-Error objects to string", () => {
    expect(handleError("string error")).toBe("string error");
    expect(handleError(123)).toBe("123");
    expect(handleError({ message: "object" })).toBe("[object Object]");
  });

  it("should handle null and undefined", () => {
    expect(handleError(null)).toBe("null");
    expect(handleError(undefined)).toBe("undefined");
  });
});
