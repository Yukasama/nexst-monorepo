/**
 * Every machine-readable error code the API can return, over REST or GraphQL.
 *
 * Flat, no per-module namespacing: a duplicate failure thrown from two
 * modules (e.g. "user not found") collapses onto one member here. Every
 * call site throws {@link AppException} with one of these codes instead of
 * a free-text message; grows as new failure cases are added.
 */
export enum ErrorCode {
  /** Generic fallback for a 400 that carries no more specific code. */
  BAD_REQUEST = "BAD_REQUEST",

  /** Generic fallback for a 409 that carries no more specific code. */
  CONFLICT = "CONFLICT",

  // @if auth
  /** The user's email address is not verified. */
  EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",
  // @endif

  /** Generic fallback for a 403 that carries no more specific code. */
  FORBIDDEN = "FORBIDDEN",

  // @if auth
  /** The route requires a role the user does not have. */
  INSUFFICIENT_ROLE = "INSUFFICIENT_ROLE",
  // @endif

  /** Generic fallback for a 500 that carries no more specific code. */
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",

  /** Generic fallback for a 404 that carries no more specific code. */
  NOT_FOUND = "NOT_FOUND",

  // @if auth
  /** The request's underlying HTTP context could not be resolved. */
  REQUEST_CONTEXT_MISSING = "REQUEST_CONTEXT_MISSING",
  // @endif

  /** Generic fallback for a 503 that carries no more specific code. */
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  /** Generic fallback for a 429: the caller hit a rate limit and should retry. */
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",

  /** Generic fallback for a 401 that carries no more specific code. */
  UNAUTHORIZED = "UNAUTHORIZED",

  /** Generic fallback for a 422 that carries no more specific code. */
  UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY",

  /** One or more DTO fields failed class-validator validation. */
  VALIDATION_FAILED = "VALIDATION_FAILED",
}
