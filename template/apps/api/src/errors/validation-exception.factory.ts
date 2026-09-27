import { HttpStatus } from "@nestjs/common";
import type { ValidationError } from "@nestjs/common";
import { AppException } from "#src/errors/app.exception.js";
import { ErrorCode } from "#src/errors/error-code.enum.js";

interface FieldViolation {
  constraints: string[];
  field: string;
}

/**
 * `ValidationPipe`'s `exceptionFactory`: turns `class-validator`'s
 * `ValidationError[]` into a single {@link AppException}.
 *
 * `ValidationError.constraints` is already keyed by the constraint's own
 * machine-readable name (`isEmail`, `minLength`, …) — only its value is the
 * English default sentence, which this factory discards.
 *
 * @param errors - The validation errors `class-validator` produced
 * @returns An `AppException` carrying every violated field and rule
 */
export function validationExceptionFactory(errors: ValidationError[]): AppException {
  return new AppException(ErrorCode.VALIDATION_FAILED, HttpStatus.BAD_REQUEST, {
    violations: flatten(errors),
  });
}

/**
 * Flattens `class-validator`'s nested `ValidationError[]` (used by
 * `@ValidateNested()` DTOs) into dotted field paths.
 *
 * @param errors - The validation errors to flatten
 * @param prefix - The dotted field path accumulated so far
 * @returns One violation per invalid field, however deeply nested
 */
function flatten(errors: ValidationError[], prefix = ""): FieldViolation[] {
  return errors.flatMap((error) => {
    const field = prefix ? `${prefix}.${error.property}` : error.property;
    const own = error.constraints ? [{ constraints: Object.keys(error.constraints), field }] : [];
    const nested = error.children?.length ? flatten(error.children, field) : [];
    return [...own, ...nested];
  });
}
