import { describe, expect, it } from "vitest";
import { isNetworkError } from "./network-error";

describe("isNetworkError", () => {
  it.each([
    ["Firefox", "NetworkError when attempting to fetch resource."],
    ["Chromium", "Failed to fetch"],
    ["Safari", "Load failed"],
    ["Node", "fetch failed"],
  ])("recognises the %s wording of a failed fetch", (_engine, message) => {
    expect(isNetworkError(new TypeError(message))).toBe(true);
  });

  it("ignores a TypeError that is not a failed request", () => {
    expect(
      isNetworkError(new TypeError("Cannot read properties of undefined (reading 'id')")),
    ).toBe(false);
  });

  it("ignores an error that merely carries the same text", () => {
    expect(isNetworkError(new Error("Failed to fetch"))).toBe(false);
    expect(isNetworkError({ message: "Failed to fetch" })).toBe(false);
  });

  it("ignores values that are not errors at all", () => {
    expect(isNetworkError(null)).toBe(false);
    expect(isNetworkError(undefined)).toBe(false);
    expect(isNetworkError("Failed to fetch")).toBe(false);
  });
});
