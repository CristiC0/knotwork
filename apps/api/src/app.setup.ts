import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';

/** Everything except "listen" lives here, so tests and the OpenAPI script get the same app. */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties that have no decorator in the DTO
      forbidNonWhitelisted: true, // ...and reject the request if any were sent
      transform: true, // turn plain JSON into DTO class instances
    }),
  );
  app.enableShutdownHooks();
}

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Knotwork API')
    .setDescription('REST API for the Knotwork crochet community platform')
    .setVersion('0.0.0')
    .build();
  return SwaggerModule.createDocument(app, config);
}
