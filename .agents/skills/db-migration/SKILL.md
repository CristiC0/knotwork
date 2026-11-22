---
name: db-migration
description: Change the Knotwork database schema with TypeORM: add or change an entity, generate a migration, review its SQL, run it, or revert it. Use whenever an *.entity.ts file changes or the user mentions tables, columns, indexes, relations or migrations.
---

# Database migrations (TypeORM)

`synchronize` is **always false**. The database schema changes only through
migration files in `apps/api/src/database/migrations/`, which are committed and
reviewed like any other code.

## How it is wired

- `src/database/typeorm.config.ts` holds the shared settings (used by app + CLI).
- `src/database/data-source.ts` is the TypeORM CLI entry point. It reads the
  root `.env` and targets `DATABASE_URL` (the **dev** database).
- The CLI runs against the **compiled** code in `dist/`, so every migration
  script runs `nest build` first. That's why a build error blocks migrations.
- The app finds entities **only** through `TypeOrmModule.forFeature([...])` in
  each feature module (`autoLoadEntities`). The CLI finds them by the glob
  `dist/**/*.entity.js`, so the file name **must** end in `.entity.ts`.
- Migrations are loaded from compiled `.js` only. TypeORM imports them with
  Node's own `import()`, which can't run the `.ts` sources.
- Integration tests apply all migrations to the test DB once, in
  `test/global-setup.ts` (it runs `migration:run`, which builds `dist/`).

## Workflow

1. **Change or add the entity** (see conventions below). Register a new entity
   in its feature module: `TypeOrmModule.forFeature([Creation])`.
2. **Make sure the dev DB is current:** `pnpm db:up && pnpm db:migrate`.
3. **Generate** a migration from the diff between entities and the DB:
   ```bash
   pnpm --filter @knotwork/api migration:generate src/database/migrations/AddCreations
   ```
   Use a PascalCase name that describes the change. The path is relative to
   `apps/api`. Exits with "No changes in database schema were found" if
   nothing differs.
4. **Read the generated SQL** in both `up()` and `down()`. Check for:
   - unintended `DROP COLUMN` / `DROP TABLE` (often from a rename; TypeORM
     drops and re-adds). For renames, hand-edit to `ALTER TABLE ... RENAME COLUMN`.
   - `NOT NULL` columns added to tables that may have rows: add a `DEFAULT` or a
     backfill step.
   - `down()` exactly reverses `up()`.
5. **Run it:** `pnpm db:migrate`, then check with
   `pnpm --filter @knotwork/api migration:show` (`[X]` = applied).
6. **Test the way back:** `pnpm --filter @knotwork/api migration:revert`, then
   `pnpm db:migrate` again.
7. Run `pnpm test:int` (it applies all migrations to a fresh test DB).
8. Format the new migration file (generated code isn't formatted):
   `pnpm exec prettier --write apps/api/src/database/migrations/`, then commit
   the entity and migration together: `feat(db): ...`.

Hand-written migration (data changes, extensions, raw SQL):

```bash
pnpm --filter @knotwork/api migration:create src/database/migrations/EnableCitext
```

## Entity conventions

```ts
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('creations') // table: plural snake_case
export class Creation {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // `!`: TypeORM assigns it; required under strict mode

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ name: 'hook_size_mm', type: 'numeric', precision: 3, scale: 1 })
  hookSizeMm!: string; // numeric comes back as string from pg; convert in the DTO

  @Index()
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  author!: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
```

- Tables plural `snake_case`. Multi-word columns get an explicit snake_case
  `name:` so raw SQL doesn't need quoted camelCase identifiers.
- Always give `type:` explicitly. Use `timestamptz` for dates, `uuid` for ids.
- Put `@Index()` on foreign keys and columns you filter or sort by.
- Never return entities from controllers. Map them to response DTOs (see
  `add-api-feature`).

## Never

- Never set `synchronize: true`, not even "just locally".
- Never edit a migration that has been committed and run elsewhere. Write a new one.
- Never run migrations against the test DB by hand. Tests do that themselves.
