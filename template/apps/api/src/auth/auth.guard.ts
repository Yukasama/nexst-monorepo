import { HttpStatus, Injectable } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthService } from "@thallesp/nestjs-better-auth";
import { fromNodeHeaders } from "better-auth/node";
import type { AuthInstance } from "#src/auth/auth.js";
import { ALLOW_ANONYMOUS_KEY } from "#src/auth/decorator/allow-anonymous.decorator.js";
import { IS_EMAIL_VERIFIED_KEY } from "#src/auth/decorator/is-email-verified.decorator.js";
import { ROLES_KEY } from "#src/auth/decorator/roles.decorator.js";
import type { RequestWithSession, UserSession } from "#src/auth/types/auth.types.js";
import { AppException } from "#src/errors/app.exception.js";
import { ErrorCode } from "#src/errors/error-code.enum.js";
import type { UserRole } from "#src/generated/prisma/client.js";

/**
 * Single global authentication + authorization guard.
 *
 * Better Auth's own global guard is disabled (`disableGlobalAuthGuard: true`),
 * so this one guard both authenticates and authorizes — which guarantees
 * authentication runs *before* the app-specific checks, instead of relying on
 * the order two separate global guards happen to execute in.
 *
 * Flow:
 *
 * 1. Resolve the session and attach it — with the app's `customSession` fields —
 *    to `request.session`/`request.user`.
 * 2. `@AllowAnonymous()` routes stay reachable without a session (e.g. `/health`).
 *    Every other route requires a session (401 otherwise).
 * 3. Enforce email verification on `@IsEmailVerified()` routes.
 * 4. Enforce role membership on `@Roles(...)` routes.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService<AuthInstance>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.extractRequest(context);

    const session = (await this.authService.api.getSession({
      headers: fromNodeHeaders(request.headers),
    })) as null | UserSession;
    request.session = session;
    request.user = session?.user ?? null;

    if (this.requires(context, ALLOW_ANONYMOUS_KEY)) {
      return true;
    }

    if (!session) {
      throw new AppException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    if (this.requires(context, IS_EMAIL_VERIFIED_KEY) && !session.user.emailVerified) {
      throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED, HttpStatus.FORBIDDEN);
    }

    const requiredRoles = this.reflector.getAllAndOverride<undefined | UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredRoles?.length && !requiredRoles.some((role) => session.user.role.includes(role))) {
      throw new AppException(ErrorCode.INSUFFICIENT_ROLE, HttpStatus.FORBIDDEN);
    }

    return true;
  }

  /**
   * Extracts the request object from an HTTP or GraphQL execution context.
   */
  private extractRequest(context: ExecutionContext): RequestWithSession {
    if (context.getType<"graphql" | "http">() === "graphql") {
      return GqlExecutionContext.create(context).getContext<{
        req: RequestWithSession;
      }>().req;
    }

    const request = context.switchToHttp().getRequest<RequestWithSession | undefined>();
    if (!request) {
      throw new AppException(ErrorCode.REQUEST_CONTEXT_MISSING, HttpStatus.UNAUTHORIZED);
    }
    return request;
  }

  private requires(context: ExecutionContext, key: string): boolean {
    return (
      this.reflector.getAllAndOverride<boolean | undefined>(key, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false
    );
  }
}
