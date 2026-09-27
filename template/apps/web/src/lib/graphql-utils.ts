import { ClientError } from "graphql-request";
import { isNetworkError } from "./network-error";

export type ApiErrorParams = Record<string, unknown>;

/**
 * A backend failure, carrying the machine-readable `code` the API returns
 * (never prose) plus any structured `params` for interpolation.
 *
 * `message` mirrors `code` so anything that still reads `.message` sees the
 * code rather than blank text, but display code should go through
 * `apiErrorMessage` (backed by the `ApiErrors` next-intl namespace) instead of
 * showing `.message` directly.
 */
export class ApiError extends Error {
  readonly code?: string;
  readonly params?: ApiErrorParams;

  constructor(code?: string, params?: ApiErrorParams) {
    super(code ?? "UNKNOWN_ERROR");
    this.name = "ApiError";
    this.code = code;
    this.params = params;
  }
}

/**
 * Builds the `ApiError` a `graphql-request` failure carries. A request that
 * never reached the API gets the client-side `NETWORK_ERROR` code; anything
 * else without a response error is codeless.
 */
export function toApiError(error: unknown): ApiError {
  if (isNetworkError(error)) return new ApiError("NETWORK_ERROR");

  const first = error instanceof ClientError ? error.response.errors?.[0] : undefined;
  const code = first?.extensions?.code as string | undefined;
  const params = first?.extensions?.params as ApiErrorParams | undefined;
  return new ApiError(code, params);
}

/**
 * The API's `ErrorCode` values (plus the client-side `NETWORK_ERROR`) that have
 * their own copy in the `ApiErrors` namespace of `messages/*.json`. Anything else
 * falls back to `ApiErrors.defaultError`, so an unmapped code never shows a raw
 * translation key on screen.
 */
const TRANSLATED_ERROR_CODES = new Set([
  "BAD_REQUEST",
  "CONFLICT",
  "EMAIL_NOT_VERIFIED",
  "FORBIDDEN",
  "INSUFFICIENT_ROLE",
  "INTERNAL_SERVER_ERROR",
  "NETWORK_ERROR",
  "NOT_FOUND",
  "SERVICE_UNAVAILABLE",
  "TOO_MANY_REQUESTS",
  "UNAUTHORIZED",
  "UNPROCESSABLE_ENTITY",
  "VALIDATION_FAILED",
]);

/**
 * Translates an API error's `code` through the `ApiErrors` next-intl namespace,
 * falling back to `ApiErrors.defaultError`.
 *
 * @param t - `useTranslations("ApiErrors")` from the calling component
 * @param error - The error a mutation/query's `onError`/`error` carries
 */
export function apiErrorMessage(
  t: (key: string) => string,
  error: null | undefined | { code?: string },
): string {
  const code = error?.code;
  return code && TRANSLATED_ERROR_CODES.has(code) ? t(code) : t("defaultError");
}
