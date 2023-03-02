import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.enableCors();

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Auth API')
    .setDescription('Powered by NestJs, TypeOrm, Jwt')
    .setVersion('(beta)0.0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      docExpansion: true,
      defaultModelsExpandDepth: -1,
    },
  });

  await app.listen(8080);
}
bootstrap();
