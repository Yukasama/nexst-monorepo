import { Catch, HttpStatus } from "@nestjs/common";
import type { ArgumentsHost } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import type { FastifyReply } from "fastify";
import { ErrorCode } from "#src/errors/error-code.enum.js";
import { Prisma } from "#src/generated/prisma/client.js";
import { ContextLogger } from "#src/logging/context-logger.js";

/**
 * Exception filter for handling Prisma database errors.
 *
 * This filter intercepts Prisma client errors and transforms them into
 * appropriate HTTP responses. It specifically handles known Prisma error
 * codes and maps them to corresponding HTTP status codes.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  constructor(private readonly logger: ContextLogger) {
    super();
  }

  /**
   * Catches and processes Prisma client errors.
   *
   * @param exception - The Prisma client error that was thrown
   * @param host - The arguments host containing request/response context
   */
  override catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    this.logger.error({ code: exception.code, error: exception.message }, "Prisma error");
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    if (exception.code === "P2002") {
      const status = HttpStatus.CONFLICT;
      const target = Array.isArray(exception.meta?.target) ? exception.meta.target : undefined;
      response.status(status).send({
        code: ErrorCode.CONFLICT,
        ...(target ? { params: { target } } : {}),
        statusCode: status,
      });
    } else {
      super.catch(exception, host);
    }
  }
}
