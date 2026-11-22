---
name: api-client-sync
description: Regenerate the Knotwork OpenAPI spec and the typed React API client after any API change (routes, DTOs, response types), and fix the resulting type errors. Use after editing controllers or DTOs in apps/api, when CI fails "Generated API files are up to date", or when web types don't match the API.
---

# Sync the API client

The API is the single source of truth for the HTTP contract:

```
NestJS controllers + DTOs
   │  pnpm --filter @knotwork/api openapi:generate   (no database needed)
   ▼
apps/api/openapi.json                  ← committed, never hand-edited
   │  pnpm --filter @knotwork/web api:generate        (openapi-typescript)
   ▼
apps/web/src/api/schema.gen.ts         ← committed, never hand-edited
   │  used by
   ▼
apps/web/src/api/client.ts   →  $api.useQuery('get', '/api/...')
```

## Steps

1. Run both generators:
   ```bash
   pnpm api:sync
   ```
2. Look at what changed: `git diff apps/api/openapi.json`. Is it what you
   intended? An unexpected change usually means a missing return type or a DTO
   without decorators (see `add-api-feature`).
3. Typecheck the web app and fix every error. These are exactly the places
   that would have broken at runtime:
   ```bash
   pnpm --filter @knotwork/web typecheck
   ```
4. Commit the spec, the generated types and the web fixes **together with** the
   API change, so every commit builds.

## Why it is committed

The web app can build and typecheck without running the API, reviewers see
contract changes in the diff, and CI regenerates both files and fails if they
differ from the committed ones.

## Troubleshooting

- **Property typed as `unknown` / missing in the schema:** the controller method
  has no explicit DTO return type, or the DTO field has no type the Swagger
  plugin understands. Add an explicit type or `@ApiProperty({ type: ... })`.
- **`openapi:generate` fails on config validation:** the script sets a
  placeholder `DATABASE_URL`, so any other new required env var needs a
  default or a placeholder in `src/openapi.ts`.
- **Never** edit `openapi.json` or `schema.gen.ts` by hand. Both are ignored by
  Prettier and ESLint on purpose.
