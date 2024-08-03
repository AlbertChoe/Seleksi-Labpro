import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CloudflareR2Service } from './cloudflare-r2/cloudflare-r2.service';
import { UploadController } from './cloudflare-r2/upload.controller';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './logger/winston-logger';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FilmsService } from './films/films.service';
import { FilmsController } from './films/films.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    WinstonModule.forRoot({
      instance: winstonLogger,
    }),
    PrismaModule,
    AuthModule,
  ],
  controllers: [AppController, UploadController, FilmsController],
  providers: [AppService, CloudflareR2Service, FilmsService],
})
export class AppModule {}
