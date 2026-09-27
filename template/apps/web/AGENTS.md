<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# web (Next.js)

- i18n via next-intl: every user-facing string goes through `messages/*.json`, in every
  locale file. Routes live under `src/app/[locale]`; use `Link`/`useRouter` from
  `@/i18n/navigation`.
- Styling: Tailwind 4 with the semantic tokens in `src/app/globals.css`
  (`bg-background`, `text-muted-foreground`, …) — no raw hex or ramp steps in
  components. Reuse `src/components/*`.
- CSP lives in `src/config/csp.ts` and is applied by `src/proxy.ts`. New external
  origins (API, CDN, images) must be added there. `tests/csp-theme-script.spec.ts`
  guards the inline-script hashes.
- API calls: `@/lib/graphql-client` (browser, cookies included) or
  `@/lib/graphql-server` (server components, forward the cookie). Type documents with
  `graphql()` from `@/generated/gql` after `bun run codegen` (API must be running);
  never hand-type `TypedDocumentNode`s.
- Server-only env in `src/env.ts` (`@t3-oss/env-nextjs`); `NEXT_PUBLIC_*` are baked in
  at build time (Docker build args).
- Tests: `bun run test:unit` (Vitest unit + Storybook stories incl. axe a11y),
  `bun run test` (Playwright against `next start`).
