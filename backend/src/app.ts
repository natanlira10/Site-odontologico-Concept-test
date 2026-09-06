import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';
import { randomUUID } from 'node:crypto';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { env } from './config';
import { HttpErrorFilter } from './common/http-error.filter';

export async function createApp(quiet = false) {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    ...(quiet ? { logger: false as const } : {}),
  });
  app.setGlobalPrefix('api');
  // Keep Express's default trust proxy=false; never trust arbitrary X-Forwarded-For.
  app.use(helmet());
  app.use((_request: unknown, response: import('express').Response, next: () => void) => {
    response.setHeader('X-Request-Id', randomUUID());
    response.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.enableCors({
    origin: env.CORS_ORIGINS,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    exposedHeaders: ['X-Request-Id', 'Retry-After'],
    credentials: false,
  });
  app.use(json({ limit: '16kb' }));
  app.useGlobalFilters(new HttpErrorFilter());
  app.enableShutdownHooks();
  return app;
}
