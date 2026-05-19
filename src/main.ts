import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  const allowedOrigins = [
    process.env.FRONTEND_ADMIN_URL,
    process.env.FRONTEND_CLIENT_URL,
  ].filter((url): url is string => Boolean(url));

  // If no origins are configured, allow all for development
  const corsOrigin = allowedOrigins.length > 0 ? allowedOrigins : true;

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();