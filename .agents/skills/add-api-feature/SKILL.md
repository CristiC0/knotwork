---
name: add-api-feature
description: Add a new feature or endpoint to the Knotwork NestJS API the project's way (module, controller, service, DTOs with validation and Swagger, entity, tests, regenerated client). Use when creating or changing REST endpoints, Nest modules, services or DTOs in apps/api.
---

# Add an API feature (NestJS)

The reference implementation is `apps/api/src/health/`. Copy its shape.

## Layout

One folder per feature under `apps/api/src/<feature>/`:

```
creations/
  creations.module.ts          @Module: imports, controllers, providers
  creations.controller.ts      HTTP only: routes, params, status codes
  creations.service.ts         business logic + repository access
  creation.entity.ts           TypeORM entity (see db-migration skill)
  dto/
    create-creation.dto.ts     request body (class-validator)
    creation-response.dto.ts   what the API returns
  creations.service.spec.ts    unit tests next to the code
```

Register the module in `src/app.module.ts` `imports`.

## Rules that are easy to get wrong

1. **ESM imports need `.js`**: `import { X } from './x.js'` (the source is `.ts`;
   NodeNext resolution requires the emitted extension).
2. **Never `import type` an injected class.** With `emitDecoratorMetadata`, a
   type-only import is erased and Nest DI fails at runtime with
   "can't resolve dependencies". ESLint's `consistent-type-imports` is off in
   the API on purpose.
3. **Controllers declare explicit return types** using DTO classes
   (`Promise<CreationResponseDto>`). The Swagger CLI plugin reads them to
   document responses, and the web client's types come from there.
4. **Return DTOs, not entities.** Map in the service. This keeps internal
   columns out of the API and keeps the OpenAPI schema stable.
5. **Validation is global** (`whitelist` + `forbidNonWhitelisted` +
   `transform`): unknown fields cause 400. Every DTO field needs a
   class-validator decorator.
6. Config comes from `ConfigService<Env, true>` with
   `config.get('KEY', { infer: true })`. Never read `process.env` directly.

## DTO example

The `@nestjs/swagger` CLI plugin (in `nest-cli.json`) infers OpenAPI properties
from TS types and class-validator decorators, so `@ApiProperty` is only needed
for extra info. JSDoc comments become descriptions.

```ts
import { IsEnum, IsString, Length, Max, Min } from 'class-validator';

export enum Difficulty {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export class CreateCreationDto {
  /** Shown as the card title */
  @IsString()
  @Length(3, 120)
  title!: string;

  @IsEnum(Difficulty)
  difficulty!: Difficulty;

  /** Crochet hook size in millimetres */
  @Min(0.5)
  @Max(25)
  hookSizeMm!: number;
}
```

## Controller example

```ts
@ApiTags('creations')
@Controller('creations')
export class CreationsController {
  constructor(private readonly creations: CreationsService) {}

  @Post()
  create(@Body() dto: CreateCreationDto): Promise<CreationResponseDto> {
    return this.creations.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CreationResponseDto> {
    return this.creations.findOne(id); // service throws NotFoundException
  }
}
```

Throw Nest's HTTP exceptions (`NotFoundException`, `ForbiddenException`, …)
from services. Don't build error responses by hand.

## Finish

1. Entity changed? Follow the `db-migration` skill.
2. Write tests (`write-tests` skill): a unit test for the service logic, plus an
   integration test in `apps/api/test/` for the HTTP contract.
3. Regenerate the spec and web client: `pnpm api:sync` (`api-client-sync` skill).
4. Check the endpoint in Swagger UI: http://localhost:3000/api/docs
5. Run `verify`, plus `pnpm test:int`.
