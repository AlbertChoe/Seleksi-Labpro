import { Module } from '@nestjs/common';
import { CloudflareR2Service } from './cloudflare-r2.service';
import { UploadController } from './upload.controller';

@Module({
  providers: [CloudflareR2Service],
  controllers: [UploadController],
  exports: [CloudflareR2Service],
})
export class CloudflareR2Module {}
