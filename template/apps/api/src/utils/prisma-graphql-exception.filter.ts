import { Catch } from "@nestjs/common";
import type { GqlExceptionFilter } from "@nestjs/graphql";
import { GraphQLError } from "graphql";
import { ErrorCode } from "#src/errors/error-code.enum.js";
import { Prisma } from "#src/generated/prisma/client.js";
import { ContextLogger } from "#src/logging/context-logger.js";
import { handleError } from "#src/utils/error-handler.util.js";

/**
 * GraphQL exception filter for handling Prisma database errors in GraphQL contexts.
 *
 * This filter intercepts Prisma client errors that occur during GraphQL query/mutation
 * execution and transforms them into standardized GraphQL errors. It prevents sensitive
 * database information from being exposed to clients by returning generic error messages.
 */
@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientValidationError,
)
export class PrismaGraphQLExceptionFilter implements GqlExceptionFilter {
  constructor(readonly logger: ContextLogger) {}

  /**
   * Catches and processes Prisma errors in GraphQL context.
   *
   * @param exception - The Prisma error that was thrown
   * @returns A GraphQL error with sanitized error information
   */
  catch(exception: unknown) {
    this.logger.error(
      {
        error: handleError(exception),
        stack: exception instanceof Error ? exception.stack : undefined,
      },
      "Prisma error in GraphQL context",
    );

    return new GraphQLError(ErrorCode.INTERNAL_SERVER_ERROR, {
      extensions: { code: ErrorCode.INTERNAL_SERVER_ERROR },
    });
  }
}
