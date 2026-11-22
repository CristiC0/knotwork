/**
 * Writes the OpenAPI spec to apps/api/openapi.json without a database.
 *
 * `preview: true` builds the module graph (controllers, routes, DTO metadata)
 * without instantiating providers, so no DB connection is opened. The web app
 * generates its typed API client from the committed openapi.json, and CI checks
 * that the file is up to date.
 */
import 'reflect-metadata';

import { writeFile } from 'node:fs/promises';

import { NestFactory } from '@nestjs/core';

import { configureApp, createOpenApiDocument } from './app.setup.js';

// Config validation runs while AppModule is being *imported*, so the placeholder
// must be set first. Static imports are hoisted above any code, which is why
// AppModule is loaded with a dynamic import below.
process.env['DATABASE_URL'] ??= 'postgres://openapi:openapi@localhost:5432/openapi';
const { AppModule } = await import('./app.module.js');

const app = await NestFactory.create(AppModule, { preview: true, logger: ['error', 'warn'] });
configureApp(app);

const document = createOpenApiDocument(app);
await writeFile('openapi.json', `${JSON.stringify(document, null, 2)}\n`);
await app.close();

console.log('Wrote apps/api/openapi.json');
