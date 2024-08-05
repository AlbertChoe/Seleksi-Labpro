import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './logger/winston-logger';
import * as exphbs from 'express-handlebars'; // Adjusted import
import * as handlebarsLayouts from 'handlebars-layouts';
import * as Handlebars from 'handlebars';

const port = process.env.PORT || 3000;
console.log(
  `Launching NestJS app on port ${port}, URL: http://127.0.0.1:${port}`,
);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonLogger,
    }),
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // Register Handlebars Layouts helpers
  Handlebars.registerHelper(handlebarsLayouts(Handlebars));

  // Set up Handlebars as the view engine
  app.engine(
    'hbs',
    exphbs.engine({
      extname: 'hbs',
      layoutsDir: join(__dirname, '..', 'views/layouts'),
      defaultLayout: 'main',
    }),
  );
  app.setViewEngine('hbs');

  const config = new DocumentBuilder()
    .setTitle('Seleksi Labpro API')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/panel', app, document);

  app.enableCors({
    origin: ['http://localhost:3000', 'https://labpro-fe.hmif.dev'], // Add your frontend domains
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(port);
}
bootstrap();
