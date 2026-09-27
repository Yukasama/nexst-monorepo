import { Catch, HttpException, HttpStatus } from "@nestjs/common";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { AppException } from "#src/errors/app.exception.js";
import { fallbackCodeForStatus } from "#src/errors/http-status-fallback-code.util.js";
import { ContextLogger } from "#src/logging/context-logger.js";
import { handleError } from "#src/utils/error-handler.util.js";

/**
 * Global exception filter that catches all unhandled exceptions in HTTP contexts.
 *
 * This filter provides a consistent error response format for all exceptions
 * that are not caught by more specific exception filters. It handles both
 * NestJS HttpExceptions and unexpected errors.
 */
@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: ContextLogger,
  ) {}

  /**
   * Catches and processes all exceptions.
   *
   * @param exception - The exception that was thrown (can be any type)
   * @param host - The arguments host containing request/response context
   *
   * @throws Re-throws the exception if the context is not HTTP
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== "http") {
      throw exception;
    }

    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException) || httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const url = httpAdapter.getRequestUrl(ctx.getRequest());
      this.logger.error(
        {
          error: handleError(exception),
          stack: exception instanceof Error ? exception.stack : undefined,
          url: String(url),
        },
        "Unhandled exception",
      );
    }

    const { code, params } =
      exception instanceof AppException
        ? { code: exception.code, params: exception.params }
        : { code: fallbackCodeForStatus(httpStatus), params: undefined };

    const responseBody = {
      code,
      ...(params ? { params } : {}),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
