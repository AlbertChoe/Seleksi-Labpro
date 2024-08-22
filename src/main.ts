import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './logger/winston-logger';
import * as exphbs from 'express-handlebars';
import * as handlebarsLayouts from 'handlebars-layouts';
import * as Handlebars from 'handlebars';
import * as cookieParser from 'cookie-parser';
import { PrismaService } from './prisma/prisma.service';
import { seedDatabase } from './seed';

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
  Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper('repeat', function (n, options) {
    let accum = '';
    for (let i = 0; i < n; ++i) {
      accum += options.fn(this);
    }
    return accum;
  });

  app.use(cookieParser());

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

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://labpro-fe.hmif.dev',
      'https://seleksi-labpro.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const prismaService = app.get(PrismaService);
  await seedDatabase(prismaService);

  await app.listen(port);
}

bootstrap();
