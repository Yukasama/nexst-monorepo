import { HttpStatus, ParseUUIDPipe } from "@nestjs/common";
import type { ParseUUIDPipeOptions } from "@nestjs/common";
import { AppException } from "#src/errors/app.exception.js";
import { ErrorCode } from "#src/errors/error-code.enum.js";

/**
 * Drop-in replacement for `ParseUUIDPipe` that fails with an
 * {@link AppException} instead of the built-in pipe's hardcoded
 * "Validation failed (uuid is expected)" text.
 *
 * `ParseUUIDPipe` is instantiated directly at resolver/controller
 * parameters across the API and is not covered by the global
 * `ValidationPipe`'s `exceptionFactory` — this wrapper closes that gap with
 * the same `VALIDATION_FAILED` code and violation shape.
 *
 * @param options - The same options `ParseUUIDPipe` accepts
 * @returns A `ParseUUIDPipe` configured to throw codes-only on failure
 */
export function AppParseUUIDPipe(options?: ParseUUIDPipeOptions): ParseUUIDPipe {
  return new ParseUUIDPipe({
    ...options,
    exceptionFactory: () =>
      new AppException(ErrorCode.VALIDATION_FAILED, HttpStatus.BAD_REQUEST, {
        violations: [{ constraints: ["isUuid"], field: "id" }],
      }),
  });
}
