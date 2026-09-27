export type RedisConnectionOptions = {
  host: string;
  maxRetriesPerRequest: null;
  port: number;
  retryStrategy: (times: number) => null | number;
};

/**
 * Shared ioredis connection options for the BullMQ producer (apps/api) and
 * consumer (apps/worker) sides of every queue in this package. `maxRetriesPerRequest:
 * null` is required by BullMQ; the capped exponential retry strategy keeps
 * both sides behaving the same way during a Redis outage.
 */
export function createRedisConnectionOptions(config: {
  host: string;
  port: number;
  retryLimit?: number;
}): RedisConnectionOptions {
  const retryLimit = config.retryLimit ?? 5;

  return {
    host: config.host,
    maxRetriesPerRequest: null,
    port: config.port,
    retryStrategy: (times: number) => (times > retryLimit ? null : Math.min(times * 100, 2000)),
  };
}
