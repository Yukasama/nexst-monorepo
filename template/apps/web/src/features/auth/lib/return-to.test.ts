import { afterEach, describe, expect, it, vi } from "vitest";
import { getReturnTo } from "./return-to";

function stubLocation(search: string) {
  vi.stubGlobal("window", { location: { search } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getReturnTo", () => {
  it("returns undefined during SSR (no window)", () => {
    expect(getReturnTo()).toBeUndefined();
  });

  it("returns a clean relative path", () => {
    stubLocation("?returnTo=/dashboard");
    expect(getReturnTo()).toBe("/dashboard");
  });

  it("ignores a missing returnTo param", () => {
    stubLocation("?foo=bar");
    expect(getReturnTo()).toBeUndefined();
  });

  it("rejects protocol-relative URLs", () => {
    stubLocation("?returnTo=//evil.com");
    expect(getReturnTo()).toBeUndefined();
  });

  it("rejects backslash-smuggled URLs", () => {
    stubLocation("?returnTo=/\\evil.com");
    expect(getReturnTo()).toBeUndefined();
  });

  it("rejects absolute URLs", () => {
    stubLocation("?returnTo=https://evil.com");
    expect(getReturnTo()).toBeUndefined();
  });
});
