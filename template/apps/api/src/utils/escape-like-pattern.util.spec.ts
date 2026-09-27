import { escapeLikePattern } from "#src/utils/escape-like-pattern.util.js";

describe("escapeLikePattern", () => {
  it("should escape percent signs", () => {
    expect(escapeLikePattern("100%")).toBe("100\\%");
  });

  it("should escape underscores", () => {
    expect(escapeLikePattern("TU_Berlin")).toBe("TU\\_Berlin");
  });

  it("should escape backslashes", () => {
    expect(escapeLikePattern("a\\b")).toBe("a\\\\b");
  });

  it("should escape mixed metacharacters without double-escaping", () => {
    expect(escapeLikePattern("%%%%")).toBe("\\%\\%\\%\\%");
    expect(escapeLikePattern("____")).toBe("\\_\\_\\_\\_");
    expect(escapeLikePattern("100%_off\\now")).toBe("100\\%\\_off\\\\now");
  });

  it("should leave plain strings unchanged", () => {
    expect(escapeLikePattern("Karlsruhe")).toBe("Karlsruhe");
  });

  it("should handle an empty string", () => {
    expect(escapeLikePattern("")).toBe("");
  });
});
