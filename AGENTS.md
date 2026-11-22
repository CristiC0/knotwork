# Knotwork

Knotwork is a community platform for crochet makers. Users post their creations
with the pattern needed to recreate them: materials, hook size, difficulty, and
step-by-step instructions. It is being built as a **bachelor thesis** project,
so clarity, justified decisions, and a clean history matter as much as features.

> **Current scope:** infrastructure only. The single app feature is a health
> check (web → API → Postgres). Do not add product features until asked.

## Repository map

```
apps/
  api/                 NestJS REST API
    src/<feature>/     one folder per feature (health/ is the reference)
    src/config/env.ts  Zod schema for every environment variable
    src/database/      TypeORM config, CLI data source, migrations/
    test/              integration tests (real Postgres)
    openapi.json       GENERATED API spec (committed)
  web/                 React SPA (Vite)
    src/<feature>/     one folder per feature (health/ is the reference)
    src/api/           typed API client; schema.gen.ts is GENERATED
compose.yaml           dev services: Postgres and test Postgres
.github/               CI workflow
.agents/skills/        agent skills (.claude/skills is a symlink to it)
```

## Stack

- **Runtime:** Node 26 LTS, pnpm 12 workspaces (plain `pnpm -r` scripts, no task runner)
- **Language:** TypeScript 6.0 at maximum strictness. Every tsconfig extends
  `tsconfig.base.json`; never loosen a strict flag in an app. (TS 7 is out, but
  typescript-eslint and the Nest CLI don't support it yet.)
- **API:** NestJS 12 (ESM), TypeORM 1 + PostgreSQL 18, class-validator DTOs,
  `@nestjs/swagger` (OpenAPI), `@nestjs/terminus` (health), config validated with Zod
- **Web:** React 19 + Vite 8, TanStack Query for all server data (no global
  state library), typed client from `openapi-typescript` + `openapi-react-query`
- **Quality:** ESLint (typescript-eslint `strictTypeChecked`) + Prettier;
  husky runs lint-staged (pre-commit), commitlint (commit-msg) and typecheck (pre-push)
- **Tests:** Vitest (api + web)
- **Infra:** Docker Compose (databases only), GitHub Actions CI
- **Not decided yet, so don't pick one:** styling / UI library, client-side router,
  deployment (Dockerfiles / hosting), E2E testing.

Dependencies: shared dev tools go in the root (`pnpm add -Dw x`), app
dependencies in the app (`pnpm --filter @knotwork/api add x`). pnpm blocks
dependency install scripts unless they're allowed in `pnpm-workspace.yaml`.

## Commands

Requires **Node 26** (`.nvmrc`; run `fnm use` or `nvm use`) and **pnpm 12**
(pinned in `packageManager`; pnpm switches itself). Other Node majors are
refused on purpose (`engineStrict`). First-time setup: see the
`dev-environment` skill.

| Command           | What it does                                                      |
| ----------------- | ----------------------------------------------------------------- |
| `pnpm install`    | Install dependencies and git hooks                                |
| `pnpm db:up`      | Start Postgres and test Postgres; wait until healthy              |
| `pnpm db:down`    | Stop Docker services (data kept)                                  |
| `pnpm db:reset`   | **Delete all dev data** and restart services                      |
| `pnpm db:migrate` | Apply pending migrations to the dev database                      |
| `pnpm dev`        | Run API (:3000) and web (:5173) with hot reload                   |
| `pnpm build`      | Production build of both apps                                     |
| `pnpm verify`     | format:check → lint → typecheck → unit tests (definition of done) |
| `pnpm format`     | Format everything with Prettier                                   |
| `pnpm lint:fix`   | ESLint with auto-fix                                              |
| `pnpm typecheck`  | `tsc` in every app                                                |
| `pnpm test`       | Unit tests (Vitest) in every app                                  |
| `pnpm test:int`   | API integration tests against the test DB                         |
| `pnpm api:sync`   | Regenerate `openapi.json` and the web client types                |

Per-app scripts (e.g. migrations): `pnpm --filter @knotwork/api <script>`.
See `apps/*/package.json`.

## Hard rules

1. **No `any`, no unsafe casts, no `@ts-ignore`.** Fix the types. If a cast is truly needed, use `@ts-expect-error` with a comment explaining why.
2. **Never use TypeORM `synchronize: true`.** Every schema change is a reviewed migration.
3. **Never edit generated files** (`apps/api/openapi.json`, `apps/web/src/api/schema.gen.ts`). Regenerate them with `pnpm api:sync`.
4. **Never bypass checks:** no `--no-verify`, no disabling lint rules to make CI pass.
5. **Conventional commits only.** See the `commit` skill. Commit only when the user asks.
6. **A task is done only when verification passes.** See the `verify` skill, and report what you could not check.
7. **Keep `.env` out of git.** When you add a variable, add it to `.env.example` and `apps/api/src/config/env.ts`. Never put `NODE_ENV` in `.env`: it leaks into Vite and breaks production builds.
8. **Ask before adding a dependency** that introduces a new concept (state library, UI kit, router, ORM plugin). Utility deps for an agreed tool are fine.
9. **Ask before deleting data** (`db:reset`, `docker volume rm`, `--volumes`).
10. **Documentation follows code:** when you add or rename a command, update the Commands table above in the same change.

## Skills

Load the matching skill from `.agents/skills/` before doing these tasks:

| Skill             | Use when                                                        |
| ----------------- | --------------------------------------------------------------- |
| `dev-environment` | Setting up, running, resetting or troubleshooting the local env |
| `add-api-feature` | Adding or changing NestJS modules, endpoints, services, DTOs    |
| `db-migration`    | Changing entities or the database schema                        |
| `api-client-sync` | After any API contract change; when web types don't match       |
| `add-web-feature` | Adding or changing React pages, components, data fetching       |
| `write-tests`     | Writing tests or choosing between unit and integration          |
| `verify`          | Before saying a task is done, or when CI fails                  |
| `commit`          | Writing a commit message or making a commit                     |
