import { execFileSync } from 'node:child_process';

import { useTestDatabase } from './test-env.js';

/**
 * Runs once before all integration tests: applies every migration to the test
 * database through the real TypeORM CLI (`migration:run` builds dist/ first).
 *
 * Migrations are applied from compiled JavaScript on purpose. TypeORM imports
 * migration files with Node's own import(), outside Vitest's TypeScript
 * transform, so it can't load the .ts sources directly.
 */
export default function setup(): void {
  useTestDatabase();
  execFileSync('pnpm', ['run', 'migration:run'], {
    cwd: new URL('..', import.meta.url),
    env: process.env,
    stdio: 'inherit',
  });
}
