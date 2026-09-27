import { HttpStatus } from "@nestjs/common";
import { ErrorCode } from "#src/errors/error-code.enum.js";

const STATUS_FALLBACK_CODE: Partial<Record<HttpStatus, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.BAD_REQUEST,
  [HttpStatus.CONFLICT]: ErrorCode.CONFLICT,
  [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
  [HttpStatus.SERVICE_UNAVAILABLE]: ErrorCode.SERVICE_UNAVAILABLE,
  [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.TOO_MANY_REQUESTS,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
  [HttpStatus.UNPROCESSABLE_ENTITY]: ErrorCode.UNPROCESSABLE_ENTITY,
};

/**
 * Maps an HTTP status to a generic {@link ErrorCode} fallback.
 *
 * Used when an exception reaching a filter is not an {@link AppException} —
 * a third-party exception, or a call site not yet migrated — so the response
 * never falls back to free text even outside this rewrite's own call sites.
 *
 * @param status - The HTTP status the response will carry
 * @returns The generic code for that status, or `INTERNAL_SERVER_ERROR`
 */
export function fallbackCodeForStatus(status: HttpStatus): ErrorCode {
  return STATUS_FALLBACK_CODE[status] ?? ErrorCode.INTERNAL_SERVER_ERROR;
}
