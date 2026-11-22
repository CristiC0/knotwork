import { loadRootEnvFile, validateTestEnv } from '../src/config/env.js';

/**
 * Points the process at the throwaway test database. Shared by the global
 * setup (which migrates it) and the per-worker setup (which runs the app).
 */
export function useTestDatabase(): void {
  loadRootEnvFile();
  const { TEST_DATABASE_URL } = validateTestEnv(process.env);

  // Integration tests always hit the throwaway db-test container, never dev data.
  process.env['DATABASE_URL'] = TEST_DATABASE_URL;
  process.env['NODE_ENV'] = 'test';
}
