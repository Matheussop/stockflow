import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não declaradas no DTO
      forbidNonWhitelisted: true, // lança erro se enviar algo não permitido
      transform: true, // transforma o payload para a classe correta
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
