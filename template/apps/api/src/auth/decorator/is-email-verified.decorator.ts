import { SetMetadata } from "@nestjs/common";

export const IS_EMAIL_VERIFIED_KEY = "auth:is-email-verified";

/**
 * Decorator to require email verification for route access.
 *
 * When applied, the AuthGuard checks `session.user.emailVerified` from
 * Better Auth and rejects the request if the email is not verified.
 *
 * @example
 * ```typescript
 * @IsEmailVerified()
 * @Mutation(() => Boolean)
 * publish(@Session() session: UserSession) {
 *   ...
 * }
 * ```
 */
export const IsEmailVerified = () => SetMetadata(IS_EMAIL_VERIFIED_KEY, true);
