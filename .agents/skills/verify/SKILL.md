---
name: verify
description: Check that Knotwork changes are correct before calling a task done or committing: formatting, lint, typecheck, unit/integration tests and generated-file drift. Use at the end of every coding task, after fixing CI failures, or when the user asks to check, validate or test changes.
---

# Verify

A task is **done only when verification passes**. Report exactly what you ran
and what passed. If something could not be run (e.g. Docker is down), say so
instead of claiming success.

## 1. Always

```bash
pnpm verify
```

This runs, in order, and stops at the first failure:

1. `pnpm format:check` (Prettier)
2. `pnpm lint` (ESLint, strict type-aware rules, zero warnings allowed)
3. `pnpm typecheck` (`tsc` in every app)
4. `pnpm test` (unit tests in every app)

## 2. Depending on what changed

| You changed…                                     | Also run                                             |
| ------------------------------------------------ | ---------------------------------------------------- |
| Anything in `apps/api` (controllers, DB, config) | `pnpm test:int` (needs `pnpm db:up`)                 |
| Controllers, DTOs, routes                        | `pnpm api:sync`, then `git status`: commit the diffs |
| Entities                                         | Follow `db-migration`, then `pnpm test:int`          |
| A user-visible flow, Vite/proxy config           | `pnpm dev` and check it in the browser               |

This is the same set of checks CI runs (`.github/workflows/ci.yml`).

## Fixing failures

| Failure                       | Fix                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------- |
| format:check                  | `pnpm format`                                                                                       |
| lint                          | `pnpm lint:fix` for auto-fixable rules, then fix the rest by hand                                   |
| `no-unsafe-*` / `any`         | Type the value properly (generics, type guards, the generated API types). Don't cast to silence it. |
| `no-floating-promises`        | `await` it, or `void promise` when fire-and-forget is intended                                      |
| typecheck after `api:sync`    | The API contract changed: update the web code to match                                              |
| integration test ECONNREFUSED | `pnpm db:up`                                                                                        |

## Never

- Never disable a lint rule, add `eslint-disable`, `@ts-ignore` or `any` to
  make a check pass. If a rule is truly wrong for a case, explain it to the user
  and let them decide.
- Never skip or `.only` tests, or delete a failing test, to get green.
- Never use `git commit --no-verify` or `git push --no-verify`.
