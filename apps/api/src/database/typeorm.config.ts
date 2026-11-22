import { join } from 'node:path';

import type { DataSourceOptions } from 'typeorm';

import type { Env } from '../config/env.js';

/**
 * TypeORM settings shared by the Nest app and the TypeORM CLI
 * (`data-source.ts`), so migrations always run against the same config.
 *
 * Entities are deliberately not listed here: the app registers them through
 * `TypeOrmModule.forFeature()` + `autoLoadEntities`, and the CLI adds its own
 * glob. Listing them in both places would load every entity class twice.
 */
export function buildDataSourceOptions(
  env: Pick<Env, 'DATABASE_URL' | 'DB_MIGRATIONS_RUN'>,
): DataSourceOptions {
  return {
    type: 'postgres',
    url: env.DATABASE_URL,
    // Compiled migrations only. TypeORM loads these files with Node's own
    // import(), which can't run TypeScript sources (decorators, value imports
    // of interfaces). Integration tests apply migrations from dist/ in their
    // global setup instead of loading src/ here.
    migrations: [join(import.meta.dirname, 'migrations', '*.js')],
    migrationsTableName: 'migrations',
    migrationsRun: env.DB_MIGRATIONS_RUN,
    // NEVER true: schema changes go through reviewed migration files only.
    synchronize: false,
  };
}
