import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './logger/winston-logger';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FilmsModule } from './films/films.module';
import { UserModule } from './user/user.module';
import { UserMiddleware } from './middleware/user.middleware';
import { CloudflareR2Module } from './cloudflare-r2/cloudfare-r2.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    WinstonModule.forRoot({
      instance: winstonLogger,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    FilmsModule,
    CloudflareR2Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
