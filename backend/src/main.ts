import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // cors aç, mobile app için gerekli
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:19006';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // validation pipe, global olarak uygula
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // exception filter, global olarak uygula
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  // TODO: health check eksik
}

bootstrap();

