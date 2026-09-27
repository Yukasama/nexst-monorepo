import { InMemoryLRUCache } from "@apollo/utils.keyvaluecache";
import { ApolloDriver } from "@nestjs/apollo";
import type { ApolloDriverConfig } from "@nestjs/apollo";
import { Logger } from "@nestjs/common";
import type { GraphQLFormattedError } from "graphql";
import { depthLimit } from "#src/config/graphql-depth-limit.js";
import type { AppExceptionResponse } from "#src/errors/app.exception.js";
import { ErrorCode } from "#src/errors/error-code.enum.js";

const logger = new Logger("GraphQL");

/**
 * Reads back the structured payload `@nestjs/apollo` already attached.
 *
 * `ApolloBaseDriver.createTransformHttpErrorFn` unwraps any resolver-thrown
 * `HttpException` and republishes its `getResponse()` body under
 * `extensions.originalError` before this `formatError` runs — since
 * `AppException#getResponse()` already *is* `{ code, params, ... }`, this is
 * the single source of truth for both `message` and `extensions` below.
 *
 * @param formattedError - The error Apollo is about to send to the client
 * @returns The `AppException` payload, or `undefined` for anything else
 */
function readAppExceptionPayload(
  formattedError: GraphQLFormattedError,
): AppExceptionResponse | undefined {
  const original = formattedError.extensions?.originalError;
  return original && typeof original === "object" && "code" in original
    ? (original as AppExceptionResponse)
    : undefined;
}

export const graphqlConfig: ApolloDriverConfig = {
  autoSchemaFile: true,
  csrfPrevention: true,
  debug: process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test",
  driver: ApolloDriver,
  formatError: (formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError => {
    const appPayload = readAppExceptionPayload(formattedError);
    if (appPayload) {
      return {
        extensions: {
          code: appPayload.code,
          ...(appPayload.params ? { params: appPayload.params } : {}),
          statusCode: appPayload.statusCode,
        },
        locations: formattedError.locations,
        message: appPayload.code,
        path: formattedError.path,
      };
    }

    const originalError = error instanceof Error ? error : null;
    const message = originalError?.message ?? "";
    const isPrismaError = message.includes("Invalid `prisma") || message.includes("Argument `");

    if (isPrismaError) {
      logger.error("Prisma error:", originalError?.message);

      return {
        extensions: { code: ErrorCode.INTERNAL_SERVER_ERROR },
        message: ErrorCode.INTERNAL_SERVER_ERROR,
      };
    }

    return formattedError;
  },
  graphiql: process.env.NODE_ENV === "development",
  inheritResolversFromInterfaces: true,
  introspection: process.env.NODE_ENV !== "production",
  persistedQueries: {
    cache: new InMemoryLRUCache(),
    ttl: 300,
  },
  sortSchema: true,
  validationRules: [depthLimit(7)],
};
