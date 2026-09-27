import type { FastifyCorsOptions } from "@fastify/cors";
import helmet from "@fastify/helmet";
import { ConfigService } from "@nestjs/config";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import type { AppConfig } from "#src/config/app.config.js";

/**
 * Configures security middleware for the application.
 *
 * @param app - The NestJS application instance
 */
export async function addSecurity(app: NestFastifyApplication) {
  const cfg = app.get(ConfigService<AppConfig, true>);
  const securityConfig = cfg.get("security", { infer: true });

  const corsOptions: FastifyCorsOptions = {
    methods: securityConfig.allowedMethods,
    origin: securityConfig.allowedOrigins,
    ...securityConfig,
  };

  app.enableCors(corsOptions);
  await app.register(helmet);
}
