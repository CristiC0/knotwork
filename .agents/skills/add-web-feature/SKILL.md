---
name: add-web-feature
description: Add a page, component or data-fetching feature to the Knotwork React app the project's way (feature folder, TanStack Query via the generated typed client, loading/error states, tests). Use when building or changing UI in apps/web.
---

# Add a web feature (React)

The reference implementation is `apps/web/src/health/`: a pure logic module
(`health-summary.ts`), a component (`HealthStatus.tsx`) and its test.

## Open decisions: ask, don't pick

- **Styling / UI library:** not chosen yet. Use plain CSS in `src/index.css`
  and semantic HTML until the user decides. Don't install Tailwind, MUI etc.
- **Routing:** not installed yet. The first feature that needs a second page
  must ask the user (React Router vs TanStack Router) before adding one.

## State: where data lives

| Kind of state                              | Use                                                  |
| ------------------------------------------ | ---------------------------------------------------- |
| Data from the API (incl. the current user) | TanStack Query via `$api` (cache, refetch, loading)  |
| Form input                                 | Local `useState` (a form library may be added later) |
| UI state for one component                 | `useState` / `useReducer`                            |
| Truly global client-only state             | Not needed yet. Ask before adding a store.           |

Never copy query data into `useState` or a global store. Read it from the query.

## Fetching data

Always go through the generated, typed client in `src/api/client.ts`:

```tsx
import { $api } from '../api/client.js';

const creations = $api.useQuery('get', '/api/creations', {
  params: { query: { difficulty: 'beginner' } },
});
```

Mutations, then refresh the affected queries:

```tsx
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
const createCreation = $api.useMutation('post', '/api/creations', {
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get', '/api/creations'] }),
});
createCreation.mutate({ body: { title, difficulty, hookSizeMm } });
```

Query keys are `[method, path, init]`, so invalidating `['get', '/api/creations']`
refreshes every variant of that list.

If the endpoint you need isn't in the client, the API must expose it first,
then run `pnpm api:sync` (`api-client-sync` skill). Never hand-write a fetch
with its own types.

## Conventions

- Feature folders: `src/<feature>/` with components, hooks and pure helpers.
- Components: `PascalCase.tsx`, named exports, one component per file
  (`react-refresh/only-export-components`).
- Put non-trivial logic (deriving display state, formatting) in plain `.ts`
  functions. They are trivial to unit test.
- Every query renders three states: pending, error and success.
- Use semantic, accessible markup: real `<button>`s, labelled sections,
  headings in order. Tests select by role and label, so this is enforced.
- Imports use `.js` extensions and `import type` for types
  (`verbatimModuleSyntax`).

## Finish

1. Test it (`write-tests` skill): a component test with mocked `fetch`.
2. Try it in the browser with `pnpm dev`.
3. Run `verify`.
