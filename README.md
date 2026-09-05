# Coblocks

**Block-based algorithm learning for Korean K–12, aligned to the 2022 revised national curriculum.**

> 🇰🇷 [한국어로 읽기](docs/README.ko.md)

Coblocks teaches computational thinking through algorithms. Learners start by assembling
blocks, move on to flowcharts and pseudocode, and end up writing text code — and every
mission is mapped to a published achievement standard so that classroom use is defensible.

---

## What this is for

Blocks are the medium, not the subject. The subject is the **algorithm**: a learner who can
state a problem, break it down, and express the solution as a structure that a machine can
follow has learned the thing worth learning. The block editor exists because it removes
syntax from the path, not because dragging blocks is the goal.

### Learning path

| Stage | Goal | What a mission looks like |
| --- | --- | --- |
| Elementary 3–4 | Logical thinking. Order, cause and effect, "say exactly what you mean." | Short sequences, unplugged-style reasoning. No curriculum standard is claimed at this stage. |
| Elementary 5–6 · Middle | The existing algorithms and the principles under them. Repetition, conditionals, variables, sequential data, functions. | Read, trace, compare and adapt known algorithms; find where each one breaks. |
| High | Designing algorithms of your own, and judging them. | Decompose an unfamiliar problem, model it, choose between approaches, argue about cost. |

### Reaching the goal is the floor, not the ceiling

Two programs solve the same maze. One is 40 blocks that spell out 30 moves. The other is
20 blocks that use a loop and a branch. Both reach the goal; only the second one found the
*structure* of the problem.

That difference is what Coblocks is built to teach. An algorithm should be abstract and
principled, not merely effective — so a mission is not only "did you get there" but
"what did your solution say about the problem." Concretely:

- The interpreter records the executed step list, so block count and executed steps are
  both known after a run and can be shown back to the learner.
- Missions are authored with a reference solution in mind, so "you reached the goal with
  40 blocks; this can be done in 20" is a question the platform can ask.
- Higher grade bands lean on this deliberately: at elementary level, reaching the goal is
  the lesson; from middle school on, the *shape* of the solution is the lesson.

Structural feedback (block-count and control-flow scoring surfaced in the player) is a
designed behaviour that is **not implemented yet**. Grading today is pass/fail, computed on
the server.

### Curriculum alignment

| School level | Subject | Hours | Standard code format |
| --- | --- | --- | --- |
| Elementary 3–4 | (none) | — | Preparatory, outside the subject |
| Elementary 5–6 | Practical Arts — "Digital Society and AI" | 34 | `[6실05-XX]` |
| Middle 1–3 | Informatics | 68 | `[9정0X-XX]` |
| High | Informatics (general elective) | school-defined | `[12정0X-XX]` |

Standard text is stored verbatim from the Ministry of Education notice and is never
paraphrased, and a mission carries at most one standard code. Elementary 3–4 missions carry
none at all rather than claiming a standard that does not exist.

### Concept axes

Eight concepts — sequence, repetition, conditionals, variables/data, functions/abstraction,
data structures, algorithm design, AI — each bound 1:1 to a fixed colour token. A mission
carries exactly one representative concept; a second colour would break the learner's
ability to read concepts off the palette.

---

## Stack

| Area | Choice |
| --- | --- |
| Web | React 19 + React Compiler · Vite · TypeScript 6 · TanStack Router/Query · Zustand · Tailwind v4 |
| API | NestJS · Drizzle ORM · PostgreSQL 16 · JWT (Passport) · argon2 |
| Shared | `packages/shared` — types, curriculum seed data, block interpreter |
| Tooling | pnpm workspace · oxlint · oxfmt · husky + lint-staged (no ESLint/Prettier) |
| Deploy | container images on GHCR (`coblocks-web`, `coblocks-api`, `coblocks-migrate`) · compose files under `docker/` |

## Project structure

