import 'reflect-metadata';
import { config, assertConfig } from './config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import sharp from 'sharp';

// keep memory low on small (512 MB) hosts
sharp.cache(false);
sharp.concurrency(Number(process.env.SHARP_CONCURRENCY || 1));

process.on('unhandledRejection', (e) => console.error('[unhandledRejection]', e));
process.on('uncaughtException', (e) => console.error('[uncaughtException]', e));

async function bootstrap() {
  assertConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: config.isProd ? ['error', 'warn', 'log'] : ['error', 'warn', 'log'] });
  app.setGlobalPrefix('api');
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use((_req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });
  app.enableCors({ origin: config.corsOrigins, methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] });
  app.enableShutdownHooks();
  await app.listen(config.port);
  console.log(`\n  GovDocs API ready on http://localhost:${config.port}/api  (auth: ${config.clerkSecret ? 'Clerk' : 'DEV MODE - no login'})\n`);
}
bootstrap();
