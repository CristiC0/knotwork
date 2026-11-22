import type { components } from '../api/schema.gen.js';

type HealthCheckResult = components['schemas']['TerminusHealthCheckResult'];

export type ServiceState = 'checking' | 'up' | 'down';

export interface HealthSummary {
  api: ServiceState;
  database: ServiceState;
}

/** A 503 from the API still carries a health body; a network failure does not. */
function isHealthCheckResult(value: unknown): value is HealthCheckResult {
  return typeof value === 'object' && value !== null && 'status' in value && 'details' in value;
}

/**
 * Turns the raw query state into what the page shows:
 * - still loading                 -> both "checking"
 * - 200 with a health body        -> API up, database from details
 * - 503 with a health body        -> API up (it answered), database from details
 * - anything else (no response)   -> API down, database unknown so "down"
 *
 * The query status decides, not the error value: when a *refetch* fails,
 * TanStack Query keeps the last successful `data`, and the thrown error body can
 * itself be `undefined` (an error response with no body). Falling back from the
 * error to `data` would then show stale "Up" values.
 */
export function summarizeHealth(query: {
  isPending: boolean;
  isError: boolean;
  data: unknown;
  error: unknown;
}): HealthSummary {
  if (query.isPending) {
    return { api: 'checking', database: 'checking' };
  }

  const body = query.isError ? query.error : query.data;
  if (!isHealthCheckResult(body)) {
    return { api: 'down', database: 'down' };
  }

  return {
    api: 'up',
    database: body.details['database']?.status === 'up' ? 'up' : 'down',
  };
}
