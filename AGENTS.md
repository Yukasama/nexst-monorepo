# nexst-monorepo

Two parts: `template/` (a complete monorepo with every optional feature enabled; it has
its own `AGENTS.md`, `bun.lock` and checks) and `cli/` (`create-nexst-monorepo`).

## How features are stripped

- Whole files/dirs, package.json entries and JSON message keys: `cli/src/features.ts`.
- Inline code: markers, resolved by `cli/src/markers.ts`.
  - Block: a comment-only line `// @if auth` … `// @endif` (also `#`, `--`,
    `{/* */}`, `<!-- -->`). Conditions: `name`, `!name`, `a && b`, `a || b`.
  - Line: trailing `// @if auth` on one statement. **Use this for imports** — oxfmt's
    import sorting moves block markers but keeps trailing comments attached.
  - The template must stay valid with all features on, so `@if !x` branches are
    written commented out; the CLI uncomments them when kept.
  - Keep object keys/enum members inside marker blocks already sorted, so
    `oxlint --fix` (perfectionist) never reorders them across markers.
- Placeholders replaced at generation: `nexst` (slug), `nexst_` (SQL-safe), `Nexst`
  (title), `your-org` (ghcr owner), `example.com` (domain).

## Rules

- A template change is done when `cd template && bun run lint:ts && bun run lint &&
  bun run fmt:check && bun run unused && bun run test:unit` pass **and**
  `bun run test:matrix` (from the repo root) passes (every feature combination generates, typechecks,
  lints, formats, passes knip and unit tests, and has no leftover markers/tokens).
- New feature-only files go into `features.ts`; new feature-only deps into its
  `packages` edits. A leftover import or dep shows up in the matrix as a TS/knip error.
- `cli/` changes: `bun run test` in `cli/`.
