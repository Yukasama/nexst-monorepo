# api (NestJS)

This project uses NestJS 12 with ESM (`"type": "module"` in `package.json`,
`module`/`moduleResolution: nodenext` in `tsconfig.json`) — not the CommonJS setup most
NestJS tutorials, examples, and training data assume. Import paths, dynamic `import()`
usage, decorator/metadata behavior, and module interop can differ under ESM. When in
doubt, read the official NestJS documentation for the installed version
(`@nestjs/core` in `package.json`) rather than relying on memory.

## Conventions

- Imports use the `#src/*` / `#tests/*` subpath aliases with a `.js` suffix.
- Prisma client always from `#src/generated/prisma/client.js` (`bun run db:generate`
  after schema changes), never `@prisma/client`.
- Codes-only errors: throw `new AppException(ErrorCode.X, HttpStatus.Y, params?)`
  (`src/errors/`), never a free-text `HttpException`. `bun run lint:error-codes` and
  oxlint's `no-restricted-imports` enforce it; add new codes to `error-code.enum.ts`.
- Loggers: inject `ContextLogger`, not `nestjs-pino` directly.
- Config: static defaults in `src/config/resources/app.yaml`, secrets/env in
  `src/config/app.config.ts` (zod-validated at startup).
- The global `ValidationPipe` runs with `whitelist: true`: every input field needs a
  class-validator decorator (`@IsOptional()`/`@Allow()` for JSON fields) or it is
  silently stripped.
- Auth (if present): every route needs a session unless marked `@AllowAnonymous()`;
  `@IsEmailVerified()` and `@Roles(...)` are enforced by `src/auth/auth.guard.ts`.

## Local dev

- Schema changes: `bun run db:migrate` (creates a migration) or `bun run db:push`
  against the local dev Postgres (`DATABASE_URL` from `.env.development`).
- Swagger UI at `/api`, GraphiQL at `/graphql` when `NODE_ENV=development`.

## Tests

- Unit: `bun run test:unit` (co-located `*.spec.ts`, no services needed).
- E2E: `bun run test:e2e` against a running API (`API_URL`, default
  `http://localhost:3001`); start it with `NODE_ENV=test` so sign-up skips mail.

## Docker image testing

Separate path, not the regular dev loop. Build with `docker buildx bake api --load`
(`api-migrate` for the migrator), then run it against the local infra from `bun dev`
(env from `.env`, `DATABASE_URL` pointing at `host.docker.internal`) and check
`/health` plus the container logs.
