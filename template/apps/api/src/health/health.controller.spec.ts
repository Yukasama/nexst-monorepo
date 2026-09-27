import { HealthCheckService, MemoryHealthIndicator } from "@nestjs/terminus";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { vi } from "vitest";
import { HealthController } from "#src/health/health.controller.js";
import { PrismaService } from "#src/prisma/prisma.service.js";

describe("healthController", () => {
  let controller: HealthController;

  const prismaMock = {
    isHealthy: vi.fn<() => Promise<boolean>>(),
  };

  const healthCheckServiceMock = {
    check: vi.fn(async (indicators: Array<() => Promise<Record<string, unknown>>>) => {
      const results = await Promise.all(indicators.map((function_) => function_()));
      const combined = {};
      for (const result of results) {
        Object.assign(combined, result);
      }
      return combined;
    }),
  };

  const memoryIndicatorMock = {};

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: healthCheckServiceMock },
        { provide: MemoryHealthIndicator, useValue: memoryIndicatorMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("liveness", () => {
    it("returns ok with timestamp and uptime", () => {
      const uptimeSpy = vi.spyOn(process, "uptime").mockReturnValue(123.456);
      const res = controller.liveness();

      expect(res.status).toBe("ok");
      expect(typeof res.timestamp).toBe("string");
      expect(() => new Date(res.timestamp)).not.toThrow();
      expect(res.uptime).toBe(123);

      uptimeSpy.mockRestore();
    });
  });

  describe("check", () => {
    it("returns database: up when prisma is healthy", async () => {
      prismaMock.isHealthy.mockResolvedValueOnce(true);
      const res = await controller.check();

      expect(healthCheckServiceMock.check).toHaveBeenCalledTimes(1);
      expect(res).toEqual({ database: { status: "up" } });
      expect(prismaMock.isHealthy).toHaveBeenCalledTimes(1);
    });

    it("returns database: down when prisma is NOT healthy", async () => {
      prismaMock.isHealthy.mockResolvedValueOnce(false);
      const res = await controller.check();

      expect(healthCheckServiceMock.check).toHaveBeenCalledTimes(1);
      expect(res).toEqual({
        database: { status: "down" },
      });
      expect(prismaMock.isHealthy).toHaveBeenCalledTimes(1);
    });
  });
});
