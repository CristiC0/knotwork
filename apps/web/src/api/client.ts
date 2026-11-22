import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

import type { paths } from './schema.gen.js';

/**
 * Typed API client generated from apps/api/openapi.json.
 * Paths, params, bodies and responses are all checked at compile time:
 * rename a field in the API, regenerate, and every broken usage fails typecheck.
 *
 *   $api.useQuery('get', '/api/health')      -> TanStack Query hook
 *   fetchClient.GET('/api/health')           -> plain typed fetch
 */
export const fetchClient = createFetchClient<paths>({
  // Same origin as the page: the Vite dev server forwards /api to the API.
  baseUrl: globalThis.location.origin,
  // Resolve fetch at call time (openapi-fetch otherwise captures it once),
  // so tests can mock globalThis.fetch.
  fetch: (request) => globalThis.fetch(request),
});
export const $api = createClient(fetchClient);
