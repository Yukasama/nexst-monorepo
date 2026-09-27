ARG BUN_VERSION

# ---------------------------------------------------
# Stage 1: Pruner
# ---------------------------------------------------
FROM toolchain AS pruner
RUN turbo prune @nexst/web --docker

# ---------------------------------------------------
# Stage 2: Builder
# ---------------------------------------------------
FROM dhi.io/bun:${BUN_VERSION}-alpine-dev AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=bun-install,sharing=locked,target=/root/.bun/install/cache \
    bun install --frozen-lockfile
COPY --from=pruner /app/out/full/ .

ARG NEXT_PUBLIC_HOST_URL
ARG NEXT_PUBLIC_API_URL

RUN cd apps/web && \
    bun run build && \
    cd .next/standalone/node_modules/.bun && \
    rm -rf sharp@* @img+sharp-* node_modules/sharp node_modules/@img/sharp-* next@*/node_modules/sharp

# ---------------------------------------------------
# Stage 3: Runtime
# ---------------------------------------------------
FROM dhi.io/bun:${BUN_VERSION}-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

COPY --from=builder --chown=nonroot:nonroot /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nonroot:nonroot /app/apps/web/public ./apps/web/public

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD ["bun", "-e", "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"]

EXPOSE 3000
STOPSIGNAL SIGTERM
CMD ["bun", "apps/web/server.js"]
