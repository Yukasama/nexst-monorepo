import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { Logger } from "nestjs-pino";
import { AppModule } from "#src/app.module.js";
import { registerGraphqlEnums } from "#src/bootstrap/register-graphql-enums.js"; // @if auth
import { addSecurity } from "#src/bootstrap/security.js";
import { addSwagger } from "#src/bootstrap/swagger.js";
import { validationExceptionFactory } from "#src/errors/validation-exception.factory.js";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    // @if auth
    // Better Auth parses its own request bodies.
    bodyParser: false,
    // @endif
  });

  await addSecurity(app);
  registerGraphqlEnums(); // @if auth
  app.useLogger(app.get(Logger));

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: validationExceptionFactory,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
    }),
  );

  if (process.env.NODE_ENV === "development") {
    addSwagger(app);
  }

  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3001, "0.0.0.0");
}

void bootstrap();
