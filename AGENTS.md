# Coblocks — Agent Instructions

Shared instructions for AI coding agents (Claude Code, Copilot, Codex, Gemini CLI, …). Tool-specific files such as `CLAUDE.md` only reference this file; rules live here and nowhere else.

## Project in one line

Block-coding learning service for elementary/middle/high school students, aligned to the Korean 2022 revised national curriculum. pnpm monorepo: `apps/web` (React 19 SPA), `apps/api` (NestJS), `packages/shared` (types, curriculum data, block interpreter).

## Commands

```bash
pnpm dev              # web + api together
pnpm dev:web          # :5173
pnpm dev:api          # :3000/api
pnpm typecheck        # whole repo
pnpm lint             # oxlint
pnpm fmt              # oxfmt (check only: pnpm fmt:check)
pnpm check            # lint + fmt:check + typecheck — must pass before every commit
pnpm --filter @coblocks/api test   # interpreter tests
pnpm db:up && pnpm db:push && pnpm db:seed
```

## Code rules

- TypeScript 6.0.3 with `strict` + `noUncheckedIndexedAccess`. Array indexing may yield `undefined`; never use the result as-is.
- `apps/web` has `verbatimModuleSyntax` on. Type-only imports must be written as `import type`.
- Comments and UI strings are written in Korean. Comments explain *why*, not *what*.
- React components are function components with named exports only. No `export default` (the router imports by name).
- **React Compiler is enabled.** Do not add `useMemo`/`useCallback`/`memo` by habit. Use them only where the compiler cannot help (e.g. a stable reference handed to an external library) and leave a comment saying why. Rules-of-hooks violations make the compiler bail out, so `pnpm lint` must pass.
- Linter/formatter are oxlint + oxfmt. Do not add ESLint or Prettier config files.
- Colors go through Tailwind token utilities (`bg-loop`, `text-ink-soft`) or `var(--color-loop)`. No raw hex in components. Only when the value is decided at runtime use `style={{ background: \`var(${cssVar})\` }}`.
- API response types are defined in `@coblocks/shared` and imported by both web and api. No duplicate definitions.

## Invariants — never break these

1. **Server-side grading** — lesson completion is decided only inside `attempt()` in `apps/api/src/progress/progress.service.ts`, via `run()`. Never trust a client-reported success flag.
2. **PII masking** — `name`/`email` from the `users` table never go into a response as-is. Always pass through `common/masking.ts`.
3. **Audit log** — never write UPDATE/DELETE queries against `audit_logs`.
4. **Role guard** — admin endpoints always carry `@UseGuards(JwtAuthGuard, RolesGuard)` together with `@Roles('admin')`.

## Common tasks

**Add a mission (problem)**
1. Check that the achievement-standard code exists in `STANDARDS` in `packages/shared/src/data/concepts.ts`; if not, add it together with the original text.
2. Add an entry to `LESSON_SEED` in `packages/shared/src/data/lessons.ts`.
3. Re-run `pnpm db:seed`.

**Add a block kind**
1. Extend `BlockKind` in `packages/shared/src/types/blocks.ts`.
2. Handle it in `compile`/`applyStep` in `packages/shared/src/blocks/interpreter.ts`.
3. Add cases to `apps/api/test/interpreter.spec.ts` — interpreter changes are never merged without tests.
4. Add label/color in `apps/web/src/components/BlockPalette.tsx` and `BlockWorkspace.tsx`.

**Add an admin page**
1. Add the page under `apps/web/src/pages/admin/` (named export).
2. In `apps/web/src/router.tsx`, create `createRoute({ getParentRoute: () => adminRoute, path: '...' })` and add it to `adminRoute.addChildren([...])`.
3. Add an item to `MENU` in `apps/web/src/layouts/AdminLayout.tsx`.

**Routing gotcha**
TanStack Router derives path types from the route tree. If `Link to="..."` gives a type error, the route is usually missing from `addChildren`. Pages with params read them via `route.useParams()`; use `useParams({ strict: false })` only when two routes share one component.

## Git workflow

- **Commit in small units.** One commit = one logical change (a rule change, one feature, one fix, one refactor). Do not bundle unrelated changes, and do not start the next sub-task while a finished one is still uncommitted.
- Run `pnpm check` before every commit.
- **Commit message = title + summary + bullets.** Record the work in detail:

  ```
  <title: imperative mood, ≤ 72 chars, what changed>

  <summary: 1–3 sentences — why this change, what it affects>

  - <bullet: each concrete change, at file/module level>
  - <bullet: decisions made, alternatives rejected, anything a reviewer should check>
  ```

  A bare title is acceptable only for trivial one-liners (typo, formatting). Everything else gets the summary and bullets.
- Never commit `.ai/`, `.env*`, or Syncthing files (`.stfolder`, `.stignore`, `.stversions`). They are gitignored; do not undo that.

## Work log — `.ai/history`

- After any task that creates or changes files, **always** write `.ai/history/YYYY-MM-DD-<slug>.md` (date in KST). Separate tasks in one session get separate files.
- Follow the format and language rules in `.ai/README.md` — work reports are written in **Korean**.
- `.ai/` is **local only**: `.ai/.gitignore` ignores everything (`*`). Never include it in commits or PRs, and never remove that ignore.
- Details belong in `.ai/history` only. **Do not write work logs, dated change notes, or session memos into this file, README, or docs.** AGENTS.md holds rules only and changes only when a rule changes.
- Before starting a task, skim the latest `.ai/history` entries for context (decisions, open items).

## Not done yet

See `docs/05-roadmap.md`. Big items: stage editor, unmask-approval screen, class management, real-time online-user counting (Redis), refresh tokens.
