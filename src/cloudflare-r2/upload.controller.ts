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

@Controller('files')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);
  constructor(private readonly cloudflareR2Service: CloudflareR2Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudflareR2Service.uploadFile(
      file.originalname,
      file.buffer,
      file.mimetype,
    );
    return result;
  }

  @Get(':key')
  async getFile(@Param('key') key: string, @Res() res: Response) {
    this.logger.log(`Fetching file with key: ${key}`);
    try {
      const file = await this.cloudflareR2Service.getFile(key);
      res.setHeader('Content-Type', file.ContentType);
      res.send(file.Body);
    } catch (error) {
      this.logger.error('Error fetching file:', error.stack);
      res.status(404).send('File not found');
    }
  }
}
