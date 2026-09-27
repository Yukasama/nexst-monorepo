import { Global, Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { ContextLogger } from "#src/logging/context-logger.js";
import { loggerConfig } from "#src/logging/logger.config.js";

/**
 * The application's logging module.
 *
 * It wires `nestjs-pino` (pino transport + the request-scoped
 * `Logger`/`PinoLogger` providers, configured via `loggerConfig`) and layers
 * `ContextLogger` on top, which derives its log context from the injecting
 * class. Feature modules inject `ContextLogger`; `main.ts` pulls `Logger` for
 * `app.useLogger`. Nothing should import `nestjs-pino`'s `LoggerModule`
 * directly — import this module instead.
 */
@Global()
@Module({
  exports: [ContextLogger, LoggerModule],
  imports: [LoggerModule.forRoot(loggerConfig)],
  providers: [ContextLogger],
})
export class LoggingModule {}
