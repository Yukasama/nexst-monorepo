# Nexst

Monorepo generated with `create-nexst-monorepo`:

- `apps/web` — Next.js frontend
- `apps/api` — NestJS backend (REST + GraphQL, Prisma)
- `apps/worker` — BullMQ worker <!-- @if worker -->

## Getting started

```bash
cp apps/api/.env.example apps/api/.env.development   # fill in secrets
cp apps/web/.env.example apps/web/.env
<!-- @if worker -->
cp apps/worker/.env.example apps/worker/.env
<!-- @endif -->
bun install
(cd apps/api && bun run db:generate && bunx --bun prisma migrate deploy)
bun dev
```

- Web: http://localhost:3000
- API: http://localhost:3001 (GraphiQL `/graphql`, Swagger `/api`, health `/health`)
<!-- @if auth -->
- Mail (MailHog): http://localhost:8025
<!-- @endif -->

## Scripts (root, via turbo)

| Script | What it does |
| --- | --- |
| `bun dev` | Infra via docker compose + all apps in watch mode |
| `bun run lint` / `lint:fix` | Oxlint (type-aware) |
| `bun run fmt` / `fmt:check` | Oxfmt |
| `bun run lint:ts` | TypeScript (tsgo) |
| `bun run test:unit` | Vitest in every app |
| `bun run unused` | knip |

## Deployment

- Images: `docker buildx bake` (targets in `docker-bake.hcl`), pushed to ghcr.io by
  `.github/workflows/publish.yaml`, which also pins the new tags in
  `apps/*/kustomize/overlays/prod`.
- Secrets: `apps/api/scripts/seal-secret.sh` seals the keys listed in
  `apps/api/kustomize/secret.keys` into a SealedSecret.
- CI secrets: `DHI_REGISTRY_USERNAME`/`DHI_REGISTRY_PASSWORD` (image builds),
  optional `SONAR_TOKEN`/`SONAR_HOST_URL`, `SNYK_TOKEN`. Repository variables
  `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_HOST_URL` are baked into the web image.
