import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import {
  corsOriginCallback,
  CORS_ALLOWED_HEADERS,
  CORS_ALLOWED_METHODS,
} from './config/cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  (app.getHttpAdapter().getInstance() as any).set('etag', false);
  app.use((req: any, res: any, next: () => void) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  app.enableCors({
    origin: corsOriginCallback,
    credentials: true,
    methods: CORS_ALLOWED_METHODS,
    allowedHeaders: CORS_ALLOWED_HEADERS,
  });

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();
