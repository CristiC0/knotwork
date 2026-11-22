import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ROOT_ENV_FILE, validateEnv, type Env } from './config/env.js';
import { buildDataSourceOptions } from './database/typeorm.config.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      // Repo-root .env, resolved independently of the working directory. Real env
      // vars take precedence, and a missing file is fine (CI, Docker).
      envFilePath: [ROOT_ENV_FILE],
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        ...buildDataSourceOptions({
          DATABASE_URL: config.get('DATABASE_URL', { infer: true }),
          DB_MIGRATIONS_RUN: config.get('DB_MIGRATIONS_RUN', { infer: true }),
        }),
        // The only way the app finds entities: each feature module registers its
        // own with TypeOrmModule.forFeature(). No file glob (see typeorm.config.ts).
        autoLoadEntities: true,
        retryAttempts: 3,
        retryDelay: 2000,
      }),
    }),
    HealthModule,
  ],
})
export class AppModule {}
