import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createRedisConnectionOptions, EXAMPLE_QUEUE } from "@nexst/queues";
import type { AppConfig } from "#src/config/app.config.js";
import { ExampleQueueResolver } from "#src/queue/example-queue.resolver.js";
import { ExampleQueueService } from "#src/queue/example-queue.service.js";

/**
 * BullMQ producer side: connects to Redis and registers the queues apps/worker
 * consumes. Queue names and payload types live in `@nexst/queues` so both
 * sides stay in sync.
 */
@Module({
  exports: [ExampleQueueService],
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService<AppConfig, true>) => ({
        connection: createRedisConnectionOptions(cfg.get("redis", { infer: true })),
      }),
    }),
    BullModule.registerQueue({ name: EXAMPLE_QUEUE }),
  ],
  providers: [ExampleQueueResolver, ExampleQueueService],
})
export class QueueModule {}
