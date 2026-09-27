import { makeSession } from "#src/auth/testing/make-session.js";
import { UserRole } from "#src/generated/prisma/client.js";
import { UserResolver } from "#src/user/user.resolver.js";

describe("userResolver", () => {
  it("returns the session user as `me`", () => {
    const resolver = new UserResolver();

    const me = resolver.me(makeSession("user-42", { email: "me@example.com", name: "" }));

    expect(me).toMatchObject({
      email: "me@example.com",
      id: "user-42",
      name: null,
      role: [UserRole.USER],
    });
  });
});
