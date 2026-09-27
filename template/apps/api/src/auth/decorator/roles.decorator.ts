import { SetMetadata } from "@nestjs/common";
import type { UserRole } from "#src/generated/prisma/client.js";

/**
 * Metadata key read by Better Auth's global AuthGuard to enforce role access.
 * Mirrors the `@Roles()` decorator from `@thallesp/nestjs-better-auth`.
 */
export const ROLES_KEY = "ROLES";

/**
 * Restricts a route to users holding at least one of the given {@link UserRole}s.
 * Roles are additive: a user matches if any of their roles is listed.
 *
 * A local wrapper over the library's `@Roles()`: it takes a variadic list of the
 * Prisma {@link UserRole} enum (rather than a `string[]`) and sets the same
 * `ROLES` metadata key. The library's own global guard is disabled
 * (`disableGlobalAuthGuard: true`), so the check is enforced by our
 * {@link AuthGuard}, which reads this key.
 *
 * @example
 * ```typescript
 * @Roles(UserRole.ADMIN)
 * @Mutation(() => Boolean)
 * purgeCache() { ... }
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
