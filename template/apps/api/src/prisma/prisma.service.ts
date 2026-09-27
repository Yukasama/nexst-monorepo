import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { Injectable } from "@nestjs/common";
import type { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import type { AppConfig } from "#src/config/app.config.js";
import { PrismaClient } from "#src/generated/prisma/client.js";
import type { Prisma } from "#src/generated/prisma/client.js";
import { ContextLogger } from "#src/logging/context-logger.js";
import { handleError } from "#src/utils/error-handler.util.js";

const execFileAsync = promisify(execFile);

/**
 * Prisma service for database access and lifecycle management.
 *
 * - Extends PrismaClient with NestJS lifecycle hooks
 * - Configures query logging for development
 * - Provides health check functionality
 * - Handles connection management
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy, OnModuleInit {
  constructor(
    cfg: ConfigService<AppConfig, true>,
    private readonly logger: ContextLogger,
  ) {
    const adapter = new PrismaPg({
      connectionString: cfg.get("db.url", { infer: true }),
    });

    super({
      adapter,
      errorFormat: "pretty",
      log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "info" },
        { emit: "event", level: "warn" },
        { emit: "event", level: "error" },
      ],
    });

    this.$on("query" as never, (e: Prisma.QueryEvent) => {
      if (process.env.NODE_ENV !== "production") {
        this.logger.debug({ duration: e.duration, query: e.query }, "Query executed");
      }
    });
    this.$on("info" as never, (e: Prisma.LogEvent) => {
      this.logger.info(e.message);
    });
    this.$on("warn" as never, (e: Prisma.LogEvent) => {
      this.logger.warn(e.message);
    });
    this.$on("error" as never, (e: Prisma.LogEvent) => {
      this.logger.error(e.message);
    });
  }

  /**
   * Checks database connectivity.
   *
   * @returns True if database is reachable, false otherwise
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error: unknown) {
      this.logger.error({ error: handleError(error) }, "Database health check failed");
      return false;
    }
  }

  /**
   * Disconnects from database on module destruction.
   *
   * @returns A promise that resolves when disconnection is complete
   */
  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.info("Database connection closed");
    } catch (error: unknown) {
      this.logger.error({ error: handleError(error) }, "Error during database disconnect");
    }
  }

  /**
   * Connects to database on module initialization.
   *
   * @returns A promise that resolves when connection is established
   * @throws {Error} When database connection fails
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.info("Successfully connected to database");
    } catch (error: unknown) {
      this.logger.error({ error: handleError(error) }, "Failed to connect to database");
      throw error;
    }

    await this.applyMigrations();
  }

  /**
   * Applies pending database migrations on startup.
   *
   * Runs `prisma migrate deploy`, which is idempotent: it creates the schema
   * from scratch when the database is empty, applies any pending migrations,
   * and is a no-op when the schema is already up to date.
   *
   * Skipped when `PRISMA_AUTO_MIGRATE=false` (e.g. when migrations are run as a
   * separate deploy step).
   *
   * @throws {Error} When migrations fail to apply
   */
  private async applyMigrations(): Promise<void> {
    if (process.env.PRISMA_AUTO_MIGRATE === "false") {
      this.logger.info("Auto-migration disabled (PRISMA_AUTO_MIGRATE=false), skipping");
      return;
    }

    try {
      const prismaCli = fileURLToPath(import.meta.resolve("prisma/build/index.js"));
      const { stdout } = await execFileAsync(process.execPath, [prismaCli, "migrate", "deploy"], {
        cwd: process.cwd(),
        env: process.env,
      });
      this.logger.info({ output: stdout.trim() }, "Database migrations applied");
    } catch (error: unknown) {
      this.logger.error({ error: handleError(error) }, "Failed to apply database migrations");
      throw error;
    }
  }
}
