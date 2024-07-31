import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudflareR2Service } from './cloudflare-r2.service';
import { Response } from 'express';

@Controller('files')
export class UploadController {
  constructor(private readonly cloudflareR2Service: CloudflareR2Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudflareR2Service.uploadFile(
      'seleksi-labpro',
      file.originalname,
      file.buffer,
      file.mimetype,
    );
    return result;
  }

  @Get(':key')
  async getFile(@Param('key') key: string, @Res() res: Response) {
    const file = await this.cloudflareR2Service.getFile('seleksi-labpro', key);
    res.setHeader('Content-Type', file.ContentType);
    res.send(file.Body);
  }
}
