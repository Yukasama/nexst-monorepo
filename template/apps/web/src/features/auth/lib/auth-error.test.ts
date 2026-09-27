import { describe, expect, it } from "vitest";
import type { AuthError } from "@/lib/auth-client";
import { authFallbackMessage } from "./auth-error";

describe("authFallbackMessage", () => {
  const t = (key: string) => `translated:${key}`;

  it("replaces the browser wording of a dropped connection with translated copy", () => {
    const error = new TypeError("NetworkError when attempting to fetch resource.");
    expect(authFallbackMessage(error as unknown as AuthError, t)).toBe("translated:networkError");
  });

  it("shows the server's message for any other failure", () => {
    const error: AuthError = { message: "Too many attempts", status: 429, statusText: "" };
    expect(authFallbackMessage(error, t)).toBe("Too many attempts");
  });

  it("falls back to the generic error when there is no message", () => {
    const error: AuthError = { status: 500, statusText: "" };
    expect(authFallbackMessage(error, t)).toBe("translated:defaultError");
  });
});
