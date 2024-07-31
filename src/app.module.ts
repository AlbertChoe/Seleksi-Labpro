import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CloudflareR2Service } from './cloudflare-r2/cloudflare-r2.service';
import { UploadController } from './cloudflare-r2/upload.controller';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './logger/winston-logger';

@Module({
  imports: [
    ConfigModule.forRoot(),
    WinstonModule.forRoot({
      instance: winstonLogger,
    }),
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, CloudflareR2Service],
})
export class AppModule {}
