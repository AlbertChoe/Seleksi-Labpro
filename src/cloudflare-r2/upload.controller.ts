import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudflareR2Service } from './cloudflare-r2.service';
import { Response } from 'express';
import { Readable } from 'stream';

@Controller('files')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly cloudflareR2Service: CloudflareR2Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudflareR2Service.uploadFileMultipart(
      file.originalname,
      file.buffer,
    );
    return result;
  }

  @Get(':key')
  async getFile(@Param('key') key: string, @Res() res: Response) {
    this.logger.log(`Fetching file with key: ${key}`);
    try {
      const file = await this.cloudflareR2Service.getFile(key);
      const stream = file.Body as Readable;
      res.setHeader('Content-Type', file.ContentType);
      stream.pipe(res);
    } catch (error) {
      this.logger.error('Error fetching file:', error.stack);
      res.status(404).send('File not found');
    }
  }
}
