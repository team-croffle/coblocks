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
pnpm db:up && pnpm db:push && pnpm db:seed   # db:up 은 docker/docker-compose.dev.yaml 을 쓴다
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

## Documentation and i18n

- `docs/` is **published documentation only**: material that is settled, meant for people outside the
  team, and stable between major changes. Working design and analysis notes — architecture, data model,
  API drafts, curriculum mapping rules, the roadmap — live in `.ai/`, which is local and never committed.
  If a document is still moving, it does not belong in `docs/`.
- Root documents (`README.md`, `CONTRIBUTING.md`) are written in **English**; the Korean
  translation lives at `docs/<name>.ko.md`. Every other document under `docs/` is written in Korean.
- **A change to a root document changes both language versions in the same commit.** Editing only
  one side is an incomplete change. Each version links to the other at the top.
- Code comments and UI strings stay Korean (see Code rules). The app itself has no runtime i18n yet;
  if that changes, this section is what has to be updated first.
- `README.md` is the entry point: what the service teaches, the grade-band learning path, curriculum
  alignment, structure, setup. `CONTRIBUTING.md` is the process. `AGENTS.md` — this file — is the
  working contract. Keep each one in its own lane rather than repeating the others.
- Licensing: the project is Apache-2.0 (`LICENSE`). Curriculum text quoted from Ministry of Education
  notices is third-party content and is recorded in `NOTICE`; do not relicense or reword it.

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
- Hooks (husky, installed by `pnpm install`): `pre-commit` runs lint-staged on staged files,
  `commit-msg` rejects a subject over 72 characters or a missing blank line after it, `pre-push` runs
  `pnpm typecheck`. They are a safety net, not a substitute for running `pnpm check` yourself.
- CI runs the same checks plus tests, a build and a Docker image build on **every branch push** and
  every pull request; a pull request is not done until it is green. `Security` additionally runs a
  TruffleHog secret scan and a dependency review.
- Releases are container images on GHCR, cut by the manual `Release` workflow. Version numbering,
  release titles and the rc-suffix rule live in `.ai/VERSIONING.md`; the plan → work → branch → PR →
  release-note procedure lives in `.ai/WORKFLOW.md`. Both are local, like the rest of `.ai/`.
- Path labels are applied automatically, and `@bluenyang` owns every path via `CODEOWNERS`.
  Contributor-facing detail lives in `CONTRIBUTING.md`.

## Work log — `.ai/history`

- After any task that creates or changes files, **always** write `.ai/history/YYYY-MM-DD-<slug>.md` (date in KST). Separate tasks in one session get separate files.
- Follow the format and language rules in `.ai/README.md` — work reports are written in **Korean**.
- `.ai/` is **local only**: `.ai/.gitignore` ignores everything (`*`). Never include it in commits or PRs, and never remove that ignore.
- Details belong in `.ai/history` only. **Do not write work logs, dated change notes, or session memos into this file, README, or docs.** AGENTS.md holds rules only and changes only when a rule changes.
- Before starting a task, skim the latest `.ai/history` entries for context (decisions, open items).

## Not done yet

See `.ai/GOALS.md` (what and why) and `.ai/ROADMAP.md` (v0.1 – v1.1 version plan), both local. Big items: a Blockly editor over a server-executable IR, a canvas2D stage
package, the stage editor, custom blocks and mission constraints, classrooms and assignments, block-to-code
conversion, solution sharing, and real-time collaboration.
