import { NestFactory } from '@nestjs/core';
import { CustomSwaggerModule } from './swagger.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './logger/winston-logger';

const swaggerPort = process.env.SWAGGER_PORT || 4000;

console.log(
  `Launching Swagger on port ${swaggerPort}, URL: http://127.0.0.1:${swaggerPort}/api/panel`,
);
async function bootstrapSwagger() {
  const app = await NestFactory.create<NestExpressApplication>(
    CustomSwaggerModule,
    {
      logger: WinstonModule.createLogger({
        instance: winstonLogger,
      }),
    },
  );

  CustomSwaggerModule.setupSwagger(app);

  await app.listen(swaggerPort);
}
bootstrapSwagger();
