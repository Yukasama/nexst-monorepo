import type { ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config"; // @if auth
// import { ConfigModule } from "@nestjs/config"; // @if !auth
import { APP_FILTER, APP_GUARD } from "@nestjs/core"; // @if auth
// import { APP_FILTER } from "@nestjs/core"; // @if !auth
import { GraphQLModule } from "@nestjs/graphql";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "@thallesp/nestjs-better-auth"; // @if auth
import { AppInfoModule } from "#src/app-info/app-info.module.js";
import { AuthGuard } from "#src/auth/auth.guard.js"; // @if auth
import { createAuth } from "#src/auth/auth.js"; // @if auth
import { loadConfig } from "#src/config/app.config.js";
import type { AppConfig } from "#src/config/app.config.js"; // @if auth
import { graphqlConfig } from "#src/config/graphql.config.js";
import { HealthModule } from "#src/health/health.module.js";
import { LoggingModule } from "#src/logging/logging.module.js";
import { MailModule } from "#src/mail/mail.module.js"; // @if auth
import { MailService } from "#src/mail/mail.service.js"; // @if auth
import { PrismaModule } from "#src/prisma/prisma.module.js";
import { PrismaService } from "#src/prisma/prisma.service.js"; // @if auth
import { QueueModule } from "#src/queue/queue.module.js"; // @if worker
import { R2Module } from "#src/r2/r2.module.js"; // @if r2
import { UserModule } from "#src/user/user.module.js"; // @if auth
import { CatchEverythingFilter } from "#src/utils/catch-everything-exception.filter.js";
import { PrismaExceptionFilter } from "#src/utils/prisma-exception.filter.js";
import { PrismaGraphQLExceptionFilter } from "#src/utils/prisma-graphql-exception.filter.js";

/**
 * Root NestJS module
 */
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>(graphqlConfig),
    LoggingModule,
    ConfigModule.forRoot({ isGlobal: true, load: [loadConfig] }),
    ThrottlerModule.forRoot([
      {
        limit: 100,
        skipIf: () => process.env.NODE_ENV !== "production",
        ttl: 10_000,
      },
    ]),
    PrismaModule,
    HealthModule,
    AppInfoModule,
    // @if auth
    MailModule,
    AuthModule.forRootAsync({
      disableGlobalAuthGuard: true,
      imports: [ConfigModule, PrismaModule, MailModule],
      inject: [PrismaService, ConfigService, MailService],
      useFactory: (
        prisma: PrismaService,
        cfg: ConfigService<AppConfig, true>,
        mail: MailService,
      ) => ({
        auth: createAuth(prisma, cfg.get("security", { infer: true }).allowedOrigins, mail),
      }),
    }),
    UserModule,
    // @endif
    // @if r2
    R2Module,
    // @endif
    // @if worker
    QueueModule,
    // @endif
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard }, // @if auth
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
    { provide: APP_FILTER, useClass: PrismaGraphQLExceptionFilter },
    { provide: APP_FILTER, useClass: CatchEverythingFilter },
  ],
})
export class AppModule {}
