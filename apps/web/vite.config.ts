import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Reads only API_PORT from the repo-root .env so the dev proxy follows the API.
 * Deliberately not Vite's loadEnv: that would also pick up variables like
 * NODE_ENV meant for the API and silently turn production builds into dev builds.
 */
function readApiPort(): string {
  const envFile = new URL('../../.env', import.meta.url);
  const fromFile = existsSync(envFile)
    ? parseEnv(readFileSync(envFile, 'utf8'))['API_PORT']
    : undefined;
  return process.env['API_PORT'] ?? fromFile ?? '3000';
}

export default defineConfig(() => {
  const apiTarget = `http://localhost:${readApiPort()}`;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      // The browser only ever talks to the Vite origin; /api is forwarded to Nest.
      // Same origin, so no CORS setup is needed (a production host should do the same).
      proxy: { '/api': apiTarget },
    },
    preview: {
      port: 4173,
      strictPort: true,
      proxy: { '/api': apiTarget },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['src/test-setup.ts'],
      restoreMocks: true,
    },
  };
});
