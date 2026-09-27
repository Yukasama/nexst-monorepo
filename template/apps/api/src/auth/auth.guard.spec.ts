import type { ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import type { AuthService } from "@thallesp/nestjs-better-auth";
import { vi } from "vitest";
import type { Mock } from "vitest";
import { AuthGuard } from "#src/auth/auth.guard.js";
import type { AuthInstance } from "#src/auth/auth.js";
import { ALLOW_ANONYMOUS_KEY } from "#src/auth/decorator/allow-anonymous.decorator.js";
import { IS_EMAIL_VERIFIED_KEY } from "#src/auth/decorator/is-email-verified.decorator.js";
import { ROLES_KEY } from "#src/auth/decorator/roles.decorator.js";
import { makeSession } from "#src/auth/testing/make-session.js";
import { ErrorCode } from "#src/errors/error-code.enum.js";
import { UserRole } from "#src/generated/prisma/client.js";

type AnyRequest = Record<string, unknown>;

const makeContext = (request: AnyRequest): ExecutionContext =>
  ({
    getClass: () => ({}),
    getHandler: () => ({}),
    getType: () => "http",
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe("authGuard", () => {
  let guard: AuthGuard;
  let reflector: { getAllAndOverride: Mock };

  const build = (session: unknown) => {
    const getSession = vi.fn().mockResolvedValue(session);
    const authService = { api: { getSession } } as unknown as AuthService<AuthInstance>;
    guard = new AuthGuard(reflector as unknown as Reflector, authService);
  };

  /** Marks metadata keys as present (as if the route carried their decorators). */
  const withMetadata = (metadata: Record<string, unknown>) =>
    reflector.getAllAndOverride.mockImplementation((key: string) => metadata[key]);

  beforeEach(() => {
    reflector = { getAllAndOverride: vi.fn().mockReturnValue(undefined) };
    build(makeSession());
  });

  it("rejects anonymous access to a protected route", async () => {
    build(null);

    await expect(guard.canActivate(makeContext({ headers: {} }))).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
  });

  it("allows @AllowAnonymous routes without a session", async () => {
    withMetadata({ [ALLOW_ANONYMOUS_KEY]: true });
    build(null);

    await expect(guard.canActivate(makeContext({ headers: {} }))).resolves.toBe(true);
  });

  it("attaches the resolved session to the request", async () => {
    const request: AnyRequest = { headers: {} };

    await guard.canActivate(makeContext(request));

    expect(request.user).toMatchObject({ id: "user-1" });
  });

  it("rejects an unverified email on @IsEmailVerified routes", async () => {
    withMetadata({ [IS_EMAIL_VERIFIED_KEY]: true });
    build(makeSession("user-1", { emailVerified: false }));

    await expect(guard.canActivate(makeContext({ headers: {} }))).rejects.toMatchObject({
      code: ErrorCode.EMAIL_NOT_VERIFIED,
    });
  });

  it("rejects a user without any of the @Roles", async () => {
    withMetadata({ [ROLES_KEY]: [UserRole.ADMIN] });

    await expect(guard.canActivate(makeContext({ headers: {} }))).rejects.toMatchObject({
      code: ErrorCode.INSUFFICIENT_ROLE,
    });
  });

  it("allows a user holding one of the @Roles", async () => {
    withMetadata({ [ROLES_KEY]: [UserRole.ADMIN] });
    build(makeSession("user-1", { role: [UserRole.USER, UserRole.ADMIN] }));

    await expect(guard.canActivate(makeContext({ headers: {} }))).resolves.toBe(true);
  });
});
