import 'reflect-metadata';

import { useTestDatabase } from './test-env.js';

// Runs in every test worker. The schema is already migrated by global-setup.ts.
useTestDatabase();
