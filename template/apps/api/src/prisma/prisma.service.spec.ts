import type { ConfigService } from "@nestjs/config";
import { vi } from "vitest";
import type { Mocked } from "vitest";
import type { ContextLogger } from "#src/logging/context-logger.js";
import { PrismaService } from "#src/prisma/prisma.service.js";

vi.mock("#src/generated/prisma/client.js", () => {
  class PrismaClient {
    $connect = vi.fn(async () => {});

    $disconnect = vi.fn(async () => {});
    $on = vi.fn();
    $queryRaw = vi.fn();
  }
  return { PrismaClient };
});

vi.mock("@prisma/adapter-pg", () => ({
  PrismaPg: vi.fn(function () {
    return {};
  }),
}));

describe("prismaService (unit)", () => {
  let service: PrismaService;
  let configMock: Mocked<ConfigService>;
  let loggerMock: Mocked<ContextLogger>;

  const originalAutoMigrate = process.env.PRISMA_AUTO_MIGRATE;

  beforeAll(() => {
    process.env.PRISMA_AUTO_MIGRATE = "false";
  });

  afterAll(() => {
    if (originalAutoMigrate === undefined) {
      delete process.env.PRISMA_AUTO_MIGRATE;
    } else {
      process.env.PRISMA_AUTO_MIGRATE = originalAutoMigrate;
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();

    configMock = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key === "db.url") {
          return "postgresql://user:pass@localhost:5432/db";
        }
      }),
    } as unknown as Mocked<ConfigService>;

    loggerMock = {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      setContext: vi.fn(),
      warn: vi.fn(),
    } as unknown as Mocked<ContextLogger>;

    service = new PrismaService(configMock, loggerMock);
  });

  describe("isHealthy", () => {
    it("returns true when $queryRaw resolves", async () => {
      vi.spyOn(service, "$queryRaw").mockResolvedValue([{ "?column?": 1 }]);

      const result = await service.isHealthy();

      expect(result).toBe(true);
      expect(service.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it("returns false and logs error when $queryRaw rejects", async () => {
      const error = new Error("boom");
      vi.spyOn(service, "$queryRaw").mockRejectedValue(error);

      const result = await service.isHealthy();

      expect(result).toBe(false);
      expect(service.$queryRaw).toHaveBeenCalledTimes(1);
      expect(loggerMock.error).toHaveBeenCalledWith(
        { error: "boom" },
        "Database health check failed",
      );
    });
  });

  describe("onModuleDestroy", () => {
    it('calls $disconnect and logs "closed"', async () => {
      vi.spyOn(service, "$disconnect").mockResolvedValue();

      await service.onModuleDestroy();

      expect(service.$disconnect).toHaveBeenCalledTimes(1);
      expect(loggerMock.info).toHaveBeenCalledWith("Database connection closed");
    });

    it("logs error if $disconnect throws", async () => {
      const error = new Error("cannot close");
      vi.spyOn(service, "$disconnect").mockRejectedValue(error);

      await service.onModuleDestroy();

      expect(service.$disconnect).toHaveBeenCalled();
      expect(loggerMock.error).toHaveBeenCalledWith(
        { error: "cannot close" },
        "Error during database disconnect",
      );
    });
  });

  describe("onModuleInit", () => {
    it("calls $connect and logs success", async () => {
      vi.spyOn(service, "$connect").mockResolvedValue();

      await service.onModuleInit();

      expect(service.$connect).toHaveBeenCalledTimes(1);
      expect(loggerMock.info).toHaveBeenCalledWith("Successfully connected to database");
    });

    it("logs error and rethrows if $connect throws", async () => {
      const error = new Error("cannot connect");
      vi.spyOn(service, "$connect").mockRejectedValue(error);

      await expect(service.onModuleInit()).rejects.toThrow("cannot connect");
      expect(service.$connect).toHaveBeenCalled();
      expect(loggerMock.error).toHaveBeenCalledWith(
        { error: "cannot connect" },
        "Failed to connect to database",
      );
    });
  });
});
