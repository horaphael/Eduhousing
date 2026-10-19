import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { config } from './config';

export function setupApp(app: INestApplication): void {
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  (app as NestExpressApplication).useStaticAssets(config.uploadDir, {
    prefix: '/uploads/',
  });
}
