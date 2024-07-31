import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CloudflareR2Service } from './cloudflare-r2/cloudflare-r2.service';
import { UploadController } from './cloudflare-r2/upload.controller';

@Module({
  imports: [],
  controllers: [AppController, UploadController],
  providers: [AppService, CloudflareR2Service],
})
export class AppModule {}
