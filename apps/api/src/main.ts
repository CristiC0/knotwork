import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import { configureApp, createOpenApiDocument } from './app.setup.js';
import type { Env } from './config/env.js';

const app = await NestFactory.create(AppModule);
configureApp(app);

const config = app.get<ConfigService<Env, true>>(ConfigService);

if (config.get('API_DOCS_ENABLED', { infer: true })) {
  // Interactive docs at /api/docs, raw spec at /api/docs-json. Opt-in via .env.
  SwaggerModule.setup('api/docs', app, createOpenApiDocument(app));
}

const port = config.get('API_PORT', { infer: true });
await app.listen(port);
Logger.log(`API listening on http://localhost:${String(port)}/api`, 'Bootstrap');
