import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "#src/health/health.controller.js";

/**
 * Module exposing standard health and readiness endpoints.
 */
@Module({
  controllers: [HealthController],
  imports: [TerminusModule],
})
export class HealthModule {}
