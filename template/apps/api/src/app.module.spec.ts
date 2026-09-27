import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { Logger } from "nestjs-pino";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppModule } from "#src/app.module.js";
import { registerGraphqlEnums } from "#src/bootstrap/register-graphql-enums.js"; // @if auth
import { addSecurity } from "#src/bootstrap/security.js";
import { addSwagger } from "#src/bootstrap/swagger.js";
import { PrismaService } from "#src/prisma/prisma.service.js";

// @if auth || worker
const { fn: mockFn } = vi.hoisted(() => ({ fn: vi.fn }));
// @endif

// @if auth
vi.mock("#src/auth/auth.js", () => ({
  createAuth: mockFn(() => ({ api: { getSession: mockFn() }, options: {} })),
}));
// @endif
// @if worker

vi.mock("ioredis", () => {
  const Redis = mockFn(function () {
    return {
      disconnect: mockFn().mockResolvedValue("OK"),
      off: mockFn(),
      on: mockFn(),
      ping: mockFn().mockResolvedValue("PONG"),
      quit: mockFn().mockResolvedValue("OK"),
    };
  });
  return { default: Redis, Redis };
});

vi.mock("bullmq", () => {
  function connectionLike() {
    return {
      add: mockFn(),
      close: mockFn().mockResolvedValue(undefined),
      off: mockFn(),
      on: mockFn(),
      waitUntilReady: mockFn().mockResolvedValue(undefined),
    };
  }
  return {
    FlowProducer: mockFn(connectionLike),
    Job: class Job {},
    Queue: mockFn(connectionLike),
    QueueEvents: mockFn(connectionLike),
    Worker: mockFn(connectionLike),
  };
});
// @endif

describe("appModule (wiring)", () => {
  let moduleRef: TestingModule;
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const prismaMock = {
      $connect: vi.fn(),
      $disconnect: vi.fn(),
      $on: vi.fn(),
      onModuleDestroy: vi.fn(),
      onModuleInit: vi.fn(),
    };

    moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

    await addSecurity(app);
    registerGraphqlEnums(); // @if auth
    app.useLogger(app.get(Logger));
    addSwagger(app);

    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await moduleRef?.close();
  });

  it("compiles", () => {
    expect(app).toBeDefined();
  });
});
