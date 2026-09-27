import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { GraphQLError } from "graphql";
import { vi } from "vitest";
import type { MockInstance } from "vitest";
import { ErrorCode } from "#src/errors/error-code.enum.js";
import { Prisma } from "#src/generated/prisma/client.js";
import { ContextLogger } from "#src/logging/context-logger.js";
import { PrismaGraphQLExceptionFilter } from "#src/utils/prisma-graphql-exception.filter.js";

describe("prismaGraphQLExceptionFilter", () => {
  let filter: PrismaGraphQLExceptionFilter;
  let loggerErrorSpy: MockInstance;

  beforeEach(async () => {
    const mockLogger = { debug: vi.fn(), error: vi.fn(), setContext: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaGraphQLExceptionFilter, { provide: ContextLogger, useValue: mockLogger }],
    }).compile();

    filter = module.get<PrismaGraphQLExceptionFilter>(PrismaGraphQLExceptionFilter);
    loggerErrorSpy = mockLogger.error;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("catch", () => {
    it("should handle PrismaClientKnownRequestError and return GraphQLError", () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed on the fields: (`email`)",
        {
          clientVersion: "5.0.0",
          code: "P2002",
        },
      );

      const result = filter.catch(prismaError);

      expect(result).toBeInstanceOf(GraphQLError);
      expect(result.message).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(result.extensions?.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { error: prismaError.message, stack: prismaError.stack },
        "Prisma error in GraphQL context",
      );
    });

    it("should handle PrismaClientUnknownRequestError and return GraphQLError", () => {
      const prismaError = new Prisma.PrismaClientUnknownRequestError("Unknown database error", {
        clientVersion: "5.0.0",
      });

      const result = filter.catch(prismaError);

      expect(result).toBeInstanceOf(GraphQLError);
      expect(result.message).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(result.extensions?.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { error: prismaError.message, stack: prismaError.stack },
        "Prisma error in GraphQL context",
      );
    });

    it("should handle PrismaClientValidationError and return GraphQLError", () => {
      const prismaError = new Prisma.PrismaClientValidationError(
        "Invalid query: missing required field",
        { clientVersion: "5.0.0" },
      );

      const result = filter.catch(prismaError);

      expect(result).toBeInstanceOf(GraphQLError);
      expect(result.message).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(result.extensions?.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { error: prismaError.message, stack: prismaError.stack },
        "Prisma error in GraphQL context",
      );
    });

    it("should log error message and stack for Error instances", () => {
      const error = new Error("Test error message");

      filter.catch(error);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { error: "Test error message", stack: error.stack },
        "Prisma error in GraphQL context",
      );
    });

    it("should log string representation for non-Error exceptions", () => {
      const exception = { someProperty: "some value" };

      filter.catch(exception);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { error: "[object Object]", stack: undefined },
        "Prisma error in GraphQL context",
      );
    });

    it("should log for null exceptions", () => {
      filter.catch(null);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { error: "null", stack: undefined },
        "Prisma error in GraphQL context",
      );
    });

    it("should log for undefined exceptions", () => {
      filter.catch(undefined);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { error: "undefined", stack: undefined },
        "Prisma error in GraphQL context",
      );
    });

    it("should always return same GraphQLError structure", () => {
      const error1 = new Prisma.PrismaClientKnownRequestError("Error 1", {
        clientVersion: "5.0.0",
        code: "P2002",
      });
      const error2 = new Prisma.PrismaClientValidationError("Error 2", {
        clientVersion: "5.0.0",
      });

      const result1 = filter.catch(error1);
      const result2 = filter.catch(error2);

      expect(result1.message).toBe(result2.message);
      expect(result1.extensions?.code).toBe(result2.extensions?.code);
    });

    it("should handle PrismaClientKnownRequestError with P2025 code", () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record to delete does not exist",
        {
          clientVersion: "5.0.0",
          code: "P2025",
        },
      );

      const result = filter.catch(prismaError);

      expect(result).toBeInstanceOf(GraphQLError);
      expect(result.message).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(loggerErrorSpy).toHaveBeenCalled();
    });

    it("should handle PrismaClientKnownRequestError with P2003 code", () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Foreign key constraint failed",
        {
          clientVersion: "5.0.0",
          code: "P2003",
        },
      );

      const result = filter.catch(prismaError);

      expect(result).toBeInstanceOf(GraphQLError);
      expect(result.message).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { error: prismaError.message, stack: prismaError.stack },
        "Prisma error in GraphQL context",
      );
    });

    it("should not expose internal error details in GraphQL response", () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Sensitive database information: user_id=123, password=secret",
        {
          clientVersion: "5.0.0",
          code: "P2002",
        },
      );

      const result = filter.catch(prismaError);

      expect(result.message).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(result.message).not.toContain("Sensitive");
      expect(result.message).not.toContain("password");
      expect(result.message).not.toContain("user_id");
    });

    it("should handle string exceptions", () => {
      const stringException = "Simple string error";

      const result = filter.catch(stringException);

      expect(result).toBeInstanceOf(GraphQLError);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { error: "Simple string error", stack: undefined },
        "Prisma error in GraphQL context",
      );
    });

    it("should handle number exceptions", () => {
      const numberException = 404;

      const result = filter.catch(numberException);

      expect(result).toBeInstanceOf(GraphQLError);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { error: "404", stack: undefined },
        "Prisma error in GraphQL context",
      );
    });
  });
});
