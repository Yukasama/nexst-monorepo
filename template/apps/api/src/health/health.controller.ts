import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";
import { AllowAnonymous } from "#src/auth/decorator/allow-anonymous.decorator.js"; // @if auth
import { PrismaService } from "#src/prisma/prisma.service.js";

/**
 * Controller for health check endpoints.
 *
 * - Provides readiness probe with database connectivity check
 * - Provides liveness probe for basic service status
 * - Used by Kubernetes or Docker health checks
 */
@AllowAnonymous() // @if auth
@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Performs readiness check including database connectivity.
   *
   * @returns Health check result with database status
   */
  @ApiOperation({ summary: "Health check with database and memory" })
  @ApiResponse({ description: "Service is healthy", status: 200 })
  @ApiResponse({ description: "Service is unhealthy", status: 503 })
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => {
        const isHealthy = await this.prisma.isHealthy();
        return { database: { status: isHealthy ? "up" : "down" } };
      },
    ]);
  }

  /**
   * Performs basic liveness check.
   *
   * @returns Object with status, timestamp, and uptime
   */
  @ApiOperation({ summary: "Liveness probe" })
  @ApiResponse({ description: "Service is alive", status: 200 })
  @Get("live")
  liveness() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }
}
