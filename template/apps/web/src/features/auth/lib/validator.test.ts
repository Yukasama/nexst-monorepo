import { describe, expect, it } from "vitest";
import { createSignInSchema, createSignUpSchema } from "./validator";

const t = (key: string) => key;

describe("createSignUpSchema", () => {
  const valid = {
    confirmPassword: "long-enough",
    email: "user@example.com",
    name: "Ada",
    password: "long-enough",
  };

  it("accepts a complete sign-up", () => {
    expect(createSignUpSchema(t).safeParse(valid).success).toBe(true);
  });

  it("rejects mismatched passwords on the confirmation field", () => {
    const result = createSignUpSchema(t).safeParse({ ...valid, confirmPassword: "different" });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({
      message: "Auth.Errors.passwordsMustMatch",
      path: ["confirmPassword"],
    });
  });

  it("rejects short passwords", () => {
    const result = createSignUpSchema(t).safeParse({
      ...valid,
      confirmPassword: "short",
      password: "short",
    });

    expect(result.error?.issues.map((issue) => issue.message)).toContain(
      "Auth.Errors.passwordTooShort",
    );
  });
});

describe("createSignInSchema", () => {
  it("requires a valid email", () => {
    expect(createSignInSchema(t).safeParse({ email: "nope", password: "x" }).success).toBe(false);
  });
});
