# Nexst

Bun workspace: one `package.json`, one lockfile (`bun.lock`), one CI (root
`.github/workflows/`). `apps/*/AGENTS.md` add app-specific rules.

- **web** — Next.js 16, next-intl (en, de), Tailwind 4, React Query.
- **api** — NestJS 12 on Fastify (REST + GraphQL), Prisma 7 on Postgres.
<!-- @if worker -->
- **worker** — BullMQ worker for background jobs the API enqueues; shared queue
  contracts in `packages/queues`.
<!-- @endif -->
- **packages/lint**, **packages/tsconfig** — shared oxlint/oxfmt/knip and TS configs.

## Local dev

`bun dev` starts the infra from `compose.yaml` and runs all apps in watch mode.
api and worker have no build step; bun runs `src/*.ts` directly, also in production.
Secrets live in each app's `.env`/`.env.development` (see `.env.example`); bun loads
them itself. Run TypeScript with bun (`bun <file>`, `bunx --bun prisma`), not node.

## Docker

`docker buildx bake <api|api-migrate|web> --load` (arm64, needs `docker login dhi.io`).
Images are DHI bun Alpine and must stay small: pruned lockfile +
`--production --omit=peer`, prisma only in the `prisma` stage, system packages via
`apk add --root`. Kustomize manifests per app in `apps/*/kustomize`; the publish
workflow pins new `sha-*` tags into the prod overlays.

## Rules

- Check the installed version (`package.json`, `bun.lock`) and use the docs for exactly
  that version, not training knowledge.
- Superpowers skills (`.agents/plugins/marketplace.json`): `brainstorming` before
  behavior-changing features, then `writing-plans`; `systematic-debugging` before bug
  fixes; `test-driven-development` for app code; `requesting-code-review` for larger
  changes; `verification-before-completion` before claiming done.
- After every TS/JS change, in the affected app: `bun run lint` (Oxlint, no ESLint),
  `bun run lint:ts`, and the smallest relevant Vitest run (`bun run vitest run <path>`).
  Visible web UI changes also need Playwright (`bun run test`) and browser verification;
  api changes to external interfaces, DB or auth need the affected E2E tests.
- Touch `bun.lock` only with an intentional dependency change. Fix root causes; new
  lint-disable comments need a narrow, documented reason.
