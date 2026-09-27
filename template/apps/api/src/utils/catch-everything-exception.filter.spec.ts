import type { ArgumentsHost } from "@nestjs/common";
import { HttpException, HttpStatus } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { vi } from "vitest";
import type { Mock } from "vitest";
import { AppException } from "#src/errors/app.exception.js";
import { ErrorCode } from "#src/errors/error-code.enum.js";
import { ContextLogger } from "#src/logging/context-logger.js";
import { CatchEverythingFilter } from "#src/utils/catch-everything-exception.filter.js";

const ISO_TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe("catchEverythingFilter", () => {
  let filter: CatchEverythingFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockHttpAdapter: {
    getRequestUrl: Mock;
    reply: Mock;
  };
  let mockRequest: object;
  let mockResponse: object;

  beforeEach(async () => {
    mockHttpAdapter = {
      getRequestUrl: vi.fn().mockReturnValue("/test-path"),
      reply: vi.fn(),
    };

    mockRequest = {};
    mockResponse = {};

    const mockHttpArgumentsHost = {
      getNext: vi.fn(),
      getRequest: vi.fn().mockReturnValue(mockRequest),
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
      httpAdapter: mockHttpAdapter,
    };

    const mockLogger = { debug: vi.fn(), error: vi.fn(), setContext: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatchEverythingFilter,
        { provide: ContextLogger, useValue: mockLogger },
        {
          provide: HttpAdapterHost,
          useValue: mockHttpAdapterHost,
        },
      ],
    }).compile();

    filter = module.get<CatchEverythingFilter>(CatchEverythingFilter);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("catch", () => {
    it("should fall back to a generic code for a plain HttpException with a string message", () => {
      const exception = new HttpException("Test error message", HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockArgumentsHost.switchToHttp).toHaveBeenCalled();
      expect(mockHttpAdapter.getRequestUrl).toHaveBeenCalledWith(mockRequest);
      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.BAD_REQUEST,
          path: "/test-path",
          statusCode: HttpStatus.BAD_REQUEST,
          timestamp: expect.any(String),
        },
        HttpStatus.BAD_REQUEST,
      );
    });

    it("should fall back to a generic code for a plain HttpException with an object response", () => {
      const exception = new HttpException(
        { errors: ["field1", "field2"], message: "Validation failed" },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.UNPROCESSABLE_ENTITY,
          path: "/test-path",
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          timestamp: expect.any(String),
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    });

    it("should handle generic errors as internal server error", () => {
      const exception = new Error("Something went wrong");

      filter.catch(exception, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          path: "/test-path",
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: expect.any(String),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    it("should handle unknown exceptions as internal server error", () => {
      const exception = "Unknown error type";

      filter.catch(exception, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          path: "/test-path",
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: expect.any(String),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    it("should pass an AppException's own code and params through directly", () => {
      const exception = new AppException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, {
        userId: "user-1",
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.NOT_FOUND,
          params: { userId: "user-1" },
          path: "/test-path",
          statusCode: HttpStatus.NOT_FOUND,
          timestamp: expect.any(String),
        },
        HttpStatus.NOT_FOUND,
      );
    });

    it("should omit params for an AppException that carries none", () => {
      const exception = new AppException(ErrorCode.VALIDATION_FAILED, HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.VALIDATION_FAILED,
          path: "/test-path",
          statusCode: HttpStatus.BAD_REQUEST,
          timestamp: expect.any(String),
        },
        HttpStatus.BAD_REQUEST,
      );
    });

    it("should format timestamp as ISO string", () => {
      const exception = new HttpException("Test", HttpStatus.BAD_REQUEST);
      const beforeCall = new Date().toISOString();

      filter.catch(exception, mockArgumentsHost);

      const responseBody = mockHttpAdapter.reply.mock.calls[0][1];
      const afterCall = new Date().toISOString();

      expect(responseBody.timestamp).toMatch(ISO_TIMESTAMP_RE);
      expect(responseBody.timestamp >= beforeCall).toBe(true);
      expect(responseBody.timestamp <= afterCall).toBe(true);
    });

    it("should throw exception when context type is not http", () => {
      const exception = new Error("Test error");
      const nonHttpHost = {
        ...mockArgumentsHost,
        getType: vi.fn().mockReturnValue("rpc"),
      };

      expect(() => {
        filter.catch(exception, nonHttpHost);
      }).toThrow(exception);
    });

    it("should handle NotFoundException correctly", () => {
      const exception = new HttpException("Resource not found", HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.NOT_FOUND,
          path: "/test-path",
          statusCode: HttpStatus.NOT_FOUND,
          timestamp: expect.any(String),
        },
        HttpStatus.NOT_FOUND,
      );
    });

    it("should handle ForbiddenException correctly", () => {
      const exception = new HttpException("Access denied", HttpStatus.FORBIDDEN);

      filter.catch(exception, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.FORBIDDEN,
          path: "/test-path",
          statusCode: HttpStatus.FORBIDDEN,
          timestamp: expect.any(String),
        },
        HttpStatus.FORBIDDEN,
      );
    });

    it("should handle UnauthorizedException correctly", () => {
      const exception = new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);

      filter.catch(exception, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.UNAUTHORIZED,
          path: "/test-path",
          statusCode: HttpStatus.UNAUTHORIZED,
          timestamp: expect.any(String),
        },
        HttpStatus.UNAUTHORIZED,
      );
    });

    it("should map a 429 to TOO_MANY_REQUESTS rather than INTERNAL_SERVER_ERROR", () => {
      const exception = new HttpException(
        "ThrottlerException: Too Many Requests",
        HttpStatus.TOO_MANY_REQUESTS,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.TOO_MANY_REQUESTS,
          path: "/test-path",
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          timestamp: expect.any(String),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    });

    it("should extract correct path from request", () => {
      mockHttpAdapter.getRequestUrl.mockReturnValue("/api/v1/users/123");
      const exception = new HttpException("Test", HttpStatus.OK);

      filter.catch(exception, mockArgumentsHost);

      const responseBody = mockHttpAdapter.reply.mock.calls[0][1];

      expect(responseBody.path).toBe("/api/v1/users/123");
    });
  });
});
