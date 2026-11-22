---
name: dev-environment
description: Set up, start, stop or reset the Knotwork local development environment (Node/pnpm, Docker Postgres + test DB, API and web dev servers), and troubleshoot it. Use for first-time setup, "how do I run it", port conflicts, database connection errors, or when the user wants a clean database.
---

# Dev environment

The API and web app run **natively** (fast hot reload). Only infrastructure
runs in Docker (`compose.yaml` at the repo root).

| Service         | URL / port                | Notes                                          |
| --------------- | ------------------------- | ---------------------------------------------- |
| Web (Vite)      | http://localhost:5173     | Proxies `/api` to the API                      |
| API (NestJS)    | http://localhost:3000/api | Swagger UI at `/api/docs` (`API_DOCS_ENABLED`) |
| Postgres (dev)  | `localhost:5442`          | Data persists in the `db-data` volume          |
| Postgres (test) | `localhost:5443`          | In RAM, wiped on restart, used by tests        |

Ports 5442/5443 are deliberately non-default to avoid clashing with other
local Postgres instances. All of them can be changed in `.env`.

## First-time setup

```bash
fnm use                 # or: nvm use. Node 26 from .nvmrc
pnpm install            # also installs git hooks (husky)
cp .env.example .env
pnpm db:up              # starts db and db-test, waits until healthy
pnpm db:migrate         # apply migrations to the dev database
pnpm dev                # API + web in parallel
```

Open http://localhost:5173. The status panel should show API **Up** and
Database **Up**.

## Daily commands

| Command         | Effect                                                  |
| --------------- | ------------------------------------------------------- |
| `pnpm db:up`    | Start Docker services (idempotent)                      |
| `pnpm dev`      | Run API (`nest start --watch`) and web (`vite`)         |
| `pnpm db:down`  | Stop Docker services, keep data                         |
| `pnpm db:reset` | **Deletes all dev data**, then starts fresh. Ask first. |

Run only one app: `pnpm --filter @knotwork/api dev` or `pnpm --filter @knotwork/web dev`.

## Troubleshooting

| Symptom                                                       | Cause and fix                                                                                         |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `Unsupported engine ... wanted {"node":">=26..."}`            | Wrong Node version. Run `fnm use` (or `nvm use`) in the repo root.                                    |
| `Invalid environment variables: ... DATABASE_URL`             | `.env` missing or wrong. `cp .env.example .env`, compare with `.env.example`.                         |
| API logs `ECONNREFUSED` / health shows Database Down          | Postgres isn't running: `pnpm db:up`. Check `docker compose ps`.                                      |
| `port is already allocated` on `db:up`                        | Another service uses the port. Change `DB_PORT` / `TEST_DB_PORT` in `.env` and update URLs too.       |
| Vite `Port 5173 is in use`                                    | Another dev server is running. Stop it (Vite uses `strictPort` so the proxy setup stays predictable). |
| Web shows API Down but `curl localhost:3000/api/health` works | `API_PORT` in `.env` differs from what Vite read. Restart `pnpm dev` after editing `.env`.            |

Inspect services:

```bash
docker compose ps
docker compose logs -f db
docker compose exec db psql -U knotwork -d knotwork
```

## Rules

- Never run `pnpm db:reset`, `docker compose down --volumes` or `docker volume rm`
  without the user's explicit OK. They delete data.
- Never point `DATABASE_URL` at the test database or `TEST_DATABASE_URL` at the
  dev database.
- New variable? Add it to `.env.example` **and** `apps/api/src/config/env.ts`.
