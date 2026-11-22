/**
 * Entry point for the TypeORM CLI (migration:generate / run / revert).
 * The Nest app does not import this file; it uses TypeOrmModule instead.
 * The CLI always runs against the compiled code in dist/.
 */
import 'reflect-metadata';

import { join } from 'node:path';

import { DataSource } from 'typeorm';

import { loadRootEnvFile, validateEnv } from '../config/env.js';
import { buildDataSourceOptions } from './typeorm.config.js';

loadRootEnvFile();

export default new DataSource({
  ...buildDataSourceOptions(validateEnv(process.env)),
  // migration:generate diffs these entities against the database.
  entities: [join(import.meta.dirname, '..', '**', '*.entity.js')],
});
