import { randomUUID } from "node:crypto";
import { API_URL, graphql } from "#tests/helpers/api.js";

/**
 * Needs the API running with NODE_ENV=test so sign-up skips the verification
 * mail (see `buildBaseAuthOptions`).
 */
describe("auth (e2e)", () => {
  const email = `e2e-${randomUUID()}@example.com`;
  const password = "correct-horse-battery-staple";

  async function signUp(): Promise<string> {
    const response = await fetch(`${API_URL}/api/auth/sign-up/email`, {
      body: JSON.stringify({ email, name: "E2E", password }),
      headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" },
      method: "POST",
    });
    expect(response.status).toBe(200);
    return response.headers.getSetCookie().join("; ");
  }

  it("rejects `me` without a session", async () => {
    const { errors } = await graphql("query { me { id } }");

    expect(errors?.[0]?.extensions?.code).toBe("UNAUTHORIZED");
  });

  it("signs up and resolves `me` from the session cookie", async () => {
    const cookie = await signUp();

    const { data, errors } = await graphql<{ me: { email: string } }>("query { me { email } }", {
      cookie,
    });

    expect(errors).toBeUndefined();
    expect(data?.me.email).toBe(email);
  });
});
