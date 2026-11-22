import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['test/**/*.int-spec.ts'],
          globalSetup: ['test/global-setup.ts'],
          setupFiles: ['test/setup-integration.ts'],
          // Integration tests share one database, so run files one at a time.
          fileParallelism: false,
        },
      },
    ],
  },
});
