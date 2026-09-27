import type { ArgumentsHost } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { vi } from "vitest";
import type { Mock, MockInstance } from "vitest";
import { ErrorCode } from "#src/errors/error-code.enum.js";
import { Prisma } from "#src/generated/prisma/client.js";
import { ContextLogger } from "#src/logging/context-logger.js";
import { PrismaExceptionFilter } from "#src/utils/prisma-exception.filter.js";

describe("prismaExceptionFilter", () => {
  let filter: PrismaExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: {
    send: Mock;
    status: Mock;
  };
  let loggerErrorSpy: MockInstance;

  beforeEach(async () => {
    mockResponse = {
      send: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    const mockHttpArgumentsHost = {
      getNext: vi.fn(),
      getRequest: vi.fn(),
      getResponse: vi.fn().mockReturnValue(mockResponse),
    };

    mockArgumentsHost = {
      getArgByIndex: vi.fn(),
      getArgs: vi.fn(),
      getType: vi.fn().mockReturnValue("http"),
      switchToHttp: vi.fn().mockReturnValue(mockHttpArgumentsHost),
      switchToRpc: vi.fn(),
      switchToWs: vi.fn(),
    };

    const mockHttpAdapterHost = {
      httpAdapter: {},
    };

    const mockLogger = { debug: vi.fn(), error: vi.fn(), setContext: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaExceptionFilter,
        { provide: ContextLogger, useValue: mockLogger },
        {
          provide: HttpAdapterHost,
          useValue: mockHttpAdapterHost,
        },
      ],
    }).compile();

    filter = module.get<PrismaExceptionFilter>(PrismaExceptionFilter);
    loggerErrorSpy = mockLogger.error;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("catch", () => {
    it("should handle P2002 (unique constraint violation) error", () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed on the fields: (`email`)",
        {
          clientVersion: "5.0.0",
          code: "P2002",
          meta: { target: ["email"] },
        },
      );

      filter.catch(prismaError, mockArgumentsHost);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { code: "P2002", error: prismaError.message },
        "Prisma error",
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.send).toHaveBeenCalledWith({
        code: ErrorCode.CONFLICT,
        params: { target: ["email"] },
        statusCode: HttpStatus.CONFLICT,
      });
    });

    it("should omit params when the constraint carries no target field", () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed on the fields: (`email`)",
        { clientVersion: "5.0.0", code: "P2002" },
      );

      filter.catch(prismaError, mockArgumentsHost);

      expect(mockResponse.send).toHaveBeenCalledWith({
        code: ErrorCode.CONFLICT,
        statusCode: HttpStatus.CONFLICT,
      });
    });

    it("should log error for non-P2002 errors", () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError("Record not found", {
        clientVersion: "5.0.0",
        code: "P2025",
      });

      expect(() => {
        filter.catch(prismaError, mockArgumentsHost);
      }).toThrow();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { code: "P2025", error: prismaError.message },
        "Prisma error",
      );
    });

    it("should handle P2002 error with multiple fields", () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed on the fields: (`userId`, `postId`)",
        {
          clientVersion: "5.0.0",
          code: "P2002",
          meta: { target: ["userId", "postId"] },
        },
      );

      filter.catch(prismaError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.send).toHaveBeenCalledWith({
        code: ErrorCode.CONFLICT,
        params: { target: ["userId", "postId"] },
        statusCode: HttpStatus.CONFLICT,
      });
    });

    it("should log error message to console", () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError("Test error message", {
        clientVersion: "5.0.0",
        code: "P2002",
      });

      filter.catch(prismaError, mockArgumentsHost);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { code: "P2002", error: "Test error message" },
        "Prisma error",
      );
    });

    it("should log error for P2003 (foreign key constraint) error", () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Foreign key constraint failed",
        {
          clientVersion: "5.0.0",
          code: "P2003",
        },
      );

      expect(() => {
        filter.catch(prismaError, mockArgumentsHost);
      }).toThrow();

      expect(loggerErrorSpy).toHaveBeenCalled();
    });

    it("should log error for P2001 (record not found) error", () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError("Record not found", {
        clientVersion: "5.0.0",
        code: "P2001",
      });

      expect(() => {
        filter.catch(prismaError, mockArgumentsHost);
      }).toThrow();

      expect(loggerErrorSpy).toHaveBeenCalled();
    });
  });
});
