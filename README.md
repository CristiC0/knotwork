# Knotwork

A community platform where crochet makers share their creations together with
the pattern needed to recreate them. Bachelor thesis project.

**Status:** infrastructure in place. The only feature so far is a health check
that proves the whole chain works: browser → React → NestJS → PostgreSQL.

## Quick start

Requirements: Node 26 (`fnm use` / `nvm use` reads `.nvmrc`), pnpm 12, Docker.

```bash
pnpm install
cp .env.example .env
pnpm db:up        # Postgres + test Postgres
pnpm db:migrate
pnpm dev          # API + web
```

| What               | Where                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------- |
| Web app            | http://localhost:5173                                                                 |
| API                | http://localhost:3000/api                                                             |
| API docs (Swagger) | http://localhost:3000/api/docs (needs `API_DOCS_ENABLED=true`, set in `.env.example`) |

Before pushing: `pnpm verify` (format, lint, typecheck, unit tests).

## Architecture

```
Browser ──► React SPA (Vite dev server)
                │  same-origin /api/* (proxied)
                ▼
            NestJS API ──► PostgreSQL (TypeORM, migrations)
```

- **Monorepo:** pnpm workspaces with `apps/api` and `apps/web`.
- **Type-safe contract:** NestJS generates an OpenAPI spec, and the React
  client's types are generated from it. A changed API field breaks the web
  build instead of production.
- **Strictness:** TypeScript at maximum strictness, type-aware ESLint, git
  hooks, conventional commits, and CI running all of it plus integration
  tests.
- **Docker:** only the databases run in containers; the apps run natively.
  Deployment is not set up yet.

Detailed conventions and every command are in [AGENTS.md](AGENTS.md), which is
written for both people and AI coding agents. Workflows are in
[.agents/skills/](.agents/skills/).