```
coblocks/
├─ apps/
│  ├─ web/                 React 19 SPA
│  │  └─ src/
│  │     ├─ api/           axios client + per-endpoint wrappers
│  │     ├─ components/    palette, workspace, stage canvas, zoom panel
│  │     ├─ hooks/         useBlockRunner — step-by-step run animation
│  │     ├─ layouts/       AppLayout (learner), AdminLayout (admin)
│  │     ├─ pages/         landing, login, dashboard, curriculum, lesson player
│  │     ├─ pages/admin/   overview, lesson form/manage, users, audit, inquiries
│  │     ├─ router.tsx     TanStack Router tree + auth/role guards
│  │     ├─ stores/        auth, theme (zustand)
│  │     └─ styles/        tokens.css (@theme tokens), main.css
│  └─ api/                 NestJS
│     └─ src/
│        ├─ db/            Drizzle schema · client · seed
│        ├─ common/        masking utils, audit service, role guard
│        ├─ auth/          login · JWT strategy
│        ├─ lessons/       mission queries
│        ├─ progress/      learner progress · server-side grading
│        └─ admin/         admin-only endpoints
├─ packages/shared/        types + curriculum data + interpreter
├─ docs/                   design documents and Korean translations
└─ .github/                CI, labeler, CODEOWNERS
```

### How a run is graded

`packages/shared` compiles a block program into a flat step list (`compile`), then walks the
stage (`run`). The web app uses this for the animated preview; the API calls the **same**
function in `progress.attempt()` and stores completion based only on its own result. A
client-reported success is never trusted.

## Getting started

Requires Node ≥ 22 and pnpm 11 (`corepack enable` picks up the pinned version).

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

pnpm db:up        # start PostgreSQL via docker compose
pnpm db:push      # apply the Drizzle schema
pnpm db:seed      # seed standards, missions and dev accounts

pnpm dev          # web (:5173) + api (:3000)
```

Development accounts (password = id): `student1`, `teacher1`, `admin`.

### Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` / `dev:web` / `dev:api` | run both apps, or one |
| `pnpm check` | `lint` + `fmt:check` + `typecheck` — must pass before every commit |
| `pnpm lint` / `lint:fix` | oxlint |
| `pnpm fmt` / `fmt:check` | oxfmt |
| `pnpm typecheck` | TypeScript across the workspace |
| `pnpm --filter @coblocks/api test` | interpreter tests (vitest) |
| `pnpm db:up` / `db:push` / `db:seed` | local database lifecycle |

## Design invariants

These are enforced in review and must not be worked around:

1. **Grading happens on the server.** Completion is decided only inside `attempt()` in
   `apps/api/src/progress/progress.service.ts`, by re-running the submitted program.
2. **Personal data leaves masked.** Every path that returns user data goes through
   `apps/api/src/common/masking.ts`. Reading the original requires a logged, approved
   unmask request.
3. **The audit log is append-only.** No UPDATE or DELETE against `audit_logs`, in code or
   by database privilege.
4. **Concept colours are fixed.** The eight tokens in `tokens.css` are not reordered or
   recycled, and components use tokens rather than raw hex.
5. **Achievement standards are quoted, not summarised.** If a standard is missing, add the
   official text before authoring the mission.

## Documentation

| Document | Contents |
| --- | --- |
| [AGENTS.md](AGENTS.md) | working rules for humans and AI agents |
| [CONTRIBUTING.md](CONTRIBUTING.md) | how to contribute · [한국어](docs/CONTRIBUTING.ko.md) |
| [docs/README.ko.md](docs/README.ko.md) | this document in Korean |

Root documents are written in English with a Korean translation under `docs/*.ko.md`, and
both versions are updated in the same change. `docs/` holds only published documents that
settle after a change; working design and analysis notes stay in the team's private
workspace and are deliberately not part of this repository.

## Status

Working scaffold, not a product yet: the learner flow (landing → login → dashboard →
curriculum → block player) and six admin screens run, the API implements auth, missions,
progress and admin endpoints, and some screens still fall back to seed data before the API
is wired in. Blockly-based editing, a canvas stage renderer, custom blocks, classrooms and
code conversion are planned and not started.

## License

[Apache License 2.0](LICENSE) — Copyright 2026 Team Croffle.

Achievement standard text quoted in this repository originates from Ministry of Education
notices and is subject to its own terms.
