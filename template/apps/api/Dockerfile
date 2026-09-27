ARG BUN_VERSION

# ---------------------------------------------------
# Stage 1: Pruner
# ---------------------------------------------------
FROM toolchain AS pruner
RUN turbo prune @nexst/api --docker

# ---------------------------------------------------
# Stage 2: Deps
# ---------------------------------------------------
FROM dhi.io/bun:${BUN_VERSION}-alpine-dev AS deps
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=bun-install,sharing=locked,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production --omit=peer

# ---------------------------------------------------
# Stage 3: Prisma
# ---------------------------------------------------
FROM dhi.io/bun:${BUN_VERSION}-alpine-dev AS prisma
WORKDIR /app/apps/api
RUN --mount=type=bind,from=pruner,source=/app/out/json/bun.lock,target=/tmp/bun.lock \
    --mount=type=cache,id=bun-install,sharing=locked,target=/root/.bun/install/cache \
    bun add --omit=peer $(bun -p 'require("/tmp/bun.lock").packages.prisma[0]') && \
    find node_modules -path '*@prisma/engines/schema-engine-*' -type f | grep -q .
COPY --from=pruner /app/out/full/apps/api/prisma ./prisma
COPY --from=pruner /app/out/full/apps/api/prisma.config.ts ./

# ---------------------------------------------------
# Stage 4: Builder
# ---------------------------------------------------
FROM prisma AS builder
RUN --mount=type=bind,from=pruner,source=/app/out/json/bun.lock,target=/tmp/bun.lock \
    --mount=type=cache,id=bun-install,sharing=locked,target=/root/.bun/install/cache \
    bun add --omit=peer $(bun -p 'require("/tmp/bun.lock").packages["@prisma/client"][0]') && \
    bunx --bun prisma generate

# ---------------------------------------------------
# Stage 5: Migrator
# ---------------------------------------------------
FROM prisma AS migrator
ENV NODE_ENV=production
USER nonroot
CMD ["bunx", "--bun", "prisma", "migrate", "deploy"]

# ---------------------------------------------------
# Stage 6: Runtime
# ---------------------------------------------------
FROM dhi.io/bun:${BUN_VERSION}-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PRISMA_AUTO_MIGRATE=false

COPY --from=deps --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=deps --chown=nonroot:nonroot /app/apps/api/node_modules ./apps/api/node_modules
# @if worker
COPY --from=pruner --chown=nonroot:nonroot /app/out/full/packages/queues ./packages/queues
# @endif
COPY --from=pruner --chown=nonroot:nonroot /app/out/full/apps/api ./apps/api
COPY --from=builder --chown=nonroot:nonroot /app/apps/api/src/generated ./apps/api/src/generated

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD ["bun", "-e", "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"]

EXPOSE 3001
STOPSIGNAL SIGTERM
WORKDIR /app/apps/api
CMD ["bun", "src/main.ts"]
