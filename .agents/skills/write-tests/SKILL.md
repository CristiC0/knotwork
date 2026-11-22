---
name: write-tests
description: Write or fix tests in Knotwork following the project's testing strategy: Vitest unit tests (api + web) and API integration tests against the throwaway test database. Use when adding tests for a feature, deciding which kind of test to write, or debugging a failing test.
---

# Write tests

## Which kind of test?

| Kind        | Where                                      | Runs against                            | Command         | Write one when…                                      |
| ----------- | ------------------------------------------ | --------------------------------------- | --------------- | ---------------------------------------------------- |
| Unit (api)  | `apps/api/src/**/*.spec.ts` (next to code) | Nothing real; dependencies mocked       | `pnpm test`     | Service logic, mapping, validation helpers           |
| Unit (web)  | `apps/web/src/**/*.test.tsx`               | jsdom + mocked `fetch`                  | `pnpm test`     | Components and pure display logic                    |
| Integration | `apps/api/test/*.int-spec.ts`              | Full Nest app + real Postgres (db-test) | `pnpm test:int` | Every endpoint: status codes, validation, DB effects |

Aim for many unit tests and an integration test per endpoint. All of them use
Vitest (`describe/it/expect` imported from `vitest`). There are no E2E tests
yet; that tool hasn't been chosen.

## Shared rules

- Arrange, act, assert, with one behaviour per `it`, named as a sentence:
  `it('rejects a title shorter than 3 characters')`.
- Test behaviour through public interfaces, not private methods.
- No `.only`, no `.skip` committed, no sleeps. Await the condition instead.
- Strict lint rules apply. In test files only, `no-unsafe-assignment` and
  `no-unsafe-member-access` are relaxed for mocks.

## API unit tests

Construct the class directly with typed fakes (see
`src/health/health.controller.spec.ts`):

```ts
const repo = { findOneBy: vi.fn().mockResolvedValue(null) };
const service = new CreationsService(repo as unknown as Repository<Creation>);
await expect(service.findOne(id)).rejects.toBeInstanceOf(NotFoundException);
```

## API integration tests

Pattern in `test/health.int-spec.ts`: build the real `AppModule`, apply
`configureApp(app)`, hit it with supertest.

- `test/global-setup.ts` runs once: it points at `TEST_DATABASE_URL` and
  applies every migration with the TypeORM CLI (builds `dist/` first), so the
  schema is always current. `test/setup-integration.ts` points each worker's
  `DATABASE_URL` at the test DB. Both share `test/test-env.ts`.
- Files run one at a time (`fileParallelism: false`) because they share a DB.
- Leave the DB clean. Truncate the tables you touched in `beforeEach`:
  ```ts
  const dataSource = app.get(DataSource);
  await dataSource.query('TRUNCATE TABLE creations, users RESTART IDENTITY CASCADE');
  ```
- Type the app as `INestApplication<Server>` (from `node:http`) so supertest
  isn't `any`.

## Web component tests

Pattern in `src/health/HealthStatus.test.tsx`:

- Render inside a fresh `QueryClient` with `retry: false` per test.
- Mock the network at `globalThis.fetch` with `vi.spyOn(...)`. The API client
  resolves fetch at call time, so this works. Return real `Response` objects
  with the shapes from `schema.gen.ts`.
- Query by role, label or text (`getByRole('button', { name: 'Save' })`). Use
  `data-testid` only for values with no accessible name.
- Use `findBy…` for anything that appears after a fetch.
- `@testing-library/user-event` is installed for typing and clicking.

## Debugging

```bash
pnpm --filter @knotwork/api exec vitest --project unit -t "rejects"   # one test
pnpm --filter @knotwork/web test:watch
```
