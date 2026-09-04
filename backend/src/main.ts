import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Better Auth가 raw body를 직접 파싱하므로 NestJS 내장 body parser 비활성화
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
