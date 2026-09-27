# nexst-monorepo

Generator for a production-ready **Next.js + NestJS** monorepo on bun:

```bash
npx create-nexst-monorepo my-app      # or: npm create nexst-monorepo my-app / bun create nexst-monorepo my-app
```

## What every project gets

| Area | Contents |
| --- | --- |
| Workspace | bun workspaces, turbo, shared `@<name>/tsconfig` + `@<name>/lint` (oxlint type-aware, oxfmt, knip) |
| `apps/api` | NestJS 12 (ESM, Fastify), REST + GraphQL (Apollo, depth limit, codes-only error format), Prisma 7 + Postgres, health checks (`/health`, `/health/live`), zod-validated config, pino logging, helmet/CORS/throttling, Swagger, codes-only `AppException` infra + filters, Vitest unit + E2E setup |
| `apps/web` | Next.js 16 (cacheComponents, standalone), next-intl (en/de), Tailwind 4 with a semantic light/dark token set, CSP with nonces + hash guard test, React Query, typed GraphQL clients + codegen config, Storybook 10 with axe a11y gate, Vitest, Playwright |
| Docker | DHI bun Alpine images via `docker buildx bake` (arm64), pruned lockfile, separate `api-migrate` image |
| Deploy | kustomize base + prod/staging overlays per app, SealedSecret helper (`apps/api/scripts/seal-secret.sh`) |
| CI | GitHub Actions: path-filtered lint/typecheck/tests per app, API E2E against service containers, Sonar (optional), Snyk, image publish to ghcr.io + prod overlay pinning |
| Claude | `AGENTS.md` per app, `frontend-design` + `theme-factory` skills, superpowers plugin marketplace |

## Optional features

| Flag | Adds |
| --- | --- |
| `--auth` | Better Auth (email + password, passkeys with sign-in button and dashboard management, Google sign-in + One Tap when `GOOGLE_CLIENT_ID`/`NEXT_PUBLIC_GOOGLE_CLIENT_ID` are set, verification + reset mails via SMTP/MailHog in dev and Resend in prod), global `AuthGuard` with `@AllowAnonymous`/`@IsEmailVerified`/`@Roles`, `me` query; web sign-in/up, recovery, reset, verify and a protected dashboard |
| `--r2` | Cloudflare R2 `R2Service` (upload, delete, presigned GET/PUT, public URLs) |
| `--ui` | Extra UI components with stories: avatar, checkbox, dialog, drawer, dropdown menu, empty state, field group/label, OTP input, popover, responsive dialog, searchbar, select, skeleton, switch, tabs, textarea, tooltip (Radix + vaul) |
| `--worker` | `apps/worker` (BullMQ consumer) + `packages/queues` (shared contracts) + Redis, API producer module |

Without flags the CLI asks interactively; `-y` enables everything. Other options:
`--owner` (ghcr.io owner), `--domain`, `--no-install`, `--no-git`.

## Repository layout

- `template/` — the monorepo with **all** features enabled. It is a working project:
  `cd template && bun install && bun run lint:ts` etc.
- `cli/` — `create-nexst-monorepo`: copies the template, strips disabled features, renames
  the `nexst` placeholders, writes dev `.env` files, installs, formats, `git init`.

## Development

```bash
bun install
bun run test          # CLI unit tests (marker engine + generator)
bun run test:matrix   # generate all 16 feature combinations and run their checks (slow)
```

Release: bump `cli/package.json` version, then `cd cli && npm publish` (prepack builds the
CLI and bundles the template).
