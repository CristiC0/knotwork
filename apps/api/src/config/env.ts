import { fileURLToPath } from 'node:url';

import { z } from 'zod';

/**
 * Absolute path of the repo-root `.env`. Resolved from this file rather than
 * the working directory, so it is found no matter where the process starts
 * (src/config/ and dist/config/ are both four levels below the repo root).
 */
export const ROOT_ENV_FILE = fileURLToPath(new URL('../../../../.env', import.meta.url));

/**
 * Loads the repo-root `.env` into `process.env` for scripts that run outside
 * Nest's ConfigModule (TypeORM CLI, test setup). Variables that are already
 * set win, and a missing file is fine (CI and Docker have no `.env`).
 */
export function loadRootEnvFile(): void {
  try {
    process.loadEnvFile(ROOT_ENV_FILE);
  } catch {
    // No .env file: rely on the real environment.
  }
}

const postgresUrl = z.url({ protocol: /^postgres(ql)?$/ });

/**
 * Every environment variable the API reads. The app refuses to start if any
 * of them is missing or malformed, so misconfiguration fails fast and loudly
 * instead of surfacing later as a confusing runtime error.
 *
 * When adding a variable: add it here AND to the root `.env.example`.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  DATABASE_URL: postgresUrl,
  /** Run pending migrations when the app starts. Off unless explicitly enabled. */
  DB_MIGRATIONS_RUN: z.stringbool().default(false),
  /**
   * Serve Swagger UI at /api/docs. Opt-in, so a deployment that forgets to set
   * NODE_ENV can't publish the API explorer by accident.
   */
  API_DOCS_ENABLED: z.stringbool().default(false),
});

export type Env = z.infer<typeof envSchema>;

/** Variables read only by the integration test setup, never by the app. */
export const testEnvSchema = z.object({
  TEST_DATABASE_URL: postgresUrl,
});

function parseOrThrow<T>(schema: z.ZodType<T>, raw: Record<string, unknown>): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export function validateEnv(raw: Record<string, unknown>): Env {
  return parseOrThrow(envSchema, raw);
}

export function validateTestEnv(raw: Record<string, unknown>): z.infer<typeof testEnvSchema> {
  return parseOrThrow(testEnvSchema, raw);
}
