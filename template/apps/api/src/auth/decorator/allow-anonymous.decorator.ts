import { SetMetadata } from "@nestjs/common";

/**
 * Metadata key that marks a route as public. Same `"PUBLIC"` string the library's
 * `@AllowAnonymous()` uses; kept as a named constant here because the library
 * does not export it and {@link AuthGuard} needs to read it.
 */
export const ALLOW_ANONYMOUS_KEY = "PUBLIC";

/**
 * Allows unauthenticated (anonymous) access to a route or controller.
 *
 * Local wrapper over the library's `@AllowAnonymous()` that sets
 * {@link ALLOW_ANONYMOUS_KEY}. The library's own global guard is disabled
 * (`disableGlobalAuthGuard: true`), so {@link AuthGuard} enforces this.
 */
export const AllowAnonymous = () => SetMetadata(ALLOW_ANONYMOUS_KEY, true);
