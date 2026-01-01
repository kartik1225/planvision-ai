import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { getSwaggerConfig } from './swagger';
import { AppModule } from './app.module';
import { DebugValidationFilter } from './common/filters/debug-validation.filter';
import type { NestExpressApplication } from '@nestjs/platform-express'; // Import this

async function bootstrap() {
  // 1. Add the generic type <NestExpressApplication> to access Express methods
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false, // Keep your existing setting
  });

  // 2. Disable ETags to force 200 OK responses
  app.set('etag', false);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:8080',
      process.env.ADMIN_PANEL_URL,
    ].filter((origin): origin is string => Boolean(origin)),
    credentials: true, // IMPORTANT: Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new DebugValidationFilter());

  const swaggerConfig = getSwaggerConfig();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  console.error('Failed to start application', error);
  process.exit(1);
});
