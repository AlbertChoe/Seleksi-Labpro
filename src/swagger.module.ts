import { Module } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

@Module({
  imports: [AppModule],
})
export class CustomSwaggerModule {
  static setupSwagger(app: any) {
    const config = new DocumentBuilder()
      .setTitle('Seleksi Labpro API')
      .setDescription('The API description')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'access-token',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/panel', app, document);
  }
}
