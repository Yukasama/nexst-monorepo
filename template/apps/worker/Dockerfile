ARG BUN_VERSION

# ---------------------------------------------------
# Stage 1: Pruner
# ---------------------------------------------------
FROM toolchain AS pruner
RUN turbo prune @nexst/worker --docker

# ---------------------------------------------------
# Stage 2: Deps
# ---------------------------------------------------
FROM dhi.io/bun:${BUN_VERSION}-alpine-dev AS deps
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=bun-install,sharing=locked,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production --omit=peer

# ---------------------------------------------------
# Stage 3: Runtime
# ---------------------------------------------------
FROM dhi.io/bun:${BUN_VERSION}-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=deps --chown=nonroot:nonroot /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=pruner --chown=nonroot:nonroot /app/out/full/packages/queues ./packages/queues
COPY --from=pruner --chown=nonroot:nonroot /app/out/full/apps/worker ./apps/worker

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD ["bun", "-e", "new (require('ioredis').default)({ host: process.env.REDIS_HOST || 'localhost', port: Number(process.env.REDIS_PORT) || 6379 }).ping().then(() => process.exit(0), () => process.exit(1))"]

STOPSIGNAL SIGTERM
WORKDIR /app/apps/worker
CMD ["bun", "src/main.ts"]
