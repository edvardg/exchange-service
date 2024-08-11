import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const config = app.get(ConfigService);
  app.setGlobalPrefix(config.globalPrefix);

  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.swagger.description)
    .setVersion(config.swagger.version)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(config.swagger.path, app, document);

  await app.listen(config.port);
}
bootstrap();
