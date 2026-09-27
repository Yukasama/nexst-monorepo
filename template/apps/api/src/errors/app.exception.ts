import { HttpException } from "@nestjs/common";
import type { HttpStatus } from "@nestjs/common";
import type { ErrorCode } from "#src/errors/error-code.enum.js";

/** The exact shape `AppException#getResponse()` returns. */
export interface AppExceptionResponse {
  code: ErrorCode;
  message: ErrorCode;
  params?: ErrorParams;
  statusCode: HttpStatus;
}

/**
 * Structured, JSON-serializable interpolation data for a code. Left as
 * `unknown` values rather than restricted to primitives, since some codes
 * (e.g. `VALIDATION_FAILED`) carry a list of `{ field, constraints }`
 * objects rather than a flat key-value pair.
 */
export type ErrorParams = Record<string, unknown>;

/**
 * The one exception type application code throws for any expected,
 * user-facing failure — a missing record, a name conflict, an unauthorized
 * action. It carries a machine-readable `code` and optional structured
 * `params` for interpolation instead of an English sentence; the frontend
 * owns turning `code` + `params` into copy.
 *
 * The HTTP status is still chosen by the call site, exactly as with
 * `NotFoundException`/`ConflictException`/etc. — this class only removes
 * the free-text message, it does not change status semantics.
 *
 * `message` is set to the code string itself, not left for `HttpException`
 * to derive a title from the class name: every consumer that reads
 * `.message` (logs, `@nestjs/apollo`'s resolver-error unwrapping) should see
 * the code, never prose.
 */
export class AppException extends HttpException {
  readonly code: ErrorCode;
  readonly params?: ErrorParams;

  constructor(code: ErrorCode, status: HttpStatus, params?: ErrorParams) {
    const response: AppExceptionResponse = { code, message: code, params, statusCode: status };
    super(response, status);
    this.code = code;
    this.params = params;
  }
}
