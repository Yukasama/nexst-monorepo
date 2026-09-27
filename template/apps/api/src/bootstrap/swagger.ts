import { ConfigService } from "@nestjs/config";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { AppConfig } from "#src/config/app.config.js";

/**
 * Configures Swagger/OpenAPI documentation for the application.
 *
 * @param app - The NestJS application instance
 */
export function addSwagger(app: NestFastifyApplication): void {
  const cfg = app.get(ConfigService<AppConfig, true>);
  const appCfg = cfg.get("app", { infer: true });
  const swaggerCfg = cfg.get("swagger", { infer: true });

  const builder = new DocumentBuilder()
    .setTitle(appCfg.title)
    .setDescription(appCfg.description)
    .setVersion(appCfg.version);

  for (const tag of swaggerCfg.tags) {
    builder.addTag(tag);
  }
  const config = builder.build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerCfg.path, app, documentFactory);
}
