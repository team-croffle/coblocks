# Contributing to Coblocks

> 🇰🇷 [한국어로 읽기](docs/CONTRIBUTING.ko.md)

Thanks for taking the time. This project is used in a classroom context, so a few of the
rules below are stricter than they would be elsewhere — particularly around grading,
personal data and curriculum text.

Read [AGENTS.md](AGENTS.md) first. It is the working contract for this repository and it
applies to humans and AI agents alike.

## Getting set up

Node ≥ 22 and pnpm 11 (`corepack enable`).

```bash
pnpm install      # also installs the git hooks via husky
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
pnpm db:up && pnpm db:push && pnpm db:seed
pnpm dev
```

If hooks do not run, `pnpm install` was skipped or `core.hooksPath` was overridden — run
`pnpm prepare` to restore them.

## Working on a change

1. **Branch off `main`.** Name it `<type>/<short-slug>`, where type is one of
   `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`.
2. **Keep the change small.** One branch should carry one reviewable idea. If you find
   yourself writing "and also" in the description, split it.
3. **Commit in small units.** One commit = one logical change. Do not bundle unrelated
   edits, and do not leave a finished sub-task uncommitted while starting the next.
4. **Run `pnpm check` before every commit** — lint, format check and typecheck. The
   pre-commit hook runs lint-staged on your staged files, but it does not replace this.
5. **Write the commit message as `type(scope): subject`, then summary, then bullets:**

   ```
   <type>(<scope>): <subject: imperative, whole line ≤ 72 chars>

   <summary: 1–3 sentences — why this change, what it affects>

   - <bullet: each concrete change, at file or module level>
   - <bullet: decisions made, alternatives rejected, what a reviewer should check>
   ```

   `type` is one of `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`,
   `chore`, `release`; `!` before the colon marks a breaking change. `scope` is optional and names
   the area — `api`, `web`, `shared`, `db`, `auth`, `docker`, `deps`. The `commit-msg` hook enforces
   the subject line.

   A bare subject line is acceptable only for a trivial one-liner such as a typo fix.

## Code style

The full rules live in [AGENTS.md](AGENTS.md); the ones people trip over:

- TypeScript is `strict` with `noUncheckedIndexedAccess`. Array indexing may yield
  `undefined` — narrow it.
- `apps/web` uses `verbatimModuleSyntax`; type-only imports must say `import type`.
- React components are function components with **named** exports. No `export default`.
- React Compiler is on. Do not add `useMemo`/`useCallback`/`memo` by habit; if you need
  one, say why in a comment.
- Colours come from Tailwind tokens or `var(--color-*)`. No raw hex in components.
- Comments and UI strings are written in Korean; comments explain *why*.
- oxlint and oxfmt only. Do not add ESLint or Prettier configuration.

## Things that are not negotiable

A pull request that changes any of these will be asked to revert it:

1. **Grading happens on the server**, inside `progress.attempt()`, by re-running the
   submitted program. A client-reported success is never trusted.
2. **Personal data leaves masked.** Every response path carrying user data goes through
   `apps/api/src/common/masking.ts`.
3. **The audit log is append-only.** No UPDATE or DELETE against `audit_logs`.
4. **Admin endpoints carry both guards**: `@UseGuards(JwtAuthGuard, RolesGuard)` together
   with `@Roles('admin')`.
5. **Concept colours are fixed** and used through tokens.

## Tests

- Interpreter changes are not merged without tests. Add cases to
  `apps/api/test/interpreter.spec.ts` and run `pnpm --filter @coblocks/api test`.
- When you fix a bug, add the case that used to fail.

## Curriculum content

Missions are teaching material, not just data rows.

- If a standard code is missing from `STANDARDS`, add the **official text verbatim**.
  Do not summarise, modernise or reword it.
- One mission carries exactly **one** representative concept. Express the rest through
  `blockLabels`.
- Difficulty is relative *within* a grade band. "Advanced" in elementary 5–6 is not the
  same scale as "introductory" in high school.
- Periods are a suggestion, never a claim of 1:1 correspondence with a textbook unit.
- Elementary 3–4 missions keep `standardCode` as `null`. Do not invent a standard for
  them.

The maintainers keep the full mapping rules in the team's private workspace; ask in the
issue or pull request if a case is not covered here.

## Documentation

- Root documents (`README.md`, `CONTRIBUTING.md`) are written in **English**, with the
  Korean translation at `docs/<name>.ko.md`.
- **Both versions change in the same pull request.** An English-only edit is an
  incomplete change; so is a Korean-only one.
- Documents under `docs/` other than the `.ko.md` translations are written in Korean.
- Never put dated work logs, session notes or changelog entries into `AGENTS.md`,
  `README.md` or `docs/`.

## Pull requests

- Open against `main`. CI must be green: lint, format, typecheck, tests, build.
- Labels are applied automatically by the labeler workflow based on the paths you touched;
  missing labels are created by CI, so you do not need to create them by hand.
- `@bluenyang` owns every path via `CODEOWNERS` and is requested for review automatically.
- Describe the change the way a commit message does — what and why, then bullets. If the
  change is visible in the UI, attach a screenshot.
- Mark it a draft while it is still moving.

## Reporting problems

- Bugs and proposals: open an issue with steps to reproduce, expected and actual result,
  and the grade band or mission involved when relevant.
- **Never paste real student data** — names, emails, member numbers, screenshots of
  rosters — into an issue, a pull request or a test fixture. Use the seeded development
  accounts.
- For anything security- or privacy-related, do not open a public issue. Mail
  `contact@bluenyang.kr` instead.

## License

By contributing you agree that your contribution is licensed under the
[Apache License 2.0](LICENSE), the license of this project.
