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

Google sign-in (button + One Tap) stays hidden until it is configured: create an OAuth
client (type "Web application") in the Google Cloud console with the redirect URI
`http://localhost:3001/api/auth/callback/google` and the JavaScript origin
`http://localhost:3000`, then set `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` in
`apps/api/.env.development` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `apps/web/.env`.
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

- Pipeline (`.github/workflows/deploy.yaml`, on every push to `main`): CI → images of
  the changed apps via `docker buildx bake` (targets in `docker-bake.hcl`) to ghcr.io →
  rewind, which commits the new `sha-*` tags to `apps/*/kustomize/overlays/prod` for
  GitOps (Flux/Argo) to roll out. Nothing is built or pinned unless CI passes.
- Secrets: `apps/api/scripts/seal-secret.sh` seals the keys listed in
  `apps/api/kustomize/secret.keys` into a SealedSecret.
- CI secrets: `DHI_REGISTRY_USERNAME`/`DHI_REGISTRY_PASSWORD` (image builds),
  optional `SONAR_TOKEN`/`SONAR_HOST_URL`, `SNYK_TOKEN`. Repository variables
  `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_HOST_URL` are baked into the web image.
